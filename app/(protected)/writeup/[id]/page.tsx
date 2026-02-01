'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { doc, getDoc, deleteDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/lib/auth-context'
import { Writeup, formatDate } from '@/lib/types'
import MarkdownPreview from '@/components/MarkdownPreview'
import TableOfContents from '@/components/TableOfContents'
import LoadingSpinner from '@/components/LoadingSpinner'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  User,
  Edit3, 
  Trash2,
  AlertTriangle,
  X
} from 'lucide-react'

export default function WriteupViewPage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [writeup, setWriteup] = useState<Writeup | null>(null)
  const [loading, setLoading] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Fetch writeup
  useEffect(() => {
    const fetchWriteup = async () => {
      try {
        const docRef = doc(db, 'writeups', id)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          const data = docSnap.data()
          setWriteup({
            id: docSnap.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          } as Writeup)
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

  const handleDelete = async () => {
    if (!writeup) return

    setIsDeleting(true)
    try {
      await deleteDoc(doc(db, 'writeups', id))
      toast.success('Đã xóa writeup!')
      router.push('/dashboard')
    } catch (error) {
      console.error('Error deleting writeup:', error)
      toast.error('Lỗi khi xóa writeup!')
    } finally {
      setIsDeleting(false)
      setShowDeleteModal(false)
    }
  }

  const isOwner = user?.uid === writeup?.authorId

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner text="Đang tải writeup..." />
      </div>
    )
  }

  if (!writeup) {
    return null
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Table of Contents - Left Sidebar */}
          <aside className="hidden lg:block flex-shrink-0">
            <TableOfContents content={writeup.content} />
          </aside>

          {/* Main Content */}
          <article className="flex-1 min-w-0 max-w-4xl">
            {/* Back button */}
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-muted hover:text-text mb-8 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lại Dashboard
            </Link>

            {/* Header */}
            <header className="mb-8">
              {/* Status badge */}
              {writeup.status === 'draft' && (
                <span className="inline-flex items-center gap-1 text-xs bg-yellow-500/20 text-yellow-500 px-2.5 py-1 rounded-full mb-4">
                  Draft
                </span>
              )}

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl font-bold text-text mb-4">
                {writeup.title}
              </h1>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted mb-4">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{writeup.authorName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(writeup.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{writeup.readTime} phút đọc</span>
                </div>
              </div>

              {/* Tags */}
              {writeup.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {writeup.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center text-sm bg-accent/20 text-accent px-3 py-1 rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Actions */}
              {isOwner && (
                <div className="flex items-center gap-2 pt-4 border-t border-border">
                  <Link
                    href={`/edit/${id}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-surface border border-border text-text rounded-lg font-medium hover:bg-border/50 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                    Chỉnh sửa
                  </Link>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-600/10 border border-red-600/30 text-red-500 rounded-lg font-medium hover:bg-red-600/20 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Xóa
                  </button>
                </div>
              )}
            </header>

            {/* Content */}
            <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8">
              <MarkdownPreview content={writeup.content} addHeadingIds={true} />
            </div>

            {/* Footer */}
            <footer className="mt-8 pt-8 border-t border-border">
              <p className="text-sm text-muted">
                Cập nhật lần cuối: {formatDate(writeup.updatedAt)}
              </p>
            </footer>
          </article>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface border border-border rounded-2xl p-6 max-w-md w-full fade-in">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-text mb-2">
                  Xóa writeup?
                </h3>
                <p className="text-muted mb-6">
                  Bạn có chắc muốn xóa &quot;{writeup.title}&quot;? Hành động này không thể hoàn tác.
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 px-4 py-2 bg-surface border border-border text-text rounded-lg font-medium hover:bg-border/50 transition-colors"
                    disabled={isDeleting}
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isDeleting ? (
                      <>
                        <LoadingSpinner size="sm" />
                        Đang xóa...
                      </>
                    ) : (
                      'Xóa'
                    )}
                  </button>
                </div>
              </div>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="p-1 text-muted hover:text-text transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
