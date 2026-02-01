'use client'

import { useState, useEffect, useMemo } from 'react'
import { ChevronRight, ChevronDown, List } from 'lucide-react'

interface TocItem {
  id: string
  text: string
  level: number
  children: TocItem[]
}

interface TableOfContentsProps {
  content: string
}

export default function TableOfContents({ content }: TableOfContentsProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [activeId, setActiveId] = useState<string>('')
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Parse headings from markdown content
  const headings = useMemo(() => {
    const lines = content.split('\n')
    const items: TocItem[] = []
    
    lines.forEach((line, index) => {
      const match = line.match(/^(#{1,6})\s+(.+)$/)
      if (match) {
        const level = match[1].length
        const text = match[2].trim()
        // Remove markdown formatting from text
        const cleanText = text
          .replace(/\*\*([^*]+)\*\*/g, '$1')
          .replace(/\*([^*]+)\*/g, '$1')
          .replace(/`([^`]+)`/g, '$1')
          .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        
        const id = `heading-${index}-${cleanText.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
        
        items.push({
          id,
          text: cleanText,
          level,
          children: []
        })
      }
    })

    return items
  }, [content])

  // Build tree structure
  const tocTree = useMemo(() => {
    const tree: TocItem[] = []
    const stack: TocItem[] = []

    headings.forEach((heading) => {
      const item = { ...heading, children: [] }

      // Find parent
      while (stack.length > 0 && stack[stack.length - 1].level >= item.level) {
        stack.pop()
      }

      if (stack.length === 0) {
        tree.push(item)
      } else {
        stack[stack.length - 1].children.push(item)
      }

      stack.push(item)
    })

    return tree
  }, [headings])

  // Auto-expand all H1 items by default
  useEffect(() => {
    const h1Ids = tocTree.map(item => item.id)
    setExpandedItems(new Set(h1Ids))
  }, [tocTree])

  // Track scroll position to highlight current section
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      {
        rootMargin: '-20% 0px -80% 0px'
      }
    )

    // Observe all heading elements
    headings.forEach((heading) => {
      const element = document.getElementById(heading.id)
      if (element) {
        observer.observe(element)
      }
    })

    return () => observer.disconnect()
  }, [headings])

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setActiveId(id)
    }
  }

  const renderTocItem = (item: TocItem, depth: number = 0) => {
    const hasChildren = item.children.length > 0
    const isExpanded = expandedItems.has(item.id)
    const isActive = activeId === item.id

    return (
      <div key={item.id} className="select-none">
        <div
          className={`flex items-center gap-1 py-1.5 px-2 rounded-lg cursor-pointer transition-colors ${
            isActive
              ? 'bg-accent/20 text-accent'
              : 'text-muted hover:text-text hover:bg-border/50'
          }`}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
        >
          {/* Expand/Collapse button */}
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleExpand(item.id)
              }}
              className="p-0.5 hover:bg-border rounded transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
            </button>
          ) : (
            <span className="w-4" />
          )}

          {/* Heading text */}
          <span
            onClick={() => scrollToHeading(item.id)}
            className={`flex-1 text-sm truncate ${
              item.level === 1 ? 'font-semibold' : ''
            } ${item.level === 2 ? 'font-medium' : ''}`}
            title={item.text}
          >
            {item.text}
          </span>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="ml-1">
            {item.children.map((child) => renderTocItem(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  if (headings.length === 0) {
    return null
  }

  return (
    <nav
      className={`sticky top-24 transition-all duration-300 ${
        isCollapsed ? 'w-10' : 'w-64'
      }`}
    >
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        {/* Header */}
        <div
          className="flex items-center justify-between p-3 border-b border-border cursor-pointer hover:bg-border/30 transition-colors"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <div className="flex items-center gap-2">
            <List className="w-4 h-4 text-muted" />
            {!isCollapsed && (
              <span className="text-sm font-medium text-text">Mục lục</span>
            )}
          </div>
          {!isCollapsed && (
            <ChevronRight
              className={`w-4 h-4 text-muted transition-transform ${
                isCollapsed ? '' : 'rotate-180'
              }`}
            />
          )}
        </div>

        {/* TOC Items */}
        {!isCollapsed && (
          <div className="p-2 max-h-[calc(100vh-200px)] overflow-y-auto">
            {tocTree.map((item) => renderTocItem(item))}
          </div>
        )}
      </div>
    </nav>
  )
}
