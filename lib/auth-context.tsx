'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react'
import {
  User as FirebaseUser,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db } from './firebase'
import { User } from './types'

// Allowed user emails - only these 2 users can access the platform
const ALLOWED_EMAILS = [
  'ashvani@gmail.com',
  'dungvt@gmail.com',
  // Add your actual emails here
]

interface AuthContextType {
  user: User | null
  firebaseUser: FirebaseUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  isAllowedUser: (email: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null)
  const [loading, setLoading] = useState(true)

  const isAllowedUser = (email: string): boolean => {
    return ALLOWED_EMAILS.includes(email.toLowerCase())
  }

  const fetchUserData = async (firebaseUser: FirebaseUser): Promise<User | null> => {
    try {
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
      
      if (userDoc.exists()) {
        const data = userDoc.data()
        return {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: data.displayName || firebaseUser.displayName || 'User',
          role: data.role || 'student',
          createdAt: data.createdAt?.toDate() || new Date(),
        }
      } else {
        // Create user document if it doesn't exist
        const isFirstUser = firebaseUser.email?.toLowerCase().includes('mentor')
        const newUser: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          role: isFirstUser ? 'mentor' : 'student',
          createdAt: new Date(),
        }
        
        await setDoc(doc(db, 'users', firebaseUser.uid), {
          ...newUser,
          createdAt: new Date(),
        })
        
        return newUser
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
      return null
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true)
      
      if (firebaseUser) {
        // Check if user is allowed
        if (!isAllowedUser(firebaseUser.email || '')) {
          await firebaseSignOut(auth)
          setFirebaseUser(null)
          setUser(null)
          setLoading(false)
          return
        }
        
        setFirebaseUser(firebaseUser)
        const userData = await fetchUserData(firebaseUser)
        setUser(userData)
      } else {
        setFirebaseUser(null)
        setUser(null)
      }
      
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    // Check if email is allowed before attempting sign in
    if (!isAllowedUser(email)) {
      throw new Error('Tài khoản này không được phép truy cập platform.')
    }

    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        throw new Error('Không tìm thấy tài khoản.')
      } else if (error.code === 'auth/wrong-password') {
        throw new Error('Mật khẩu không đúng.')
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Email không hợp lệ.')
      } else if (error.code === 'auth/invalid-credential') {
        throw new Error('Thông tin đăng nhập không hợp lệ.')
      } else {
        throw new Error('Đăng nhập thất bại. Vui lòng thử lại.')
      }
    }
  }

  const signOut = async () => {
    try {
      await firebaseSignOut(auth)
      setUser(null)
      setFirebaseUser(null)
    } catch (error) {
      console.error('Error signing out:', error)
      throw new Error('Đăng xuất thất bại.')
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        signIn,
        signOut,
        isAllowedUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
