import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { useAuth } from '../context/AuthContext';
import { QrCode, Smartphone, Copy, Check, Download, ArrowDownToLine, Sparkles, Lock, UserPlus } from 'lucide-react';

export default function QRCodeWidget({ product }) {
  const { token, isAuthenticated, openAuthModal } = useAuth();
  const canvasRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const [qrError, setQrError] = useState(null);

  const downloadUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/api/products/${product.id}/download-package${token ? `?token=${encodeURIComponent(token)}` : ''}`
    : `/api/products/${product.id}/download-package${token ? `?token=${encodeURIComponent(token)}` : ''}`;

  useEffect(() => {
    if (isAuthenticated && canvasRef.current && downloadUrl) {
      QRCode.toCanvas(
        canvasRef.current,
        downloadUrl,
        {
          width: 170,
          margin: 1,
          color: {
            dark: '#0F172A',
            light: '#FFFFFF'
          }
        },
        (error) => {
          if (error) {
            console.error('QR code generation error:', error);
            setQrError(error.message);
          }
        }
      );
    }
  }, [downloadUrl, product.id, isAuthenticated]);

  const handleCopy = () => {
    if (!isAuthenticated) {
      openAuthModal({
        prompt: `Create a free account or log in to get your verified download link for ${product.name}.`
      });
      return;
    }
    navigator.clipboard.writeText(downloadUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleUnlockClick = () => {
    openAuthModal({
      tab: 'register',
      prompt: `Create a free account or log in to scan & download ${product.name} to your Android device.`
    });
  };

  return (
    <div style={{
      backgroundColor: '#FFFFFF',
      borderRadius: '20px',
      border: '1px solid #E2E8F0',
      padding: '24px',
      boxShadow: 'var(--shadow-sm)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Header Accent */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            backgroundColor: '#EFF6FF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Smartphone size={18} color="#2563EB" />
          </div>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
              Scan to Download
            </h3>
            <div style={{ fontSize: '11.5px', color: '#64748B' }}>Direct to Android Device</div>
          </div>
        </div>
        <span className={`badge ${isAuthenticated ? 'badge-accent' : 'badge-warning'}`} style={{ fontSize: '11px', padding: '3px 8px' }}>
          {isAuthenticated ? 'Instant APK' : 'Login Required'}
        </span>
      </div>

      {/* QR Canvas Box or Auth Required Gate */}
      {isAuthenticated ? (
        <div style={{
          backgroundColor: '#F8FAFC',
          border: '1px solid #E2E8F0',
          borderRadius: '16px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            padding: '10px',
            borderRadius: '12px',
            boxShadow: 'var(--shadow-xs)',
            border: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <canvas ref={canvasRef} style={{ width: '160px', height: '160px', display: 'block' }} />
          </div>
          {qrError && (
            <div style={{ fontSize: '11px', color: '#EF4444', marginTop: '8px' }}>
              Failed to render QR Code
            </div>
          )}
          <div style={{
            fontSize: '12px',
            color: '#64748B',
            textAlign: 'center',
            marginTop: '12px',
            lineHeight: '1.4'
          }}>
            Point your phone camera or QR scanner here to download <strong>{product.fileSize || 'APK'}</strong> immediately.
          </div>
        </div>
      ) : (
        <div style={{
          backgroundColor: '#F8FAFC',
          border: '1px dashed #CBD5E1',
          borderRadius: '16px',
          padding: '24px 16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          marginBottom: '16px'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            backgroundColor: '#EFF6FF',
            border: '1px solid #BFDBFE',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '12px'
          }}>
            <Lock size={22} color="#2563EB" />
          </div>
          <div style={{ fontSize: '14px', fontWeight: '800', color: '#0F172A', marginBottom: '4px' }}>
            Account Required to Scan
          </div>
          <p style={{ fontSize: '12px', color: '#64748B', lineHeight: '1.4', margin: '0 0 14px 0', maxWidth: '240px' }}>
            Sign in or create a free account to generate your authorized device download QR code.
          </p>
          <button
            type="button"
            onClick={handleUnlockClick}
            className="btn btn-primary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12.5px' }}
          >
            <UserPlus size={14} /> Unlock QR Download
          </button>
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          type="button"
          onClick={handleCopy}
          className="btn btn-secondary btn-sm"
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '12px' }}
        >
          {copied ? <Check size={14} color="#16A34A" /> : <Copy size={14} />}
          {copied ? 'Link Copied!' : 'Copy Link'}
        </button>
        {isAuthenticated ? (
          <a
            href={downloadUrl}
            download
            className="btn btn-primary btn-sm"
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '12px', textDecoration: 'none' }}
          >
            <ArrowDownToLine size={14} /> Direct APK
          </a>
        ) : (
          <button
            type="button"
            onClick={handleUnlockClick}
            className="btn btn-primary btn-sm"
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '12px' }}
          >
            <Lock size={13} /> Direct APK
          </button>
        )}
      </div>
    </div>
  );
}
