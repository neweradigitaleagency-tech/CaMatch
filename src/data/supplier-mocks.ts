import type {
  SupplierProfile, SupplierProduct, SupplierApplication, MaterialOrder, MaterialOrderItem,
  DeliveryZone, SupplierCommission, SupplierDashboardStats, ProductCategory,
  SupplierPayment, SupplierDispute, DisputeMessage, SupplierDelivery, DeliveryStep,
  StockReservation, SupplierBalance, SupplierPayout, StockMovement, SupplierClient,
  SupplierPromotion, SupplierInvoice, DashboardRecentActivity, TeamMember, ActiveSession,
  SupplierDocument, ImportSession, PickingList,
} from "../types/supplier"

export const MOCK_SUPPLIERS: SupplierProfile[] = [
  { userId: "supplier-1", companyName: "Quincaillerie ABC", ownerName: "Mamadou Diallo", phone: "+225 07 12 34 56 78", email: "contact@abc-quincaillerie.ci", address: "15 Rue des Commercants", city: "Cocody", logoUrl: "", photoUrl: "", legalDocsUrls: ["/docs/abc-registre.pdf", "/docs/abc-identifiant.pdf"], status: "ACTIF", commissionRate: 10, rating: 4.8, totalProducts: 44, totalOrders: 156, totalRevenue: 8500000, reviewedBy: "admin-1", reviewedAt: "2026-07-01T10:00:00Z", isActive: true, createdAt: "2026-06-15T08:00:00Z", updatedAt: "2026-07-08T14:00:00Z" },
  { userId: "supplier-2", companyName: "Matériaux Yopougon", ownerName: "Soro Ibrahim", phone: "+225 07 34 56 78 90", email: "contact@materiaux-yop.ci", address: "45 Av. de la Liberté", city: "Yopougon", logoUrl: "", photoUrl: "", legalDocsUrls: ["/docs/yop-registre.pdf"], status: "ACTIF", commissionRate: 12, rating: 4.2, totalProducts: 8, totalOrders: 89, totalRevenue: 4200000, reviewedBy: "admin-1", reviewedAt: "2026-06-22T10:00:00Z", isActive: true, createdAt: "2026-06-20T10:00:00Z", updatedAt: "2026-07-09T11:00:00Z" },
  { userId: "supplier-3", companyName: "BTP Express", ownerName: "Achi Esther", phone: "+225 07 45 67 89 01", email: "esther@btpexpress.ci", address: "8 Rue de la Bourse", city: "Marcory", logoUrl: "", photoUrl: "", legalDocsUrls: [], status: "ACTIF", commissionRate: 10, rating: 4.5, totalProducts: 5, totalOrders: 45, totalRevenue: 2100000, reviewedBy: "admin-2", reviewedAt: "2026-07-07T10:00:00Z", isActive: true, createdAt: "2026-07-01T08:00:00Z", updatedAt: "2026-07-07T10:00:00Z" },
  { userId: "supplier-4", companyName: "Fournitures Générales", ownerName: "Tano Didier", phone: "+225 07 56 78 90 12", email: "tano@fournitures-gen.ci", address: "22 Bd de la Paix", city: "Treichville", photoUrl: "", legalDocsUrls: [], status: "BLOQUE", commissionRate: 10, rating: 0, totalProducts: 0, totalOrders: 0, totalRevenue: 0, reviewedBy: "admin-1", reviewedAt: "2026-07-04T16:00:00Z", rejectionReason: "Documents incomplets fournis à 2 reprises", isActive: false, createdAt: "2026-06-28T13:00:00Z", updatedAt: "2026-07-04T16:00:00Z" },
  { userId: "supplier-5", companyName: "Nouvelle Quincaillerie", ownerName: "Kouamé Paul", phone: "+225 07 67 89 01 23", email: "paul@nouvelle-quincaillerie.ci", address: "5 Av. Kennedy", city: "Cocody", photoUrl: "", status: "EN_ATTENTE", commissionRate: 10, rating: 0, totalProducts: 0, totalOrders: 0, totalRevenue: 0, isActive: false, createdAt: "2026-07-10T08:00:00Z", updatedAt: "2026-07-10T08:00:00Z" },
]

export const MOCK_CATEGORIES: ProductCategory[] = [
  { id: "cat-mat-1", name: "Ciment et liants", slug: "ciment-liants", description: "Ciment, chaux, plâtre et autres liants", sortOrder: 1, isActive: true, children: [
    { id: "cat-mat-1-1", name: "Ciment", slug: "ciment", description: "Ciment Portland, blanc, chaux", parentId: "cat-mat-1", sortOrder: 1, isActive: true },
    { id: "cat-mat-1-2", name: "Chaux et plâtre", slug: "chaux-platre", description: "Chaux, plâtre et enduits de base", parentId: "cat-mat-1", sortOrder: 2, isActive: true },
    { id: "cat-mat-1-3", name: "Adjuvants", slug: "adjuvants", description: "Adjuvants et additifs pour béton", parentId: "cat-mat-1", sortOrder: 3, isActive: true },
  ]},
  { id: "cat-mat-2", name: "Aciers et fers", slug: "aciers-fers", description: "Barres, treillis soudés, tôles et profilés", sortOrder: 2, isActive: true, children: [
    { id: "cat-mat-2-1", name: "Fers à béton", slug: "fers-beton", description: "Barres rondes et torsadées", parentId: "cat-mat-2", sortOrder: 1, isActive: true },
    { id: "cat-mat-2-2", name: "Treillis soudés", slug: "treillis-soudes", description: "Panneaux et rouleaux soudés", parentId: "cat-mat-2", sortOrder: 2, isActive: true },
    { id: "cat-mat-2-3", name: "Tôles et profilés", slug: "toles-profiles", description: "Tôles, cornières, UPN et IPN", parentId: "cat-mat-2", sortOrder: 3, isActive: true },
  ]},
  { id: "cat-mat-3", name: "Carrelages et revêtements", slug: "carrelages-revetements", description: "Carreaux, faïences, mosaïques et dallages", sortOrder: 3, isActive: true, icon: "grid-3x3", color: "#e8a87c", children: [
    { id: "cat-mat-3-1", name: "Carreaux muraux", slug: "carreaux-muraux", description: "Carreaux pour murs intérieurs", parentId: "cat-mat-3", sortOrder: 1, isActive: true },
    { id: "cat-mat-3-2", name: "Carreaux de sol", slug: "carreaux-sol", description: "Carrelages pour sols", parentId: "cat-mat-3", sortOrder: 2, isActive: true },
    { id: "cat-mat-3-3", name: "Faïences", slug: "faience", description: "Faïences décoratives", parentId: "cat-mat-3", sortOrder: 3, isActive: true },
    { id: "cat-mat-3-4", name: "Mosaïques", slug: "mosaiques", description: "Mosaïques et carreaux décoratifs", parentId: "cat-mat-3", sortOrder: 4, isActive: true },
  ]},
  { id: "cat-mat-4", name: "Gros œuvre et structure", slug: "gros-oeuvre-structure", description: "Parpaings, briques, hourdis et poutrelles", sortOrder: 4, isActive: true, icon: "building-2", color: "#95a5a6", children: [
    { id: "cat-mat-4-1", name: "Parpaings et briques", slug: "parpaings-briques", description: "Parpaings creux/pleins, briques terre cuite", parentId: "cat-mat-4", sortOrder: 1, isActive: true },
    { id: "cat-mat-4-2", name: "Hourdis et poutrelles", slug: "hourdis-poutrelles", description: "Hourdis, poutrelles et prédalles", parentId: "cat-mat-4", sortOrder: 2, isActive: true },
    { id: "cat-mat-4-3", name: "Ferraillage", slug: "ferraillage", description: "Ferrailles et accessoires de structure", parentId: "cat-mat-4", sortOrder: 3, isActive: true },
  ]},
  { id: "cat-mat-5", name: "Peintures et finitions", slug: "peintures-finitions", description: "Peinture, enduit, vernis et produits de finition", sortOrder: 5, isActive: true, icon: "palette", color: "#e74c3c", children: [
    { id: "cat-mat-5-1", name: "Peinture intérieure", slug: "peinture-interieure", description: "Peintures mates, satinées, brillantes pour intérieur", parentId: "cat-mat-5", sortOrder: 1, isActive: true },
    { id: "cat-mat-5-2", name: "Peinture extérieure", slug: "peinture-exterieure", description: "Peintures façade, crépi et hydrofuge", parentId: "cat-mat-5", sortOrder: 2, isActive: true },
    { id: "cat-mat-5-3", name: "Enduit et mastic", slug: "enduit-mastic", description: "Enduits de lissage, rebouchage et mastics", parentId: "cat-mat-5", sortOrder: 3, isActive: true },
    { id: "cat-mat-5-4", name: "Vernis et lasures", slug: "vernis-lasures", description: "Vernis bois, lasures et protections", parentId: "cat-mat-5", sortOrder: 4, isActive: true },
  ]},
  { id: "cat-mat-6", name: "Plomberie et électricité", slug: "plomberie-electricite", description: "Tuyaux, raccords, câbles et appareillages", sortOrder: 6, isActive: true, icon: "droplets", color: "#3498db", children: [
    { id: "cat-mat-6-1", name: "Robinets", slug: "robinets", description: "Robinets de lavabo, évier, douche et cuisine", parentId: "cat-mat-6", sortOrder: 1, isActive: true },
    { id: "cat-mat-6-2", name: "Tuyaux et raccords", slug: "tuyaux-raccords", description: "Tuyaux PVC, PER, cuivre et raccords", parentId: "cat-mat-6", sortOrder: 2, isActive: true },
    { id: "cat-mat-6-3", name: "Joints et silicone", slug: "joints-silicone", description: "Joints, silicone, mousse et rubans d'étanchéité", parentId: "cat-mat-6", sortOrder: 3, isActive: true },
    { id: "cat-mat-6-4", name: "Câbles et fils", slug: "cables-fils", description: "Câbles électriques, fils et câbles RJ45", parentId: "cat-mat-6", sortOrder: 4, isActive: true },
    { id: "cat-mat-6-5", name: "Appareillage électrique", slug: "appareillage-electrique", description: "Interrupteurs, prises, disjoncteurs et tableaux", parentId: "cat-mat-6", sortOrder: 5, isActive: true },
    { id: "cat-mat-6-6", name: "Éviers et accessoires", slug: "eviers-accessoires", description: "Éviers, lavabos et accessoires de plomberie", parentId: "cat-mat-6", sortOrder: 6, isActive: true },
  ]},
  { id: "cat-mat-7", name: "Menuiserie et bois", slug: "menuiserie-bois", description: "Bois, portes, fenêtres et aménagement", sortOrder: 7, isActive: true, icon: "trees", color: "#8B4513", children: [
    { id: "cat-mat-7-1", name: "Bois de construction", slug: "bois-construction", description: "Bois d'œuvre, madriers, chevrons et planches", parentId: "cat-mat-7", sortOrder: 1, isActive: true },
    { id: "cat-mat-7-2", name: "Portes et fenêtres", slug: "portes-fenetres", description: "Portes intérieures/extérieures et fenêtres", parentId: "cat-mat-7", sortOrder: 2, isActive: true },
    { id: "cat-mat-7-3", name: "Parquets et lambris", slug: "parquets-lambris", description: "Parquets stratifiés, massifs et lambris", parentId: "cat-mat-7", sortOrder: 3, isActive: true },
  ]},
  { id: "cat-mat-8", name: "Quincaillerie générale", slug: "quincaillerie-generale", description: "Clous, vis, serrures et ferronnerie", sortOrder: 8, isActive: true, icon: "wrench", color: "#7f8c8d", children: [
    { id: "cat-mat-8-1", name: "Serrures et verrous", slug: "serrures-verrous", description: "Serrures de porte, verrous et cadenas", parentId: "cat-mat-8", sortOrder: 1, isActive: true },
    { id: "cat-mat-8-2", name: "Charnières et paumelles", slug: "charnieres-paumelles", description: "Charnières, paumelles et ferrures", parentId: "cat-mat-8", sortOrder: 2, isActive: true },
    { id: "cat-mat-8-3", name: "Vis, clous et chevilles", slug: "vis-clous-chevilles", description: "Vis à bois, à métaux, clous et chevilles", parentId: "cat-mat-8", sortOrder: 3, isActive: true },
    { id: "cat-mat-8-4", name: "Poignées et boutons", slug: "poignees-boutons", description: "Poignées de porte, boutons de tiroir et béquilles", parentId: "cat-mat-8", sortOrder: 4, isActive: true },
  ]},
  { id: "cat-mat-9", name: "Équipements de chantier", slug: "equipements-chantier", description: "Échafaudages, bâches et sécurité", sortOrder: 9, isActive: true, icon: "helmet", color: "#e67e22", children: [
    { id: "cat-mat-9-1", name: "Échafaudages", slug: "echafaudages", description: "Échafaudages, escabeaux et échelles", parentId: "cat-mat-9", sortOrder: 1, isActive: true },
    { id: "cat-mat-9-2", name: "Bâches et filets", slug: "baches-filets", description: "Bâches de protection et filets de chantier", parentId: "cat-mat-9", sortOrder: 2, isActive: true },
    { id: "cat-mat-9-3", name: "Sécurité et signalisation", slug: "securite-signalisation", description: "Casques, gilets, cônes et rubalise", parentId: "cat-mat-9", sortOrder: 3, isActive: true },
  ]},
  { id: "cat-mat-10", name: "Outillage", slug: "outillage", description: "Outils à main et électroportatifs", sortOrder: 10, isActive: true, children: [
    { id: "cat-mat-10-1", name: "Outils à main", slug: "outils-main", description: "Marteaux, tournevis, clés, pinces", parentId: "cat-mat-10", sortOrder: 1, isActive: true },
    { id: "cat-mat-10-2", name: "Outils électroportatifs", slug: "outils-electroportatifs", description: "Perceuses, meuleuses, scies et visseuses", parentId: "cat-mat-10", sortOrder: 2, isActive: true },
    { id: "cat-mat-10-3", name: "Accessoires et consommables", slug: "accessoires-consommables", description: "Mèches, disques, lames et abrasifs", parentId: "cat-mat-10", sortOrder: 3, isActive: true },
  ]},
]

