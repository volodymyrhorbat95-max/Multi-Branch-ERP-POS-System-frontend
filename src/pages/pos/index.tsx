import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
  setCustomer,
  completeSale,
  addPayment,
  removePayment,
  clearPayments,
  loadPaymentMethods,
  applyCartDiscount,
  clearCartDiscount,
} from '../../store/slices/posSlice';
import { searchProducts } from '../../store/slices/productsSlice';
import { quickSearchCustomers } from '../../store/slices/customersSlice';
import { useNavigation } from '../../hooks';
import type { Product, Customer, QuickSearchCustomer } from '../../types';
import NoActiveSessionCard from './NoActiveSessionCard';
import OpenSessionModal from './OpenSessionModal';
import CloseSessionModal from './CloseSessionModal';
import WithdrawalModal from './WithdrawalModal';
import DiscountModal from './DiscountModal';
import TopBar from './TopBar';
import ProductsGrid from './ProductsGrid';
import CartSection from './CartSection';
import QuantityModal from './QuantityModal';
import CustomerSearchModal from './CustomerSearchModal';
import PaymentModal from './PaymentModal';
import SaleSuccessModal from './SaleSuccessModal';
import { withdrawalService } from '../../services/api';
import type { CreateWithdrawalData } from '../../types';
import { MdPayment, MdLock } from 'react-icons/md';

