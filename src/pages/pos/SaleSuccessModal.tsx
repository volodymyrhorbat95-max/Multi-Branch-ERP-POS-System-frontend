import React, { useEffect, useState } from 'react';
import { Modal, Button } from '../../components/ui';
import invoiceService from '../../services/api/invoice.service';
import printerService from '../../services/api/printer.service';
import saleService from '../../services/api/sale.service';
import { printReceipt } from '../../services/printer/thermalPrinter';
import CancelSaleModal from './CancelSaleModal';
import type { Sale, Invoice, UUID } from '../../types';
import { MdClose, MdCheck, MdRefresh, MdError, MdPrint, MdDescription, MdAdd } from 'react-icons/md';

interface SaleSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: Sale | null;
}

const SaleSuccessModal: React.FC<SaleSuccessModalProps> = ({
  isOpen,
  onClose,
  sale,
}) => {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loadingInvoice, setLoadingInvoice] = useState(false);
  const [invoiceError, setInvoiceError] = useState<string | null>(null);
  const [printing, setPrinting] = useState(false);
  const [printError, setPrintError] = useState<string | null>(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(false);

  useEffect(() => {
    const fetchInvoice = async () => {
      if (!sale?.id) return;

      setLoadingInvoice(true);
      setInvoiceError(null);

      try {
        const response = await invoiceService.getBySale(sale.id);
        if (response.success && response.data && response.data.length > 0) {
          setInvoice(response.data[0]);
        }
      } catch (error: any) {
        setInvoiceError(error.message || 'Error al cargar factura');
      } finally {
        setLoadingInvoice(false);
      }
    };

    if (isOpen && sale) {
      fetchInvoice();
    }
  }, [isOpen, sale]);

  const formatCurrency = (amount: number | string) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2,
    }).format(Number(amount));
  };

  const getInvoiceTypeLabel = (code: string) => {
    const typeLabels: Record<string, string> = {
      A: 'Factura A',
      B: 'Factura B',
      C: 'Factura C',
      NC_A: 'Nota de Crédito A',
      NC_B: 'Nota de Crédito B',
      NC_C: 'Nota de Crédito C',
    };
    return typeLabels[code] || code;
  };

  const handlePrintInvoice = () => {
    if (invoice?.pdf_url) {
      window.open(invoice.pdf_url, '_blank');
    }
  };

  const handlePrintReceipt = async () => {
    if (!sale?.id) return;

    setPrinting(true);
    setPrintError(null);

    try {
      // Fetch receipt data from backend
      const response = await printerService.getReceipt(sale.id);

      if (response.success && response.data) {
        // Print receipt using thermal printer service
        await printReceipt(response.data);
      } else {
        throw new Error('No se pudo obtener los datos del recibo');
      }
    } catch (error: any) {
      console.error('Error printing receipt:', error);
      setPrintError(error.message || 'Error al imprimir recibo');
    } finally {
      setPrinting(false);
    }
  };

  const handleCancelSale = async (saleId: UUID, reason: string, managerPin?: string) => {
    try {
      await saleService.void(saleId, reason, managerPin); // Backend still uses 'void' endpoint
      setCancelSuccess(true);
      setCancelModalOpen(false);
    } catch (error) {
      // Error is handled in CancelSaleModal
      throw error;
    }
  };

  const handleNewSale = () => {
    setInvoice(null);
    setInvoiceError(null);
    setPrintError(null);
    setCancelSuccess(false);
    onClose();
  };

  if (!sale) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleNewSale}
      title="Venta Completada"
      size="md"
    >
      <div className="space-y-6">
        {/* Sale Success or Void Success Info */}
        {cancelSuccess ? (
          <div className="text-center p-6 bg-red-50 dark:bg-red-900/20 rounded-sm animate-zoom-in duration-fast">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <MdClose className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-2xl font-bold text-red-700 dark:text-red-300 mb-2 animate-fade-down duration-normal">
              Venta Cancelada
            </h3>
            <p className="text-red-600 dark:text-red-400 animate-fade-up duration-light-slow">
              La venta #{sale.sale_number} ha sido cancelada exitosamente
            </p>
          </div>
        ) : (
          <div className="text-center p-6 bg-success-50 dark:bg-success-900/20 rounded-sm animate-zoom-in duration-fast">
            <div className="w-16 h-16 bg-success-100 dark:bg-success-900/30 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-slow">
              <MdCheck className="w-8 h-8 text-success-600 dark:text-success-400" />
            </div>
            <h3 className="text-2xl font-bold text-success-700 dark:text-success-300 mb-2 animate-fade-down duration-normal">
              ¡Venta Exitosa!
            </h3>
            <p className="text-success-600 dark:text-success-400 animate-fade-up duration-light-slow">
              Venta #{sale.sale_number}
            </p>
          </div>
        )}

        {/* Sale Details */}
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-sm animate-fade-up duration-normal">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Subtotal</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {formatCurrency(sale.subtotal)}
              </span>
            </div>
            {Number(sale.discount_amount) > 0 && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Descuento</span>
                <span className="text-sm font-medium text-danger-600 dark:text-danger-400">
                  -{formatCurrency(sale.discount_amount)}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">IVA</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {formatCurrency(sale.tax_amount)}
              </span>
            </div>
            <div className="flex justify-between pt-3 border-t border-gray-200 dark:border-gray-600">
              <span className="text-lg font-semibold text-gray-900 dark:text-white">Total</span>
              <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                {formatCurrency(sale.total_amount)}
              </span>
            </div>
            {Number(sale.paid_amount) > Number(sale.total_amount) && (
              <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-600">
                <span className="text-sm text-gray-600 dark:text-gray-400">Cambio</span>
                <span className="text-sm font-medium text-success-600 dark:text-success-400">
                  {formatCurrency(sale.change_amount)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Invoice Info */}
        <div className="animate-fade-up duration-light-slow">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Factura Electrónica
          </h4>

          {loadingInvoice && (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
              <span className="ml-3 text-sm text-gray-600 dark:text-gray-400">
                Cargando factura...
              </span>
            </div>
          )}

          {invoiceError && (
            <div className="p-4 bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800 rounded-sm animate-zoom-in duration-fast">
              <p className="text-sm text-warning-700 dark:text-warning-300">
                {invoiceError}
              </p>
            </div>
          )}

          {!loadingInvoice && !invoiceError && !invoice && (
            <div className="p-4 bg-info-50 dark:bg-info-900/20 border border-info-200 dark:border-info-800 rounded-sm animate-fade-up duration-normal">
              <p className="text-sm text-info-700 dark:text-info-300">
                No se generó factura para esta venta
              </p>
            </div>
          )}

          {invoice && (
            <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm animate-fade-up duration-normal">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Tipo</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {getInvoiceTypeLabel(invoice.invoice_type?.code || '')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Número</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white font-mono">
                    {invoice.point_of_sale.toString().padStart(4, '0')}-
                    {invoice.invoice_number.toString().padStart(8, '0')}
                  </span>
                </div>

                {invoice.status === 'ISSUED' && invoice.cae && (
                  <>
                    <div className="pt-3 border-t border-gray-200 dark:border-gray-600">
                      <p className="text-xs text-success-600 dark:text-success-400 mb-2">
                        CAE (Código de Autorización Electrónica)
                      </p>
                      <p className="text-sm font-mono font-bold text-success-700 dark:text-success-300">
                        {invoice.cae}
                      </p>
                      {invoice.cae_expiration_date && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Vencimiento: {new Date(invoice.cae_expiration_date).toLocaleDateString('es-AR')}
                        </p>
                      )}
                    </div>
                  </>
                )}

                {invoice.status === 'PENDING' && (
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-600">
                    <div className="flex items-center gap-2">
                      <MdRefresh className="w-5 h-5 text-warning-500 animate-spin" />
                      <p className="text-sm text-warning-600 dark:text-warning-400">
                        Pendiente de envío a AFIP
                      </p>
                    </div>
                  </div>
                )}

                {invoice.status === 'FAILED' && (
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-600">
                    <div className="flex items-start gap-2">
                      <MdError className="w-5 h-5 text-danger-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-danger-600 dark:text-danger-400 font-medium">
                          Error al generar factura
                        </p>
                        {invoice.error_message && (
                          <p className="text-xs text-danger-500 dark:text-danger-400 mt-1">
                            {invoice.error_message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Print Error */}
        {printError && (
          <div className="p-4 bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 rounded-sm animate-zoom-in duration-fast">
            <p className="text-sm text-danger-700 dark:text-danger-300">
              {printError}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200 dark:border-gray-700 animate-fade-up duration-slow">
          {!cancelSuccess && (
            <>
              <Button
                variant="secondary"
                onClick={handlePrintReceipt}
                disabled={printing}
                icon={
                  printing ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <MdPrint className="w-5 h-5" />
                  )
                }
                iconPosition="left"
              >
                {printing ? 'Imprimiendo...' : 'Imprimir Recibo'}
              </Button>

              {invoice?.pdf_url && invoice.status === 'ISSUED' && (
                <Button
                  variant="secondary"
                  onClick={handlePrintInvoice}
                  icon={<MdDescription className="w-5 h-5" />}
                  iconPosition="left"
                >
                  Ver Factura PDF
                </Button>
              )}

              <Button
                variant="danger"
                onClick={() => setCancelModalOpen(true)}
                icon={<MdClose className="w-5 h-5" />}
                iconPosition="left"
              >
                Cancelar Venta
              </Button>
            </>
          )}

          <Button
            variant="primary"
            onClick={handleNewSale}
            fullWidth
            icon={<MdAdd className="w-5 h-5" />}
            iconPosition="left"
          >
            Nueva Venta
          </Button>
        </div>
      </div>

      {/* Cancel Sale Modal */}
      <CancelSaleModal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        onSubmit={handleCancelSale}
        sale={sale}
      />
    </Modal>
  );
};

export default SaleSuccessModal;
