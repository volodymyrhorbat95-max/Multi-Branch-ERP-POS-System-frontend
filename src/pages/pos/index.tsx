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
} from '../../store/slices/posSlice';
import { searchProducts } from '../../store/slices/productsSlice';
import { quickSearchCustomers } from '../../store/slices/customersSlice';
import { useNavigation } from '../../hooks';
import type { Product, Customer, QuickSearchCustomer } from '../../types';
import NoActiveSessionCard from './NoActiveSessionCard';
import OpenSessionModal from './OpenSessionModal';
import TopBar from './TopBar';
import ProductsGrid from './ProductsGrid';
import CartSection from './CartSection';
import QuantityModal from './QuantityModal';
import CustomerSearchModal from './CustomerSearchModal';
import PaymentModal from './PaymentModal';
import SaleSuccessModal from './SaleSuccessModal';

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
  const { cart, payments, searchResults, lastSale } = useAppSelector((state) => state.pos);
  const { products, loading: productsLoading } = useAppSelector((state) => state.products);
  const { quickSearchResults: customerSearchResults, loading: customersLoading } = useAppSelector((state) => state.customers);
  const { currentBranch, currentSession: activeSession } = useAppSelector((state) => state.auth);

  // Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showOpenSessionModal, setShowOpenSessionModal] = useState(false);
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

  // Debounced search
  const debouncedSearch = useDebounce(searchQuery, 300);
  const debouncedCustomerSearch = useDebounce(customerSearch, 300);

  // Load products on mount
  useEffect(() => {
    if (currentBranch?.id) {
      dispatch(searchProducts({ query: '', branch_id: currentBranch.id }));
    }
  }, [dispatch, currentBranch?.id]);

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

  // Calculate remaining amount
  const totalPaid = useMemo(() => {
    return payments.reduce((sum, p) => sum + Number(p.amount), 0);
  }, [payments]);

  const remainingAmount = useMemo(() => {
    return Math.max(0, Number(cart.total) - totalPaid);
  }, [cart.total, totalPaid]);

  const change = useMemo(() => {
    return Math.max(0, totalPaid - Number(cart.total));
  }, [totalPaid, cart.total]);

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

    const paymentData: any = {
      payment_method_id: selectedPaymentMethod,
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
    if (!currentBranch?.id || !activeSession?.id || !activeSession?.register_id) return;
    if (remainingAmount > 0) return;

    const result = await dispatch(completeSale({
      branch_id: currentBranch.id,
      register_id: activeSession.register_id,
      session_id: activeSession.id,
    }));

    if (completeSale.fulfilled.match(result)) {
      setShowPaymentModal(false);
      setShowSuccessModal(true);
      // Sale completed successfully - cart cleared by reducer
    }
  }, [dispatch, currentBranch?.id, activeSession?.id, activeSession?.register_id, remainingAmount]);

  // Clear all
  const handleClearCart = useCallback(() => {
    dispatch(clearCart());
    dispatch(clearPayments());
  }, [dispatch]);

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

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <ProductsGrid
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          products={displayProducts}
          loading={productsLoading}
          onProductClick={handleProductClick}
          formatCurrency={formatCurrency}
        />

        <CartSection
          customer={cart.customer || null}
          cart={cart.items}
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
        loading={customersLoading}
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
      />

      <SaleSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        sale={lastSale}
      />
    </div>
  );
};

export default POSPage;
