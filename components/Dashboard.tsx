"use client";

import { useState } from "react";
import {
  UserData,
  WorkoutLog,
  EXERCISE_LIBRARY,
  SPLIT,
  DAYS,
  RANKS,
  getGroupRank,
  getRank,
  calcRelativeStrength,
  calc1RM,
} from "@/lib/constants";
import RankBadge from "./RankBadge";
import StatCard from "./StatCard";
import ProgressChart from "./ProgressChart";
import VolumeChart from "./VolumeChart";
import AIChat from "./AIChat";
import LogModal from "./LogModal";

interface Props {
  userData: UserData;
  setUserData: React.Dispatch<React.SetStateAction<UserData | null>>;
}

const TABS = ["overview", "progress", "split", "records"] as const;
type Tab = (typeof TABS)[number];

export default function Dashboard({ userData, setUserData }: Props) {
  const [showChat, setShowChat] = useState(false);
  const [showLog, setShowLog] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const chestExs = userData.exercises.filter((e) => e.category === "Chest");
  const backExs = userData.exercises.filter((e) => e.category === "Back");
  const shoulderExs = userData.exercises.filter((e) => e.category === "Shoulders & Arms");

  const chestRank = getGroupRank(chestExs, userData.prs, userData.bodyWeight);
  const backRank = getGroupRank(backExs, userData.prs, userData.bodyWeight);
  const shoulderRank = getGroupRank(shoulderExs, userData.prs, userData.bodyWeight);

  const dayIndex = new Date().getDay();
  const todaySplit = SPLIT[dayIndex === 0 ? 6 : dayIndex - 1];

  const totalVolume = userData.logs.reduce(
    (sum, l) => sum + l.sets * l.reps * l.weight,
    0
  );

  const topPR = Object.entries(userData.prs).reduce<
    { id: string; weight: number; reps: number } | null
  >((best, [id, pr]) => {
    return pr.weight > (best?.weight ?? 0) ? { id, ...pr } : best;
  }, null);

  function toggleDay(day: string) {
    setUserData((prev) =>
      prev
        ? {
            ...prev,
            completedDays: {
              ...prev.completedDays,
              [day]: !prev.completedDays[day],
            },
          }
        : prev
    );
  }

  function handleLog(entry: WorkoutLog) {
    setUserData((prev) =>
      prev ? { ...prev, logs: [...prev.logs, entry] } : prev
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-zinc-900 px-6 py-4 flex items-center justify-between sticky top-0 bg-black/95 backdrop-blur-sm z-40">
        <div className="flex items-center gap-3">
          <span className="text-red-500 text-2xl font-black tracking-tighter">VGYM</span>
          <span className="text-zinc-800">|</span>
          <span className="text-zinc-500 text-sm font-medium">{userData.name}</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowLog(true)}
            className="bg-zinc-900 border border-zinc-800 hover:border-zinc-600 text-zinc-300 text-sm px-4 py-2 rounded-xl font-bold transition-all"
          >
            + Log
          </button>
          <button
            onClick={() => setShowChat(!showChat)}
            className="bg-red-600 hover:bg-red-500 text-white text-sm px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5"
          >
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            AI Coach
          </button>
        </div>
      </header>

      {/* Today Card */}
      <div className="px-6 pt-5 pb-3">
        <div
          className="rounded-2xl p-5 border flex items-center justify-between"
          style={{
            background: `linear-gradient(135deg, ${todaySplit.color}15, transparent)`,
            borderColor: `${todaySplit.color}30`,
          }}
        >
          <div>
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">
              Today
            </p>
            <p className="text-white text-xl font-black">{todaySplit.muscle}</p>
            <p className="text-zinc-500 text-sm mt-0.5">
              {todaySplit.day} · Time to work
            </p>
          </div>
          <div className="text-5xl">
            {todaySplit.muscle === "Rest" ? "😴" : "🔥"}
          </div>
        </div>
      </div>

      {/* Tab Nav */}
      <div className="px-6 pb-4">
        <div className="flex gap-1 bg-zinc-950 border border-zinc-900 rounded-xl p-1">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === tab
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-600 hover:text-zinc-400"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-6 pb-24">

        {/* OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-5">
            <div className="grid grid-cols-3 gap-3">
              <StatCard
                label="Body Weight"
                value={`${userData.bodyWeight}${userData.unit}`}
                sub="Starting"
                accent="#ef4444"
              />
              <StatCard
                label="Exercises"
                value={userData.exercises.length}
                sub="Tracked"
                accent="#3b82f6"
              />
              <StatCard
                label="Sessions"
                value={userData.logs.length}
                sub="Logged"
                accent="#a855f7"
              />
            </div>

            {/* Ranks */}
            <div>
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-3">
                Muscle Group Rankings
              </p>
              <div className="space-y-2">
                {[
                  { label: "Chest", rank: chestRank, count: chestExs.length },
                  { label: "Back", rank: backRank, count: backExs.length },
                  { label: "Shoulders & Arms", rank: shoulderRank, count: shoulderExs.length },
                ].map(({ label, rank, count }) => (
                  <div
                    key={label}
                    className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-white font-bold text-sm">{label}</p>
                      <p className="text-zinc-600 text-xs mt-0.5">{count} exercises</p>
                    </div>
                    <RankBadge rank={rank} />
                  </div>
                ))}
              </div>
            </div>

            {/* Top PR */}
            {topPR && (
              <div className="bg-zinc-900 border border-yellow-900/40 rounded-xl p-4">
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-2">
                  🏆 Top PR
                </p>
                <p className="text-white font-bold">
                  {userData.exercises.find((e) => e.id === topPR.id)?.name ?? "—"}
                </p>
                <p className="text-yellow-500 font-black text-xl mt-1">
                  {topPR.weight}
                  {userData.unit} × {topPR.reps} reps
                </p>
                <p className="text-zinc-600 text-sm mt-0.5">
                  Est. 1RM: {calc1RM(topPR.weight, topPR.reps)}
                  {userData.unit}
                </p>
              </div>
            )}

            {/* Recent logs */}
            {userData.logs.length > 0 && (
              <div>
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-3">
                  Recent Logs
                </p>
                <div className="space-y-2">
                  {[...userData.logs]
                    .reverse()
                    .slice(0, 4)
                    .map((log, i) => (
                      <div
                        key={i}
                        className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 flex items-center justify-between"
                      >
                        <div>
                          <p className="text-white text-sm font-bold">
                            {log.exercise?.name}
                          </p>
                          <p className="text-zinc-500 text-xs">{log.date}</p>
                        </div>
                        <p className="text-zinc-300 text-sm font-bold">
                          {log.sets}×{log.reps} @ {log.weight}
                          {userData.unit}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* PROGRESS */}
        {activeTab === "progress" && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <StatCard
                label="Total Volume"
                value={`${Math.round(totalVolume / 1000)}k`}
                sub={`${userData.unit} logged`}
                accent="#ef4444"
              />
              <StatCard
                label="PRs Set"
                value={Object.keys(userData.prs).length}
                sub="Exercises"
                accent="#ffd700"
              />
            </div>
            <ProgressChart
              data={userData.progressData}
              title="Estimated 1RM Progression"
            />
            <VolumeChart data={userData.progressData} />

            <div>
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-3">
                Current 1RM Estimates
              </p>
              <div className="space-y-2">
                {userData.exercises
                  .filter((ex) => userData.prs[ex.id])
                  .map((ex) => {
                    const pr = userData.prs[ex.id];
                    const oneRM = calc1RM(pr.weight, pr.reps);
                    const ratio = calcRelativeStrength(pr.weight, userData.bodyWeight);
                    const rank = getRank(ratio);
                    return (
                      <div
                        key={ex.id}
                        className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 flex items-center justify-between"
                      >
                        <div>
                          <p className="text-white text-sm font-bold">{ex.name}</p>
                          <p className="text-zinc-500 text-xs">
                            {pr.weight}
                            {userData.unit} × {pr.reps} · ratio: {ratio.toFixed(2)}×
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-black">
                            {oneRM}
                            {userData.unit}
                          </p>
                          <RankBadge rank={rank} size="sm" />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        {/* SPLIT */}
        {activeTab === "split" && (
          <div className="space-y-5">
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">
              5-Day Training Split
            </p>
            <div className="space-y-3">
              {SPLIT.map((day) => (
                <div
                  key={day.day}
                  className={`rounded-xl border p-4 flex items-center justify-between transition-all ${
                    userData.completedDays[day.day]
                      ? "bg-zinc-900 border-zinc-700"
                      : "bg-zinc-950 border-zinc-900"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => toggleDay(day.day)}
                      className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all text-xs font-bold ${
                        userData.completedDays[day.day]
                          ? "border-green-500 bg-green-500/20 text-green-400"
                          : "border-zinc-700 hover:border-zinc-500 text-transparent"
                      }`}
                    >
                      ✓
                    </button>
                    <div>
                      <p className="text-white font-bold">{day.day}</p>
                      <p className="text-sm" style={{ color: day.color }}>
                        {day.muscle}
                      </p>
                    </div>
                  </div>
                  {userData.completedDays[day.day] && (
                    <span className="text-xs text-green-600 font-bold uppercase tracking-wider">
                      Done
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Weekly dots */}
            <div>
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-3">
                This Week
              </p>
              <div className="flex gap-2">
                {DAYS.map((d) => {
                  const sp = SPLIT.find((s) => s.day === d);
                  const done = userData.completedDays[d];
                  return (
                    <div key={d} className="flex-1 flex flex-col items-center gap-1.5">
                      <div
                        className="w-full aspect-square rounded-xl flex items-center justify-center text-xs font-bold border transition-all"
                        style={{
                          background: done ? `${sp?.color}30` : "transparent",
                          borderColor: done ? sp?.color : "#27272a",
                          color: done ? sp?.color : "#52525b",
                        }}
                      >
                        {done ? "✓" : "·"}
                      </div>
                      <span className="text-zinc-600 text-xs">{d}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* RECORDS */}
        {activeTab === "records" && (
          <div className="space-y-5">
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">
              Personal Records
            </p>
            {Object.entries(EXERCISE_LIBRARY).map(([group, exercises]) => {
              const myExs = exercises.filter((ex) =>
                userData.exercises.find((e) => e.id === ex.id)
              );
              if (myExs.length === 0) return null;
              return (
                <div key={group}>
                  <p className="text-zinc-600 text-xs font-bold uppercase tracking-wider mb-2">
                    {group}
                  </p>
                  <div className="space-y-2">
                    {myExs.map((ex) => {
                      const pr = userData.prs[ex.id];
                      const oneRM = pr ? calc1RM(pr.weight, pr.reps) : null;
                      const ratio = pr
                        ? calcRelativeStrength(pr.weight, userData.bodyWeight)
                        : 0;
                      const rank = getRank(ratio);
                      const rankIdx = RANKS.findIndex((r) => r.name === rank.name);
                      const nextRank = RANKS[rankIdx + 1];
                      const progress = nextRank
                        ? Math.min(
                            ((ratio - rank.threshold) /
                              (nextRank.threshold - rank.threshold)) *
                              100,
                            100
                          )
                        : 100;

                      return (
                        <div
                          key={ex.id}
                          className="bg-zinc-900 border border-zinc-800 rounded-xl p-4"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-white font-bold text-sm">{ex.name}</p>
                            <RankBadge rank={rank} size="sm" />
                          </div>
                          {pr ? (
                            <>
                              <div className="flex gap-4 mb-3">
                                <div>
                                  <p className="text-zinc-600 text-xs">PR</p>
                                  <p className="text-white font-black">
                                    {pr.weight}
                                    {userData.unit} × {pr.reps}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-zinc-600 text-xs">Est. 1RM</p>
                                  <p className="text-white font-black">
                                    {oneRM}
                                    {userData.unit}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-zinc-600 text-xs">Ratio</p>
                                  <p className="text-white font-black">
                                    {ratio.toFixed(2)}×BW
                                  </p>
                                </div>
                              </div>
                              <div>
                                <div className="flex justify-between text-xs text-zinc-600 mb-1">
                                  <span>{rank.name}</span>
                                  {nextRank && <span>→ {nextRank.name}</span>}
                                </div>
                                <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                  <div
                                    className="h-full rounded-full transition-all"
                                    style={{
                                      width: `${progress}%`,
                                      background: rank.color,
                                    }}
                                  />
                                </div>
                              </div>
                            </>
                          ) : (
                            <p className="text-zinc-600 text-sm">No PR set</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FAB */}
      {!showChat && (
        <button
          onClick={() => setShowChat(true)}
          className="fixed bottom-6 right-6 z-40 bg-red-600 hover:bg-red-500 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-xl transition-all hover:scale-105"
        >
          ⚡
        </button>
      )}

      {showChat && <AIChat userData={userData} onClose={() => setShowChat(false)} />}
      {showLog && (
        <LogModal userData={userData} onClose={() => setShowLog(false)} onLog={handleLog} />
      )}
    </div>
  );
}
