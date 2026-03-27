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
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { db, storage } from '../firebase';

export interface Product {
  id: string;
  name: string;
  artist: string;
  price: number;
  image: string;
  category: string;
  storagePath?: string; // Firebase Storage path for deletion
  createdAt?: Timestamp;
}

const COLLECTION = 'products';

// ─── READ ────────────────────────────────────────────────────────────────────

export async function fetchProducts(): Promise<Product[]> {
  const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Product));
}

// ─── CREATE ──────────────────────────────────────────────────────────────────

export async function addProduct(
  data: Omit<Product, 'id' | 'createdAt'>,
  imageFile?: File
): Promise<Product> {
  let imageUrl = data.image;
  let storagePath: string | undefined;

  if (imageFile) {
    const result = await uploadProductImage(imageFile);
    imageUrl = result.url;
    storagePath = result.path;
  }

  const docRef = await addDoc(collection(db, COLLECTION), {
    ...data,
    image: imageUrl,
    storagePath: storagePath ?? null,
    createdAt: serverTimestamp(),
  });

  return { id: docRef.id, ...data, image: imageUrl, storagePath };
}

// ─── UPDATE ──────────────────────────────────────────────────────────────────

export async function updateProduct(
  id: string,
  data: Partial<Omit<Product, 'id' | 'createdAt'>>,
  imageFile?: File,
  oldStoragePath?: string
): Promise<void> {
  let updateData: Record<string, unknown> = { ...data };

  if (imageFile) {
    // Delete old image from Storage if it was uploaded there
    if (oldStoragePath) {
      await deleteStorageImage(oldStoragePath).catch(() => {});
    }
    const result = await uploadProductImage(imageFile);
    updateData.image = result.url;
    updateData.storagePath = result.path;
  }

  await updateDoc(doc(db, COLLECTION, id), updateData);
}

// ─── DELETE ──────────────────────────────────────────────────────────────────

export async function deleteProduct(id: string, storagePath?: string): Promise<void> {
  if (storagePath) {
    await deleteStorageImage(storagePath).catch(() => {});
  }
  await deleteDoc(doc(db, COLLECTION, id));
}

async function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      const MAX_WIDTH = 1200;
      const MAX_HEIGHT = 1200;
      let { width, height } = img;

      if (width > height) {
        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width = Math.round((width * MAX_HEIGHT) / height);
          height = MAX_HEIGHT;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file);
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : resolve(file)),
        'image/webp',
        0.85
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };
    img.src = url;
  });
}

async function uploadProductImage(file: File): Promise<{ url: string; path: string }> {
  // Compress on the client side before uploading to save massive time and bandwidth
  const compressedBlob = await compressImage(file);
  
  // Make sure to save as webp since we compress to webp
  const newName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
  const path = `products/${Date.now()}_${newName.replace(/\s+/g, '_')}`;
  const storageRef = ref(storage, path);
  
  await uploadBytes(storageRef, compressedBlob);
  const url = await getDownloadURL(storageRef);
  return { url, path };
}

async function deleteStorageImage(path: string): Promise<void> {
  const storageRef = ref(storage, path);
  await deleteObject(storageRef);
}