export const MOCK_PRODUCTS: SupplierProduct[] = [
  // ── Quincaillerie ABC (supplier-1) ──
  { id: "sp-1", supplierId: "supplier-1", name: "Ciment Portland 42.5R", description: "Sac de 50kg — CimIvoire qualité premium. Idéal pour fondations et dallages.", categoryId: "cat-mat-1", categoryName: "Ciment et liants", images: ["https://images.unsplash.com/photo-1518709766631-a6b04f8b5a7a?w=400"], brand: "CimIvoire", manufacturerReference: "CIM-P425R-50", barcode: "6180001234567", technicalSpecs: { resistance: "42.5 MPa", poids: "50 kg", type: "Portland composé", norme: "NF EN 197-1" }, unitType: "bag", supplierPrice: 6500, recommendedPrice: 7200, cmPrice: 7222, stock: 120, reservedStock: 10, availableStock: 110, lowStockThreshold: 20, unlimitedStock: false, isActive: true, isVisible: true, createdAt: "2026-06-20T08:00:00Z", updatedAt: "2026-07-10T09:00:00Z" },
  { id: "sp-2", supplierId: "supplier-1", name: "Fer à béton diam 12", description: "Barre de 12 m — acier haute adhérence. Utilisé pour le ferraillage des poteaux et poutres.", categoryId: "cat-mat-2", categoryName: "Aciers et fers", images: ["https://images.unsplash.com/photo-1617788138017-80ad40651399?w=400"], brand: "ACIERCO", manufacturerReference: "HA12-L12", barcode: "6180001234574", technicalSpecs: { diametre: "12 mm", longueur: "12 m", nuance: "FeE500", adhesion: "HA" }, unitType: "piece", supplierPrice: 8500, recommendedPrice: 9000, cmPrice: 9444, stock: 200, reservedStock: 0, availableStock: 200, lowStockThreshold: 30, unlimitedStock: false, isActive: true, isVisible: true, createdAt: "2026-06-20T08:00:00Z", updatedAt: "2026-07-10T09:00:00Z" },
  { id: "sp-3", supplierId: "supplier-1", name: "Carreau de ciment 20x20", description: "Motif traditionnel africain, lot de 10 carreaux. Excellent pour sols intérieurs.", categoryId: "cat-mat-3", categoryName: "Carrelages et revêtements", images: ["https://images.unsplash.com/photo-1611200945002-403b0b46e7c5?w=400"], brand: "Carrelux CI", manufacturerReference: "CC-MOTIF-2020", technicalSpecs: { dimensions: "20x20 cm", epaisseur: "15 mm", materiaux: "Ciment coloré", finition: "Mat", usage: "Intérieur" }, unitType: "set", supplierPrice: 15000, cmPrice: 16667, stock: 45, reservedStock: 5, availableStock: 40, lowStockThreshold: 10, unlimitedStock: false, isActive: true, isVisible: true, createdAt: "2026-06-21T10:00:00Z", updatedAt: "2026-07-09T16:00:00Z" },
  { id: "sp-4", supplierId: "supplier-1", name: "Peinture acrylique blanc mat", description: "Seau de 10L — peinture mate lessivable. Pour murs intérieurs et plafonds.", categoryId: "cat-mat-5", categoryName: "Peintures et finitions", images: ["https://images.unsplash.com/photo-1562259929-b4e1fd3aef09?w=400"], brand: "SEIGNEURIE", manufacturerReference: "SEI-ACRY-MAT-10L", technicalSpecs: { contenance: "10 L", rendement: "10-12 m²/L", couleur: "Blanc", finition: "Mat", sechage: "6h", lessivable: true }, unitType: "liter", supplierPrice: 22000, recommendedPrice: 24500, cmPrice: 24444, stock: 8, reservedStock: 0, availableStock: 8, lowStockThreshold: 10, unlimitedStock: false, isActive: true, isVisible: true, createdAt: "2026-06-22T14:00:00Z", updatedAt: "2026-07-08T11:00:00Z" },
  { id: "sp-5", supplierId: "supplier-1", name: "Tuyau PVC DN 50mm", description: "Lot de 5 mètres — tuyau pression pour evacuation et plomberie générale.", categoryId: "cat-mat-6", categoryName: "Plomberie et électricité", images: ["https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=400"], brand: "NICHIREE", manufacturerReference: "PVC-P50-5M", technicalSpecs: { diametre: "50 mm", pression: "10 bars", longueur_lot: "5 m", materiau: "PVC-U" }, unitType: "set", supplierPrice: 4500, cmPrice: 5000, stock: 0, reservedStock: 0, availableStock: 0, lowStockThreshold: 40, unlimitedStock: false, isActive: true, isVisible: false, createdAt: "2026-06-23T09:00:00Z", updatedAt: "2026-07-07T10:00:00Z" },
  { id: "sp-6", supplierId: "supplier-1", name: "Sable fin de rivière", description: "Mètre cube — sable lavé tamisé. Livré par camion de 6m³ minimum.", categoryId: "cat-mat-4", categoryName: "Gros œuvre et structure", images: [], technicalSpecs: { origine: "Lagune Aby", type: "Sable fin lavé", granulometrie: "0-4 mm" }, unitType: "meter", supplierPrice: 12000, cmPrice: 13333, stock: 35, reservedStock: 0, availableStock: 35, lowStockThreshold: 10, unlimitedStock: false, isActive: false, isVisible: false, createdAt: "2026-06-25T11:00:00Z", updatedAt: "2026-07-01T08:00:00Z" },
  { id: "sp-7", supplierId: "supplier-1", name: "Clous de charpente 100mm", description: "Paquet de 1 kg — clous tête plate pour charpente et ossature bois.", categoryId: "cat-mat-8", categoryName: "Quincaillerie générale", images: [], brand: "SIMPSON", manufacturerReference: "SIM-CL100-1KG", barcode: "6180001234581", technicalSpecs: { longueur: "100 mm", materiau: "Acier zingué", poids: "1 kg", usage: "Charpente" }, unitType: "box", supplierPrice: 2500, recommendedPrice: 2800, cmPrice: 2778, stock: 60, reservedStock: 0, availableStock: 60, lowStockThreshold: 15, unlimitedStock: false, isActive: true, isVisible: true, createdAt: "2026-06-26T15:00:00Z", updatedAt: "2026-07-10T08:00:00Z" },
  { id: "sp-8", supplierId: "supplier-1", name: "Porte en bois massif", description: "Dimensions standard 80x210cm — bois Okoumé massif teinté, prête à poser.", categoryId: "cat-mat-7", categoryName: "Menuiserie et bois", images: ["https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=400"], brand: "BOIS CI", manufacturerReference: "PM-OK80X210", technicalSpecs: { dimensions: "80x210 cm", epaisseur: "35 mm", essence: "Okoumé massif", finition: "Teinte acajou", quincaillerie_incluse: true }, unitType: "piece", supplierPrice: 85000, recommendedPrice: 95000, cmPrice: 94444, stock: 12, reservedStock: 2, availableStock: 10, lowStockThreshold: 5, unlimitedStock: false, isActive: true, isVisible: true, createdAt: "2026-06-27T10:00:00Z", updatedAt: "2026-07-09T09:00:00Z" },
  { id: "sp-9", supplierId: "supplier-1", name: "Vis à bois 4x40mm", description: "Boîte de 100 unités — vis acier zingué pour assemblage bois.", categoryId: "cat-mat-8", categoryName: "Quincaillerie générale", images: [], manufacturerReference: "VIS-4X40-100", technicalSpecs: { diametre: "4 mm", longueur: "40 mm", materiau: "Acier zingué", quantite: "100" }, unitType: "box", supplierPrice: 3500, recommendedPrice: 4000, cmPrice: 3889, stock: 200, reservedStock: 0, availableStock: 200, lowStockThreshold: 20, unlimitedStock: false, isActive: true, isVisible: true, createdAt: "2026-06-28T12:00:00Z", updatedAt: "2026-07-09T14:00:00Z" },
  { id: "sp-10", supplierId: "supplier-1", name: "Rouleau grillage soudé 1.5m", description: "Hauteur 1.5m, maille 50x50mm, fil 3mm. Pour clôture et sécurisation.", categoryId: "cat-mat-4", categoryName: "Gros œuvre et structure", images: ["https://images.unsplash.com/photo-1617562839567-e0b80028b5c9?w=400"], brand: "TRELLISCO", manufacturerReference: "GR-150-50", technicalSpecs: { hauteur: "1.5 m", maille: "50x50 mm", diametre_fil: "3 mm", traitement: "Galvanisé" }, unitType: "piece", supplierPrice: 18000, cmPrice: 20000, stock: 20, reservedStock: 0, availableStock: 20, lowStockThreshold: 8, unlimitedStock: false, isActive: true, isVisible: true, createdAt: "2026-06-28T16:00:00Z", updatedAt: "2026-07-10T07:00:00Z" },
  { id: "sp-11", supplierId: "supplier-1", name: "Robinet mitigeur évier chromé", description: "Mitigeur monocommande évier de cuisine. Garantie 2 ans.", categoryId: "cat-mat-6", categoryName: "Plomberie et électricité", images: [], brand: "GROHE", manufacturerReference: "GRO-32654", technicalSpecs: { type: "Mitigeur évier", finition: "Chromé brillant", materiau: "Laiton", garanti: "2 ans" }, unitType: "piece", supplierPrice: 25000, recommendedPrice: 28000, cmPrice: 27778, stock: 15, reservedStock: 3, availableStock: 12, lowStockThreshold: 5, unlimitedStock: false, isActive: true, isVisible: true, createdAt: "2026-06-29T09:00:00Z", updatedAt: "2026-07-08T10:00:00Z" },
  { id: "sp-12", supplierId: "supplier-1", name: "Brouette de chantier 100L", description: "Brouette robuste à benne basculante. Capacité 100L, roue pneumatique.", categoryId: "cat-mat-9", categoryName: "Équipements de chantier", images: ["https://images.unsplash.com/photo-1624776475692-5605c0442b42?w=400"], brand: "PROTOOL", manufacturerReference: "PRO-BRT-100L", technicalSpecs: { capacite: "100 L", roue: "Pneumatique 4.80/4.00-8", chassis: "Acier", poids: "15 kg" }, unitType: "piece", supplierPrice: 32000, recommendedPrice: 35000, cmPrice: 35556, stock: 25, reservedStock: 0, availableStock: 25, lowStockThreshold: 5, unlimitedStock: false, isActive: true, isVisible: true, createdAt: "2026-06-30T11:00:00Z", updatedAt: "2026-07-07T15:00:00Z" },

  // ── Matériaux Yopougon (supplier-2) ──
  { id: "sp-13", supplierId: "supplier-2", name: "Ciment Portland 32.5", description: "Sac de 50kg — Cimivoire usage courant.", categoryId: "cat-mat-1", categoryName: "Ciment et liants", images: [], brand: "CimIvoire", manufacturerReference: "CIM-P325-50", technicalSpecs: { resistance: "32.5 MPa", poids: "50 kg", type: "Portland" }, unitType: "bag", supplierPrice: 5800, cmPrice: 6591, stock: 80, reservedStock: 0, availableStock: 80, lowStockThreshold: 15, unlimitedStock: false, isActive: true, isVisible: true, createdAt: "2026-06-22T08:00:00Z", updatedAt: "2026-07-08T10:00:00Z" },
  { id: "sp-14", supplierId: "supplier-2", name: "Parpaing creux 20x20x40", description: "Parpaing standard pour murs et cloisons. Unité.", categoryId: "cat-mat-4", categoryName: "Gros œuvre et structure", images: [], brand: "BRIQUES CI", technicalSpecs: { dimensions: "20x20x40 cm", materiau: "Agglo creux", resistance: "4 MPa" }, unitType: "piece", supplierPrice: 800, recommendedPrice: 900, cmPrice: 909, stock: 500, reservedStock: 200, availableStock: 300, lowStockThreshold: 100, unlimitedStock: false, isActive: true, isVisible: true, createdAt: "2026-06-23T09:00:00Z", updatedAt: "2026-07-09T11:00:00Z" },
  { id: "sp-15", supplierId: "supplier-2", name: "Tôle bac acier AL 2m", description: "Tôle ondulée en acier galvanisé. Longueur 2m, largeur utile 1m.", categoryId: "cat-mat-4", categoryName: "Gros œuvre et structure", images: ["https://images.unsplash.com/photo-1626668893632-6f3a4466d22f?w=400"], brand: "ACIERCI", technicalSpecs: { longueur: "2 m", largeur_utile: "1 m", epaisseur: "0.5 mm", traitement: "Galvanisé AL" }, unitType: "piece", supplierPrice: 9500, cmPrice: 10795, stock: 150, reservedStock: 0, availableStock: 150, lowStockThreshold: 30, unlimitedStock: false, isActive: true, isVisible: true, createdAt: "2026-06-24T10:00:00Z", updatedAt: "2026-07-07T14:00:00Z" },
  { id: "sp-16", supplierId: "supplier-2", name: "Tube cuivre diam 14mm", description: "Barre de 5 mètres — tube cuivre recuit pour plomberie sanitaire.", categoryId: "cat-mat-6", categoryName: "Plomberie et électricité", images: [], brand: "WIELAND", technicalSpecs: { diametre: "14 mm", epaisseur: "1 mm", longueur: "5 m", materiau: "Cuivre recuit" }, unitType: "piece", supplierPrice: 12000, cmPrice: 13636, stock: 40, reservedStock: 0, availableStock: 40, lowStockThreshold: 10, unlimitedStock: false, isActive: true, isVisible: true, createdAt: "2026-06-25T11:00:00Z", updatedAt: "2026-07-06T16:00:00Z" },
  { id: "sp-17", supplierId: "supplier-2", name: "Peinture glycéro blanc satiné", description: "Seau de 5L — peinture glycérophtalique pour boiseries et métaux.", categoryId: "cat-mat-5", categoryName: "Peintures et finitions", images: [], brand: "AKZO", manufacturerReference: "AKZO-GLY-SAT-5L", technicalSpecs: { contenance: "5 L", rendement: "14 m²/L", couleur: "Blanc", finition: "Satiné" }, unitType: "liter", supplierPrice: 18000, cmPrice: 20455, stock: 5, reservedStock: 0, availableStock: 5, lowStockThreshold: 8, unlimitedStock: false, isActive: true, isVisible: true, createdAt: "2026-06-26T14:00:00Z", updatedAt: "2026-07-05T10:00:00Z" },
  { id: "sp-18", supplierId: "supplier-2", name: "Interrupteur simple allumage", description: "Interrupteur blanc encastrable. Norme CE.", categoryId: "cat-mat-6", categoryName: "Plomberie et électricité", images: [], brand: "LEGRAND", manufacturerReference: "LEG-6710", barcode: "6180001234598", technicalSpecs: { type: "Simple allumage", couleur: "Blanc", encastrement: true, norme: "CE" }, unitType: "piece", supplierPrice: 2500, recommendedPrice: 3000, cmPrice: 2841, stock: 0, reservedStock: 0, availableStock: 0, lowStockThreshold: 50, unlimitedStock: false, isActive: true, isVisible: true, createdAt: "2026-06-27T15:00:00Z", updatedAt: "2026-07-04T09:00:00Z" },
  { id: "sp-19", supplierId: "supplier-2", name: "Échafaudage roulant alu 2m", description: "Tour d'échafaudage aluminium 2m de hauteur. Plateforme 1.5x0.6m.", categoryId: "cat-mat-9", categoryName: "Équipements de chantier", images: ["https://images.unsplash.com/photo-1583472292150-9c0e7c5b5e1e?w=400"], brand: "STAIRCO", technicalSpecs: { hauteur: "2 m", plateforme: "1.5x0.6 m", materiau: "Aluminium", poids_max: "150 kg" }, unitType: "set", supplierPrice: 125000, cmPrice: 142045, stock: 3, reservedStock: 0, availableStock: 3, lowStockThreshold: 2, unlimitedStock: false, isActive: true, isVisible: true, createdAt: "2026-06-28T09:00:00Z", updatedAt: "2026-07-03T15:00:00Z" },
  { id: "sp-20", supplierId: "supplier-2", name: "Kit câble électrique 1.5mm² 100m", description: "Rouleau de 100m — câble cuivre rigide pour installation électrique.", categoryId: "cat-mat-6", categoryName: "Plomberie et électricité", images: [], brand: "NEXANS", technicalSpecs: { section: "1.5 mm²", longueur: "100 m", type: "Rigide U-1000 R2V", couleur: "Rouge" }, unitType: "piece", supplierPrice: 35000, cmPrice: 39773, stock: 10, reservedStock: 5, availableStock: 5, lowStockThreshold: 5, unlimitedStock: false, isActive: true, isVisible: true, createdAt: "2026-06-29T10:00:00Z", updatedAt: "2026-07-02T11:00:00Z" },

  // ── BTP Express (supplier-3) ──
  { id: "sp-21", supplierId: "supplier-3", name: "Plaque de plâtre BA13", description: "Plaque standard 1.2x2.5m pour cloisonnement et doublage.", categoryId: "cat-mat-7", categoryName: "Menuiserie et bois", images: ["https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400"], brand: "PLACO", manufacturerReference: "PLA-BA13-1225", technicalSpecs: { dimensions: "1.2x2.5 m", epaisseur: "13 mm", type: "Standard", usage: "Intérieur" }, unitType: "piece", supplierPrice: 7500, cmPrice: 8333, stock: 60, reservedStock: 0, availableStock: 60, lowStockThreshold: 10, unlimitedStock: false, isActive: true, isVisible: true, createdAt: "2026-07-02T09:00:00Z", updatedAt: "2026-07-08T12:00:00Z" },
  { id: "sp-22", supplierId: "supplier-3", name: "Enduit de lissage blanc 25kg", description: "Sac de 25kg pour lissage des murs avant peinture. Finition lisse.", categoryId: "cat-mat-5", categoryName: "Peintures et finitions", images: [], brand: "SEMIN", manufacturerReference: "SEM-LIS-25", technicalSpecs: { poids: "25 kg", rendement: "1.5 kg/m²", couleur: "Blanc", application: "Manuelle/mécanique" }, unitType: "bag", supplierPrice: 8500, cmPrice: 9444, stock: 25, reservedStock: 0, availableStock: 25, lowStockThreshold: 5, unlimitedStock: false, isActive: true, isVisible: true, createdAt: "2026-07-03T10:00:00Z", updatedAt: "2026-07-07T15:00:00Z" },
  { id: "sp-23", supplierId: "supplier-3", name: "WC suspendu complet", description: "Ensemble WC suspendu avec cuvette, réservoir et bâti-support.", categoryId: "cat-mat-6", categoryName: "Plomberie et électricité", images: ["https://images.unsplash.com/photo-1590614630056-3d5f5c4a5e5b?w=400"], brand: "SFA", manufacturerReference: "SFA-WC-SUSP", technicalSpecs: { type: "Suspendu", cuvette: "Porcelaine vitrifiée", chasse: "Double commande 3/6L", batis_support: "Inclus" }, unitType: "set", supplierPrice: 145000, cmPrice: 161111, stock: 4, reservedStock: 0, availableStock: 4, lowStockThreshold: 2, unlimitedStock: false, isActive: true, isVisible: true, createdAt: "2026-07-04T11:00:00Z", updatedAt: "2026-07-06T09:00:00Z" },
  { id: "sp-24", supplierId: "supplier-3", name: "Lame de terrasse composite 2.2m", description: "Lame de 2.2m en bois composite gris. Lot de 10 lames.", categoryId: "cat-mat-7", categoryName: "Menuiserie et bois", images: [], brand: "COMPO-DECK", technicalSpecs: { dimensions: "2.2x0.14 m", epaisseur: "24 mm", couleur: "Gris ardoise", materiau: "Composite bois/PP" }, unitType: "set", supplierPrice: 65000, recommendedPrice: 72000, cmPrice: 72222, stock: 10, reservedStock: 0, availableStock: 10, lowStockThreshold: 3, unlimitedStock: false, isActive: true, isVisible: true, createdAt: "2026-07-05T08:00:00Z", updatedAt: "2026-07-07T10:00:00Z" },
  { id: "sp-25", supplierId: "supplier-3", name: "Perceuse sans fil 18V", description: "Perceuse visseuse 18V Li-Ion avec 2 batteries 4Ah + chargeur.", categoryId: "cat-mat-10", categoryName: "Outillage", images: ["https://images.unsplash.com/photo-1504148455328-c376907d5a8b?w=400"], brand: "BOSCH", manufacturerReference: "BOS-PS18-4A", technicalSpecs: { tension: "18V", capacite_batterie: "4 Ah", nombre_batteries: "2", mandrin: "Sans clé 13 mm", couple_max: "50 Nm" }, unitType: "set", supplierPrice: 95000, cmPrice: 105556, stock: 6, reservedStock: 1, availableStock: 5, lowStockThreshold: 3, unlimitedStock: false, isActive: true, isVisible: true, createdAt: "2026-07-06T14:00:00Z", updatedAt: "2026-07-08T16:00:00Z" },

  // ── Quincaillerie ABC — Nouveaux produits ──
  { id: "sp-26", supplierId: "supplier-1", name: "Ampoule LED 12W E27", description: "Ampoule LED blanc froid 6500K. Durée de vie 25 000h. Économie d'énergie 80%.", categoryId: "cat-mat-6", categoryName: "Plomberie et électricité", images: ["https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400"], brand: "PHILIPS", manufacturerReference: "PHI-LED12-E27", technicalSpecs: { puissance: "12 W", equivalent: "100 W", culot: "E27", temperature: "6500K", flux: "1100 lm" }, unitType: "piece", supplierPrice: 1500, recommendedPrice: 2000, cmPrice: 1667, salePrice: 1200, saleEndsAt: "2026-08-01T00:00:00Z", stock: 300, reservedStock: 0, availableStock: 300, lowStockThreshold: 50, unlimitedStock: false, isActive: true, isVisible: true, createdAt: "2026-07-02T08:00:00Z", updatedAt: "2026-07-09T10:00:00Z" },
  { id: "sp-27", supplierId: "supplier-1", name: "Interrupteur double allumage", description: "Interrupteur encastrable 2 modules, blanc. Norme CE NF.", categoryId: "cat-mat-6", categoryName: "Plomberie et électricité", images: [], brand: "LEGRAND", manufacturerReference: "LEG-6720", technicalSpecs: { type: "Double allumage", couleur: "Blanc", modules: "2", norme: "CE NF" }, unitType: "piece", supplierPrice: 3500, recommendedPrice: 4200, cmPrice: 3889, stock: 80, reservedStock: 0, availableStock: 80, lowStockThreshold: 20, unlimitedStock: false, isActive: true, isVisible: true, createdAt: "2026-07-02T09:00:00Z", updatedAt: "2026-07-09T10:00:00Z" },
  { id: "sp-28", supplierId: "supplier-1", name: "Prise électrique double 2P+T", description: "Prise double encastrable avec obturateurs. Couleur blanc.", categoryId: "cat-mat-6", categoryName: "Plomberie et électricité", images: [], brand: "SCHNEIDER", manufacturerReference: "SCH-DBL-001", technicalSpecs: { type: "Double 2P+T", couleur: "Blanc", encastrement: true, indice: "IP20" }, unitType: "piece", supplierPrice: 2800, recommendedPrice: 3500, cmPrice: 3111, stock: 120, reservedStock: 0, availableStock: 120, lowStockThreshold: 30, unlimitedStock: false, isActive: true, isVisible: true, createdAt: "2026-07-02T10:00:00Z", updatedAt: "2026-07-09T10:00:00Z" },
  { id: "sp-29", supplierId: "supplier-1", name: "Disjoncteur 20A unipolaire", description: "Disjoncteur modulaire 20A, pouvoir de coupure 6kA. Norme NF EN 60898.", categoryId: "cat-mat-6", categoryName: "Plomberie et électricité", images: [], brand: "HAGER", manufacturerReference: "HAG-MCN120", technicalSpecs: { calibre: "20 A", poles: "1", pouvoir_coupure: "6 kA", norme: "NF EN 60898" }, unitType: "piece", supplierPrice: 4500, recommendedPrice: 5500, cmPrice: 5000, stock: 60, reservedStock: 0, availableStock: 60, lowStockThreshold: 15, unlimitedStock: false, isActive: true, isVisible: true, createdAt: "2026-07-03T08:00:00Z", updatedAt: "2026-07-09T10:00:00Z" },
  { id: "sp-30", supplierId: "supplier-1", name: "Câble électrique 2.5mm² 50m", description: "Rouleau de 50m — câble cuivre rigide U-1000 R2V pour installation électrique.", categoryId: "cat-mat-6", categoryName: "Plomberie et électricité", images: ["https://images.unsplash.com/photo-1616531770192-6eaea74c2456?w=400"], brand: "PRYSMIAN", manufacturerReference: "PRY-25-50M", technicalSpecs: { section: "2.5 mm²", longueur: "50 m", type: "Rigide U-1000 R2V", couleur: "Bleu" }, unitType: "piece", supplierPrice: 22000, recommendedPrice: 25000, cmPrice: 24444, stock: 25, reservedStock: 0, availableStock: 25, lowStockThreshold: 5, unlimitedStock: false, isActive: true, isVisible: true, createdAt: "2026-07-03T09:00:00Z", updatedAt: "2026-07-09T10:00:00Z" },
  { id: "sp-31", supplierId: "supplier-1", name: "Compteur d'eau DN15", description: "Compteur d'eau individuel à jet unique. Diamètre 15mm, débit 2.5m³/h.", categoryId: "cat-mat-6", categoryName: "Plomberie et électricité", images: [], brand: "WATERTEC", manufacturerReference: "WTC-DN15-25", technicalSpecs: { diametre: "DN15", debit_max: "2.5 m³/h", type: "Jet unique", classe: "R160" }, unitType: "piece", supplierPrice: 18500, recommendedPrice: 22000, cmPrice: 20556, stock: 15, reservedStock: 0, availableStock: 15, lowStockThreshold: 5, unlimitedStock: false, isActive: true, isVisible: true, createdAt: "2026-07-03T10:00:00Z", updatedAt: "2026-07-09T10:00:00Z" },
  { id: "sp-32", supplierId: "supplier-1", name: "Raccord PVC colle DN40", description: "Raccord PVC pression à coller. Diamètre 40mm pour canalisation d'eau.", categoryId: "cat-mat-6", categoryName: "Plomberie et électricité", images: [], brand: "NICHIREE", manufacturerReference: "NIC-PVC40-R", technicalSpecs: { diametre: "40 mm", type: "Raccord droit", materiau: "PVC-U", pression: "10 bars" }, unitType: "piece", supplierPrice: 1200, recommendedPrice: 1500, cmPrice: 1333, stock: 200, reservedStock: 0, availableStock: 200, lowStockThreshold: 50, unlimitedStock: false, isActive: true, isVisible: true, createdAt: "2026-07-04T09:00:00Z", updatedAt: "2026-07-09T10:00:00Z" },

  { id: "sp-33", supplierId: "supplier-1", name: "Serrure 3 points à encastrer", description: "Serrure de sécurité 3 points. Entraxe 60mm, réversible. Finition laiton.", categoryId: "cat-mat-8", categoryName: "Quincaillerie générale", images: [], brand: "VACHETTE", manufacturerReference: "VAC-3PTS-60", technicalSpecs: { type: "3 points", entraxe: "60 mm", finition: "Laiton", reversible: true }, unitType: "piece", supplierPrice: 22000, recommendedPrice: 28000, cmPrice: 24444, stock: 20, reservedStock: 0, availableStock: 20, lowStockThreshold: 5, unlimitedStock: false, isActive: true, isVisible: true, createdAt: "2026-07-04T10:00:00Z", updatedAt: "2026-07-09T10:00:00Z" },
  { id: "sp-34", supplierId: "supplier-1", name: "Charnière inox 80mm", description: "Paire de charnières inoxydables 80mm pour portes intérieures.", categoryId: "cat-mat-8", categoryName: "Quincaillerie générale", images: [], brand: "SIMPSON", manufacturerReference: "SIM-CH80-INOX", technicalSpecs: { dimensions: "80 mm", materiau: "Inox 304", usage: "Porte intérieure", quantite: "2" }, unitType: "set", supplierPrice: 3500, recommendedPrice: 4500, cmPrice: 3889, stock: 50, reservedStock: 0, availableStock: 50, lowStockThreshold: 10, unlimitedStock: false, isActive: true, isVisible: true, createdAt: "2026-07-04T11:00:00Z", updatedAt: "2026-07-09T10:00:00Z" },
  { id: "sp-35", supplierId: "supplier-1", name: "Cadenas acier 50mm", description: "Cadenas en acier trempé 50mm. Anses anti-cisaille. 3 clés fournies.", categoryId: "cat-mat-8", categoryName: "Quincaillerie générale", images: [], brand: "ABUS", manufacturerReference: "ABU-50T", technicalSpecs: { largeur: "50 mm", materiau: "Acier trempé", anse: "Anti-cisaille", cles: "3" }, unitType: "piece", supplierPrice: 6500, recommendedPrice: 8000, cmPrice: 7222, stock: 35, reservedStock: 0, availableStock: 35, lowStockThreshold: 10, unlimitedStock: false, isActive: true, isVisible: true, createdAt: "2026-07-05T08:00:00Z", updatedAt: "2026-07-09T10:00:00Z" },
  { id: "sp-36", supplierId: "supplier-1", name: "Cheville Molly 10mm", description: "Boîte de 50 chevilles Molly 10mm pour cloisons sèches et plaques de plâtre.", categoryId: "cat-mat-8", categoryName: "Quincaillerie générale", images: [], brand: "MOLLY", manufacturerReference: "MOL-10-50", technicalSpecs: { diametre: "10 mm", type: "Molly", support: "Cloison sèche", quantite: "50" }, unitType: "box", supplierPrice: 3000, recommendedPrice: 3800, cmPrice: 3333, stock: 80, reservedStock: 0, availableStock: 80, lowStockThreshold: 20, unlimitedStock: false, isActive: true, isVisible: true, createdAt: "2026-07-05T09:00:00Z", updatedAt: "2026-07-09T10:00:00Z" },
  { id: "sp-37", supplierId: "supplier-1", name: "Ruban adhésif double face 10m", description: "Ruban mousse double face 10m x 19mm. Pour fixation légère.", categoryId: "cat-mat-8", categoryName: "Quincaillerie générale", images: [], brand: "TESA", manufacturerReference: "TES-DF-1910", technicalSpecs: { longueur: "10 m", largeur: "19 mm", type: "Mousse PE", usage: "Fixation légère" }, unitType: "piece", supplierPrice: 1800, recommendedPrice: 2200, cmPrice: 2000, stock: 150, reservedStock: 0, availableStock: 150, lowStockThreshold: 30, unlimitedStock: false, isActive: true, isVisible: true, createdAt: "2026-07-05T10:00:00Z", updatedAt: "2026-07-09T10:00:00Z" },

  { id: "sp-38", supplierId: "supplier-1", name: "Marteau de charpentier 500g", description: "Marteau de charpentier avec manche bois et tête polie 500g.", categoryId: "cat-mat-10", categoryName: "Outillage", images: ["https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=400"], brand: "STANLEY", manufacturerReference: "STA-500C", technicalSpecs: { poids: "500 g", type: "Charpentier", manche: "Bois hêtre", tête: "Acier poli" }, unitType: "piece", supplierPrice: 7500, recommendedPrice: 9000, cmPrice: 8333, salePrice: 5900, saleEndsAt: "2026-07-25T00:00:00Z", stock: 30, reservedStock: 0, availableStock: 30, lowStockThreshold: 8, unlimitedStock: false, isActive: true, isVisible: true, createdAt: "2026-07-05T11:00:00Z", updatedAt: "2026-07-09T10:00:00Z" },
  { id: "sp-39", supplierId: "supplier-1", name: "Tournevis set 6 pièces", description: "Set de 6 tournevis cruciformes et plats. Mangons antidérapants.", categoryId: "cat-mat-10", categoryName: "Outillage", images: [], brand: "FACOM", manufacturerReference: "FAC-SET6", technicalSpecs: { pieces: "6", types: "Cruciforme/Plat", manche: "Bi-matière antidérapant", gamme: "Professionele" }, unitType: "set", supplierPrice: 12000, recommendedPrice: 15000, cmPrice: 13333, stock: 20, reservedStock: 0, availableStock: 20, lowStockThreshold: 5, unlimitedStock: false, isActive: true, isVisible: true, createdAt: "2026-07-05T14:00:00Z", updatedAt: "2026-07-09T10:00:00Z" },
  { id: "sp-40", supplierId: "supplier-1", name: "Pince universelle 200mm", description: "Pince multiprise 200mm avec 8 positions de réglage. Manchon bi-matière.", categoryId: "cat-mat-10", categoryName: "Outillage", images: ["https://images.unsplash.com/photo-1586864387789-628af9feed72?w=400"], brand: "FACOM", manufacturerReference: "FAC-PU200", technicalSpecs: { longueur: "200 mm", positions: "8", materiau: "Acier chrome vanadium", manche: "Bi-matière" }, unitType: "piece", supplierPrice: 9500, recommendedPrice: 12000, cmPrice: 10556, stock: 25, reservedStock: 0, availableStock: 25, lowStockThreshold: 5, unlimitedStock: false, isActive: true, isVisible: true, createdAt: "2026-07-06T08:00:00Z", updatedAt: "2026-07-09T10:00:00Z" },
  { id: "sp-41", supplierId: "supplier-1", name: "Niveau à bulle 60cm", description: "Niveau à bulle aluminium 60cm. 3 fioles (horizontal, vertical, 45°).", categoryId: "cat-mat-10", categoryName: "Outillage", images: [], brand: "STANLEY", manufacturerReference: "STA-NB60", technicalSpecs: { longueur: "60 cm", fioles: "3", materiau: "Aluminium", precision: "0.5 mm/m" }, unitType: "piece", supplierPrice: 6500, recommendedPrice: 8500, cmPrice: 7222, stock: 30, reservedStock: 0, availableStock: 30, lowStockThreshold: 8, unlimitedStock: false, isActive: true, isVisible: true, createdAt: "2026-07-06T09:00:00Z", updatedAt: "2026-07-09T10:00:00Z" },
  { id: "sp-42", supplierId: "supplier-1", name: "Mètre ruban 5m", description: "Ruban métrique 5m x 19mm. Verrouillage automatique et clip ceinture.", categoryId: "cat-mat-10", categoryName: "Outillage", images: [], brand: "STANLEY", manufacturerReference: "STA-MR5", technicalSpecs: { longueur: "5 m", largeur: "19 mm", type: "Automatique", finition: "Nylon coating" }, unitType: "piece", supplierPrice: 4000, recommendedPrice: 5000, cmPrice: 4444, salePrice: 2900, saleEndsAt: "2026-07-20T00:00:00Z", stock: 60, reservedStock: 0, availableStock: 60, lowStockThreshold: 15, unlimitedStock: false, isActive: true, isVisible: true, createdAt: "2026-07-06T10:00:00Z", updatedAt: "2026-07-09T10:00:00Z" },
  { id: "sp-43", supplierId: "supplier-1", name: "Cutter de chantier 18mm", description: "Cutter à lame 18mm avec lame de rechange intégrée et cran de sécurité.", categoryId: "cat-mat-10", categoryName: "Outillage", images: [], brand: "OLFA", manufacturerReference: "OLF-CK18", technicalSpecs: { lame: "18 mm", rechange: "Intégrée", securite: "Cran de verrouillage", corps: "Aluminium" }, unitType: "piece", supplierPrice: 2500, recommendedPrice: 3200, cmPrice: 2778, stock: 100, reservedStock: 0, availableStock: 100, lowStockThreshold: 20, unlimitedStock: false, isActive: true, isVisible: true, createdAt: "2026-07-06T11:00:00Z", updatedAt: "2026-07-09T10:00:00Z" },

  { id: "sp-44", supplierId: "supplier-1", name: "Pinceau plat 50mm", description: "Pinceau plat qualité professionnelle, soies synthétiques, 50mm.", categoryId: "cat-mat-5", categoryName: "Peintures et finitions", images: [], brand: "BÜRKLE", manufacturerReference: "BUR-P50", technicalSpecs: { largeur: "50 mm", soies: "Synthétiques", usage: "Peinture acrylique/glycéro", manche: "Bois verni" }, unitType: "piece", supplierPrice: 2000, recommendedPrice: 2800, cmPrice: 2222, stock: 80, reservedStock: 0, availableStock: 80, lowStockThreshold: 20, unlimitedStock: false, isActive: true, isVisible: true, createdAt: "2026-07-06T14:00:00Z", updatedAt: "2026-07-09T10:00:00Z" },
  { id: "sp-45", supplierId: "supplier-1", name: "Rouleau à peinture 18cm", description: "Rouleau à réservoir 18cm avec manche télescopique. Lot de 3 rechanges.", categoryId: "cat-mat-5", categoryName: "Peintures et finitions", images: [], brand: "BÜRKLE", manufacturerReference: "BUR-R18", technicalSpecs: { taille: "18 cm", type: "Réservoir", manche: "Télescopique", rechanges: "3" }, unitType: "set", supplierPrice: 4500, recommendedPrice: 5800, cmPrice: 5000, stock: 40, reservedStock: 0, availableStock: 40, lowStockThreshold: 10, unlimitedStock: false, isActive: true, isVisible: true, createdAt: "2026-07-06T15:00:00Z", updatedAt: "2026-07-09T10:00:00Z" },
  { id: "sp-46", supplierId: "supplier-1", name: "Ruban de masquage 48mm x 50m", description: "Ruban de masquage crêpe 48mm de large, 50m de long. Bonne adhérence.", categoryId: "cat-mat-5", categoryName: "Peintures et finitions", images: [], brand: "TESA", manufacturerReference: "TES-MK4850", technicalSpecs: { largeur: "48 mm", longueur: "50 m", type: "Crêpe", adherence: "Moyenne" }, unitType: "piece", supplierPrice: 2500, recommendedPrice: 3200, cmPrice: 2778, stock: 60, reservedStock: 0, availableStock: 60, lowStockThreshold: 15, unlimitedStock: false, isActive: true, isVisible: true, createdAt: "2026-07-07T08:00:00Z", updatedAt: "2026-07-09T10:00:00Z" },
  { id: "sp-47", supplierId: "supplier-1", name: "Enduit de rebouchage 1kg", description: "Enduit de rebouchage blanc prêt à l'emploi 1kg. Séchage rapide 30min.", categoryId: "cat-mat-5", categoryName: "Peintures et finitions", images: [], brand: "TOLLENS", manufacturerReference: "TOL-REB-1", technicalSpecs: { poids: "1 kg", type: "Prêt à l'emploi", couleur: "Blanc", sechage: "30 min" }, unitType: "kg", supplierPrice: 1800, recommendedPrice: 2200, cmPrice: 2000, stock: 90, reservedStock: 0, availableStock: 90, lowStockThreshold: 20, unlimitedStock: false, isActive: true, isVisible: true, createdAt: "2026-07-07T09:00:00Z", updatedAt: "2026-07-09T10:00:00Z" },

  { id: "sp-48", supplierId: "supplier-1", name: "Planche sapin 200x20x2cm", description: "Planche de sapin rabotée 200cm x 20cm x 2cm pour coffrage et étagères.", categoryId: "cat-mat-7", categoryName: "Menuiserie et bois", images: [], brand: "BOIS CI", manufacturerReference: "BCI-SAP20020", technicalSpecs: { dimensions: "200x20x2 cm", essence: "Sapin rouge", type: "Rabotée", traitement: "Naturel" }, unitType: "piece", supplierPrice: 3500, recommendedPrice: 4500, cmPrice: 3889, stock: 100, reservedStock: 0, availableStock: 100, lowStockThreshold: 20, unlimitedStock: false, isActive: true, isVisible: true, createdAt: "2026-07-07T10:00:00Z", updatedAt: "2026-07-09T10:00:00Z" },
  { id: "sp-49", supplierId: "supplier-1", name: "Tasseau pin 240x4x4cm", description: "Tasseau en pin raboté 240cm x 40mm x 40mm pour ossatures et aménagement.", categoryId: "cat-mat-7", categoryName: "Menuiserie et bois", images: [], brand: "BOIS CI", manufacturerReference: "BCI-PIN24040", technicalSpecs: { dimensions: "240x4x4 cm", essence: "Pin sylvestre", type: "Raboté", usage: "Ossature légère" }, unitType: "piece", supplierPrice: 2800, recommendedPrice: 3500, cmPrice: 3111, stock: 150, reservedStock: 0, availableStock: 150, lowStockThreshold: 30, unlimitedStock: false, isActive: true, isVisible: true, createdAt: "2026-07-07T11:00:00Z", updatedAt: "2026-07-09T10:00:00Z" },

  { id: "sp-50", supplierId: "supplier-1", name: "Joint carrelage blanc 2kg", description: "Sac de 2kg de joint blanc pour carrelage mural. Finition lisse hydrofuge.", categoryId: "cat-mat-3", categoryName: "Carrelages et revêtements", images: [], brand: "WEBER", manufacturerReference: "WEB-JOINT-2", technicalSpecs: { poids: "2 kg", couleur: "Blanc", type: "Hydrofuge", usage: "Carrelage mural" }, unitType: "kg", supplierPrice: 3500, recommendedPrice: 4500, cmPrice: 3889, stock: 40, reservedStock: 0, availableStock: 40, lowStockThreshold: 10, unlimitedStock: false, isActive: true, isVisible: true, createdAt: "2026-07-07T14:00:00Z", updatedAt: "2026-07-09T10:00:00Z" },
  { id: "sp-51", supplierId: "supplier-1", name: "Croisillon carrelage 2mm", description: "Sac de 100 croisillons 2mm pour pose carrelage. Épaisseur régulière garantie.", categoryId: "cat-mat-3", categoryName: "Carrelages et revêtements", images: [], brand: "RUBI", manufacturerReference: "RUB-C2-100", technicalSpecs: { epaisseur: "2 mm", quantite: "100", type: "Croix", usage: "Carrelage sol/mur" }, unitType: "box", supplierPrice: 1500, recommendedPrice: 2000, cmPrice: 1667, stock: 120, reservedStock: 0, availableStock: 120, lowStockThreshold: 30, unlimitedStock: false, isActive: true, isVisible: true, createdAt: "2026-07-07T15:00:00Z", updatedAt: "2026-07-09T10:00:00Z" },
  { id: "sp-52", supplierId: "supplier-1", name: "Colle carrelage 25kg", description: "Sac de 25kg de colle carrelage en poudre. Usage sol et mur. Prise rapide.", categoryId: "cat-mat-3", categoryName: "Carrelages et revêtements", images: [], brand: "WEBER", manufacturerReference: "WEB-COLLE-25", technicalSpecs: { poids: "25 kg", type: "Prise rapide", usage: "Sol et mur", rendement: "3-4 kg/m²" }, unitType: "bag", supplierPrice: 8500, recommendedPrice: 10000, cmPrice: 9444, stock: 35, reservedStock: 0, availableStock: 35, lowStockThreshold: 8, unlimitedStock: false, isActive: true, isVisible: true, createdAt: "2026-07-08T08:00:00Z", updatedAt: "2026-07-09T10:00:00Z" },

  // ── Matériaux Yopougon — Nouveaux produits ──
  { id: "sp-53", supplierId: "supplier-2", name: "Ampoule LED 15W E27", description: "Ampoule LED 15W blanc chaud 3000K. Équivalent 120W.", categoryId: "cat-mat-6", categoryName: "Plomberie et électricité", images: [], brand: "OMNILUX", manufacturerReference: "OMN-LED15", technicalSpecs: { puissance: "15 W", culot: "E27", temperature: "3000K", flux: "1350 lm" }, unitType: "piece", supplierPrice: 1800, cmPrice: 2045, stock: 200, reservedStock: 0, availableStock: 200, lowStockThreshold: 40, unlimitedStock: false, isActive: true, isVisible: true, createdAt: "2026-07-05T08:00:00Z", updatedAt: "2026-07-09T10:00:00Z" },
  { id: "sp-54", supplierId: "supplier-2", name: "Scie égoïne 500mm", description: "Scie égoïne 500mm avec lame acier trempé et manche bi-matière.", categoryId: "cat-mat-10", categoryName: "Outillage", images: [], brand: "STANLEY", manufacturerReference: "STA-SE500", technicalSpecs: { longueur: "500 mm", denture: "Trempée", manche: "Bi-matière", usage: "Bois/Plâtre" }, unitType: "piece", supplierPrice: 5500, cmPrice: 6250, stock: 20, reservedStock: 0, availableStock: 20, lowStockThreshold: 5, unlimitedStock: false, isActive: true, isVisible: true, createdAt: "2026-07-06T09:00:00Z", updatedAt: "2026-07-09T10:00:00Z" },

  // ── BTP Express — Nouveaux produits ──
  { id: "sp-55", supplierId: "supplier-3", name: "Gant de protection latex (paire)", description: "Paire de gants latex jaune taille L. Protection chimique et mécanique.", categoryId: "cat-mat-9", categoryName: "Équipements de chantier", images: [], brand: "PROMAIN", manufacturerReference: "PRO-LAT-L", technicalSpecs: { type: "Latex", taille: "L", protection: "Chimique/Mécanique", norme: "EN388" }, unitType: "set", supplierPrice: 2500, cmPrice: 2778, stock: 50, reservedStock: 0, availableStock: 50, lowStockThreshold: 10, unlimitedStock: false, isActive: true, isVisible: true, createdAt: "2026-07-07T08:00:00Z", updatedAt: "2026-07-09T10:00:00Z" },
  { id: "sp-56", supplierId: "supplier-3", name: "Bac à peinture 30x40cm", description: "Bac à peinture plastique 30x40cm avec grille d'essorage intégrée.", categoryId: "cat-mat-5", categoryName: "Peintures et finitions", images: [], brand: "BÜRKLE", manufacturerReference: "BUR-BAC30", technicalSpecs: { dimensions: "30x40 cm", materiau: "Plastique PP", grille: "Intégrée", usage: "Rouleau 18cm" }, unitType: "piece", supplierPrice: 3500, cmPrice: 3889, stock: 25, reservedStock: 0, availableStock: 25, lowStockThreshold: 5, unlimitedStock: false, isActive: true, isVisible: true, createdAt: "2026-07-07T09:00:00Z", updatedAt: "2026-07-09T10:00:00Z" },
]

