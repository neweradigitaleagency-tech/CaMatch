/**
 * Illustrations cartoon 2D (SVG inline) pour l'onboarding « Ça Match ».
 * Palette thème : forest #243318, lime #AECB2A, lime-soft #E4EDD0, beige #EDE8DC, ambre #F59E0B.
 */

export function PlumberIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true">
      {/* sol */}
      <ellipse cx="100" cy="172" rx="82" ry="12" fill="#E4EDD0" />
      {/* tuyau */}
      <rect x="26" y="128" width="96" height="18" rx="9" fill="#9AA0A6" />
      <rect x="26" y="128" width="96" height="7" fill="#B9BEC4" />
      <rect x="26" y="118" width="12" height="38" rx="6" fill="#9AA0A6" />
      <rect x="110" y="118" width="12" height="38" rx="6" fill="#9AA0A6" />
      {/* goutte */}
      <path d="M132 96 q6 12 0 18 q-6 -6 0 -18" fill="#8FC7E8" />
      {/* clé à molette */}
      <g transform="rotate(-32 116 96)">
        <rect x="100" y="46" width="26" height="98" rx="13" fill="#AECB2A" />
        <rect x="104" y="46" width="18" height="98" rx="9" fill="#C9E345" />
        <circle cx="113" cy="32" r="17" fill="none" stroke="#AECB2A" strokeWidth="10" />
        <circle cx="113" cy="32" r="6" fill="#243318" />
      </g>
      {/* corps */}
      <rect x="112" y="104" width="38" height="34" rx="14" fill="#243318" />
      <rect x="118" y="102" width="26" height="6" rx="3" fill="#AECB2A" />
      {/* bras */}
      <rect x="100" y="112" width="30" height="11" rx="5.5" fill="#F2C79B" />
      <rect x="132" y="112" width="30" height="11" rx="5.5" fill="#F2C79B" />
      {/* jambes */}
      <rect x="114" y="136" width="11" height="30" rx="5.5" fill="#243318" />
      <rect x="137" y="136" width="11" height="30" rx="5.5" fill="#243318" />
      {/* tête */}
      <circle cx="131" cy="86" r="23" fill="#F2C79B" />
      {/* yeux */}
      <circle cx="123" cy="85" r="2.6" fill="#243318" />
      <circle cx="139" cy="85" r="2.6" fill="#243318" />
      <path d="M126 94 q5 4 10 0" stroke="#243318" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* casquette */}
      <path d="M108 76 q22 -20 46 0 l2 10 q-25 7 -50 0 z" fill="#AECB2A" />
      <circle cx="131" cy="82" r="5" fill="#E4EDD0" />
    </svg>
  );
}

export function TrustIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true">
      {/* disque de fond */}
      <circle cx="100" cy="100" r="82" fill="#E4EDD0" />
      {/* maison */}
      <rect x="48" y="98" width="84" height="62" rx="8" fill="#FFFFFF" stroke="#243318" strokeWidth="4" />
      <path d="M34 100 L90 48 L146 100 Z" fill="#243318" />
      <rect x="86" y="122" width="22" height="38" rx="4" fill="#AECB2A" />
      <circle cx="103" cy="141" r="3" fill="#243318" />
      <rect x="58" y="110" width="18" height="18" rx="3" fill="#C9E345" />
      <path d="M62 119 h10 M67 114 v10" stroke="#243318" strokeWidth="2" strokeLinecap="round" />
      {/* bouclier */}
      <path
        d="M118 30 h46 v30 c0 24 -23 44 -23 44 s-23 -20 -23 -44 z"
        fill="#AECB2A"
        stroke="#243318"
        strokeWidth="4"
      />
      <path d="M130 60 l9 10 l19 -22" stroke="#243318" strokeWidth="7" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {/* éclair */}
      <path d="M34 58 h22 l-12 18 h20 l-28 34 6 -26 h-20 z" fill="#F59E0B" stroke="#243318" strokeWidth="2" strokeLinejoin="round" />
      {/* pièce */}
      <circle cx="52" cy="160" r="12" fill="#F59E0B" />
      <circle cx="52" cy="160" r="8" fill="#F8C76B" />
      <text x="52" y="164" textAnchor="middle" fontSize="11" fontWeight="800" fill="#243318">F</text>
    </svg>
  );
}

export function FastIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true">
      {/* disque de fond */}
      <circle cx="100" cy="100" r="82" fill="#E4EDD0" />
      {/* lignes de vitesse */}
      <path d="M38 34 h30 M40 44 h20 M36 152 h26 M34 162 h18" stroke="#AECB2A" strokeWidth="5" strokeLinecap="round" />
      <path d="M164 34 h-30 M162 44 h-20 M164 152 h-26 M166 162 h-18" stroke="#AECB2A" strokeWidth="5" strokeLinecap="round" />
      {/* fusée */}
      <path d="M100 22 C130 52 132 84 120 108 H80 C68 84 70 52 100 22 Z" fill="#FFFFFF" stroke="#243318" strokeWidth="4" />
      <circle cx="100" cy="64" r="12" fill="#AECB2A" />
      <circle cx="100" cy="64" r="5" fill="#243318" />
      {/* ailerons */}
      <path d="M80 100 L54 130 L80 124 Z" fill="#AECB2A" stroke="#243318" strokeWidth="3" strokeLinejoin="round" />
      <path d="M120 100 L146 130 L120 124 Z" fill="#AECB2A" stroke="#243318" strokeWidth="3" strokeLinejoin="round" />
      {/* flamme */}
      <path d="M84 116 q16 30 32 0 q-6 22 -16 22 q-12 0 -16 -22 z" fill="#F59E0B" />
      <path d="M92 124 q8 16 16 0 q-3 10 -8 10 q-5 0 -8 -10 z" fill="#F8C76B" />
      {/* étoiles */}
      <circle cx="150" cy="42" r="4" fill="#243318" />
      <circle cx="40" cy="120" r="3.5" fill="#243318" />
      <circle cx="162" cy="96" r="3" fill="#243318" />
    </svg>
  );
}
