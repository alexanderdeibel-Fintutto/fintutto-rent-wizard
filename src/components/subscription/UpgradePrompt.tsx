import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

interface UpgradePromptProps {
  feature: string;
  description?: string;
  requiredPlan?: 'pro' | 'business';
}

export const UpgradePrompt = ({ 
  feature, 
  description,
  requiredPlan = 'pro' 
}: UpgradePromptProps) => {
  const navigate = useNavigate();
  
  const planName = requiredPlan === 'business' ? 'Business' : 'Pro';

  return (
    <Card className="border-dashed border-2 border-muted-foreground/30">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-muted flex items-center justify-center">
          <Lock className="h-6 w-6 text-muted-foreground" />
        </div>
        <CardTitle className="text-lg">{feature}</CardTitle>
        <CardDescription>
          {description || `Diese Funktion ist im ${planName}-Plan verfügbar.`}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <Button 
          onClick={() => navigate('/pricing')}
          className="gradient-primary"
        >
          Jetzt auf {planName} upgraden
        </Button>
      </CardContent>
    </Card>
  );
};
