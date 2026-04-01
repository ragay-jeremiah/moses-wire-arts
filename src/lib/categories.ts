import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../firebase';

export interface Category {
  id: string;
  name: string;
}

const COLLECTION = 'categories';

export async function fetchCategories(): Promise<Category[]> {
  const q = query(collection(db, COLLECTION), orderBy('name', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Category));
}

export async function addCategory(name: string): Promise<Category> {
  const docRef = await addDoc(collection(db, COLLECTION), { name: name.trim() });
  return { id: docRef.id, name: name.trim() };
}

export async function updateCategory(id: string, name: string): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), { name: name.trim() });
}

export async function deleteCategory(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}
