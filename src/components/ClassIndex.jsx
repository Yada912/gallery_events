import React from 'react';

export default function ClassIndex({ classes, projects, onSelectClass, onSelectProject, onOpenStudentPortal }) {
  const totalClasses = classes.length;
  const totalArtworks = projects.length;

  const padZero = (num) => String(num).padStart(2, '0');

  return (
    <main className="container class-index-hero">
      {/* Category Eyebrow */}
      <div className="category-tag">PAMERAN / DAFTAR KELAS</div>

      {/* Main Editorial Hero */}
      <section className="hero-columns">
        <h1 className="main-headline">
          Ruang untuk setiap suara.
        </h1>
        <p className="hero-description">
          Jelajahi karya siswa dari setiap kelas. Temukan karya yang menyentuh hati dan berikan apresiasi.
        </p>
      </section>

      {/* Fine Rule Divider */}
      <div className="fine-divider" />

      {/* Directory Meta Header */}
      <div className="directory-meta-row">
        <div>Jelajahi galeri kelas</div>
        <div className="directory-count">
          {padZero(totalClasses)} kelas / {padZero(totalArtworks)} karya
        </div>
      </div>

      {totalArtworks === 0 && (
        <div style={{
          padding: '24px 28px',
          margin: '0 0 32px 0',
          background: 'rgba(196, 75, 43, 0.04)',
          border: '1px dashed rgba(196, 75, 43, 0.25)',
          borderRadius: '4px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
              Database Terhubung &amp; Siap untuk Karya Siswa
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              Belum ada karya yang dipublikasikan. Siswa dapat memasukkan karya menggunakan kunci akses dari panitia.
            </div>
          </div>
          {onOpenStudentPortal && (
            <button 
              type="button"
              className="action-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 18px',
                fontSize: 13,
                fontWeight: 600,
                background: 'var(--accent-terracotta)',
                color: '#ffffff',
                border: 'none',
                borderRadius: 4
              }}
              onClick={() => onOpenStudentPortal()}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>edit_square</span>
              <span>Input / Edit Karya Siswa</span>
            </button>
          )}
        </div>
      )}

      {/* Classes Grid */}
      <div className="classes-grid">
        {classes.map((cls) => {
          const classProjects = projects
            .filter((p) => p.classId === cls.id)
            .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

          const firstProject = classProjects[0];
          const firstProjectWithPoster = classProjects.find(p => 
            p.posterUrl && 
            !p.posterUrl.includes('/folders/') && 
            !p.posterUrl.startsWith('/artworks/')
          ) || firstProject;

          // 8 stacked cards simulation matching Figma design
          const stackCount = 8;
          const stackItems = Array.from({ length: stackCount }).map((_, idx) => {
            const project = classProjects[idx] || firstProjectWithPoster;
            return {
              idx,
              project
            };
          });

          return (
            <article 
              key={cls.id}
              className="class-card"
              onClick={() => {
                const target = firstProjectWithPoster || firstProject;
                if (target) {
                  onSelectProject(target);
                } else if (onOpenStudentPortal) {
                  onOpenStudentPortal(cls);
                } else {
                  onSelectClass(cls);
                }
              }}
            >
              {/* Stacked Artwork Preview Deck */}
              <div className="artwork-stack-preview">
                <div className="stacked-cards-container">
                  {stackItems.map(({ idx, project }) => {
                    const isLast = idx === stackCount - 1;
                    const isSecondLast = idx === stackCount - 2;
                    const offsetLeft = idx * 28; // horizontally layered
                    
                    const hasValidImg = Boolean(
                      project?.posterUrl && 
                      !project.posterUrl.includes('/folders/') && 
                      !project.posterUrl.startsWith('/artworks/')
                    );
                    // Load image only for the prominent top card or second top card to avoid GPU texture exhaustion
                    const shouldShowImg = (isLast || (isSecondLast && Boolean(classProjects[1]))) && hasValidImg;

                    return (
                      <div
                        key={idx}
                        className="stack-card-layer"
                        style={{
                          left: `${offsetLeft}px`,
                          zIndex: idx + 1,
                          backgroundImage: shouldShowImg ? `url("${project.posterUrl}")` : undefined,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          backgroundRepeat: 'no-repeat',
                          backgroundColor: '#f0ede6'
                        }}
                      >
                        {isLast && (
                          <div className="stack-card-preview-label">
                            {hasValidImg 
                              ? 'Pratinjau karya' 
                              : (classProjects.length > 0 ? 'Poster sedang disiapkan' : 'Karya segera hadir')}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Class Information & Arrow Action */}
              <div className="class-card-details">
                <div className="class-identity">
                  <h2 className="class-card-title">{cls.name}</h2>
                  <div className="class-card-meta">
                    {classProjects.length > 0 ? `${classProjects.length} karya · Karya siswa` : '0 karya · Klik untuk input'}
                  </div>
                </div>

                <div 
                  className="open-arrow-btn"
                  title={classProjects.length > 0 ? `Buka galeri ${cls.name}` : `Input karya ${cls.name}`}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>north_east</span>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </main>
  );
}
