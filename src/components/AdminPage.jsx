import React, { useState, useEffect } from 'react';

// Google Material Symbols Icon Components
const Plus = ({ size = 18, className = '', style = {} }) => (
  <span className={`material-symbols-outlined ${className}`} style={{ fontSize: size, verticalAlign: 'middle', lineHeight: 1, ...style }}>add</span>
);
const Trash2 = ({ size = 18, className = '', style = {} }) => (
  <span className={`material-symbols-outlined ${className}`} style={{ fontSize: size, verticalAlign: 'middle', lineHeight: 1, ...style }}>delete</span>
);
const Edit3 = ({ size = 18, className = '', style = {} }) => (
  <span className={`material-symbols-outlined ${className}`} style={{ fontSize: size, verticalAlign: 'middle', lineHeight: 1, ...style }}>edit</span>
);
const Check = ({ size = 18, className = '', style = {} }) => (
  <span className={`material-symbols-outlined ${className}`} style={{ fontSize: size, verticalAlign: 'middle', lineHeight: 1, ...style }}>check</span>
);
const ShieldCheck = ({ size = 18, className = '', style = {} }) => (
  <span className={`material-symbols-outlined ${className}`} style={{ fontSize: size, verticalAlign: 'middle', lineHeight: 1, ...style }}>verified</span>
);
const Database = ({ size = 18, className = '', style = {} }) => (
  <span className={`material-symbols-outlined ${className}`} style={{ fontSize: size, verticalAlign: 'middle', lineHeight: 1, ...style }}>database</span>
);
const MessageSquare = ({ size = 18, className = '', style = {} }) => (
  <span className={`material-symbols-outlined ${className}`} style={{ fontSize: size, verticalAlign: 'middle', lineHeight: 1, ...style }}>chat_bubble</span>
);
const Layers = ({ size = 18, className = '', style = {} }) => (
  <span className={`material-symbols-outlined ${className}`} style={{ fontSize: size, verticalAlign: 'middle', lineHeight: 1, ...style }}>layers</span>
);
const ExternalLink = ({ size = 18, className = '', style = {} }) => (
  <span className={`material-symbols-outlined ${className}`} style={{ fontSize: size, verticalAlign: 'middle', lineHeight: 1, ...style }}>open_in_new</span>
);
const RefreshCw = ({ size = 18, className = '', style = {} }) => (
  <span className={`material-symbols-outlined ${className}`} style={{ fontSize: size, verticalAlign: 'middle', lineHeight: 1, ...style }}>refresh</span>
);
const Copy = ({ size = 18, className = '', style = {} }) => (
  <span className={`material-symbols-outlined ${className}`} style={{ fontSize: size, verticalAlign: 'middle', lineHeight: 1, ...style }}>content_copy</span>
);
const Lock = ({ size = 18, className = '', style = {} }) => (
  <span className={`material-symbols-outlined ${className}`} style={{ fontSize: size, verticalAlign: 'middle', lineHeight: 1, ...style }}>lock</span>
);
const ArrowLeft = ({ size = 18, className = '', style = {} }) => (
  <span className={`material-symbols-outlined ${className}`} style={{ fontSize: size, verticalAlign: 'middle', lineHeight: 1, ...style }}>arrow_back</span>
);
const Heart = ({ size = 18, className = '', style = {}, fill = 'none', color = 'currentColor' }) => (
  <span className={`material-symbols-outlined ${className}`} style={{ fontSize: size, verticalAlign: 'middle', lineHeight: 1, fontVariationSettings: fill !== 'none' ? "'FILL' 1" : "'FILL' 0", color, ...style }}>favorite</span>
);
const FileSpreadsheet = ({ size = 18, className = '', style = {} }) => (
  <span className={`material-symbols-outlined ${className}`} style={{ fontSize: size, verticalAlign: 'middle', lineHeight: 1, ...style }}>table_chart</span>
);
const Upload = ({ size = 18, className = '', style = {} }) => (
  <span className={`material-symbols-outlined ${className}`} style={{ fontSize: size, verticalAlign: 'middle', lineHeight: 1, ...style }}>upload</span>
);
const Eye = ({ size = 18, className = '', style = {} }) => (
  <span className={`material-symbols-outlined ${className}`} style={{ fontSize: size, verticalAlign: 'middle', lineHeight: 1, ...style }}>visibility</span>
);
const CheckCircle = ({ size = 18, className = '', style = {} }) => (
  <span className={`material-symbols-outlined ${className}`} style={{ fontSize: size, verticalAlign: 'middle', lineHeight: 1, ...style }}>check_circle</span>
);
const AlertCircle = ({ size = 18, className = '', style = {} }) => (
  <span className={`material-symbols-outlined ${className}`} style={{ fontSize: size, verticalAlign: 'middle', lineHeight: 1, ...style }}>error</span>
);
const Key = ({ size = 18, className = '', style = {} }) => (
  <span className={`material-symbols-outlined ${className}`} style={{ fontSize: size, verticalAlign: 'middle', lineHeight: 1, ...style }}>key</span>
);
const Users = ({ size = 18, className = '', style = {} }) => (
  <span className={`material-symbols-outlined ${className}`} style={{ fontSize: size, verticalAlign: 'middle', lineHeight: 1, ...style }}>groups</span>
);
const Share2 = ({ size = 18, className = '', style = {} }) => (
  <span className={`material-symbols-outlined ${className}`} style={{ fontSize: size, verticalAlign: 'middle', lineHeight: 1, ...style }}>share</span>
);
const List = ({ size = 18, className = '', style = {} }) => (
  <span className={`material-symbols-outlined ${className}`} style={{ fontSize: size, verticalAlign: 'middle', lineHeight: 1, ...style }}>format_list_bulleted</span>
);
import { 
  isSupabaseConfigured, 
  resetToDemoData, 
  convertGoogleDriveUrl,
  setProjectLikesDirectly,
  updateCommentInProject,
  batchImportProjects,
  fetchAccessKeys,
  generateAccessKeys,
  createGroupToken,
  bulkCreateGroupTokens,
  generateTokensForAllClasses,
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
    return sessionStorage.getItem('gemar_admin_auth') === 'true' || sessionStorage.getItem('gema_admin_auth') === 'true';
  });
  const [errorMsg, setErrorMsg] = useState('');

  const [activeTab, setActiveTab] = useState('PROJECTS'); // 'PROJECTS', 'CLASSES', 'COMMENTS', 'IMPORT', 'KEYS', 'SETTINGS'
  const [selectedClassFilter, setSelectedClassFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Access Keys / Group Tokens State
  const [accessKeys, setAccessKeys] = useState([]);
  const [isGeneratingKeys, setIsGeneratingKeys] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);
  const [copiedBroadcast, setCopiedBroadcast] = useState(false);
  const [copiedList, setCopiedList] = useState(false);
  const [filterKeyClass, setFilterKeyClass] = useState('ALL');
  const [keySearchQuery, setKeySearchQuery] = useState('');

  // Token generator form inputs
  const [tokenGenTab, setTokenGenTab] = useState('ALL_CLASSES'); // 'ALL_CLASSES', 'SINGLE_GROUP', 'BULK_TEXT', 'STANDALONE'
  const [groupsPerClassCount, setGroupsPerClassCount] = useState(10);
  const [singleClassId, setSingleClassId] = useState('');
  const [singleGroupName, setSingleGroupName] = useState('');
  const [bulkClassId, setBulkClassId] = useState('');
  const [bulkGroupsText, setBulkGroupsText] = useState('');
  const [standaloneKeysCount, setStandaloneKeysCount] = useState(10);
  const [standaloneLabel, setStandaloneLabel] = useState('Kunci Standalone / Bebas (Susulan)');

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
    const isMatch = correctCode ? passcode === correctCode : (passcode === 'gemar2026' || passcode === 'gema2026');
    if (isMatch) {
      setIsAuthenticated(true);
      sessionStorage.setItem('gemar_admin_auth', 'true');
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
              Panel Pengelola &middot; Gemar Belajar
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
              Akses khusus untuk mengelola karya, kelas, tautan karya, like, dan memoderasi komentar.
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
                Daftar Karya ({projects.length})
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
                        {editingProject === 'NEW' ? 'Tambah Karya Baru' : `Edit Karya: ${projectForm.title}`}
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
                        <label className="field-label">Judul Karya</label>
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
                        <label className="field-label">Tautan Karya Eksternal (URL Karya)</label>
                        <input
                          type="url"
                          className="form-input-text"
                          style={{ width: '100%', marginTop: 4 }}
                          placeholder="https://... tautan website, proyek interaktif, atau Google Drive karya"
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
                      <label className="field-label">Deskripsi / Konteks Pembuatan Karya</label>
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
                            loading="lazy"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '/artworks/poster1.jpg';
                            }}
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
                                  Tautan Karya Aktif &rarr;
                                </a>
                              ) : (
                                <span>Belum ada tautan karya</span>
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
                                  <strong>{r.authorName} {r.isCreator && '(Pembuat)'}{r.replyToAuthorName ? ` (membalas @${r.replyToAuthorName})` : ''}:</strong> {r.content}
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
                    Ketika Anda menerima spreadsheet berisi link Google Drive untuk poster dan link karya, Anda cukup menyalin (copy) baris spreadsheet tersebut lalu menempelkannya (paste) ke kotak di bawah ini.
                  </p>

                  <div style={{ background: 'var(--bg-subtle)', padding: 14, borderRadius: 2, fontSize: 13, marginBottom: 16 }}>
                    <div style={{ fontWeight: 600, marginBottom: 6 }}>Format Kolom yang Didukung (Urutan Standar):</div>
                    <code style={{ color: 'var(--text-primary)' }}>
                      Kelas &nbsp;|&nbsp; Judul Karya &nbsp;|&nbsp; Nama Pembuat &nbsp;|&nbsp; Link Google Drive Poster &nbsp;|&nbsp; Link Karya &nbsp;|&nbsp; Deskripsi
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
                            <th style={{ padding: '8px 12px' }}>Tautan Karya</th>
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
                {/* Header & Quick Action Card */}
                <div style={{ background: '#ffffff', border: '1px solid var(--border-subtle)', borderRadius: 4, padding: 24, marginBottom: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <Key size={22} color="var(--accent-terracotta)" />
                        <h3 style={{ fontSize: 19, fontWeight: 600 }}>Generator &amp; Kurasi Kunci Akses Kelompok</h3>
                      </div>
                      <p style={{ fontSize: 13, color: 'var(--text-secondary)', maxWidth: 660, lineHeight: 1.55, margin: 0 }}>
                        Setiap kelompok siswa memiliki <strong>1 kunci akses 6-digit</strong> dan <strong>hanya 1 kesempatan</strong> untuk mengisi karya di portal siswa. Saat kunci dimasukkan di portal, siswa akan otomatis diarahkan ke kelompoknya masing-masing.
                      </p>
                    </div>

                    {/* Prominent Broadcast & List Copy Buttons */}
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      {/* Button 1: Copy Formatted for Public Group WhatsApp Announcement */}
                      <button
                        type="button"
                        className="submit-comment-btn"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, height: 40, padding: '0 16px', background: '#075e54' }}
                        title="Salin pesan berformat rapi untuk dibagikan di grup WhatsApp / Telegram"
                        onClick={() => {
                          const activeKeys = accessKeys.filter(k => !k.isUsed);
                          if (activeKeys.length === 0) {
                            alert('Tidak ada kunci aktif untuk dibuatkan pengumuman.');
                            return;
                          }

                          const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
                          const portalUrl = `${origin}/edit`;

                          let msg = `📢 *PENGUMUMAN KUNCI AKSES PENGUNGGAHAN KARYA PAMERAN GEMAR BELAJAR*\n`;
                          msg += `*SMAS Kristen Harapan • Penglipuran Exhibition*\n\n`;
                          msg += `Kepada seluruh perwakilan kelompok siswa, silakan buka portal berikut untuk mengunggah poster dan karya kelompok Anda:\n`;
                          msg += `🔗 ${portalUrl}\n\n`;
                          msg += `⚠️ *KETENTUAN PENTING:*\n`;
                          msg += `• Setiap kelompok memiliki 1 buah token 6-digit.\n`;
                          msg += `• Setiap token hanya berlaku *1 KALI* pengisian karya.\n`;
                          msg += `• Masukkan 6-digit token Anda untuk langsung masuk ke formulir kelompok.\n\n`;

                          // Group by class
                          const classMap = new Map();
                          classes.forEach(c => classMap.set(c.id, { name: c.name, items: [] }));
                          classMap.set('umum', { name: 'Umum / Lainnya', items: [] });

                          activeKeys.forEach(k => {
                            const cId = k.classId || 'umum';
                            if (!classMap.has(cId)) {
                              classMap.set(cId, { name: cId.toUpperCase(), items: [] });
                            }
                            classMap.get(cId).items.push(k);
                          });

                          classMap.forEach(val => {
                            if (val.items.length > 0) {
                              msg += `══════════════════════════════\n`;
                              msg += `📁 *KELAS: ${val.name}*\n`;
                              msg += `══════════════════════════════\n`;
                              val.items.forEach(k => {
                                msg += `• ${k.groupName || 'Kelompok'}: \`${k.key}\`\n`;
                              });
                              msg += `\n`;
                            }
                          });

                          msg += `_Apabila ada kendala kode atau revisi, harap segera hubungi guru pendamping atau admin pameran._`;

                          navigator.clipboard.writeText(msg);
                          setCopiedBroadcast(true);
                          setTimeout(() => setCopiedBroadcast(false), 3000);
                        }}
                      >
                        <Share2 size={16} />
                        <span>{copiedBroadcast ? 'Pesan Siaran Tersalin!' : 'Salin Semua Token untuk Pengumuman Grup'}</span>
                      </button>

                      {/* Button 2: Copy Tabular / List Format for Spreadsheets */}
                      <button
                        type="button"
                        className="admin-badge-btn"
                        style={{ height: 40, display: 'inline-flex', alignItems: 'center', gap: 7, padding: '0 14px' }}
                        title="Salin daftar kunci format tab-separated untuk Excel atau Spreadsheet"
                        onClick={() => {
                          const activeKeys = accessKeys.filter(k => !k.isUsed);
                          if (activeKeys.length === 0) {
                            alert('Tidak ada kunci aktif untuk disalin.');
                            return;
                          }

                          let list = `KUNCI\tKELAS\tKELOMPOK\tSTATUS\n`;
                          activeKeys.forEach(k => {
                            const cls = classes.find(c => c.id === k.classId);
                            const className = cls ? cls.name : (k.classId || 'Umum');
                            list += `${k.key}\t${className}\t${k.groupName || '-'}\tAktif (1 Kesempatan)\n`;
                          });

                          navigator.clipboard.writeText(list);
                          setCopiedList(true);
                          setTimeout(() => setCopiedList(false), 3000);
                        }}
                      >
                        <List size={16} />
                        <span>{copiedList ? 'Daftar Kunci Tersalin!' : 'Salin Daftar Kunci Saja (List)'}</span>
                      </button>

                      {accessKeys.some(k => k.isUsed) && (
                        <button
                          type="button"
                          className="admin-badge-btn"
                          style={{ height: 40, color: '#dc3545', borderColor: '#dc3545' }}
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
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                    <div style={{ background: 'var(--bg-subtle)', padding: '14px 18px', borderRadius: 4, border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: 11, textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Token Terdaftar</div>
                      <div style={{ fontSize: 26, fontWeight: 700, marginTop: 4 }}>{accessKeys.length}</div>
                    </div>
                    <div style={{ background: 'rgba(40, 167, 69, 0.08)', padding: '14px 18px', borderRadius: 4, border: '1px solid rgba(40, 167, 69, 0.25)' }}>
                      <div style={{ fontSize: 11, textTransform: 'uppercase', color: '#28a745', fontWeight: 600 }}>Token Aktif (Siap Pakai)</div>
                      <div style={{ fontSize: 26, fontWeight: 700, color: '#28a745', marginTop: 4 }}>
                        {accessKeys.filter(k => !k.isUsed).length}
                      </div>
                    </div>
                    <div style={{ background: 'var(--bg-subtle)', padding: '14px 18px', borderRadius: 4, border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: 11, textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600 }}>Karya Sudah Diinput (Hangus)</div>
                      <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-secondary)', marginTop: 4 }}>
                        {accessKeys.filter(k => k.isUsed).length}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Group Token Registration & Generator Section */}
                <div style={{ background: '#ffffff', border: '1px solid var(--border-subtle)', borderRadius: 4, padding: 24, marginBottom: 28 }}>
                  <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: 12, marginBottom: 20 }}>
                    <h4 style={{ fontSize: 16, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
                      <Users size={18} color="var(--accent-terracotta)" />
                      <span>Pendaftaran Kelompok &amp; Pembuatan Token</span>
                    </h4>
                  </div>

                  {/* Mode Navigation Tabs */}
                  <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      style={{
                        padding: '8px 16px',
                        fontSize: 13,
                        fontWeight: 600,
                        borderRadius: 4,
                        border: '1px solid var(--border-medium)',
                        background: tokenGenTab === 'ALL_CLASSES' ? 'var(--text-primary)' : 'var(--bg-canvas)',
                        color: tokenGenTab === 'ALL_CLASSES' ? '#ffffff' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6
                      }}
                      onClick={() => setTokenGenTab('ALL_CLASSES')}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>bolt</span>
                      <span>1-Klik Buat Token Semua Kelas (~70 Kelompok)</span>
                    </button>

                    <button
                      type="button"
                      style={{
                        padding: '8px 16px',
                        fontSize: 13,
                        fontWeight: 600,
                        borderRadius: 4,
                        border: '1px solid var(--border-medium)',
                        background: tokenGenTab === 'SINGLE_GROUP' ? 'var(--text-primary)' : 'var(--bg-canvas)',
                        color: tokenGenTab === 'SINGLE_GROUP' ? '#ffffff' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6
                      }}
                      onClick={() => setTokenGenTab('SINGLE_GROUP')}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>group_add</span>
                      <span>Tambah Satu Kelompok</span>
                    </button>

                    <button
                      type="button"
                      style={{
                        padding: '8px 16px',
                        fontSize: 13,
                        fontWeight: 600,
                        borderRadius: 4,
                        border: '1px solid var(--border-medium)',
                        background: tokenGenTab === 'BULK_TEXT' ? 'var(--text-primary)' : 'var(--bg-canvas)',
                        color: tokenGenTab === 'BULK_TEXT' ? '#ffffff' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6
                      }}
                      onClick={() => setTokenGenTab('BULK_TEXT')}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>format_list_bulleted</span>
                      <span>Daftarkan Banyak Kelompok (Paste Baris)</span>
                    </button>

                    <button
                      type="button"
                      style={{
                        padding: '8px 16px',
                        fontSize: 13,
                        fontWeight: 600,
                        borderRadius: 4,
                        border: '1px solid var(--border-medium)',
                        background: tokenGenTab === 'STANDALONE' ? 'var(--text-primary)' : 'var(--bg-canvas)',
                        color: tokenGenTab === 'STANDALONE' ? '#ffffff' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6
                      }}
                      onClick={() => setTokenGenTab('STANDALONE')}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>key</span>
                      <span>Kunci Standalone / Bebas (Susulan / Darurat)</span>
                    </button>
                  </div>

                  {/* TAB A: 1-Click All Classes */}
                  {tokenGenTab === 'ALL_CLASSES' && (
                    <div style={{ background: 'var(--bg-subtle)', padding: 20, borderRadius: 4, border: '1px solid var(--border-subtle)' }}>
                      <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 16px 0', lineHeight: 1.5 }}>
                        Secara otomatis membuat kelompok bernomor (contoh: <code>Kelompok 1</code> s.d. <code>Kelompok {groupsPerClassCount}</code>) untuk <strong>seluruh {classes.length} kelas yang terdaftar</strong> sekaligus.
                      </p>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                            Jumlah Kelompok per Kelas:
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="30"
                            className="form-input-text"
                            style={{ width: 120, height: 38, padding: '0 12px' }}
                            value={groupsPerClassCount}
                            onChange={(e) => setGroupsPerClassCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                          />
                        </div>

                        <div style={{ alignSelf: 'flex-end' }}>
                          <button
                            type="button"
                            className="submit-comment-btn"
                            disabled={isGeneratingKeys || classes.length === 0}
                            style={{ height: 38, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                            onClick={async () => {
                              const count = parseInt(groupsPerClassCount, 10) || 10;
                              if (confirm(`Buat ${count} token kelompok untuk masing-masing dari ${classes.length} kelas (total ${count * classes.length} token baru)?`)) {
                                setIsGeneratingKeys(true);
                                try {
                                  const updated = await generateTokensForAllClasses(classes, count);
                                  setAccessKeys(updated);
                                  alert(`Berhasil membuat ${count * classes.length} token untuk seluruh kelas!`);
                                } catch (err) {
                                  alert('Gagal membuat token: ' + err.message);
                                } finally {
                                  setIsGeneratingKeys(false);
                                }
                              }
                            }}
                          >
                            <RefreshCw size={14} className={isGeneratingKeys ? 'spin' : ''} />
                            <span>{isGeneratingKeys ? 'Membuat Token...' : `Buat ${groupsPerClassCount * classes.length} Token untuk Seluruh Kelas`}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB B: Single Group Registration */}
                  {tokenGenTab === 'SINGLE_GROUP' && (
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        const cId = singleClassId || classes[0]?.id;
                        const gName = singleGroupName.trim();
                        if (!gName) {
                          alert('Mohon isi nama kelompok (contoh: Kelompok 1)');
                          return;
                        }
                        setIsGeneratingKeys(true);
                        try {
                          const updated = await createGroupToken({ classId: cId, groupName: gName });
                          setAccessKeys(updated);
                          setSingleGroupName('');
                        } catch (err) {
                          alert('Gagal membuat token: ' + err.message);
                        } finally {
                          setIsGeneratingKeys(false);
                        }
                      }}
                      style={{ background: 'var(--bg-subtle)', padding: 20, borderRadius: 4, border: '1px solid var(--border-subtle)' }}
                    >
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 16 }}>
                        <div>
                          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                            Pilih Kelas:
                          </label>
                          <select
                            className="form-input-text"
                            style={{ width: '100%', height: 38, padding: '0 12px' }}
                            value={singleClassId || classes[0]?.id || ''}
                            onChange={(e) => setSingleClassId(e.target.value)}
                          >
                            {classes.map(c => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                            Nama Kelompok:
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Contoh: Kelompok 1 atau Tim Wayan"
                            className="form-input-text"
                            style={{ width: '100%', height: 38, padding: '0 12px' }}
                            value={singleGroupName}
                            onChange={(e) => setSingleGroupName(e.target.value)}
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isGeneratingKeys}
                        className="submit-comment-btn"
                        style={{ height: 38, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                      >
                        <Plus size={15} />
                        <span>{isGeneratingKeys ? 'Membuat Token...' : 'Daftarkan Kelompok & Buat Token'}</span>
                      </button>
                    </form>
                  )}

                  {/* TAB C: Bulk Paste Groups */}
                  {tokenGenTab === 'BULK_TEXT' && (
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        if (!bulkGroupsText.trim()) return;
                        const lines = bulkGroupsText.trim().split(/\r?\n/).map(l => l.trim()).filter(Boolean);
                        if (lines.length === 0) return;

                        const cId = bulkClassId || classes[0]?.id;
                        const list = lines.map(line => ({ classId: cId, groupName: line }));

                        setIsGeneratingKeys(true);
                        try {
                          const updated = await bulkCreateGroupTokens(list);
                          setAccessKeys(updated);
                          setBulkGroupsText('');
                          alert(`Berhasil membuat ${lines.length} token untuk kelas ${classes.find(c => c.id === cId)?.name || cId}!`);
                        } catch (err) {
                          alert('Gagal membuat token: ' + err.message);
                        } finally {
                          setIsGeneratingKeys(false);
                        }
                      }}
                      style={{ background: 'var(--bg-subtle)', padding: 20, borderRadius: 4, border: '1px solid var(--border-subtle)' }}
                    >
                      <div style={{ marginBottom: 16 }}>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                          Pilih Kelas:
                        </label>
                        <select
                          className="form-input-text"
                          style={{ width: 240, height: 38, padding: '0 12px' }}
                          value={bulkClassId || classes[0]?.id || ''}
                          onChange={(e) => setBulkClassId(e.target.value)}
                        >
                          {classes.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>

                      <div style={{ marginBottom: 16 }}>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                          Daftar Nama Kelompok (Satu per baris):
                        </label>
                        <textarea
                          rows={5}
                          className="form-input-text"
                          style={{ width: '100%', padding: '10px 12px', fontSize: 13 }}
                          placeholder={`Kelompok 1\nKelompok 2\nKelompok 3\nKelompok 4`}
                          value={bulkGroupsText}
                          onChange={(e) => setBulkGroupsText(e.target.value)}
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isGeneratingKeys || !bulkGroupsText.trim()}
                        className="submit-comment-btn"
                        style={{ height: 38, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                      >
                        <Plus size={15} />
                        <span>{isGeneratingKeys ? 'Membuat Token...' : 'Generate Token dari Daftar Kelompok'}</span>
                      </button>
                    </form>
                  )}

                  {/* TAB D: Standalone / Free-Floating Emergency Keys Generator */}
                  {tokenGenTab === 'STANDALONE' && (
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        const count = parseInt(standaloneKeysCount, 10) || 10;
                        const label = standaloneLabel.trim() || 'Kunci Standalone / Bebas (Susulan)';
                        setIsGeneratingKeys(true);
                        try {
                          const updated = await generateAccessKeys(count, label);
                          setAccessKeys(updated);
                          alert(`Berhasil membuat ${count} kunci standalone / bebas baru!`);
                        } catch (err) {
                          alert('Gagal membuat kunci standalone: ' + err.message);
                        } finally {
                          setIsGeneratingKeys(false);
                        }
                      }}
                      style={{ background: 'var(--bg-subtle)', padding: 20, borderRadius: 4, border: '1px solid var(--border-subtle)' }}
                    >
                      <div style={{
                        background: '#fef7e0',
                        border: '1px solid #f9ab00',
                        borderRadius: 4,
                        padding: '12px 16px',
                        marginBottom: 16,
                        fontSize: 13,
                        lineHeight: 1.5,
                        color: '#7c4a03'
                      }}>
                        <strong>Tentang Kunci Standalone / Bebas:</strong> Kunci ini tidak terikat ke kelompok atau kelas tertentu. Ketika siswa memasukkan kunci ini di portal, mereka dapat memilih kelas sendiri, serta memilih untuk <em>menambah karya baru (susulan)</em> atau <em>memperbaiki karya yang sudah ada</em>. Sangat fleksibel untuk kelompok susulan atau revisi tak terduga.
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 16 }}>
                        <div>
                          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                            Jumlah Kunci yang Ingin Dibuat:
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="50"
                            className="form-input-text"
                            style={{ width: '100%', height: 38, padding: '0 12px' }}
                            value={standaloneKeysCount}
                            onChange={(e) => setStandaloneKeysCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                            Label / Catatan Kunci:
                          </label>
                          <input
                            type="text"
                            className="form-input-text"
                            style={{ width: '100%', height: 38, padding: '0 12px' }}
                            value={standaloneLabel}
                            onChange={(e) => setStandaloneLabel(e.target.value)}
                            placeholder="Contoh: Kunci Standalone / Bebas (Susulan)"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isGeneratingKeys}
                        className="submit-comment-btn"
                        style={{ height: 38, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                      >
                        <RefreshCw size={14} className={isGeneratingKeys ? 'spin' : ''} />
                        <span>{isGeneratingKeys ? 'Membuat Kunci...' : `Generate ${standaloneKeysCount} Kunci Standalone / Bebas`}</span>
                      </button>
                    </form>
                  )}
                </div>

                {/* Token Table & Search Filter */}
                <div style={{ background: '#ffffff', border: '1px solid var(--border-subtle)', borderRadius: 4, padding: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14, marginBottom: 18 }}>
                    <h4 style={{ fontSize: 16, fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span>Daftar Kunci Akses Kelompok ({accessKeys.length})</span>
                    </h4>

                    {/* Filters */}
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      <select
                        className="form-input-text"
                        style={{ height: 36, padding: '0 10px', fontSize: 13 }}
                        value={filterKeyClass}
                        onChange={(e) => setFilterKeyClass(e.target.value)}
                      >
                        <option value="ALL">Semua Kelas &amp; Bebas</option>
                        <option value="STANDALONE">Kunci Standalone / Bebas Saja</option>
                        {classes.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>

                      <input
                        type="text"
                        placeholder="Cari token atau kelompok..."
                        className="form-input-text"
                        style={{ height: 36, padding: '0 12px', fontSize: 13, width: 200 }}
                        value={keySearchQuery}
                        onChange={(e) => setKeySearchQuery(e.target.value)}
                      >
                      </input>
                    </div>
                  </div>

                  {/* Filtered Keys Table */}
                  {accessKeys.length === 0 ? (
                    <div style={{ background: 'var(--bg-subtle)', border: '1px dashed var(--border-medium)', borderRadius: 4, padding: 36, textAlign: 'center' }}>
                      <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: '0 0 14px 0' }}>
                        Belum ada token kelompok yang dibuat.
                      </p>
                      <button
                        type="button"
                        className="submit-comment-btn"
                        onClick={() => setTokenGenTab('ALL_CLASSES')}
                      >
                        Gunakan 1-Klik Buat Token Semua Kelas
                      </button>
                    </div>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid var(--border-medium)', textAlign: 'left', background: 'var(--bg-subtle)' }}>
                            <th style={{ padding: '10px 14px' }}>Kelas</th>
                            <th style={{ padding: '10px 14px' }}>Nama Kelompok</th>
                            <th style={{ padding: '10px 14px' }}>6-Digit Token</th>
                            <th style={{ padding: '10px 14px' }}>Status Penggunaan</th>
                            <th style={{ padding: '10px 14px' }}>Waktu Dibuat</th>
                            <th style={{ padding: '10px 14px', textAlign: 'right' }}>Aksi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {accessKeys
                            .filter(k => {
                              const isStandalone = !k.classId || 
                                (k.groupName && (k.groupName.includes('Standalone') || k.groupName.includes('Bebas') || k.groupName.includes('Susulan')));
                              
                              let matchesClass = true;
                              if (filterKeyClass === 'STANDALONE') {
                                matchesClass = isStandalone;
                              } else if (filterKeyClass !== 'ALL') {
                                matchesClass = k.classId === filterKeyClass;
                              }

                              const matchesSearch = !keySearchQuery ||
                                k.key.includes(keySearchQuery) ||
                                (k.groupName && k.groupName.toLowerCase().includes(keySearchQuery.toLowerCase()));
                              return matchesClass && matchesSearch;
                            })
                            .map((k) => {
                              const isStandalone = !k.classId || 
                                (k.groupName && (k.groupName.includes('Standalone') || k.groupName.includes('Bebas') || k.groupName.includes('Susulan')));
                              const cls = classes.find(c => c.id === k.classId);
                              const className = cls ? cls.name : (k.classId || 'Bebas / Semua Kelas');

                              return (
                                <tr key={k.key} style={{ borderBottom: '1px solid var(--border-subtle)', background: k.isUsed ? 'rgba(0,0,0,0.015)' : '#ffffff' }}>
                                  <td style={{ padding: '12px 14px', fontWeight: 600 }}>
                                    {isStandalone ? (
                                      <span style={{
                                        display: 'inline-block',
                                        padding: '2px 8px',
                                        borderRadius: 4,
                                        background: '#fef7e0',
                                        color: '#b06000',
                                        border: '1px solid #f9ab00',
                                        fontSize: 12,
                                        fontWeight: 600
                                      }}>
                                        Bebas / Standalone
                                      </span>
                                    ) : (
                                      <span style={{
                                        display: 'inline-block',
                                        padding: '2px 8px',
                                        borderRadius: 4,
                                        background: 'var(--bg-subtle)',
                                        border: '1px solid var(--border-subtle)',
                                        fontSize: 12
                                      }}>
                                        {className}
                                      </span>
                                    )}
                                  </td>

                                  <td style={{ padding: '12px 14px', fontWeight: 500 }}>
                                    {k.groupName || '-'}
                                  </td>

                                  <td style={{ padding: '12px 14px' }}>
                                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                                      <span style={{
                                        fontFamily: 'monospace',
                                        fontSize: 15,
                                        fontWeight: 700,
                                        letterSpacing: 1.5,
                                        color: k.isUsed ? 'var(--text-muted)' : 'var(--text-primary)',
                                        textDecoration: k.isUsed ? 'line-through' : 'none'
                                      }}>
                                        {k.key}
                                      </span>

                                      {!k.isUsed && (
                                        <button
                                          type="button"
                                          className="admin-badge-btn"
                                          style={{ padding: '3px 8px', fontSize: 11 }}
                                          title="Salin Kunci"
                                          onClick={() => {
                                            navigator.clipboard.writeText(k.key);
                                            setCopiedKey(k.key);
                                            setTimeout(() => setCopiedKey(null), 2000);
                                          }}
                                        >
                                          <Copy size={11} />
                                          <span>{copiedKey === k.key ? 'Tersalin' : 'Salin'}</span>
                                        </button>
                                      )}
                                    </div>
                                  </td>

                                  <td style={{ padding: '12px 14px' }}>
                                    {k.isUsed ? (
                                      <span style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 5,
                                        padding: '3px 9px',
                                        borderRadius: 12,
                                        fontSize: 11,
                                        fontWeight: 600,
                                        background: '#f1f3f4',
                                        color: '#5f6368'
                                      }}>
                                        <Check size={12} />
                                        <span>Sudah Digunakan ({k.usedAt || 'Selesai'})</span>
                                      </span>
                                    ) : (
                                      <span style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 5,
                                        padding: '3px 9px',
                                        borderRadius: 12,
                                        fontSize: 11,
                                        fontWeight: 600,
                                        background: '#e6f4ea',
                                        color: '#137333'
                                      }}>
                                        <ShieldCheck size={12} />
                                        <span>Aktif &middot; 1 Kesempatan</span>
                                      </span>
                                    )}
                                  </td>

                                  <td style={{ padding: '12px 14px', fontSize: 12, color: 'var(--text-secondary)' }}>
                                    {k.createdAt || '-'}
                                  </td>

                                  <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                                    <button
                                      type="button"
                                      className="admin-badge-btn"
                                      style={{ padding: '5px 8px', color: '#dc3545', borderColor: '#f5c6cb' }}
                                      title="Hapus Kunci Ini"
                                      onClick={async () => {
                                        if (confirm(`Hapus token ${k.key} (${k.groupName})?`)) {
                                          const updated = await deleteAccessKey(k.key);
                                          setAccessKeys(updated);
                                        }
                                      }}
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
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
