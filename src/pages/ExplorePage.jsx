import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  Sparkles,
  TrendingUp,
  Award,
  Layers,
  Star,
  Download,
  ExternalLink,
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe,
  Gamepad2,
  Smartphone,
  Cpu,
  Heart,
  Briefcase,
  GraduationCap
} from 'lucide-react';
import ProductCard from '../components/ProductCard';

export default function ExplorePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [collections, setCollections] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [publishers, setPublishers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch('/api/products?limit=20').then(r => r.json()),
      fetch('/api/collections').then(r => r.json())
    ])
      .then(([prodData, colData]) => {
        const all = prodData.products || [];
        setFeaturedProducts(all.slice(0, 8));
        // Sort by download count for trending
        const sorted = [...all].sort((a, b) => (b.downloadCount || 0) - (a.downloadCount || 0));
        setTrendingProducts(sorted.slice(0, 5));
        setCollections(colData.collections || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load explore data:', err);
        setLoading(false);
      });
  }, []);

  // Spotlight App of the week
  const spotlightApp = featuredProducts.find(p => p.coverImage && (p.slug.includes('football') || p.slug.includes('photo') || p.slug.includes('crypto'))) || featuredProducts[0] || {
    name: 'Football Quiz Pro',
    slug: 'football-quiz-pro',
    shortDescription: 'Ultimate football trivia with 2,500+ real-time questions, league challenges, and offline tournament modes.',
    category: 'Games',
    platform: 'Android',
    rating: 4.8,
    reviewCount: 428,
    fileSize: '24.5 MB',
    coverImage: '/assets/screenshots/football-quiz-1.svg',
    icon: '/assets/icons/football-quiz.svg'
  };

  return (
    <div style={{ backgroundColor: '#F8FAFC', minHeight: '100vh', paddingBottom: '90px' }}>
      {/* Editorial Hero Spotlight */}
      <section style={{
        background: 'linear-gradient(135deg, #1E1B4B 0%, #0F172A 60%, #0284C7 100%)',
        color: '#FFFFFF',
        padding: '50px 0 60px',
        position: 'relative',
        overflow: 'hidden',
        borderBottom: '1px solid #334155'
      }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38BDF8', fontSize: '13px', fontWeight: '700', marginBottom: '14px' }}>
            <Compass size={16} /> Editorial Discovery & Curated Showcase
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '40px',
            alignItems: 'center'
          }}>
            <div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'rgba(56, 189, 248, 0.2)',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '11.5px',
                fontWeight: '700',
                color: '#7DD3FC',
                marginBottom: '14px'
              }}>
                <Award size={13} /> Staff Pick of the Week
              </div>

              <h1 style={{ fontSize: '38px', fontWeight: '800', letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: '16px', color: '#FFFFFF' }}>
                {spotlightApp.name}
              </h1>

              <p style={{ fontSize: '16px', color: '#CBD5E1', lineHeight: '1.6', marginBottom: '24px', maxWidth: '540px' }}>
                {spotlightApp.shortDescription}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', fontWeight: '700' }}>
                  <Star size={16} fill="#F59E0B" color="#F59E0B" />
                  <span>{Number(spotlightApp.rating).toFixed(1)}</span>
                  <span style={{ color: '#94A3B8', fontWeight: '400', fontSize: '12px' }}>
                    ({spotlightApp.reviewCount} reviews)
                  </span>
                </div>

                <span style={{ backgroundColor: 'rgba(255,255,255,0.12)', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>
                  {spotlightApp.category}
                </span>

                <span style={{ backgroundColor: 'rgba(56, 189, 248, 0.2)', color: '#7DD3FC', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '700' }}>
                  {spotlightApp.fileSize}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                <Link
                  to={`/product/${spotlightApp.slug}`}
                  className="btn btn-primary btn-lg"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px' }}
                >
                  <Download size={18} /> View & Install App
                </Link>
                <Link
                  to="/collections"
                  className="btn btn-outline btn-lg"
                  style={{ borderColor: 'rgba(255,255,255,0.3)', color: '#FFFFFF' }}
                >
                  Browse All Collections
                </Link>
              </div>
            </div>

            {/* Spotlight Visual Card */}
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '24px',
              padding: '24px',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                <img
                  src={spotlightApp.icon}
                  alt=""
                  style={{ width: '68px', height: '68px', borderRadius: '18px', border: '2px solid rgba(255,255,255,0.2)' }}
                  onError={(e) => { e.currentTarget.src = '/assets/icons/football-quiz.svg'; }}
                />
                <div>
                  <div style={{ fontSize: '18px', fontWeight: '800' }}>{spotlightApp.name}</div>
                  <div style={{ fontSize: '13px', color: '#94A3B8' }}>{spotlightApp.platform} Verified Build</div>
                </div>
              </div>

              <div style={{
                borderRadius: '16px',
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.1)',
                height: '200px',
                backgroundColor: '#0F172A',
                position: 'relative'
              }}>
                <img
                  src={(spotlightApp.screenshots && spotlightApp.screenshots[0]) || '/assets/screenshots/football-quiz-1.svg'}
                  alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => { e.currentTarget.src = '/assets/screenshots/football-quiz-1.svg'; }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Explore Content */}
      <div className="container" style={{ paddingTop: '40px' }}>
        {/* Category Portals Grid */}
        <div style={{ marginBottom: '48px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <div>
              <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0F172A' }}>
                Explore by Platform & Category
              </h2>
              <p style={{ fontSize: '13.5px', color: '#64748B' }}>
                Fast portals into our curated ecosystem
              </p>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px'
          }}>
            {[
              { title: 'Android Apps', desc: 'Native APKs & Tools', to: '/apps', icon: <Smartphone size={22} color="#2563EB" />, badge: 'Store Catalog' },
              { title: 'Indie Games', desc: 'Trivia, Action & Casual', to: '/games', icon: <Gamepad2 size={22} color="#D97706" />, badge: '9 Games' },
              { title: 'Web Apps', desc: 'No-install browser suites', to: '/web', icon: <Globe size={22} color="#059669" />, badge: 'Live SaaS' },
              { title: 'Curated Collections', desc: 'Handpicked themes', to: '/collections', icon: <Layers size={22} color="#7C3AED" />, badge: '6 Shelves' }
            ].map((portal, idx) => (
              <Link
                key={idx}
                to={portal.to}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  padding: '20px',
                  border: '1px solid #E2E8F0',
                  textDecoration: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: 'var(--shadow-xs)',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                }}
                className="category-portal-card"
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      backgroundColor: '#F8FAFC',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid #E2E8F0'
                    }}>
                      {portal.icon}
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', backgroundColor: '#F1F5F9', padding: '3px 8px', borderRadius: '6px' }}>
                      {portal.badge}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0F172A', marginBottom: '4px' }}>
                    {portal.title}
                  </h3>
                  <p style={{ fontSize: '12.5px', color: '#64748B' }}>
                    {portal.desc}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#2563EB', fontSize: '12px', fontWeight: '600', marginTop: '16px' }}>
                  Explore Now <ArrowRight size={13} />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Curated Collections Shelf */}
        {collections.length > 0 && (
          <div style={{ marginBottom: '56px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div>
                <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0F172A' }}>
                  Curated Editorial Collections
                </h2>
                <p style={{ fontSize: '13.5px', color: '#64748B' }}>
                  Thematic anthologies organized by workflow, utility, and excellence
                </p>
              </div>
              <Link to="/collections" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13.5px', color: '#2563EB', fontWeight: '700', textDecoration: 'none' }}>
                View All <ArrowRight size={14} />
              </Link>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '20px'
            }}>
              {collections.slice(0, 3).map(col => (
                <Link
                  key={col.id}
                  to={`/collections/${col.slug}`}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '18px',
                    border: '1px solid #E2E8F0',
                    padding: '24px',
                    textDecoration: 'none',
                    boxShadow: 'var(--shadow-xs)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <span style={{
                      backgroundColor: '#EFF6FF',
                      color: '#1D4ED8',
                      fontSize: '11.5px',
                      fontWeight: '800',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      display: 'inline-block',
                      marginBottom: '12px'
                    }}>
                      {col.badge || 'Curated'}
                    </span>
                    <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', marginBottom: '6px' }}>
                      {col.name}
                    </h3>
                    <p style={{ fontSize: '13px', color: '#64748B', lineHeight: '1.5', marginBottom: '18px' }}>
                      {col.description}
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '14px', borderTop: '1px solid #F1F5F9', fontSize: '12.5px' }}>
                    <span style={{ color: '#475569', fontWeight: '600' }}>
                      {col.productIds ? col.productIds.length : 4} Featured Apps
                    </span>
                    <span style={{ color: '#2563EB', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      Open Shelf <ArrowRight size={13} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Trending Software Leaderboard & Discoveries */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', marginBottom: '56px' }}>
          {/* Trending Leaderboard */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
              <TrendingUp size={20} color="#2563EB" />
              <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A' }}>
                Trending This Week
              </h2>
            </div>

            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              border: '1px solid #E2E8F0',
              padding: '8px',
              boxShadow: 'var(--shadow-xs)'
            }}>
              {trendingProducts.map((p, idx) => (
                <Link
                  key={p.id}
                  to={`/product/${p.slug}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    textDecoration: 'none',
                    borderBottom: idx < trendingProducts.length - 1 ? '1px solid #F1F5F9' : 'none',
                    transition: 'background-color 0.15s ease'
                  }}
                  className="trending-list-item"
                >
                  <div style={{
                    fontSize: '16px',
                    fontWeight: '800',
                    color: idx === 0 ? '#D97706' : idx === 1 ? '#475569' : '#94A3B8',
                    width: '24px',
                    textAlign: 'center'
                  }}>
                    {String(idx + 1).padStart(2, '0')}
                  </div>

                  <img
                    src={p.icon}
                    alt=""
                    style={{ width: '46px', height: '46px', borderRadius: '12px', border: '1px solid #E2E8F0', objectFit: 'cover' }}
                    onError={(e) => { e.currentTarget.src = '/assets/icons/kpi-tracker.svg'; }}
                  />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '14.5px', fontWeight: '700', color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {p.name}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748B' }}>
                      {p.category} • {p.platform}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '12.5px', fontWeight: '700', color: '#0F172A' }}>
                      <Star size={13} fill="#F59E0B" color="#F59E0B" />
                      {Number(p.rating).toFixed(1)}
                    </div>
                    <div style={{ fontSize: '11px', color: '#94A3B8' }}>
                      {p.downloadCount || 0} installs
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Developer Studio Spotlight */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
              <Sparkles size={20} color="#D97706" />
              <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A' }}>
                Featured Developer Studios
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { name: 'TobiyaStudio', slug: 'tobiyastudio', tagline: 'Engineering fast, distraction-free digital experiences.', apps: '12 Applications', verified: true },
                { name: 'Apex Labs', slug: 'apex-labs', tagline: 'High-performance engineering & developer tooling.', apps: '4 Applications', verified: true },
                { name: 'MindForge', slug: 'mindforge', tagline: 'Next-generation educational & financial intelligence.', apps: '3 Applications', verified: true }
              ].map(pub => (
                <Link
                  key={pub.slug}
                  to={`/publishers/${pub.slug}`}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    border: '1px solid #E2E8F0',
                    padding: '18px 20px',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: 'var(--shadow-xs)'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                      <span style={{ fontSize: '15px', fontWeight: '700', color: '#0F172A' }}>{pub.name}</span>
                      {pub.verified && <ShieldCheck size={15} color="#2563EB" />}
                    </div>
                    <p style={{ fontSize: '12.5px', color: '#64748B', marginBottom: '6px' }}>
                      {pub.tagline}
                    </p>
                    <span style={{ fontSize: '11.5px', color: '#2563EB', fontWeight: '600' }}>
                      {pub.apps}
                    </span>
                  </div>
                  <ArrowRight size={16} color="#94A3B8" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* All Products Grid Showcase */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0F172A' }}>
                Recently Discovered Software
              </h2>
              <p style={{ fontSize: '13.5px', color: '#64748B' }}>
                High quality mobile apps, tools, and interactive platforms
              </p>
            </div>
            <Link to="/apps" style={{ fontSize: '13.5px', color: '#2563EB', fontWeight: '700', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
              View Android Catalog <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748B' }}>
              Loading software showcase...
            </div>
          ) : (
            <div className="grid-4">
              {featuredProducts.map(prod => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
