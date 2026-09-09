import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Search, Menu, X, PlusCircle, Shield, Globe, Gamepad2, Smartphone, Layers, Compass, Heart, User, LogIn, LogOut, ChevronDown, UserPlus } from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout, openAuthModal } = useAuth();
  const [savedCount, setSavedCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const searchRef = useRef(null);
  const userDropdownRef = useRef(null);

  useEffect(() => {
    setMobileMenuOpen(false);
    setShowSuggestions(false);
    setUserDropdownOpen(false);
  }, [location.pathname]);

  // Wishlist live count sync
  const updateSavedCount = () => {
    try {
      const stored = localStorage.getItem('tobiyastudio_wishlist');
      setSavedCount(stored ? JSON.parse(stored).length : 0);
    } catch {
      setSavedCount(0);
    }
  };

  useEffect(() => {
    updateSavedCount();
    window.addEventListener('wishlist-updated', updateSavedCount);
    return () => window.removeEventListener('wishlist-updated', updateSavedCount);
  }, []);

  // Handle outside click for search suggestions & user dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch search suggestions
  useEffect(() => {
    if (searchTerm.trim().length > 1) {
      fetch(`/api/products?search=${encodeURIComponent(searchTerm.trim())}&limit=5`)
        .then(res => res.json())
        .then(data => {
          setSuggestions(data.products || []);
          setShowSuggestions(true);
        })
        .catch(() => setSuggestions([]));
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchTerm]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setShowSuggestions(false);
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <header className="navbar-wrapper">
      <div className="container navbar-container">
        {/* Brand Logo & Wordmark */}
        <Link to="/" className="brand-link" id="nav-brand-logo">
          <svg className="brand-logo-icon" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="#2563EB"/>
            <path d="M7 10H25M16 10V24" stroke="#FFFFFF" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 21C12 18 20 18 20 21C20 24 12 24 12 27" stroke="#93C5FD" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>TobiyaStudio</span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="nav-links" style={{ display: 'flex' }}>
          <Link to="/explore" className={`nav-link ${location.pathname === '/explore' ? 'active' : ''}`} id="nav-explore">
            Explore
          </Link>
          <Link to="/apps" className={`nav-link ${location.pathname === '/apps' ? 'active' : ''}`} id="nav-apps">
            Apps
          </Link>
          <Link to="/games" className={`nav-link ${location.pathname === '/games' ? 'active' : ''}`} id="nav-games">
            Games
          </Link>
          <Link to="/web" className={`nav-link ${location.pathname === '/web' ? 'active' : ''}`} id="nav-web">
            Web Apps
          </Link>
          <Link to="/collections" className={`nav-link ${location.pathname === '/collections' ? 'active' : ''}`} id="nav-collections">
            Collections
          </Link>
        </nav>

        {/* Global Instant Search Bar */}
        <div className="nav-search-wrap" ref={searchRef}>
          <form onSubmit={handleSearchSubmit}>
            <Search className="nav-search-icon" size={17} />
            <input
              type="text"
              className="nav-search-input"
              placeholder="Search apps, games, web apps..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
              id="global-search-input"
            />
          </form>

          {/* Autocomplete suggestions dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: '8px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              boxShadow: 'var(--shadow-lg)',
              overflow: 'hidden',
              zIndex: 200
            }}>
              <div style={{ padding: '8px 12px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#94A3B8', borderBottom: '1px solid #F1F5F9' }}>
                Products
              </div>
              {suggestions.map(p => (
                <Link
                  key={p.id}
                  to={`/product/${p.slug}`}
                  onClick={() => setShowSuggestions(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 14px',
                    borderBottom: '1px solid #F8FAFC',
                    transition: 'background 0.15s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
                >
                  <img src={p.icon} alt="" style={{ width: '28px', height: '28px', borderRadius: '6px' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13.5px', fontWeight: '600', color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {p.name}
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#64748B' }}>
                      {p.category} · {p.platform}
                    </div>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: '600', color: '#2563EB' }}>
                    ★ {p.rating}
                  </span>
                </Link>
              ))}
              <div style={{ padding: '8px 12px', textAlign: 'center', backgroundColor: '#F8FAFC', borderTop: '1px solid #F1F5F9' }}>
                <Link
                  to={`/search?q=${encodeURIComponent(searchTerm)}`}
                  style={{ fontSize: '12.5px', fontWeight: '600', color: '#2563EB' }}
                >
                  See all results for "{searchTerm}" →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Right Action: User Account / Saved / Admin */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Link
            to="/saved"
            className="btn btn-secondary btn-sm"
            title="Saved Applications Library"
            id="nav-saved-btn"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Heart size={15} color={savedCount > 0 ? '#EF4444' : '#64748B'} fill={savedCount > 0 ? '#EF4444' : 'none'} />
            <span className="hide-mobile">Saved</span>
            {savedCount > 0 && (
              <span style={{
                backgroundColor: '#EF4444',
                color: '#FFFFFF',
                fontSize: '11px',
                fontWeight: '800',
                borderRadius: '10px',
                padding: '0 6px',
                lineHeight: '1.4'
              }}>
                {savedCount}
              </span>
            )}
          </Link>

          {/* User Auth Buttons or Profile Menu */}
          {isAuthenticated && user ? (
            <div style={{ position: 'relative' }} ref={userDropdownRef}>
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                id="user-profile-menu-btn"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '4px 10px 4px 6px',
                  backgroundColor: '#EFF6FF',
                  border: '1px solid #BFDBFE',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: '#2563EB',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11.5px',
                  fontWeight: '700'
                }}>
                  {user.avatar || 'US'}
                </div>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#1E40AF', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.name.split(' ')[0]}
                </span>
                <ChevronDown size={14} color="#2563EB" />
              </button>

              {userDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '8px',
                  width: '220px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '14px',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.15)',
                  padding: '8px',
                  zIndex: 200,
                  animation: 'fadeIn 0.15s ease-out'
                }}>
                  <div style={{ padding: '10px 12px', borderBottom: '1px solid #F1F5F9', marginBottom: '6px' }}>
                    <div style={{ fontSize: '13.5px', fontWeight: '800', color: '#0F172A' }}>
                      {user.name}
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {user.email}
                    </div>
                    <span className="badge badge-success" style={{ marginTop: '6px', fontSize: '10px' }}>
                      Verified Member
                    </span>
                  </div>

                  <Link
                    to="/saved"
                    onClick={() => setUserDropdownOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      color: '#334155',
                      textDecoration: 'none'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <Heart size={15} color="#EF4444" /> My Saved Apps
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      setUserDropdownOpen(false);
                      logout();
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      color: '#DC2626',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FEF2F2'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <LogOut size={15} color="#DC2626" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                type="button"
                onClick={() => openAuthModal({ tab: 'login' })}
                className="btn btn-secondary btn-sm"
                id="nav-signin-btn"
                style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12.5px' }}
              >
                <LogIn size={14} />
                <span>Sign In</span>
              </button>
              <button
                type="button"
                onClick={() => openAuthModal({ tab: 'register' })}
                className="btn btn-primary btn-sm"
                id="nav-register-btn"
                style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12.5px' }}
              >
                <UserPlus size={14} />
                <span className="hide-mobile">Create Account</span>
              </button>
            </div>
          )}

          <Link
            to="/admin"
            className="btn btn-secondary btn-sm hide-mobile"
            title="Platform Management Dashboard"
            id="nav-admin-btn"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Shield size={15} />
            <span>Admin</span>
          </Link>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ display: 'none' }}
            className="mobile-menu-trigger"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div style={{
          position: 'fixed',
          top: '70px',
          left: 0,
          right: 0,
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          padding: '20px 24px',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          zIndex: 99
        }}>
          {isAuthenticated && user ? (
            <div style={{ padding: '12px', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '800', color: '#0F172A' }}>{user.name}</div>
                <div style={{ fontSize: '12px', color: '#64748B' }}>{user.email}</div>
              </div>
              <button onClick={logout} className="btn btn-outline btn-sm" style={{ color: '#DC2626', borderColor: '#FECACA' }}>
                Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => { setMobileMenuOpen(false); openAuthModal({ tab: 'login' }); }} className="btn btn-secondary btn-block">
                Sign In
              </button>
              <button onClick={() => { setMobileMenuOpen(false); openAuthModal({ tab: 'register' }); }} className="btn btn-primary btn-block">
                Create Account
              </button>
            </div>
          )}

          <Link to="/explore" className="nav-link" style={{ fontSize: '16px', fontWeight: '600' }}>
            <Compass size={18} style={{ display: 'inline', marginRight: '10px' }} /> Explore
          </Link>
          <Link to="/apps" className="nav-link" style={{ fontSize: '16px', fontWeight: '600' }}>
            <Smartphone size={18} style={{ display: 'inline', marginRight: '10px' }} /> Apps
          </Link>
          <Link to="/games" className="nav-link" style={{ fontSize: '16px', fontWeight: '600' }}>
            <Gamepad2 size={18} style={{ display: 'inline', marginRight: '10px' }} /> Games
          </Link>
          <Link to="/web" className="nav-link" style={{ fontSize: '16px', fontWeight: '600' }}>
            <Globe size={18} style={{ display: 'inline', marginRight: '10px' }} /> Web Apps
          </Link>
          <Link to="/collections" className="nav-link" style={{ fontSize: '16px', fontWeight: '600' }}>
            <Layers size={18} style={{ display: 'inline', marginRight: '10px' }} /> Collections
          </Link>
          <Link to="/saved" className="nav-link" style={{ fontSize: '16px', fontWeight: '600' }}>
            <Heart size={18} color="#EF4444" fill={savedCount > 0 ? '#EF4444' : 'none'} style={{ display: 'inline', marginRight: '10px' }} /> Saved Apps ({savedCount})
          </Link>
          <div style={{ height: '1px', backgroundColor: '#E2E8F0', margin: '4px 0' }} />
          <Link to="/admin" className="btn btn-primary btn-block">
            Admin Management
          </Link>
        </div>
      )}
    </header>
  );
}
