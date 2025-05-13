"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { Search, FileEdit, Trash2, Eye, RefreshCw, Download } from "lucide-react"
import UserDetailsModal from "./user-details-modal"
import DeleteConfirmationDialog from "./delete-confirmation-dialog"
import { exportToCSV } from "@/lib/export-utils"

export default function AdminPanel() {
  const router = useRouter()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [userToDelete, setUserToDelete] = useState<any>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [currentTab, setCurrentTab] = useState("todos")

  useEffect(() => {
    fetchUsers()
  }, [currentTab])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const supabase = getSupabaseClient()

      // Consulta básica para obtener usuarios
      let query = supabase.from("usuarios").select("*")

      // Aplicar filtros según la pestaña seleccionada
      if (currentTab === "activos" || currentTab === "pasivos") {
        // Primero obtenemos los IDs de usuarios con el estado correspondiente
        const { data: datosAdicionalesData, error: datosError } = await supabase
          .from("datos_adicionales")
          .select("usuario_id, estado")
          .eq("estado", currentTab === "activos" ? "activo" : "pasivo")

        if (datosError) throw datosError

        if (datosAdicionalesData && datosAdicionalesData.length > 0) {
          // Extraer los IDs de usuario que tienen el estado correspondiente
          const userIds = datosAdicionalesData.map((item) => item.usuario_id)
          // Filtrar usuarios por esos IDs
          query = query.in("id", userIds)
        } else {
          // Si no hay usuarios con ese estado, devolver un array vacío
          setUsers([])
          setLoading(false)
          return
        }
      }

      // Ejecutar la consulta de usuarios
      const { data: usersData, error: usersError } = await query.order("created_at", { ascending: false })

      if (usersError) throw usersError

      if (usersData && usersData.length > 0) {
        // Obtener datos adicionales para cada usuario
        const { data: datosAdicionalesData, error: datosError } = await supabase
          .from("datos_adicionales")
          .select("*")
          .in(
            "usuario_id",
            usersData.map((user) => user.id),
          )

        if (datosError) throw datosError

        // Combinar los datos de usuarios con sus datos adicionales
        const usersWithData = usersData.map((user) => {
          const datosAdicionales = datosAdicionalesData?.find((datos) => datos.usuario_id === user.id) || null

          return {
            ...user,
            datos_adicionales: datosAdicionales,
          }
        })

        setUsers(usersWithData)
      } else {
        setUsers([])
      }
    } catch (error) {
      console.error("Error al cargar usuarios:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los usuarios",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handleViewDetails = (user: any) => {
    setSelectedUser(user)
    setShowDetailsModal(true)
  }

  const handleEdit = (userId: number) => {
    router.push(`/admin/edit/${userId}`)
  }

  const handleDelete = (user: any) => {
    setUserToDelete(user)
    setShowDeleteDialog(true)
  }

  const confirmDelete = async () => {
    if (!userToDelete) return

    try {
      const supabase = getSupabaseClient()

      // Eliminar el usuario (las restricciones de clave foránea eliminarán los registros relacionados)
      const { error } = await supabase.from("usuarios").delete().eq("id", userToDelete.id)

      if (error) throw error

      toast({
        title: "Usuario eliminado",
        description: "El usuario ha sido eliminado correctamente",
      })

      // Actualizar la lista de usuarios
      setUsers(users.filter((user) => user.id !== userToDelete.id))
    } catch (error) {
      console.error("Error al eliminar usuario:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el usuario",
        variant: "destructive",
      })
    } finally {
      setUserToDelete(null)
      setShowDeleteDialog(false)
    }
  }

  const handleExportData = () => {
    try {
      const dataToExport = users.map((user) => ({
        ID: user.id,
        NIF: user.nif,
        Nombre: user.nombre,
        "Primer Apellido": user.apellido1,
        "Segundo Apellido": user.apellido2,
        Email: user.email,
        Teléfono: user.telefono1,
        Población: user.poblacion,
        "Fecha Alta": user.fecha_alta,
        Estado: user.datos_adicionales?.estado || "No especificado",
      }))

      exportToCSV(dataToExport, "usuarios")

      toast({
        title: "Datos exportados",
        description: "Los datos han sido exportados correctamente",
      })
    } catch (error) {
      console.error("Error al exportar datos:", error)
      toast({
        title: "Error",
        description: "No se pudieron exportar los datos",
        variant: "destructive",
      })
    }
  }

  // Filtrar usuarios según el término de búsqueda
  const filteredUsers = users.filter((user) => {
    const searchTermLower = searchTerm.toLowerCase()
    return (
      user.nif?.toLowerCase().includes(searchTermLower) ||
      user.nombre?.toLowerCase().includes(searchTermLower) ||
      user.apellido1?.toLowerCase().includes(searchTermLower) ||
      user.apellido2?.toLowerCase().includes(searchTermLower) ||
      user.email?.toLowerCase().includes(searchTermLower) ||
      user.poblacion?.toLowerCase().includes(searchTermLower)
    )
  })

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">Panel de Administración</CardTitle>
              <CardDescription>Gestiona los datos de los usuarios registrados</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={fetchUsers} className="h-9">
                <RefreshCw className="mr-2 h-4 w-4" />
                Actualizar
              </Button>
              <Button variant="outline" onClick={handleExportData} className="h-9">
                <Download className="mr-2 h-4 w-4" />
                Exportar CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, NIF, email..."
                className="pl-8"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
          </div>

          <Tabs defaultValue="todos" value={currentTab} onValueChange={setCurrentTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="todos">Todos</TabsTrigger>
              <TabsTrigger value="activos">Activos</TabsTrigger>
              <TabsTrigger value="pasivos">Pasivos</TabsTrigger>
            </TabsList>

            <TabsContent value="todos" className="mt-0">
              <UsersTable
                users={filteredUsers}
                loading={loading}
                onViewDetails={handleViewDetails}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </TabsContent>

            <TabsContent value="activos" className="mt-0">
              <UsersTable
                users={filteredUsers}
                loading={loading}
                onViewDetails={handleViewDetails}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </TabsContent>

            <TabsContent value="pasivos" className="mt-0">
              <UsersTable
                users={filteredUsers}
                loading={loading}
                onViewDetails={handleViewDetails}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Modal de detalles del usuario */}
      {showDetailsModal && selectedUser && (
        <UserDetailsModal user={selectedUser} isOpen={showDetailsModal} onClose={() => setShowDetailsModal(false)} />
      )}

      {/* Diálogo de confirmación de eliminación */}
      {showDeleteDialog && userToDelete && (
        <DeleteConfirmationDialog
          isOpen={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={confirmDelete}
          title="Eliminar usuario"
          description={`¿Estás seguro de que deseas eliminar al usuario ${userToDelete.nombre} ${userToDelete.apellido1}? Esta acción no se puede deshacer.`}
        />
      )}
    </div>
  )
}

