import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { loadPurchaseOrders, loadSuppliers, setCurrentPurchaseOrder } from '../../store/slices/supplierSlice';
import { Card, Button, Input } from '../../components/ui';
import { PurchaseOrderFormModal } from './PurchaseOrderFormModal';
import { PurchaseOrderDetailModal } from './PurchaseOrderDetailModal';
import type { PurchaseOrder } from '../../services/api/supplier.service';

export const PurchaseOrderListPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { purchaseOrders, suppliers, loading } = useAppSelector((state) => state.supplier);
  const { currentBranch } = useAppSelector((state) => state.auth);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);

  useEffect(() => {
    dispatch(loadPurchaseOrders());
    dispatch(loadSuppliers({ is_active: true }));
  }, [dispatch]);

  const handleSearch = () => {
    const filters: any = {};
    if (selectedSupplier) filters.supplier_id = selectedSupplier;
    if (selectedStatus) filters.status = selectedStatus;
    if (currentBranch) filters.branch_id = currentBranch.id;

    dispatch(loadPurchaseOrders(filters));
  };

  const handleCreateNew = () => {
    setSelectedOrder(null);
    setIsFormModalOpen(true);
  };

  const handleViewDetail = (order: PurchaseOrder) => {
    dispatch(setCurrentPurchaseOrder(order));
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setSelectedOrder(null);
    // Reload orders after form closes
    dispatch(loadPurchaseOrders());
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedOrder(null);
    // Reload orders after detail closes
    dispatch(loadPurchaseOrders());
  };

  const getStatusBadge = (status: PurchaseOrder['status']) => {
    const styles: Record<PurchaseOrder['status'], string> = {
      DRAFT: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      SUBMITTED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      APPROVED: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      PARTIALLY_RECEIVED: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      RECEIVED: 'bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-400',
      CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    };

    const labels: Record<PurchaseOrder['status'], string> = {
      DRAFT: 'Borrador',
      SUBMITTED: 'Enviado',
      APPROVED: 'Aprobado',
      PARTIALLY_RECEIVED: 'Parcialmente Recibido',
      RECEIVED: 'Recibido',
      CANCELLED: 'Cancelado',
    };

    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR');
  };

  const filteredOrders = purchaseOrders.filter((order) => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        order.order_number.toLowerCase().includes(term) ||
        order.supplier?.name.toLowerCase().includes(term)
      );
    }
    return true;
  });

  return (
    <>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/suppliers')}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ← Volver a Proveedores
              </button>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              Órdenes de Compra
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Gestiona las órdenes de compra a proveedores
            </p>
          </div>
          <Button variant="primary" onClick={handleCreateNew}>
            Nueva Orden de Compra
          </Button>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="grid grid-cols-4 gap-4">
            <Input
              type="text"
              placeholder="Buscar por número o proveedor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <select
              value={selectedSupplier}
              onChange={(e) => setSelectedSupplier(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">Todos los proveedores</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">Todos los estados</option>
              <option value="DRAFT">Borrador</option>
              <option value="SUBMITTED">Enviado</option>
              <option value="APPROVED">Aprobado</option>
              <option value="PARTIALLY_RECEIVED">Parcialmente Recibido</option>
              <option value="RECEIVED">Recibido</option>
              <option value="CANCELLED">Cancelado</option>
            </select>
            <Button variant="secondary" onClick={handleSearch}>
              Buscar
            </Button>
          </div>
        </Card>

        {/* Orders Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Número
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Proveedor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Sucursal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Fecha Creación
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Fecha Esperada
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Total
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full" />
                      </div>
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                      No se encontraron órdenes de compra
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
                      onClick={() => handleViewDetail(order)}
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                        {order.order_number}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {order.supplier?.name || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {order.branch?.name || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDate(order.created_at)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {order.expected_date ? formatDate(order.expected_date) : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-right font-medium text-gray-900 dark:text-white">
                        {formatCurrency(order.total_amount)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetail(order);
                          }}
                        >
                          Ver Detalle
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Purchase Order Form Modal */}
      <PurchaseOrderFormModal
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        order={selectedOrder}
      />

      {/* Purchase Order Detail Modal */}
      {selectedOrder && (
        <PurchaseOrderDetailModal
          isOpen={isDetailModalOpen}
          onClose={handleCloseDetailModal}
          order={selectedOrder}
        />
      )}
    </>
  );
};

export default PurchaseOrderListPage;
