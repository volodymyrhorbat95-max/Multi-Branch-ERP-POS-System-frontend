import React from 'react';
import { Input } from '../../components/ui';
import type { Product, POSProduct } from '../../types';

interface ProductsGridProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  products: Product[] | POSProduct[];
  loading: boolean;
  onProductClick: (product: Product) => void;
  formatCurrency: (amount: number) => string;
}

// Product Card Component
const ProductCard: React.FC<{
  product: Product | POSProduct;
  onProductClick: (product: Product) => void;
  formatCurrency: (amount: number) => string;
  featured?: boolean;
}> = ({ product, onProductClick, formatCurrency, featured }) => {
  return (
    <button
      onClick={() => onProductClick(product as Product)}
      disabled={product.stock_quantity !== undefined && product.stock_quantity <= 0}
      className={`
        p-4 rounded-sm border text-left transition-all duration-150
        ${featured
          ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-300 dark:border-primary-700 hover:border-primary-500'
          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
        }
        hover:shadow-lg hover:scale-105 animate-zoom-in duration-fast
        disabled:opacity-50 disabled:cursor-not-allowed
        ${product.stock_quantity !== undefined && product.stock_quantity <= 0 ? 'bg-gray-100 dark:bg-gray-900' : ''}
      `}
    >
      {featured && (
        <div className="absolute top-2 right-2">
          <svg className="w-4 h-4 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </div>
      )}
      <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-sm mb-3 flex items-center justify-center animate-fade-up duration-normal">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover rounded-sm"
          />
        ) : (
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        )}
      </div>
      <h3 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2 mb-1 animate-fade-up duration-light-slow">
        {product.name}
      </h3>
      <p className={`font-bold animate-fade-up duration-slow ${
        featured ? 'text-primary-700 dark:text-primary-300' : 'text-primary-600 dark:text-primary-400'
      }`}>
        {formatCurrency(Number(product.selling_price))}
      </p>
      {product.stock_quantity !== undefined && (
        <p className={`text-xs mt-1 ${
          product.stock_quantity <= 0 ? 'text-danger-500' :
          product.stock_quantity <= 5 ? 'text-warning-500' : 'text-gray-400'
        }`}>
          {product.stock_quantity <= 0 ? 'Sin stock' : `Stock: ${product.stock_quantity}`}
        </p>
      )}
    </button>
  );
};

const ProductsGrid: React.FC<ProductsGridProps> = ({
  searchQuery,
  onSearchChange,
  products,
  loading,
  onProductClick,
  formatCurrency,
}) => {
  // Separate featured and regular products
  const featuredProducts = React.useMemo(() => {
    return products.filter((p) => (p as POSProduct).is_featured === true);
  }, [products]);

  const regularProducts = React.useMemo(() => {
    return products.filter((p) => (p as POSProduct).is_featured !== true);
  }, [products]);

  const showFeatured = !searchQuery && featuredProducts.length > 0;

  return (
    <div className="flex-1 flex flex-col p-4 overflow-hidden animate-fade-right duration-normal">
      {/* Search Bar */}
      <div className="mb-4 animate-fade-down duration-fast">
        <Input
          placeholder="Buscar productos por nombre, SKU o código de barras..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          leftIcon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          }
          rightIcon={
            searchQuery ? (
              <button onClick={() => onSearchChange('')}>
                <svg className="w-5 h-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            ) : undefined
          }
        />
      </div>

      {/* Products Grid */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full animate-zoom-in duration-fast">
            <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 animate-fade-up duration-normal">
            <svg className="w-16 h-16 mb-4 opacity-50 animate-zoom-in duration-light-slow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p>{searchQuery ? 'No se encontraron productos' : 'No hay productos disponibles'}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Featured Products Section */}
            {showFeatured && (
              <div className="animate-fade-down duration-fast">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                    Acceso Rápido
                  </h3>
                  <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 mb-6">
                  {featuredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onProductClick={onProductClick}
                      formatCurrency={formatCurrency}
                      featured={true}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Regular Products Section */}
            {(searchQuery || regularProducts.length > 0) && (
              <div className="animate-fade-up duration-normal">
                {showFeatured && (
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                      Todos los Productos
                    </h3>
                    <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                  </div>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                  {(searchQuery ? products : regularProducts).map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onProductClick={onProductClick}
                      formatCurrency={formatCurrency}
                      featured={false}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsGrid;
