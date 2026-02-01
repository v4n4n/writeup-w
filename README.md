# WriteUp Platform

Nền tảng học tập riêng tư giống Hashnode, dành cho 2 người dùng (student + mentor).

## 🚀 Tech Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, TailwindCSS
- **Backend:** Firebase (Auth, Firestore, Storage)
- **Markdown:** react-markdown, remark-gfm
- **Syntax Highlighting:** react-syntax-highlighter (VS Code Dark+ theme)
- **Font:** JetBrains Mono cho code blocks
- **Deploy:** Vercel

## ✨ Features

- 🔐 **Authentication:** Login với email/password (Firebase Auth)
- 👥 **Private Platform:** Chỉ 2 accounts được phép truy cập
- 📝 **Markdown Editor:** Split screen với live preview
- 🎨 **Syntax Highlighting:** Code blocks với VS Code Dark+ theme
- 📊 **Dashboard:** Grid/List view, search, filter theo tags
- 💾 **Auto-save:** Tự động lưu draft mỗi 30 giây
- 🏷️ **Tags:** Quản lý và lọc writeups theo tags
- 📱 **Responsive:** Desktop, tablet, mobile

## 📦 Installation

1. **Clone repository:**
```bash
git clone <your-repo-url>
cd writeup-platform
```

2. **Install dependencies:**
```bash
npm install
```

3. **Setup Firebase:**
   - Tạo project mới trên [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password)
   - Tạo Firestore Database
   - Enable Storage (optional, cho images)
   - Copy config từ Project Settings

4. **Create environment file:**
```bash
cp .env.example .env.local
```

5. **Fill in Firebase config in `.env.local`:**
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

6. **Setup allowed users:**
   - Mở file `lib/auth-context.tsx`
   - Thay đổi `ALLOWED_EMAILS` array với email của bạn:
```typescript
const ALLOWED_EMAILS = [
  'your-student-email@example.com',
  'your-mentor-email@example.com',
]
```

7. **Create Firebase users:**
   - Trong Firebase Console → Authentication → Users
   - Thêm 2 users với email đã khai báo ở trên

8. **Deploy Firestore rules:**
```bash
firebase deploy --only firestore:rules
```

9. **Run development server:**
```bash
npm run dev
```

10. **Open browser:**
    - http://localhost:3000

## 🌐 Deploy to Vercel

1. **Push code to GitHub**

2. **Import to Vercel:**
   - Go to [Vercel](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables (same as .env.local)
   - Deploy!

3. **Update Firebase authorized domains:**
   - Firebase Console → Authentication → Settings → Authorized domains
   - Add your Vercel domain (e.g., `your-app.vercel.app`)

## 📁 Project Structure

```
/app
  /(auth)/login/page.tsx         # Login page
  /(protected)/
    layout.tsx                    # Protected layout with Navbar
    dashboard/page.tsx            # Dashboard with writeups list
    write/page.tsx                # Create new writeup
    edit/[id]/page.tsx            # Edit existing writeup
    writeup/[id]/page.tsx         # View writeup
  layout.tsx                      # Root layout
  globals.css                     # Global styles
  page.tsx                        # Landing page

/components
  CodeBlock.tsx                   # Code block with syntax highlighting
  Editor.tsx                      # Markdown editor with toolbar
  LoadingSpinner.tsx              # Loading component
  MarkdownPreview.tsx             # Markdown renderer
  Navbar.tsx                      # Navigation bar
  WriteupCard.tsx                 # Writeup card for lists

/lib
  auth-context.tsx                # Auth context provider
  firebase.ts                     # Firebase initialization
  types.ts                        # TypeScript types & utilities
```

## 🔒 Security

- Only 2 specified emails can access the platform
- Firebase Security Rules restrict data access
- All routes are protected by authentication
- Users can only edit/delete their own writeups

## 🎨 Design

- **Background:** #0f0f0f
- **Surface:** #1a1a1a
- **Border:** #2a2a2a
- **Text:** #e4e4e7
- **Accent:** #3b82f6
- **Code blocks:** Dark theme với rounded corners, JetBrains Mono font

## 📝 License

Private project - All rights reserved.
