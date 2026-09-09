import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  X, 
  Lock, 
  Mail, 
  User, 
  Eye, 
  EyeOff, 
  Download, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Zap,
  KeyRound,
  RefreshCw
} from 'lucide-react';

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.94 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}

export default function AuthModal() {
  const { 
    isAuthModalOpen, 
    authModalTab, 
    authPrompt, 
    setAuthModalTab, 
    closeAuthModal, 
    login, 
    sendOtp,
    verifyOtp,
    loginWithGoogle
  } = useAuth();

  // Mode: 'form' | 'google-picker' | 'otp'
  const [modalMode, setModalMode] = useState('form');

  // Form inputs
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // OTP inputs
  const [otpCode, setOtpCode] = useState('');
  const [otpSentTo, setOtpSentTo] = useState('');
  const [otpType, setOtpType] = useState('register'); // 'register' | 'google'
  const [resendTimer, setResendTimer] = useState(0);

  // Google inputs
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');

  // Statuses
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [isDelivered, setIsDelivered] = useState(true);

  // Reset state on tab or modal open
  useEffect(() => {
    setError(null);
    setSuccessMsg(null);
    setModalMode('form');
  }, [authModalTab, isAuthModalOpen]);

  // Resend countdown timer
  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Esc key closes modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isAuthModalOpen) {
        closeAuthModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthModalOpen, closeAuthModal]);

  if (!isAuthModalOpen) return null;

  // Handle Standard Email & Password Login
  const handleLoginSubmit = async (e, customEmail, customPassword) => {
    if (e) e.preventDefault();
    setError(null);

    const targetEmail = (customEmail !== undefined ? customEmail : email).trim();
    const targetPassword = (customPassword !== undefined ? customPassword : password).trim();

    if (!targetEmail || !targetPassword) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);
    try {
      await login(targetEmail, targetPassword);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Submit Registration -> Trigger Email OTP
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    setLoading(true);
    try {
      const res = await sendOtp(email.trim(), name.trim(), password, 'register');
      setOtpSentTo(email.trim());
      setOtpType('register');
      setIsDelivered(!!res.delivered);
      setResendTimer(45);
      setModalMode('otp');
      if (res.delivered) {
        setSuccessMsg(`Verification code sent to ${email.trim()}! Please check your email inbox.`);
      } else {
        setSuccessMsg(null);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Google Login Flow: Select account and send OTP
  const handleSelectGoogleAccount = async (selectedEmail, selectedName = '') => {
    setError(null);
    setLoading(true);
    const targetEmail = selectedEmail.trim();
    const targetName = selectedName || targetEmail.split('@')[0];

    try {
      const res = await sendOtp(targetEmail, targetName, '', 'google');
      setOtpSentTo(targetEmail);
      setName(targetName);
      setOtpType('google');
      setIsDelivered(!!res.delivered);
      setResendTimer(45);
      setModalMode('otp');
      if (res.delivered) {
        setSuccessMsg(`Verification code sent to ${targetEmail}! Please check your email inbox.`);
      } else {
        setSuccessMsg(null);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtpSubmit = async (e) => {
    if (e) e.preventDefault();
    setError(null);

    if (!otpCode || otpCode.trim().length < 4) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    setLoading(true);
    try {
      await verifyOtp(otpSentTo, otpCode.trim(), {
        name: name.trim(),
        password: password,
        isGoogle: otpType === 'google',
        avatar: otpType === 'google' ? 'G' : ''
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setError(null);
    setLoading(true);
    try {
      const res = await sendOtp(otpSentTo, name, password, otpType);
      setResendTimer(45);
      setSuccessMsg('A fresh verification code was sent to your email.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = () => {
    setEmail('user@tobiyastudio.com');
    setPassword('user123');
    handleLoginSubmit(null, 'user@tobiyastudio.com', 'user123');
  };

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.72)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1100,
        padding: '16px'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) closeAuthModal();
      }}
    >
      <div 
        style={{
          width: '100%',
          maxWidth: '490px',
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.28)',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          position: 'relative'
        }}
      >
        {/* Top Gradient Header Accent */}
        <div 
          style={{
            height: '5px',
            background: 'linear-gradient(90deg, #2563EB 0%, #38BDF8 50%, #6366F1 100%)'
          }} 
        />

        {/* Modal Close Button */}
        <button
          onClick={closeAuthModal}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: '#F1F5F9',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#64748B',
            transition: 'all 0.15s',
            zIndex: 10
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#E2E8F0'; e.currentTarget.style.color = '#0F172A'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.color = '#64748B'; }}
          aria-label="Close"
        >
          <X size={17} />
        </button>

        {/* Modal Content */}
        <div style={{ padding: '26px 30px' }}>

          {/* ========================================================= */}
          {/* VIEW 1: OTP VERIFICATION SCREEN                           */}
          {/* ========================================================= */}
          {modalMode === 'otp' ? (
            <div>
              <button
                type="button"
                onClick={() => setModalMode('form')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'none',
                  border: 'none',
                  color: '#64748B',
                  fontSize: '12.5px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  padding: 0,
                  marginBottom: '16px'
                }}
              >
                <ArrowLeft size={15} /> Back to details
              </button>

              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div 
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '16px',
                    backgroundColor: '#EFF6FF',
                    border: '1px solid #BFDBFE',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 12px'
                  }}
                >
                  <KeyRound size={26} color="#2563EB" />
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', margin: '0 0 6px 0' }}>
                  Enter Verification Code
                </h2>
                <p style={{ fontSize: '13px', color: '#64748B', margin: 0, lineHeight: '1.4' }}>
                  A 6-digit verification code was dispatched to:
                </p>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#2563EB', marginTop: '4px' }}>
                  {otpSentTo}
                </div>
              </div>

              {/* Status alerts */}
              {error && (
                <div 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: '#FEF2F2',
                    border: '1px solid #FECACA',
                    color: '#DC2626',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    fontSize: '12.5px',
                    marginBottom: '16px'
                  }}
                >
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  <span>{error}</span>
                </div>
              )}

              {successMsg && !error && (
                <div 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: '#F0FDF4',
                    border: '1px solid #BBF7D0',
                    color: '#16A34A',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    fontSize: '12.5px',
                    marginBottom: '16px'
                  }}
                >
                  <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Delivery Status */}
              {!isDelivered && (
                <div style={{
                  backgroundColor: '#FEF3C7',
                  border: '1px solid #FDE68A',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  marginBottom: '14px',
                  fontSize: '12px',
                  color: '#92400E',
                  lineHeight: '1.4'
                }}>
                  <strong>Notice:</strong> If the verification email does not appear in your primary inbox, please check your spam or promotions folder.
                </div>
              )}

              {/* OTP Form */}
              <form onSubmit={handleVerifyOtpSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '8px', textAlign: 'center' }}>
                    Type 6-Digit Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    autoFocus
                    placeholder="••••••"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    style={{
                      width: '100%',
                      height: '52px',
                      borderRadius: '12px',
                      border: '2px solid #2563EB',
                      fontSize: '24px',
                      fontWeight: '800',
                      letterSpacing: '10px',
                      textAlign: 'center',
                      color: '#0F172A',
                      outline: 'none',
                      backgroundColor: '#F8FAFC',
                      boxSizing: 'border-box',
                      fontFamily: 'monospace'
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || otpCode.length < 4}
                  className="btn btn-primary btn-block"
                  style={{
                    height: '46px',
                    fontSize: '14px',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  {loading ? 'Verifying...' : 'Verify Code & Download APK'}
                  {!loading && <ArrowRight size={16} />}
                </button>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', marginTop: '4px' }}>
                  <button
                    type="button"
                    onClick={() => setModalMode('form')}
                    style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: 0 }}
                  >
                    Change Email
                  </button>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendTimer > 0 || loading}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: resendTimer > 0 ? '#94A3B8' : '#2563EB',
                      fontWeight: '700',
                      cursor: resendTimer > 0 ? 'default' : 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: 0
                    }}
                  >
                    <RefreshCw size={12} />
                    {resendTimer > 0 ? `Resend code in ${resendTimer}s` : 'Resend Code'}
                  </button>
                </div>
              </form>
            </div>
          ) : modalMode === 'google-picker' ? (
            /* ========================================================= */
            /* VIEW 2: GOOGLE ACCOUNT PICKER                             */
            /* ========================================================= */
            <div>
              <button
                type="button"
                onClick={() => setModalMode('form')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'none',
                  border: 'none',
                  color: '#64748B',
                  fontSize: '12.5px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  padding: 0,
                  marginBottom: '16px'
                }}
              >
                <ArrowLeft size={15} /> Back
              </button>

              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div 
                  style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '16px',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 12px'
                  }}
                >
                  <GoogleIcon />
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', margin: '0 0 6px 0' }}>
                  Sign in with Google
                </h2>
                <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
                  Enter your Google or Gmail address to receive your verification code
                </p>
              </div>

              {error && (
                <div 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: '#FEF2F2',
                    border: '1px solid #FECACA',
                    color: '#DC2626',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    fontSize: '12.5px',
                    marginBottom: '16px'
                  }}
                >
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  <span>{error}</span>
                </div>
              )}

              {/* Google Email Input Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (customGoogleEmail.trim()) {
                    handleSelectGoogleAccount(customGoogleEmail.trim());
                  }
                }}
                style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
              >
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                    Google / Gmail Address
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '13px' }} />
                    <input
                      type="email"
                      required
                      autoFocus
                      placeholder="your.email@gmail.com"
                      value={customGoogleEmail}
                      onChange={(e) => setCustomGoogleEmail(e.target.value)}
                      style={{
                        width: '100%',
                        height: '42px',
                        paddingLeft: '38px',
                        paddingRight: '14px',
                        borderRadius: '10px',
                        border: '1px solid #CBD5E1',
                        fontSize: '13.5px',
                        color: '#0F172A',
                        outline: 'none',
                        backgroundColor: '#FFFFFF',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!customGoogleEmail.trim() || loading}
                  className="btn btn-primary btn-block"
                  style={{
                    height: '46px',
                    fontSize: '14px',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  {loading ? 'Sending verification code...' : 'Continue with Google'}
                  {!loading && <ArrowRight size={16} />}
                </button>
              </form>
            </div>
          ) : (
            /* ========================================================= */
            /* VIEW 3: MAIN AUTH TABS (SIGN IN / CREATE ACCOUNT)         */
            /* ========================================================= */
            <div>
              {/* Contextual Download Banner */}
              {authPrompt ? (
                <div 
                  style={{
                    backgroundColor: '#EFF6FF',
                    border: '1px solid #BFDBFE',
                    borderRadius: '16px',
                    padding: '14px 16px',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px'
                  }}
                >
                  <div 
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      backgroundColor: '#2563EB',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <Download size={18} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13.5px', fontWeight: '800', color: '#1E40AF', marginBottom: '2px' }}>
                      Account Required to Download
                    </div>
                    <div style={{ fontSize: '12.5px', color: '#1E3A8A', lineHeight: '1.4' }}>
                      {authPrompt}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', marginBottom: '14px' }}>
                  <div 
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '14px',
                      backgroundColor: '#EFF6FF',
                      border: '1px solid #BFDBFE',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 12px'
                    }}
                  >
                    <ShieldCheck size={24} color="#2563EB" />
                  </div>
                  <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', margin: '0 0 4px 0' }}>
                    {authModalTab === 'register' ? 'Create Your Free Account' : 'Welcome Back'}
                  </h2>
                  <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
                    {authModalTab === 'register' 
                      ? 'Join users downloading verified Android software' 
                      : 'Sign in to access unlimited instant APK downloads'}
                  </p>
                </div>
              )}

              {/* GOOGLE ONE-CLICK BUTTON */}
              <button
                type="button"
                onClick={() => setModalMode('google-picker')}
                style={{
                  width: '100%',
                  height: '46px',
                  backgroundColor: '#FFFFFF',
                  border: '1.5px solid #CBD5E1',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  fontSize: '14px',
                  fontWeight: '700',
                  color: '#1E293B',
                  cursor: 'pointer',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                  marginBottom: '16px',
                  transition: 'all 0.15s'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F8FAFC'; e.currentTarget.style.borderColor = '#94A3B8'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#FFFFFF'; e.currentTarget.style.borderColor = '#CBD5E1'; }}
              >
                <GoogleIcon />
                <span>Continue with Google</span>
              </button>

              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', margin: '14px 0 16px 0' }}>
                <div style={{ flex: 1, height: '1px', backgroundColor: '#E2E8F0' }} />
                <span style={{ padding: '0 12px', fontSize: '11.5px', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase' }}>
                  or continue with email
                </span>
                <div style={{ flex: 1, height: '1px', backgroundColor: '#E2E8F0' }} />
              </div>

              {/* Tab Selector */}
              <div 
                style={{
                  display: 'flex',
                  backgroundColor: '#F1F5F9',
                  borderRadius: '12px',
                  padding: '4px',
                  marginBottom: '18px'
                }}
              >
                <button
                  type="button"
                  onClick={() => setAuthModalTab('login')}
                  style={{
                    flex: 1,
                    padding: '9px 12px',
                    fontSize: '13px',
                    fontWeight: '700',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    backgroundColor: authModalTab === 'login' ? '#FFFFFF' : 'transparent',
                    color: authModalTab === 'login' ? '#0F172A' : '#64748B',
                    boxShadow: authModalTab === 'login' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                    transition: 'all 0.15s'
                  }}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setAuthModalTab('register')}
                  style={{
                    flex: 1,
                    padding: '9px 12px',
                    fontSize: '13px',
                    fontWeight: '700',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    backgroundColor: authModalTab === 'register' ? '#FFFFFF' : 'transparent',
                    color: authModalTab === 'register' ? '#0F172A' : '#64748B',
                    boxShadow: authModalTab === 'register' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                    transition: 'all 0.15s'
                  }}
                >
                  Create Account
                </button>
              </div>

              {/* Error Message */}
              {error && (
                <div 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: '#FEF2F2',
                    border: '1px solid #FECACA',
                    color: '#DC2626',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    fontSize: '12.5px',
                    marginBottom: '16px'
                  }}
                >
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  <span style={{ lineHeight: '1.4' }}>{error}</span>
                </div>
              )}

              {/* TAB 1: SIGN IN */}
              {authModalTab === 'login' ? (
                <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                      Email Address
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={16} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '13px' }} />
                      <input
                        type="email"
                        required
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{
                          width: '100%',
                          height: '42px',
                          paddingLeft: '38px',
                          paddingRight: '14px',
                          borderRadius: '10px',
                          border: '1px solid #CBD5E1',
                          fontSize: '13.5px',
                          color: '#0F172A',
                          outline: 'none',
                          backgroundColor: '#FFFFFF',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                      Password
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={16} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '13px' }} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{
                          width: '100%',
                          height: '42px',
                          paddingLeft: '38px',
                          paddingRight: '40px',
                          borderRadius: '10px',
                          border: '1px solid #CBD5E1',
                          fontSize: '13.5px',
                          color: '#0F172A',
                          outline: 'none',
                          backgroundColor: '#FFFFFF',
                          boxSizing: 'border-box'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: 'absolute',
                          right: '12px',
                          top: '12px',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#94A3B8'
                        }}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary btn-block"
                    style={{
                      height: '46px',
                      fontSize: '14px',
                      fontWeight: '700',
                      marginTop: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    {loading ? 'Signing in...' : 'Sign In & Continue Download'}
                    {!loading && <ArrowRight size={16} />}
                  </button>

                  {/* 1-Click Demo Login Helper */}
                  <div style={{ marginTop: '6px', textAlign: 'center' }}>
                    <button
                      type="button"
                      onClick={handleQuickDemo}
                      disabled={loading}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#2563EB',
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '6px 10px',
                        borderRadius: '8px',
                        backgroundColor: '#EFF6FF'
                      }}
                    >
                      <Sparkles size={13} color="#2563EB" /> 1-Click Quick Demo User (user@tobiyastudio.com)
                    </button>
                  </div>
                </form>
              ) : (
                /* TAB 2: CREATE ACCOUNT WITH GMAIL OTP */
                <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                      Full Name
                    </label>
                    <div style={{ position: 'relative' }}>
                      <User size={16} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '13px' }} />
                      <input
                        type="text"
                        required
                        placeholder="Alex Morgan"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        style={{
                          width: '100%',
                          height: '42px',
                          paddingLeft: '38px',
                          paddingRight: '14px',
                          borderRadius: '10px',
                          border: '1px solid #CBD5E1',
                          fontSize: '13.5px',
                          color: '#0F172A',
                          outline: 'none',
                          backgroundColor: '#FFFFFF',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                      Email Address (Verification OTP will be sent here)
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={16} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '13px' }} />
                      <input
                        type="email"
                        required
                        placeholder="alex@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{
                          width: '100%',
                          height: '42px',
                          paddingLeft: '38px',
                          paddingRight: '14px',
                          borderRadius: '10px',
                          border: '1px solid #CBD5E1',
                          fontSize: '13.5px',
                          color: '#0F172A',
                          outline: 'none',
                          backgroundColor: '#FFFFFF',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                        Password
                      </label>
                      <div style={{ position: 'relative' }}>
                        <Lock size={15} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '13px' }} />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          placeholder="Min 6 chars"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          style={{
                            width: '100%',
                            height: '42px',
                            paddingLeft: '34px',
                            paddingRight: '10px',
                            borderRadius: '10px',
                            border: '1px solid #CBD5E1',
                            fontSize: '13px',
                            color: '#0F172A',
                            outline: 'none',
                            backgroundColor: '#FFFFFF',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                        Confirm
                      </label>
                      <div style={{ position: 'relative' }}>
                        <Lock size={15} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '13px' }} />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          placeholder="Repeat"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          style={{
                            width: '100%',
                            height: '42px',
                            paddingLeft: '34px',
                            paddingRight: '10px',
                            borderRadius: '10px',
                            border: '1px solid #CBD5E1',
                            fontSize: '13px',
                            color: '#0F172A',
                            outline: 'none',
                            backgroundColor: '#FFFFFF',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary btn-block"
                    style={{
                      height: '46px',
                      fontSize: '14px',
                      fontWeight: '700',
                      marginTop: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    {loading ? 'Sending verification code...' : 'Send Verification OTP & Continue'}
                    {!loading && <ArrowRight size={16} />}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Footer Notice */}
          <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '11.5px', color: '#94A3B8' }}>
            Protected by TobiyaStudio Account Security
          </div>
        </div>
      </div>
    </div>
  );
}
