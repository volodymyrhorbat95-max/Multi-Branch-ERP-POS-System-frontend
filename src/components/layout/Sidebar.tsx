import React, { useState, useEffect, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '../../store';
import { logout, setCurrentBranch } from '../../store/slices/authSlice';
import { toggleTheme } from '../../store/slices/uiSlice';
import { useNavigation } from '../../hooks';
import { Branch } from '../../types';
import {
  MdDashboard,
  MdPointOfSale,
  MdInventory,
  MdPeople,
  MdAccountBalance,
  MdBarChart,
  MdWarehouse,
  MdCloudUpload,
  MdCardGiftcard,
  MdReceipt,
  MdNotifications,
  MdSettings,
  MdKeyboardArrowDown,
  MdLightMode,
  MdDarkMode,
  MdLogout,
} from 'react-icons/md';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavigationItem {
  name: string;
  path: string;
  icon: React.ReactElement;
  badge?: number;
}

const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const dispatch = useAppDispatch();
  const { goTo, currentPath } = useNavigation();
  const { user, availableBranches, currentBranch } = useAppSelector((state) => state.auth);
  const { theme } = useAppSelector((state) => state.ui);

  const [branchDropdownOpen, setBranchDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const branchDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  const canAccessAllBranches = user?.role?.permissions?.canAccessAllBranches;

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (branchDropdownRef.current && !branchDropdownRef.current.contains(event.target as Node)) {
        setBranchDropdownOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const navigation: NavigationItem[] = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: <MdDashboard className="w-5 h-5" />,
    },
    {
      name: 'Punto de Venta',
      path: '/pos',
      icon: <MdPointOfSale className="w-5 h-5" />,
    },
    {
      name: 'Productos',
      path: '/products',
      icon: <MdInventory className="w-5 h-5" />,
    },
    {
      name: 'Clientes',
      path: '/customers',
      icon: <MdPeople className="w-5 h-5" />,
    },
    {
      name: 'Sesiones de Caja',
      path: '/sessions',
      icon: <MdAccountBalance className="w-5 h-5" />,
    },
    {
      name: 'Reportes',
      path: '/reports',
      icon: <MdBarChart className="w-5 h-5" />,
    },
    {
      name: 'Inventario',
      path: '/stock',
      icon: <MdWarehouse className="w-5 h-5" />,
    },
    {
      name: 'Importar Precios',
      path: '/prices',
      icon: <MdCloudUpload className="w-5 h-5" />,
    },
    {
      name: 'Fidelización',
      path: '/loyalty',
      icon: <MdCardGiftcard className="w-5 h-5" />,
    },
    {
      name: 'Facturas',
      path: '/invoices',
      icon: <MdReceipt className="w-5 h-5" />,
    },
    {
      name: 'Alertas',
      path: '/alerts',
      icon: <MdNotifications className="w-5 h-5" />,
    },
    {
      name: 'Configuración',
      path: '/settings',
      icon: <MdSettings className="w-5 h-5" />,
    },
  ];

  const handleLogout = () => {
    dispatch(logout());
    goTo('/login');
  };

  const handleBranchChange = (branchId: string) => {
    const branch = availableBranches.find((b: Branch) => b.id === branchId);
    if (branch) {
      dispatch(setCurrentBranch(branch));
    }
    setBranchDropdownOpen(false);
  };

  const isActive = (path: string) => {
    return currentPath === path || currentPath.startsWith(`${path}/`);
  };

  return (
    <aside
      className="fixed inset-y-0 left-0 z-50 w-64 bg-primary-500/95 dark:bg-primary-600/95 backdrop-blur-md lg:translate-x-0 top-[60px]"
    >
      {/* Branch Selector (for owners) */}
      {canAccessAllBranches && availableBranches.length > 1 && (
        <div className="px-4 py-3 border-b border-primary-600/30 animate-fade-right duration-light-slow">
          <div className="relative" ref={branchDropdownRef}>
            <button
              onClick={() => setBranchDropdownOpen(!branchDropdownOpen)}
              className="w-full flex items-center justify-between px-3 py-2 text-sm bg-white/10 rounded-sm hover:bg-white/20 backdrop-blur-sm transition-colors"
            >
              <span className="font-medium text-white">
                {currentBranch?.name || 'Todas las sucursales'}
              </span>
              <MdKeyboardArrowDown className="w-4 h-4 text-white/70" />
            </button>

            {branchDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-primary-800/95 rounded-sm shadow-lg border border-primary-600/30 z-10 animate-fade-down duration-fast backdrop-blur-md">
                <button
                  onClick={() => handleBranchChange('')}
                  className="w-full px-3 py-2 text-left text-sm text-white hover:bg-white/10 first:rounded-t-lg transition-colors"
                >
                  Todas las sucursales
                </button>
                {availableBranches.map((branch: Branch) => (
                  <button
                    key={branch.id}
                    onClick={() => handleBranchChange(branch.id)}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-white/10 last:rounded-b-lg transition-colors ${
                      currentBranch?.id === branch.id ? 'bg-primary-700 text-white font-medium' : 'text-white/80'
                    }`}
                  >
                    {branch.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-0 py-5 overflow-y-auto animate-fade-up duration-normal">
        {navigation.map((item) => (
          <button
            key={item.path}
            onClick={() => {
              goTo(item.path);
              onClose();
            }}
            className={`
              w-full flex items-center gap-3 px-5 py-3 rounded-sm text-sm font-medium
              transition-colors duration-150 animate-fade-right duration-fast
              ${isActive(item.path)
                ? 'bg-primary-600 text-white backdrop-blur-sm'
                : 'text-white/90 hover:bg-white/10 hover:text-white'}
            `}
          >
            <span className={isActive(item.path) ? 'text-white' : 'text-white/60'}>
              {item.icon}
            </span>
            <span className="flex-1 text-left">{item.name}</span>
            {item.badge && item.badge > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-danger-500 rounded-full">
                {item.badge > 9 ? '9+' : item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-primary-600/30 animate-fade-up duration-light-slow">
        <div className="relative" ref={userDropdownRef}>
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="w-full flex items-center gap-3 p-2 rounded-sm hover:bg-white/10 transition-colors"
          >
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <span className="text-white font-semibold">
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </span>
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-white">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-xs text-white/60">
                {user?.role?.name}
              </p>
            </div>
            <MdKeyboardArrowDown className="w-4 h-4 text-white/60" />
          </button>

          {userDropdownOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-1 bg-primary-800/95 rounded-sm shadow-lg border border-primary-600/30 animate-fade-up duration-fast backdrop-blur-md">
              <button
                onClick={() => dispatch(toggleTheme())}
                className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10 flex items-center gap-2 rounded-t-lg transition-colors"
              >
                {theme === 'dark' ? (
                  <>
                    <MdLightMode className="w-4 h-4" />
                    Modo Claro
                  </>
                ) : (
                  <>
                    <MdDarkMode className="w-4 h-4" />
                    Modo Oscuro
                  </>
                )}
              </button>
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-left text-sm text-red-300 hover:bg-white/10 hover:text-red-200 flex items-center gap-2 rounded-b-lg transition-colors"
              >
                <MdLogout className="w-4 h-4" />
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
