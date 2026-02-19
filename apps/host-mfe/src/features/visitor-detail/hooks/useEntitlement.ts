import { useMemo } from "react";

export type EntitlementsState = {
  offenderCheckEntitled: boolean;
  idValidationEntitled: boolean;
  isRecurringPreRegistrationEntitled: boolean;
  isUserGroupEntitled: boolean;
  isBulkPreRegCSVUploadEntitled: boolean;
  isCoHostsEntitled: boolean;
  isAdvancedMegaLocationEntitled: boolean;
  advanceWatchListEntitled: boolean;
  isPreScreenCheckEntitled: boolean;
  isDeliveryManagerEntitled: boolean;
};

export const useEntitlements = () => {
  return useMemo(() => {
    const productInfo = JSON.parse(
      sessionStorage.getItem("entitlement") || "{}"
    );

    const state: EntitlementsState = {
      offenderCheckEntitled: false,
      idValidationEntitled: false,
      isRecurringPreRegistrationEntitled: false,
      isUserGroupEntitled: false,
      isBulkPreRegCSVUploadEntitled: false,
      isCoHostsEntitled: false,
      isAdvancedMegaLocationEntitled: false,
      advanceWatchListEntitled: false,
      isPreScreenCheckEntitled: false,
      isDeliveryManagerEntitled : false
    };

    const entitlements = productInfo?.products?.[0]?.entitlements ?? [];

    for (const { key, value } of entitlements) {
      if (value !== "true") continue;

      switch (key) {
        case "OFFENDER_VALIDATION":
          state.offenderCheckEntitled = true;
          break;
        case "ID_VALIDATION":
          state.idValidationEntitled = true;
          break;
        case "RECURRING_PRE_REGISTRATION":
          state.isRecurringPreRegistrationEntitled = true;
          break;
        case "USER_GROUP":
          state.isUserGroupEntitled = true;
          break;
        case "BULK_PREREG_CSV":
          state.isBulkPreRegCSVUploadEntitled = true;
          break;
        case "COHOST_PREREG":
          state.isCoHostsEntitled = true;
          break;
        case "ADVANCED_MEGA_LOCATION":
          state.isAdvancedMegaLocationEntitled = true;
          break;
        case "ADVANCED_WATCHLIST":
          state.advanceWatchListEntitled = true;
          break;
        case "PRESCREEN":
          state.isPreScreenCheckEntitled = true;
          break;
        case "ADVANCED_DELIVERY_MANAGER":
          state.isDeliveryManagerEntitled = true;
          break;
      }
    }

    return state;
  }, []);
};
