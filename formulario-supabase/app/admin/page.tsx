import type { Metadata } from "next"
import AdminPanel from "@/components/admin/admin-panel"

export const metadata: Metadata = {
  title: "Panel de Administración",
  description: "Gestión de datos de usuarios",
}

export default function AdminPage() {
  return <AdminPanel />
}
