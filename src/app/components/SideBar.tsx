import {
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  Search,
  Trophy,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import type { NoteOrDraft } from "../lib/definitions";
import GoogleLoginButton from "./GoogleLoginButton";

dayjs.extend(relativeTime);

interface SidebarProps {
  notes: NoteOrDraft[];
  selectedNote: NoteOrDraft | null;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onSelectNote: (note: NoteOrDraft | null) => void;
  onCreateNote: () => void;
  loading: boolean;
}

const Sidebar = ({
  notes,
  selectedNote,
  searchTerm,
  onSearchChange,
  onSelectNote,
  onCreateNote,
  loading,
}: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const router = useRouter();

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div
      className={`bg-white border-r border-gray-300 flex flex-col transition-all duration-300 relative ${
        isCollapsed ? "w-16" : "w-80"
      }`}
    >
      {/* Collapse Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute top-4 right-2 bg-gray-100 border border-gray-300 rounded-lg p-2 hover:bg-gray-200 z-10 shadow-sm transition-colors"
        title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? (
          <ChevronRight className="w-5 h-5 text-gray-700" />
        ) : (
          <ChevronLeft className="w-5 h-5 text-gray-700" />
        )}
      </button>

      {!isCollapsed ? (
        <>
          {/* Header */}
          <div className="p-4 border-b border-gray-300">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Notes</h1>

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input
                type="text"
                placeholder="Search notes..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900 placeholder-gray-500"
              />
            </div>

            {/* New Note Button */}
            <button
              onClick={onCreateNote}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium mb-3"
            >
              <PlusCircle className="w-5 h-5" />
              New Note
            </button>
          </div>

          {/* Notes List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-600">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                Loading notes...
              </div>
            ) : filteredNotes.length === 0 ? (
              <div className="p-6 text-center text-gray-600">
                {notes.length === 0
                  ? "No notes yet. Create your first note!"
                  : "No notes match your search."}
              </div>
            ) : (
              filteredNotes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => onSelectNote(note)}
                  className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedNote?.id === note.id
                      ? "bg-blue-50 border-l-4 border-l-blue-600"
                      : ""
                  }`}
                >
                  <div className="font-semibold text-gray-900 truncate mb-1 flex items-center gap-2">
                    {note.title || "Untitled Note"}
                    {"isDraft" in note && (
                      <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                        Draft
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-700 line-clamp-2">
                    {note.content
                      ? note.content.replace(/<[^>]*>/g, "") || "No content..."
                      : "No content..."}
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    {note.created_at
                      ? dayjs(note.created_at).fromNow()
                      : "just now"}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        /* Collapsed View */
        <div className="flex flex-col items-center py-4 gap-4">
          <button
            onClick={onCreateNote}
            className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            title="New Note"
          >
            <PlusCircle className="w-5 h-5" />
          </button>
          <button
            onClick={() => router.push("/leaderboard")}
            className="p-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            title="Leaderboard"
          >
            <Trophy className="w-5 h-5" />
          </button>
          <div className="flex-1 overflow-y-auto w-full">
            {filteredNotes.map((note) => (
              <div
                key={note.id}
                onClick={() => onSelectNote(note)}
                className={`p-3 cursor-pointer hover:bg-gray-50 transition-colors flex items-center justify-center ${
                  selectedNote?.id === note.id
                    ? "bg-blue-50 border-l-4 border-l-blue-600"
                    : ""
                }`}
                title={note.title || "Untitled Note"}
              >
                <div className="w-2 h-2 rounded-full bg-gray-400"></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* User info - always visible */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-300 flex flex-col gap-2">
          {/* Leaderboard Button */}
          <button
            onClick={() => window.open("/leaderboard")}
            className="w-full cursor-pointer flex items-center justify-center gap-2 bg-purple-600 text-white px-4 py-2.5 rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            <Trophy className="w-5 h-5" />
            Leaderboard
          </button>

          <GoogleLoginButton />
        </div>
      )}
    </div>
  );
};

export default Sidebar;
