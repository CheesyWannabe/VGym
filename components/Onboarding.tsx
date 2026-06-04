"use client";

import { useState } from "react";
import {
  EXERCISE_LIBRARY,
  Exercise,
  PR,
  UserData,
  generateProgressData,
} from "@/lib/constants";

interface Props {
  onComplete: (data: UserData) => void;
}

export default function Onboarding({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [weight, setWeight] = useState("");
  const [unit, setUnit] = useState<"kg" | "lbs">("kg");
  const [selected, setSelected] = useState<Record<string, Exercise[]>>({});
  const [prs, setPrs] = useState<Record<string, PR>>({});

  const allSelected = Object.values(selected).flat();

  function toggleExercise(ex: Exercise) {
    setSelected((prev) => {
      const cur = prev[ex.category] ?? [];
      const has = cur.find((e) => e.id === ex.id);
      return {
        ...prev,
        [ex.category]: has ? cur.filter((e) => e.id !== ex.id) : [...cur, ex],
      };
    });
  }

  function isSelected(ex: Exercise) {
    return !!(selected[ex.category] ?? []).find((e) => e.id === ex.id);
  }

  function handlePR(exId: string, field: "weight" | "reps", val: string) {
    setPrs((prev) => ({
      ...prev,
      [exId]: { ...(prev[exId] ?? { weight: 0, reps: 0 }), [field]: Number(val) },
    }));
  }

  function finish() {
    onComplete({
      name,
      bodyWeight: Number(weight),
      unit,
      exercises: allSelected,
      prs,
      progressData: generateProgressData(Number(weight)),
      completedDays: {},
      logs: [],
    });
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {step > 0 && (
          <div className="mb-6 flex gap-1">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-all ${
                  s <= step ? "bg-red-500" : "bg-zinc-800"
                }`}
              />
            ))}
          </div>
        )}

        {/* Step 0: Welcome */}
        {step === 0 && (
          <div className="flex flex-col gap-6">
            <div className="text-center">
              <div className="text-6xl mb-4">⚡</div>
              <h1 className="text-3xl font-black text-white mb-2">Welcome to VGYM</h1>
              <p className="text-zinc-400">
                Your aesthetic physique command center. Let&apos;s build your baseline.
              </p>
            </div>
            <div>
              <label className="text-zinc-400 text-xs font-bold uppercase tracking-widest block mb-2">
                Your Name
              </label>
              <input
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white text-lg focus:outline-none focus:border-red-500 transition-colors"
                placeholder="Enter your name..."
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <button
              onClick={() => setStep(1)}
              disabled={!name.trim()}
              className="w-full py-4 rounded-xl font-black text-lg text-white bg-red-600 hover:bg-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              LET&apos;S GO →
            </button>
          </div>
        )}

        {/* Step 1: Body Weight */}
        {step === 1 && (
          <div className="flex flex-col gap-6">
            <div>
              <div className="text-sm text-red-500 font-bold uppercase tracking-widest mb-1">
                Step 1 of 3
              </div>
              <h2 className="text-2xl font-black text-white">How much do you weigh?</h2>
              <p className="text-zinc-500 text-sm mt-1">
                This calibrates your relative strength rankings.
              </p>
            </div>
            <div className="flex gap-2">
              {(["kg", "lbs"] as const).map((u) => (
                <button
                  key={u}
                  onClick={() => setUnit(u)}
                  className={`flex-1 py-3 rounded-xl font-bold text-sm uppercase tracking-widest transition-all ${
                    unit === u
                      ? "bg-red-600 text-white"
                      : "bg-zinc-900 text-zinc-500 border border-zinc-800 hover:border-zinc-600"
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
            <input
              type="number"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-4 text-white text-3xl font-black text-center focus:outline-none focus:border-red-500 transition-colors"
              placeholder="0"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
            <p className="text-center text-zinc-600 text-sm">
              {weight && unit === "kg" && `≈ ${Math.round(Number(weight) * 2.205)} lbs`}
              {weight && unit === "lbs" && `≈ ${Math.round(Number(weight) / 2.205)} kg`}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setStep(0)}
                className="px-6 py-3 rounded-xl text-zinc-500 border border-zinc-800 hover:border-zinc-600 transition-all"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep(2)}
                disabled={!weight || Number(weight) <= 0}
                className="flex-1 py-3 rounded-xl font-black text-white bg-red-600 hover:bg-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                CONTINUE →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Exercise Selection */}
        {step === 2 && (
          <div className="flex flex-col gap-5">
            <div>
              <div className="text-sm text-red-500 font-bold uppercase tracking-widest mb-1">
                Step 2 of 3
              </div>
              <h2 className="text-2xl font-black text-white">Select your exercises</h2>
              <p className="text-zinc-500 text-sm mt-1">Choose what you currently train.</p>
            </div>
            <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
              {Object.entries(EXERCISE_LIBRARY).map(([group, exercises]) => (
                <div key={group}>
                  <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">
                    {group}
                  </p>
                  <div className="space-y-1.5">
                    {exercises.map((ex) => (
                      <button
                        key={ex.id}
                        onClick={() => toggleExercise(ex)}
                        className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-between ${
                          isSelected(ex)
                            ? "bg-red-950 border border-red-700 text-red-300"
                            : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:border-zinc-600"
                        }`}
                      >
                        {ex.name}
                        {isSelected(ex) && <span className="text-red-500">✓</span>}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-3 rounded-xl text-zinc-500 border border-zinc-800 hover:border-zinc-600 transition-all"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={allSelected.length === 0}
                className="flex-1 py-3 rounded-xl font-black text-white bg-red-600 hover:bg-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                SET PRs ({allSelected.length} selected) →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: PR Baselines */}
        {step === 3 && (
          <div className="flex flex-col gap-5">
            <div>
              <div className="text-sm text-red-500 font-bold uppercase tracking-widest mb-1">
                Step 3 of 3
              </div>
              <h2 className="text-2xl font-black text-white">Enter your current PRs</h2>
              <p className="text-zinc-500 text-sm mt-1">
                Your starting baseline. Be honest — we&apos;re building from here.
              </p>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {allSelected.map((ex) => (
                <div key={ex.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                  <p className="text-white text-sm font-bold mb-3">{ex.name}</p>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="text-zinc-600 text-xs uppercase tracking-wider block mb-1">
                        Weight ({unit})
                      </label>
                      <input
                        type="number"
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-red-500 transition-colors"
                        placeholder="0"
                        value={prs[ex.id]?.weight ?? ""}
                        onChange={(e) => handlePR(ex.id, "weight", e.target.value)}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-zinc-600 text-xs uppercase tracking-wider block mb-1">
                        Reps
                      </label>
                      <input
                        type="number"
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-red-500 transition-colors"
                        placeholder="0"
                        value={prs[ex.id]?.reps ?? ""}
                        onChange={(e) => handlePR(ex.id, "reps", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-3 rounded-xl text-zinc-500 border border-zinc-800 hover:border-zinc-600 transition-all"
              >
                ← Back
              </button>
              <button
                onClick={finish}
                className="flex-1 py-3 rounded-xl font-black text-white bg-red-600 hover:bg-red-500 transition-all"
              >
                🚀 INITIALIZE VGYM
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
