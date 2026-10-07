import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { Organization, Route, Bus, Student, Staff, Assignment, Stop, Seat } from '../lib/types';
import { generateMockData, generateSeatsForLayout } from '../lib/mockData';

export type Toast = {
  id: string;
  type: 'success' | 'info' | 'error' | 'warning';
  message: string;
};

type AppState = {
  organization: Organization;
  routes: Route[];
  buses: Bus[];
  students: Student[];
  staff: Staff[];
  assignments: Assignment[];
};

type AppAction = 
  | { type: 'RESET_DATA' }
  | { type: 'SET_ALL_DATA'; payload: AppState }
  | { type: 'ADD_BUS'; payload: Bus }
  | { type: 'UPDATE_BUS'; payload: Bus }
  | { type: 'DELETE_BUS'; payload: string }
  | { type: 'UPDATE_BUS_SEATS'; payload: { busId: string; seats: Seat[]; rows?: number } }
  | { type: 'ADD_ROUTE'; payload: Route }
  | { type: 'UPDATE_ROUTE'; payload: Route }
  | { type: 'DELETE_ROUTE'; payload: string }
  | { type: 'ADD_STOP'; payload: { routeId: string; stop: Stop } }
  | { type: 'UPDATE_STOP'; payload: { routeId: string; stop: Stop } }
  | { type: 'DELETE_STOP'; payload: { routeId: string; stopId: string } }
  | { type: 'REORDER_STOPS'; payload: { routeId: string; stops: Stop[] } }
  | { type: 'ADD_STUDENT'; payload: Student }
  | { type: 'UPDATE_STUDENT'; payload: Student }
  | { type: 'DELETE_STUDENT'; payload: string }
  | { type: 'ADD_STAFF'; payload: Staff }
  | { type: 'UPDATE_STAFF'; payload: Staff }
  | { type: 'DELETE_STAFF'; payload: string }
  | { type: 'ASSIGN_PASSENGER'; payload: {
      passengerId: string;
      passengerType: 'student' | 'staff';
      busId: string;
      routeId: string;
      seatId: string;
      pickupStopId: string;
      dropStopId: string;
    }}
  | { type: 'UNASSIGN_PASSENGER'; payload: { assignmentId: string } }
  | { type: 'CHANGE_PASSENGER_SEAT'; payload: { assignmentId: string; newSeatId: string } }
  | { type: 'CHANGE_PASSENGER_STOPS'; payload: { assignmentId: string; pickupStopId: string; dropStopId: string } }
  | { type: 'UPDATE_ORG'; payload: Organization };

const initialMock = generateMockData();

const initialState: AppState = {
  organization: initialMock.organization,
  routes: initialMock.routes,
  buses: initialMock.buses,
  students: initialMock.students,
  staff: initialMock.staff,
  assignments: initialMock.assignments,
};

const DataStateContext = createContext<AppState>(initialState);
const DataDispatchContext = createContext<React.Dispatch<AppAction>>(() => {});
const ToastContext = createContext<{
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'info' | 'error' | 'warning') => void;
  removeToast: (id: string) => void;
}>({
  toasts: [],
  showToast: () => {},
  removeToast: () => {},
});

function dataReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_ALL_DATA': return action.payload;

    case 'RESET_DATA': {
      localStorage.removeItem('busflow_data_v2');
      const data = generateMockData();
      return data;
    }

    case 'ADD_BUS': return { ...state, buses: [...state.buses, action.payload] };

    case 'UPDATE_BUS': return {
      ...state,
      buses: state.buses.map(b => b.id === action.payload.id ? action.payload : b)
    };

    case 'DELETE_BUS': {
      // Also unassign passengers assigned to this bus
      const busId = action.payload;
      const updatedAssignments = state.assignments.filter(a => a.busId !== busId);
      return {
        ...state,
        buses: state.buses.filter(b => b.id !== busId),
        assignments: updatedAssignments
      };
    }

    case 'UPDATE_BUS_SEATS': {
      const { busId, seats, rows } = action.payload;
      return {
        ...state,
        buses: state.buses.map(b => {
          if (b.id !== busId) return b;
          return {
            ...b,
            capacity: seats.length,
            seatLayout: {
              ...b.seatLayout,
              rows: rows ?? b.seatLayout.rows,
              seats: seats
            }
          };
        })
      };
    }

    case 'ADD_ROUTE': return { ...state, routes: [...state.routes, action.payload] };

    case 'UPDATE_ROUTE': return {
      ...state,
      routes: state.routes.map(r => r.id === action.payload.id ? action.payload : r)
    };

    case 'DELETE_ROUTE': return {
      ...state,
      routes: state.routes.filter(r => r.id !== action.payload),
      buses: state.buses.map(b => b.routeId === action.payload ? { ...b, routeId: undefined } : b)
    };

    case 'ADD_STOP': {
      const { routeId, stop } = action.payload;
      return {
        ...state,
        routes: state.routes.map(r => {
          if (r.id !== routeId) return r;
          const nextOrder = r.stops.length + 1;
          const newStop = { ...stop, order: nextOrder };
          return { ...r, stops: [...r.stops, newStop] };
        })
      };
    }

    case 'UPDATE_STOP': {
      const { routeId, stop } = action.payload;
      return {
        ...state,
        routes: state.routes.map(r => {
          if (r.id !== routeId) return r;
          return {
            ...r,
            stops: r.stops.map(s => s.id === stop.id ? stop : s)
          };
        })
      };
    }

    case 'DELETE_STOP': {
      const { routeId, stopId } = action.payload;
      return {
        ...state,
        routes: state.routes.map(r => {
          if (r.id !== routeId) return r;
          const filtered = r.stops.filter(s => s.id !== stopId);
          // Re-order remaining stops 1..n
          const reordered = filtered.map((s, idx) => ({ ...s, order: idx + 1 }));
          return { ...r, stops: reordered };
        })
      };
    }

    case 'REORDER_STOPS': {
      const { routeId, stops } = action.payload;
      const renumbered = stops.map((s, i) => ({ ...s, order: i + 1 }));
      return {
        ...state,
        routes: state.routes.map(r => r.id === routeId ? { ...r, stops: renumbered } : r)
      };
    }

    case 'ADD_STUDENT': return { ...state, students: [...state.students, action.payload] };

    case 'UPDATE_STUDENT': return {
      ...state,
      students: state.students.map(s => s.id === action.payload.id ? action.payload : s)
    };

    case 'DELETE_STUDENT': {
      const studentId = action.payload;
      const targetAsg = state.assignments.find(a => a.passengerId === studentId);
      let updatedBuses = state.buses;
      if (targetAsg) {
        updatedBuses = updatedBuses.map(b => {
          if (b.id !== targetAsg.busId) return b;
          return {
            ...b,
            seatLayout: {
              ...b.seatLayout,
              seats: b.seatLayout.seats.map(seat => seat.id === targetAsg.seatId ? { ...seat, status: 'available', passengerId: undefined } : seat)
            }
          };
        });
      }
      return {
        ...state,
        students: state.students.filter(s => s.id !== studentId),
        assignments: state.assignments.filter(a => a.passengerId !== studentId),
        buses: updatedBuses
      };
    }

    case 'ADD_STAFF': return { ...state, staff: [...state.staff, action.payload] };

    case 'UPDATE_STAFF': return {
      ...state,
      staff: state.staff.map(s => s.id === action.payload.id ? action.payload : s)
    };

    case 'DELETE_STAFF': {
      const staffId = action.payload;
      const targetAsg = state.assignments.find(a => a.passengerId === staffId);
      let updatedBuses = state.buses;
      if (targetAsg) {
        updatedBuses = updatedBuses.map(b => {
          if (b.id !== targetAsg.busId) return b;
          return {
            ...b,
            seatLayout: {
              ...b.seatLayout,
              seats: b.seatLayout.seats.map(seat => seat.id === targetAsg.seatId ? { ...seat, status: 'available', passengerId: undefined } : seat)
            }
          };
        });
      }
      return {
        ...state,
        staff: state.staff.filter(s => s.id !== staffId),
        assignments: state.assignments.filter(a => a.passengerId !== staffId),
        buses: updatedBuses
      };
    }

    case 'ASSIGN_PASSENGER': {
      const { passengerId, passengerType, busId, routeId, seatId, pickupStopId, dropStopId } = action.payload;

      // 1. Remove previous active assignment for this passenger if any
      const existingAsg = state.assignments.find(a => a.passengerId === passengerId && a.status === 'active');
      let busesCleaned = state.buses;
      if (existingAsg) {
        busesCleaned = busesCleaned.map(b => {
          if (b.id !== existingAsg.busId) return b;
          return {
            ...b,
            seatLayout: {
              ...b.seatLayout,
              seats: b.seatLayout.seats.map(seat => seat.id === existingAsg.seatId ? { ...seat, status: 'available', passengerId: undefined } : seat)
            }
          };
        });
      }

      // 2. Mark new seat as assigned in the target bus
      const updatedBuses = busesCleaned.map(b => {
        if (b.id !== busId) return b;
        return {
          ...b,
          seatLayout: {
            ...b.seatLayout,
            seats: b.seatLayout.seats.map(seat => {
              if (seat.id === seatId) {
                return { ...seat, status: 'assigned' as const, passengerId };
              }
              return seat;
            })
          }
        };
      });

      // 3. Create assignment record
      const newAssignment: Assignment = {
        id: `asg-${Date.now()}`,
        passengerId,
        passengerType,
        busId,
        routeId,
        seatId,
        pickupStopId,
        dropStopId,
        status: 'active',
        assignedAt: new Date().toISOString()
      };

      const remainingAssignments = state.assignments.filter(a => a.passengerId !== passengerId);

      return {
        ...state,
        buses: updatedBuses,
        assignments: [newAssignment, ...remainingAssignments]
      };
    }

    case 'UNASSIGN_PASSENGER': {
      const { assignmentId } = action.payload;
      const targetAsg = state.assignments.find(a => a.id === assignmentId);
      if (!targetAsg) return state;

      const updatedBuses = state.buses.map(b => {
        if (b.id !== targetAsg.busId) return b;
        return {
          ...b,
          seatLayout: {
            ...b.seatLayout,
            seats: b.seatLayout.seats.map(seat => {
              if (seat.id === targetAsg.seatId) {
                return { ...seat, status: 'available' as const, passengerId: undefined };
              }
              return seat;
            })
          }
        };
      });

      return {
        ...state,
        buses: updatedBuses,
        assignments: state.assignments.filter(a => a.id !== assignmentId)
      };
    }

    case 'CHANGE_PASSENGER_SEAT': {
      const { assignmentId, newSeatId } = action.payload;
      const targetAsg = state.assignments.find(a => a.id === assignmentId);
      if (!targetAsg) return state;

      const updatedBuses = state.buses.map(b => {
        if (b.id !== targetAsg.busId) return b;
        return {
          ...b,
          seatLayout: {
            ...b.seatLayout,
            seats: b.seatLayout.seats.map(seat => {
              if (seat.id === targetAsg.seatId) {
                return { ...seat, status: 'available' as const, passengerId: undefined };
              }
              if (seat.id === newSeatId) {
                return { ...seat, status: 'assigned' as const, passengerId: targetAsg.passengerId };
              }
              return seat;
            })
          }
        };
      });

      const updatedAssignments = state.assignments.map(a => {
        if (a.id === assignmentId) {
          return { ...a, seatId: newSeatId };
        }
        return a;
      });

      return {
        ...state,
        buses: updatedBuses,
        assignments: updatedAssignments
      };
    }

    case 'CHANGE_PASSENGER_STOPS': {
      const { assignmentId, pickupStopId, dropStopId } = action.payload;
      return {
        ...state,
        assignments: state.assignments.map(a => {
          if (a.id === assignmentId) {
            return { ...a, pickupStopId, dropStopId };
          }
          return a;
        })
      };
    }

    case 'UPDATE_ORG': return { ...state, organization: action.payload };

    default: return state;
  }
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: 'success' | 'info' | 'error' | 'warning' = 'success') => {
    const id = String(Date.now() + Math.random());
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const [state, dispatch] = useReducer(dataReducer, initialState, () => {
    try {
      const saved = localStorage.getItem('busflow_data_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.organization && Array.isArray(parsed.buses) && parsed.buses[0]?.seatLayout) {
          return parsed as AppState;
        }
      }
    } catch {
      // fallback
    }
    return initialState;
  });

  useEffect(() => {
    try {
      if (state && state.organization) {
        localStorage.setItem('busflow_data_v2', JSON.stringify(state));
      }
    } catch {
      // ignore quota
    }
  }, [state]);

  return (
    <DataStateContext.Provider value={state}>
      <DataDispatchContext.Provider value={dispatch}>
        <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
          {children}
        </ToastContext.Provider>
      </DataDispatchContext.Provider>
    </DataStateContext.Provider>
  );
}

export function useAppState() {
  return useContext(DataStateContext);
}

export function useAppDispatch() {
  return useContext(DataDispatchContext);
}

export function useToast() {
  return useContext(ToastContext);
}

