import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetProduct, useAddToCart } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, ShoppingCart, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import ProfileSetupModal from '../components/ProfileSetupModal';

export default function ProductDetail() {
  const { id } = useParams({ from: '/products/$id' });
  const navigate = useNavigate();
  const { identity, login } = useInternetIdentity();
  const { data: product, isLoading } = useGetProduct(id);
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const addToCart = useAddToCart();

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      await login();
      return;
    }

    if (!userProfile) {
      toast.error('Please complete your profile first');
      return;
    }

    try {
      await addToCart.mutateAsync({ productId: id, quantity: BigInt(1) });
      toast.success('Added to cart!');
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 gap-12">
          <Skeleton className="aspect-square w-full rounded-lg" />
          <div className="space-y-6">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <p className="text-lg text-muted-foreground">Product not found</p>
        <Button onClick={() => navigate({ to: '/products' })} className="mt-4">
          Back to Products
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Button
          variant="ghost"
          onClick={() => navigate({ to: '/products' })}
          className="mb-8 -ml-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Products
        </Button>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="aspect-square overflow-hidden rounded-lg bg-muted shadow-soft-lg">
            <img
              src={product.image.getDirectURL()}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = '/assets/generated/product-placeholder.dim_600x600.png';
              }}
            />
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
              {product.name}
            </h1>
            <p className="text-3xl font-semibold text-primary mb-6">
              ${(Number(product.price) / 100).toFixed(2)}
            </p>
            
            <div className="prose prose-lg max-w-none mb-8">
              <p className="text-foreground/80 leading-relaxed whitespace-pre-wrap">
                {product.description}
              </p>
            </div>

            <Card className="bg-muted/30 border-none mb-8">
              <CardContent className="p-6">
                <h3 className="font-serif text-xl font-semibold mb-3">Product Details</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Handcrafted with care</li>
                  <li>• Sustainable materials</li>
                  <li>• Unique artisan piece</li>
                  <li>• Made to order</li>
                </ul>
              </CardContent>
            </Card>

            <Button
              size="lg"
              onClick={handleAddToCart}
              disabled={addToCart.isPending}
              className="w-full text-lg py-6"
            >
              {addToCart.isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Adding to Cart...
                </>
              ) : (
                <>
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Add to Cart
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <ProfileSetupModal open={showProfileSetup} />
    </>
  );
}