export const MOCK_DELIVERY_ZONES: DeliveryZone[] = [
  { id: "dz-1", supplierId: "supplier-1", city: "Cocody", price: 5000, estimatedDelayHours: 2, isActive: true },
  { id: "dz-2", supplierId: "supplier-1", city: "Plateau", price: 3500, estimatedDelayHours: 1, isActive: true },
  { id: "dz-3", supplierId: "supplier-1", city: "Yopougon", price: 7000, estimatedDelayHours: 4, isActive: true },
  { id: "dz-4", supplierId: "supplier-1", city: "Marcory", price: 4000, estimatedDelayHours: 2, isActive: true },
  { id: "dz-5", supplierId: "supplier-1", city: "Treichville", price: 4500, estimatedDelayHours: 2, isActive: true },
  { id: "dz-6", supplierId: "supplier-1", city: "Adjamé", price: 5000, estimatedDelayHours: 3, isActive: true },
  { id: "dz-7", supplierId: "supplier-1", city: "Koumassi", price: 5500, estimatedDelayHours: 3, isActive: true },
  { id: "dz-8", supplierId: "supplier-2", city: "Yopougon", price: 3000, estimatedDelayHours: 1, isActive: true },
  { id: "dz-9", supplierId: "supplier-2", city: "Abobo", price: 4000, estimatedDelayHours: 2, isActive: true },
  { id: "dz-10", supplierId: "supplier-2", city: "Adjamé", price: 4500, estimatedDelayHours: 2, isActive: true },
  { id: "dz-11", supplierId: "supplier-2", city: "Attécoubé", price: 3500, estimatedDelayHours: 2, isActive: true },
  { id: "dz-12", supplierId: "supplier-3", city: "Marcory", price: 3000, estimatedDelayHours: 1, isActive: true },
  { id: "dz-13", supplierId: "supplier-3", city: "Cocody", price: 5000, estimatedDelayHours: 2, isActive: true },
  { id: "dz-14", supplierId: "supplier-3", city: "Plateau", price: 3500, estimatedDelayHours: 1, isActive: true },
  { id: "dz-15", supplierId: "supplier-3", city: "Port-Bouët", price: 6000, estimatedDelayHours: 4, isActive: true },
]

