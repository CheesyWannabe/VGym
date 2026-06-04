"use client";

import { useState } from "react";
import { UserData, WorkoutLog } from "@/lib/constants";

interface Props {
  userData: UserData;
  onClose: () => void;
  onLog: (entry: WorkoutLog) => void;
}

export default function LogModal({ userData, onClose, onLog }: Props) {
  const [exId, setExId] = useState(userData.exercises[0]?.id ?? "");
  const [sets, setSets] = useState("3");
  const [reps, setReps] = useState("8");
  const [weight, setWeight] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  function submit() {
    const ex = userData.exercises.find((e) => e.id === exId);
    if (!ex) return;
    onLog({
      exercise: ex,
      sets: Number(sets),
      reps: Number(reps),
      weight: Number(weight),
      date,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 w-full max-w-sm">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-white font-black text-lg">Log Workout</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-white text-xl">
            ×
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-zinc-500 text-xs font-bold uppercase tracking-widest block mb-1.5">
              Exercise
            </label>
            <select
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-3 text-white text-sm focus:outline-none focus:border-red-500"
              value={exId}
              onChange={(e) => setExId(e.target.value)}
            >
              {userData.exercises.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {(
              [
                ["Sets", sets, setSets],
                ["Reps", reps, setReps],
                [userData.unit, weight, setWeight],
              ] as [string, string, (v: string) => void][]
            ).map(([label, val, set]) => (
              <div key={label}>
                <label className="text-zinc-500 text-xs font-bold uppercase tracking-widest block mb-1.5">
                  {label}
                </label>
                <input
                  type="number"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-3 text-white text-sm text-center focus:outline-none focus:border-red-500"
                  value={val}
                  onChange={(e) => set(e.target.value)}
                />
              </div>
            ))}
          </div>
          <div>
            <label className="text-zinc-500 text-xs font-bold uppercase tracking-widest block mb-1.5">
              Date
            </label>
            <input
              type="date"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-3 text-white text-sm focus:outline-none focus:border-red-500"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>
        <button
          onClick={submit}
          disabled={!weight}
          className="w-full mt-5 py-3 rounded-xl font-black text-white bg-red-600 hover:bg-red-500 disabled:opacity-30 transition-all"
        >
          LOG SET
        </button>
      </div>
    </div>
  );
}
