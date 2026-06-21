import { useNavigate } from "react-router-dom";
import ProFinanceRefonteScreen from "../../components/ProFinanceRefonteScreen";
import { MOCK_FINANCE_SUMMARY, MOCK_PAYMENT_TXS } from "../../services/mockData";

export default function ProFinancesPage() {
  const nav = useNavigate();
  return (
    <ProFinanceRefonteScreen
      summary={MOCK_FINANCE_SUMMARY}
      transactions={MOCK_PAYMENT_TXS}
      onBack={() => nav("/profile")}
      onShowQR={() => nav("/orders/qr-payment")}
      onWithdraw={() => {}}
    />
  );
}
