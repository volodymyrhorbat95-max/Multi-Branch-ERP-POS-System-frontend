import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { Modal, Button, Input } from '../../components/ui';
import ManagerPinModal from './ManagerPinModal';

interface DiscountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (discountType: 'PERCENT' | 'FIXED', value: number, reason: string, managerPin?: string) => void;
  currentTotal: number;
  currentDiscountType?: 'PERCENT' | 'FIXED';
  currentDiscountValue?: number;
  currentDiscountReason?: string;
}

const DiscountModal: React.FC<DiscountModalProps> = ({
  isOpen,
  onClose,
  onApply,
  currentTotal,
  currentDiscountType,
  currentDiscountValue,
  currentDiscountReason,
}) => {
  const { user } = useSelector((state: RootState) => state.auth);

  const [discountType, setDiscountType] = useState<'PERCENT' | 'FIXED'>(currentDiscountType || 'PERCENT');
  const [discountValue, setDiscountValue] = useState<string>(currentDiscountValue?.toString() || '');
  const [reason, setReason] = useState<string>(currentDiscountReason || '');
  const [error, setError] = useState('');

  // Manager PIN modal state
  const [showManagerPinModal, setShowManagerPinModal] = useState(false);
  const [pendingDiscount, setPendingDiscount] = useState<{
    type: 'PERCENT' | 'FIXED';
    value: number;
    reason: string;
  } | null>(null);

  // User permissions
  const canGiveDiscount = user?.role?.can_give_discount ?? false;
  const maxDiscountPercent = user?.role?.max_discount_percent ? Number(user.role.max_discount_percent) : 0;

  useEffect(() => {
    if (isOpen) {
      setDiscountType(currentDiscountType || 'PERCENT');
      setDiscountValue(currentDiscountValue?.toString() || '');
      setReason(currentDiscountReason || '');
      setError('');
    }
  }, [isOpen, currentDiscountType, currentDiscountValue, currentDiscountReason]);

  // Calculate discount amount and percentage
  const calculateDiscountDetails = (type: 'PERCENT' | 'FIXED', value: number) => {
    if (type === 'PERCENT') {
      return {
        percent: value,
        amount: (currentTotal * value) / 100,
      };
    } else {
      return {
        percent: (value / currentTotal) * 100,
        amount: value,
      };
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!canGiveDiscount) {
      setError('No tienes permiso para aplicar descuentos');
      return;
    }

    const value = parseFloat(discountValue);
    if (isNaN(value) || value <= 0) {
      setError('Ingresa un valor de descuento válido');
      return;
    }

    if (discountType === 'PERCENT' && value > 100) {
      setError('El porcentaje no puede ser mayor a 100%');
      return;
    }

    if (discountType === 'FIXED' && value > currentTotal) {
      setError('El descuento no puede ser mayor al total');
      return;
    }

    if (!reason || reason.trim() === '') {
      setError('Debes proporcionar una razón para el descuento');
      return;
    }

    const discountDetails = calculateDiscountDetails(discountType, value);

    // Check if discount exceeds user's limit
    if (discountDetails.percent > maxDiscountPercent) {
      // Need manager approval
      setPendingDiscount({ type: discountType, value, reason });
      setShowManagerPinModal(true);
      return;
    }

    // Apply discount directly (within user's limit)
    onApply(discountType, value, reason);
    handleClose();
  };

  const handleManagerPinSubmit = (pin: string) => {
    if (!pendingDiscount) return;

    // Apply discount with manager PIN
    onApply(
      pendingDiscount.type,
      pendingDiscount.value,
      pendingDiscount.reason,
      pin
    );

    setShowManagerPinModal(false);
    setPendingDiscount(null);
    handleClose();
  };

  const handleClose = () => {
    setDiscountValue('');
    setReason('');
    setError('');
    setPendingDiscount(null);
    onClose();
  };

  // Calculate preview values
  const previewValue = parseFloat(discountValue) || 0;
  const previewDetails = previewValue > 0 ? calculateDiscountDetails(discountType, previewValue) : null;
  const requiresApproval = previewDetails && previewDetails.percent > maxDiscountPercent;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title="Aplicar Descuento"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Permission Warning */}
          {!canGiveDiscount && (
            <div className="bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-700 rounded-sm p-4 animate-fade-down duration-fast">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-danger-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-danger-800 dark:text-danger-200">
                    Sin permisos para aplicar descuentos
                  </p>
                  <p className="text-xs text-danger-600 dark:text-danger-300 mt-1">
                    Contacta a tu supervisor para aplicar descuentos.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Current Total */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-sm p-4 animate-fade-up duration-fast">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total actual:</span>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(currentTotal)}
              </span>
            </div>
          </div>

          {/* Discount Type Selection */}
          <div className="animate-fade-up duration-normal">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Tipo de descuento
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDiscountType('PERCENT')}
                className={`px-4 py-3 rounded-sm border-2 transition-all ${
                  discountType === 'PERCENT'
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <span className="font-medium">Porcentaje (%)</span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setDiscountType('FIXED')}
                className={`px-4 py-3 rounded-sm border-2 transition-all ${
                  discountType === 'FIXED'
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">Monto Fijo ($)</span>
                </div>
              </button>
            </div>
          </div>

          {/* Discount Value Input */}
          <div className="animate-fade-up duration-light-slow">
            <label htmlFor="discountValue" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {discountType === 'PERCENT' ? 'Porcentaje de descuento' : 'Monto de descuento'}
            </label>
            <div className="relative">
              <Input
                id="discountValue"
                type="number"
                step={discountType === 'PERCENT' ? '0.1' : '0.01'}
                min="0"
                max={discountType === 'PERCENT' ? '100' : currentTotal.toString()}
                value={discountValue}
                onChange={(e) => {
                  setDiscountValue(e.target.value);
                  setError('');
                }}
                placeholder={discountType === 'PERCENT' ? 'Ej: 10' : 'Ej: 500.00'}
                disabled={!canGiveDiscount}
                className="text-right pr-12"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                {discountType === 'PERCENT' ? '%' : '$'}
              </span>
            </div>

            {/* User Limit Info */}
            {canGiveDiscount && (
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Tu límite: hasta {maxDiscountPercent}%
                {requiresApproval && (
                  <span className="text-warning-600 dark:text-warning-400 ml-1">
                    (Requerirá aprobación de supervisor)
                  </span>
                )}
              </p>
            )}
          </div>

          {/* Discount Reason */}
          <div className="animate-fade-up duration-slow">
            <label htmlFor="discountReason" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Motivo del descuento <span className="text-danger-500">*</span>
            </label>
            <textarea
              id="discountReason"
              rows={3}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setError('');
              }}
              placeholder="Ej: Cliente frecuente, Producto con imperfección, Promoción especial..."
              disabled={!canGiveDiscount}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed resize-none"
              maxLength={255}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-right">
              {reason.length}/255 caracteres
            </p>
          </div>

          {/* Preview */}
          {previewDetails && previewDetails.percent > 0 && (
            <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-700 rounded-sm p-4 space-y-2 animate-zoom-in duration-normal">
              <p className="text-sm font-medium text-primary-900 dark:text-primary-100">
                Vista previa del descuento:
              </p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between text-gray-700 dark:text-gray-300">
                  <span>Descuento:</span>
                  <span className="font-medium">
                    {discountType === 'PERCENT' ? `${previewDetails.percent.toFixed(1)}%` : formatCurrency(previewDetails.amount)}
                    {discountType === 'FIXED' && (
                      <span className="text-xs ml-1">({previewDetails.percent.toFixed(1)}%)</span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-gray-700 dark:text-gray-300">
                  <span>Monto descontado:</span>
                  <span className="font-medium text-danger-600 dark:text-danger-400">
                    -{formatCurrency(previewDetails.amount)}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold text-primary-700 dark:text-primary-300 pt-2 border-t border-primary-200 dark:border-primary-700">
                  <span>Nuevo total:</span>
                  <span>{formatCurrency(currentTotal - previewDetails.amount)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-700 rounded-sm p-3 animate-fade-down duration-fast">
              <p className="text-sm text-danger-700 dark:text-danger-300">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end animate-fade-up duration-very-slow">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={!canGiveDiscount || !discountValue || !reason || parseFloat(discountValue) <= 0}
            >
              {requiresApproval ? 'Solicitar Aprobación' : 'Aplicar Descuento'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Manager PIN Modal */}
      <ManagerPinModal
        isOpen={showManagerPinModal}
        onClose={() => {
          setShowManagerPinModal(false);
          setPendingDiscount(null);
        }}
        onSubmit={handleManagerPinSubmit}
        message={`Este descuento (${previewDetails?.percent.toFixed(1)}%) excede tu límite (${maxDiscountPercent}%). Ingresa el PIN de un supervisor para continuar.`}
      />
    </>
  );
};

export default DiscountModal;
