import React, { useState } from 'react';
import { Modal, Button, Input } from '../../components/ui';
import { MdWarning } from 'react-icons/md';

interface ManagerPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (pin: string) => void;
  title?: string;
  message?: string;
}

const ManagerPinModal: React.FC<ManagerPinModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title = 'Autorización de Supervisor',
  message = 'Este descuento excede tu límite. Ingresa el PIN de un supervisor para continuar.',
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!pin || pin.trim() === '') {
      setError('Debes ingresar el PIN del supervisor');
      return;
    }

    if (pin.length < 4) {
      setError('El PIN debe tener al menos 4 dígitos');
      return;
    }

    onSubmit(pin);
    setPin('');
    setError('');
  };

  const handleClose = () => {
    setPin('');
    setError('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Message */}
        <div className="bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-700 rounded-sm p-4 animate-fade-down duration-fast">
          <div className="flex items-start gap-3">
            <MdWarning className="w-6 h-6 text-warning-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-warning-800 dark:text-warning-200">
              {message}
            </p>
          </div>
        </div>

        {/* PIN Input */}
        <div className="animate-fade-up duration-normal">
          <label htmlFor="managerPin" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            PIN de Supervisor
          </label>
          <Input
            id="managerPin"
            type="password"
            inputMode="numeric"
            maxLength={6}
            value={pin}
            onChange={(e) => {
              setPin(e.target.value);
              setError('');
            }}
            placeholder="Ingresa el PIN"
            autoFocus
            className="text-center text-2xl tracking-widest"
          />
          {error && (
            <p className="mt-2 text-sm text-danger-500 animate-fade-down duration-fast">
              {error}
            </p>
          )}
        </div>

        {/* Instructions */}
        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1 animate-fade-up duration-light-slow">
          <p>• El supervisor debe tener permisos suficientes para aprobar este descuento</p>
          <p>• El PIN es de 4-6 dígitos numéricos</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end animate-fade-up duration-slow">
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
            disabled={!pin || pin.length < 4}
          >
            Autorizar
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ManagerPinModal;
