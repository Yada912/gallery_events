import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  ShieldCheck, 
  Database, 
  MessageSquare, 
  Layers, 
  ExternalLink,
  RefreshCw,
  Copy,
  Lock,
  ArrowLeft,
  Heart,
  FileSpreadsheet,
  Upload,
  Eye,
  CheckCircle,
  AlertCircle,
  Key
} from 'lucide-react';
import { 
  isSupabaseConfigured, 
  resetToDemoData, 
  convertGoogleDriveUrl,
  setProjectLikesDirectly,
  updateCommentInProject,
  batchImportProjects,
  fetchAccessKeys,
  generateAccessKeys,
  deleteAccessKey,
  clearUsedAccessKeys,
  clearAllDatabaseAndDemoData
} from '../lib/supabase';

export default function AdminPage({
  classes,
  projects,
  onSaveClass,
  onDeleteClass,
  onSaveProject,
  onDeleteProject,
  onAddComment,
  onDeleteComment,
  onNavigateHome
}) {
  const [passcode, setPasscode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('gema_admin_auth') === 'true';
  });
  const [errorMsg, setErrorMsg] = useState('');

  const [activeTab, setActiveTab] = useState('PROJECTS'); // 'PROJECTS', 'CLASSES', 'COMMENTS', 'IMPORT', 'KEYS', 'SETTINGS'
  const [selectedClassFilter, setSelectedClassFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Access Keys State
  const [accessKeys, setAccessKeys] = useState([]);
  const [isGeneratingKeys, setIsGeneratingKeys] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);
  const [copiedAllKeys, setCopiedAllKeys] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAccessKeys().then(setAccessKeys);
    }
  }, [isAuthenticated]);

  // Project Form State
  const [editingProject, setEditingProject] = useState(null);
  const [projectForm, setProjectForm] = useState({
    id: '',
    classId: '',
    pieceNumber: '01',
    title: '',
    creators: '',
    format: 'PNG',
    posterUrl: '/artworks/poster1.jpg',
    gameUrl: '',
    description: '',
    likesCount: 0
  });

  // Class Form State
  const [editingClass, setEditingClass] = useState(null);
  const [classForm, setClassForm] = useState({
    id: '',
    name: '',
    displayOrder: 1,
    description: ''
  });

  // Direct Likes Editing State (projectId -> count)
  const [editingLikesId, setEditingLikesId] = useState(null);
  const [likesInputVal, setLikesInputVal] = useState(0);

  // Comment Editing State
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [commentEditForm, setCommentEditForm] = useState({
    authorName: '',
    content: '',
    isCreator: false
  });

  // Creator Reply State
  const [replyTarget, setReplyingTarget] = useState(null);
  const [replyText, setReplyText] = useState('');

  // Spreadsheet Import State
  const [rawSpreadsheetText, setRawSpreadsheetText] = useState('');
  const [parsedImportRows, setParsedImportRows] = useState([]);
  const [importStatus, setImportStatus] = useState(null);

  const handleLogin = (e) => {
    e.preventDefault();
    const correctCode = import.meta.env.VITE_ADMIN_PASSCODE;
    const isMatch = correctCode ? passcode === correctCode : (passcode === 'gema2026');
    if (isMatch) {
      setIsAuthenticated(true);
      sessionStorage.setItem('gema_admin_auth', 'true');
      setErrorMsg('');
    } else {
      setErrorMsg('Kode sandi tidak valid. Silakan periksa kembali.');
    }
  };

  // -------------------------------------------------------------
  // Project CRUD
  // -------------------------------------------------------------
  const startNewProject = () => {
    setEditingProject('NEW');
    setProjectForm({
      id: `p-${Date.now()}`,
      classId: classes[0]?.id || '',
      pieceNumber: String(projects.length + 1).padStart(2, '0'),
      title: '',
      creators: '',
      format: 'PNG',
      posterUrl: '/artworks/poster1.jpg',
      gameUrl: '',
      description: '',
      likesCount: 0
    });
  };

  const startEditProject = (p) => {
    setEditingProject(p.id);
    setProjectForm({
      id: p.id,
      classId: p.classId,
      pieceNumber: p.pieceNumber,
      title: p.title,
      creators: p.creators,
      format: p.format || 'PNG',
      posterUrl: p.posterUrl,
      gameUrl: p.gameUrl || '',
      description: p.description || '',
      likesCount: p.likesCount || 0
    });
  };

  const handleSaveProjectSubmit = async (e) => {
    e.preventDefault();
    // Auto convert Google Drive link if pasted
    const processedForm = {
      ...projectForm,
      posterUrl: convertGoogleDriveUrl(projectForm.posterUrl)
    };
    await onSaveProject(processedForm);
    setEditingProject(null);
  };

  // Direct Likes Modification
  const handleSaveDirectLikes = async (projectId) => {
    await setProjectLikesDirectly(projectId, likesInputVal);
    setEditingLikesId(null);
  };

  // -------------------------------------------------------------
  // Class CRUD
  // -------------------------------------------------------------
  const startNewClass = () => {
    setEditingClass('NEW');
    setClassForm({
      id: `class-${Date.now()}`,
      name: '',
      displayOrder: classes.length + 1,
      description: ''
    });
  };

  const startEditClass = (c) => {
    setEditingClass(c.id);
    setClassForm({
      id: c.id,
      name: c.name,
      displayOrder: c.displayOrder || 1,
      description: c.description || ''
    });
  };

  const handleSaveClassSubmit = async (e) => {
    e.preventDefault();
    await onSaveClass(classForm);
    setEditingClass(null);
  };

  const handleDeleteClassConfirmed = async (cls) => {
    const classProjectCount = projects.filter(p => p.classId === cls.id).length;
    const confirmText = classProjectCount > 0 
      ? `Kelas "${cls.name}" memiliki ${classProjectCount} karya.\nApakah Anda yakin ingin menghapus kelas ini dan semua karyanya?`
      : `Hapus kelas "${cls.name}"?`;
    
    if (window.confirm(confirmText)) {
      await onDeleteClass(cls.id);
    }
  };

  // -------------------------------------------------------------
  // Comment Editing & Moderation
  // -------------------------------------------------------------
  const startEditComment = (c) => {
    setEditingCommentId(c.id);
    setCommentEditForm({
      authorName: c.authorName,
      content: c.content,
      isCreator: Boolean(c.isCreator)
    });
  };

  const handleSaveEditedComment = async (projectId, commentId) => {
    await updateCommentInProject(projectId, commentId, commentEditForm);
    setEditingCommentId(null);
  };

  const handleSendCreatorReply = async (projectId, parentCommentId) => {
    if (!replyText.trim()) return;
    await onAddComment(projectId, {
      authorName: 'Pembuat Karya (Official)',
      content: replyText.trim(),
      isCreator: true,
      parentId: parentCommentId
    });
    setReplyingTarget(null);
    setReplyText('');
  };

  // -------------------------------------------------------------
  // Spreadsheet / Google Drive Parser & Batch Importer
  // -------------------------------------------------------------
  const handleParseSpreadsheet = () => {
    if (!rawSpreadsheetText.trim()) return;

    // Splits lines by newlines, columns by Tab (\t) or comma (,)
    const lines = rawSpreadsheetText.trim().split(/\r?\n/);
    const parsed = [];

    lines.forEach((line, index) => {
      // Check if tab-separated (standard copy-paste from Google Sheets / Excel)
      const isTab = line.includes('\t');
      const parts = isTab ? line.split('\t') : line.split(',');

      if (parts.length >= 2) {
        // Expected columns: Kelas | Judul | Pembuat | Link Drive Poster | Link Game | Deskripsi
        const className = parts[0]?.trim() || 'XI - IPA - 1';
        const title = parts[1]?.trim() || `Karya ${index + 1}`;
        const creators = parts[2]?.trim() || 'Kelompok Siswa';
        const rawDriveUrl = parts[3]?.trim() || '';
        const gameUrl = parts[4]?.trim() || '';
        const description = parts[5]?.trim() || '';

        // Auto convert Google Drive links
        const convertedPoster = convertGoogleDriveUrl(rawDriveUrl) || '/artworks/poster1.jpg';

        parsed.push({
          id: `proj-import-${Date.now()}-${index}`,
          className,
          title,
          creators,
          posterUrl: convertedPoster,
          rawPosterUrl: rawDriveUrl,
          gameUrl,
          description,
          pieceNumber: String(index + 1).padStart(2, '0')
        });
      }
    });

    setParsedImportRows(parsed);
  };

  const handleExecuteBatchImport = async () => {
    if (parsedImportRows.length === 0) return;
    setImportStatus('IMPORTING');
    try {
      await batchImportProjects(parsedImportRows);
      setImportStatus('SUCCESS');
      setRawSpreadsheetText('');
      setParsedImportRows([]);
      setTimeout(() => setImportStatus(null), 4000);
    } catch (err) {
      console.error('Batch import failed:', err);
      setImportStatus('ERROR');
    }
  };

  // Filtered projects
  const filteredProjects = projects.filter(p => {
    const matchesClass = selectedClassFilter === 'ALL' || p.classId === selectedClassFilter;
    const matchesSearch = !searchQuery || 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.creators.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesClass && matchesSearch;
  });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-canvas)' }}>
      {/* Standalone Admin Header */}
      <header className="site-header" style={{ borderBottom: '1px solid var(--border-medium)', background: '#ffffff' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 72 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981' }} />
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 600 }}>
              Panel Pengelola &middot; Gema Belajar
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span className={`status-indicator ${isSupabaseConfigured ? 'status-online' : 'status-offline'}`}>
              {isSupabaseConfigured ? '● Supabase Terhubung' : '● Mode Lokal Aktif'}
            </span>

            <button
              onClick={onNavigateHome}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 13,
                fontWeight: 500,
                padding: '6px 14px',
                border: '1px solid var(--border-medium)',
                borderRadius: 2,
                cursor: 'pointer'
              }}
            >
              <ArrowLeft size={14} />
              <span>Kembali ke Galeri Publik</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="container" style={{ padding: '32px 0 80px' }}>
        {!isAuthenticated ? (
          /* Authentication Screen */
          <div style={{ padding: 48, maxWidth: 440, margin: '60px auto', textAlign: 'center', background: '#ffffff', border: '1px solid var(--border-subtle)', borderRadius: 4, boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ marginBottom: 16, display: 'inline-flex', padding: 16, borderRadius: '50%', background: 'var(--bg-subtle)' }}>
              <Lock size={32} />
            </div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, marginBottom: 8 }}>
              Masuk Administrator
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.5 }}>
              Akses khusus untuk mengelola karya, kelas, tautan game eksternal, like, dan memoderasi komentar.
            </p>
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input
                type="password"
                className="form-input-text"
                placeholder="Masukkan kode sandi admin..."
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                autoFocus
                required
              />
              {errorMsg && (
                <div style={{ fontSize: 12, color: '#e0245e' }}>{errorMsg}</div>
              )}
              <button 
                type="submit" 
                className="submit-comment-btn"
                style={{ height: 42, fontSize: 14, marginTop: 8 }}
              >
                Buka Panel Pengelola
              </button>
            </form>
          </div>
        ) : (
          /* Authenticated Admin Views */
          <div>
            {/* Dashboard Tabs */}
            <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid var(--border-subtle)', marginBottom: 28, overflowX: 'auto', paddingBottom: 2 }}>
              <button
                className={`admin-tab-btn ${activeTab === 'PROJECTS' ? 'active' : ''}`}
                onClick={() => setActiveTab('PROJECTS')}
              >
                Karya & Proyek Game ({projects.length})
              </button>
              <button
                className={`admin-tab-btn ${activeTab === 'CLASSES' ? 'active' : ''}`}
                onClick={() => setActiveTab('CLASSES')}
              >
                Kelola Kelas ({classes.length})
              </button>
              <button
                className={`admin-tab-btn ${activeTab === 'COMMENTS' ? 'active' : ''}`}
                onClick={() => setActiveTab('COMMENTS')}
              >
                Moderasi Komentar & Balasan
              </button>
              <button
                className={`admin-tab-btn ${activeTab === 'IMPORT' ? 'active' : ''}`}
                onClick={() => setActiveTab('IMPORT')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <FileSpreadsheet size={15} />
                <span>Impor Spreadsheet & Drive</span>
              </button>
              <button
                className={`admin-tab-btn ${activeTab === 'KEYS' ? 'active' : ''}`}
                onClick={() => setActiveTab('KEYS')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <Key size={15} />
                <span>Kunci Akses Siswa ({accessKeys.filter(k => !k.isUsed).length})</span>
              </button>
              <button
                className={`admin-tab-btn ${activeTab === 'SETTINGS' ? 'active' : ''}`}
                onClick={() => setActiveTab('SETTINGS')}
              >
                Pengaturan & Supabase
              </button>
            </div>

            {/* TAB 1: PROJECTS & LIKES */}
            {activeTab === 'PROJECTS' && (
              <div>
                {/* Search & Actions Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <select
                      className="form-input-text"
                      style={{ height: 38, padding: '0 10px', fontSize: 13 }}
                      value={selectedClassFilter}
                      onChange={(e) => setSelectedClassFilter(e.target.value)}
                    >
                      <option value="ALL">Semua Kelas ({projects.length} karya)</option>
                      {classes.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>

                    <input
                      type="text"
                      className="form-input-text"
                      style={{ height: 38, width: 220, fontSize: 13 }}
                      placeholder="Cari judul atau pembuat..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <button
                    className="submit-comment-btn"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 38 }}
                    onClick={startNewProject}
                  >
                    <Plus size={16} />
                    <span>Tambah Karya Baru</span>
                  </button>
                </div>

                {/* Project Add/Edit Form */}
                {editingProject && (
                  <form 
                    onSubmit={handleSaveProjectSubmit}
                    style={{
                      background: '#ffffff',
                      border: '1px solid var(--border-medium)',
                      borderRadius: 4,
                      padding: 24,
                      marginBottom: 32,
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 12 }}>
                      <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 20 }}>
                        {editingProject === 'NEW' ? 'Tambah Karya / Game AI Baru' : `Edit Karya: ${projectForm.title}`}
                      </h3>
                      <button 
                        type="button" 
                        onClick={() => setEditingProject(null)}
                        style={{ fontSize: 13, cursor: 'pointer', textDecoration: 'underline' }}
                      >
                        Batal
                      </button>
                    </div>

                    <div className="admin-form-grid">
                      <div>
                        <label className="field-label">Pilih Kelas</label>
                        <select
                          className="form-input-text"
                          style={{ width: '100%', marginTop: 4 }}
                          value={projectForm.classId}
                          onChange={(e) => setProjectForm({ ...projectForm, classId: e.target.value })}
                          required
                        >
                          {classes.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="field-label">Nomor Karya (misal: 01, 02)</label>
                        <input
                          type="text"
                          className="form-input-text"
                          style={{ width: '100%', marginTop: 4 }}
                          value={projectForm.pieceNumber}
                          onChange={(e) => setProjectForm({ ...projectForm, pieceNumber: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="admin-form-grid">
                      <div>
                        <label className="field-label">Judul Karya / Judul Game AI</label>
                        <input
                          type="text"
                          className="form-input-text"
                          style={{ width: '100%', marginTop: 4 }}
                          placeholder="Contoh: Tanpa Judul 01"
                          value={projectForm.title}
                          onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                          required
                        />
                      </div>

                      <div>
                        <label className="field-label">Pembuat / Kelompok Siswa</label>
                        <input
                          type="text"
                          className="form-input-text"
                          style={{ width: '100%', marginTop: 4 }}
                          placeholder="Contoh: Alya Putri, I Gede Aditya"
                          value={projectForm.creators}
                          onChange={(e) => setProjectForm({ ...projectForm, creators: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="admin-form-grid">
                      <div>
                        <label className="field-label">
                          URL Poster Karya (Dapat berupa link Google Drive)
                        </label>
                        <input
                          type="text"
                          className="form-input-text"
                          style={{ width: '100%', marginTop: 4 }}
                          placeholder="https://drive.google.com/file/d/... atau /artworks/poster1.jpg"
                          value={projectForm.posterUrl}
                          onChange={(e) => {
                            const val = e.target.value;
                            setProjectForm({ 
                              ...projectForm, 
                              posterUrl: convertGoogleDriveUrl(val) 
                            });
                          }}
                          required
                        />
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                          Link Google Drive otomatis dikonversi ke gambar langsung.
                        </div>
                      </div>

                      <div>
                        <label className="field-label">Tautan Game Eksternal (URL Game AI)</label>
                        <input
                          type="url"
                          className="form-input-text"
                          style={{ width: '100%', marginTop: 4 }}
                          placeholder="https://itch.io, link website game, atau Google Drive game"
                          value={projectForm.gameUrl}
                          onChange={(e) => setProjectForm({ ...projectForm, gameUrl: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="admin-form-grid">
                      <div>
                        <label className="field-label">Jumlah Suka (Likes Count)</label>
                        <input
                          type="number"
                          className="form-input-text"
                          style={{ width: '100%', marginTop: 4 }}
                          value={projectForm.likesCount}
                          onChange={(e) => setProjectForm({ ...projectForm, likesCount: parseInt(e.target.value, 10) || 0 })}
                        />
                      </div>

                      <div>
                        <label className="field-label">Format File</label>
                        <input
                          type="text"
                          className="form-input-text"
                          style={{ width: '100%', marginTop: 4 }}
                          value={projectForm.format}
                          onChange={(e) => setProjectForm({ ...projectForm, format: e.target.value })}
                        />
                      </div>
                    </div>

                    <div style={{ marginBottom: 20 }}>
                      <label className="field-label">Deskripsi / Konteks Pembuatan Game AI</label>
                      <textarea
                        className="form-input-text"
                        style={{ width: '100%', height: 70, marginTop: 4, padding: 10 }}
                        value={projectForm.description}
                        onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                      />
                    </div>

                    <button type="submit" className="submit-comment-btn" style={{ padding: '10px 28px', fontSize: 14 }}>
                      Simpan Karya
                    </button>
                  </form>
                )}

                {/* Projects List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {filteredProjects.map((p) => {
                    const cls = classes.find(c => c.id === p.classId);
                    const isEditingThisLike = editingLikesId === p.id;

                    return (
                      <div key={p.id} className="admin-item-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                          <img 
                            src={p.posterUrl} 
                            alt={p.title}
                            style={{ 
                              width: 52, 
                              height: 70, 
                              objectFit: 'cover', 
                              borderRadius: 2, 
                              border: '1px solid var(--border-subtle)',
                              backgroundColor: '#eee' 
                            }}
                          />
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 16 }}>
                              {p.pieceNumber}. {p.title}
                            </div>
                            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
                              Kelas: <strong>{cls?.name || p.classId}</strong> &middot; Oleh: {p.creators}
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                              {p.gameUrl ? (
                                <a 
                                  href={p.gameUrl} 
                                  target="_blank" 
                                  rel="noreferrer" 
                                  style={{ color: '#059669', textDecoration: 'underline' }}
                                >
                                  Tautan Game Aktif &rarr;
                                </a>
                              ) : (
                                <span>Belum ada tautan game</span>
                              )}
                              &nbsp;&middot;&nbsp;{(p.comments || []).length} Komentar
                            </div>
                          </div>
                        </div>

                        {/* Direct Likes Editor & Actions */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                          {/* Direct Likes Modifier */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg-subtle)', padding: '4px 10px', borderRadius: 2 }}>
                            <Heart size={14} color="#e0245e" fill="#e0245e" />
                            {isEditingThisLike ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <input
                                  type="number"
                                  value={likesInputVal}
                                  onChange={(e) => setLikesInputVal(e.target.value)}
                                  style={{ width: 60, height: 26, fontSize: 12, padding: '0 4px', border: '1px solid var(--border-medium)' }}
                                  autoFocus
                                />
                                <button
                                  onClick={() => handleSaveDirectLikes(p.id)}
                                  style={{ padding: '2px 6px', background: 'var(--text-primary)', color: '#fff', fontSize: 11, borderRadius: 2 }}
                                >
                                  OK
                                </button>
                                <button
                                  onClick={() => setEditingLikesId(null)}
                                  style={{ fontSize: 11, textDecoration: 'underline' }}
                                >
                                  X
                                </button>
                              </div>
                            ) : (
                              <div 
                                style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}
                                onClick={() => {
                                  setEditingLikesId(p.id);
                                  setLikesInputVal(p.likesCount || 0);
                                }}
                                title="Klik untuk mengubah jumlah suka secara manual"
                              >
                                <span style={{ fontSize: 13, fontWeight: 600 }}>{p.likesCount || 0}</span>
                                <span style={{ fontSize: 11, color: 'var(--text-muted)', textDecoration: 'underline' }}>Ubah</span>
                              </div>
                            )}
                          </div>

                          <button
                            style={{ padding: 8, border: '1px solid var(--border-medium)', borderRadius: 2 }}
                            onClick={() => startEditProject(p)}
                            title="Edit Karya & Detail"
                          >
                            <Edit3 size={15} />
                          </button>

                          <button
                            style={{ padding: 8, border: '1px solid var(--border-medium)', borderRadius: 2, color: '#e0245e' }}
                            onClick={() => {
                              if (confirm(`Hapus karya "${p.title}"?`)) {
                                onDeleteProject(p.id);
                              }
                            }}
                            title="Hapus Karya"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: CLASSES (ADD, EDIT, REMOVE) */}
            {activeTab === 'CLASSES' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <div>
                    <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 20 }}>Daftar Kelas Pameran</h2>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                      Tambah kelas baru atau hapus kelas yang sudah tidak digunakan.
                    </p>
                  </div>

                  <button
                    className="submit-comment-btn"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                    onClick={startNewClass}
                  >
                    <Plus size={16} />
                    <span>Tambah Kelas Baru</span>
                  </button>
                </div>

                {editingClass && (
                  <form 
                    onSubmit={handleSaveClassSubmit}
                    style={{
                      background: '#ffffff',
                      border: '1px solid var(--border-medium)',
                      borderRadius: 4,
                      padding: 24,
                      marginBottom: 28,
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                      <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 18 }}>
                        {editingClass === 'NEW' ? 'Tambah Kelas Baru' : `Edit Kelas: ${classForm.name}`}
                      </h3>
                      <button 
                        type="button" 
                        onClick={() => setEditingClass(null)}
                        style={{ fontSize: 12, cursor: 'pointer', textDecoration: 'underline' }}
                      >
                        Batal
                      </button>
                    </div>

                    <div className="admin-form-grid">
                      <div>
                        <label className="field-label">ID Unik Kelas (misal: xi-ipa-4)</label>
                        <input
                          type="text"
                          className="form-input-text"
                          style={{ width: '100%', marginTop: 4 }}
                          value={classForm.id}
                          onChange={(e) => setClassForm({ ...classForm, id: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '-') })}
                          disabled={editingClass !== 'NEW'}
                          required
                        />
                      </div>
                      <div>
                        <label className="field-label">Nama Tampilan Kelas (misal: XI - IPA - 4)</label>
                        <input
                          type="text"
                          className="form-input-text"
                          style={{ width: '100%', marginTop: 4 }}
                          value={classForm.name}
                          onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div style={{ marginBottom: 16 }}>
                      <label className="field-label">Deskripsi Singkat / Fokus Studi</label>
                      <input
                        type="text"
                        className="form-input-text"
                        style={{ width: '100%', marginTop: 4 }}
                        value={classForm.description}
                        onChange={(e) => setClassForm({ ...classForm, description: e.target.value })}
                      />
                    </div>

                    <button type="submit" className="submit-comment-btn" style={{ padding: '8px 24px' }}>
                      Simpan Kelas
                    </button>
                  </form>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {classes.map((cls) => {
                    const count = projects.filter(p => p.classId === cls.id).length;
                    return (
                      <div key={cls.id} className="admin-item-card">
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 17 }}>{cls.name}</div>
                          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
                            ID: <code>{cls.id}</code> &middot; <strong>{count} karya</strong> terdaftar
                          </div>
                          {cls.description && (
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                              {cls.description}
                            </div>
                          )}
                        </div>

                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            style={{ padding: 8, border: '1px solid var(--border-medium)', borderRadius: 2 }}
                            onClick={() => startEditClass(cls)}
                            title="Edit Kelas"
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            style={{ padding: 8, border: '1px solid var(--border-medium)', borderRadius: 2, color: '#e0245e' }}
                            onClick={() => handleDeleteClassConfirmed(cls)}
                            title="Hapus Kelas"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: COMMENTS MODERATION & EDITING */}
            {activeTab === 'COMMENTS' && (
              <div>
                <div style={{ marginBottom: 20 }}>
                  <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 20 }}>Moderasi & Pengeditan Komentar</h2>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    Ubah teks komentar, nama pengirim, berikan tanda resmi <strong>Pembuat</strong>, atau hapus komentar yang tidak sesuai.
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {projects.flatMap(p => 
                    (p.comments || []).map(c => ({ ...c, projectId: p.id, projectTitle: p.title }))
                  ).length === 0 ? (
                    <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)', background: '#fff', borderRadius: 4 }}>
                      Belum ada komentar pengunjung.
                    </div>
                  ) : (
                    projects.flatMap(p => 
                      (p.comments || []).map(c => ({ ...c, projectId: p.id, projectTitle: p.title }))
                    ).map(c => {
                      const isEditing = editingCommentId === c.id;

                      return (
                        <div key={c.id} className="admin-item-card" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ flex: 1, paddingRight: 16 }}>
                              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                                Karya: <strong>{c.projectTitle}</strong>
                              </div>

                              {isEditing ? (
                                <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
                                  <input
                                    type="text"
                                    className="form-input-text"
                                    style={{ height: 34 }}
                                    value={commentEditForm.authorName}
                                    onChange={(e) => setCommentEditForm({ ...commentEditForm, authorName: e.target.value })}
                                    placeholder="Nama Pengirim"
                                  />
                                  <textarea
                                    className="form-input-text"
                                    style={{ height: 60, padding: 8 }}
                                    value={commentEditForm.content}
                                    onChange={(e) => setCommentEditForm({ ...commentEditForm, content: e.target.value })}
                                    placeholder="Isi Komentar"
                                  />
                                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                                    <input
                                      type="checkbox"
                                      checked={commentEditForm.isCreator}
                                      onChange={(e) => setCommentEditForm({ ...commentEditForm, isCreator: e.target.checked })}
                                    />
                                    <span>Tandai sebagai Tanggapan Pembuat (Lencana Resmi)</span>
                                  </label>

                                  <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                                    <button
                                      className="submit-comment-btn"
                                      onClick={() => handleSaveEditedComment(c.projectId, c.id)}
                                    >
                                      Simpan Perubahan
                                    </button>
                                    <button
                                      type="button"
                                      style={{ fontSize: 12, textDecoration: 'underline' }}
                                      onClick={() => setEditingCommentId(null)}
                                    >
                                      Batal
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <div style={{ fontWeight: 600, fontSize: 15, marginTop: 2 }}>
                                    {c.authorName} {c.isCreator && <span className="creator-badge" style={{ marginLeft: 6 }}>Pembuat</span>}
                                    &middot; <span style={{ fontWeight: 400, color: 'var(--text-secondary)', fontSize: 12 }}>{c.createdAt}</span>
                                  </div>
                                  <div style={{ fontSize: 14, marginTop: 4, color: 'var(--text-primary)', lineHeight: 1.5 }}>
                                    {c.content}
                                  </div>
                                </>
                              )}
                            </div>

                            <div style={{ display: 'flex', gap: 6 }}>
                              {!isEditing && (
                                <button
                                  style={{ padding: 6, border: '1px solid var(--border-medium)', borderRadius: 2 }}
                                  onClick={() => startEditComment(c)}
                                  title="Edit Isi Komentar"
                                >
                                  <Edit3 size={15} />
                                </button>
                              )}
                              <button
                                style={{ padding: 6, border: '1px solid var(--border-medium)', borderRadius: 2, color: '#e0245e' }}
                                onClick={() => onDeleteComment(c.projectId, c.id)}
                                title="Hapus Komentar"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </div>

                          {/* Existing Replies */}
                          {c.replies && c.replies.length > 0 && (
                            <div style={{ marginTop: 12, paddingLeft: 14, borderLeft: '2px solid var(--border-medium)' }}>
                              {c.replies.map(r => (
                                <div key={r.id} style={{ fontSize: 13, marginBottom: 6 }}>
                                  <strong>{r.authorName} {r.isCreator && '(Pembuat)'}:</strong> {r.content}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Reply Box */}
                          {replyTarget === c.id ? (
                            <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                              <input
                                type="text"
                                className="form-input-text"
                                style={{ flex: 1, height: 36 }}
                                placeholder="Tulis balasan resmi pembuat..."
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                              />
                              <button
                                className="submit-comment-btn"
                                onClick={() => handleSendCreatorReply(c.projectId, c.id)}
                              >
                                Balas
                              </button>
                              <button
                                type="button"
                                style={{ fontSize: 12, textDecoration: 'underline' }}
                                onClick={() => setReplyingTarget(null)}
                              >
                                Batal
                              </button>
                            </div>
                          ) : (
                            <div style={{ marginTop: 8 }}>
                              <button
                                style={{ fontSize: 12, color: 'var(--text-secondary)', textDecoration: 'underline' }}
                                onClick={() => {
                                  setReplyingTarget(c.id);
                                  setReplyText('');
                                }}
                              >
                                + Balas sebagai Pembuat Karya
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: SPREADSHEET & GOOGLE DRIVE BATCH IMPORT */}
            {activeTab === 'IMPORT' && (
              <div>
                <div style={{ background: '#ffffff', border: '1px solid var(--border-subtle)', borderRadius: 4, padding: 24, marginBottom: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <FileSpreadsheet size={22} color="#059669" />
                    <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 600 }}>
                      Impor Cepat dari Spreadsheet & Link Google Drive
                    </h2>
                  </div>

                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 16 }}>
                    Ketika Anda menerima spreadsheet berisi link Google Drive untuk poster dan link game, Anda cukup menyalin (copy) baris spreadsheet tersebut lalu menempelkannya (paste) ke kotak di bawah ini.
                  </p>

                  <div style={{ background: 'var(--bg-subtle)', padding: 14, borderRadius: 2, fontSize: 13, marginBottom: 16 }}>
                    <div style={{ fontWeight: 600, marginBottom: 6 }}>Format Kolom yang Didukung (Urutan Standar):</div>
                    <code style={{ color: 'var(--text-primary)' }}>
                      Kelas &nbsp;|&nbsp; Judul Karya &nbsp;|&nbsp; Nama Pembuat &nbsp;|&nbsp; Link Google Drive Poster &nbsp;|&nbsp; Link Game &nbsp;|&nbsp; Deskripsi
                    </code>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
                      * Link Google Drive (misal: <code>https://drive.google.com/file/d/1a2b3c.../view?usp=sharing</code>) akan otomatis dikonversi menjadi URL gambar web langsung.
                    </div>
                  </div>

                  <textarea
                    className="form-input-text"
                    style={{ width: '100%', height: 140, padding: 12, fontFamily: 'monospace', fontSize: 12, lineHeight: 1.5 }}
                    placeholder="Tempelkan baris dari Google Sheets / Excel di sini..."
                    value={rawSpreadsheetText}
                    onChange={(e) => setRawSpreadsheetText(e.target.value)}
                  />

                  <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                    <button
                      className="submit-comment-btn"
                      onClick={handleParseSpreadsheet}
                      disabled={!rawSpreadsheetText.trim()}
                    >
                      Periksa & Pratinjau Baris
                    </button>
                  </div>
                </div>

                {/* Parsed Rows Preview */}
                {parsedImportRows.length > 0 && (
                  <div style={{ background: '#ffffff', border: '1px solid var(--border-subtle)', borderRadius: 4, padding: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <h3 style={{ fontSize: 16, fontWeight: 600 }}>
                        Pratinjau {parsedImportRows.length} Karya Siap Diimpor
                      </h3>

                      <button
                        className="submit-comment-btn"
                        onClick={handleExecuteBatchImport}
                        disabled={importStatus === 'IMPORTING'}
                        style={{ background: '#059669' }}
                      >
                        {importStatus === 'IMPORTING' ? 'Mengimpor...' : `Impor ${parsedImportRows.length} Karya Sekaligus`}
                      </button>
                    </div>

                    {importStatus === 'SUCCESS' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#e6f4ea', color: '#137333', padding: '10px 14px', borderRadius: 2, marginBottom: 16, fontSize: 13 }}>
                        <CheckCircle size={16} />
                        <span>Seluruh karya dan kelas dari spreadsheet berhasil diimpor ke dalam galeri!</span>
                      </div>
                    )}

                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid var(--border-medium)', textAlign: 'left', background: 'var(--bg-subtle)' }}>
                            <th style={{ padding: '8px 12px' }}>Poster</th>
                            <th style={{ padding: '8px 12px' }}>Kelas</th>
                            <th style={{ padding: '8px 12px' }}>Judul</th>
                            <th style={{ padding: '8px 12px' }}>Pembuat</th>
                            <th style={{ padding: '8px 12px' }}>Tautan Game</th>
                          </tr>
                        </thead>
                        <tbody>
                          {parsedImportRows.map((row, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                              <td style={{ padding: '8px 12px' }}>
                                <img 
                                  src={row.posterUrl} 
                                  alt=""
                                  style={{ width: 36, height: 48, objectFit: 'cover', borderRadius: 2, background: '#eee' }}
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                              </td>
                              <td style={{ padding: '8px 12px', fontWeight: 600 }}>{row.className}</td>
                              <td style={{ padding: '8px 12px' }}>{row.title}</td>
                              <td style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>{row.creators}</td>
                              <td style={{ padding: '8px 12px', fontSize: 11, color: '#059669' }}>{row.gameUrl || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 5: ACCESS KEYS FOR STUDENTS */}
            {activeTab === 'KEYS' && (
              <div>
                <div style={{ background: '#ffffff', border: '1px solid var(--border-subtle)', borderRadius: 4, padding: 24, marginBottom: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 16 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <Key size={20} color="var(--accent-terracotta)" />
                        <h3 style={{ fontSize: 18, fontWeight: 600 }}>Generator Kunci Akses Siswa (Single-Use Keys)</h3>
                      </div>
                      <p style={{ fontSize: 13, color: 'var(--text-secondary)', maxWidth: 640, lineHeight: 1.5, margin: 0 }}>
                        Setiap kunci terdiri dari <strong>6 digit angka acak</strong> dan hanya berlaku untuk <strong>satu kali penggunaan</strong>. Berikan kunci ini kepada siswa yang perlu mengunggah atau mengedit karya kelompok mereka di portal siswa saat acara pameran live.
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      <button
                        className="submit-comment-btn"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 38 }}
                        disabled={isGeneratingKeys}
                        onClick={async () => {
                          setIsGeneratingKeys(true);
                          try {
                            const updated = await generateAccessKeys(10);
                            setAccessKeys(updated);
                          } catch (err) {
                            alert('Gagal membuat kunci: ' + err.message);
                          } finally {
                            setIsGeneratingKeys(false);
                          }
                        }}
                      >
                        <RefreshCw size={15} className={isGeneratingKeys ? 'spin' : ''} />
                        <span>{isGeneratingKeys ? 'Membuat...' : 'Buat 10 Kunci Baru'}</span>
                      </button>

                      <button
                        className="admin-badge-btn"
                        style={{ height: 38, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                        onClick={() => {
                          const active = accessKeys.filter(k => !k.isUsed).map(k => k.key);
                          if (active.length === 0) {
                            alert('Tidak ada kunci aktif untuk disalin.');
                            return;
                          }
                          navigator.clipboard.writeText(active.join('\n'));
                          setCopiedAllKeys(true);
                          setTimeout(() => setCopiedAllKeys(false), 2500);
                        }}
                      >
                        <Copy size={15} />
                        <span>{copiedAllKeys ? 'Tersalin!' : 'Salin Semua Kunci Aktif'}</span>
                      </button>

                      {accessKeys.some(k => k.isUsed) && (
                        <button
                          className="admin-badge-btn"
                          style={{ height: 38, color: '#dc3545', borderColor: '#dc3545' }}
                          onClick={async () => {
                            if (confirm('Hapus seluruh riwayat kunci yang sudah terpakai?')) {
                              const updated = await clearUsedAccessKeys();
                              setAccessKeys(updated);
                            }
                          }}
                        >
                          <Trash2 size={15} />
                          <span>Bersihkan Kunci Terpakai</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Stats Counter */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginTop: 20 }}>
                    <div style={{ background: 'var(--bg-subtle)', padding: '12px 16px', borderRadius: 4, border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: 11, textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Kunci Dibuat</div>
                      <div style={{ fontSize: 24, fontWeight: 600, marginTop: 4 }}>{accessKeys.length}</div>
                    </div>
                    <div style={{ background: 'rgba(40, 167, 69, 0.08)', padding: '12px 16px', borderRadius: 4, border: '1px solid rgba(40, 167, 69, 0.2)' }}>
                      <div style={{ fontSize: 11, textTransform: 'uppercase', color: '#28a745', fontWeight: 600 }}>Kunci Aktif (Siap Pakai)</div>
                      <div style={{ fontSize: 24, fontWeight: 600, color: '#28a745', marginTop: 4 }}>
                        {accessKeys.filter(k => !k.isUsed).length}
                      </div>
                    </div>
                    <div style={{ background: 'var(--bg-subtle)', padding: '12px 16px', borderRadius: 4, border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: 11, textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600 }}>Kunci Sudah Digunakan</div>
                      <div style={{ fontSize: 24, fontWeight: 600, color: 'var(--text-secondary)', marginTop: 4 }}>
                        {accessKeys.filter(k => k.isUsed).length}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Active Keys List */}
                <div style={{ marginBottom: 28 }}>
                  <h4 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>Kunci Aktif (Belum Digunakan)</span>
                    <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-secondary)' }}>
                      — Berikan satu kode kepada perwakilan kelompok siswa
                    </span>
                  </h4>

                  {accessKeys.filter(k => !k.isUsed).length === 0 ? (
                    <div style={{ background: '#fff', border: '1px dashed var(--border-medium)', borderRadius: 4, padding: 32, textAlign: 'center' }}>
                      <div style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 12 }}>
                        Belum ada kunci akses aktif.
                      </div>
                      <button
                        className="submit-comment-btn"
                        onClick={async () => {
                          setIsGeneratingKeys(true);
                          const updated = await generateAccessKeys(10);
                          setAccessKeys(updated);
                          setIsGeneratingKeys(false);
                        }}
                      >
                        Buat 10 Kunci Akses Baru Sekarang
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
                      {accessKeys.filter(k => !k.isUsed).map((k) => (
                        <div
                          key={k.key}
                          style={{
                            background: '#ffffff',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: 4,
                            padding: '14px 16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            boxShadow: 'var(--shadow-sm)'
                          }}
                        >
                          <div>
                            <div style={{ fontFamily: 'monospace', fontSize: 22, fontWeight: 700, letterSpacing: 2, color: 'var(--text-primary)' }}>
                              {k.key}
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                              Dibuat: {k.createdAt || 'Hari ini'}
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: 6 }}>
                            <button
                              type="button"
                              className="admin-badge-btn"
                              style={{ padding: '6px 10px', fontSize: 12 }}
                              title="Salin Kunci"
                              onClick={() => {
                                navigator.clipboard.writeText(k.key);
                                setCopiedKey(k.key);
                                setTimeout(() => setCopiedKey(null), 2000);
                              }}
                            >
                              <Copy size={13} />
                              <span>{copiedKey === k.key ? 'Tersalin' : 'Salin'}</span>
                            </button>

                            <button
                              type="button"
                              className="admin-badge-btn"
                              style={{ padding: '6px 8px', color: '#dc3545', borderColor: '#f5c6cb' }}
                              title="Hapus Kunci"
                              onClick={async () => {
                                const updated = await deleteAccessKey(k.key);
                                setAccessKeys(updated);
                              }}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Used Keys History */}
                {accessKeys.some(k => k.isUsed) && (
                  <div style={{ background: '#ffffff', border: '1px solid var(--border-subtle)', borderRadius: 4, padding: 20 }}>
                    <h4 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>
                      Riwayat Kunci yang Sudah Digunakan (Hangus)
                    </h4>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid var(--border-medium)', textAlign: 'left', background: 'var(--bg-subtle)' }}>
                            <th style={{ padding: '8px 12px' }}>Kode Kunci</th>
                            <th style={{ padding: '8px 12px' }}>Status</th>
                            <th style={{ padding: '8px 12px' }}>Digunakan Pada</th>
                            <th style={{ padding: '8px 12px' }}>Keterangan Penggunaan</th>
                            <th style={{ padding: '8px 12px', textAlign: 'right' }}>Aksi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {accessKeys.filter(k => k.isUsed).map((k) => (
                            <tr key={k.key} style={{ borderBottom: '1px solid var(--border-subtle)', opacity: 0.8 }}>
                              <td style={{ padding: '8px 12px', fontFamily: 'monospace', fontWeight: 600, textDecoration: 'line-through' }}>
                                {k.key}
                              </td>
                              <td style={{ padding: '8px 12px' }}>
                                <span style={{ background: '#eee', padding: '2px 8px', borderRadius: 2, fontSize: 11, fontWeight: 500 }}>
                                  Sudah Terpakai
                                </span>
                              </td>
                              <td style={{ padding: '8px 12px', color: 'var(--text-secondary)', fontSize: 12 }}>
                                {k.usedAt || '-'}
                              </td>
                              <td style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>
                                {k.usedFor || '-'}
                              </td>
                              <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                                <button
                                  type="button"
                                  className="admin-badge-btn"
                                  style={{ padding: '4px 8px', color: '#dc3545' }}
                                  onClick={async () => {
                                    const updated = await deleteAccessKey(k.key);
                                    setAccessKeys(updated);
                                  }}
                                >
                                  <Trash2 size={12} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 6: SETTINGS & SUPABASE / VERCEL */}
            {activeTab === 'SETTINGS' && (
              <div>
                <div style={{ background: '#ffffff', border: '1px solid var(--border-subtle)', borderRadius: 4, padding: 24, marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Database size={20} />
                      <h3 style={{ fontSize: 17, fontWeight: 600 }}>Status Koneksi Database</h3>
                    </div>
                    <span className={`status-indicator ${isSupabaseConfigured ? 'status-online' : 'status-offline'}`}>
                      {isSupabaseConfigured ? '● Supabase Terhubung' : '● Mode Lokal (LocalStorage & Broadcast)'}
                    </span>
                  </div>

                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 16 }}>
                    {isSupabaseConfigured ? (
                      'Aplikasi terhubung langsung ke database cloud PostgreSQL Supabase dengan fitur Realtime aktif. Setiap komentar baru atau like disinkronkan secara instan ke semua pengunjung.'
                    ) : (
                      'Aplikasi saat ini berjalan dalam mode mandiri. Untuk menghubungkan ke Supabase di Vercel, cukup tambahkan variabel lingkungan berikut:'
                    )}
                  </p>

                  <div style={{ background: 'var(--bg-subtle)', padding: 14, borderRadius: 2, fontFamily: 'monospace', fontSize: 12 }}>
                    <div>VITE_SUPABASE_URL=https://proyek-anda.supabase.co</div>
                    <div>VITE_SUPABASE_ANON_KEY=eyJh...anon-key-anda</div>
                    <div>VITE_ADMIN_PASSCODE=••••••••</div>
                  </div>

                  <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
                    <a
                      href="https://supabase.com/dashboard"
                      target="_blank"
                      rel="noreferrer"
                      className="admin-badge-btn"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                    >
                      <span>Buka Supabase Dashboard</span>
                      <ExternalLink size={13} />
                    </a>
                  </div>
                </div>

                {/* Clear Database & Demo Data */}
                <div style={{ background: '#ffffff', border: '1px solid var(--border-subtle)', borderRadius: 4, padding: 24, marginBottom: 20 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: '#dc3545' }}>
                    Bersihkan Seluruh Karya &amp; Data Demo
                  </h3>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.5 }}>
                    Menghapus seluruh karya mock/demo dan komentar agar database Supabase kosong dan bersih, siap untuk karya siswa yang sesungguhnya. Daftar kelas Anda tetap aman dan tidak terhapus.
                  </p>
                  <button
                    className="admin-badge-btn"
                    style={{ color: '#dc3545', borderColor: '#dc3545', fontWeight: 600 }}
                    onClick={async () => {
                      if (confirm('PERINGATAN: Apakah Anda yakin ingin mengosongkan seluruh karya & komentar dari database? Tindakan ini tidak dapat dibatalkan.')) {
                        await clearAllDatabaseAndDemoData();
                        alert('Database telah dikosongkan.');
                        window.location.reload();
                      }
                    }}
                  >
                    <Trash2 size={14} />
                    <span>Kosongkan Seluruh Karya &amp; Komentar</span>
                  </button>
                </div>

                {/* Reset Demo Data (Optional) */}
                <div style={{ background: '#ffffff', border: '1px solid var(--border-subtle)', borderRadius: 4, padding: 24 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
                    Kembalikan ke Contoh Data Demo Awal
                  </h3>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
                    Isi kembali galeri dengan 3 karya contoh pameran Desa Adat Penglipuran untuk keperluan uji coba tampilan.
                  </p>
                  <button
                    className="admin-badge-btn"
                    onClick={() => {
                      if (confirm('Apakah Anda yakin ingin memuat kembali data contoh demo awal?')) {
                        resetToDemoData();
                        window.location.reload();
                      }
                    }}
                  >
                    <RefreshCw size={14} />
                    <span>Reset ke Data Awal Demo</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
