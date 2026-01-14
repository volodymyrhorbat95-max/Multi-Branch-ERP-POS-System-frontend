import React from 'react';
import type { ShippingZone } from '../../types';

interface ShippingZonesTableProps {
  zones: ShippingZone[];
  loading: boolean;
  onEdit: (zone: ShippingZone) => void;
  onDelete: (id: string) => void;
  getNeighborhoodCount: (zoneId: string) => number;
}

export const ShippingZonesTable: React.FC<ShippingZonesTableProps> = ({
  zones,
  loading,
  onEdit,
  onDelete,
  getNeighborhoodCount,
}) => {
  const formatCurrency = (value: string | number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(Number(value));
  };

  if (loading && zones.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (zones.length === 0) {
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
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No hay zonas de envío</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Comienza creando una nueva zona de envío
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
              Zona
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Tarifa Base
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Envío Gratis Desde
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Recargo por Peso
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Express
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Barrios
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
          {zones.map((zone) => (
            <tr
              key={zone.id}
              className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-fast animate-fade-up"
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {zone.name}
                </div>
                {zone.description && (
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {zone.description}
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900 dark:text-white">
                  {Number(zone.base_rate) === 0 ? (
                    <span className="text-green-600 dark:text-green-400 font-medium">GRATIS</span>
                  ) : (
                    formatCurrency(zone.base_rate)
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900 dark:text-white">
                  {zone.free_shipping_threshold ? (
                    formatCurrency(zone.free_shipping_threshold)
                  ) : (
                    <span className="text-gray-400 dark:text-gray-600">—</span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900 dark:text-white">
                  {zone.weight_surcharge_per_kg && Number(zone.weight_surcharge_per_kg) > 0 ? (
                    `${formatCurrency(zone.weight_surcharge_per_kg)}/kg`
                  ) : (
                    <span className="text-gray-400 dark:text-gray-600">—</span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900 dark:text-white">
                  {zone.express_surcharge && Number(zone.express_surcharge) > 0 ? (
                    formatCurrency(zone.express_surcharge)
                  ) : (
                    <span className="text-gray-400 dark:text-gray-600">—</span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-sm text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                    {getNeighborhoodCount(zone.id)} barrios
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {zone.is_active ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-sm text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                    Activa
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-sm text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                    Inactiva
                  </span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => onEdit(zone)}
                  className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 mr-4 transition-colors duration-fast"
                >
                  Editar
                </button>
                <button
                  onClick={() => onDelete(zone.id)}
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
