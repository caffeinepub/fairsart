import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useGetAllProducts } from '../hooks/useQueries';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProductCatalog() {
  const { data: products, isLoading } = useGetAllProducts();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = products?.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">Our Collection</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Explore our carefully curated selection of artisan products
        </p>
        
        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-64 w-full" />
              <CardContent className="p-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredProducts && filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredProducts.map((product) => (
            <Link key={product.id} to="/products/$id" params={{ id: product.id }}>
              <Card className="overflow-hidden hover:shadow-soft-lg transition-shadow duration-300 h-full group">
                <div className="aspect-square overflow-hidden bg-muted">
                  <img
                    src={product.image.getDirectURL()}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.src = '/assets/generated/product-placeholder.dim_600x600.png';
                    }}
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-serif text-xl font-semibold mb-2 line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {product.description}
                  </p>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <p className="text-2xl font-semibold text-primary">
                    ${(Number(product.price) / 100).toFixed(2)}
                  </p>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-lg text-muted-foreground">
            {searchQuery ? 'No products found matching your search.' : 'No products available yet.'}
          </p>
        </div>
      )}
    </div>
  );
}
