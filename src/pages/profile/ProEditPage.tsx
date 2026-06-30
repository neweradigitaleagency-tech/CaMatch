import { useNavigate } from "react-router-dom";
import ProEditProfileScreen from "../../components/ProEditProfileScreen";
import { useAuthStore } from "../../stores/authStore";

export default function ProEditPage() {
  const nav = useNavigate();
  const pro = useAuthStore();

  const meta = pro.user?.user_metadata ?? {};
  const fallbackPro = {
    id: pro.userId || "",
    name: `${meta.firstName ?? ""} ${meta.lastName ?? ""}`.trim(),
    email: pro.user?.email ?? "",
    phoneNumber: pro.user?.phone ?? "",
    role: "pro" as const,
    avatarUrl: meta.avatarUrl ?? "",
    category: "maison-reparations" as const,
    subCategory: "",
    title: "",
    bio: "",
    experienceYears: 0,
    rating: 0,
    reviewCount: 0,
    hourlyRateXOF: 0,
    locationNeighborhood: "",
    isVerified: false,
    completedInterventions: 0,
    availabilityStatus: "available" as const,
    createdAt: new Date().toISOString(),
  };

  return (
    <ProEditProfileScreen
      pro={fallbackPro}
      onSave={() => nav("/pro/profile")}
      onBack={() => nav("/pro/profile")}
    />
  );
}
