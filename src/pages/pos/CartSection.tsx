import React from 'react';
import { Button } from '../../components/ui';
import type { CartItem, Customer } from '../../types';
import { MdClose, MdPerson, MdShoppingCart, MdRemove, MdAdd, MdDelete, MdLocalOffer } from 'react-icons/md';

interface Totals {
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
}

interface CartSectionProps {
  customer: Customer | null;
  cart: CartItem[];
  totals: Totals;
  onAddCustomer: () => void;
  onRemoveCustomer: () => void;
  onQuantityChange: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onClearCart: () => void;
  onProceedToPayment: () => void;
  onApplyDiscount?: () => void;
  onRemoveDiscount?: () => void;
  formatCurrency: (amount: number) => string;
}

const CartSection: React.FC<CartSectionProps> = ({
  customer,
  cart,
  totals,
  onAddCustomer,
  onRemoveCustomer,
  onQuantityChange,
  onRemoveItem,
  onClearCart,
  onProceedToPayment,
  onApplyDiscount,
  onRemoveDiscount,
  formatCurrency,
}) => {
  return (
    <div className="w-96 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col animate-fade-left duration-normal">
      {/* Customer Section */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 animate-fade-down duration-fast">
        {customer ? (
          <div className="flex items-center justify-between animate-zoom-in duration-fast">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center animate-flip-down duration-normal">
                <span className="text-primary-600 dark:text-primary-400 font-semibold text-sm">
                  {customer.first_name?.[0]}{customer.last_name?.[0]}
                </span>
              </div>
              <div className="animate-fade-right duration-normal">
                <p className="font-medium text-gray-900 dark:text-white">
                  {customer.first_name} {customer.last_name}
                </p>
                {customer.loyalty_points !== undefined && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {customer.loyalty_points} puntos
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={onRemoveCustomer}
              className="p-2 text-gray-400 hover:text-danger-500 animate-fade-left duration-light-slow"
            >
              <MdClose className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <button
            onClick={onAddCustomer}
            className="w-full flex items-center gap-3 px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-sm hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-colors animate-fade-up duration-normal"
          >
            <MdPerson className="w-5 h-5 text-gray-400" />
            <span className="text-gray-500 dark:text-gray-400">Agregar cliente</span>
          </button>
        )}
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto p-4">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 animate-fade-up duration-normal">
            <MdShoppingCart className="w-16 h-16 mb-4 opacity-50 animate-zoom-in duration-light-slow" />
            <p className="animate-fade-up duration-slow">Carrito vacío</p>
            <p className="text-sm animate-fade-up duration-very-slow">Agrega productos para comenzar</p>
          </div>
        ) : (
          <div className="space-y-3 animate-fade-up duration-fast">
            {cart.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-sm animate-fade-right duration-normal"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white truncate">
                    {item.product.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formatCurrency(Number(item.unit_price))} c/u
                  </p>
                </div>

                {/* Quantity controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onQuantityChange(item.id, item.quantity - 1)}
                    className="w-8 h-8 flex items-center justify-center bg-gray-200 dark:bg-gray-600 rounded-sm hover:bg-gray-300 dark:hover:bg-gray-500"
                  >
                    <MdRemove className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-medium text-gray-900 dark:text-white">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => onQuantityChange(item.id, item.quantity + 1)}
                    className="w-8 h-8 flex items-center justify-center bg-gray-200 dark:bg-gray-600 rounded-sm hover:bg-gray-300 dark:hover:bg-gray-500"
                  >
                    <MdAdd className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-right w-24">
                  <p className="font-bold text-gray-900 dark:text-white">
                    {formatCurrency(Number(item.total))}
                  </p>
                </div>

                <button
                  onClick={() => onRemoveItem(item.id)}
                  className="p-2 text-gray-400 hover:text-danger-500"
                >
                  <MdDelete className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Totals and Actions */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-4 animate-fade-up duration-normal">
        {/* Totals */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 animate-fade-right duration-fast">
            <span>Subtotal</span>
            <span>{formatCurrency(totals.subtotal)}</span>
          </div>

          {/* Discount Section */}
          {totals.discount > 0 ? (
            <div className="flex justify-between items-center text-sm animate-fade-right duration-normal">
              <div className="flex items-center gap-2">
                <span className="text-green-600 dark:text-green-400">Descuento</span>
                {onRemoveDiscount && (
                  <button
                    onClick={onRemoveDiscount}
                    className="p-1 text-gray-400 hover:text-danger-500 transition-colors"
                    title="Quitar descuento"
                  >
                    <MdClose className="w-4 h-4" />
                  </button>
                )}
              </div>
              <span className="text-green-600 dark:text-green-400 font-medium">
                -{formatCurrency(totals.discount)}
              </span>
            </div>
          ) : (
            onApplyDiscount && cart.length > 0 && (
              <button
                onClick={onApplyDiscount}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 border border-primary-300 dark:border-primary-700 rounded-sm transition-colors animate-fade-right duration-normal"
              >
                <MdLocalOffer className="w-4 h-4" />
                <span>Aplicar descuento</span>
              </button>
            )
          )}

          <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 animate-fade-right duration-light-slow">
            <span>IVA</span>
            <span>{formatCurrency(totals.tax)}</span>
          </div>
          <div className="flex justify-between text-xl font-bold text-gray-900 dark:text-white pt-2 border-t border-gray-200 dark:border-gray-700 animate-fade-up duration-slow">
            <span>Total</span>
            <span>{formatCurrency(totals.total)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 animate-zoom-in duration-normal">
          <Button
            variant="secondary"
            onClick={onClearCart}
            disabled={cart.length === 0}
          >
            Limpiar
          </Button>
          <Button
            variant="primary"
            onClick={onProceedToPayment}
            disabled={cart.length === 0}
          >
            Cobrar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CartSection;
