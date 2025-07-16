import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Home from './components/Home';
import AddExpense from './components/AddExpense';
import ExpenseDetails from './components/ExpenseDetails';

const AppContent = () => {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState('home');
  const [selectedUser, setSelectedUser] = useState(null);

  const handleAddExpense = () => {
    setCurrentView('add-expense');
  };

  const handleViewExpenses = (userId, userMobile, userName) => {
    setSelectedUser({ id: userId, mobile: userMobile, name: userName });
    setCurrentView('expense-details');
  };

  const handleBack = () => {
    setCurrentView('home');
    setSelectedUser(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  switch (currentView) {
    case 'add-expense':
      return <AddExpense onBack={handleBack} />;
    case 'expense-details':
      return selectedUser ? (
        <ExpenseDetails
          userId={selectedUser.id}
          userMobile={selectedUser.mobile}
          userName={selectedUser.name}
          onBack={handleBack}
        />
      ) : (
        <Home onAddExpense={handleAddExpense} onViewExpenses={handleViewExpenses} />
      );
    default:
      return <Home onAddExpense={handleAddExpense} onViewExpenses={handleViewExpenses} />;
  }
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;