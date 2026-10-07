import React from 'react';
import { useAppState } from '../context/DataContext';
import { Modal } from './Modal';
import { Badge } from './Badge';
import { Stop, Route } from '../lib/types';
import { Users, Clock, MapPin, CheckCircle2 } from 'lucide-react';

interface StopDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  stop: Stop | null;
  route: Route | null;
}

export function StopDetailModal({ isOpen, onClose, stop, route }: StopDetailModalProps) {
  const { students, staff, assignments, buses } = useAppState();

  if (!stop || !route) return null;

  // Find all passengers boarding or dropping at this stop
  const stopAssignments = assignments.filter(
    a => a.routeId === route.id && (a.pickupStopId === stop.id || a.dropStopId === stop.id) && a.status === 'active'
  );

  let maleCount = 0;
  let femaleCount = 0;
  let studentCount = 0;
  let staffCount = 0;

  const passengerRoster = stopAssignments.map(asg => {
    const isStudent = asg.passengerType === 'student';
    const student = isStudent ? students.find(s => s.id === asg.passengerId) : null;
    const staffMember = !isStudent ? staff.find(s => s.id === asg.passengerId) : null;
    const bus = buses.find(b => b.id === asg.busId);
    const seat = bus?.seatLayout.seats.find(s => s.id === asg.seatId);

    const passenger = student || staffMember;
    if (passenger) {
      if (passenger.gender === 'M') maleCount++;
      if (passenger.gender === 'F') femaleCount++;
      if (isStudent) studentCount++;
      else staffCount++;
    }

    return {
      asg,
      passenger,
      bus,
      seat,
      isPickup: asg.pickupStopId === stop.id,
      isDrop: asg.dropStopId === stop.id,
    };
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={stop.name}
      subtitle={`Stop #${stop.order} on ${route.name}`}
      maxWidth="3xl"
    >
      <div className="space-y-6">
        {/* Top Info Bar */}
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <span className="text-xs font-semibold uppercase text-slate-400">Landmark</span>
            <p className="text-sm font-bold text-slate-800 mt-0.5">{stop.landmark || 'N/A'}</p>
          </div>
          <div>
            <span className="text-xs font-semibold uppercase text-slate-400">Timings</span>
            <p className="text-sm font-bold text-slate-800 mt-0.5">
              Pickup: {stop.pickupTime}
            </p>
            <p className="text-xs text-slate-500">Drop: {stop.dropTime}</p>
          </div>
          <div>
            <span className="text-xs font-semibold uppercase text-slate-400">Total Commuters</span>
            <p className="text-2xl font-black text-indigo-600 mt-0.5">{stopAssignments.length}</p>
          </div>
          <div>
            <span className="text-xs font-semibold uppercase text-slate-400">Demographics</span>
            <div className="flex gap-2 mt-1">
              <Badge variant="info">M: {maleCount}</Badge>
              <Badge variant="warning">F: {femaleCount}</Badge>
            </div>
          </div>
        </div>

        {/* Breakdown Tags */}
        <div className="flex items-center space-x-3 text-xs">
          <span className="text-slate-500 font-medium">Passenger Distribution:</span>
          <Badge variant="indigo">{studentCount} Students</Badge>
          <Badge variant="purple">{staffCount} Faculty/Staff</Badge>
        </div>

        {/* Commuters Table */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden">
          <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-200 flex justify-between items-center">
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
              Boarding & Alighting Passengers
            </h4>
            <span className="text-xs text-slate-500 font-medium">{passengerRoster.length} Passengers</span>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {passengerRoster.length > 0 ? (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-3">Passenger</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Bus & Seat</th>
                    <th className="px-4 py-3">Flow</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {passengerRoster.map(({ asg, passenger, bus, seat, isPickup, isDrop }) => (
                    <tr key={asg.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900">{passenger?.name || 'Unknown'}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {passenger && ('studentId' in passenger ? passenger.studentId : passenger.employeeId)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={asg.passengerType === 'student' ? 'info' : 'purple'}>
                          {asg.passengerType}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-700">
                        {bus?.busNumber} · <span className="font-bold text-indigo-600">Seat #{seat?.seatNumber || '--'}</span>
                      </td>
                      <td className="px-4 py-3">
                        {isPickup && (
                          <span className="inline-flex items-center text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                            Morning Pickup
                          </span>
                        )}
                        {isDrop && (
                          <span className="inline-flex items-center text-sky-700 font-semibold bg-sky-50 px-2 py-0.5 rounded text-[11px]">
                            Evening Drop
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">
                No passengers currently board or drop at this stop.
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
