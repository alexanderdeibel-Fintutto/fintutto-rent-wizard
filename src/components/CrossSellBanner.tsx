import { useState, useEffect } from 'react';
import { X, ExternalLink, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCrossSell } from '@/hooks/useCrossSell';

const APP_ICONS: Record<string, string> = {
  vermietify: '🏠',
  hausmeisterpro: '🔧',
  mieterapp: '👤',
  formulare: '📄',
  zaehler: '📊',
  nkabrechnung: '💰',
  renditerechner: '📈'
};

const APP_URLS: Record<string, string> = {
  vermietify: 'https://vermietify.de',
  hausmeisterpro: 'https://hausmeisterpro.de',
  mieterapp: 'https://mieterapp.de',
  formulare: 'https://fintutto.de/formulare',
  zaehler: 'https://fintutto.de/zaehler',
  nkabrechnung: 'https://fintutto.de/nk',
  renditerechner: 'https://fintutto.de/rendite'
};

export const CrossSellBanner = () => {
  const { getRelevantBanners, loading } = useCrossSell();
  const [dismissedBanners, setDismissedBanners] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Load dismissed banners from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('dismissedCrossSellBanners');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Only keep dismissals from last 7 days
        const validDismissals = parsed.filter((item: { id: string; timestamp: number }) => 
          Date.now() - item.timestamp < 7 * 24 * 60 * 60 * 1000
        );
        setDismissedBanners(validDismissals.map((item: { id: string }) => item.id));
      } catch {
        setDismissedBanners([]);
      }
    }
  }, []);

  const banners = getRelevantBanners().filter(
    b => !dismissedBanners.includes(b.trigger.id)
  );

  // Rotate banners every 10 seconds
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % banners.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const handleDismiss = (triggerId: string) => {
    const stored = localStorage.getItem('dismissedCrossSellBanners');
    const current = stored ? JSON.parse(stored) : [];
    const updated = [...current, { id: triggerId, timestamp: Date.now() }];
    localStorage.setItem('dismissedCrossSellBanners', JSON.stringify(updated));
    setDismissedBanners(prev => [...prev, triggerId]);
  };

  if (loading || banners.length === 0) {
    return null;
  }

  const currentBanner = banners[currentIndex % banners.length];
  if (!currentBanner) return null;

  const { trigger, app } = currentBanner;
  const icon = APP_ICONS[trigger.to_app_id] || '✨';
  const appUrl = app.app_url || APP_URLS[trigger.to_app_id] || '#';

  return (
    <div className="relative overflow-hidden rounded-lg border bg-gradient-to-r from-primary/5 via-primary/10 to-accent/5 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xl">
          {icon}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium text-primary uppercase tracking-wide">
              Fintutto Suite
            </span>
          </div>
          
          <p className="text-sm font-medium text-foreground mb-1">
            {app.name}
          </p>
          
          <p className="text-sm text-muted-foreground line-clamp-2">
            {trigger.message_template}
          </p>
          
          <Button
            variant="link"
            size="sm"
            className="h-auto p-0 mt-2 text-primary"
            asChild
          >
            <a href={appUrl} target="_blank" rel="noopener noreferrer">
              Mehr erfahren
              <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          </Button>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 shrink-0 text-muted-foreground hover:text-foreground"
          onClick={() => handleDismiss(trigger.id)}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Schließen</span>
        </Button>
      </div>
      
      {banners.length > 1 && (
        <div className="flex justify-center gap-1 mt-3">
          {banners.map((_, index) => (
            <button
              key={index}
              className={`h-1.5 rounded-full transition-all ${
                index === currentIndex % banners.length
                  ? 'w-4 bg-primary'
                  : 'w-1.5 bg-primary/30'
              }`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

