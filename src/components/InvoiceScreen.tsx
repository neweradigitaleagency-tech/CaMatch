import { motion } from "motion/react";
import { useState } from "react";
import { ArrowLeft, Download, MapPin, FileText, Star, CheckCircle, Camera } from "lucide-react";
import type { Invoice, Mission } from "../types";
import ImageViewer from "./ImageViewer";

interface InvoiceScreenProps {
  mission: Mission;
  invoice: Invoice;
  onBack: () => void;
}

function formatXOF(amount: number): string {
  return amount.toLocaleString("fr-FR") + " FCFA";
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function InvoiceScreen({ mission, invoice, onBack }: InvoiceScreenProps) {
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const allPhotos = [
    ...(invoice.beforePhotos || []).map(u => ({ url: u, title: "Avant" })),
    ...(invoice.afterPhotos || []).map(u => ({ url: u, title: "Après" })),
  ];

  return (
    <div className="flex flex-col w-full min-h-screen bg-cm-bg pb-32">
      <header className="flex items-center justify-between px-4 py-3 sticky top-0 z-10 bg-cm-elevated border-b border-cm-border">
        <button onClick={onBack}
          className="w-10 h-10 flex items-center justify-center rounded-full text-cm-text hover:bg-cm-accent-soft transition-colors cursor-pointer active:scale-95">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-[14px] font-display font-bold text-cm-text">Facture</h1>
        <button
          className="w-10 h-10 flex items-center justify-center rounded-full text-cm-text hover:bg-cm-accent-soft transition-colors cursor-pointer active:scale-95">
          <Download className="w-5 h-5" />
        </button>
      </header>

      <div className="flex-1 px-4 pt-5 space-y-6">
        <div className="bg-cm-elevated rounded-2xl p-5 border border-cm-border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[11px] font-mono text-cm-text-soft uppercase tracking-wider">Facture #</p>
              <p className="text-[13px] font-mono text-cm-text font-medium">{invoice.id}</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] font-mono text-cm-text-soft uppercase tracking-wider">Date</p>
              <p className="text-[13px] font-mono text-cm-text font-medium">{formatDate(invoice.createdAt)}</p>
            </div>
          </div>

          <div className="h-px bg-cm-border my-4" />

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-cm-text-soft mt-0.5 shrink-0" />
              <div>
                <p className="text-[11px] font-mono text-cm-text-soft uppercase">Adresse</p>
                <p className="text-[13px] text-cm-text">{invoice.address}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <FileText className="w-4 h-4 text-cm-text-soft mt-0.5 shrink-0" />
              <div>
                <p className="text-[11px] font-mono text-cm-text-soft uppercase">Motif</p>
                <p className="text-[13px] text-cm-text">{invoice.reason}</p>
              </div>
            </div>
          </div>
        </div>

        {(invoice.beforePhotos.length > 0 || invoice.afterPhotos.length > 0) && (
          <div className="bg-cm-elevated rounded-2xl p-5 border border-cm-border">
            <h3 className="text-[13px] font-display font-bold text-cm-text mb-3 flex items-center gap-2">
              <Camera className="w-4 h-4" />
              Photos avant / après
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {invoice.beforePhotos.map((url, i) => (
                <button key={`before-${i}`} onClick={() => setViewerIndex(i)}
                  className="relative rounded-xl overflow-hidden aspect-[4/3] border border-cm-border cursor-pointer group">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <span className="absolute top-2 left-2 text-[10px] font-mono bg-black/60 text-white px-2 py-0.5 rounded-full">Avant</span>
                </button>
              ))}
              {invoice.afterPhotos.map((url, i) => (
                <button key={`after-${i}`} onClick={() => setViewerIndex(invoice.beforePhotos.length + i)}
                  className="relative rounded-xl overflow-hidden aspect-[4/3] border border-cm-border cursor-pointer group">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <span className="absolute top-2 left-2 text-[10px] font-mono bg-cm-accent/80 text-white px-2 py-0.5 rounded-full">Après</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="bg-cm-elevated rounded-2xl p-5 border border-cm-border">
          <h3 className="text-[13px] font-display font-bold text-cm-text mb-4">Détail des coûts</h3>
          <div className="space-y-2.5">
            <div className="flex justify-between text-[13px]">
              <span className="text-cm-text-soft">Main-d'œuvre</span>
              <span className="text-cm-text font-mono font-medium">{formatXOF(invoice.laborCostXOF)}</span>
            </div>
            <div className="flex justify-between text-[13px]">
              <span className="text-cm-text-soft">Matériaux</span>
              <span className="text-cm-text font-mono font-medium">{formatXOF(invoice.materialsCostXOF)}</span>
            </div>
            <div className="flex justify-between text-[13px]">
              <span className="text-cm-text-soft">Déplacement</span>
              <span className="text-cm-text font-mono font-medium">{formatXOF(invoice.travelCostXOF)}</span>
            </div>
            <div className="h-px bg-cm-border my-2" />
            <div className="flex justify-between text-[14px] font-display font-bold">
              <span className="text-cm-text">Total</span>
              <span className="text-cm-text font-mono">{formatXOF(invoice.totalXOF)}</span>
            </div>
          </div>
        </div>

        <div className="bg-cm-elevated rounded-2xl p-5 border border-cm-border">
          <h3 className="text-[13px] font-display font-bold text-cm-text mb-4">Commission</h3>
          <div className="space-y-2.5">
            <div className="flex justify-between text-[13px]">
              <span className="text-cm-text-soft">Frais de service ({invoice.commissionPercent}%)</span>
              <span className="text-cm-text font-mono">-{formatXOF(invoice.commissionXOF)}</span>
            </div>
            <div className="h-px bg-cm-border my-2" />
            <div className="flex justify-between text-[14px] font-display font-bold">
              <span className="text-cm-accent">Net versé au pro</span>
              <span className="text-cm-accent font-mono">{formatXOF(invoice.proAmountXOF)}</span>
            </div>
          </div>
          <div className="mt-3 p-3 bg-cm-accent-soft/50 rounded-xl">
            <p className="text-[11px] text-cm-text-soft text-center">
              Le professionnel reçoit {formatXOF(invoice.proAmountXOF)} sur {formatXOF(invoice.totalXOF)} après déduction des frais de plateforme.
            </p>
          </div>
        </div>

        {invoice.clientRating && (
          <div className="bg-cm-elevated rounded-2xl p-5 border border-cm-border">
            <h3 className="text-[13px] font-display font-bold text-cm-text mb-3 flex items-center gap-2">
              <Star className="w-4 h-4 text-cm-accent" />
              Évaluation du client
            </h3>
            <div className="flex items-center gap-1 mb-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${i < (invoice.clientRating || 0) ? "text-cm-accent fill-cm-accent" : "text-cm-border"}`}
                />
              ))}
              <span className="text-[13px] font-mono text-cm-text ml-2">{(invoice.clientRating || 0) / 2}/5</span>
            </div>
            {invoice.clientComment && (
              <p className="text-[13px] text-cm-text-soft italic">"{invoice.clientComment}"</p>
            )}
          </div>
        )}

        <div className="flex items-center justify-center gap-2 py-4">
          <CheckCircle className="w-4 h-4 text-cm-accent" />
          <span className="text-[12px] font-mono text-cm-text-soft">
            Paiement confirmé le {formatDate(invoice.paidAt || invoice.createdAt)}
          </span>
        </div>
      </div>

      <ImageViewer
        images={allPhotos}
        initialIndex={viewerIndex ?? undefined}
        open={viewerIndex !== null}
        onClose={() => setViewerIndex(null)}
      />
    </div>
  );
}
