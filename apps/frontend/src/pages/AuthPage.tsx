import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { FileText, Github } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AuthPage() {
  const { signInWithGoogle, signInWithGithub } = useAuth()
  const [loading, setLoading] = useState<'google' | 'github' | null>(null)

  async function handleGoogle() {
    setLoading('google')
    try {
      await signInWithGoogle()
    } catch (e: any) {
      toast.error(e.message || 'Sign-in failed')
    } finally {
      setLoading(null)
    }
  }

  async function handleGithub() {
    setLoading('github')
    try {
      await signInWithGithub()
    } catch (e: any) {
      toast.error(e.message || 'Sign-in failed')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-surface-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="w-10 h-10 bg-brand-500 rounded-lg flex items-center justify-center">
            <FileText size={20} className="text-black" />
          </div>
          <span className="font-syne font-bold text-2xl text-white">DocuFree</span>
        </div>

        <div className="card p-8">
          <h1 className="text-xl font-syne font-bold text-white mb-1 text-center">Welcome back</h1>
          <p className="text-sm text-[var(--text-secondary)] text-center mb-8">
            Sign in to access your documents
          </p>

          <div className="space-y-3">
            <button
              onClick={handleGoogle}
              disabled={loading !== null}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-900 font-medium px-4 py-3 rounded-md transition-colors text-sm disabled:opacity-50"
            >
              {loading === 'google' ? (
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <GoogleIcon />
              )}
              Continue with Google
            </button>

            <button
              onClick={handleGithub}
              disabled={loading !== null}
              className="w-full flex items-center justify-center gap-3 bg-[#24292e] hover:bg-[#2f363d] text-white font-medium px-4 py-3 rounded-md transition-colors text-sm border border-[#444] disabled:opacity-50"
            >
              {loading === 'github' ? (
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Github size={16} />
              )}
              Continue with GitHub
            </button>
          </div>

          <p className="text-[11px] text-[var(--text-muted)] text-center mt-6 leading-relaxed">
            By signing in, you agree to our Terms of Service and Privacy Policy.
            Guest files are deleted after 24 hours.
          </p>
        </div>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}
