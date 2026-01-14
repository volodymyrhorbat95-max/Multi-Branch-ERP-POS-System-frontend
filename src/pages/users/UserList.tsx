import React from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { deactivateUser, unlockUser, resetUserPassword } from '../../store/slices/usersSlice';
import { Button } from '../../components/ui';
import type { User } from '../../types';

interface UserListProps {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  onPageChange: (page: number) => void;
  onEditUser: (user: User) => void;
  onRefresh: () => void;
}

const UserList: React.FC<UserListProps> = ({
  users,
  pagination,
  onPageChange,
  onEditUser,
  onRefresh,
}) => {
  const dispatch = useAppDispatch();
  const { user: currentUser } = useAppSelector((state) => state.auth);

  const handleDeactivate = async (userId: string) => {
    if (window.confirm('¿Estás seguro de desactivar este usuario?')) {
      await dispatch(deactivateUser(userId));
      onRefresh();
    }
  };

  const handleUnlock = async (userId: string) => {
    await dispatch(unlockUser(userId));
    onRefresh();
  };

  const handleResetPassword = async (userId: string) => {
    const newPassword = window.prompt(
      'Ingresa la nueva contraseña temporal para este usuario:'
    );
    if (newPassword && newPassword.length >= 8) {
      await dispatch(resetUserPassword({ id: userId, newPassword }));
      alert('Contraseña restablecida. El usuario deberá cambiarla en su próximo inicio de sesión.');
    } else if (newPassword) {
      alert('La contraseña debe tener al menos 8 caracteres');
    }
  };

  const isLocked = (user: User) => {
    return user.locked_until && new Date(user.locked_until) > new Date();
  };

  const formatDate = (date: string | null | undefined) => {
    if (!date) return 'Nunca';
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-sm shadow-md overflow-hidden">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Usuario
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Rol
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Sucursal
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Último Acceso
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
            {users.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <div className="text-gray-500 dark:text-gray-400">
                    <svg
                      className="w-12 h-12 mx-auto mb-4 opacity-50"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                    <p className="text-lg font-medium">No se encontraron usuarios</p>
                    <p className="text-sm mt-1">
                      Intenta ajustar los filtros o crea un nuevo usuario
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              users.map((user) => {
                const locked = isLocked(user);
                const isCurrentUser = user.id === currentUser?.id;

                return (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                          <span className="text-primary-700 dark:text-primary-300 font-semibold">
                            {user.first_name?.charAt(0)}
                            {user.last_name?.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.first_name} {user.last_name}
                            {isCurrentUser && (
                              <span className="ml-2 text-xs text-primary-600 dark:text-primary-400">
                                (Tú)
                              </span>
                            )}
                          </div>
                          {user.employee_code && (
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {user.employee_code}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-sm bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                        {user.role?.name || 'Sin rol'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {user.primary_branch?.name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {locked ? (
                        <span className="px-2 py-1 text-xs font-medium rounded-sm bg-warning-100 dark:bg-warning-900/30 text-warning-800 dark:text-warning-300 flex items-center gap-1 w-fit">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Bloqueado
                        </span>
                      ) : user.is_active ? (
                        <span className="px-2 py-1 text-xs font-medium rounded-sm bg-success-100 dark:bg-success-900/30 text-success-800 dark:text-success-300">
                          Activo
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium rounded-sm bg-danger-100 dark:bg-danger-900/30 text-danger-800 dark:text-danger-300">
                          Inactivo
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(user.last_login_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onEditUser(user)}
                          className="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-300"
                          title="Editar"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>

                        {locked && (
                          <button
                            onClick={() => handleUnlock(user.id)}
                            className="text-warning-600 dark:text-warning-400 hover:text-warning-900 dark:hover:text-warning-300"
                            title="Desbloquear"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                              />
                            </svg>
                          </button>
                        )}

                        {!isCurrentUser && (
                          <>
                            <button
                              onClick={() => handleResetPassword(user.id)}
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                              title="Restablecer contraseña"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                                />
                              </svg>
                            </button>

                            {user.is_active && (
                              <button
                                onClick={() => handleDeactivate(user.id)}
                                className="text-danger-600 dark:text-danger-400 hover:text-danger-900 dark:hover:text-danger-300"
                                title="Desactivar"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                                  />
                                </svg>
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-t border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Mostrando{' '}
              <span className="font-medium">
                {(pagination.page - 1) * pagination.limit + 1}
              </span>{' '}
              a{' '}
              <span className="font-medium">
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </span>{' '}
              de <span className="font-medium">{pagination.total}</span> usuarios
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onPageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                Anterior
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                  .filter(
                    (page) =>
                      page === 1 ||
                      page === pagination.pages ||
                      Math.abs(page - pagination.page) <= 1
                  )
                  .map((page, index, array) => (
                    <React.Fragment key={page}>
                      {index > 0 && array[index - 1] !== page - 1 && (
                        <span className="px-2 text-gray-500">...</span>
                      )}
                      <button
                        onClick={() => onPageChange(page)}
                        className={`px-3 py-1 rounded-sm text-sm font-medium transition-colors ${
                          page === pagination.page
                            ? 'bg-primary-500 text-white'
                            : 'bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-500'
                        }`}
                      >
                        {page}
                      </button>
                    </React.Fragment>
                  ))}
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onPageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
              >
                Siguiente
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserList;
