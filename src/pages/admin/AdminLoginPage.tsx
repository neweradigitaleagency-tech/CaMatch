import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAdminAuthStore } from "../../stores/adminAuthStore"
import { isDemoMode } from "../../services/supabase"
import { Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react"

const SHOW_DEMO_LOGIN = import.meta.env.DEV || isDemoMode()

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const { login, demoLogin, isAuthenticated, isLoading, initialized, error } = useAdminAuthStore
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (initialized && isAuthenticated) {
      navigate("/admin/dashboard", { replace: true })
    }
  }, [initialized, isAuthenticated, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!email.trim()) { setFormError("Email requis"); return }
    if (!password) { setFormError("Mot de passe requis"); return }

    setSubmitting(true)
    const result = await login(email, password)
    setSubmitting(false)

    if (!result.error) {
      navigate("/admin/dashboard", { replace: true })
    }
  }

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cm-surface">
        <Loader2 className="w-6 h-6 text-cm-text-muted animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cm-surface px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <img src="/logo.svg" alt="Ça Match" className="h-12 mx-auto mb-4" />
          <h1 className="text-[22px] font-bold text-cm-text">Admin</h1>
          <p className="text-[13px] text-cm-text-muted mt-1">Connectez-vous pour accéder au back-office</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-cm-elevated border border-cm-border rounded-2xl p-6 shadow-sm space-y-4">
          <div>
            <label className="block text-[12px] font-medium text-cm-text-soft mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@camatch.ci"
              autoComplete="email"
              autoFocus
              className="w-full h-11 px-3.5 text-[14px] bg-cm-surface border border-cm-border rounded-xl outline-none text-cm-text placeholder:text-cm-text-muted focus:border-cm-border focus:bg-white transition-colors"
            />
          </div>

          <div>
            <label className="block text-[12px] font-medium text-cm-text-soft mb-1.5">Mot de passe</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full h-11 px-3.5 pr-10 text-[14px] bg-cm-surface border border-cm-border rounded-xl outline-none text-cm-text placeholder:text-cm-text-muted focus:border-cm-border focus:bg-white transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-cm-text-muted hover:text-cm-text-soft cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {(formError || error) && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-[12px] text-red-600 font-medium">{formError ?? error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full h-11 bg-cm-text text-white text-[13px] font-bold rounded-xl hover:bg-cm-text/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            {submitting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Connexion...</>
            ) : (
              "Connexion"
            )}
          </button>

          <div className="text-center">
            <button
              type="button"
              className="text-[12px] text-cm-text-muted hover:text-cm-text-soft cursor-pointer"
            >
              Mot de passe oublié ?
            </button>
          </div>
        </form>

        <p className="text-center mt-6 text-[11px] text-cm-text-muted">
          Accès réservé au personnel autorisé
        </p>

        {SHOW_DEMO_LOGIN && (
          <div className="mt-4 pt-4 border-t border-cm-border/40">
            <p className="text-[10px] text-cm-text-muted text-center mb-2">Accès rapide — Mode démo</p>
            <button onClick={demoLogin}
              className="w-full h-10 text-xs font-semibold text-cm-text-soft bg-cm-elevated rounded-xl border border-cm-border hover:bg-cm-surface transition-all cursor-pointer flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cm-text-muted" /> Mode démo Admin
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
