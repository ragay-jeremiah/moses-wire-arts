import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

// ─── Cloudinary Config ────────────────────────────────────────────────────────
const CLOUD_NAME = 'dvbgohxka';
const UPLOAD_PRESET = 'moses_wire_arts';

export interface SiteSettings {
  heroVideoUrl?: string;
  artistImageUrl?: string;
  heroImages?: string[];
}

const DOC_REF = doc(db, 'site', 'settings');

export async function fetchSettings(): Promise<SiteSettings | null> {
  const snap = await getDoc(DOC_REF);
  if (snap.exists()) {
    return snap.data() as SiteSettings;
  }
  return null;
}

export async function updateHeroVideo(videoFile: File | null, existingUrl?: string): Promise<string | undefined> {
  let videoUrl = existingUrl;

  if (videoFile) {
    const formData = new FormData();
    formData.append('file', videoFile);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', 'moses_wire_arts/hero');

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`,
      { method: 'POST', body: formData }
    );

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message ?? 'Cloudinary video upload failed');
    }

    const data = await res.json();
    videoUrl = data.secure_url as string;
  }

  // Update Firestore
  await setDoc(DOC_REF, { heroVideoUrl: videoUrl ?? null }, { merge: true });

  return videoUrl;
}

export async function updateArtistImage(imageFile: File | null, existingUrl?: string): Promise<string | undefined> {
  let imageUrl = existingUrl;

  if (imageFile) {
    const formData = new FormData();
    formData.append('file', imageFile);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', 'moses_wire_arts/artist');

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      { method: 'POST', body: formData }
    );

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message ?? 'Cloudinary image upload failed');
    }

    const data = await res.json();
    imageUrl = data.secure_url as string;
  }

  // Update Firestore
  await setDoc(DOC_REF, { artistImageUrl: imageUrl ?? null }, { merge: true });

  return imageUrl;
}

// ─── Hero Images (Slideshow, up to 5) ────────────────────────────────────────
export type HeroImageItem =
  | { type: 'url'; val: string }
  | { type: 'file'; val: File; preview: string };

export async function updateHeroImages(items: HeroImageItem[]): Promise<string[]> {
  const urls: string[] = [];

  for (const item of items.slice(0, 5)) {
    if (item.type === 'url') {
      urls.push(item.val);
    } else {
      const formData = new FormData();
      formData.append('file', item.val);
      formData.append('upload_preset', UPLOAD_PRESET);
      formData.append('folder', 'moses_wire_arts/hero');

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message ?? 'Cloudinary hero image upload failed');
      }

      const data = await res.json();
      urls.push(data.secure_url as string);
    }
  }

  await setDoc(DOC_REF, { heroImages: urls }, { merge: true });
  return urls;
}
