import { Shield, Scan, Briefcase, CreditCard, ShieldAlert, AlertTriangle } from "lucide-react";
import type { UnifiedTrustScore } from "../../services/admin/trust.service";

function scoreColor(score: number, inverted = false): string {
  const val = inverted ? score : score;
  if (inverted) {
    return val >= 50 ? "text-red-500" : val >= 20 ? "text-amber-500" : "text-emerald-500";
  }
  return val >= 80 ? "text-emerald-500" : val >= 50 ? "text-amber-500" : "text-red-500";
}

function scoreBg(inverted = false): string {
  return inverted ? "bg-red-50" : "bg-emerald-50";
}

function barColor(score: number, inverted = false): string {
  if (inverted) return score >= 50 ? "bg-red-500" : score >= 20 ? "bg-amber-500" : "bg-emerald-500";
  return score >= 80 ? "bg-emerald-500" : score >= 50 ? "bg-amber-500" : "bg-red-500";
}

interface ScoreBarProps {
  label: string;
  icon: React.ReactNode;
  score: number;
  inverted?: boolean;
  suffix?: React.ReactNode;
}

function ScoreBar({ label, icon, score, inverted, suffix }: ScoreBarProps) {
  return (
    <div className="min-w-[160px]">
      <div className="flex items-center justify-between mb-1">
        <span className="flex items-center gap-1 text-[11px] text-cm-text-muted">
          {icon} {label}
        </span>
        <span className={`text-[11px] font-medium ${scoreColor(score, inverted)}`}>
          {score}/100
        </span>
      </div>
      <div className="h-1.5 bg-cm-surface rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${barColor(score, inverted)}`}
          style={{ width: `${Math.min(score, 100)}%` }}
        />
      </div>
      {suffix && <div className="mt-0.5">{suffix}</div>}
    </div>
  );
}

interface TrustScoreCardProps {
  scores: UnifiedTrustScore;
  loading?: boolean;
}

export default function TrustScoreCard({ scores, loading }: TrustScoreCardProps) {
  if (loading) {
    return (
      <div className="bg-cm-elevated border border-cm-border rounded-xl p-4 animate-pulse">
        <div className="h-4 w-32 bg-cm-border-soft rounded mb-4" />
        <div className="flex flex-wrap items-start gap-6">
          <div className="w-16 h-16 rounded-full bg-cm-border-soft" />
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-6 w-40 bg-cm-surface rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const statusLabel = scores.overall >= 80 ? "Fiable" : scores.overall >= 50 ? "À surveiller" : "Risqué";
  const statusEmoji = scores.overall >= 80 ? "🟢" : scores.overall >= 50 ? "🟡" : "🔴";
  const overallRingColor = scores.overall >= 80
    ? "#10b981"
    : scores.overall >= 50
    ? "#f59e0b"
    : "#ef4444";
  const overallTextColor = scoreColor(scores.overall);

  return (
    <div className="bg-cm-elevated border border-cm-border rounded-xl p-4">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-4 h-4 text-cm-text-muted" />
        <h3 className="text-[13px] font-semibold text-cm-text">Score de Confiance</h3>
        <span className="text-[10px] text-cm-text-muted ml-auto">
          {scores.last_assessed
            ? `Mis à jour ${new Date(scores.last_assessed).toLocaleDateString("fr-FR")}`
            : "Non évalué"}
        </span>
      </div>
      <div className="flex flex-wrap items-start gap-6">
        {/* Overall gauge */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative w-16 h-16">
            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--cm-border)" strokeWidth="2.5" />
              <circle
                cx="18" cy="18" r="15.5" fill="none"
                stroke={overallRingColor}
                strokeWidth="2.5"
                strokeDasharray={`${Math.min(scores.overall, 100) * 0.97} 97`}
                strokeLinecap="round"
              />
            </svg>
            <span className={`absolute inset-0 flex items-center justify-center text-[16px] font-bold ${overallTextColor}`}>
              {scores.overall}
            </span>
          </div>
          <div>
            <p className="text-[12px] font-semibold text-cm-text">Score global</p>
            <p className={`text-[11px] font-medium ${overallTextColor}`}>
              {statusEmoji} {statusLabel}
            </p>
          </div>
        </div>

        {/* Sub-scores */}
        <div className="flex flex-wrap gap-4">
          <ScoreBar label="KYC" icon={<Scan className="w-3 h-3" />} score={scores.kyc} />
          <ScoreBar label="Activité" icon={<Briefcase className="w-3 h-3" />} score={scores.activity} />
          <ScoreBar label="Paiements" icon={<CreditCard className="w-3 h-3" />} score={scores.payment_reliability} />
          <ScoreBar
            label="Fraude"
            icon={<ShieldAlert className="w-3 h-3" />}
            score={scores.fraud_score}
            inverted
            suffix={
              scores.fraud_flags > 0 ? (
                <p className="text-[10px] text-red-500 font-medium flex items-center gap-1 mt-0.5">
                  <AlertTriangle className="w-2.5 h-2.5" />
                  {scores.fraud_flags} signalement{scores.fraud_flags > 1 ? "s" : ""}
                </p>
              ) : null
            }
          />
        </div>
      </div>
    </div>
  );
}
