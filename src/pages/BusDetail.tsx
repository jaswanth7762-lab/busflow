import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAppState, useAppDispatch, useToast } from '../context/DataContext';
import { SeatLayoutView } from '../components/SeatLayoutView';
import { SeatLayoutBuilder } from '../components/SeatLayoutBuilder';
import { PassengerAssignModal } from '../components/PassengerAssignModal';
import { PassengerProfileModal } from '../components/PassengerProfileModal';
import { Modal } from '../components/Modal';
import { Badge } from '../components/Badge';
import { ProgressBar } from '../components/ProgressBar';
import { Seat, Student, Staff } from '../lib/types';
import { 
  ArrowLeft, 
  Bus as BusIcon, 
  MapPin, 
  Download, 
  Users, 
  Plus, 
  Settings2, 
  RefreshCw, 
  UserMinus, 
  Search,
  CheckCircle2
} from 'lucide-react';

export default function BusDetail() {
  const { busId } = useParams<{ busId: string }>();
  const navigate = useNavigate();
  const { buses, routes, students, staff, assignments } = useAppState();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedSeatForAssign, setSelectedSeatForAssign] = useState<Seat | null>(null);
  const [isLayoutBuilderOpen, setIsLayoutBuilderOpen] = useState(false);
  const [profileModalPassenger, setProfileModalPassenger] = useState<{ passenger: Student | Staff; type: 'student' | 'staff' } | null>(null);
  const [passengerSearch, setPassengerSearch] = useState('');

  const bus = buses.find(b => b.id === busId);
  const route = bus?.routeId ? routes.find(r => r.id === bus.routeId) : null;

  if (!bus) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Bus Not Found</h2>
        <Link to="/buses" className="text-indigo-600 font-semibold text-sm hover:underline">
          Return to fleet list
        </Link>
      </div>
    );
  }

  // Active assignments for this bus
  const busAssignments = assignments.filter(a => a.busId === bus.id && a.status === 'active');
  const occupiedCount = busAssignments.length;
  const availableCount = Math.max(0, bus.capacity - occupiedCount);
  const occupancyPercent = bus.capacity > 0 ? Math.round((occupiedCount / bus.capacity) * 100) : 0;

  // Passenger Breakdown stats: Students (M/F) & Staff (M/F)
  let stuMale = 0, stuFemale = 0;
  let staffMale = 0, staffFemale = 0;

  busAssignments.forEach(asg => {
    if (asg.passengerType === 'student') {
      const s = students.find(x => x.id === asg.passengerId);
      if (s?.gender === 'M') stuMale++;
      if (s?.gender === 'F') stuFemale++;
    } else {
      const sm = staff.find(x => x.id === asg.passengerId);
      if (sm?.gender === 'M') staffMale++;
      if (sm?.gender === 'F') staffFemale++;
    }
  });

  const totalMale = stuMale + staffMale;
  const totalFemale = stuFemale + staffFemale;
  const totalStudents = stuMale + stuFemale;
  const totalStaff = staffMale + staffFemale;

  // Stop-wise passenger distribution
  const stopCounts: { stopName: string; count: number; percentage: number }[] = [];
  if (route && route.stops) {
    route.stops.forEach(stop => {
      const count = busAssignments.filter(a => a.pickupStopId === stop.id).length;
      const pct = occupiedCount > 0 ? Math.round((count / occupiedCount) * 100) : 0;
      stopCounts.push({ stopName: stop.name, count, percentage: pct });
    });
  }

  // Handle unassign from layout inspector
  const handleUnassignSeat = (seat: Seat) => {
    if (!seat.passengerId) return;
    const targetAsg = busAssignments.find(a => a.seatId === seat.id);
    if (targetAsg) {
      if (confirm(`Unassign passenger from Seat ${seat.seatNumber}?`)) {
        dispatch({ type: 'UNASSIGN_PASSENGER', payload: { assignmentId: targetAsg.id } });
        showToast(`Seat ${seat.seatNumber} unassigned`, 'info');
      }
    }
  };

  // Export Bus Passenger List to CSV
  const handleExportCSV = () => {
    const rows = [
      ['Seat Number', 'Passenger Name', 'ID / Roll', 'Type', 'Gender', 'Phone', 'Pickup Stop', 'Drop Stop']
    ];

    bus.seatLayout.seats.forEach(seat => {
      const asg = busAssignments.find(a => a.seatId === seat.id);
      if (asg) {
        const student = asg.passengerType === 'student' ? students.find(s => s.id === asg.passengerId) : null;
        const staffMem = asg.passengerType === 'staff' ? staff.find(s => s.id === asg.passengerId) : null;
        const p = student || staffMem;
        const pId = student ? student.studentId : staffMem ? staffMem.employeeId : '';
        const pickup = route?.stops.find(s => s.id === asg.pickupStopId)?.name || '';
        const drop = route?.stops.find(s => s.id === asg.dropStopId)?.name || '';

        rows.push([
          seat.seatNumber,
          p?.name || 'Assigned',
          pId,
          asg.passengerType,
          p?.gender || '',
          p?.phone || '',
          pickup,
          drop
        ]);
      }
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${bus.busNumber}_Passenger_List.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported CSV for ${bus.busNumber}`, 'success');
  };

  // Filter passengers on table
  const filteredPassengerList = bus.seatLayout.seats
    .filter(seat => seat.status === 'assigned')
    .map(seat => {
      const asg = busAssignments.find(a => a.seatId === seat.id);
      const student = asg?.passengerType === 'student' ? students.find(s => s.id === asg.passengerId) : null;
      const staffMem = asg?.passengerType === 'staff' ? staff.find(s => s.id === asg.passengerId) : null;
      const p = student || staffMem;
      const pickup = route?.stops.find(s => s.id === asg?.pickupStopId)?.name || 'Default';
      const drop = route?.stops.find(s => s.id === asg?.dropStopId)?.name || 'Campus';

      return { seat, asg, passenger: p, pickup, drop, type: asg?.passengerType || 'student' };
    })
    .filter(item => {
      if (!passengerSearch) return true;
      const q = passengerSearch.toLowerCase();
      return (
        item.passenger?.name.toLowerCase().includes(q) ||
        item.seat.seatNumber.toLowerCase().includes(q) ||
        item.pickup.toLowerCase().includes(q)
      );
    });

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Breadcrumb & Actions Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Link
            to="/buses"
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">{bus.busNumber}</h1>
              <span className="font-mono text-sm px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-bold border border-slate-200">
                {bus.registrationNumber}
              </span>
              <Badge variant={bus.status === 'active' ? 'success' : 'default'}>
                {bus.status.toUpperCase()}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center space-x-1.5">
              <span>{bus.name}</span>
              <span>·</span>
              <MapPin size={13} className="text-slate-400" />
              <span className="text-slate-700 font-semibold">{route ? route.name : 'Unassigned Route'}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsLayoutBuilderOpen(true)}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-sm"
          >
            <Settings2 size={15} />
            <span>Configure Layout</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-sm"
          >
            <Download size={15} />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedSeatForAssign(null);
              setIsAssignModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center space-x-1.5 transition-colors shadow-sm shadow-indigo-100"
          >
            <Plus size={15} />
            <span>Assign Passenger</span>
          </button>
        </div>
      </div>

      {/* 4 Occupancy Metric Banner Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Capacity</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{bus.capacity}</div>
          <p className="text-xs text-slate-400 mt-0.5">Physical configured seats</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Occupied</span>
          <div className="text-2xl font-black text-indigo-600 mt-1">{occupiedCount}</div>
          <p className="text-xs text-slate-400 mt-0.5">Students & staff allocated</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Available</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">{availableCount}</div>
          <p className="text-xs text-slate-400 mt-0.5">Ready for booking</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Occupancy</span>
              <span className="text-xs font-black text-slate-900">{occupancyPercent}%</span>
            </div>
          </div>
          <div className="mt-3">
            <ProgressBar 
              progress={occupancyPercent} 
              colorClass={occupancyPercent > 90 ? 'bg-rose-500' : occupancyPercent > 70 ? 'bg-amber-500' : 'bg-indigo-600'} 
              size="md"
            />
          </div>
        </div>
      </div>

      {/* SIGNATURE SECTION: Interactive Visual Seat Layout Map */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-slate-100 gap-2">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Interactive Bus Seat Map</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Click any seat to inspect passenger profile, reassign seat, or unassign passenger.
            </p>
          </div>
          <div className="text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/70">
            Layout: <strong className="text-slate-800 uppercase">{bus.seatLayout.layoutType}</strong> ({bus.seatLayout.rows} Rows)
          </div>
        </div>

        <SeatLayoutView
          bus={bus}
          route={route || undefined}
          students={students}
          staff={staff}

          onAssignSeat={(seat) => {
            setSelectedSeatForAssign(seat);
            setIsAssignModalOpen(true);
          }}
          onUnassignPassenger={(asgId) => {
            // Find active seat and unassign
            const seat = bus.seatLayout.seats.find(s => s.passengerId);
            if (seat) handleUnassignSeat(seat);
          }}
          onChangeSeatRequested={(seat) => {
            if (seat.passengerId) {
              const student = students.find(s => s.id === seat.passengerId);
              const staffMem = staff.find(s => s.id === seat.passengerId);
              const p = student || staffMem;
              if (p) {
                setProfileModalPassenger({ passenger: p, type: student ? 'student' : 'staff' });
              }
            }
          }}
        />
      </div>

      {/* Two Analytics Columns: Demographic Breakdown & Stop Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Passenger Demographic Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm">Passenger Demographic Split</h3>
            <Badge variant="indigo">{occupiedCount} Total</Badge>
          </div>

          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="py-2.5 px-3 rounded-l-lg">Category</th>
                <th className="py-2.5 px-3">Male</th>
                <th className="py-2.5 px-3">Female</th>
                <th className="py-2.5 px-3 rounded-r-lg text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-3 px-3 font-semibold text-slate-800">Students</td>
                <td className="py-3 px-3 text-slate-600">{stuMale}</td>
                <td className="py-3 px-3 text-slate-600">{stuFemale}</td>
                <td className="py-3 px-3 font-bold text-slate-900 text-right">{totalStudents}</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-semibold text-slate-800">Faculty / Staff</td>
                <td className="py-3 px-3 text-slate-600">{staffMale}</td>
                <td className="py-3 px-3 text-slate-600">{staffFemale}</td>
                <td className="py-3 px-3 font-bold text-slate-900 text-right">{totalStaff}</td>
              </tr>
              <tr className="bg-slate-50/70 font-bold">
                <td className="py-3 px-3 text-slate-900">Total</td>
                <td className="py-3 px-3 text-indigo-700">{totalMale}</td>
                <td className="py-3 px-3 text-amber-700">{totalFemale}</td>
                <td className="py-3 px-3 text-slate-900 text-right">{occupiedCount}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Boarding Stop Distribution with Visual Bars */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm">Boarding Stop Distribution</h3>
            <span className="text-xs text-slate-400 font-medium">Morning Boarding Pressure</span>
          </div>

          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {stopCounts.length > 0 ? (
              stopCounts.map((sc, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">{sc.stopName}</span>
                    <span className="text-slate-500 font-mono">
                      <strong>{sc.count}</strong> pax ({sc.percentage}%)
                    </span>
                  </div>
                  <ProgressBar progress={sc.percentage} colorClass="bg-indigo-600" size="sm" />
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-6">No route stops configured.</p>
            )}
          </div>
        </div>
      </div>

      {/* Passengers Table on this bus */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Allocated Passengers</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Full roster of commuters assigned to {bus.busNumber}
            </p>
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              type="text"
              placeholder="Search passengers on bus..."
              value={passengerSearch}
              onChange={(e) => setPassengerSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase border-b border-slate-100">
              <tr>
                <th className="px-5 py-3">Seat</th>
                <th className="px-5 py-3">Passenger</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Gender</th>
                <th className="px-5 py-3">Pickup Stop</th>
                <th className="px-5 py-3">Drop Stop</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPassengerList.length > 0 ? (
                filteredPassengerList.map(({ seat, asg, passenger, pickup, drop, type }) => (
                  <tr key={seat.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5">
                      <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded">
                        #{seat.seatNumber}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-slate-900">{passenger?.name || 'Unknown'}</div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {passenger && ('studentId' in passenger ? passenger.studentId : passenger.employeeId)}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant={type === 'student' ? 'info' : 'purple'}>
                        {type}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 font-medium text-slate-600">
                      {passenger?.gender || '-'}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-slate-700">
                      {pickup}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-slate-700">
                      {drop}
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (passenger) setProfileModalPassenger({ passenger, type });
                        }}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                      >
                        Profile
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUnassignSeat(seat)}
                        className="text-xs font-semibold text-rose-600 hover:text-rose-800"
                      >
                        Unassign
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                    No passengers assigned or matching search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Layout Builder Modal */}
      <Modal
        isOpen={isLayoutBuilderOpen}
        onClose={() => setIsLayoutBuilderOpen(false)}
        title={`Seat Layout Configuration — ${bus.busNumber}`}
        subtitle="Define rows, seating arrangement presets, and calculate passenger capacity"
        maxWidth="3xl"
      >
        <SeatLayoutBuilder
          bus={bus}
          onSave={(layoutType, rows, seats) => {
            dispatch({
              type: 'UPDATE_BUS_SEATS',
              payload: { busId: bus.id, seats, rows }
            });
            showToast(`Updated seating layout for ${bus.busNumber}`, 'success');
            setIsLayoutBuilderOpen(false);
          }}
          onCancel={() => setIsLayoutBuilderOpen(false)}
        />
      </Modal>

      {/* Passenger Assign Modal */}
      <PassengerAssignModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        initialBusId={bus.id}
        initialSeatId={selectedSeatForAssign?.id}
      />

      {/* Passenger Profile Modal */}
      {profileModalPassenger && (
        <PassengerProfileModal
          isOpen={true}
          onClose={() => setProfileModalPassenger(null)}
          passenger={profileModalPassenger.passenger}
          passengerType={profileModalPassenger.type}
          onLaunchAssignment={(pId, pType) => {
            setProfileModalPassenger(null);
            setIsAssignModalOpen(true);
          }}
        />
      )}
    </div>
  );
}
