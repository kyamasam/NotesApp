"use client";
import { ArrowDown, ArrowUp, User } from "lucide-react";
import { useEffect, useState } from "react";

interface LeaderboardUser {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  full_name: string;
  user: any;
  note_count: number;
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch("/api/leaderboard");
      if (response.ok) {
        const data = await response.json();
        setLeaderboard(data.leaderboard || []);
      }
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-gray-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 bg-white rounded-lg p-8 shadow-sm border border-gray-200">
          <h1 className="text-4xl font-bold mb-2 text-gray-900">
            🏆 Leaderboard
          </h1>
          <p className="text-gray-600">
            Top contributors ranked by number of notes created
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">
                  Position
                </th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">
                  Name
                </th>

                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">
                  Note Count
                </th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">
                  Change
                </th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                leaderboard.map((user, index) => (
                  <tr
                    key={user.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-900 font-medium">
                          {index + 1}
                        </span>
                        {index < 3 && (
                          <span className="text-xs">
                            {index === 0 && (
                              <ArrowUp className="w-4 h-4 text-green-500" />
                            )}
                            {index === 1 && (
                              <ArrowDown className="w-4 h-4 text-red-500" />
                            )}
                            {index === 2 && (
                              <ArrowUp className="w-4 h-4 text-green-500" />
                            )}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        {user.avatar_url ? (
                          <img
                            src={user.avatar_url}
                            alt={user.full_name}
                            className="w-8 h-8 rounded-full"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <User className="w-4 h-4 text-blue-600" />
                          </div>
                        )}
                        <span className="text-gray-900">{user?.full_name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-900">
                      {user?.note_count}
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-green-600 text-sm">
                        +{Math.floor(Math.random() * 5)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
