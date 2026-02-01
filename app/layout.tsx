import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/lib/auth-context'
import './globals.css'

export const metadata: Metadata = {
  title: 'WriteUp Platform - Private Learning Hub',
  description: 'A private writeup platform for student and mentor collaboration',
  keywords: ['writeup', 'learning', 'markdown', 'notes', 'tutorials'],
  authors: [{ name: 'WriteUp Team' }],
  openGraph: {
    title: 'WriteUp Platform',
    description: 'A private writeup platform for student and mentor collaboration',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-background text-text min-h-screen">
        <AuthProvider>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              className: 'toast-custom',
              duration: 3000,
              style: {
                background: '#1a1a1a',
                color: '#e4e4e7',
                border: '1px solid #2a2a2a',
              },
              success: {
                iconTheme: {
                  primary: '#22c55e',
                  secondary: '#1a1a1a',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#1a1a1a',
                },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  )
}
