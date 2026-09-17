import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, Download, ArrowRight, CheckSquare, GraduationCap, Briefcase, Heart, Coins, Sprout, Gamepad2, Film, Wrench, Cpu, Code2, Sparkles, TrendingUp, Layers } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { PhoneMockup, LaptopMockup } from '../components/DeviceMockup';
import DownloadModal from '../components/DownloadModal';
import { useAuth } from '../context/AuthContext';

export default function HomePage() {
  const { requireAuth } = useAuth();
  const [featuredData, setFeaturedData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingProduct, setDownloadingProduct] = useState(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/products/featured').then(r => r.json()),
      fetch('/api/categories').then(r => r.json()),
      fetch('/api/collections').then(r => r.json())
    ])
      .then(([featuredRes, catRes, colRes]) => {
        setFeaturedData(featuredRes);
        setCategories(catRes.categories || []);
        setCollections(colRes.collections || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading homepage data:', err);
        setLoading(false);
      });
  }, []);

  const categoryIcons = {
    'productivity': <CheckSquare size={20} color="#2563EB" />,
    'education': <GraduationCap size={20} color="#4F46E5" />,
    'business': <Briefcase size={20} color="#059669" />,
    'health-fitness': <Heart size={20} color="#DC2626" />,
    'finance': <Coins size={20} color="#D97706" />,
    'agriculture': <Sprout size={20} color="#16A34A" />,
    'games': <Gamepad2 size={20} color="#EA580C" />,
    'entertainment': <Film size={20} color="#7C3AED" />,
    'utilities': <Wrench size={20} color="#0284C7" />,
    'ai-technology': <Cpu size={20} color="#0D9488" />
  };

  const collectionIcons = {
    'best-productivity-apps': <TrendingUp size={22} color="#2563EB" />,
    'new-releases': <Sparkles size={22} color="#4F46E5" />,
    'games': <Gamepad2 size={22} color="#DC2626" />,
    'business-tools': <Briefcase size={22} color="#059669" />,
    'developer-picks': <Code2 size={22} color="#D97706" />,
    'featured-projects': <Layers size={22} color="#2563EB" />
  };

  if (loading || !featuredData) {
    return (
      <div style={{ padding: '80px 0', textAlign: 'center', color: '#64748B' }}>
        <div style={{ display: 'inline-block', width: '32px', height: '32px', border: '3px solid #E2E8F0', borderTopColor: '#2563EB', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '16px', fontSize: '14px' }}>Loading TobiyaStudio directory...</p>
      </div>
    );
  }

  const featured = featuredData.featuredProduct;

  return (
    <div>
      {/* 1. HERO SECTION */}
      <section style={{
        padding: '56px 0 64px',
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #F1F5F9'
      }}>
        <div className="container" style={{
          display: 'grid',
          gridTemplateColumns: '1.1fr 0.9fr',
          alignItems: 'center',
          gap: '48px'
        }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#EFF6FF',
              color: '#2563EB',
              padding: '4px 12px',
              borderRadius: '9999px',
              fontSize: '12.5px',
              fontWeight: '700',
              marginBottom: '20px',
              border: '1px solid #DBEAFE'
            }}>
              <span style={{ width: '6px', height: '6px', backgroundColor: '#2563EB', borderRadius: '50%' }} />
              Discover
            </div>

            <h1 style={{
              fontSize: '48px',
              fontWeight: '800',
              letterSpacing: '-0.03em',
              color: '#0F172A',
              lineHeight: '1.15',
              marginBottom: '18px'
            }}>
              Discover software <br />worth using.
            </h1>

            <p style={{
              fontSize: '17px',
              color: '#475569',
              lineHeight: '1.6',
              maxWidth: '520px',
              marginBottom: '32px'
            }}>
              Explore mobile apps, web applications, games and digital products — all in one curated place.
            </p>

            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              <Link to="/explore" className="btn btn-primary btn-lg" id="hero-explore-btn">
                Explore Products
              </Link>
              <Link to="/web" className="btn btn-secondary btn-lg" id="hero-webapps-btn">
                View Web Apps
              </Link>
            </div>
          </div>

          {/* Device Showcase (Phone showing KPI Tracker + Laptop showing Agribusiness Platform) */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            padding: '20px 0'
          }}>
            {/* Phone Mockup overlapping slightly */}
            <div style={{ zIndex: 2, marginRight: '-40px', marginTop: '30px' }}>
              <PhoneMockup
                src="/assets/screenshots/football-quiz-1.svg"
                title="Football Quiz"
                width={190}
              />
            </div>

            {/* Laptop Mockup */}
            <div style={{ zIndex: 1 }}>
              <LaptopMockup
                src="/assets/screenshots/agribusiness-1.svg"
                title="Agribusiness Platform"
                width={360}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. FEATURED SPOTLIGHT OR DEVELOPER SHOWCASE */}
      <section className="section" style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
        <div className="container">
          {featured ? (
            <div>
              <div className="section-header">
                <div>
                  <span style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#2563EB', display: 'block', marginBottom: '4px' }}>
                    Featured Spotlight
                  </span>
                  <h2 className="section-title">Featured Product</h2>
                </div>
                <Link to="/explore" className="section-link">
                  View all <ArrowRight size={15} />
                </Link>
              </div>

              <div style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '24px',
                padding: '36px',
                display: 'grid',
                gridTemplateColumns: '1fr 1.3fr',
                gap: '40px',
                alignItems: 'center',
                boxShadow: 'var(--shadow-sm)'
              }}>
                {/* Left Info Column */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '18px' }}>
                    <img
                      src={featured.icon || '/assets/icons/agrivoice.svg'}
                      alt={featured.name}
                      style={{ width: '64px', height: '64px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: 'var(--shadow-xs)', objectFit: 'cover' }}
                    />
                    <div>
                      <h3 style={{ fontSize: '26px', fontWeight: '800', color: '#0F172A', letterSpacing: '-0.02em' }}>
                        {featured.name}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13.5px', fontWeight: '700', color: '#0F172A' }}>
                          <Star size={15} fill="#F59E0B" color="#F59E0B" />
                          <span>{featured.rating || 5.0}</span>
                          <span style={{ color: '#94A3B8', fontWeight: '400' }}>({featured.reviewCount || 0} reviews)</span>
                        </div>
                        <span className="badge badge-platform">{featured.platform}</span>
                        <span className="badge badge-gray">{featured.category}</span>
                      </div>
                    </div>
                  </div>

                  <p style={{ fontSize: '15px', color: '#475569', lineHeight: '1.6', marginBottom: '24px' }}>
                    {featured.shortDescription || (featured.description ? featured.description.slice(0, 160) + '...' : 'Available on TobiyaStudio.')}
                  </p>

                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <Link to={`/product/${featured.slug}`} className="btn btn-primary" id="featured-view-btn">
                      View Product
                    </Link>
                    {featured.apkUrl && (
                      <button
                        onClick={() => requireAuth(() => setDownloadingProduct(featured), {
                          tab: 'register',
                          prompt: `Create an account or log in to download ${featured.name} APK.`
                        })}
                        className="btn btn-outline"
                        id="featured-download-btn"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                      >
                        <Download size={15} /> Download APK ({featured.fileSize || 'Package'})
                      </button>
                    )}
                  </div>
                </div>

                {/* Right Showcase */}
                <div style={{
                  display: 'flex',
                  gap: '16px',
                  justifyContent: 'center',
                  alignItems: 'center',
                  overflowX: 'auto',
                  padding: '10px 0'
                }}>
                  {(featured.screenshots && featured.screenshots.length > 0 ? featured.screenshots : [featured.coverImage || featured.icon]).slice(0, 3).map((sc, idx) => (
                    <PhoneMockup key={idx} src={sc} title={featured.name} width={idx === 1 ? 175 : 165} style={idx === 1 ? { transform: 'scale(1.04)', zIndex: 2 } : {}} />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '24px',
              padding: '48px 36px',
              textAlign: 'center',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                backgroundColor: '#EFF6FF',
                color: '#2563EB',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px'
              }}>
                <Sparkles size={28} />
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#0F172A', marginBottom: '8px' }}>
                Launch Your App on TobiyaStudio
              </h3>
              <p style={{ fontSize: '15px', color: '#64748B', maxWidth: '540px', margin: '0 auto 24px', lineHeight: '1.6' }}>
                Publish your Android APKs, web apps, or games directly to users with secure download gating and instant developer insights.
              </p>
              <Link to="/developer" className="btn btn-primary btn-lg">
                Publish an App Now <ArrowRight size={16} />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* 3. LATEST RELEASES */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">Latest Releases</h2>
              <p className="section-subtitle">Newly updated applications and tools available across platforms.</p>
            </div>
            <Link to="/explore" className="section-link">
              View all <ArrowRight size={15} />
            </Link>
          </div>

          {featuredData.latestReleases && featuredData.latestReleases.length > 0 ? (
            <div className="grid-4">
              {featuredData.latestReleases.slice(0, 4).map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div style={{ padding: '32px', textAlign: 'center', backgroundColor: '#F8FAFC', borderRadius: '16px', border: '1px dashed #CBD5E1' }}>
              <p style={{ color: '#64748B', fontSize: '14px', marginBottom: '12px' }}>No releases published yet in this category.</p>
              <Link to="/developer" className="btn btn-primary btn-sm">
                Publish an App
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* 4. POPULAR PRODUCTS */}
      <section className="section" style={{ backgroundColor: '#F8FAFC', borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0' }}>
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">Popular Products</h2>
              <p className="section-subtitle">Most downloaded and highest-rated tools by our community.</p>
            </div>
            <Link to="/explore?sort=popular" className="section-link">
              View all <ArrowRight size={15} />
            </Link>
          </div>

          {featuredData.popularProducts && featuredData.popularProducts.length > 0 ? (
            <div className="grid-4">
              {featuredData.popularProducts.slice(0, 4).map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div style={{ padding: '32px', textAlign: 'center', backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px dashed #CBD5E1' }}>
              <p style={{ color: '#64748B', fontSize: '14px', marginBottom: '12px' }}>Be the first developer to publish an app on TobiyaStudio.</p>
              <Link to="/developer" className="btn btn-primary btn-sm">
                Deploy an App
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* 5. BROWSE BY CATEGORY */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">Browse by Category</h2>
              <p className="section-subtitle">Find software tailored to your workflows, hobbies, and business needs.</p>
            </div>
          </div>

          <div className="grid-5">
            {categories.map(cat => (
              <Link
                key={cat.id}
                to={`/search?category=${encodeURIComponent(cat.name)}`}
                className="card card-interactive"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  padding: '24px 16px',
                  borderRadius: '16px'
                }}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: '#EFF6FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '14px'
                }}>
                  {categoryIcons[cat.slug] || <Layers size={20} color="#2563EB" />}
                </div>
                <h3 style={{ fontSize: '14.5px', fontWeight: '700', color: '#0F172A', marginBottom: '4px' }}>
                  {cat.name}
                </h3>
                <span style={{ fontSize: '12px', color: '#94A3B8' }}>
                  {cat.appCount} {cat.appCount === 1 ? 'product' : 'products'}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 6. CURATED ECOSYSTEM SHOWCASE BANNER */}
      <section style={{ padding: '20px 0 48px' }}>
        <div className="container">
          <div style={{
            backgroundColor: '#0F172A',
            borderRadius: '24px',
            padding: '48px',
            display: 'grid',
            gridTemplateColumns: '1.2fr 0.8fr',
            alignItems: 'center',
            gap: '40px',
            color: '#FFFFFF',
            position: 'relative',
            overflow: 'hidden',
            border: '1px solid #1E293B'
          }}>
            <div>
              <span className="badge badge-accent" style={{ marginBottom: '14px', backgroundColor: 'rgba(37, 99, 235, 0.2)', color: '#93C5FD', borderColor: '#1E40AF' }}>
                Curated Software Store
              </span>
              <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#FFFFFF', marginBottom: '12px', letterSpacing: '-0.02em' }}>
                Explore Verified Apps & Games
              </h2>
              <p style={{ fontSize: '16px', color: '#94A3B8', lineHeight: '1.6', marginBottom: '28px', maxWidth: '480px' }}>
                Experience lightning fast APK downloads, verified package integrity, and modern responsive web applications carefully curated for performance.
              </p>
              <Link to="/explore" className="btn btn-primary btn-lg" id="home-explore-curated-btn">
                Browse Full Catalog <ArrowRight size={16} />
              </Link>
            </div>

            {/* Clean Ecosystem Graphic */}
            <div style={{
              backgroundColor: '#020617',
              borderRadius: '14px',
              border: '1px solid #1E293B',
              padding: '20px',
              fontFamily: 'var(--font-mono)',
              fontSize: '12.5px',
              color: '#38BDF8',
              boxShadow: 'var(--shadow-xl)'
            }}>
              <div style={{ display: 'flex', gap: '6px', marginBottom: '14px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#EF4444' }} />
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#F59E0B' }} />
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10B981' }} />
              </div>
              <div style={{ color: '#64748B' }}>// tobiyastudio.ecosystem.json</div>
              <div>{'{'}</div>
              <div style={{ paddingLeft: '16px', color: '#93C5FD' }}>"catalog": <span style={{ color: '#FCD34D' }}>"Verified Apps & Games"</span>,</div>
              <div style={{ paddingLeft: '16px', color: '#93C5FD' }}>"downloads": <span style={{ color: '#4ADE80' }}>"Instant APK Stream"</span>,</div>
              <div style={{ paddingLeft: '16px', color: '#93C5FD' }}>"security": <span style={{ color: '#FCD34D' }}>"Policy Inspected"</span>,</div>
              <div style={{ paddingLeft: '16px', color: '#93C5FD' }}>"verified": <span style={{ color: '#38BDF8' }}>true</span></div>
              <div>{'}'}</div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FEATURED COLLECTIONS */}
      <section className="section" style={{ backgroundColor: '#F8FAFC', borderTop: '1px solid #E2E8F0' }}>
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">Featured Collections</h2>
              <p className="section-subtitle">Curated roundups for productivity, gaming, and business tools.</p>
            </div>
            <Link to="/collections" className="section-link">
              View all <ArrowRight size={15} />
            </Link>
          </div>

          <div className="grid-4">
            {collections.slice(0, 4).map(col => (
              <Link
                key={col.id}
                to={`/collections/${col.slug}`}
                className="card card-interactive"
                style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    backgroundColor: '#EFF6FF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {collectionIcons[col.slug] || <Layers size={20} color="#2563EB" />}
                  </div>
                  <span className="badge badge-gray">{col.badge}</span>
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
                  {col.name}
                </h3>
                <p style={{ fontSize: '13px', color: '#64748B', lineHeight: '1.4', marginBottom: '16px', flex: 1 }}>
                  {col.description}
                </p>
                <div style={{ fontSize: '12px', color: '#2563EB', fontWeight: '600' }}>
                  {col.products ? col.products.length : 3} products included →
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Download Modal Trigger */}
      {downloadingProduct && (
        <DownloadModal
          product={downloadingProduct}
          onClose={() => setDownloadingProduct(null)}
        />
      )}
    </div>
  );
}
