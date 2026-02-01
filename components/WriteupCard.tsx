'use client'

import Link from 'next/link'
import { Writeup, formatRelativeTime } from '@/lib/types'
import { Clock, Calendar, Tag, FileText, FilePenLine } from 'lucide-react'

interface WriteupCardProps {
  writeup: Writeup
  view?: 'grid' | 'list'
}

export default function WriteupCard({ writeup, view = 'grid' }: WriteupCardProps) {
  const isDraft = writeup.status === 'draft'

  if (view === 'list') {
    return (
      <Link href={`/writeup/${writeup.id}`}>
        <article className="bg-surface border border-border rounded-xl p-4 card-hover flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              {isDraft && (
                <span className="inline-flex items-center gap-1 text-xs bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded-full">
                  <FilePenLine className="w-3 h-3" />
                  Draft
                </span>
              )}
              <h3 className="text-lg font-semibold text-text truncate">
                {writeup.title || 'Untitled'}
              </h3>
            </div>
            
            <p className="text-sm text-muted line-clamp-1 mb-3">
              {writeup.excerpt || 'No excerpt available...'}
            </p>

            <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatRelativeTime(writeup.createdAt)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {writeup.readTime} phút đọc
              </span>
              {writeup.tags.length > 0 && (
                <div className="flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  <span>{writeup.tags.slice(0, 2).join(', ')}</span>
                  {writeup.tags.length > 2 && (
                    <span>+{writeup.tags.length - 2}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </article>
      </Link>
    )
  }

  return (
    <Link href={`/writeup/${writeup.id}`}>
      <article className="bg-surface border border-border rounded-xl p-5 h-full card-hover flex flex-col">
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="text-lg font-semibold text-text line-clamp-2 flex-1">
            {writeup.title || 'Untitled'}
          </h3>
          {isDraft && (
            <span className="inline-flex items-center gap-1 text-xs bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded-full shrink-0">
              <FilePenLine className="w-3 h-3" />
              Draft
            </span>
          )}
        </div>

        <p className="text-sm text-muted line-clamp-3 mb-4 flex-1">
          {writeup.excerpt || 'No excerpt available...'}
        </p>

        {/* Tags */}
        {writeup.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {writeup.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full"
              >
                #{tag}
              </span>
            ))}
            {writeup.tags.length > 3 && (
              <span className="text-xs text-muted">
                +{writeup.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Meta */}
        <div className="flex items-center justify-between text-xs text-muted pt-3 border-t border-border">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>{formatRelativeTime(writeup.createdAt)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{writeup.readTime} phút</span>
          </div>
        </div>
      </article>
    </Link>
  )
}
