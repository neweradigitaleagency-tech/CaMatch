import { redirect } from "next/navigation";

export default function DevLoginRedirect() {
  redirect("/login");
}
