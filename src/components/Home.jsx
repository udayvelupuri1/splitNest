import React, { useState, useEffect } from 'react';
import { Plus, User, DollarSign, ArrowRight, LogOut } from 'lucide-react';
import { getExpenseSummaries } from '../services/expenseService';
import { logout } from '../services/authService';
import { useAuth } from '../context/AuthContext';

const Home = ({ onAddExpense, onViewExpenses }) => {
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchSummaries = async () => {
      if (user) {
        try {
          const data = await getExpenseSummaries(user.id);
          setSummaries(data);
        } catch (error) {
          console.error('Error fetching summaries:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchSummaries();
  }, [user]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      setLoggingOut(false);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">SplitNest</h1>
              <p className="text-gray-600">Welcome back, {user?.name}</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loggingOut ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </>
                )}
              </button>
              <button
                onClick={onAddExpense}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors flex items-center"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Expense
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {summaries.length === 0 ? (
          <div className="text-center py-12">
            <DollarSign className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses yet</h3>
            <p className="text-gray-500 mb-6">Start by adding your first expense</p>
            <button
              onClick={onAddExpense}
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors inline-flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Expense
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Your Expenses</h2>
            {summaries.map((summary) => (
              <div
                key={summary.userId}
                onClick={() => onViewExpenses(summary.userId, summary.userMobile)}
                onClick={() => onViewExpenses(summary.userId, summary.userMobile, summary.userName)}
                className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-gray-100 rounded-full p-3 mr-4">
                      <User className="h-6 w-6 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{summary.userName || summary.userMobile}</h3>
                      <p className="text-sm text-gray-500">ID: {summary.userUniqueId}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-semibold ${
                      summary.netBalance > 0 ? 'text-green-600' : 
                      summary.netBalance < 0 ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {summary.netBalance > 0 && '+'}
                      {formatAmount(summary.netBalance)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {summary.netBalance > 0 ? 'You are owed' : 
                       summary.netBalance < 0 ? 'You owe' : 'Settled up'}
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 ml-4" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;