import { Heart } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const appIdentifier = typeof window !== 'undefined' ? window.location.hostname : 'fairsart';

  return (
    <footer className="border-t bg-muted/30 mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-center md:text-left">
            <p className="font-serif text-xl font-semibold text-foreground mb-1">fairsart</p>
            <p className="text-sm text-muted-foreground">Artisan crafted goods</p>
          </div>
          
          <div className="text-center text-sm text-muted-foreground">
            <p>© {currentYear} fairsart. All rights reserved.</p>
            <p className="mt-1 flex items-center justify-center gap-1">
              Built with <Heart className="h-3 w-3 fill-primary text-primary" /> using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(appIdentifier)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
