import React, { useState, useEffect, useMemo } from 'react';
import { useAppDispatch } from '../../store';
import { closeSession } from '../../store/slices/registersSlice';
import type { RegisterSession, CloseSessionData, DenominationBreakdown as DenominationValues } from '../../types';
import DenominationBreakdown from '../../components/shared/DenominationBreakdown';
import { MdClose, MdWarning } from 'react-icons/md';

interface CloseSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: RegisterSession | null;
}

const CloseSessionModal: React.FC<CloseSessionModalProps> = ({ isOpen, onClose, session }) => {
  const dispatch = useAppDispatch();

  const [declaredCash, setDeclaredCash] = useState('');
  const [declaredCard, setDeclaredCard] = useState('');
  const [declaredQr, setDeclaredQr] = useState('');
  const [declaredTransfer, setDeclaredTransfer] = useState('');
  const [closingNotes, setClosingNotes] = useState('');
  const [useDenominations, setUseDenominations] = useState(true);
  const [closingDenominations, setClosingDenominations] = useState<DenominationValues>({
    bills_20000: 0,
    bills_10000: 0,
    bills_2000: 0,
    bills_1000: 0,
    bills_500: 0,
    bills_200: 0,
    bills_100: 0,
    bills_50: 0,
    coins: 0
  });

  // Calculate total from denominations (Argentina 2024 bills)
  const denominationTotal = useMemo(() => {
    return (
      closingDenominations.bills_20000 * 20000 +
      closingDenominations.bills_10000 * 10000 +
      closingDenominations.bills_2000 * 2000 +
      closingDenominations.bills_1000 * 1000 +
      closingDenominations.bills_500 * 500 +
      closingDenominations.bills_200 * 200 +
      closingDenominations.bills_100 * 100 +
      closingDenominations.bills_50 * 50 +
      closingDenominations.coins
    );
  }, [closingDenominations]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setDeclaredCash('');
      setDeclaredCard('');
      setDeclaredQr('');
      setDeclaredTransfer('');
      setClosingNotes('');
      setClosingDenominations({
        bills_20000: 0,
        bills_10000: 0,
        bills_2000: 0,
        bills_1000: 0,
        bills_500: 0,
        bills_200: 0,
        bills_100: 0,
        bills_50: 0,
        coins: 0
      });
    }
  }, [isOpen]);

  // Sync declared cash with denomination total when using denominations
  useEffect(() => {
    if (useDenominations) {
      setDeclaredCash(denominationTotal.toString());
    }
  }, [denominationTotal, useDenominations]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session) return;

    const cashAmount = parseFloat(declaredCash);
    const cardAmount = parseFloat(declaredCard) || 0;
    const qrAmount = parseFloat(declaredQr) || 0;
    const transferAmount = parseFloat(declaredTransfer) || 0;

    // Validate denomination total matches declared cash if using denominations
    if (useDenominations && Math.abs(denominationTotal - cashAmount) > 0.01) {
      alert(`El desglose de billetes ($${denominationTotal.toFixed(2)}) no coincide con el efectivo declarado ($${cashAmount.toFixed(2)})`);
      return;
    }

    const closeData: CloseSessionData = {
      declared_cash: cashAmount,
      declared_card: cardAmount,
      declared_qr: qrAmount,
      declared_transfer: transferAmount,
      closing_notes: closingNotes || undefined,
      closing_denominations: useDenominations ? closingDenominations : undefined
    };

    const result = await dispatch(closeSession({ session_id: session.id, data: closeData }));

    if (closeSession.fulfilled.match(result)) {
      onClose();
    }
  };

  if (!isOpen || !session) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 animate-fade-up duration-fast overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-sm shadow-xl max-w-3xl w-full p-6 my-8 animate-zoom-in duration-normal max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Cierre Ciego de Caja
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Sesión: {session.session_number}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <MdClose className="w-6 h-6" />
          </button>
        </div>

        {/* WARNING: Blind closing */}
        <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded">
          <div className="flex items-start gap-3">
            <MdWarning className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-yellow-800 dark:text-yellow-300 mb-1">
                Cierre Ciego - Importante
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-400">
                Ingrese los montos declarados SIN consultar el sistema. El sistema calculará las diferencias automáticamente.
                Asegúrese de contar físicamente el efectivo y desglosar por billetes.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Declared amounts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Efectivo Declarado * (ARS)
              </label>
              {!useDenominations && (
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={declaredCash}
                  onChange={(e) => setDeclaredCash(e.target.value)}
                  placeholder="0.00"
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              )}
              {useDenominations && (
                <div className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-sm bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white font-semibold">
                  ${parseFloat(declaredCash || '0').toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tarjeta Declarada (ARS)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={declaredCard}
                onChange={(e) => setDeclaredCard(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                QR Declarado (ARS)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={declaredQr}
                onChange={(e) => setDeclaredQr(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Transferencia Declarada (ARS)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={declaredTransfer}
                onChange={(e) => setDeclaredTransfer(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Toggle for denomination breakdown */}
          <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded">
            <input
              type="checkbox"
              id="useClosingDenominations"
              checked={useDenominations}
              onChange={(e) => setUseDenominations(e.target.checked)}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <label htmlFor="useClosingDenominations" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Usar desglose de billetes y monedas para efectivo
            </label>
          </div>

          {/* Cash denomination breakdown */}
          {useDenominations && (
            <div className="p-4 border border-primary-200 dark:border-primary-700 rounded-sm bg-primary-50 dark:bg-primary-900/10">
              <DenominationBreakdown
                values={closingDenominations}
                onChange={setClosingDenominations}
              />
            </div>
          )}

          {/* Closing notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notas de Cierre
            </label>
            <textarea
              value={closingNotes}
              onChange={(e) => setClosingNotes(e.target.value)}
              rows={3}
              placeholder="Observaciones del cierre de caja..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-sm transition-colors font-medium"
            >
              Cerrar Caja
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CloseSessionModal;
