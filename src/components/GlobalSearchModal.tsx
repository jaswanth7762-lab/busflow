import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../context/DataContext';
import { Modal } from './Modal';
import { Badge } from './Badge';
import { Search, User, Bus as BusIcon, MapPin, ArrowRight, CornerDownLeft } from 'lucide-react';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPassenger?: (id: string, type: 'student' | 'staff') => void;
}

export function GlobalSearchModal({ isOpen, onClose, onSelectPassenger }: GlobalSearchModalProps) {
  const navigate = useNavigate();
  const { students, staff, buses, routes, assignments } = useAppState();
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  // Search Results
  const matchingStudents = q ? students.filter(s => 
    s.name.toLowerCase().includes(q) || 
    s.studentId.toLowerCase().includes(q) ||
    s.branch.toLowerCase().includes(q)
  ).slice(0, 5) : [];

  const matchingStaff = q ? staff.filter(s => 
    s.name.toLowerCase().includes(q) || 
    s.employeeId.toLowerCase().includes(q) ||
    s.department.toLowerCase().includes(q)
  ).slice(0, 4) : [];

  const matchingBuses = q ? buses.filter(b => 
    b.busNumber.toLowerCase().includes(q) || 
    b.registrationNumber.toLowerCase().includes(q) || 
    b.name.toLowerCase().includes(q)
  ).slice(0, 4) : [];

  const matchingRoutes = q ? routes.filter(r => 
    r.name.toLowerCase().includes(q) || 
    r.startPoint.toLowerCase().includes(q) || 
    r.endPoint.toLowerCase().includes(q)
  ).slice(0, 3) : [];

  // Stops search across all routes
  const matchingStops: { stop: any; route: any }[] = [];
  if (q) {
    routes.forEach(r => {
      r.stops.forEach(s => {
        if (s.name.toLowerCase().includes(q) || s.landmark.toLowerCase().includes(q)) {
          if (matchingStops.length < 4) {
            matchingStops.push({ stop: s, route: r });
          }
        }
      });
    });
  }

  const hasAnyResults = matchingStudents.length > 0 || matchingStaff.length > 0 || matchingBuses.length > 0 || matchingRoutes.length > 0 || matchingStops.length > 0;

  const handleGoToBus = (busId: string) => {
    onClose();
    navigate(`/buses/${busId}`);
  };

  const handleGoToRoute = (routeId: string) => {
    onClose();
    navigate(`/routes/${routeId}`);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Global Transport Search" maxWidth="2xl">
      <div className="space-y-4">
        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            autoFocus
            type="text"
            placeholder="Search students (STU, name), staff (EMP), buses (AP16, BUS-01), routes, stops..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
          />
        </div>

        {/* Results Body */}
        <div className="max-h-96 overflow-y-auto space-y-5 pt-2">
          {!q ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              <p>Type to search across students, staff, college buses, routes, and individual stops.</p>
              <div className="flex justify-center gap-2 mt-4 text-[11px] text-slate-500">
                <span className="bg-slate-100 px-2 py-1 rounded">Try: "AP16"</span>
                <span className="bg-slate-100 px-2 py-1 rounded">Try: "Rahul"</span>
                <span className="bg-slate-100 px-2 py-1 rounded">Try: "Lakshmipuram"</span>
              </div>
            </div>
          ) : !hasAnyResults ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              No results found for "<span className="text-slate-600 font-semibold">{query}</span>"
            </div>
          ) : (
            <>
              {/* Passengers (Students & Staff) */}
              {(matchingStudents.length > 0 || matchingStaff.length > 0) && (
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">
                    Passengers
                  </h4>
                  <div className="space-y-1.5">
                    {matchingStudents.map(s => {
                      const asg = assignments.find(a => a.passengerId === s.id && a.status === 'active');
                      const bus = asg ? buses.find(b => b.id === asg.busId) : null;
                      const seat = bus?.seatLayout.seats.find(st => st.id === asg?.seatId);

                      return (
                        <div
                          key={s.id}
                          onClick={() => {
                            onClose();
                            if (onSelectPassenger) onSelectPassenger(s.id, 'student');
                          }}
                          className="p-2.5 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 cursor-pointer flex items-center justify-between transition-colors text-xs"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center shrink-0">
                              {s.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900">{s.name}</div>
                              <div className="text-slate-400 font-mono text-[11px]">
                                {s.studentId} · {s.branch} Year {s.year}
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            {bus ? (
                              <span className="font-medium text-indigo-700 bg-indigo-50 px-2 py-1 rounded">
                                {bus.busNumber} · Seat {seat?.seatNumber || '--'}
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[11px]">Not assigned</span>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {matchingStaff.map(s => {
                      const asg = assignments.find(a => a.passengerId === s.id && a.status === 'active');
                      const bus = asg ? buses.find(b => b.id === asg.busId) : null;
                      const seat = bus?.seatLayout.seats.find(st => st.id === asg?.seatId);

                      return (
                        <div
                          key={s.id}
                          onClick={() => {
                            onClose();
                            if (onSelectPassenger) onSelectPassenger(s.id, 'staff');
                          }}
                          className="p-2.5 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 cursor-pointer flex items-center justify-between transition-colors text-xs"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 font-bold flex items-center justify-center shrink-0">
                              {s.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900">{s.name}</div>
                              <div className="text-slate-400 text-[11px]">
                                {s.employeeId} · {s.department}
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            {bus ? (
                              <span className="font-medium text-purple-700 bg-purple-50 px-2 py-1 rounded">
                                {bus.busNumber} · Seat {seat?.seatNumber || '--'}
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[11px]">Not assigned</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Buses */}
              {matchingBuses.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">
                    Buses
                  </h4>
                  <div className="space-y-1.5">
                    {matchingBuses.map(b => {
                      const asgCount = assignments.filter(a => a.busId === b.id && a.status === 'active').length;
                      return (
                        <div
                          key={b.id}
                          onClick={() => handleGoToBus(b.id)}
                          className="p-2.5 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/40 cursor-pointer flex items-center justify-between transition-colors text-xs"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center shrink-0">
                              <BusIcon size={16} />
                            </div>
                            <div>
                              <div className="font-bold text-slate-900">{b.busNumber} · {b.registrationNumber}</div>
                              <div className="text-slate-400 text-[11px]">{b.name}</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-slate-500 font-medium">{asgCount}/{b.capacity} Seats</span>
                            <ArrowRight size={14} className="text-slate-400" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Routes */}
              {matchingRoutes.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">
                    Routes
                  </h4>
                  <div className="space-y-1.5">
                    {matchingRoutes.map(r => (
                      <div
                        key={r.id}
                        onClick={() => handleGoToRoute(r.id)}
                        className="p-2.5 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/40 cursor-pointer flex items-center justify-between transition-colors text-xs"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                            <MapPin size={16} />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{r.name}</div>
                            <div className="text-slate-400 text-[11px]">
                              {r.startPoint} → {r.endPoint}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-slate-500">{r.stops.length} Stops</span>
                          <ArrowRight size={14} className="text-slate-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Stops */}
              {matchingStops.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">
                    Ordered Stops
                  </h4>
                  <div className="space-y-1.5">
                    {matchingStops.map(({ stop, route }) => (
                      <div
                        key={stop.id}
                        onClick={() => handleGoToRoute(route.id)}
                        className="p-2.5 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 cursor-pointer flex items-center justify-between transition-colors text-xs"
                      >
                        <div>
                          <div className="font-bold text-slate-900">{stop.name}</div>
                          <div className="text-slate-400 text-[11px]">
                            Route: {route.name} · {stop.landmark}
                          </div>
                        </div>
                        <span className="text-indigo-600 font-semibold">{stop.pickupTime}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}
