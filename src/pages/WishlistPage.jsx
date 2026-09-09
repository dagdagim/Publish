import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, Download, ExternalLink, ArrowRight, Smartphone, Star, ShieldCheck, Sparkles } from 'lucide-react';
import ProductCard from '../components/ProductCard';

export default function WishlistPage() {
  const [savedApps, setSavedApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSavedApps();
    window.addEventListener('wishlist-updated', loadSavedApps);
    return () => window.removeEventListener('wishlist-updated', loadSavedApps);
  }, []);

  const loadSavedApps = () => {
    try {
      const stored = localStorage.getItem('tobiyastudio_wishlist');
      if (stored) {
        setSavedApps(JSON.parse(stored));
      } else {
        setSavedApps([]);
      }
    } catch (e) {
      console.error(e);
      setSavedApps([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = (id) => {
    const updated = savedApps.filter(a => a.id !== id);
    setSavedApps(updated);
    localStorage.setItem('tobiyastudio_wishlist', JSON.stringify(updated));
    window.dispatchEvent(new Event('wishlist-updated'));
  };

  const handleClearAll = () => {
    if (window.confirm('Clear all saved applications?')) {
      setSavedApps([]);
      localStorage.removeItem('tobiyastudio_wishlist');
      window.dispatchEvent(new Event('wishlist-updated'));
    }
  };

  return (
    <div className="container" style={{ padding: '40px 24px 80px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '32px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#EF4444', fontSize: '13px', fontWeight: '700', marginBottom: '6px' }}>
            <Heart size={16} fill="#EF4444" /> Your Personal Library
          </div>
          <h1 style={{ fontSize: '30px', fontWeight: '800', color: '#0F172A', letterSpacing: '-0.02em', margin: 0 }}>
            Saved Applications ({savedApps.length})
          </h1>
          <p style={{ fontSize: '14.5px', color: '#64748B', marginTop: '4px' }}>
            Bookmarked software and mobile apps saved for quick access and offline installation.
          </p>
        </div>

        {savedApps.length > 0 && (
          <button
            onClick={handleClearAll}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#DC2626' }}
          >
            <Trash2 size={14} /> Clear Library
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748B' }}>
          Loading your library...
        </div>
      ) : savedApps.length === 0 ? (
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          border: '1px solid #E2E8F0',
          padding: '64px 32px',
          textAlign: 'center',
          maxWidth: '560px',
          margin: '0 auto',
          boxShadow: 'var(--shadow-xs)'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: '#FEE2E2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <Heart size={32} color="#EF4444" />
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', marginBottom: '8px' }}>
            Your Library is Empty
          </h3>
          <p style={{ fontSize: '14.5px', color: '#64748B', maxWidth: '420px', margin: '0 auto 24px' }}>
            Click the heart icon on any application in the store to save it here for fast access and downloads anytime.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
            <Link to="/apps" className="btn btn-primary btn-md">
              Browse Apps <ArrowRight size={15} />
            </Link>
            <Link to="/explore" className="btn btn-secondary btn-md">
              Explore Store
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid-4">
          {savedApps.map(app => (
            <div key={app.id} style={{ position: 'relative' }}>
              <ProductCard product={app} />
              <button
                onClick={() => handleRemove(app.id)}
                title="Remove from Saved"
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #FCA5A5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#EF4444',
                  boxShadow: 'var(--shadow-sm)',
                  zIndex: 5
                }}
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