export const MOCK_ORDERS: MaterialOrder[] = [
  {
    id: "MO-2026-0001", jobId: "job-1", quoteId: "qte-1", supplierId: "supplier-1", supplierName: "Quincaillerie ABC",
    clientId: "client-1", clientName: "Kouamé Paul", professionalId: "pro-1", professionalName: "Mamadou Koné",
    status: "DELIVERED", deliveryCity: "Cocody", deliveryAddress: "15 Rue des Commercants", deliveryCost: 5000,
    subtotal: 325000, commission: 32500, total: 297500, notes: "Livraison effectuée avec succès",
    estimatedDeliveryAt: "2026-07-04T16:00:00Z", deliveredAt: "2026-07-04T15:30:00Z",
    items: [
      { id: "moi-1", orderId: "MO-2026-0001", productId: "sp-1", productName: "Ciment Portland 42.5R", quantity: 20, unitPrice: 6500, totalPrice: 130000 },
      { id: "moi-2", orderId: "MO-2026-0001", productId: "sp-2", productName: "Fer à béton diam 12", quantity: 15, unitPrice: 8500, totalPrice: 127500 },
      { id: "moi-3", orderId: "MO-2026-0001", productId: "sp-8", productName: "Porte en bois massif", quantity: 1, unitPrice: 67500, totalPrice: 67500 },
    ], createdAt: "2026-07-01T09:00:00Z", updatedAt: "2026-07-05T16:00:00Z",
  },
  {
    id: "MO-2026-0002", jobId: "job-1", quoteId: "qte-1", supplierId: "supplier-1", supplierName: "Quincaillerie ABC",
    clientId: "client-1", clientName: "Kouamé Paul", professionalId: "pro-1", professionalName: "Mamadou Koné",
    status: "PREPARING", deliveryCity: "Yopougon", deliveryAddress: "25 Av. de la Paix", deliveryCost: 7000,
    subtotal: 180000, commission: 18000, total: 169000, notes: "Préparation en cours — tout le stock est disponible",
    estimatedDeliveryAt: "2026-07-11T18:00:00Z",
    items: [
      { id: "moi-4", orderId: "MO-2026-0002", productId: "sp-3", productName: "Carreau de ciment 20x20", quantity: 10, unitPrice: 15000, totalPrice: 150000 },
      { id: "moi-5", orderId: "MO-2026-0002", productId: "sp-9", productName: "Vis à bois 4x40mm", quantity: 5, unitPrice: 3500, totalPrice: 17500 },
    ], createdAt: "2026-07-06T10:00:00Z", updatedAt: "2026-07-08T14:00:00Z",
  },
  {
    id: "MO-2026-0003", jobId: "job-2", quoteId: "qte-2", supplierId: "supplier-1", supplierName: "Quincaillerie ABC",
    clientId: "client-2", clientName: "Soro Ibrahim", professionalId: "pro-2", professionalName: "Fatou Diallo",
    status: "PENDING_SUPPLIER", deliveryCity: "Plateau", deliveryAddress: "5 Rue des Banques", deliveryCost: 3500,
    subtotal: 95000, commission: 9500, total: 89000, notes: "",
    estimatedDeliveryAt: "2026-07-14T18:00:00Z",
    items: [
      { id: "moi-6", orderId: "MO-2026-0003", productId: "sp-5", productName: "Tuyau PVC DN 50mm", quantity: 8, unitPrice: 4500, totalPrice: 36000 },
      { id: "moi-7", orderId: "MO-2026-0003", productId: "sp-10", productName: "Rouleau grillage soudé 1.5m", quantity: 3, unitPrice: 18000, totalPrice: 54000 },
    ], createdAt: "2026-07-10T08:00:00Z", updatedAt: "2026-07-10T08:00:00Z",
  },
  {
    id: "MO-2026-0004", jobId: "job-3", quoteId: "qte-3", supplierId: "supplier-1", supplierName: "Quincaillerie ABC",
    clientId: "client-3", clientName: "Achi Esther", professionalId: "pro-3", professionalName: "Koffi N'Guessan",
    status: "ACCEPTED", deliveryCity: "Marcory", deliveryAddress: "12 Rue de la Bourse", deliveryCost: 4000,
    subtotal: 72000, commission: 7200, total: 68800, notes: "Le client sera prévenu par SMS quand la commande sera prête",
    estimatedDeliveryAt: "2026-07-13T17:00:00Z",
    items: [
      { id: "moi-8", orderId: "MO-2026-0004", productId: "sp-11", productName: "Robinet mitigeur évier chromé", quantity: 2, unitPrice: 25000, totalPrice: 50000 },
      { id: "moi-9", orderId: "MO-2026-0004", productId: "sp-7", productName: "Clous de charpente 100mm", quantity: 5, unitPrice: 2500, totalPrice: 12500 },
    ], createdAt: "2026-07-09T14:00:00Z", updatedAt: "2026-07-10T09:00:00Z",
  },
  {
    id: "MO-2026-0005", jobId: "job-4", quoteId: "qte-4", supplierId: "supplier-1", supplierName: "Quincaillerie ABC",
    clientId: "client-4", clientName: "Koné Moussa", professionalId: "pro-4", professionalName: "Diallo Aïssata",
    status: "CANCELLED", deliveryCity: "Adjamé", deliveryCost: 5000,
    subtotal: 45000, commission: 4500, total: 45500, cancelledAt: "2026-07-08T11:00:00Z",
    cancellationReason: "Le client a trouvé un autre fournisseur moins cher",
    items: [
      { id: "moi-10", orderId: "MO-2026-0005", productId: "sp-12", productName: "Brouette de chantier 100L", quantity: 1, unitPrice: 32000, totalPrice: 32000 },
      { id: "moi-11", orderId: "MO-2026-0005", productId: "sp-7", productName: "Clous de charpente 100mm", quantity: 4, unitPrice: 2500, totalPrice: 10000 },
    ], createdAt: "2026-07-07T10:00:00Z", updatedAt: "2026-07-08T11:00:00Z",
  },
  {
    id: "MO-2026-0006", jobId: "job-5", quoteId: "qte-5", supplierId: "supplier-2", supplierName: "Matériaux Yopougon",
    clientId: "client-5", clientName: "Touré Aboubacar", professionalId: "pro-5", professionalName: "Sidibé Fatoumata",
    status: "DELIVERED", deliveryCity: "Yopougon", deliveryAddress: "55 Av. de la Liberté", deliveryCost: 3000,
    subtotal: 230000, commission: 27600, total: 205400, notes: "Livré en 2 fois — bonne coordination avec le client",
    estimatedDeliveryAt: "2026-07-03T17:00:00Z", deliveredAt: "2026-07-03T16:45:00Z",
    items: [
      { id: "moi-12", orderId: "MO-2026-0006", productId: "sp-14", productName: "Parpaing creux 20x20x40", quantity: 200, unitPrice: 800, totalPrice: 160000 },
      { id: "moi-13", orderId: "MO-2026-0006", productId: "sp-15", productName: "Tôle bac acier AL 2m", quantity: 6, unitPrice: 9500, totalPrice: 57000 },
    ], createdAt: "2026-06-30T08:00:00Z", updatedAt: "2026-07-04T10:00:00Z",
  },
  {
    id: "MO-2026-0007", jobId: "job-6", quoteId: "qte-6", supplierId: "supplier-2", supplierName: "Matériaux Yopougon",
    clientId: "client-6", clientName: "Bamba Oumar", professionalId: "pro-6", professionalName: "Konaté Mariam",
    status: "READY", deliveryCity: "Abobo", deliveryAddress: "8 Rue du Marché", deliveryCost: 4000,
    subtotal: 84000, commission: 10080, total: 77920, notes: "Commande prête — en attente de confirmation de livraison",
    estimatedDeliveryAt: "2026-07-12T16:00:00Z",
    items: [
      { id: "moi-14", orderId: "MO-2026-0007", productId: "sp-13", productName: "Ciment Portland 32.5", quantity: 10, unitPrice: 5800, totalPrice: 58000 },
      { id: "moi-15", orderId: "MO-2026-0007", productId: "sp-20", productName: "Kit câble électrique 1.5mm² 100m", quantity: 1, unitPrice: 35000, totalPrice: 35000 },
    ], createdAt: "2026-07-08T11:00:00Z", updatedAt: "2026-07-10T08:00:00Z",
  },
  {
    id: "MO-2026-0008", jobId: "job-7", quoteId: "qte-7", supplierId: "supplier-2", supplierName: "Matériaux Yopougon",
    clientId: "client-7", clientName: "Cissé Fatima", professionalId: "pro-7", professionalName: "Traoré Mamadou",
    status: "DISPUTED", deliveryCity: "Attécoubé", deliveryAddress: "22 Rue du Lycée", deliveryCost: 3500,
    subtotal: 125000, commission: 15000, total: 113500, notes: "Le client conteste la qualité des tôles livrées",
    estimatedDeliveryAt: "2026-07-09T17:00:00Z", deliveredAt: "2026-07-09T15:00:00Z",
    items: [
      { id: "moi-16", orderId: "MO-2026-0008", productId: "sp-15", productName: "Tôle bac acier AL 2m", quantity: 10, unitPrice: 9500, totalPrice: 95000 },
      { id: "moi-17", orderId: "MO-2026-0008", productId: "sp-18", productName: "Interrupteur simple allumage", quantity: 10, unitPrice: 2500, totalPrice: 25000 },
    ], createdAt: "2026-07-07T09:00:00Z", updatedAt: "2026-07-10T10:00:00Z",
  },
  {
    id: "MO-2026-0009", jobId: "job-8", quoteId: "qte-8", supplierId: "supplier-2", supplierName: "Matériaux Yopougon",
    clientId: "client-8", clientName: "Diaby Souleymane", professionalId: "pro-8", professionalName: "Ouattara Awa",
    status: "DELIVERING", deliveryCity: "Yopougon", deliveryAddress: "15 Rue des Jardins", deliveryCost: 3000,
    subtotal: 76000, commission: 9120, total: 69880, notes: "En cours de livraison — chauffeur en route",
    estimatedDeliveryAt: "2026-07-10T17:00:00Z",
    items: [
      { id: "moi-18", orderId: "MO-2026-0009", productId: "sp-16", productName: "Tube cuivre diam 14mm", quantity: 5, unitPrice: 12000, totalPrice: 60000 },
      { id: "moi-19", orderId: "MO-2026-0009", productId: "sp-19", productName: "Échafaudage roulant alu 2m", quantity: 1, unitPrice: 125000, totalPrice: 125000 },
    ], createdAt: "2026-07-08T15:00:00Z", updatedAt: "2026-07-10T12:00:00Z",
  },
  {
    id: "MO-2026-0010", jobId: "job-9", quoteId: "qte-9", supplierId: "supplier-2", supplierName: "Matériaux Yopougon",
    clientId: "client-9", clientName: "Koffi Aimé", professionalId: "pro-9", professionalName: "Konan Yves",
    status: "PARTIALLY_DELIVERED", deliveryCity: "Abobo", deliveryAddress: "3 Rue de l'École", deliveryCost: 4000,
    subtotal: 58000, commission: 6960, total: 55040, notes: "Livraison partielle — 5 sacs de ciment livrés, reste en attente de réapprovisionnement",
    estimatedDeliveryAt: "2026-07-13T17:00:00Z", deliveredAt: "2026-07-11T14:00:00Z",
    items: [
      { id: "moi-20", orderId: "MO-2026-0010", productId: "sp-13", productName: "Ciment Portland 32.5", quantity: 10, unitPrice: 5800, totalPrice: 58000 },
    ], createdAt: "2026-07-09T08:00:00Z", updatedAt: "2026-07-11T14:00:00Z",
  },
  {
    id: "MO-2026-0011", jobId: "job-10", quoteId: "qte-10", supplierId: "supplier-3", supplierName: "BTP Express",
    clientId: "client-10", clientName: "N'Diaye Rokhaya", professionalId: "pro-10", professionalName: "Fofana Ibrahim",
    status: "AWAITING_PAYMENT", deliveryCity: "Marcory", deliveryAddress: "10 Rue de la Paix", deliveryCost: 3000,
    subtotal: 105000, commission: 10500, total: 97500, notes: "En attente du paiement pour lancer la préparation",
    items: [
      { id: "moi-21", orderId: "MO-2026-0011", productId: "sp-21", productName: "Plaque de plâtre BA13", quantity: 10, unitPrice: 7500, totalPrice: 75000 },
      { id: "moi-22", orderId: "MO-2026-0011", productId: "sp-22", productName: "Enduit de lissage blanc 25kg", quantity: 3, unitPrice: 8500, totalPrice: 25500 },
    ], createdAt: "2026-07-10T11:00:00Z", updatedAt: "2026-07-10T11:00:00Z",
  },
  {
    id: "MO-2026-0012", jobId: "job-11", quoteId: "qte-11", supplierId: "supplier-3", supplierName: "BTP Express",
    clientId: "client-11", clientName: "Gueï Léa", professionalId: "pro-11", professionalName: "Coulibaly Adama",
    status: "PENDING_SUPPLIER", deliveryCity: "Plateau", deliveryAddress: "2 Av. de la République", deliveryCost: 3500,
    subtotal: 145000, commission: 14500, total: 134000, notes: "",
    items: [
      { id: "moi-23", orderId: "MO-2026-0012", productId: "sp-23", productName: "WC suspendu complet", quantity: 1, unitPrice: 145000, totalPrice: 145000 },
    ], createdAt: "2026-07-10T14:00:00Z", updatedAt: "2026-07-10T14:00:00Z",
  },
  {
    id: "MO-2026-0013", jobId: "job-12", quoteId: "qte-12", supplierId: "supplier-1", supplierName: "Quincaillerie ABC",
    clientId: "client-12", clientName: "Zadi Roger", professionalId: "pro-12", professionalName: "Beugré Mireille",
    status: "CANCELLED", deliveryCity: "Koumassi", deliveryCost: 5500, cancelledAt: "2026-07-09T10:00:00Z",
    cancellationReason: "Rupture de stock — produit indisponible",
    subtotal: 32000, commission: 3200, total: 34300,
    items: [
      { id: "moi-24", orderId: "MO-2026-0013", productId: "sp-12", productName: "Brouette de chantier 100L", quantity: 1, unitPrice: 32000, totalPrice: 32000 },
    ], createdAt: "2026-07-08T12:00:00Z", updatedAt: "2026-07-09T10:00:00Z",
  },
  {
    id: "MO-2026-0014", jobId: "job-13", quoteId: "qte-13", supplierId: "supplier-3", supplierName: "BTP Express",
    clientId: "client-13", clientName: "Tano Béatrice", professionalId: "pro-13", professionalName: "Kouassi Paul",
    status: "PREPARING", deliveryCity: "Cocody", deliveryAddress: "7 Rue du Château", deliveryCost: 5000,
    subtotal: 95000, commission: 9500, total: 90500, notes: "Préparation en cours — perceuse en test qualité",
    estimatedDeliveryAt: "2026-07-13T17:00:00Z",
    items: [
      { id: "moi-25", orderId: "MO-2026-0014", productId: "sp-25", productName: "Perceuse sans fil 18V", quantity: 1, unitPrice: 95000, totalPrice: 95000 },
    ], createdAt: "2026-07-09T16:00:00Z", updatedAt: "2026-07-10T09:00:00Z",
  },
  {
    id: "MO-2026-0015", jobId: "job-14", quoteId: "qte-14", supplierId: "supplier-1", supplierName: "Quincaillerie ABC",
    clientId: "client-14", clientName: "Ahou Angèle", professionalId: "pro-14", professionalName: "Niamké Nestor",
    status: "DELIVERED", deliveryCity: "Treichville", deliveryAddress: "18 Bd de Marseille", deliveryCost: 4500,
    subtotal: 210000, commission: 21000, total: 193500, notes: "Client très satisfait — commande complète livrée dans les temps",
    estimatedDeliveryAt: "2026-07-02T16:00:00Z", deliveredAt: "2026-07-02T14:30:00Z",
    items: [
      { id: "moi-26", orderId: "MO-2026-0015", productId: "sp-3", productName: "Carreau de ciment 20x20", quantity: 8, unitPrice: 15000, totalPrice: 120000 },
      { id: "moi-27", orderId: "MO-2026-0015", productId: "sp-1", productName: "Ciment Portland 42.5R", quantity: 10, unitPrice: 6500, totalPrice: 65000 },
    ], createdAt: "2026-06-29T10:00:00Z", updatedAt: "2026-07-03T09:00:00Z",
  },
]

