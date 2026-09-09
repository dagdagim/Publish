import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Download, ExternalLink, ShieldCheck, CheckCircle2, ChevronRight, Share2, AlertCircle, Calendar, HardDrive, Smartphone, Globe, Layers, User, Lock, RefreshCw, Heart } from 'lucide-react';
import { PhoneMockup, LaptopMockup } from '../components/DeviceMockup';
import { StarRating } from '../components/StarRating';
import DownloadModal from '../components/DownloadModal';
import ProductCard from '../components/ProductCard';
import QRCodeWidget from '../components/QRCodeWidget';
import SecurityBadge from '../components/SecurityBadge';
import ReviewSection from '../components/ReviewSection';
import { useAuth } from '../context/AuthContext';

export default function ProductDetailPage() {
  const { isAuthenticated, requireAuth, token } = useAuth();
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [selectedScreenshot, setSelectedScreenshot] = useState(null);
  const [isSaved, setIsSaved] = useState(false);

  const handleOpenDownload = () => {
    if (!data || !data.product) return;
    requireAuth(() => {
      setShowDownloadModal(true);
    }, {
      tab: 'register',
      prompt: `Create a free account or sign in to download ${data.product.name} APK.`
    });
  };

  useEffect(() => {
    if (data && data.product) {
      try {
        const stored = localStorage.getItem('tobiyastudio_wishlist');
        if (stored) {
          const list = JSON.parse(stored);
          setIsSaved(list.some(item => item.id === data.product.id));
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, [data]);

  const handleToggleWishlist = () => {
    if (!data || !data.product) return;
    try {
      const stored = localStorage.getItem('tobiyastudio_wishlist');
      let list = stored ? JSON.parse(stored) : [];
      if (isSaved) {
        list = list.filter(item => item.id !== data.product.id);
        setIsSaved(false);
      } else {
        list.push(data.product);
        setIsSaved(true);
      }
      localStorage.setItem('tobiyastudio_wishlist', JSON.stringify(list));
      window.dispatchEvent(new Event('wishlist-updated'));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetch(`/api/products/${slug}`)
      .then(res => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then(resData => {
        setData(resData);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setData(null);
        setLoading(false);
      });
  }, [slug]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;

    setSubmittingReview(true);
    try {
      const res = await fetch(`/api/products/${data.product.id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: reviewName.trim() || 'Verified User',
          rating: reviewRating,
          comment: reviewComment.trim()
        })
      });
      const json = await res.json();
      if (res.ok) {
        setData(prev => ({
          ...prev,
          product: {
            ...prev.product,
            rating: json.rating,
            reviewCount: json.reviewCount
          },
          reviews: [json.review, ...(prev.reviews || [])]
        }));
        setReviewComment('');
        setReviewName('');
        setReviewRating(5);
        setReviewSuccess(true);
        setTimeout(() => setReviewSuccess(false), 4000);
      }
    } catch (err) {
      console.error('Failed to submit review:', err);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '80px 0', textAlign: 'center', color: '#64748B' }}>
        <div style={{ display: 'inline-block', width: '32px', height: '32px', border: '3px solid #E2E8F0', borderTopColor: '#2563EB', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '16px', fontSize: '14px' }}>Loading product details...</p>
      </div>
    );
  }

  if (!data || !data.product) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px' }}>Product Not Found</h2>
        <p style={{ color: '#64748B', marginBottom: '24px' }}>The product you are looking for does not exist or has been unpublished.</p>
        <Link to="/explore" className="btn btn-primary">Browse All Software</Link>
      </div>
    );
  }

  const { product, versions = [], reviews = [], publisher, related = [] } = data;

  return (
    <div style={{ paddingBottom: '64px' }}>
      {/* Breadcrumb Bar */}
      <div style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', padding: '12px 0' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748B' }}>
          <Link to="/" style={{ color: '#64748B' }}>Home</Link>
          <ChevronRight size={14} />
          <Link to={`/search?category=${encodeURIComponent(product.category)}`} style={{ color: '#64748B' }}>
            {product.category}
          </Link>
          <ChevronRight size={14} />
          <span style={{ color: '#0F172A', fontWeight: '600' }}>{product.name}</span>
        </div>
      </div>

      {/* Main Product Header */}
      <section style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '36px 0' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '32px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '22px', alignItems: 'flex-start' }}>
              <img
                src={product.icon}
                alt={product.name}
                style={{ width: '84px', height: '84px', borderRadius: '20px', border: '1px solid #E2E8F0', boxShadow: 'var(--shadow-sm)' }}
              />
              <div>
                <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#0F172A', letterSpacing: '-0.02em', marginBottom: '6px' }}>
                  {product.name}
                </h1>
                <p style={{ fontSize: '15px', color: '#475569', marginBottom: '12px', maxWidth: '640px' }}>
                  {product.shortDescription}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', fontWeight: '700', color: '#0F172A' }}>
                    <Star size={16} fill="#F59E0B" color="#F59E0B" />
                    <span>{product.rating}</span>
                    <span style={{ color: '#94A3B8', fontWeight: '400', fontSize: '13px' }}>
                      ({product.reviewCount} reviews)
                    </span>
                  </div>

                  <span className="badge badge-platform">{product.platform}</span>
                  <span className="badge badge-gray">{product.category}</span>

                  <div style={{ fontSize: '13px', color: '#64748B' }}>
                    Developer:{' '}
                    <Link to={`/publishers/${publisher ? publisher.slug : 'tobiyastudio'}`} style={{ color: '#2563EB', fontWeight: '600' }}>
                      {product.developerName}
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Primary Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '220px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                {product.isWebApp && product.webUrl ? (
                  <a
                    href={product.webUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary btn-lg"
                    id="product-open-webapp-btn"
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    <Globe size={18} /> Open Web App <ExternalLink size={15} />
                  </a>
                ) : (
                  <button
                    onClick={handleOpenDownload}
                    className="btn btn-primary btn-lg"
                    id="product-download-apk-btn"
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    <Download size={18} /> Download APK
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleToggleWishlist}
                  title={isSaved ? 'Remove from Saved' : 'Save to Library'}
                  className="btn btn-secondary btn-lg"
                  id="product-save-btn"
                  style={{ padding: '0 14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Heart size={18} fill={isSaved ? '#EF4444' : 'none'} color={isSaved ? '#EF4444' : '#64748B'} />
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748B', padding: '0 4px' }}>
                <span>Downloads: <strong style={{ color: '#0F172A' }}>{product.downloadCount || 0}</strong></span>
                <span>Size: <strong style={{ color: '#0F172A' }}>{product.fileSize || '25 MB'}</strong></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Navigation */}
      <div style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E2E8F0' }}>
        <div className="container">
          <nav className="tabs-nav" style={{ marginBottom: 0 }}>
            {['overview', 'screenshots', 'features', 'what-is-new', 'information', 'reviews'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                id={`tab-${tab}`}
                style={{ textTransform: 'capitalize' }}
              >
                {tab.replace('-', ' ').replace('what is new', "What's New")}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content Area: Two Column Layout */}
      <div className="container" style={{ padding: '36px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '40px', alignItems: 'flex-start' }}>
          {/* LEFT COLUMN: Main Editorial Content */}
          <div>
            {/* Screenshots Gallery */}
            <div style={{ marginBottom: '40px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '16px', color: '#0F172A' }}>
                Screenshots
              </h2>
              <div style={{
                display: 'flex',
                gap: '16px',
                overflowX: 'auto',
                paddingBottom: '12px',
                scrollbarWidth: 'thin'
              }}>
                {product.screenshots && product.screenshots.map((screen, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedScreenshot(screen)}
                    style={{
                      cursor: 'pointer',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      border: '1px solid #E2E8F0',
                      flexShrink: 0,
                      boxShadow: 'var(--shadow-xs)',
                      transition: 'transform 0.15s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <img
                      src={screen}
                      alt={`${product.name} preview ${idx + 1}`}
                      style={{ height: '360px', width: 'auto', objectFit: 'cover' }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* About This App */}
            <div style={{ marginBottom: '36px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '12px', color: '#0F172A' }}>
                About this {product.isWebApp ? 'web application' : product.isGame ? 'game' : 'app'}
              </h2>
              <p style={{ fontSize: '15px', color: '#334155', lineHeight: '1.7', whiteSpace: 'pre-line' }}>
                {product.description}
              </p>
            </div>

            {/* Features Checklist */}
            <div style={{ marginBottom: '36px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '14px', color: '#0F172A' }}>
                Features
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {product.features && product.features.map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '14.5px', color: '#334155' }}>
                    <CheckCircle2 size={18} color="#16A34A" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* What's New */}
            <div style={{ marginBottom: '36px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: '#0F172A' }}>
                  What's New
                </h2>
              </div>
              <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '18px', marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: '#0F172A' }}>
                    Version {product.version} (Latest Build)
                  </span>
                  <span style={{ fontSize: '12.5px', color: '#64748B' }}>
                    {product.updatedDate}
                  </span>
                </div>
                <p style={{ fontSize: '13.5px', color: '#475569', lineHeight: '1.5', margin: 0 }}>
                  {product.releaseNotes || (versions.length > 0 && versions[0].releaseNotes) || 'Performance optimizations, enhanced responsiveness, and security updates.'}
                </p>
              </div>

              {/* Version History List */}
              {versions.length > 1 && (
                <div style={{ marginTop: '16px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#475569', marginBottom: '10px' }}>
                    Previous Releases History ({versions.length} versions)
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {versions.map(v => (
                      <div
                        key={v.id || v.version}
                        style={{
                          backgroundColor: v.isLatest ? '#EFF6FF' : '#FFFFFF',
                          border: `1px solid ${v.isLatest ? '#BFDBFE' : '#E2E8F0'}`,
                          borderRadius: '10px',
                          padding: '12px 16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: '10px'
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                            <strong style={{ fontSize: '13.5px', color: '#0F172A' }}>Version {v.version}</strong>
                            {v.isLatest && <span className="badge badge-accent" style={{ fontSize: '10px' }}>Latest</span>}
                            <span style={{ fontSize: '12px', color: '#64748B' }}>· {v.releaseDate} · {v.fileSize}</span>
                          </div>
                          <div style={{ fontSize: '12.5px', color: '#475569' }}>
                            {v.releaseNotes || 'Maintenance updates and bug fixes.'}
                          </div>
                        </div>

                        {isAuthenticated ? (
                          <a
                            href={`/api/products/${product.id}/download-package?token=${encodeURIComponent(token)}`}
                            download={`${product.slug}-v${v.version}.apk`}
                            className="btn btn-outline btn-sm"
                            style={{ fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <Download size={13} /> APK
                          </a>
                        ) : (
                          <button
                            type="button"
                            onClick={() => requireAuth(() => setShowDownloadModal(true), {
                              tab: 'register',
                              prompt: `Create an account or sign in to download ${product.name} (v${v.version}).`
                            })}
                            className="btn btn-outline btn-sm"
                            style={{ fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <Lock size={12} /> APK
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Data Safety Section (Google Play Console Style) */}
            <div style={{ marginBottom: '36px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={20} color="#2563EB" /> Data Safety
                </h2>
              </div>
              <div style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '16px',
                padding: '22px',
                boxShadow: 'var(--shadow-xs)'
              }}>
                <p style={{ fontSize: '13px', color: '#64748B', lineHeight: '1.6', marginBottom: '18px' }}>
                  Safety starts with understanding how developers collect and share your data. Data privacy and security practices may vary based on your use, region, and age.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{ width: '34px', height: '34px', borderRadius: '10px', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Lock size={16} color="#2563EB" />
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '700', color: '#0F172A' }}>Data is encrypted in transit</div>
                      <div style={{ fontSize: '12.5px', color: '#64748B' }}>Your data is transferred over a secure, encrypted HTTPS/TLS connection</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{ width: '34px', height: '34px', borderRadius: '10px', backgroundColor: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <CheckCircle2 size={16} color="#16A34A" />
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '700', color: '#0F172A' }}>You can request that data be deleted</div>
                      <div style={{ fontSize: '12.5px', color: '#64748B' }}>The developer provides an accessible way for users to request data deletion</div>
                    </div>
                  </div>

                  {product.dataSafety && product.dataSafety.collectedTypes && product.dataSafety.collectedTypes.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <div style={{ width: '34px', height: '34px', borderRadius: '10px', backgroundColor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Layers size={16} color="#475569" />
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '700', color: '#0F172A' }}>Data collected or processed</div>
                        <div style={{ fontSize: '12.5px', color: '#64748B' }}>{product.dataSafety.collectedTypes.join(' · ')}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Developer Card */}
            <div style={{ marginBottom: '40px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '14px', color: '#0F172A' }}>
                Developer
              </h2>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '20px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '16px',
                boxShadow: 'var(--shadow-xs)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <img
                    src={publisher ? publisher.avatar : '/assets/publishers/tobiyastudio.svg'}
                    alt=""
                    style={{ width: '48px', height: '48px', borderRadius: '12px' }}
                  />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '16px', fontWeight: '700', color: '#0F172A' }}>
                        {publisher ? publisher.name : product.developerName}
                      </span>
                      <span className="badge badge-accent" style={{ fontSize: '11px' }}>
                        Verified
                      </span>
                    </div>
                    <p style={{ fontSize: '13px', color: '#64748B' }}>
                      {publisher ? publisher.tagline : 'Building useful digital products.'}
                    </p>
                  </div>
                </div>

                <Link
                  to={`/publishers/${publisher ? publisher.slug : 'tobiyastudio'}`}
                  className="btn btn-outline btn-sm"
                >
                  View Publisher Profile →
                </Link>
              </div>
            </div>

            {/* Security & Permissions Audit Badge */}
            <SecurityBadge product={product} />

            {/* Interactive User Ratings & Reviews Section */}
            <div id="reviews-section">
              <ReviewSection
                product={product}
                onRatingUpdated={(newRating, newCount) => {
                  setData(prev => prev ? ({
                    ...prev,
                    product: { ...prev.product, rating: newRating, reviewCount: newCount }
                  }) : prev);
                }}
              />
            </div>

            {/* Related Products */}
            {related.length > 0 && (
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '16px', color: '#0F172A' }}>
                  Related Products
                </h2>
                <div className="grid-2">
                  {related.map(relProduct => (
                    <ProductCard key={relProduct.id} product={relProduct} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Sidebar (Download, Versions, Info) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Download for Android / Launch Box */}
            <div style={{
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '18px',
              padding: '24px',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A', marginBottom: '14px' }}>
                {product.isWebApp ? 'Web Access' : 'Download for Android'}
              </h3>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <img src={product.icon} alt="" style={{ width: '40px', height: '40px', borderRadius: '10px' }} />
                <div>
                  <div style={{ fontSize: '15px', fontWeight: '700', color: '#0F172A' }}>
                    Version {product.version}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748B' }}>
                    {product.fileSize} · Updated {product.updatedDate}
                  </div>
                </div>
              </div>

              {product.isWebApp && product.webUrl ? (
                <a
                  href={product.webUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-block btn-lg"
                  style={{ marginBottom: '14px' }}
                >
                  <Globe size={18} /> Open Web App →
                </a>
              ) : (
                <button
                  onClick={handleOpenDownload}
                  className="btn btn-primary btn-block btn-lg"
                  id="sidebar-download-apk-btn"
                  style={{ marginBottom: '14px' }}
                >
                  <Download size={18} /> Download APK
                </button>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12.5px', color: '#475569' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={16} color="#16A34A" /> Free & verified direct download
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={16} color="#2563EB" /> Free account download access
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Smartphone size={16} color="#475569" /> Works completely offline
                </span>
              </div>

              {/* Version History List */}
              {versions.length > 0 && (
                <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #E2E8F0' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '10px' }}>
                    Version History
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {versions.map(v => (
                      <div
                        key={v.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontSize: '12.5px',
                          padding: '6px 0',
                          borderBottom: '1px solid #F1F5F9'
                        }}
                      >
                        <div>
                          <strong style={{ color: '#0F172A' }}>{v.version}</strong>
                          {v.isLatest && (
                            <span className="badge badge-accent" style={{ marginLeft: '6px', fontSize: '10px' }}>Latest</span>
                          )}
                          <div style={{ fontSize: '11px', color: '#94A3B8' }}>{v.releaseDate}</div>
                        </div>
                        <button
                          onClick={handleOpenDownload}
                          style={{ color: '#2563EB', fontWeight: '600', fontSize: '12px', background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                          Get APK
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Direct Mobile Phone QR Code Scanner Card */}
            <QRCodeWidget product={product} />

            {/* Information Card */}
            <div style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '18px',
              padding: '24px',
              boxShadow: 'var(--shadow-xs)'
            }}>
              <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0F172A', marginBottom: '14px' }}>
                Product Information
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B' }}>Version</span>
                  <span style={{ fontWeight: '600', color: '#0F172A' }}>{product.version}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B' }}>Updated</span>
                  <span style={{ fontWeight: '600', color: '#0F172A' }}>{product.updatedDate}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B' }}>Platform</span>
                  <span style={{ fontWeight: '600', color: '#0F172A' }}>{product.platform}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B' }}>Category</span>
                  <span style={{ fontWeight: '600', color: '#0F172A' }}>{product.category}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B' }}>Package ID</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11.5px', color: '#0F172A' }}>{product.packageId}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B' }}>Requirements</span>
                  <span style={{ fontWeight: '600', color: '#0F172A' }}>{product.minRequirement}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B' }}>Content Rating</span>
                  <span style={{ fontWeight: '600', color: '#0F172A' }}>{product.contentRating}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid #F1F5F9' }}>
                  <span style={{ color: '#64748B' }}>Privacy</span>
                  <a href={product.privacyPolicyUrl} target="_blank" rel="noreferrer" style={{ color: '#2563EB', fontWeight: '600' }}>
                    Policy Link →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Screenshot Lightbox Modal */}
      {selectedScreenshot && (
        <div
          onClick={() => setSelectedScreenshot(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '24px'
          }}
        >
          <img
            src={selectedScreenshot}
            alt=""
            style={{ maxHeight: '88vh', maxWidth: '90vw', borderRadius: '24px', boxShadow: 'var(--shadow-xl)' }}
          />
        </div>
      )}

      {/* Download Modal */}
      {showDownloadModal && (
        <DownloadModal
          product={product}
          versions={versions}
          onClose={() => setShowDownloadModal(false)}
        />
      )}
    </div>
  );
}
