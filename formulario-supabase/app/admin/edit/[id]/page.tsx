import type { Metadata } from "next"
import EditUserForm from "@/components/admin/edit-user-form"

export const metadata: Metadata = {
  title: "Editar Usuario",
  description: "Editar información de usuario",
}

export default function EditUserPage({ params }: { params: { id: string } }) {
  return <EditUserForm userId={Number.parseInt(params.id)} />
}
