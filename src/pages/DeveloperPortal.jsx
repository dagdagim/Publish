import React, { useState, useRef, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ShieldCheck,
  Upload,
  CheckCircle2,
  AlertCircle,
  Eye,
  FileCode,
  Image as ImageIcon,
  Smartphone,
  Info,
  HelpCircle,
  Trash2,
  Plus,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Layers,
  Lock,
  Globe,
  Radio,
  ExternalLink,
  ChevronRight,
  Clock,
  RefreshCw
} from 'lucide-react';
import ProductCard from '../components/ProductCard';
import UpdateAppSection from '../components/UpdateAppSection';
import { compressImage } from '../utils/imageCompressor';

export default function DeveloperPortal({ isAdminMode = false, onPublished }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const updateSlug = searchParams.get('update');
  const [portalMode, setPortalMode] = useState(updateSlug ? 'update' : 'new');

  useEffect(() => {
    if (updateSlug) {
      setPortalMode('update');
    }
  }, [updateSlug]);

  const [currentStep, setCurrentStep] = useState(1); // 1: Store Listing, 2: Releases, 3: App Content, 4: Review & Rollout
  const [submitting, setSubmitting] = useState(false);
  const [successProduct, setSuccessProduct] = useState(null);

  // File Upload State
  const [uploadingApk, setUploadingApk] = useState(false);
  const [uploadedApkFile, setUploadedApkFile] = useState(null);
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingScreenshots, setUploadingScreenshots] = useState(false);
  const [apkError, setApkError] = useState(null);

  // Hidden File Input Refs
  const apkInputRef = useRef(null);
  const iconInputRef = useRef(null);
  const bannerInputRef = useRef(null);
  const screenshotInputRef = useRef(null);

  // Form State - Starts clean for real app publication
  const [formData, setFormData] = useState({
    // Step 1: Store Listing
    name: '',
    shortDescription: '',
    description: '',
    category: 'Productivity',
    platform: 'Android',
    tags: '',
    icon: '',
    coverImage: '',
    screenshots: [],
    features: [],

    // Step 2: App Releases & Package (Auto-populated on upload)
    version: '1.0.0',
    versionCode: '1',
    fileSize: '',
    fileSizeBytes: 0,
    apkUrl: '',
    packageId: '',
    minRequirement: 'Android 8.0+ (API 26)',
    targetSdk: 'Android 14 (API 34)',
    track: 'Production',
    releaseNotes: '',
    webUrl: '',

    // Step 3: App Content & Policy Questionnaires
    privacyPolicyUrl: '',
    adsDeclaration: {
      hasAds: false,
      adFormats: []
    },
    appAccess: {
      isRestricted: false,
      instructions: ''
    },
    targetAudience: {
      ageBrackets: ['13-17', '18+'],
      appealsToChildren: false,
      familyProgram: false
    },
    contentRatingQuestions: {
      violence: 'none', // none | mild | realistic
      sexuality: 'no', // no | mild | explicit
      language: 'no', // no | mild | crude
      substances: 'no', // no | alcohol_tobacco | illicit
      userInteraction: 'no', // no | chat_messaging
      locationSharing: 'no', // no | yes
      inAppPurchases: 'no' // no | yes
    },
    dataSafety: {
      collectsData: false,
      encryptedInTransit: true,
      deletionRequested: true,
      collectedTypes: ['Diagnostics & Performance']
    },
    governmentApp: 'no'
  });

  const [newFeature, setNewFeature] = useState('');

  // Handle Text Changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Dynamic IARC Content Rating Calculation
  const calculateContentRating = () => {
    const q = formData.contentRatingQuestions;
    if (q.violence === 'realistic' || q.sexuality === 'explicit' || q.substances === 'illicit') {
      return { rating: 'Mature 17+ (PEGI 18)', badge: '17+', color: '#DC2626', desc: 'Contains realistic violence, explicit themes or substance references.' };
    }
    if (q.violence === 'mild' || q.language === 'crude' || q.userInteraction === 'chat_messaging') {
      return { rating: 'Teen 13+ (PEGI 12)', badge: '13+', color: '#EA580C', desc: 'Suitable for ages 13 and older. May contain mild cartoon violence or online chat.' };
    }
    if (q.language === 'mild' || q.inAppPurchases === 'yes') {
      return { rating: 'Everyone 10+ (PEGI 7)', badge: '10+', color: '#D97706', desc: 'Suitable for ages 10 and older. May contain mild fantasy violence or digital purchases.' };
    }
    return { rating: 'Everyone (PEGI 3)', badge: '3+', color: '#16A34A', desc: 'Suitable for all ages. Contains no offensive or violent material.' };
  };

  const calculatedRating = calculateContentRating();

  // Features list helpers
  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (index) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  // 1. APK / Package File Upload & Auto Size Calculation
  const handleApkUpload = async (file) => {
    if (!file) return;

    // Auto-measure file size and detect package info directly in browser
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
    const verMatch = file.name.match(/v?(\d+\.\d+(\.\d+)?)/i);
    const detectedVer = verMatch ? verMatch[1] : null;
    const cleanBase = file.name.replace(/\.[^/.]+$/, '').toLowerCase().replace(/[^a-z0-9]/g, '');

    setFormData(prev => ({
      ...prev,
      fileSize: sizeInMB,
      fileSizeBytes: file.size,
      version: detectedVer || prev.version,
      packageId: prev.packageId || `com.tobiyastudio.${cleanBase || 'app'}`,
      name: prev.name || file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')
    }));
    setUploadedApkFile(file);

    // Vercel Serverless Functions have a strict 4.5 MB request payload limit
    if (file.size > 4.5 * 1024 * 1024) {
      setApkError(
        `Package ${file.name} (${sizeInMB}) measured. Because Vercel serverless functions limit direct uploads to 4.5 MB, please enter a direct download URL (e.g. from GitHub Releases, Google Drive, or Firebase) in the APK URL field below.`
      );
      return;
    }

    setUploadingApk(true);
    setApkError(null);

    const body = new FormData();
    body.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body
      });

      if (!res.ok) throw new Error('Failed to upload app package');
      const data = await res.json();

      // Automatically populate app size and detected package info!
      setFormData(prev => ({
        ...prev,
        fileSize: data.fileSize || '25 MB',
        fileSizeBytes: data.bytes || file.size,
        apkUrl: data.url,
        version: data.detectedVersion || prev.version,
        versionCode: data.versionCode ? String(data.versionCode) : prev.versionCode,
        packageId: data.packageId || prev.packageId || `com.tobiyastudio.${file.name.replace(/\.[^/.]+$/, '').toLowerCase().replace(/[^a-z0-9]/g, '')}`,
        name: prev.name || file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')
      }));
    } catch (err) {
      setApkError(err.message);
    } finally {
      setUploadingApk(false);
    }
  };

  // 2. Icon Upload (Auto-compressed to 512x512, keeping under 60 KB)
  const handleIconUpload = async (file) => {
    if (!file) return;
    setUploadingIcon(true);

    try {
      const compressedDataUrl = await compressImage(file, 512, 512, 0.85);
      setFormData(prev => ({ ...prev, icon: compressedDataUrl }));
    } catch (err) {
      console.warn('Icon compression error, falling back:', err);
      const reader = new FileReader();
      reader.onload = (e) => setFormData(prev => ({ ...prev, icon: e.target.result }));
      reader.readAsDataURL(file);
    } finally {
      setUploadingIcon(false);
    }
  };

  // 3. Banner / Feature Graphic Upload (Auto-compressed to 1024x500, keeping under 90 KB)
  const handleBannerUpload = async (file) => {
    if (!file) return;
    setUploadingBanner(true);

    try {
      const compressedDataUrl = await compressImage(file, 1024, 500, 0.82);
      setFormData(prev => ({ ...prev, coverImage: compressedDataUrl }));
    } catch (err) {
      console.warn('Banner compression error, falling back:', err);
      const reader = new FileReader();
      reader.onload = (e) => setFormData(prev => ({ ...prev, coverImage: e.target.result }));
      reader.readAsDataURL(file);
    } finally {
      setUploadingBanner(false);
    }
  };

  // 4. Screenshots Upload (Auto-compressed to max 1080x1920, ~100 KB each)
  const handleScreenshotsUpload = async (files) => {
    if (!files || files.length === 0) return;
    setUploadingScreenshots(true);

    try {
      const fileArray = Array.from(files);
      const compressedList = await Promise.all(
        fileArray.map(f => compressImage(f, 1080, 1920, 0.80).catch(() => null))
      );
      const validUrls = compressedList.filter(Boolean);

      setFormData(prev => ({
        ...prev,
        screenshots: [...new Set([...prev.screenshots, ...validUrls])].slice(0, 8)
      }));
    } catch (err) {
      console.warn('Screenshot compression error:', err);
    } finally {
      setUploadingScreenshots(false);
    }
  };

  const handleRemoveScreenshot = (index) => {
    setFormData(prev => ({
      ...prev,
      screenshots: prev.screenshots.filter((_, i) => i !== index)
    }));
  };

  // Submit Application to TobiyaStudio
  const handleSubmitPublish = async () => {
    setSubmitting(true);

    try {
      const payload = {
        name: formData.name || 'Untitled Application',
        shortDescription: formData.shortDescription || 'A high-performance modern application published via TobiyaStudio.',
        description: formData.description || formData.shortDescription || 'Official application package published on TobiyaStudio with verified features and updates.',
        category: formData.category || 'Productivity',
        platform: formData.platform || 'Android',
        version: formData.version || '1.0.0',
        versionCode: Number(formData.versionCode) || 1,
        fileSize: formData.fileSize || '25 MB',
        webUrl: formData.webUrl || null,
        apkUrl: formData.apkUrl || null,
        packageId: formData.packageId || `com.tobiyastudio.${Date.now()}`,
        minRequirement: formData.minRequirement || 'Android 8.0+ (API 26)',
        targetSdk: formData.targetSdk || 'Android 14 (API 34)',
        track: formData.track || 'Production',
        status: 'Published',
        releaseNotes: formData.releaseNotes || 'Initial official release on TobiyaStudio.',
        icon: formData.icon || '/assets/icons/kpi-tracker.svg',
        coverImage: formData.coverImage || '/assets/covers/kpi-tracker-cover.svg',
        screenshots: formData.screenshots && formData.screenshots.length > 0 ? formData.screenshots : ['/assets/screenshots/football-quiz-1.svg', '/assets/screenshots/football-quiz-2.svg'],
        features: formData.features && formData.features.length > 0 ? formData.features : ['High performance architecture', 'Modern responsive design', 'Built-in security updates'],
        tags: typeof formData.tags === 'string' ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : (formData.tags || ['app', 'android']),
        contentRating: calculatedRating.rating,
        contentRatingDetails: formData.contentRatingQuestions,
        dataSafety: formData.dataSafety,
        adsDeclaration: formData.adsDeclaration,
        targetAudience: formData.targetAudience,
        appAccess: formData.appAccess,
        privacyPolicyUrl: formData.privacyPolicyUrl || 'https://tobiyastudio.com/privacy',
        developerName: 'TobiyaStudio Developer',
        developerId: 'pub-tobiyastudio'
      };

      // Shrink large base64 Data URLs on-the-fly before sending over network to strictly respect 4.5 MB limit
      const shrinkDataUrl = async (dataUrl, maxDim = 1080) => {
        if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image')) {
          return dataUrl;
        }
        if (dataUrl.length < 300000) return dataUrl; // Under ~220 KB is already safe

        return new Promise((resolve) => {
          const img = new Image();
          img.onload = () => {
            const ratio = Math.min(maxDim / img.width, maxDim / img.height, 1);
            const w = Math.max(1, Math.round(img.width * ratio));
            const h = Math.max(1, Math.round(img.height * ratio));
            const canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, w, h);
            resolve(canvas.toDataURL('image/jpeg', 0.75));
          };
          img.onerror = () => resolve(dataUrl);
          img.src = dataUrl;
        });
      };

      if (payload.icon) payload.icon = await shrinkDataUrl(payload.icon, 512);
      if (payload.coverImage) payload.coverImage = await shrinkDataUrl(payload.coverImage, 1024);
      if (payload.screenshots && payload.screenshots.length > 0) {
        payload.screenshots = await Promise.all(payload.screenshots.map(s => shrinkDataUrl(s, 1080)));
      }

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const text = await res.text();
        let errMsg = 'Failed to submit application';
        try {
          const errObj = JSON.parse(text);
          errMsg = errObj.error || errObj.message || errMsg;
        } catch (_) {
          if (res.status === 413 || text.includes('Request Entity Too Large') || text.includes('Request En')) {
            errMsg = 'Images/Screenshots payload is too large for the 4.5 MB serverless limit. Please remove and re-add your screenshots to auto-compress them.';
          } else {
            errMsg = text || `Server error (${res.status})`;
          }
        }
        throw new Error(errMsg);
      }

      const data = await res.json();
      setSuccessProduct(data.product);
      if (onPublished) {
        onPublished(data.product);
      }
    } catch (err) {
      alert(`Error publishing to TobiyaStudio: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Readiness Checklist Evaluation
  const checks = [
    { title: 'App Name & Category', valid: Boolean(formData.name && formData.name.trim().length >= 3) },
    { title: 'Short Tagline (max 80 chars)', valid: Boolean(formData.shortDescription && formData.shortDescription.length <= 80) },
    { title: 'App Icon / Logo (512x512)', valid: Boolean(formData.icon) },
    { title: 'Screenshots (At least 2 required)', valid: formData.screenshots.length >= 2 },
    { title: 'App Package / File Size Verified', valid: Boolean(formData.fileSize) },
    { title: 'Privacy Policy URL', valid: Boolean(formData.privacyPolicyUrl && formData.privacyPolicyUrl.startsWith('http')) },
    { title: 'Content Rating Form Completed', valid: true },
    { title: 'Data Safety Section Declared', valid: true }
  ];

  const totalChecks = checks.length;
  const passedChecks = checks.filter(c => c.valid).length;
  const readinessPercent = Math.round((passedChecks / totalChecks) * 100);

  // Live preview mockup product
  const previewProduct = {
    name: formData.name || 'Your App Title',
    shortDescription: formData.shortDescription || 'A compelling short description of your application for the store catalog.',
    category: formData.category,
    platform: formData.platform,
    version: formData.version || '1.0.0',
    icon: formData.icon || '/assets/icons/kpi-tracker.svg',
    rating: 5.0,
    reviewCount: 1,
    isWebApp: formData.platform === 'Web' || formData.platform.includes('Web'),
    slug: 'preview'
  };

  return (
    <div className={isAdminMode ? '' : 'container'} style={{ padding: isAdminMode ? '20px 24px 60px' : '36px 24px 80px' }}>
      {/* Console Top Breadcrumb & Title */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#2563EB', fontSize: '13px', fontWeight: '700', marginBottom: '6px' }}>
              <ShieldCheck size={16} /> {isAdminMode ? 'TobiyaStudio Admin Console • Publishing Suite' : 'TobiyaStudio Developer Console'}
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0F172A', letterSpacing: '-0.02em' }}>
              {formData.name ? formData.name : (isAdminMode ? 'Publish New Application' : 'Create & Publish Application')}
            </h1>
            <p style={{ fontSize: '14.5px', color: '#64748B', maxWidth: '640px' }}>
              {isAdminMode
                ? 'Administrative software publishing pipeline. Enter metadata, upload binary packages, complete policy questionnaires, and roll out to the public store catalog.'
                : 'Google Play Console publishing pipeline. Fill out store listing details, upload package artifacts, complete policy questionnaires, and roll out to production.'}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              backgroundColor: readinessPercent === 100 ? '#DCFCE7' : '#EFF6FF',
              border: `1px solid ${readinessPercent === 100 ? '#BBF7D0' : '#BFDBFE'}`,
              borderRadius: '12px',
              padding: '8px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <div style={{ fontSize: '12.5px', fontWeight: '600', color: readinessPercent === 100 ? '#15803D' : '#1D4ED8' }}>
                Readiness: {readinessPercent}%
              </div>
              <div style={{ width: '80px', height: '6px', backgroundColor: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{
                  width: `${readinessPercent}%`,
                  height: '100%',
                  backgroundColor: readinessPercent === 100 ? '#16A34A' : '#2563EB',
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>

            <span className={`badge ${readinessPercent === 100 ? 'badge-accent' : 'badge-platform'}`} style={{ padding: '6px 12px', fontSize: '12px' }}>
              {readinessPercent === 100 ? '✓ Ready for Rollout' : 'Draft / Preparing'}
            </span>
          </div>
        </div>
      </div>

      {/* Console Mode Switcher (Publish New vs Update Existing App) */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '28px',
        borderBottom: '1px solid #E2E8F0',
        paddingBottom: '16px',
        flexWrap: 'wrap'
      }}>
        <button
          type="button"
          onClick={() => { setPortalMode('new'); setSuccessProduct(null); }}
          style={{
            padding: '10px 22px',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '700',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            border: portalMode === 'new' ? '2px solid #2563EB' : '1px solid #CBD5E1',
            backgroundColor: portalMode === 'new' ? '#EFF6FF' : '#FFFFFF',
            color: portalMode === 'new' ? '#1D4ED8' : '#475569',
            boxShadow: portalMode === 'new' ? 'var(--shadow-xs)' : 'none',
            transition: 'all 0.15s ease'
          }}
          id="mode-new-app-btn"
        >
          <Plus size={16} /> Publish New Application
        </button>

        <button
          type="button"
          onClick={() => { setPortalMode('update'); setSuccessProduct(null); }}
          style={{
            padding: '10px 22px',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '700',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            border: portalMode === 'update' ? '2px solid #2563EB' : '1px solid #CBD5E1',
            backgroundColor: portalMode === 'update' ? '#EFF6FF' : '#FFFFFF',
            color: portalMode === 'update' ? '#1D4ED8' : '#475569',
            boxShadow: portalMode === 'update' ? 'var(--shadow-xs)' : 'none',
            transition: 'all 0.15s ease'
          }}
          id="mode-update-app-btn"
        >
          <RefreshCw size={16} /> Update Existing App (Release New Version)
        </button>
      </div>

      {successProduct ? (
        /* Publication / Update Success & Live Direct Download Screen */
        <div style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #BBF7D0',
          borderRadius: '24px',
          padding: '48px 36px',
          textAlign: 'center',
          maxWidth: '640px',
          margin: '0 auto',
          boxShadow: 'var(--shadow-md)'
        }}>
          <div style={{
            width: '76px',
            height: '76px',
            backgroundColor: '#DCFCE7',
            border: '2px solid #86EFAC',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px'
          }}>
            <CheckCircle2 size={42} color="#16A34A" />
          </div>

          <span style={{
            backgroundColor: '#DCFCE7',
            color: '#15803D',
            fontWeight: '800',
            fontSize: '12.5px',
            padding: '5px 16px',
            borderRadius: '20px',
            display: 'inline-block',
            marginBottom: '12px'
          }}>
            Status: Published & Live on TobiyaStudio
          </span>

          <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#0F172A', marginBottom: '10px' }}>
            🎉 {successProduct.name} is Live!
          </h2>
          <p style={{ color: '#475569', fontSize: '15px', lineHeight: '1.6', marginBottom: '24px' }}>
            Your application <strong>{successProduct.name}</strong> (v{successProduct.version}, {successProduct.fileSize}) has been updated in the store catalog. Users can now view release notes and download the updated package!
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
            <Link
              to={`/product/${successProduct.slug}`}
              className="btn btn-primary btn-lg"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '15px', height: '48px' }}
            >
              View Live Store Page & Test Download →
            </Link>

            <a
              href={`/api/products/${successProduct.id}/download-package`}
              download={`${successProduct.slug}-v${successProduct.version}.apk`}
              className="btn btn-secondary btn-lg"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '14.5px', textDecoration: 'none', height: '46px' }}
            >
              <Download size={17} /> Direct Download Updated APK ({successProduct.fileSize})
            </a>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => { setSuccessProduct(null); }}
              className="btn btn-outline btn-sm"
            >
              Publish / Update Another Application
            </button>
            <Link to="/apps" className="btn btn-outline btn-sm">
              Explore All Android Apps
            </Link>
          </div>
        </div>
      ) : portalMode === 'update' ? (
        <UpdateAppSection
          initialSlug={updateSlug}
          onUpdateSuccess={(product) => setSuccessProduct(product)}
        />
      ) : (
        /* Console Stepper Navigation */
        <div>
          <nav className="console-stepper" aria-label="Console Workflow Steps">
            <button
              onClick={() => setCurrentStep(1)}
              className={`console-step-btn ${currentStep === 1 ? 'active' : ''} ${formData.name && formData.shortDescription ? 'completed' : ''}`}
            >
              <span className="console-step-number">1</span>
              <span>Store Listing & Graphics</span>
            </button>

            <ChevronRight size={14} color="#CBD5E1" />

            <button
              onClick={() => setCurrentStep(2)}
              className={`console-step-btn ${currentStep === 2 ? 'active' : ''} ${formData.fileSize ? 'completed' : ''}`}
            >
              <span className="console-step-number">2</span>
              <span>App Releases & Package</span>
            </button>

            <ChevronRight size={14} color="#CBD5E1" />

            <button
              onClick={() => setCurrentStep(3)}
              className={`console-step-btn ${currentStep === 3 ? 'active' : ''} ${formData.privacyPolicyUrl ? 'completed' : ''}`}
            >
              <span className="console-step-number">3</span>
              <span>Policy & Questionnaires</span>
            </button>

            <ChevronRight size={14} color="#CBD5E1" />

            <button
              onClick={() => setCurrentStep(4)}
              className={`console-step-btn ${currentStep === 4 ? 'active' : ''} ${readinessPercent === 100 ? 'completed' : ''}`}
            >
              <span className="console-step-number">4</span>
              <span>Review & Rollout</span>
            </button>
          </nav>

          {/* Main Console Layout */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '40px', alignItems: 'flex-start' }}>
            {/* LEFT COLUMN: ACTIVE STEP FORMS */}
            <div>
              {/* ==================================================== */}
              {/* STEP 1: STORE LISTING & GRAPHICS                    */}
              {/* ==================================================== */}
              {currentStep === 1 && (
                <div>
                  {/* Basic Details */}
                  <div className="console-card">
                    <div className="console-card-header">
                      <div className="console-card-title">
                        <FileCode size={18} color="#2563EB" /> 1. App Details
                      </div>
                      <span style={{ fontSize: '12px', color: '#64748B' }}>Standard Play Store listing specifications</span>
                    </div>

                    <div style={{ marginBottom: '18px' }}>
                      <label className="input-label">App Name * (Max 30 characters)</label>
                      <input
                        type="text"
                        name="name"
                        className="input-control"
                        placeholder="e.g. Focus Flow"
                        maxLength={30}
                        value={formData.name}
                        onChange={handleChange}
                        required
                        id="form-app-name"
                      />
                      <div className={`char-counter ${formData.name.length > 28 ? 'warning' : ''}`}>
                        {formData.name.length}/30 characters
                      </div>
                    </div>

                    <div style={{ marginBottom: '18px' }}>
                      <label className="input-label">Short Description * (Max 80 characters)</label>
                      <input
                        type="text"
                        name="shortDescription"
                        className="input-control"
                        placeholder="Brief summary highlighted in Google Play search results"
                        maxLength={80}
                        value={formData.shortDescription}
                        onChange={handleChange}
                        required
                        id="form-app-shortdesc"
                      />
                      <div className={`char-counter ${formData.shortDescription.length > 75 ? 'warning' : ''}`}>
                        {formData.shortDescription.length}/80 characters
                      </div>
                    </div>

                    <div style={{ marginBottom: '18px' }}>
                      <label className="input-label">Full Description (Max 4000 characters)</label>
                      <textarea
                        name="description"
                        rows={5}
                        className="input-control"
                        placeholder="Detailed editorial description of features, workflow, architecture, and user benefits..."
                        maxLength={4000}
                        value={formData.description}
                        onChange={handleChange}
                        id="form-app-fulldesc"
                      />
                      <div className="char-counter">
                        {formData.description.length}/4000 characters
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <label className="input-label">Primary Category *</label>
                        <select
                          name="category"
                          className="input-control"
                          value={formData.category}
                          onChange={handleChange}
                        >
                          <option value="Productivity">Productivity</option>
                          <option value="Education">Education</option>
                          <option value="Business">Business</option>
                          <option value="Health & Fitness">Health & Fitness</option>
                          <option value="Finance">Finance</option>
                          <option value="Agriculture">Agriculture</option>
                          <option value="Games">Games</option>
                          <option value="Entertainment">Entertainment</option>
                          <option value="Utilities">Utilities & Tools</option>
                          <option value="AI & Technology">AI & Technology</option>
                        </select>
                      </div>

                      <div>
                        <label className="input-label">Platform *</label>
                        <select
                          name="platform"
                          className="input-control"
                          value={formData.platform}
                          onChange={handleChange}
                        >
                          <option value="Android">Android (APK / AAB)</option>
                          <option value="Android • Web">Android + Web Access</option>
                          <option value="Web">Web Application Only</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Graphic Assets: App Icon & Feature Graphic */}
                  <div className="console-card">
                    <div className="console-card-header">
                      <div className="console-card-title">
                        <ImageIcon size={18} color="#2563EB" /> 2. App Icon & Feature Graphic
                      </div>
                      <span style={{ fontSize: '12px', color: '#64748B' }}>512x512 logo & 1024x500 promo banner</span>
                    </div>

                    {/* App Icon / Logo Section */}
                    <div style={{ marginBottom: '28px' }}>
                      <label className="input-label">App Icon / Logo (512 × 512 px) *</label>
                      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                        {/* Squircle Preview */}
                        <div style={{
                          width: '76px',
                          height: '76px',
                          borderRadius: '22%',
                          overflow: 'hidden',
                          border: formData.icon ? '2px solid #E2E8F0' : '2px dashed #CBD5E1',
                          backgroundColor: '#F8FAFC',
                          boxShadow: 'var(--shadow-sm)',
                          flexShrink: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {formData.icon ? (
                            <img src={formData.icon} alt="App Icon" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <ImageIcon size={30} color="#94A3B8" />
                          )}
                        </div>

                        <div style={{ flex: 1 }}>
                          <input
                            type="file"
                            ref={iconInputRef}
                            accept="image/png,image/jpeg,image/svg+xml,image/webp"
                            style={{ display: 'none' }}
                            onChange={(e) => handleIconUpload(e.target.files[0])}
                          />
                          <button
                            type="button"
                            onClick={() => iconInputRef.current?.click()}
                            disabled={uploadingIcon}
                            className="btn btn-secondary btn-sm"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}
                          >
                            <Upload size={14} /> {uploadingIcon ? 'Uploading Icon...' : formData.icon ? 'Change 512x512 Icon' : 'Upload 512x512 Icon'}
                          </button>
                          <div style={{ fontSize: '11.5px', color: '#64748B' }}>
                            Supported: PNG (32-bit with alpha), SVG, WebP. Displayed in Play Store search and device homescreen.
                          </div>

                          {/* Quick Presets */}
                          <div style={{ display: 'flex', gap: '8px', marginTop: '10px', alignItems: 'center' }}>
                            <span style={{ fontSize: '11px', color: '#94A3B8' }}>Or choose preset icon:</span>
                            {['/assets/icons/kpi-tracker.svg', '/assets/icons/football-quiz.svg', '/assets/icons/agribusiness.svg', '/assets/icons/fitness.svg', '/assets/icons/media-player.svg'].map(iconPath => (
                              <img
                                key={iconPath}
                                src={iconPath}
                                alt=""
                                onClick={() => setFormData(prev => ({ ...prev, icon: iconPath }))}
                                style={{
                                  width: '28px',
                                  height: '28px',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  border: formData.icon === iconPath ? '2px solid #2563EB' : '1px solid #E2E8F0'
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Feature Graphic Banner (1024x500) */}
                    <div>
                      <label className="input-label">Feature Graphic Banner (1024 × 500 px)</label>
                      <div style={{
                        width: '100%',
                        height: '140px',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        backgroundColor: formData.coverImage ? '#0F172A' : '#F8FAFC',
                        border: formData.coverImage ? '1px solid #CBD5E1' : '2px dashed #CBD5E1',
                        marginBottom: '10px',
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {formData.coverImage ? (
                          <img src={formData.coverImage} alt="Banner Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ textAlign: 'center', color: '#94A3B8' }}>
                            <ImageIcon size={32} style={{ marginBottom: '6px' }} />
                            <div style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>No Feature Graphic Uploaded</div>
                            <div style={{ fontSize: '11.5px' }}>Recommended: 1024 × 500 px PNG or JPG</div>
                          </div>
                        )}
                        <div style={{ position: 'absolute', bottom: '10px', right: '10px' }}>
                          <input
                            type="file"
                            ref={bannerInputRef}
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={(e) => handleBannerUpload(e.target.files[0])}
                          />
                          <button
                            type="button"
                            onClick={() => bannerInputRef.current?.click()}
                            disabled={uploadingBanner}
                            className="btn btn-secondary btn-sm"
                            style={{ backgroundColor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(4px)', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                          >
                            <Upload size={13} /> {uploadingBanner ? 'Uploading...' : formData.coverImage ? 'Change Feature Graphic' : 'Upload Graphic'}
                          </button>
                        </div>
                      </div>
                      <div style={{ fontSize: '11.5px', color: '#64748B' }}>
                        Promo graphic required for Play Store spotlight, editorial banners, and store listing header.
                      </div>
                    </div>
                  </div>

                  {/* Screenshots Section */}
                  <div className="console-card">
                    <div className="console-card-header">
                      <div className="console-card-title">
                        <Smartphone size={18} color="#2563EB" /> 3. Phone Screenshots ({formData.screenshots.length}/8)
                      </div>
                      <span style={{ fontSize: '12px', color: '#64748B' }}>Minimum 2 screenshots required</span>
                    </div>

                    {formData.screenshots.length === 0 ? (
                      <div
                        onClick={() => screenshotInputRef.current?.click()}
                        style={{
                          border: '2px dashed #CBD5E1',
                          borderRadius: '14px',
                          padding: '36px 20px',
                          textAlign: 'center',
                          backgroundColor: '#F8FAFC',
                          cursor: 'pointer',
                          marginBottom: '16px'
                        }}
                      >
                        <Smartphone size={36} color="#94A3B8" style={{ marginBottom: '10px' }} />
                        <div style={{ fontSize: '14px', fontWeight: '700', color: '#0F172A', marginBottom: '4px' }}>
                          No Screenshots Added Yet
                        </div>
                        <div style={{ fontSize: '12.5px', color: '#64748B', maxWidth: '380px', margin: '0 auto 12px' }}>
                          Upload at least 2 mobile screenshots showing your app's main screens and features (PNG, JPG, WebP).
                        </div>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                          onClick={(e) => { e.stopPropagation(); screenshotInputRef.current?.click(); }}
                        >
                          <Upload size={14} /> Browse Screenshots
                        </button>
                      </div>
                    ) : (
                      <div style={{
                        display: 'flex',
                        gap: '14px',
                        overflowX: 'auto',
                        paddingBottom: '14px',
                        marginBottom: '18px'
                      }}>
                        {formData.screenshots.map((s, idx) => (
                          <div key={idx} className="console-screenshot-thumb">
                            <img src={s} alt={`Screenshot ${idx + 1}`} />
                            <div style={{
                              position: 'absolute',
                              bottom: '6px',
                              left: '6px',
                              backgroundColor: 'rgba(15, 23, 42, 0.75)',
                              color: '#FFFFFF',
                              fontSize: '10px',
                              fontWeight: '700',
                              padding: '2px 6px',
                              borderRadius: '4px'
                            }}>
                              #{idx + 1} {idx === 0 ? 'Main' : ''}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveScreenshot(idx)}
                              className="console-screenshot-delete"
                              title="Remove screenshot"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ))}

                        {/* Add Screenshot Button */}
                        {formData.screenshots.length < 8 && (
                          <div
                            onClick={() => screenshotInputRef.current?.click()}
                            style={{
                              width: '110px',
                              height: '195px',
                              border: '2px dashed #CBD5E1',
                              borderRadius: '12px',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '8px',
                              cursor: 'pointer',
                              backgroundColor: '#F8FAFC',
                              flexShrink: 0
                            }}
                          >
                            <Plus size={20} color="#64748B" />
                            <span style={{ fontSize: '11px', fontWeight: '600', color: '#64748B', textAlign: 'center', padding: '0 8px' }}>
                              {uploadingScreenshots ? 'Uploading...' : 'Add Screenshot'}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    <input
                      type="file"
                      ref={screenshotInputRef}
                      multiple
                      accept="image/png,image/jpeg,image/webp,image/svg+xml"
                      style={{ display: 'none' }}
                      onChange={(e) => handleScreenshotsUpload(e.target.files)}
                    />

                    {formData.screenshots.length > 0 && (
                      <button
                        type="button"
                        onClick={() => screenshotInputRef.current?.click()}
                        disabled={uploadingScreenshots}
                        className="btn btn-secondary btn-sm"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                      >
                        <Upload size={14} /> Add More Screenshots
                      </button>
                    )}
                  </div>

                  {/* 4. Tags & Key Highlights Section */}
                  <div className="console-card">
                    <div className="console-card-header">
                      <div className="console-card-title">
                        <Sparkles size={18} color="#2563EB" /> 4. Tags & Highlight Features
                      </div>
                      <span style={{ fontSize: '12px', color: '#64748B' }}>Search keywords and key selling points</span>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <label className="input-label">Search Tags (Comma separated)</label>
                      <input
                        type="text"
                        name="tags"
                        className="input-control"
                        placeholder="e.g. productivity, tasks, offline, calendar"
                        value={formData.tags}
                        onChange={handleChange}
                      />
                    </div>

                    <div>
                      <label className="input-label">Key Highlights / Features</label>
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                        <input
                          type="text"
                          placeholder="e.g. End-to-end encrypted local storage"
                          value={newFeature}
                          onChange={(e) => setNewFeature(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddFeature(); } }}
                          className="input-control"
                          style={{ flex: 1 }}
                        />
                        <button
                          type="button"
                          onClick={handleAddFeature}
                          className="btn btn-secondary"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Plus size={16} /> Add
                        </button>
                      </div>

                      {formData.features.length === 0 ? (
                        <div style={{ fontSize: '12.5px', color: '#94A3B8', fontStyle: 'italic', padding: '6px 0' }}>
                          No highlights added yet. Add bullet points showcasing what makes your app special.
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {formData.features.map((feat, fIdx) => (
                            <div
                              key={fIdx}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                backgroundColor: '#F8FAFC',
                                border: '1px solid #E2E8F0',
                                padding: '8px 14px',
                                borderRadius: '8px',
                                fontSize: '13px'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <CheckCircle2 size={15} color="#16A34A" />
                                <span>{feat}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveFeature(fIdx)}
                                style={{ color: '#EF4444', padding: '4px' }}
                                title="Remove highlight"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Next Step Button */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="btn btn-primary btn-lg"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                    >
                      Continue to App Releases <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* ==================================================== */}
              {/* STEP 2: APP RELEASES & AUTOMATIC SIZE DETECTION     */}
              {/* ==================================================== */}
              {currentStep === 2 && (
                <div>
                  <div className="console-card">
                    <div className="console-card-header">
                      <div className="console-card-title">
                        <Upload size={18} color="#2563EB" /> 1. Upload App Bundle or APK
                      </div>
                      <span style={{ fontSize: '12px', color: '#64748B' }}>Automatic app size calculation & artifact verification</span>
                    </div>

                    <p style={{ fontSize: '13.5px', color: '#64748B', marginBottom: '18px' }}>
                      Drop your compiled Android package (<strong>.apk</strong>, <strong>.aab</strong>, or <strong>.zip</strong>). TobiyaStudio will automatically inspect and calculate the exact file size, version name, and package ID.
                    </p>

                    {/* Drag and Drop Zone */}
                    <input
                      type="file"
                      ref={apkInputRef}
                      accept=".apk,.aab,.xapk,.zip"
                      style={{ display: 'none' }}
                      onChange={(e) => handleApkUpload(e.target.files[0])}
                    />

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
                      style={{ minHeight: '160px', marginBottom: '20px', cursor: 'pointer' }}
                    >
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        backgroundColor: '#EFF6FF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '12px'
                      }}>
                        <Upload size={22} color="#2563EB" />
                      </div>
                      <div style={{ fontSize: '15px', fontWeight: '700', color: '#0F172A', marginBottom: '4px' }}>
                        {uploadingApk ? 'Analyzing & Measuring App Package...' : uploadedApkFile ? `Package Inspected: ${uploadedApkFile.name}` : 'Drag and drop your APK / App Bundle here'}
                      </div>
                      <div style={{ fontSize: '12.5px', color: '#64748B' }}>
                        or <span style={{ color: '#2563EB', fontWeight: '600' }}>browse files</span> from your computer
                      </div>
                      <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '6px' }}>
                        Supports APK, AAB, ZIP up to 500 MB
                      </div>
                    </div>

                    {apkError && (
                      <div style={{ backgroundColor: '#FEE2E2', border: '1px solid #FCA5A5', color: '#DC2626', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>
                        {apkError}
                      </div>
                    )}

                    {/* Detected Artifact Card (Play Console Inspector) */}
                    <div className="console-artifact-card">
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {formData.fileSize ? (
                            <CheckCircle2 size={18} color="#16A34A" />
                          ) : (
                            <AlertCircle size={18} color="#D97706" />
                          )}
                          <span style={{ fontWeight: '700', fontSize: '14px', color: '#0F172A' }}>
                            Package Artifact Specifications
                          </span>
                        </div>
                        <span className={`badge ${formData.fileSize ? 'badge-accent' : 'badge-platform'}`} style={{ fontSize: '11px' }}>
                          {formData.fileSize ? 'Size Detected' : 'Pending Package'}
                        </span>
                      </div>

                      {formData.fileSize ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '14px', paddingTop: '8px' }}>
                          {/* Real Detected App Size Highlight */}
                          <div style={{ backgroundColor: '#FFFFFF', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                            <div style={{ fontSize: '11px', color: '#64748B', marginBottom: '2px' }}>App File Size</div>
                            <div style={{ fontSize: '18px', fontWeight: '800', color: '#2563EB' }}>
                              {formData.fileSize}
                            </div>
                            <div style={{ fontSize: '10px', color: '#94A3B8' }}>
                              {formData.fileSizeBytes ? `${formData.fileSizeBytes.toLocaleString()} bytes` : 'Calculated'}
                            </div>
                          </div>

                          <div style={{ backgroundColor: '#FFFFFF', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                            <div style={{ fontSize: '11px', color: '#64748B', marginBottom: '2px' }}>Release Version</div>
                            <div style={{ fontSize: '16px', fontWeight: '700', color: '#0F172A' }}>
                              v{formData.version}
                            </div>
                            <div style={{ fontSize: '10px', color: '#94A3B8' }}>
                              Code: {formData.versionCode}
                            </div>
                          </div>

                          <div style={{ backgroundColor: '#FFFFFF', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                            <div style={{ fontSize: '11px', color: '#64748B', marginBottom: '2px' }}>Package ID</div>
                            <div style={{ fontSize: '12px', fontWeight: '600', color: '#0F172A', wordBreak: 'break-all' }}>
                              {formData.packageId || 'com.tobiyastudio.app'}
                            </div>
                          </div>

                          <div style={{ backgroundColor: '#FFFFFF', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                            <div style={{ fontSize: '11px', color: '#64748B', marginBottom: '2px' }}>Target Architecture</div>
                            <div style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A' }}>
                              arm64-v8a, x86_64
                            </div>
                            <div style={{ fontSize: '10px', color: '#16A34A' }}>
                              API 26 to API 34+
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div style={{ padding: '20px 14px', textAlign: 'center', color: '#64748B', fontSize: '13px' }}>
                          Upload an APK or AAB bundle above to measure and inspect your app package specifications.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Release Track & Notes */}
                  <div className="console-card">
                    <div className="console-card-header">
                      <div className="console-card-title">
                        <Layers size={18} color="#2563EB" /> 2. Release Track & Rollout Notes
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '18px' }}>
                      <div>
                        <label className="input-label">Release Track *</label>
                        <select
                          name="track"
                          className="input-control"
                          value={formData.track}
                          onChange={handleChange}
                        >
                          <option value="Production">Production (Immediate public download)</option>
                          <option value="Open Beta">Open Testing (Beta track)</option>
                          <option value="Internal">Internal QA Testing</option>
                        </select>
                      </div>

                      <div>
                        <label className="input-label">Target SDK / Min OS Requirement</label>
                        <input
                          type="text"
                          name="minRequirement"
                          className="input-control"
                          value={formData.minRequirement}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div style={{ marginBottom: '18px' }}>
                      <label className="input-label">Release Notes ("What's new in this release")</label>
                      <textarea
                        name="releaseNotes"
                        rows={3}
                        className="input-control"
                        placeholder="Highlight new capabilities, bug fixes, or performance enhancements..."
                        value={formData.releaseNotes}
                        onChange={handleChange}
                      />
                    </div>

                    {/* Direct APK Download URL */}
                    <div style={{ marginBottom: '18px' }}>
                      <label className="input-label">APK Package Direct Download URL (GitHub Releases / Cloud Storage)</label>
                      <input
                        type="text"
                        name="apkUrl"
                        className="input-control"
                        placeholder="e.g. https://github.com/dagdagim/Publish/releases/download/.../app.apk"
                        value={formData.apkUrl || ''}
                        onChange={handleChange}
                      />
                      <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '4px' }}>
                        For Vercel hosting: Host APK builds &gt; 4.5 MB on <strong>GitHub Releases</strong> (free up to 2 GB) or Google Drive, then paste the direct download URL here.
                      </div>
                    </div>
                  </div>

                  {/* Navigation */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="btn btn-secondary"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                    >
                      <ArrowLeft size={16} /> Back to Store Listing
                    </button>

                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="btn btn-primary btn-lg"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                    >
                      Continue to Policy Questionnaires <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* ==================================================== */}
              {/* STEP 3: APP CONTENT & MANDATORY QUESTIONNAIRES       */}
              {/* ==================================================== */}
              {currentStep === 3 && (
                <div>
                  {/* Privacy Policy */}
                  <div className="console-card">
                    <div className="console-card-header">
                      <div className="console-card-title">
                        <Lock size={18} color="#2563EB" /> 1. Privacy Policy Declaration
                      </div>
                      <span className="badge badge-accent" style={{ fontSize: '11px' }}>Mandatory</span>
                    </div>

                    <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '14px' }}>
                      Google Play Store policy requires all developers to submit a valid public privacy policy URL explaining how user data is collected and protected.
                    </p>

                    <div>
                      <label className="input-label">Privacy Policy Public URL *</label>
                      <input
                        type="url"
                        name="privacyPolicyUrl"
                        className="input-control"
                        placeholder="https://yourcompany.com/privacy"
                        value={formData.privacyPolicyUrl}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  {/* Ads Declaration */}
                  <div className="console-card">
                    <div className="console-card-header">
                      <div className="console-card-title">
                        <Radio size={18} color="#2563EB" /> 2. Advertising Declaration
                      </div>
                    </div>

                    <p style={{ fontSize: '13.5px', color: '#475569', marginBottom: '10px' }}>
                      Does your application display advertising or incorporate third-party ad SDKs (e.g. AdMob, Unity Ads)?
                    </p>

                    <div className="console-radio-group">
                      <label className="console-radio-label">
                        <input
                          type="radio"
                          name="hasAds"
                          checked={formData.adsDeclaration.hasAds === false}
                          onChange={() => setFormData(prev => ({ ...prev, adsDeclaration: { ...prev.adsDeclaration, hasAds: false } }))}
                        />
                        <span>No, my app does not contain ads (Ad-free experience)</span>
                      </label>

                      <label className="console-radio-label">
                        <input
                          type="radio"
                          name="hasAds"
                          checked={formData.adsDeclaration.hasAds === true}
                          onChange={() => setFormData(prev => ({ ...prev, adsDeclaration: { ...prev.adsDeclaration, hasAds: true } }))}
                        />
                        <span>Yes, my app contains ads (Banner, interstitial, or rewarded ads)</span>
                      </label>
                    </div>
                  </div>

                  {/* Content Rating Questionnaire (IARC) */}
                  <div className="console-card">
                    <div className="console-card-header">
                      <div className="console-card-title">
                        <ShieldCheck size={18} color="#2563EB" /> 3. IARC Content Rating Questionnaire
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '12px', color: '#64748B' }}>Result:</span>
                        <span style={{
                          backgroundColor: calculatedRating.color,
                          color: '#FFFFFF',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontWeight: '800',
                          fontSize: '11px'
                        }}>
                          {calculatedRating.rating}
                        </span>
                      </div>
                    </div>

                    {/* Question 1: Violence */}
                    <div className="console-question-item">
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#0F172A', marginBottom: '6px' }}>
                        a. Does the app contain violence or depictions of physical conflict?
                      </div>
                      <div className="console-radio-group">
                        {[
                          { val: 'none', label: 'None (Zero violent depictions)' },
                          { val: 'mild', label: 'Mild Cartoon / Fantasy violence (Non-realistic)' },
                          { val: 'realistic', label: 'Realistic violence / Graphic harm' }
                        ].map(opt => (
                          <label key={opt.val} className="console-radio-label">
                            <input
                              type="radio"
                              name="violence"
                              checked={formData.contentRatingQuestions.violence === opt.val}
                              onChange={() => setFormData(prev => ({
                                ...prev,
                                contentRatingQuestions: { ...prev.contentRatingQuestions, violence: opt.val }
                              }))}
                            />
                            <span>{opt.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Question 2: Sexual Material */}
                    <div className="console-question-item">
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#0F172A', marginBottom: '6px' }}>
                        b. Does the app contain nudity, erotic themes, or sexual references?
                      </div>
                      <div className="console-radio-group">
                        {[
                          { val: 'no', label: 'No' },
                          { val: 'mild', label: 'Mild suggestive themes' },
                          { val: 'explicit', label: 'Explicit adult material' }
                        ].map(opt => (
                          <label key={opt.val} className="console-radio-label">
                            <input
                              type="radio"
                              name="sexuality"
                              checked={formData.contentRatingQuestions.sexuality === opt.val}
                              onChange={() => setFormData(prev => ({
                                ...prev,
                                contentRatingQuestions: { ...prev.contentRatingQuestions, sexuality: opt.val }
                              }))}
                            />
                            <span>{opt.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Question 3: User Interaction & Messaging */}
                    <div className="console-question-item">
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#0F172A', marginBottom: '6px' }}>
                        c. Does the app enable unmoderated user-to-user chat or location sharing?
                      </div>
                      <div className="console-radio-group">
                        {[
                          { val: 'no', label: 'No (Single-player / offline or verified comments only)' },
                          { val: 'chat_messaging', label: 'Yes (Live social chat or user messaging enabled)' }
                        ].map(opt => (
                          <label key={opt.val} className="console-radio-label">
                            <input
                              type="radio"
                              name="userInteraction"
                              checked={formData.contentRatingQuestions.userInteraction === opt.val}
                              onChange={() => setFormData(prev => ({
                                ...prev,
                                contentRatingQuestions: { ...prev.contentRatingQuestions, userInteraction: opt.val }
                              }))}
                            />
                            <span>{opt.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Data Safety Section */}
                  <div className="console-card">
                    <div className="console-card-header">
                      <div className="console-card-title">
                        <Lock size={18} color="#2563EB" /> 4. Data Safety Declarations
                      </div>
                    </div>

                    <p style={{ fontSize: '13.5px', color: '#475569', marginBottom: '14px' }}>
                      Google Play Data Safety informs users how their personal data is treated before downloading.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                      <label className="console-radio-label">
                        <input
                          type="checkbox"
                          checked={formData.dataSafety.encryptedInTransit}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            dataSafety: { ...prev.dataSafety, encryptedInTransit: e.target.checked }
                          }))}
                        />
                        <span><strong>Data is encrypted in transit:</strong> All network traffic uses HTTPS/TLS protocols.</span>
                      </label>

                      <label className="console-radio-label">
                        <input
                          type="checkbox"
                          checked={formData.dataSafety.deletionRequested}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            dataSafety: { ...prev.dataSafety, deletionRequested: e.target.checked }
                          }))}
                        />
                        <span><strong>Data deletion available:</strong> Users can request complete account & data deletion.</span>
                      </label>
                    </div>

                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '8px' }}>
                        Data types collected or processed:
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        {[
                          'Approximate location',
                          'Personal info (Name, email)',
                          'Financial / Payment info',
                          'Photos and videos',
                          'App performance & crash logs',
                          'Device or other identifiers'
                        ].map(type => {
                          const isChecked = formData.dataSafety.collectedTypes.includes(type);
                          return (
                            <label key={type} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: '#334155' }}>
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setFormData(prev => ({
                                      ...prev,
                                      dataSafety: {
                                        ...prev.dataSafety,
                                        collectedTypes: [...prev.dataSafety.collectedTypes, type]
                                      }
                                    }));
                                  } else {
                                    setFormData(prev => ({
                                      ...prev,
                                      dataSafety: {
                                        ...prev.dataSafety,
                                        collectedTypes: prev.dataSafety.collectedTypes.filter(t => t !== type)
                                      }
                                    }));
                                  }
                                }}
                              />
                              <span>{type}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Navigation */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="btn btn-secondary"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                    >
                      <ArrowLeft size={16} /> Back to Releases
                    </button>

                    <button
                      type="button"
                      onClick={() => setCurrentStep(4)}
                      className="btn btn-primary btn-lg"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                    >
                      Proceed to Final Review <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* ==================================================== */}
              {/* STEP 4: REVIEW & ROLLOUT                            */}
              {/* ==================================================== */}
              {currentStep === 4 && (
                <div>
                  <div className="console-card">
                    <div className="console-card-header">
                      <div className="console-card-title">
                        <CheckCircle2 size={18} color="#16A34A" /> Pre-Launch Readiness Checklist
                      </div>
                      <span className="badge badge-accent" style={{ fontSize: '11px' }}>
                        {readinessPercent}% Ready
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                      {checks.map((c, i) => (
                        <div
                          key={i}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '10px 14px',
                            backgroundColor: c.valid ? '#F0FDF4' : '#FFFBEB',
                            borderRadius: '8px',
                            border: `1px solid ${c.valid ? '#DCFCE7' : '#FEF3C7'}`
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {c.valid ? (
                              <CheckCircle2 size={16} color="#16A34A" />
                            ) : (
                              <AlertCircle size={16} color="#D97706" />
                            )}
                            <span style={{ fontSize: '13.5px', fontWeight: '600', color: c.valid ? '#166534' : '#92400E' }}>
                              {c.title}
                            </span>
                          </div>
                          <span style={{ fontSize: '11px', fontWeight: '700', color: c.valid ? '#16A34A' : '#D97706' }}>
                            {c.valid ? 'PASSED' : 'REQUIRED'}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Summary Card */}
                    <div style={{ backgroundColor: '#F8FAFC', padding: '20px', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '24px' }}>
                      <div style={{ fontSize: '14px', fontWeight: '700', color: '#0F172A', marginBottom: '12px' }}>
                        Release Deployment Overview
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
                        <div>
                          <span style={{ color: '#64748B' }}>App Title: </span>
                          <strong style={{ color: '#0F172A' }}>{formData.name || 'Untitled'}</strong>
                        </div>
                        <div>
                          <span style={{ color: '#64748B' }}>Category: </span>
                          <strong style={{ color: '#0F172A' }}>{formData.category}</strong>
                        </div>
                        <div>
                          <span style={{ color: '#64748B' }}>Artifact Size: </span>
                          <strong style={{ color: '#2563EB' }}>{formData.fileSize}</strong>
                        </div>
                        <div>
                          <span style={{ color: '#64748B' }}>Version: </span>
                          <strong style={{ color: '#0F172A' }}>v{formData.version}</strong>
                        </div>
                        <div>
                          <span style={{ color: '#64748B' }}>Content Rating: </span>
                          <strong style={{ color: calculatedRating.color }}>{calculatedRating.rating}</strong>
                        </div>
                        <div>
                          <span style={{ color: '#64748B' }}>Release Track: </span>
                          <strong style={{ color: '#0F172A' }}>{formData.track}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Publish Action Button */}
                    <button
                      type="button"
                      onClick={handleSubmitPublish}
                      disabled={submitting || (!formData.name && !formData.fileSize)}
                      className="btn btn-primary btn-block btn-lg"
                      id="publish-to-tobiyastudio-btn"
                      style={{ height: '48px', fontSize: '15px' }}
                    >
                      {submitting ? 'Verifying & Deploying to TobiyaStudio...' : 'Roll Out to Production & Publish App'}
                    </button>
                  </div>

                  {/* Navigation */}
                  <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '16px' }}>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="btn btn-secondary"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                    >
                      <ArrowLeft size={16} /> Back to Questionnaires
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: STICKY LIVE PLAY STORE CARD & DEVICE PREVIEW */}
            <div style={{ position: 'sticky', top: '90px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '700', color: '#475569', marginBottom: '12px' }}>
                <Eye size={16} /> Live Play Store Card Preview
              </div>

              {/* Product Card Mockup */}
              <div style={{ maxWidth: '340px', pointerEvents: 'none', marginBottom: '24px' }}>
                <ProductCard product={previewProduct} />
              </div>

              {/* Live Device Screenshot Frame */}
              <div style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '20px',
                padding: '20px',
                boxShadow: 'var(--shadow-xs)',
                maxWidth: '340px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Smartphone size={15} color="#2563EB" /> Device Frame
                  </div>
                  <span style={{ fontSize: '11px', color: '#64748B' }}>
                    {formData.fileSize || 'Responsive'}
                  </span>
                </div>

                {/* Phone Screen Mockup */}
                <div style={{
                  width: '100%',
                  height: '360px',
                  borderRadius: '24px',
                  overflow: 'hidden',
                  border: '4px solid #1E293B',
                  boxShadow: 'var(--shadow-md)',
                  backgroundColor: '#0F172A',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {formData.screenshots.length > 0 ? (
                    <img
                      src={formData.screenshots[0]}
                      alt="Device Preview"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#94A3B8' }}>
                      <Smartphone size={40} style={{ marginBottom: '10px' }} />
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#E2E8F0', marginBottom: '4px' }}>
                        Screen Mockup
                      </div>
                      <div style={{ fontSize: '11.5px', color: '#64748B' }}>
                        Upload screenshots in Step 1 to preview your app here
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ marginTop: '12px', fontSize: '11.5px', color: '#64748B', textAlign: 'center' }}>
                  Previewing primary screenshot in responsive viewport
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
