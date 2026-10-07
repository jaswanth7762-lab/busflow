import React, { useState, useEffect } from 'react';
import { useAppState, useAppDispatch, useToast } from '../context/DataContext';
import { Modal } from './Modal';
import { Badge } from './Badge';
import { Bus, Student, Staff, Seat, Route, Stop } from '../lib/types';
import { 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  Search, 
  User, 
  Bus as BusIcon, 
  MapPin, 
  ShieldCheck, 
  AlertCircle 
} from 'lucide-react';

interface PassengerAssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPassengerId?: string;
  initialPassengerType?: 'student' | 'staff';
  initialBusId?: string;
  initialSeatId?: string;
}

export function PassengerAssignModal({
  isOpen,
  onClose,
  initialPassengerId,
  initialPassengerType,
  initialBusId,
  initialSeatId,
}: PassengerAssignModalProps) {
  const { buses, routes, students, staff, assignments } = useAppState();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();

  const [step, setStep] = useState<number>(1);
  const [passengerType, setPassengerType] = useState<'student' | 'staff'>('student');
  const [passengerId, setPassengerId] = useState<string>('');
  const [busId, setBusId] = useState<string>('');
  const [seatId, setSeatId] = useState<string>('');
  const [pickupStopId, setPickupStopId] = useState<string>('');
  const [dropStopId, setDropStopId] = useState<string>('');
  const [passengerSearch, setPassengerSearch] = useState<string>('');

  // Auto initialize when props change
  useEffect(() => {
    if (isOpen) {
      if (initialPassengerId) {
        setPassengerId(initialPassengerId);
        if (initialPassengerType) setPassengerType(initialPassengerType);
        setStep(2);
      } else {
        setStep(1);
        setPassengerId('');
      }

      if (initialBusId) {
        setBusId(initialBusId);
        const b = buses.find(x => x.id === initialBusId);
        if (b?.routeId) {
          const r = routes.find(rt => rt.id === b.routeId);
          if (r && r.stops.length >= 2) {
            setPickupStopId(r.stops[0].id);
            setDropStopId(r.stops[r.stops.length - 1].id);
          }
        }
      }

      if (initialSeatId) {
        setSeatId(initialSeatId);
      }
    }
  }, [isOpen, initialPassengerId, initialPassengerType, initialBusId, initialSeatId]);

  // Selected entities
  const selectedStudent = students.find(s => s.id === passengerId);
  const selectedStaff = staff.find(s => s.id === passengerId);
  const currentPassenger = passengerType === 'student' ? selectedStudent : selectedStaff;

  const selectedBus = buses.find(b => b.id === busId);
  const selectedRoute = selectedBus?.routeId ? routes.find(r => r.id === selectedBus.routeId) : null;
  const selectedSeat = selectedBus?.seatLayout.seats.find(s => s.id === seatId);

  // If bus selected but no stops yet, auto-set default pickup/drop
  useEffect(() => {
    if (selectedRoute && selectedRoute.stops.length > 0) {
      if (!pickupStopId || !selectedRoute.stops.some(s => s.id === pickupStopId)) {
        setPickupStopId(selectedRoute.stops[0].id);
      }
      if (!dropStopId || !selectedRoute.stops.some(s => s.id === dropStopId)) {
        setDropStopId(selectedRoute.stops[selectedRoute.stops.length - 1].id);
      }
    }
  }, [selectedRoute]);

  // Reset form
  const handleClose = () => {
    setStep(1);
    setPassengerId('');
    setBusId('');
    setSeatId('');
    setPickupStopId('');
    setDropStopId('');
    setPassengerSearch('');
    onClose();
  };

  // Submit assignment
  const handleConfirmAssignment = () => {
    if (!passengerId || !busId || !seatId || !pickupStopId || !dropStopId || !selectedBus?.routeId) {
      showToast('Please complete all assignment steps.', 'error');
      return;
    }

    dispatch({
      type: 'ASSIGN_PASSENGER',
      payload: {
        passengerId,
        passengerType,
        busId,
        routeId: selectedBus.routeId,
        seatId,
        pickupStopId,
        dropStopId
      }
    });

    const pName = currentPassenger?.name || 'Passenger';
    showToast(`Assigned ${pName} to Seat ${selectedSeat?.seatNumber} on ${selectedBus.busNumber}`, 'success');
    handleClose();
  };

  // Filter passengers
  const filteredStudents = students.filter(s => {
    const q = passengerSearch.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.studentId.toLowerCase().includes(q);
  });

  const filteredStaff = staff.filter(s => {
    const q = passengerSearch.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.employeeId.toLowerCase().includes(q);
  });

  const stepsList = [
    { num: 1, label: 'Passenger' },
    { num: 2, label: 'Select Bus' },
    { num: 3, label: 'Choose Seat' },
    { num: 4, label: 'Pickup Stop' },
    { num: 5, label: 'Drop Stop' },
    { num: 6, label: 'Confirm' }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Passenger Transport Assignment"
      subtitle="Allocate student or staff to a specific college bus, seat, and boarding stop"
      maxWidth="3xl"
    >
      <div className="space-y-6">
        {/* Step Indicator */}
        <div className="flex items-center justify-between px-2 overflow-x-auto pb-2">
          {stepsList.map((s, idx) => {
            const isCompleted = step > s.num;
            const isCurrent = step === s.num;
            return (
              <React.Fragment key={s.num}>
                <div className="flex items-center space-x-2 shrink-0">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                      isCompleted ? 'bg-emerald-600 text-white' :
                      isCurrent ? 'bg-indigo-600 text-white ring-4 ring-indigo-100' :
                      'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {isCompleted ? <Check size={14} /> : s.num}
                  </div>
                  <span className={`text-xs font-semibold ${isCurrent ? 'text-indigo-600' : 'text-slate-500'}`}>
                    {s.label}
                  </span>
                </div>
                {idx < stepsList.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 min-w-[20px] ${idx < step - 1 ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* STEP 1: Select Passenger */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Step 1: Select Passenger</h3>
              <div className="inline-flex rounded-xl bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => { setPassengerType('student'); setPassengerId(''); }}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                    passengerType === 'student' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Student ({students.length})
                </button>
                <button
                  type="button"
                  onClick={() => { setPassengerType('staff'); setPassengerId(''); }}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                    passengerType === 'staff' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Staff ({staff.length})
                </button>
              </div>
            </div>

            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder={passengerType === 'student' ? "Search by student name or roll number (e.g. Rahul, 24CSE1001)..." : "Search by staff name or ID..."}
                value={passengerSearch}
                onChange={(e) => setPassengerSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl">
              {passengerType === 'student' ? (
                filteredStudents.length > 0 ? (
                  filteredStudents.map(s => {
                    const existingAsg = assignments.find(a => a.passengerId === s.id && a.status === 'active');
                    const isSelected = passengerId === s.id;

                    return (
                      <div
                        key={s.id}
                        onClick={() => setPassengerId(s.id)}
                        className={`p-3.5 flex items-center justify-between cursor-pointer transition-colors ${
                          isSelected ? 'bg-indigo-50/80 border-l-4 border-indigo-600' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-slate-900 text-sm">{s.name}</span>
                            <Badge variant={s.gender === 'M' ? 'info' : 'warning'}>{s.gender}</Badge>
                            {existingAsg && (
                              <Badge variant="indigo">Already Assigned</Badge>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5 font-mono">
                            {s.studentId} · {s.course} {s.branch} · Year {s.year}
                          </p>
                        </div>
                        <input
                          type="radio"
                          checked={isSelected}
                          onChange={() => setPassengerId(s.id)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                        />
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center text-sm text-slate-400">No students matching search</div>
                )
              ) : (
                filteredStaff.length > 0 ? (
                  filteredStaff.map(s => {
                    const existingAsg = assignments.find(a => a.passengerId === s.id && a.status === 'active');
                    const isSelected = passengerId === s.id;

                    return (
                      <div
                        key={s.id}
                        onClick={() => setPassengerId(s.id)}
                        className={`p-3.5 flex items-center justify-between cursor-pointer transition-colors ${
                          isSelected ? 'bg-indigo-50/80 border-l-4 border-indigo-600' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-slate-900 text-sm">{s.name}</span>
                            <Badge variant={s.gender === 'M' ? 'info' : 'warning'}>{s.gender}</Badge>
                            {existingAsg && (
                              <Badge variant="indigo">Already Assigned</Badge>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {s.employeeId} · {s.designation} ({s.department})
                          </p>
                        </div>
                        <input
                          type="radio"
                          checked={isSelected}
                          onChange={() => setPassengerId(s.id)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                        />
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center text-sm text-slate-400">No staff matching search</div>
                )
              )}
            </div>
          </div>
        )}

        {/* STEP 2: Select Bus */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <h3 className="font-bold text-slate-900 text-sm">Step 2: Choose College Bus</h3>
            <p className="text-xs text-slate-500">
              Select an active bus with available capacity and a connected route.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-72 overflow-y-auto">
              {buses.map(b => {
                const route = routes.find(r => r.id === b.routeId);
                const assignedCount = assignments.filter(a => a.busId === b.id && a.status === 'active').length;
                const availableCount = b.capacity - assignedCount;
                const isSelected = busId === b.id;

                return (
                  <div
                    key={b.id}
                    onClick={() => {
                      if (availableCount > 0 || b.id === busId) {
                        setBusId(b.id);
                        setSeatId(''); // reset seat on bus change
                      }
                    }}
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected ? 'border-indigo-600 bg-indigo-50/50 shadow-sm' :
                      availableCount <= 0 ? 'border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed' :
                      'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-black text-slate-900 text-base">{b.busNumber}</span>
                        <span className="text-xs font-mono font-medium text-slate-500">{b.registrationNumber}</span>
                      </div>
                      <p className="text-xs text-slate-700 font-semibold">{b.name}</p>
                      <div className="mt-2 text-xs text-slate-500 flex items-center space-x-1">
                        <MapPin size={13} className="text-slate-400" />
                        <span className="truncate">{route ? route.name : 'No route assigned'}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs font-medium">
                      <span className="text-slate-500">{assignedCount}/{b.capacity} Occupied</span>
                      <span className={availableCount > 0 ? 'text-emerald-700 font-bold' : 'text-rose-600 font-bold'}>
                        {availableCount > 0 ? `${availableCount} seats left` : 'BUS FULL'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 3: Choose Seat */}
        {step === 3 && selectedBus && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Step 3: Select Seat on {selectedBus.busNumber}</h3>
                <p className="text-xs text-slate-500">Pick an open seat from the graphical bus layout</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500">Selected:</span>{' '}
                <strong className="text-indigo-600 text-sm">{selectedSeat ? `Seat ${selectedSeat.seatNumber}` : 'None'}</strong>
              </div>
            </div>

            {/* Mini Visual Seat Grid */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col items-center max-h-80 overflow-y-auto">
              <div className="w-full max-w-sm bg-white p-4 rounded-3xl border-2 border-slate-300 shadow-md">
                <div className="text-center text-[10px] font-bold text-sky-800 bg-sky-50 py-1 rounded mb-3 border border-sky-200">
                  FRONT · DRIVER
                </div>

                <div className="space-y-2">
                  {Array.from({ length: selectedBus.seatLayout.rows }, (_, i) => i + 1).map(r => {
                    const rowSeats = selectedBus.seatLayout.seats.filter(s => s.row === r).sort((a, b) => a.column - b.column);
                    const leftColCount = selectedBus.seatLayout.layoutType === '3x2' ? 3 : 2;
                    const leftSeats = rowSeats.filter(s => s.column <= leftColCount);
                    const rightSeats = rowSeats.filter(s => s.column > leftColCount);

                    return (
                      <div key={r} className="flex items-center justify-between gap-1">
                        <div className="flex gap-1.5">
                          {leftSeats.map(s => {
                            const isAssigned = s.status === 'assigned';
                            const isBlocked = s.status === 'blocked';
                            const isChosen = seatId === s.id;

                            return (
                              <button
                                key={s.id}
                                type="button"
                                disabled={isAssigned || isBlocked}
                                onClick={() => setSeatId(s.id)}
                                className={`w-8 h-8 rounded text-[10px] font-bold border transition-all ${
                                  isChosen ? 'bg-indigo-600 text-white border-indigo-600 ring-2 ring-indigo-400' :
                                  isAssigned ? 'bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed' :
                                  isBlocked ? 'bg-rose-100 text-rose-300 border-rose-200 cursor-not-allowed' :
                                  'bg-white text-slate-700 border-slate-200 hover:border-indigo-500 hover:bg-indigo-50'
                                }`}
                              >
                                {s.seatNumber}
                              </button>
                            );
                          })}
                        </div>

                        <span className="text-[8px] text-slate-300 font-mono">·</span>

                        <div className="flex gap-1.5">
                          {rightSeats.map(s => {
                            const isAssigned = s.status === 'assigned';
                            const isBlocked = s.status === 'blocked';
                            const isChosen = seatId === s.id;

                            return (
                              <button
                                key={s.id}
                                type="button"
                                disabled={isAssigned || isBlocked}
                                onClick={() => setSeatId(s.id)}
                                className={`w-8 h-8 rounded text-[10px] font-bold border transition-all ${
                                  isChosen ? 'bg-indigo-600 text-white border-indigo-600 ring-2 ring-indigo-400' :
                                  isAssigned ? 'bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed' :
                                  isBlocked ? 'bg-rose-100 text-rose-300 border-rose-200 cursor-not-allowed' :
                                  'bg-white text-slate-700 border-slate-200 hover:border-indigo-500 hover:bg-indigo-50'
                                }`}
                              >
                                {s.seatNumber}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="text-center text-[9px] font-bold text-slate-400 pt-3 mt-3 border-t border-slate-200">
                  REAR
                </div>
              </div>

              <div className="flex gap-4 text-xs text-slate-500 mt-4">
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-white border border-slate-300 rounded" /> Available</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-indigo-600 rounded" /> Selected</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-slate-200 rounded" /> Occupied</span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Select Pickup Stop */}
        {step === 4 && selectedRoute && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <h3 className="font-bold text-slate-900 text-sm">Step 4: Select Boarding / Pickup Stop</h3>
            <p className="text-xs text-slate-500">Route: {selectedRoute.name}</p>

            <div className="space-y-2 max-h-72 overflow-y-auto">
              {selectedRoute.stops.map((stop) => {
                const isSelected = pickupStopId === stop.id;
                return (
                  <div
                    key={stop.id}
                    onClick={() => setPickupStopId(stop.id)}
                    className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                      isSelected ? 'border-indigo-600 bg-indigo-50/60 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center">
                        {stop.order}
                      </span>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{stop.name}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">{stop.landmark}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-1 rounded">
                        Pickup {stop.pickupTime}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 5: Select Drop Stop */}
        {step === 5 && selectedRoute && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <h3 className="font-bold text-slate-900 text-sm">Step 5: Select Drop Stop</h3>
            <p className="text-xs text-slate-500">Typically the college campus or destination stop</p>

            <div className="space-y-2 max-h-72 overflow-y-auto">
              {selectedRoute.stops.map((stop) => {
                const isSelected = dropStopId === stop.id;
                return (
                  <div
                    key={stop.id}
                    onClick={() => setDropStopId(stop.id)}
                    className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                      isSelected ? 'border-indigo-600 bg-indigo-50/60 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center">
                        {stop.order}
                      </span>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{stop.name}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">{stop.landmark}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded">
                        Drop {stop.dropTime}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 6: Confirmation */}
        {step === 6 && currentPassenger && selectedBus && selectedSeat && selectedRoute && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 flex items-start space-x-3">
              <ShieldCheck className="text-emerald-600 shrink-0 mt-0.5" size={20} />
              <div>
                <h4 className="font-bold text-emerald-950 text-sm">Assignment Ready to Confirm</h4>
                <p className="text-xs text-emerald-800 mt-0.5">
                  Review the transport allocation summary below. All statistics, occupancy charts, and passenger profiles will update immediately.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 uppercase font-semibold">Passenger</span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{currentPassenger.name}</p>
                <p className="text-slate-500 font-mono">
                  {'studentId' in currentPassenger ? currentPassenger.studentId : currentPassenger.employeeId} ({passengerType})
                </p>
              </div>

              <div>
                <span className="text-slate-400 uppercase font-semibold">Allocated Bus</span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{selectedBus.busNumber}</p>
                <p className="text-slate-500">{selectedBus.registrationNumber} ({selectedBus.name})</p>
              </div>

              <div>
                <span className="text-slate-400 uppercase font-semibold">Assigned Seat</span>
                <p className="font-black text-indigo-700 text-base mt-0.5">Seat #{selectedSeat.seatNumber}</p>
                <p className="text-slate-500">Row {selectedSeat.row}, Col {selectedSeat.column}</p>
              </div>

              <div>
                <span className="text-slate-400 uppercase font-semibold">Assigned Route</span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{selectedRoute.name}</p>
                <p className="text-slate-500">{selectedRoute.stops.length} Total stops</p>
              </div>

              <div>
                <span className="text-slate-400 uppercase font-semibold">Pickup Stop</span>
                <p className="font-bold text-slate-800 mt-0.5">
                  {selectedRoute.stops.find(s => s.id === pickupStopId)?.name}
                </p>
                <p className="text-indigo-600 font-medium">
                  {selectedRoute.stops.find(s => s.id === pickupStopId)?.pickupTime}
                </p>
              </div>

              <div>
                <span className="text-slate-400 uppercase font-semibold">Drop Stop</span>
                <p className="font-bold text-slate-800 mt-0.5">
                  {selectedRoute.stops.find(s => s.id === dropStopId)?.name}
                </p>
                <p className="text-emerald-600 font-medium">
                  {selectedRoute.stops.find(s => s.id === dropStopId)?.dropTime}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <button
            type="button"
            disabled={step === 1}
            onClick={() => setStep(step - 1)}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 disabled:opacity-40"
          >
            <ChevronLeft size={16} />
            <span>Back</span>
          </button>

          {step < 6 ? (
            <button
              type="button"
              disabled={
                (step === 1 && !passengerId) ||
                (step === 2 && !busId) ||
                (step === 3 && !seatId) ||
                (step === 4 && !pickupStopId) ||
                (step === 5 && !dropStopId)
              }
              onClick={() => setStep(step + 1)}
              className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm transition-colors disabled:opacity-40"
            >
              <span>Next Step</span>
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleConfirmAssignment}
              className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm transition-colors"
            >
              <Check size={18} />
              <span>Confirm & Activate Assignment</span>
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
