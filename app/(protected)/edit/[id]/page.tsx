'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/lib/auth-context'
import { 
  Writeup,
  generateSlug, 
  generateExcerpt, 
  calculateReadTime 
} from '@/lib/types'
import Editor from '@/components/Editor'
import LoadingSpinner from '@/components/LoadingSpinner'
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

export default function EditPage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [writeup, setWriteup] = useState<Writeup | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  // Fetch writeup
  useEffect(() => {
    const fetchWriteup = async () => {
      try {
        const docRef = doc(db, 'writeups', id)
        const docSnap = await getDoc(docRef)
        
        if (docSnap.exists()) {
          const data = docSnap.data()
          const writeupData: Writeup = {
            id: docSnap.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          } as Writeup
          
          setWriteup(writeupData)
          setTitle(writeupData.title)
          setContent(writeupData.content)
          setTags(writeupData.tags)
        } else {
          toast.error('Writeup không tồn tại!')
          router.push('/dashboard')
        }
      } catch (error) {
        console.error('Error fetching writeup:', error)
        toast.error('Lỗi khi tải writeup!')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchWriteup()
    }
  }, [id, router])

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
        updatedAt: serverTimestamp(),
        readTime: calculateReadTime(content),
      }

      await updateDoc(doc(db, 'writeups', id), writeupData)
      
      toast.success(isPublish ? 'Đã publish writeup!' : 'Đã lưu thay đổi!')
      setLastSaved(new Date())
    } catch (error) {
      console.error('Error saving writeup:', error)
      toast.error('Lỗi khi lưu writeup!')
    } finally {
      setIsSaving(false)
      setIsPublishing(false)
    }
  }

  const handleAutoSave = useCallback(async () => {
    if (!title.trim() || !content.trim() || !user || !id) return

    try {
      await updateDoc(doc(db, 'writeups', id), {
        title: title.trim(),
        content: content,
        excerpt: generateExcerpt(content),
        tags: tags,
        updatedAt: serverTimestamp(),
        readTime: calculateReadTime(content),
      })
      setLastSaved(new Date())
    } catch (error) {
      console.error('Auto-save error:', error)
    }
  }, [title, content, tags, user, id])

  if (loading) {
    return (
      <div className="h-[calc(100vh-64px)] flex items-center justify-center">
        <LoadingSpinner text="Đang tải writeup..." />
      </div>
    )
  }

  if (!writeup) {
    return null
  }

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      {/* Header */}
      <div className="bg-surface border-b border-border px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-4 flex-1">
            <Link
              href={`/writeup/${id}`}
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
                Saved {lastSaved.toLocaleTimeString()}
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
