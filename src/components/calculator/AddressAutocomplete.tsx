import { useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { MapPin, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useGoogleMapsAutocomplete, AddressComponents } from '@/hooks/useGoogleMapsAutocomplete';
import { cn } from '@/lib/utils';

interface AddressAutocompleteProps {
  value: string;
  onAddressSelect: (address: AddressComponents) => void;
  onInputChange: (value: string) => void;
  isVerified: boolean;
  verifiedAddress?: string;
}

export const AddressAutocomplete = ({
  value,
  onAddressSelect,
  onInputChange,
  isVerified,
  verifiedAddress,
}: AddressAutocompleteProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  const { isLoading, error } = useGoogleMapsAutocomplete({
    inputRef,
    onPlaceSelect: (address) => {
      onAddressSelect(address);
      onInputChange(address.formattedAddress);
    },
  });

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="adresse" className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Objektadresse
        </Label>
        {isVerified && (
          <Badge variant="outline" className="text-success border-success gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Verifiziert
          </Badge>
        )}
      </div>

      <div className="relative">
        <Input
          ref={inputRef}
          id="adresse"
          type="text"
          value={value}
          onChange={(e) => onInputChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Straße, Hausnummer, Stadt eingeben..."
          className={cn(
            'pr-10 transition-all',
            isVerified && 'border-success focus-visible:ring-success',
            error && 'border-destructive'
          )}
          disabled={isLoading}
        />

        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : isVerified ? (
            <CheckCircle2 className="h-4 w-4 text-success" />
          ) : error ? (
            <AlertCircle className="h-4 w-4 text-destructive" />
          ) : (
            <MapPin className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </div>

      {error && (
        <p className="text-xs text-destructive flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}

      {!error && !isVerified && value && (
        <p className="text-xs text-muted-foreground">
          Wähle eine Adresse aus den Vorschlägen, um sie zu verifizieren
        </p>
      )}

      {isVerified && verifiedAddress && (
        <p className="text-xs text-success">
          ✓ {verifiedAddress}
        </p>
      )}
    </div>
  );
};
