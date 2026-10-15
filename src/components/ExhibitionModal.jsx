import React from 'react';

export default function ExhibitionModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div 
        className="admin-window" 
        style={{ maxWidth: 680 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="admin-window-header">
          <div className="admin-window-title">
            <span>Tentang Pameran Siswa</span>
          </div>
          <button 
            onClick={onClose}
            style={{ padding: 4, cursor: 'pointer', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
          </button>
        </div>

        <div className="admin-window-body" style={{ padding: 32 }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>
            SMAS KRISTEN HARAPAN BALI
          </div>

          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 32, fontWeight: 500, lineHeight: 1.2, marginBottom: 16 }}>
            Belajar dari Penglipuran: Menjelajah, Meneliti, Berkarya, dan Berbagi
          </h2>

          <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 20 }}>
            Pameran <strong>Gemar Belajar</strong> merupakan perayaan karya kolaborasi kokurikuler siswa-siswi SMAS Kristen Harapan setelah melakukan studi lapangan mendalam di Desa Adat Penglipuran, Bangli, Bali.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
            <div style={{ background: 'var(--bg-subtle)', padding: 16, borderRadius: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, fontSize: 14, marginBottom: 6 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#d97706' }}>palette</span>
                <span>Karya Interaktif</span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Setiap kelompok merancang karya eksplorasi interaktif yang memadukan narasi, keindahan visual, dan nilai kearifan lokal.
              </p>
            </div>

            <div style={{ background: 'var(--bg-subtle)', padding: 16, borderRadius: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, fontSize: 14, marginBottom: 6 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#2563eb' }}>menu_book</span>
                <span>Poster Karya</span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Setiap poster yang terpajang merupakan karya seni visual representatif yang merangkum filosofi, estetika budaya, dan akses langsung ke karya siswa.
              </p>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Kurasi Kokurikuler 2026 &middot; Bali, Indonesia
            </div>
            <button 
              className="submit-comment-btn"
              onClick={onClose}
            >
              Tutup & Lanjutkan Menjelajah
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
