import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppState } from '../context/DataContext';
import { Badge } from '../components/Badge';
import { ProgressBar } from '../components/ProgressBar';
import { 
  Bus as BusIcon, 
  MapPin, 
  Users, 
  PieChart, 
  TrendingUp, 
  UserCheck, 
  Clock, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export default function Insights() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'bus';

  const { buses, assignments, routes, students, staff } = useAppState();

  const [activeTab, setActiveTab] = useState<'bus' | 'route' | 'stop'>(
    (currentTab as any) || 'bus'
  );

  // Selected entities for drill-down
  const [selectedBusId, setSelectedBusId] = useState<string>(buses[0]?.id || '');
  const [selectedRouteId, setSelectedRouteId] = useState<string>(routes[0]?.id || '');
  const [selectedStopId, setSelectedStopId] = useState<string>(routes[0]?.stops[0]?.id || '');

  const handleTabChange = (tab: 'bus' | 'route' | 'stop') => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // Selected Bus Analytics
  const activeBus = buses.find(b => b.id === selectedBusId) || buses[0];
  const busRoute = activeBus?.routeId ? routes.find(r => r.id === activeBus.routeId) : null;
  const activeBusAsg = assignments.filter(a => a.busId === activeBus?.id && a.status === 'active');

  let busStuM = 0, busStuF = 0;
  let busStaffM = 0, busStaffF = 0;

  activeBusAsg.forEach(a => {
    if (a.passengerType === 'student') {
      const s = students.find(x => x.id === a.passengerId);
      if (s?.gender === 'M') busStuM++;
      if (s?.gender === 'F') busStuF++;
    } else {
      const sm = staff.find(x => x.id === a.passengerId);
      if (sm?.gender === 'M') busStaffM++;
      if (sm?.gender === 'F') busStaffF++;
    }
  });

  const busTotalOccupied = activeBusAsg.length;
  const busCapacity = activeBus?.capacity || 50;
  const busAvailable = Math.max(0, busCapacity - busTotalOccupied);
  const busOccupancyPct = busCapacity > 0 ? Math.round((busTotalOccupied / busCapacity) * 100) : 0;

  // Selected Route Analytics
  const activeRoute = routes.find(r => r.id === selectedRouteId) || routes[0];
  const routeBuses = buses.filter(b => b.routeId === activeRoute?.id);
  const routeAsg = assignments.filter(a => a.routeId === activeRoute?.id && a.status === 'active');
  const routeStuCount = routeAsg.filter(a => a.passengerType === 'student').length;
  const routeStaffCount = routeAsg.filter(a => a.passengerType === 'staff').length;

  // Selected Stop Analytics
  const selectedRouteForStop = routes.find(r => r.id === selectedRouteId) || routes[0];
  const activeStop = selectedRouteForStop?.stops.find(s => s.id === selectedStopId) || selectedRouteForStop?.stops[0];

  const stopAsg = activeStop ? assignments.filter(
    a => a.routeId === selectedRouteForStop.id && (a.pickupStopId === activeStop.id || a.dropStopId === activeStop.id) && a.status === 'active'
  ) : [];

  let stopM = 0, stopF = 0, stopStu = 0, stopStaff = 0;
  stopAsg.forEach(a => {
    if (a.passengerType === 'student') {
      stopStu++;
      const s = students.find(x => x.id === a.passengerId);
      if (s?.gender === 'M') stopM++;
      if (s?.gender === 'F') stopF++;
    } else {
      stopStaff++;
      const sm = staff.find(x => x.id === a.passengerId);
      if (sm?.gender === 'M') stopM++;
      if (sm?.gender === 'F') stopF++;
    }
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Transport Analytics & Insights</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Detailed metrics, seat utilization, corridor distribution, and waypoint boarding load.
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-1.5 shadow-sm inline-flex flex-wrap gap-1">
        <button
          onClick={() => handleTabChange('bus')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'bus' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Bus Insights
        </button>
        <button
          onClick={() => handleTabChange('route')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'route' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Route Insights
        </button>
        <button
          onClick={() => handleTabChange('stop')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'stop' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Stop Insights
        </button>
      </div>

      {/* TAB 1: BUS INSIGHTS */}
      {activeTab === 'bus' && activeBus && (
        <div className="space-y-6">
          {/* Bus Selector */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-xl">
                <BusIcon size={20} />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Inspecting Bus</span>
                <h3 className="text-lg font-black text-slate-900">{activeBus.busNumber} · {activeBus.name}</h3>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500 font-semibold">Select Bus:</span>
              <select
                value={selectedBusId}
                onChange={(e) => setSelectedBusId(e.target.value)}
                className="p-2 border border-slate-200 rounded-xl text-xs font-bold bg-slate-50 text-slate-800"
              >
                {buses.map(b => (
                  <option key={b.id} value={b.id}>{b.busNumber} ({b.registrationNumber})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Key Metrics Banner */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Capacity</span>
              <div className="text-2xl font-black text-slate-900 mt-1">{busCapacity}</div>
              <p className="text-xs text-slate-400 mt-0.5">Physical configured seats</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Occupied</span>
              <div className="text-2xl font-black text-indigo-700 mt-1">{busTotalOccupied}</div>
              <p className="text-xs text-slate-400 mt-0.5">{busStuM + busStuF} Students, {busStaffM + busStaffF} Staff</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Available</span>
              <div className="text-2xl font-black text-emerald-600 mt-1">{busAvailable}</div>
              <p className="text-xs text-slate-400 mt-0.5">Seats open for allocation</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Occupancy</span>
                <span className="text-xs font-black text-slate-900">{busOccupancyPct}%</span>
              </div>
              <div className="mt-2">
                <ProgressBar progress={busOccupancyPct} size="md" colorClass={busOccupancyPct > 90 ? 'bg-rose-500' : 'bg-indigo-600'} />
              </div>
            </div>
          </div>

          {/* Breakdown Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Demographic Breakdown Matrix */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
              <h4 className="font-bold text-slate-900 text-sm">Demographic Breakdown Matrix</h4>

              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase font-semibold">
                  <tr>
                    <th className="py-2.5 px-3 rounded-l-lg">Category</th>
                    <th className="py-2.5 px-3">Male</th>
                    <th className="py-2.5 px-3">Female</th>
                    <th className="py-2.5 px-3 text-right rounded-r-lg">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-3 px-3 font-semibold text-slate-800">Students</td>
                    <td className="py-3 px-3 text-indigo-700 font-bold">{busStuM}</td>
                    <td className="py-3 px-3 text-amber-700 font-bold">{busStuF}</td>
                    <td className="py-3 px-3 text-right font-black text-slate-900">{busStuM + busStuF}</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-semibold text-slate-800">Faculty / Staff</td>
                    <td className="py-3 px-3 text-indigo-700 font-bold">{busStaffM}</td>
                    <td className="py-3 px-3 text-amber-700 font-bold">{busStaffF}</td>
                    <td className="py-3 px-3 text-right font-black text-slate-900">{busStaffM + busStaffF}</td>
                  </tr>
                  <tr className="bg-slate-50 font-bold">
                    <td className="py-3 px-3 text-slate-900">Total Commuters</td>
                    <td className="py-3 px-3 text-indigo-700">{busStuM + busStaffM}</td>
                    <td className="py-3 px-3 text-amber-700">{busStuF + busStaffF}</td>
                    <td className="py-3 px-3 text-right text-slate-900">{busTotalOccupied}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Stop Boarding Distribution */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
              <h4 className="font-bold text-slate-900 text-sm">Stop Boarding Distribution on Route</h4>
              <div className="space-y-3">
                {busRoute ? (
                  busRoute.stops.map(s => {
                    const count = activeBusAsg.filter(a => a.pickupStopId === s.id).length;
                    const pct = busTotalOccupied > 0 ? Math.round((count / busTotalOccupied) * 100) : 0;
                    return (
                      <div key={s.id} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-semibold text-slate-800">{s.name}</span>
                          <span className="text-slate-500 font-mono"><strong>{count}</strong> pax ({pct}%)</span>
                        </div>
                        <ProgressBar progress={pct} size="sm" colorClass="bg-indigo-600" />
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-slate-400 py-4 text-center">No route assigned to bus.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ROUTE INSIGHTS */}
      {activeTab === 'route' && activeRoute && (
        <div className="space-y-6">
          {/* Route Selector */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl">
                <MapPin size={20} />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Inspecting Route Corridor</span>
                <h3 className="text-lg font-black text-slate-900">{activeRoute.name}</h3>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500 font-semibold">Select Route:</span>
              <select
                value={selectedRouteId}
                onChange={(e) => setSelectedRouteId(e.target.value)}
                className="p-2 border border-slate-200 rounded-xl text-xs font-bold bg-slate-50 text-slate-800"
              >
                {routes.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Operating Buses</span>
              <div className="text-2xl font-black text-indigo-700 mt-1">{routeBuses.length}</div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Waypoints (Stops)</span>
              <div className="text-2xl font-black text-slate-900 mt-1">{activeRoute.stops.length}</div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Students</span>
              <div className="text-2xl font-black text-slate-900 mt-1">{routeStuCount}</div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Commuters</span>
              <div className="text-2xl font-black text-emerald-600 mt-1">{routeAsg.length}</div>
            </div>
          </div>

          {/* Two Visual Breakdown Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Passenger Distribution by Stop */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
              <h4 className="font-bold text-slate-900 text-sm">Passenger Load by Waypoint</h4>
              <div className="space-y-3">
                {activeRoute.stops.map(stop => {
                  const count = routeAsg.filter(a => a.pickupStopId === stop.id).length;
                  const pct = routeAsg.length > 0 ? Math.round((count / routeAsg.length) * 100) : 0;
                  return (
                    <div key={stop.id} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-slate-800">{stop.name}</span>
                        <span className="text-slate-500 font-mono"><strong>{count}</strong> ({pct}%)</span>
                      </div>
                      <ProgressBar progress={pct} size="sm" colorClass="bg-indigo-600" />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Passenger Distribution by Bus */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
              <h4 className="font-bold text-slate-900 text-sm">Fleet Passenger Allocation</h4>
              <div className="space-y-3">
                {routeBuses.map(b => {
                  const bCount = routeAsg.filter(a => a.busId === b.id).length;
                  const pct = b.capacity > 0 ? Math.round((bCount / b.capacity) * 100) : 0;
                  return (
                    <div key={b.id} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-900">{b.busNumber} ({b.name})</span>
                        <span className="font-mono text-slate-600">{bCount}/{b.capacity} ({pct}%)</span>
                      </div>
                      <ProgressBar progress={pct} size="sm" colorClass={pct > 90 ? 'bg-rose-500' : 'bg-indigo-600'} />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: STOP INSIGHTS */}
      {activeTab === 'stop' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-amber-50 text-amber-700 rounded-xl">
                <MapPin size={20} />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Inspecting Transit Stop</span>
                <h3 className="text-lg font-black text-slate-900">{activeStop?.name || 'Select Stop'}</h3>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-500 font-semibold">Route:</span>
                <select
                  value={selectedRouteId}
                  onChange={(e) => {
                    setSelectedRouteId(e.target.value);
                    const r = routes.find(x => x.id === e.target.value);
                    if (r && r.stops.length > 0) setSelectedStopId(r.stops[0].id);
                  }}
                  className="p-2 border border-slate-200 rounded-xl text-xs font-bold bg-slate-50 text-slate-800"
                >
                  {routes.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-500 font-semibold">Stop:</span>
                <select
                  value={selectedStopId}
                  onChange={(e) => setSelectedStopId(e.target.value)}
                  className="p-2 border border-slate-200 rounded-xl text-xs font-bold bg-slate-50 text-slate-800"
                >
                  {selectedRouteForStop?.stops.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.pickupTime})</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Commuters</span>
              <div className="text-2xl font-black text-indigo-700 mt-1">{stopAsg.length}</div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Students</span>
              <div className="text-2xl font-black text-slate-900 mt-1">{stopStu}</div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Faculty / Staff</span>
              <div className="text-2xl font-black text-slate-900 mt-1">{stopStaff}</div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Male</span>
              <div className="text-2xl font-black text-indigo-600 mt-1">{stopM}</div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Female</span>
              <div className="text-2xl font-black text-amber-600 mt-1">{stopF}</div>
            </div>
          </div>

          {/* Stop Passenger Roster */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden p-6 space-y-4">
            <h4 className="font-bold text-slate-900 text-sm">
              Passengers Boarding or Alighting at {activeStop?.name}
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-3">Passenger</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Gender</th>
                    <th className="px-4 py-3">Allocated Bus & Seat</th>
                    <th className="px-4 py-3">Waypoint Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stopAsg.map(asg => {
                    const stu = asg.passengerType === 'student' ? students.find(s => s.id === asg.passengerId) : null;
                    const sm = asg.passengerType === 'staff' ? staff.find(s => s.id === asg.passengerId) : null;
                    const p = stu || sm;
                    const b = buses.find(x => x.id === asg.busId);
                    const seat = b?.seatLayout.seats.find(s => s.id === asg.seatId);

                    return (
                      <tr key={asg.id} className="hover:bg-slate-50/70">
                        <td className="px-4 py-3 font-bold text-slate-900">
                          {p?.name}
                          <span className="block font-mono text-[10px] text-slate-400 font-normal">
                            {p && ('studentId' in p ? p.studentId : p.employeeId)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={asg.passengerType === 'student' ? 'info' : 'purple'}>
                            {asg.passengerType}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-600">
                          {p?.gender}
                        </td>
                        <td className="px-4 py-3 font-bold text-indigo-700">
                          {b?.busNumber} · Seat #{seat?.seatNumber || '--'}
                        </td>
                        <td className="px-4 py-3">
                          {asg.pickupStopId === activeStop?.id && (
                            <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                              Morning Pickup
                            </span>
                          )}
                          {asg.dropStopId === activeStop?.id && (
                            <span className="text-sky-700 font-bold bg-sky-50 px-2 py-0.5 rounded text-[11px]">
                              Evening Drop
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

