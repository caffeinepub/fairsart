import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetOrder } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Package } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function OrderConfirmation() {
  const { orderId } = useParams({ from: '/order-confirmation/$orderId' });
  const navigate = useNavigate();
  const { data: order, isLoading } = useGetOrder(orderId);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-2xl mx-auto space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <p className="text-lg text-muted-foreground mb-4">Order not found</p>
        <Button onClick={() => navigate({ to: '/products' })}>
          Continue Shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-2xl mx-auto">
        {/* Success Message */}
        <div className="text-center mb-8">
          <CheckCircle className="h-16 w-16 text-primary mx-auto mb-4" />
          <h1 className="font-serif text-4xl font-bold mb-2">Order Confirmed!</h1>
          <p className="text-lg text-muted-foreground">
            Thank you for your purchase. Your order has been received.
          </p>
        </div>

        {/* Order Details */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-start gap-4 mb-6">
              <Package className="h-6 w-6 text-primary mt-1" />
              <div className="flex-1">
                <h2 className="font-serif text-2xl font-semibold mb-2">Order Details</h2>
                <p className="text-sm text-muted-foreground">Order ID: {order.id}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-1">Customer Information</h3>
                <p className="text-sm text-muted-foreground">{order.customerName}</p>
                <p className="text-sm text-muted-foreground">{order.customerEmail}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-1">Shipping Address</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {order.shippingAddress}
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Items Ordered</h3>
                <div className="space-y-2">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Product ID: {item.productId} × {item.quantity.toString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span className="text-primary">${(Number(order.total) / 100).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button onClick={() => navigate({ to: '/products' })} className="flex-1">
            Continue Shopping
          </Button>
          <Button onClick={() => navigate({ to: '/' })} variant="outline" className="flex-1">
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
