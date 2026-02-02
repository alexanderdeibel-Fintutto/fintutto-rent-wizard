import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

interface BillingToggleProps {
  isYearly: boolean;
  onToggle: (yearly: boolean) => void;
}

export const BillingToggle = ({ isYearly, onToggle }: BillingToggleProps) => {
  return (
    <div className="flex items-center justify-center gap-4">
      <Label 
        htmlFor="billing-toggle" 
        className={`text-sm font-medium cursor-pointer transition-colors ${
          !isYearly ? 'text-foreground' : 'text-muted-foreground'
        }`}
      >
        Monatlich
      </Label>
      <Switch
        id="billing-toggle"
        checked={isYearly}
        onCheckedChange={onToggle}
      />
      <div className="flex items-center gap-2">
        <Label 
          htmlFor="billing-toggle" 
          className={`text-sm font-medium cursor-pointer transition-colors ${
            isYearly ? 'text-foreground' : 'text-muted-foreground'
          }`}
        >
          Jährlich
        </Label>
        <Badge variant="secondary" className="text-xs">
          20% sparen
        </Badge>
      </div>
    </div>
  );
};
