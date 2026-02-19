// features/pre-registration/api/preRegistrationApi.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDestinations, getHosts, getParkingLots, getPointOfEntry, getVisitPreregistration, getSites, getVisitorTypes, getVistorTypeFields } from '../api/pre-registration.api';
import { useDebounce } from '@/shared/hooks/useDebounce';

export const useSites = () => {
  return useQuery({
    queryKey: ['sites'],
    queryFn: () => getSites(),
  });
};

export const useVisitorTypes = (siteId: string) => {
  return useQuery({
    queryKey: ['visitortypes', siteId],
    queryFn: () => getVisitorTypes(siteId),
    enabled: !!siteId,
  });
};

export const usePointOfEntry = (siteId: string, isEntitled: boolean = true) => {
  return useQuery({
    queryKey: ['pointOfEntry', siteId],
    queryFn: () => getPointOfEntry(siteId),
    enabled: !!siteId && isEntitled,
  });
};

export const useHosts = (search: string, siteId?: string) => {
  const debouncedSearch = useDebounce(search, 300); // You can implement debouncing here if needed
  return useQuery({
    queryKey: ['hosts', debouncedSearch, siteId],
    queryFn: () => getHosts(debouncedSearch, siteId),
    enabled: debouncedSearch.length >= 3,
    meta: {
      showLoader: false
    }
  });
};
export const useCoHosts = (search: string, siteId?: string) => {
  const debouncedSearch = useDebounce(search, 300); // You can implement debouncing here if needed
  return useQuery({
    queryKey: ['cohosts', debouncedSearch, siteId],
    queryFn: () => getHosts(debouncedSearch, siteId),
    enabled: debouncedSearch.length >= 3,
    meta: {
      showLoader: false
    }
  });
};
export const useVisitorTypesFields = (visitorTypeId: string) => {
  return useQuery({
    queryKey: ['visitorTypeFields', visitorTypeId],
    queryFn: () => getVistorTypeFields(visitorTypeId),
    enabled: !!visitorTypeId,
  });
}

export const useParkingLot = (siteId: string, isEntitled: boolean = true, date?: string) => {
  return useQuery({
    queryKey: ['parkingLots', siteId, date],
    queryFn: () => getParkingLots(siteId, date),
    enabled: !!siteId && isEntitled,
  });
};


export const useDestination = (siteId: string, isEntitled: boolean = true) => {
  return useQuery({
    queryKey: ['destinations', siteId],
    queryFn: () => getDestinations(siteId),
    enabled: !!siteId && isEntitled,
  });
};


export const usePreregistration = (visitId: string) => {
  return useQuery({
    queryKey: ['preregistration', visitId],
    queryFn: () => getVisitPreregistration(visitId),
    enabled: !!visitId,
  });
};