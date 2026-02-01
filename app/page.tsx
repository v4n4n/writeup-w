import Link from 'next/link'
import { ArrowRight, BookOpen, Code2, Users } from 'lucide-react'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl text-center fade-in">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-text">WriteUp</h1>
        </div>

        {/* Tagline */}
        <p className="text-xl text-muted mb-8">
          Nền tảng học tập riêng tư cho Student & Mentor
        </p>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="bg-surface border border-border rounded-xl p-4">
            <Code2 className="w-8 h-8 text-accent mb-3 mx-auto" />
            <h3 className="font-semibold mb-1">Markdown Editor</h3>
            <p className="text-sm text-muted">
              Viết writeups với syntax highlighting đẹp
            </p>
          </div>
          <div className="bg-surface border border-border rounded-xl p-4">
            <Users className="w-8 h-8 text-accent mb-3 mx-auto" />
            <h3 className="font-semibold mb-1">Private Platform</h3>
            <p className="text-sm text-muted">
              Chỉ dành cho 2 người dùng được phép
            </p>
          </div>
          <div className="bg-surface border border-border rounded-xl p-4">
            <BookOpen className="w-8 h-8 text-accent mb-3 mx-auto" />
            <h3 className="font-semibold mb-1">Knowledge Base</h3>
            <p className="text-sm text-muted">
              Lưu trữ và tìm kiếm writeups dễ dàng
            </p>
          </div>
        </div>

        {/* CTA */}
        <Link
          href="/login"
          className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200"
        >
          Đăng nhập để bắt đầu
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-6 text-muted text-sm">
        © 2026 WriteUp Platform. Private Learning Hub.
      </footer>
    </main>
  )
}
