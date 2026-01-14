import React, { useState, useEffect } from 'react';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import { syncService } from '../../services/api/sync.service';
import { useAppSelector } from '../../store';
import { showToast } from '../../store/slices/uiSlice';
import { useAppDispatch } from '../../store';
import type { UUID } from '../../types';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import MergeTypeIcon from '@mui/icons-material/MergeType';

interface Conflict {
  id: UUID;
  local_id: string;
  entity_type: string;
  conflict_type: string;
  error_message: string;
  local_created_at: string;
  retry_count: number;
  branch: {
    id: UUID;
    name: string;
    code: string;
  };
  payload: any;
}

interface ConflictResolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResolved: () => void;
}

const ConflictResolutionModal: React.FC<ConflictResolutionModalProps> = ({
  isOpen,
  onClose,
  onResolved,
}) => {
  const dispatch = useAppDispatch();
  const { currentBranch } = useAppSelector((state) => state.auth);

  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [loading, setLoading] = useState(false);
  const [resolving, setResolving] = useState<UUID | null>(null);
  const [selectedConflict, setSelectedConflict] = useState<Conflict | null>(null);
  const [showMergeForm, setShowMergeForm] = useState(false);

  // Fetch conflicts when modal opens
  useEffect(() => {
    if (isOpen && currentBranch?.id) {
      fetchConflicts();
    }
  }, [isOpen, currentBranch?.id]);

  const fetchConflicts = async () => {
    if (!currentBranch?.id) return;

    setLoading(true);
    try {
      const response = await syncService.getConflicts(currentBranch.id);

      if (response.success && response.data) {
        // Backend returns { conflicts: Conflict[], count: number }
        const conflictsData = Array.isArray(response.data)
          ? response.data
          : (response.data as any).conflicts || [];
        setConflicts(conflictsData);
      } else {
        dispatch(showToast({
          type: 'error',
          message: 'Error al cargar conflictos',
        }));
      }
    } catch (error) {
      console.error('[ConflictResolution] Error fetching conflicts:', error);
      dispatch(showToast({
        type: 'error',
        message: 'Error al cargar conflictos',
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (
    conflictId: UUID,
    resolution: 'LOCAL_WINS' | 'SERVER_WINS' | 'MERGED',
    mergedData?: any
  ) => {
    setResolving(conflictId);
    try {
      const response = await syncService.resolveConflict(conflictId, {
        queue_id: conflictId,
        resolution,
        ...(mergedData && { merged_data: mergedData }),
      });

      if (response.success) {
        dispatch(showToast({
          type: 'success',
          message: 'Conflicto resuelto exitosamente',
        }));

        // Remove resolved conflict from list
        setConflicts((prev) => prev.filter((c) => c.id !== conflictId));
        setSelectedConflict(null);
        setShowMergeForm(false);

        // Notify parent to refresh sync status
        onResolved();

        // Close modal if no more conflicts
        if (conflicts.length === 1) {
          onClose();
        }
      } else {
        dispatch(showToast({
          type: 'error',
          message: response.error || 'Error al resolver conflicto',
        }));
      }
    } catch (error) {
      console.error('[ConflictResolution] Error resolving conflict:', error);
      dispatch(showToast({
        type: 'error',
        message: 'Error al resolver conflicto',
      }));
    } finally {
      setResolving(null);
    }
  };

  const getConflictTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      INSUFFICIENT_STOCK: 'Stock Insuficiente',
      DUPLICATE: 'Duplicado',
      DATA_CONFLICT: 'Conflicto de Datos',
      UNKNOWN: 'Desconocido',
    };
    return labels[type] || type;
  };

  const getEntityTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      SALE: 'Venta',
      STOCK_MOVEMENT: 'Movimiento de Stock',
      REGISTER_SESSION: 'Sesión de Caja',
      CUSTOMER: 'Cliente',
    };
    return labels[type] || type;
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Resolver Conflictos de Sincronización"
      size="lg"
      closeOnOverlayClick={false}
    >
      <div className="space-y-4">
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Cargando conflictos...</span>
          </div>
        )}

        {/* Empty State */}
        {!loading && conflicts.length === 0 && (
          <div className="text-center py-12">
            <WarningAmberIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <p className="text-gray-600 text-lg">No hay conflictos pendientes</p>
            <p className="text-gray-500 text-sm mt-2">
              Todos los conflictos han sido resueltos
            </p>
            <Button
              variant="secondary"
              className="mt-6"
              onClick={onClose}
            >
              Cerrar
            </Button>
          </div>
        )}

        {/* Conflicts List */}
        {!loading && conflicts.length > 0 && (
          <>
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
              <div className="flex items-start">
                <WarningAmberIcon className="text-yellow-600 mr-3 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-yellow-800">
                    {conflicts.length} conflicto{conflicts.length !== 1 ? 's' : ''} detectado{conflicts.length !== 1 ? 's' : ''}
                  </h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    Estos datos no pudieron sincronizarse automáticamente. Revisa cada conflicto y elige cómo resolverlo.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {conflicts.map((conflict) => (
                <div
                  key={conflict.id}
                  className="border border-gray-200 rounded-md p-4 bg-white hover:shadow-md transition-shadow"
                >
                  {/* Conflict Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                          {getConflictTypeLabel(conflict.conflict_type)}
                        </span>
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          {getEntityTypeLabel(conflict.entity_type)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Sucursal: <span className="font-medium">{conflict.branch?.name || 'N/A'}</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(conflict.local_created_at)}
                      </p>
                    </div>
                    {conflict.retry_count > 0 && (
                      <span className="text-xs text-gray-500">
                        Intentos: {conflict.retry_count}
                      </span>
                    )}
                  </div>

                  {/* Error Message */}
                  <div className="bg-gray-50 rounded p-3 mb-3">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Error:</span> {conflict.error_message}
                    </p>
                  </div>

                  {/* Resolution Actions */}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleResolve(conflict.id, 'LOCAL_WINS')}
                      disabled={resolving === conflict.id}
                      className="flex items-center gap-1"
                    >
                      <RefreshIcon className="h-4 w-4" />
                      {resolving === conflict.id ? 'Resolviendo...' : 'Reintentar con Datos Locales'}
                    </Button>

                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleResolve(conflict.id, 'SERVER_WINS')}
                      disabled={resolving === conflict.id}
                      className="flex items-center gap-1"
                    >
                      <DeleteOutlineIcon className="h-4 w-4" />
                      Descartar Local
                    </Button>

                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setSelectedConflict(conflict);
                        setShowMergeForm(true);
                      }}
                      disabled={resolving === conflict.id}
                      className="flex items-center gap-1"
                    >
                      <MergeTypeIcon className="h-4 w-4" />
                      Fusionar Manualmente
                    </Button>
                  </div>

                  {/* Merge Form */}
                  {showMergeForm && selectedConflict?.id === conflict.id && (
                    <div className="mt-4 p-4 border-t border-gray-200">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">
                        Fusionar Datos Manualmente
                      </h4>
                      <p className="text-sm text-gray-600 mb-3">
                        Funcionalidad de fusión manual en desarrollo. Por ahora, usa las opciones de reintentar o descartar.
                      </p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => {
                            // TODO: Implement manual merge UI
                            handleResolve(conflict.id, 'MERGED', conflict.payload);
                          }}
                          disabled={true}
                        >
                          Aplicar Fusión
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            setShowMergeForm(false);
                            setSelectedConflict(null);
                          }}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Footer Actions */}
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
              <Button
                variant="secondary"
                onClick={fetchConflicts}
                disabled={loading}
              >
                <RefreshIcon className="h-4 w-4 mr-2" />
                Actualizar Lista
              </Button>
              <Button
                variant="secondary"
                onClick={onClose}
              >
                Cerrar
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default ConflictResolutionModal;
