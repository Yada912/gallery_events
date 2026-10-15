import React, { useState, useRef } from 'react';
import {
  verifyGroupToken,
  consumeGroupToken,
  convertGoogleDriveUrl,
  compressImageToWebP
} from '../lib/supabase';

export default function StudentPortal({
  classes,
  projects,
  onSaveProject,
  onNavigateHome,
  onSelectProject
}) {
  // Key verification state
  const [accessKeyInput, setAccessKeyInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [keyError, setKeyError] = useState('');
  const [verifiedToken, setVerifiedToken] = useState(null);
  const [matchedClass, setMatchedClass] = useState(null);
  const [isKeyVerified, setIsKeyVerified] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    creators: '',
    posterUrl: '',
    gameUrl: '',
    description: ''
  });

  // Poster Upload states
  const [posterInputType, setPosterInputType] = useState('UPLOAD'); // 'UPLOAD' or 'DRIVE'
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressStats, setCompressStats] = useState(null);
  const fileInputRef = useRef(null);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [savedProjectId, setSavedProjectId] = useState(null);

  // -----------------------------------------------------------
  // Verify Group Token & Forward to Specific Group Form
  // -----------------------------------------------------------
  const handleVerifyKey = async (e) => {
    e.preventDefault();
    setKeyError('');
    const clean = accessKeyInput.trim();

    if (!clean || clean.length !== 6 || !/^\d{6}$/.test(clean)) {
      setKeyError('Kunci akses harus berupa 6 digit angka.');
      return;
    }

    setIsVerifying(true);
    try {
      const result = await verifyGroupToken(clean);
      if (result.valid && result.token) {
        const token = result.token;
        setVerifiedToken(token);

        // Find associated class
        const targetClass = classes.find(c => c.id === token.classId) || {
          id: token.classId || 'umum',
          name: token.classId ? token.classId.toUpperCase() : 'Kelas Peserta'
        };
        setMatchedClass(targetClass);

        // Check if there is an existing project for this group or token
        let existingProj = null;
        if (token.projectId) {
          existingProj = projects.find(p => p.id === token.projectId);
        } else if (token.groupName && targetClass.id) {
          existingProj = projects.find(p => 
            p.classId === targetClass.id && 
            p.creators && 
            p.creators.toLowerCase().includes(token.groupName.toLowerCase())
          );
        }

        if (existingProj) {
          setFormData({
            title: existingProj.title || '',
            creators: existingProj.creators || token.groupName || '',
            posterUrl: existingProj.posterUrl || '',
            gameUrl: existingProj.gameUrl || '',
            description: existingProj.description || ''
          });
        } else {
          // Fresh form with group pre-filled
          setFormData({
            title: '',
            creators: token.groupName || 'Kelompok Siswa',
            posterUrl: '',
            gameUrl: '',
            description: ''
          });
        }

        setIsKeyVerified(true);
        setKeyError('');
      } else {
        setKeyError(result.message || 'Kunci akses tidak valid atau sudah pernah digunakan.');
      }
    } catch (err) {
      setKeyError('Terjadi gangguan jaringan saat verifikasi kunci akses: ' + err.message);
    } finally {
      setIsVerifying(false);
    }
  };

  // -----------------------------------------------------------
  // Poster Image Processing (WebP Compressor)
  // -----------------------------------------------------------
  const processImageFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Berkas harus berupa gambar (PNG, JPG, JPEG, WEBP).');
      return;
    }

    setIsCompressing(true);
    setCompressStats(null);
    try {
      const result = await compressImageToWebP(file, 1600, 0.82);
      setFormData(prev => ({ ...prev, posterUrl: result.dataUrl }));
      setCompressStats({
        originalKb: result.originalSizeKb,
        compressedKb: result.compressedSizeKb,
        format: result.format
      });
    } catch (err) {
      alert('Gagal memproses gambar: ' + err.message);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDropImage = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDriveUrlChange = (e) => {
    const rawVal = e.target.value;
    const converted = convertGoogleDriveUrl(rawVal);
    setFormData(prev => ({ ...prev, posterUrl: converted }));
  };

  // -----------------------------------------------------------
  // Submit Project & Consume Single-Use Group Token
  // -----------------------------------------------------------
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Mohon isi judul karya / game AI.');
      return;
    }
    if (!formData.creators.trim()) {
      alert('Mohon isi nama kelompok atau anggota kelompok pembuat.');
      return;
    }
    if (!formData.posterUrl.trim()) {
      alert('Mohon unggah gambar poster karya atau cantumkan link Google Drive poster.');
      return;
    }

    setIsSaving(true);
    try {
      const projectId = verifiedToken.projectId || `proj-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const classId = matchedClass?.id || verifiedToken.classId || classes[0]?.id || 'umum';

      // Keep existing likes/comments if updating
      const existing = projects.find(p => p.id === projectId);
      const likesCount = existing ? existing.likesCount : 0;
      const comments = existing ? existing.comments : [];

      const projectData = {
        id: projectId,
        classId,
        // pieceNumber is automatically handled by saveProject if left empty
        pieceNumber: existing?.pieceNumber || undefined,
        title: formData.title.trim(),
        creators: formData.creators.trim(),
        format: compressStats?.format || 'WEBP',
        posterUrl: formData.posterUrl.trim(),
        gameUrl: formData.gameUrl.trim(),
        description: formData.description.trim(),
        likesCount,
        comments
      };

      // 1. Save project to database
      await onSaveProject(projectData);

      // 2. Consume group token permanently so each group has only 1 chance
      await consumeGroupToken(verifiedToken.key, projectId);

      setSavedProjectId(projectId);
      setSaveSuccess(true);
    } catch (err) {
      alert('Gagal menyimpan karya: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="container student-portal-section">
      {/* Back to Gallery Button */}
      <button
        type="button"
        className="student-back-btn"
        onClick={onNavigateHome}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_back</span>
        <span>Kembali ke Galeri Pameran</span>
      </button>

      {/* Editorial Hero Header matching Figma aesthetic */}
      <div className="student-portal-hero">
        <div className="category-tag">PAMERAN / PORTAL PENGUNGGAHAN KARYA SISWA</div>
        <section className="hero-columns">
          <h1 className="main-headline">
            Unggah karya kelompok.
          </h1>
          <p className="hero-description">
            Layanan mandiri bagi kelompok siswa SMAS Kristen Harapan untuk mengunggah poster karya dan tautan game AI menggunakan kunci akses kelompok.
          </p>
        </section>
      </div>

      <div className="fine-divider" style={{ marginBottom: 36 }} />

      {/* Main Content Area */}
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        {saveSuccess ? (
          /* ======================================================== */
          /* SUCCESS SCREEN                                           */
          /* ======================================================== */
          <div className="student-panel-card" style={{ padding: '56px 40px', textAlign: 'center' }}>
            <div style={{
              width: 68,
              height: 68,
              borderRadius: '50%',
              background: '#e6f4ea',
              color: '#137333',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px auto'
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 38 }}>check_circle</span>
            </div>

            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 30, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 12 }}>
              Karya Berhasil Diterbitkan
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 15, maxWidth: 540, margin: '0 auto 16px auto', lineHeight: 1.6 }}>
              Karya <strong>"{formData.title}"</strong> oleh <strong>{formData.creators}</strong> di kelas <strong>{matchedClass?.name}</strong> telah tersimpan ke dalam database pameran dan siap dinikmati pengunjung.
            </p>

            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              background: '#f1f3f4',
              borderRadius: 20,
              fontSize: 12,
              color: '#3c4043',
              marginBottom: 36
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#137333' }}>lock</span>
              <span>Kunci kelompok <strong>{verifiedToken?.key}</strong> telah ditandai selesai (1 kali penggunaan)</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
              <button
                type="button"
                className="student-submit-btn"
                onClick={() => {
                  if (savedProjectId && onSelectProject) {
                    const saved = projects.find(p => p.id === savedProjectId) || { id: savedProjectId, classId: matchedClass?.id };
                    onSelectProject(saved);
                  } else {
                    onNavigateHome();
                  }
                }}
              >
                <span>Lihat Karya di Galeri Kelas</span>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>open_in_new</span>
              </button>

              <button
                type="button"
                className="action-btn"
                style={{ padding: '12px 24px', fontSize: 14, fontWeight: 500 }}
                onClick={onNavigateHome}
              >
                <span>Selesai &amp; Keluar</span>
              </button>
            </div>
          </div>
        ) : !isKeyVerified ? (
          /* ======================================================== */
          /* STEP 1: TOKEN INPUT & FORWARDING GATE                    */
          /* ======================================================== */
          <div className="student-panel-card">
            <div className="student-step-header">
              <div className="student-step-badge">
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>key</span>
                <span>Langkah 1 &mdash; Masukkan Kunci Akses Kelompok</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Kode 6-digit sekali pakai per kelompok
              </div>
            </div>

            <div className="student-pin-container">
              <div style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-medium)',
                color: 'var(--accent-terracotta)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 18px auto'
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: 28 }}>pin</span>
              </div>

              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 8 }}>
                Kunci Akses Kelompok
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, maxWidth: 480, margin: '0 auto 28px auto', lineHeight: 1.55 }}>
                Masukkan <strong>6-digit token akses</strong> yang diberikan oleh guru atau panitia. Sistem akan langsung mengarahkan Anda ke formulir kelas dan kelompok Anda.
              </p>

              <form onSubmit={handleVerifyKey} style={{ maxWidth: 360, margin: '0 auto' }}>
                <div style={{ marginBottom: 18 }}>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    autoFocus
                    placeholder="••••••"
                    value={accessKeyInput}
                    onChange={(e) => setAccessKeyInput(e.target.value.replace(/\D/g, ''))}
                    className="student-pin-field"
                  />
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
                    Ketik 6 digit angka tanpa spasi
                  </div>
                </div>

                {keyError && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    color: '#b00020',
                    fontSize: 13,
                    fontWeight: 500,
                    background: '#fde8e8',
                    border: '1px solid #f8b4b4',
                    padding: '12px 14px',
                    borderRadius: 4,
                    marginBottom: 20,
                    textAlign: 'left',
                    lineHeight: 1.45
                  }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 18, flexShrink: 0, marginTop: 2 }}>error</span>
                    <span>{keyError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isVerifying || accessKeyInput.length !== 6}
                  className="student-submit-btn"
                  style={{ width: '100%', height: 48, fontSize: 15 }}
                >
                  <span>{isVerifying ? 'Memverifikasi Token...' : 'Masuk & Buka Formulir Kelompok'}</span>
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_forward</span>
                </button>
              </form>

              {/* Security Hint */}
              <div style={{ marginTop: 32, paddingTop: 20, borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>info</span>
                <span>Setiap kelompok memiliki 1 token unik dan hanya 1 kali kesempatan mengunggah karya.</span>
              </div>
            </div>
          </div>
        ) : (
          /* ======================================================== */
          /* STEP 2: FORWARDED GROUP FORM                             */
          /* ======================================================== */
          <div className="student-panel-card">
            {/* Header with Group and Class Indicator */}
            <div className="student-step-header" style={{ background: '#f8fafc' }}>
              <div className="student-step-badge" style={{ color: '#137333' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>verified</span>
                <span>Formulir Karya Kelompok</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#137333', fontWeight: 600 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>key</span>
                <span>Token: {verifiedToken?.key}</span>
              </div>
            </div>

            {/* Destination Group Forwarded Card */}
            <div style={{
              margin: '24px 32px 0 32px',
              padding: '16px 20px',
              background: '#e8f0fe',
              border: '1px solid #c2e7ff',
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 4,
                  background: '#1a73e8',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 22 }}>groups</span>
                </div>
                <div>
                  <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.8, color: '#174ea6', fontWeight: 700 }}>
                    Kelompok Terhubung Otomatis
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#041e49', marginTop: 1 }}>
                    Kelas: {matchedClass?.name || verifiedToken?.classId} &middot; {verifiedToken?.groupName || 'Kelompok Siswa'}
                  </div>
                </div>
              </div>

              <div style={{ fontSize: 12, color: '#174ea6', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>tag</span>
                <span>Nomor urut otomatis diatur sistem</span>
              </div>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleSubmitForm} className="student-form-section" style={{ padding: '28px 32px 32px 32px' }}>
              
              {/* Field 1: Title */}
              <div className="student-field-group">
                <label className="student-field-label">
                  Judul Karya / Judul Game AI <span className="required">*</span>
                </label>
                <input
                  type="text"
                  required
                  className="form-input-text"
                  style={{ width: '100%', height: 44, padding: '0 14px', fontSize: 15 }}
                  placeholder="Contoh: Petualangan Desa Adat Penglipuran AI"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
                <div className="student-field-hint">Nama atau judul resmi game AI buatan kelompok Anda.</div>
              </div>

              {/* Field 2: Group & Creator Members */}
              <div className="student-field-group">
                <label className="student-field-label">
                  Nama Kelompok &amp; Anggota Pembuat <span className="required">*</span>
                </label>
                <input
                  type="text"
                  required
                  className="form-input-text"
                  style={{ width: '100%', height: 44, padding: '0 14px', fontSize: 15 }}
                  placeholder="Contoh: Kelompok 1 (Kadek, Putu, Wayan, Made)"
                  value={formData.creators}
                  onChange={(e) => setFormData({ ...formData, creators: e.target.value })}
                />
                <div className="student-field-hint">Tuliskan nama kelompok beserta nama-nama anggota tim pembuat karya.</div>
              </div>

              {/* Field 3: Poster Image with Dual Input (Direct Upload with WebP Compression or Google Drive) */}
              <div className="student-field-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                  <label className="student-field-label" style={{ margin: 0 }}>
                    Poster Karya <span className="required">*</span>
                  </label>

                  {/* Mode Selector Tabs */}
                  <div style={{ display: 'inline-flex', border: '1px solid var(--border-medium)', borderRadius: 4, overflow: 'hidden' }}>
                    <button
                      type="button"
                      style={{
                        padding: '6px 12px',
                        fontSize: 12,
                        fontWeight: 600,
                        background: posterInputType === 'UPLOAD' ? 'var(--text-primary)' : 'var(--bg-canvas)',
                        color: posterInputType === 'UPLOAD' ? '#ffffff' : 'var(--text-secondary)',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                      onClick={() => setPosterInputType('UPLOAD')}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 15 }}>upload_file</span>
                      <span>Unggah Gambar Langsung</span>
                    </button>

                    <button
                      type="button"
                      style={{
                        padding: '6px 12px',
                        fontSize: 12,
                        fontWeight: 600,
                        background: posterInputType === 'DRIVE' ? 'var(--text-primary)' : 'var(--bg-canvas)',
                        color: posterInputType === 'DRIVE' ? '#ffffff' : 'var(--text-secondary)',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                      onClick={() => setPosterInputType('DRIVE')}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 15 }}>link</span>
                      <span>Tautan Google Drive</span>
                    </button>
                  </div>
                </div>

                {posterInputType === 'UPLOAD' ? (
                  /* Option A: Direct File Upload with Auto-WebP Compression */
                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleFileInputChange}
                    />

                    <div
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={handleDropImage}
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        border: '2px dashed var(--border-medium)',
                        borderRadius: 6,
                        padding: '28px 20px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        background: isCompressing ? '#f8f9fa' : 'var(--bg-subtle)',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {isCompressing ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                          <span className="material-symbols-outlined spin" style={{ fontSize: 32, color: 'var(--accent-terracotta)' }}>progress_activity</span>
                          <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>Mengompresi gambar ke WebP ringan...</span>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 36, color: 'var(--accent-terracotta)' }}>cloud_upload</span>
                          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                            Klik untuk memilih berkas poster atau seret gambar ke sini
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                            Mendukung PNG, JPG, JPEG, WEBP. Gambar akan otomatis dikompresi agar ringan dan cepat dibuka di HP pengunjung.
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Compression Feedback Banner */}
                    {compressStats && (
                      <div style={{
                        marginTop: 10,
                        padding: '8px 14px',
                        background: '#e6f4ea',
                        border: '1px solid #b7e1cd',
                        borderRadius: 4,
                        fontSize: 12,
                        color: '#137333',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8
                      }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>verified</span>
                        <span>
                          Ukuran terkompresi: <strong>{compressStats.compressedKb} KB ({compressStats.format})</strong> dari berkas asli {compressStats.originalKb} KB &mdash; optimal untuk pameran live!
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Option B: Google Drive Link Input */
                  <div>
                    <input
                      type="text"
                      className="form-input-text"
                      style={{ width: '100%', height: 44, padding: '0 14px', fontSize: 14 }}
                      placeholder="Tempel tautan Google Drive (contoh: drive.google.com/file/d/...)"
                      value={formData.posterUrl}
                      onChange={handleDriveUrlChange}
                    />
                    <div className="student-field-hint">
                      Tautan Google Drive akan otomatis dikonversi ke gambar resolusi tinggi langsung. Pastikan izin berkas <em>"Siapa saja yang memiliki link"</em>.
                    </div>
                  </div>
                )}

                {/* Instant Poster Live Preview */}
                {formData.posterUrl && (
                  <div className="student-preview-card" style={{ marginTop: 16 }}>
                    <img
                      src={formData.posterUrl}
                      alt="Pratinjau Poster"
                      className="student-preview-img"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#137333' }}>image</span>
                        <span>Pratinjau Poster Terdeteksi</span>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: 8 }}>
                        Poster ini akan ditampilkan secara penuh di galeri pameran kelas dan dapat diperbesar oleh pengunjung.
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, posterUrl: '' }));
                          setCompressStats(null);
                        }}
                        style={{
                          fontSize: 12,
                          color: '#dc3545',
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>delete</span>
                        <span>Hapus atau ganti poster</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Field 4: Game URL */}
              <div className="student-field-group">
                <label className="student-field-label">
                  Tautan Game AI Siswa (Opsional)
                </label>
                <input
                  type="url"
                  className="form-input-text"
                  style={{ width: '100%', height: 44, padding: '0 14px', fontSize: 14 }}
                  placeholder="https://scratch.mit.edu/projects/... atau https://itch.io/..."
                  value={formData.gameUrl}
                  onChange={(e) => setFormData({ ...formData, gameUrl: e.target.value })}
                />
                <div className="student-field-hint">
                  Tautan game Scratch, Roblox, WebGL, atau platform lain agar pengunjung dapat mencoba langsung game AI kelompok Anda.
                </div>
              </div>

              {/* Field 5: Description */}
              <div className="student-field-group">
                <label className="student-field-label">
                  Deskripsi Singkat Karya (Opsional)
                </label>
                <textarea
                  rows={4}
                  className="form-input-text"
                  style={{ width: '100%', padding: '12px 14px', fontSize: 14, resize: 'vertical' }}
                  placeholder="Ceritakan pesan karya, latar belakang game AI, atau eksplorasi kelompok Anda tentang budaya Desa Adat Penglipuran..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              {/* Security & One-Time Rule Notice */}
              <div className="student-notice-box" style={{ marginTop: 24, marginBottom: 28 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 22, color: 'var(--accent-terracotta)', flexShrink: 0 }}>
                  shield
                </span>
                <div>
                  <strong>Ketentuan Kurasi &amp; Pengisian Sekali Pakai:</strong> Pastikan judul dan poster yang diunggah sudah benar. Setiap token kelompok hanya dapat digunakan <strong>satu kali</strong> untuk mengunggah karya. Interaksi publik (jumlah like dan komentar) diatur oleh sistem pameran.
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 14, paddingTop: 16, borderTop: '1px solid var(--border-subtle)' }}>
                <button
                  type="button"
                  className="action-btn"
                  style={{ padding: '12px 24px', fontSize: 14 }}
                  onClick={onNavigateHome}
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={isSaving || !formData.posterUrl}
                  className="student-submit-btn"
                  style={{ height: 46 }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>upload</span>
                  <span>{isSaving ? 'Menerbitkan Karya...' : 'Kirim & Terbitkan Karya Kelompok'}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}
