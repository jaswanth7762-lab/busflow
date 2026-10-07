import React, { useState } from 'react';
import { Bus, Seat, Student, Staff, Route, Stop } from '../lib/types';
import { Badge } from './Badge';
import { User, Phone, MapPin, ArrowRight, UserMinus, RefreshCw, CheckCircle2, ShieldAlert } from 'lucide-react';

interface SeatLayoutViewProps {
  bus: Bus;
  route?: Route;
  students: Student[];
  staff: Staff[];
  onSelectSeat?: (seat: Seat) => void;
  onAssignSeat?: (seat: Seat) => void;
  onUnassignPassenger?: (assignmentId: string) => void;
  onChangeSeatRequested?: (seat: Seat) => void;
  selectedSeatId?: string;
  isInteractive?: boolean;
}

export function SeatLayoutView({
  bus,
  route,
  students,
  staff,
  onSelectSeat,
  onAssignSeat,
  onUnassignPassenger,
  onChangeSeatRequested,
  selectedSeatId,
  isInteractive = true
}: SeatLayoutViewProps) {
  const [activeSeat, setActiveSeat] = useState<Seat | null>(null);

  const { seatLayout } = bus;
  const layoutType = seatLayout.layoutType || '2x2';
  const rows = seatLayout.rows || 10;
  const seats = seatLayout.seats || [];

  // Group seats by row
  const rowMap = new Map<number, Seat[]>();
  seats.forEach(s => {
    if (!rowMap.has(s.row)) {
      rowMap.set(s.row, []);
    }
    rowMap.get(s.row)!.push(s);
  });

  // Sort rows
  const sortedRowKeys = Array.from(rowMap.keys()).sort((a, b) => a - b);

  // Helper to find passenger info
  const getPassenger = (passengerId?: string) => {
    if (!passengerId) return null;
    const student = students.find(s => s.id === passengerId);
    if (student) return { ...student, type: 'student' as const };
    const member = staff.find(s => s.id === passengerId);
    if (member) return { ...member, type: 'staff' as const };
    return null;
  };

  const getSeatColor = (seat: Seat) => {
    if (selectedSeatId === seat.id) {
      return 'bg-blue-600 text-white ring-2 ring-blue-600 ring-offset-2 border-blue-600';
    }
    switch (seat.status) {
      case 'assigned':
        return 'bg-indigo-600 text-white hover:bg-indigo-700 border-indigo-600 shadow-sm';
      case 'reserved':
        return 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200';
      case 'blocked':
        return 'bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed';
      case 'available':
      default:
        return 'bg-white text-slate-700 border-slate-200 hover:border-blue-400 hover:bg-blue-50/60 shadow-sm';
    }
  };

  const activePassenger = activeSeat?.passengerId ? getPassenger(activeSeat.passengerId) : null;

  // Split columns according to layout type
  // '2x2' -> cols [1, 2] aisle [3, 4]
  // '2x3' -> cols [1, 2] aisle [3, 4, 5]
  // '3x2' -> cols [1, 2, 3] aisle [4, 5]
  const leftColCount = layoutType === '3x2' ? 3 : 2;

  return (
    <div className="flex flex-col xl:flex-row gap-8 items-start">
      {/* Graphical Bus Interior Container */}
      <div className="bg-slate-900/5 p-6 rounded-3xl border border-slate-200/80 shadow-inner flex flex-col items-center">
        {/* Exterior Bus Frame */}
        <div className="relative bg-white rounded-[40px] border-4 border-slate-300 p-6 shadow-xl w-[320px] sm:w-[360px]">
          {/* Front Windshield & Driver Cabin */}
          <div className="mb-6 flex flex-col items-center border-b-2 border-slate-200/80 pb-4">
            <div className="w-48 h-5 bg-sky-100/80 rounded-t-xl border border-sky-300/80 flex items-center justify-center mb-3">
              <span className="text-[10px] font-bold tracking-widest text-sky-800 uppercase">FRONT WINDSHIELD</span>
            </div>
            
            <div className="w-full flex justify-between items-center px-4">
              {/* Entry Door indicator */}
              <div className="flex items-center space-x-1.5 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 text-xs font-semibold">
                <span>🚪 Entry Door</span>
              </div>

              {/* Driver Area */}
              <div className="flex items-center space-x-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                <span className="text-xs">🎛️</span>
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Driver Cabin</span>
              </div>
            </div>
          </div>

          {/* Seating Grid */}
          <div className="space-y-2.5">
            {sortedRowKeys.map((rowNum) => {
              const rowSeats = rowMap.get(rowNum) || [];
              const leftSeats = rowSeats.filter(s => s.column <= leftColCount).sort((a, b) => a.column - b.column);
              const rightSeats = rowSeats.filter(s => s.column > leftColCount).sort((a, b) => a.column - b.column);

              return (
                <div key={rowNum} className="flex items-center justify-between gap-1 group">
                  {/* Left Side Seats */}
                  <div className="flex items-center gap-1.5">
                    {leftSeats.map((seat) => {
                      const passenger = getPassenger(seat.passengerId);
                      return (
                        <button
                          key={seat.id}
                          type="button"
                          onClick={() => {
                            if (!isInteractive) return;
                            setActiveSeat(seat);
                            if (onSelectSeat) onSelectSeat(seat);
                          }}
                          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg text-xs font-bold border transition-all flex flex-col items-center justify-center relative cursor-pointer select-none group/seat ${getSeatColor(seat)}`}
                          title={`Seat ${seat.seatNumber}: ${passenger ? passenger.name : seat.status}`}
                        >
                          <span className="text-[11px] leading-tight">{seat.seatNumber}</span>
                          {/* Mini status indicator dot */}
                          {seat.status === 'assigned' && (
                            <span className="w-1.5 h-1.5 rounded-full bg-white/80 absolute bottom-1"></span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Central Aisle */}
                  <div className="flex-1 flex justify-center items-center px-1">
                    <span className="text-[9px] font-mono text-slate-300 tracking-widest select-none">· AISLE ·</span>
                  </div>

                  {/* Right Side Seats */}
                  <div className="flex items-center gap-1.5">
                    {rightSeats.map((seat) => {
                      const passenger = getPassenger(seat.passengerId);
                      return (
                        <button
                          key={seat.id}
                          type="button"
                          onClick={() => {
                            if (!isInteractive) return;
                            setActiveSeat(seat);
                            if (onSelectSeat) onSelectSeat(seat);
                          }}
                          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg text-xs font-bold border transition-all flex flex-col items-center justify-center relative cursor-pointer select-none group/seat ${getSeatColor(seat)}`}
                          title={`Seat ${seat.seatNumber}: ${passenger ? passenger.name : seat.status}`}
                        >
                          <span className="text-[11px] leading-tight">{seat.seatNumber}</span>
                          {seat.status === 'assigned' && (
                            <span className="w-1.5 h-1.5 rounded-full bg-white/80 absolute bottom-1"></span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Rear Bus Indicator */}
          <div className="mt-6 pt-3 border-t-2 border-slate-200/80 flex items-center justify-center text-slate-400">
            <span className="text-[10px] font-bold tracking-widest uppercase">REAR EMERGENCY EXIT</span>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-5 flex flex-wrap justify-center gap-3 text-xs text-slate-600 font-medium">
          <div className="flex items-center space-x-1.5">
            <span className="w-3.5 h-3.5 rounded bg-white border border-slate-300"></span>
            <span>Available</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3.5 h-3.5 rounded bg-indigo-600 border border-indigo-600"></span>
            <span>Assigned</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3.5 h-3.5 rounded bg-amber-100 border border-amber-300"></span>
            <span>Reserved</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3.5 h-3.5 rounded bg-slate-200 border border-slate-300"></span>
            <span>Blocked</span>
          </div>
        </div>
      </div>

      {/* Seat Inspector Details Panel (Interactive) */}
      <div className="flex-1 w-full max-w-md">
        {activeSeat ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-5 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">Selected Seat</span>
                <div className="flex items-center space-x-3 mt-1">
                  <h3 className="text-2xl font-black text-slate-900">Seat {activeSeat.seatNumber}</h3>
                  <Badge 
                    variant={
                      activeSeat.status === 'assigned' ? 'indigo' :
                      activeSeat.status === 'available' ? 'success' :
                      activeSeat.status === 'reserved' ? 'warning' : 'default'
                    }
                  >
                    {activeSeat.status.toUpperCase()}
                  </Badge>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400">Row {activeSeat.row} · Col {activeSeat.column}</span>
              </div>
            </div>

            {/* If assigned to a passenger */}
            {activePassenger ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-base">{activePassenger.name}</h4>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">
                        {'studentId' in activePassenger ? activePassenger.studentId : activePassenger.employeeId}
                      </p>
                    </div>
                    <Badge variant={activePassenger.type === 'student' ? 'info' : 'purple'}>
                      {activePassenger.type === 'student' ? 'Student' : 'Staff'}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-2 border-t border-slate-200/60">
                    <div>
                      <span className="text-slate-400">Gender:</span>{' '}
                      <span className="font-semibold text-slate-700">{activePassenger.gender === 'M' ? 'Male' : 'Female'}</span>
                    </div>
                    {'course' in activePassenger ? (
                      <div>
                        <span className="text-slate-400">Dept:</span>{' '}
                        <span className="font-semibold text-slate-700">{activePassenger.branch} ({activePassenger.year} Year)</span>
                      </div>
                    ) : (
                      <div>
                        <span className="text-slate-400">Role:</span>{' '}
                        <span className="font-semibold text-slate-700">{activePassenger.department}</span>
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-slate-600 flex items-center space-x-1.5 pt-1">
                    <Phone size={13} className="text-slate-400" />
                    <span>{activePassenger.phone}</span>
                  </div>
                </div>

                {/* Route & Stop details if available */}
                {route && (
                  <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-100 space-y-2 text-xs">
                    <div className="flex items-center text-blue-900 font-semibold">
                      <MapPin size={14} className="mr-1.5 text-blue-600" />
                      <span>{route.name}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600 pl-5">
                      <span>Pickup: <strong className="text-slate-800">{route.stops[0]?.name || 'Origin'}</strong></span>
                      <ArrowRight size={12} className="text-slate-400" />
                      <span>Drop: <strong className="text-slate-800">{route.stops[route.stops.length - 1]?.name || 'Campus'}</strong></span>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col gap-2 pt-2">
                  {onChangeSeatRequested && (
                    <button
                      type="button"
                      onClick={() => onChangeSeatRequested(activeSeat)}
                      className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
                    >
                      <RefreshCw size={14} />
                      <span>Reassign / Change Seat</span>
                    </button>
                  )}

                  {onUnassignPassenger && (
                    <button
                      type="button"
                      onClick={() => {
                        // find assignment
                        const asgId = `asg-found`; // will be passed via parent
                        onUnassignPassenger(asgId);
                      }}
                      className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold transition-colors border border-rose-200"
                    >
                      <UserMinus size={14} />
                      <span>Unassign Passenger</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* Available seat view */
              <div className="space-y-4">
                <div className="p-6 rounded-xl bg-slate-50 border border-slate-100 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">Seat Available</h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                      This seat is vacant and ready for passenger allocation on {bus.registrationNumber}.
                    </p>
                  </div>
                </div>

                {onAssignSeat && (
                  <button
                    type="button"
                    onClick={() => onAssignSeat(activeSeat)}
                    className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm flex items-center justify-center space-x-2"
                  >
                    <span>+ Assign Passenger to Seat {activeSeat.seatNumber}</span>
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-slate-50/70 border border-dashed border-slate-200 rounded-2xl p-8 text-center flex flex-col items-center justify-center min-h-[300px]">
            <span className="text-3xl mb-3">🪑</span>
            <h4 className="font-bold text-slate-700 text-sm">Click on any seat</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-xs">
              Select a seat to view passenger profile, change allocation, or assign a new student or staff member.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
