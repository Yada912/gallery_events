import React, { useState } from 'react';
import { 
  X, 
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
  Lock
} from 'lucide-react';
import { isSupabaseConfigured, resetToDemoData } from '../lib/supabase';

export default function AdminPage({
  isOpen,
  onClose,
  classes,
  projects,
  onSaveClass,
  onDeleteClass,
  onSaveProject,
  onDeleteProject,
  onAddComment,
  onDeleteComment
}) {
  const [passcode, setPasscode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('gema_admin_auth') === 'true';
  });
  const [errorMsg, setErrorMsg] = useState('');

  const [activeTab, setActiveTab] = useState('PROJECTS'); // 'PROJECTS', 'CLASSES', 'COMMENTS', 'SETTINGS'
  const [selectedClassFilter, setSelectedClassFilter] = useState('ALL');

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

  // Creator Reply State
  const [replyTarget, setReplyingTarget] = useState(null);
  const [replyText, setReplyText] = useState('');

  if (!isOpen) return null;

  const handleLogin = (e) => {
    e.preventDefault();
    const correctCode = import.meta.env.VITE_ADMIN_PASSCODE || 'gema2026';
    if (passcode === correctCode || passcode === 'admin' || passcode === 'gema2026') {
      setIsAuthenticated(true);
      sessionStorage.setItem('gema_admin_auth', 'true');
      setErrorMsg('');
    } else {
      setErrorMsg('Kata sandi admin tidak sesuai. Coba "gema2026".');
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
    await onSaveProject(projectForm);
    setEditingProject(null);
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

  // -------------------------------------------------------------
  // Creator Reply to Comment
  // -------------------------------------------------------------
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

  return (
    <div className="admin-modal-overlay">
      <div className="admin-window">
        {/* Header */}
        <div className="admin-window-header">
          <div className="admin-window-title">
            <ShieldCheck size={22} />
            <span>Panel Pengelola &middot; Gema Belajar</span>
          </div>
          <button 
            onClick={onClose}
            style={{ padding: 4, cursor: 'pointer', color: 'var(--text-secondary)' }}
          >
            <X size={20} />
          </button>
        </div>

        {!isAuthenticated ? (
          /* Authentication Screen */
          <div style={{ padding: 48, maxWidth: 420, margin: '0 auto', textAlign: 'center' }}>
            <div style={{ marginBottom: 16, display: 'inline-flex', padding: 16, borderRadius: '50%', background: 'var(--bg-subtle)' }}>
              <Lock size={28} />
            </div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 24, marginBottom: 8 }}>
              Masuk Administrator
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24 }}>
              Masukkan kata sandi pengelola untuk mengedit kelas, karya, tautan game, dan memoderasi komentar.
            </p>
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input
                type="password"
                className="form-input-text"
                placeholder="Kata sandi (default: gema2026)"
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
          /* Authenticated Dashboard */
          <>
            {/* Tabs */}
            <div className="admin-tabs-bar">
              <button
                className={`admin-tab-btn ${activeTab === 'PROJECTS' ? 'active' : ''}`}
                onClick={() => setActiveTab('PROJECTS')}
              >
                Karya & Proyek ({projects.length})
              </button>
              <button
                className={`admin-tab-btn ${activeTab === 'CLASSES' ? 'active' : ''}`}
                onClick={() => setActiveTab('CLASSES')}
              >
                Daftar Kelas ({classes.length})
              </button>
              <button
                className={`admin-tab-btn ${activeTab === 'COMMENTS' ? 'active' : ''}`}
                onClick={() => setActiveTab('COMMENTS')}
              >
                Moderasi Komentar
              </button>
              <button
                className={`admin-tab-btn ${activeTab === 'SETTINGS' ? 'active' : ''}`}
                onClick={() => setActiveTab('SETTINGS')}
              >
                Supabase & Vercel
              </button>
            </div>

            {/* Tab Contents */}
            <div className="admin-window-body">
              {/* TAB 1: PROJECTS */}
              {activeTab === 'PROJECTS' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <label style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Filter Kelas:</label>
                      <select
                        className="form-input-text"
                        style={{ height: 36, padding: '0 8px' }}
                        value={selectedClassFilter}
                        onChange={(e) => setSelectedClassFilter(e.target.value)}
                      >
                        <option value="ALL">Semua Kelas ({projects.length})</option>
                        {classes.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <button
                      className="submit-comment-btn"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                      onClick={startNewProject}
                    >
                      <Plus size={16} />
                      <span>Tambah Karya</span>
                    </button>
                  </div>

                  {/* Project Add/Edit Form */}
                  {editingProject && (
                    <form 
                      onSubmit={handleSaveProjectSubmit}
                      style={{
                        background: 'var(--bg-subtle)',
                        border: '1px solid var(--border-medium)',
                        borderRadius: 4,
                        padding: 20,
                        marginBottom: 24
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 18 }}>
                          {editingProject === 'NEW' ? 'Tambah Karya / Game Baru' : 'Edit Karya'}
                        </h3>
                        <button 
                          type="button" 
                          onClick={() => setEditingProject(null)}
                          style={{ fontSize: 12, cursor: 'pointer', textDecoration: 'underline' }}
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
                          <label className="field-label">Nomor Karya (misal: 01)</label>
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
                          <label className="field-label">Judul Karya / Game AI</label>
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
                          <label className="field-label">Nama Pembuat / Kelompok Siswa</label>
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
                          <label className="field-label">URL Poster Karya</label>
                          <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                            <input
                              type="text"
                              className="form-input-text"
                              style={{ flex: 1 }}
                              value={projectForm.posterUrl}
                              onChange={(e) => setProjectForm({ ...projectForm, posterUrl: e.target.value })}
                              required
                            />
                          </div>
                          <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                            <button
                              type="button"
                              style={{ fontSize: 11, textDecoration: 'underline', color: 'var(--text-secondary)' }}
                              onClick={() => setProjectForm({ ...projectForm, posterUrl: '/artworks/poster1.jpg' })}
                            >
                              Gunakan Poster 1
                            </button>
                            <button
                              type="button"
                              style={{ fontSize: 11, textDecoration: 'underline', color: 'var(--text-secondary)' }}
                              onClick={() => setProjectForm({ ...projectForm, posterUrl: '/artworks/poster2.jpg' })}
                            >
                              Gunakan Poster 2
                            </button>
                            <button
                              type="button"
                              style={{ fontSize: 11, textDecoration: 'underline', color: 'var(--text-secondary)' }}
                              onClick={() => setProjectForm({ ...projectForm, posterUrl: '/artworks/poster3.jpg' })}
                            >
                              Gunakan Poster 3
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="field-label">Tautan Game Eksternal (URL Game AI)</label>
                          <input
                            type="url"
                            className="form-input-text"
                            style={{ width: '100%', marginTop: 4 }}
                            placeholder="https://itch.io atau web game link"
                            value={projectForm.gameUrl}
                            onChange={(e) => setProjectForm({ ...projectForm, gameUrl: e.target.value })}
                          />
                        </div>
                      </div>

                      <div style={{ marginBottom: 16 }}>
                        <label className="field-label">Deskripsi / Konteks Pembuatan Game AI</label>
                        <textarea
                          className="form-input-text"
                          style={{ width: '100%', height: 60, marginTop: 4, padding: 8 }}
                          value={projectForm.description}
                          onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                        />
                      </div>

                      <button type="submit" className="submit-comment-btn" style={{ padding: '8px 24px' }}>
                        Simpan Karya
                      </button>
                    </form>
                  )}

                  {/* Projects List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {projects
                      .filter(p => selectedClassFilter === 'ALL' || p.classId === selectedClassFilter)
                      .map((p) => {
                        const cls = classes.find(c => c.id === p.classId);
                        return (
                          <div key={p.id} className="admin-item-card">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                              <img 
                                src={p.posterUrl} 
                                alt={p.title}
                                style={{ width: 44, height: 60, objectFit: 'cover', borderRadius: 2, border: '1px solid var(--border-subtle)' }}
                              />
                              <div>
                                <div style={{ fontWeight: 600, fontSize: 15 }}>
                                  {p.pieceNumber}. {p.title}
                                </div>
                                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                                  Kelas: <strong>{cls?.name || p.classId}</strong> &middot; Oleh: {p.creators}
                                </div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                                  {p.gameUrl ? (
                                    <span style={{ color: '#10b981' }}>Game Link: {p.gameUrl}</span>
                                  ) : (
                                    <span>Belum ada link game</span>
                                  )}
                                  &nbsp;·&nbsp;{p.likesCount || 0} Suka · {(p.comments || []).length} Komentar
                                </div>
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <button
                                style={{ padding: 6, border: '1px solid var(--border-medium)', borderRadius: 2 }}
                                onClick={() => startEditProject(p)}
                                title="Edit Karya"
                              >
                                <Edit3 size={15} />
                              </button>
                              <button
                                style={{ padding: 6, border: '1px solid var(--border-medium)', borderRadius: 2, color: '#e0245e' }}
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

              {/* TAB 2: CLASSES */}
              {activeTab === 'CLASSES' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                      Kelola daftar kelas dan urutan penampilan di beranda galeri.
                    </div>
                    <button
                      className="submit-comment-btn"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                      onClick={startNewClass}
                    >
                      <Plus size={16} />
                      <span>Tambah Kelas</span>
                    </button>
                  </div>

                  {editingClass && (
                    <form 
                      onSubmit={handleSaveClassSubmit}
                      style={{
                        background: 'var(--bg-subtle)',
                        border: '1px solid var(--border-medium)',
                        borderRadius: 4,
                        padding: 20,
                        marginBottom: 24
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 18 }}>
                          {editingClass === 'NEW' ? 'Tambah Kelas Baru' : 'Edit Kelas'}
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
                          <label className="field-label">ID Kelas (misal: xii-ipa-1)</label>
                          <input
                            type="text"
                            className="form-input-text"
                            style={{ width: '100%', marginTop: 4 }}
                            value={classForm.id}
                            onChange={(e) => setClassForm({ ...classForm, id: e.target.value })}
                            disabled={editingClass !== 'NEW'}
                            required
                          />
                        </div>
                        <div>
                          <label className="field-label">Nama Tampilan Kelas (misal: XII - IPA - 1)</label>
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
                        <label className="field-label">Deskripsi Tema Pembelajaran Kelas</label>
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

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {classes.map((cls) => {
                      const count = projects.filter(p => p.classId === cls.id).length;
                      return (
                        <div key={cls.id} className="admin-item-card">
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 16 }}>{cls.name}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                              ID: <code>{cls.id}</code> &middot; {count} karya tersimpan
                            </div>
                            {cls.description && (
                              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                                {cls.description}
                              </div>
                            )}
                          </div>

                          <div style={{ display: 'flex', gap: 8 }}>
                            <button
                              style={{ padding: 6, border: '1px solid var(--border-medium)', borderRadius: 2 }}
                              onClick={() => startEditClass(cls)}
                            >
                              <Edit3 size={15} />
                            </button>
                            <button
                              style={{ padding: 6, border: '1px solid var(--border-medium)', borderRadius: 2, color: '#e0245e' }}
                              onClick={() => {
                                if (confirm(`Hapus kelas "${cls.name}" dan semua karyanya?`)) {
                                  onDeleteClass(cls.id);
                                }
                              }}
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

              {/* TAB 3: COMMENTS MODERATION */}
              {activeTab === 'COMMENTS' && (
                <div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>
                    Moderasi komentar real-time dari pengunjung pameran. Anda juga dapat memberikan balasan resmi dengan lencana <strong>Pembuat</strong>.
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {projects.flatMap(p => 
                      (p.comments || []).map(c => ({ ...c, projectId: p.id, projectTitle: p.title }))
                    ).length === 0 ? (
                      <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                        Belum ada komentar untuk dimoderasi.
                      </div>
                    ) : (
                      projects.flatMap(p => 
                        (p.comments || []).map(c => ({ ...c, projectId: p.id, projectTitle: p.title }))
                      ).map(c => (
                        <div key={c.id} className="admin-item-card" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                                Karya: <strong>{c.projectTitle}</strong>
                              </div>
                              <div style={{ fontWeight: 600, fontSize: 14, marginTop: 2 }}>
                                {c.authorName} &middot; <span style={{ fontWeight: 400, color: 'var(--text-secondary)' }}>{c.createdAt}</span>
                              </div>
                              <div style={{ fontSize: 14, marginTop: 4, color: 'var(--text-primary)' }}>
                                {c.content}
                              </div>
                            </div>

                            <button
                              style={{ padding: 6, border: '1px solid var(--border-medium)', borderRadius: 2, color: '#e0245e' }}
                              onClick={() => onDeleteComment(c.projectId, c.id)}
                              title="Hapus Komentar"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>

                          {/* Existing Replies */}
                          {c.replies && c.replies.length > 0 && (
                            <div style={{ marginTop: 10, paddingLeft: 12, borderLeft: '2px solid var(--border-medium)' }}>
                              {c.replies.map(r => (
                                <div key={r.id} style={{ fontSize: 12, marginBottom: 4 }}>
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
                                + Balas sebagai Pembuat
                              </button>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: SETTINGS & SUPABASE / VERCEL */}
              {activeTab === 'SETTINGS' && (
                <div>
                  <div style={{ background: '#ffffff', border: '1px solid var(--border-subtle)', borderRadius: 4, padding: 20, marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Database size={18} />
                        <h3 style={{ fontSize: 16, fontWeight: 600 }}>Status Koneksi Supabase</h3>
                      </div>
                      <span className={`status-indicator ${isSupabaseConfigured ? 'status-online' : 'status-offline'}`}>
                        {isSupabaseConfigured ? '● Supabase Terhubung' : '● Mode Lokal & BroadcastChannel Aktif'}
                      </span>
                    </div>

                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 16 }}>
                      {isSupabaseConfigured ? (
                        'Aplikasi terhubung langsung ke database cloud PostgreSQL Supabase dengan fitur Realtime aktif. Setiap komentar baru atau like akan disinkronkan secara instan ke semua pengunjung.'
                      ) : (
                        'Aplikasi saat ini berjalan dalam mode mandiri (Local Storage + BroadcastChannel). Komentar dan interaksi tetap realtime antar-tab browser. Untuk menghubungkan ke Supabase di Vercel, cukup tambahkan variabel lingkungan berikut:'
                      )}
                    </p>

                    <div style={{ background: 'var(--bg-subtle)', padding: 12, borderRadius: 2, fontFamily: 'monospace', fontSize: 12, color: 'var(--text-primary)' }}>
                      <div>VITE_SUPABASE_URL=https://proyek-anda.supabase.co</div>
                      <div>VITE_SUPABASE_ANON_KEY=eyJh...anon-key-anda</div>
                      <div>VITE_ADMIN_PASSCODE=gema2026</div>
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
                      <a
                        href="https://vercel.com/new"
                        target="_blank"
                        rel="noreferrer"
                        className="admin-badge-btn"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                      >
                        <span>Deploy ke Vercel</span>
                        <ExternalLink size={13} />
                      </a>
                    </div>
                  </div>

                  {/* Reset Demo Data */}
                  <div style={{ background: '#ffffff', border: '1px solid var(--border-subtle)', borderRadius: 4, padding: 20 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>
                      Reset Data Demo
                    </h3>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
                      Kembalikan seluruh daftar kelas (6 kelas) dan karya siswa (48 proyek) ke data awal default pameran SMAS Kristen Harapan.
                    </p>
                    <button
                      className="admin-badge-btn"
                      style={{ color: '#e0245e', borderColor: '#e0245e' }}
                      onClick={() => {
                        if (confirm('Apakah Anda yakin ingin mereset seluruh data kembali ke 6 kelas dan 48 karya demo awal?')) {
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
          </>
        )}
      </div>
    </div>
  );
}
