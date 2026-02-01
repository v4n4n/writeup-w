'use client'

import { useState, useEffect, useMemo } from 'react'
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/lib/auth-context'
import { Writeup } from '@/lib/types'
import WriteupCard from '@/components/WriteupCard'
import LoadingSpinner from '@/components/LoadingSpinner'
import Link from 'next/link'
import { 
  Search, 
  Plus, 
  LayoutGrid, 
  List, 
  FileText, 
  FilePenLine,
  X,
  Tag
} from 'lucide-react'

type ViewMode = 'grid' | 'list'
type FilterStatus = 'all' | 'published' | 'draft'

export default function DashboardPage() {
  const { user } = useAuth()
  const [writeups, setWriteups] = useState<Writeup[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')

  // Fetch writeups
  useEffect(() => {
    const q = query(
      collection(db, 'writeups'),
      orderBy('updatedAt', 'desc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const writeupsData: Writeup[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as Writeup[]
      
      setWriteups(writeupsData)
      setLoading(false)
    }, (error) => {
      console.error('Error fetching writeups:', error)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  // Get all unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>()
    writeups.forEach((writeup) => {
      writeup.tags.forEach((tag) => tags.add(tag))
    })
    return Array.from(tags).sort()
  }, [writeups])

  // Filter writeups
  const filteredWriteups = useMemo(() => {
    return writeups.filter((writeup) => {
      // Search filter
      const matchesSearch = 
        searchQuery === '' ||
        writeup.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        writeup.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        writeup.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))

      // Tag filter
      const matchesTags = 
        selectedTags.length === 0 ||
        selectedTags.every(tag => writeup.tags.includes(tag))

      // Status filter
      const matchesStatus = 
        filterStatus === 'all' ||
        writeup.status === filterStatus

      return matchesSearch && matchesTags && matchesStatus
    })
  }, [writeups, searchQuery, selectedTags, filterStatus])

  // Stats
  const stats = useMemo(() => ({
    total: writeups.length,
    published: writeups.filter(w => w.status === 'published').length,
    drafts: writeups.filter(w => w.status === 'draft').length,
  }), [writeups])

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    )
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedTags([])
    setFilterStatus('all')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner text="Đang tải writeups..." />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text">Dashboard</h1>
          <p className="text-muted mt-1">
            Xin chào, {user?.displayName}! 👋
          </p>
        </div>
        <Link
          href="/write"
          className="inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white px-4 py-2.5 rounded-lg font-medium transition-colors duration-200"
        >
          <Plus className="w-5 h-5" />
          Tạo writeup mới
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-surface border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text">{stats.total}</p>
              <p className="text-sm text-muted">Tổng writeups</p>
            </div>
          </div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text">{stats.published}</p>
              <p className="text-sm text-muted">Published</p>
            </div>
          </div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <FilePenLine className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text">{stats.drafts}</p>
              <p className="text-sm text-muted">Drafts</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-surface border border-border rounded-xl p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm writeups..."
              className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2.5 text-text placeholder-muted focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === 'all'
                  ? 'bg-accent text-white'
                  : 'bg-background text-muted hover:text-text'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setFilterStatus('published')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === 'published'
                  ? 'bg-green-500 text-white'
                  : 'bg-background text-muted hover:text-text'
              }`}
            >
              Published
            </button>
            <button
              onClick={() => setFilterStatus('draft')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === 'draft'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-background text-muted hover:text-text'
              }`}
            >
              Drafts
            </button>
          </div>

          {/* View Mode */}
          <div className="flex items-center gap-1 bg-background rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-border text-text'
                  : 'text-muted hover:text-text'
              }`}
              title="Grid view"
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-border text-text'
                  : 'text-muted hover:text-text'
              }`}
              title="List view"
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tags */}
        {allTags.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center gap-2 flex-wrap">
              <Tag className="w-4 h-4 text-muted" />
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                    selectedTags.includes(tag)
                      ? 'bg-accent text-white'
                      : 'bg-background text-muted hover:text-text'
                  }`}
                >
                  #{tag}
                </button>
              ))}
              {(selectedTags.length > 0 || searchQuery || filterStatus !== 'all') && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs text-red-400 hover:text-red-300 transition-colors"
                >
                  <X className="w-3 h-3" />
                  Xóa filters
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Writeups Grid/List */}
      {filteredWriteups.length === 0 ? (
        <div className="text-center py-16">
          <FileText className="w-16 h-16 text-muted mx-auto mb-4" />
          <h3 className="text-lg font-medium text-text mb-2">
            {writeups.length === 0 
              ? 'Chưa có writeup nào' 
              : 'Không tìm thấy writeup'}
          </h3>
          <p className="text-muted mb-6">
            {writeups.length === 0
              ? 'Bắt đầu bằng cách tạo writeup đầu tiên của bạn!'
              : 'Thử thay đổi từ khóa hoặc bộ lọc.'}
          </p>
          {writeups.length === 0 && (
            <Link
              href="/write"
              className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-4 py-2.5 rounded-lg font-medium transition-colors duration-200"
            >
              <Plus className="w-5 h-5" />
              Tạo writeup mới
            </Link>
          )}
        </div>
      ) : (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
              : 'space-y-3'
          }
        >
          {filteredWriteups.map((writeup) => (
            <WriteupCard key={writeup.id} writeup={writeup} view={viewMode} />
          ))}
        </div>
      )}

      {/* Results count */}
      {filteredWriteups.length > 0 && (
        <p className="text-center text-sm text-muted mt-8">
          Hiển thị {filteredWriteups.length} / {writeups.length} writeups
        </p>
      )}
    </div>
  )
}
