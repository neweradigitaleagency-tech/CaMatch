import { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import type { ProfileMode } from "./profil/types";
import type { ProfessionalDetails, Service, PortfolioItem, ProVerification, Badge, ProOffer } from "../types";
import ProfileHeader from "./profil/ProfileHeader";
import HeroSection from "./profil/HeroSection";
import InfoCardSection from "./profil/InfoCardSection";
import StatsSection from "./profil/StatsSection";
import BioSection from "./profil/BioSection";
import BadgesSection from "./profil/BadgesSection";
import OffersSection from "./profil/OffersSection";
import PricingSection from "./profil/PricingSection";
import ServicesSection from "./profil/ServicesSection";
import PortfolioSection from "./profil/PortfolioSection";
import ReviewsSection from "./profil/ReviewsSection";
import PracticalInfoSection from "./profil/PracticalInfoSection";
import BottomCTA from "./profil/BottomCTA";
import { OfferModal, ServiceModal } from "./profil/Modals";
import ImageViewer from "./ImageViewer";

interface ProfilProScreenProps {
  mode: ProfileMode;
  pro: ProfessionalDetails;
  services: Service[];
  portfolio?: PortfolioItem[];
  verification?: ProVerification;
  reviews?: {
    clientName: string;
    clientAvatar: string;
    rating: number;
    comment: string;
    createdAt: string;
    photos?: string[];
    reply?: { text: string; createdAt: string };
  }[];
  badges?: Badge[];
  onBack: () => void;
  onSave?: (updates: Partial<ProfessionalDetails>) => void;
}

export default function ProfilProScreen({
  mode, pro, services, portfolio, verification, reviews, badges, onBack, onSave,
}: ProfilProScreenProps) {
  const nav = useNavigate();
  const [editing, setEditing] = useState(false);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [editForm, setEditForm] = useState<Partial<ProfessionalDetails>>({});
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIdx, setGalleryIdx] = useState(0);

  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [offerModalMode, setOfferModalMode] = useState<"create" | "edit">("create");
  const [editingOffer, setEditingOffer] = useState<ProOffer | undefined>();

  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [serviceModalMode, setServiceModalMode] = useState<"create" | "edit">("create");
  const [editingService, setEditingService] = useState<Service | undefined>();

  const [localOffers, setLocalOffers] = useState<ProOffer[]>(pro.offers || []);
  const [localServices, setLocalServices] = useState<Service[]>(services);
  const [localPortfolio, setLocalPortfolio] = useState<PortfolioItem[]>(portfolio || []);

  const handleUpdate = useCallback((field: string, value: string | number | string[]) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleEdit = useCallback(() => {
    setEditing(true);
    setEditForm({
      bio: pro.bio,
      title: pro.title,
      hourlyRateXOF: pro.hourlyRateXOF,
      locationNeighborhood: pro.locationNeighborhood,
      phoneNumber: pro.phoneNumber || "",
    });
  }, [pro]);

  const handleSave = useCallback(() => {
    onSave?.(editForm);
    setEditing(false);
  }, [editForm, onSave]);

  const handleCancel = useCallback(() => {
    setEditing(false);
    setEditForm({});
  }, []);

  // The effective pro combining original data + edits
  const effectivePro = useMemo(() => {
    if (!editing || Object.keys(editForm).length === 0) return pro;
    return { ...pro, ...editForm };
  }, [pro, editForm, editing]);

  const selectedServices = useMemo(
    () => localServices.filter((s) => selectedServiceIds.includes(s.id)),
    [localServices, selectedServiceIds],
  );

  const handleToggleService = useCallback((serviceId: string) => {
    setSelectedServiceIds((prev) =>
      prev.includes(serviceId) ? prev.filter((id) => id !== serviceId) : [...prev, serviceId],
    );
  }, []);

  const handleInitiateMatch = useCallback(() => {
    const active = selectedServices.length > 0 ? selectedServices : (localServices.length > 0 ? [localServices[0]!] : []);
    if (active.length === 0) return;
    nav("/explorer/matching", {
      state: {
        pro: effectivePro,
        services: active,
        mode: mode === "preview" ? "simulation" : "live",
      },
    });
  }, [selectedServices, localServices, effectivePro, nav, mode]);

  // Offer handlers
  const handleAddOffer = useCallback(() => {
    setOfferModalMode("create");
    setEditingOffer(undefined);
    setOfferModalOpen(true);
  }, []);

  const handleEditOffer = useCallback((offer: ProOffer) => {
    setOfferModalMode("edit");
    setEditingOffer(offer);
    setOfferModalOpen(true);
  }, []);

  const handleDeleteOffer = useCallback((offerId: string) => {
    setLocalOffers((prev) => prev.filter((o) => o.id !== offerId));
  }, []);

  const handleSaveOffer = useCallback((offer: Omit<ProOffer, "id"> | ProOffer) => {
    if ("id" in offer) {
      setLocalOffers((prev) => prev.map((o) => (o.id === offer.id ? offer : o)));
    } else {
      const newOffer: ProOffer = { ...offer, id: `offer_${Date.now()}` };
      setLocalOffers((prev) => [...prev, newOffer]);
    }
    setOfferModalOpen(false);
  }, []);

  // Service handlers
  const handleAddService = useCallback(() => {
    setServiceModalMode("create");
    setEditingService(undefined);
    setServiceModalOpen(true);
  }, []);

  const handleDeleteService = useCallback((serviceId: string) => {
    setLocalServices((prev) => prev.filter((s) => s.id !== serviceId));
  }, []);

  const handleSaveService = useCallback((data: Omit<Service, "id" | "proId"> | Service) => {
    if ("id" in data && "proId" in data) {
      setLocalServices((prev) => prev.map((s) => (s.id === data.id ? data as Service : s)));
    } else {
      const newService: Service = {
        ...(data as Omit<Service, "id" | "proId">),
        id: `svc_${Date.now()}`,
        proId: effectivePro.id,
      };
      setLocalServices((prev) => [...prev, newService]);
    }
    setServiceModalOpen(false);
  }, [effectivePro.id]);

  // Portfolio handlers
  const handleAddPortfolio = useCallback((url: string, caption: string) => {
    const item: PortfolioItem = {
      id: `port_${Date.now()}`,
      category: effectivePro.category,
      imageUrl: url,
      caption,
      createdAt: new Date().toISOString(),
    };
    setLocalPortfolio((prev) => [...prev, item]);
  }, [effectivePro.category]);

  const handleDeletePortfolio = useCallback((itemId: string) => {
    setLocalPortfolio((prev) => prev.filter((p) => p.id !== itemId));
  }, []);

  // Review reply
  const [localReviews, setLocalReviews] = useState<{
    clientName: string; clientAvatar: string; rating: number; comment: string; createdAt: string;
    photos?: string[]; reply?: { text: string; createdAt: string };
  }[]>(reviews?.map((r) => ({ ...r })) || []);
  const handleReplyToReview = useCallback((index: number, reply: string) => {
    setLocalReviews((prev) => {
      const next = [...prev];
      const item = next[index];
      if (item) {
        next[index] = { ...item, reply: { text: reply, createdAt: new Date().toISOString() } };
      }
      return next;
    });
  }, []);

  return (
    <div className="flex flex-col w-full min-h-dynamic bg-gray-50">
      <ProfileHeader
        mode={mode}
        proName={effectivePro.name}
        editing={editing}
        onBack={onBack}
        onEdit={handleEdit}
        onSave={handleSave}
        onCancel={handleCancel}
      />

      <HeroSection mode={mode} editing={editing} pro={effectivePro} onUpdate={handleUpdate} />
      <InfoCardSection mode={mode} editing={editing} pro={effectivePro} onUpdate={handleUpdate} />
      <StatsSection mode={mode} pro={effectivePro} />
      <BioSection mode={mode} editing={editing} pro={effectivePro} onUpdate={handleUpdate} />

      {mode === "owner" && editing && (
        <div className="px-4">
          <div className="bg-white border border-gray-100 rounded-[20px] p-4 shadow-sm">
            <h3 className="text-[11px] font-black text-gray-700 uppercase tracking-wider mb-3">Informations générales</h3>
            <div className="space-y-3">
              <div>
                <label className="text-[9px] font-black text-gray-500 uppercase tracking-wider mb-1.5 block">Titre professionnel</label>
                <input value={(editForm.title as string) || ""} onChange={(e) => handleUpdate("title", e.target.value)}
                  className="w-full h-11 rounded-[12px] border border-gray-200 bg-white px-3 text-[13px] outline-none focus:ring-1 focus:ring-gray-300" />
              </div>
              <div>
                <label className="text-[9px] font-black text-gray-500 uppercase tracking-wider mb-1.5 block">Localisation</label>
                <input value={(editForm.locationNeighborhood as string) || ""} onChange={(e) => handleUpdate("locationNeighborhood", e.target.value)}
                  className="w-full h-11 rounded-[12px] border border-gray-200 bg-white px-3 text-[13px] outline-none focus:ring-1 focus:ring-gray-300" />
              </div>
            </div>
          </div>
        </div>
      )}

      <BadgesSection badges={badges} />

      {localOffers.length > 0 || (mode === "owner" && editing) ? (
        <OffersSection
          mode={mode} editing={editing} pro={effectivePro}
          offers={localOffers}
          onAddOffer={handleAddOffer}
          onEditOffer={handleEditOffer}
          onDeleteOffer={handleDeleteOffer}
        />
      ) : null}

      <PricingSection mode={mode} editing={editing} pro={effectivePro} onUpdate={handleUpdate} />

      <ServicesSection
        mode={mode} editing={editing} pro={effectivePro}
        services={localServices}
        selectedServiceIds={selectedServiceIds}
        onToggleService={mode !== "owner" ? handleToggleService : undefined}
        onAddService={handleAddService}
        onDeleteService={handleDeleteService}
      />

      {localPortfolio.length > 0 || (mode === "owner" && editing) ? (
        <PortfolioSection
          mode={mode} editing={editing} pro={effectivePro}
          portfolio={localPortfolio}
          onAddPortfolio={handleAddPortfolio}
          onDeletePortfolio={handleDeletePortfolio}
        />
      ) : null}

      <ReviewsSection
        mode={mode} editing={editing} pro={effectivePro}
        reviews={localReviews}
        onReplyToReview={handleReplyToReview}
      />

      <PracticalInfoSection mode={mode} editing={editing} pro={effectivePro} onUpdate={handleUpdate} />

      <div className="h-24" />

      <BottomCTA
        mode={mode}
        editing={editing}
        hasSelectedServices={selectedServiceIds.length > 0}
        selectedCount={selectedServiceIds.length}
        onInitiateMatch={handleInitiateMatch}
        onSave={handleSave}
      />

      {/* Modals */}
      <OfferModal
        open={offerModalOpen}
        mode={offerModalMode}
        initial={editingOffer}
        onClose={() => setOfferModalOpen(false)}
        onSave={handleSaveOffer}
      />

      <ServiceModal
        open={serviceModalOpen}
        mode={serviceModalMode}
        initial={editingService}
        onClose={() => setServiceModalOpen(false)}
        onSave={handleSaveService}
      />

      {/* Image viewer */}
      {localPortfolio.length > 0 && (
        <ImageViewer
          images={localPortfolio.map((p) => ({ url: p.imageUrl, title: p.caption }))}
          initialIndex={galleryIdx}
          open={galleryOpen}
          onClose={() => setGalleryOpen(false)}
        />
      )}
    </div>
  );
}
