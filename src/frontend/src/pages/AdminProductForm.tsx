import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetProduct, useAddProduct, useUpdateProduct, useIsCallerAdmin } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Loader2, Upload, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { ExternalBlob } from '../backend';
import { Progress } from '@/components/ui/progress';

export default function AdminProductForm() {
  const params = useParams({ strict: false });
  const navigate = useNavigate();
  const { identity, login } = useInternetIdentity();
  const { data: isAdmin, isLoading: adminCheckLoading } = useIsCallerAdmin();
  
  const productId = 'id' in params ? params.id : undefined;
  const isEditMode = !!productId;
  
  const { data: existingProduct, isLoading: productLoading } = useGetProduct(productId || '', {
    enabled: isEditMode,
  });
  
  const addProduct = useAddProduct();
  const updateProduct = useUpdateProduct();

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isAuthenticated = !!identity;

  useEffect(() => {
    if (existingProduct) {
      setFormData({
        name: existingProduct.name,
        price: (Number(existingProduct.price) / 100).toString(),
        description: existingProduct.description,
      });
      setImagePreview(existingProduct.image.getDirectURL());
    }
  }, [existingProduct]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }

    if (!formData.price.trim()) {
      newErrors.price = 'Price is required';
    } else if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      newErrors.price = 'Price must be a positive number';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!isEditMode && !imageFile) {
      newErrors.image = 'Product image is required';
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
      const priceInCents = Math.round(Number(formData.price) * 100);
      
      let imageBlob: ExternalBlob;
      
      if (imageFile) {
        const arrayBuffer = await imageFile.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        imageBlob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
          setUploadProgress(percentage);
        });
      } else if (existingProduct) {
        imageBlob = existingProduct.image;
      } else {
        toast.error('Image is required');
        return;
      }

      if (isEditMode && productId) {
        await updateProduct.mutateAsync({
          id: productId,
          name: formData.name,
          price: BigInt(priceInCents),
          description: formData.description,
          image: imageBlob,
        });
        toast.success('Product updated successfully');
      } else {
        await addProduct.mutateAsync({
          name: formData.name,
          price: BigInt(priceInCents),
          description: formData.description,
          image: imageBlob,
        });
        toast.success('Product added successfully');
      }
      
      navigate({ to: '/admin' });
    } catch (error) {
      toast.error(isEditMode ? 'Failed to update product' : 'Failed to add product');
      setUploadProgress(0);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <ShieldAlert className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h2 className="font-serif text-3xl font-bold mb-4">Admin Access Required</h2>
        <p className="text-lg text-muted-foreground mb-6">Please login to access this page</p>
        <Button onClick={login}>Login</Button>
      </div>
    );
  }

  if (adminCheckLoading || (isEditMode && productLoading)) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="h-96 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <ShieldAlert className="h-16 w-16 mx-auto mb-4 text-destructive" />
        <h2 className="font-serif text-3xl font-bold mb-4">Access Denied</h2>
        <p className="text-lg text-muted-foreground mb-6">
          You don't have permission to access this page
        </p>
        <Button onClick={() => navigate({ to: '/' })}>Back to Home</Button>
      </div>
    );
  }

  const isSubmitting = addProduct.isPending || updateProduct.isPending;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Button
        variant="ghost"
        onClick={() => navigate({ to: '/admin' })}
        className="mb-8 -ml-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Admin
      </Button>

      <div className="max-w-2xl mx-auto">
        <h1 className="font-serif text-4xl font-bold mb-8">
          {isEditMode ? 'Edit Product' : 'Add New Product'}
        </h1>

        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-2xl">Product Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Handcrafted Ceramic Vase"
                  className={errors.name ? 'border-destructive' : ''}
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price (USD) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="49.99"
                  className={errors.price ? 'border-destructive' : ''}
                />
                {errors.price && <p className="text-sm text-destructive">{errors.price}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your product..."
                  rows={6}
                  className={errors.description ? 'border-destructive' : ''}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">{errors.description}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Product Image {!isEditMode && '*'}</Label>
                <div className="space-y-4">
                  {imagePreview && (
                    <div className="relative w-full aspect-square max-w-sm rounded-lg overflow-hidden bg-muted">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex items-center gap-4">
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <Label
                      htmlFor="image"
                      className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      {imagePreview ? 'Change Image' : 'Upload Image'}
                    </Label>
                  </div>
                  {errors.image && <p className="text-sm text-destructive">{errors.image}</p>}
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="space-y-2">
                      <Progress value={uploadProgress} />
                      <p className="text-sm text-muted-foreground">Uploading: {uploadProgress}%</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4">
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isEditMode ? 'Updating...' : 'Adding...'}
                    </>
                  ) : (
                    <>{isEditMode ? 'Update Product' : 'Add Product'}</>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate({ to: '/admin' })}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
