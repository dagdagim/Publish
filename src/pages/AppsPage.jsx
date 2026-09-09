import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Smartphone,
  Download,
  Star,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Award,
  Layers,
  ArrowUpDown,
  CheckCircle2,
  Package,
  Clock,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import DownloadModal from '../components/DownloadModal';
import { useAuth } from '../context/AuthContext';

const APP_CATEGORIES = [
  { id: 'All', label: 'All Android Apps' },
  { id: 'Productivity', label: 'Productivity' },
  { id: 'Business', label: 'Business' },
  { id: 'Utilities', label: 'Utilities & Tools' },
  { id: 'Finance', label: 'Finance' },
  { id: 'Health & Fitness', label: 'Health & Fitness' },
  { id: 'Education', label: 'Education' },
  { id: 'Agriculture', label: 'Agriculture' },
  { id: 'AI & Technology', label: 'AI & Tools' }
];

export default function AppsPage() {
  const { requireAuth } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [chartTab, setChartTab] = useState('popular'); // 'popular' | 'topRated' | 'newest' | 'smallest'
  const [sizeFilter, setSizeFilter] = useState('all'); // 'all' | 'under20' | '20to50' | 'over50'
  const [minRatingFilter, setMinRatingFilter] = useState(0); // 0 | 4.0 | 4.5
  const [searchQuery, setSearchQuery] = useState('');
  const [downloadModalProduct, setDownloadModalProduct] = useState(null);

  const handleDownloadApp = (app) => {
    requireAuth(() => {
      setDownloadModalProduct(app);
    }, {
      tab: 'register',
      prompt: `Create a free account or log in to download ${app.name} APK.`
    });
  };

  const parseSizeMB = (sizeStr) => {
    if (!sizeStr) return 0;
    const match = String(sizeStr).match(/([\d.]+)\s*(MB|GB|KB|B)/i);
    if (!match) return 0;
    const val = parseFloat(match[1]);
    const unit = match[2].toUpperCase();
    if (unit === 'GB') return val * 1024;
    if (unit === 'MB') return val;
    if (unit === 'KB') return val / 1024;
    return val / (1024 * 1024);
  };

  useEffect(() => {
    setLoading(true);
    let url = `/api/products?platform=Android&limit=100`;
    if (chartTab === 'popular') url += '&sort=popular';
    else if (chartTab === 'topRated') url += '&sort=rating';
    else if (chartTab === 'newest') url += '&sort=newest';
    else if (chartTab === 'smallest') url += '&sort=size_asc';

    if (selectedCategory !== 'All') {
      url += `&category=${encodeURIComponent(selectedCategory)}`;
    }

    fetch(url)
      .then(res => res.json())
      .then(data => {
        // Filter out pure games from Android Apps Catalog
        const appsOnly = (data.products || []).filter(p => !p.isGame && p.category.toLowerCase() !== 'games');
        setProducts(appsOnly);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load apps:', err);
        setLoading(false);
      });
  }, [selectedCategory, chartTab]);

  // Client-side search and advanced multi-dimensional filtering within apps catalog
  const filteredApps = products.filter(app => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const match = (
        app.name.toLowerCase().includes(q) ||
        app.shortDescription.toLowerCase().includes(q) ||
        app.category.toLowerCase().includes(q) ||
        (app.tags && app.tags.some(t => t.toLowerCase().includes(q)))
      );
      if (!match) return false;
    }

    if (minRatingFilter > 0 && (app.rating || 5.0) < minRatingFilter) {
      return false;
    }

    const sizeMB = parseSizeMB(app.fileSize);
    if (sizeFilter === 'under20' && sizeMB > 20) return false;
    if (sizeFilter === '20to50' && (sizeMB < 20 || sizeMB > 50)) return false;
    if (sizeFilter === 'over50' && sizeMB <= 50) return false;

    return true;
  });

  // Top 4 Ranked Apps for Chart Spotlight
  const topRankedApps = filteredApps.slice(0, 4);

  return (
    <div style={{ backgroundColor: '#F8FAFC', minHeight: '100vh', paddingBottom: '80px' }}>
      {/* Top Banner / Store Header */}
      <section style={{
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 60%, #1E3A8A 100%)',
        color: '#FFFFFF',
        padding: '50px 0 40px',
        borderBottom: '1px solid #334155'
      }}>
        <div className="container">
          <div style={{ maxWidth: '800px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'rgba(37, 99, 235, 0.25)',
              border: '1px solid rgba(147, 197, 253, 0.3)',
              padding: '6px 14px',
              borderRadius: '9999px',
              color: '#93C5FD',
              fontSize: '12.5px',
              fontWeight: '700',
              marginBottom: '16px'
            }}>
              <Smartphone size={15} /> Official Android App Store
            </div>

            <h1 style={{ fontSize: '36px', fontWeight: '800', letterSpacing: '-0.02em', marginBottom: '12px', lineHeight: 1.2 }}>
              Android Applications Catalog
            </h1>
            <p style={{ fontSize: '16px', color: '#94A3B8', lineHeight: '1.6', marginBottom: '24px' }}>
              Explore high-performance native Android applications, utilities, and productivity software. Every APK is verified safe, scanned for integrity, and downloadable directly without account locks.
            </p>

            {/* Quality Guarantees */}
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '13px', color: '#CBD5E1' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={16} color="#34D399" /> 100% Malware Free & Signed
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Package size={16} color="#60A5FA" /> Real APK Packages
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={16} color="#FBBF24" /> Direct APK Downloads
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container" style={{ paddingTop: '32px' }}>
        {/* Filter Controls Bar */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          padding: '18px 24px',
          border: '1px solid #E2E8F0',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          {/* Chart View Tabs */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { id: 'popular', label: 'Top Free & Popular', icon: <TrendingUp size={15} /> },
              { id: 'topRated', label: 'Highest Rated (4.5+ ★)', icon: <Star size={15} /> },
              { id: 'smallest', label: 'Lightweight APKs', icon: <Smartphone size={15} /> },
              { id: 'newest', label: 'New Releases', icon: <Sparkles size={15} /> }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setChartTab(tab.id)}
                className={`btn btn-sm ${chartTab === tab.id ? 'btn-primary' : 'btn-outline'}`}
                style={{ borderRadius: '10px', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Quick Search */}
          <div style={{ position: 'relative', minWidth: '260px' }}>
            <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search Android apps..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-control"
              style={{ paddingLeft: '36px', height: '40px', fontSize: '13.5px', borderRadius: '10px' }}
            />
          </div>
        </div>

        {/* Secondary Filter Row: File Size & Minimum Rating */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '20px',
          padding: '12px 18px',
          backgroundColor: '#F1F5F9',
          borderRadius: '12px'
        }}>
          {/* File Size Filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#475569', marginRight: '4px' }}>File Size:</span>
            {[
              { id: 'all', label: 'All Sizes' },
              { id: 'under20', label: '< 20 MB' },
              { id: '20to50', label: '20 - 50 MB' },
              { id: 'over50', label: '50 MB+' }
            ].map(sf => (
              <button
                key={sf.id}
                onClick={() => setSizeFilter(sf.id)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '8px',
                  fontSize: '11.5px',
                  fontWeight: sizeFilter === sf.id ? '700' : '500',
                  backgroundColor: sizeFilter === sf.id ? '#2563EB' : '#FFFFFF',
                  color: sizeFilter === sf.id ? '#FFFFFF' : '#475569',
                  border: `1px solid ${sizeFilter === sf.id ? '#2563EB' : '#CBD5E1'}`,
                  cursor: 'pointer'
                }}
              >
                {sf.label}
              </button>
            ))}
          </div>

          {/* Rating Filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#475569', marginRight: '4px' }}>Rating:</span>
            {[
              { val: 0, label: 'All' },
              { val: 4.0, label: '4.0+ ★' },
              { val: 4.5, label: '4.5+ ★' }
            ].map(rf => (
              <button
                key={rf.val}
                onClick={() => setMinRatingFilter(rf.val)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '8px',
                  fontSize: '11.5px',
                  fontWeight: minRatingFilter === rf.val ? '700' : '500',
                  backgroundColor: minRatingFilter === rf.val ? '#F59E0B' : '#FFFFFF',
                  color: minRatingFilter === rf.val ? '#FFFFFF' : '#475569',
                  border: `1px solid ${minRatingFilter === rf.val ? '#F59E0B' : '#CBD5E1'}`,
                  cursor: 'pointer'
                }}
              >
                {rf.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category Filter Pills */}
        <div style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '16px',
          marginBottom: '32px',
          scrollbarWidth: 'thin'
        }}>
          {APP_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                backgroundColor: selectedCategory === cat.id ? '#2563EB' : '#FFFFFF',
                color: selectedCategory === cat.id ? '#FFFFFF' : '#475569',
                border: `1px solid ${selectedCategory === cat.id ? '#2563EB' : '#E2E8F0'}`,
                padding: '8px 18px',
                borderRadius: '9999px',
                fontSize: '13px',
                fontWeight: selectedCategory === cat.id ? '700' : '500',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                boxShadow: selectedCategory === cat.id ? '0 2px 4px rgba(37,99,235,0.2)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Top Charts Leaderboard (Play Store Style Top List) */}
        {!searchQuery && selectedCategory === 'All' && topRankedApps.length > 0 && (
          <div style={{ marginBottom: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={20} color="#2563EB" />
                <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A' }}>
                  Top Chart Rankings
                </h2>
              </div>
              <span style={{ fontSize: '13px', color: '#64748B', fontWeight: '500' }}>
                Updated today • Verified APKs
              </span>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '16px'
            }}>
              {topRankedApps.map((app, index) => (
                <div
                  key={app.id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    padding: '16px',
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    boxShadow: 'var(--shadow-xs)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {/* Rank Badge */}
                  <div style={{
                    fontSize: '18px',
                    fontWeight: '800',
                    color: index === 0 ? '#D97706' : index === 1 ? '#475569' : index === 2 ? '#B45309' : '#94A3B8',
                    width: '24px',
                    textAlign: 'center',
                    flexShrink: 0
                  }}>
                    #{index + 1}
                  </div>

                  {/* App Icon */}
                  <img
                    src={app.icon}
                    alt=""
                    style={{ width: '56px', height: '56px', borderRadius: '14px', border: '1px solid #E2E8F0', flexShrink: 0, objectFit: 'cover' }}
                    onError={(e) => { e.currentTarget.src = '/assets/icons/kpi-tracker.svg'; }}
                  />

                  {/* App Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Link to={`/product/${app.slug}`} style={{ textDecoration: 'none' }}>
                      <h4 style={{
                        fontSize: '14.5px',
                        fontWeight: '700',
                        color: '#0F172A',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        marginBottom: '3px'
                      }}>
                        {app.name}
                      </h4>
                    </Link>
                    <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px' }}>
                      {app.category} • {app.fileSize}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#0F172A', fontWeight: '600' }}>
                      <Star size={13} fill="#F59E0B" color="#F59E0B" />
                      <span>{Number(app.rating).toFixed(1)}</span>
                      <span style={{ color: '#94A3B8', fontWeight: '400' }}>({app.reviewCount})</span>
                    </div>
                  </div>

                  {/* Quick Download Button */}
                  <button
                    onClick={() => handleDownloadApp(app)}
                    className="btn btn-primary btn-sm"
                    style={{
                      borderRadius: '10px',
                      padding: '8px 12px',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      flexShrink: 0
                    }}
                    title={`Download ${app.name} APK`}
                  >
                    <Download size={14} /> Get APK
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A' }}>
              {selectedCategory === 'All' ? 'All Verified Android Apps' : `${selectedCategory} Apps`}
            </h2>
            <p style={{ fontSize: '13.5px', color: '#64748B' }}>
              Showing {filteredApps.length} applications
            </p>
          </div>
        </div>

        {/* App Grid */}
        {loading ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: '#64748B' }}>
            <div style={{ display: 'inline-block', width: '28px', height: '28px', border: '3px solid #E2E8F0', borderTopColor: '#2563EB', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '12px' }} />
            <div>Loading verified Android applications...</div>
          </div>
        ) : filteredApps.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '20px'
          }}>
            {filteredApps.map(app => (
              <div
                key={app.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px solid #E2E8F0',
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: 'var(--shadow-xs)',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                }}
                className="app-catalog-card"
              >
                <div>
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <img
                      src={app.icon}
                      alt={app.name}
                      style={{ width: '56px', height: '56px', borderRadius: '14px', border: '1px solid #E2E8F0', objectFit: 'cover', flexShrink: 0 }}
                      onError={(e) => { e.currentTarget.src = '/assets/icons/kpi-tracker.svg'; }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Link to={`/product/${app.slug}`} style={{ textDecoration: 'none' }}>
                        <h3 style={{ fontSize: '15.5px', fontWeight: '700', color: '#0F172A', lineHeight: 1.3, marginBottom: '4px' }}>
                          {app.name}
                        </h3>
                      </Link>
                      <div style={{ fontSize: '12px', color: '#64748B' }}>
                        {app.developerName}
                      </div>
                    </div>
                  </div>

                  <p style={{
                    fontSize: '13px',
                    color: '#475569',
                    lineHeight: '1.5',
                    marginBottom: '14px',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {app.shortDescription}
                  </p>
                </div>

                {/* Card Footer with Details & Download */}
                <div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '12px',
                    borderTop: '1px solid #F1F5F9',
                    marginBottom: '12px',
                    fontSize: '12.5px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '700', color: '#0F172A' }}>
                      <Star size={14} fill="#F59E0B" color="#F59E0B" />
                      <span>{Number(app.rating).toFixed(1)}</span>
                    </div>

                    <span style={{
                      backgroundColor: '#EFF6FF',
                      color: '#1D4ED8',
                      fontWeight: '700',
                      fontSize: '11px',
                      padding: '2px 8px',
                      borderRadius: '6px'
                    }}>
                      {app.fileSize}
                    </span>

                    <span style={{ color: '#64748B', fontSize: '11.5px' }}>
                      v{app.version}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <Link
                      to={`/product/${app.slug}`}
                      className="btn btn-outline btn-sm"
                      style={{ textAlign: 'center', fontSize: '12px', borderRadius: '8px' }}
                    >
                      Details
                    </Link>
                    <button
                      onClick={() => handleDownloadApp(app)}
                      className="btn btn-primary btn-sm"
                      style={{
                        borderRadius: '8px',
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px'
                      }}
                    >
                      <Download size={13} /> APK
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E2E8F0'
          }}>
            <Package size={36} color="#94A3B8" style={{ marginBottom: '12px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
              No Android apps found
            </h3>
            <p style={{ color: '#64748B', fontSize: '13.5px', marginBottom: '16px' }}>
              Try searching with another keyword or pick a different category.
            </p>
            <button
              onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
              className="btn btn-secondary btn-sm"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Direct APK Download Modal */}
      {downloadModalProduct && (
        <DownloadModal
          product={downloadModalProduct}
          onClose={() => setDownloadModalProduct(null)}
        />
      )}
    </div>
  );
}
