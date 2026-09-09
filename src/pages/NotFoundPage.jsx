import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home, Search } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '100px 24px',
      textAlign: 'center',
      minHeight: '60vh'
    }}>
      {/* 404 Illustration matching design board */}
      <div style={{
        width: '84px',
        height: '84px',
        backgroundColor: '#EFF6FF',
        borderRadius: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '24px',
        border: '1px solid #DBEAFE'
      }}>
        <Compass size={40} color="#2563EB" strokeWidth={1.75} />
      </div>

      <div style={{ fontSize: '14px', fontWeight: '800', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#2563EB', marginBottom: '8px' }}>
        Error 404
      </div>

      <h1 style={{ fontSize: '36px', fontWeight: '800', color: '#0F172A', letterSpacing: '-0.02em', marginBottom: '12px' }}>
        Page not found
      </h1>

      <p style={{ fontSize: '15px', color: '#64748B', maxWidth: '420px', lineHeight: '1.6', marginBottom: '32px' }}>
        The page you are looking for doesn't exist, has been unpublished, or has moved to a new destination.
      </p>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '32px' }}>
        <Link to="/" className="btn btn-primary btn-lg" id="404-go-home-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <Home size={16} /> Go Home
        </Link>
        <Link to="/explore" className="btn btn-secondary btn-lg" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <Search size={16} /> Explore All Software
        </Link>
      </div>

      <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#64748B' }}>
        <Link to="/apps" style={{ color: '#2563EB', fontWeight: '600' }}>Explore Apps</Link>
        <span>·</span>
        <Link to="/games" style={{ color: '#2563EB', fontWeight: '600' }}>Games Directory</Link>
        <span>·</span>
        <Link to="/web" style={{ color: '#2563EB', fontWeight: '600' }}>Web Applications</Link>
      </div>
    </div>
  );
}
