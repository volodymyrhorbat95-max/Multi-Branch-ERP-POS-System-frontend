import React from 'react';
import { Modal, Input, Button } from '../../components/ui';
import type { SalePayment } from '../../types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMethod: string;
  onMethodChange: (method: string) => void;
  cashReceived: string;
  onCashReceivedChange: (value: string) => void;
  // Payment reference fields
  referenceNumber: string;
  onReferenceNumberChange: (value: string) => void;
  authorizationCode: string;
  onAuthorizationCodeChange: (value: string) => void;
  cardLastFour: string;
  onCardLastFourChange: (value: string) => void;
  cardBrand: string;
  onCardBrandChange: (value: string) => void;
  qrProvider: string;
  onQrProviderChange: (value: string) => void;
  qrTransactionId: string;
  onQrTransactionIdChange: (value: string) => void;
  payments: SalePayment[];
  onRemovePayment: (index: number) => void;
  onAddPayment: () => void;
  onCompleteSale: () => void;
  total: number;
  totalPaid: number;
  remainingAmount: number;
  change: number;
  processing: boolean;
  formatCurrency: (amount: number) => string;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  selectedMethod,
  onMethodChange,
  cashReceived,
  onCashReceivedChange,
  referenceNumber,
  onReferenceNumberChange,
  authorizationCode,
  onAuthorizationCodeChange,
  cardLastFour,
  onCardLastFourChange,
  cardBrand,
  onCardBrandChange,
  qrProvider,
  onQrProviderChange,
  qrTransactionId,
  onQrTransactionIdChange,
  payments,
  onRemovePayment,
  onAddPayment,
  onCompleteSale,
  total,
  totalPaid,
  remainingAmount,
  change,
  processing,
  formatCurrency,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cobrar Venta"
      size="lg"
    >
      <div className="grid grid-cols-2 gap-6">
        {/* Left - Payment Methods */}
        <div className="space-y-4 animate-fade-right duration-normal">
          <h3 className="font-medium text-gray-900 dark:text-white animate-fade-down duration-fast">
            Método de Pago
          </h3>

          <div className="grid grid-cols-2 gap-3 animate-fade-up duration-normal">
            {['CASH', 'DEBIT', 'CREDIT', 'TRANSFER', 'QR'].map((method) => (
              <button
                key={method}
                onClick={() => onMethodChange(method)}
                className={`
                  p-4 rounded-sm border-2 text-center transition-all animate-zoom-in duration-fast
                  ${selectedMethod === method
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'}
                `}
              >
                <span className={`font-medium ${
                  selectedMethod === method
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-gray-700 dark:text-gray-300'
                }`}>
                  {method === 'CASH' && 'Efectivo'}
                  {method === 'DEBIT' && 'Débito'}
                  {method === 'CREDIT' && 'Crédito'}
                  {method === 'TRANSFER' && 'Transfer.'}
                  {method === 'QR' && 'QR'}
                </span>
              </button>
            ))}
          </div>

          {selectedMethod === 'CASH' && (
            <div className="space-y-3 animate-fade-up duration-light-slow">
              <Input
                label="Efectivo recibido"
                type="number"
                min="0"
                step="0.01"
                value={cashReceived}
                onChange={(e) => onCashReceivedChange(e.target.value)}
                placeholder={formatCurrency(remainingAmount)}
              />
              <div className="grid grid-cols-3 gap-2">
                {[100, 200, 500, 1000, 2000, 3000].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => onCashReceivedChange(String(amount))}
                    className="py-2 text-sm bg-gray-100 dark:bg-gray-700 rounded-sm hover:bg-gray-200 dark:hover:bg-gray-600 animate-zoom-in duration-fast"
                  >
                    {formatCurrency(amount)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {(selectedMethod === 'DEBIT' || selectedMethod === 'CREDIT') && (
            <div className="space-y-3 animate-fade-up duration-light-slow">
              <Input
                label="Código de Autorización *"
                type="text"
                value={authorizationCode}
                onChange={(e) => onAuthorizationCodeChange(e.target.value)}
                placeholder="Ej: 123456"
                required
              />
              <Input
                label="Últimos 4 dígitos"
                type="text"
                maxLength={4}
                value={cardLastFour}
                onChange={(e) => onCardLastFourChange(e.target.value.replace(/\D/g, ''))}
                placeholder="1234"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Marca de Tarjeta
                </label>
                <select
                  value={cardBrand}
                  onChange={(e) => onCardBrandChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Seleccionar...</option>
                  <option value="VISA">Visa</option>
                  <option value="MASTERCARD">Mastercard</option>
                  <option value="AMEX">American Express</option>
                  <option value="CABAL">Cabal</option>
                  <option value="NARANJA">Naranja</option>
                  <option value="OTRA">Otra</option>
                </select>
              </div>
            </div>
          )}

          {selectedMethod === 'TRANSFER' && (
            <div className="space-y-3 animate-fade-up duration-light-slow">
              <Input
                label="Número de Comprobante *"
                type="text"
                value={referenceNumber}
                onChange={(e) => onReferenceNumberChange(e.target.value)}
                placeholder="Ej: 0001-12345678"
                required
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Ingrese el número de comprobante de la transferencia bancaria
              </p>
            </div>
          )}

          {selectedMethod === 'QR' && (
            <div className="space-y-3 animate-fade-up duration-light-slow">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Proveedor QR
                </label>
                <select
                  value={qrProvider}
                  onChange={(e) => onQrProviderChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Seleccionar...</option>
                  <option value="MERCADOPAGO">MercadoPago</option>
                  <option value="MODO">Modo</option>
                  <option value="UALA">Ualá</option>
                  <option value="OTRO">Otro</option>
                </select>
              </div>
              <Input
                label="ID de Transacción"
                type="text"
                value={qrTransactionId}
                onChange={(e) => onQrTransactionIdChange(e.target.value)}
                placeholder="Ej: MP-123456789"
              />
            </div>
          )}

          <Button
            variant="primary"
            fullWidth
            onClick={onAddPayment}
            disabled={remainingAmount <= 0}
            className="animate-fade-up duration-slow"
          >
            Agregar Pago
          </Button>
        </div>

        {/* Right - Summary */}
        <div className="space-y-4 animate-fade-left duration-normal">
          <h3 className="font-medium text-gray-900 dark:text-white animate-fade-down duration-fast">
            Resumen
          </h3>

          {/* Payments list */}
          {payments.length > 0 && (
            <div className="space-y-2 animate-fade-up duration-normal">
              {payments.map((payment, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-sm animate-fade-right duration-fast"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {payment.payment_method?.name || 'Pago'}
                    </p>
                    {payment.reference_number && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        Comp: {payment.reference_number}
                      </p>
                    )}
                    {payment.authorization_code && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        Auth: {payment.authorization_code}
                        {payment.card_last_four && ` - *${payment.card_last_four}`}
                      </p>
                    )}
                    {payment.qr_transaction_id && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {payment.qr_provider || 'QR'}: {payment.qr_transaction_id}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 dark:text-white">
                      {formatCurrency(Number(payment.amount))}
                    </span>
                    <button
                      onClick={() => onRemovePayment(index)}
                      className="p-1 text-gray-400 hover:text-danger-500 animate-zoom-in duration-normal"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Totals */}
          <div className="space-y-2 pt-4 border-t border-gray-200 dark:border-gray-700 animate-fade-up duration-light-slow">
            <div className="flex justify-between text-lg animate-fade-right duration-fast">
              <span className="text-gray-500 dark:text-gray-400">Total a cobrar</span>
              <span className="font-bold text-gray-900 dark:text-white">
                {formatCurrency(total)}
              </span>
            </div>
            <div className="flex justify-between text-lg animate-fade-right duration-normal">
              <span className="text-gray-500 dark:text-gray-400">Pagado</span>
              <span className="font-bold text-green-500">
                {formatCurrency(totalPaid)}
              </span>
            </div>
            {remainingAmount > 0 && (
              <div className="flex justify-between text-lg animate-fade-right duration-light-slow">
                <span className="text-gray-500 dark:text-gray-400">Restante</span>
                <span className="font-bold text-danger-500">
                  {formatCurrency(remainingAmount)}
                </span>
              </div>
            )}
            {change > 0 && (
              <div className="flex justify-between text-2xl pt-2 border-t border-gray-200 dark:border-gray-700 animate-zoom-in duration-slow">
                <span className="text-gray-900 dark:text-white">Cambio</span>
                <span className="font-bold text-primary-500">
                  {formatCurrency(change)}
                </span>
              </div>
            )}
          </div>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={onCompleteSale}
            disabled={remainingAmount > 0 || processing}
            loading={processing}
            className="animate-fade-up duration-very-slow"
          >
            Completar Venta
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default PaymentModal;
