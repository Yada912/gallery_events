import React from 'react';
import { ArrowUpRight } from 'lucide-react';

export default function ClassIndex({ classes, projects, onSelectClass, onSelectProject }) {
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
          Jelajahi karya siswa dari setiap kelas. Temukan karya yang menyentuh hati dan berikan semangat.
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

      {/* Classes Grid */}
      <div className="classes-grid">
        {classes.map((cls) => {
          const classProjects = projects
            .filter((p) => p.classId === cls.id)
            .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

          const firstProject = classProjects[0];

          // 8 stacked cards simulation matching Figma design
          const stackCount = 8;
          const stackItems = Array.from({ length: stackCount }).map((_, idx) => {
            const project = classProjects[idx] || firstProject;
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
                if (firstProject) {
                  onSelectProject(firstProject);
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
                    const offsetLeft = idx * 28; // horizontally layered

                    return (
                      <div
                        key={idx}
                        className="stack-card-layer"
                        style={{
                          left: `${offsetLeft}px`,
                          zIndex: idx + 1,
                          backgroundImage: project?.posterUrl ? `url(${project.posterUrl})` : undefined,
                          backgroundColor: '#f0ede6'
                        }}
                      >
                        {isLast && (
                          <div className="stack-card-preview-label">
                            Pratinjau karya
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
                    {classProjects.length} karya &middot; Karya siswa
                  </div>
                </div>

                <div 
                  className="open-arrow-btn"
                  title={`Buka galeri ${cls.name}`}
                >
                  <ArrowUpRight size={18} />
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </main>
  );
}
