import React from 'react';

export default function Header({ 
  activeView, 
  onNavigateHome, 
  onOpenExhibitionInfo,
  onOpenStudentPortal
}) {
  return (
    <header className="site-header">
      <div className="container">
        <div className="site-header-inner">
          <div 
            className="brand-container"
            onClick={onNavigateHome}
            role="button"
            tabIndex={0}
          >
            <div className="header-logos-wrapper">
              <img 
                src="/logos/kemendikbud.svg" 
                alt="Logo Kementerian Pendidikan dan Kebudayaan"
                className="header-logo logo-kemendikbud"
              />
              <img 
                src="/logos/harapan.png" 
                alt="Logo SMAS Kristen Harapan"
                className="header-logo logo-harapan"
              />
            </div>
            <span className="brand-title">Gema Belajar</span>
          </div>

          {/* Navigation (Clean Public View + Student Edit Portal) */}
          <nav className="header-nav">
            <span 
              className={`nav-link ${activeView === 'INDEX' ? 'active' : ''}`}
              onClick={onNavigateHome}
            >
              Galeri kelas
            </span>

            <span 
              className="nav-link"
              onClick={onOpenExhibitionInfo}
            >
              Pameran siswa
            </span>

            {onOpenStudentPortal && (
              <span 
                className={`nav-link ${activeView === 'STUDENT_PORTAL' ? 'active' : ''}`}
                onClick={onOpenStudentPortal}
                style={{ cursor: 'pointer' }}
                title="Input atau perbarui karya kelompok siswa"
              >
                Input / Edit Karya
              </span>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
