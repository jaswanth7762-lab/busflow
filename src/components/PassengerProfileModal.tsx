import React, { useState } from 'react';
import { useAppState, useAppDispatch, useToast } from '../context/DataContext';
import { Modal } from './Modal';
import { Badge } from './Badge';
import { Student, Staff, Assignment } from '../lib/types';
import { User, Phone, MapPin, Bus as BusIcon, RefreshCw, UserMinus, ShieldCheck, Mail, ArrowRight } from 'lucide-react';

interface PassengerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  passenger: Student | Staff | null;
  passengerType: 'student' | 'staff';
  onLaunchAssignment?: (passengerId: string, type: 'student' | 'staff') => void;
}

export function PassengerProfileModal({
  isOpen,
  onClose,
  passenger,
  passengerType,
  onLaunchAssignment,
}: PassengerProfileModalProps) {
  const { buses, routes, assignments } = useAppState();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();

  const [isChangingStop, setIsChangingStop] = useState(false);
  const [newPickupStopId, setNewPickupStopId] = useState('');
  const [newDropStopId, setNewDropStopId] = useState('');

  if (!passenger) return null;

  const isStudent = passengerType === 'student';
  const student = isStudent ? (passenger as Student) : null;
  const staffMember = !isStudent ? (passenger as Staff) : null;

  const currentAsg = assignments.find(a => a.passengerId === passenger.id && a.status === 'active');
  const bus = currentAsg ? buses.find(b => b.id === currentAsg.busId) : null;
  const route = bus?.routeId ? routes.find(r => r.id === bus.routeId) : null;
  const seat = bus?.seatLayout.seats.find(s => s.id === currentAsg?.seatId);
  const pickupStop = route?.stops.find(s => s.id === currentAsg?.pickupStopId);
  const dropStop = route?.stops.find(s => s.id === currentAsg?.dropStopId);

  const handleUnassign = () => {
    if (!currentAsg) return;
    if (confirm(`Unassign ${passenger.name} from Bus ${bus?.busNumber}?`)) {
      dispatch({ type: 'UNASSIGN_PASSENGER', payload: { assignmentId: currentAsg.id } });
      showToast(`Unassigned ${passenger.name}`, 'info');
      onClose();
    }
  };

  const handleSaveStops = () => {
    if (!currentAsg || !newPickupStopId || !newDropStopId) return;
    dispatch({
      type: 'CHANGE_PASSENGER_STOPS',
      payload: {
        assignmentId: currentAsg.id,
        pickupStopId: newPickupStopId,
        dropStopId: newDropStopId,
      }
    });
    showToast(`Updated boarding stops for ${passenger.name}`, 'success');
    setIsChangingStop(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={passenger.name}
      subtitle={isStudent ? `${student?.studentId} · Student Profile` : `${staffMember?.employeeId} · Faculty Profile`}
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Profile Card Header */}
        <div className="flex items-start justify-between bg-slate-50 p-5 rounded-2xl border border-slate-200/80">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-indigo-100">
              {passenger.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xl font-bold text-slate-900">{passenger.name}</h3>
                <Badge variant={passenger.gender === 'M' ? 'info' : 'warning'}>
                  {passenger.gender === 'M' ? 'Male' : 'Female'}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                {isStudent ? `${student?.course} - ${student?.branch} (${student?.year} Year)` : `${staffMember?.designation} · ${staffMember?.department}`}
              </p>
            </div>
          </div>

          <Badge variant={currentAsg ? 'success' : 'default'}>
            {currentAsg ? 'Transport Active' : 'Unassigned'}
          </Badge>
        </div>

        {/* Contact Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex items-center space-x-2 text-slate-600">
            <Phone size={14} className="text-slate-400" />
            <span>Mobile: <strong className="text-slate-800">{passenger.phone}</strong></span>
          </div>

          {isStudent && (
            <>
              <div className="flex items-center space-x-2 text-slate-600">
                <User size={14} className="text-slate-400" />
                <span>Parent: <strong className="text-slate-800">{student?.parentName}</strong></span>
              </div>
              <div className="flex items-center space-x-2 text-slate-600">
                <Phone size={14} className="text-slate-400" />
                <span>Parent Contact: <strong className="text-slate-800">{student?.parentPhone}</strong></span>
              </div>
            </>
          )}
        </div>

        {/* Transport Assignment Section */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            College Transport Allocation
          </h4>

          {currentAsg && bus && route ? (
            <div className="bg-slate-50/80 rounded-2xl border border-slate-200 p-5 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 uppercase font-semibold">Bus</span>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">{bus.busNumber}</p>
                  <p className="text-slate-500">{bus.registrationNumber}</p>
                </div>

                <div>
                  <span className="text-slate-400 uppercase font-semibold">Seat Number</span>
                  <p className="font-black text-indigo-600 text-lg mt-0.5">#{seat?.seatNumber || '--'}</p>
                  <p className="text-slate-500">Row {seat?.row}, Col {seat?.column}</p>
                </div>

                <div>
                  <span className="text-slate-400 uppercase font-semibold">Boarding (Pickup)</span>
                  <p className="font-bold text-slate-800 mt-0.5">{pickupStop?.name || 'Stop'}</p>
                  <p className="text-emerald-600 font-semibold">{pickupStop?.pickupTime}</p>
                </div>

                <div>
                  <span className="text-slate-400 uppercase font-semibold">Alighting (Drop)</span>
                  <p className="font-bold text-slate-800 mt-0.5">{dropStop?.name || 'Terminal'}</p>
                  <p className="text-sky-600 font-semibold">{dropStop?.dropTime}</p>
                </div>
              </div>

              {/* Edit stops inline */}
              {isChangingStop ? (
                <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-3">
                  <h5 className="font-bold text-slate-800 text-xs">Change Pickup & Drop Stops</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">Pickup Stop</label>
                      <select
                        value={newPickupStopId || pickupStop?.id}
                        onChange={(e) => setNewPickupStopId(e.target.value)}
                        className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                      >
                        {route.stops.map(s => (
                          <option key={s.id} value={s.id}>{s.name} ({s.pickupTime})</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">Drop Stop</label>
                      <select
                        value={newDropStopId || dropStop?.id}
                        onChange={(e) => setNewDropStopId(e.target.value)}
                        className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                      >
                        {route.stops.map(s => (
                          <option key={s.id} value={s.id}>{s.name} ({s.dropTime})</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsChangingStop(false)}
                      className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveStops}
                      className="px-3 py-1.5 text-xs bg-indigo-600 text-white rounded-lg font-bold"
                    >
                      Update Stops
                    </button>
                  </div>
                </div>
              ) : null}

              {/* Assignment Action buttons */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200/60">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onLaunchAssignment) onLaunchAssignment(passenger.id, passengerType);
                  }}
                  className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                >
                  <RefreshCw size={13} />
                  <span>Change Bus / Seat</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsChangingStop(!isChangingStop)}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                >
                  <MapPin size={13} />
                  <span>Change Boarding Stop</span>
                </button>

                <button
                  type="button"
                  onClick={handleUnassign}
                  className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors border border-rose-200 ml-auto"
                >
                  <UserMinus size={13} />
                  <span>Unassign Passenger</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center space-y-3">
              <BusIcon className="mx-auto text-slate-400" size={32} />
              <div>
                <h5 className="font-bold text-slate-700 text-sm">No Active Bus Assignment</h5>
                <p className="text-xs text-slate-500 mt-1">
                  This passenger has not been allocated a college bus seat yet.
                </p>
              </div>

              {onLaunchAssignment && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onLaunchAssignment(passenger.id, passengerType);
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors inline-flex items-center space-x-1.5"
                >
                  <span>+ Allocate Bus & Seat</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
