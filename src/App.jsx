import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Link, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AuthModal from './components/AuthModal';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import HomePage from './pages/HomePage';
import ExplorePage from './pages/ExplorePage';
import AppsPage from './pages/AppsPage';
import WebAppsPage from './pages/WebAppsPage';
import SearchPage from './pages/SearchPage';
import ProductDetailPage from './pages/ProductDetailPage';
import PublisherPage from './pages/PublisherPage';
import CollectionsPage from './pages/CollectionsPage';
import WishlistPage from './pages/WishlistPage';
import DeveloperPortal from './pages/DeveloperPortal';
import AdminDashboard from './pages/AdminDashboard';
import NotFoundPage from './pages/NotFoundPage';

// Mobile Bottom Nav Icons
import { Home, Compass, Smartphone, Gamepad2, Shield } from 'lucide-react';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function Layout({ children }) {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        {children}
      </main>
      {!isAdmin && <Footer />}
      <AuthModal />

      {/* Mobile Bottom Navigation Bar matching visual mockup */}
      <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
        <Link to="/" className={`mobile-nav-item ${location.pathname === '/' ? 'active' : ''}`}>
          <Home size={20} />
          <span>Home</span>
        </Link>
        <Link to="/explore" className={`mobile-nav-item ${location.pathname === '/explore' ? 'active' : ''}`}>
          <Compass size={20} />
          <span>Explore</span>
        </Link>
        <Link to="/apps" className={`mobile-nav-item ${location.pathname === '/apps' ? 'active' : ''}`}>
          <Smartphone size={20} />
          <span>Apps</span>
        </Link>
        <Link to="/games" className={`mobile-nav-item ${location.pathname === '/games' ? 'active' : ''}`}>
          <Gamepad2 size={20} />
          <span>Games</span>
        </Link>
        <Link to="/admin" className={`mobile-nav-item ${location.pathname.startsWith('/admin') ? 'active' : ''}`}>
          <Shield size={20} />
          <span>Admin</span>
        </Link>
      </nav>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/apps" element={<AppsPage />} />
            <Route path="/games" element={<ExplorePage defaultPlatform="Games" />} />
            <Route path="/web" element={<WebAppsPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/product/:slug" element={<ProductDetailPage />} />
            <Route path="/publishers/:slug" element={<PublisherPage />} />
            <Route path="/collections" element={<CollectionsPage />} />
            <Route path="/collections/:slug" element={<CollectionsPage />} />
            <Route path="/saved" element={<WishlistPage />} />
            <Route path="/developer/submit" element={<Navigate to="/admin" replace />} />
            <Route path="/publish" element={<Navigate to="/admin" replace />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  );
}
