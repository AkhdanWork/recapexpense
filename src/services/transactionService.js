// src/services/transactionService.js
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { db, storage } from './firebase';

const COLLECTION = 'transactions';

/**
 * Upload a receipt image to Firebase Storage
 */
export const uploadReceipt = async (userId, file) => {
  const ext = file.name.split('.').pop();
  const fileName = `receipts/${userId}/${Date.now()}.${ext}`;
  const storageRef = ref(storage, fileName);
  const snapshot = await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(snapshot.ref);
  return { url: downloadURL, path: fileName };
};

/**
 * Delete a receipt image from Firebase Storage
 */
export const deleteReceipt = async (path) => {
  if (!path) return;
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch (e) {
    console.warn('Could not delete receipt:', e.message);
  }
};

/**
 * Add a new transaction
 */
export const addTransaction = async (userId, data, receiptFile) => {
  let receipt = null;
  if (receiptFile) {
    receipt = await uploadReceipt(userId, receiptFile);
  }
  const docRef = await addDoc(collection(db, COLLECTION), {
    userId,
    date: Timestamp.fromDate(new Date(data.date)),
    description: data.description,
    type: data.type,
    amount: Number(data.amount),
    category: data.category,
    receipt: receipt,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

/**
 * Update an existing transaction
 */
export const updateTransaction = async (transactionId, data, receiptFile, oldReceiptPath) => {
  let receipt = data.receipt || null;
  if (receiptFile) {
    // Delete old receipt if exists
    if (oldReceiptPath) await deleteReceipt(oldReceiptPath);
    receipt = await uploadReceipt(data.userId, receiptFile);
  }
  const docRef = doc(db, COLLECTION, transactionId);
  await updateDoc(docRef, {
    date: Timestamp.fromDate(new Date(data.date)),
    description: data.description,
    type: data.type,
    amount: Number(data.amount),
    category: data.category,
    receipt: receipt,
    updatedAt: serverTimestamp(),
  });
};

/**
 * Delete a transaction (and its receipt)
 */
export const deleteTransaction = async (transactionId, receiptPath) => {
  if (receiptPath) await deleteReceipt(receiptPath);
  await deleteDoc(doc(db, COLLECTION, transactionId));
};

/**
 * Get all transactions for a user
 */
export const getTransactions = async (userId) => {
  const q = query(
    collection(db, COLLECTION),
    where('userId', '==', userId),
    orderBy('date', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    date: d.data().date?.toDate?.() || new Date(d.data().date),
  }));
};

/**
 * Filter transactions by date range
 */
export const getTransactionsByDateRange = async (userId, startDate, endDate) => {
  const q = query(
    collection(db, COLLECTION),
    where('userId', '==', userId),
    where('date', '>=', Timestamp.fromDate(startDate)),
    where('date', '<=', Timestamp.fromDate(endDate)),
    orderBy('date', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    date: d.data().date?.toDate?.() || new Date(d.data().date),
  }));
};

/**
 * Calculate summary from transactions array
 */
export const calcSummary = (transactions, initialBalance = 0) => {
  const totalIncome = transactions
    .filter((t) => t.type === 'pemasukan')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions
    .filter((t) => t.type === 'pengeluaran')
    .reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;
  return { totalIncome, totalExpense, balance, initialBalance };
};
