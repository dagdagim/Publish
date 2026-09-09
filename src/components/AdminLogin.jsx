import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, Eye, EyeOff, AlertCircle, Sparkles, ArrowRight } from 'lucide-react';

export default function AdminLogin({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e, customEmail, customPassword) => {
    if (e) e.preventDefault();
    setError(null);
    setLoading(true);

    const targetEmail = (customEmail !== undefined ? customEmail : email).trim();
    const targetPassword = (customPassword !== undefined ? customPassword : password).trim();

    if (!targetEmail || !targetPassword) {
      setError('Please enter your administrator email and password.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail, password: targetPassword })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      sessionStorage.setItem('tobiyastudio_admin_session', JSON.stringify({
        token: data.token,
        user: data.user,
        loginTime: new Date().toISOString()
      }));

      if (onLoginSuccess) {
        onLoginSuccess(data.user);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = () => {
    setEmail('admin@tobiyastudio.com');
    setPassword('admin123');
    handleLogin(null, 'admin@tobiyastudio.com', 'admin123');
  };

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
        backgroundColor: '#FFFFFF',
        borderRadius: '24px',
        border: '1px solid #E2E8F0',
        padding: '36px 32px',
        boxShadow: 'var(--shadow-lg)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Top Decorative Header Accent */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '5px',
          background: 'linear-gradient(90deg, #2563EB, #38BDF8, #6366F1)'
        }} />

        {/* Shield Icon & Title */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            backgroundColor: '#EFF6FF',
            border: '1px solid #BFDBFE',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: 'var(--shadow-xs)'
          }}>
            <ShieldCheck size={32} color="#2563EB" />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0F172A', letterSpacing: '-0.02em', marginBottom: '6px' }}>
            Admin Console
          </h1>
          <p style={{ fontSize: '13.5px', color: '#64748B' }}>
            Authenticate with administrator credentials to manage apps, approve submissions, and monitor platform metrics.
          </p>
        </div>

        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#FEF2F2',
            border: '1px solid #FCA5A5',
            color: '#B91C1C',
            padding: '12px 14px',
            borderRadius: '10px',
            fontSize: '13px',
            marginBottom: '20px'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '18px' }}>
            <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Mail size={14} color="#64748B" /> Administrator Email
            </label>
            <input
              type="email"
              className="input-control"
              placeholder="admin@tobiyastudio.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              id="admin-email-input"
            />
          </div>

          <div style={{ marginBottom: '22px' }}>
            <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Lock size={14} color="#64748B" /> Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="input-control"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                id="admin-password-input"
                style={{ paddingRight: '40px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94A3B8',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-block btn-lg"
            id="admin-login-submit-btn"
            style={{ marginBottom: '14px', height: '44px', fontSize: '14.5px' }}
          >
            {loading ? 'Authenticating...' : 'Sign In to Admin Console'}
          </button>
        </form>

        {/* Demo Credentials Quick-Fill Hint */}
        <div style={{
          marginTop: '18px',
          padding: '14px',
          backgroundColor: '#F8FAFC',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '11.5px', color: '#64748B', marginBottom: '8px' }}>
            Default Demo Credentials: <strong style={{ color: '#0F172A' }}>admin@tobiyastudio.com</strong> / <strong style={{ color: '#0F172A' }}>admin123</strong>
          </div>
          <button
            type="button"
            onClick={handleQuickDemo}
            className="btn btn-secondary btn-sm btn-block"
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '12px' }}
          >
            <Sparkles size={13} color="#2563EB" /> 1-Click Quick Demo Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
