import { motion } from "motion/react";
import { CalendarDays, ChevronRight, UserIcon } from "lucide-react";
import type { ProJob } from "../../types";
import { STATUS_CONFIG, STATUS_LABEL, IN_PROGRESS_STATUSES, SCHEDULED_STATUSES, DONE_STATUSES } from "./dashboard";

interface TodayMissionsProps {
  jobs: ProJob[];
  onOpenJob: (job: ProJob) => void;
  onViewAll: () => void;
}

function MissionRow({ job, index, onOpenJob }: { job: ProJob; index: number; onOpenJob: (job: ProJob) => void }) {
  const cfg = STATUS_CONFIG[job.status]!;
  const label = STATUS_LABEL[job.status] ?? job.status;

  return (
    <div className="relative flex gap-3 mb-2">
      <div className="flex flex-col items-center w-5 shrink-0">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 15, delay: index * 0.08 }}
          className={`w-3 h-3 rounded-full border-2 border-white shadow-sm z-10 ${cfg.dot}`}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.08, type: "spring", damping: 20, stiffness: 200 }}
        onClick={() => onOpenJob(job)}
        className={`flex-1 bg-cm-elevated rounded-[16px] p-3.5 cursor-pointer shadow-sm ${cfg.border} hover:shadow-md active:scale-[0.99] transition-all`}
      >
        <div className="flex items-start justify-between mb-1.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-cm-surface flex items-center justify-center shrink-0">
              <UserIcon className="w-4 h-4 text-cm-text-soft" />
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-bold text-cm-text truncate">{job.clientName}</p>
              <p className="text-[10px] text-cm-text-muted truncate">{job.clientLocation.split(",")[0]}</p>
            </div>
          </div>
          <span className="text-[13px] font-extrabold text-cm-text font-mono shrink-0">{job.totalFeeXOF.toLocaleString("fr-FR")} F</span>
        </div>
        <p className="text-[11px] text-cm-text-soft line-clamp-1 ml-10.5">{job.serviceName}</p>
        <div className="flex items-center gap-2 text-[10px] text-cm-text-muted mt-2 ml-10.5">
          {job.scheduledDate && (
            <span>{new Date(job.scheduledDate).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</span>
          )}
          {job.scheduledTime && <span>· {job.scheduledTime}</span>}
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 15, delay: index * 0.08 + 0.15 }}
            className={`ml-auto px-2 py-0.5 rounded-full text-[10px] font-medium ${cfg.badge}`}
          >
            {label}
          </motion.span>
        </div>
      </motion.div>
    </div>
  );
}

function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-bold text-cm-text-muted uppercase tracking-wider mb-1.5 mt-3 first:mt-0">
      {children}
    </p>
  );
}

export default function TodayMissions({ jobs, onOpenJob, onViewAll }: TodayMissionsProps) {
  const inProgress = jobs.filter((j) => IN_PROGRESS_STATUSES.includes(j.status));
  const scheduled = jobs.filter((j) => SCHEDULED_STATUSES.includes(j.status));
  const done = jobs.filter((j) => DONE_STATUSES.includes(j.status));

  if (jobs.length === 0) return null;

  let index = 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="mb-4"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-cm-text" />
          <h2 className="text-[14px] font-bold text-cm-text">Aujourd'hui</h2>
          {jobs.length > 0 && (
            <span className="text-[9px] font-bold text-cm-text bg-cm-accent/20 px-1.5 py-0.5 rounded-full">{jobs.length}</span>
          )}
        </div>
        <button
          onClick={onViewAll}
          className="text-[11px] font-medium text-cm-text-soft cursor-pointer hover:underline flex items-center gap-0.5"
        >
          Voir tout <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      {inProgress.length > 0 && (
        <>
          <GroupLabel>En cours</GroupLabel>
          {inProgress.map((job) => <MissionRow key={job.id} job={job} index={index++} onOpenJob={onOpenJob} />)}
        </>
      )}

      {scheduled.length > 0 && (
        <>
          <GroupLabel>Planifiées</GroupLabel>
          {scheduled.map((job) => <MissionRow key={job.id} job={job} index={index++} onOpenJob={onOpenJob} />)}
        </>
      )}

      {done.length > 0 && (
        <>
          <GroupLabel>Terminées</GroupLabel>
          {done.map((job) => <MissionRow key={job.id} job={job} index={index++} onOpenJob={onOpenJob} />)}
        </>
      )}
    </motion.div>
  );
}
