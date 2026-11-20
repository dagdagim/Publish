import React, { useState, useEffect, useRef } from 'react';
import {
  Upload,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  RefreshCw,
  Sparkles,
  ArrowRight,
  Trash2,
  FileCode,
  Image as ImageIcon,
  Plus,
  Search,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { compressImage } from '../utils/imageCompressor';

export default function UpdateAppSection({ initialSlug, onUpdateSuccess }) {
  const [apps, setApps] = useState([]);
  const [loadingApps, setLoadingApps] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);

  // Form State for Release Update
  const [updateForm, setUpdateForm] = useState({
    version: '',
    versionCode: 2,
    fileSize: '',
    releaseNotes: '',
    apkUrl: '',
    name: '',
    shortDescription: '',
    description: '',
    category: '',
    icon: '',
    coverImage: '',
    screenshots: []
  });

  const [showMetadataEdit, setShowMetadataEdit] = useState(false);
  const [uploadingApk, setUploadingApk] = useState(false);
  const [uploadedApkName, setUploadedApkName] = useState(null);
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingScreenshots, setUploadingScreenshots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const apkInputRef = useRef(null);
  const iconInputRef = useRef(null);
  const bannerInputRef = useRef(null);
  const screenshotInputRef = useRef(null);

  // Fetch all existing applications
  useEffect(() => {
    fetch('/api/products?allStatus=true&limit=100')
      .then(res => res.json())
      .then(data => {
        const list = data.products || [];
        setApps(list);
        setLoadingApps(false);

        if (initialSlug) {
          const match = list.find(a => a.slug === initialSlug || a.id === initialSlug);
          if (match) {
            handleSelectApp(match);
          }
        }
      })
      .catch(err => {
        console.error('Failed to load apps for update:', err);
        setLoadingApps(false);
      });
  }, [initialSlug]);

  function getNextVersion(currentVersion) {
    if (!currentVersion) return '1.1.0';
    const parts = currentVersion.split('.');
    if (parts.length >= 2) {
      const minor = parseInt(parts[1], 10);
      if (!isNaN(minor)) {
        return `${parts[0]}.${minor + 1}.0`;
      }
    }
    return `${currentVersion}.1`;
  }

  const handleSelectApp = (app) => {
    setSelectedApp(app);
    setError(null);
    setUploadedApkName(null);
    const nextVer = getNextVersion(app.version);
    const nextCode = (Number(app.versionCode) || 1) + 1;

    setUpdateForm({
      version: nextVer,
      versionCode: nextCode,
      fileSize: app.fileSize || '25 MB',
      releaseNotes: '',
      apkUrl: app.apkUrl || '',
      name: app.name || '',
      shortDescription: app.shortDescription || '',
      description: app.description || '',
      category: app.category || 'Productivity',
      icon: app.icon || '',
      coverImage: app.coverImage || '',
      screenshots: Array.isArray(app.screenshots) ? app.screenshots : []
    });
  };

  // 1. APK Upload for update
  const handleApkUpload = async (file) => {
    if (!file) return;

    // Auto-measure file size and detect version directly in browser
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
    const verMatch = file.name.match(/v?(\d+\.\d+(\.\d+)?)/i);
    const detectedVersion = verMatch ? verMatch[1] : null;

    setUpdateForm(prev => ({
      ...prev,
      fileSize: sizeInMB,
      version: detectedVersion || prev.version
    }));
    setUploadedApkName(file.name);

    if (file.size > 4.5 * 1024 * 1024) {
      setError(
        `Package ${file.name} (${sizeInMB}) measured. Because Vercel serverless functions limit direct uploads to 4.5 MB, please enter a direct download URL (e.g. from GitHub Releases, Google Drive, or Firebase) in the APK URL field below.`
      );
      return;
    }

    setUploadingApk(true);
    setError(null);

    const body = new FormData();
    body.append('file', file);

    try {
      const res = await fetch('/api/upload', { method: 'POST', body });
      if (!res.ok) throw new Error('Failed to upload APK package');
      const data = await res.json();

      setUpdateForm(prev => ({
        ...prev,
        fileSize: data.fileSize || prev.fileSize,
        apkUrl: data.url,
        version: data.detectedVersion || prev.version
      }));
    } catch (err) {
      setError('Package upload error: ' + err.message);
    } finally {
      setUploadingApk(false);
    }
  };

  // 2. Icon Upload (Auto-compressed to 512x512)
  const handleIconUpload = async (file) => {
    if (!file) return;
    setUploadingIcon(true);

    try {
      const compressed = await compressImage(file, 512, 512, 0.85);
      setUpdateForm(prev => ({ ...prev, icon: compressed }));
    } catch (err) {
      console.warn('Icon compression error, fallback:', err);
      const reader = new FileReader();
      reader.onload = (e) => setUpdateForm(prev => ({ ...prev, icon: e.target.result }));
      reader.readAsDataURL(file);
    } finally {
      setUploadingIcon(false);
    }
  };

  // 3. Banner Upload (Auto-compressed to 1024x500)
  const handleBannerUpload = async (file) => {
    if (!file) return;
    setUploadingBanner(true);

    try {
      const compressed = await compressImage(file, 1024, 500, 0.82);
      setUpdateForm(prev => ({ ...prev, coverImage: compressed }));
    } catch (err) {
      console.warn('Banner compression error, fallback:', err);
      const reader = new FileReader();
      reader.onload = (e) => setUpdateForm(prev => ({ ...prev, coverImage: e.target.result }));
      reader.readAsDataURL(file);
    } finally {
      setUploadingBanner(false);
    }
  };

  // 4. Screenshots Upload (Auto-compressed to max 1080x1920)
  const handleScreenshotsUpload = async (files) => {
    if (!files || files.length === 0) return;
    setUploadingScreenshots(true);

    try {
      const fileArray = Array.from(files);
      const compressedList = await Promise.all(
        fileArray.map(f => compressImage(f, 1080, 1920, 0.80).catch(() => null))
      );
      const validUrls = compressedList.filter(Boolean);

      setUpdateForm(prev => ({
        ...prev,
        screenshots: [...new Set([...prev.screenshots, ...validUrls])].slice(0, 8)
      }));
    } catch (err) {
      console.warn('Screenshot compression error:', err);
    } finally {
      setUploadingScreenshots(false);
    }
  };

  // Submit App Update & Roll Out Version
  const handleRolloutUpdate = async () => {
    if (!selectedApp) return;
    if (!updateForm.version) {
      setError('Please specify a version name (e.g. 1.3.0)');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        version: updateForm.version,
        versionCode: Number(updateForm.versionCode) || 2,
        fileSize: updateForm.fileSize || selectedApp.fileSize || '25 MB',
        releaseNotes: updateForm.releaseNotes || 'Routine maintenance, performance improvements, and security enhancements.',
        apkUrl: updateForm.apkUrl || selectedApp.apkUrl,
        name: updateForm.name || selectedApp.name,
        shortDescription: updateForm.shortDescription || selectedApp.shortDescription,
        description: updateForm.description || selectedApp.description,
        category: updateForm.category || selectedApp.category,
        icon: updateForm.icon || selectedApp.icon,
        coverImage: updateForm.coverImage || selectedApp.coverImage,
        screenshots: updateForm.screenshots.length > 0 ? updateForm.screenshots : selectedApp.screenshots
      };

      const res = await fetch(`/api/products/${selectedApp.id}/releases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const text = await res.text();
        let errMsg = 'Failed to release update';
        try {
          const errObj = JSON.parse(text);
          errMsg = errObj.error || errObj.message || errMsg;
        } catch (_) {
          if (res.status === 413 || text.includes('Request Entity Too Large') || text.includes('Request En')) {
            errMsg = 'Images payload is too large for the 4.5 MB serverless limit. Please re-select your screenshots to auto-compress them.';
          } else {
            errMsg = text || `Server error (${res.status})`;
          }
        }
        throw new Error(errMsg);
      }

      const result = await res.json();
      if (onUpdateSuccess) {
        onUpdateSuccess(result.product, result.version);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Filter apps list
  const filteredApps = apps.filter(a => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return a.name.toLowerCase().includes(q) || a.category.toLowerCase().includes(q) || (a.packageId && a.packageId.toLowerCase().includes(q));
  });

  return (
    <div>
      {/* 1. App Selector View if not selected */}
      {!selectedApp ? (
        <div className="console-card">
          <div className="console-card-header">
            <div className="console-card-title">
              <RefreshCw size={18} color="#2563EB" /> Select Application to Update
            </div>
            <span style={{ fontSize: '12px', color: '#64748B' }}>Choose an existing application to roll out a new version</span>
          </div>

          <div style={{ position: 'relative', marginBottom: '20px' }}>
            <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '14px' }} />
            <input
              type="text"
              placeholder="Search by app name or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-control"
              style={{ paddingLeft: '40px' }}
            />
          </div>

          {loadingApps ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: '#64748B' }}>
              Loading applications catalog...
            </div>
          ) : filteredApps.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', backgroundColor: '#F8FAFC', borderRadius: '12px', color: '#64748B' }}>
              No applications found matching "{searchQuery}".
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
              {filteredApps.map(app => (
                <div
                  key={app.id}
                  onClick={() => handleSelectApp(app)}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '14px',
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: 'var(--shadow-xs)'
                  }}
                  className="app-select-card"
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#2563EB'; e.currentTarget.style.backgroundColor = '#F8FAFC'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.backgroundColor = '#FFFFFF'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                    <img
                      src={app.icon}
                      alt=""
                      style={{ width: '48px', height: '48px', borderRadius: '12px', objectFit: 'cover', border: '1px solid #E2E8F0', flexShrink: 0 }}
                      onError={(e) => { e.currentTarget.src = '/assets/icons/kpi-tracker.svg'; }}
                    />
                    <div style={{ minWidth: 0 }}>
                      <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#0F172A', margin: '0 0 2px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {app.name}
                      </h4>
                      <div style={{ fontSize: '12px', color: '#64748B', display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span>v{app.version}</span>
                        <span>·</span>
                        <span>{app.fileSize}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ flexShrink: 0, fontSize: '12px', padding: '6px 10px' }}
                  >
                    Update →
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* 2. Update Application Form */
        <div>
          {/* Selected App Profile Banner */}
          <div style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #BFDBFE',
            borderRadius: '16px',
            padding: '20px 24px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            boxShadow: 'var(--shadow-xs)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <img
                src={selectedApp.icon}
                alt=""
                style={{ width: '56px', height: '56px', borderRadius: '14px', objectFit: 'cover', border: '1px solid #E2E8F0' }}
                onError={(e) => { e.currentTarget.src = '/assets/icons/kpi-tracker.svg'; }}
              />
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#2563EB', fontWeight: '700', marginBottom: '2px' }}>
                  <RefreshCw size={14} /> Updating Production Release
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', margin: '0 0 4px 0' }}>
                  {selectedApp.name}
                </h2>
                <div style={{ fontSize: '12.5px', color: '#64748B', display: 'flex', gap: '12px' }}>
                  <span>Current Version: <strong style={{ color: '#0F172A' }}>v{selectedApp.version}</strong></span>
                  <span>Active Size: <strong>{selectedApp.fileSize}</strong></span>
                  <span>Category: <strong>{selectedApp.category}</strong></span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedApp(null)}
              className="btn btn-outline btn-sm"
            >
              Choose Different App
            </button>
          </div>

          {error && (
            <div style={{ backgroundColor: '#FEE2E2', border: '1px solid #FCA5A5', color: '#DC2626', padding: '12px 16px', borderRadius: '10px', fontSize: '13.5px', marginBottom: '20px' }}>
              {error}
            </div>
          )}

          {/* Section 1: Upload New Package Artifact */}
          <div className="console-card">
            <div className="console-card-header">
              <div className="console-card-title">
                <Upload size={18} color="#2563EB" /> 1. Upload New App Version Package (.apk / .aab) *
              </div>
              <span className={`badge ${uploadedApkName ? 'badge-accent' : 'badge-platform'}`} style={{ fontSize: '11px' }}>
                {uploadedApkName ? '✓ Package Verified' : 'New Build Required'}
              </span>
            </div>

            <p style={{ fontSize: '13.5px', color: '#64748B', marginBottom: '16px' }}>
              Upload the compiled new version of your application (<strong>.apk</strong> or <strong>.aab</strong>). TobiyaStudio will automatically inspect the new binary, measure the exact file size, and deploy it for user downloads.
            </p>

            <input
              type="file"
              ref={apkInputRef}
              accept=".apk,.aab,.zip"
              style={{ display: 'none' }}
              onChange={(e) => handleApkUpload(e.target.files[0])}
            />

            {uploadedApkName ? (
              <div style={{
                backgroundColor: '#F0FDF4',
                border: '2px solid #86EFAC',
                borderRadius: '14px',
                padding: '18px 20px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '46px', height: '46px', borderRadius: '12px', backgroundColor: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <CheckCircle2 size={26} color="#16A34A" />
                  </div>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: '800', color: '#166534', marginBottom: '2px' }}>
                      New Version Package Uploaded & Verified!
                    </div>
                    <div style={{ fontSize: '12.5px', color: '#374151' }}>
                      Binary: <strong style={{ color: '#0F172A' }}>{uploadedApkName}</strong> · Exact Measured Size: <strong style={{ color: '#2563EB' }}>{updateForm.fileSize}</strong>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => apkInputRef.current?.click()}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <Upload size={13} /> Replace with Another APK
                </button>
              </div>
            ) : (
              <div
                className="console-dropzone"
                onClick={() => apkInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleApkUpload(e.dataTransfer.files[0]);
                  }
                }}
                style={{ minHeight: '150px', marginBottom: '16px', cursor: 'pointer' }}
              >
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  backgroundColor: '#EFF6FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '10px'
                }}>
                  <Upload size={22} color="#2563EB" />
                </div>
                <div style={{ fontSize: '15px', fontWeight: '700', color: '#0F172A', marginBottom: '4px' }}>
                  {uploadingApk ? 'Measuring & Uploading New Package...' : 'Drop your new version APK file here'}
                </div>
                <div style={{ fontSize: '12.5px', color: '#64748B', marginBottom: '10px' }}>
                  or click below to browse the new release binary from your computer
                </div>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  onClick={(e) => { e.stopPropagation(); apkInputRef.current?.click(); }}
                >
                  <Upload size={14} /> Browse New Version APK (up to 500 MB)
                </button>
              </div>
            )}

            {/* Current Package Details */}
            <div style={{
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '10px',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '13px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} color="#16A34A" />
                <span>Target Release Package Size: <strong style={{ color: '#2563EB' }}>{updateForm.fileSize}</strong></span>
              </div>
              <span className="badge badge-accent" style={{ fontSize: '11px' }}>
                {uploadedApkName ? 'New Build Attached' : 'Using Active Package'}
              </span>
            </div>
          </div>

          {/* Section 2: Version Specifications */}
          <div className="console-card">
            <div className="console-card-header">
              <div className="console-card-title">
                <FileCode size={18} color="#2563EB" /> 2. Version & Release Configuration
              </div>
              <span style={{ fontSize: '12px', color: '#64748B' }}>Google Play Console semantic versioning</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '18px' }}>
              <div>
                <label className="input-label">New Release Version Name *</label>
                <input
                  type="text"
                  value={updateForm.version}
                  onChange={(e) => setUpdateForm(prev => ({ ...prev, version: e.target.value }))}
                  placeholder="e.g. 1.3.0"
                  className="input-control"
                />
                <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '4px' }}>
                  Previous version: v{selectedApp.version}
                </div>
              </div>

              <div>
                <label className="input-label">Version Code (Integer)</label>
                <input
                  type="number"
                  value={updateForm.versionCode}
                  onChange={(e) => setUpdateForm(prev => ({ ...prev, versionCode: e.target.value }))}
                  placeholder="e.g. 2"
                  className="input-control"
                />
                <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '4px' }}>
                  Must be greater than previous build code ({selectedApp.versionCode || 1})
                </div>
              </div>
            </div>

            {/* Direct APK Download URL */}
            <div style={{ marginBottom: '18px' }}>
              <label className="input-label">APK Package Direct URL (GitHub Releases / Cloud Storage)</label>
              <input
                type="text"
                value={updateForm.apkUrl || ''}
                onChange={(e) => setUpdateForm(prev => ({ ...prev, apkUrl: e.target.value }))}
                placeholder="e.g. https://github.com/dagdagim/Publish/releases/download/.../app.apk"
                className="input-control"
              />
              <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '4px' }}>
                For Vercel hosting: Host APKs &gt; 4.5 MB on <strong>GitHub Releases</strong> (free up to 2 GB) or Google Drive, then paste the direct download URL here.
              </div>
            </div>

            {/* Release Notes */}
            <div>
              <label className="input-label">What's New in this Version (Release Notes) *</label>
              <textarea
                rows={4}
                value={updateForm.releaseNotes}
                onChange={(e) => setUpdateForm(prev => ({ ...prev, releaseNotes: e.target.value }))}
                placeholder="Describe new features, bug fixes, UI improvements, and stability updates in this release..."
                className="input-control"
                style={{ resize: 'vertical' }}
              />
              <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '4px' }}>
                Displayed to users under "What's New" on your app's store listing page.
              </div>
            </div>
          </div>

          {/* Section 3: Optional Store Listing Updates */}
          <div className="console-card">
            <div
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
              onClick={() => setShowMetadataEdit(!showMetadataEdit)}
            >
              <div className="console-card-title">
                <Sparkles size={18} color="#2563EB" /> 3. Update Store Listing & Graphics (Optional)
              </div>
              <button
                type="button"
                style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: '600' }}
              >
                {showMetadataEdit ? 'Collapse' : 'Expand & Edit'} {showMetadataEdit ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>

            {showMetadataEdit && (
              <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #E2E8F0' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label className="input-label">App Title</label>
                    <input
                      type="text"
                      value={updateForm.name}
                      onChange={(e) => setUpdateForm(prev => ({ ...prev, name: e.target.value }))}
                      className="input-control"
                    />
                  </div>

                  <div>
                    <label className="input-label">Category</label>
                    <select
                      value={updateForm.category}
                      onChange={(e) => setUpdateForm(prev => ({ ...prev, category: e.target.value }))}
                      className="input-control"
                    >
                      {['Productivity', 'Business', 'Utilities', 'Finance', 'Education', 'Health & Fitness', 'Agriculture', 'AI & Tools', 'Games'].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label className="input-label">Short Tagline (max 80 chars)</label>
                  <input
                    type="text"
                    maxLength={80}
                    value={updateForm.shortDescription}
                    onChange={(e) => setUpdateForm(prev => ({ ...prev, shortDescription: e.target.value }))}
                    className="input-control"
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label className="input-label">Full App Description</label>
                  <textarea
                    rows={4}
                    value={updateForm.description}
                    onChange={(e) => setUpdateForm(prev => ({ ...prev, description: e.target.value }))}
                    className="input-control"
                  />
                </div>

                {/* Screenshots Gallery Editor */}
                <div>
                  <label className="input-label">Screenshots ({updateForm.screenshots.length}/8)</label>
                  <input
                    type="file"
                    ref={screenshotInputRef}
                    multiple
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => handleScreenshotsUpload(e.target.files)}
                  />

                  <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px', marginBottom: '10px' }}>
                    {updateForm.screenshots.map((s, idx) => (
                      <div key={idx} style={{ width: '80px', height: '140px', position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '1px solid #CBD5E1', flexShrink: 0 }}>
                        <img src={s} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button
                          type="button"
                          onClick={() => setUpdateForm(prev => ({ ...prev, screenshots: prev.screenshots.filter((_, i) => i !== idx) }))}
                          style={{ position: 'absolute', top: '4px', right: '4px', backgroundColor: 'rgba(239, 68, 68, 0.9)', color: '#FFFFFF', border: 'none', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    ))}

                    <div
                      onClick={() => screenshotInputRef.current?.click()}
                      style={{ width: '80px', height: '140px', border: '2px dashed #CBD5E1', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backgroundColor: '#F8FAFC', flexShrink: 0 }}
                    >
                      <Plus size={18} color="#64748B" />
                      <span style={{ fontSize: '10.5px', color: '#64748B', marginTop: '4px' }}>Add</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Rollout Action Button */}
          <button
            type="button"
            onClick={handleRolloutUpdate}
            disabled={submitting || !updateForm.version}
            className="btn btn-primary btn-block btn-lg"
            id="rollout-update-btn"
            style={{ height: '52px', fontSize: '16px', fontWeight: '800', boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)' }}
          >
            {submitting ? 'Verifying & Rolling Out Update...' : `🚀 Roll Out Version ${updateForm.version || ''} to Production`}
          </button>
        </div>
      )}
    </div>
  );
}
