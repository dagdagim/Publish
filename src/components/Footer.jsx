import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <svg style={{ width: '28px', height: '28px', borderRadius: '7px' }} viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="8" fill="#2563EB"/>
                <path d="M7 10H25M16 10V24" stroke="#FFFFFF" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 21C12 18 20 18 20 21C20 24 12 24 12 27" stroke="#93C5FD" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: '800', color: '#FFFFFF', letterSpacing: '-0.02em' }}>
                TobiyaStudio
              </span>
            </div>
            <p style={{ fontSize: '14px', color: '#94A3B8', lineHeight: '1.6', maxWidth: '300px', marginBottom: '16px' }}>
              Discover. Download. Use. A curated, production-grade publishing platform for mobile apps, web applications, and interactive digital software.
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748B' }}>
              <span>Verified Publisher Network</span>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="footer-heading">Platform</h4>
            <div className="footer-links">
              <Link to="/apps" className="footer-link">Apps</Link>
              <Link to="/games" className="footer-link">Games</Link>
              <Link to="/web" className="footer-link">Web Apps</Link>
              <Link to="/collections" className="footer-link">Collections</Link>
              <Link to="/explore" className="footer-link">Explore Hub</Link>
            </div>
          </div>

          {/* Administration */}
          <div>
            <h4 className="footer-heading">Administration</h4>
            <div className="footer-links">
              <Link to="/admin" className="footer-link">Admin Console</Link>
              <a href="#docs" onClick={(e) => { e.preventDefault(); alert('TobiyaStudio Platform API Documentation available in v2.0 SDK.'); }} className="footer-link">Documentation</a>
              <a href="mailto:support@tobiyastudio.com" className="footer-link">Platform Support</a>
            </div>
          </div>

          {/* About */}
          <div>
            <h4 className="footer-heading">About</h4>
            <div className="footer-links">
              <Link to="/publishers/tobiyastudio" className="footer-link">About Studio</Link>
              <a href="#privacy" onClick={(e) => { e.preventDefault(); alert('TobiyaStudio Privacy: Zero telemetry trackers or invasive cookies.'); }} className="footer-link">Privacy Policy</a>
              <a href="#terms" onClick={(e) => { e.preventDefault(); alert('TobiyaStudio Terms: Fair developer distribution agreements.'); }} className="footer-link">Terms of Service</a>
              <a href="mailto:contact@tobiyastudio.com" className="footer-link">Contact</a>
            </div>
          </div>

          {/* Follow Us / Socials */}
          <div>
            <h4 className="footer-heading">Connect</h4>
            <div className="footer-links">
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="footer-link">Twitter / X</a>
              <a href="https://github.com" target="_blank" rel="noreferrer" className="footer-link">GitHub</a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="footer-link">LinkedIn</a>
              <a href="#rss" onClick={(e) => { e.preventDefault(); alert('RSS feed: /api/products/feed.xml'); }} className="footer-link">RSS Releases Feed</a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <div>
            © 2026 TobiyaStudio Platform. All rights reserved. Built for independent software creators.
          </div>
          <div style={{ color: '#475569', fontWeight: '500' }}>
            Build · Share · Grow
          </div>
        </div>
      </div>
    </footer>
  );
}
