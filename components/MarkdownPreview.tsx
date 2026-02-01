'use client'

import { useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import CodeBlock from './CodeBlock'

interface MarkdownPreviewProps {
  content: string
  className?: string
  addHeadingIds?: boolean
}

// Counter for generating unique heading IDs
let headingCounter = 0

export default function MarkdownPreview({ content, className = '', addHeadingIds = false }: MarkdownPreviewProps) {
  // Reset counter when content changes
  const contentRef = useRef(content)
  if (contentRef.current !== content) {
    headingCounter = 0
    contentRef.current = content
  }

  // Generate heading ID
  const generateHeadingId = (children: React.ReactNode): string => {
    const text = extractTextFromChildren(children)
    const id = `heading-${headingCounter}-${text.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
    headingCounter++
    return id
  }

  // Extract text from React children
  const extractTextFromChildren = (children: React.ReactNode): string => {
    if (typeof children === 'string') return children
    if (Array.isArray(children)) {
      return children.map(extractTextFromChildren).join('')
    }
    if (children && typeof children === 'object' && 'props' in children) {
      return extractTextFromChildren((children as any).props.children)
    }
    return ''
  }

  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          h1({ children }) {
            const id = addHeadingIds ? generateHeadingId(children) : undefined
            return <h1 id={id}>{children}</h1>
          },
          h2({ children }) {
            const id = addHeadingIds ? generateHeadingId(children) : undefined
            return <h2 id={id}>{children}</h2>
          },
          h3({ children }) {
            const id = addHeadingIds ? generateHeadingId(children) : undefined
            return <h3 id={id}>{children}</h3>
          },
          h4({ children }) {
            const id = addHeadingIds ? generateHeadingId(children) : undefined
            return <h4 id={id}>{children}</h4>
          },
          h5({ children }) {
            const id = addHeadingIds ? generateHeadingId(children) : undefined
            return <h5 id={id}>{children}</h5>
          },
          h6({ children }) {
            const id = addHeadingIds ? generateHeadingId(children) : undefined
            return <h6 id={id}>{children}</h6>
          },
          code({ node, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '')
            const isInline = !match && !className?.includes('language-')
            
            // Check if this is a code block (has language or is wrapped in pre)
            const isCodeBlock = match || (node?.position && children?.toString().includes('\n'))
            
            if (isCodeBlock && match) {
              return (
                <CodeBlock language={match[1]}>
                  {String(children).replace(/\n$/, '')}
                </CodeBlock>
              )
            }

            // Check for code blocks without language specification
            if (!isInline && String(children).includes('\n')) {
              return (
                <CodeBlock language="text">
                  {String(children).replace(/\n$/, '')}
                </CodeBlock>
              )
            }

            // Inline code
            return (
              <code className={className} {...props}>
                {children}
              </code>
            )
          },
          pre({ children }) {
            // If the pre contains a CodeBlock, just return children
            // Otherwise wrap in pre
            return <>{children}</>
          },
          a({ href, children }) {
            const isExternal = href?.startsWith('http')
            return (
              <a
                href={href}
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noopener noreferrer' : undefined}
              >
                {children}
              </a>
            )
          },
          img({ src, alt }) {
            return (
              <img
                src={src}
                alt={alt || 'Image'}
                loading="lazy"
                className="rounded-lg max-w-full h-auto"
              />
            )
          },
          table({ children }) {
            return (
              <div className="overflow-x-auto">
                <table>{children}</table>
              </div>
            )
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
