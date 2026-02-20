import { useNavigate } from '@tanstack/react-router';
import { useGetCartData, useCheckout } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function Checkout() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: cartItems } = useGetCartData();
  const checkout = useCheckout();

  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    shippingAddress: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const isAuthenticated = !!identity;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Name is required';
    }

    if (!formData.customerEmail.trim()) {
      newErrors.customerEmail = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail)) {
      newErrors.customerEmail = 'Invalid email address';
    }

    if (!formData.shippingAddress.trim()) {
      newErrors.shippingAddress = 'Shipping address is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const orderId = await checkout.mutateAsync({
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        shippingAddress: formData.shippingAddress,
      });
      toast.success('Order placed successfully!');
      navigate({ to: `/order-confirmation/${orderId}` });
    } catch (error) {
      toast.error('Failed to place order');
    }
  };

  if (!isAuthenticated) {
    navigate({ to: '/cart' });
    return null;
  }

  if (!cartItems || cartItems.length === 0) {
    navigate({ to: '/cart' });
    return null;
  }

  const total = cartItems.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-serif text-4xl font-bold mb-8">Checkout</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-2xl">Shipping Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Full Name *</Label>
                  <Input
                    id="customerName"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    placeholder="John Doe"
                    className={errors.customerName ? 'border-destructive' : ''}
                  />
                  {errors.customerName && (
                    <p className="text-sm text-destructive">{errors.customerName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerEmail">Email Address *</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                    placeholder="john@example.com"
                    className={errors.customerEmail ? 'border-destructive' : ''}
                  />
                  {errors.customerEmail && (
                    <p className="text-sm text-destructive">{errors.customerEmail}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shippingAddress">Shipping Address *</Label>
                  <Textarea
                    id="shippingAddress"
                    value={formData.shippingAddress}
                    onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
                    placeholder="123 Main St, City, State, ZIP"
                    rows={4}
                    className={errors.shippingAddress ? 'border-destructive' : ''}
                  />
                  {errors.shippingAddress && (
                    <p className="text-sm text-destructive">{errors.shippingAddress}</p>
                  )}
                </div>

                <Button type="submit" size="lg" className="w-full" disabled={checkout.isPending}>
                  {checkout.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Place Order'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle className="font-serif text-2xl">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {cartItems.map((item) => (
                  <div key={item.productId} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {item.productName} × {item.quantity.toString()}
                    </span>
                    <span className="font-medium">
                      ${((Number(item.price) * Number(item.quantity)) / 100).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span className="text-primary">${(total / 100).toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
