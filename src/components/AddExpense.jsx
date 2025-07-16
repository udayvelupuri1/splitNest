import React, { useState } from 'react';
import { ArrowLeft, DollarSign, FileText, User, Plus } from 'lucide-react';
import { addExpense } from '../services/expenseService';
import { findUserByMobileOrUniqueId } from '../services/userService';
import { useAuth } from '../context/AuthContext';

const AddExpense = ({ onBack }) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [recipientIdentifier, setRecipientIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const recipient = await findUserByMobileOrUniqueId(recipientIdentifier);
      
      if (!recipient) {
        setError('Recipient not found. Please check the mobile number or unique ID.');
        setLoading(false);
        return;
      }

      if (recipient.id === user.id) {
        setError('You cannot add an expense with yourself.');
        setLoading(false);
        return;
      }

      await addExpense(
        parseFloat(amount),
        description,
        user.id,
        recipient.id,
        user.mobile,
        recipient.mobile,
        user.name,
        recipient.name,
        user.uniqueId,
        recipient.uniqueId
      );

      setSuccess(true);
      setAmount('');
      setDescription('');
      setRecipientIdentifier('');
      
      setTimeout(() => {
        onBack();
      }, 2000);

    } catch (err) {
      setError(err.message || 'Failed to add expense');
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (value) => {
    const num = parseFloat(value);
    return isNaN(num) ? '0' : new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center">
            <button
              onClick={onBack}
              className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-6 w-6 text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Add Expense</h1>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm p-8">
          {success ? (
            <div className="text-center py-8">
              <div className="bg-green-100 rounded-full p-3 w-16 h-16 mx-auto mb-4">
                <Plus className="h-10 w-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Expense Added!</h2>
              <p className="text-gray-600">Redirecting you back to home...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
                {amount && (
                  <p className="mt-2 text-sm text-gray-600">
                    Split amount: {formatAmount((parseFloat(amount) / 2).toString())} each
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What was this expense for?"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Split with
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={recipientIdentifier}
                    onChange={(e) => setRecipientIdentifier(e.target.value)}
                    placeholder="Enter mobile number or unique ID"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Plus className="h-5 w-5 mr-2" />
                    Add Expense
                  </>
                )}
              </button>
            </form>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddExpense;