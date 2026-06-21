import { useState, useMemo, type ComponentType, type ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  DollarSign,
  UserIcon,
  Power,
  Bell,
  BellOff,
  Settings,
  Plus,
  Trash2,
  Save,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { ProJob, RecurringSlot, BlockedDay } from "../types";

interface Props {
  jobs: ProJob[];
  onViewJob: (job: ProJob) => void;
}

const DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const MONTHS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

export default function ProScheduleScreen({ jobs, onViewJob }: Props) {
  const today = useMemo(() => new Date(), []);
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<Record<string, string[]>>({});
  const [showSettings, setShowSettings] = useState(false);
  const [recurringSlots, setRecurringSlots] = useState<RecurringSlot[]>([
    { dayOfWeek: 1, startTime: "08:00", endTime: "12:00" },
    { dayOfWeek: 1, startTime: "14:00", endTime: "18:00" },
    { dayOfWeek: 2, startTime: "08:00", endTime: "12:00" },
    { dayOfWeek: 2, startTime: "14:00", endTime: "18:00" },
    { dayOfWeek: 3, startTime: "08:00", endTime: "12:00" },
    { dayOfWeek: 3, startTime: "14:00", endTime: "18:00" },
    { dayOfWeek: 4, startTime: "08:00", endTime: "12:00" },
    { dayOfWeek: 4, startTime: "14:00", endTime: "18:00" },
    { dayOfWeek: 5, startTime: "08:00", endTime: "12:00" },
    { dayOfWeek: 5, startTime: "14:00", endTime: "18:00" },
    { dayOfWeek: 6, startTime: "09:00", endTime: "13:00" },
  ]);
  const [blockedDays, setBlockedDays] = useState<BlockedDay[]>([]);
  const [newBlockedDate, setNewBlockedDate] = useState("");
  const [newBlockedReason, setNewBlockedReason] = useState("");

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();
  const startOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
    setSelectedDate(null);
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
    setSelectedDate(null);
  };

  const formatDateKey = (day: number) => {
    return `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  };

  const jobsByDate = useMemo(() => {
    const map: Record<string, ProJob[]> = {};
    jobs.forEach((job) => {
      const dateKey = job.scheduledDate || job.createdAt.slice(0, 10);
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(job);
    });
    return map;
  }, [jobs]);

  const isToday = (day: number) => {
    return (
      today.getDate() === day &&
      today.getMonth() === currentMonth &&
      today.getFullYear() === currentYear
    );
  };

  const selectedJobs = selectedDate ? jobsByDate[selectedDate] || [] : [];

  const toggleDayAvailability = (day: number) => {
    const key = formatDateKey(day);
    setAvailableSlots((prev) => {
      if (prev[key]) {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return { ...prev, [key]: ["08:00", "12:00", "14:00", "17:00"] };
    });
  };

  const renderCalendarGrid = () => {
    const cells: ReactNode[] = [];

    for (let i = 0; i < startOffset; i++) {
      cells.push(<div key={`empty-${i}`} />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = formatDateKey(day);
      const dayJobs = jobsByDate[dateKey] || [];
      const isAvailable = !!availableSlots[dateKey];
      const isSelected = selectedDate === dateKey;

      cells.push(
        <button
          key={day}
          onClick={() => setSelectedDate(dateKey)}
          className={`relative p-1.5 rounded-xl text-center transition-all cursor-pointer active:scale-90 ${
            isSelected
              ? "bg-brand-lime text-brand-forest"
              : isToday(day)
              ? "bg-brand-forest text-white"
              : "hover:bg-pale-mint"
          }`}
        >
          <span className="text-xs font-bold">{day}</span>
          <div className="flex items-center justify-center gap-0.5 mt-0.5">
            {dayJobs.length > 0 && (
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  isSelected ? "bg-brand-forest" : "bg-brand-lime"
                }`}
              />
            )}
            {isAvailable && (
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  isSelected ? "bg-brand-forest/50" : "bg-green-400"
                }`}
              />
            )}
          </div>
        </button>
      );
    }

    return cells;
  };

  return (
    <div className="px-5 py-5 pb-32 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-sans text-lg font-extrabold flex items-center gap-2">
          <CalendarIcon className="w-5 h-5" /> Planning
        </h2>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-caption font-medium transition-all cursor-pointer ${showSettings ? "bg-brand-lime text-brand-forest" : "bg-pale-mint text-secondary"}`}
        >
          <Settings className="w-3.5 h-3.5" />
          Disponibilités
        </button>
      </div>

      {/* Weekly Overview */}
      <div className="bg-white p-4 rounded-3xl shadow-premium border border-pale-mint/15 space-y-3">
        <h4 className="font-sans text-caption font-extrabold uppercase tracking-wider flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5" /> Cette semaine
        </h4>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <p className="text-lg font-extrabold text-brand-forest">{jobs.filter(j => {
              const d = j.scheduledDate || j.createdAt.slice(0, 10);
              const jobDate = new Date(d);
              const weekStart = new Date(today);
              weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
              const weekEnd = new Date(weekStart);
              weekEnd.setDate(weekEnd.getDate() + 6);
              return jobDate >= weekStart && jobDate <= weekEnd;
            }).length}</p>
            <p className="text-caption text-secondary font-medium">Interventions</p>
          </div>
          <div className="text-center border-x border-pale-mint/20">
            <p className="text-lg font-extrabold text-brand-lime">{jobs.filter(j => j.status === "completed").filter(j => {
              const d = j.completedAt || j.createdAt.slice(0, 10);
              const jobDate = new Date(d);
              const weekStart = new Date(today);
              weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
              const weekEnd = new Date(weekStart);
              weekEnd.setDate(weekEnd.getDate() + 6);
              return jobDate >= weekStart && jobDate <= weekEnd;
            }).reduce((sum, j) => sum + j.totalFeeXOF, 0).toLocaleString()} F</p>
            <p className="text-caption text-secondary font-medium">Gains semaine</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-extrabold text-amber-500">{jobs.filter(j => j.status === "pending" || j.status === "accepted").filter(j => {
              const d = j.scheduledDate || j.createdAt.slice(0, 10);
              const jobDate = new Date(d);
              const weekStart = new Date(today);
              weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
              const weekEnd = new Date(weekStart);
              weekEnd.setDate(weekEnd.getDate() + 6);
              return jobDate >= weekStart && jobDate <= weekEnd;
            }).length}</p>
            <p className="text-caption text-secondary font-medium">À venir</p>
          </div>
        </div>
        {jobs.filter(j => j.status === "pending" || j.status === "accepted").length > 0 && (
          <div className="flex items-center gap-1.5 text-caption text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full">
            <AlertCircle className="w-3 h-3" />
            {jobs.filter(j => j.status === "pending" || j.status === "accepted").length} mission(s) en attente
          </div>
        )}
      </div>

      {/* Availability Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="bg-white p-5 rounded-3xl shadow-premium border border-brand-lime/30 space-y-4">

              {/* Recurring Hours */}
              <div>
                <h4 className="font-sans text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 mb-3">
                  <Clock className="w-4 h-4" /> Créneaux récurrents
                </h4>
                <div className="space-y-2">
                  {[0, 1, 2, 3, 4, 5, 6].map((day) => {
                    const daySlots = recurringSlots.filter((s) => s.dayOfWeek === day);
                    const dayName = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"][day];
                    return (
                      <div key={day} className="flex items-start gap-2">
                        <span className="w-8 text-caption font-medium text-secondary mt-2">{dayName}</span>
                        <div className="flex-1 space-y-1">
                          {daySlots.length === 0 ? (
                            <p className="text-caption text-secondary/60 italic">Indisponible</p>
                          ) : (
                            daySlots.map((slot, i) => (
                              <div key={i} className="flex items-center gap-1">
                                <input
                                  type="time" value={slot.startTime}
                                  onChange={(e) => {
                                    const updated = [...recurringSlots];
                                    const idx = updated.indexOf(slot);
                                    updated[idx] = { ...slot, startTime: e.target.value };
                                    setRecurringSlots(updated);
                                  }}
                                  className="w-20 text-caption bg-pale-mint/30 rounded-lg px-2 py-1 outline-none"
                                />
                                <span className="text-caption text-secondary">à</span>
                                <input
                                  type="time" value={slot.endTime}
                                  onChange={(e) => {
                                    const updated = [...recurringSlots];
                                    const idx = updated.indexOf(slot);
                                    updated[idx] = { ...slot, endTime: e.target.value };
                                    setRecurringSlots(updated);
                                  }}
                                  className="w-20 text-caption bg-pale-mint/30 rounded-lg px-2 py-1 outline-none"
                                />
                                <button
                                  onClick={() => setRecurringSlots((prev) => prev.filter((s) => s !== slot))}
                                  className="w-5 h-5 rounded-full bg-red-50 flex items-center justify-center ml-1 cursor-pointer"
                                >
                                  <Trash2 className="w-3 h-3 text-red-400" />
                                </button>
                              </div>
                            ))
                          )}
                          <button
                            onClick={() => setRecurringSlots((prev) => [...prev, { dayOfWeek: day as any, startTime: "08:00", endTime: "12:00" }])}
                            className="text-caption font-medium text-brand-lime flex items-center gap-0.5 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" /> Ajouter un créneau
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Blocked Days */}
              <div className="border-t border-pale-mint/20 pt-3">
                <h4 className="font-sans text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 mb-3">
                  <BellOff className="w-4 h-4" /> Jours bloqués
                </h4>

                {blockedDays.length > 0 && (
                  <div className="space-y-1 mb-3">
                    {blockedDays.map((bd, i) => (
                      <div key={i} className="flex items-center justify-between bg-pale-mint/30 p-2 rounded-xl">
                        <div>
                          <span className="text-caption font-medium">{new Date(bd.date).toLocaleDateString("fr-FR")}</span>
                          <span className="text-caption text-secondary ml-2">{bd.reason}</span>
                        </div>
                        <button onClick={() => setBlockedDays((prev) => prev.filter((_, j) => j !== i))} className="cursor-pointer">
                          <Trash2 className="w-3.5 h-3.5 text-red-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    type="date" value={newBlockedDate}
                    onChange={(e) => setNewBlockedDate(e.target.value)}
                    className="flex-1 text-caption bg-pale-mint/30 rounded-xl px-3 py-2 outline-none"
                  />
                  <input
                    type="text" value={newBlockedReason} placeholder="Motif"
                    onChange={(e) => setNewBlockedReason(e.target.value)}
                    className="flex-1 text-caption bg-pale-mint/30 rounded-xl px-3 py-2 outline-none"
                  />
                  <button
                    onClick={() => {
                      if (newBlockedDate) {
                        setBlockedDays((prev) => [...prev, { date: newBlockedDate, reason: newBlockedReason || "Congé" }]);
                        setNewBlockedDate("");
                        setNewBlockedReason("");
                      }
                    }}
                    className="w-12 h-12 rounded-xl bg-brand-lime/20 flex items-center justify-center cursor-pointer"
                  >
                    <Plus className="w-5 h-5 text-brand-forest" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Calendar Header */}
      <div className="bg-white p-4 rounded-3xl shadow-premium border border-pale-mint/15 space-y-4">
        <div className="flex items-center justify-between">
          <button
            onClick={prevMonth}
            className="w-12 h-12 rounded-full bg-pale-mint flex items-center justify-center hover:bg-brand-lime/30 transition-all cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 text-brand-forest" />
          </button>
          <h3 className="font-sans text-base font-extrabold">
            {MONTHS[currentMonth]} {currentYear}
          </h3>
          <button
            onClick={nextMonth}
            className="w-12 h-12 rounded-full bg-pale-mint flex items-center justify-center hover:bg-brand-lime/30 transition-all cursor-pointer"
          >
            <ChevronRight className="w-5 h-5 text-brand-forest" />
          </button>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1">
          {DAYS.map((d) => (
            <div key={d} className="text-center text-caption font-medium text-secondary uppercase tracking-wider py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">{renderCalendarGrid()}</div>
      </div>

      {/* Selected Day Details */}
      {selectedDate && (
        <motion.div
          key={selectedDate}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between">
            <h4 className="font-sans text-xs font-bold uppercase tracking-wider">
              {new Date(selectedDate).toLocaleDateString("fr-FR", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </h4>
            <button
              onClick={() => {
                const day = parseInt(selectedDate.split("-")[2], 10);
                toggleDayAvailability(day);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-caption font-medium transition-all cursor-pointer ${
                availableSlots[selectedDate]
                  ? "bg-green-100 text-green-700"
                  : "bg-pale-mint text-secondary"
              }`}
            >
              {availableSlots[selectedDate] ? (
                <><Bell className="w-3 h-3" /> Disponible</>
              ) : (
                <><BellOff className="w-3 h-3" /> Indisponible</>
              )}
            </button>
          </div>

          {/* Availability Slots */}
          {availableSlots[selectedDate] && (
            <div className="bg-white p-3 rounded-2xl shadow-premium border border-pale-mint/15 flex flex-wrap gap-2">
              {availableSlots[selectedDate].map((slot) => (
                <span
                  key={slot}
                  className="text-caption font-medium bg-brand-lime/20 text-brand-forest px-3 py-1.5 rounded-full"
                >
                  <Clock className="w-3 h-3 inline mr-1" />
                  {slot}
                </span>
              ))}
              <span className="text-caption text-secondary italic self-center ml-1">
                Créneaux disponibles
              </span>
            </div>
          )}

          {/* Jobs on this day */}
          {selectedJobs.length > 0 ? (
            <div className="space-y-2">
              <p className="text-caption font-medium text-secondary">
                {selectedJobs.length} intervention{selectedJobs.length > 1 ? "s" : ""}
              </p>
              {selectedJobs.map((job) => (
                <div
                  key={job.id}
                  onClick={() => onViewJob(job)}
                  className="bg-white p-4 rounded-2xl shadow-premium border border-pale-mint/15 flex items-center justify-between cursor-pointer hover:bg-pale-mint/30 transition-all active:scale-[0.98]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-pale-mint flex items-center justify-center">
                      <UserIcon className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold">{job.serviceName}</h5>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-caption text-secondary flex items-center gap-0.5">
                          <MapPin className="w-3 h-3" /> {job.clientLocation}
                        </span>
                      </div>
                      {job.scheduledTime && (
                        <span className="text-caption font-medium text-brand-forest flex items-center gap-0.5 mt-0.5">
                          <Clock className="w-3 h-3" /> {job.scheduledTime}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs font-bold">
                    {job.totalFeeXOF.toLocaleString()} F
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-6 rounded-3xl shadow-premium border border-pale-mint/15 text-center">
              <CalendarIcon className="w-8 h-8 text-secondary/60 mx-auto mb-2" />
              <p className="text-xs text-secondary font-medium">
                Aucune intervention ce jour
              </p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
