import { describe, expect, it } from "vitest";
import {
  toWktPoint,
  mapUrgencyToDb,
  toClientRequest,
  toProAlert,
  toMission,
  REQUEST_EXPIRY_MS,
} from "./requestPersistence";

describe("requestPersistence", () => {
  it("toWktPoint formate un point WGS84", () => {
    expect(toWktPoint(-4.008256, 5.359952)).toBe("SRID=4326;POINT(-4.008256 5.359952)");
  });

  it("mapUrgencyToDb traduit la disponibilité du wizard", () => {
    expect(mapUrgencyToDb("asap")).toBe("emergency");
    expect(mapUrgencyToDb("today")).toBe("high");
    expect(mapUrgencyToDb("this_week")).toBe("medium");
    expect(mapUrgencyToDb("custom")).toBe("medium");
    expect(mapUrgencyToDb(null)).toBe("low");
  });

  it("l'expiration d'une demande est de 2 minutes", () => {
    expect(REQUEST_EXPIRY_MS).toBe(120_000);
  });

  it("toClientRequest mappe une ligne SQL vers la vue client", () => {
    const row = {
      id: "uuid-1",
      client_id: "user-1",
      categories: ["electrician", "plumber"],
      sub_categories: ["electrician"],
      description: "Tableau à remplacer",
      media_urls: ["a.jpg"],
      address: "Cocody",
      estimated_price_max: 50000,
      urgency: "high",
      status: "pending",
      created_at: "2026-08-10T10:00:00Z",
      updated_at: "2026-08-10T10:00:00Z",
    };
    const req = toClientRequest(row);
    expect(req.id).toBe("uuid-1");
    expect(req.clientId).toBe("user-1");
    expect(req.category).toBe("electrician");
    expect(req.subCategory).toBe("electrician");
    expect(req.urgency).toBe("today");
    expect(req.status).toBe("created");
    expect(req.budgetXOF).toBe(50000);
  });

  it("toClientRequest retombe sur 'maison-reparations' sans catégorie", () => {
    const req = toClientRequest({ id: "uuid-2", client_id: "user-1", status: "accepted" });
    expect(req.category).toBe("maison-reparations");
    expect(req.status).toBe("accepted");
  });

  it("toProAlert mappe vers la vue pro (téléphone masqué)", () => {
    const row = {
      id: "uuid-3",
      categories: ["ac_refrigeration"],
      description: "Clim en panne",
      estimated_price_min: 10000,
      estimated_price_max: 20000,
      urgency: "emergency",
      address: "Marcory",
      created_at: "2026-08-10T10:00:00Z",
      expires_at: "2026-08-10T10:02:00Z",
      client_profiles: { first_name: "Awa", last_name: "Diallo" },
    };
    const alert = toProAlert(row);
    expect(alert.id).toBe("alert_uuid-3");
    expect(alert.requestId).toBe("uuid-3");
    expect(alert.clientName).toBe("Awa Diallo");
    expect(alert.clientPhone).toBe("");
    expect(alert.category).toBe("ac_refrigeration");
    expect(alert.urgency).toBe("emergency");
    expect(alert.estimatedPriceMinXOF).toBe(10000);
    expect(alert.expiresAt).toBe("2026-08-10T10:02:00Z");
  });

  it("toMission mappe une demande assignée vers une mission", () => {
    const row = {
      id: "uuid-4",
      client_id: "user-1",
      professional_id: "user-9",
      categories: ["plumber"],
      description: "Fuite",
      estimated_price_max: 80000,
      status: "accepted",
      created_at: "2026-08-10T10:00:00Z",
      professional_profiles: {
        first_name: "Jean",
        last_name: "Kouassi",
        users: { phone_number: "+2250700000000" },
      },
    };
    const mission = toMission(row);
    expect(mission.id).toBe("uuid-4");
    expect(mission.requestId).toBe("uuid-4");
    expect(mission.proId).toBe("user-9");
    expect(mission.status).toBe("accepted");
    expect(mission.proName).toBe("Jean Kouassi");
    expect(mission.proPhone).toBe("+2250700000000");
    expect(mission.acceptedAt).toBe("2026-08-10T10:00:00Z");
  });
});
