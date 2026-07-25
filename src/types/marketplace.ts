export type MarketplaceVertical = "pro_supply" | "shopping" | "second_hand" | "real_estate"

export const VERTICAL_LABELS: Record<MarketplaceVertical, string> = {
  pro_supply: "Pro Supply",
  shopping: "Shopping",
  second_hand: "Seconde main",
  real_estate: "Immobilier",
}

export const VERTICAL_ICONS: Record<MarketplaceVertical, string> = {
  pro_supply: "building-2",
  shopping: "shopping-bag",
  second_hand: "refresh-cw",
  real_estate: "home",
}

// ─── Seller types ───

export type SellerType = "professional" | "individual" | "ca_match_pro"
export type SellerVerificationStatus = "pending" | "verified" | "active" | "suspended"

export interface SellerBase {
  id: string
  userId: string
  type: SellerType
  verticals: MarketplaceVertical[]
  verificationStatus: SellerVerificationStatus
  rating: number
  reviewCount: number
  totalSales: number
  createdAt: string
  updatedAt: string
}

export interface DeliveryZone {
  id: string
  city: string
  price: number
  estimatedDelayHours: number
  isActive: boolean
}

export interface ProfessionalSeller extends SellerBase {
  type: "professional"
  companyName: string
  slug: string
  logo: string
  banner: string
  description: string
  photos: string[]
  address: string
  city: string
  phone: string
  email: string
  hours: string
  legalDocs: string[]
  categories: string[]
  deliveryZones: DeliveryZone[]
  hasProfessionalPricing: boolean
}

export interface IndividualSeller extends SellerBase {
  type: "individual"
  displayName: string
  photo: string
  city: string
  phone: string
  phoneVerified: boolean
  saleHistory: number
  memberSince: string
}

export interface CaMatchProSeller extends SellerBase {
  type: "ca_match_pro"
  professionalId: string
  businessName: string
  photo: string
  city: string
  hasProfessionalPricing: boolean
  linkedShopId?: string
}

export type Seller = ProfessionalSeller | IndividualSeller | CaMatchProSeller

// ─── Product types ───

export interface ProductBase {
  id: string
  sellerId: string
  vertical: MarketplaceVertical
  name: string
  description: string
  category: string
  subcategory: string
  images: string[]
  price: number
  originalPrice?: number
  currency: "XOF"
  stock: number
  isAvailable: boolean
  location: string
  deliveryAvailable: boolean
  deliveryFee?: number
  status: "active" | "draft" | "archived"
  createdAt: string
  updatedAt: string
}

export interface MaterialProduct extends ProductBase {
  vertical: "pro_supply"
  brand: string
  unit: "piece" | "meter" | "kg" | "liter" | "bag" | "box" | "set"
  dimensions?: string
  compatibility?: string[]
  technicalSpecs?: Record<string, string>
  supplierId: string
  supplierName?: string
  cmPrice?: number
  lowStockThreshold: number
}

export interface ShoppingProduct extends ProductBase {
  vertical: "shopping"
  brand: string
  condition: "new"
  warranty?: string
  colors?: string[]
  sizes?: string[]
  specifications?: Record<string, string>
}

export interface SecondHandProduct extends ProductBase {
  vertical: "second_hand"
  brand: string
  model: string
  storage?: string
  condition: "like_new" | "good" | "fair"
  warranty?: string
  hasOriginalBox: boolean
  hasAccessories: boolean
  defects?: string[]
}

export interface RealEstateProduct extends ProductBase {
  vertical: "real_estate"
  surface: number
  bedrooms: number
  bathrooms: number
  furnished: boolean
  propertyType: "apartment" | "house" | "land" | "commercial"
  transaction: "rent" | "sell" | "airbnb"
  gps: { lat: number; lng: number }
  amenities?: string[]
  yearBuilt?: number
  floor?: number
  totalFloors?: number
}

export type Product = MaterialProduct | ShoppingProduct | SecondHandProduct | RealEstateProduct

// ─── Registration types ───

export type RegistrationStep = "seller_type" | "shop_info" | "verification"

export interface SellerRegistrationDraft {
  step: RegistrationStep
  sellerType: SellerType | null
  vertical: MarketplaceVertical | null
  companyName: string
  description: string
  logo: string
  banner: string
  photos: string[]
  address: string
  city: string
  phone: string
  email: string
  hours: string
  category: string
  deliveryZones: string[]
  legalDocs: { name: string; file: string }[]
  idCard: string
  shopPhotos: string[]
}

export const DEFAULT_REGISTRATION_DRAFT: SellerRegistrationDraft = {
  step: "seller_type",
  sellerType: null,
  vertical: null,
  companyName: "",
  description: "",
  logo: "",
  banner: "",
  photos: [],
  address: "",
  city: "",
  phone: "",
  email: "",
  hours: "",
  category: "",
  deliveryZones: [],
  legalDocs: [],
  idCard: "",
  shopPhotos: [],
}

// ─── Category tree ───

export interface MarketplaceCategory {
  id: string
  vertical: MarketplaceVertical
  name: string
  slug: string
  description: string
  icon: string
  color: string
  children: MarketplaceSubcategory[]
}

export interface MarketplaceSubcategory {
  id: string
  name: string
  slug: string
  description: string
  parentId: string
}

// ── Marketplace cart & order ──

export type MarketplaceOrderStatus =
  | "pending" | "confirmed" | "preparing" | "shipped"
  | "delivered" | "cancelled" | "disputed"

export interface CartItem {
  productId: string
  productName: string
  productImage: string
  price: number
  quantity: number
  sellerId: string
  sellerName: string
  vertical: MarketplaceVertical
}

export interface MarketplaceOrder {
  id: string
  items: CartItem[]
  subtotal: number
  deliveryCost: number
  commission: number
  commissionRate: number
  sellerNet: number
  total: number
  status: MarketplaceOrderStatus
  deliveryCity: string
  deliveryAddress: string
  paymentMethod: string
  createdAt: string
  updatedAt: string
}
