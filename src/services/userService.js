import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  where, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase/config';

export const createUser = async (userId, mobile, name) => {
  // Generate a unique ID (first 3 letters of mobile + random 3 digits)
  const uniqueId = mobile.slice(-3) + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  const userData = {
    name,
    mobile,
    uniqueId,
    createdAt: serverTimestamp()
  };

  await setDoc(doc(db, 'users', userId), userData);
  
  return {
    id: userId,
    name,
    mobile,
    uniqueId,
    createdAt: new Date()
  };
};

export const findUserByMobileOrUniqueId = async (identifier) => {
  // Try to find by mobile first
  let q = query(collection(db, 'users'), where('mobile', '==', identifier));
  let querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    // Try to find by uniqueId
    q = query(collection(db, 'users'), where('uniqueId', '==', identifier));
    querySnapshot = await getDocs(q);
  }
  
  if (!querySnapshot.empty) {
    const userDoc = querySnapshot.docs[0];
    return { id: userDoc.id, ...userDoc.data() };
  }
  
  return null;
};

export const getAllUsers = async () => {
  const querySnapshot = await getDocs(collection(db, 'users'));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};