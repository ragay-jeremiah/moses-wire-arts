import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase';

// ─── Cloudinary Config ─────────────────────────────────────────
const CLOUD_NAME = 'dvbgohxka';
const UPLOAD_PRESET = 'moses_wire_arts';

export interface Product {
  id: string;
  name: string;
  artist: string;
  price: number;
  image: string;       // Primary image URL
  images: string[];    // New: Full stack of images
  category: string;
  description?: string;
  dimensions?: string;
  materials?: string;
  authenticity?: string;
  shipping?: string;
  size?: string;
  madeToOrder?: boolean;
  isAvailable?: boolean;
  storagePath?: string; 
  createdAt?: Timestamp;
}

const COLLECTION = 'products';

// ─── READ ─────────────────────────────────────────────────────────────────────

export async function fetchProducts(): Promise<Product[]> {
  const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => {
    const data = d.data() as Omit<Product, 'id'>;
    let optimizedImage = data.image;
    
    // Auto-inject Cloudinary format/quality optimizations if not already present
    if (optimizedImage && optimizedImage.includes('res.cloudinary.com') && !optimizedImage.includes('f_auto,q_auto')) {
      optimizedImage = optimizedImage.replace('/image/upload/', '/image/upload/f_auto,q_auto/');
    }

    // Ensure images array exists for PhotoStack compatibility
    const images = data.images || [optimizedImage];

    return { id: d.id, ...data, image: optimizedImage, images } as Product;
  });
}

// ─── CLOUDINARY UPLOAD ────────────────────────────────────────────────────────

async function uploadToCloudinary(file: File): Promise<string> {
  const compressed = await compressImage(file);
  const formData = new FormData();
  formData.append('file', compressed);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', 'moses_wire_arts');

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message ?? 'Cloudinary upload failed');
  }

  const data = await res.json();
  return data.secure_url as string;
}

// ─── NEW: BATCH UPLOAD ────────────────────────────────────────────────────────

async function uploadManyToCloudinary(files: File[]): Promise<string[]> {
  return Promise.all(files.map(file => uploadToCloudinary(file)));
}

// ─── IMAGE COMPRESSION ────────────────────────────────────────────────────────

async function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      const MAX = 1200;
      let { width, height } = img;

      if (width > height) {
        if (width > MAX) { height = Math.round((height * MAX) / width); width = MAX; }
      } else {
        if (height > MAX) { width = Math.round((width * MAX) / height); height = MAX; }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) { resolve(file); return; }
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => resolve(blob ?? file),
        'image/webp',
        0.85
      );
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
    img.src = url;
  });
}

// ─── CREATE ───────────────────────────────────────────────────────────────────

export async function addProduct(
  data: Omit<Product, 'id' | 'createdAt'>,
  mixedImages?: (string | File)[]
): Promise<Product> {
  let finalUrls: string[] = [];

  if (mixedImages && mixedImages.length > 0) {
    const filesToUpload = mixedImages.filter(item => typeof item !== 'string') as File[];
    let newUrls: string[] = [];
    if (filesToUpload.length > 0) {
      newUrls = await uploadManyToCloudinary(filesToUpload);
    }
    
    let urlIndex = 0;
    finalUrls = mixedImages.map(item => typeof item === 'string' ? item : newUrls[urlIndex++]);
  } else {
    finalUrls = data.images || [];
  }

  const primaryImage = finalUrls[0] || data.image || '';

  const docRef = await addDoc(collection(db, COLLECTION), {
    ...data,
    image: primaryImage,
    images: finalUrls,
    storagePath: null,
    createdAt: serverTimestamp(),
  });

  return { id: docRef.id, ...data, image: primaryImage, images: finalUrls };
}

// ─── UPDATE ───────────────────────────────────────────────────────────────────

export async function updateProduct(
  id: string,
  data: Partial<Omit<Product, 'id' | 'createdAt'>>,
  mixedImages?: (string | File)[],
  _oldStoragePath?: string 
): Promise<void> {
  let updateData: Record<string, unknown> = { ...data };

  if (mixedImages && mixedImages.length > 0) {
    const filesToUpload = mixedImages.filter(item => typeof item !== 'string') as File[];
    let newUrls: string[] = [];
    if (filesToUpload.length > 0) {
      newUrls = await uploadManyToCloudinary(filesToUpload);
    }
    
    let urlIndex = 0;
    const finalUrls = mixedImages.map(item => typeof item === 'string' ? item : newUrls[urlIndex++]);

    updateData.images = finalUrls;
    updateData.image = finalUrls[0];
  } else if (data.images && Array.isArray(data.images) && data.images.length > 0) {
    // If no files at all, but the order or elements of images array might have changed 
    updateData.images = data.images;
    updateData.image = data.images[0];
  }

  await updateDoc(doc(db, COLLECTION, id), updateData);
}

// ─── DELETE ───────────────────────────────────────────────────────────────────

export async function deleteProduct(id: string, _storagePath?: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}
