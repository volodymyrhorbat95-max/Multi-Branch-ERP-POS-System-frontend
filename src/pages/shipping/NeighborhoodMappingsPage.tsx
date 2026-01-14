import React, { useEffect, useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  loadNeighborhoods,
  createNeighborhood,
  updateNeighborhood,
  deleteNeighborhood,
  loadZones,
} from '../../store/slices/shippingSlice';
import { Card, Button, Input } from '../../components/ui';
import { NeighborhoodMappingsTable } from './NeighborhoodMappingsTable';
import { NeighborhoodMappingFormModal } from './NeighborhoodMappingFormModal';
import type { NeighborhoodMapping, NeighborhoodMappingFormData } from '../../types';

const initialFormData: NeighborhoodMappingFormData = {
  neighborhood_name: '',
  postal_code: '',
  postal_code_pattern: '',
  shipping_zone_id: '',
  city: '',
};

const NeighborhoodMappingsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { neighborhoods, zones, loading } = useAppSelector((state) => state.shipping);

  // Local state
  const [showModal, setShowModal] = useState(false);
  const [editingMapping, setEditingMapping] = useState<NeighborhoodMapping | null>(null);
  const [formData, setFormData] = useState<NeighborhoodMappingFormData>(initialFormData);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterZoneId, setFilterZoneId] = useState<string>('');

  // Load neighborhoods and zones
  useEffect(() => {
    dispatch(loadNeighborhoods({ zoneId: filterZoneId || undefined }));
    dispatch(loadZones());
  }, [dispatch, filterZoneId]);

  // Handle form changes
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Open create modal
  const handleCreate = () => {
    setEditingMapping(null);
    setFormData(initialFormData);
    setShowModal(true);
  };

  // Open edit modal
  const handleEdit = (mapping: NeighborhoodMapping) => {
    setEditingMapping(mapping);
    setFormData({
      neighborhood_name: mapping.neighborhood_name,
      postal_code: mapping.postal_code || '',
      postal_code_pattern: mapping.postal_code_pattern || '',
      shipping_zone_id: mapping.shipping_zone_id,
      city: mapping.city || '',
    });
    setShowModal(true);
  };

  // Submit form
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (editingMapping) {
        const result = await dispatch(updateNeighborhood({ id: editingMapping.id, data: formData }));
        if (updateNeighborhood.fulfilled.match(result)) {
          setShowModal(false);
          dispatch(loadNeighborhoods({ zoneId: filterZoneId || undefined }));
        }
      } else {
        const result = await dispatch(createNeighborhood(formData));
        if (createNeighborhood.fulfilled.match(result)) {
          setShowModal(false);
          dispatch(loadNeighborhoods({ zoneId: filterZoneId || undefined }));
        }
      }
    },
    [dispatch, editingMapping, formData, filterZoneId]
  );

  // Delete mapping
  const handleDelete = useCallback(
    async (id: string) => {
      if (window.confirm('¿Estás seguro de eliminar este mapeo de barrio? Esta acción no se puede deshacer.')) {
        const result = await dispatch(deleteNeighborhood(id));
        if (deleteNeighborhood.fulfilled.match(result)) {
          dispatch(loadNeighborhoods({ zoneId: filterZoneId || undefined }));
        }
      }
    },
    [dispatch, filterZoneId]
  );

  // Filter neighborhoods by search query
  const filteredNeighborhoods = neighborhoods.filter((n) =>
    n.neighborhood_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.postal_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.city?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-down duration-fast">
          <div className="animate-fade-right duration-normal">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Mapeo de Barrios
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Asigna barrios y códigos postales a zonas de envío
            </p>
          </div>

          <Button onClick={handleCreate} variant="primary" className="animate-fade-left duration-fast">
            + Nuevo Mapeo
          </Button>
        </div>

        {/* Filters */}
        <Card className="animate-fade-up duration-normal">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="animate-fade-right duration-fast">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Buscar
              </label>
              <Input
                type="text"
                placeholder="Buscar por barrio, código postal o ciudad..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="animate-fade-left duration-fast">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Filtrar por Zona
              </label>
              <select
                value={filterZoneId}
                onChange={(e) => setFilterZoneId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Todas las zonas</option>
                {zones
                  .filter((z) => z.is_active)
                  .map((zone) => (
                    <option key={zone.id} value={zone.id}>
                      {zone.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-up duration-normal">
          <Card className="animate-fade-right duration-fast">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-sm flex items-center justify-center">
                <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Barrios</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {neighborhoods.filter((n) => n.is_active).length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="animate-fade-up duration-light-slow">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-sm flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Con Código Postal</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {neighborhoods.filter((n) => n.is_active && n.postal_code).length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="animate-fade-left duration-normal">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-sm flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Zonas Activas</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {zones.filter((z) => z.is_active).length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Mappings Table */}
        <Card className="animate-fade-up duration-normal">
          <NeighborhoodMappingsTable
            neighborhoods={filteredNeighborhoods}
            zones={zones}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </Card>
      </div>

      {/* Form Modal */}
      <NeighborhoodMappingFormModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        formData={formData}
        onChange={handleFormChange}
        zones={zones.filter((z) => z.is_active)}
        isEditing={!!editingMapping}
      />
    </>
  );
};

export default NeighborhoodMappingsPage;
