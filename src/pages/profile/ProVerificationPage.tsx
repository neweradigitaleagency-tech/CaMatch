import { useNavigate } from "react-router-dom";
import ProVerificationScreen from "../../components/ProVerificationScreen";
import { MOCK_VERIFICATION } from "../../services/mockData";

export default function ProVerificationPage() {
  const nav = useNavigate();
  return (
    <ProVerificationScreen
      verification={MOCK_VERIFICATION}
      onUploadCni={() => {}}
      onUploadSelfie={() => {}}
      onRequestBackgroundCheck={() => {}}
      onUploadCert={() => {}}
      onBack={() => nav("/profile")}
    />
  );
}
