"use client";

import { Cloud, CloudOff, Share2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { DraftNote, Note, NoteOrDraft } from "../lib/definitions";
import { localStorageUtils } from "../lib/localStorage";
import GoogleLoginButton from "./GoogleLoginButton";
import SharePopup from "./SharePopup";
import Sidebar from "./SideBar";
import TipTapEditor from "./TipTapEditor";
const SYNC_STATUS = {
  SYNCED: "synced",
  PENDING: "pending",
  SYNCING: "syncing",
} as const;

type SyncStatus = (typeof SYNC_STATUS)[keyof typeof SYNC_STATUS];

interface NotesAppProps {
  user?: any;
  onLogin?: () => void;
}

export default function NotesApp({ user, onLogin }: NotesAppProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [notes, setNotes] = useState<NoteOrDraft[]>([]);
  const [selectedNote, setSelectedNote] = useState<NoteOrDraft | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(SYNC_STATUS.SYNCED);
  const [showSharePopup, setShowSharePopup] = useState(false);
  const saveTimer = useRef<NodeJS.Timeout | null>(null);
  const pendingChanges = useRef<{ title?: string; content?: string }>({});
  const syncWaitTime = 3000; // 30 seconds

  useEffect(() => {
    fetchNotes();
  }, []);

  // Migration effect: when user logs in, migrate draft notes to database
  useEffect(() => {
    if (user) {
      migrateDraftNotes();
    }
  }, [user]);

  const migrateDraftNotes = async () => {
    try {
      const draftNotes = localStorageUtils.getDraftNotes();

      if (draftNotes.length === 0) return;

      setSyncStatus(SYNC_STATUS.SYNCING);

      // Create each draft note in the database
      const migratedNotes: Note[] = [];

      for (const draft of draftNotes) {
        try {
          const response = await fetch("/api/notes", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              title: draft.title,
              content: draft.content,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            migratedNotes.push(data.note);
          }
        } catch (error) {
          console.error("Error migrating draft note:", error);
        }
      }

      // Clear localStorage drafts after successful migration
      if (migratedNotes.length > 0) {
        localStorageUtils.clearAllDrafts();

        // Refresh notes list to show migrated notes
        await fetchNotes();

        console.log(
          `Successfully migrated ${migratedNotes.length} draft notes to your account`
        );
      }

      setSyncStatus(SYNC_STATUS.SYNCED);
    } catch (error) {
      console.error("Error during draft migration:", error);
      setSyncStatus(SYNC_STATUS.SYNCED);
    }
  };

  const selectNote = useCallback(
    (note: NoteOrDraft | null) => {
      if (note?.id === selectedNote?.id) return; // Prevent unnecessary updates
      setSelectedNote(note);
      if (note) {
        router.push(`?noteId=${note.id}`, { scroll: false });
      } else {
        router.push("/", { scroll: false });
      }
    },
    [router, selectedNote?.id]
  );

  useEffect(() => {
    const noteId = searchParams.get("noteId");
    if (noteId && notes.length > 0 && selectedNote?.id !== noteId) {
      const note = notes.find((n) => n.id === noteId);
      if (note) {
        setSelectedNote(note);
      }
    }
  }, [searchParams, notes, selectedNote?.id]);

  const fetchNotes = async () => {
    try {
      let apiNotes: Note[] = [];

      // Fetch notes from API if user is logged in
      if (user) {
        const response = await fetch("/api/notes");
        if (response.ok) {
          const data = await response.json();
          apiNotes = data.notes || [];
        }
      }

      // Always load draft notes from localStorage
      const draftNotes = localStorageUtils.getDraftNotes();

      // Combine API notes and draft notes
      const allNotes = [...apiNotes, ...draftNotes];
      setNotes(allNotes);
    } catch (error) {
      console.error("Error fetching notes:", error);
      // If API fails, still show draft notes
      const draftNotes = localStorageUtils.getDraftNotes();
      setNotes(draftNotes);
    } finally {
      setLoading(false);
    }
  };

  const createNewNote = async () => {
    try {
      setSyncStatus(SYNC_STATUS.SYNCING);

      if (user) {
        // User is logged in - save to API
        const response = await fetch("/api/notes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: "Untitled Note",
            content: "",
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const newNote = data.note;
          setNotes([newNote, ...notes]);
          selectNote(newNote);
          setSyncStatus(SYNC_STATUS.SYNCED);
        }
      } else {
        // User is not logged in - save to localStorage
        const newDraft: DraftNote = {
          id: localStorageUtils.generateId(),
          title: "Untitled Note",
          content: "",
          created_at: new Date(),
          updated_at: new Date(),
          isDraft: true,
        };

        localStorageUtils.saveDraftNote(newDraft);
        setNotes([newDraft, ...notes]);
        selectNote(newDraft);
        setSyncStatus(SYNC_STATUS.SYNCED);
      }
    } catch (error) {
      console.error("Error creating note:", error);
      setSyncStatus(SYNC_STATUS.SYNCED);
    }
  };

  const saveNote = useCallback(
    async (noteId: string, updates: { title?: string; content?: string }) => {
      setSyncStatus(SYNC_STATUS.SYNCING);
      try {
        const noteToUpdate = notes.find((note) => note.id === noteId);

        if (noteToUpdate && "isDraft" in noteToUpdate) {
          // This is a draft note - save to localStorage
          const updatedDraft: DraftNote = {
            ...noteToUpdate,
            ...updates,
            updated_at: new Date(),
          };

          localStorageUtils.saveDraftNote(updatedDraft);
          setSyncStatus(SYNC_STATUS.SYNCED);
          pendingChanges.current = {};

          setNotes((prevNotes) =>
            prevNotes.map((note) => (note.id === noteId ? updatedDraft : note))
          );
        } else if (user) {
          // This is a regular note and user is logged in - save to API
          const response = await fetch(`/api/notes/${noteId}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updates),
          });

          if (response.ok) {
            const data = await response.json();
            const updatedNote = data.note;
            setSyncStatus(SYNC_STATUS.SYNCED);
            pendingChanges.current = {};

            setNotes((prevNotes) =>
              prevNotes.map((note) => (note.id === noteId ? updatedNote : note))
            );
          } else {
            throw new Error("Failed to update note");
          }
        }
      } catch (error) {
        console.error("Error updating note:", error);
        setSyncStatus(SYNC_STATUS.SYNCED);
      }
    },
    [notes, user]
  );
  useEffect(() => {
    const intervalId = setInterval(() => {
      console.log("again", pendingChanges);
      // Action runs every X seconds regardless of changes
      if (selectedNote && Object.keys(pendingChanges.current).length > 0) {
        saveNote(selectedNote.id, pendingChanges.current);
      }
    }, syncWaitTime); // Every 30 seconds

    return () => clearInterval(intervalId);
  }, [selectedNote, saveNote]);
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        // Save immediately when tab becomes hidden
        if (selectedNote && Object.keys(pendingChanges.current).length > 0) {
          // Use sendBeacon for reliable save on page unload
          const data = JSON.stringify({
            ...pendingChanges.current,
          });
          navigator.sendBeacon(`/api/notes/${selectedNote.id}`, data);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [selectedNote]);

  const scheduleAutoSave = useCallback(
    (noteId: string, updates: { title?: string; content?: string }) => {
      // Update pending changes
      pendingChanges.current = { ...pendingChanges.current, ...updates };

      // Clear existing timer
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
      }

      // Set status to pending
      setSyncStatus(SYNC_STATUS.PENDING);

      // Schedule save after 30 seconds
      saveTimer.current = setTimeout(() => {
        if (Object.keys(pendingChanges.current).length > 0) {
          saveNote(noteId, pendingChanges.current);
        }
      }, syncWaitTime);
    },
    [saveNote, syncWaitTime]
  );

  const saveNow = useCallback(() => {
    if (selectedNote && Object.keys(pendingChanges.current).length > 0) {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
      }
      saveNote(selectedNote.id, pendingChanges.current);
    }
  }, [selectedNote, saveNote]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        saveNow();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
      }
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [saveNow]);
  useEffect(() => {
    // Warn before leaving if there are unsaved changes
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (Object.keys(pendingChanges.current).length > 0) {
        e.preventDefault();
        e.returnValue = ""; // Chrome requires returnValue to be set
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const handleShareNote = async (noteId: string): Promise<{ publicUrl: string; publicId: string }> => {
    const response = await fetch(`/api/notes/${noteId}/share`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to share note');
    }

    const data = await response.json();

    // Update the note in the local state
    setNotes(prevNotes =>
      prevNotes.map(note =>
        note.id === noteId
          ? { ...note, is_public: true, public_id: data.publicId }
          : note
      )
    );

    // Update selected note if it's the one being shared
    if (selectedNote?.id === noteId) {
      setSelectedNote(prev => prev ? { ...prev, is_public: true, public_id: data.publicId } : null);
    }

    return data;
  };

  const handleUnshareNote = async (noteId: string): Promise<void> => {
    const response = await fetch(`/api/notes/${noteId}/share`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to unshare note');
    }

    // Update the note in the local state
    setNotes(prevNotes =>
      prevNotes.map(note =>
        note.id === noteId
          ? { ...note, is_public: false, public_id: undefined }
          : note
      )
    );

    // Update selected note if it's the one being unshared
    if (selectedNote?.id === noteId) {
      setSelectedNote(prev => prev ? { ...prev, is_public: false, public_id: undefined } : null);
    }
  };

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        notes={notes}
        selectedNote={selectedNote}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onSelectNote={selectNote}
        onCreateNote={createNewNote}
        loading={loading}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedNote ? (
          <>
            {/* Note Header */}
            <div className="p-6 border-b  border-gray-300 bg-white flex gap-2 items-center justify-between">
              <input
                type="text"
                value={selectedNote.title}
                onChange={(e) => {
                  const newTitle = e.target.value;
                  setSelectedNote({ ...selectedNote, title: newTitle });
                  scheduleAutoSave(selectedNote.id, { title: newTitle });
                }}
                className="text-3xl font-bold flex-1 bg-transparent border-none outline-none text-gray-900 placeholder-gray-500 mr-4"
                placeholder="Note title..."
              />
              {/* Actions and Sync Status */}
              <div className="flex items-center gap-4 text-sm">
                {/* Share Button - only show for regular notes (not drafts) and when user is logged in */}
                {user && selectedNote && !("isDraft" in selectedNote) && (
                  <button
                    onClick={() => setShowSharePopup(true)}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    title="Share note"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share</span>
                  </button>
                )}
                <div className="flex items-center gap-2">
                  {selectedNote && "isDraft" in selectedNote ? (
                    // Draft note status
                    <>
                      {syncStatus === SYNC_STATUS.SYNCED && (
                        <>
                          <Cloud className="w-5 h-5 text-blue-600" />
                          <span className="text-blue-600 font-medium">
                            Draft saved locally. Sign in to save
                          </span>
                        </>
                      )}
                      {syncStatus === SYNC_STATUS.PENDING && (
                        <>
                          <CloudOff className="w-5 h-5 text-orange-600" />
                          <span className="text-orange-600 font-medium">
                            Saving draft locally...
                          </span>
                        </>
                      )}
                      {syncStatus === SYNC_STATUS.SYNCING && (
                        <>
                          <Cloud className="w-5 h-5 text-blue-600 animate-pulse" />
                          <span className="text-blue-600 font-medium">
                            Saving draft...
                          </span>
                        </>
                      )}
                    </>
                  ) : (
                    // Regular note status
                    <>
                      {syncStatus === SYNC_STATUS.SYNCED && (
                        <>
                          <Cloud className="w-5 h-5 text-green-600" />
                          <span className="text-green-600 font-medium">
                            All changes saved
                          </span>
                        </>
                      )}
                      {syncStatus === SYNC_STATUS.PENDING && (
                        <>
                          <CloudOff className="w-5 h-5 text-yellow-600" />
                          <span className="text-yellow-600 font-medium">
                            Auto-saving in {syncWaitTime / 1000}s
                          </span>
                        </>
                      )}
                      {syncStatus === SYNC_STATUS.SYNCING && (
                        <>
                          <Cloud className="w-5 h-5 text-blue-600 animate-pulse" />
                          <span className="text-blue-600 font-medium">
                            Saving...
                          </span>
                        </>
                      )}
                    </>
                  )}
                </div>
                {syncStatus === SYNC_STATUS.PENDING && (
                  <div className="text-xs text-gray-600 border border-gray-400 rounded px-2 py-1">
                    <span className="font-mono">
                      {navigator.userAgent.toLowerCase().includes("mac")
                        ? "⌘S"
                        : "Ctrl+S"}
                    </span>{" "}
                    to save now
                  </div>
                )}
              </div>
              {!user && <GoogleLoginButton />}
            </div>

            {/* Note Content */}
            <div className="flex-1 overflow-hidden">
              <TipTapEditor
                key={selectedNote.id}
                content={selectedNote.content}
                onChange={(content) => {
                  setSelectedNote({ ...selectedNote, content });
                  scheduleAutoSave(selectedNote.id, { content });
                }}
                placeholder="Start typing your note..."
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-600 max-w-md mx-auto p-8">
              <div className="text-6xl mb-4">📝</div>
              <h2 className="text-xl font-medium mb-2 text-gray-900">
                Welcome to Notes
              </h2>
              {!user ? (
                <>
                  <p className="text-gray-500 mb-4">
                    Start creating notes right away! Your notes will be saved
                    locally and automatically moved to your account when you
                    sign in.
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-blue-800">
                      💡 <strong>Tip:</strong> Click "New Note" to create your
                      first note. No sign-in required!
                    </p>
                  </div>
                </>
              ) : (
                <p className="text-gray-500">
                  Choose a note from the sidebar or create a new one
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Share Popup */}
      {selectedNote && !("isDraft" in selectedNote) && (
        <SharePopup
          note={selectedNote}
          isOpen={showSharePopup}
          onClose={() => setShowSharePopup(false)}
          onShare={handleShareNote}
          onUnshare={handleUnshareNote}
        />
      )}
    </div>
  );
}
