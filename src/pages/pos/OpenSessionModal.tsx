import React, { useState, useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { openSession, loadRegisters } from '../../store/slices/registersSlice';
import { detectShiftType, getShiftLabel, formatTime } from '../../utils/shiftDetection';
import type { Register, OpenSessionData, DenominationBreakdown as DenominationValues } from '../../types';
import DenominationBreakdown from '../../components/shared/DenominationBreakdown';

interface OpenSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const OpenSessionModal: React.FC<OpenSessionModalProps> = ({ isOpen, onClose }) => {
  const dispatch = useAppDispatch();
  const { currentBranch } = useAppSelector((state) => state.auth);
  const { registers, loading } = useAppSelector((state) => state.registers);

  const [selectedRegister, setSelectedRegister] = useState<string>('');
  const [openingAmount, setOpeningAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [useDenominations, setUseDenominations] = useState(true);
  const [denominations, setDenominations] = useState<DenominationValues>({
    bills_1000: 0,
    bills_500: 0,
    bills_200: 0,
    bills_100: 0,
    bills_50: 0,
    bills_20: 0,
    bills_10: 0,
    coins: 0
  });

  // Auto-detect shift type based on current time and branch closing times
  const detectedShiftType = currentBranch ? detectShiftType(currentBranch) : 'FULL_DAY';

  // Calculate total from denominations
  const denominationTotal = useMemo(() => {
    return (
      denominations.bills_1000 * 1000 +
      denominations.bills_500 * 500 +
      denominations.bills_200 * 200 +
      denominations.bills_100 * 100 +
      denominations.bills_50 * 50 +
      denominations.bills_20 * 20 +
      denominations.bills_10 * 10 +
      denominations.coins
    );
  }, [denominations]);

  // Load registers when modal opens
  useEffect(() => {
    if (isOpen && currentBranch?.id) {
      dispatch(loadRegisters(currentBranch.id));
    }
  }, [isOpen, currentBranch?.id, dispatch]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedRegister('');
      setOpeningAmount('');
      setNotes('');
      setDenominations({
        bills_1000: 0,
        bills_500: 0,
        bills_200: 0,
        bills_100: 0,
        bills_50: 0,
        bills_20: 0,
        bills_10: 0,
        coins: 0
      });
    }
  }, [isOpen]);

  // Sync opening amount with denomination total when using denominations
  useEffect(() => {
    if (useDenominations) {
      setOpeningAmount(denominationTotal.toString());
    }
  }, [denominationTotal, useDenominations]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedRegister || !openingAmount) {
      return;
    }

    const openingCash = parseFloat(openingAmount);

    // Validate denomination total matches opening cash if using denominations
    if (useDenominations && Math.abs(denominationTotal - openingCash) > 0.01) {
      alert(`El desglose de billetes ($${denominationTotal.toFixed(2)}) no coincide con el efectivo inicial ($${openingCash.toFixed(2)})`);
      return;
    }

    const sessionData: OpenSessionData = {
      register_id: selectedRegister,
      opening_cash: openingCash,
      shift_type: detectedShiftType,
      opening_notes: notes || undefined,
      opening_denominations: useDenominations ? denominations : undefined
    };

    const result = await dispatch(openSession(sessionData));

    if (openSession.fulfilled.match(result)) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-up duration-fast">
      <div className="bg-white dark:bg-gray-800 rounded-sm shadow-xl max-w-md w-full p-6 animate-zoom-in duration-normal">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Abrir Caja
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

        {currentBranch && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
            <div className="text-sm text-blue-900 dark:text-blue-300">
              <p className="font-semibold mb-1">Turno Detectado Automáticamente:</p>
              <p className="text-lg font-bold">{getShiftLabel(detectedShiftType)}</p>
              {currentBranch.has_shift_change && (
                <p className="text-xs mt-1">
                  Horarios: {formatTime(currentBranch.midday_closing_time)} / {formatTime(currentBranch.evening_closing_time)}
                </p>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Caja *
            </label>
            <select
              value={selectedRegister}
              onChange={(e) => setSelectedRegister(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Seleccione una caja</option>
              {registers
                .filter((r: Register) => r.is_active && !r.current_session_id)
                .map((register: Register) => (
                  <option key={register.id} value={register.id}>
                    {register.name}
                  </option>
                ))}
            </select>
            {registers.length === 0 && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                No hay cajas disponibles
              </p>
            )}
            {registers.every((r: Register) => r.current_session_id) && registers.length > 0 && (
              <p className="mt-1 text-sm text-amber-600 dark:text-amber-400">
                Todas las cajas tienen sesiones abiertas
              </p>
            )}
          </div>

          {/* Toggle for denomination breakdown */}
          <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded">
            <input
              type="checkbox"
              id="useDenominations"
              checked={useDenominations}
              onChange={(e) => setUseDenominations(e.target.checked)}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <label htmlFor="useDenominations" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Usar desglose de billetes y monedas
            </label>
          </div>

          {!useDenominations && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Efectivo Inicial * (ARS)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={openingAmount}
                onChange={(e) => setOpeningAmount(e.target.value)}
                placeholder="0.00"
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          )}

          {useDenominations && (
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-sm bg-gray-50 dark:bg-gray-800">
              <DenominationBreakdown
                values={denominations}
                onChange={setDenominations}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notas (opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Observaciones de apertura..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !selectedRegister || !openingAmount}
              className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Abriendo...' : 'Abrir Caja'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OpenSessionModal;
