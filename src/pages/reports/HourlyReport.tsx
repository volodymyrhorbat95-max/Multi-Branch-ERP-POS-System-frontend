import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchHourlyReport } from '../../store/slices/reportsSlice';

const HourlyReport: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { hourlyReport, loading, error } = useSelector((state: RootState) => state.reports);

  const [filters, setFilters] = useState({
    branch_id: '',
    start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    dispatch(fetchHourlyReport(filters));
  }, [dispatch, filters]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount);
  };

  const formatPercent = (value: string | number) => {
    return `${typeof value === 'string' ? value : value.toFixed(2)}%`;
  };

  const getDayName = (dayNum: number) => {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return days[dayNum] || 'N/A';
  };

  const getHourColor = (percentage: string) => {
    const pct = parseFloat(percentage);
    if (pct >= 8) return 'bg-green-500';
    if (pct >= 5) return 'bg-blue-500';
    if (pct >= 3) return 'bg-yellow-500';
    return 'bg-gray-400';
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-sm shadow-md p-6 animate-fade-down duration-fast">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Reporte de Ventas por Hora</h2>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex flex-col flex-1 animate-flip-up duration-fast">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Desde:
            </label>
            <input
              type="date"
              value={filters.start_date}
              onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div className="flex flex-col flex-1 animate-flip-up duration-normal">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Hasta:
            </label>
            <input
              type="date"
              value={filters.end_date}
              onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="bg-white dark:bg-gray-800 rounded-sm shadow-md p-8 text-center animate-zoom-in duration-normal">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-primary-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-sm p-4 animate-fade-up duration-fast">
          <p className="text-red-800 dark:text-red-200">Error: {error}</p>
        </div>
      ) : hourlyReport ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-sm shadow-md p-6 text-white animate-fade-up duration-fast">
              <h3 className="text-sm font-medium opacity-90">Total Ventas</h3>
              <p className="text-2xl font-bold mt-2">{hourlyReport.summary.total_sales.toLocaleString()}</p>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-sm shadow-md p-6 text-white animate-fade-up duration-normal">
              <h3 className="text-sm font-medium opacity-90">Ingresos Totales</h3>
              <p className="text-2xl font-bold mt-2">{formatCurrency(hourlyReport.summary.total_revenue)}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-sm shadow-md p-6 text-white animate-fade-up duration-light-slow">
              <h3 className="text-sm font-medium opacity-90">Ventas Promedio/Hora</h3>
              <p className="text-2xl font-bold mt-2">{hourlyReport.summary.avg_hourly_sales.toFixed(1)}</p>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-sm shadow-md p-6 text-white animate-fade-up duration-slow">
              <h3 className="text-sm font-medium opacity-90">Ingresos Promedio/Hora</h3>
              <p className="text-2xl font-bold mt-2">{formatCurrency(hourlyReport.summary.avg_hourly_revenue)}</p>
            </div>
          </div>

          {/* Peak and Slow Hours */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Peak Hours */}
            <div className="bg-white dark:bg-gray-800 rounded-sm shadow-md p-6 animate-fade-up duration-normal">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Horas Pico</h3>
              <div className="space-y-3">
                {hourlyReport.peak_hours?.slice(0, 5).map((hour: any, idx: number) => (
                  <div key={hour.hour} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-sm">
                    <div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{hour.hour_label}</span>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{hour.sales_count} ventas</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-600 dark:text-green-400">{formatCurrency(hour.revenue)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Slow Hours */}
            <div className="bg-white dark:bg-gray-800 rounded-sm shadow-md p-6 animate-fade-up duration-normal">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Horas Bajas</h3>
              <div className="space-y-3">
                {hourlyReport.slow_hours?.slice(0, 5).map((hour: any, idx: number) => (
                  <div key={hour.hour} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-sm">
                    <div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{hour.hour_label}</span>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{hour.sales_count} ventas</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-red-600 dark:text-red-400">{formatCurrency(hour.revenue)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Hourly Data Table */}
          <div className="bg-white dark:bg-gray-800 rounded-sm shadow-md overflow-hidden animate-fade-up duration-normal">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Desglose por Hora</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700 animate-fade-down duration-fast">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Hora</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ventas</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ingresos</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ticket Prom.</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Mín.</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Máx.</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">% Ventas</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">% Ingresos</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {hourlyReport.hourly_data?.map((hour: any, idx: number) => (
                    <tr key={hour.hour} className={`hover:bg-gray-50 dark:hover:bg-gray-700 animate-zoom-in ${idx % 3 === 0 ? 'duration-fast' : idx % 3 === 1 ? 'duration-normal' : 'duration-light-slow'}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{hour.hour_label}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {hour.sales_count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {formatCurrency(hour.revenue)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {formatCurrency(hour.avg_ticket)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {formatCurrency(hour.min_ticket)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {formatCurrency(hour.max_ticket)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-900 dark:text-white mr-2">
                            {formatPercent(hour.sales_percentage)}
                          </span>
                          <div className="w-16 bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                            <div
                              className={`h-2 rounded-full ${getHourColor(hour.sales_percentage)}`}
                              style={{ width: `${Math.min(parseFloat(hour.sales_percentage) * 10, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-900 dark:text-white mr-2">
                            {formatPercent(hour.revenue_percentage)}
                          </span>
                          <div className="w-16 bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                            <div
                              className={`h-2 rounded-full ${getHourColor(hour.revenue_percentage)}`}
                              style={{ width: `${Math.min(parseFloat(hour.revenue_percentage) * 10, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Day of Week Data */}
          {hourlyReport.day_of_week_data && hourlyReport.day_of_week_data.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-sm shadow-md overflow-hidden animate-fade-up duration-normal">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Distribución por Día de la Semana</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Día</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ventas</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ingresos</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ticket Promedio</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {hourlyReport.day_of_week_data.map((day: any) => (
                      <tr key={day.day_of_week} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {day.day_name || getDayName(day.day_of_week)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {day.sales_count}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {formatCurrency(day.revenue)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {formatCurrency(day.avg_ticket)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
};

export default HourlyReport;
