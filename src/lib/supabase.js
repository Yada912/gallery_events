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
  ? new BroadcastChannel('gemar_belajar_realtime')
  : null;

const STORAGE_KEYS = {
  CLASSES: 'gema_belajar_classes_v1',
  PROJECTS: 'gema_belajar_projects_v1',
  LIKED_PROJECTS: 'gema_belajar_user_likes_v1',
  ACCESS_KEYS: 'gema_belajar_access_keys_v1'
};

// Initialize localStorage with initial data only when Supabase is NOT configured
export function initLocalStore() {
  if (typeof window === 'undefined') return;
  if (isSupabaseConfigured) return;
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
      if (!error && data) {
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
// Comments Tree Structuring Helper
// ---------------------------------------------------------
export function organizeComments(rawComments) {
  if (!rawComments || !Array.isArray(rawComments)) return [];

  const normalized = [];
  const idMap = new Map();

  // 1. Flatten in case comments are already partially nested or coming from different sources
  const flatten = (items, fallbackParent = null) => {
    for (const item of items) {
      if (!item) continue;
      const id = String(item.id);
      const parentId = item.parentId || item.parent_id || (fallbackParent ? fallbackParent.id : null);
      const norm = {
        id,
        authorName: item.authorName || item.author_name || 'Anonim',
        content: item.content || '',
        createdAt: item.createdAt || (item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID') : 'Baru saja'),
        rawCreatedAt: item.created_at ? new Date(item.created_at).getTime() : (item.rawCreatedAt || 0),
        isCreator: Boolean(item.isCreator ?? item.is_creator),
        parentId: parentId ? String(parentId) : null,
        replyToAuthorName: item.replyToAuthorName || (fallbackParent ? fallbackParent.authorName : null),
        replies: []
      };
      normalized.push(norm);
      idMap.set(id, norm);

      if (Array.isArray(item.replies) && item.replies.length > 0) {
        flatten(item.replies, norm);
      }
    }
  };

  flatten(rawComments);

  // 2. Reconstruct clean hierarchy: root comments with nested replies
  const rootComments = [];

  for (const comment of normalized) {
    if (comment.parentId && idMap.has(comment.parentId)) {
      const parent = idMap.get(comment.parentId);
      if (!comment.replyToAuthorName) {
        comment.replyToAuthorName = parent.authorName;
      }
      // Attach under root thread ancestor for a clean, unified discussion branch
      let rootParent = parent;
      while (rootParent.parentId && idMap.has(rootParent.parentId)) {
        rootParent = idMap.get(rootParent.parentId);
      }
      if (!rootParent.replies.some(r => r.id === comment.id)) {
        rootParent.replies.push(comment);
      }
    } else {
      rootComments.push(comment);
    }
  }

  return rootComments;
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
      if (!error && data) {
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
          comments: organizeComments(item.comments || [])
        }));
      }
    } catch (err) {
      console.warn('Supabase fetchProjects error, using local fallback:', err);
    }
  }

  initLocalStore();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    const parsed = raw ? JSON.parse(raw) : INITIAL_PROJECTS;
    return parsed.map(p => ({
      ...p,
      comments: organizeComments(p.comments || [])
    }));
  } catch {
    return INITIAL_PROJECTS.map(p => ({
      ...p,
      comments: organizeComments(p.comments || [])
    }));
  }
}

export async function saveProject(projectData) {
  initLocalStore();
  const current = await fetchProjects();

  // Automatic sequential pieceNumber calculation if not provided
  let pieceNumber = projectData.pieceNumber;
  if (!pieceNumber) {
    const classProjects = current.filter(p => p.classId === projectData.classId && p.id !== projectData.id);
    const existing = current.find(p => p.id === projectData.id);
    if (existing && existing.pieceNumber) {
      pieceNumber = existing.pieceNumber;
    } else {
      pieceNumber = String(classProjects.length + 1).padStart(2, '0');
    }
  }

  const finalProject = {
    ...projectData,
    pieceNumber,
    format: projectData.format || 'WEBP'
  };

  if (isSupabaseConfigured) {
    try {
      await supabase.from('projects').upsert({
        id: finalProject.id,
        class_id: finalProject.classId,
        piece_number: finalProject.pieceNumber,
        title: finalProject.title,
        creators: finalProject.creators,
        format: finalProject.format,
        poster_url: finalProject.posterUrl,
        game_url: finalProject.gameUrl || '',
        description: finalProject.description || '',
        likes_count: finalProject.likesCount || 0,
        display_order: finalProject.displayOrder || 0
      });
    } catch (err) {
      console.error('Supabase saveProject error:', err);
    }
  }

  const index = current.findIndex(p => p.id === finalProject.id);
  let updated;
  if (index >= 0) {
    updated = [...current];
    updated[index] = { ...updated[index], ...finalProject };
  } else {
    updated = [...current, finalProject];
  }
  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(updated));
  liveChannel?.postMessage({ type: 'PROJECTS_UPDATED', projectId: finalProject.id });
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
  } catch { }

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
      // 1. Try atomic database RPC (prevents race conditions and lost updates)
      const { data: rpcCount, error: rpcError } = await supabase.rpc('increment_project_like', {
        p_project_id: projectId,
        p_delta: delta
      });

      if (!rpcError && typeof rpcCount === 'number') {
        newCount = rpcCount;
        project.likesCount = newCount;
      } else {
        // 2. Graceful fallback to column update if RPC is not yet applied
        await supabase
          .from('projects')
          .update({ likes_count: newCount })
          .eq('id', projectId);
      }
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

