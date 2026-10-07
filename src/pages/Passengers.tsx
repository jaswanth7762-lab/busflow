import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppState, useAppDispatch, useToast } from '../context/DataContext';
import { PassengerProfileModal } from '../components/PassengerProfileModal';
import { PassengerAssignModal } from '../components/PassengerAssignModal';
import { Modal } from '../components/Modal';
import { Badge } from '../components/Badge';
import { Student, Staff, Assignment } from '../lib/types';
import { 
  Search, 
  Filter, 
  UserCheck, 
  Plus, 
  Trash2, 
  Edit2, 
  MapPin, 
  Bus as BusIcon, 
  RefreshCw,
  UserMinus,
  SlidersHorizontal,
  Phone
} from 'lucide-react';

export default function Passengers() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'students';

  const { students, staff, assignments, buses, routes } = useAppState();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'students' | 'staff' | 'assignments'>(
    (currentTab as any) || 'students'
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [busFilter, setBusFilter] = useState('all');
  const [routeFilter, setRouteFilter] = useState('all');
  const [genderFilter, setGenderFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');

  // Modals
  const [inspectPassenger, setInspectPassenger] = useState<{ passenger: Student | Staff; type: 'student' | 'staff' } | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignModalTarget, setAssignModalTarget] = useState<{ id?: string; type?: 'student' | 'staff' }>({});
  const [isAddPassengerModalOpen, setIsAddPassengerModalOpen] = useState(false);
  const [addPassengerType, setAddPassengerType] = useState<'student' | 'staff'>('student');

  const handleTabChange = (tab: 'students' | 'staff' | 'assignments') => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // 1. Filtered Students
  const filteredStudents = students.filter(s => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = s.name.toLowerCase().includes(q) || s.studentId.toLowerCase().includes(q);
    const matchesGender = genderFilter === 'all' || s.gender === genderFilter;
    const matchesBranch = branchFilter === 'all' || s.branch === branchFilter;
    const matchesYear = yearFilter === 'all' || String(s.year) === yearFilter;

    // Bus / Route filter check
    const asg = assignments.find(a => a.passengerId === s.id && a.status === 'active');
    const matchesBus = busFilter === 'all' || (busFilter === 'unassigned' ? !asg : asg?.busId === busFilter);
    const matchesRoute = routeFilter === 'all' || (asg ? asg.routeId === routeFilter : false);

    return matchesSearch && matchesGender && matchesBranch && matchesYear && matchesBus && matchesRoute;
  });

  // 2. Filtered Staff
  const filteredStaff = staff.filter(sm => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = sm.name.toLowerCase().includes(q) || sm.employeeId.toLowerCase().includes(q);
    const matchesGender = genderFilter === 'all' || sm.gender === genderFilter;
    const matchesDept = deptFilter === 'all' || sm.department === deptFilter;

    const asg = assignments.find(a => a.passengerId === sm.id && a.status === 'active');
    const matchesBus = busFilter === 'all' || (busFilter === 'unassigned' ? !asg : asg?.busId === busFilter);
    const matchesRoute = routeFilter === 'all' || (asg ? asg.routeId === routeFilter : false);

    return matchesSearch && matchesGender && matchesDept && matchesBus && matchesRoute;
  });

  // 3. Filtered Assignments
  const filteredAssignments = assignments.filter(asg => {
    const student = asg.passengerType === 'student' ? students.find(s => s.id === asg.passengerId) : null;
    const sm = asg.passengerType === 'staff' ? staff.find(s => s.id === asg.passengerId) : null;
    const p = student || sm;
    const bus = buses.find(b => b.id === asg.busId);

    const q = searchTerm.toLowerCase();
    const matchesSearch = p ? p.name.toLowerCase().includes(q) || ('studentId' in p ? p.studentId : p.employeeId).toLowerCase().includes(q) : false;
    const matchesBus = busFilter === 'all' || asg.busId === busFilter;
    const matchesRoute = routeFilter === 'all' || asg.routeId === routeFilter;

    return matchesSearch && matchesBus && matchesRoute && asg.status === 'active';
  });

  // Quick unassign
  const handleUnassign = (asgId: string, name: string) => {
    if (confirm(`Unassign ${name} from bus?`)) {
      dispatch({ type: 'UNASSIGN_PASSENGER', payload: { assignmentId: asgId } });
      showToast(`Unassigned ${name}`, 'info');
    }
  };

  // Add new passenger
  const handleCreatePassenger = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (addPassengerType === 'student') {
      const newStu: Student = {
        id: `stu-${Date.now()}`,
        studentId: fd.get('id') as string,
        name: fd.get('name') as string,
        gender: fd.get('gender') as 'M' | 'F',
        course: 'B.Tech',
        branch: fd.get('branch') as string,
        year: parseInt(fd.get('year') as string) || 1,
        phone: fd.get('phone') as string,
        parentName: fd.get('parentName') as string,
        parentPhone: fd.get('parentPhone') as string,
        status: 'active'
      };
      dispatch({ type: 'ADD_STUDENT', payload: newStu });
      showToast(`Added student ${newStu.name}`, 'success');
    } else {
      const newStaff: Staff = {
        id: `staff-${Date.now()}`,
        employeeId: fd.get('id') as string,
        name: fd.get('name') as string,
        gender: fd.get('gender') as 'M' | 'F',
        department: fd.get('department') as string,
        designation: fd.get('designation') as string,
        phone: fd.get('phone') as string,
        status: 'active'
      };
      dispatch({ type: 'ADD_STAFF', payload: newStaff });
      showToast(`Added staff ${newStaff.name}`, 'success');
    }
    setIsAddPassengerModalOpen(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Passenger Management</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Directory of enrolled students, faculty members, and live seat allocations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => { setAssignModalTarget({}); setIsAssignModalOpen(true); }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center space-x-1.5 transition-colors"
          >
            <UserCheck size={15} />
            <span>Assign Passenger</span>
          </button>

          <button
            onClick={() => setIsAddPassengerModalOpen(true)}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-2xs"
          >
            <Plus size={14} />
            <span>Add Person</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 flex overflow-x-auto px-6 pt-2 bg-slate-50/50">
          {(['students', 'staff', 'assignments'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`py-3.5 px-4 text-xs font-bold border-b-2 whitespace-nowrap transition-colors flex items-center space-x-2 ${
                activeTab === tab 
                  ? 'border-indigo-600 text-indigo-700 bg-white rounded-t-xl shadow-2xs' 
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <span className="capitalize">{tab}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                activeTab === tab ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-200/70 text-slate-600'
              }`}>
                {tab === 'students' && students.length}
                {tab === 'staff' && staff.length}
                {tab === 'assignments' && assignments.filter(a => a.status === 'active').length}
              </span>
            </button>
          ))}
        </div>

        {/* Filter Controls Bar */}
        <div className="p-4 border-b border-slate-100 bg-white flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder={`Search ${activeTab} by name or ID...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Bus Filter */}
            <select
              value={busFilter}
              onChange={(e) => setBusFilter(e.target.value)}
              className="p-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-700"
            >
              <option value="all">All Buses</option>
              <option value="unassigned">Unassigned Only</option>
              {buses.map(b => (
                <option key={b.id} value={b.id}>{b.busNumber}</option>
              ))}
            </select>

            {/* Route Filter */}
            <select
              value={routeFilter}
              onChange={(e) => setRouteFilter(e.target.value)}
              className="p-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-700"
            >
              <option value="all">All Routes</option>
              {routes.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>

            {/* Gender Filter */}
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="p-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-700"
            >
              <option value="all">All Genders</option>
              <option value="M">Male</option>
              <option value="F">Female</option>
            </select>

            {/* Extra Student filters */}
            {activeTab === 'students' && (
              <>
                <select
                  value={branchFilter}
                  onChange={(e) => setBranchFilter(e.target.value)}
                  className="p-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-700"
                >
                  <option value="all">All Branches</option>
                  {['CSE', 'ECE', 'IT', 'MECH', 'CIVIL', 'EEE', 'AIDS', 'CSBS'].map(br => (
                    <option key={br} value={br}>{br}</option>
                  ))}
                </select>

                <select
                  value={yearFilter}
                  onChange={(e) => setYearFilter(e.target.value)}
                  className="p-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-700"
                >
                  <option value="all">All Years</option>
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>
              </>
            )}
          </div>
        </div>

        {/* TAB 1: Students Table */}
        {activeTab === 'students' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Student ID & Name</th>
                  <th className="px-6 py-3.5">Gender</th>
                  <th className="px-6 py-3.5">Course & Branch</th>
                  <th className="px-6 py-3.5">Year</th>
                  <th className="px-6 py-3.5">Allocated Bus & Seat</th>
                  <th className="px-6 py-3.5">Pickup Stop</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map(student => {
                    const asg = assignments.find(a => a.passengerId === student.id && a.status === 'active');
                    const bus = asg ? buses.find(b => b.id === asg.busId) : null;
                    const seat = bus?.seatLayout.seats.find(s => s.id === asg?.seatId);
                    const route = bus?.routeId ? routes.find(r => r.id === bus.routeId) : null;
                    const pickup = route?.stops.find(s => s.id === asg?.pickupStopId);

                    return (
                      <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-6 py-4">
                          <button
                            type="button"
                            onClick={() => setInspectPassenger({ passenger: student, type: 'student' })}
                            className="font-bold text-slate-900 text-sm hover:text-indigo-600 transition-colors text-left"
                          >
                            {student.name}
                          </button>
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5">{student.studentId}</div>
                        </td>

                        <td className="px-6 py-4">
                          <Badge variant={student.gender === 'M' ? 'info' : 'warning'}>{student.gender}</Badge>
                        </td>

                        <td className="px-6 py-4 font-semibold text-slate-700">
                          {student.course} · {student.branch}
                        </td>

                        <td className="px-6 py-4 text-slate-600">
                          Year {student.year}
                        </td>

                        <td className="px-6 py-4">
                          {bus ? (
                            <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded">
                              {bus.busNumber} · Seat #{seat?.seatNumber || '--'}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">Not Assigned</span>
                          )}
                        </td>

                        <td className="px-6 py-4 text-slate-600">
                          {pickup ? pickup.name : '--'}
                        </td>

                        <td className="px-6 py-4">
                          <Badge variant={asg ? 'success' : 'default'}>
                            {asg ? 'Transport Active' : 'Unassigned'}
                          </Badge>
                        </td>

                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                            type="button"
                            onClick={() => setInspectPassenger({ passenger: student, type: 'student' })}
                            className="text-indigo-600 font-bold hover:underline"
                          >
                            Profile
                          </button>
                          {!asg ? (
                            <button
                              type="button"
                              onClick={() => {
                                setAssignModalTarget({ id: student.id, type: 'student' });
                                setIsAssignModalOpen(true);
                              }}
                              className="text-emerald-600 font-bold hover:underline"
                            >
                              Assign
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleUnassign(asg.id, student.name)}
                              className="text-rose-600 font-bold hover:underline"
                            >
                              Unassign
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-10 text-center text-slate-400">
                      No students found matching your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 2: Staff Table */}
        {activeTab === 'staff' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Employee ID & Name</th>
                  <th className="px-6 py-3.5">Gender</th>
                  <th className="px-6 py-3.5">Department</th>
                  <th className="px-6 py-3.5">Designation</th>
                  <th className="px-6 py-3.5">Allocated Bus & Seat</th>
                  <th className="px-6 py-3.5">Pickup Stop</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStaff.length > 0 ? (
                  filteredStaff.map(sm => {
                    const asg = assignments.find(a => a.passengerId === sm.id && a.status === 'active');
                    const bus = asg ? buses.find(b => b.id === asg.busId) : null;
                    const seat = bus?.seatLayout.seats.find(s => s.id === asg?.seatId);
                    const route = bus?.routeId ? routes.find(r => r.id === bus.routeId) : null;
                    const pickup = route?.stops.find(s => s.id === asg?.pickupStopId);

                    return (
                      <tr key={sm.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-6 py-4">
                          <button
                            type="button"
                            onClick={() => setInspectPassenger({ passenger: sm, type: 'staff' })}
                            className="font-bold text-slate-900 text-sm hover:text-indigo-600 transition-colors text-left"
                          >
                            {sm.name}
                          </button>
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5">{sm.employeeId}</div>
                        </td>

                        <td className="px-6 py-4">
                          <Badge variant={sm.gender === 'M' ? 'info' : 'warning'}>{sm.gender}</Badge>
                        </td>

                        <td className="px-6 py-4 font-semibold text-slate-700">
                          {sm.department}
                        </td>

                        <td className="px-6 py-4 text-slate-600">
                          {sm.designation}
                        </td>

                        <td className="px-6 py-4">
                          {bus ? (
                            <span className="font-bold text-purple-700 bg-purple-50 px-2 py-1 rounded">
                              {bus.busNumber} · Seat #{seat?.seatNumber || '--'}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">Not Assigned</span>
                          )}
                        </td>

                        <td className="px-6 py-4 text-slate-600">
                          {pickup ? pickup.name : '--'}
                        </td>

                        <td className="px-6 py-4">
                          <Badge variant={asg ? 'success' : 'default'}>
                            {asg ? 'Transport Active' : 'Unassigned'}
                          </Badge>
                        </td>

                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                            type="button"
                            onClick={() => setInspectPassenger({ passenger: sm, type: 'staff' })}
                            className="text-indigo-600 font-bold hover:underline"
                          >
                            Profile
                          </button>
                          {!asg ? (
                            <button
                              type="button"
                              onClick={() => {
                                setAssignModalTarget({ id: sm.id, type: 'staff' });
                                setIsAssignModalOpen(true);
                              }}
                              className="text-emerald-600 font-bold hover:underline"
                            >
                              Assign
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleUnassign(asg.id, sm.name)}
                              className="text-rose-600 font-bold hover:underline"
                            >
                              Unassign
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-10 text-center text-slate-400">
                      No staff members found matching your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: All Active Assignments */}
        {activeTab === 'assignments' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Passenger</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Bus & Seat</th>
                  <th className="px-6 py-3.5">Route Corridor</th>
                  <th className="px-6 py-3.5">Morning Pickup Stop</th>
                  <th className="px-6 py-3.5">Evening Drop Stop</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAssignments.map(asg => {
                  const student = asg.passengerType === 'student' ? students.find(s => s.id === asg.passengerId) : null;
                  const sm = asg.passengerType === 'staff' ? staff.find(s => s.id === asg.passengerId) : null;
                  const p = student || sm;
                  const bus = buses.find(b => b.id === asg.busId);
                  const seat = bus?.seatLayout.seats.find(s => s.id === asg.seatId);
                  const route = bus?.routeId ? routes.find(r => r.id === bus.routeId) : null;
                  const pickup = route?.stops.find(s => s.id === asg.pickupStopId);
                  const drop = route?.stops.find(s => s.id === asg.dropStopId);

                  return (
                    <tr key={asg.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{p?.name || 'Unknown'}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {p && ('studentId' in p ? p.studentId : p.employeeId)}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <Badge variant={asg.passengerType === 'student' ? 'info' : 'purple'}>
                          {asg.passengerType}
                        </Badge>
                      </td>

                      <td className="px-6 py-4 font-bold text-indigo-700">
                        {bus?.busNumber} · <span className="font-black">Seat #{seat?.seatNumber || '--'}</span>
                      </td>

                      <td className="px-6 py-4 font-medium text-slate-700">
                        {route?.name || '--'}
                      </td>

                      <td className="px-6 py-4 font-medium text-slate-800">
                        {pickup?.name || '--'}
                      </td>

                      <td className="px-6 py-4 font-medium text-slate-800">
                        {drop?.name || '--'}
                      </td>

                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (p) setInspectPassenger({ passenger: p, type: asg.passengerType });
                          }}
                          className="text-indigo-600 font-bold hover:underline"
                        >
                          Profile
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUnassign(asg.id, p?.name || 'Passenger')}
                          className="text-rose-600 font-bold hover:underline"
                        >
                          Unassign
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inspector Profile Modal */}
      {inspectPassenger && (
        <PassengerProfileModal
          isOpen={true}
          onClose={() => setInspectPassenger(null)}
          passenger={inspectPassenger.passenger}
          passengerType={inspectPassenger.type}
          onLaunchAssignment={(pId, pType) => {
            setInspectPassenger(null);
            setAssignModalTarget({ id: pId, type: pType });
            setIsAssignModalOpen(true);
          }}
        />
      )}

      {/* Assignment Modal */}
      <PassengerAssignModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        initialPassengerId={assignModalTarget.id}
        initialPassengerType={assignModalTarget.type}
      />

      {/* Add Passenger Modal */}
      <Modal
        isOpen={isAddPassengerModalOpen}
        onClose={() => setIsAddPassengerModalOpen(false)}
        title="Register New Passenger"
        subtitle="Add a student or faculty member into college transport directory"
      >
        <form onSubmit={handleCreatePassenger} className="space-y-4">
          <div className="flex gap-2 p-1 bg-slate-100 rounded-xl mb-4">
            <button
              type="button"
              onClick={() => setAddPassengerType('student')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                addPassengerType === 'student' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600'
              }`}
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => setAddPassengerType('staff')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                addPassengerType === 'staff' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600'
              }`}
            >
              Faculty / Staff
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              {addPassengerType === 'student' ? 'Student Roll Number' : 'Employee ID'}
            </label>
            <input required name="id" placeholder={addPassengerType === 'student' ? 'e.g., 24CSE1099' : 'e.g., EMP219'} className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-mono" />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Full Name</label>
            <input required name="name" placeholder="Full Name" className="w-full p-2.5 rounded-xl border border-slate-200 text-sm" />
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
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Mobile</label>
              <input required name="phone" placeholder="+91 9848012345" className="w-full p-2.5 rounded-xl border border-slate-200 text-sm" />
            </div>
          </div>

          {addPassengerType === 'student' ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Branch</label>
                  <input required name="branch" defaultValue="CSE" className="w-full p-2.5 rounded-xl border border-slate-200 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Year</label>
                  <input required type="number" name="year" defaultValue={2} min={1} max={4} className="w-full p-2.5 rounded-xl border border-slate-200 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Parent Name</label>
                  <input required name="parentName" placeholder="Parent Name" className="w-full p-2.5 rounded-xl border border-slate-200 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Parent Phone</label>
                  <input required name="parentPhone" placeholder="+91 9440123456" className="w-full p-2.5 rounded-xl border border-slate-200 text-sm" />
                </div>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Department</label>
                <input required name="department" defaultValue="Computer Science" className="w-full p-2.5 rounded-xl border border-slate-200 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Designation</label>
                <input required name="designation" defaultValue="Assistant Professor" className="w-full p-2.5 rounded-xl border border-slate-200 text-sm" />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3">
            <button type="button" onClick={() => setIsAddPassengerModalOpen(false)} className="px-4 py-2 border rounded-xl text-xs font-semibold">Cancel</button>
            <button type="submit" className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold">Register</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

