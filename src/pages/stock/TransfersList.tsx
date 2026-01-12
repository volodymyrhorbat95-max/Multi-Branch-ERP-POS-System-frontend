import React from 'react';
import { Card, Button } from '../../components/ui';
import type { StockTransfer, StockTransferStatus } from '../../types';

interface TransfersListProps {
  transfers: StockTransfer[];
  loading: boolean;
  onViewDetails: (transfer: StockTransfer) => void;
  onApprove?: (transferId: string) => void;
  onReceive?: (transferId: string) => void;
  onCancel?: (transferId: string) => void;
}

const TransfersList: React.FC<TransfersListProps> = ({
  transfers,
  loading,
  onViewDetails,
  onApprove,
  onReceive,
  onCancel
}) => {
  const formatDateTime = (date: string | undefined) => {
    if (!date) return '-';
    return new Date(date).toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusStyle = (status: StockTransferStatus) => {
    const styles: Record<StockTransferStatus, { label: string; className: string }> = {
      PENDING: {
        label: 'Pendiente',
        className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
      },
      APPROVED: {
        label: 'Aprobado',
        className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
      },
      IN_TRANSIT: {
        label: 'En tránsito',
        className: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
      },
      RECEIVED: {
        label: 'Recibido',
        className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      },
      CANCELLED: {
        label: 'Cancelado',
        className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
      }
    };
    return styles[status];
  };

  const getTotalItems = (transfer: StockTransfer) => {
    if (!transfer.items || transfer.items.length === 0) return 0;
    return transfer.items.reduce((sum, item) => sum + item.requested_quantity, 0);
  };

  const canApprove = (transfer: StockTransfer) => {
    return transfer.status === 'PENDING' && onApprove;
  };

  const canReceive = (transfer: StockTransfer) => {
    return transfer.status === 'IN_TRANSIT' && onReceive;
  };

  const canCancel = (transfer: StockTransfer) => {
    return (transfer.status === 'PENDING' || transfer.status === 'IN_TRANSIT') && onCancel;
  };

  return (
    <Card className="overflow-hidden animate-zoom-in duration-normal">
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
        </div>
      ) : transfers.length === 0 ? (
        <div className="text-center py-12 text-gray-500 animate-fade-up duration-normal">
          <p>No hay traslados registrados</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800 animate-fade-down duration-fast">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Número
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Desde
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Hacia
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Fecha
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {transfers.map((transfer) => {
                const statusStyle = getStatusStyle(transfer.status);
                return (
                  <tr
                    key={transfer.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 animate-fade-up duration-fast"
                  >
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm font-medium text-gray-900 dark:text-white">
                        {transfer.transfer_number}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {transfer.source_branch?.name || 'Sucursal Origen'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {transfer.destination_branch?.name || 'Sucursal Destino'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusStyle.className}`}>
                        {statusStyle.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm text-gray-900 dark:text-white font-medium">
                        {transfer.items?.length || 0} productos
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div>{formatDateTime(transfer.requested_at)}</div>
                      {transfer.status === 'IN_TRANSIT' && transfer.shipped_at && (
                        <div className="text-xs text-gray-400">
                          Enviado: {formatDateTime(transfer.shipped_at)}
                        </div>
                      )}
                      {transfer.status === 'RECEIVED' && transfer.received_at && (
                        <div className="text-xs text-gray-400">
                          Recibido: {formatDateTime(transfer.received_at)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => onViewDetails(transfer)}
                        >
                          Ver
                        </Button>
                        {canApprove(transfer) && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => onApprove!(transfer.id)}
                          >
                            Aprobar
                          </Button>
                        )}
                        {canReceive(transfer) && (
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => onReceive!(transfer.id)}
                          >
                            Recibir
                          </Button>
                        )}
                        {canCancel(transfer) && (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => onCancel!(transfer.id)}
                          >
                            Cancelar
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
};

export default TransfersList;
