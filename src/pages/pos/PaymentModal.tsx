import React, { useState, useEffect } from 'react';
import { Modal, Input, Button } from '../../components/ui';
import type { SalePayment, Customer } from '../../types';
import { MdAttachMoney, MdClose } from 'react-icons/md';

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
  // Invoice-related props
  customer: Customer | null;
  invoiceType: 'A' | 'B' | 'C' | null;
  onInvoiceTypeChange: (type: 'A' | 'B' | 'C' | null) => void;
  customerCuit: string;
  onCustomerCuitChange: (value: string) => void;
  customerTaxCondition: string;
  onCustomerTaxConditionChange: (value: string) => void;
  customerAddress: string;
  onCustomerAddressChange: (value: string) => void;
  // Loyalty-related props
  pointsToRedeem: number;
  onPointsToRedeemChange: (value: number) => void;
  creditToUse: number;
  onCreditToUseChange: (value: number) => void;
  changeAsCredit: boolean;
  onChangeAsCreditChange: (value: boolean) => void;
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
  // Invoice props
  customer,
  invoiceType,
  onInvoiceTypeChange,
  customerCuit,
  onCustomerCuitChange,
  customerTaxCondition,
  onCustomerTaxConditionChange,
  customerAddress,
  onCustomerAddressChange,
  // Loyalty props
  pointsToRedeem,
  onPointsToRedeemChange,
  creditToUse,
  onCreditToUseChange,
  changeAsCredit,
  onChangeAsCreditChange,
}) => {
  // Auto-detect suggested invoice type based on customer data
  const [suggestedInvoiceType, setSuggestedInvoiceType] = useState<'A' | 'B' | 'C'>('B');

  useEffect(() => {
    if (!customer) {
      setSuggestedInvoiceType('B'); // Consumidor Final
      return;
    }

    // If customer has CUIT and is Responsable Inscripto -> suggest A
    if (
      customer.tax_condition === 'RESPONSABLE_INSCRIPTO' &&
      customer.document_number &&
      customer.document_number.length >= 11
    ) {
      setSuggestedInvoiceType('A');
    }
    // If customer is Monotributista -> suggest C
    else if (customer.tax_condition === 'MONOTRIBUTO') {
      setSuggestedInvoiceType('C');
    }
    // Default to B
    else {
      setSuggestedInvoiceType('B');
    }
  }, [customer]);

  // Validation for Invoice Type A
  const isInvoiceTypeAValid = () => {
    if (invoiceType !== 'A') return true;
    // CUIT must be exactly 11 digits (format: XX-XXXXXXXX-X without dashes)
    const cuitDigitsOnly = customerCuit?.replace(/\D/g, '') || '';
    return (
      customerCuit &&
      cuitDigitsOnly.length === 11 &&
      customerTaxCondition &&
      customerTaxCondition.trim().length > 0 &&
      customerAddress &&
      customerAddress.trim().length > 0
    );
  };
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cobrar Venta"
      size="lg"
    >
      <div className="space-y-6">
        {/* Invoice Type Selection */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-sm border border-blue-200 dark:border-blue-800 animate-fade-down duration-normal">
          <h3 className="font-medium text-gray-900 dark:text-white mb-3">
            Tipo de Factura
          </h3>

          <div className="grid grid-cols-3 gap-3 mb-3">
            {['A', 'B', 'C'].map((type) => (
              <button
                key={type}
                onClick={() => onInvoiceTypeChange(type as 'A' | 'B' | 'C')}
                className={`
                  p-3 rounded-sm border-2 text-center transition-all animate-zoom-in duration-fast
                  ${invoiceType === type
                    ? 'border-blue-500 bg-blue-100 dark:bg-blue-900/40'
                    : 'border-gray-300 dark:border-gray-600 hover:border-blue-300'}
                  ${suggestedInvoiceType === type && invoiceType !== type
                    ? 'ring-2 ring-blue-400 ring-opacity-50'
                    : ''}
                `}
              >
                <span className={`font-bold text-lg ${
                  invoiceType === type
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300'
                }`}>
                  Tipo {type}
                </span>
                <p className="text-xs mt-1 text-gray-600 dark:text-gray-400">
                  {type === 'A' && 'Resp. Inscripto'}
                  {type === 'B' && 'Consumidor Final'}
                  {type === 'C' && 'Monotributista'}
                </p>
                {suggestedInvoiceType === type && invoiceType !== type && (
                  <p className="text-xs mt-1 text-blue-600 dark:text-blue-400 font-medium">
                    Sugerido
                  </p>
                )}
              </button>
            ))}
          </div>

          {/* Invoice Type A - Additional Fields */}
          {invoiceType === 'A' && (
            <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 space-y-3 animate-fade-up duration-normal">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Factura tipo A requiere datos fiscales del cliente
              </p>

              <Input
                label="CUIT *"
                type="text"
                value={customerCuit}
                onChange={(e) => {
                  // Format CUIT as XX-XXXXXXXX-X
                  const value = e.target.value.replace(/\D/g, '');
                  if (value.length <= 11) {
                    onCustomerCuitChange(value);
                  }
                }}
                placeholder="20-12345678-9"
                required
                maxLength={13}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Condición Fiscal *
                </label>
                <select
                  value={customerTaxCondition}
                  onChange={(e) => onCustomerTaxConditionChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  <option value="">Seleccionar...</option>
                  <option value="RESPONSABLE_INSCRIPTO">Responsable Inscripto</option>
                  <option value="MONOTRIBUTO">Monotributista</option>
                  <option value="EXENTO">Exento</option>
                </select>
              </div>

              <Input
                label="Dirección *"
                type="text"
                value={customerAddress}
                onChange={(e) => onCustomerAddressChange(e.target.value)}
                placeholder="Calle 123, Ciudad"
                required
              />

              {!isInvoiceTypeAValid() && (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-sm">
                  <p className="text-sm text-yellow-800 dark:text-yellow-300">
                    Complete todos los campos requeridos para Factura tipo A
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Customer Info Display */}
          {customer && (
            <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-sm text-sm">
              <p className="text-gray-600 dark:text-gray-400">
                Cliente: <span className="font-medium text-gray-900 dark:text-white">
                  {customer.company_name || `${customer.first_name} ${customer.last_name}`}
                </span>
              </p>
              {customer.document_number && (
                <p className="text-gray-600 dark:text-gray-400">
                  {customer.document_type}: {customer.document_number}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Loyalty Section - Only show if customer exists */}
        {customer && (Number(customer.loyalty_points) > 0 || Number(customer.credit_balance) > 0) && (
          <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-sm border border-purple-200 dark:border-purple-800 animate-fade-down duration-normal">
            <h3 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <MdAttachMoney className="w-5 h-5 text-purple-500" />
              Puntos y Crédito
            </h3>

            <div className="grid grid-cols-2 gap-4">
              {/* Points Redemption */}
              {Number(customer.loyalty_points) > 0 && (
                <div className="space-y-2 animate-fade-up duration-normal">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Canjear Puntos
                    </label>
                    <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                      Disponible: {Number(customer.loyalty_points)} pts
                    </span>
                  </div>
                  <Input
                    type="number"
                    min="0"
                    max={Math.min(Number(customer.loyalty_points), Math.floor(remainingAmount * 10))}
                    step="10"
                    value={pointsToRedeem || ''}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      const maxPoints = Math.min(
                        Number(customer.loyalty_points),
                        Math.floor(remainingAmount * 10) // 10 points = $1
                      );
                      onPointsToRedeemChange(Math.min(value, maxPoints));
                    }}
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {pointsToRedeem > 0 ? `= ${formatCurrency(pointsToRedeem / 10)}` : '10 puntos = $1'}
                  </p>
                  {pointsToRedeem > 0 && (
                    <button
                      onClick={() => onPointsToRedeemChange(0)}
                      className="text-xs text-purple-600 dark:text-purple-400 hover:underline"
                    >
                      Limpiar
                    </button>
                  )}
                </div>
              )}

              {/* Credit Usage */}
              {Number(customer.credit_balance) > 0 && (
                <div className="space-y-2 animate-fade-up duration-light-slow">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Usar Crédito
                    </label>
                    <span className="text-xs text-pink-600 dark:text-pink-400 font-medium">
                      Disponible: {formatCurrency(Number(customer.credit_balance))}
                    </span>
                  </div>
                  <Input
                    type="number"
                    min="0"
                    max={Math.min(Number(customer.credit_balance), remainingAmount)}
                    step="0.01"
                    value={creditToUse || ''}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || 0;
                      const maxCredit = Math.min(
                        Number(customer.credit_balance),
                        remainingAmount
                      );
                      onCreditToUseChange(Math.min(value, maxCredit));
                    }}
                    placeholder="0.00"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => onCreditToUseChange(Math.min(Number(customer.credit_balance), remainingAmount))}
                      className="text-xs text-pink-600 dark:text-pink-400 hover:underline"
                    >
                      Usar todo
                    </button>
                    {creditToUse > 0 && (
                      <button
                        onClick={() => onCreditToUseChange(0)}
                        className="text-xs text-pink-600 dark:text-pink-400 hover:underline"
                      >
                        Limpiar
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Change as Credit Option */}
            {change > 10 && (
              <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 animate-fade-up duration-slow">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={changeAsCredit}
                    onChange={(e) => onChangeAsCreditChange(e.target.checked)}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      Guardar vuelto como crédito
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      El vuelto de {formatCurrency(change)} se guardará como crédito en la cuenta del cliente
                    </p>
                  </div>
                </label>
              </div>
            )}
          </div>
        )}

        {/* Payment Section */}
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
                      <MdClose className="w-4 h-4" />
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
            disabled={remainingAmount > 0 || processing || !isInvoiceTypeAValid()}
            loading={processing}
            className="animate-fade-up duration-very-slow"
          >
            Completar Venta
          </Button>
        </div>
        </div>
      </div>
    </Modal>
  );
};

export default PaymentModal;
