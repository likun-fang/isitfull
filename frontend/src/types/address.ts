export interface AddressSuggestion {
  placeId: string;
  displayName: string;
  shortName: string;
  secondaryText: string;
  lat: number;
  lng: number;
}

export interface SearchSuggestionDto {
  placeId: string;
  displayName: string;
  mainText: string;
  secondaryText: string;
  lat: number;
  lng: number;
}

export interface SearchApiResponse {
  success: boolean;
  data?: SearchSuggestionDto[];
  error?: string;
  meta?: {
    total: number;
  };
}
