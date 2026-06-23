import { ArrowLeft, MessageSquare, Phone, Mail, HelpCircle } from "lucide-react";

interface ClientHelpScreenProps { onBack: () => void; }

const faqs = [
  { q: "Comment payer un professionnel ?", a: "Après la mission, vous pouvez payer par Orange Money, MTN MoMo ou Wave via le QR code du pro." },
  { q: "Puis-je annuler une demande ?", a: "Oui, tant qu'aucun professionnel n'a accepté. Une fois accepté, contactez le support." },
  { q: "Comment sont calculés les prix ?", a: "Chaque pro fixe ses tarifs. Vous voyez le prix avant de confirmer la mission." },
  { q: "Que faire en cas de litige ?", a: "Contactez notre support via le chat. Nous médiatisons entre le client et le pro." },
];

export default function ClientHelpScreen({ onBack }: ClientHelpScreenProps) {
  return (
    <div className="flex flex-col w-full min-h-screen bg-cm-bg pb-32">
      <header className="flex items-center justify-between px-4 py-3 sticky top-0 z-10 bg-cm-elevated border-b border-cm-border">
        <button onClick={onBack}
          className="w-9 h-9 flex items-center justify-center rounded-[12px] border border-cm-border bg-cm-elevated cursor-pointer active:scale-90 transition-all">
          <ArrowLeft className="w-4 h-4 text-cm-text" />
        </button>
        <h1 className="text-[15px] font-bold text-cm-text">Aide & support</h1>
        <div className="w-9 h-9" />
      </header>
      <div className="px-4 pt-4 space-y-3">
        <div className="bg-cm-text rounded-[16px] p-4 text-white shadow-cm-md">
          <p className="text-[11px] font-medium uppercase tracking-wider opacity-70 mb-3">Nous contacter</p>
          <div className="flex gap-2">
            <button className="flex-1 h-10 bg-white/15 rounded-[10px] text-[12px] font-medium flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all"><MessageSquare className="w-3.5 h-3.5" /> Chat</button>
            <button className="flex-1 h-10 bg-white/15 rounded-[10px] text-[12px] font-medium flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all"><Phone className="w-3.5 h-3.5" /> Appel</button>
            <button className="flex-1 h-10 bg-white/15 rounded-[10px] text-[12px] font-medium flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all"><Mail className="w-3.5 h-3.5" /> Email</button>
          </div>
        </div>
        <div className="bg-cm-elevated border border-cm-border rounded-[16px] p-4 shadow-cm-sm">
          <h3 className="text-[11px] font-medium uppercase tracking-wider text-cm-text-muted mb-3">Questions fréquentes</h3>
          <div className="space-y-3">
            {faqs.map((f, i) => (
              <details key={i} className="group">
                <summary className="text-[13px] font-bold text-cm-text cursor-pointer list-none flex items-center justify-between py-1">
                  {f.q}
                  <HelpCircle className="w-3.5 h-3.5 text-cm-text-muted group-open:rotate-90 transition-transform shrink-0 ml-2" />
                </summary>
                <p className="text-[12px] text-cm-text-soft leading-relaxed mt-1">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
