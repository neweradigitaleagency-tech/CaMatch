import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Star, ShieldCheck, Award, Check, Truck, Store, ShoppingCart, ExternalLink } from "lucide-react";
import type { Proposal } from "../../types";
import { GlassCard, CTAButton, VerifiedBadge, RatingStars } from "../ui";
import { PROFESSIONAL_SELLERS } from "../../data/marketplaceSuppliers";
import { MARKETPLACE_PRODUCTS } from "../../data/marketplaceProducts";
import type { MaterialProduct } from "../../types/marketplace";

interface ProposalDetailScreenProps {
  proposal: Proposal;
  onBack: () => void;
  onChoose: () => void;
  loading?: boolean;
}

function findRealProduct(matName: string): { product: MaterialProduct; seller: (typeof PROFESSIONAL_SELLERS)[number] } | null {
  const q = matName.toLowerCase();
  for (const seller of PROFESSIONAL_SELLERS) {
    if (seller.verificationStatus !== "active") continue;
    const product = MARKETPLACE_PRODUCTS.find(
      (p): p is MaterialProduct =>
        p.vertical === "pro_supply" && "supplierId" in p && p.sellerId === seller.id &&
        p.isAvailable && p.name.toLowerCase().includes(q),
    );
    if (product) return { product, seller };
  }
  return null;
}

