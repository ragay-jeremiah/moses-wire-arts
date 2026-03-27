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

// ─── Cloudinary Config ────────────────────────────────────────────────────────
const CLOUD_NAME = 'dvbgohxka';
const UPLOAD_PRESET = 'moses_wire_arts';

export interface Product {
  id: string;
  name: string;
  artist: string;
  price: number;
  image: string;       // Cloudinary URL
  category: string;
  size?: string;
  madeToOrder?: boolean;
  isAvailable?: boolean;
  storagePath?: string; // kept for type compat, unused with Cloudinary
  createdAt?: Timestamp;
}

const COLLECTION = 'products';

// ─── READ ─────────────────────────────────────────────────────────────────────

export async function fetchProducts(): Promise<Product[]> {
  const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Product));
}

// ─── CLOUDINARY UPLOAD ────────────────────────────────────────────────────────

async function uploadToCloudinary(file: File): Promise<string> {
  // Compress image before uploading
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
  imageFile?: File
): Promise<Product> {
  let imageUrl = data.image;

  if (imageFile) {
    imageUrl = await uploadToCloudinary(imageFile);
  }

  const docRef = await addDoc(collection(db, COLLECTION), {
    ...data,
    image: imageUrl,
    storagePath: null, // no Firebase Storage path
    createdAt: serverTimestamp(),
  });

  return { id: docRef.id, ...data, image: imageUrl };
}

// ─── UPDATE ───────────────────────────────────────────────────────────────────

export async function updateProduct(
  id: string,
  data: Partial<Omit<Product, 'id' | 'createdAt'>>,
  imageFile?: File,
  _oldStoragePath?: string // ignored, no Firebase Storage
): Promise<void> {
  let updateData: Record<string, unknown> = { ...data };

  if (imageFile) {
    updateData.image = await uploadToCloudinary(imageFile);
  }

  await updateDoc(doc(db, COLLECTION, id), updateData);
}

// ─── DELETE ───────────────────────────────────────────────────────────────────

export async function deleteProduct(id: string, _storagePath?: string): Promise<void> {
  // Cloudinary deletion requires server-side signed API — skipping for now.
  // Image stays in Cloudinary but document is removed from Firestore.
  await deleteDoc(doc(db, COLLECTION, id));
}