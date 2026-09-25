import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Dashboard from './pages/Dashboard';
import AIAdvisor from './pages/AIAdvisor';
import BudgetExpenses from './pages/BudgetExpenses';
import FinancialGoals from './pages/FinancialGoals';
import ProfileSettings from './pages/ProfileSettings';

const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();
  const [authPage, setAuthPage] = useState('login'); // 'login' | 'signup'
  const [activePage, setActivePage] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-emerald-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-sm font-medium">Starting up FinanceAI...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return authPage === 'login'
      ? <LoginPage goToSignup={() => setAuthPage('signup')} />
      : <SignupPage goToLogin={() => setAuthPage('login')} />;
  }

  const pageMap = {
    dashboard: <Dashboard setActivePage={setActivePage} />,
    advisor: <AIAdvisor />,
    expenses: <BudgetExpenses />,
    goals: <FinancialGoals />,
    profile: <ProfileSettings />,
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      {/* Content area - offset for fixed sidebar on desktop */}
      <main className="flex-1 lg:ml-64 pt-14 lg:pt-0 flex flex-col">
        {pageMap[activePage] || pageMap.dashboard}
      </main>
    </div>
  );
};

const App = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;
