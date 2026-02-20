import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="relative h-[500px] overflow-hidden">
        <img
          src="/assets/generated/hero-banner.dim_1200x400.png"
          alt="fairsart artisan products"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 to-background/50 flex items-center">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
                Artisan Crafted
                <br />
                <span className="text-primary">With Love</span>
              </h1>
              <p className="text-lg md:text-xl text-foreground/80 mb-8 leading-relaxed">
                Discover unique, handcrafted pieces that tell a story. Each item in our collection is carefully curated to bring warmth and character to your space.
              </p>
              <Link to="/products">
                <Button size="lg" className="text-lg px-8 py-6 group">
                  Explore Collection
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🎨</span>
              </div>
              <h3 className="font-serif text-2xl font-semibold mb-3">Handcrafted</h3>
              <p className="text-muted-foreground">
                Every piece is carefully crafted by skilled artisans with attention to detail and quality.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🌿</span>
              </div>
              <h3 className="font-serif text-2xl font-semibold mb-3">Sustainable</h3>
              <p className="text-muted-foreground">
                We prioritize eco-friendly materials and sustainable practices in all our creations.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">✨</span>
              </div>
              <h3 className="font-serif text-2xl font-semibold mb-3">Unique</h3>
              <p className="text-muted-foreground">
                Each item is one-of-a-kind, ensuring you own something truly special and distinctive.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6">
            Start Your Collection Today
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Browse our curated selection of artisan products and find pieces that speak to your style.
          </p>
          <Link to="/products">
            <Button size="lg" variant="outline" className="text-lg px-8 py-6">
              View All Products
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
