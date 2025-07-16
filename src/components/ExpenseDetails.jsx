import React, { useState, useEffect } from 'react';
import { ArrowLeft, Check, DollarSign, Calendar, User } from 'lucide-react';
import { getExpensesBetweenUsers, settleExpense } from '../services/expenseService';
import { useAuth } from '../context/AuthContext';

const ExpenseDetails = ({ userId, userMobile, userName, onBack }) => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settlingExpense, setSettlingExpense] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchExpenses = async () => {
      if (user) {
        try {
          const data = await getExpensesBetweenUsers(user.id, userId);
          setExpenses(data);
        } catch (error) {
          console.error('Error fetching expenses:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchExpenses();
  }, [user, userId]);

  const handleSettleExpense = async (expenseId) => {
    setSettlingExpense(expenseId);
    try {
      await settleExpense(expenseId);
      setExpenses(expenses.map(expense => 
        expense.id === expenseId ? { ...expense, settled: true } : expense
      ));
    } catch (error) {
      console.error('Error settling expense:', error);
    } finally {
      setSettlingExpense(null);
    }
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (timestamp) => {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  const calculateTotalBalance = () => {
    return expenses.reduce((total, expense) => {
      if (expense.settled) return total;
      const halfAmount = expense.amount / 2;
      return expense.payerId === user?.id ? total + halfAmount : total - halfAmount;
    }, 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const totalBalance = calculateTotalBalance();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={onBack}
                className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-6 w-6 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Expenses with {userName || userMobile}</h1>
                <div className={`text-lg font-semibold ${
                  totalBalance > 0 ? 'text-green-600' : 
                  totalBalance < 0 ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {totalBalance > 0 ? 'You are owed ' : totalBalance < 0 ? 'You owe ' : 'Settled up '}
                  {totalBalance !== 0 && formatAmount(Math.abs(totalBalance))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {expenses.length === 0 ? (
          <div className="text-center py-12">
            <DollarSign className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses yet</h3>
            <p className="text-gray-500">Start by adding your first expense with this user</p>
          </div>
        ) : (
          <div className="space-y-4">
            {expenses.map((expense) => {
              const isPayer = expense.payerId === user?.id;
              const halfAmount = expense.amount / 2;
              
              return (
                <div
                  key={expense.id}
                  className={`bg-white rounded-lg p-6 shadow-sm ${
                    expense.settled ? 'opacity-75' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`rounded-full p-3 mr-4 ${
                        expense.settled ? 'bg-gray-100' : 'bg-blue-100'
                      }`}>
                        <DollarSign className={`h-6 w-6 ${
                          expense.settled ? 'text-gray-600' : 'text-blue-600'
                        }`} />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{expense.description}</h3>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDate(expense.createdAt)}
                        </div>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <User className="h-4 w-4 mr-1" />
                          Paid by {isPayer ? 'you' : (userName || userMobile)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-900">
                        {formatAmount(expense.amount)}
                      </div>
                      <div className={`text-sm ${
                        isPayer ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {isPayer ? 'You paid' : 'You owe'} {formatAmount(halfAmount)}
                      </div>
                      {expense.settled ? (
                        <div className="flex items-center text-sm text-gray-500 mt-2">
                          <Check className="h-4 w-4 mr-1" />
                          Settled
                        </div>
                      ) : (
                        <button
                          onClick={() => handleSettleExpense(expense.id)}
                          disabled={settlingExpense === expense.id}
                          className="mt-2 bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                        >
                          {settlingExpense === expense.id ? (
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                          ) : (
                            <>
                              <Check className="h-3 w-3 mr-1" />
                              Settle
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseDetails;