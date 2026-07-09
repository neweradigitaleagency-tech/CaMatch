import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, Plus, Building, Trash2 } from "lucide-react";

const MOCK_BANKS = [
  { id: "b1", name: "Société Générale", account: "SGCI **** 4521", owner: "Yao Cissé" },
  { id: "b2", name: "Ecobank", account: "ECOC **** 7890", owner: "Yao Cissé" },
];

export default function ProBankAccountsPage() {
  const nav = useNavigate();

  return (
    <div className="min-h-dynamic bg-cm-bg">
      <div className="sticky top-0 z-10 bg-cm-elevated/80 backdrop-blur-lg border-b border-cm-border">
        <div className="flex items-center h-14 px-5 gap-3">
          <button type="button" onClick={() => nav(-1)} className="p-1 -ml-1 cursor-pointer active:scale-[0.97]">
            <ArrowLeft className="w-5 h-5 text-cm-text" />
          </button>
          <h1 className="text-[18px] font-bold text-cm-text">Comptes bancaires</h1>
        </div>
      </div>
      <div className="w-full max-w-[448px] mx-auto px-5 pt-4 pb-24 space-y-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="bg-cm-elevated border border-cm-border rounded-[14px] overflow-hidden">
          {MOCK_BANKS.map((b) => (
            <div key={b.id} className="flex items-center justify-between px-5 py-4 border-b border-cm-border last:border-b-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center">
                  <Building className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-[13px] font-medium text-cm-text">{b.name}</p>
                  <p className="text-[11px] text-cm-text-muted">{b.account}</p>
                </div>
              </div>
              <button className="text-red-400 cursor-pointer active:scale-[0.97]">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </motion.div>
        <button className="w-full flex items-center justify-center gap-2 h-11 rounded-[14px] border-2 border-dashed border-cm-border text-cm-accent text-[12px] font-semibold cursor-pointer active:scale-[0.97] hover:border-cm-accent transition-colors">
          <Plus className="w-4 h-4" /> Ajouter un compte bancaire
        </button>
      </div>
    </div>
  );
}
