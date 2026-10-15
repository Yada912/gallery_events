// =========================================================
// Supabase Client & Real-time Live Storage Service
// Supports Supabase PostgreSQL + Realtime, with automatic
// resilient local fallback (BroadcastChannel + LocalStorage)
// =========================================================

import { createClient } from '@supabase/supabase-js';
import { INITIAL_CLASSES, INITIAL_PROJECTS } from '../data/initialData';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-project-id.supabase.co' &&
  !supabaseUrl.includes('your-project-id')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Local BroadcastChannel for instant multi-tab live sync when in local mode
const liveChannel = typeof window !== 'undefined' && window.BroadcastChannel
  ? new BroadcastChannel('gema_belajar_realtime')
  : null;

const STORAGE_KEYS = {
  CLASSES: 'gema_belajar_classes_v1',
  PROJECTS: 'gema_belajar_projects_v1',
  LIKED_PROJECTS: 'gema_belajar_user_likes_v1'
};

// Initialize localStorage with initial data if empty
export function initLocalStore() {
  if (typeof window === 'undefined') return;
  if (!localStorage.getItem(STORAGE_KEYS.CLASSES)) {
    localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(INITIAL_CLASSES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.PROJECTS)) {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(INITIAL_PROJECTS));
  }
}

// ---------------------------------------------------------
// Classes API
// ---------------------------------------------------------
export async function fetchClasses() {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .order('display_order', { ascending: true });
      if (!error && data && data.length > 0) {
        return data.map(item => ({
          id: item.id,
          name: item.name,
          displayOrder: item.display_order,
          description: item.description || ''
        }));
      }
    } catch (err) {
      console.warn('Supabase fetchClasses error, falling back to local store:', err);
    }
  }

  initLocalStore();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CLASSES);
    return raw ? JSON.parse(raw) : INITIAL_CLASSES;
  } catch {
    return INITIAL_CLASSES;
  }
}

export async function saveClass(classData) {
  if (isSupabaseConfigured) {
    try {
      await supabase.from('classes').upsert({
        id: classData.id,
        name: classData.name,
        display_order: classData.displayOrder || 0,
        description: classData.description || ''
      });
    } catch (err) {
      console.error('Supabase saveClass error:', err);
    }
  }

  // Update local
  initLocalStore();
  const current = await fetchClasses();
  const index = current.findIndex(c => c.id === classData.id);
  let updated;
  if (index >= 0) {
    updated = [...current];
    updated[index] = { ...updated[index], ...classData };
  } else {
    updated = [...current, classData];
  }
  localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(updated));
  liveChannel?.postMessage({ type: 'CLASSES_UPDATED' });
  return updated;
}

export async function deleteClass(classId) {
  if (isSupabaseConfigured) {
    try {
      await supabase.from('classes').delete().eq('id', classId);
    } catch (err) {
      console.error('Supabase deleteClass error:', err);
    }
  }

  initLocalStore();
  const current = await fetchClasses();
  const updated = current.filter(c => c.id !== classId);
  localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(updated));
  liveChannel?.postMessage({ type: 'CLASSES_UPDATED' });
  return updated;
}

