import { ArrowLeft, MessageSquare, Phone, Mail, ExternalLink, HelpCircle, Shield, FileText } from "lucide-react";

interface ClientHelpScreenProps { onBack: () => void; }

const faqs = [
  { q: "Comment payer un professionnel ?", a: "Après la mission, vous pouvez payer par Orange Money, MTN MoMo ou Wave via le QR code du pro." },
  { q: "Puis-je annuler une demande ?", a: "Oui, tant qu'aucun professionnel n'a accepté. Une fois accepté, contactez le support." },
  { q: "Comment sont calculés les prix ?", a: "Chaque pro fixe ses tarifs. Vous voyez le prix avant de confirmer la mission." },
  { q: "Que faire en cas de litige ?", a: "Contactez notre support via le chat. Nous médiatisons entre le client et le pro." },
];

export default function ClientHelpScreen({ onBack }: ClientHelpScreenProps) {
  return (
    <div className="flex flex-col w-full min-h-screen bg-brand-cream pb-32">
      <header className="flex items-center justify-between px-4 py-3 bg-brand-cream/90 backdrop-blur-md sticky top-0 z-10">
        <button onClick={onBack} className="w-12 h-12 flex items-center justify-center rounded-full bg-white text-brand-forest hover:bg-pale-mint transition-colors shadow-sm cursor-pointer active:scale-95"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="font-sans text-sm font-bold">Aide & support</h1>
        <div className="w-9 h-9" />
      </header>
      <div className="px-4 pt-4 space-y-3">
        <div className="bg-brand-forest rounded-2xl p-4 text-white flex flex-col gap-3">
          <p className="text-caption font-medium uppercase tracking-wider opacity-70">Nous contacter</p>
          <div className="flex gap-2">
            <button className="flex-1 h-10 bg-white/15 rounded-xl text-caption font-medium flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"><MessageSquare className="w-3.5 h-3.5" /> Chat</button>
            <button className="flex-1 h-10 bg-white/15 rounded-xl text-caption font-medium flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"><Phone className="w-3.5 h-3.5" /> Appel</button>
            <button className="flex-1 h-10 bg-white/15 rounded-xl text-caption font-medium flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"><Mail className="w-3.5 h-3.5" /> Email</button>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-pale-mint/20 shadow-sm">
          <h3 className="text-caption font-medium uppercase tracking-wider text-secondary mb-3">Questions fréquentes</h3>
          <div className="space-y-3">
            {faqs.map((f, i) => (
              <details key={i} className="group">
                <summary className="text-xs font-bold cursor-pointer list-none flex items-center justify-between py-1">
                  {f.q}
                  <HelpCircle className="w-3.5 h-3.5 text-secondary/50 group-open:rotate-90 transition-transform" />
                </summary>
                <p className="text-caption text-secondary leading-relaxed mt-1 pl-0">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
