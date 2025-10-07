'use client'

import { useState } from 'react'
import { X, Copy, Check, ExternalLink, Eye, EyeOff, Share2 } from 'lucide-react'
import type { Note } from '../lib/definitions'

interface SharePopupProps {
  note: Note
  isOpen: boolean
  onClose: () => void
  onShare: (noteId: string) => Promise<{ publicUrl: string; publicId: string }>
  onUnshare: (noteId: string) => Promise<void>
}

export default function SharePopup({ note, isOpen, onClose, onShare, onUnshare }: SharePopupProps) {
  const [publicUrl, setPublicUrl] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string>('')

  if (!isOpen) return null

  const isShared = note.is_public && note.public_id
  const currentPublicUrl = isShared ? `${window.location.origin}/share/${note.public_id}` : ''

  const handleShare = async () => {
    setLoading(true)
    setError('')
    try {
      const result = await onShare(note.id)
      setPublicUrl(result.publicUrl)
    } catch (error) {
      setError('Failed to share note. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleUnshare = async () => {
    setLoading(true)
    setError('')
    try {
      await onUnshare(note.id)
      setPublicUrl('')
    } catch (error) {
      setError('Failed to unshare note. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    const urlToCopy = publicUrl || currentPublicUrl
    try {
      await navigator.clipboard.writeText(urlToCopy)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const handleOpenLink = () => {
    const urlToOpen = publicUrl || currentPublicUrl
    window.open(urlToOpen, '_blank')
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Share2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Share Note</h2>
              <p className="text-sm text-gray-500">Make this note publicly viewable</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 mb-2">{note.title || 'Untitled Note'}</h3>
            <div className="text-sm text-gray-600 flex items-center gap-2">
              {isShared || publicUrl ? (
                <>
                  <Eye className="w-4 h-4 text-green-600" />
                  <span className="text-green-600">Public - Anyone with the link can view</span>
                </>
              ) : (
                <>
                  <EyeOff className="w-4 h-4 text-gray-500" />
                  <span>Private - Only you can see this note</span>
                </>
              )}
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {(isShared || publicUrl) && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Public Link
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={publicUrl || currentPublicUrl}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm text-gray-700"
                />
                <button
                  onClick={handleCopy}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg transition-colors"
                  title="Copy link"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-600" />
                  )}
                </button>
                <button
                  onClick={handleOpenLink}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg transition-colors"
                  title="Open link"
                >
                  <ExternalLink className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              {copied && (
                <p className="text-sm text-green-600 mt-1">Link copied to clipboard!</p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            {isShared || publicUrl ? (
              <button
                onClick={handleUnshare}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Removing...' : 'Make Private'}
              </button>
            ) : (
              <button
                onClick={handleShare}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Creating link...' : 'Create Public Link'}
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>

          {!isShared && !publicUrl && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                </div>
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">When you share this note:</p>
                  <ul className="space-y-1 text-blue-700">
                    <li>• Anyone with the link can view it</li>
                    <li>• It will be read-only for viewers</li>
                    <li>• You can make it private anytime</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}