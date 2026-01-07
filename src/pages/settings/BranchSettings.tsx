import React, { useState } from 'react';

const BranchSettings: React.FC = () => {
  const [settings, setSettings] = useState({
    receipt_footer: '',
    auto_print_receipt: true,
    require_customer: false,
    enable_discounts: true,
    max_discount_percent: 10,
    tax_id: '',
    tax_condition: '',
    factuhoy_point_of_sale: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement Redux action for saving branch settings
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-sm shadow-md p-6 animate-fade-up duration-normal">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 animate-fade-right duration-fast">Configuración de Sucursal</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col animate-fade-left duration-normal">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Pie de Recibo:</label>
          <textarea
            name="receipt_footer"
            value={settings.receipt_footer}
            onChange={handleChange}
            rows={3}
            placeholder="Texto que aparece al final del recibo..."
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
          />
        </div>

        <label className="flex items-center gap-2 cursor-pointer animate-fade-right duration-light-slow">
          <input
            type="checkbox"
            name="auto_print_receipt"
            checked={settings.auto_print_receipt}
            onChange={handleChange}
            className="w-4 h-4 text-primary-600 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-primary-500"
          />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Imprimir recibo automáticamente</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer animate-fade-up duration-normal">
          <input
            type="checkbox"
            name="require_customer"
            checked={settings.require_customer}
            onChange={handleChange}
            className="w-4 h-4 text-primary-600 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-primary-500"
          />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Requiere seleccionar cliente</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer animate-fade-left duration-fast">
          <input
            type="checkbox"
            name="enable_discounts"
            checked={settings.enable_discounts}
            onChange={handleChange}
            className="w-4 h-4 text-primary-600 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-primary-500"
          />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Habilitar descuentos</span>
        </label>

        {settings.enable_discounts && (
          <div className="flex flex-col animate-zoom-in duration-fast">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Descuento máximo (%):</label>
            <input
              type="number"
              name="max_discount_percent"
              value={settings.max_discount_percent}
              onChange={handleChange}
              min="0"
              max="100"
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        )}

        {/* Facturación Electrónica Section */}
        <div className="pt-6 border-t border-gray-200 dark:border-gray-700 space-y-4 animate-fade-up duration-light-slow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Facturación Electrónica (AFIP)
          </h3>

          <div className="flex flex-col animate-fade-right duration-normal">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">CUIT / CUIL:</label>
            <input
              type="text"
              name="tax_id"
              value={settings.tax_id}
              onChange={handleChange}
              placeholder="20-12345678-9"
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div className="flex flex-col animate-fade-left duration-normal">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Condición IVA:</label>
            <select
              name="tax_condition"
              value={settings.tax_condition}
              onChange={handleChange}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Seleccionar...</option>
              <option value="Responsable Inscripto">Responsable Inscripto</option>
              <option value="Monotributista">Monotributista</option>
              <option value="Exento">Exento</option>
              <option value="Consumidor Final">Consumidor Final</option>
            </select>
          </div>

          <div className="flex flex-col animate-fade-up duration-normal">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Número de Punto de Venta (FactuHoy):
            </label>
            <input
              type="number"
              name="factuhoy_point_of_sale"
              value={settings.factuhoy_point_of_sale}
              onChange={handleChange}
              min="1"
              max="9999"
              placeholder="Ej: 1, 2, 3..."
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Este número debe coincidir con el punto de venta configurado en FactuHoy para esta sucursal
            </p>
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-3 bg-primary-500 text-white rounded-sm hover:bg-primary-600 transition-colors font-medium animate-flip-up duration-normal"
        >
          Guardar Configuración
        </button>
      </form>
    </div>
  );
};

export default BranchSettings;
