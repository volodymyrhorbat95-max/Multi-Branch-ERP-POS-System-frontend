import React, { useState, useEffect } from 'react';
import { useAppSelector } from '../../store';
import type { Sale, UUID } from '../../types';
import { MdClose, MdWarning } from 'react-icons/md';

interface CancelSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (saleId: UUID, reason: string, managerPin?: string) => Promise<void>;
  sale: Sale | null;
}

const CancelSaleModal: React.FC<CancelSaleModalProps> = ({ isOpen, onClose, onSubmit, sale }) => {
  const [reason, setReason] = useState('');
  const [managerPin, setManagerPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAppSelector((state) => state.auth);

  // Check if user has cancel permission
  const canCancelSale = user?.role?.can_void_sale ?? false; // Backend still uses void permission name
  const requiresManagerPin = !canCancelSale;

  // Reset form when modal closes or sale changes
  useEffect(() => {
    if (!isOpen) {
      setReason('');
      setManagerPin('');
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!sale) {
      setError('No se encontró la venta');
      return;
    }

    if (!reason.trim()) {
      setError('Debe ingresar un motivo para la cancelación');
      return;
    }

    if (requiresManagerPin && !managerPin.trim()) {
      setError('Se requiere PIN de supervisor para cancelar esta venta');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(
        sale.id,
        reason.trim(),
        requiresManagerPin ? managerPin.trim() : undefined
      );
      onClose();
    } catch (err: any) {
      console.error('Error voiding sale:', err);
      setError(err.response?.data?.message || err.message || 'Error al cancelar la venta');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !sale) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 animate-fade-up duration-fast">
      <div className="bg-white dark:bg-gray-800 rounded-sm shadow-xl max-w-md w-full p-6 animate-zoom-in duration-normal">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400">
            Cancelar Venta
          </h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <MdClose className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded">
          <div className="flex items-start">
            <MdWarning className="w-6 h-6 text-red-600 dark:text-red-400 mr-2 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-800 dark:text-red-300 mb-1">
                ADVERTENCIA: Esta acción es irreversible
              </p>
              <p className="text-sm text-red-700 dark:text-red-400">
                La venta será cancelada y se restaurará el stock. Esta acción quedará registrada en el sistema y generará una alerta para el propietario.
              </p>
            </div>
          </div>
        </div>

        {/* Sale details */}
        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-400">Venta:</span>
              <span className="ml-2 font-medium text-gray-900 dark:text-white">
                {sale.sale_number}
              </span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Total:</span>
              <span className="ml-2 font-medium text-gray-900 dark:text-white">
                ${parseFloat(String(sale.total_amount)).toFixed(2)}
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-gray-600 dark:text-gray-400">Fecha:</span>
              <span className="ml-2 font-medium text-gray-900 dark:text-white">
                {new Date(sale.created_at).toLocaleString('es-AR')}
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Motivo de Anulación *
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Describa el motivo de la cancelación (ej: Cliente solicitó cancelación, Error en el registro, etc.)"
              required
              rows={4}
              disabled={loading}
              maxLength={500}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {reason.length}/500 caracteres
            </p>
          </div>

          {requiresManagerPin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                PIN de Supervisor *
              </label>
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                value={managerPin}
                onChange={(e) => setManagerPin(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="Ingrese PIN de 4 dígitos"
                required
                maxLength={4}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                No tiene permisos para cancelar ventas. Se requiere autorización de supervisor.
              </p>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded">
              <p className="text-sm text-red-800 dark:text-red-300">
                {error}
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !reason.trim() || (requiresManagerPin && !managerPin.trim())}
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-sm transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Cancelando...' : 'Anular Venta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CancelSaleModal;