// ---------------------------------------------------------
// Projects API
// ---------------------------------------------------------
export async function fetchProjects() {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          comments (*)
        `)
        .order('display_order', { ascending: true });
      if (!error && data && data.length > 0) {
        return data.map(item => ({
          id: item.id,
          classId: item.class_id,
          pieceNumber: item.piece_number,
          title: item.title,
          creators: item.creators,
          format: item.format || 'PNG',
          posterUrl: item.poster_url,
          gameUrl: item.game_url || '',
          description: item.description || '',
          likesCount: item.likes_count || 0,
          displayOrder: item.display_order || 0,
          comments: (item.comments || []).map(c => ({
            id: c.id,
            authorName: c.author_name,
            content: c.content,
            createdAt: new Date(c.created_at).toLocaleDateString('id-ID'),
            isCreator: c.is_creator,
            parentId: c.parent_id
          }))
        }));
      }
    } catch (err) {
      console.warn('Supabase fetchProjects error, using local fallback:', err);
    }
  }

  initLocalStore();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    return raw ? JSON.parse(raw) : INITIAL_PROJECTS;
  } catch {
    return INITIAL_PROJECTS;
  }
}

export async function saveProject(projectData) {
  if (isSupabaseConfigured) {
    try {
      await supabase.from('projects').upsert({
        id: projectData.id,
        class_id: projectData.classId,
        piece_number: projectData.pieceNumber,
        title: projectData.title,
        creators: projectData.creators,
        format: projectData.format || 'PNG',
        poster_url: projectData.posterUrl,
        game_url: projectData.gameUrl || '',
        description: projectData.description || '',
        likes_count: projectData.likesCount || 0,
        display_order: projectData.displayOrder || 0
      });
    } catch (err) {
      console.error('Supabase saveProject error:', err);
    }
  }

  initLocalStore();
  const current = await fetchProjects();
  const index = current.findIndex(p => p.id === projectData.id);
  let updated;
  if (index >= 0) {
    updated = [...current];
    updated[index] = { ...updated[index], ...projectData };
  } else {
    updated = [...current, projectData];
  }
  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(updated));
  liveChannel?.postMessage({ type: 'PROJECTS_UPDATED', projectId: projectData.id });
  return updated;
}

export async function deleteProject(projectId) {
  if (isSupabaseConfigured) {
    try {
      await supabase.from('projects').delete().eq('id', projectId);
    } catch (err) {
      console.error('Supabase deleteProject error:', err);
    }
  }

  initLocalStore();
  const current = await fetchProjects();
  const updated = current.filter(p => p.id !== projectId);
  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(updated));
  liveChannel?.postMessage({ type: 'PROJECTS_UPDATED', projectId });
  return updated;
}

// ---------------------------------------------------------
// Likes API
// ---------------------------------------------------------
export function isProjectLikedByUser(projectId) {
  if (typeof window === 'undefined') return false;
  try {
    const likes = JSON.parse(localStorage.getItem(STORAGE_KEYS.LIKED_PROJECTS) || '[]');
    return likes.includes(projectId);
  } catch {
    return false;
  }
}

export async function toggleLikeProject(projectId) {
  initLocalStore();
  const liked = isProjectLikedByUser(projectId);
  let userLikes = [];
  try {
    userLikes = JSON.parse(localStorage.getItem(STORAGE_KEYS.LIKED_PROJECTS) || '[]');
  } catch {}

  const newLikedState = !liked;
  if (newLikedState) {
    userLikes.push(projectId);
  } else {
    userLikes = userLikes.filter(id => id !== projectId);
  }
  localStorage.setItem(STORAGE_KEYS.LIKED_PROJECTS, JSON.stringify(userLikes));

  const projects = await fetchProjects();
  const project = projects.find(p => p.id === projectId);
  if (!project) return { liked: newLikedState, count: 0 };

  const delta = newLikedState ? 1 : -1;
  const newCount = Math.max(0, (project.likesCount || 0) + delta);
  project.likesCount = newCount;

  if (isSupabaseConfigured) {
    try {
      await supabase
        .from('projects')
        .update({ likes_count: newCount })
        .eq('id', projectId);
    } catch (err) {
      console.error('Supabase like update error:', err);
    }
  }

  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  liveChannel?.postMessage({ type: 'LIKE_UPDATED', projectId, count: newCount });
  return { liked: newLikedState, count: newCount };
}

// Admin directly sets exact likes count
export async function setProjectLikesDirectly(projectId, count) {
  initLocalStore();
  const safeCount = Math.max(0, parseInt(count, 10) || 0);
  const projects = await fetchProjects();
  const project = projects.find(p => p.id === projectId);
  if (!project) return safeCount;

  project.likesCount = safeCount;

  if (isSupabaseConfigured) {
    try {
      await supabase
        .from('projects')
        .update({ likes_count: safeCount })
        .eq('id', projectId);
    } catch (err) {
      console.error('Supabase setLikes error:', err);
    }
  }

  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  liveChannel?.postMessage({ type: 'LIKE_UPDATED', projectId, count: safeCount });
  return safeCount;
}

// ---------------------------------------------------------
// Real-time Comments API & Editing
// ---------------------------------------------------------
export async function updateCommentInProject(projectId, commentId, updatedFields) {
  if (isSupabaseConfigured) {
    try {
      const dbFields = {};
      if (updatedFields.authorName !== undefined) dbFields.author_name = updatedFields.authorName;
      if (updatedFields.content !== undefined) dbFields.content = updatedFields.content;
      if (updatedFields.isCreator !== undefined) dbFields.is_creator = updatedFields.isCreator;

      await supabase
        .from('comments')
        .update(dbFields)
        .eq('id', commentId);
    } catch (err) {
      console.error('Supabase updateComment error:', err);
    }
  }

  initLocalStore();
  const projects = await fetchProjects();
  const project = projects.find(p => p.id === projectId);
  if (project && project.comments) {
    project.comments = project.comments.map(c => {
      if (c.id === commentId) {
        return { ...c, ...updatedFields };
      }
      if (c.replies) {
        c.replies = c.replies.map(r => r.id === commentId ? { ...r, ...updatedFields } : r);
      }
      return c;
    });
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  }

  liveChannel?.postMessage({
    type: 'COMMENT_UPDATED',
    projectId,
    commentId,
    updatedFields
  });
}

export async function addCommentToProject(projectId, { authorName, content, isCreator = false, parentId = null }) {
  const newComment = {
    id: `c-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    authorName: authorName.trim() || 'Anonim',
    content: content.trim(),
    createdAt: 'Baru saja',
    isCreator,
    parentId,
    replies: []
  };

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.from('comments').insert({
        project_id: projectId,
        author_name: newComment.authorName,
        content: newComment.content,
        is_creator: isCreator,
        parent_id: parentId || null
      }).select().single();

      if (!error && data) {
        newComment.id = data.id;
      }
    } catch (err) {
      console.error('Supabase addComment error:', err);
    }
  }

  // Local update
  initLocalStore();
  const projects = await fetchProjects();
  const project = projects.find(p => p.id === projectId);
  if (project) {
    if (!project.comments) project.comments = [];

    if (parentId) {
      // Find parent comment and append to its replies
      const parent = project.comments.find(c => c.id === parentId);
      if (parent) {
        if (!parent.replies) parent.replies = [];
        parent.replies.push(newComment);
      } else {
        project.comments.push(newComment);
      }
    } else {
      project.comments.push(newComment);
    }

    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  }

  // Broadcast to other tabs & listeners
  liveChannel?.postMessage({
    type: 'COMMENT_ADDED',
    projectId,
    comment: newComment
  });

  return newComment;
}