export const MOCK_PAYMENTS: SupplierPayment[] = [
  { id: "spay-1", orderId: "MO-2026-0001", supplierId: "supplier-1", provider: "orange_money", providerTransactionId: "OM-87123456", amount: 297500, subtotal: 325000, deliveryCost: 5000, commission: 32500, netAmount: 262500, status: "captured", createdAt: "2026-07-01T10:00:00Z", updatedAt: "2026-07-05T16:00:00Z" },
  { id: "spay-2", orderId: "MO-2026-0006", supplierId: "supplier-2", provider: "mtn_momo", providerTransactionId: "MTN-65432109", amount: 205400, subtotal: 230000, deliveryCost: 3000, commission: 27600, netAmount: 177800, status: "captured", createdAt: "2026-06-30T09:00:00Z", updatedAt: "2026-07-04T10:00:00Z" },
  { id: "spay-3", orderId: "MO-2026-0015", supplierId: "supplier-1", provider: "wave", providerTransactionId: "WAVE-78901234", amount: 193500, subtotal: 210000, deliveryCost: 4500, commission: 21000, netAmount: 172500, status: "captured", createdAt: "2026-06-29T11:00:00Z", updatedAt: "2026-07-03T09:00:00Z" },
  { id: "spay-4", orderId: "MO-2026-0002", supplierId: "supplier-1", provider: "orange_money", providerTransactionId: "OM-90123456", amount: 169000, subtotal: 180000, deliveryCost: 7000, commission: 18000, netAmount: 151000, status: "captured", createdAt: "2026-07-06T11:00:00Z", updatedAt: "2026-07-06T11:00:00Z" },
  { id: "spay-5", orderId: "MO-2026-0008", supplierId: "supplier-2", provider: "mtn_momo", providerTransactionId: "MTN-34567890", amount: 113500, subtotal: 125000, deliveryCost: 3500, commission: 15000, netAmount: 98500, status: "captured", createdAt: "2026-07-07T10:00:00Z", updatedAt: "2026-07-07T10:00:00Z" },
  { id: "spay-6", orderId: "MO-2026-0008", supplierId: "supplier-2", provider: "mtn_momo", providerTransactionId: "MTN-34567891", amount: 113500, subtotal: 125000, deliveryCost: 3500, commission: 15000, netAmount: 98500, status: "refunded", refundedAt: "2026-07-10T10:00:00Z", refundReason: "Litige client — qualité des tôles contestée", createdAt: "2026-07-07T10:00:00Z", updatedAt: "2026-07-10T10:00:00Z" },
  { id: "spay-7", orderId: "MO-2026-0005", supplierId: "supplier-1", provider: "orange_money", providerTransactionId: "OM-56789012", amount: 45500, subtotal: 45000, deliveryCost: 5000, commission: 4500, netAmount: 41000, status: "refunded", refundedAt: "2026-07-08T12:00:00Z", refundReason: "Annulation commande — client a trouvé meilleur prix", createdAt: "2026-07-07T11:00:00Z", updatedAt: "2026-07-08T12:00:00Z" },
  { id: "spay-8", orderId: "MO-2026-0009", supplierId: "supplier-2", provider: "wave", providerTransactionId: "WAVE-45678901", amount: 69880, subtotal: 76000, deliveryCost: 3000, commission: 9120, netAmount: 60760, status: "pending", createdAt: "2026-07-08T16:00:00Z", updatedAt: "2026-07-08T16:00:00Z" },
  { id: "spay-9", orderId: "MO-2026-0003", supplierId: "supplier-1", provider: "orange_money", providerTransactionId: "OM-67890123", amount: 89000, subtotal: 95000, deliveryCost: 3500, commission: 9500, netAmount: 79500, status: "pending", createdAt: "2026-07-10T09:00:00Z", updatedAt: "2026-07-10T09:00:00Z" },
  { id: "spay-10", orderId: "MO-2026-0011", supplierId: "supplier-3", provider: "mtn_momo", providerTransactionId: "MTN-89012345", amount: 97500, subtotal: 105000, deliveryCost: 3000, commission: 10500, netAmount: 87000, status: "pending", createdAt: "2026-07-10T12:00:00Z", updatedAt: "2026-07-10T12:00:00Z" },
  { id: "spay-11", orderId: "MO-2026-0004", supplierId: "supplier-1", provider: "wave", providerTransactionId: "WAVE-12345678", amount: 68800, subtotal: 72000, deliveryCost: 4000, commission: 7200, netAmount: 61600, status: "pending", createdAt: "2026-07-10T09:30:00Z", updatedAt: "2026-07-10T09:30:00Z" },
  { id: "spay-12", orderId: "MO-2026-0013", supplierId: "supplier-1", provider: "orange_money", providerTransactionId: "OM-78901234", amount: 34300, subtotal: 32000, deliveryCost: 5500, commission: 3200, netAmount: 31100, status: "failed", failureReason: "Solde insuffisant du client", createdAt: "2026-07-08T13:00:00Z", updatedAt: "2026-07-08T13:00:00Z" },
  { id: "spay-13", orderId: "MO-2026-0010", supplierId: "supplier-2", provider: "mtn_momo", providerTransactionId: "MTN-01234567", amount: 55040, subtotal: 58000, deliveryCost: 4000, commission: 6960, netAmount: 49040, status: "partially_refunded", refundedAt: "2026-07-11T14:30:00Z", refundReason: "Livraison partielle — 5 sacs sur 10 livrés", createdAt: "2026-07-09T09:00:00Z", updatedAt: "2026-07-11T14:30:00Z" },
  { id: "spay-14", orderId: "MO-2026-0014", supplierId: "supplier-3", provider: "orange_money", providerTransactionId: "OM-13579246", amount: 90500, subtotal: 95000, deliveryCost: 5000, commission: 9500, netAmount: 81000, status: "pending", createdAt: "2026-07-10T10:00:00Z", updatedAt: "2026-07-10T10:00:00Z" },
  { id: "spay-15", orderId: "MO-2026-0012", supplierId: "supplier-3", provider: "wave", providerTransactionId: "WAVE-24681357", amount: 134000, subtotal: 145000, deliveryCost: 3500, commission: 14500, netAmount: 120000, status: "failed", failureReason: "Expiration session de paiement", createdAt: "2026-07-10T15:00:00Z", updatedAt: "2026-07-10T15:00:00Z" },
]

export const MOCK_DISPUTES: SupplierDispute[] = [
  {
    id: "disp-1", orderId: "MO-2026-0008", supplierId: "supplier-2", clientId: "client-7", clientName: "Cissé Fatima",
    professionalId: "pro-7", professionalName: "Traoré Mamadou",
    reason: "Qualité des tôles non conforme",
    description: "Les tôles livrées présentent des traces de rouille sur 3 plaques. Le client demande un remplacement intégral.",
    amount: 95000, status: "under_review", attachments: ["/photos/toles-rouille-1.jpg", "/photos/toles-rouille-2.jpg"],
    messages: [
      { id: "dmsg-1", disputeId: "disp-1", senderId: "client-7", senderRole: "client", senderName: "Cissé Fatima", content: "Bonjour, j'ai reçu les tôles mais 3 d'entre elles ont des traces de rouille. Je les ai photographiées. Je souhaite un remplacement.", attachments: ["/photos/toles-rouille-1.jpg"], createdAt: "2026-07-10T08:30:00Z" },
      { id: "dmsg-2", disputeId: "disp-1", senderId: "supplier-2", senderRole: "supplier", senderName: "Soro Ibrahim", content: "Bonjour Madame, je suis désolé pour ce désagrément. Les tôles étaient en parfait état à la sortie. Je vais vérifier avec mon équipe et revenir vers vous sous 24h.", attachments: [], createdAt: "2026-07-10T09:15:00Z" },
      { id: "dmsg-3", disputeId: "disp-1", senderId: "client-7", senderRole: "client", senderName: "Cissé Fatima", content: "D'accord, je reste disponible. Mais je veux une solution rapidement car mon chantier est arrêté.", attachments: [], createdAt: "2026-07-10T09:30:00Z" },
      { id: "dmsg-4", disputeId: "disp-1", senderId: "admin-1", senderRole: "admin", senderName: "Admin Ça Match", content: "Nous avons pris connaissance du litige. Un médiateur va être assigné sous 48h. Nous vous tiendrons informés.", attachments: [], createdAt: "2026-07-10T10:00:00Z" },
      { id: "dmsg-5", disputeId: "disp-1", senderId: "supplier-2", senderRole: "supplier", senderName: "Soro Ibrahim", content: "J'ai parlé à mon livreur. Il confirme que les tôles étaient OK au chargement. Je demande une inspection par un tiers.", attachments: [], createdAt: "2026-07-10T11:00:00Z" },
    ], createdAt: "2026-07-10T08:00:00Z", updatedAt: "2026-07-10T11:00:00Z",
  },
  {
    id: "disp-2", orderId: "MO-2026-0005", supplierId: "supplier-1", clientId: "client-4", clientName: "Koné Moussa",
    professionalId: "pro-4", professionalName: "Diallo Aïssata",
    reason: "Annulation unilatérale",
    description: "Le client a annulé la commande sans prévenir alors que la préparation était déjà en cours. Le fournisseur demande une compensation pour le temps perdu.",
    amount: 15000, status: "resolved_client", attachments: [],
    resolvedAt: "2026-07-09T16:00:00Z", resolution: "Le client s'est excusé et une compensation de 10 000 FCFA a été versée au fournisseur.",
    messages: [
      { id: "dmsg-6", disputeId: "disp-2", senderId: "supplier-1", senderRole: "supplier", senderName: "Mamadou Diallo", content: "Bonjour, nous avons préparé la brouette et les clous comme convenu, et le client a annulé sans explication. Nous avons perdu du temps et mobilisé du stock.", attachments: [], createdAt: "2026-07-08T12:00:00Z" },
      { id: "dmsg-7", disputeId: "disp-2", senderId: "client-4", senderRole: "client", senderName: "Koné Moussa", content: "Désolé, j'ai trouvé une meilleure offre ailleurs. Je comprends votre frustration.", attachments: [], createdAt: "2026-07-08T14:00:00Z" },
      { id: "dmsg-8", disputeId: "disp-2", senderId: "admin-1", senderRole: "admin", senderName: "Admin Ça Match", content: "Nous recommandons une compensation de 10 000 FCFA au fournisseur pour le temps de préparation. Le client est d'accord.", attachments: [], createdAt: "2026-07-09T10:00:00Z" },
    ], createdAt: "2026-07-08T11:30:00Z", updatedAt: "2026-07-09T16:00:00Z",
  },
  {
    id: "disp-3", orderId: "MO-2026-0010", supplierId: "supplier-2", clientId: "client-9", clientName: "Koffi Aimé",
    professionalId: "pro-9", professionalName: "Konan Yves",
    reason: "Livraison partielle non prévenue",
    description: "Seulement 5 sacs sur 10 ont été livrés. Le client n'a pas été prévenu à l'avance.",
    amount: 29000, status: "opened", attachments: [],
    messages: [
      { id: "dmsg-9", disputeId: "disp-3", senderId: "client-9", senderRole: "client", senderName: "Koffi Aimé", content: "Je reçois 5 sacs au lieu de 10, sans aucun appel pour me prévenir. Mon chantier est bloqué.", attachments: [], createdAt: "2026-07-11T15:00:00Z" },
    ], createdAt: "2026-07-11T14:30:00Z", updatedAt: "2026-07-11T14:30:00Z",
  },
  {
    id: "disp-4", orderId: "MO-2026-0013", supplierId: "supplier-1", clientId: "client-12", clientName: "Zadi Roger",
    professionalId: "pro-12", professionalName: "Beugré Mireille",
    reason: "Rupture de stock non signalée",
    description: "Le fournisseur a accepté la commande puis annulé pour rupture de stock. Le client a perdu 2 jours.",
    amount: 32000, status: "resolved_supplier", attachments: [],
    resolvedAt: "2026-07-09T15:00:00Z", resolution: "Le fournisseur a commandé le stock et livrera sous 48h aux frais de Ça Match.",
    messages: [
      { id: "dmsg-10", disputeId: "disp-4", senderId: "client-12", senderRole: "client", senderName: "Zadi Roger", content: "J'ai commandé une brouette, vous avez accepté, puis annulé le lendemain. C'est une perte de temps.", attachments: [], createdAt: "2026-07-09T10:30:00Z" },
      { id: "dmsg-11", disputeId: "disp-4", senderId: "supplier-1", senderRole: "supplier", senderName: "Mamadou Diallo", content: "Toutes mes excuses, notre stock était mal synchronisé. Je m'engage à commander et livrer sous 48h.", attachments: [], createdAt: "2026-07-09T12:00:00Z" },
      { id: "dmsg-12", disputeId: "disp-4", senderId: "admin-1", senderRole: "admin", senderName: "Admin Ça Match", content: "Solution acceptée : livraison sous 48h aux frais de Ça Match. Transaction suivie.", attachments: [], createdAt: "2026-07-09T14:00:00Z" },
    ], createdAt: "2026-07-09T10:00:00Z", updatedAt: "2026-07-09T15:00:00Z",
  },
  {
    id: "disp-5", orderId: "MO-2026-0002", supplierId: "supplier-1", clientId: "client-1", clientName: "Kouamé Paul",
    professionalId: "pro-1", professionalName: "Mamadou Koné",
    reason: "Retard de livraison",
    description: "La commande devait être livrée hier. Le client n'a pas eu de nouvelles.",
    amount: 0, status: "rejected", attachments: [],
    resolvedAt: "2026-07-10T12:00:00Z", resolution: "Le fournisseur a prouvé que la livraison était prévue dans les délais (avant la date estimée). Litige rejeté.",
    messages: [
      { id: "dmsg-13", disputeId: "disp-5", senderId: "client-1", senderRole: "client", senderName: "Kouamé Paul", content: "Je n'ai pas reçu ma commande alors que la date estimée était hier.", attachments: [], createdAt: "2026-07-10T08:00:00Z" },
      { id: "dmsg-14", disputeId: "disp-5", senderId: "supplier-1", senderRole: "supplier", senderName: "Mamadou Diallo", content: "La date estimée de livraison est le 11/07, pas le 09. Nous sommes dans les temps.", attachments: [], createdAt: "2026-07-10T09:00:00Z" },
      { id: "dmsg-15", disputeId: "disp-5", senderId: "admin-1", senderRole: "admin", senderName: "Admin Ça Match", content: "Vérification faite : la date estimée est bien le 11/07/2026. Litige rejeté.", attachments: [], createdAt: "2026-07-10T11:00:00Z" },
    ], createdAt: "2026-07-10T07:30:00Z", updatedAt: "2026-07-10T12:00:00Z",
  },
]

export const MOCK_DELIVERIES: SupplierDelivery[] = [
  {
    id: "dlv-1", orderId: "MO-2026-0001", supplierId: "supplier-1", city: "Cocody", address: "15 Rue des Commercants",
    status: "delivered", estimatedPickupAt: "2026-07-04T08:00:00Z", pickedUpAt: "2026-07-04T08:30:00Z",
    estimatedDeliveryAt: "2026-07-04T16:00:00Z", deliveredAt: "2026-07-04T15:30:00Z",
    driverName: "Kouamé Jean", driverPhone: "+225 07 98 76 54 32", vehicleInfo: "Camion Kia 3.5T — AB-1234-CD",
    trackingSteps: [
      { id: "dls-1", deliveryId: "dlv-1", status: "preparing", label: "Préparation", description: "Commande préparée en entrepôt", timestamp: "2026-07-04T07:00:00Z" },
      { id: "dls-2", deliveryId: "dlv-1", status: "picked_up", label: "Enlevée", description: "Marchandise chargée dans le camion", timestamp: "2026-07-04T08:30:00Z" },
      { id: "dls-3", deliveryId: "dlv-1", status: "in_transit", label: "En route", description: "Livraison en cours vers Cocody", timestamp: "2026-07-04T09:00:00Z" },
      { id: "dls-4", deliveryId: "dlv-1", status: "delivered", label: "Livrée", description: "Livrée et signée par le client", timestamp: "2026-07-04T15:30:00Z" },
    ], createdAt: "2026-07-01T10:00:00Z", updatedAt: "2026-07-04T15:30:00Z",
  },
  {
    id: "dlv-2", orderId: "MO-2026-0006", supplierId: "supplier-2", city: "Yopougon", address: "55 Av. de la Liberté",
    status: "delivered", estimatedPickupAt: "2026-07-03T10:00:00Z", pickedUpAt: "2026-07-03T10:30:00Z",
    estimatedDeliveryAt: "2026-07-03T17:00:00Z", deliveredAt: "2026-07-03T16:45:00Z",
    driverName: "Koné Yacouba", driverPhone: "+225 07 65 43 21 09", vehicleInfo: "Camionnette Toyota — AB-5678-EF",
    trackingSteps: [
      { id: "dls-5", deliveryId: "dlv-2", status: "preparing", label: "Préparation", description: "200 parpaings + 6 tôles préparés", timestamp: "2026-07-03T08:00:00Z" },
      { id: "dls-6", deliveryId: "dlv-2", status: "picked_up", label: "Enlevée", description: "Marchandise chargée", timestamp: "2026-07-03T10:30:00Z" },
      { id: "dls-7", deliveryId: "dlv-2", status: "in_transit", label: "En route", description: "Livraison en cours vers Yopougon", timestamp: "2026-07-03T11:00:00Z" },
      { id: "dls-8", deliveryId: "dlv-2", status: "delivered", label: "Livrée", description: "Livrée — 2 voyages nécessaires", timestamp: "2026-07-03T16:45:00Z" },
    ], createdAt: "2026-06-30T09:00:00Z", updatedAt: "2026-07-03T16:45:00Z",
  },
  {
    id: "dlv-3", orderId: "MO-2026-0009", supplierId: "supplier-2", city: "Yopougon", address: "15 Rue des Jardins",
    status: "in_transit", estimatedPickupAt: "2026-07-10T12:00:00Z", pickedUpAt: "2026-07-10T12:30:00Z",
    estimatedDeliveryAt: "2026-07-10T17:00:00Z",
    driverName: "Koné Yacouba", driverPhone: "+225 07 65 43 21 09", vehicleInfo: "Camionnette Toyota — AB-5678-EF",
    trackingSteps: [
      { id: "dls-9", deliveryId: "dlv-3", status: "preparing", label: "Préparation", description: "Tubes cuivre + échafaudage préparés", timestamp: "2026-07-10T10:00:00Z" },
      { id: "dls-10", deliveryId: "dlv-3", status: "picked_up", label: "Enlevée", description: "Marchandise chargée", timestamp: "2026-07-10T12:30:00Z" },
      { id: "dls-11", deliveryId: "dlv-3", status: "in_transit", label: "En route", description: "En route vers Yopougon — ETA 16h", timestamp: "2026-07-10T13:00:00Z" },
    ], createdAt: "2026-07-08T16:00:00Z", updatedAt: "2026-07-10T13:00:00Z",
  },
  {
    id: "dlv-4", orderId: "MO-2026-0007", supplierId: "supplier-2", city: "Abobo", address: "8 Rue du Marché",
    status: "pending",
    estimatedDeliveryAt: "2026-07-12T16:00:00Z",
    trackingSteps: [
      { id: "dls-12", deliveryId: "dlv-4", status: "preparing", label: "Préparation", description: "En attente du départ", timestamp: "2026-07-10T08:00:00Z" },
    ], createdAt: "2026-07-08T12:00:00Z", updatedAt: "2026-07-10T08:00:00Z",
  },
  {
    id: "dlv-5", orderId: "MO-2026-0015", supplierId: "supplier-1", city: "Treichville", address: "18 Bd de Marseille",
    status: "delivered", estimatedPickupAt: "2026-07-02T08:00:00Z", pickedUpAt: "2026-07-02T08:15:00Z",
    estimatedDeliveryAt: "2026-07-02T16:00:00Z", deliveredAt: "2026-07-02T14:30:00Z",
    driverName: "Kouamé Jean", driverPhone: "+225 07 98 76 54 32", vehicleInfo: "Camion Kia 3.5T — AB-1234-CD",
    trackingSteps: [
      { id: "dls-13", deliveryId: "dlv-5", status: "preparing", label: "Préparation", description: "Carreaux + ciment préparés", timestamp: "2026-07-02T06:00:00Z" },
      { id: "dls-14", deliveryId: "dlv-5", status: "picked_up", label: "Enlevée", description: "Chargement terminé", timestamp: "2026-07-02T08:15:00Z" },
      { id: "dls-15", deliveryId: "dlv-5", status: "in_transit", label: "En route", description: "Livraison en cours vers Treichville", timestamp: "2026-07-02T09:00:00Z" },
      { id: "dls-16", deliveryId: "dlv-5", status: "delivered", label: "Livrée", description: "Livrée et payée — client satisfait", timestamp: "2026-07-02T14:30:00Z" },
    ], createdAt: "2026-06-29T11:00:00Z", updatedAt: "2026-07-02T14:30:00Z",
  },
  {
    id: "dlv-6", orderId: "MO-2026-0010", supplierId: "supplier-2", city: "Abobo", address: "3 Rue de l'École",
    status: "partial", estimatedPickupAt: "2026-07-11T08:00:00Z", pickedUpAt: "2026-07-11T08:30:00Z",
    estimatedDeliveryAt: "2026-07-13T17:00:00Z", deliveredAt: "2026-07-11T14:00:00Z",
    driverName: "Koné Yacouba", driverPhone: "+225 07 65 43 21 09",
    trackingSteps: [
      { id: "dls-17", deliveryId: "dlv-6", status: "preparing", label: "Préparation", description: "5 sacs disponibles sur 10", timestamp: "2026-07-11T06:00:00Z" },
      { id: "dls-18", deliveryId: "dlv-6", status: "picked_up", label: "Enlevée partielle", description: "5 sacs livrés — reste en attente", timestamp: "2026-07-11T08:30:00Z" },
      { id: "dls-19", deliveryId: "dlv-6", status: "in_transit", label: "En route", description: "Livraison en cours", timestamp: "2026-07-11T09:00:00Z" },
      { id: "dls-20", deliveryId: "dlv-6", status: "delivered", label: "Partiellement livrée", description: "5/10 sacs livrés", timestamp: "2026-07-11T14:00:00Z" },
    ], failureReason: "Stock insuffisant — réapprovisionnement en cours", createdAt: "2026-07-09T09:00:00Z", updatedAt: "2026-07-11T14:00:00Z",
  },
]

