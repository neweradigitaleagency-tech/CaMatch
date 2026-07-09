import { useEffect, useState, useCallback } from "react"
import { useAuthStore } from "../../stores/authStore"
import { hasFeature } from "../../services/featureService"
import FeatureLockedModal from "./FeatureLockedModal"

interface FeatureGuardProps {
  featureCode: string
  featureName: string
  requiredPlan: string
  fallback?: React.ReactNode
  children: React.ReactNode
}

export default function FeatureGuard({
  featureCode,
  featureName,
  requiredPlan,
  fallback,
  children,
}: FeatureGuardProps) {
  const userId = useAuthStore((s) => s.userId)
  const [loading, setLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)
  const [showModal, setShowModal] = useState(false)

  const check = useCallback(async () => {
    if (!userId) {
      setLoading(false)
      setHasAccess(false)
      return
    }
    setLoading(true)
    try {
      const allowed = await hasFeature(userId, featureCode)
      setHasAccess(allowed)
    } catch {
      setHasAccess(false)
    } finally {
      setLoading(false)
    }
  }, [userId, featureCode])

  useEffect(() => {
    check()
  }, [check])

  if (loading) {
    return (
      <div className="animate-pulse rounded-[var(--radius-cm)] bg-cm-accent-soft/50 min-h-[48px]" />
    )
  }

  if (hasAccess) {
    return <>{children}</>
  }

  return (
    <>
      <div onClick={() => setShowModal(true)} className="cursor-pointer">
        {fallback ?? children}
      </div>
      <FeatureLockedModal
        open={showModal}
        onClose={() => setShowModal(false)}
        featureName={featureName}
        requiredPlan={requiredPlan}
        onUpgrade={() => {
          setShowModal(false)
          window.location.href = "/settings/subscription/plans"
        }}
      />
    </>
  )
}
