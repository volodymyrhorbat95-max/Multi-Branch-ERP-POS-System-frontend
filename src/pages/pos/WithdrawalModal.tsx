import React, { useState, useEffect } from 'react';
import type { WithdrawalType, CreateWithdrawalData } from '../../types';

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateWithdrawalData) => Promise<void>;
  sessionId: string;
}

const WithdrawalModal: React.FC<WithdrawalModalProps> = ({ isOpen, onClose, onSubmit, sessionId }) => {
  const [amount, setAmount] = useState('');
  const [withdrawalType, setWithdrawalType] = useState<WithdrawalType>('SUPPLIER_PAYMENT');
  const [recipientName, setRecipientName] = useState('');
  const [reason, setReason] = useState('');
  const [receiptNumber, setReceiptNumber] = useState('');
  const [loading, setLoading] = useState(false);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setAmount('');
      setWithdrawalType('SUPPLIER_PAYMENT');
      setRecipientName('');
      setReason('');
      setReceiptNumber('');
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || !recipientName || !reason) {
      return;
    }

    const withdrawalData: CreateWithdrawalData = {
      amount: parseFloat(amount),
      withdrawal_type: withdrawalType,
      recipient_name: recipientName,
      reason,
      receipt_number: receiptNumber || undefined
    };

    setLoading(true);
    try {
      await onSubmit(withdrawalData);
      onClose();
    } catch (error) {
      console.error('Error creating withdrawal:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const withdrawalTypeLabels: Record<WithdrawalType, string> = {
    SUPPLIER_PAYMENT: 'Pago a Proveedor',
    EMPLOYEE_ADVANCE: 'Adelanto a Empleado',
    OPERATIONAL_EXPENSE: 'Gasto Operativo',
    OTHER: 'Otro'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-up duration-fast">
      <div className="bg-white dark:bg-gray-800 rounded-sm shadow-xl max-w-md w-full p-6 animate-zoom-in duration-normal">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Registrar Retiro de Efectivo
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            Este retiro se restará del efectivo esperado al momento del cierre de caja.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Monto * (ARS)
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tipo de Retiro *
            </label>
            <select
              value={withdrawalType}
              onChange={(e) => setWithdrawalType(e.target.value as WithdrawalType)}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {Object.entries(withdrawalTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Beneficiario *
            </label>
            <input
              type="text"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="Nombre de la persona o empresa"
              required
              maxLength={200}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Motivo *
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Descripción detallada del motivo del retiro..."
              required
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Número de Recibo (opcional)
            </label>
            <input
              type="text"
              value={receiptNumber}
              onChange={(e) => setReceiptNumber(e.target.value)}
              placeholder="Ej: FAC-001234"
              maxLength={50}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

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
              disabled={loading}
              className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-sm transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Registrando...' : 'Registrar Retiro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WithdrawalModal;
