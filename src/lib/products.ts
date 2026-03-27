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

// ─── STORAGE HELPERS ─────────────────────────────────────────────────────────

async function uploadProductImage(file: File): Promise<{ url: string; path: string }> {
  const path = `products/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  return { url, path };
}

async function deleteStorageImage(path: string): Promise<void> {
  const storageRef = ref(storage, path);
  await deleteObject(storageRef);
}