export const MOCK_STOCK_RESERVATIONS: StockReservation[] = [
  { id: "sr-1", productId: "sp-1", orderId: "MO-2026-0002", supplierId: "supplier-1", quantity: 20, status: "active", createdAt: "2026-07-06T10:00:00Z" },
  { id: "sr-2", productId: "sp-3", orderId: "MO-2026-0002", supplierId: "supplier-1", quantity: 10, status: "active", createdAt: "2026-07-06T10:00:00Z" },
  { id: "sr-3", productId: "sp-9", orderId: "MO-2026-0002", supplierId: "supplier-1", quantity: 5, status: "active", createdAt: "2026-07-06T10:00:00Z" },
  { id: "sr-4", productId: "sp-14", orderId: "MO-2026-0007", supplierId: "supplier-2", quantity: 200, status: "active", createdAt: "2026-07-08T11:00:00Z" },
  { id: "sr-5", productId: "sp-20", orderId: "MO-2026-0007", supplierId: "supplier-2", quantity: 1, status: "active", createdAt: "2026-07-08T11:00:00Z" },
  { id: "sr-6", productId: "sp-25", orderId: "MO-2026-0014", supplierId: "supplier-3", quantity: 1, status: "active", createdAt: "2026-07-09T16:00:00Z" },
  { id: "sr-7", productId: "sp-11", orderId: "MO-2026-0004", supplierId: "supplier-1", quantity: 2, status: "active", createdAt: "2026-07-09T14:00:00Z" },
  { id: "sr-8", productId: "sp-7", orderId: "MO-2026-0004", supplierId: "supplier-1", quantity: 5, status: "active", createdAt: "2026-07-09T14:00:00Z" },
  { id: "sr-9", productId: "sp-1", orderId: "MO-2026-0001", supplierId: "supplier-1", quantity: 20, status: "fulfilled", createdAt: "2026-07-01T09:00:00Z" },
  { id: "sr-10", productId: "sp-8", orderId: "MO-2026-0001", supplierId: "supplier-1", quantity: 1, status: "fulfilled", createdAt: "2026-07-01T09:00:00Z" },
  { id: "sr-11", productId: "sp-3", orderId: "MO-2026-0015", supplierId: "supplier-1", quantity: 8, status: "fulfilled", createdAt: "2026-06-29T10:00:00Z" },
  { id: "sr-12", productId: "sp-1", orderId: "MO-2026-0015", supplierId: "supplier-1", quantity: 10, status: "fulfilled", createdAt: "2026-06-29T10:00:00Z" },
  { id: "sr-13", productId: "sp-14", orderId: "MO-2026-0006", supplierId: "supplier-2", quantity: 200, status: "fulfilled", createdAt: "2026-06-30T08:00:00Z" },
  { id: "sr-14", productId: "sp-15", orderId: "MO-2026-0006", supplierId: "supplier-2", quantity: 6, status: "fulfilled", createdAt: "2026-06-30T08:00:00Z" },
  { id: "sr-15", productId: "sp-12", orderId: "MO-2026-0005", supplierId: "supplier-1", quantity: 1, status: "released", createdAt: "2026-07-07T10:00:00Z", releasedAt: "2026-07-08T11:00:00Z" },
  { id: "sr-16", productId: "sp-7", orderId: "MO-2026-0005", supplierId: "supplier-1", quantity: 4, status: "released", createdAt: "2026-07-07T10:00:00Z", releasedAt: "2026-07-08T11:00:00Z" },
  { id: "sr-17", productId: "sp-15", orderId: "MO-2026-0008", supplierId: "supplier-2", quantity: 10, status: "fulfilled", createdAt: "2026-07-07T09:00:00Z" },
  { id: "sr-18", productId: "sp-18", orderId: "MO-2026-0008", supplierId: "supplier-2", quantity: 10, status: "active", createdAt: "2026-07-07T09:00:00Z" },
  { id: "sr-19", productId: "sp-12", orderId: "MO-2026-0013", supplierId: "supplier-1", quantity: 1, status: "released", createdAt: "2026-07-08T12:00:00Z", releasedAt: "2026-07-09T10:00:00Z" },
  { id: "sr-20", productId: "sp-13", orderId: "MO-2026-0010", supplierId: "supplier-2", quantity: 10, status: "fulfilled", createdAt: "2026-07-09T08:00:00Z" },
]

export const MOCK_COMMISSIONS: SupplierCommission[] = [
  { id: "sc-1", supplierId: "supplier-1", rate: 10, effectiveFrom: "2026-06-15T08:00:00Z", createdBy: "admin-1", createdAt: "2026-06-15T08:00:00Z" },
  { id: "sc-2", supplierId: "supplier-2", rate: 12, effectiveFrom: "2026-06-20T10:00:00Z", createdBy: "admin-1", createdAt: "2026-06-20T10:00:00Z" },
  { id: "sc-3", supplierId: "supplier-3", rate: 10, effectiveFrom: "2026-07-01T08:00:00Z", createdBy: "admin-2", createdAt: "2026-07-01T08:00:00Z" },
  { id: "sc-4", supplierId: "supplier-4", rate: 10, effectiveFrom: "2026-06-28T13:00:00Z", createdBy: "admin-1", createdAt: "2026-06-28T13:00:00Z" },
  { id: "sc-5", supplierId: "supplier-5", rate: 10, effectiveFrom: "2026-07-10T08:00:00Z", createdAt: "2026-07-10T08:00:00Z" },
  { id: "sc-6", supplierId: "supplier-1", rate: 8, effectiveFrom: "2026-01-01T00:00:00Z", effectiveTo: "2026-06-14T23:59:59Z", createdBy: "admin-1", createdAt: "2026-01-01T00:00:00Z" },
]

export const MOCK_APPLICATIONS: SupplierApplication[] = [
  { id: "sapp-1", userId: "user-1", companyName: "Quincaillerie du Plateau", ownerName: "Koffi Amoin", phone: "+225 07 23 45 67 89", email: "plateau@email.com", address: "Av. Nogues", city: "Plateau", legalDocsUrls: ["/docs/plateau-registre.pdf"], status: "SUBMITTED", createdAt: "2026-07-05T09:00:00Z", updatedAt: "2026-07-05T09:00:00Z" },
  { id: "sapp-2", userId: "user-2", companyName: "Matériaux Yopougon", ownerName: "Soro Ibrahim", phone: "+225 07 34 56 78 90", city: "Yopougon", status: "UNDER_REVIEW", createdAt: "2026-07-03T11:00:00Z", updatedAt: "2026-07-06T14:00:00Z" },
  { id: "sapp-3", userId: "user-3", companyName: "BTP Express", ownerName: "Achi Esther", phone: "+225 07 45 67 89 01", city: "Marcory", status: "APPROVED", reviewedBy: "admin-2", reviewNotes: "Documents valides, entreprise vérifiée", reviewedAt: "2026-07-07T10:00:00Z", createdAt: "2026-07-01T08:00:00Z", updatedAt: "2026-07-07T10:00:00Z" },
  { id: "sapp-4", userId: "user-4", companyName: "Fournitures Générales", ownerName: "Tano Didier", phone: "+225 07 56 78 90 12", city: "Treichville", status: "REJECTED", reviewedBy: "admin-1", reviewNotes: "Documents incomplets — registre de commerce manquant", reviewedAt: "2026-07-04T16:00:00Z", createdAt: "2026-06-28T13:00:00Z", updatedAt: "2026-07-04T16:00:00Z" },
  { id: "sapp-5", userId: "user-5", companyName: "Nouvelle Quincaillerie", ownerName: "Kouamé Paul", phone: "+225 07 67 89 01 23", city: "Cocody", status: "SUBMITTED", createdAt: "2026-07-10T08:00:00Z", updatedAt: "2026-07-10T08:00:00Z" },
  { id: "sapp-6", userId: "user-6", companyName: "ACMC Matériaux", ownerName: "Koné Mamadou", phone: "+225 07 89 01 23 45", email: "kone@acmc.ci", address: "12 Rue des Arts", city: "Abobo", status: "SUBMITTED", createdAt: "2026-07-09T14:00:00Z", updatedAt: "2026-07-09T14:00:00Z" },
]

export const MOCK_BALANCES: Record<string, SupplierBalance> = {
  "supplier-1": { available: 425000, pending: 167400, totalEarned: 1250000, totalCommission: 125000, lastPayoutAt: "2026-07-08T10:00:00Z" },
  "supplier-2": { available: 177800, pending: 60760, totalEarned: 680000, totalCommission: 81600, lastPayoutAt: "2026-07-05T09:00:00Z" },
  "supplier-3": { available: 0, pending: 283500, totalEarned: 210000, totalCommission: 21000 },
}

export const MOCK_PAYOUTS: SupplierPayout[] = [
  { id: "spout-1", supplierId: "supplier-1", amount: 200000, status: "completed", provider: "orange_money", providerReference: "OM-PAY-123456", requestedAt: "2026-07-05T10:00:00Z", processedAt: "2026-07-05T14:30:00Z" },
  { id: "spout-2", supplierId: "supplier-1", amount: 150000, status: "completed", provider: "wave", providerReference: "WAVE-PAY-789012", requestedAt: "2026-07-01T09:00:00Z", processedAt: "2026-07-01T11:00:00Z" },
  { id: "spout-3", supplierId: "supplier-2", amount: 100000, status: "completed", provider: "mtn_momo", providerReference: "MTN-PAY-345678", requestedAt: "2026-07-03T08:00:00Z", processedAt: "2026-07-03T15:00:00Z" },
  { id: "spout-4", supplierId: "supplier-2", amount: 80000, status: "processing", provider: "mtn_momo", requestedAt: "2026-07-09T11:00:00Z" },
  { id: "spout-5", supplierId: "supplier-1", amount: 250000, status: "processing", provider: "orange_money", requestedAt: "2026-07-10T08:00:00Z" },
  { id: "spout-6", supplierId: "supplier-1", amount: 75000, status: "failed", provider: "wave", failureReason: "Compte Wave non vérifié", requestedAt: "2026-06-28T10:00:00Z", failedAt: "2026-06-28T16:00:00Z" },
]

export const MOCK_CLIENTS: SupplierClient[] = [
  { id: "client-1", name: "Kouamé Paul", phone: "+225 07 12 34 56 01", email: "paul.kouame@email.ci", city: "Cocody", address: "15 Rue des Commercants", totalOrders: 3, totalSpent: 561000, lastOrderAt: "2026-07-10T08:00:00Z", createdAt: "2026-06-20T10:00:00Z" },
  { id: "client-2", name: "Soro Ibrahim", phone: "+225 07 12 34 56 02", city: "Plateau", address: "5 Rue des Banques", totalOrders: 1, totalSpent: 89000, lastOrderAt: "2026-07-10T08:00:00Z", createdAt: "2026-07-05T14:00:00Z" },
  { id: "client-3", name: "Achi Esther", phone: "+225 07 12 34 56 03", city: "Marcory", address: "12 Rue de la Bourse", totalOrders: 1, totalSpent: 68800, lastOrderAt: "2026-07-10T09:00:00Z", createdAt: "2026-07-08T11:00:00Z" },
  { id: "client-4", name: "Koné Moussa", phone: "+225 07 12 34 56 04", city: "Adjamé", totalOrders: 1, totalSpent: 45500, createdAt: "2026-07-06T09:00:00Z" },
  { id: "client-5", name: "Touré Aboubacar", phone: "+225 07 12 34 56 05", city: "Yopougon", address: "55 Av. de la Liberté", totalOrders: 1, totalSpent: 205400, lastOrderAt: "2026-07-03T16:45:00Z", createdAt: "2026-06-25T08:00:00Z" },
  { id: "client-6", name: "Bamba Oumar", phone: "+225 07 12 34 56 06", city: "Abobo", address: "8 Rue du Marché", totalOrders: 1, totalSpent: 77920, lastOrderAt: "2026-07-10T08:00:00Z", createdAt: "2026-07-01T10:00:00Z" },
  { id: "client-7", name: "Cissé Fatima", phone: "+225 07 12 34 56 07", city: "Attécoubé", address: "22 Rue du Lycée", totalOrders: 1, totalSpent: 113500, lastOrderAt: "2026-07-10T10:00:00Z", createdAt: "2026-07-02T14:00:00Z" },
  { id: "client-8", name: "Diaby Souleymane", phone: "+225 07 12 34 56 08", city: "Yopougon", address: "15 Rue des Jardins", totalOrders: 1, totalSpent: 69880, lastOrderAt: "2026-07-10T12:00:00Z", createdAt: "2026-07-03T11:00:00Z" },
  { id: "client-9", name: "Koffi Aimé", phone: "+225 07 12 34 56 09", city: "Abobo", address: "3 Rue de l'École", totalOrders: 1, totalSpent: 55040, lastOrderAt: "2026-07-11T14:00:00Z", createdAt: "2026-07-04T08:00:00Z" },
  { id: "client-10", name: "N'Diaye Rokhaya", phone: "+225 07 12 34 56 10", city: "Marcory", address: "10 Rue de la Paix", totalOrders: 1, totalSpent: 97500, lastOrderAt: "2026-07-10T11:00:00Z", createdAt: "2026-07-05T09:00:00Z" },
  { id: "client-11", name: "Gueï Léa", phone: "+225 07 12 34 56 11", email: "lea.guei@email.ci", city: "Plateau", address: "2 Av. de la République", totalOrders: 1, totalSpent: 134000, lastOrderAt: "2026-07-10T14:00:00Z", createdAt: "2026-07-06T10:00:00Z" },
  { id: "client-12", name: "Zadi Roger", phone: "+225 07 12 34 56 12", city: "Koumassi", totalOrders: 1, totalSpent: 34300, createdAt: "2026-07-07T08:00:00Z" },
  { id: "client-13", name: "Tano Béatrice", phone: "+225 07 12 34 56 13", email: "beatrice.tano@email.ci", city: "Cocody", address: "7 Rue du Château", totalOrders: 1, totalSpent: 90500, lastOrderAt: "2026-07-10T09:00:00Z", createdAt: "2026-07-05T14:00:00Z" },
  { id: "client-14", name: "Ahou Angèle", phone: "+225 07 12 34 56 14", city: "Treichville", address: "18 Bd de Marseille", totalOrders: 1, totalSpent: 193500, lastOrderAt: "2026-07-02T14:30:00Z", createdAt: "2026-06-22T10:00:00Z" },
]

export const MOCK_STOCK_MOVEMENTS: StockMovement[] = [
  // ── Quincaillerie ABC (supplier-1) ──
  { id: "sm-1", productId: "sp-1", supplierId: "supplier-1", productName: "Ciment Portland 42.5R", type: "entry", quantity: 50, stockBefore: 70, stockAfter: 120, notes: "Réapprovisionnement fournisseur CimIvoire", createdAt: "2026-07-10T09:00:00Z" },
  { id: "sm-2", productId: "sp-1", supplierId: "supplier-1", productName: "Ciment Portland 42.5R", type: "exit", quantity: 20, stockBefore: 120, stockAfter: 100, notes: "Commande MO-2026-0001", createdAt: "2026-07-02T14:00:00Z" },
  { id: "sm-3", productId: "sp-1", supplierId: "supplier-1", productName: "Ciment Portland 42.5R", type: "exit", quantity: 10, stockBefore: 100, stockAfter: 90, notes: "Commande MO-2026-0015", createdAt: "2026-07-01T10:00:00Z" },
  { id: "sm-4", productId: "sp-2", supplierId: "supplier-1", productName: "Fer à béton diam 12", type: "entry", quantity: 50, stockBefore: 150, stockAfter: 200, notes: "Réapprovisionnement aciérie", createdAt: "2026-07-08T11:00:00Z" },
  { id: "sm-5", productId: "sp-2", supplierId: "supplier-1", productName: "Fer à béton diam 12", type: "exit", quantity: 15, stockBefore: 150, stockAfter: 135, notes: "Commande MO-2026-0001", createdAt: "2026-07-02T14:00:00Z" },
  { id: "sm-6", productId: "sp-3", supplierId: "supplier-1", productName: "Carreau de ciment 20x20", type: "adjustment", quantity: 5, stockBefore: 40, stockAfter: 45, notes: "Ajustement inventaire — 5 carreaux retrouvés en réserve", createdAt: "2026-07-09T16:00:00Z" },
  { id: "sm-7", productId: "sp-3", supplierId: "supplier-1", productName: "Carreau de ciment 20x20", type: "exit", quantity: 10, stockBefore: 50, stockAfter: 40, notes: "Commande MO-2026-0002", createdAt: "2026-07-07T10:00:00Z" },
  { id: "sm-8", productId: "sp-4", supplierId: "supplier-1", productName: "Peinture acrylique blanc mat", type: "entry", quantity: 20, stockBefore: 8, stockAfter: 28, notes: "Réappro", createdAt: "2026-07-06T14:00:00Z" },
  { id: "sm-9", productId: "sp-4", supplierId: "supplier-1", productName: "Peinture acrylique blanc mat", type: "exit", quantity: 20, stockBefore: 28, stockAfter: 8, notes: "Réapprovisionnement boutique partenaire", createdAt: "2026-07-08T11:00:00Z" },
  { id: "sm-10", productId: "sp-5", supplierId: "supplier-1", productName: "Tuyau PVC DN 50mm", type: "exit", quantity: 8, stockBefore: 8, stockAfter: 0, notes: "Commande MO-2026-0003", createdAt: "2026-07-10T09:00:00Z" },
  { id: "sm-11", productId: "sp-5", supplierId: "supplier-1", productName: "Tuyau PVC DN 50mm", type: "entry", quantity: 20, stockBefore: 0, stockAfter: 20, notes: "Réappro", createdAt: "2026-07-09T10:00:00Z" },
  { id: "sm-12", productId: "sp-7", supplierId: "supplier-1", productName: "Clous de charpente 100mm", type: "entry", quantity: 40, stockBefore: 60, stockAfter: 100, notes: "Lot de réappro", createdAt: "2026-07-07T10:00:00Z" },
  { id: "sm-13", productId: "sp-7", supplierId: "supplier-1", productName: "Clous de charpente 100mm", type: "exit", quantity: 40, stockBefore: 100, stockAfter: 60, notes: "Commande MO-2026-0004, MO-2026-0005", createdAt: "2026-07-09T11:00:00Z" },
  { id: "sm-14", productId: "sp-8", supplierId: "supplier-1", productName: "Porte en bois massif", type: "return", quantity: 1, stockBefore: 10, stockAfter: 11, notes: "Retour client — porte légèrement abîmée, remplacée", createdAt: "2026-07-08T15:00:00Z" },
  { id: "sm-15", productId: "sp-8", supplierId: "supplier-1", productName: "Porte en bois massif", type: "exit", quantity: 2, stockBefore: 12, stockAfter: 10, notes: "Commande MO-2026-0001", createdAt: "2026-07-02T14:00:00Z" },
  { id: "sm-16", productId: "sp-10", supplierId: "supplier-1", productName: "Rouleau grillage soudé 1.5m", type: "entry", quantity: 10, stockBefore: 20, stockAfter: 30, notes: "Nouveau stock Trellisco", createdAt: "2026-07-05T10:00:00Z" },
  { id: "sm-17", productId: "sp-10", supplierId: "supplier-1", productName: "Rouleau grillage soudé 1.5m", type: "exit", quantity: 10, stockBefore: 30, stockAfter: 20, notes: "Commande client direct", createdAt: "2026-07-06T14:00:00Z" },
  { id: "sm-18", productId: "sp-12", supplierId: "supplier-1", productName: "Brouette de chantier 100L", type: "inventory", quantity: 0, stockBefore: 25, stockAfter: 25, notes: "Inventaire mensuel — tout conforme", createdAt: "2026-07-01T10:00:00Z" },
  { id: "sm-19", productId: "sp-11", supplierId: "supplier-1", productName: "Robinet mitigeur évier chromé", type: "exit", quantity: 2, stockBefore: 15, stockAfter: 13, notes: "Commande MO-2026-0004", createdAt: "2026-07-10T09:00:00Z" },
  { id: "sm-20", productId: "sp-26", supplierId: "supplier-1", productName: "Ampoule LED 12W E27", type: "entry", quantity: 200, stockBefore: 300, stockAfter: 500, notes: "Réappro PHILIPS", createdAt: "2026-07-08T08:00:00Z" },
  // ── Matériaux Yopougon (supplier-2) ──
  { id: "sm-21", productId: "sp-13", supplierId: "supplier-2", productName: "Ciment Portland 32.5", type: "exit", quantity: 10, stockBefore: 80, stockAfter: 70, notes: "Commande MO-2026-0007", createdAt: "2026-07-09T10:00:00Z" },
  { id: "sm-22", productId: "sp-13", supplierId: "supplier-2", productName: "Ciment Portland 32.5", type: "exit", quantity: 5, stockBefore: 70, stockAfter: 65, notes: "Commande MO-2026-0010 (partielle)", createdAt: "2026-07-11T14:00:00Z" },
  { id: "sm-23", productId: "sp-14", supplierId: "supplier-2", productName: "Parpaing creux 20x20x40", type: "exit", quantity: 200, stockBefore: 500, stockAfter: 300, notes: "Commande MO-2026-0006", createdAt: "2026-07-02T11:00:00Z" },
  { id: "sm-24", productId: "sp-14", supplierId: "supplier-2", productName: "Parpaing creux 20x20x40", type: "entry", quantity: 300, stockBefore: 300, stockAfter: 600, notes: "Réappro BRIQUES CI", createdAt: "2026-07-07T09:00:00Z" },
  { id: "sm-25", productId: "sp-15", supplierId: "supplier-2", productName: "Tôle bac acier AL 2m", type: "exit", quantity: 6, stockBefore: 150, stockAfter: 144, notes: "Commande MO-2026-0006", createdAt: "2026-07-02T11:00:00Z" },
  { id: "sm-26", productId: "sp-15", supplierId: "supplier-2", productName: "Tôle bac acier AL 2m", type: "exit", quantity: 10, stockBefore: 144, stockAfter: 134, notes: "Commande MO-2026-0008", createdAt: "2026-07-08T10:00:00Z" },
  { id: "sm-27", productId: "sp-17", supplierId: "supplier-2", productName: "Peinture glycéro blanc satiné", type: "entry", quantity: 10, stockBefore: 5, stockAfter: 15, notes: "Réappro via AKZO", createdAt: "2026-07-06T14:00:00Z" },
  { id: "sm-28", productId: "sp-17", supplierId: "supplier-2", productName: "Peinture glycéro blanc satiné", type: "exit", quantity: 10, stockBefore: 15, stockAfter: 5, notes: "Achat en gros client entreprise", createdAt: "2026-07-07T10:00:00Z" },
  { id: "sm-29", productId: "sp-20", supplierId: "supplier-2", productName: "Kit câble électrique 1.5mm² 100m", type: "exit", quantity: 1, stockBefore: 10, stockAfter: 9, notes: "Commande MO-2026-0007", createdAt: "2026-07-09T10:00:00Z" },
  { id: "sm-30", productId: "sp-19", supplierId: "supplier-2", productName: "Échafaudage roulant alu 2m", type: "adjustment", quantity: 1, stockBefore: 2, stockAfter: 3, notes: "Retour location — réintégré au stock", createdAt: "2026-07-05T15:00:00Z" },
  // ── BTP Express (supplier-3) ──
  { id: "sm-31", productId: "sp-21", supplierId: "supplier-3", productName: "Plaque de plâtre BA13", type: "entry", quantity: 40, stockBefore: 60, stockAfter: 100, notes: "Réappro PLACO", createdAt: "2026-07-05T10:00:00Z" },
  { id: "sm-32", productId: "sp-21", supplierId: "supplier-3", productName: "Plaque de plâtre BA13", type: "exit", quantity: 40, stockBefore: 100, stockAfter: 60, notes: "Commande chantier hôtel", createdAt: "2026-07-06T14:00:00Z" },
  { id: "sm-33", productId: "sp-22", supplierId: "supplier-3", productName: "Enduit de lissage blanc 25kg", type: "entry", quantity: 20, stockBefore: 25, stockAfter: 45, notes: "Réappro SEMIN", createdAt: "2026-07-06T11:00:00Z" },
  { id: "sm-34", productId: "sp-22", supplierId: "supplier-3", productName: "Enduit de lissage blanc 25kg", type: "exit", quantity: 20, stockBefore: 45, stockAfter: 25, notes: "Commande client chantier", createdAt: "2026-07-08T15:00:00Z" },
  { id: "sm-35", productId: "sp-25", supplierId: "supplier-3", productName: "Perceuse sans fil 18V", type: "exit", quantity: 1, stockBefore: 6, stockAfter: 5, notes: "Commande MO-2026-0014", createdAt: "2026-07-10T09:00:00Z" },
  { id: "sm-36", productId: "sp-24", supplierId: "supplier-3", productName: "Lame de terrasse composite 2.2m", type: "return", quantity: 2, stockBefore: 8, stockAfter: 10, notes: "Retour client — lames en surpoids, remboursées", createdAt: "2026-07-07T14:00:00Z" },
  { id: "sm-37", productId: "sp-23", supplierId: "supplier-3", productName: "WC suspendu complet", type: "adjustment", quantity: -1, stockBefore: 5, stockAfter: 4, notes: "Rayé lors du déballage — retiré du stock", createdAt: "2026-07-05T11:00:00Z" },
]

export const MOCK_PROMOTIONS: SupplierPromotion[] = [
  { id: "promo-1", supplierId: "supplier-1", productId: "sp-26", productName: "Ampoule LED 12W E27", type: "percentage", value: 20, startDate: "2026-07-01T00:00:00Z", endDate: "2026-08-01T00:00:00Z", usageCount: 45, isActive: true, createdAt: "2026-06-30T10:00:00Z" },
  { id: "promo-2", supplierId: "supplier-1", productId: "sp-38", productName: "Marteau de charpentier 500g", type: "percentage", value: 21, startDate: "2026-07-05T00:00:00Z", endDate: "2026-07-25T00:00:00Z", usageCount: 12, isActive: true, createdAt: "2026-07-04T09:00:00Z" },
  { id: "promo-3", supplierId: "supplier-1", productId: "sp-42", productName: "Mètre ruban 5m", type: "percentage", value: 28, startDate: "2026-07-01T00:00:00Z", endDate: "2026-07-20T00:00:00Z", usageCount: 30, isActive: true, createdAt: "2026-06-30T14:00:00Z" },
  { id: "promo-4", supplierId: "supplier-1", productId: "sp-1", productName: "Ciment Portland 42.5R", type: "fixed", value: 500, startDate: "2026-07-15T00:00:00Z", endDate: "2026-07-31T00:00:00Z", conditions: "Maximum 10 sacs par client", maxQuantity: 10, usageCount: 0, isActive: false, createdAt: "2026-07-12T10:00:00Z" },
  { id: "promo-5", supplierId: "supplier-1", productId: "sp-28", productName: "Prise électrique double 2P+T", type: "pack", value: 10, startDate: "2026-07-10T00:00:00Z", endDate: "2026-07-28T00:00:00Z", conditions: "Achetez 10 prises, la 11e offerte", usageCount: 8, isActive: true, createdAt: "2026-07-09T08:00:00Z" },
  { id: "promo-6", supplierId: "supplier-1", productId: "sp-4", productName: "Peinture acrylique blanc mat", type: "clearance", value: 35, startDate: "2026-07-01T00:00:00Z", endDate: "2026-07-15T00:00:00Z", conditions: "Stock limité — dernier lot", usageCount: 5, isActive: false, createdAt: "2026-06-29T11:00:00Z" },
  { id: "promo-7", supplierId: "supplier-2", productId: "sp-53", productName: "Ampoule LED 15W E27", type: "percentage", value: 15, startDate: "2026-07-08T00:00:00Z", endDate: "2026-07-22T00:00:00Z", usageCount: 20, isActive: true, createdAt: "2026-07-07T10:00:00Z" },
  { id: "promo-8", supplierId: "supplier-2", productId: "sp-14", productName: "Parpaing creux 20x20x40", type: "pack", value: 20, startDate: "2026-07-10T00:00:00Z", endDate: "2026-07-31T00:00:00Z", conditions: "Achetez 100 parpaings, 20 offerts", maxQuantity: 500, usageCount: 200, isActive: true, createdAt: "2026-07-09T14:00:00Z" },
  { id: "promo-9", supplierId: "supplier-3", productId: "sp-25", productName: "Perceuse sans fil 18V", type: "fixed", value: 10000, startDate: "2026-07-12T00:00:00Z", endDate: "2026-07-26T00:00:00Z", conditions: "Remise de 10 000 FCFA sur la perceuse BOSCH", maxQuantity: 3, usageCount: 0, isActive: false, createdAt: "2026-07-10T09:00:00Z" },
]

export const MOCK_INVOICES: SupplierInvoice[] = [
  { id: "inv-1", orderId: "MO-2026-0001", supplierId: "supplier-1", clientId: "client-1", clientName: "Kouamé Paul", number: "FAC-2026-0001", subtotal: 325000, deliveryCost: 5000, commission: 32500, total: 297500, status: "paid", dueDate: "2026-07-15T00:00:00Z", paidAt: "2026-07-05T16:00:00Z", createdAt: "2026-07-01T10:00:00Z" },
  { id: "inv-2", orderId: "MO-2026-0002", supplierId: "supplier-1", clientId: "client-1", clientName: "Kouamé Paul", number: "FAC-2026-0002", subtotal: 180000, deliveryCost: 7000, commission: 18000, total: 169000, status: "unpaid", dueDate: "2026-07-25T00:00:00Z", createdAt: "2026-07-06T11:00:00Z" },
  { id: "inv-3", orderId: "MO-2026-0003", supplierId: "supplier-1", clientId: "client-2", clientName: "Soro Ibrahim", number: "FAC-2026-0003", subtotal: 95000, deliveryCost: 3500, commission: 9500, total: 89000, status: "unpaid", dueDate: "2026-07-24T00:00:00Z", createdAt: "2026-07-10T09:00:00Z" },
  { id: "inv-4", orderId: "MO-2026-0004", supplierId: "supplier-1", clientId: "client-3", clientName: "Achi Esther", number: "FAC-2026-0004", subtotal: 72000, deliveryCost: 4000, commission: 7200, total: 68800, status: "unpaid", dueDate: "2026-07-23T00:00:00Z", createdAt: "2026-07-10T09:30:00Z" },
  { id: "inv-5", orderId: "MO-2026-0005", supplierId: "supplier-1", clientId: "client-4", clientName: "Koné Moussa", number: "FAC-2026-0005", subtotal: 45000, deliveryCost: 5000, commission: 4500, total: 45500, status: "cancelled", dueDate: "2026-07-21T00:00:00Z", notes: "Annulée — client a trouvé meilleur prix", createdAt: "2026-07-07T11:00:00Z" },
  { id: "inv-6", orderId: "MO-2026-0015", supplierId: "supplier-1", clientId: "client-14", clientName: "Ahou Angèle", number: "FAC-2026-0006", subtotal: 210000, deliveryCost: 4500, commission: 21000, total: 193500, status: "paid", dueDate: "2026-07-12T00:00:00Z", paidAt: "2026-07-03T09:00:00Z", createdAt: "2026-06-29T11:00:00Z" },
  { id: "inv-7", orderId: "MO-2026-0006", supplierId: "supplier-2", clientId: "client-5", clientName: "Touré Aboubacar", number: "FAC-2026-0007", subtotal: 230000, deliveryCost: 3000, commission: 27600, total: 205400, status: "paid", dueDate: "2026-07-13T00:00:00Z", paidAt: "2026-07-04T10:00:00Z", createdAt: "2026-06-30T09:00:00Z" },
  { id: "inv-8", orderId: "MO-2026-0007", supplierId: "supplier-2", clientId: "client-6", clientName: "Bamba Oumar", number: "FAC-2026-0008", subtotal: 84000, deliveryCost: 4000, commission: 10080, total: 77920, status: "unpaid", dueDate: "2026-07-26T00:00:00Z", createdAt: "2026-07-08T11:00:00Z" },
  { id: "inv-9", orderId: "MO-2026-0008", supplierId: "supplier-2", clientId: "client-7", clientName: "Cissé Fatima", number: "FAC-2026-0009", subtotal: 125000, deliveryCost: 3500, commission: 15000, total: 113500, status: "overdue", dueDate: "2026-07-09T00:00:00Z", notes: "Litige en cours — paiement suspendu", createdAt: "2026-07-07T10:00:00Z" },
  { id: "inv-10", orderId: "MO-2026-0009", supplierId: "supplier-2", clientId: "client-8", clientName: "Diaby Souleymane", number: "FAC-2026-0010", subtotal: 76000, deliveryCost: 3000, commission: 9120, total: 69880, status: "unpaid", dueDate: "2026-07-24T00:00:00Z", createdAt: "2026-07-08T16:00:00Z" },
  { id: "inv-11", orderId: "MO-2026-0010", supplierId: "supplier-2", clientId: "client-9", clientName: "Koffi Aimé", number: "FAC-2026-0011", subtotal: 58000, deliveryCost: 4000, commission: 6960, total: 55040, status: "overdue", dueDate: "2026-07-09T00:00:00Z", notes: "Livraison partielle — relance client en cours", createdAt: "2026-07-09T09:00:00Z" },
  { id: "inv-12", orderId: "MO-2026-0011", supplierId: "supplier-3", clientId: "client-10", clientName: "N'Diaye Rokhaya", number: "FAC-2026-0012", subtotal: 105000, deliveryCost: 3000, commission: 10500, total: 97500, status: "unpaid", dueDate: "2026-07-24T00:00:00Z", createdAt: "2026-07-10T12:00:00Z" },
  { id: "inv-13", orderId: "MO-2026-0014", supplierId: "supplier-3", clientId: "client-13", clientName: "Tano Béatrice", number: "FAC-2026-0013", subtotal: 95000, deliveryCost: 5000, commission: 9500, total: 90500, status: "unpaid", dueDate: "2026-07-27T00:00:00Z", createdAt: "2026-07-10T10:00:00Z" },
]

export const MOCK_TEAM_MEMBERS: TeamMember[] = [
  { id: "tm-1", supplierId: "supplier-1", name: "Mamadou Diallo", email: "mamadou@abc-quincaillerie.ci", phone: "+225 07 12 34 56 78", role: "admin", isActive: true, lastActiveAt: "2026-07-10T14:30:00Z", createdAt: "2026-06-15T08:00:00Z" },
  { id: "tm-2", supplierId: "supplier-1", name: "Aminata Koné", email: "aminata@abc-quincaillerie.ci", phone: "+225 07 23 45 67 89", role: "manager", isActive: true, lastActiveAt: "2026-07-10T12:00:00Z", createdAt: "2026-06-20T10:00:00Z" },
  { id: "tm-3", supplierId: "supplier-1", name: "Issouf Ouattara", email: "issouf@abc-quincaillerie.ci", phone: "+225 07 34 56 78 90", role: "storekeeper", isActive: true, lastActiveAt: "2026-07-10T09:15:00Z", createdAt: "2026-06-25T08:00:00Z" },
  { id: "tm-4", supplierId: "supplier-1", name: "Fatoumata Cissé", email: "fatou@abc-quincaillerie.ci", role: "preparer", isActive: true, lastActiveAt: "2026-07-09T16:45:00Z", createdAt: "2026-07-01T10:00:00Z" },
  { id: "tm-5", supplierId: "supplier-1", name: "Drissa Traoré", email: "drissa@abc-quincaillerie.ci", role: "accountant", isActive: false, createdAt: "2026-06-28T09:00:00Z" },
  { id: "tm-6", supplierId: "supplier-2", name: "Soro Ibrahim", email: "ibrahim@materiaux-yop.ci", phone: "+225 07 45 67 89 01", role: "admin", isActive: true, lastActiveAt: "2026-07-10T11:30:00Z", createdAt: "2026-06-20T10:00:00Z" },
  { id: "tm-7", supplierId: "supplier-2", name: "Kady Touré", email: "kady@materiaux-yop.ci", role: "storekeeper", isActive: true, lastActiveAt: "2026-07-09T15:00:00Z", createdAt: "2026-07-02T08:00:00Z" },
  { id: "tm-8", supplierId: "supplier-3", name: "Achi Esther", email: "esther@btpexpress.ci", phone: "+225 07 56 78 90 12", role: "admin", isActive: true, lastActiveAt: "2026-07-10T10:00:00Z", createdAt: "2026-07-01T08:00:00Z" },
  { id: "tm-9", supplierId: "supplier-3", name: "Kouamé Yves", email: "yves@btpexpress.ci", role: "manager", isActive: true, lastActiveAt: "2026-07-08T14:30:00Z", createdAt: "2026-07-03T09:00:00Z" },
]

export const MOCK_SESSIONS: ActiveSession[] = [
  { id: "sess-1", userId: "supplier-1", device: "iPhone 15 Pro", browser: "Safari 18", ip: "196.12.34.56", lastActiveAt: "2026-07-10T14:30:00Z", isCurrent: true },
  { id: "sess-2", userId: "supplier-1", device: "Windows 11 PC", browser: "Chrome 125", ip: "196.78.90.12", lastActiveAt: "2026-07-10T10:00:00Z", isCurrent: false },
  { id: "sess-3", userId: "supplier-1", device: "Samsung Galaxy S24", browser: "Chrome Mobile 125", ip: "196.34.56.78", lastActiveAt: "2026-07-09T18:30:00Z", isCurrent: false },
  { id: "sess-4", userId: "supplier-1", device: "iPad Air", browser: "Safari 18", ip: "196.56.78.90", lastActiveAt: "2026-07-08T09:00:00Z", isCurrent: false },
]

export const MOCK_RECENT_ACTIVITIES: DashboardRecentActivity[] = [
  { id: "ra-1", type: "order", label: "Nouvelle commande", description: "Commande MO-2026-0003 de Soro Ibrahim", amount: 89000, referenceId: "MO-2026-0003", referenceUrl: "/supplier/orders/MO-2026-0003", createdAt: "2026-07-10T08:00:00Z" },
  { id: "ra-2", type: "order", label: "Nouvelle commande", description: "Commande MO-2026-0012 de Gueï Léa", amount: 134000, referenceId: "MO-2026-0012", referenceUrl: "/supplier/orders/MO-2026-0012", createdAt: "2026-07-10T14:00:00Z" },
  { id: "ra-3", type: "payment", label: "Paiement reçu", description: "Paiement Wave de 68 800 FCFA — Commande MO-2026-0004", amount: 68800, referenceId: "spay-11", referenceUrl: "/supplier/payments/spay-11", createdAt: "2026-07-10T09:30:00Z" },
  { id: "ra-4", type: "stock", label: "Stock mis à jour", description: "Entrée de 50 sacs Ciment Portland 42.5R", referenceId: "sm-1", createdAt: "2026-07-10T09:00:00Z" },
  { id: "ra-5", type: "client", label: "Nouveau client", description: "Soro Ibrahim a passé sa première commande", referenceId: "client-2", referenceUrl: "/supplier/clients/client-2", createdAt: "2026-07-10T08:00:00Z" },
  { id: "ra-6", type: "invoice", label: "Nouvelle facture", description: "Facture FAC-2026-0003 de 89 000 FCFA générée", amount: 89000, referenceId: "inv-3", referenceUrl: "/supplier/invoices/inv-3", createdAt: "2026-07-10T09:00:00Z" },
  { id: "ra-7", type: "dispute", label: "Litige ouvert", description: "Cissé Fatima conteste la qualité des tôles (95 000 FCFA)", amount: 95000, referenceId: "disp-1", referenceUrl: "/supplier/disputes/disp-1", createdAt: "2026-07-10T08:00:00Z" },
  { id: "ra-8", type: "stock", label: "Stock mis à jour", description: "Ajustement inventaire Carreau de ciment 20×20 (+5)", createdAt: "2026-07-09T16:00:00Z" },
  { id: "ra-9", type: "order", label: "Commande prête", description: "Commande MO-2026-0007 de Bamba Oumar prête", amount: 77920, referenceId: "MO-2026-0007", referenceUrl: "/supplier/orders/MO-2026-0007", createdAt: "2026-07-10T08:00:00Z" },
  { id: "ra-10", type: "payment", label: "Paiement reçu", description: "Paiement Orange Money 169 000 FCFA — Commande MO-2026-0002", amount: 169000, referenceId: "spay-4", referenceUrl: "/supplier/payments/spay-4", createdAt: "2026-07-06T11:00:00Z" },
  { id: "ra-11", type: "invoice", label: "Facture en retard", description: "Facture FAC-2026-0009 de Cissé Fatima en retard (113 500 FCFA)", amount: 113500, referenceId: "inv-9", referenceUrl: "/supplier/invoices/inv-9", createdAt: "2026-07-10T10:00:00Z" },
  { id: "ra-12", type: "client", label: "Nouveau client", description: "Achi Esther a passé sa première commande", referenceId: "client-3", referenceUrl: "/supplier/clients/client-3", createdAt: "2026-07-09T14:00:00Z" },
]

export const MOCK_STATS: Record<string, SupplierDashboardStats> = {
  "supplier-1": { todayOrders: 24, todayRevenue: 850000, activeProducts: 10, lowStockCount: 3, rating: 4.8, pendingOrders: 5, preparingOrders: 3, revenueChange: 12.5, ordersChange: 8.3 },
  "supplier-2": { todayOrders: 12, todayRevenue: 420000, activeProducts: 7, lowStockCount: 2, rating: 4.2, pendingOrders: 3, preparingOrders: 1, revenueChange: 5.8, ordersChange: -2.1 },
  "supplier-3": { todayOrders: 5, todayRevenue: 145000, activeProducts: 5, lowStockCount: 1, rating: 4.5, pendingOrders: 2, preparingOrders: 1, revenueChange: 22.3, ordersChange: 15.0 },
}

export function getMockSupplier(userId: string): SupplierProfile | undefined {
  return MOCK_SUPPLIERS.find((s) => s.userId === userId)
}

export function getMockSupplierProducts(supplierId: string): SupplierProduct[] {
  return MOCK_PRODUCTS.filter((p) => p.supplierId === supplierId)
}

export function getMockSupplierOrders(supplierId: string, statusFilter?: string): MaterialOrder[] {
  let result = MOCK_ORDERS.filter((o) => o.supplierId === supplierId)
  if (statusFilter && statusFilter !== "all") result = result.filter((o) => o.status === statusFilter)
  return result
}

export function getMockSupplierPayments(supplierId: string): SupplierPayment[] {
  return MOCK_PAYMENTS.filter((p) => p.supplierId === supplierId)
}

export function getMockSupplierDisputes(supplierId: string): SupplierDispute[] {
  return MOCK_DISPUTES.filter((d) => d.supplierId === supplierId)
}

export function getMockSupplierDeliveries(supplierId: string): SupplierDelivery[] {
  return MOCK_DELIVERIES.filter((d) => d.supplierId === supplierId)
}

export function getMockDeliveryZones(supplierId: string): DeliveryZone[] {
  return MOCK_DELIVERY_ZONES.filter((z) => z.supplierId === supplierId)
}

export function getMockSupplierStats(supplierId: string): SupplierDashboardStats {
  return MOCK_STATS[supplierId] ?? { todayOrders: 0, todayRevenue: 0, activeProducts: 0, lowStockCount: 0, rating: 0, pendingOrders: 0, preparingOrders: 0, revenueChange: 0, ordersChange: 0 }
}

export function getMockSupplierPromotions(supplierId: string): SupplierPromotion[] {
  return MOCK_PROMOTIONS.filter((p) => p.supplierId === supplierId)
}

export function getMockSupplierInvoices(supplierId: string): SupplierInvoice[] {
  return MOCK_INVOICES.filter((i) => i.supplierId === supplierId)
}

export const MOCK_DOCUMENTS: SupplierDocument[] = [
  { id: "doc-1", supplierId: "supplier-1", name: "Registre de commerce", category: "legal", status: "approved", fileName: "registre-commerce-abc.pdf", fileSize: 245000, fileType: "pdf", ocrText: "REGISTRE DU COMMERCE ET DU CREDIT IMMOBILIER\nNuméro: RCCM CI-ABJ-2024-B-12345\nDénomination: QUINCAILLERIE ABC\nGérant: Mamadou Diallo\nSiège social: 15 Rue des Commercants, Cocody, Abidjan\nDate d'immatriculation: 15/06/2024\nCapital social: 10 000 000 FCFA", ocrConfidence: 0.96, extractedFields: { "Numéro RCCM": "CI-ABJ-2024-B-12345", "Dénomination": "QUINCAILLERIE ABC", "Gérant": "Mamadou Diallo", "Capital": "10 000 000 FCFA" }, uploadedAt: "2026-06-20T10:00:00Z", reviewedAt: "2026-06-22T14:00:00Z" },
  { id: "doc-2", supplierId: "supplier-1", name: "Attestation fiscale", category: "legal", status: "approved", fileName: "attestation-fiscale-2025.pdf", fileSize: 182000, fileType: "pdf", ocrText: "ATTESTATION DE REGULARITE FISCALE\nNuméro: ARF-2025-78901\nContribuable: QUINCAILLERIE ABC\nIdentifiant fiscal: 123456789P\nPériode: Exercice 2025\nDate de délivrance: 10/01/2026\nCachet: Direction Générale des Impôts", ocrConfidence: 0.94, extractedFields: { "Numéro ARF": "ARF-2025-78901", "Identifiant fiscal": "123456789P", "Exercice": "2025" }, uploadedAt: "2026-06-20T10:00:00Z", reviewedAt: "2026-06-23T09:00:00Z" },
  { id: "doc-3", supplierId: "supplier-1", name: "Catalogue produits 2026", category: "catalog", status: "reviewed", fileName: "catalogue-abc-2026.xlsx", fileSize: 1560000, fileType: "xlsx", ocrText: "CATALOGUE PRODUITS 2026 – QUINCAILLERIE ABC\nRéf | Désignation | Prix unitaire | Stock\nCIM-001 | Ciment Portland 42.5R 50kg | 4 500 FCFA | 850\nFER-001 | Fer à béton HA12 12m | 8 500 FCFA | 320\nCAR-001 | Carreau céramique 40x40 | 3 200 FCFA | 1 200\nPLO-001 | Tuyau PVC DN100 4m | 2 800 FCFA | 450\nPEI-001 | Peinture mate blanc 10L | 12 500 FCFA | 180", ocrConfidence: 0.88, extractedFields: { "Nombre de produits": "47", "Date catalogue": "Janvier 2026" }, uploadedAt: "2026-07-05T11:00:00Z", reviewedAt: "2026-07-06T16:00:00Z" },
  { id: "doc-4", supplierId: "supplier-1", name: "Carte d'identité gérant", category: "identification", status: "approved", fileName: "cni-diallo-mamadou.jpg", fileSize: 320000, fileType: "jpg", ocrText: "CARTE NATIONALE D'IDENTITÉ\nRÉPUBLIQUE DE CÔTE D'IVOIRE\nNom: DIALLO\nPrénoms: Mamadou\nDate de naissance: 15/03/1985\nLieu de naissance: Abidjan\nNuméro: CI-123456-789\nDate d'expiration: 15/03/2030", ocrConfidence: 0.97, extractedFields: { "Nom": "DIALLO", "Prénoms": "Mamadou", "Numéro": "CI-123456-789", "Date naissance": "15/03/1985" }, uploadedAt: "2026-06-20T10:00:00Z", reviewedAt: "2026-06-21T11:00:00Z" },
  { id: "doc-5", supplierId: "supplier-1", name: "Facture fournisseur – Mars 2026", category: "invoice", status: "reviewed", fileName: "facture-mars-2026.pdf", fileSize: 98000, fileType: "pdf", ocrText: "FACTURE\nFournisseur: QUINCAILLERIE ABC\nClient: BTP EXPRESS\nDate: 15/03/2026\nN° facture: FAC-2026-0315\nMontant total: 2 450 000 FCFA\nTVA: 0%\nNet à payer: 2 450 000 FCFA", ocrConfidence: 0.91, extractedFields: { "Numéro facture": "FAC-2026-0315", "Client": "BTP EXPRESS", "Montant": "2 450 000 FCFA", "Date": "15/03/2026" }, uploadedAt: "2026-06-28T09:00:00Z", reviewedAt: "2026-06-29T14:00:00Z" },
  { id: "doc-6", supplierId: "supplier-1", name: "Bon de livraison – Commande 1024", category: "delivery_note", status: "pending", fileName: "bl-1024-signé.pdf", fileSize: 145000, fileType: "pdf", uploadedAt: "2026-07-09T16:00:00Z" },
  { id: "doc-7", supplierId: "supplier-2", name: "Registre de commerce", category: "legal", status: "approved", fileName: "registre-yop.pdf", fileSize: 210000, fileType: "pdf", ocrText: "REGISTRE DU COMMERCE\nNuméro: RCCM CI-ABJ-2024-B-67890\nDénomination: MATÉRIAUX YOPOUGON\nGérant: Soro Ibrahim\nSiège social: 45 Av. de la Liberté, Yopougon", ocrConfidence: 0.93, extractedFields: { "Numéro RCCM": "CI-ABJ-2024-B-67890", "Dénomination": "MATÉRIAUX YOPOUGON" }, uploadedAt: "2026-06-22T10:00:00Z", reviewedAt: "2026-06-24T11:00:00Z" },
  { id: "doc-8", supplierId: "supplier-1", name: "Attestation assurance", category: "legal", status: "rejected", fileName: "assurance-abc.pdf", fileSize: 175000, fileType: "pdf", ocrText: "ATTESTATION D'ASSURANCE\nAssuré: QUINCAILLERIE ABC\nPolice: RESP-2025-45678\nGarantie: Responsabilité civile professionnelle\nDate d'échéance: 31/12/2025", ocrConfidence: 0.85, rejectionReason: "Police d'assurance expirée. Veuillez fournir une attestation à jour.", uploadedAt: "2026-07-01T08:00:00Z", reviewedAt: "2026-07-03T10:00:00Z" },
  { id: "doc-9", supplierId: "supplier-2", name: "Catalogue réduit", category: "catalog", status: "processing", fileName: "catalogue-yop-2026.csv", fileSize: 45000, fileType: "csv", uploadedAt: "2026-07-10T09:00:00Z" },
]

export const MOCK_IMPORT_SESSIONS: ImportSession[] = [
  { id: "imp-1", supplierId: "supplier-1", fileName: "catalogue-abc-2026.xlsx", fileType: "xlsx", totalRows: 52, importedRows: 48, failedRows: 4, errors: [
    { row: 12, message: "Prix unitaire manquant" },
    { row: 23, message: "Catégorie invalide" },
    { row: 31, message: "Stock négatif non autorisé" },
    { row: 47, message: "Référence produit dupliquée" },
  ], status: "completed", createdAt: "2026-07-05T11:00:00Z", completedAt: "2026-07-05T11:02:30Z" },
  { id: "imp-2", supplierId: "supplier-1", fileName: "mise-a-jour-prix.csv", fileType: "csv", totalRows: 25, importedRows: 25, failedRows: 0, errors: [], status: "completed", createdAt: "2026-07-08T14:30:00Z", completedAt: "2026-07-08T14:31:00Z" },
  { id: "imp-3", supplierId: "supplier-2", fileName: "catalogue-yop-2026.csv", fileType: "csv", totalRows: 18, importedRows: 0, failedRows: 0, errors: [], status: "processing", createdAt: "2026-07-10T09:00:00Z" },
  { id: "imp-4", supplierId: "supplier-1", fileName: "nouveautes-juillet.xlsx", fileType: "xlsx", totalRows: 8, importedRows: 0, failedRows: 0, errors: [], status: "pending", createdAt: "2026-07-10T11:00:00Z" },
]

export const MOCK_PICKING_LISTS: PickingList[] = [
  {
    id: "pick-1", orderId: "order-001", supplierId: "supplier-1", status: "in_progress",
    items: [
      { id: "pi-1", productId: "prod-1", productName: "Ciment Portland 42.5R 50kg", productReference: "CIM-001", quantity: 15, pickedQuantity: 10, storageLocation: "A1-03", unit: "sac" },
      { id: "pi-2", productId: "prod-2", productName: "Fer à béton HA12 12m", productReference: "FER-001", quantity: 8, pickedQuantity: 8, storageLocation: "B2-05", unit: "barre" },
      { id: "pi-3", productId: "prod-5", productName: "Peinture mate blanc 10L", productReference: "PEI-001", quantity: 3, pickedQuantity: 1, storageLocation: "C1-08", unit: "seau" },
    ],
    preparedBy: "Issouf Ouattara", notes: "Client pressé — livraison avant 14h", createdAt: "2026-07-10T08:00:00Z", startedAt: "2026-07-10T08:30:00Z",
  },
  {
    id: "pick-2", orderId: "order-003", supplierId: "supplier-1", status: "pending",
    items: [
      { id: "pi-4", productId: "prod-3", productName: "Carreau céramique 40x40 (m²)", productReference: "CAR-001", quantity: 25, pickedQuantity: 0, storageLocation: "D3-01", unit: "m²" },
      { id: "pi-5", productId: "prod-7", productName: "Tuyau PVC DN100 4m", productReference: "PLO-001", quantity: 10, pickedQuantity: 0, storageLocation: "A1-12", unit: "pièce" },
    ],
    createdAt: "2026-07-10T09:00:00Z",
  },
  {
    id: "pick-3", orderId: "order-005", supplierId: "supplier-1", status: "completed",
    items: [
      { id: "pi-6", productId: "prod-4", productName: "Sable fin (m³)", productReference: "SAB-001", quantity: 3, pickedQuantity: 3, storageLocation: "Zone E", unit: "m³" },
      { id: "pi-7", productId: "prod-6", productName: "Ciment Blanc 50kg", productReference: "CIM-002", quantity: 5, pickedQuantity: 5, storageLocation: "A1-04", unit: "sac" },
      { id: "pi-8", productId: "prod-8", productName: "Équerre métallique 60mm", productReference: "QUI-001", quantity: 50, pickedQuantity: 50, storageLocation: "F2-06", unit: "pièce" },
    ],
    preparedBy: "Issouf Ouattara", createdAt: "2026-07-09T10:00:00Z", startedAt: "2026-07-09T10:15:00Z", completedAt: "2026-07-09T11:30:00Z",
  },
  {
    id: "pick-4", orderId: "order-008", supplierId: "supplier-1", status: "pending",
    items: [
      { id: "pi-9", productId: "prod-9", productName: "Rouleau peinture 25cm", productReference: "OUT-001", quantity: 12, pickedQuantity: 0, storageLocation: "C2-03", unit: "pièce" },
      { id: "pi-10", productId: "prod-10", productName: "Joint silicone blanc", productReference: "PLO-002", quantity: 20, pickedQuantity: 0, storageLocation: "C2-10", unit: "cartouche" },
    ],
    notes: "Préparer en priorité", createdAt: "2026-07-10T11:00:00Z",
  },
]

export function getMockDocuments(supplierId: string): SupplierDocument[] {
  return MOCK_DOCUMENTS.filter((d) => d.supplierId === supplierId)
}

export function getMockImportSessions(supplierId: string): ImportSession[] {
  return MOCK_IMPORT_SESSIONS.filter((s) => s.supplierId === supplierId)
}

export function getMockRecentActivities(supplierId: string): DashboardRecentActivity[] {
  return MOCK_RECENT_ACTIVITIES
}

export function getMockPickingLists(supplierId: string): PickingList[] {
  return MOCK_PICKING_LISTS.filter((p) => p.supplierId === supplierId)
}
