import { api } from './api';
import { AddressSuggestion, SearchApiResponse } from '../types/address';

export async function searchAddress(query: string): Promise<AddressSuggestion[]> {
  if (!query || query.length < 2) {
    return [];
  }

  const response = await api.get<SearchApiResponse>('/search/suggestions', {
    params: { q: query },
  });

  if (!response.data.success || !response.data.data) {
    return [];
  }

  return response.data.data.map((item) => ({
    placeId: item.placeId,
    displayName: item.displayName,
    shortName: item.mainText,
    secondaryText: item.secondaryText,
    lat: item.lat,
    lng: item.lng,
  }));
}
