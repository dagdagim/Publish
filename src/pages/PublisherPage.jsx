import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Globe, Mail, Layers, Smartphone, Gamepad2 } from 'lucide-react';
import ProductCard from '../components/ProductCard';

export default function PublisherPage() {
  const { slug } = useParams();
  const publisherSlug = slug || 'tobiyastudio';
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'apps' | 'games' | 'web'
  const [following, setFollowing] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/publishers/${publisherSlug}`)
      .then(res => res.json())
      .then(resData => {
        setData(resData);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [publisherSlug]);

  if (loading) {
    return (
      <div style={{ padding: '80px 0', textAlign: 'center', color: '#64748B' }}>
        <div style={{ display: 'inline-block', width: '32px', height: '32px', border: '3px solid #E2E8F0', borderTopColor: '#2563EB', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '16px', fontSize: '14px' }}>Loading publisher profile...</p>
      </div>
    );
  }

  if (!data || !data.publisher) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px' }}>Publisher Not Found</h2>
        <p style={{ color: '#64748B', marginBottom: '24px' }}>The publisher you are looking for does not exist.</p>
        <Link to="/" className="btn btn-primary">Return to Marketplace</Link>
      </div>
    );
  }

  const { publisher, products = [] } = data;

  const filteredProducts = products.filter(p => {
    if (activeFilter === 'apps') return !p.isWebApp && !p.isGame;
    if (activeFilter === 'games') return p.isGame;
    if (activeFilter === 'web') return p.isWebApp;
    return true;
  });

  return (
    <div style={{ paddingBottom: '64px' }}>
      {/* Publisher Banner & Header */}
      <section style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '48px 0 36px' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '32px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
              <img
                src={publisher.avatar}
                alt={publisher.name}
                style={{ width: '92px', height: '92px', borderRadius: '24px', border: '1px solid #E2E8F0', boxShadow: 'var(--shadow-md)' }}
              />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#0F172A', letterSpacing: '-0.02em' }}>
                    {publisher.name}
                  </h1>
                  {publisher.verified && (
                    <span title="Verified Publisher" style={{ display: 'inline-flex', color: '#2563EB' }}>
                      <CheckCircle2 size={22} fill="#2563EB" color="#FFFFFF" />
                    </span>
                  )}
                </div>

                <p style={{ fontSize: '16px', color: '#475569', marginBottom: '14px', maxWidth: '580px' }}>
                  "{publisher.tagline}"
                </p>

                {/* Stats Counters */}
                <div style={{ display: 'flex', gap: '24px', fontSize: '13.5px' }}>
                  <div>
                    <strong style={{ fontSize: '16px', color: '#0F172A' }}>{publisher.appsCount || products.length}</strong>{' '}
                    <span style={{ color: '#64748B' }}>Apps</span>
                  </div>
                  <div>
                    <strong style={{ fontSize: '16px', color: '#0F172A' }}>{publisher.webAppsCount || 2}</strong>{' '}
                    <span style={{ color: '#64748B' }}>Web Apps</span>
                  </div>
                  <div>
                    <strong style={{ fontSize: '16px', color: '#0F172A' }}>{publisher.gamesCount || 1}</strong>{' '}
                    <span style={{ color: '#64748B' }}>Games</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Follow & Publisher Actions */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <button
                onClick={() => setFollowing(!following)}
                className={`btn ${following ? 'btn-outline' : 'btn-primary'} btn-lg`}
                id="publisher-follow-btn"
              >
                {following ? 'Following ✓' : '+ Follow Studio'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Catalog & Filter Navigation */}
      <div className="container" style={{ padding: '36px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A' }}>
            Our Products
          </h2>

          <div style={{ display: 'flex', gap: '8px' }}>
            {[
              { id: 'all', label: 'All' },
              { id: 'apps', label: 'Apps' },
              { id: 'games', label: 'Games' },
              { id: 'web', label: 'Web Apps' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`btn btn-sm ${activeFilter === tab.id ? 'btn-primary' : 'btn-secondary'}`}
                style={{ borderRadius: '9999px', padding: '5px 14px' }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid-4">
            {filteredProducts.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '48px', backgroundColor: '#F8FAFC', borderRadius: '16px', border: '1px dashed #CBD5E1' }}>
            <p style={{ color: '#64748B' }}>No products found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}