export async function addCommentToProject(projectId, { authorName, content, isCreator = false, parentId = null, replyToAuthorName = null }) {
  const newComment = {
    id: `c-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    authorName: authorName.trim() || 'Anonim',
    content: content.trim(),
    createdAt: 'Baru saja',
    isCreator,
    parentId: parentId ? String(parentId) : null,
    replyToAuthorName: replyToAuthorName || null,
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
    project.comments = organizeComments([...(project.comments || []), newComment]);
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

// ---------------------------------------------------------
// Client-side High-efficiency Image Compressor (WebP)
// Automatically scales large camera/render images to max 1600px
// and encodes to lightweight WebP (~100-150KB) so ~70 projects take <12MB
// ---------------------------------------------------------
export async function compressImageToWebP(file, maxDimension = 1600, quality = 0.82) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type || !file.type.startsWith('image/')) {
      return reject(new Error('Berkas bukan format gambar yang valid.'));
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Maintain aspect ratio while bounding within maxDimension
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Try WebP first, fallback to JPEG if browser doesn't support WebP export
        let dataUrl = canvas.toDataURL('image/webp', quality);
        let actualFormat = 'WEBP';
        if (!dataUrl.startsWith('data:image/webp')) {
          dataUrl = canvas.toDataURL('image/jpeg', quality);
          actualFormat = 'JPEG';
        }

        const originalSizeKb = Math.round(file.size / 1024);
        const compressedSizeKb = Math.round((dataUrl.length * (3 / 4)) / 1024);

        resolve({
          dataUrl,
          width,
          height,
          originalSizeKb,
          compressedSizeKb,
          format: actualFormat
        });
      };
      img.onerror = () => reject(new Error('Gagal memuat gambar untuk proses kompresi.'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('Gagal membaca berkas gambar.'));
    reader.readAsDataURL(file);
  });
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
      format: item.format || 'WEBP',
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

// ---------------------------------------------------------
// Access Keys & Group Tokens API
// Each group has a unique 6-digit token and only 1 chance to input their work
// ---------------------------------------------------------
export async function fetchAccessKeys() {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('access_keys')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) {
        return data.map(k => ({
          key: k.key,
          classId: k.class_id || '',
          groupName: k.group_name || '',
          projectId: k.project_id || '',
          isUsed: k.is_used,
          usedAt: k.used_at ? new Date(k.used_at).toLocaleString('id-ID') : null,
          createdAt: new Date(k.created_at).toLocaleString('id-ID')
        }));
      }
    } catch (err) {
      console.warn('Supabase fetchAccessKeys error:', err);
    }
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACCESS_KEYS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Register a single group token
export async function createGroupToken({ classId, groupName }) {
  const current = await fetchAccessKeys();
  const existingSet = new Set(current.map(k => k.key));
  let candidate = '';
  do {
    candidate = String(Math.floor(100000 + Math.random() * 900000));
  } while (existingSet.has(candidate));

  const newToken = {
    key: candidate,
    classId: classId || '',
    groupName: groupName || '',
    projectId: '',
    isUsed: false,
    usedAt: null,
    createdAt: new Date().toLocaleString('id-ID')
  };

  if (isSupabaseConfigured) {
    try {
      await supabase.from('access_keys').insert([{
        key: newToken.key,
        class_id: newToken.classId || null,
        group_name: newToken.groupName,
        is_used: false,
        used_at: null,
        project_id: ''
      }]);
    } catch (err) {
      console.warn('Supabase createGroupToken error:', err);
    }
  }

  const combined = [newToken, ...current];
  localStorage.setItem(STORAGE_KEYS.ACCESS_KEYS, JSON.stringify(combined));
  liveChannel?.postMessage({ type: 'ACCESS_KEYS_UPDATED' });
  return combined;
}

// Bulk register group tokens from list (e.g. paste from spreadsheet or multi-group entry)
export async function bulkCreateGroupTokens(groupsList) {
  const current = await fetchAccessKeys();
  const existingSet = new Set(current.map(k => k.key));
  const newTokens = [];

  for (const item of groupsList) {
    let candidate = '';
    do {
      candidate = String(Math.floor(100000 + Math.random() * 900000));
    } while (existingSet.has(candidate));
    existingSet.add(candidate);

    newTokens.push({
      key: candidate,
      classId: item.classId || '',
      groupName: item.groupName || 'Kelompok Siswa',
      projectId: '',
      isUsed: false,
      usedAt: null,
      createdAt: new Date().toLocaleString('id-ID')
    });
  }

  if (isSupabaseConfigured) {
    try {
      const dbPayload = newTokens.map(t => ({
        key: t.key,
        class_id: t.classId || null,
        group_name: t.groupName,
        is_used: false,
        used_at: null,
        project_id: ''
      }));
      for (let i = 0; i < dbPayload.length; i += 50) {
        await supabase.from('access_keys').insert(dbPayload.slice(i, i + 50));
      }
    } catch (err) {
      console.warn('Supabase bulkCreateGroupTokens error:', err);
    }
  }

  const combined = [...newTokens, ...current];
  localStorage.setItem(STORAGE_KEYS.ACCESS_KEYS, JSON.stringify(combined));
  liveChannel?.postMessage({ type: 'ACCESS_KEYS_UPDATED' });
  return combined;
}

// 1-Click generator for all classes (e.g. 10 groups per class x 7 classes = 70 tokens)
export async function generateTokensForAllClasses(classesList, countPerClass = 10) {
  const current = await fetchAccessKeys();
  const existingSet = new Set(current.map(k => k.key));
  const newTokens = [];

  for (const cls of classesList) {
    for (let i = 1; i <= countPerClass; i++) {
      let candidate = '';
      do {
        candidate = String(Math.floor(100000 + Math.random() * 900000));
      } while (existingSet.has(candidate));
      existingSet.add(candidate);

      newTokens.push({
        key: candidate,
        classId: cls.id,
        groupName: `Kelompok ${i}`,
        projectId: '',
        isUsed: false,
        usedAt: null,
        createdAt: new Date().toLocaleString('id-ID')
      });
    }
  }

  if (isSupabaseConfigured) {
    try {
      const dbPayload = newTokens.map(t => ({
        key: t.key,
        class_id: t.classId || null,
        group_name: t.groupName,
        is_used: false,
        used_at: null,
        project_id: ''
      }));
      for (let i = 0; i < dbPayload.length; i += 50) {
        await supabase.from('access_keys').insert(dbPayload.slice(i, i + 50));
      }
    } catch (err) {
      console.warn('Supabase generateTokensForAllClasses error:', err);
    }
  }

  const combined = [...newTokens, ...current];
  localStorage.setItem(STORAGE_KEYS.ACCESS_KEYS, JSON.stringify(combined));
  liveChannel?.postMessage({ type: 'ACCESS_KEYS_UPDATED' });
  return combined;
}

// Verify group token without consuming it (forward student to their group form)
export async function verifyGroupToken(inputKey) {
  const cleanKey = String(inputKey || '').trim();
  if (!cleanKey || cleanKey.length !== 6 || !/^\d{6}$/.test(cleanKey)) {
    return { valid: false, message: 'Kunci akses harus berupa 6 digit angka.' };
  }

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('access_keys')
        .select('*')
        .eq('key', cleanKey)
        .maybeSingle();

      if (!error && data) {
        if (data.is_used) {
          return {
            valid: false,
            message: `Kunci akses ini sudah digunakan pada ${new Date(data.used_at).toLocaleString('id-ID')}. Setiap kelompok hanya memiliki 1 kali kesempatan input karya.`
          };
        }
        return {
          valid: true,
          token: {
            key: data.key,
            classId: data.class_id,
            groupName: data.group_name,
            projectId: data.project_id || ''
          }
        };
      }
    } catch (err) {
      console.warn('Supabase verifyGroupToken error:', err);
    }
  }

  // Fallback to local
  const current = await fetchAccessKeys();
  const match = current.find(k => k.key === cleanKey);
  if (!match) {
    return { valid: false, message: 'Kunci akses tidak terdaftar. Periksa kembali 6 digit kode dari panitia.' };
  }
  if (match.isUsed) {
    return {
      valid: false,
      message: `Kunci akses ini sudah digunakan pada ${match.usedAt || 'sebelumnya'}. Setiap kelompok hanya memiliki 1 kali kesempatan input karya.`
    };
  }

  return {
    valid: true,
    token: {
      key: match.key,
      classId: match.classId,
      groupName: match.groupName,
      projectId: match.projectId || ''
    }
  };
}

// Consume group token once the student successfully submits their work
export async function consumeGroupToken(inputKey, projectId = '') {
  const cleanKey = String(inputKey || '').trim();
  if (isSupabaseConfigured) {
    try {
      await supabase
        .from('access_keys')
        .update({
          is_used: true,
          used_at: new Date().toISOString(),
          project_id: projectId
        })
        .eq('key', cleanKey);
    } catch (err) {
      console.warn('Supabase consumeGroupToken error:', err);
    }
  }

  const current = await fetchAccessKeys();
  const updated = current.map(k => k.key === cleanKey ? {
    ...k,
    isUsed: true,
    usedAt: new Date().toLocaleString('id-ID'),
    projectId
  } : k);
  localStorage.setItem(STORAGE_KEYS.ACCESS_KEYS, JSON.stringify(updated));
  liveChannel?.postMessage({ type: 'ACCESS_KEYS_UPDATED' });
  return updated;
}

// Standard standalone / free-floating key generator (for emergency edits / slipped additions)
export async function generateAccessKeys(count = 10, label = 'Kunci Standalone / Bebas') {
  const current = await fetchAccessKeys();
  const existingSet = new Set(current.map(k => k.key));
  const newKeys = [];

  for (let i = 0; i < count; i++) {
    let candidate = '';
    do {
      candidate = String(Math.floor(100000 + Math.random() * 900000));
    } while (existingSet.has(candidate));

    existingSet.add(candidate);
    newKeys.push({
      key: candidate,
      classId: '',
      groupName: label,
      projectId: '',
      isUsed: false,
      usedAt: null,
      createdAt: new Date().toLocaleString('id-ID')
    });
  }

  if (isSupabaseConfigured) {
    try {


      const dbPayload = newKeys.map(k => ({
        key: k.key,
        class_id: null,
        group_name: k.groupName,
        is_used: false,
        used_at: null,
        project_id: ''
      }));
      await supabase.from('access_keys').insert(dbPayload);
    } catch (err) {
      console.warn('Supabase key insert error:', err);
    }
  }

  const combined = [...newKeys, ...current];
  localStorage.setItem(STORAGE_KEYS.ACCESS_KEYS, JSON.stringify(combined));
  liveChannel?.postMessage({ type: 'ACCESS_KEYS_UPDATED' });
  return combined;
}

export async function validateAndConsumeAccessKey(inputKey, usedFor = '') {
  const verified = await verifyGroupToken(inputKey);
  if (!verified.valid) return verified;
  await consumeGroupToken(inputKey, usedFor);
  return { valid: true, key: inputKey };
}

export async function deleteAccessKey(key) {
  if (isSupabaseConfigured) {
    try {
      await supabase.from('access_keys').delete().eq('key', key);
    } catch { }
  }
  const current = await fetchAccessKeys();
  const updated = current.filter(k => k.key !== key);
  localStorage.setItem(STORAGE_KEYS.ACCESS_KEYS, JSON.stringify(updated));
  liveChannel?.postMessage({ type: 'ACCESS_KEYS_UPDATED' });
  return updated;
}

export async function clearUsedAccessKeys() {
  if (isSupabaseConfigured) {
    try {
      await supabase.from('access_keys').delete().eq('is_used', true);
    } catch { }
  }
  const current = await fetchAccessKeys();
  const updated = current.filter(k => !k.isUsed);
  localStorage.setItem(STORAGE_KEYS.ACCESS_KEYS, JSON.stringify(updated));
  liveChannel?.postMessage({ type: 'ACCESS_KEYS_UPDATED' });
  return updated;
}

// Clear all demo/mock data and empty database projects/comments
export async function clearAllDatabaseAndDemoData() {
  if (isSupabaseConfigured) {
    try {
      await supabase.from('comments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('projects').delete().neq('id', '__none__');
    } catch (err) {
      console.error('Supabase clear projects error:', err);
    }
  }
  localStorage.removeItem(STORAGE_KEYS.PROJECTS);
  localStorage.removeItem(STORAGE_KEYS.LIKED_PROJECTS);
  liveChannel?.postMessage({ type: 'PROJECTS_UPDATED' });
}


