'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { 
  Bold, 
  Italic, 
  Code, 
  Heading1, 
  Heading2, 
  Heading3,
  Link as LinkIcon, 
  Image, 
  List, 
  ListOrdered,
  Quote,
  Minus,
  FileCode,
  Eye,
  EyeOff,
  Undo2,
  Redo2
} from 'lucide-react'
import MarkdownPreview from './MarkdownPreview'
import toast from 'react-hot-toast'

interface EditorProps {
  content: string
  onChange: (content: string) => void
  onAutoSave?: () => void
}

interface ToolbarButton {
  icon: React.ReactNode
  label: string
  action: () => void
  shortcut?: string
}

export default function Editor({ content, onChange, onAutoSave }: EditorProps) {
  const [showPreview, setShowPreview] = useState(true)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Auto-save every 30 seconds
  useEffect(() => {
    if (onAutoSave && content) {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }
      autoSaveTimerRef.current = setTimeout(() => {
        onAutoSave()
      }, 30000)
    }

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }
    }
  }, [content, onAutoSave])

  // Sync scroll between editor and preview
  const handleEditorScroll = useCallback(() => {
    const textarea = textareaRef.current
    const preview = previewRef.current
    
    if (!textarea || !preview || !showPreview) return

    const scrollPercentage = textarea.scrollTop / (textarea.scrollHeight - textarea.clientHeight)
    const previewScrollTop = scrollPercentage * (preview.scrollHeight - preview.clientHeight)
    
    if (!isNaN(previewScrollTop)) {
      preview.scrollTop = previewScrollTop
    }
  }, [showPreview])

  // Handle paste event for images
  const handlePaste = useCallback(async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items
    if (!items) return

    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      
      if (item.type.startsWith('image/')) {
        e.preventDefault()
        
        const file = item.getAsFile()
        if (!file) continue

        // Check file size (max 2MB for base64)
        if (file.size > 2 * 1024 * 1024) {
          toast.error('Ảnh quá lớn! Tối đa 2MB.')
          return
        }

        toast.loading('Đang xử lý ảnh...', { id: 'paste-image' })

        try {
          // Convert to base64
          const base64 = await fileToBase64(file)
          
          // Insert markdown image at cursor
          const textarea = textareaRef.current
          if (!textarea) return

          const start = textarea.selectionStart
          const end = textarea.selectionEnd
          const timestamp = Date.now()
          const imageMarkdown = `![image-${timestamp}](${base64})`
          
          const newContent = 
            content.substring(0, start) + 
            imageMarkdown + 
            content.substring(end)

          onChange(newContent)
          
          // Set cursor after the inserted image
          setTimeout(() => {
            const newPos = start + imageMarkdown.length
            textarea.focus()
            textarea.setSelectionRange(newPos, newPos)
          }, 0)

          toast.success('Đã chèn ảnh!', { id: 'paste-image' })
        } catch (error) {
          console.error('Error processing image:', error)
          toast.error('Lỗi khi xử lý ảnh!', { id: 'paste-image' })
        }
        
        return
      }
    }
  }, [content, onChange])

  // Convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result)
        } else {
          reject(new Error('Failed to read file'))
        }
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const insertAtCursor = useCallback((before: string, after: string = '', placeholder: string = '') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)
    const textToInsert = selectedText || placeholder

    const newContent = 
      content.substring(0, start) + 
      before + textToInsert + after + 
      content.substring(end)

    onChange(newContent)

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + textToInsert.length
      )
    }, 0)
  }, [content, onChange])

  const insertNewLine = useCallback((text: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const lineStart = content.lastIndexOf('\n', start - 1) + 1
    const beforeLine = content.substring(0, lineStart)
    const afterCursor = content.substring(start)

    const newContent = beforeLine + text + afterCursor

    onChange(newContent)

    setTimeout(() => {
      textarea.focus()
      const newPos = beforeLine.length + text.length
      textarea.setSelectionRange(newPos, newPos)
    }, 0)
  }, [content, onChange])

  const toolbarButtons: ToolbarButton[] = [
    {
      icon: <Undo2 className="w-4 h-4" />,
      label: 'Undo',
      action: () => {
        // Use native undo
        document.execCommand('undo')
      },
      shortcut: 'Ctrl+Z'
    },
    {
      icon: <Redo2 className="w-4 h-4" />,
      label: 'Redo',
      action: () => {
        // Use native redo
        document.execCommand('redo')
      },
      shortcut: 'Ctrl+Y'
    },
    {
      icon: <Bold className="w-4 h-4" />,
      label: 'Bold',
      action: () => insertAtCursor('**', '**', 'bold text'),
      shortcut: 'Ctrl+B'
    },
    {
      icon: <Italic className="w-4 h-4" />,
      label: 'Italic',
      action: () => insertAtCursor('*', '*', 'italic text'),
      shortcut: 'Ctrl+I'
    },
    {
      icon: <Code className="w-4 h-4" />,
      label: 'Inline Code',
      action: () => insertAtCursor('`', '`', 'code'),
    },
    {
      icon: <Heading1 className="w-4 h-4" />,
      label: 'Heading 1',
      action: () => insertNewLine('# Heading 1\n'),
    },
    {
      icon: <Heading2 className="w-4 h-4" />,
      label: 'Heading 2',
      action: () => insertNewLine('## Heading 2\n'),
    },
    {
      icon: <Heading3 className="w-4 h-4" />,
      label: 'Heading 3',
      action: () => insertNewLine('### Heading 3\n'),
    },
    {
      icon: <LinkIcon className="w-4 h-4" />,
      label: 'Link',
      action: () => insertAtCursor('[', '](url)', 'link text'),
    },
    {
      icon: <Image className="w-4 h-4" />,
      label: 'Image',
      action: () => insertAtCursor('![', '](image-url)', 'alt text'),
    },
    {
      icon: <List className="w-4 h-4" />,
      label: 'Bullet List',
      action: () => insertNewLine('- List item\n'),
    },
    {
      icon: <ListOrdered className="w-4 h-4" />,
      label: 'Numbered List',
      action: () => insertNewLine('1. List item\n'),
    },
    {
      icon: <Quote className="w-4 h-4" />,
      label: 'Quote',
      action: () => insertNewLine('> Quote\n'),
    },
    {
      icon: <Minus className="w-4 h-4" />,
      label: 'Horizontal Rule',
      action: () => insertNewLine('\n---\n'),
    },
    {
      icon: <FileCode className="w-4 h-4" />,
      label: 'Code Block',
      action: () => insertAtCursor('\n```javascript\n', '\n```\n', '// code here'),
    },
  ]

  // Keyboard shortcuts
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'b':
          e.preventDefault()
          insertAtCursor('**', '**', 'bold text')
          break
        case 'i':
          e.preventDefault()
          insertAtCursor('*', '*', 'italic text')
          break
        case 'k':
          e.preventDefault()
          insertAtCursor('[', '](url)', 'link text')
          break
        // Ctrl+Z and Ctrl+Y work natively, no need to handle
      }
    }
    if (e.key === 'Tab') {
      e.preventDefault()
      insertAtCursor('  ', '', '')
    }
  }, [insertAtCursor])

  return (
    <div className="flex flex-col h-full bg-surface rounded-xl border border-border overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-2 border-b border-border bg-surface/50">
        <div className="flex flex-wrap items-center gap-0.5">
          {toolbarButtons.map((button, index) => (
            <button
              key={index}
              onClick={button.action}
              className="p-2 text-muted hover:text-text hover:bg-border/50 rounded-lg transition-colors"
              title={button.shortcut ? `${button.label} (${button.shortcut})` : button.label}
            >
              {button.icon}
            </button>
          ))}
        </div>
        
        {/* Preview toggle for mobile */}
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="lg:hidden flex items-center gap-2 px-3 py-2 text-sm text-muted hover:text-text hover:bg-border/50 rounded-lg transition-colors"
        >
          {showPreview ? (
            <>
              <EyeOff className="w-4 h-4" />
              <span>Hide Preview</span>
            </>
          ) : (
            <>
              <Eye className="w-4 h-4" />
              <span>Show Preview</span>
            </>
          )}
        </button>
      </div>

      {/* Editor and Preview */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        {/* Editor */}
        <div className={`flex-1 flex flex-col min-h-0 ${showPreview ? 'lg:w-1/2' : 'w-full'}`}>
          <div className="px-3 py-2 text-xs text-muted border-b border-border bg-background/50 flex items-center justify-between">
            <span>Editor</span>
            <span className="text-xs opacity-50">Ctrl+V để paste ảnh</span>
          </div>
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            onScroll={handleEditorScroll}
            className="flex-1 w-full p-4 bg-background text-text editor-textarea resize-none border-none focus:outline-none"
            placeholder="Viết nội dung Markdown của bạn tại đây..."
            spellCheck={false}
          />
        </div>

        {/* Preview */}
        {showPreview && (
          <>
            <div className="hidden lg:block w-px bg-border" />
            <div className="flex-1 flex flex-col min-h-0 lg:w-1/2 border-t lg:border-t-0 border-border">
              <div className="px-3 py-2 text-xs text-muted border-b border-border bg-background/50">
                Preview
              </div>
              <div 
                ref={previewRef}
                className="flex-1 overflow-y-auto p-4 bg-background/50"
              >
                {content ? (
                  <MarkdownPreview content={content} />
                ) : (
                  <p className="text-muted italic">Preview sẽ hiển thị ở đây...</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
