import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppState, useAppDispatch, useToast } from '../context/DataContext';
import { Modal } from '../components/Modal';
import { ProgressBar } from '../components/ProgressBar';
import { Badge } from '../components/Badge';
import { Bus, SeatLayoutType } from '../lib/types';
import { generateSeatsForLayout } from '../lib/mockData';
import { 
  Plus, 
  Search, 
  Filter, 
  Bus as BusIcon, 
  MapPin, 
  ArrowRight, 
  Edit2, 
  Trash2, 
  Grid, 
  ChevronRight,
  SlidersHorizontal
} from 'lucide-react';

export default function Buses() {
  const { buses, routes, assignments, students, staff } = useAppState();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [routeFilter, setRouteFilter] = useState('all');
  const [occupancyFilter, setOccupancyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingBus, setEditingBus] = useState<Bus | null>(null);

  // Filter Buses
  const filteredBuses = buses.filter(bus => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = 
      bus.busNumber.toLowerCase().includes(q) ||
      bus.registrationNumber.toLowerCase().includes(q) ||
      bus.name.toLowerCase().includes(q);

    const matchesRoute = routeFilter === 'all' || bus.routeId === routeFilter;
    const matchesStatus = statusFilter === 'all' || bus.status === statusFilter;

    const assignedCount = assignments.filter(a => a.busId === bus.id && a.status === 'active').length;
    const pct = bus.capacity > 0 ? (assignedCount / bus.capacity) * 100 : 0;
    
    let matchesOccupancy = true;
    if (occupancyFilter === 'available') matchesOccupancy = pct < 90;
    else if (occupancyFilter === 'filling') matchesOccupancy = pct >= 70 && pct < 95;
    else if (occupancyFilter === 'full') matchesOccupancy = pct >= 95;

    return matchesSearch && matchesRoute && matchesStatus && matchesOccupancy;
  });

  const handleDeleteBus = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete bus "${name}"? All assigned passengers will be unassigned.`)) {
      dispatch({ type: 'DELETE_BUS', payload: id });
      showToast(`Deleted bus ${name}`, 'info');
    }
  };

  const handleSaveBus = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const busNum = fd.get('busNumber') as string;
    const regNum = fd.get('registrationNumber') as string;
    const name = fd.get('name') as string;
    const routeId = fd.get('routeId') as string;
    const layoutType = fd.get('layoutType') as SeatLayoutType;
    const rows = parseInt(fd.get('rows') as string) || 10;
    const status = fd.get('status') as 'active' | 'maintenance' | 'inactive';

    if (editingBus) {
      const updated: Bus = {
        ...editingBus,
        busNumber: busNum,
        registrationNumber: regNum,
        name,
        routeId: routeId || undefined,
        status,
      };
      dispatch({ type: 'UPDATE_BUS', payload: updated });
      showToast(`Updated bus ${busNum}`, 'success');
      setEditingBus(null);
    } else {
      const seats = generateSeatsForLayout(layoutType, rows);
      const newBus: Bus = {
        id: `bus-${Date.now()}`,
        busNumber: busNum,
        registrationNumber: regNum,
        name,
        capacity: seats.length,
        status,
        routeId: routeId || undefined,
        seatLayout: { layoutType, rows, seats },
        isActive: true,
      };

      dispatch({ type: 'ADD_BUS', payload: newBus });
      showToast(`Created bus ${busNum}. Opening seat layout...`, 'success');
      setIsAddModalOpen(false);
      navigate(`/buses/${newBus.id}`);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">College Fleet & Buses</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage college bus fleet, capacities, seating layout blueprints, and assigned routes.
          </p>
        </div>

        <button
          onClick={() => { setEditingBus(null); setIsAddModalOpen(true); }}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-indigo-100 flex items-center space-x-1.5 transition-colors self-start sm:self-center"
        >
          <Plus size={15} />
          <span>Add New Bus</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search by bus number, registration (AP16), alias..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Route filter */}
          <select
            value={routeFilter}
            onChange={(e) => setRouteFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 text-slate-700 focus:outline-none"
          >
            <option value="all">All Routes</option>
            {routes.map(r => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>

          {/* Occupancy filter */}
          <select
            value={occupancyFilter}
            onChange={(e) => setOccupancyFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 text-slate-700 focus:outline-none"
          >
            <option value="all">All Occupancies</option>
            <option value="available">Seats Available (&lt;90%)</option>
            <option value="filling">Filling Up (70-95%)</option>
            <option value="full">Near Capacity / Full (&ge;95%)</option>
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 text-slate-700 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="maintenance">Maintenance</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Main Bus List Table / Card View */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Bus / Vehicle</th>
                <th className="px-6 py-4">Assigned Route</th>
                <th className="px-6 py-4 text-center">Capacity</th>
                <th className="px-6 py-4 text-center">Occupied</th>
                <th className="px-6 py-4 text-center">Available</th>
                <th className="px-6 py-4 min-w-[140px]">Occupancy Rate</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBuses.length > 0 ? (
                filteredBuses.map((bus) => {
                  const busAsg = assignments.filter(a => a.busId === bus.id && a.status === 'active');
                  const route = bus.routeId ? routes.find(r => r.id === bus.routeId) : null;
                  const occupied = busAsg.length;
                  const available = Math.max(0, bus.capacity - occupied);
                  const percentage = bus.capacity > 0 ? Math.round((occupied / bus.capacity) * 100) : 0;

                  return (
                    <tr key={bus.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center shrink-0">
                            <BusIcon size={18} />
                          </div>
                          <div>
                            <Link to={`/buses/${bus.id}`} className="font-bold text-slate-900 text-sm hover:text-indigo-600 transition-colors">
                              {bus.busNumber}
                            </Link>
                            <div className="flex items-center space-x-1.5 mt-0.5">
                              <span className="font-mono text-[11px] text-slate-500 font-bold">{bus.registrationNumber}</span>
                              <span className="text-slate-300">·</span>
                              <span className="text-slate-400 text-[11px]">{bus.name}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 font-medium text-slate-700">
                        {route ? (
                          <Link to={`/routes/${route.id}`} className="hover:text-indigo-600 flex items-center space-x-1">
                            <MapPin size={13} className="text-slate-400" />
                            <span>{route.name}</span>
                          </Link>
                        ) : (
                          <span className="text-slate-400 italic">No route assigned</span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-center font-bold text-slate-900">{bus.capacity}</td>
                      <td className="px-6 py-4 text-center font-bold text-indigo-700">{occupied}</td>
                      <td className="px-6 py-4 text-center font-bold text-emerald-700">{available}</td>

                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px] font-semibold text-slate-700">
                            <span>{percentage}%</span>
                            <span className="text-slate-400">{occupied}/{bus.capacity}</span>
                          </div>
                          <ProgressBar
                            progress={percentage}
                            colorClass={percentage > 90 ? 'bg-rose-500' : percentage > 70 ? 'bg-amber-500' : 'bg-indigo-600'}
                            size="sm"
                          />
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <Badge variant={bus.status === 'active' ? 'success' : bus.status === 'maintenance' ? 'warning' : 'default'}>
                          {bus.status.toUpperCase()}
                        </Badge>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            to={`/buses/${bus.id}`}
                            className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs inline-flex items-center space-x-1 transition-colors"
                          >
                            <span>Layout</span>
                            <ArrowRight size={12} />
                          </Link>

                          <button
                            onClick={() => setEditingBus(bus)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100"
                            title="Edit bus metadata"
                          >
                            <Edit2 size={14} />
                          </button>

                          <button
                            onClick={() => handleDeleteBus(bus.id, bus.busNumber)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100"
                            title="Delete bus"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400 text-sm">
                    No buses matching the applied filters or search query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Bus Modal */}
      {(isAddModalOpen || editingBus) && (
        <Modal
          isOpen={true}
          onClose={() => { setIsAddModalOpen(false); setEditingBus(null); }}
          title={editingBus ? `Edit Bus — ${editingBus.busNumber}` : 'Create College Bus'}
          subtitle="Configure identification, designated corridor, and seating arrangement"
        >
          <form onSubmit={handleSaveBus} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Bus Number Code</label>
              <input required name="busNumber" defaultValue={editingBus?.busNumber} placeholder="e.g., BUS-06" className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Registration Plate (Andhra Pradesh format)</label>
              <input required name="registrationNumber" defaultValue={editingBus?.registrationNumber} placeholder="e.g., AP16 TC 4421" className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Bus Alias / Name</label>
              <input required name="name" defaultValue={editingBus?.name} placeholder="e.g., Nagarjuna Deluxe" className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Assigned Route</label>
              <select name="routeId" defaultValue={editingBus?.routeId || ''} className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Unassigned</option>
                {routes.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>

            {!editingBus && (
              <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Layout Preset</label>
                  <select name="layoutType" defaultValue="2x2" className="w-full p-2 border border-slate-200 rounded-lg text-xs">
                    <option value="2x2">2 × 2 Standard</option>
                    <option value="2x3">2 × 3 High Capacity</option>
                    <option value="3x2">3 × 2 Layout</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Rows</label>
                  <input required type="number" name="rows" defaultValue={10} min={4} max={16} className="w-full p-2 border border-slate-200 rounded-lg text-xs" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Operational Status</label>
              <select name="status" defaultValue={editingBus?.status || 'active'} className="w-full p-2.5 rounded-xl border border-slate-200 text-sm">
                <option value="active">Active Service</option>
                <option value="maintenance">Maintenance</option>
                <option value="inactive">Inactive / Standby</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => { setIsAddModalOpen(false); setEditingBus(null); }}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                {editingBus ? 'Save Changes' : 'Create & Open Layout Builder'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

