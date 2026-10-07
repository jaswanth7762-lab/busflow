import React, { useState } from 'react';
import { Bus, Seat, SeatLayoutType } from '../lib/types';
import { generateSeatsForLayout } from '../lib/mockData';
import { Save, Plus, Minus, Grid, AlertCircle, Check } from 'lucide-react';

interface SeatLayoutBuilderProps {
  bus: Bus;
  onSave: (layoutType: SeatLayoutType, rows: number, seats: Seat[]) => void;
  onCancel: () => void;
}

export function SeatLayoutBuilder({ bus, onSave, onCancel }: SeatLayoutBuilderProps) {
  const [layoutType, setLayoutType] = useState<SeatLayoutType>(bus.seatLayout?.layoutType || '2x2');
  const [rows, setRows] = useState<number>(bus.seatLayout?.rows || 10);
  const [seats, setSeats] = useState<Seat[]>(bus.seatLayout?.seats || generateSeatsForLayout(layoutType, rows));

  // Change preset
  const handlePresetChange = (newType: SeatLayoutType) => {
    setLayoutType(newType);
    const newSeats = generateSeatsForLayout(newType, rows);
    setSeats(newSeats);
  };

  // Adjust row count
  const handleRowsChange = (newRows: number) => {
    if (newRows < 3 || newRows > 20) return;
    setRows(newRows);
    const newSeats = generateSeatsForLayout(layoutType, newRows);
    // preserve already assigned seats if possible
    setSeats(newSeats);
  };

  // Toggle seat status (e.g. block or reserve seat)
  const toggleSeatStatus = (seatId: string) => {
    setSeats(prev => prev.map(s => {
      if (s.id !== seatId) return s;
      if (s.status === 'available') return { ...s, status: 'reserved' };
      if (s.status === 'reserved') return { ...s, status: 'blocked' };
      if (s.status === 'blocked') return { ...s, status: 'available' };
      return s; // assigned stays assigned
    }));
  };

  const calculatedCapacity = seats.filter(s => s.status !== 'blocked').length;

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Layout Configuration Preset
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['2x2', '2x3', '3x2'] as SeatLayoutType[]).map(type => (
              <button
                key={type}
                type="button"
                onClick={() => handlePresetChange(type)}
                className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                  layoutType === type
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {type} Layout
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Number of Rows
          </label>
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => handleRowsChange(rows - 1)}
              className="p-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-50"
              disabled={rows <= 4}
            >
              <Minus size={16} />
            </button>
            <span className="text-base font-bold text-slate-900 w-12 text-center">{rows}</span>
            <button
              type="button"
              onClick={() => handleRowsChange(rows + 1)}
              className="p-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-50"
              disabled={rows >= 16}
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Calculated Capacity
          </label>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-indigo-600">{calculatedCapacity}</span>
            <span className="text-xs text-slate-500 font-medium">Passenger Seats</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Click any seat in preview to toggle Reserved/Blocked.</p>
        </div>
      </div>

      {/* Visual Live Preview */}
      <div className="p-6 bg-slate-100/60 rounded-2xl border border-slate-200 flex flex-col items-center">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
          Live Interactive Layout Preview
        </h4>

        <div className="bg-white p-6 rounded-[32px] border-2 border-slate-300 shadow-lg w-[320px] sm:w-[360px]">
          <div className="w-full text-center py-1.5 mb-4 bg-sky-50 text-sky-800 text-[10px] font-bold rounded-lg border border-sky-200 uppercase tracking-wider">
            FRONT / DRIVER CABIN
          </div>

          <div className="space-y-2">
            {Array.from({ length: rows }, (_, i) => i + 1).map(r => {
              const rowSeats = seats.filter(s => s.row === r).sort((a, b) => a.column - b.column);
              const leftColCount = layoutType === '3x2' ? 3 : 2;
              const leftSeats = rowSeats.filter(s => s.column <= leftColCount);
              const rightSeats = rowSeats.filter(s => s.column > leftColCount);

              return (
                <div key={r} className="flex items-center justify-between">
                  <div className="flex gap-1.5">
                    {leftSeats.map(s => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => toggleSeatStatus(s.id)}
                        className={`w-9 h-8 rounded text-[11px] font-bold border transition-colors ${
                          s.status === 'blocked' ? 'bg-slate-200 text-slate-400 border-slate-300' :
                          s.status === 'reserved' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                          s.status === 'assigned' ? 'bg-indigo-600 text-white border-indigo-600' :
                          'bg-white text-slate-700 border-slate-200 hover:border-indigo-400'
                        }`}
                        title={`Click to toggle: ${s.seatNumber} (${s.status})`}
                      >
                        {s.seatNumber}
                      </button>
                    ))}
                  </div>

                  <span className="text-[8px] font-mono text-slate-300">AISLE</span>

                  <div className="flex gap-1.5">
                    {rightSeats.map(s => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => toggleSeatStatus(s.id)}
                        className={`w-9 h-8 rounded text-[11px] font-bold border transition-colors ${
                          s.status === 'blocked' ? 'bg-slate-200 text-slate-400 border-slate-300' :
                          s.status === 'reserved' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                          s.status === 'assigned' ? 'bg-indigo-600 text-white border-indigo-600' :
                          'bg-white text-slate-700 border-slate-200 hover:border-indigo-400'
                        }`}
                        title={`Click to toggle: ${s.seatNumber} (${s.status})`}
                      >
                        {s.seatNumber}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="w-full text-center py-1 mt-4 text-[9px] font-bold text-slate-400 border-t border-slate-200 uppercase tracking-wider">
            REAR OF BUS
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3 pt-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-sm transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => onSave(layoutType, rows, seats)}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm transition-colors shadow-sm flex items-center space-x-2"
        >
          <Save size={16} />
          <span>Save Layout & Capacity</span>
        </button>
      </div>
    </div>
  );
}
