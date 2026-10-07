import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Bus as BusIcon, 
  Map as MapIcon, 
  Users, 
  PieChart, 
  FileText,
  Settings as SettingsIcon,
  Search,
  Bell,
  Menu,
  X,
  ChevronDown,
  Building,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { useAppState } from '../context/DataContext';
import { ToastContainer } from './ToastContainer';
import { GlobalSearchModal } from './GlobalSearchModal';
import { PassengerAssignModal } from './PassengerAssignModal';
import { Modal } from './Modal';

export function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const { organization } = useAppState();
  const location = useLocation();

  const navItems = [
    { to: '/', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { to: '/buses', label: 'Buses', icon: <BusIcon size={18} /> },
    { to: '/routes', label: 'Routes', icon: <MapIcon size={18} /> },
    { 
      to: '/passengers', 
      label: 'Passengers', 
      icon: <Users size={18} />,
      subItems: [
        { to: '/passengers?tab=students', label: 'Students' },
        { to: '/passengers?tab=staff', label: 'Faculty & Staff' },
        { to: '/passengers?tab=assignments', label: 'Assignments' },
      ]
    },
    { 
      to: '/insights', 
      label: 'Insights', 
      icon: <PieChart size={18} />,
      subItems: [
        { to: '/insights?tab=bus', label: 'Bus Insights' },
        { to: '/insights?tab=route', label: 'Route Insights' },
        { to: '/insights?tab=stop', label: 'Stop Insights' },
      ]
    },
    { to: '/reports', label: 'Reports', icon: <FileText size={18} /> },
  ];

  return (
    <div className="flex h-screen bg-slate-50/70 text-slate-900 font-sans antialiased overflow-hidden">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden animate-in fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-950 text-white transform transition-transform duration-200 ease-in-out lg:transform-none flex flex-col justify-between
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo & Product Brand */}
        <div>
          <div className="flex items-center justify-between px-6 h-16 border-b border-slate-900">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                <span className="text-base font-bold">B</span>
              </div>
              <div className="flex flex-col">
                <span className="font-black text-base tracking-tight text-white flex items-center">
                  BusFlow
                  <span className="ml-1 text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">PRO</span>
                </span>
                <span className="text-[10px] text-slate-400 font-medium tracking-wide">Transport Suite</span>
              </div>
            </div>
            <button className="lg:hidden text-slate-400 hover:text-white" onClick={() => setSidebarOpen(false)}>
              <X size={20} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 py-6 space-y-1 overflow-y-auto max-h-[calc(100vh-180px)]">
            <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Transport Management
            </div>

            {navItems.map((item) => {
              const isBaseActive = location.pathname === item.to || 
                (item.to !== '/' && location.pathname.startsWith(item.to));

              return (
                <div key={item.to} className="space-y-0.5">
                  <NavLink
                    to={item.to}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) => `
                      flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all duration-150 text-xs font-semibold
                      ${isActive || (item.to !== '/' && location.pathname.startsWith(item.to))
                        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30' 
                        : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100'
                      }
                    `}
                    end={item.to === '/'}
                  >
                    <div className="flex items-center space-x-3">
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                  </NavLink>

                  {/* Sub-items if section is active */}
                  {item.subItems && isBaseActive && (
                    <div className="pl-9 pr-2 py-1 space-y-1">
                      {item.subItems.map(sub => (
                        <NavLink
                          key={sub.to}
                          to={sub.to}
                          onClick={() => setSidebarOpen(false)}
                          className={`block px-2.5 py-1 text-[11px] rounded-lg font-medium transition-colors ${
                            location.pathname + location.search === sub.to
                              ? 'text-indigo-300 bg-slate-900 font-bold'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {sub.label}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-900 space-y-1">
          <button
            onClick={() => setIsHelpOpen(true)}
            className="w-full flex items-center space-x-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-900 hover:text-slate-100 transition-colors"
          >
            <HelpCircle size={16} />
            <span>Help & Workflow Guide</span>
          </button>

          <NavLink
            to="/settings"
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) => `
              flex items-center space-x-3 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors
              ${isActive ? 'bg-slate-900 text-white' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100'}
            `}
          >
            <SettingsIcon size={16} />
            <span>Settings</span>
          </NavLink>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <header className="bg-white h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 border-b border-slate-200/80 shadow-xs z-30 shrink-0">
          <div className="flex items-center space-x-4">
            <button
              className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-xl"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>

            {/* Global Search launcher */}
            <div 
              onClick={() => setIsSearchOpen(true)}
              className="hidden sm:flex items-center space-x-2 px-3 py-2 bg-slate-100/80 hover:bg-slate-100 border border-slate-200/80 rounded-xl text-xs text-slate-500 cursor-pointer w-64 md:w-80 transition-colors"
            >
              <Search size={14} className="text-slate-400 shrink-0" />
              <span className="flex-1 text-slate-400">Search students, buses, routes...</span>
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white rounded border border-slate-200 text-slate-400">Ctrl K</kbd>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Mobile search button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="sm:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-xl"
            >
              <Search size={18} />
            </button>

            {/* College Org Pill */}
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <Building size={14} className="text-indigo-600 shrink-0" />
              <div className="flex flex-col text-left">
                <span className="font-bold text-slate-800 leading-tight truncate max-w-[150px] sm:max-w-[200px]">
                  {organization?.name || 'College Campus'}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {organization?.code} · {organization?.academicYear || '2024-25'}
                </span>
              </div>
            </div>

            {/* Quick Assign Action */}
            <button
              type="button"
              onClick={() => setIsAssignModalOpen(true)}
              className="hidden md:flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors shadow-xs"
            >
              <span>+ Quick Assign</span>
            </button>

            {/* User Profile Avatar */}
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs border border-indigo-200">
              AD
            </div>
          </div>
        </header>

        {/* Page Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Global Interactive Modals & Toasts */}
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <PassengerAssignModal isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)} />
      <ToastContainer />

      {/* Product Workflow Guide Modal */}
      <Modal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        title="BusFlow Operational Workflow Guide"
        subtitle="End-to-end transport lifecycle from bus creation to stop distribution"
        maxWidth="2xl"
      >
        <div className="space-y-4 text-xs text-slate-600">
          <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100 space-y-2">
            <h4 className="font-bold text-indigo-900 text-sm">Hierarchy of Passenger Allocation</h4>
            <p className="text-indigo-700">
              BusFlow enforces clear relational integrity across the transport structure:
            </p>
            <div className="font-mono font-bold text-slate-700 bg-white p-2.5 rounded-lg border border-indigo-200/60 text-center">
              Bus → Route → Ordered Stops → Seats → Students/Staff → Pickup & Drop
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center shrink-0">1</span>
              <div>
                <strong className="text-slate-800">Visual Bus Seat Layouts:</strong> Each bus is configured with 2x2, 2x3, or 3x2 seating arrangement presets. Seat capacity is strictly synchronized with real seat elements.
              </div>
            </div>

            <div className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center shrink-0">2</span>
              <div>
                <strong className="text-slate-800">Ordered Route Timeline:</strong> Stops are strictly numbered and ordered from departure origin to campus destination. You can move stops up and down with live updates.
              </div>
            </div>

            <div className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center shrink-0">3</span>
              <div>
                <strong className="text-slate-800">Multi-Step Assignment Wizard:</strong> Allocates student/staff to an available seat, checks bus capacity, and records their morning pickup & evening drop waypoints.
              </div>
            </div>

            <div className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center shrink-0">4</span>
              <div>
                <strong className="text-slate-800">Instant Reports & CSV Export:</strong> Audit fleet capacity, stop passenger load, and download spreadsheets for administration.
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

