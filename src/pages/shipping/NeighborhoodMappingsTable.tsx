import React from 'react';
import type { NeighborhoodMapping, ShippingZone } from '../../types';

interface NeighborhoodMappingsTableProps {
  neighborhoods: NeighborhoodMapping[];
  zones: ShippingZone[];
  loading: boolean;
  onEdit: (mapping: NeighborhoodMapping) => void;
  onDelete: (id: string) => void;
}

export const NeighborhoodMappingsTable: React.FC<NeighborhoodMappingsTableProps> = ({
  neighborhoods,
  zones,
  loading,
  onEdit,
  onDelete,
}) => {
  const getZoneName = (zoneId: string) => {
    const zone = zones.find((z) => z.id === zoneId);
    return zone?.name || 'Zona desconocida';
  };

  if (loading && neighborhoods.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (neighborhoods.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No hay mapeos de barrios</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Comienza creando un nuevo mapeo de barrio
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Barrio
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Código Postal
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Ciudad
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Zona de Envío
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Estado
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          {neighborhoods.map((mapping) => (
            <tr
              key={mapping.id}
              className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-fast animate-fade-up"
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {mapping.neighborhood_name}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900 dark:text-white">
                  {mapping.postal_code || (
                    <span className="text-gray-400 dark:text-gray-600">—</span>
                  )}
                </div>
                {mapping.postal_code_pattern && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Patrón: {mapping.postal_code_pattern}
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900 dark:text-white">
                  {mapping.city || <span className="text-gray-400 dark:text-gray-600">—</span>}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-sm text-xs font-medium bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200">
                  {getZoneName(mapping.shipping_zone_id)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {mapping.is_active ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-sm text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                    Activo
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-sm text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                    Inactivo
                  </span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => onEdit(mapping)}
                  className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 mr-4 transition-colors duration-fast"
                >
                  Editar
                </button>
                <button
                  onClick={() => onDelete(mapping.id)}
                  className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-fast"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
