// Notes Database Management

export const getNotesDB = (userId) => {
  if (!userId) return [];
  const db = localStorage.getItem(`relearn_notes_${userId}`);
  return db ? JSON.parse(db) : [];
};

export const saveNotesDB = (userId, notesArray) => {
  if (!userId) return;
  localStorage.setItem(`relearn_notes_${userId}`, JSON.stringify(notesArray));
};

export const createNote = (userId, title, extractedText) => {
  const notes = getNotesDB(userId);
  const newNote = {
    id: `note_${Date.now()}`,
    createdAt: new Date().toISOString(),
    title: title || 'Untitled Note',
    extractedText,
    summary: null,
    flashcards: null,
    quiz: null,
    revisionPlan: null,
    studyGuide: null,
    keyConcepts: null,
    explanations: null,
    analysis: null,
    examQuestions: null
  };
  notes.unshift(newNote); // Add to beginning
  saveNotesDB(userId, notes);
  return newNote;
};

export const updateNoteField = (userId, noteId, fieldName, data) => {
  const notes = getNotesDB(userId);
  const noteIndex = notes.findIndex(n => n.id === noteId);
  if (noteIndex > -1) {
    notes[noteIndex][fieldName] = data;
    notes[noteIndex].lastModified = new Date().toISOString();
    saveNotesDB(userId, notes);
    return notes[noteIndex];
  }
  return null;
};

export const getNoteById = (userId, noteId) => {
  const notes = getNotesDB(userId);
  return notes.find(n => n.id === noteId) || null;
};

export const deleteNote = (userId, noteId) => {
  const notes = getNotesDB(userId);
  const filtered = notes.filter(n => n.id !== noteId);
  saveNotesDB(userId, filtered);
  return filtered;
};
