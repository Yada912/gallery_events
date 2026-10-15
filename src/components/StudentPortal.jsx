import React, { useState, useEffect } from 'react';
import { validateAndConsumeAccessKey, convertGoogleDriveUrl } from '../lib/supabase';

export default function StudentPortal({
  classes,
  projects,
  initialClass,
  onSaveProject,
  onNavigateHome,
  onSelectProject
}) {
  const [selectedClassId, setSelectedClassId] = useState(initialClass?.id || classes[0]?.id || '');
  const [mode, setMode] = useState('EDIT'); // 'EDIT' or 'NEW'
  const [selectedProjectId, setSelectedProjectId] = useState('');
  
  // Key verification state
  const [accessKeyInput, setAccessKeyInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [keyError, setKeyError] = useState('');
  const [verifiedKey, setVerifiedKey] = useState('');
  const [isKeyVerified, setIsKeyVerified] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    creators: '',
    pieceNumber: '01',
    posterUrl: '',
    gameUrl: '',
    description: '',
    format: 'PNG'
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [savedProjectId, setSavedProjectId] = useState(null);

  // Filter projects by class
  const classProjects = projects.filter(p => p.classId === selectedClassId);

  // Sync initial class
  useEffect(() => {
    if (initialClass && initialClass.id !== selectedClassId) {
      setSelectedClassId(initialClass.id);
    }
  }, [initialClass]);

  // When class or mode changes, update selected project or form
  useEffect(() => {
    if (mode === 'EDIT') {
      if (classProjects.length > 0) {
        const targetProj = classProjects.find(p => p.id === selectedProjectId) || classProjects[0];
        setSelectedProjectId(targetProj.id);
        setFormData({
          title: targetProj.title || '',
          creators: targetProj.creators || '',
          pieceNumber: targetProj.pieceNumber || '01',
          posterUrl: targetProj.posterUrl || '',
          gameUrl: targetProj.gameUrl || '',
          description: targetProj.description || '',
          format: targetProj.format || 'PNG'
        });
      } else {
        setSelectedProjectId('');
        setFormData({
          title: '',
          creators: '',
          pieceNumber: '01',
          posterUrl: '',
          gameUrl: '',
          description: '',
          format: 'PNG'
        });
      }
    } else {
      // NEW mode
      const nextNum = String(classProjects.length + 1).padStart(2, '0');
      setFormData({
        title: '',
        creators: '',
        pieceNumber: nextNum,
        posterUrl: '',
        gameUrl: '',
        description: '',
        format: 'PNG'
      });
    }
  }, [selectedClassId, mode]);

  // When project dropdown changes in EDIT mode
  const handleProjectSelect = (projId) => {
    setSelectedProjectId(projId);
    const target = classProjects.find(p => p.id === projId);
    if (target) {
      setFormData({
        title: target.title || '',
        creators: target.creators || '',
        pieceNumber: target.pieceNumber || '01',
        posterUrl: target.posterUrl || '',
        gameUrl: target.gameUrl || '',
        description: target.description || '',
        format: target.format || 'PNG'
      });
    }
  };

  // Verify Single-use Access Key
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
      const selectedClass = classes.find(c => c.id === selectedClassId);
      const usedForDescription = mode === 'EDIT'
        ? `Edit karya ${formData.title || selectedProjectId} (${selectedClass?.name || selectedClassId})`
        : `Tambah karya baru (${selectedClass?.name || selectedClassId})`;

      const result = await validateAndConsumeAccessKey(clean, usedForDescription);
      if (result.valid) {
        setIsKeyVerified(true);
        setVerifiedKey(clean);
        setKeyError('');
      } else {
        setKeyError(result.message || 'Kunci akses tidak valid atau sudah pernah digunakan.');
      }
    } catch (err) {
      setKeyError('Terjadi kesalahan koneksi saat verifikasi kunci.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Handle Form Change with Google Drive Auto-converter
  const handlePosterUrlChange = (e) => {
    const rawVal = e.target.value;
    const converted = convertGoogleDriveUrl(rawVal);
    setFormData(prev => ({ ...prev, posterUrl: converted }));
  };

  // Submit Student Changes
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Judul karya harus diisi.');
      return;
    }
    if (!formData.creators.trim()) {
      alert('Nama pembuat / kelompok harus diisi.');
      return;
    }

    setIsSaving(true);
    try {
      let projectId = selectedProjectId;
      let existingLikes = 0;
      let existingComments = [];

      if (mode === 'EDIT') {
        const existing = classProjects.find(p => p.id === selectedProjectId);
        if (existing) {
          existingLikes = existing.likesCount || 0;
          existingComments = existing.comments || [];
        }
      } else {
        projectId = `proj-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      }

      const projectData = {
        id: projectId,
        classId: selectedClassId,
        pieceNumber: formData.pieceNumber || '01',
        title: formData.title.trim(),
        creators: formData.creators.trim(),
        format: formData.format || 'PNG',
        posterUrl: formData.posterUrl.trim() || '/artworks/poster1.jpg',
        gameUrl: formData.gameUrl.trim(),
        description: formData.description.trim(),
        // Security constraint: students cannot edit likes or comments
        likesCount: existingLikes,
        comments: existingComments,
        displayOrder: mode === 'NEW' ? classProjects.length + 1 : undefined
      };

      await onSaveProject(projectData);
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
      {/* Back Button */}
      <button
        type="button"
        className="student-back-btn"
        onClick={onNavigateHome}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_back</span>
        <span>Kembali ke Galeri Pameran</span>
      </button>

      {/* Editorial Hero Header matching Figma style */}
      <div className="student-portal-hero">
        <div className="category-tag">PAMERAN / PORTAL PEMBARUAN KARYA SISWA</div>
        <section className="hero-columns">
          <h1 className="main-headline">
            Perbarui karya pameran.
          </h1>
          <p className="hero-description">
            Layanan mandiri bagi kelompok siswa untuk memperbarui judul, poster karya, dan tautan game AI selama pameran berlangsung.
          </p>
        </section>
      </div>

      <div className="fine-divider" style={{ marginBottom: 36 }} />

      {/* Main Content Area */}
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        {saveSuccess ? (
          /* Success Screen */
          <div className="student-panel-card" style={{ padding: '56px 40px', textAlign: 'center' }}>
            <div style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: '#e6f4ea',
              color: '#137333',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px auto'
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 36 }}>check_circle</span>
            </div>

            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 400, color: 'var(--text-primary)', marginBottom: 12 }}>
              Karya Berhasil Disimpan
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 15, maxWidth: 520, margin: '0 auto 32px auto', lineHeight: 1.6 }}>
              Perubahan pada karya <strong>"{formData.title}"</strong> telah tersimpan ke dalam database pameran dan siap dinikmati para pengunjung galeri.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
              <button
                type="button"
                className="student-submit-btn"
                onClick={() => {
                  if (savedProjectId && onSelectProject) {
                    const saved = projects.find(p => p.id === savedProjectId) || { id: savedProjectId, classId: selectedClassId };
                    onSelectProject(saved);
                  } else {
                    onNavigateHome();
                  }
                }}
              >
                <span>Lihat Karya di Galeri</span>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>open_in_new</span>
              </button>

              <button
                type="button"
                className="action-btn"
                style={{ padding: '12px 20px', fontSize: 14, fontWeight: 500 }}
                onClick={() => {
                  setSaveSuccess(false);
                  setIsKeyVerified(false);
                  setVerifiedKey('');
                  setAccessKeyInput('');
                }}
              >
                <span>Perbarui Karya Lain</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="student-panel-card">
            
            {/* Step 1: Mode & Class Selection */}
            <div className="student-step-header">
              <div className="student-step-badge">
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>tune</span>
                <span>Langkah 1 &mdash; Tentukan Kelas &amp; Mode</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {mode === 'EDIT' ? 'Memperbarui karya yang ada' : 'Mendaftarkan karya baru'}
              </div>
            </div>

            <div style={{ padding: '28px 32px 20px 32px', borderBottom: '1px solid var(--border-subtle)' }}>
              {/* Mode Toggle Buttons */}
              <div className="student-mode-grid">
                <div
                  className={`student-mode-btn ${mode === 'EDIT' ? 'active' : ''}`}
                  onClick={() => setMode('EDIT')}
                  role="button"
                  tabIndex={0}
                >
                  <div className="student-mode-btn-title">
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>edit_note</span>
                    <span>Edit Karya yang Sudah Ada</span>
                  </div>
                  <div className="student-mode-btn-desc">
                    Perbarui judul, poster, atau tautan game pada karya yang sudah terdaftar.
                  </div>
                </div>

                <div
                  className={`student-mode-btn ${mode === 'NEW' ? 'active' : ''}`}
                  onClick={() => setMode('NEW')}
                  role="button"
                  tabIndex={0}
                >
                  <div className="student-mode-btn-title">
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add_circle</span>
                    <span>Tambah Karya Baru</span>
                  </div>
                  <div className="student-mode-btn-desc">
                    Unggah karya pertama atau kelompok baru ke dalam galeri kelas.
                  </div>
                </div>
              </div>

              {/* Class & Project Selection Fields */}
              <div style={{ display: 'grid', gridTemplateColumns: mode === 'EDIT' ? '1fr 1.5fr' : '1fr', gap: 20, marginBottom: 12 }}>
                <div>
                  <label className="student-field-label">
                    Pilih Kelas <span className="required">*</span>
                  </label>
                  <select
                    className="form-input-text"
                    style={{ width: '100%', height: 42, padding: '0 12px', fontSize: 14, fontWeight: 500 }}
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {mode === 'EDIT' && (
                  <div>
                    <label className="student-field-label">
                      Pilih Karya Siswa <span className="required">*</span>
                    </label>
                    {classProjects.length > 0 ? (
                      <select
                        className="form-input-text"
                        style={{ width: '100%', height: 42, padding: '0 12px', fontSize: 14 }}
                        value={selectedProjectId}
                        onChange={(e) => handleProjectSelect(e.target.value)}
                      >
                        {classProjects.map(p => (
                          <option key={p.id} value={p.id}>
                            Karya {p.pieceNumber} &mdash; {p.title} ({p.creators})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div style={{
                        padding: '10px 14px',
                        background: 'rgba(184, 67, 35, 0.06)',
                        border: '1px solid rgba(184, 67, 35, 0.25)',
                        borderRadius: 4,
                        fontSize: 13,
                        color: 'var(--accent-terracotta)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8
                      }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>info</span>
                        <span>Belum ada karya di kelas ini. Pilih mode <strong>Tambah Karya Baru</strong>.</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Step 2: Key Verification Gate */}
            {!isKeyVerified ? (
              <div>
                <div className="student-step-header">
                  <div className="student-step-badge">
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>lock</span>
                    <span>Langkah 2 &mdash; Verifikasi Kunci Akses Siswa</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    Kode 6-digit sekali pakai
                  </div>
                </div>

                <div className="student-pin-container">
                  <div style={{
                    width: 52,
                    height: 52,
                    borderRadius: '50%',
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border-medium)',
                    color: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px auto'
                  }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 26 }}>key</span>
                  </div>

                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 24, fontWeight: 400, color: 'var(--text-primary)', marginBottom: 8 }}>
                    Masukkan Kunci Akses Siswa
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 14, maxWidth: 480, margin: '0 auto 28px auto', lineHeight: 1.5 }}>
                    Minta <strong>6-digit kode akses sekali pakai</strong> kepada guru pendamping atau administrator pameran untuk membuka formulir pengisian karya.
                  </p>

                  <form onSubmit={handleVerifyKey} style={{ maxWidth: 360, margin: '0 auto' }}>
                    <div style={{ marginBottom: 16 }}>
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
                    </div>

                    {keyError && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        color: '#b00020',
                        fontSize: 13,
                        fontWeight: 500,
                        background: '#fde8e8',
                        padding: '10px 14px',
                        borderRadius: 4,
                        marginBottom: 18,
                        textAlign: 'left'
                      }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 18, flexShrink: 0 }}>error</span>
                        <span>{keyError}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isVerifying || accessKeyInput.length !== 6}
                      className="student-submit-btn"
                      style={{ width: '100%', height: 46 }}
                    >
                      <span>{isVerifying ? 'Memverifikasi Kunci...' : 'Buka Formulir Karya'}</span>
                      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_forward</span>
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              /* Step 3: Verified Edit Form */
              <div>
                <div className="student-step-header">
                  <div className="student-step-badge" style={{ color: '#137333' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>verified</span>
                    <span>Langkah 3 &mdash; Formulir Informasi Karya</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#137333', fontWeight: 600 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>lock_open</span>
                    <span>Kunci Terverifikasi: {verifiedKey}</span>
                  </div>
                </div>

                <form onSubmit={handleSubmitForm} className="student-form-section">
                  {/* Verified Confirmation Banner */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 20px',
                    background: '#e6f4ea',
                    border: '1px solid #b7e1cd',
                    borderRadius: 4,
                    marginBottom: 28
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#137333', fontSize: 13, fontWeight: 500 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 20 }}>verified</span>
                      <span>Kunci akses telah divalidasi dan digunakan. Formulir siap disimpan.</span>
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#137333' }}>
                      {mode === 'EDIT' ? 'Pembaruan Karya' : 'Karya Baru'}
                    </div>
                  </div>

                  {/* Title & Creators */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                    <div>
                      <label className="student-field-label">
                        Judul Karya / Judul Game AI <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        className="form-input-text"
                        style={{ width: '100%', height: 42, padding: '0 12px', fontSize: 14 }}
                        placeholder="Contoh: Petualangan Desa Adat Penglipuran"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="student-field-label">
                        Nama Kelompok / Anggota Pembuat <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        className="form-input-text"
                        style={{ width: '100%', height: 42, padding: '0 12px', fontSize: 14 }}
                        placeholder="Contoh: Kelompok 1 (Kadek, Putu, Wayan)"
                        value={formData.creators}
                        onChange={(e) => setFormData({ ...formData, creators: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Piece Number & Media Format */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20, marginBottom: 20 }}>
                    <div>
                      <label className="student-field-label">
                        Nomor Urut Karya
                      </label>
                      <input
                        type="text"
                        className="form-input-text"
                        style={{ width: '100%', height: 42, padding: '0 12px', fontSize: 14 }}
                        placeholder="01"
                        value={formData.pieceNumber}
                        onChange={(e) => setFormData({ ...formData, pieceNumber: e.target.value })}
                      />
                      <div className="student-field-hint">Format dua digit: 01, 02, dst.</div>
                    </div>

                    <div>
                      <label className="student-field-label">
                        Format Media
                      </label>
                      <input
                        type="text"
                        className="form-input-text"
                        style={{ width: '100%', height: 42, padding: '0 12px', fontSize: 14 }}
                        placeholder="PNG / JPG / WebGL"
                        value={formData.format}
                        onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                      />
                      <div className="student-field-hint">Jenis format karya grafis atau poster.</div>
                    </div>
                  </div>

                  {/* Poster URL with Google Drive Support */}
                  <div className="student-field-group">
                    <label className="student-field-label">
                      Tautan Poster Gambar (Google Drive atau URL Langsung)
                    </label>
                    <input
                      type="text"
                      className="form-input-text"
                      style={{ width: '100%', height: 42, padding: '0 12px', fontSize: 14 }}
                      placeholder="Tempel tautan Google Drive atau URL poster..."
                      value={formData.posterUrl}
                      onChange={handlePosterUrlChange}
                    />
                    <div className="student-field-hint">
                      Tautan Google Drive (<code>drive.google.com/file/d/...</code>) akan otomatis dikonversi ke gambar resolusi tinggi langsung. Pastikan izin berkas <em>"Siapa saja yang memiliki link"</em>.
                    </div>

                    {/* Instant Poster Preview */}
                    {formData.posterUrl && (
                      <div className="student-preview-card">
                        <img
                          src={formData.posterUrl}
                          alt="Pratinjau Poster"
                          className="student-preview-img"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#137333' }}>image</span>
                            <span>Pratinjau Poster Terdeteksi</span>
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                            Poster ini akan ditampilkan secara penuh di galeri kelas dan mode perbesar bagi pengunjung.
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Game Link */}
                  <div className="student-field-group">
                    <label className="student-field-label">
                      Tautan Game Siswa (Opsional)
                    </label>
                    <input
                      type="url"
                      className="form-input-text"
                      style={{ width: '100%', height: 42, padding: '0 12px', fontSize: 14 }}
                      placeholder="https://scratch.mit.edu/... atau https://itch.io/..."
                      value={formData.gameUrl}
                      onChange={(e) => setFormData({ ...formData, gameUrl: e.target.value })}
                    />
                    <div className="student-field-hint">
                      Tautan untuk membuka game buatan kelompok siswa ketika pengunjung mengklik tombol <em>"Buka tautan karya ↗"</em>.
                    </div>
                  </div>

                  {/* Description */}
                  <div className="student-field-group">
                    <label className="student-field-label">Deskripsi Singkat Karya</label>
                    <textarea
                      rows={4}
                      className="form-input-text"
                      style={{ width: '100%', padding: '12px', fontSize: 14, resize: 'vertical' }}
                      placeholder="Ceritakan pesan karya, latar belakang game AI, atau proses eksplorasi di Desa Adat Penglipuran..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>

                  {/* Security Notice */}
                  <div className="student-notice-box">
                    <span className="material-symbols-outlined" style={{ fontSize: 20, color: 'var(--accent-terracotta)', flexShrink: 0 }}>
                      shield
                    </span>
                    <div>
                      <strong>Ketentuan Keamanan Pameran:</strong> Siswa hanya dapat memperbarui konten karya di atas. Seluruh interaksi publik (jumlah suka dan diskusi komentar) dilindungi oleh sistem dan tidak dapat dimodifikasi secara mandiri.
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 14, paddingTop: 12, borderTop: '1px solid var(--border-subtle)' }}>
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
                      disabled={isSaving}
                      className="student-submit-btn"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>save</span>
                      <span>{isSaving ? 'Menyimpan...' : 'Simpan Perubahan Karya'}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