export async function deleteCommentFromProject(projectId, commentId) {
  if (isSupabaseConfigured) {
    try {
      await supabase.from('comments').delete().eq('id', commentId);
    } catch (err) {
      console.error('Supabase deleteComment error:', err);
    }
  }

  initLocalStore();
  const projects = await fetchProjects();
  const project = projects.find(p => p.id === projectId);
  if (project && project.comments) {
    project.comments = project.comments.filter(c => {
      if (c.id === commentId) return false;
      if (c.replies) {
        c.replies = c.replies.filter(r => r.id !== commentId);
      }
      return true;
    });
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  }

  liveChannel?.postMessage({
    type: 'COMMENT_DELETED',
    projectId,
    commentId
  });
}

// Real-time subscription hook
export function subscribeToLiveUpdates(onUpdate) {
  // 1. Supabase Realtime channel if available
  let supabaseChannel = null;
  if (isSupabaseConfigured) {
    supabaseChannel = supabase
      .channel('public:live_comments_and_projects')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, (payload) => {
        onUpdate({ type: 'SUPABASE_COMMENT_CHANGE', payload });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, (payload) => {
        onUpdate({ type: 'SUPABASE_PROJECT_CHANGE', payload });
      })
      .subscribe();
  }

  // 2. BroadcastChannel for local real-time sync across browser tabs
  const handleLocalMessage = (event) => {
    onUpdate(event.data);
  };

  liveChannel?.addEventListener('message', handleLocalMessage);

  // Return unsubscribe cleanup function
  return () => {
    if (supabaseChannel) {
      supabase.removeChannel(supabaseChannel);
    }
    liveChannel?.removeEventListener('message', handleLocalMessage);
  };
}

