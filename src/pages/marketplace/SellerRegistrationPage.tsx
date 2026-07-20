import { useNavigate } from "react-router-dom"
import { useBackNavigation } from "../../hooks/useBackNavigation"
import SellerRegistrationWizard from "../../components/marketplace/SellerRegistrationWizard"

export default function SellerRegistrationPage() {
  const nav = useNavigate()
  const goBack = useBackNavigation("/marketplace")

  return (
    <SellerRegistrationWizard
      onBack={goBack}
      onSubmit={() => {
        // TODO: API call to create seller
        nav("/marketplace", { replace: true })
      }}
    />
  )
}
