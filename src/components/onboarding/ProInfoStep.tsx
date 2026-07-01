interface ProInfoStepProps {
  title: string;
  bio: string;
  experienceYears: number;
  hourlyRateXOF: number;
  travelFeeXOF: number;
  onChange: (field: string, value: string | number) => void;
}

export default function ProInfoStep({ title, bio, experienceYears, hourlyRateXOF, travelFeeXOF, onChange }: ProInfoStepProps) {
  return (
    <div>
      <h2 className="text-[18px] font-extrabold text-cm-text mb-1">Informations professionnelles</h2>
      <p className="text-[13px] text-cm-text-soft mb-6">
        Parlez de vous et de votre activité.
      </p>

      <div className="space-y-4">
        <div>
          <label className="text-[12px] font-semibold text-cm-text mb-1.5 block">Titre professionnel</label>
          <input
            type="text"
            value={title}
            onChange={(e) => onChange("title", e.target.value)}
            className="w-full h-11 px-4 text-[13px] bg-cm-elevated border border-cm-border rounded-[12px] outline-none text-cm-text placeholder-cm-text-muted focus:border-cm-accent"
            placeholder="Ex: Plombier expert, Chef cuisinier..."
          />
        </div>

        <div>
          <label className="text-[12px] font-semibold text-cm-text mb-1.5 block">Bio / Description</label>
          <textarea
            value={bio}
            onChange={(e) => onChange("bio", e.target.value)}
            className="w-full h-28 px-4 py-3 text-[13px] bg-cm-elevated border border-cm-border rounded-[12px] outline-none text-cm-text placeholder-cm-text-muted focus:border-cm-accent resize-none"
            placeholder="Décrivez votre expertise, vos spécialités..."
          />
          <span className="text-[10px] text-cm-text-muted">{bio.length} caractères</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[12px] font-semibold text-cm-text mb-1.5 block">Années d'exp.</label>
            <input
              type="number"
              min={0}
              max={50}
              value={experienceYears}
              onChange={(e) => onChange("experienceYears", Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full h-11 px-4 text-[13px] bg-cm-elevated border border-cm-border rounded-[12px] outline-none text-cm-text focus:border-cm-accent"
            />
          </div>
          <div>
            <label className="text-[12px] font-semibold text-cm-text mb-1.5 block">Taux horaire (F CFA)</label>
            <input
              type="number"
              min={1000}
              step={500}
              value={hourlyRateXOF}
              onChange={(e) => onChange("hourlyRateXOF", Math.max(1000, parseInt(e.target.value) || 0))}
              className="w-full h-11 px-4 text-[13px] bg-cm-elevated border border-cm-border rounded-[12px] outline-none text-cm-text focus:border-cm-accent"
            />
          </div>
        </div>

        <div>
          <label className="text-[12px] font-semibold text-cm-text mb-1.5 block">Frais de déplacement (F CFA)</label>
          <input
            type="number"
            min={0}
            step={500}
            value={travelFeeXOF}
            onChange={(e) => onChange("travelFeeXOF", Math.max(0, parseInt(e.target.value) || 0))}
            className="w-full h-11 px-4 text-[13px] bg-cm-elevated border border-cm-border rounded-[12px] outline-none text-cm-text focus:border-cm-accent"
          />
        </div>
      </div>
    </div>
  );
}