export function resetToDemoData() {
  localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(INITIAL_CLASSES));
  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(INITIAL_PROJECTS));
  localStorage.removeItem(STORAGE_KEYS.LIKED_PROJECTS);
  liveChannel?.postMessage({ type: 'RESET_DONE' });
}

// ---------------------------------------------------------
// Google Drive Link Converter & Batch Import Helper
// ---------------------------------------------------------
export function convertGoogleDriveUrl(url) {
  if (!url || typeof url !== 'string') return url;
  const trimmed = url.trim();

  // If already a direct image or local path, return as is
  if (trimmed.startsWith('/artworks/') || trimmed.startsWith('data:image')) {
    return trimmed;
  }

  // Pattern 1: https://drive.google.com/file/d/FILE_ID/...
  const matchFileD = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (matchFileD && matchFileD[1]) {
    return `https://lh3.googleusercontent.com/d/${matchFileD[1]}`;
  }

  // Pattern 2: id=FILE_ID
  const matchId = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (matchId && matchId[1]) {
    return `https://lh3.googleusercontent.com/d/${matchId[1]}`;
  }

  // Pattern 3: https://drive.google.com/open?id=FILE_ID
  const matchOpen = trimmed.match(/open\?id=([a-zA-Z0-9_-]+)/);
  if (matchOpen && matchOpen[1]) {
    return `https://lh3.googleusercontent.com/d/${matchOpen[1]}`;
  }

  return trimmed;
}

// Batch import multiple projects (e.g. from Spreadsheet / CSV / TSV)
export async function batchImportProjects(newProjectsList) {
  initLocalStore();
  const currentProjects = await fetchProjects();
  const currentClasses = await fetchClasses();

  const updatedProjects = [...currentProjects];
  const updatedClasses = [...currentClasses];

  for (const item of newProjectsList) {
    if (!item.title) continue;

    // Ensure class exists
    let classId = item.classId;
    if (!classId && item.className) {
      classId = item.className.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    }
    if (!classId) classId = 'umum';

    const existingClass = updatedClasses.find(c => c.id === classId || c.name.toLowerCase() === (item.className || '').toLowerCase());
    if (!existingClass) {
      const newClass = {
        id: classId,
        name: item.className || classId.toUpperCase(),
        displayOrder: updatedClasses.length + 1,
        description: `Kelas ${item.className || classId}`
      };
      updatedClasses.push(newClass);
      await saveClass(newClass);
    } else {
      classId = existingClass.id;
    }

    const projectId = item.id || `proj-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const formattedPoster = convertGoogleDriveUrl(item.posterUrl || '/artworks/poster1.jpg');

    const projectData = {
      id: projectId,
      classId,
      pieceNumber: String(item.pieceNumber || (updatedProjects.filter(p => p.classId === classId).length + 1)).padStart(2, '0'),
      title: item.title,
      creators: item.creators || 'Siswa SMAS Harapan',
      format: item.format || 'PNG',
      posterUrl: formattedPoster,
      gameUrl: item.gameUrl || '',
      description: item.description || '',
      likesCount: parseInt(item.likesCount, 10) || 0,
      displayOrder: item.displayOrder || (updatedProjects.length + 1),
      comments: []
    };

    const existingIdx = updatedProjects.findIndex(p => p.id === projectId);
    if (existingIdx >= 0) {
      updatedProjects[existingIdx] = { ...updatedProjects[existingIdx], ...projectData };
    } else {
      updatedProjects.push(projectData);
    }

    await saveProject(projectData);
  }

  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(updatedProjects));
  localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(updatedClasses));
  liveChannel?.postMessage({ type: 'BATCH_IMPORTED' });

  return { projects: updatedProjects, classes: updatedClasses };
}

