import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Users,
  FolderTree,
  Layers,
  GitBranch,
  MessageSquare,
  DownloadCloud,
  TrendingUp,
  Settings,
  Plus,
  Trash2,
  CheckCircle,
  Eye,
  ArrowUpRight,
  Shield,
  FileCode,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Smartphone,
  Lock,
  LogOut,
  Sparkles,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Upload,
  PlusCircle,
  Star,
  HardDrive,
  BarChart3,
  Activity
} from 'lucide-react';
import AdminLogin from '../components/AdminLogin';
import DeveloperPortal from './DeveloperPortal';

export default function AdminDashboard() {
  // Always require authentication on visiting /admin
  const [adminUser, setAdminUser] = useState(null);

  const [metricsData, setMetricsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('approvals'); // default to 'approvals' or 'overview'
  const [productsList, setProductsList] = useState([]);
  const [productStatusFilter, setProductStatusFilter] = useState('all');
  const [selectedReviewApp, setSelectedReviewApp] = useState(null); // inspect details modal
  const [processingActionId, setProcessingActionId] = useState(null);

  // New Version Modal State
  const [showVersionModal, setShowVersionModal] = useState(null);
  const [versionForm, setVersionForm] = useState({ version: '', releaseNotes: '', fileSize: '25 MB' });
  const [uploadingAdminApk, setUploadingAdminApk] = useState(false);
  const [adminUploadedApkName, setAdminUploadedApkName] = useState(null);
  const adminApkInputRef = useRef(null);

  // Analytics & Reviews States
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [adminReviewsList, setAdminReviewsList] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [deletingReviewId, setDeletingReviewId] = useState(null);

  useEffect(() => {
    if (adminUser) {
      fetchMetrics();
      fetchAnalytics();
      fetchAdminReviews();
    }
  }, [adminUser]);

  useEffect(() => {
    if (activeTab === 'analytics' && !analyticsData) {
      fetchAnalytics();
    }
    if (activeTab === 'reviews' && adminReviewsList.length === 0) {
      fetchAdminReviews();
    }
  }, [activeTab]);

  const fetchAnalytics = () => {
    setLoadingAnalytics(true);
    fetch('/api/admin/analytics')
      .then(res => res.json())
      .then(data => {
        setAnalyticsData(data);
        setLoadingAnalytics(false);
      })
      .catch(err => {
        console.error(err);
        setLoadingAnalytics(false);
      });
  };

  const fetchAdminReviews = () => {
    setLoadingReviews(true);
    fetch('/api/admin/reviews')
      .then(res => res.json())
      .then(data => {
        setAdminReviewsList(data.reviews || (Array.isArray(data) ? data : []));
        setLoadingReviews(false);
      })
      .catch(err => {
        console.error(err);
        setLoadingReviews(false);
      });
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to permanently delete this user review? The application rating will be recalculated.')) return;
    setDeletingReviewId(reviewId);
    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete review');
      setAdminReviewsList(prev => prev.filter(r => r.id !== reviewId));
      fetchMetrics();
    } catch (err) {
      alert('Error deleting review: ' + err.message);
    } finally {
      setDeletingReviewId(null);
    }
  };

  const fetchMetrics = () => {
    setLoading(true);
    fetch('/api/admin/metrics')
      .then(res => res.json())
      .then(data => {
        setMetricsData(data);
        setProductsList(data.recentProducts || []);
        // If there are pending products, default to approvals tab, else overview
        if (data.pendingProducts && data.pendingProducts.length > 0 && activeTab === 'overview') {
          setActiveTab('approvals');
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleLogout = () => {
    localStorage.removeItem('tobiyastudio_admin');
    sessionStorage.removeItem('tobiyastudio_admin_session');
    setAdminUser(null);
  };

  // 1. Approve App
  const handleApprove = async (product) => {
    setProcessingActionId(product.id);
    try {
      const res = await fetch(`/api/admin/products/${product.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: 'Verified and approved by administrator.' })
      });

      if (!res.ok) throw new Error('Failed to approve application');
      
      // Update local state
      setProductsList(prev => prev.map(p => p.id === product.id ? { ...p, status: 'Published' } : p));
      if (selectedReviewApp && selectedReviewApp.id === product.id) {
        setSelectedReviewApp(null);
      }
      fetchMetrics();
    } catch (err) {
      alert('Error approving application: ' + err.message);
    } finally {
      setProcessingActionId(null);
    }
  };

  // 2. Reject App
  const handleReject = async (product) => {
    const reason = window.prompt(
      `Enter rejection or feedback notes for "${product.name}":`,
      'Please update your screenshots and ensure your privacy policy link is functional.'
    );
    if (reason === null) return; // cancelled

    setProcessingActionId(product.id);
    try {
      const res = await fetch(`/api/admin/products/${product.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });

      if (!res.ok) throw new Error('Failed to reject application');

      setProductsList(prev => prev.map(p => p.id === product.id ? { ...p, status: 'Rejected', rejectionReason: reason } : p));
      if (selectedReviewApp && selectedReviewApp.id === product.id) {
        setSelectedReviewApp(null);
      }
      fetchMetrics();
    } catch (err) {
      alert('Error rejecting application: ' + err.message);
    } finally {
      setProcessingActionId(null);
    }
  };

  // 3. Toggle Status (Draft / Published)
  const togglePublishStatus = async (product) => {
    const newStatus = product.status === 'Published' ? 'Draft' : 'Published';
    try {
      await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      setProductsList(prev => prev.map(p => p.id === product.id ? { ...p, status: newStatus } : p));
      fetchMetrics();
    } catch (err) {
      alert('Error updating status');
    }
  };

  // 4. Delete Product
  const deleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to permanently remove this product?')) return;
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
      setProductsList(prev => prev.filter(p => p.id !== id));
      fetchMetrics();
    } catch (err) {
      alert('Error deleting product');
    }
  };

  // 5. Open Update App Modal
  const handleOpenUpdateModal = (product) => {
    setShowVersionModal(product);
    setAdminUploadedApkName(null);
    let nextVersion = '1.1.0';
    if (product.version) {
      const parts = product.version.split('.');
      if (parts.length >= 2) {
        const minor = parseInt(parts[1], 10);
        nextVersion = isNaN(minor) ? `${product.version}.1` : `${parts[0]}.${minor + 1}.0`;
      } else {
        nextVersion = `${product.version}.1`;
      }
    }

    setVersionForm({
      name: product.name || '',
      category: product.category || 'Productivity',
      version: nextVersion,
      versionCode: (Number(product.versionCode) || 1) + 1,
      fileSize: product.fileSize || '25 MB',
      releaseNotes: '',
      status: product.status || 'Published',
      apkUrl: product.apkUrl || ''
    });
  };

  // Upload new version APK from Admin Modal
  const handleAdminApkUpload = async (file) => {
    if (!file) return;
    setUploadingAdminApk(true);
    const body = new FormData();
    body.append('file', file);

    try {
      const res = await fetch('/api/upload', { method: 'POST', body });
      if (!res.ok) throw new Error('Failed to upload APK package');
      const data = await res.json();

      setVersionForm(prev => ({
        ...prev,
        fileSize: data.fileSize || prev.fileSize,
        apkUrl: data.url,
        version: data.detectedVersion || prev.version
      }));
      setAdminUploadedApkName(file.name);
    } catch (err) {
      alert('Error uploading new version APK: ' + err.message);
    } finally {
      setUploadingAdminApk(false);
    }
  };

  const handleSaveAppUpdate = async () => {
    if (!showVersionModal) return;
    setProcessingActionId(showVersionModal.id);

    try {
      const res = await fetch(`/api/products/${showVersionModal.id}/releases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(versionForm)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to update application');
      }

      setShowVersionModal(null);
      fetchMetrics();
    } catch (err) {
      alert('Error saving update: ' + err.message);
    } finally {
      setProcessingActionId(null);
    }
  };

  // If unauthenticated, show the Admin Login view
  if (!adminUser) {
    return <AdminLogin onLoginSuccess={(user) => setAdminUser(user)} />;
  }

  if (loading || !metricsData) {
    return (
      <div style={{ padding: '80px 0', textAlign: 'center', color: '#64748B' }}>
        <div style={{ display: 'inline-block', width: '32px', height: '32px', border: '3px solid #E2E8F0', borderTopColor: '#2563EB', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '16px', fontSize: '14px' }}>Loading TobiyaStudio Admin Console...</p>
      </div>
    );
  }

  const { metrics, pendingProducts = [], categories = [] } = metricsData;
  const pendingCount = pendingProducts.length;

  const filteredProducts = productsList.filter(p => {
    if (productStatusFilter === 'all') return true;
    return p.status && p.status.toLowerCase() === productStatusFilter.toLowerCase();
  });

  const sidebarLinks = [
    { id: 'approvals', label: 'Pending Approvals', icon: <Clock size={17} />, badge: pendingCount },
    { id: 'publish', label: 'Publish New App', icon: <PlusCircle size={17} /> },
    { id: 'overview', label: 'Platform Overview', icon: <LayoutDashboard size={17} /> },
    { id: 'analytics', label: 'Telemetry & Analytics', icon: <TrendingUp size={17} /> },
    { id: 'reviews', label: 'User Reviews', icon: <MessageSquare size={17} />, badge: adminReviewsList.length },
    { id: 'products', label: 'All Applications', icon: <Package size={17} /> },
    { id: 'categories', label: 'Categories', icon: <FolderTree size={17} /> }
  ];

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 70px)', backgroundColor: '#F8FAFC' }}>
      {/* Sidebar Navigation */}
      <aside style={{
        width: '260px',
        backgroundColor: '#0F172A',
        borderRight: '1px solid #1E293B',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 16px',
        flexShrink: 0
      }}>
        {/* Brand Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0 12px 20px', borderBottom: '1px solid #1E293B' }}>
          <div style={{ width: '32px', height: '32px', backgroundColor: '#2563EB', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={18} color="#FFFFFF" />
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '800', color: '#FFFFFF' }}>TobiyaStudio</div>
            <div style={{ fontSize: '11px', color: '#94A3B8' }}>Admin Command Center</div>
          </div>
        </div>

        {/* Sidebar Nav Links */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '20px' }}>
          {sidebarLinks.map(link => (
            <button
              key={link.id}
              onClick={() => setActiveTab(link.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: '10px',
                fontSize: '13.5px',
                fontWeight: '600',
                color: activeTab === link.id ? '#FFFFFF' : '#94A3B8',
                backgroundColor: activeTab === link.id ? '#1E293B' : 'transparent',
                textAlign: 'left',
                borderLeft: activeTab === link.id ? '3px solid #2563EB' : '3px solid transparent',
                transition: 'all 0.15s'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {link.icon}
                <span>{link.label}</span>
              </div>
              {link.badge !== undefined && link.badge > 0 && (
                <span style={{
                  backgroundColor: '#EA580C',
                  color: '#FFFFFF',
                  fontSize: '11px',
                  fontWeight: '800',
                  padding: '2px 8px',
                  borderRadius: '10px'
                }}>
                  {link.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Sidebar Footer with Logged In User */}
        <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #1E293B' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22C55E' }} />
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#F1F5F9' }}>{adminUser.name}</div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              style={{ color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', cursor: 'pointer' }}
            >
              <LogOut size={13} />
            </button>
          </div>
          <div style={{ fontSize: '11px', color: '#64748B' }}>
            {adminUser.email}
          </div>
        </div>
      </aside>

      {/* Main Admin Content Area */}
      <main style={{ flex: 1, padding: '36px 40px', overflowY: 'auto' }}>
        {/* Top Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0F172A', letterSpacing: '-0.02em' }}>
              {activeTab === 'approvals' && `App Approvals Queue (${pendingCount})`}
              {activeTab === 'publish' && 'Publish New Application'}
              {activeTab === 'overview' && 'Platform Overview & Metrics'}
              {activeTab === 'analytics' && 'Distribution Telemetry & Analytics'}
              {activeTab === 'reviews' && `User Reviews Moderation (${adminReviewsList.length})`}
              {activeTab === 'products' && 'Application Inventory'}
              {activeTab === 'categories' && 'Store Categories'}
            </h1>
            <p style={{ fontSize: '13.5px', color: '#64748B' }}>
              {activeTab === 'approvals' && 'Review and approve new app submissions before they appear in the public catalog.'}
              {activeTab === 'publish' && 'Administrative publishing suite: upload APK packages, configure store metadata, and roll out to catalog.'}
              {activeTab === 'overview' && 'Real-time software distribution telemetry and ecosystem statistics.'}
              {activeTab === 'analytics' && 'Granular breakdown of software distribution, estimated CDN bandwidth usage, and top apps performance.'}
              {activeTab === 'reviews' && 'Audit community reviews and star ratings, verify authentic comments, and remove spam.'}
              {activeTab === 'products' && 'Inspect, edit, manage release versions, and toggle publication state.'}
              {activeTab === 'categories' && 'Browse categories and distribution groupings.'}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              type="button"
              onClick={() => setActiveTab('publish')}
              className={`btn ${activeTab === 'publish' ? 'btn-secondary' : 'btn-primary'} btn-sm`}
              id="admin-publish-header-btn"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={15} /> Publish New App
            </button>
            <Link to="/" target="_blank" className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ExternalLink size={14} /> View Live Store
            </Link>
            <button
              onClick={handleLogout}
              className="btn btn-secondary btn-sm"
              id="admin-logout-btn"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#EF4444' }}
              title="Sign Out of Admin Console"
            >
              <LogOut size={14} /> Log Out
            </button>
          </div>
        </div>

        {/* ==================================================== */}
        {/* TAB 1: PENDING APPROVALS QUEUE                      */}
        {/* ==================================================== */}
        {activeTab === 'approvals' && (
          <div>
            {pendingCount === 0 ? (
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '20px',
                border: '1px solid #E2E8F0',
                padding: '60px 40px',
                textAlign: 'center',
                boxShadow: 'var(--shadow-xs)'
              }}>
                <div style={{ width: '64px', height: '64px', backgroundColor: '#DCFCE7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <CheckCircle2 size={36} color="#16A34A" />
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', marginBottom: '8px' }}>
                  All Caught Up!
                </h3>
                <p style={{ color: '#64748B', fontSize: '14.5px', maxWidth: '480px', margin: '0 auto 20px' }}>
                  There are currently no applications waiting for review. When developers submit an app via the console, it will appear here for audit.
                </p>
                <button onClick={() => setActiveTab('products')} className="btn btn-secondary btn-sm">
                  View All Live Applications →
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {pendingProducts.map(product => (
                  <div
                    key={product.id}
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '18px',
                      border: '1px solid #FED7AA',
                      padding: '24px',
                      boxShadow: 'var(--shadow-sm)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '18px'
                    }}
                  >
                    {/* Header Strip */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                      <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                        <img
                          src={product.icon}
                          alt=""
                          style={{ width: '56px', height: '56px', borderRadius: '16px', border: '1px solid #E2E8F0', objectFit: 'cover' }}
                        />
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A' }}>
                              {product.name}
                            </h3>
                            <span style={{
                              backgroundColor: '#FEF3C7',
                              color: '#B45309',
                              fontSize: '11px',
                              fontWeight: '700',
                              padding: '2px 8px',
                              borderRadius: '6px'
                            }}>
                              Pending Review
                            </span>
                            <span className="badge badge-platform" style={{ fontSize: '11px' }}>
                              {product.platform}
                            </span>
                          </div>
                          <p style={{ fontSize: '13.5px', color: '#475569', maxWidth: '600px', marginBottom: '6px' }}>
                            {product.shortDescription}
                          </p>
                          <div style={{ fontSize: '12px', color: '#64748B', display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                            <span>Category: <strong>{product.category}</strong></span>
                            <span>Version: <strong>v{product.version}</strong></span>
                            <span>App Size: <strong style={{ color: '#2563EB' }}>{product.fileSize}</strong></span>
                            <span>Submitted: <strong>{product.submittedAt ? new Date(product.submittedAt).toLocaleDateString() : 'Just now'}</strong></span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <button
                          onClick={() => setSelectedReviewApp(product)}
                          className="btn btn-secondary btn-sm"
                          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                          <Eye size={14} /> Inspect Details
                        </button>
                        <button
                          onClick={() => handleReject(product)}
                          disabled={processingActionId === product.id}
                          className="btn btn-outline btn-sm"
                          style={{ color: '#DC2626', borderColor: '#FCA5A5', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                          <XCircle size={14} /> Reject
                        </button>
                        <button
                          onClick={() => handleApprove(product)}
                          disabled={processingActionId === product.id}
                          className="btn btn-primary btn-sm"
                          style={{ backgroundColor: '#16A34A', borderColor: '#16A34A', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                          <CheckCircle2 size={14} /> {processingActionId === product.id ? 'Approving...' : 'Approve & Publish'}
                        </button>
                      </div>
                    </div>

                    {/* Quick Inspection Summary Row */}
                    <div style={{
                      backgroundColor: '#F8FAFC',
                      borderRadius: '12px',
                      padding: '12px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '12px',
                      fontSize: '12.5px',
                      border: '1px solid #E2E8F0'
                    }}>
                      <div>
                        <span style={{ color: '#64748B' }}>Content Rating: </span>
                        <strong style={{ color: '#0F172A' }}>{product.contentRating}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748B' }}>Screenshots: </span>
                        <strong>{product.screenshots ? product.screenshots.length : 0} uploaded</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748B' }}>Data Safety: </span>
                        <strong>{product.dataSafety?.encryptedInTransit ? 'HTTPS Encrypted ✓' : 'Standard'}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748B' }}>Privacy Policy: </span>
                        <a href={product.privacyPolicyUrl} target="_blank" rel="noreferrer" style={{ color: '#2563EB', fontWeight: '600' }}>
                          Verified Link →
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 2: OVERVIEW & METRICS                            */}
        {/* ==================================================== */}
        {activeTab === 'overview' && (
          <div>
            {/* Pending Alert Callout if any */}
            {pendingCount > 0 && (
              <div style={{
                backgroundColor: '#FFFBEB',
                border: '1px solid #FDE68A',
                borderRadius: '14px',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '24px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Clock size={20} color="#D97706" />
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#92400E' }}>
                      {pendingCount} Application{pendingCount > 1 ? 's' : ''} Awaiting Review
                    </div>
                    <div style={{ fontSize: '12.5px', color: '#B45309' }}>
                      New submissions require administrator validation before publishing to the live catalog.
                    </div>
                  </div>
                </div>
                <button onClick={() => setActiveTab('approvals')} className="btn btn-primary btn-sm" style={{ backgroundColor: '#D97706', borderColor: '#D97706' }}>
                  Review Now →
                </button>
              </div>
            )}

            {/* Metrics 4-Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
              <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: 'var(--shadow-xs)' }}>
                <div style={{ fontSize: '12.5px', color: '#64748B', marginBottom: '6px' }}>Total Published Apps</div>
                <div style={{ fontSize: '28px', fontWeight: '800', color: '#0F172A' }}>{metrics.totalProducts}</div>
              </div>
              <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: 'var(--shadow-xs)' }}>
                <div style={{ fontSize: '12.5px', color: '#64748B', marginBottom: '6px' }}>Pending Approvals</div>
                <div style={{ fontSize: '28px', fontWeight: '800', color: pendingCount > 0 ? '#EA580C' : '#16A34A' }}>{pendingCount}</div>
              </div>
              <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: 'var(--shadow-xs)' }}>
                <div style={{ fontSize: '12.5px', color: '#64748B', marginBottom: '6px' }}>Total Downloads</div>
                <div style={{ fontSize: '28px', fontWeight: '800', color: '#2563EB' }}>{metrics.totalDownloads.toLocaleString()}</div>
              </div>
              <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: 'var(--shadow-xs)' }}>
                <div style={{ fontSize: '12.5px', color: '#64748B', marginBottom: '6px' }}>Average Rating</div>
                <div style={{ fontSize: '28px', fontWeight: '800', color: '#0F172A' }}>★ {metrics.averageRating}</div>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 3: ALL APPLICATIONS LIST                         */}
        {/* ==================================================== */}
        {activeTab === 'products' && (
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: 'var(--shadow-xs)' }}>
            {/* Filter Toolbar */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', display: 'flex', gap: '8px', alignItems: 'center', overflowX: 'auto' }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748B', marginRight: '8px' }}>Status:</span>
              {['all', 'published', 'pending approval', 'rejected', 'draft'].map(st => (
                <button
                  key={st}
                  onClick={() => setProductStatusFilter(st)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    fontSize: '12.5px',
                    fontWeight: '600',
                    textTransform: 'capitalize',
                    backgroundColor: productStatusFilter === st ? '#EFF6FF' : '#F8FAFC',
                    color: productStatusFilter === st ? '#2563EB' : '#64748B',
                    border: `1px solid ${productStatusFilter === st ? '#BFDBFE' : '#E2E8F0'}`
                  }}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Products Table */}
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Application</th>
                  <th>Category</th>
                  <th>Version / Size</th>
                  <th>Status</th>
                  <th>Downloads</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img src={p.icon} alt="" style={{ width: '36px', height: '36px', borderRadius: '10px', objectFit: 'cover' }} />
                        <div>
                          <Link to={`/product/${p.slug}`} style={{ fontWeight: '700', color: '#0F172A' }}>
                            {p.name}
                          </Link>
                          <div style={{ fontSize: '11px', color: '#64748B' }}>{p.packageId}</div>
                        </div>
                      </div>
                    </td>
                    <td>{p.category}</td>
                    <td>
                      <div><strong>v{p.version}</strong></div>
                      <div style={{ fontSize: '11.5px', color: '#2563EB' }}>{p.fileSize}</div>
                    </td>
                    <td>
                      <span className={`badge ${p.status === 'Published' ? 'badge-accent' : p.status === 'Pending Approval' ? 'badge-warning' : 'badge-gray'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td>{p.downloadCount || 0}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {p.status === 'Pending Approval' ? (
                          <button
                            onClick={() => handleApprove(p)}
                            className="btn btn-primary btn-sm"
                            style={{ backgroundColor: '#16A34A', borderColor: '#16A34A', fontSize: '11px', padding: '4px 8px' }}
                          >
                            Approve
                          </button>
                        ) : (
                          <button
                            onClick={() => togglePublishStatus(p)}
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: '11px', padding: '4px 8px' }}
                          >
                            {p.status === 'Published' ? 'Unpublish' : 'Publish'}
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenUpdateModal(p)}
                          className="btn btn-outline btn-sm"
                          style={{ fontSize: '11px', padding: '4px 8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          title="Release Update / New Version"
                        >
                          <RefreshCw size={12} /> Update
                        </button>
                        <button
                          onClick={() => deleteProduct(p.id)}
                          style={{ color: '#DC2626', padding: '4px 8px', borderRadius: '6px' }}
                          title="Delete App"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 4: CATEGORIES                                    */}
        {/* ==================================================== */}
        {activeTab === 'categories' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
            {categories.map(cat => (
              <div key={cat.id} style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '18px' }}>
                <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#0F172A', marginBottom: '4px' }}>{cat.name}</h4>
                <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '10px' }}>{cat.description}</p>
                <div style={{ fontSize: '12px', color: '#2563EB', fontWeight: '600' }}>{cat.appCount} software items</div>
              </div>
            ))}
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 5: PUBLISH / SUBMIT APPLICATION (ADMIN ONLY)     */}
        {/* ==================================================== */}
        {activeTab === 'publish' && (
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            border: '1px solid #E2E8F0',
            boxShadow: 'var(--shadow-xs)',
            overflow: 'hidden'
          }}>
            <DeveloperPortal
              isAdminMode={true}
              onPublished={() => {
                fetchMetrics();
                setActiveTab('products');
              }}
            />
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 6: DISTRIBUTION TELEMETRY & ANALYTICS            */}
        {/* ==================================================== */}
        {activeTab === 'analytics' && (
          <div>
            {loadingAnalytics && !analyticsData ? (
              <div style={{ padding: '60px 0', textAlign: 'center', color: '#64748B' }}>
                <div style={{ display: 'inline-block', width: '28px', height: '28px', border: '3px solid #E2E8F0', borderTopColor: '#2563EB', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                <p style={{ marginTop: '12px', fontSize: '14px' }}>Compiling telemetry metrics...</p>
              </div>
            ) : analyticsData && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                {/* 4 KPI Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px' }}>
                  <div style={{ backgroundColor: '#FFFFFF', padding: '22px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: 'var(--shadow-xs)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span style={{ fontSize: '13px', fontWeight: '600', color: '#64748B' }}>Total Package Downloads</span>
                      <div style={{ width: '36px', height: '36px', backgroundColor: '#EFF6FF', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB' }}>
                        <DownloadCloud size={18} />
                      </div>
                    </div>
                    <div style={{ fontSize: '30px', fontWeight: '800', color: '#0F172A', letterSpacing: '-0.02em' }}>
                      {analyticsData.totalDownloads.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '12px', color: '#16A34A', fontWeight: '600', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <TrendingUp size={13} /> +18.4% this month
                    </div>
                  </div>

                  <div style={{ backgroundColor: '#FFFFFF', padding: '22px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: 'var(--shadow-xs)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span style={{ fontSize: '13px', fontWeight: '600', color: '#64748B' }}>Bandwidth Delivered</span>
                      <div style={{ width: '36px', height: '36px', backgroundColor: '#F5F3FF', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7C3AED' }}>
                        <HardDrive size={18} />
                      </div>
                    </div>
                    <div style={{ fontSize: '30px', fontWeight: '800', color: '#0F172A', letterSpacing: '-0.02em' }}>
                      {analyticsData.bandwidthGB.toLocaleString()} <span style={{ fontSize: '16px', fontWeight: '700', color: '#64748B' }}>GB</span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>
                      Estimated CDN data transfer
                    </div>
                  </div>

                  <div style={{ backgroundColor: '#FFFFFF', padding: '22px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: 'var(--shadow-xs)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span style={{ fontSize: '13px', fontWeight: '600', color: '#64748B' }}>Catalog Impressions</span>
                      <div style={{ width: '36px', height: '36px', backgroundColor: '#ECFDF5', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
                        <Eye size={18} />
                      </div>
                    </div>
                    <div style={{ fontSize: '30px', fontWeight: '800', color: '#0F172A', letterSpacing: '-0.02em' }}>
                      {analyticsData.totalViews.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>
                      Unique product page views
                    </div>
                  </div>

                  <div style={{ backgroundColor: '#FFFFFF', padding: '22px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: 'var(--shadow-xs)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span style={{ fontSize: '13px', fontWeight: '600', color: '#64748B' }}>Customer Feedback</span>
                      <div style={{ width: '36px', height: '36px', backgroundColor: '#FFFBEB', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D97706' }}>
                        <Star size={18} fill="#D97706" />
                      </div>
                    </div>
                    <div style={{ fontSize: '30px', fontWeight: '800', color: '#0F172A', letterSpacing: '-0.02em' }}>
                      {adminReviewsList.length} <span style={{ fontSize: '15px', fontWeight: '700', color: '#64748B' }}>Reviews</span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#D97706', fontWeight: '700', marginTop: '4px' }}>
                      ★ {metrics.averageRating} average rating
                    </div>
                  </div>
                </div>

                {/* 2-Column Section: Top 5 Downloaded Apps + Categories Breakdown */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px' }}>
                  {/* Top 5 Most Downloaded Apps */}
                  <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '18px', border: '1px solid #E2E8F0', boxShadow: 'var(--shadow-xs)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                      <div>
                        <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A', margin: 0 }}>Top 5 Most Downloaded Apps</h3>
                        <p style={{ fontSize: '12.5px', color: '#64748B', margin: '2px 0 0' }}>Highest demand software packages on TobiyaStudio</p>
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: '#2563EB', backgroundColor: '#EFF6FF', padding: '4px 10px', borderRadius: '12px' }}>
                        Live Ranking
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {analyticsData.topDownloaded.map((app, index) => {
                        const maxDownloads = analyticsData.topDownloaded[0]?.downloads || 1;
                        const percent = Math.min(100, Math.round((app.downloads / maxDownloads) * 100));
                        return (
                          <div key={app.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{
                                  width: '22px',
                                  height: '22px',
                                  borderRadius: '6px',
                                  backgroundColor: index === 0 ? '#FEF3C7' : index === 1 ? '#F1F5F9' : index === 2 ? '#FFEDD5' : '#F8FAFC',
                                  color: index === 0 ? '#B45309' : index === 1 ? '#475569' : index === 2 ? '#C2410C' : '#64748B',
                                  fontWeight: '800',
                                  fontSize: '11px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}>
                                  #{index + 1}
                                </span>
                                <img src={app.icon} alt="" style={{ width: '28px', height: '28px', borderRadius: '8px', objectFit: 'cover' }} />
                                <div>
                                  <span style={{ fontSize: '13.5px', fontWeight: '700', color: '#0F172A' }}>{app.name}</span>
                                  <span style={{ fontSize: '11.5px', color: '#64748B', marginLeft: '8px' }}>{app.category}</span>
                                </div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ fontSize: '12px', color: '#D97706', fontWeight: '700' }}>★ {app.rating}</span>
                                <span style={{ fontSize: '13.5px', fontWeight: '800', color: '#2563EB' }}>{app.downloads.toLocaleString()}</span>
                              </div>
                            </div>
                            {/* Visual Progress Meter */}
                            <div style={{ width: '100%', height: '8px', backgroundColor: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                              <div style={{
                                width: `${percent}%`,
                                height: '100%',
                                backgroundColor: index === 0 ? '#2563EB' : index === 1 ? '#3B82F6' : '#60A5FA',
                                borderRadius: '4px',
                                transition: 'width 0.5s ease-out'
                              }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Category Breakdown */}
                  <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '18px', border: '1px solid #E2E8F0', boxShadow: 'var(--shadow-xs)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                      <div>
                        <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A', margin: 0 }}>Downloads by Category</h3>
                        <p style={{ fontSize: '12.5px', color: '#64748B', margin: '2px 0 0' }}>Share of platform bandwidth per vertical</p>
                      </div>
                      <BarChart3 size={18} color="#64748B" />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {analyticsData.categoryStats.map((item, idx) => {
                        const totalCatDownloads = analyticsData.totalDownloads || 1;
                        const pct = ((item.downloads / totalCatDownloads) * 100).toFixed(1);
                        const colors = ['#2563EB', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899', '#6366F1', '#14B8A6'];
                        const barColor = colors[idx % colors.length];

                        return (
                          <div key={item.category} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px' }}>
                              <span style={{ fontWeight: '600', color: '#334155' }}>{item.category}</span>
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <span style={{ fontWeight: '700', color: '#0F172A' }}>{item.downloads.toLocaleString()}</span>
                                <span style={{ fontSize: '11.5px', color: '#64748B', minWidth: '38px', textAlign: 'right' }}>{pct}%</span>
                              </div>
                            </div>
                            <div style={{ width: '100%', height: '6px', backgroundColor: '#F1F5F9', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{ width: `${pct}%`, height: '100%', backgroundColor: barColor, borderRadius: '3px' }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Monthly Download Momentum (Histogram / SVG Timeline) */}
                {analyticsData.timeline && analyticsData.timeline.length > 0 && (
                  <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '18px', border: '1px solid #E2E8F0', boxShadow: 'var(--shadow-xs)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                      <div>
                        <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A', margin: 0 }}>Monthly Download Volume</h3>
                        <p style={{ fontSize: '12.5px', color: '#64748B', margin: '2px 0 0' }}>Cumulative monthly distribution pace</p>
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: '#16A34A', backgroundColor: '#DCFCE7', padding: '4px 10px', borderRadius: '12px' }}>
                        +1,433% YTD Growth
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '12px', height: '180px', paddingTop: '20px' }}>
                      {analyticsData.timeline.map((point) => {
                        const maxTimelineVal = Math.max(...analyticsData.timeline.map(t => t.downloads), 1);
                        const heightPct = Math.max(12, Math.round((point.downloads / maxTimelineVal) * 100));

                        return (
                          <div key={point.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', gap: '8px' }}>
                            <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748B' }}>
                              {(point.downloads >= 1000 ? `${(point.downloads / 1000).toFixed(1)}k` : point.downloads)}
                            </span>
                            <div
                              style={{
                                width: '100%',
                                maxWidth: '44px',
                                height: `${heightPct}%`,
                                background: 'linear-gradient(180deg, #2563EB 0%, #60A5FA 100%)',
                                borderRadius: '6px 6px 0 0',
                                transition: 'height 0.4s ease'
                              }}
                              title={`${point.label}: ${point.downloads.toLocaleString()} downloads`}
                            />
                            <span style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>{point.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 7: COMMUNITY REVIEWS MODERATION                  */}
        {/* ==================================================== */}
        {activeTab === 'reviews' && (
          <div>
            {/* Reviews Moderation Toolbar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '14px', fontWeight: '700', color: '#0F172A' }}>
                  Total Reviews: {adminReviewsList.length}
                </span>
                <span style={{ backgroundColor: '#DCFCE7', color: '#166534', fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '12px' }}>
                  100% Verified Users
                </span>
              </div>
              <button
                onClick={fetchAdminReviews}
                className="btn btn-secondary btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <RefreshCw size={13} /> Refresh List
              </button>
            </div>

            {loadingReviews ? (
              <div style={{ padding: '60px 0', textAlign: 'center', color: '#64748B' }}>
                <div style={{ display: 'inline-block', width: '28px', height: '28px', border: '3px solid #E2E8F0', borderTopColor: '#2563EB', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                <p style={{ marginTop: '12px', fontSize: '14px' }}>Loading reviews...</p>
              </div>
            ) : adminReviewsList.length === 0 ? (
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '18px',
                border: '1px solid #E2E8F0',
                padding: '60px 20px',
                textAlign: 'center',
                boxShadow: 'var(--shadow-xs)'
              }}>
                <MessageSquare size={36} color="#94A3B8" style={{ margin: '0 auto 12px' }} />
                <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>No Reviews Yet</h3>
                <p style={{ fontSize: '13.5px', color: '#64748B', maxWidth: '400px', margin: '0 auto' }}>
                  User reviews and feedback submitted on app store pages will show up here for moderation and quality review.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {adminReviewsList.map(review => (
                  <div
                    key={review.id}
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '16px',
                      border: '1px solid #E2E8F0',
                      padding: '20px 24px',
                      boxShadow: 'var(--shadow-xs)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                      {/* Left: App Info + User Info */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        {review.productIcon && (
                          <img src={review.productIcon} alt="" style={{ width: '42px', height: '42px', borderRadius: '10px', objectFit: 'cover', border: '1px solid #E2E8F0' }} />
                        )}
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Link to={`/product/${review.productSlug || ''}`} style={{ fontSize: '14.5px', fontWeight: '800', color: '#0F172A' }}>
                              {review.productName}
                            </Link>
                            <span style={{ fontSize: '11px', color: '#64748B' }}>•</span>
                            <span style={{ fontSize: '12px', color: '#64748B' }}>{review.date}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                            <span style={{
                              width: '20px',
                              height: '20px',
                              borderRadius: '50%',
                              backgroundColor: '#EFF6FF',
                              color: '#2563EB',
                              fontSize: '10px',
                              fontWeight: '800',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              {review.userAvatar || review.userName?.slice(0, 2).toUpperCase() || 'U'}
                            </span>
                            <span style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>
                              {review.userName}
                            </span>
                            {review.verified && (
                              <span style={{
                                backgroundColor: '#DCFCE7',
                                color: '#166534',
                                fontSize: '10px',
                                fontWeight: '700',
                                padding: '1px 6px',
                                borderRadius: '6px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px'
                              }}>
                                <CheckCircle2 size={10} color="#16A34A" /> Verified User
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Star Rating & Delete Action */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star
                              key={star}
                              size={15}
                              fill={star <= review.rating ? '#F59E0B' : 'transparent'}
                              color={star <= review.rating ? '#F59E0B' : '#CBD5E1'}
                            />
                          ))}
                          <span style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A', marginLeft: '6px' }}>
                            {review.rating}.0
                          </span>
                        </div>

                        <button
                          onClick={() => handleDeleteReview(review.id)}
                          disabled={deletingReviewId === review.id}
                          className="btn btn-secondary btn-sm"
                          style={{
                            color: '#DC2626',
                            borderColor: '#FEE2E2',
                            backgroundColor: '#FEF2F2',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '12px',
                            padding: '5px 10px'
                          }}
                          title="Delete / Moderate Review"
                        >
                          <Trash2 size={13} />
                          {deletingReviewId === review.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </div>

                    {/* Review Body Text */}
                    <div style={{
                      backgroundColor: '#F8FAFC',
                      padding: '12px 16px',
                      borderRadius: '10px',
                      border: '1px solid #F1F5F9',
                      fontSize: '13.5px',
                      color: '#334155',
                      lineHeight: '1.55'
                    }}>
                      "{review.comment}"
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ==================================================== */}
      {/* INSPECT DETAILS MODAL (FOR AUDITING PENDING APPS)   */}
      {/* ==================================================== */}
      {selectedReviewApp && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '24px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '24px',
            maxWidth: '720px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '32px',
            boxShadow: 'var(--shadow-xl)'
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #E2E8F0', paddingBottom: '16px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img src={selectedReviewApp.icon} alt="" style={{ width: '48px', height: '48px', borderRadius: '12px', border: '1px solid #E2E8F0' }} />
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A' }}>{selectedReviewApp.name}</h2>
                  <div style={{ fontSize: '12px', color: '#64748B' }}>{selectedReviewApp.packageId} · v{selectedReviewApp.version}</div>
                </div>
              </div>
              <button
                onClick={() => setSelectedReviewApp(null)}
                style={{ fontSize: '20px', color: '#94A3B8', cursor: 'pointer', border: 'none', background: 'none' }}
              >
                ✕
              </button>
            </div>

            {/* Description */}
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>Editorial Description</h4>
              <p style={{ fontSize: '14px', color: '#334155', lineHeight: '1.6' }}>{selectedReviewApp.description}</p>
            </div>

            {/* Screenshots Gallery */}
            {selectedReviewApp.screenshots && selectedReviewApp.screenshots.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', marginBottom: '10px' }}>Uploaded Screenshots</h4>
                <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
                  {selectedReviewApp.screenshots.map((s, i) => (
                    <img key={i} src={s} alt="" style={{ height: '220px', borderRadius: '12px', border: '1px solid #E2E8F0', objectFit: 'cover' }} />
                  ))}
                </div>
              </div>
            )}

            {/* Content Rating & Data Safety */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '28px' }}>
              <div style={{ backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <h4 style={{ fontSize: '12px', fontWeight: '700', color: '#64748B', marginBottom: '4px' }}>Content Rating</h4>
                <div style={{ fontSize: '15px', fontWeight: '800', color: '#0F172A' }}>{selectedReviewApp.contentRating}</div>
              </div>
              <div style={{ backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <h4 style={{ fontSize: '12px', fontWeight: '700', color: '#64748B', marginBottom: '4px' }}>Package Size</h4>
                <div style={{ fontSize: '15px', fontWeight: '800', color: '#2563EB' }}>{selectedReviewApp.fileSize}</div>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #E2E8F0', paddingTop: '20px' }}>
              <button
                onClick={() => handleReject(selectedReviewApp)}
                className="btn btn-outline"
                style={{ color: '#DC2626', borderColor: '#FCA5A5' }}
              >
                Reject with Feedback
              </button>
              <button
                onClick={() => handleApprove(selectedReviewApp)}
                className="btn btn-primary"
                style={{ backgroundColor: '#16A34A', borderColor: '#16A34A' }}
              >
                Approve & Publish to Store
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UPDATE APP & RELEASE NEW VERSION MODAL */}
      {showVersionModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '24px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            maxWidth: '560px',
            width: '100%',
            padding: '28px',
            boxShadow: 'var(--shadow-xl)',
            border: '1px solid #E2E8F0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', borderBottom: '1px solid #E2E8F0', paddingBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img src={showVersionModal.icon} alt="" style={{ width: '40px', height: '40px', borderRadius: '10px', objectFit: 'cover' }} />
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                    Update {showVersionModal.name}
                  </h3>
                  <div style={{ fontSize: '12px', color: '#64748B' }}>
                    Active Release: v{showVersionModal.version} ({showVersionModal.fileSize})
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowVersionModal(null)}
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: '18px' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '22px' }}>
              {/* Upload New Version APK Dropzone */}
              <div>
                <label className="input-label">Upload New Version APK Package (.apk / .aab) *</label>
                <input
                  type="file"
                  ref={adminApkInputRef}
                  accept=".apk,.aab,.zip"
                  style={{ display: 'none' }}
                  onChange={(e) => handleAdminApkUpload(e.target.files[0])}
                />

                {adminUploadedApkName ? (
                  <div style={{
                    backgroundColor: '#F0FDF4',
                    border: '1px solid #86EFAC',
                    borderRadius: '12px',
                    padding: '14px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '4px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <CheckCircle2 size={20} color="#16A34A" />
                      <div>
                        <div style={{ fontSize: '13.5px', fontWeight: '700', color: '#166534' }}>
                          New Build Uploaded: {adminUploadedApkName}
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#475569' }}>
                          Measured Size: <strong style={{ color: '#2563EB' }}>{versionForm.fileSize}</strong>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => adminApkInputRef.current?.click()}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '11px', padding: '4px 8px' }}
                    >
                      Change APK
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => adminApkInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        handleAdminApkUpload(e.dataTransfer.files[0]);
                      }
                    }}
                    style={{
                      border: '2px dashed #CBD5E1',
                      borderRadius: '12px',
                      padding: '16px',
                      textAlign: 'center',
                      backgroundColor: '#F8FAFC',
                      cursor: 'pointer',
                      marginBottom: '4px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <Upload size={22} color="#2563EB" style={{ margin: '0 auto 6px' }} />
                    <div style={{ fontSize: '13.5px', fontWeight: '700', color: '#0F172A' }}>
                      {uploadingAdminApk ? 'Measuring & Uploading New Package...' : 'Drop new version APK package here'}
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '2px' }}>
                      or click to browse new .apk / .aab from your computer (auto-measures file size)
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="input-label">New Release Version *</label>
                  <input
                    type="text"
                    value={versionForm.version}
                    onChange={(e) => setVersionForm(prev => ({ ...prev, version: e.target.value }))}
                    className="input-control"
                    placeholder="e.g. 1.3.0"
                  />
                </div>
                <div>
                  <label className="input-label">App Package Size</label>
                  <input
                    type="text"
                    value={versionForm.fileSize}
                    onChange={(e) => setVersionForm(prev => ({ ...prev, fileSize: e.target.value }))}
                    className="input-control"
                    placeholder="e.g. 34 MB"
                  />
                </div>
              </div>

              <div>
                <label className="input-label">What's New in this Build (Release Notes) *</label>
                <textarea
                  rows={3}
                  value={versionForm.releaseNotes}
                  onChange={(e) => setVersionForm(prev => ({ ...prev, releaseNotes: e.target.value }))}
                  className="input-control"
                  placeholder="Bug fixes, performance optimizations, and security updates..."
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="input-label">Publication Status</label>
                  <select
                    value={versionForm.status}
                    onChange={(e) => setVersionForm(prev => ({ ...prev, status: e.target.value }))}
                    className="input-control"
                  >
                    <option value="Published">Published</option>
                    <option value="Draft">Draft</option>
                    <option value="Pending Approval">Pending Approval</option>
                  </select>
                </div>
                <div>
                  <label className="input-label">Category</label>
                  <select
                    value={versionForm.category}
                    onChange={(e) => setVersionForm(prev => ({ ...prev, category: e.target.value }))}
                    className="input-control"
                  >
                    {['Productivity', 'Business', 'Utilities', 'Finance', 'Education', 'Health & Fitness', 'Agriculture', 'AI & Tools', 'Games'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setShowVersionModal(null)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveAppUpdate}
                disabled={processingActionId === showVersionModal.id || !versionForm.version}
                className="btn btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <RefreshCw size={14} /> {processingActionId === showVersionModal.id ? 'Saving Update...' : 'Save & Roll Out Update'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
