import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import IntroScreen from './components/IntroScreen';
import ClassIndex from './components/ClassIndex';
import ArtworkDetail from './components/ArtworkDetail';
import AdminPage from './components/AdminPage';
import ExhibitionModal from './components/ExhibitionModal';
import Footer from './components/Footer';

import { 
  fetchClasses, 
  fetchProjects, 
  saveClass, 
  deleteClass, 
  saveProject, 
  deleteProject, 
  toggleLikeProject, 
  isProjectLikedByUser,
  addCommentToProject, 
  deleteCommentFromProject,
  subscribeToLiveUpdates,
  isSupabaseConfigured
} from './lib/supabase';

export default function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [classes, setClasses] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active view: 'INDEX' | 'DETAIL'
  const [activeView, setActiveView] = useState('INDEX');
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  // Modals
  const [adminOpen, setAdminOpen] = useState(false);
  const [exhibitionInfoOpen, setExhibitionInfoOpen] = useState(false);

  // Load Initial Data
  const loadData = useCallback(async () => {
    try {
      const [loadedClasses, loadedProjects] = await Promise.all([
        fetchClasses(),
        fetchProjects()
      ]);
      setClasses(loadedClasses);
      setProjects(loadedProjects);

      // Deep link support via hash (e.g. #karya-ipa12-01)
      const hash = window.location.hash;
      if (hash && hash.startsWith('#karya-')) {
        const id = hash.replace('#karya-', '');
        const found = loadedProjects.find(p => p.id === id);
        if (found) {
          setSelectedProjectId(found.id);
          setActiveView('DETAIL');
          setShowIntro(false);
        }
      }
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    // Listen to real-time live events (Supabase + Local BroadcastChannel)
    const unsubscribe = subscribeToLiveUpdates((event) => {
      if (event.type === 'COMMENT_ADDED') {
        setProjects((prev) => 
          prev.map((proj) => {
            if (proj.id === event.projectId) {
              const comments = proj.comments ? [...proj.comments] : [];
              if (event.comment.parentId) {
                const parent = comments.find(c => c.id === event.comment.parentId);
                if (parent) {
                  if (!parent.replies) parent.replies = [];
                  if (!parent.replies.some(r => r.id === event.comment.id)) {
                    parent.replies.push(event.comment);
                  }
                } else if (!comments.some(c => c.id === event.comment.id)) {
                  comments.push(event.comment);
                }
              } else if (!comments.some(c => c.id === event.comment.id)) {
                comments.push(event.comment);
              }
              return { ...proj, comments };
            }
            return proj;
          })
        );
      } else if (event.type === 'COMMENT_DELETED') {
        setProjects((prev) => 
          prev.map((proj) => {
            if (proj.id === event.projectId && proj.comments) {
              const filtered = proj.comments
                .filter(c => c.id !== event.commentId)
                .map(c => ({
                  ...c,
                  replies: c.replies ? c.replies.filter(r => r.id !== event.commentId) : []
                }));
              return { ...proj, comments: filtered };
            }
            return proj;
          })
        );
      } else if (event.type === 'LIKE_UPDATED') {
        setProjects((prev) => 
          prev.map((proj) => 
            proj.id === event.projectId ? { ...proj, likesCount: event.count } : proj
          )
        );
      } else {
        // Full refresh on classes or projects changes
        loadData();
      }
    });

    // Browser back/forward navigation handler
    const handlePopState = () => {
      const hash = window.location.hash;
      if (hash && hash.startsWith('#karya-')) {
        const id = hash.replace('#karya-', '');
        setSelectedProjectId(id);
        setActiveView('DETAIL');
      } else {
        setActiveView('INDEX');
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      unsubscribe();
      window.removeEventListener('popstate', handlePopState);
    };
  }, [loadData]);

  // Navigation handlers
  const handleSelectProject = (project) => {
    setSelectedProjectId(project.id);
    setActiveView('DETAIL');
    window.location.hash = `#karya-${project.id}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectClass = (cls) => {
    const classProjects = projects.filter(p => p.classId === cls.id);
    if (classProjects.length > 0) {
      handleSelectProject(classProjects[0]);
    }
  };

  const handleNavigateHome = () => {
    setActiveView('INDEX');
    window.location.hash = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Like handler
  const handleToggleLike = async (projectId) => {
    const result = await toggleLikeProject(projectId);
    setProjects((prev) =>
      prev.map((p) => p.id === projectId ? { ...p, likesCount: result.count } : p)
    );
  };

  // Comment handler
  const handleAddComment = async (projectId, commentData) => {
    const newComment = await addCommentToProject(projectId, commentData);
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId) {
          const comments = p.comments ? [...p.comments] : [];
          if (newComment.parentId) {
            const parent = comments.find(c => c.id === newComment.parentId);
            if (parent) {
              if (!parent.replies) parent.replies = [];
              parent.replies.push(newComment);
            } else {
              comments.push(newComment);
            }
          } else {
            comments.push(newComment);
          }
          return { ...p, comments };
        }
        return p;
      })
    );
    return newComment;
  };

  const handleDeleteComment = async (projectId, commentId) => {
    await deleteCommentFromProject(projectId, commentId);
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId && p.comments) {
          const filtered = p.comments
            .filter(c => c.id !== commentId)
            .map(c => ({
              ...c,
              replies: c.replies ? c.replies.filter(r => r.id !== commentId) : []
            }));
          return { ...p, comments: filtered };
        }
        return p;
      })
    );
  };

  // Admin CRUD Handlers
  const handleSaveClass = async (classData) => {
    const updated = await saveClass(classData);
    setClasses(updated);
  };

  const handleDeleteClass = async (classId) => {
    const updated = await deleteClass(classId);
    setClasses(updated);
  };

  const handleSaveProject = async (projectData) => {
    const updated = await saveProject(projectData);
    setProjects(updated);
  };

  const handleDeleteProject = async (projectId) => {
    const updated = await deleteProject(projectId);
    setProjects(updated);
    if (selectedProjectId === projectId) {
      handleNavigateHome();
    }
  };

  // Find currently viewed project
  const currentProject = projects.find(p => p.id === selectedProjectId) || projects[0];
  const currentClass = currentProject 
    ? classes.find(c => c.id === currentProject.classId) 
    : classes[0];
  const currentClassProjects = currentProject 
    ? projects.filter(p => p.classId === currentProject.classId) 
    : [];

  return (
    <div className="site-wrapper">
      {/* 2-Second Intro Splash as designed in Figma */}
      {showIntro && (
        <IntroScreen onComplete={() => setShowIntro(false)} />
      )}

      {/* Main Exhibition Header */}
      <Header
        activeView={activeView}
        onNavigateHome={handleNavigateHome}
        onOpenExhibitionInfo={() => setExhibitionInfoOpen(true)}
        onOpenAdmin={() => setAdminOpen(true)}
        isSupabaseOnline={isSupabaseConfigured}
      />

      {/* Body Views */}
      {loading ? (
        <div style={{ padding: '120px 24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 24 }}>Memuat galeri pameran...</div>
        </div>
      ) : activeView === 'INDEX' || !currentProject ? (
        <ClassIndex
          classes={classes}
          projects={projects}
          onSelectClass={handleSelectClass}
          onSelectProject={handleSelectProject}
        />
      ) : (
        <ArtworkDetail
          project={currentProject}
          currentClass={currentClass}
          classProjects={currentClassProjects}
          onNavigateBack={handleNavigateHome}
          onSelectProject={handleSelectProject}
          onToggleLike={handleToggleLike}
          isLiked={isProjectLikedByUser(currentProject.id)}
          onAddComment={handleAddComment}
        />
      )}

      {/* Exhibition Footer */}
      <Footer onOpenAdmin={() => setAdminOpen(true)} />

      {/* Admin Panel Modal */}
      <AdminPage
        isOpen={adminOpen}
        onClose={() => setAdminOpen(false)}
        classes={classes}
        projects={projects}
        onSaveClass={handleSaveClass}
        onDeleteClass={handleDeleteClass}
        onSaveProject={handleSaveProject}
        onDeleteProject={handleDeleteProject}
        onAddComment={handleAddComment}
        onDeleteComment={handleDeleteComment}
      />

      {/* Exhibition Context Modal */}
      <ExhibitionModal
        isOpen={exhibitionInfoOpen}
        onClose={() => setExhibitionInfoOpen(false)}
      />
    </div>
  );
}
