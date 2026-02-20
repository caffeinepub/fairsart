import { Link, useNavigate } from '@tanstack/react-router';
import { ShoppingCart, Menu, User } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCartData } from '../hooks/useQueries';
import { useGetCallerUserProfile, useIsCallerAdmin } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';

export default function Header() {
  const { identity, login, clear, loginStatus } = useInternetIdentity();
  const navigate = useNavigate();
  const { data: cartData } = useGetCartData();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: isAdmin } = useIsCallerAdmin();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAuthenticated = !!identity;
  const cartItemCount = cartData?.reduce((sum, item) => sum + Number(item.quantity), 0) || 0;

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      navigate({ to: '/' });
    } else {
      await login();
    }
  };

  const NavLinks = () => (
    <>
      <Link
        to="/products"
        className="text-foreground/80 hover:text-foreground transition-colors font-medium"
        onClick={() => setMobileMenuOpen(false)}
      >
        Shop
      </Link>
      {isAdmin && (
        <Link
          to="/admin"
          className="text-foreground/80 hover:text-foreground transition-colors font-medium"
          onClick={() => setMobileMenuOpen(false)}
        >
          Admin
        </Link>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <img
              src="/assets/generated/fairsart-logo.dim_400x400.png"
              alt="fairsart logo"
              className="h-10 w-10 object-contain"
            />
            <span className="font-serif text-2xl font-semibold text-foreground">fairsart</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <NavLinks />
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {isAuthenticated && userProfile && (
              <div className="hidden sm:flex items-center space-x-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>{userProfile.name}</span>
              </div>
            )}
            
            <Link to="/cart" className="relative">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
                    {cartItemCount}
                  </span>
                )}
              </Button>
            </Link>

            <Button
              onClick={handleAuth}
              disabled={loginStatus === 'logging-in'}
              variant={isAuthenticated ? 'outline' : 'default'}
              size="sm"
              className="hidden sm:inline-flex"
            >
              {loginStatus === 'logging-in' ? 'Logging in...' : isAuthenticated ? 'Logout' : 'Login'}
            </Button>

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px]">
                <div className="flex flex-col space-y-6 mt-8">
                  <NavLinks />
                  {isAuthenticated && userProfile && (
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground pt-4 border-t">
                      <User className="h-4 w-4" />
                      <span>{userProfile.name}</span>
                    </div>
                  )}
                  <Button
                    onClick={handleAuth}
                    disabled={loginStatus === 'logging-in'}
                    variant={isAuthenticated ? 'outline' : 'default'}
                    className="w-full"
                  >
                    {loginStatus === 'logging-in' ? 'Logging in...' : isAuthenticated ? 'Logout' : 'Login'}
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
