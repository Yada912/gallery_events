import React from 'react';

export default function Footer({ onOpenStudentPortal }) {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="site-footer-inner">
          <div className="footer-brand">
            Proyek Kokurikuler: <strong>Gemar Belajar</strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <span>Pameran karya siswa &middot; Mari jelajahi.</span>
            {onOpenStudentPortal && (
              <span 
                onClick={onOpenStudentPortal}
                style={{
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  textDecoration: 'underline',
                  color: 'var(--accent-terracotta)',
                  fontWeight: 500
                }}
                title="Input atau ubah karya siswa"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>edit_note</span>
                <span>Input / Edit Karya Siswa</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