// Debounce hook
const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const POSPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { goTo } = useNavigation();

  // Redux state
  const { cart, payments, searchResults, lastSale, paymentMethods } = useAppSelector((state) => state.pos);
  const { products } = useAppSelector((state) => state.products);
  const { quickSearchResults: customerSearchResults } = useAppSelector((state) => state.customers);
  const { user, currentBranch, currentSession: activeSession } = useAppSelector((state) => state.auth);
  const loading = useAppSelector((state) => state.ui.loading);

  // Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showOpenSessionModal, setShowOpenSessionModal] = useState(false);
  const [showCloseSessionModal, setShowCloseSessionModal] = useState(false);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState('1');
  const [cashReceived, setCashReceived] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('CASH');

  // Payment reference fields
  const [referenceNumber, setReferenceNumber] = useState('');
  const [authorizationCode, setAuthorizationCode] = useState('');
  const [cardLastFour, setCardLastFour] = useState('');
  const [cardBrand, setCardBrand] = useState('');
  const [qrProvider, setQrProvider] = useState('');
  const [qrTransactionId, setQrTransactionId] = useState('');

  // Invoice-related fields - Initialize with branch default
  const [invoiceType, setInvoiceType] = useState<'A' | 'B' | 'C' | null>(
    (currentBranch?.default_invoice_type as 'A' | 'B' | 'C') || 'B'
  );
  const [customerCuit, setCustomerCuit] = useState('');
  const [customerTaxCondition, setCustomerTaxCondition] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');

  // Loyalty-related fields
  const [pointsToRedeem, setPointsToRedeem] = useState(0);
  const [creditToUse, setCreditToUse] = useState(0);
  const [changeAsCredit, setChangeAsCredit] = useState(false);

  // Update invoice type when branch changes
  useEffect(() => {
    if (currentBranch?.default_invoice_type) {
      setInvoiceType(currentBranch.default_invoice_type as 'A' | 'B' | 'C');
    }
  }, [currentBranch]);

  // Auto-populate invoice fields when customer changes
  useEffect(() => {
    if (cart.customer) {
      // Auto-fill CUIT if available
      if (cart.customer.document_number) {
        setCustomerCuit(cart.customer.document_number);
      }
      // Auto-fill tax condition
      if (cart.customer.tax_condition) {
        setCustomerTaxCondition(cart.customer.tax_condition);
      }
      // Auto-fill address
      if (cart.customer.address) {
        setCustomerAddress(cart.customer.address);
      }
    } else {
      // Clear invoice fields when customer is removed
      setCustomerCuit('');
      setCustomerTaxCondition('');
      setCustomerAddress('');
      // Reset to branch default
      setInvoiceType((currentBranch?.default_invoice_type as 'A' | 'B' | 'C') || 'B');
    }
  }, [cart.customer, currentBranch]);

  // Debounced search
  const debouncedSearch = useDebounce(searchQuery, 300);
  const debouncedCustomerSearch = useDebounce(customerSearch, 300);

  // Load products and payment methods on mount
  useEffect(() => {
    if (currentBranch?.id) {
      dispatch(searchProducts({ query: '', branch_id: currentBranch.id }));
    }
  }, [dispatch, currentBranch?.id]);

  // Load payment methods on mount
  useEffect(() => {
    dispatch(loadPaymentMethods());
  }, [dispatch]);

  // Search products
  useEffect(() => {
    if (debouncedSearch && currentBranch?.id) {
      dispatch(searchProducts({ query: debouncedSearch, branch_id: currentBranch.id }));
    }
  }, [dispatch, debouncedSearch, currentBranch?.id]);

  // Search customers
  useEffect(() => {
    if (debouncedCustomerSearch) {
      dispatch(quickSearchCustomers(debouncedCustomerSearch));
    }
  }, [dispatch, debouncedCustomerSearch]);

  // Handle barcode scanned
  const handleBarcodeScanned = useCallback(async (barcode: string) => {
    if (!currentBranch?.id) return;

    // Search for product by barcode
    const result = await dispatch(searchProducts({ query: barcode, branch_id: currentBranch.id }));

    if (searchProducts.fulfilled.match(result)) {
      const foundProducts = result.payload;

      if (foundProducts && foundProducts.length > 0) {
        const product = foundProducts[0];

        // Check stock
        if (product.stock_quantity && product.stock_quantity <= 0) {
          alert(`Producto "${product.name}" sin stock`);
          return;
        }

        // Add to cart with quantity 1
        dispatch(addToCart({
          product: {
            ...product,
            stock_quantity: product.stock_quantity || 0,
          },
          quantity: 1,
        }));
      } else {
        alert(`Código de barras "${barcode}" no encontrado`);
      }
    }
  }, [dispatch, currentBranch?.id]);

  // Barcode scanner support
  useEffect(() => {
    let barcodeBuffer = '';
    let lastKeyTime = Date.now();

    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input field
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        return;
      }

      const currentTime = Date.now();
      const timeDiff = currentTime - lastKeyTime;

      // If more than 100ms between keys, reset buffer (human typing)
      if (timeDiff > 100) {
        barcodeBuffer = '';
      }

      lastKeyTime = currentTime;

      // Enter key indicates end of barcode scan
      if (e.key === 'Enter' && barcodeBuffer.length > 0) {
        e.preventDefault();
        handleBarcodeScanned(barcodeBuffer);
        barcodeBuffer = '';
      } else if (e.key.length === 1) {
        // Single character key
        barcodeBuffer += e.key;
      }
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, [handleBarcodeScanned]);

  // Display products - use search results if searching
  const displayProducts = useMemo(() => {
    if (searchQuery && searchResults.length > 0) {
      return searchResults;
    }
    return products;
  }, [searchQuery, searchResults, products]);

  // Calculate total after loyalty deductions
  const finalTotal = useMemo(() => {
    const baseTotal = Number(cart.total);
    const pointsValue = pointsToRedeem * 0.1; // 10 points = $1
    const creditValue = creditToUse;
    return Math.max(0, baseTotal - pointsValue - creditValue);
  }, [cart.total, pointsToRedeem, creditToUse]);

  // Calculate remaining amount
  const totalPaid = useMemo(() => {
    return payments.reduce((sum, p) => sum + Number(p.amount), 0);
  }, [payments]);

  const remainingAmount = useMemo(() => {
    return Math.max(0, finalTotal - totalPaid);
  }, [finalTotal, totalPaid]);

  const change = useMemo(() => {
    return Math.max(0, totalPaid - finalTotal);
  }, [totalPaid, finalTotal]);

  // Map payment method codes to UUIDs
  const paymentMethodMap = useMemo(() => {
    const map: Record<string, string> = {};
    paymentMethods.forEach((pm) => {
      if (pm.code) {
        map[pm.code] = pm.id;
      }
    });
    return map;
  }, [paymentMethods]);

  // Handle product click - add to cart or show quantity modal
  const handleProductClick = useCallback((product: Product) => {
    if (product.stock_quantity && product.stock_quantity <= 0) {
      return; // Out of stock
    }
    setSelectedProduct(product);
    setQuantity('1');
    setShowQuantityModal(true);
  }, []);

  const handleAddToCart = useCallback(() => {
    if (!selectedProduct) return;

    const qty = parseFloat(quantity) || 1;
    if (qty <= 0) return;

    dispatch(addToCart({
      product: {
        ...selectedProduct,
        stock_quantity: selectedProduct.stock_quantity || 0,
      },
      quantity: qty,
    }));

    setShowQuantityModal(false);
    setSelectedProduct(null);
    setQuantity('1');
  }, [dispatch, selectedProduct, quantity]);

  // Handle cart item quantity change
  const handleQuantityChange = useCallback((itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      dispatch(removeFromCart(itemId));
    } else {
      dispatch(updateCartItemQuantity({ itemId, quantity: newQuantity }));
    }
  }, [dispatch]);

  // Handle customer selection
  const handleSelectCustomer = useCallback((selectedCustomer: QuickSearchCustomer) => {
    dispatch(setCustomer(selectedCustomer as unknown as Customer));
    setShowCustomerModal(false);
    setCustomerSearch('');
  }, [dispatch]);

  const handleRemoveCustomer = useCallback(() => {
    dispatch(setCustomer(undefined));
  }, [dispatch]);

  // Handle discount
  const handleApplyDiscount = useCallback((
    type: 'PERCENT' | 'FIXED',
    value: number,
    reason: string,
    managerPin?: string
  ) => {
    dispatch(applyCartDiscount({ type, value, reason, managerPin }));
    setShowDiscountModal(false);
  }, [dispatch]);

  const handleRemoveDiscount = useCallback(() => {
    dispatch(clearCartDiscount());
  }, [dispatch]);

  // Handle payment
  const handleAddPayment = useCallback(() => {
    const amount = selectedPaymentMethod === 'CASH' && cashReceived
      ? parseFloat(cashReceived)
      : remainingAmount;

    if (amount <= 0) return;

    // Validate required fields based on payment method
    if (selectedPaymentMethod === 'TRANSFER' && !referenceNumber.trim()) {
      alert('El número de comprobante es obligatorio para transferencias');
      return;
    }

    if ((selectedPaymentMethod === 'DEBIT' || selectedPaymentMethod === 'CREDIT') && !authorizationCode.trim()) {
      alert('El código de autorización es obligatorio para pagos con tarjeta');
      return;
    }

    // Map payment method code to UUID
    const paymentMethodId = paymentMethodMap[selectedPaymentMethod];
    if (!paymentMethodId) {
      alert(`Método de pago ${selectedPaymentMethod} no disponible`);
      return;
    }

    const paymentData: any = {
      payment_method_id: paymentMethodId,
      amount: Math.min(amount, remainingAmount + change),
    };

    // Add reference fields based on payment method
    if (selectedPaymentMethod === 'TRANSFER' && referenceNumber) {
      paymentData.reference_number = referenceNumber;
    }

    if (selectedPaymentMethod === 'DEBIT' || selectedPaymentMethod === 'CREDIT') {
      if (authorizationCode) paymentData.authorization_code = authorizationCode;
      if (cardLastFour) paymentData.card_last_four = cardLastFour;
      if (cardBrand) paymentData.card_brand = cardBrand;
    }

    if (selectedPaymentMethod === 'QR') {
      if (qrProvider) paymentData.qr_provider = qrProvider;
      if (qrTransactionId) paymentData.qr_transaction_id = qrTransactionId;
    }

    dispatch(addPayment(paymentData));

    // Clear all payment fields
    setCashReceived('');
    setReferenceNumber('');
    setAuthorizationCode('');
    setCardLastFour('');
    setCardBrand('');
    setQrProvider('');
    setQrTransactionId('');
  }, [
    dispatch,
    selectedPaymentMethod,
    cashReceived,
    remainingAmount,
    change,
    referenceNumber,
    authorizationCode,
    cardLastFour,
    cardBrand,
    qrProvider,
    qrTransactionId
  ]);

  // Complete sale
  const handleCompleteSale = useCallback(async () => {
    if (!currentBranch?.id || !activeSession?.id || !activeSession?.register_id || !user?.id) return;
    if (remainingAmount > 0) return;

    // Prepare invoice override data if user selected a specific invoice type
    const invoiceOverride = invoiceType ? {
      invoice_type: invoiceType,
      customer_cuit: invoiceType === 'A' ? customerCuit : undefined,
      customer_tax_condition: invoiceType === 'A' ? customerTaxCondition : undefined,
      customer_address: invoiceType === 'A' ? customerAddress : undefined,
    } : undefined;

    const result = await dispatch(completeSale({
      branch_id: currentBranch.id,
      register_id: activeSession.register_id,
      session_id: activeSession.id,
      user_id: user.id,
      invoice_override: invoiceOverride,
      // Loyalty data
      points_to_redeem: pointsToRedeem,
      credit_to_use: creditToUse,
      change_as_credit: changeAsCredit,
    }));

    if (completeSale.fulfilled.match(result)) {
      setShowPaymentModal(false);
      setShowSuccessModal(true);
      // Sale completed successfully - cart cleared by reducer

      // Reset invoice fields for next sale
      setInvoiceType('B');
      setCustomerCuit('');
      setCustomerTaxCondition('');
      setCustomerAddress('');

      // Reset loyalty fields for next sale
      setPointsToRedeem(0);
      setCreditToUse(0);
      setChangeAsCredit(false);
    }
  }, [
    dispatch,
    currentBranch?.id,
    activeSession?.id,
    activeSession?.register_id,
    user?.id,
    remainingAmount,
    invoiceType,
    customerCuit,
    customerTaxCondition,
    customerAddress,
    pointsToRedeem,
    creditToUse,
    changeAsCredit
  ]);

  // Clear all
  const handleClearCart = useCallback(() => {
    dispatch(clearCart());
    dispatch(clearPayments());
  }, [dispatch]);

  // Handle withdrawal submission
  const handleWithdrawalSubmit = useCallback(async (data: CreateWithdrawalData) => {
    if (!activeSession?.id) return;

    try {
      await withdrawalService.create(activeSession.id, data);
      // Could dispatch an action to refresh session data or show success message
    } catch (error) {
      console.error('Error creating withdrawal:', error);
      throw error;
    }
  }, [activeSession?.id]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(amount);
  };

  // Check if session is active
  if (!activeSession) {
    return (
      <>
        <NoActiveSessionCard
          onOpenSession={() => setShowOpenSessionModal(true)}
          onNavigateToSessions={() => goTo('/sessions')}
        />
        <OpenSessionModal
          isOpen={showOpenSessionModal}
          onClose={() => setShowOpenSessionModal(false)}
        />
      </>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100 dark:bg-gray-900 overflow-hidden animate-fade-up duration-fast">
      <TopBar
        branchName={currentBranch?.name}
        registerName={activeSession?.register?.name}
        onBack={() => goTo('/dashboard')}
      />

      {/* Session Actions Toolbar */}
      <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-end gap-2">
        <button
          onClick={() => setShowWithdrawalModal(true)}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
        >
          <MdPayment className="w-4 h-4" />
          Retiro de Efectivo
        </button>
        <button
          onClick={() => setShowCloseSessionModal(true)}
          className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-sm transition-colors flex items-center gap-2"
        >
          <MdLock className="w-4 h-4" />
          Cerrar Caja
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <ProductsGrid
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          products={displayProducts}
          loading={loading}
          onProductClick={handleProductClick}
          formatCurrency={formatCurrency}
        />

        <CartSection
          customer={cart.customer || null}
          cart={cart.items || []}
          totals={{
            subtotal: Number(cart.subtotal),
            discount: Number(cart.discount_amount),
            tax: Number(cart.tax_amount),
            total: Number(cart.total)
          }}
          onAddCustomer={() => setShowCustomerModal(true)}
          onRemoveCustomer={handleRemoveCustomer}
          onQuantityChange={handleQuantityChange}
          onRemoveItem={(itemId) => dispatch(removeFromCart(itemId))}
          onClearCart={handleClearCart}
          onProceedToPayment={() => setShowPaymentModal(true)}
          onApplyDiscount={() => setShowDiscountModal(true)}
          onRemoveDiscount={handleRemoveDiscount}
          formatCurrency={formatCurrency}
        />
      </div>

      {/* Modals */}
      <QuantityModal
        isOpen={showQuantityModal}
        onClose={() => {
          setShowQuantityModal(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
        quantity={quantity}
        onQuantityChange={setQuantity}
        onSubmit={handleAddToCart}
        formatCurrency={formatCurrency}
      />

      <CustomerSearchModal
        isOpen={showCustomerModal}
        onClose={() => {
          setShowCustomerModal(false);
          setCustomerSearch('');
        }}
        searchQuery={customerSearch}
        onSearchChange={setCustomerSearch}
        customers={customerSearchResults}
        loading={loading}
        onSelectCustomer={handleSelectCustomer}
        debouncedSearch={debouncedCustomerSearch}
      />

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        selectedMethod={selectedPaymentMethod}
        onMethodChange={setSelectedPaymentMethod}
        cashReceived={cashReceived}
        onCashReceivedChange={setCashReceived}
        referenceNumber={referenceNumber}
        onReferenceNumberChange={setReferenceNumber}
        authorizationCode={authorizationCode}
        onAuthorizationCodeChange={setAuthorizationCode}
        cardLastFour={cardLastFour}
        onCardLastFourChange={setCardLastFour}
        cardBrand={cardBrand}
        onCardBrandChange={setCardBrand}
        qrProvider={qrProvider}
        onQrProviderChange={setQrProvider}
        qrTransactionId={qrTransactionId}
        onQrTransactionIdChange={setQrTransactionId}
        payments={payments}
        onRemovePayment={(index) => dispatch(removePayment(index))}
        onAddPayment={handleAddPayment}
        onCompleteSale={handleCompleteSale}
        total={Number(cart.total)}
        totalPaid={totalPaid}
        remainingAmount={remainingAmount}
        change={change}
        processing={false}
        formatCurrency={formatCurrency}
        // Invoice props
        customer={cart.customer || null}
        invoiceType={invoiceType}
        onInvoiceTypeChange={setInvoiceType}
        customerCuit={customerCuit}
        onCustomerCuitChange={setCustomerCuit}
        customerTaxCondition={customerTaxCondition}
        onCustomerTaxConditionChange={setCustomerTaxCondition}
        customerAddress={customerAddress}
        onCustomerAddressChange={setCustomerAddress}
        // Loyalty props
        pointsToRedeem={pointsToRedeem}
        onPointsToRedeemChange={setPointsToRedeem}
        creditToUse={creditToUse}
        onCreditToUseChange={setCreditToUse}
        changeAsCredit={changeAsCredit}
        onChangeAsCreditChange={setChangeAsCredit}
      />

      <SaleSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        sale={lastSale && 'sale_number' in lastSale ? lastSale : null}
      />

      <CloseSessionModal
        isOpen={showCloseSessionModal}
        onClose={() => setShowCloseSessionModal(false)}
        session={activeSession}
      />

      <WithdrawalModal
        isOpen={showWithdrawalModal}
        onClose={() => setShowWithdrawalModal(false)}
        onSubmit={handleWithdrawalSubmit}
        sessionId={activeSession?.id || ''}
      />

      <DiscountModal
        isOpen={showDiscountModal}
        onClose={() => setShowDiscountModal(false)}
        onApply={handleApplyDiscount}
        currentTotal={Number(cart.total) + Number(cart.discount_amount)}
        currentDiscountType={cart.discount_type}
        currentDiscountValue={cart.discount_value}
        currentDiscountReason={cart.discount_reason}
      />
    </div>
  );
};

export default POSPage;
