import React from 'react';
import { useNavigation } from '../../hooks';
import { useAppSelector } from '../../store';

const Header: React.FC<{ onMenuClick: () => void }> = ({ onMenuClick }) => {
  const { goTo } = useNavigation();
  const { currentBranch, user } = useAppSelector((state) => state.auth);
  const canAccessAllBranches = user?.role?.permissions?.canAccessAllBranches;

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-primary-600/80 dark:bg-primary-700/80 backdrop-blur-md border-b border-primary-500/10 flex items-center justify-between px-4 lg:px-6 z-50">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-white/90 hover:text-white animate-fade-right duration-normal"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Logo - visible on desktop when sidebar is fixed */}
        <div className="hidden lg:flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-sm flex items-center justify-center backdrop-blur-sm">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <span className="font-bold text-white">POS Multi</span>
        </div>
      </div>

      <div className="flex-1 lg:flex-none animate-fade-right duration-normal">
        {!canAccessAllBranches && currentBranch && (
          <span className="text-sm font-medium text-white/95">
            {currentBranch.name}
          </span>
        )}
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-4 animate-fade-left duration-normal">
        {/* Quick POS Access */}
        <button
          onClick={() => goTo('/pos')}
          className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-sm hover:bg-white/30 transition-colors backdrop-blur-sm"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <span className="font-medium">POS</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
