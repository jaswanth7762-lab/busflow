import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppState, useAppDispatch, useToast } from '../context/DataContext';
import { Modal } from '../components/Modal';
import { Badge } from '../components/Badge';
import { Route } from '../lib/types';
import { 
  Plus, 
  MapPin, 
  ArrowRight, 
  Bus as BusIcon, 
  Users, 
  Clock, 
  ChevronRight, 
  Trash2, 
  Edit2 
} from 'lucide-react';

export default function RoutesPage() {
  const { routes, buses, assignments } = useAppState();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);

  const handleDeleteRoute = (id: string, name: string) => {
    if (confirm(`Delete route "${name}"? Buses on this route will be marked unassigned.`)) {
      dispatch({ type: 'DELETE_ROUTE', payload: id });
      showToast(`Deleted route ${name}`, 'info');
    }
  };

  const handleSaveRoute = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = fd.get('name') as string;
    const startPoint = fd.get('startPoint') as string;
    const endPoint = fd.get('endPoint') as string;

    if (editingRoute) {
      const updated: Route = {
        ...editingRoute,
        name,
        startPoint,
        endPoint,
      };
      dispatch({ type: 'UPDATE_ROUTE', payload: updated });
      showToast(`Updated route ${name}`, 'success');
      setEditingRoute(null);
    } else {
      const newRoute: Route = {
        id: `route-${Date.now()}`,
        name,
        startPoint,
        endPoint,
        isActive: true,
        stops: [
          { id: `stop-${Date.now()}-1`, name: startPoint, landmark: 'Origin Departure Station', pickupTime: '06:45 AM', dropTime: '05:30 PM', order: 1 },
          { id: `stop-${Date.now()}-2`, name: endPoint, landmark: 'Campus Terminal Port', pickupTime: '07:55 AM', dropTime: '04:15 PM', order: 2 },
        ]
      };
      dispatch({ type: 'ADD_ROUTE', payload: newRoute });
      showToast(`Created route ${name}`, 'success');
      setIsCreateModalOpen(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Bus Routes & Corridors</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Sequential route corridors, ordered passenger pickup/drop stops, and fleet allocation.
          </p>
        </div>

        <button
          onClick={() => { setEditingRoute(null); setIsCreateModalOpen(true); }}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-indigo-100 flex items-center space-x-1.5 transition-colors self-start sm:self-center"
        >
          <Plus size={15} />
          <span>Create New Route</span>
        </button>
      </div>

      {/* Route Cards Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {routes.map(route => {
          const routeBuses = buses.filter(b => b.routeId === route.id);
          const routeAsg = assignments.filter(a => a.routeId === route.id && a.status === 'active');
          const studentCount = routeAsg.filter(a => a.passengerType === 'student').length;
          const staffCount = routeAsg.filter(a => a.passengerType === 'staff').length;

          return (
            <div 
              key={route.id} 
              className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col justify-between hover:border-slate-300 transition-all"
            >
              <div>
                {/* Card Header */}
                <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
                  <div>
                    <div className="flex items-center space-x-2">
                      <Link to={`/routes/${route.id}`} className="font-bold text-slate-900 text-lg hover:text-indigo-600 transition-colors">
                        {route.name}
                      </Link>
                      <Badge variant={route.isActive ? 'success' : 'default'}>
                        {route.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </Badge>
                    </div>

                    <div className="flex items-center text-xs text-slate-500 mt-1.5 space-x-2">
                      <span className="font-semibold text-slate-700">{route.startPoint}</span>
                      <ArrowRight size={13} className="text-slate-400 shrink-0" />
                      <span className="font-semibold text-slate-700">{route.endPoint}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => setEditingRoute(route)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100"
                      title="Edit corridor"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteRoute(route.id, route.name)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100"
                      title="Delete route"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Key Metrics Pill Bar */}
                <div className="grid grid-cols-4 divide-x divide-slate-100 border-b border-slate-100 text-center py-3 text-xs bg-white">
                  <div>
                    <span className="text-slate-400 font-semibold block text-[10px] uppercase">Stops</span>
                    <strong className="text-slate-900 text-sm">{route.stops.length}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block text-[10px] uppercase">Buses</span>
                    <strong className="text-indigo-600 text-sm">{routeBuses.length}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block text-[10px] uppercase">Students</span>
                    <strong className="text-slate-900 text-sm">{studentCount}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block text-[10px] uppercase">Staff</span>
                    <strong className="text-slate-900 text-sm">{staffCount}</strong>
                  </div>
                </div>

                {/* Ordered Stops Snapshot */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3 text-xs">
                    <span className="font-bold text-slate-400 uppercase tracking-wider">Waypoints Flow</span>
                    <span className="text-slate-500 font-medium">{routeAsg.length} Total Boarding Commuters</span>
                  </div>

                  <div className="space-y-2">
                    {route.stops.slice(0, 4).map((stop, sIdx) => (
                      <div key={stop.id} className="flex items-center justify-between text-xs py-1.5 px-3 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="flex items-center space-x-2.5">
                          <span className="w-5 h-5 rounded-full bg-white text-indigo-700 font-bold text-[10px] flex items-center justify-center border border-slate-200">
                            {stop.order}
                          </span>
                          <span className="font-semibold text-slate-800">{stop.name}</span>
                        </div>
                        <span className="text-indigo-600 font-mono text-[11px] font-semibold">{stop.pickupTime}</span>
                      </div>
                    ))}
                    {route.stops.length > 4 && (
                      <p className="text-[11px] text-slate-400 text-center pt-1 font-medium">
                        + {route.stops.length - 4} more sequential stops on this route
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs text-slate-500">
                  <BusIcon size={14} className="text-slate-400" />
                  <span>
                    {routeBuses.length > 0
                      ? routeBuses.map(b => b.busNumber).join(', ')
                      : 'No buses assigned'}
                  </span>
                </div>

                <Link
                  to={`/routes/${route.id}`}
                  className="px-4 py-2 bg-white hover:bg-slate-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold inline-flex items-center space-x-1.5 shadow-2xs"
                >
                  <span>View Timeline & Stops</span>
                  <ChevronRight size={13} />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create / Edit Route Modal */}
      {(isCreateModalOpen || editingRoute) && (
        <Modal
          isOpen={true}
          onClose={() => { setIsCreateModalOpen(false); setEditingRoute(null); }}
          title={editingRoute ? `Edit Route — ${editingRoute.name}` : 'Create Bus Route'}
          subtitle="Configure start station, arrival campus destination, and title"
        >
          <form onSubmit={handleSaveRoute} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Route Corridor Title</label>
              <input
                required
                name="name"
                defaultValue={editingRoute?.name}
                placeholder="e.g., Guntur RTC → College Campus"
                className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Departure Origin Point</label>
              <input
                required
                name="startPoint"
                defaultValue={editingRoute?.startPoint}
                placeholder="e.g., Guntur Old Bus Stand"
                className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Arrival Destination Point</label>
              <input
                required
                name="endPoint"
                defaultValue={editingRoute?.endPoint || 'VRSEC Campus Gate'}
                placeholder="e.g., Campus Terminal"
                className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => { setIsCreateModalOpen(false); setEditingRoute(null); }}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                {editingRoute ? 'Save Changes' : 'Create Route'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

