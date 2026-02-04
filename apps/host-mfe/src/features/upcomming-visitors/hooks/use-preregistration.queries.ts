// features/pre-registration/api/preRegistrationApi.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getHosts, getParkingLots, getPointOfEntry, getSites, getVisitorTypes } from '../api/pre-registration.api';

export const useSites = () => {
  return useQuery({
    queryKey: ['sites'],
    queryFn: () => getSites(),
  });
};

export const useVisitorTypes = (siteId: string) => {
  return useQuery({
    queryKey: ['visitorTypes', siteId],
    queryFn: () => getVisitorTypes(siteId),
    enabled: !!siteId,
  });
};

export const usePointOfEntry = (siteId: string) => {
  return useQuery({
    queryKey: ['pointOfEntry', siteId],
    queryFn: () => getPointOfEntry(siteId),
  });
};

export const useHosts = (search: string, siteId?: string) => {
  return useQuery({
    queryKey: ['hosts', search, siteId],
    queryFn: () => getHosts(search, siteId),
    enabled: search.length >= 3,
  });
};


export const useParkingLot = (siteId: string) => {
  return useQuery({
    queryKey: ['parkingLots', siteId],
    queryFn: () => getParkingLots(siteId),
  });
};