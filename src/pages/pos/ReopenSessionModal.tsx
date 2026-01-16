import React, { useState, useEffect } from 'react';
import type { RegisterSession, UUID } from '../../types';
import { MdClose, MdWarning } from 'react-icons/md';

interface ReopenSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (sessionId: UUID, reason: string, managerPin: string) => Promise<void>;
  session: RegisterSession | null;
}

const ReopenSessionModal: React.FC<ReopenSessionModalProps> = ({ isOpen, onClose, onSubmit, session }) => {
  const [reason, setReason] = useState('');
  const [managerPin, setManagerPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when modal closes or session changes
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

    if (!session) {
      setError('No se encontró la sesión');
      return;
    }

    if (!reason.trim()) {
      setError('Debe ingresar un motivo para la reapertura');
      return;
    }

    if (!managerPin.trim()) {
      setError('Se requiere PIN de supervisor para reabrir la sesión');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(session.id, reason.trim(), managerPin.trim());
      onClose();
    } catch (err: any) {
      console.error('Error reopening session:', err);
      setError(err.response?.data?.message || err.message || 'Error al reabrir la sesión');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !session) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-up duration-fast">
      <div className="bg-white dark:bg-gray-800 rounded-sm shadow-xl max-w-md w-full p-6 animate-zoom-in duration-normal">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-warning-600 dark:text-warning-400">
            Reabrir Sesión de Caja
          </h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <MdClose className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-4 p-4 bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-700 rounded">
          <div className="flex items-start">
            <MdWarning className="w-6 h-6 text-warning-600 dark:text-warning-400 mr-2 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-warning-800 dark:text-warning-300 mb-1">
                ADVERTENCIA: Acción Crítica
              </p>
              <p className="text-sm text-warning-700 dark:text-warning-400">
                La reapertura de una sesión cerrada es una acción excepcional que quedará registrada en el sistema y generará una alerta de alta prioridad para el propietario.
              </p>
            </div>
          </div>
        </div>

        {/* Session details */}
        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-400">Sesión:</span>
              <span className="ml-2 font-medium text-gray-900 dark:text-white">
                {session.session_number}
              </span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Turno:</span>
              <span className="ml-2 font-medium text-gray-900 dark:text-white">
                {session.shift_type === 'MORNING' ? 'Mañana' :
                 session.shift_type === 'AFTERNOON' ? 'Tarde' : 'Completo'}
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-gray-600 dark:text-gray-400">Cerrada el:</span>
              <span className="ml-2 font-medium text-gray-900 dark:text-white">
                {session.closed_at ? new Date(session.closed_at).toLocaleString('es-AR') : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Motivo de Reapertura *
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Describa el motivo detalladamente (ej: Corregir venta, Agregar transacción faltante, etc.)"
              required
              rows={4}
              disabled={loading}
              maxLength={500}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-warning-500 focus:border-transparent resize-none disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {reason.length}/500 caracteres
            </p>
          </div>

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
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-warning-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Se requiere autorización de supervisor con permiso para reabrir sesiones cerradas.
            </p>
          </div>

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
              disabled={loading || !reason.trim() || !managerPin.trim()}
              className="flex-1 px-4 py-2 bg-warning-600 hover:bg-warning-700 text-white rounded-sm transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Reabriendo...' : 'Reabrir Sesión'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReopenSessionModal;
