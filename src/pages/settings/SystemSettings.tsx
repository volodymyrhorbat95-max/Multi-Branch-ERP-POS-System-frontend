import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SystemSettings: React.FC = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    company_name: 'Mi Empresa',
    tax_id: '',
    address: '',
    phone: '',
    email: '',
    currency: 'ARS',
    timezone: 'America/Argentina/Buenos_Aires',
    date_format: 'DD/MM/YYYY',
    enable_invoicing: true,
    factuhoy_api_key: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement Redux action for saving system settings
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-sm shadow-md p-6 animate-fade-down duration-normal">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 animate-fade-right duration-fast">Configuración del Sistema</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm p-6 animate-fade-up duration-normal">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 animate-fade-left duration-fast">Información de la Empresa</h3>
            <div className="space-y-4">
              <div className="flex flex-col animate-fade-right duration-normal">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nombre de la Empresa:</label>
                <input
                  type="text"
                  name="company_name"
                  value={settings.company_name}
                  onChange={handleChange}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div className="flex flex-col animate-fade-left duration-light-slow">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">CUIT:</label>
                <input
                  type="text"
                  name="tax_id"
                  value={settings.tax_id}
                  onChange={handleChange}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div className="flex flex-col animate-fade-up duration-normal">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Dirección:</label>
                <input
                  type="text"
                  name="address"
                  value={settings.address}
                  onChange={handleChange}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div className="flex flex-col animate-fade-down duration-fast">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Teléfono:</label>
                <input
                  type="tel"
                  name="phone"
                  value={settings.phone}
                  onChange={handleChange}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div className="flex flex-col animate-zoom-in duration-normal">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email:</label>
                <input
                  type="email"
                  name="email"
                  value={settings.email}
                  onChange={handleChange}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          </section>

          <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm p-6 animate-fade-left duration-light-slow">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 animate-fade-right duration-fast">Configuración Regional</h3>
            <div className="space-y-4">
              <div className="flex flex-col animate-fade-up duration-normal">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Moneda:</label>
                <select
                  name="currency"
                  value={settings.currency}
                  onChange={handleChange}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="ARS">Peso Argentino (ARS)</option>
                  <option value="USD">Dólar (USD)</option>
                </select>
              </div>
              <div className="flex flex-col animate-fade-down duration-fast">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Zona Horaria:</label>
                <select
                  name="timezone"
                  value={settings.timezone}
                  onChange={handleChange}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="America/Argentina/Buenos_Aires">Buenos Aires</option>
                  <option value="America/Argentina/Cordoba">Córdoba</option>
                </select>
              </div>
              <div className="flex flex-col animate-fade-right duration-light-slow">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Formato de Fecha:</label>
                <select
                  name="date_format"
                  value={settings.date_format}
                  onChange={handleChange}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                </select>
              </div>
            </div>
          </section>

          <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm p-6 animate-fade-right duration-normal">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 animate-fade-up duration-fast">Facturación (FactuHoy)</h3>
            <div className="space-y-4">
              <label className="flex items-center gap-2 cursor-pointer animate-fade-left duration-normal">
                <input
                  type="checkbox"
                  name="enable_invoicing"
                  checked={settings.enable_invoicing}
                  onChange={handleChange}
                  className="w-4 h-4 text-primary-600 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-primary-500"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Habilitar facturación electrónica</span>
              </label>
              {settings.enable_invoicing && (
                <div className="flex flex-col animate-zoom-in duration-fast">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">API Key de FactuHoy:</label>
                  <input
                    type="password"
                    name="factuhoy_api_key"
                    value={settings.factuhoy_api_key}
                    onChange={handleChange}
                    placeholder="Ingrese su API Key"
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>
          </section>

          <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm p-6 animate-fade-right duration-normal">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 animate-fade-up duration-fast">Envíos y Entregas</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Configura las zonas de envío, mapeos de barrios y visualiza los envíos realizados.
            </p>
            <div className="space-y-3 animate-fade-left duration-normal">
              <button
                type="button"
                onClick={() => navigate('/shipping/zones')}
                className="w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-fast"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Zonas de Envío</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Configura tarifas por zona</div>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => navigate('/shipping/neighborhoods')}
                className="w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-fast"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Mapeo de Barrios</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Asigna barrios a zonas</div>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => navigate('/shipping/calculator')}
                className="w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-fast"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Calculadora de Envíos</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Prueba el cálculo de costos</div>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => navigate('/shipping/shipments')}
                className="w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-fast"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Gestión de Envíos</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Ver todos los envíos</div>
                  </div>
                </div>
              </button>
            </div>
          </section>

          <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm p-6 animate-fade-left duration-normal">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 animate-fade-up duration-fast">Gestión de Gastos</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Administra los gastos de tu negocio, categorías y reportes.
            </p>
            <div className="space-y-3 animate-fade-right duration-normal">
              <button
                type="button"
                onClick={() => navigate('/expenses')}
                className="w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-fast"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Gastos</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Administra todos los gastos</div>
                  </div>
                </div>
              </button>
            </div>
          </section>

          <button
            type="submit"
            className="px-6 py-3 bg-primary-500 text-white rounded-sm hover:bg-primary-600 transition-colors font-medium animate-flip-up duration-normal"
          >
            Guardar Configuración
          </button>
        </form>
      </div>
    </div>
  );
};

export default SystemSettings;
