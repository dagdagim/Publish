import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Download, 
  CheckCircle2, 
  ShieldCheck, 
  FileText, 
  AlertCircle, 
  X, 
  ExternalLink, 
  QrCode, 
  Lock, 
  UserPlus, 
  LogIn,
  Sparkles
} from 'lucide-react';
import QRCodeWidget from './QRCodeWidget';

export default function DownloadModal({ product, versions = [], onClose }) {
  const { user, token, isAuthenticated, openAuthModal, login } = useAuth();

  const latestVersion = versions.find(v => v.isLatest) || versions[0] || {
    version: product.version || '1.0.0',
    fileSize: product.fileSize || '32 MB',
    releaseDate: product.updatedDate || 'September 2026',
    apkUrl: product.apkUrl || `/api/downloads/${product.slug}-latest.apk`
  };

  const [selectedVersion, setSelectedVersion] = useState(latestVersion);
  const [downloadStarted, setDownloadStarted] = useState(false);
  const [activeMethod, setActiveMethod] = useState('direct'); // 'direct' | 'qr'

  // Target download endpoint that streams the full real APK package with user auth token
  const targetUrl = token 
    ? `/api/products/${product.id}/download-package?token=${encodeURIComponent(token)}`
    : `/api/products/${product.id}/download-package`;
  const filename = `${product.slug}-v${selectedVersion.version || '1.0.0'}.apk`;

  const handleDownloadClick = (e) => {
    if (!isAuthenticated) {
      if (e) e.preventDefault();
      openAuthModal({
        tab: 'register',
        prompt: `Create a free account or sign in to download ${product.name} (v${selectedVersion.version}).`,
        onAuthSuccess: () => {
          setDownloadStarted(true);
        }
      });
      return;
    }

    setDownloadStarted(true);
    // Background download count logging
    fetch(`/api/products/${product.id}/download`, { 
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    }).catch(() => {});
  };

  const handleQuickDemoAuth = async () => {
    try {
      await login('user@tobiyastudio.com', 'user123');
      setDownloadStarted(true);
    } catch (err) {
      openAuthModal({
        tab: 'login',
        prompt: `Sign in to download ${product.name} APK.`
      });
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '520px',
        boxShadow: 'var(--shadow-xl)',
        overflow: 'hidden',
        border: '1px solid #E2E8F0',
        animation: 'fadeIn 0.2s ease-out'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #F1F5F9'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img
              src={product.icon}
              alt=""
              style={{ width: '42px', height: '42px', borderRadius: '10px', border: '1px solid #E2E8F0', objectFit: 'cover' }}
              onError={(e) => { e.currentTarget.src = '/assets/icons/kpi-tracker.svg'; }}
            />
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                Download {product.name}
              </h3>
              <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>
                Verified Android APK Package
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ color: '#94A3B8', padding: '6px', borderRadius: '8px', border: 'none', background: 'transparent', cursor: 'pointer' }}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Method Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0', padding: '0 24px', backgroundColor: '#F8FAFC' }}>
          <button
            type="button"
            onClick={() => setActiveMethod('direct')}
            style={{
              padding: '12px 16px',
              fontSize: '13px',
              fontWeight: '700',
              border: 'none',
              background: 'none',
              color: activeMethod === 'direct' ? '#2563EB' : '#64748B',
              borderBottom: activeMethod === 'direct' ? '2px solid #2563EB' : '2px solid transparent',
              cursor: 'pointer'
            }}
          >
            Direct APK Download
          </button>
          <button
            type="button"
            onClick={() => setActiveMethod('qr')}
            style={{
              padding: '12px 16px',
              fontSize: '13px',
              fontWeight: '700',
              border: 'none',
              background: 'none',
              color: activeMethod === 'qr' ? '#2563EB' : '#64748B',
              borderBottom: activeMethod === 'qr' ? '2px solid #2563EB' : '2px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <QrCode size={14} /> Scan to Phone
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px' }}>
          {activeMethod === 'qr' ? (
            <QRCodeWidget product={product} />
          ) : (
            <>
              {/* Main Selected Version Card */}
              <div style={{
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '16px',
                padding: '20px',
                marginBottom: '20px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                  <div>
                    <span className="badge badge-success" style={{ marginBottom: '6px' }}>
                      {selectedVersion.isLatest ? 'Official Stable Release' : 'Archive Release'}
                    </span>
                    <div style={{ fontSize: '19px', fontWeight: '800', color: '#0F172A' }}>
                      Version {selectedVersion.version}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '15px', fontWeight: '800', color: '#2563EB' }}>
                      {selectedVersion.fileSize || product.fileSize || '32 MB'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748B' }}>
                      {selectedVersion.releaseDate || product.updatedDate || 'September 2026'}
                    </div>
                  </div>
                </div>

                {/* Security Guarantee Pills */}
                <div style={{ display: 'flex', gap: '14px', fontSize: '12px', color: '#475569', marginBottom: '18px', flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#16A34A', fontWeight: '600' }}>
                    <ShieldCheck size={16} /> Verified Safe & Clean
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#2563EB', fontWeight: '600' }}>
                    <CheckCircle2 size={16} /> Real Compiled APK
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Fast CDN Direct Link
                  </span>
                </div>

                {/* Authenticated vs Unauthenticated Download Action */}
                {isAuthenticated ? (
                  <>
                    <a
                      href={targetUrl}
                      download={filename}
                      onClick={handleDownloadClick}
                      className="btn btn-primary btn-block btn-lg"
                      id="modal-confirm-download-btn"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        textDecoration: 'none',
                        height: '48px',
                        fontSize: '15px',
                        fontWeight: '700',
                        boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
                      }}
                    >
                      <Download size={19} /> Download Real APK ({selectedVersion.fileSize || product.fileSize || '32 MB'})
                    </a>

                    {/* Download Started Confirmation Banner */}
                    {downloadStarted && (
                      <div style={{
                        marginTop: '16px',
                        padding: '14px 16px',
                        backgroundColor: '#F0FDF4',
                        border: '1px solid #BBF7D0',
                        borderRadius: '12px',
                        textAlign: 'center'
                      }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#16A34A', fontWeight: '700', fontSize: '13.5px', marginBottom: '4px' }}>
                          <CheckCircle2 size={18} /> Download package initiated!
                        </div>
                        <p style={{ fontSize: '12px', color: '#475569', margin: '0 0 8px 0' }}>
                          Check your browser downloads tray for <strong style={{ color: '#0F172A' }}>{filename}</strong>
                        </p>
                        <a
                          href={targetUrl}
                          download={filename}
                          onClick={handleDownloadClick}
                          style={{ fontSize: '12px', color: '#2563EB', fontWeight: '700', textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Download size={13} /> Click here to restart download
                        </a>
                      </div>
                    )}
                  </>
                ) : (
                  /* Account Required Gate Card */
                  <div style={{
                    backgroundColor: '#EFF6FF',
                    border: '1.5px solid #BFDBFE',
                    borderRadius: '14px',
                    padding: '18px 16px',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '12px',
                      backgroundColor: '#2563EB',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 10px'
                    }}>
                      <Lock size={20} />
                    </div>
                    <div style={{ fontSize: '14.5px', fontWeight: '800', color: '#1E40AF', marginBottom: '4px' }}>
                      Account Required to Download APK
                    </div>
                    <p style={{ fontSize: '12.5px', color: '#3B82F6', margin: '0 0 14px 0', lineHeight: '1.4' }}>
                      Please create a free account or sign in to unlock verified APK downloads.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => openAuthModal({ 
                          tab: 'register', 
                          prompt: `Create an account to download ${product.name} APK.`,
                          onAuthSuccess: () => setDownloadStarted(true)
                        })}
                        className="btn btn-primary btn-block"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', height: '42px', fontSize: '13.5px' }}
                      >
                        <UserPlus size={16} /> Create Free Account
                      </button>
                      <button
                        type="button"
                        onClick={() => openAuthModal({ 
                          tab: 'login', 
                          prompt: `Sign in to download ${product.name} APK.`,
                          onAuthSuccess: () => setDownloadStarted(true)
                        })}
                        className="btn btn-secondary btn-block"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', height: '38px', fontSize: '13px' }}
                      >
                        <LogIn size={15} /> Sign In to Existing Account
                      </button>
                      <button
                        type="button"
                        onClick={handleQuickDemoAuth}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#2563EB',
                          fontSize: '11.5px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          marginTop: '4px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px'
                        }}
                      >
                        <Sparkles size={12} /> 1-Click Quick Demo User
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Previous Releases History */}
              {versions.length > 1 && (
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#475569', marginBottom: '10px' }}>
                    Version History
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '140px', overflowY: 'auto' }}>
                    {versions.map(v => (
                      <div
                        key={v.id || v.version}
                        onClick={() => {
                          setSelectedVersion(v);
                          setDownloadStarted(false);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 14px',
                          borderRadius: '10px',
                          backgroundColor: selectedVersion.version === v.version ? '#EFF6FF' : '#FFFFFF',
                          border: `1px solid ${selectedVersion.version === v.version ? '#BFDBFE' : '#E2E8F0'}`,
                          cursor: 'pointer',
                          transition: 'all 0.15s'
                        }}
                      >
                        <div>
                          <span style={{ fontSize: '13.5px', fontWeight: '700', color: '#0F172A' }}>
                            Version {v.version}
                          </span>
                          {v.isLatest && (
                            <span className="badge badge-accent" style={{ marginLeft: '8px', fontSize: '10.5px' }}>
                              Latest
                            </span>
                          )}
                          <div style={{ fontSize: '11.5px', color: '#64748B' }}>
                            {v.releaseDate} · {v.fileSize}
                          </div>
                        </div>
                        {isAuthenticated ? (
                          <a
                            href={`${targetUrl}`}
                            download={`${product.slug}-v${v.version}.apk`}
                            className="btn btn-outline btn-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedVersion(v);
                              handleDownloadClick();
                            }}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
                            title={`Download v${v.version}`}
                          >
                            <Download size={13} /> Download
                          </a>
                        ) : (
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedVersion(v);
                              handleDownloadClick(e);
                            }}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            title={`Sign in to download v${v.version}`}
                          >
                            <Lock size={12} /> Download
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Android Installation Tip */}
              <div style={{
                marginTop: '20px',
                padding: '12px 14px',
                backgroundColor: '#F8FAFC',
                borderRadius: '10px',
                border: '1px solid #E2E8F0',
                fontSize: '12px',
                color: '#64748B',
                display: 'flex',
                gap: '10px'
              }}>
                <FileText size={16} color="#64748B" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ color: '#0F172A' }}>How to install on Android:</strong> Once downloaded, tap the APK file from your notification shade. If prompted, toggle "Allow from this source" in settings, then tap Install.
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
