import { Plus, Trash2 } from "lucide-react";
import ProfileSection from "./ProfileSection";
import type { SectionWithServicesProps } from "./types";

export default function ServicesSection({
  mode, editing, pro, services, selectedServiceIds = [], onToggleService, onAddService, onEditService, onDeleteService,
}: SectionWithServicesProps) {
  const isOwnerEdit = mode === "owner" && editing;

  return (
    <ProfileSection title="Services" subtitle={mode !== "client" ? `${services.length} service${services.length > 1 ? "s" : ""}` : undefined}>
      <div className="flex flex-col gap-1.5">
        {services.length === 0 && (
          <div className="px-4 py-3 bg-cm-surface rounded-[14px]">
            <p className="text-[12px] font-semibold text-cm-text-muted text-center">
              {isOwnerEdit ? "Ajoutez vos premiers services" : "Aucun service disponible"}
            </p>
          </div>
        )}
        {services.map((service) => {
          const selected = selectedServiceIds.includes(service.id);
          return (
            <div key={service.id}
              className={`flex items-center gap-3 px-4 py-3 rounded-[14px] border transition-all cursor-pointer
                ${selected && mode !== "owner" ? "bg-emerald-50 border-emerald-300 ring-1 ring-emerald-300" : "bg-white border-cm-border/40 hover:border-cm-border"}
                ${isOwnerEdit ? "cursor-default" : ""}`}
              onClick={() => !isOwnerEdit && onToggleService?.(service.id)}>
              <div className="w-9 h-9 rounded-[10px] bg-cm-surface flex items-center justify-center text-[13px] font-black text-cm-text-soft shrink-0 uppercase">
                {service.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-black text-cm-text">{service.name}</p>
                <p className="text-[10px] font-semibold text-cm-text-muted mt-0.5">{service.description}</p>
              </div>
              {!isOwnerEdit && (
                <span className="text-[13px] font-black text-cm-text">{service.priceEstimateXOF.toLocaleString("fr-FR")} <span className="text-[9px] font-bold text-cm-text-muted">F</span></span>
              )}
              {isOwnerEdit ? (
                <button onClick={() => onDeleteService?.(service.id)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-red-400 hover:bg-red-50 cursor-pointer active:scale-90 shrink-0">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              ) : (
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
                  ${selected ? "bg-emerald-500 border-emerald-500" : "border-cm-border"}`}>
                  {selected && (
                    <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {isOwnerEdit && (
          <button onClick={() => onAddService?.({
            name: "Nouveau service", description: "Description", priceEstimateXOF: 15000,
          })}
            className="flex items-center justify-center gap-2 w-full h-12 rounded-[14px] border-2 border-dashed border-cm-border text-cm-text-muted text-[12px] font-black cursor-pointer active:scale-[0.99] hover:border-cm-border hover:text-cm-text-soft transition-all mt-1.5">
            <Plus className="w-4 h-4" /> Ajouter un service
          </button>
        )}
      </div>
    </ProfileSection>
  );
}
