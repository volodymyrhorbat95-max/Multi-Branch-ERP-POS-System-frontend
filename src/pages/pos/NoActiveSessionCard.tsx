import React from 'react';
import { Card, Button } from '../../components/ui';
import { MdWarning } from 'react-icons/md';

interface NoActiveSessionCardProps {
  onOpenSession: () => void;
  onNavigateToSessions: () => void;
}

const NoActiveSessionCard: React.FC<NoActiveSessionCardProps> = ({
  onOpenSession,
  onNavigateToSessions
}) => {
  return (
    <div className="fixed inset-0 z-[100] bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4 animate-fade-up duration-fast">
      <Card className="max-w-md w-full p-8 text-center animate-zoom-in duration-normal relative z-10">
        <div className="w-16 h-16 bg-warning-100 dark:bg-warning-900/20 rounded-full mx-auto mb-4 flex items-center justify-center animate-flip-down duration-light-slow">
          <MdWarning className="w-8 h-8 text-warning-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 animate-fade-up duration-normal">
          No hay sesión activa
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6 animate-fade-up duration-light-slow">
          Debes abrir una sesión de caja antes de realizar ventas.
        </p>
        <div className="flex flex-col gap-3 animate-fade-up duration-slow">
          <Button
            variant="primary"
            size="lg"
            onClick={onOpenSession}
            className="w-full"
          >
            Abrir Caja
          </Button>
          <Button
            variant="secondary"
            size="md"
            onClick={onNavigateToSessions}
            className="w-full"
          >
            Ver Historial de Sesiones
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default NoActiveSessionCard;