// Componente de tabla de usuarios
function UsersTable({
  users,
  loading,
  onViewDetails,
  onEdit,
  onDelete,
}: {
  users: any[]
  loading: boolean
  onViewDetails: (user: any) => void
  onEdit: (userId: number) => void
  onDelete: (user: any) => void
}) {
  if (loading) {
    return <div className="text-center py-8">Cargando usuarios...</div>
  }

  if (users.length === 0) {
    return <div className="text-center py-8">No se encontraron usuarios</div>
  }

  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>NIF</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead className="hidden md:table-cell">Email</TableHead>
            <TableHead className="hidden md:table-cell">Teléfono</TableHead>
            <TableHead className="hidden lg:table-cell">Fecha Alta</TableHead>
            <TableHead className="hidden lg:table-cell">Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.nif}</TableCell>
              <TableCell>{`${user.nombre} ${user.apellido1} ${user.apellido2 || ""}`}</TableCell>
              <TableCell className="hidden md:table-cell">{user.email}</TableCell>
              <TableCell className="hidden md:table-cell">{user.telefono1}</TableCell>
              <TableCell className="hidden lg:table-cell">
                {user.fecha_alta ? new Date(user.fecha_alta).toLocaleDateString() : "N/A"}
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                {user.datos_adicionales?.estado ? (
                  <Badge variant={user.datos_adicionales.estado === "activo" ? "default" : "secondary"}>
                    {user.datos_adicionales.estado}
                  </Badge>
                ) : (
                  "No especificado"
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="icon" onClick={() => onViewDetails(user)}>
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">Ver detalles</span>
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onEdit(user.id)}>
                    <FileEdit className="h-4 w-4" />
                    <span className="sr-only">Editar</span>
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onDelete(user)}>
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Eliminar</span>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
