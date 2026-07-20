export interface DiagnosticQuestion {
  id: string;
  question: string;
  placeholder: string;
  type: "text" | "select" | "boolean";
  options?: string[];
  required: boolean;
}

const QUESTIONS: Record<string, DiagnosticQuestion[]> = {
  "maison-reparations": [
    { id: "problem_duration", question: "Depuis quand le problème est-il présent ?", placeholder: "Ex: Depuis hier, cela fait une semaine...", type: "text", required: false },
    { id: "urgency_level", question: "S'agit-il d'une urgence ?", placeholder: "", type: "boolean", required: true },
    { id: "property_type", question: "Type de bien", placeholder: "", type: "select", options: ["Appartement", "Maison", "Bureau", "Commerce", "Autre"], required: true },
    { id: "area_affected", question: "Quelle zone est concernée ?", placeholder: "Ex: Cuisine, chambre, extérieur...", type: "text", required: false },
  ],
  "transport-livraison": [
    { id: "parcel_type", question: "Type de colis/marchandise", placeholder: "", type: "select", options: ["Document", "Petit colis", "Mobilier", "Marchandises", "Véhicule", "Autre"], required: true },
    { id: "parcel_weight", question: "Poids approximatif", placeholder: "Ex: 5 kg, 50 kg...", type: "text", required: true },
    { id: "pickup_address", question: "Adresse de ramassage", placeholder: "Ex: Cocody Angré...", type: "text", required: true },
    { id: "has_fragile", question: "Contient-il des articles fragiles ?", placeholder: "", type: "boolean", required: false },
  ],
  evenements: [
    { id: "event_type", question: "Type d'événement", placeholder: "", type: "select", options: ["Mariage", "Anniversaire", "Soirée", "Conférence", "Séminaire", "Concert", "Autre"], required: true },
    { id: "guest_count", question: "Nombre d'invités", placeholder: "Ex: 50 personnes", type: "text", required: true },
    { id: "has_date", question: "Avez-vous déjà une date ?", placeholder: "", type: "boolean", required: true },
  ],
  "education-formation": [
    { id: "student_level", question: "Niveau actuel", placeholder: "", type: "select", options: ["Débutant", "Intermédiaire", "Avancé", "Expert"], required: true },
    { id: "study_field", question: "Matière ou domaine", placeholder: "Ex: Mathématiques, Anglais, Programmation...", type: "text", required: true },
    { id: "goal", question: "Objectif visé", placeholder: "Ex: Préparer un examen, apprendre les bases...", type: "text", required: true },
    { id: "session_frequency", question: "Fréquence souhaitée", placeholder: "", type: "select", options: ["Une fois", "Hebdomadaire", "Quotidien", "À définir"], required: false },
  ],
  "social-media-informatique": [
    { id: "project_type", question: "Type de projet", placeholder: "", type: "select", options: ["Création", "Refonte", "Maintenance", "Conseil", "Autre"], required: true },
    { id: "has_content", question: "Avez-vous déjà du contenu ou un cahier des charges ?", placeholder: "", type: "boolean", required: false },
    { id: "deadline", question: "Délai souhaité", placeholder: "Ex: 2 semaines, 1 mois...", type: "text", required: true },
    { id: "budget_indication", question: "Fourchette de budget indicatif", placeholder: "Ex: 50 000 - 100 000 F", type: "text", required: false },
  ],
  "assistance-services": [
    { id: "schedule", question: "Quel type de rythme recherchez-vous ?", placeholder: "", type: "select", options: ["Ponctuel", "Régulier (hebdomadaire)", "Régulier (mensuel)", "Temps plein"], required: true },
    { id: "people_count", question: "Nombre de personnes concernées", placeholder: "Ex: 1 enfant, 2 adultes...", type: "text", required: false },
    { id: "special_needs", question: "Besoin spécifique ou médical ?", placeholder: "Ex: Allergies, mobilité réduite...", type: "text", required: false },
  ],
};

export function getQuestionsForCategory(category: string | null): DiagnosticQuestion[] {
  if (!category) return [];
  return QUESTIONS[category] || [];
}
