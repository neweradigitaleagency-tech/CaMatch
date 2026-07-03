import type { ReactNode } from "react";
import type { ProfessionalDetails, Service, PortfolioItem, ProVerification, Badge, ProOffer } from "../../types";

export type ProfileMode = "client" | "preview" | "owner";
export type BookingMode = "live" | "simulation";

export interface BookingContextData {
  mode: BookingMode;
  professionalId: string;
  professionalName: string;
  professionalAvatar: string;
  selectedServices: Service[];
  travelFeeXOF: number;
  date?: string;
  time?: string;
  address?: string;
  notes?: string;
}

export interface ProfileSectionProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  editable?: boolean;
}

export interface ProfileHeaderProps {
  mode: ProfileMode;
  proName?: string;
  editing?: boolean;
  onBack: () => void;
  onEdit?: () => void;
  onSave?: () => void;
  onCancel?: () => void;
}

export interface EditableFieldProps {
  value: string | number;
  editing: boolean;
  onChange?: (value: string) => void;
  type?: "text" | "number" | "textarea";
  multiline?: boolean;
  suffix?: string;
  placeholder?: string;
  className?: string;
}

export interface SectionBaseProps {
  mode: ProfileMode;
  editing?: boolean;
  pro: ProfessionalDetails;
  onUpdate?: (field: string, value: string | number | string[]) => void;
}

export interface SectionWithServicesProps extends SectionBaseProps {
  services: Service[];
  selectedServiceIds?: string[];
  onToggleService?: (serviceId: string) => void;
  onAddService?: (service: Omit<Service, "id" | "proId">) => void;
  onEditService?: (service: Service) => void;
  onDeleteService?: (serviceId: string) => void;
}

export interface SectionWithOffersProps extends SectionBaseProps {
  offers: ProOffer[];
  onAddOffer?: (offer: Omit<ProOffer, "id">) => void;
  onEditOffer?: (offer: ProOffer) => void;
  onDeleteOffer?: (offerId: string) => void;
}

export interface SectionWithPortfolioProps extends SectionBaseProps {
  portfolio: PortfolioItem[];
  onAddPortfolio?: (url: string, caption: string) => void;
  onDeletePortfolio?: (itemId: string) => void;
}

export interface SectionWithReviewsProps extends SectionBaseProps {
  reviews: {
    clientName: string;
    clientAvatar: string;
    rating: number;
    comment: string;
    createdAt: string;
    photos?: string[];
    reply?: { text: string; createdAt: string };
  }[];
  onReplyToReview?: (reviewIndex: number, reply: string) => void;
}

export interface BottomCTAProps {
  mode: ProfileMode;
  editing?: boolean;
  hasSelectedServices?: boolean;
  selectedCount?: number;
  onInitiateMatch?: () => void;
  onSave?: () => void;
}

export interface OfferModalProps {
  open: boolean;
  mode: "create" | "edit";
  initial?: ProOffer;
  onClose: () => void;
  onSave: (offer: Omit<ProOffer, "id"> | ProOffer) => void;
}

export interface ServiceModalProps {
  open: boolean;
  mode: "create" | "edit";
  initial?: Service;
  onClose: () => void;
  onSave: (service: Omit<Service, "id" | "proId"> | Service) => void;
}
