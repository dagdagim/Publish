import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, Download, ExternalLink, Heart } from 'lucide-react';

export default function ProductCard({ product }) {
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    checkWishlist();
    window.addEventListener('wishlist-updated', checkWishlist);
    return () => window.removeEventListener('wishlist-updated', checkWishlist);
  }, [product?.id]);

  const checkWishlist = () => {
    try {
      const stored = localStorage.getItem('tobiyastudio_wishlist');
      if (stored && product) {
        const list = JSON.parse(stored);
        setIsSaved(list.some(item => item.id === product.id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product) return;

    try {
      const stored = localStorage.getItem('tobiyastudio_wishlist');
      let list = stored ? JSON.parse(stored) : [];
      if (isSaved) {
        list = list.filter(item => item.id !== product.id);
        setIsSaved(false);
      } else {
        list.push(product);
        setIsSaved(true);
      }
      localStorage.setItem('tobiyastudio_wishlist', JSON.stringify(list));
      window.dispatchEvent(new Event('wishlist-updated'));
    } catch (err) {
      console.error(err);
    }
  };

  if (!product) return null;

  const formatDownloads = (num) => {
    if (!num) return null;
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return String(num);
  };

  const formattedDownloads = formatDownloads(product.downloadCount);

  return (
    <Link
      to={`/product/${product.slug}`}
      className="product-card"
      id={`product-card-${product.slug}`}
      style={{ position: 'relative' }}
    >
      {/* Wishlist Heart Button */}
      <button
        type="button"
        onClick={handleToggleWishlist}
        title={isSaved ? 'Remove from Saved' : 'Save to Library'}
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          backgroundColor: isSaved ? '#FEF2F2' : 'rgba(255, 255, 255, 0.9)',
          border: isSaved ? '1px solid #FECACA' : '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: isSaved ? '#EF4444' : '#94A3B8',
          boxShadow: 'var(--shadow-xs)',
          zIndex: 3,
          transition: 'all 0.15s ease'
        }}
      >
        <Heart size={14} fill={isSaved ? '#EF4444' : 'none'} color={isSaved ? '#EF4444' : '#64748B'} />
      </button>

      <div className="product-card-top">
        <div className="product-icon-wrap">
          <img
            src={product.icon}
            alt={`${product.name} icon`}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = '/assets/icons/kpi-tracker.svg';
            }}
          />
        </div>
        <div className="product-card-info" style={{ paddingRight: '26px' }}>
          <h3 className="product-card-title">{product.name}</h3>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span className="badge badge-gray" style={{ fontSize: '11px', padding: '2px 6px' }}>
              {product.category}
            </span>
            <span className="badge-platform">
              {product.platform}
            </span>
          </div>
        </div>
      </div>

      <p className="product-card-desc">
        {product.shortDescription}
      </p>

      <div className="product-card-meta">
        <div className="product-card-rating">
          <Star size={14} fill="#F59E0B" color="#F59E0B" />
          <span>{Number(product.rating || 5.0).toFixed(1)}</span>
          <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '400' }}>
            ({product.reviewCount || 1})
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {formattedDownloads && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '11px', color: '#64748B', fontWeight: '600' }}>
              <Download size={11} /> {formattedDownloads}
            </span>
          )}

          {product.isWebApp ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '11.5px', color: '#2563EB', fontWeight: '600' }}>
              Web <ExternalLink size={12} />
            </span>
          ) : (
            <span className="product-card-version">
              {product.fileSize || `v${product.version || '1.0'}`}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
