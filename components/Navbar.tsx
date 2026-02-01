'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { 
  BookOpen, 
  LayoutDashboard, 
  PenSquare, 
  LogOut, 
  User,
  Loader2
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function Navbar() {
  const { user, signOut, loading } = useAuth()
  const pathname = usePathname()

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success('Đã đăng xuất thành công!')
    } catch (error) {
      toast.error('Đăng xuất thất bại!')
    }
  }

  const isActive = (path: string) => pathname === path

  if (loading) {
    return (
      <nav className="sticky top-0 z-50 bg-surface/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold">WriteUp</span>
            </div>
            <Loader2 className="w-5 h-5 animate-spin text-muted" />
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="sticky top-0 z-50 bg-surface/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold hidden sm:block">WriteUp</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/dashboard"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/dashboard')
                  ? 'bg-accent text-white'
                  : 'text-muted hover:text-text hover:bg-border/50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>

            <Link
              href="/write"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/write')
                  ? 'bg-accent text-white'
                  : 'text-muted hover:text-text hover:bg-border/50'
              }`}
            >
              <PenSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Viết mới</span>
            </Link>

            {/* User Menu */}
            <div className="flex items-center gap-2 ml-2 pl-2 border-l border-border">
              <div className="flex items-center gap-2 px-2 py-1">
                <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-accent" />
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium truncate max-w-[120px]">
                    {user?.displayName}
                  </p>
                  <p className="text-xs text-muted capitalize">{user?.role}</p>
                </div>
              </div>

              <button
                onClick={handleSignOut}
                className="p-2 text-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                title="Đăng xuất"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
