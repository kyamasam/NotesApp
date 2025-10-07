import type { Note } from './definitions';

export interface DraftNote {
  id: string;
  title: string;
  content: string;
  created_at: Date;
  updated_at: Date;
  isDraft: true;
}

const DRAFT_NOTES_KEY = 'notes_app_drafts';

export const localStorageUtils = {
  getDraftNotes: (): DraftNote[] => {
    if (typeof window === 'undefined') return [];

    try {
      const stored = localStorage.getItem(DRAFT_NOTES_KEY);
      if (!stored) return [];

      const drafts = JSON.parse(stored);
      return drafts.map((draft: any) => ({
        ...draft,
        created_at: new Date(draft.created_at),
        updated_at: new Date(draft.updated_at),
        isDraft: true,
      }));
    } catch (error) {
      console.error('Error loading draft notes:', error);
      return [];
    }
  },

  saveDraftNote: (note: Omit<DraftNote, 'isDraft'>): void => {
    if (typeof window === 'undefined') return;

    try {
      const drafts = localStorageUtils.getDraftNotes();
      const existingIndex = drafts.findIndex(draft => draft.id === note.id);

      const draftNote: DraftNote = { ...note, isDraft: true };

      if (existingIndex >= 0) {
        drafts[existingIndex] = draftNote;
      } else {
        drafts.unshift(draftNote);
      }

      localStorage.setItem(DRAFT_NOTES_KEY, JSON.stringify(drafts));
    } catch (error) {
      console.error('Error saving draft note:', error);
    }
  },

  deleteDraftNote: (noteId: string): void => {
    if (typeof window === 'undefined') return;

    try {
      const drafts = localStorageUtils.getDraftNotes();
      const filtered = drafts.filter(draft => draft.id !== noteId);
      localStorage.setItem(DRAFT_NOTES_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting draft note:', error);
    }
  },

  clearAllDrafts: (): void => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem(DRAFT_NOTES_KEY);
    } catch (error) {
      console.error('Error clearing draft notes:', error);
    }
  },

  generateId: (): string => {
    return `draft-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  },
};