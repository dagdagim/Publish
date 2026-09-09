import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layers, Sparkles, TrendingUp, Gamepad2, Briefcase, Code2, ArrowLeft } from 'lucide-react';
import ProductCard from '../components/ProductCard';

export default function CollectionsPage() {
  const { slug } = useParams();
  const [collections, setCollections] = useState([]);
  const [activeCollection, setActiveCollection] = useState(null);
  const [collectionProducts, setCollectionProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    if (slug) {
      fetch(`/api/collections/${slug}`)
        .then(res => res.json())
        .then(data => {
          setActiveCollection(data.collection);
          setCollectionProducts(data.products || []);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    } else {
      fetch('/api/collections')
        .then(res => res.json())
        .then(data => {
          setCollections(data.collections || []);
          setActiveCollection(null);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [slug]);

  const collectionIcons = {
    'best-productivity-apps': <TrendingUp size={24} color="#2563EB" />,
    'new-releases': <Sparkles size={24} color="#4F46E5" />,
    'games': <Gamepad2 size={24} color="#DC2626" />,
    'business-tools': <Briefcase size={24} color="#059669" />,
    'developer-picks': <Code2 size={24} color="#D97706" />,
    'featured-projects': <Layers size={24} color="#2563EB" />
  };

  if (loading) {
    return (
      <div style={{ padding: '80px 0', textAlign: 'center', color: '#64748B' }}>
        <div style={{ display: 'inline-block', width: '32px', height: '32px', border: '3px solid #E2E8F0', borderTopColor: '#2563EB', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '16px', fontSize: '14px' }}>Loading collections...</p>
      </div>
    );
  }

  // Single Collection Detail View
  if (slug && activeCollection) {
    return (
      <div className="container" style={{ padding: '40px 24px 80px' }}>
        <Link to="/collections" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13.5px', color: '#2563EB', fontWeight: '600', marginBottom: '20px' }}>
          <ArrowLeft size={16} /> Back to all collections
        </Link>

        <div style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '20px',
          padding: '36px',
          marginBottom: '36px',
          boxShadow: 'var(--shadow-xs)'
        }}>
          <span className="badge badge-accent" style={{ marginBottom: '10px' }}>
            {activeCollection.badge}
          </span>
          <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#0F172A', marginBottom: '10px' }}>
            {activeCollection.name}
          </h1>
          <p style={{ fontSize: '16px', color: '#475569', maxWidth: '640px' }}>
            {activeCollection.description}
          </p>
        </div>

        <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', marginBottom: '20px' }}>
          Included Software ({collectionProducts.length})
        </h2>

        <div className="grid-4">
          {collectionProducts.map(prod => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      </div>
    );
  }

  // All Collections Listing View
  return (
    <div className="container" style={{ padding: '40px 24px 80px' }}>
      <div style={{ marginBottom: '36px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#0F172A', letterSpacing: '-0.02em', marginBottom: '8px' }}>
          Curated Collections
        </h1>
        <p style={{ fontSize: '16px', color: '#64748B' }}>
          Editorial roundups and hand-picked tools grouped for productivity, gaming, and business scaling.
        </p>
      </div>

      <div className="grid-3">
        {collections.map(col => (
          <Link
            key={col.id}
            to={`/collections/${col.slug}`}
            className="card card-interactive"
            style={{ display: 'flex', flexDirection: 'column', padding: '24px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {collectionIcons[col.slug] || <Layers size={24} color="#2563EB" />}
              </div>
              <span className="badge badge-gray">{col.badge}</span>
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0F172A', marginBottom: '8px' }}>
              {col.name}
            </h3>

            <p style={{ fontSize: '13.5px', color: '#64748B', lineHeight: '1.5', marginBottom: '20px', flex: 1 }}>
              {col.description}
            </p>

            <div style={{ fontSize: '13px', color: '#2563EB', fontWeight: '600' }}>
              View collection ({col.products ? col.products.length : 3} tools) →
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
