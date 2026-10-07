import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppState, useAppDispatch, useToast } from '../context/DataContext';
import { StatCard } from '../components/StatCard';
import { ProgressBar } from '../components/ProgressBar';
import { Badge } from '../components/Badge';
import { PassengerAssignModal } from '../components/PassengerAssignModal';
import { Modal } from '../components/Modal';
import { 
  Bus as BusIcon, 
  Users, 
  Map as MapIcon, 
  UserCheck, 
  Plus, 
  ArrowRight, 
  Clock, 
  ChevronRight, 
  ShieldCheck, 
  MapPin, 
  TrendingUp,
  Percent
} from 'lucide-react';
import { Bus, Route, Student, Staff } from '../lib/types';
import { generateSeatsForLayout } from '../lib/mockData';

export default function Dashboard() {
  const { buses, students, staff, routes, assignments, organization } = useAppState();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Modals for Quick Actions
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isAddBusModalOpen, setIsAddBusModalOpen] = useState(false);
  const [isAddRouteModalOpen, setIsAddRouteModalOpen] = useState(false);
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [isAddStaffModalOpen, setIsAddStaffModalOpen] = useState(false);

  // High-level aggregates
  const totalBuses = buses.length;
  const totalRoutes = routes.length;
  const totalStudents = students.length;
  const totalStaff = staff.length;
  const totalPassengers = totalStudents + totalStaff;
  
  const totalFleetCapacity = buses.reduce((acc, b) => acc + b.capacity, 0);
  const activeAssignments = assignments.filter(a => a.status === 'active');
  const averageOccupancy = totalFleetCapacity > 0 ? Math.round((activeAssignments.length / totalFleetCapacity) * 100) : 0;

  // Recent Assignments (sorted by assignedAt descending)
  const recentAssignments = [...activeAssignments]
    .sort((a, b) => new Date(b.assignedAt).getTime() - new Date(a.assignedAt).getTime())
    .slice(0, 5)
    .map(asg => {
      const student = asg.passengerType === 'student' ? students.find(s => s.id === asg.passengerId) : null;
      const staffMem = asg.passengerType === 'staff' ? staff.find(s => s.id === asg.passengerId) : null;
      const passenger = student || staffMem;
      const bus = buses.find(b => b.id === asg.busId);
      const seat = bus?.seatLayout.seats.find(s => s.id === asg.seatId);
      const route = bus?.routeId ? routes.find(r => r.id === bus.routeId) : null;
      const pickupStop = route?.stops.find(s => s.id === asg.pickupStopId);

      return { asg, passenger, bus, seat, pickupStop };
    });

  // Handle Add Bus form
  const handleCreateBus = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const busNum = fd.get('busNumber') as string;
    const regNum = fd.get('registrationNumber') as string;
    const name = fd.get('name') as string;
    const routeId = fd.get('routeId') as string;
    const layoutType = fd.get('layoutType') as '2x2' | '2x3' | '3x2';
    const rows = parseInt(fd.get('rows') as string) || 10;

    const seats = generateSeatsForLayout(layoutType, rows);
    const newBus: Bus = {
      id: `bus-${Date.now()}`,
      busNumber: busNum,
      registrationNumber: regNum,
      name,
      capacity: seats.length,
      status: 'active',
      routeId: routeId || undefined,
      seatLayout: { layoutType, rows, seats },
      isActive: true,
    };

    dispatch({ type: 'ADD_BUS', payload: newBus });
    showToast(`Bus ${busNum} created with ${seats.length} seats`, 'success');
    setIsAddBusModalOpen(false);
    navigate(`/buses/${newBus.id}`);
  };

  // Handle Create Route form
  const handleCreateRoute = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const rName = fd.get('name') as string;
    const startPoint = fd.get('startPoint') as string;
    const endPoint = fd.get('endPoint') as string;

    const newRoute: Route = {
      id: `route-${Date.now()}`,
      name: rName,
      startPoint,
      endPoint,
      isActive: true,
      stops: [
        { id: `stop-${Date.now()}-1`, name: startPoint, landmark: 'Origin Departure Station', pickupTime: '06:45 AM', dropTime: '05:30 PM', order: 1 },
        { id: `stop-${Date.now()}-2`, name: endPoint, landmark: 'Campus Terminal Port', pickupTime: '07:55 AM', dropTime: '04:15 PM', order: 2 },
      ]
    };

    dispatch({ type: 'ADD_ROUTE', payload: newRoute });
    showToast(`Route "${rName}" created with origin and campus stops`, 'success');
    setIsAddRouteModalOpen(false);
    navigate(`/routes/${newRoute.id}`);
  };

  // Handle Add Student form
  const handleCreateStudent = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const newStu: Student = {
      id: `stu-${Date.now()}`,
      studentId: fd.get('studentId') as string,
      name: fd.get('name') as string,
      gender: fd.get('gender') as 'M' | 'F',
      course: fd.get('course') as string,
      branch: fd.get('branch') as string,
      year: parseInt(fd.get('year') as string) || 1,
      phone: fd.get('phone') as string,
      parentName: fd.get('parentName') as string,
      parentPhone: fd.get('parentPhone') as string,
      status: 'active'
    };

    dispatch({ type: 'ADD_STUDENT', payload: newStu });
    showToast(`Added student ${newStu.name} (${newStu.studentId})`, 'success');
    setIsAddStudentModalOpen(false);
  };

  // Handle Add Staff form
  const handleCreateStaff = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const newStaff: Staff = {
      id: `staff-${Date.now()}`,
      employeeId: fd.get('employeeId') as string,
      name: fd.get('name') as string,
      gender: fd.get('gender') as 'M' | 'F',
      department: fd.get('department') as string,
      designation: fd.get('designation') as string,
      phone: fd.get('phone') as string,
      status: 'active'
    };

    dispatch({ type: 'ADD_STAFF', payload: newStaff });
    showToast(`Added staff ${newStaff.name} (${newStaff.employeeId})`, 'success');
    setIsAddStaffModalOpen(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header Greeting Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Good morning, Administrator</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Here's your college transport structure and live passenger allocation at a glance.
          </p>
        </div>

        {/* Quick Actions Launcher Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsAssignModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-indigo-100 flex items-center space-x-1.5 transition-colors"
          >
            <UserCheck size={15} />
            <span>Assign Passenger</span>
          </button>

          <button
            onClick={() => setIsAddBusModalOpen(true)}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-2xs"
          >
            <Plus size={14} />
            <span>Add Bus</span>
          </button>

          <button
            onClick={() => setIsAddRouteModalOpen(true)}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-2xs"
          >
            <Plus size={14} />
            <span>Create Route</span>
          </button>

          <button
            onClick={() => setIsAddStudentModalOpen(true)}
            className="px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-1 transition-colors shadow-2xs"
          >
            <span>+ Student</span>
          </button>

          <button
            onClick={() => setIsAddStaffModalOpen(true)}
            className="px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-1 transition-colors shadow-2xs"
          >
            <span>+ Staff</span>
          </button>
        </div>
      </div>

      {/* Top 6 Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard title="Total Buses" value={totalBuses} icon={<BusIcon size={18} />} colorClass="text-indigo-600" bgClass="bg-indigo-50/80 border-indigo-100/60" />
        <StatCard title="Total Routes" value={totalRoutes} icon={<MapIcon size={18} />} colorClass="text-emerald-600" bgClass="bg-emerald-50/80 border-emerald-100/60" />
        <StatCard title="Students" value={totalStudents} icon={<Users size={18} />} colorClass="text-sky-600" bgClass="bg-sky-50/80 border-sky-100/60" />
        <StatCard title="Staff Members" value={totalStaff} icon={<Users size={18} />} colorClass="text-purple-600" bgClass="bg-purple-50/80 border-purple-100/60" />
        <StatCard title="Total Passengers" value={totalPassengers} icon={<UserCheck size={18} />} colorClass="text-amber-600" bgClass="bg-amber-50/80 border-amber-100/60" />
        <StatCard title="Fleet Occupancy" value={`${averageOccupancy}%`} icon={<Percent size={18} />} colorClass="text-rose-600" bgClass="bg-rose-50/80 border-rose-100/60" subtitle={`${activeAssignments.length}/${totalFleetCapacity} Seats`} />
      </div>

      {/* Bus Occupancy Overview (Distinct Horizontal Cards/Rows) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Bus Occupancy Overview</h2>
            <p className="text-xs text-slate-500 mt-0.5">Real-time seat utilization across operating fleet</p>
          </div>
          <Link to="/buses" className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1">
            <span>View All Fleet</span>
            <ChevronRight size={14} />
          </Link>
        </div>

        <div className="space-y-3.5">
          {buses.map((bus) => {
            const busAsg = assignments.filter(a => a.busId === bus.id && a.status === 'active');
            const route = bus.routeId ? routes.find(r => r.id === bus.routeId) : null;
            const occupied = busAsg.length;
            const percentage = bus.capacity > 0 ? Math.round((occupied / bus.capacity) * 100) : 0;
            const available = Math.max(0, bus.capacity - occupied);

            return (
              <div
                key={bus.id}
                className="p-5 rounded-2xl border border-slate-200/80 hover:border-indigo-300 hover:shadow-xs transition-all duration-200 bg-slate-50/40 hover:bg-white flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left Bus details */}
                <div className="flex items-start sm:items-center space-x-4 min-w-[240px]">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold shrink-0">
                    <BusIcon size={22} />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-black text-slate-900 text-base">{bus.busNumber}</span>
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-bold">
                        {bus.registrationNumber}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 flex items-center space-x-1">
                      <MapPin size={12} className="text-slate-400" />
                      <span className="font-semibold text-slate-700">{route ? route.name : 'Unassigned Route'}</span>
                    </p>
                  </div>
                </div>

                {/* Center: Visual Occupancy Bar & Numbers */}
                <div className="flex-1 max-w-md space-y-1.5 px-0 md:px-6">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Occupancy Load</span>
                    <span className="font-black text-slate-800">
                      {occupied} / {bus.capacity} seats <span className="text-slate-400">({percentage}%)</span>
                    </span>
                  </div>
                  <ProgressBar
                    progress={percentage}
                    colorClass={percentage > 90 ? 'bg-rose-500' : percentage > 70 ? 'bg-amber-500' : 'bg-indigo-600'}
                    size="md"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Layout: {bus.seatLayout?.layoutType || '2x2'}</span>
                    <span className={available > 0 ? 'text-emerald-600 font-semibold' : 'text-rose-500 font-bold'}>
                      {available > 0 ? `${available} seats available` : 'Full capacity'}
                    </span>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center space-x-2 shrink-0">
                  <Link
                    to={`/buses/${bus.id}`}
                    className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors inline-flex items-center space-x-1.5 shadow-2xs"
                  >
                    <span>View Seat Layout</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Columns: Route Overview & Recent Assignments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Route Overview */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Route Network Overview</h3>
              <p className="text-xs text-slate-500 mt-0.5">Corridors, designated buses, and stops</p>
            </div>
            <Link to="/routes" className="text-xs font-bold text-indigo-600 hover:text-indigo-800">
              View All Routes →
            </Link>
          </div>

          <div className="space-y-3">
            {routes.map(r => {
              const routeBuses = buses.filter(b => b.routeId === r.id);
              const routeAsg = assignments.filter(a => a.routeId === r.id && a.status === 'active');
              const studentCount = routeAsg.filter(a => a.passengerType === 'student').length;
              const staffCount = routeAsg.filter(a => a.passengerType === 'staff').length;

              return (
                <Link
                  key={r.id}
                  to={`/routes/${r.id}`}
                  className="p-4 rounded-2xl border border-slate-200/70 hover:border-indigo-300 hover:bg-indigo-50/20 transition-all flex items-center justify-between group block"
                >
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">
                      {r.name}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {r.stops.length} Ordered Stops · {routeBuses.length} Operating Buses
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="font-black text-indigo-700 text-sm">{routeAsg.length} Pax</span>
                    <p className="text-[10px] text-slate-400">{studentCount} Students, {staffCount} Staff</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Assignments Feed */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Recent Passenger Allocations</h3>
              <p className="text-xs text-slate-500 mt-0.5">Latest seat assignments across the college fleet</p>
            </div>
            <Link to="/passengers?tab=assignments" className="text-xs font-bold text-indigo-600 hover:text-indigo-800">
              All Assignments →
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {recentAssignments.map(({ asg, passenger, bus, seat, pickupStop }) => (
              <div key={asg.id} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 font-bold flex items-center justify-center shrink-0">
                    {passenger?.name.charAt(0) || 'P'}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{passenger?.name || 'Assigned User'}</div>
                    <div className="text-[11px] text-slate-400 flex items-center space-x-1.5 mt-0.5">
                      <Badge variant={asg.passengerType === 'student' ? 'info' : 'purple'}>
                        {asg.passengerType}
                      </Badge>
                      <span>Pickup: {pickupStop?.name || 'Stop'}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-bold text-indigo-700">
                    {bus?.busNumber} · <span className="font-black">Seat #{seat?.seatNumber || '--'}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {new Date(asg.assignedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODALS */}
      <PassengerAssignModal isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)} />

      {/* Add Bus Modal */}
      <Modal isOpen={isAddBusModalOpen} onClose={() => setIsAddBusModalOpen(false)} title="Add College Bus" subtitle="Create bus and initialize its graphical seat map">
        <form onSubmit={handleCreateBus} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Bus Number Code</label>
            <input required name="busNumber" placeholder="e.g., BUS-06" className="w-full p-2.5 rounded-xl border border-slate-200 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Vehicle Registration Plate</label>
            <input required name="registrationNumber" placeholder="e.g., AP16 TC 4421" className="w-full p-2.5 rounded-xl border border-slate-200 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Bus Name / Alias</label>
            <input required name="name" placeholder="e.g., Nagarjuna Deluxe" className="w-full p-2.5 rounded-xl border border-slate-200 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Route Corridor</label>
            <select name="routeId" className="w-full p-2.5 rounded-xl border border-slate-200 text-sm">
              <option value="">Unassigned</option>
              {routes.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Layout Preset</label>
              <select name="layoutType" defaultValue="2x2" className="w-full p-2.5 rounded-xl border border-slate-200 text-sm">
                <option value="2x2">2 × 2 Standard</option>
                <option value="2x3">2 × 3 High Capacity</option>
                <option value="3x2">3 × 2 Layout</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Number of Rows</label>
              <input required type="number" name="rows" defaultValue={10} min={4} max={16} className="w-full p-2.5 rounded-xl border border-slate-200 text-sm" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-3">
            <button type="button" onClick={() => setIsAddBusModalOpen(false)} className="px-4 py-2 border rounded-xl text-xs font-semibold">Cancel</button>
            <button type="submit" className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold">Create Bus & Layout</button>
          </div>
        </form>
      </Modal>

      {/* Add Route Modal */}
      <Modal isOpen={isAddRouteModalOpen} onClose={() => setIsAddRouteModalOpen(false)} title="Create Bus Route" subtitle="Set up departure origin, arrival campus terminal, and sequential stops">
        <form onSubmit={handleCreateRoute} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Route Name</label>
            <input required name="name" placeholder="e.g., Gannavaram → College Campus" className="w-full p-2.5 rounded-xl border border-slate-200 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Start Point (Departure Origin)</label>
            <input required name="startPoint" placeholder="e.g., Gannavaram Bus Stand" className="w-full p-2.5 rounded-xl border border-slate-200 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">End Point (Arrival Campus)</label>
            <input required name="endPoint" defaultValue="VRSEC Campus Gate" className="w-full p-2.5 rounded-xl border border-slate-200 text-sm" />
          </div>
          <div className="flex justify-end gap-2 pt-3">
            <button type="button" onClick={() => setIsAddRouteModalOpen(false)} className="px-4 py-2 border rounded-xl text-xs font-semibold">Cancel</button>
            <button type="submit" className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold">Create Route</button>
          </div>
        </form>
      </Modal>

      {/* Add Student Modal */}
      <Modal isOpen={isAddStudentModalOpen} onClose={() => setIsAddStudentModalOpen(false)} title="Add Student" subtitle="Create student record in transport directory">
        <form onSubmit={handleCreateStudent} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Student Roll Number</label>
              <input required name="studentId" placeholder="e.g., 24CSE1089" className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-mono" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Full Name</label>
              <input required name="name" placeholder="e.g., Tejaswi Reddy" className="w-full p-2.5 rounded-xl border border-slate-200 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Gender</label>
              <select name="gender" className="w-full p-2.5 rounded-xl border border-slate-200 text-sm">
                <option value="M">Male</option>
                <option value="F">Female</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Branch</label>
              <input required name="branch" defaultValue="CSE" className="w-full p-2.5 rounded-xl border border-slate-200 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Academic Year</label>
              <input required type="number" name="year" defaultValue={2} min={1} max={4} className="w-full p-2.5 rounded-xl border border-slate-200 text-sm" />
            </div>
          </div>
          <input type="hidden" name="course" value="B.Tech" />
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Phone Number</label>
            <input required name="phone" placeholder="+91 9848011223" className="w-full p-2.5 rounded-xl border border-slate-200 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Parent Name</label>
              <input required name="parentName" placeholder="e.g., K. Prasad Rao" className="w-full p-2.5 rounded-xl border border-slate-200 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Parent Phone</label>
              <input required name="parentPhone" placeholder="+91 9440123456" className="w-full p-2.5 rounded-xl border border-slate-200 text-sm" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-3">
            <button type="button" onClick={() => setIsAddStudentModalOpen(false)} className="px-4 py-2 border rounded-xl text-xs font-semibold">Cancel</button>
            <button type="submit" className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold">Save Student</button>
          </div>
        </form>
      </Modal>

      {/* Add Staff Modal */}
      <Modal isOpen={isAddStaffModalOpen} onClose={() => setIsAddStaffModalOpen(false)} title="Add Faculty / Staff" subtitle="Register employee into transport roster">
        <form onSubmit={handleCreateStaff} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Employee ID</label>
              <input required name="employeeId" placeholder="e.g., EMP215" className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-mono" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Full Name</label>
              <input required name="name" placeholder="e.g., Dr. Murali Krishna" className="w-full p-2.5 rounded-xl border border-slate-200 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Gender</label>
              <select name="gender" className="w-full p-2.5 rounded-xl border border-slate-200 text-sm">
                <option value="M">Male</option>
                <option value="F">Female</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Phone</label>
              <input required name="phone" placeholder="+91 9849123456" className="w-full p-2.5 rounded-xl border border-slate-200 text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Department</label>
            <input required name="department" defaultValue="Computer Science & Engg." className="w-full p-2.5 rounded-xl border border-slate-200 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Designation</label>
            <input required name="designation" defaultValue="Associate Professor" className="w-full p-2.5 rounded-xl border border-slate-200 text-sm" />
          </div>
          <div className="flex justify-end gap-2 pt-3">
            <button type="button" onClick={() => setIsAddStaffModalOpen(false)} className="px-4 py-2 border rounded-xl text-xs font-semibold">Cancel</button>
            <button type="submit" className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold">Save Staff Member</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

