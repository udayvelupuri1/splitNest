import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase/config';

export const addExpense = async (
  amount,
  description,
  payerId,
  recipientId,
  payerMobile,
  recipientMobile,
  payerName,
  recipientName,
  payerUniqueId,
  recipientUniqueId
) => {
  const expenseData = {
    amount,
    description,
    payerId,
    recipientId,
    payerMobile,
    recipientMobile,
    payerName,
    recipientName,
    payerUniqueId,
    recipientUniqueId,
    createdAt: serverTimestamp(),
    settled: false
  };

  await addDoc(collection(db, 'expenses'), expenseData);
};

export const getUserExpenses = async (userId) => {
  const q1 = query(
    collection(db, 'expenses'),
    where('payerId', '==', userId)
  );
  
  const q2 = query(
    collection(db, 'expenses'),
    where('recipientId', '==', userId)
  );

  const [payerSnapshot, recipientSnapshot] = await Promise.all([
    getDocs(q1),
    getDocs(q2)
  ]);
  const expenses = [];
  
  payerSnapshot.forEach(doc => {
    expenses.push({ id: doc.id, ...doc.data() });
  });
  
  recipientSnapshot.forEach(doc => {
    expenses.push({ id: doc.id, ...doc.data() });
  });

  return expenses.sort((a, b) => {
    const aTime = a.createdAt?.seconds || 0;
    const bTime = b.createdAt?.seconds || 0;
    return bTime - aTime;
  });
};

export const getExpensesBetweenUsers = async (userId1, userId2) => {
  const q = query(collection(db, 'expenses'));

  const querySnapshot = await getDocs(q);
  const expenses = [];

  querySnapshot.forEach(doc => {
    const expense = { id: doc.id, ...doc.data() };
    if (
      (expense.payerId === userId1 && expense.recipientId === userId2) ||
      (expense.payerId === userId2 && expense.recipientId === userId1)
    ) {
      expenses.push(expense);
    }
  });

  return expenses.sort((a, b) => {
    const aTime = a.createdAt?.seconds || 0;
    const bTime = b.createdAt?.seconds || 0;
    return bTime - aTime;
  });
};

export const getExpenseSummaries = async (userId) => {
  const expenses = await getUserExpenses(userId);
  const summaryMap = new Map();

  expenses.forEach(expense => {
    const otherUserId = expense.payerId === userId ? expense.recipientId : expense.payerId;
    const otherUserMobile = expense.payerId === userId ? expense.recipientMobile : expense.payerMobile;
    const otherUserName = expense.payerId === userId ? expense.recipientName : expense.payerName;
    const otherUserUniqueId = expense.payerId === userId ? expense.recipientUniqueId : expense.payerUniqueId;
    
    if (!summaryMap.has(otherUserId)) {
      summaryMap.set(otherUserId, {
        userId: otherUserId,
        userMobile: otherUserMobile,
        userName: otherUserName,
        userUniqueId: otherUserUniqueId,
        totalOwed: 0,
        totalPaid: 0,
        netBalance: 0
      });
    }

    const summary = summaryMap.get(otherUserId);
    const halfAmount = expense.amount / 2;

    if (expense.payerId === userId) {
      // Current user paid, so they are owed half the amount
      if (!expense.settled) {
        summary.totalOwed += halfAmount;
      }
    } else {
      // Other user paid, so current user owes half the amount
      if (!expense.settled) {
        summary.totalPaid += halfAmount;
      }
    }

    summary.netBalance = summary.totalOwed - summary.totalPaid;
  });

  return Array.from(summaryMap.values());
};

export const settleExpense = async (expenseId) => {
  await updateDoc(doc(db, 'expenses', expenseId), {
    settled: true
  });
};