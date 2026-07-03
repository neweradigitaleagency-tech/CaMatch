import { motion } from "motion/react";
import { CheckCircle } from "lucide-react";

export default function PendingStep() {
  return (
    <div className="flex flex-col items-center pt-8">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6"
      >
        <CheckCircle className="w-10 h-10 text-green-600" />
      </motion.div>
      <h2 className="text-[22px] font-extrabold text-cm-text text-center">Félicitations !</h2>
      <p className="text-[14px] text-cm-text-soft text-center mt-2 max-w-xs">
        Votre profil professionnel a été approuvé. Vous pouvez maintenant recevoir des missions.
      </p>
    </div>
  );
}
