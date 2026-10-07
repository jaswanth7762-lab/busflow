import React from 'react';
import { useAppState, useAppDispatch, useToast } from '../context/DataContext';
import { Building, AlertTriangle, Save, RefreshCw } from 'lucide-react';

export default function Settings() {
  const { organization } = useAppState();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();

  const handleSaveOrg = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    if (organization) {
      dispatch({
        type: 'UPDATE_ORG',
        payload: {
          ...organization,
          name: formData.get('name') as string,
          code: formData.get('code') as string,
          contactEmail: formData.get('email') as string,
          academicYear: formData.get('academicYear') as string,
        }
      });
      showToast('Organization settings updated successfully', 'success');
    }
  };

  const handleReset = () => {
    if (confirm('WARNING: This will reset all your college transport data, routes, buses, and seat assignments to the default sample dataset. Proceed?')) {
      dispatch({ type: 'RESET_DATA' });
      showToast('All transport data reset to default sample state', 'info');
    }
  };

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">System & Organization Settings</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Configure college institution profile, transport department contacts, and state cache management.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center space-x-3 bg-slate-50/50">
          <div className="p-2 bg-indigo-50 text-indigo-700 rounded-xl">
            <Building size={18} />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Institution & Transport Department Profile</h2>
            <p className="text-xs text-slate-500">Details displayed across top headers and formal exported reports</p>
          </div>
        </div>

        <div className="p-6">
          <form onSubmit={handleSaveOrg} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Institution Name
                </label>
                <input 
                  required 
                  name="name" 
                  defaultValue={organization?.name} 
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  College Code / Acronym
                </label>
                <input 
                  required 
                  name="code" 
                  defaultValue={organization?.code} 
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-sm font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Academic Session Year
                </label>
                <input 
                  required 
                  name="academicYear" 
                  defaultValue={organization?.academicYear || '2024-2025'} 
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Transport Admin Email
                </label>
                <input 
                  required 
                  type="email" 
                  name="email" 
                  defaultValue={organization?.contactEmail} 
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                />
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <button 
                type="submit" 
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-colors shadow-sm flex items-center space-x-2"
              >
                <Save size={15} />
                <span>Save Organization Details</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-3xl border border-rose-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-rose-100 bg-rose-50/40 flex items-center space-x-3">
          <div className="p-2 bg-rose-100 text-rose-700 rounded-xl">
            <AlertTriangle size={18} />
          </div>
          <div>
            <h2 className="text-base font-bold text-rose-900">Prototype Data Reset</h2>
            <p className="text-xs text-rose-700">Restore factory sample dataset</p>
          </div>
        </div>

        <div className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Reset to Default AP Mock Data</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xl">
              Deletes any locally saved changes in your browser's localStorage and repopulates the full Andhra Pradesh sample dataset (5 buses, 4 routes, 20+ stops, 88 students, 14 staff).
            </p>
          </div>
          <button 
            type="button"
            onClick={handleReset}
            className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap shadow-sm flex items-center space-x-1.5 shrink-0"
          >
            <RefreshCw size={14} />
            <span>Reset All Data</span>
          </button>
        </div>
      </div>
    </div>
  );
}

