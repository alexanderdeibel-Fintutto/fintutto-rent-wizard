/// <reference types="@types/google.maps" />
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AddressComponents {
  street: string;
  houseNumber: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  formattedAddress: string;
  placeId: string;
  latitude: number | null;
  longitude: number | null;
}

interface UseGoogleMapsAutocompleteProps {
  inputRef: React.RefObject<HTMLInputElement>;
  onPlaceSelect: (address: AddressComponents) => void;
  countryRestrictions?: string[];
}

let isScriptLoaded = false;
let isScriptLoading = false;
const scriptLoadCallbacks: (() => void)[] = [];

const loadGoogleMapsScript = (apiKey: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (isScriptLoaded && (window as any).google?.maps?.places) {
      resolve();
      return;
    }

    if (isScriptLoading) {
      scriptLoadCallbacks.push(() => resolve());
      return;
    }

    isScriptLoading = true;

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=de`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      isScriptLoaded = true;
      isScriptLoading = false;
      resolve();
      scriptLoadCallbacks.forEach((cb) => cb());
      scriptLoadCallbacks.length = 0;
    };

    script.onerror = () => {
      isScriptLoading = false;
      reject(new Error('Failed to load Google Maps script'));
    };

    document.head.appendChild(script);
  });
};

const parseAddressComponents = (place: any): AddressComponents => {
  const components: AddressComponents = {
    street: '',
    houseNumber: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    formattedAddress: place.formatted_address || '',
    placeId: place.place_id || '',
    latitude: place.geometry?.location?.lat?.() || null,
    longitude: place.geometry?.location?.lng?.() || null,
  };

  place.address_components?.forEach((component: any) => {
    const types = component.types;

    if (types.includes('route')) {
      components.street = component.long_name;
    }
    if (types.includes('street_number')) {
      components.houseNumber = component.long_name;
    }
    if (types.includes('locality')) {
      components.city = component.long_name;
    }
    if (types.includes('administrative_area_level_1')) {
      components.state = component.long_name;
    }
    if (types.includes('postal_code')) {
      components.postalCode = component.long_name;
    }
    if (types.includes('country')) {
      components.country = component.long_name;
    }
  });

  return components;
};

export const useGoogleMapsAutocomplete = ({
  inputRef,
  onPlaceSelect,
  countryRestrictions = ['de', 'at', 'ch'],
}: UseGoogleMapsAutocompleteProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const autocompleteRef = useRef<any>(null);
  const onPlaceSelectRef = useRef(onPlaceSelect);
  const isInitializedRef = useRef(false);

  // Keep callback ref up to date without triggering re-init
  useEffect(() => {
    onPlaceSelectRef.current = onPlaceSelect;
  }, [onPlaceSelect]);

  useEffect(() => {
    // Prevent re-initialization if already set up
    if (isInitializedRef.current) return;
    if (!inputRef.current) return;

    let cancelled = false;

    const initAutocomplete = async () => {
      try {
        // Fetch the API key from the edge function
        const { data, error: fetchError } = await supabase.functions.invoke('google-maps-key');

        if (cancelled) return;

        if (fetchError || !data?.apiKey) {
          console.error('Failed to fetch Google Maps API key:', fetchError);
          setError('Google Maps nicht verfügbar');
          setIsLoading(false);
          return;
        }

        const apiKey = data.apiKey;

        await loadGoogleMapsScript(apiKey);

        if (cancelled) return;

        const googleMaps = (window as any).google;
        if (!googleMaps?.maps?.places) {
          throw new Error('Google Maps Places API not available');
        }

        const autocomplete = new googleMaps.maps.places.Autocomplete(inputRef.current, {
          types: ['address'],
          componentRestrictions: { country: countryRestrictions },
          fields: ['address_components', 'formatted_address', 'geometry', 'place_id'],
        });

        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();

          if (!place.geometry) {
            setError('Keine gültige Adresse gefunden');
            return;
          }

          setError(null);
          const addressData = parseAddressComponents(place);
          onPlaceSelectRef.current(addressData);
        });

        autocompleteRef.current = autocomplete;
        isInitializedRef.current = true;
        setIsLoading(false);
      } catch (err) {
        if (cancelled) return;
        console.error('Error initializing Google Maps:', err);
        setError('Fehler beim Laden von Google Maps');
        setIsLoading(false);
      }
    };

    initAutocomplete();

    return () => {
      cancelled = true;
    };
  }, [inputRef]); // Only depend on inputRef – stable across renders

  return { isLoading, error };
};
