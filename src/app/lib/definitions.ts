export type User = {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  token: string;
};

export type Note = {
  id: string;
  title: string;
  content: string;
  user_id: string;
  is_public?: boolean;
  public_id?: string;
  created_at?: Date;
  updated_at?: Date;
};

export type DraftNote = {
  id: string;
  title: string;
  content: string;
  created_at: Date;
  updated_at: Date;
  isDraft: true;
};

export type NoteOrDraft = Note | DraftNote;
