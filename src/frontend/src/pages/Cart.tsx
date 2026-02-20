import { useNavigate } from '@tanstack/react-router';
import { useGetCartData, useRemoveFromCart, useAddToCart, useGetProduct } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

export default function Cart() {
  const navigate = useNavigate();
  const { identity, login } = useInternetIdentity();
  const { data: cartItems, isLoading } = useGetCartData();
  const removeFromCart = useRemoveFromCart();
  const addToCart = useAddToCart();

  const isAuthenticated = !!identity;

  const handleRemove = async (productId: string) => {
    try {
      await removeFromCart.mutateAsync(productId);
      toast.success('Removed from cart');
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const handleUpdateQuantity = async (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    try {
      await addToCart.mutateAsync({ productId, quantity: BigInt(newQuantity) });
    } catch (error) {
      toast.error('Failed to update quantity');
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.error('Please login to checkout');
      login();
      return;
    }
    navigate({ to: '/checkout' });
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h2 className="font-serif text-3xl font-bold mb-4">Your Cart</h2>
        <p className="text-lg text-muted-foreground mb-6">Please login to view your cart</p>
        <Button onClick={login}>Login</Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="font-serif text-4xl font-bold mb-8">Your Cart</h1>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h2 className="font-serif text-3xl font-bold mb-4">Your cart is empty</h2>
        <p className="text-lg text-muted-foreground mb-6">
          Start adding some beautiful artisan pieces to your collection
        </p>
        <Button onClick={() => navigate({ to: '/products' })}>
          Browse Products
        </Button>
      </div>
    );
  }

  const total = cartItems.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-serif text-4xl font-bold mb-8">Your Cart</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <CartItemCard
              key={item.productId}
              item={item}
              onRemove={handleRemove}
              onUpdateQuantity={handleUpdateQuantity}
            />
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-20">
            <CardContent className="p-6">
              <h2 className="font-serif text-2xl font-semibold mb-6">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>${(total / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
                <div className="border-t pt-3 flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span className="text-primary">${(total / 100).toFixed(2)}</span>
                </div>
              </div>

              <Button onClick={handleCheckout} className="w-full" size="lg">
                Proceed to Checkout
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function CartItemCard({
  item,
  onRemove,
  onUpdateQuantity,
}: {
  item: any;
  onRemove: (id: string) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
}) {
  const { data: product, isLoading } = useGetProduct(item.productId);

  if (isLoading || !product) {
    return <Skeleton className="h-32 w-full" />;
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className="w-24 h-24 flex-shrink-0 rounded-md overflow-hidden bg-muted">
            <img
              src={product.image.getDirectURL()}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = '/assets/generated/product-placeholder.dim_600x600.png';
              }}
            />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-serif text-lg font-semibold mb-1 truncate">
              {product.name}
            </h3>
            <p className="text-primary font-semibold mb-3">
              ${(Number(product.price) / 100).toFixed(2)}
            </p>

            <div className="flex items-center gap-4">
              <div className="flex items-center border rounded-md">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onUpdateQuantity(item.productId, Number(item.quantity) - 1)}
                  disabled={Number(item.quantity) <= 1}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="px-3 text-sm font-medium">{item.quantity.toString()}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onUpdateQuantity(item.productId, Number(item.quantity) + 1)}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={() => onRemove(item.productId)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