export default function ProposalDetailScreen({ proposal, onBack, onChoose, loading }: ProposalDetailScreenProps) {
  const nav = useNavigate();
  const [removedMaterials, setRemovedMaterials] = useState<string[]>([]);
  const [showSupplierDetail, setShowSupplierDetail] = useState<string | null>(null);

  const visibleMaterials = proposal.materials.filter((m) => !removedMaterials.includes(m.id));
  const materialsTotal = visibleMaterials.reduce((s, m) => s + m.totalXOF, 0);
  const deliveryTotal = proposal.materialsDeliveryXOF;
  const grandTotal = proposal.laborPriceXOF + materialsTotal + deliveryTotal;

  return (
    <div className="flex flex-col w-full min-h-dynamic pb-safe bg-[#EDE8DC]">
      <header className="sticky top-0 z-10 bg-[#EDE8DC]">
        <div className="flex items-center gap-3 px-5 h-12">
          <button
            onClick={onBack}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white border border-gray-200 cursor-pointer active:scale-95 shrink-0"
          >
            <ArrowLeft className="w-4 h-4 text-[#1A1A1A]" />
          </button>
          <h1 className="text-[15px] font-bold text-[#1A1A1A]">Détail de la proposition</h1>
        </div>
      </header>

      <main className="flex-1 px-5 pt-4 pb-[max(140px,env(safe-area-inset-bottom,140px))] space-y-4 overflow-y-auto">
        {/* Professionnel */}
        <div className="bg-white rounded-xl p-4 space-y-3 border border-gray-100">
          <h3 className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">Professionnel</h3>
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-[#EDE8DC] border border-gray-200 overflow-hidden shrink-0">
              {proposal.professionalAvatar ? (
                <img src={proposal.professionalAvatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#1A1A1A] font-bold text-xl">
                  {proposal.professionalName.charAt(0)}
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1.5">
                <p className="text-[14px] font-bold text-[#1A1A1A]">{proposal.professionalName}</p>
                {proposal.isVerified && <VerifiedBadge className="scale-75 origin-left" />}
              </div>
              <RatingStars rating={proposal.professionalRating} size={12} />
              <div className="flex items-center gap-3 mt-1 text-[10px] text-[#6B7280]">
                <span className="flex items-center gap-0.5">
                  <Award className="w-3 h-3" />
                  {proposal.experienceYears} ans
                </span>
                <span className="flex items-center gap-0.5">
                  <Star className="w-3 h-3" />
                  {proposal.reviewCount} avis
                </span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { label: "Trust Score", value: `${Math.round(proposal.trustScore * 100)}%`, icon: ShieldCheck },
              { label: "Complétion", value: `${Math.round((proposal.completionRate || 0) * 100)}%`, icon: Check },
              { label: "Interventions", value: `${proposal.completedInterventions}`, icon: Award },
            ].map((stat) => (
              <div key={stat.label} className="bg-[#EDE8DC] rounded-xl p-2">
                <stat.icon className="w-3.5 h-3.5 mx-auto text-[#AECB2A] mb-0.5" />
                <p className="text-[11px] font-bold text-[#1A1A1A]">{stat.value}</p>
                <p className="text-[8px] text-[#6B7280]">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Main-d'œuvre */}
        <div className="bg-white rounded-xl p-4 space-y-2 border border-gray-100">
          <h3 className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">Main-d'œuvre</h3>
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-[#1A1A1A]">Prix</span>
            <span className="text-[14px] font-bold text-[#1A1A1A] font-mono">{proposal.laborPriceXOF.toLocaleString()} F</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-[#1A1A1A]">Durée estimée</span>
            <span className="text-[12px] font-bold text-[#1A1A1A]">{proposal.estimatedDurationMins} min</span>
          </div>
        </div>

        {/* Matériaux */}
        <div className="bg-white rounded-xl p-4 space-y-3 border border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">Matériaux</h3>
            {visibleMaterials.length > 0 && (
              <span className="text-[9px] text-[#6B7280]">
                {visibleMaterials.length} article{visibleMaterials.length > 1 ? "s" : ""}
              </span>
            )}
          </div>
          {visibleMaterials.length === 0 ? (
            <p className="text-[12px] text-[#6B7280]">Aucun matériau inclus</p>
          ) : (
            <div className="space-y-2">
              {visibleMaterials.map((mat) => {
                const realProduct = mat.supplierId ? findRealProduct(mat.name) : null;
                return (
                  <div key={mat.id} className="bg-[#EDE8DC] rounded-xl p-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[12px] font-bold text-[#1A1A1A]">{mat.name}</p>
                        <p className="text-[10px] text-[#6B7280]">Qté: {mat.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[12px] font-bold text-[#1A1A1A] font-mono">{mat.totalXOF.toLocaleString()} F</p>
                        <p className="text-[9px] text-[#6B7280]">{mat.unitPriceXOF.toLocaleString()} F/unité</p>
                      </div>
                    </div>

                    {mat.supplierName && (
                      <div className="flex items-center gap-1.5 text-[10px] text-[#6B7280] pt-1 border-t border-gray-200/50">
                        <Store className="w-3 h-3" />
                        <span>{mat.supplierName}</span>
                        {mat.supplierPrice && mat.supplierPrice < mat.unitPriceXOF && (
                          <span className="text-[#AECB2A] font-bold ml-auto">
                            -{Math.round((1 - mat.supplierPrice / mat.unitPriceXOF) * 100)}%
                          </span>
                        )}
                        {mat.supplierDelivery && (
                          <span className="flex items-center gap-0.5 ml-1">
                            {mat.supplierDelivery === "delivery" ? <Truck className="w-3 h-3" /> : <Store className="w-3 h-3" />}
                            {mat.supplierDelivery === "delivery" ? "Livraison" : "Retrait"}
                          </span>
                        )}
                      </div>
                    )}

                    {mat.supplierPrice && mat.supplierPrice < mat.unitPriceXOF && (
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-[10px] text-[#6B7280] line-through">{mat.unitPriceXOF.toLocaleString()} F</span>
                        <span className="text-[11px] font-bold text-[#AECB2A]">{mat.supplierPrice.toLocaleString()} F fournisseur</span>
                      </div>
                    )}

                    <div className="flex gap-2 pt-0.5">
                      {mat.supplierId && (
                        <button
                          onClick={() => nav(`/marketplace/shop/${mat.supplierId}`)}
                          className="flex items-center gap-1 text-[9px] text-[#243318] font-medium cursor-pointer hover:underline"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Voir la boutique
                        </button>
                      )}
                      {realProduct && (
                        <button
                          onClick={() => nav(`/marketplace/item/${realProduct.product.id}`)}
                          className="flex items-center gap-1 text-[9px] text-[#6B7280] font-medium cursor-pointer hover:underline"
                        >
                          <Store className="w-3 h-3" />
                          Voir le produit
                        </button>
                      )}
                      <button
                        onClick={() => setRemovedMaterials((prev) => [...prev, mat.id])}
                        className="text-[9px] text-red-500 font-medium cursor-pointer hover:underline ml-auto"
                      >
                        Retirer
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {visibleMaterials.length > 0 && (
            <div className="flex items-center justify-between text-[11px] pt-1">
              <span className="text-[#6B7280]">Total matériaux</span>
              <span className="font-bold text-[#1A1A1A] font-mono">{materialsTotal.toLocaleString()} F</span>
            </div>
          )}
        </div>

        {/* Récapitulatif */}
        <div className="bg-white rounded-xl p-4 space-y-2 border border-gray-100">
          <h3 className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">Récapitulatif</h3>
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-[#6B7280]">Main-d'œuvre</span>
            <span className="font-bold text-[#1A1A1A] font-mono">{proposal.laborPriceXOF.toLocaleString()} F</span>
          </div>
          {materialsTotal > 0 && (
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-[#6B7280]">Matériaux</span>
              <span className="font-bold text-[#1A1A1A] font-mono">{materialsTotal.toLocaleString()} F</span>
            </div>
          )}
          {deliveryTotal > 0 && (
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-[#6B7280]">Livraison</span>
              <span className="font-bold text-[#1A1A1A] font-mono">{deliveryTotal.toLocaleString()} F</span>
            </div>
          )}
          <div className="h-px bg-gray-100 my-1" />
          <div className="flex items-center justify-between text-[15px]">
            <span className="font-bold text-[#1A1A1A]">Total</span>
            <span className="font-bold text-[#1A1A1A] font-mono">{grandTotal.toLocaleString()} F</span>
          </div>
        </div>

        {/* Commande fournisseur */}
        {visibleMaterials.some((m) => m.supplierId) && (
          <div className="bg-[#243318]/5 rounded-xl p-4 border border-[#243318]/10">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-[#243318]/10 flex items-center justify-center shrink-0">
                <ShoppingCart className="w-4 h-4 text-[#243318]" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#1A1A1A]">Matériaux disponibles chez nos fournisseurs</h4>
                <p className="text-[10px] text-[#6B7280] mt-0.5">
                  En choisissant cette proposition, les matériaux seront commandés automatiquement chez les fournisseurs partenaires
                </p>
                <button
                  onClick={() => {
                    const firstSupplier = visibleMaterials.find((m) => m.supplierId);
                    if (firstSupplier?.supplierId) {
                      nav(`/marketplace/shop/${firstSupplier.supplierId}`);
                    }
                  }}
                  className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-[#243318] cursor-pointer hover:underline"
                >
                  Voir les fournisseurs
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 z-20 bg-white/90 backdrop-blur-xl border-t border-gray-100 pb-[env(safe-area-inset-bottom)]">
        <div className="max-w-[448px] mx-auto px-5 py-3">
          <div className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-[9px] text-[#6B7280]">Total à payer</p>
              <p className="text-[16px] font-black text-[#1A1A1A] font-mono">{grandTotal.toLocaleString()} F</p>
            </div>
            <button
              onClick={onChoose}
              disabled={loading}
              className="h-12 px-6 rounded-xl bg-[#243318] text-white text-sm font-bold flex items-center gap-2 cursor-pointer disabled:opacity-30 active:scale-[0.98] transition-all shrink-0"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Choisir
                </>
              )}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
