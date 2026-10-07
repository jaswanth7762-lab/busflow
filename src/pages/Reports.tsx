import React, { useState } from 'react';
import { useAppState, useToast } from '../context/DataContext';
import { Badge } from '../components/Badge';
import { ProgressBar } from '../components/ProgressBar';
import { Download, FileText, Filter, Bus as BusIcon, MapPin, Users, Calendar } from 'lucide-react';

type ReportType = 'bus' | 'route' | 'stop' | 'passenger';

export default function Reports() {
  const { buses, routes, students, staff, assignments, organization } = useAppState();
  const { showToast } = useToast();
  const [activeReport, setActiveReport] = useState<ReportType>('bus');
  const [selectedRouteFilter, setSelectedRouteFilter] = useState<string>('all');

  // Generic CSV exporter
  const downloadCSV = (filename: string, headers: string[], dataRows: (string | number)[][]) => {
    const csvContent = 'data:text/csv;charset=utf-8,' + [
      headers.join(','),
      ...dataRows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Downloaded ${filename}.csv`, 'success');
  };

  // 1. Bus Report Data
  const busReportData = buses.map(bus => {
    const busAsg = assignments.filter(a => a.busId === bus.id && a.status === 'active');
    const route = routes.find(r => r.id === bus.routeId);
    const assignedCount = busAsg.length;
    const availableCount = Math.max(0, bus.capacity - assignedCount);
    const occupancy = bus.capacity > 0 ? Math.round((assignedCount / bus.capacity) * 100) : 0;

    let studentsCount = 0, staffCount = 0, maleCount = 0, femaleCount = 0;
    busAsg.forEach(a => {
      if (a.passengerType === 'student') {
        studentsCount++;
        const s = students.find(x => x.id === a.passengerId);
        if (s?.gender === 'M') maleCount++;
        if (s?.gender === 'F') femaleCount++;
      } else {
        staffCount++;
        const sm = staff.find(x => x.id === a.passengerId);
        if (sm?.gender === 'M') maleCount++;
        if (sm?.gender === 'F') femaleCount++;
      }
    });

    return {
      bus,
      route,
      capacity: bus.capacity,
      assigned: assignedCount,
      available: availableCount,
      occupancy,
      students: studentsCount,
      staff: staffCount,
      male: maleCount,
      female: femaleCount
    };
  });

  const exportBusReport = () => {
    const headers = ['Bus Number', 'Registration', 'Bus Name', 'Route', 'Capacity', 'Assigned', 'Available', 'Occupancy %', 'Students', 'Staff', 'Male', 'Female'];
    const rows = busReportData.map(d => [
      d.bus.busNumber,
      d.bus.registrationNumber,
      d.bus.name,
      d.route?.name || 'Unassigned',
      d.capacity,
      d.assigned,
      d.available,
      `${d.occupancy}%`,
      d.students,
      d.staff,
      d.male,
      d.female
    ]);
    downloadCSV('College_Bus_Fleet_Report', headers, rows);
  };

  // 2. Route Report Data
  const routeReportData = routes.map(r => {
    const rBuses = buses.filter(b => b.routeId === r.id);
    const rAsg = assignments.filter(a => a.routeId === r.id && a.status === 'active');
    const totalCapacity = rBuses.reduce((acc, b) => acc + b.capacity, 0);
    const stuCount = rAsg.filter(a => a.passengerType === 'student').length;
    const stfCount = rAsg.filter(a => a.passengerType === 'staff').length;

    return {
      route: r,
      busesCount: rBuses.length,
      stopsCount: r.stops.length,
      capacity: totalCapacity,
      passengers: rAsg.length,
      students: stuCount,
      staff: stfCount,
      utilization: totalCapacity > 0 ? Math.round((rAsg.length / totalCapacity) * 100) : 0
    };
  });

  const exportRouteReport = () => {
    const headers = ['Route Name', 'Start Point', 'End Point', 'Stops Count', 'Assigned Buses', 'Total Fleet Capacity', 'Total Commuters', 'Students', 'Faculty / Staff', 'Route Utilization %'];
    const rows = routeReportData.map(d => [
      d.route.name,
      d.route.startPoint,
      d.route.endPoint,
      d.stopsCount,
      d.busesCount,
      d.capacity,
      d.passengers,
      d.students,
      d.staff,
      `${d.utilization}%`
    ]);
    downloadCSV('College_Route_Load_Report', headers, rows);
  };

  // 3. Stop Report Data
  const stopReportData: any[] = [];
  routes.forEach(r => {
    if (selectedRouteFilter !== 'all' && r.id !== selectedRouteFilter) return;
    r.stops.forEach(s => {
      const pickupAsg = assignments.filter(a => a.routeId === r.id && a.pickupStopId === s.id && a.status === 'active');
      const dropAsg = assignments.filter(a => a.routeId === r.id && a.dropStopId === s.id && a.status === 'active');

      let male = 0, female = 0, stus = 0, stfs = 0;
      pickupAsg.forEach(a => {
        if (a.passengerType === 'student') {
          stus++;
          const stu = students.find(x => x.id === a.passengerId);
          if (stu?.gender === 'M') male++;
          if (stu?.gender === 'F') female++;
        } else {
          stfs++;
          const sm = staff.find(x => x.id === a.passengerId);
          if (sm?.gender === 'M') male++;
          if (sm?.gender === 'F') female++;
        }
      });

      stopReportData.push({
        stop: s,
        route: r,
        morningPickupCount: pickupAsg.length,
        eveningDropCount: dropAsg.length,
        students: stus,
        staff: stfs,
        male,
        female
      });
    });
  });

  const exportStopReport = () => {
    const headers = ['Route', 'Stop Order', 'Stop Name', 'Landmark', 'Morning Pickup Time', 'Evening Drop Time', 'Morning Commuters', 'Evening Drops', 'Students', 'Staff', 'Male', 'Female'];
    const rows = stopReportData.map(d => [
      d.route.name,
      d.stop.order,
      d.stop.name,
      d.stop.landmark,
      d.stop.pickupTime,
      d.stop.dropTime,
      d.morningPickupCount,
      d.eveningDropCount,
      d.students,
      d.staff,
      d.male,
      d.female
    ]);
    downloadCSV('College_Stop_Pressure_Report', headers, rows);
  };

  // 4. Passenger Master Report
  const exportPassengerReport = () => {
    const headers = ['Category', 'ID / Roll No', 'Name', 'Gender', 'Dept / Branch', 'Year / Designation', 'Phone', 'Parent / Contact', 'Bus Number', 'Seat No', 'Route', 'Pickup Stop', 'Drop Stop'];
    const rows: any[] = [];

    students.forEach(s => {
      const asg = assignments.find(a => a.passengerId === s.id && a.status === 'active');
      const b = asg ? buses.find(x => x.id === asg.busId) : null;
      const r = asg ? routes.find(x => x.id === asg.routeId) : null;
      const seat = b?.seatLayout.seats.find(st => st.id === asg?.seatId);
      const pick = r?.stops.find(st => st.id === asg?.pickupStopId);
      const drop = r?.stops.find(st => st.id === asg?.dropStopId);

      rows.push([
        'Student',
        s.studentId,
        s.name,
        s.gender,
        s.branch,
        `Year ${s.year}`,
        s.phone,
        s.parentPhone,
        b?.busNumber || 'Unassigned',
        seat?.seatNumber || '--',
        r?.name || '--',
        pick?.name || '--',
        drop?.name || '--'
      ]);
    });

    staff.forEach(stf => {
      const asg = assignments.find(a => a.passengerId === stf.id && a.status === 'active');
      const b = asg ? buses.find(x => x.id === asg.busId) : null;
      const r = asg ? routes.find(x => x.id === asg.routeId) : null;
      const seat = b?.seatLayout.seats.find(st => st.id === asg?.seatId);
      const pick = r?.stops.find(st => st.id === asg?.pickupStopId);
      const drop = r?.stops.find(st => st.id === asg?.dropStopId);

      rows.push([
        'Staff',
        stf.employeeId,
        stf.name,
        stf.gender,
        stf.department,
        stf.designation,
        stf.phone,
        'N/A',
        b?.busNumber || 'Unassigned',
        seat?.seatNumber || '--',
        r?.name || '--',
        pick?.name || '--',
        drop?.name || '--'
      ]);
    });

    downloadCSV('College_Passenger_Transport_Master', headers, rows);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Reports & Master Data</h1>
          <p className="text-xs text-slate-500 mt-1">
            Official transport audits, occupancy statistics, and CSV data exports for {organization?.name}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {activeReport === 'bus' && (
            <button
              onClick={exportBusReport}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center space-x-1.5 transition-colors"
            >
              <Download size={15} />
              <span>Export Bus Report (CSV)</span>
            </button>
          )}

          {activeReport === 'route' && (
            <button
              onClick={exportRouteReport}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center space-x-1.5 transition-colors"
            >
              <Download size={15} />
              <span>Export Route Report (CSV)</span>
            </button>
          )}

          {activeReport === 'stop' && (
            <button
              onClick={exportStopReport}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center space-x-1.5 transition-colors"
            >
              <Download size={15} />
              <span>Export Stop Report (CSV)</span>
            </button>
          )}

          {activeReport === 'passenger' && (
            <button
              onClick={exportPassengerReport}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center space-x-1.5 transition-colors"
            >
              <Download size={15} />
              <span>Export Master Roster (CSV)</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-1.5 shadow-sm inline-flex flex-wrap gap-1">
        <button
          onClick={() => setActiveReport('bus')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeReport === 'bus' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Bus Report
        </button>
        <button
          onClick={() => setActiveReport('route')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeReport === 'route' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Route Report
        </button>
        <button
          onClick={() => setActiveReport('stop')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeReport === 'stop' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Stop Report
        </button>
        <button
          onClick={() => setActiveReport('passenger')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeReport === 'passenger' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Passenger Master Report
        </button>
      </div>

      {/* REPORT CONTENT 1: Bus Report */}
      {activeReport === 'bus' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden space-y-4 p-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Fleet Occupancy & Demographics Audit</h3>
              <p className="text-xs text-slate-500 mt-0.5">Current state calculation of active bus fleet capacity</p>
            </div>
            <Badge variant="indigo">{buses.length} Fleet Vehicles</Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3">Bus Number</th>
                  <th className="px-4 py-3">Route</th>
                  <th className="px-4 py-3 text-center">Capacity</th>
                  <th className="px-4 py-3 text-center">Assigned</th>
                  <th className="px-4 py-3 text-center">Available</th>
                  <th className="px-4 py-3">Occupancy</th>
                  <th className="px-4 py-3 text-center">Students</th>
                  <th className="px-4 py-3 text-center">Staff</th>
                  <th className="px-4 py-3 text-center">Male</th>
                  <th className="px-4 py-3 text-center">Female</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {busReportData.map(d => (
                  <tr key={d.bus.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900">{d.bus.busNumber}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{d.bus.registrationNumber}</div>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-700">
                      {d.route ? d.route.name : <span className="text-slate-400 italic">Unassigned</span>}
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-slate-800">{d.capacity}</td>
                    <td className="px-4 py-3 text-center font-bold text-indigo-700">{d.assigned}</td>
                    <td className="px-4 py-3 text-center font-bold text-emerald-700">{d.available}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2 min-w-[120px]">
                        <ProgressBar progress={d.occupancy} size="sm" />
                        <span className="font-semibold text-slate-700 text-[11px]">{d.occupancy}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">{d.students}</td>
                    <td className="px-4 py-3 text-center">{d.staff}</td>
                    <td className="px-4 py-3 text-center text-indigo-700 font-semibold">{d.male}</td>
                    <td className="px-4 py-3 text-center text-amber-700 font-semibold">{d.female}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT CONTENT 2: Route Report */}
      {activeReport === 'route' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden space-y-4 p-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Route Corridor Passenger Pressure</h3>
              <p className="text-xs text-slate-500 mt-0.5">Aggregate commuters, assigned buses, and utilization per route</p>
            </div>
            <Badge variant="indigo">{routes.length} Active Routes</Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3">Route Name</th>
                  <th className="px-4 py-3">Corridor</th>
                  <th className="px-4 py-3 text-center">Stops</th>
                  <th className="px-4 py-3 text-center">Buses</th>
                  <th className="px-4 py-3 text-center">Students</th>
                  <th className="px-4 py-3 text-center">Staff</th>
                  <th className="px-4 py-3 text-center">Total Pax</th>
                  <th className="px-4 py-3">Corridor Load</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {routeReportData.map(d => (
                  <tr key={d.route.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3 font-bold text-slate-900">{d.route.name}</td>
                    <td className="px-4 py-3 text-slate-500">
                      {d.route.startPoint} → {d.route.endPoint}
                    </td>
                    <td className="px-4 py-3 text-center font-semibold text-slate-700">{d.stopsCount}</td>
                    <td className="px-4 py-3 text-center font-bold text-indigo-700">{d.busesCount}</td>
                    <td className="px-4 py-3 text-center">{d.students}</td>
                    <td className="px-4 py-3 text-center">{d.staff}</td>
                    <td className="px-4 py-3 text-center font-black text-slate-900">{d.passengers}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2 min-w-[120px]">
                        <ProgressBar progress={d.utilization} size="sm" />
                        <span className="font-semibold text-slate-700 text-[11px]">{d.utilization}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT CONTENT 3: Stop Report */}
      {activeReport === 'stop' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden space-y-4 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Stop-by-Stop Passenger Inbound Distribution</h3>
              <p className="text-xs text-slate-500 mt-0.5">Morning boarding counts and evening drops per transit point</p>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500 font-medium">Filter Route:</span>
              <select
                value={selectedRouteFilter}
                onChange={(e) => setSelectedRouteFilter(e.target.value)}
                className="p-1.5 border border-slate-200 rounded-lg text-xs"
              >
                <option value="all">All Routes</option>
                {routes.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Stop Name</th>
                  <th className="px-4 py-3">Route</th>
                  <th className="px-4 py-3">Morning Pickup</th>
                  <th className="px-4 py-3 text-center">Boarding Pax</th>
                  <th className="px-4 py-3 text-center">Students</th>
                  <th className="px-4 py-3 text-center">Staff</th>
                  <th className="px-4 py-3 text-center">M / F</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stopReportData.map((d, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3 font-mono font-bold text-slate-500">{d.stop.order}</td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900">{d.stop.name}</div>
                      <div className="text-[11px] text-slate-400">{d.stop.landmark}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{d.route.name}</td>
                    <td className="px-4 py-3 text-indigo-700 font-semibold">{d.stop.pickupTime}</td>
                    <td className="px-4 py-3 text-center font-black text-indigo-700">{d.morningPickupCount}</td>
                    <td className="px-4 py-3 text-center">{d.students}</td>
                    <td className="px-4 py-3 text-center">{d.staff}</td>
                    <td className="px-4 py-3 text-center text-slate-600">{d.male} / {d.female}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT CONTENT 4: Passenger Master Report Preview */}
      {activeReport === 'passenger' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Comprehensive Passenger Master Ledger</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Full roll of {students.length} students and {staff.length} staff with allocation details
              </p>
            </div>
            <button
              onClick={exportPassengerReport}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center space-x-1.5"
            >
              <Download size={14} />
              <span>Download Full Master Ledger (CSV)</span>
            </button>
          </div>

          <div className="p-8 text-center bg-slate-50/60 rounded-xl border border-dashed border-slate-200 space-y-3">
            <Users className="mx-auto text-slate-400" size={32} />
            <h4 className="font-bold text-slate-800 text-sm">Full Passenger Export Ready</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              The passenger master report contains {students.length + staff.length} records including academic IDs, contact details, parent phone numbers, assigned buses, exact seat numbers, and pickup waypoints.
            </p>
            <button
              onClick={exportPassengerReport}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm inline-flex items-center space-x-2"
            >
              <Download size={15} />
              <span>Click to Export Complete CSV</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
