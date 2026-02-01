'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/lib/auth-context'
import { 
  generateSlug, 
  generateExcerpt, 
  calculateReadTime 
} from '@/lib/types'
import Editor from '@/components/Editor'
import toast from 'react-hot-toast'
import { 
  ArrowLeft, 
  Save, 
  Send, 
  X, 
  Plus,
  Loader2
} from 'lucide-react'
import Link from 'next/link'

export default function WritePage() {
  const { user } = useAuth()
  const router = useRouter()
  
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase()
    if (tag && !tags.includes(tag) && tags.length < 5) {
      setTags([...tags, tag])
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag()
    }
  }

  const saveWriteup = async (status: 'draft' | 'published') => {
    if (!title.trim()) {
      toast.error('Vui lòng nhập tiêu đề!')
      return
    }

    if (!content.trim()) {
      toast.error('Vui lòng nhập nội dung!')
      return
    }

    if (!user) {
      toast.error('Bạn cần đăng nhập!')
      return
    }

    const isPublish = status === 'published'
    isPublish ? setIsPublishing(true) : setIsSaving(true)

    try {
      const writeupData = {
        title: title.trim(),
        slug: generateSlug(title),
        content: content,
        excerpt: generateExcerpt(content),
        tags: tags,
        status: status,
        authorId: user.uid,
        authorName: user.displayName,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        readTime: calculateReadTime(content),
      }

      const docRef = await addDoc(collection(db, 'writeups'), writeupData)
      
      toast.success(isPublish ? 'Đã publish writeup!' : 'Đã lưu draft!')
      router.push(`/writeup/${docRef.id}`)
    } catch (error) {
      console.error('Error saving writeup:', error)
      toast.error('Lỗi khi lưu writeup!')
    } finally {
      setIsSaving(false)
      setIsPublishing(false)
    }
  }

  const handleAutoSave = useCallback(async () => {
    if (!title.trim() || !content.trim() || !user) return

    // For auto-save, we'd typically update an existing draft
    // For simplicity, we'll just show a toast
    setLastSaved(new Date())
    // In a real app, you'd save to a "drafts" collection or localStorage
  }, [title, content, user])

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      {/* Header */}
      <div className="bg-surface border-b border-border px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-4 flex-1">
            <Link
              href="/dashboard"
              className="p-2 text-muted hover:text-text hover:bg-border/50 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Tiêu đề writeup..."
              className="flex-1 bg-transparent text-xl font-semibold text-text placeholder-muted focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            {lastSaved && (
              <span className="text-xs text-muted hidden sm:block">
                Auto-saved {lastSaved.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={() => saveWriteup('draft')}
              disabled={isSaving || isPublishing}
              className="flex items-center gap-2 px-4 py-2 bg-surface border border-border text-text rounded-lg font-medium hover:bg-border/50 transition-colors disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">Save Draft</span>
            </button>
            <button
              onClick={() => saveWriteup('published')}
              disabled={isSaving || isPublishing}
              className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {isPublishing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span>Publish</span>
            </button>
          </div>
        </div>

        {/* Tags */}
        <div className="max-w-7xl mx-auto mt-3 flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted">Tags:</span>
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 text-sm bg-accent/20 text-accent px-2.5 py-1 rounded-full"
            >
              #{tag}
              <button
                onClick={() => removeTag(tag)}
                className="hover:text-red-400 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {tags.length < 5 && (
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="Thêm tag..."
                className="bg-transparent text-sm text-text placeholder-muted focus:outline-none w-24"
              />
              <button
                onClick={addTag}
                className="p-1 text-muted hover:text-accent transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 p-4 min-h-0">
        <div className="h-full max-w-7xl mx-auto">
          <Editor 
            content={content} 
            onChange={setContent}
            onAutoSave={handleAutoSave}
          />
        </div>
      </div>
    </div>
  )
}
