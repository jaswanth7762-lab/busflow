import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppState, useAppDispatch, useToast } from '../context/DataContext';
import { StopDetailModal } from '../components/StopDetailModal';
import { Modal } from '../components/Modal';
import { Badge } from '../components/Badge';
import { ProgressBar } from '../components/ProgressBar';
import { Stop } from '../lib/types';
import { 
  ArrowLeft, 
  MapPin, 
  Plus, 
  Trash2, 
  Edit2, 
  ChevronUp, 
  ChevronDown, 
  Bus as BusIcon, 
  Users, 
  Clock, 
  ArrowRight,
  ExternalLink
} from 'lucide-react';

export default function RouteDetail() {
  const { routeId } = useParams<{ routeId: string }>();
  const { routes, buses, assignments, students, staff } = useAppState();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();

  const [activeStop, setActiveStop] = useState<Stop | null>(null);
  const [isAddStopOpen, setIsAddStopOpen] = useState(false);
  const [editingStop, setEditingStop] = useState<Stop | null>(null);

  const route = routes.find(r => r.id === routeId);

  if (!route) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Route Not Found</h2>
        <Link to="/routes" className="text-indigo-600 font-semibold text-sm hover:underline">
          Return to routes
        </Link>
      </div>
    );
  }

  // Buses assigned to this route
  const routeBuses = buses.filter(b => b.routeId === route.id);
  const routeAssignments = assignments.filter(a => a.routeId === route.id && a.status === 'active');
  const studentCount = routeAssignments.filter(a => a.passengerType === 'student').length;
  const staffCount = routeAssignments.filter(a => a.passengerType === 'staff').length;

  // Move stop up
  const handleMoveStop = (index: number, direction: 'up' | 'down') => {
    const stopsCopy = [...route.stops];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= stopsCopy.length) return;

    const temp = stopsCopy[index];
    stopsCopy[index] = stopsCopy[targetIndex];
    stopsCopy[targetIndex] = temp;

    dispatch({
      type: 'REORDER_STOPS',
      payload: { routeId: route.id, stops: stopsCopy }
    });
    showToast('Reordered route stops', 'info');
  };

  // Delete stop
  const handleDeleteStop = (stopId: string, stopName: string) => {
    if (confirm(`Remove stop "${stopName}" from this route?`)) {
      dispatch({
        type: 'DELETE_STOP',
        payload: { routeId: route.id, stopId }
      });
      showToast(`Removed ${stopName}`, 'info');
    }
  };

  // Add / Edit stop submission
  const handleSaveStop = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const stopData: Stop = {
      id: editingStop?.id || `stop-${Date.now()}`,
      name: formData.get('name') as string,
      landmark: formData.get('landmark') as string,
      pickupTime: formData.get('pickupTime') as string,
      dropTime: formData.get('dropTime') as string,
      order: editingStop?.order || route.stops.length + 1,
    };

    if (editingStop) {
      dispatch({
        type: 'UPDATE_STOP',
        payload: { routeId: route.id, stop: stopData }
      });
      showToast('Updated stop details', 'success');
      setEditingStop(null);
    } else {
      dispatch({
        type: 'ADD_STOP',
        payload: { routeId: route.id, stop: stopData }
      });
      showToast('Added new route stop', 'success');
      setIsAddStopOpen(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Link
            to="/routes"
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">{route.name}</h1>
              <Badge variant={route.isActive ? 'success' : 'default'}>
                {route.isActive ? 'ACTIVE ROUTE' : 'INACTIVE'}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center space-x-2">
              <span>{route.startPoint}</span>
              <ArrowRight size={13} className="text-slate-400" />
              <span>{route.endPoint}</span>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => { setEditingStop(null); setIsAddStopOpen(true); }}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center space-x-1.5 transition-colors shadow-sm self-start lg:self-center"
        >
          <Plus size={15} />
          <span>Add Route Stop</span>
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ordered Stops</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{route.stops.length}</div>
          <p className="text-xs text-slate-400 mt-0.5">Sequential waypoints</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Assigned Buses</span>
          <div className="text-2xl font-black text-indigo-600 mt-1">{routeBuses.length}</div>
          <p className="text-xs text-slate-400 mt-0.5">Operating fleet</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Commuters</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{routeAssignments.length}</div>
          <p className="text-xs text-slate-400 mt-0.5">{studentCount} Students, {staffCount} Staff</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Assigned Fleet</span>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {routeBuses.map(b => (
              <Link
                key={b.id}
                to={`/buses/${b.id}`}
                className="text-xs font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded hover:bg-indigo-100"
              >
                {b.busNumber}
              </Link>
            ))}
            {routeBuses.length === 0 && <span className="text-xs text-slate-400 italic">No buses assigned</span>}
          </div>
        </div>
      </div>

      {/* Main Content Layout: Timeline on Left, Passenger distribution on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* SIGNATURE: Vertical Route Timeline with interactive cards */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Ordered Route Timeline</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Physical sequence of morning pickup & evening drop stops. Click any stop for commuter breakdown.
              </p>
            </div>
          </div>

          <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3.5 before:top-4 before:bottom-4 before:w-0.5 before:bg-indigo-100">
            {route.stops.map((stop, index) => {
              const stopBoardingCount = routeAssignments.filter(a => a.pickupStopId === stop.id).length;
              const isFirst = index === 0;
              const isLast = index === route.stops.length - 1;

              return (
                <div key={stop.id} className="relative group">
                  {/* Timeline Pin Indicator */}
                  <div className={`absolute -left-6 sm:-left-8 top-4 w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs border-2 z-10 transition-transform group-hover:scale-110 ${
                    isFirst ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100' :
                    isLast ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-100' :
                    'bg-white text-slate-700 border-indigo-300 shadow-sm'
                  }`}>
                    {stop.order}
                  </div>

                  {/* Stop Card */}
                  <div className="bg-slate-50/70 hover:bg-white rounded-2xl p-5 border border-slate-200/80 hover:border-indigo-300 transition-all duration-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div 
                      onClick={() => setActiveStop(stop)} 
                      className="cursor-pointer flex-1"
                    >
                      <div className="flex items-center space-x-2">
                        <h3 className="font-bold text-slate-900 text-base group-hover:text-indigo-600 transition-colors">
                          {stop.name}
                        </h3>
                        {isFirst && <Badge variant="indigo">ORIGIN</Badge>}
                        {isLast && <Badge variant="success">DESTINATION TERMINAL</Badge>}
                      </div>
                      <p className="text-xs text-slate-500 mt-1 flex items-center space-x-1">
                        <MapPin size={13} className="text-slate-400" />
                        <span>{stop.landmark || 'No landmark specified'}</span>
                      </p>

                      <div className="flex items-center gap-4 mt-3 text-xs">
                        <span className="flex items-center text-slate-600">
                          <Clock size={13} className="mr-1 text-slate-400" />
                          Pickup: <strong className="ml-1 text-slate-900">{stop.pickupTime}</strong>
                        </span>
                        <span className="flex items-center text-slate-600">
                          <Clock size={13} className="mr-1 text-slate-400" />
                          Drop: <strong className="ml-1 text-slate-900">{stop.dropTime}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Actions & Commuters count */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-200/60">
                      <button
                        type="button"
                        onClick={() => setActiveStop(stop)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                      >
                        <Users size={13} />
                        <span>{stopBoardingCount} Commuters</span>
                      </button>

                      {/* Reorder Buttons */}
                      <div className="flex items-center space-x-1">
                        <button
                          type="button"
                          disabled={isFirst}
                          onClick={() => handleMoveStop(index, 'up')}
                          className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-800 disabled:opacity-30"
                          title="Move stop earlier"
                        >
                          <ChevronUp size={15} />
                        </button>
                        <button
                          type="button"
                          disabled={isLast}
                          onClick={() => handleMoveStop(index, 'down')}
                          className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-800 disabled:opacity-30"
                          title="Move stop later"
                        >
                          <ChevronDown size={15} />
                        </button>
                      </div>

                      <div className="flex items-center space-x-1">
                        <button
                          type="button"
                          onClick={() => setEditingStop(stop)}
                          className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-indigo-600 transition-colors"
                          title="Edit stop"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteStop(stop.id, stop.name)}
                          className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-rose-600 transition-colors"
                          title="Remove stop"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Sidebar: Passenger Distribution along Route */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-5">
            <h3 className="font-bold text-slate-900 text-base">Stop-wise Load Distribution</h3>
            <p className="text-xs text-slate-500">Boarding pressure for morning inbound commute</p>

            <div className="space-y-4">
              {route.stops.map(stop => {
                const count = routeAssignments.filter(a => a.pickupStopId === stop.id).length;
                const pct = routeAssignments.length > 0 ? Math.round((count / routeAssignments.length) * 100) : 0;

                return (
                  <div key={stop.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800">{stop.name}</span>
                      <span className="text-slate-500 font-mono">
                        <strong>{count}</strong> ({pct}%)
                      </span>
                    </div>
                    <ProgressBar progress={pct} colorClass="bg-indigo-600" size="sm" />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Operating Buses on Route */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Operating Buses ({routeBuses.length})</h3>
            <div className="space-y-3">
              {routeBuses.map(b => {
                const count = assignments.filter(a => a.busId === b.id && a.status === 'active').length;
                const pct = Math.round((count / b.capacity) * 100);

                return (
                  <Link
                    key={b.id}
                    to={`/buses/${b.id}`}
                    className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all flex items-center justify-between group block"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-black text-slate-900 text-sm group-hover:text-indigo-600">{b.busNumber}</span>
                        <span className="text-xs font-mono text-slate-400">{b.registrationNumber}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{b.name}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-700">{count}/{b.capacity}</span>
                      <p className="text-[10px] text-slate-400">{pct}% Occupied</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Stop Detail Drawer/Modal */}
      {activeStop && (
        <StopDetailModal
          isOpen={true}
          onClose={() => setActiveStop(null)}
          stop={activeStop}
          route={route}
        />
      )}

      {/* Add / Edit Stop Modal */}
      {(isAddStopOpen || editingStop) && (
        <Modal
          isOpen={true}
          onClose={() => { setIsAddStopOpen(false); setEditingStop(null); }}
          title={editingStop ? `Edit Stop — ${editingStop.name}` : 'Add Route Stop'}
          subtitle={`Route: ${route.name}`}
        >
          <form onSubmit={handleSaveStop} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Stop Name
              </label>
              <input
                required
                name="name"
                defaultValue={editingStop?.name}
                placeholder="e.g., Lakshmipuram Main Circle"
                className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Landmark / Identification
              </label>
              <input
                required
                name="landmark"
                defaultValue={editingStop?.landmark}
                placeholder="e.g., Near Reliance Digital"
                className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Morning Pickup Time
                </label>
                <input
                  required
                  name="pickupTime"
                  defaultValue={editingStop?.pickupTime || '07:15 AM'}
                  placeholder="07:15 AM"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Evening Drop Time
                </label>
                <input
                  required
                  name="dropTime"
                  defaultValue={editingStop?.dropTime || '05:00 PM'}
                  placeholder="05:00 PM"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={() => { setIsAddStopOpen(false); setEditingStop(null); }}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                {editingStop ? 'Save Changes' : 'Add Stop to Route'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
