import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Globe,
  ExternalLink,
  Star,
  Search,
  ShieldCheck,
  Sparkles,
  Layers,
  Cpu,
  Zap,
  CheckCircle2,
  Laptop,
  ArrowRight
} from 'lucide-react';

const WEB_APP_CATEGORIES = [
  { id: 'All', label: 'All Web Apps' },
  { id: 'Business', label: 'Business & SaaS' },
  { id: 'Agriculture', label: 'Agronomy & IoT' },
  { id: 'Finance', label: 'Finance & Ledger' },
  { id: 'Productivity', label: 'Productivity' },
  { id: 'AI & Technology', label: 'AI Tools' }
];

export default function WebAppsPage() {
  const [webApps, setWebApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setLoading(true);
    let url = `/api/products?platform=Web&limit=50`;
    if (selectedCategory !== 'All') {
      url += `&category=${encodeURIComponent(selectedCategory)}`;
    }

    fetch(url)
      .then(res => res.json())
      .then(data => {
        // Also include products flagged as isWebApp or platform Web
        const apps = (data.products || []).filter(p => p.isWebApp || (p.platform && p.platform.toLowerCase().includes('web')));
        setWebApps(apps);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load web apps:', err);
        setLoading(false);
      });
  }, [selectedCategory]);

  const filteredApps = webApps.filter(app => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      app.name.toLowerCase().includes(q) ||
      app.shortDescription.toLowerCase().includes(q) ||
      app.category.toLowerCase().includes(q) ||
      (app.tags && app.tags.some(t => t.toLowerCase().includes(q)))
    );
  });

  return (
    <div style={{ backgroundColor: '#F8FAFC', minHeight: '100vh', paddingBottom: '90px' }}>
      {/* Hero Header */}
      <section style={{
        background: 'linear-gradient(135deg, #064E3B 0%, #0F172A 60%, #047857 100%)',
        color: '#FFFFFF',
        padding: '50px 0 44px',
        borderBottom: '1px solid #1E293B'
      }}>
        <div className="container">
          <div style={{ maxWidth: '820px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'rgba(52, 211, 153, 0.2)',
              border: '1px solid rgba(52, 211, 153, 0.4)',
              padding: '6px 14px',
              borderRadius: '9999px',
              color: '#6EE7B7',
              fontSize: '12.5px',
              fontWeight: '700',
              marginBottom: '16px'
            }}>
              <Globe size={15} /> Instant Cloud Software Directory
            </div>

            <h1 style={{ fontSize: '36px', fontWeight: '800', letterSpacing: '-0.02em', marginBottom: '12px', lineHeight: 1.2, color: '#FFFFFF' }}>
              Web Applications & Cloud Suites
            </h1>
            <p style={{ fontSize: '16px', color: '#CBD5E1', lineHeight: '1.6', marginBottom: '24px' }}>
              Run powerful software directly in your browser. Zero local installation, instant updates, and seamless cross-platform synchronization across desktop, tablet, and mobile devices.
            </p>

            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '13px', color: '#A7F3D0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Zap size={16} color="#34D399" /> 1-Click Browser Launch
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Laptop size={16} color="#6EE7B7" /> Responsive on Any Screen
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={16} color="#A7F3D0" /> Verified HTTPS Security
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container" style={{ paddingTop: '32px' }}>
        {/* Search and Category Filter Bar */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          padding: '18px 24px',
          border: '1px solid #E2E8F0',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          {/* Category Tabs */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', scrollbarWidth: 'thin' }}>
            {WEB_APP_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  backgroundColor: selectedCategory === cat.id ? '#059669' : '#FFFFFF',
                  color: selectedCategory === cat.id ? '#FFFFFF' : '#475569',
                  border: `1px solid ${selectedCategory === cat.id ? '#059669' : '#E2E8F0'}`,
                  padding: '7px 16px',
                  borderRadius: '9999px',
                  fontSize: '13px',
                  fontWeight: selectedCategory === cat.id ? '700' : '500',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div style={{ position: 'relative', minWidth: '260px' }}>
            <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search web apps & SaaS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-control"
              style={{ paddingLeft: '36px', height: '40px', fontSize: '13.5px', borderRadius: '10px' }}
            />
          </div>
        </div>

        {/* Section Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A' }}>
              {selectedCategory === 'All' ? 'All Verified Web Applications' : `${selectedCategory} Web Suites`}
            </h2>
            <p style={{ fontSize: '13.5px', color: '#64748B' }}>
              Showing {filteredApps.length} cloud services ready to open
            </p>
          </div>
        </div>

        {/* Web Apps Grid */}
        {loading ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: '#64748B' }}>
            <div style={{ display: 'inline-block', width: '28px', height: '28px', border: '3px solid #E2E8F0', borderTopColor: '#059669', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '12px' }} />
            <div>Loading verified web applications...</div>
          </div>
        ) : filteredApps.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '24px'
          }}>
            {filteredApps.map(app => (
              <div
                key={app.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '20px',
                  border: '1px solid #E2E8F0',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                }}
                className="web-app-card"
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                      <img
                        src={app.icon}
                        alt={app.name}
                        style={{ width: '56px', height: '56px', borderRadius: '14px', border: '1px solid #E2E8F0', objectFit: 'cover' }}
                        onError={(e) => { e.currentTarget.src = '/assets/icons/kpi-tracker.svg'; }}
                      />
                      <div>
                        <Link to={`/product/${app.slug}`} style={{ textDecoration: 'none' }}>
                          <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A', marginBottom: '3px' }}>
                            {app.name}
                          </h3>
                        </Link>
                        <div style={{ fontSize: '12px', color: '#64748B' }}>
                          {app.developerName}
                        </div>
                      </div>
                    </div>

                    <span style={{
                      backgroundColor: '#ECFDF5',
                      color: '#047857',
                      fontSize: '11px',
                      fontWeight: '700',
                      padding: '3px 8px',
                      borderRadius: '6px'
                    }}>
                      Web App
                    </span>
                  </div>

                  <p style={{
                    fontSize: '13.5px',
                    color: '#475569',
                    lineHeight: '1.55',
                    marginBottom: '18px',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {app.shortDescription}
                  </p>

                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '18px' }}>
                    <span className="badge badge-gray" style={{ fontSize: '11px' }}>
                      {app.category}
                    </span>
                    <span style={{ fontSize: '11px', color: '#64748B', backgroundColor: '#F1F5F9', padding: '2px 8px', borderRadius: '6px' }}>
                      Cloud Hosted
                    </span>
                    <span style={{ fontSize: '11px', color: '#64748B', backgroundColor: '#F1F5F9', padding: '2px 8px', borderRadius: '6px' }}>
                      No Install
                    </span>
                  </div>
                </div>

                {/* Card Action */}
                <div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '14px',
                    borderTop: '1px solid #F1F5F9',
                    marginBottom: '14px',
                    fontSize: '12.5px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '700', color: '#0F172A' }}>
                      <Star size={14} fill="#F59E0B" color="#F59E0B" />
                      <span>{Number(app.rating).toFixed(1)}</span>
                      <span style={{ color: '#94A3B8', fontWeight: '400' }}>({app.reviewCount})</span>
                    </div>

                    <span style={{ color: '#059669', fontWeight: '600', fontSize: '12px' }}>
                      ✓ Browser Ready
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '10px' }}>
                    <Link
                      to={`/product/${app.slug}`}
                      className="btn btn-outline btn-sm"
                      style={{ textAlign: 'center', fontSize: '12.5px', borderRadius: '10px' }}
                    >
                      Overview
                    </Link>
                    <a
                      href={app.webUrl || `https://${app.slug}.example.com`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary btn-sm"
                      style={{
                        borderRadius: '10px',
                        fontSize: '12.5px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        backgroundColor: '#059669',
                        borderColor: '#059669'
                      }}
                    >
                      Launch App <ExternalLink size={13} />
                    </a>
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
            <Globe size={36} color="#94A3B8" style={{ marginBottom: '12px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
              No web applications found in this category
            </h3>
            <p style={{ color: '#64748B', fontSize: '13.5px', marginBottom: '16px' }}>
              Try selecting another category or clear your search term.
            </p>
            <button
              onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
              className="btn btn-secondary btn-sm"
            >
              Reset Category
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
