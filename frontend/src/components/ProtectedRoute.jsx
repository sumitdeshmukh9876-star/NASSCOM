import { useAuth } from '../context/AuthContext';

// Wrapper that renders children only when authenticated, otherwise shows null
// (App.jsx handles redirects via router logic)
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-emerald-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-sm font-medium tracking-wide">Loading your financial dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null; // App.jsx handles the redirect

  return children;
};

export default ProtectedRoute;
