import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchSessions } from '../../store/slices/registersSlice';
import { usePagination } from '../../hooks';
import SessionsList from './SessionsList';
import SessionFilters from './SessionFilters';

const SessionsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { sessions, totalSessions, loading, error } = useSelector((state: RootState) => state.registers);

  // Pagination hook
  const {
    pagination,
    setPage,
    setLimit,
    updateFromResponse,
  } = usePagination({ initialPage: 1, initialLimit: 20 });

  const [filters, setFilters] = useState({
    branch_id: '',
    status: '',
    start_date: '',
    end_date: '',
  });

  useEffect(() => {
    dispatch(fetchSessions({
      ...filters,
      page: pagination.page,
      limit: pagination.limit,
    }));
  }, [dispatch, filters, pagination.page, pagination.limit]);

  // Update pagination from Redux state
  useEffect(() => {
    if (totalSessions > 0) {
      updateFromResponse({
        page: pagination.page,
        limit: pagination.limit,
        total_items: totalSessions,
        total_pages: Math.ceil(totalSessions / pagination.limit),
      });
    }
  }, [totalSessions, pagination.page, pagination.limit, updateFromResponse]);

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters({ ...filters, ...newFilters });
    setPage(1);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-sm shadow-md p-6 animate-fade-down duration-fast">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white animate-zoom-in duration-normal">Cierres de Caja</h1>
      </div>

      <div className="animate-fade-right duration-normal">
        <SessionFilters filters={filters} onFilterChange={handleFilterChange} />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 animate-fade-up duration-fast">
          <div className="text-lg text-gray-600 dark:text-gray-400 animate-zoom-in duration-normal">Cargando cierres...</div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-20 animate-fade-up duration-fast">
          <div className="text-lg text-red-600 dark:text-red-400 animate-zoom-out duration-normal">Error: {error}</div>
        </div>
      ) : (
        <div className="animate-fade-up duration-light-slow">
          <SessionsList
            sessions={sessions}
            loading={loading}
            pagination={pagination}
            onPageChange={setPage}
            onPageSizeChange={setLimit}
          />
        </div>
      )}
    </div>
  );
};

export default SessionsPage;
