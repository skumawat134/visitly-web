export type EntitlementValue = string;
export interface Entitlement {
    id: string;
    key: string;
    value: EntitlementValue;
    enforceEntitlement: boolean;
    currentValue?: string;
  }
  export interface ProductEntitlements {
    productId: string;
    product: string; // e.g. "GREET"
    plan: string;    // e.g. "Business Annual"
    entitlements: Entitlement[];
    effectiveStartD: string; // ISO timestamp
  }

  export type EntitlementsResponse = ProductEntitlements[];
