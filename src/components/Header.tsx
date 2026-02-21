import React from 'react';
import { TrendingUp, LogOut, Lightbulb, Target, Image, LayoutDashboard, ArrowLeft, Shield } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { MainTab, UserRole } from '../types';
import { Button } from './ui';

interface HeaderProps {
  email: string;
  progress: number;
  onLogout: () => void;
  userRole: UserRole;
}

const tabConfig: { id: MainTab; label: string; icon: React.ElementType }[] = [
  { id: 'business', label: '1. Tu Negocio', icon: Lightbulb },
  { id: 'strategy', label: '2. Estrategia', icon: Target },
  { id: 'visual', label: '3. Visual', icon: Image },
];

const dashboardTab = { id: 'dashboard' as MainTab, label: 'Mis Proyectos', icon: LayoutDashboard };

export const Header = ({ email, progress, onLogout, userRole }: HeaderProps) => (
  <header className="bg-black/60 backdrop-blur-xl px-6 py-4 sticky top-0 z-10 border-b border-neutral-800/50">
    <div className="absolute bottom-0 left-0 h-[2px] bg-neutral-800 w-full">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
      />
    </div>
    <div className="max-w-6xl mx-auto flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-neutral-800 text-white flex items-center justify-center">
          <TrendingUp size={18} strokeWidth={1.5} />
        </div>
        <div>
          <h2 className="font-semibold text-white leading-tight text-sm tracking-tight">Onboarding Premium</h2>
          <p className="text-[11px] text-neutral-500">Consultoría & Branding</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-500 hidden sm:inline font-mono">{email}</span>
          {userRole === 'admin' && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-amber-950/40 text-amber-400 border border-amber-800">
              Admin
            </span>
          )}
        </div>
        <button onClick={onLogout} className="p-2 text-neutral-500 hover:text-white hover:bg-neutral-800 rounded-lg transition-all">
          <LogOut size={16} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  </header>
);

interface TabNavProps {
  activeTab: MainTab;
  setActiveTab: (tab: MainTab) => void;
  hasProjects: boolean;
  isCreatingNew: boolean;
  onBackToDashboard: () => void;
  userRole: UserRole;
}

export const TabNav = ({ activeTab, setActiveTab, hasProjects, isCreatingNew, onBackToDashboard, userRole }: TabNavProps) => {
  const showWizardTabs = !hasProjects || isCreatingNew;
  const showDashboardNav = !showWizardTabs && hasProjects && (activeTab === 'dashboard' || activeTab === 'admin');

  return (
    <div className="flex items-center gap-3 mb-8">
      {isCreatingNew && hasProjects && (
        <button
          onClick={onBackToDashboard}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all shrink-0"
        >
          <ArrowLeft size={16} strokeWidth={1.5} />
          <span className="hidden sm:inline">Volver</span>
        </button>
      )}
      {showWizardTabs && (
        <div className="flex p-1 bg-neutral-800/50 rounded-xl w-fit overflow-x-auto max-w-full border border-neutral-700/50">
          {tabConfig.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                "flex items-center gap-2 px-4 sm:px-5 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
                activeTab === id
                  ? "bg-neutral-900 text-white shadow-sm"
                  : "text-neutral-500 hover:text-neutral-300"
              )}
            >
              <Icon size={15} strokeWidth={1.5} />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      )}
      {showDashboardNav && (
        <div className="flex p-1 bg-neutral-800/50 rounded-xl w-fit border border-neutral-700/50">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={cn(
              "flex items-center gap-2 px-4 sm:px-5 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
              activeTab === 'dashboard'
                ? "bg-neutral-900 text-white shadow-sm"
                : "text-neutral-500 hover:text-neutral-300"
            )}
          >
            <LayoutDashboard size={15} strokeWidth={1.5} />
            <span className="hidden sm:inline">{userRole === 'admin' ? 'Todos los Proyectos' : 'Mis Proyectos'}</span>
          </button>
          {userRole === 'admin' && (
            <button
              onClick={() => setActiveTab('admin')}
              className={cn(
                "flex items-center gap-2 px-4 sm:px-5 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
                activeTab === 'admin'
                  ? "bg-neutral-900 text-white shadow-sm"
                  : "text-neutral-500 hover:text-neutral-300"
              )}
            >
              <Shield size={15} strokeWidth={1.5} />
              <span className="hidden sm:inline">Gestionar</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
