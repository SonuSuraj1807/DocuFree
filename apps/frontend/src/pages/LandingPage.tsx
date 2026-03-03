import { useNavigate } from 'react-router-dom'
import { FileText, Sparkles, Shield, Zap, ArrowRight, CheckCircle2 } from 'lucide-react'

const FEATURES = [
  { icon: <FileText size={20} />, title: 'PDF & DOCX Editing', desc: 'Edit text, images, and annotations directly on your documents.' },
  { icon: <Sparkles size={20} />, title: 'AI-Powered', desc: 'Natural language commands using free AI models via OpenRouter.' },
  { icon: <Shield size={20} />, title: 'Private & Secure', desc: 'Files auto-deleted after 24 hours for guests. Zero tracking.' },
  { icon: <Zap size={20} />, title: 'Export Anywhere', desc: 'Export to PDF, DOCX, PNG, JPG, and TXT with one click.' },
]

const PERKS = [
  'No subscription required',
  'Google & GitHub sign-in',
  'AI rewrite & translate',
  'Merge, split & compress PDFs',
  'Batch find & replace',
  'Signature support',
]

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-surface-900 text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-surface-700 max-w-6xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
            <FileText size={16} className="text-black" />
          </div>
          <span className="font-syne font-bold text-xl text-white">DocuFree</span>
        </div>
        <button onClick={() => navigate('/auth')} className="btn-primary">
          Get started <ArrowRight size={14} />
        </button>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-8 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-surface-700 border border-surface-600 px-3 py-1.5 rounded-full text-xs text-brand-500 font-medium mb-8">
          <Sparkles size={11} />
          AI-powered document editing — free forever
        </div>
        <h1 className="font-syne font-bold text-5xl md:text-6xl lg:text-7xl text-white mb-6 leading-tight">
          Edit any document.
          <br />
          <span className="text-brand-500">No subscription.</span>
        </h1>
        <p className="text-lg text-[var(--text-secondary)] max-w-xl mx-auto mb-10 leading-relaxed">
          DocuFree lets you edit PDFs and Word docs with AI assistance — no paywalls, no watermarks, no sign-up friction.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <button
            onClick={() => navigate('/auth')}
            className="btn-primary px-6 py-3 text-base"
          >
            Start editing for free
            <ArrowRight size={16} />
          </button>
          <button
            onClick={() => navigate('/auth')}
            className="btn-secondary px-6 py-3 text-base"
          >
            View demo
          </button>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-8 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((f) => (
            <div key={f.title} className="card p-6 hover:border-surface-500 transition-colors">
              <div className="w-10 h-10 bg-surface-700 rounded-lg flex items-center justify-center text-brand-500 mb-4">
                {f.icon}
              </div>
              <h3 className="font-syne font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Perks list */}
      <section className="max-w-6xl mx-auto px-8 pb-24">
        <div className="card p-10 text-center">
          <h2 className="font-syne font-bold text-3xl text-white mb-8">Everything included, always free</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
            {PERKS.map((p) => (
              <div key={p} className="flex items-center gap-2.5 text-sm text-[var(--text-secondary)]">
                <CheckCircle2 size={14} className="text-brand-500 shrink-0" />
                {p}
              </div>
            ))}
          </div>
          <button onClick={() => navigate('/auth')} className="btn-primary mt-10 px-8 py-3 text-base mx-auto">
            Create free account <ArrowRight size={15} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-surface-700 py-8 text-center text-xs text-[var(--text-muted)]">
        © {new Date().getFullYear()} DocuFree · Free forever · No watermarks
      </footer>
    </div>
  )
}
