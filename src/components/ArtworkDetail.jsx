import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  Heart, 
  MessageSquare, 
  ArrowUpRight,
  Maximize2,
  X,
  CornerDownRight
} from 'lucide-react';

export default function ArtworkDetail({
  project,
  currentClass,
  classProjects,
  onNavigateBack,
  onSelectProject,
  onToggleLike,
  isLiked,
  onAddComment
}) {
  const [threadExpanded, setThreadExpanded] = useState(true);
  const [authorName, setAuthorName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [replyingToId, setReplyingToId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Sorted projects in current class
  const sortedClassProjects = [...classProjects].sort(
    (a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)
  );

  const currentIndex = sortedClassProjects.findIndex(p => p.id === project.id);
  const prevProject = currentIndex > 0 ? sortedClassProjects[currentIndex - 1] : null;
  const nextProject = currentIndex < sortedClassProjects.length - 1 ? sortedClassProjects[currentIndex + 1] : null;

  const totalInClass = String(sortedClassProjects.length).padStart(2, '0');
  const pieceNumber = String(project.pieceNumber || (currentIndex + 1)).padStart(2, '0');

  // Flat & nested comments
  const comments = project.comments || [];
  const commentCount = comments.reduce((acc, c) => acc + 1 + (c.replies ? c.replies.length : 0), 0);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setSubmitting(true);
    try {
      await onAddComment(project.id, {
        authorName: authorName.trim() || 'Anonim',
        content: commentText.trim(),
        parentId: replyingToId,
        isCreator: false
      });
      setCommentText('');
      setReplyingToId(null);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container artwork-page">
      {/* Breadcrumb Navigation */}
      <div 
        className="breadcrumb-bar"
        onClick={onNavigateBack}
        role="button"
        tabIndex={0}
      >
        <ArrowLeft size={16} />
        <span>Semua kelas / {currentClass?.name || 'Galeri'}</span>
      </div>

      {/* Previous & Next Artwork Navigation Bar */}
      <div className="artwork-nav-controls">
        <button
          className="artwork-nav-btn"
          disabled={!prevProject}
          onClick={() => prevProject && onSelectProject(prevProject)}
        >
          <ArrowLeft size={16} />
          <span>Karya sebelumnya</span>
        </button>

        <div className="collection-position-label">
          Karya {pieceNumber} / {totalInClass} - {currentClass?.name}
        </div>

        <button
          className="artwork-nav-btn"
          disabled={!nextProject}
          onClick={() => nextProject && onSelectProject(nextProject)}
        >
          <span>Karya berikutnya</span>
          <ArrowRight size={16} />
        </button>
      </div>

      {/* 2-Column Main Layout */}
      <div className="artwork-layout-grid">
        {/* Left Column: Artwork / Poster Column */}
        <section className="artwork-poster-column">
          {/* Metadata Header Above Poster */}
          <div className="poster-metadata-header-top">
            <span className="metadata-badge-format">{project.format || 'PNG'}</span>
            <span className="metadata-badge-piece">Karya {pieceNumber} / {totalInClass}</span>
          </div>

          <div className="artwork-poster-canvas">
            <div 
              className="poster-image-wrapper"
              onClick={() => setLightboxOpen(true)}
              title="Klik untuk memperbesar poster karya"
            >
              {project.posterUrl ? (
                <img 
                  src={project.posterUrl} 
                  alt={`${project.title} - Poster Karya Siswa`}
                  loading="eager" 
                />
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                  <div>Tempat karya</div>
                </div>
              )}
            </div>

            <div className="poster-baseline-rule" />
          </div>
        </section>

        {/* Right Column: Identity, Discussion & External Game Link */}
        <section className="artwork-info-col">
          {/* Identity */}
          <div className="piece-class-label">
            {currentClass?.name} &middot; KARYA SISWA
          </div>
          <h1 className="piece-title">
            {project.title}
          </h1>
          <div className="piece-creator">
            Oleh {project.creators}
          </div>

          {/* Likes & Comment Count Summary */}
          <div className="feedback-summary-bar">
            <button
              className={`like-pill-btn ${isLiked ? 'liked' : ''}`}
              onClick={() => onToggleLike(project.id)}
              title="Berikan semangat dan apresiasi karya siswa ini"
            >
              <Heart 
                size={16} 
                fill={isLiked ? '#e0245e' : 'none'} 
                color={isLiked ? '#e0245e' : 'currentColor'} 
              />
              <span>Suka &middot; {project.likesCount || 0}</span>
            </button>

            <div className="comment-count-badge">
              <MessageSquare size={16} />
              <span>{commentCount}</span>
            </div>
          </div>

          {/* Comments Section */}
          <div className="comments-section">
            <div className="comments-header-row">
              <h2 className="comments-title">Komentar ({commentCount})</h2>
              <button 
                className="toggle-thread-btn"
                onClick={() => setThreadExpanded(!threadExpanded)}
              >
                {threadExpanded ? 'Sembunyikan diskusi —' : 'Tampilkan diskusi +'}
              </button>
            </div>

            {threadExpanded && (
              <>
                {/* Comments List */}
                <div className="comments-list">
                  {comments.length === 0 ? (
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic', padding: '8px 0' }}>
                      Belum ada komentar. Jadilah yang pertama memberikan apresiasi atau tanggapan!
                    </div>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment.id} className="comment-card">
                        <div className="comment-meta">
                          <span className="comment-author-name">{comment.authorName}</span>
                          <span>&middot;</span>
                          <span>{comment.createdAt}</span>
                        </div>
                        <div className="comment-body-text">{comment.content}</div>
                        <span 
                          className="comment-reply-action"
                          onClick={() => {
                            setReplyingToId(comment.id);
                            setAuthorName('');
                          }}
                        >
                          Balas
                        </span>

                        {/* Indented Creator Replies */}
                        {comment.replies && comment.replies.map((reply) => (
                          <div key={reply.id} className="creator-reply-card">
                            <div className="comment-meta">
                              <span className="comment-author-name">{reply.authorName}</span>
                              {reply.isCreator && (
                                <span className="creator-badge">Pembuat</span>
                              )}
                              <span>&middot;</span>
                              <span>{reply.createdAt}</span>
                            </div>
                            <div className="comment-body-text">{reply.content}</div>
                          </div>
                        ))}
                      </div>
                    ))
                  )}
                </div>

                {/* Comment Input Form */}
                <form className="comment-form-container" onSubmit={handleCommentSubmit}>
                  {replyingToId && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-secondary)', background: 'var(--bg-subtle)', padding: '6px 10px', borderRadius: 2 }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <CornerDownRight size={14} /> Membalas komentar
                      </span>
                      <button 
                        type="button" 
                        onClick={() => setReplyingToId(null)}
                        style={{ cursor: 'pointer', fontSize: 11, textDecoration: 'underline' }}
                      >
                        Batal
                      </button>
                    </div>
                  )}

                  <label className="field-label" htmlFor="author-input">Nama (opsional)</label>
                  <input
                    id="author-input"
                    type="text"
                    className="form-input-text"
                    placeholder="Nama Anda"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                  />
                  <div className="form-guidance-caption">
                    Kosongkan untuk mengirim secara anonim. Tidak perlu masuk.
                  </div>

                  <div className="comment-box-wrapper" style={{ marginTop: 8 }}>
                    <textarea
                      className="comment-textarea"
                      placeholder="Tulis komentar yang bermakna..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      rows={3}
                      required
                    />
                    <div className="comment-box-footer">
                      <span>Sampaikan dengan santun dan membangun.</span>
                      <button 
                        type="submit" 
                        className="submit-comment-btn"
                        disabled={submitting || !commentText.trim()}
                      >
                        {submitting ? 'Mengirim...' : 'Kirim'}
                      </button>
                    </div>
                  </div>
                </form>
              </>
            )}
          </div>

          {/* External Playable Game Link */}
          <div className="external-link-card">
            <a
              href={project.gameUrl || '#'}
              target={project.gameUrl ? "_blank" : undefined}
              rel="noreferrer"
              className="external-game-action-btn"
              onClick={(e) => {
                if (!project.gameUrl) {
                  e.preventDefault();
                  alert('Tautan game eksternal untuk karya ini sedang dipersiapkan oleh tim siswa!');
                }
              }}
            >
              <span>Buka tautan karya {pieceNumber}</span>
              <ArrowUpRight size={18} />
            </a>
            <div className="external-link-status">
              Tautan eksternal karya {pieceNumber} {project.gameUrl ? `· ${project.gameUrl}` : '· Belum tersedia'}
            </div>
          </div>
        </section>
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            cursor: 'zoom-out'
          }}
          onClick={() => setLightboxOpen(false)}
        >
          <button 
            style={{
              position: 'absolute',
              top: 24,
              right: 24,
              color: '#ffffff',
              background: 'rgba(0,0,0,0.5)',
              borderRadius: '50%',
              padding: 8
            }}
            onClick={() => setLightboxOpen(false)}
          >
            <X size={24} />
          </button>
          <img 
            src={project.posterUrl} 
            alt={project.title}
            style={{
              maxWidth: '90vw',
              maxHeight: '90vh',
              objectFit: 'contain',
              borderRadius: 4,
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
            }} 
          />
        </div>
      )}
    </div>
  );
}
