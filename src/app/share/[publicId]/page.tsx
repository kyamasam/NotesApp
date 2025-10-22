"use client";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Clock, ExternalLink, User } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { Note } from "../../lib/definitions";

dayjs.extend(relativeTime);

interface PublicNote extends Note {
  author_name: string;
}

export default function PublicNotePage() {
  const params = useParams();
  const publicId = params.publicId as string;
  const [note, setNote] = useState<PublicNote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const response = await fetch(`/api/public/${publicId}`);
        if (response.ok) {
          const data = await response.json();
          setNote(data.note);
        } else if (response.status === 404) {
          setError("Note not found or no longer public");
        } else {
          setError("Failed to load note");
        }
      } catch (err) {
        setError("Failed to load note");
      } finally {
        setLoading(false);
      }
    };

    if (publicId) {
      fetchNote();
    }
  }, [publicId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading note...</p>
        </div>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Note Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            {error ||
              "This note doesn't exist or is no longer publicly shared."}
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Create Your Own Notes
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 ">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">📝</span>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  Public Note
                </h1>
                <p className="text-sm text-gray-500">Read-only view</p>
              </div>
            </div>
            <a
              href="/"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <ExternalLink className="w-4 h-4" />
              Create Your Own
            </a>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Note Header */}
          <div className="px-8 py-6 border-b border-gray-200">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {note.title || "Untitled Note"}
            </h1>
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>By {note.author_name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>
                  Created{" "}
                  {note.created_at
                    ? dayjs(note.created_at).fromNow()
                    : "recently"}
                </span>
              </div>
            </div>
          </div>

          {/* Note Content */}
          <div className="px-8 py-6">
            <div
              className="prose text-gray-800 max-w-none"
              dangerouslySetInnerHTML={{
                __html:
                  note.content ||
                  '<p class="text-gray-500 italic">This note is empty.</p>',
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm mb-4">
            Want to create and share your own notes?
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Get Started for Free
          </a>
        </div>
      </div>
    </div>
  );
}
