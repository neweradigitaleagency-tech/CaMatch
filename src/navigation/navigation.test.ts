import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resolveBackAction, resolveCompleteDestination } from "./navigationService";

function memoryStorage(): Storage {
  const store = new Map<string, string>();
  return {
    get length() {
      return store.size;
    },
    clear: () => store.clear(),
    getItem: (key) => store.get(key) ?? null,
    key: (index) => Array.from(store.keys())[index] ?? null,
    removeItem: (key) => {
      store.delete(key);
    },
    setItem: (key, value) => {
      store.set(key, value);
    },
  };
}

describe("resolveBackAction", () => {
  it("retourne `back` si la pile est non vide et history.length > 1", () => {
    expect(resolveBackAction("/orders/review", [{ path: "/orders" }], 5)).toEqual({
      kind: "back",
    });
  });

  it("retourne le fallback du graph en replace si la pile est vide", () => {
    expect(resolveBackAction("/orders/review", [], 5)).toEqual({
      kind: "fallback",
      to: "/orders",
      replace: true,
    });
  });

  it("retourne le fallback même avec une pile non vide si history.length <= 1", () => {
    expect(resolveBackAction("/orders/review", [{ path: "/orders" }], 1)).toEqual({
      kind: "fallback",
      to: "/orders",
      replace: true,
    });
  });

  it("retourne le fallback d'espace pour une route inconnue", () => {
    expect(resolveBackAction("/totally-unknown", [], 5)).toEqual({
      kind: "fallback",
      to: "/",
      replace: true,
    });
    expect(resolveBackAction("/pro/unknown", [], 5)).toEqual({
      kind: "fallback",
      to: "/pro/dashboard",
      replace: true,
    });
  });
});

describe("resolveCompleteDestination", () => {
  it("`to` forcée prime sur le graph", () => {
    expect(resolveCompleteDestination("/marketplace/checkout", "/marketplace/order/confirm/abc")).toBe(
      "/marketplace/order/confirm/abc"
    );
  });

  it("utilise le completion du graph s'il existe", () => {
    expect(resolveCompleteDestination("/orders/review")).toBe("/orders");
    expect(resolveCompleteDestination("/settings/subscription/payment")).toBe("/settings/subscription");
  });

  it("retombe sur le fallback du graph sans completion", () => {
    expect(resolveCompleteDestination("/marketplace/cart")).toBe("/marketplace");
  });

  it("retombe sur le fallback d'espace pour une route inconnue", () => {
    expect(resolveCompleteDestination("/weird")).toBe("/");
  });
});

describe("navigationStore — flags, pile, flow", () => {
  let useNavigationStore: typeof import("./navigationStore").useNavigationStore;

  beforeEach(async () => {
    vi.stubGlobal("sessionStorage", memoryStorage());
    useNavigationStore = (await import("./navigationStore")).useNavigationStore;
    useNavigationStore.setState({ stack: [], flow: null, flags: {} });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("setFlag / getFlag / clearFlag", () => {
    const s = useNavigationStore.getState();
    expect(s.getFlag("from-hamburger")).toBe(false);
    s.setFlag("from-hamburger", true);
    expect(useNavigationStore.getState().getFlag("from-hamburger")).toBe(true);
    useNavigationStore.getState().clearFlag("from-hamburger");
    expect(useNavigationStore.getState().getFlag("from-hamburger")).toBe(false);
  });

  it("push ignore les entrées identiques consécutives", () => {
    useNavigationStore.getState().push({ path: "/a" });
    useNavigationStore.getState().push({ path: "/a" });
    expect(useNavigationStore.getState().stack).toEqual([{ path: "/a" }]);
  });

  it("push garde deux entrées si la search diffère", () => {
    useNavigationStore.getState().push({ path: "/a" });
    useNavigationStore.getState().push({ path: "/a", search: "?q=1" });
    expect(useNavigationStore.getState().stack).toEqual([
      { path: "/a" },
      { path: "/a", search: "?q=1" },
    ]);
  });

  it("la pile est bornée à 30 entrées", () => {
    const s = useNavigationStore.getState();
    for (let i = 0; i < 40; i++) s.push({ path: `/p${i}` });
    expect(useNavigationStore.getState().stack.length).toBe(30);
  });

  it("clearFlow ne supprime que le flow correspondant", () => {
    const s = useNavigationStore.getState();
    s.setFlow("mission", { id: "m1" });
    s.clearFlow("other");
    expect(useNavigationStore.getState().getFlow<{ id: string }>("mission")).toEqual({ id: "m1" });
  });

  it("clearFlow supprime le flow correspondant", () => {
    const s = useNavigationStore.getState();
    s.setFlow("mission", { id: "m1" });
    s.clearFlow("mission");
    expect(useNavigationStore.getState().getFlow<{ id: string }>("mission")).toBeUndefined();
  });

  it("getFlow retourne undefined pour un flow inconnu", () => {
    expect(useNavigationStore.getState().getFlow("nope")).toBeUndefined();
  });
});
