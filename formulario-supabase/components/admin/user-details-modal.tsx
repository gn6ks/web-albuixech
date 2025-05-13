"use client"

import { useEffect, useState } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Download, ExternalLink } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface UserDetailsModalProps {
  user: any
  isOpen: boolean
  onClose: () => void
}

export default function UserDetailsModal({ user, isOpen, onClose }: UserDetailsModalProps) {
  const [loading, setLoading] = useState(true)
  const [userData, setUserData] = useState<any>(null)

  useEffect(() => {
    if (isOpen && user) {
      fetchUserDetails(user.id)
    }
  }, [isOpen, user])

  const fetchUserDetails = async (userId: number) => {
    setLoading(true)
    try {
      const supabase = getSupabaseClient()

      // Obtener datos básicos del usuario
      const { data: userData, error: userError } = await supabase.from("usuarios").select("*").eq("id", userId).single()

      if (userError) throw userError

      // Obtener datos adicionales
      const { data: datosAdicionalesData, error: datosError } = await supabase
        .from("datos_adicionales")
        .select("*")
        .eq("usuario_id", userId)
        .maybeSingle()

      if (datosError) throw datosError

      // Obtener preferencias de contratación
      const { data: preferenciasData, error: prefError } = await supabase
        .from("preferencias_contratacion")
        .select("*")
        .eq("usuario_id", userId)
        .maybeSingle()

      if (prefError) throw prefError

      // Obtener carnets y vehículos
      const { data: carnetsData, error: carnetsError } = await supabase
        .from("carnets_vehiculos")
        .select("*")
        .eq("usuario_id", userId)
        .maybeSingle()

      if (carnetsError) throw carnetsError

      // Obtener experiencias laborales
      const { data: experienciasData, error: expError } = await supabase
        .from("experiencias_laborales")
        .select("*")
        .eq("usuario_id", userId)

      if (expError) throw expError

      // Obtener experiencias formativas
      const { data: formacionData, error: formError } = await supabase
        .from("experiencias_formativas")
        .select("*")
        .eq("usuario_id", userId)

      if (formError) throw formError

      // Obtener idiomas
      const { data: idiomasData, error: idiomasError } = await supabase
        .from("idiomas_usuario")
        .select("*")
        .eq("usuario_id", userId)

      if (idiomasError) throw idiomasError

      // Obtener archivos
      const { data: archivosData, error: archivosError } = await supabase
        .from("archivos")
        .select("*")
        .eq("usuario_id", userId)

      if (archivosError) throw archivosError

      // Combinar todos los datos
      const completeUserData = {
        ...userData,
        datos_adicionales: datosAdicionalesData || null,
        preferencias_contratacion: preferenciasData || null,
        carnets_vehiculos: carnetsData || null,
        experiencias_laborales: experienciasData || [],
        experiencias_formativas: formacionData || [],
        idiomas_usuario: idiomasData || [],
        idiomas: idiomasData || [], // Para mantener compatibilidad
        archivos: archivosData || [],
      }

      setUserData(completeUserData)
    } catch (error) {
      console.error("Error al cargar detalles del usuario:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los detalles del usuario",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalles del Usuario</DialogTitle>
          <DialogDescription>
            Información completa del usuario {user.nombre} {user.apellido1}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : userData ? (
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-4">
              <TabsTrigger value="personal">Datos Personales</TabsTrigger>
              <TabsTrigger value="adicionales">Datos Adicionales</TabsTrigger>
              <TabsTrigger value="experiencia">Experiencia</TabsTrigger>
              <TabsTrigger value="archivos">Archivos</TabsTrigger>
            </TabsList>

            {/* Datos Personales */}
            <TabsContent value="personal">
              <Card>
                <CardHeader>
                  <CardTitle>Información Personal</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoItem label="NIF" value={userData.nif} />
                    <InfoItem
                      label="Nombre Completo"
                      value={`${userData.nombre} ${userData.apellido1} ${userData.apellido2 || ""}`}
                    />
                    <InfoItem label="Sexo" value={userData.sexo} />
                    <InfoItem
                      label="Fecha Nacimiento"
                      value={
                        userData.fecha_nacimiento
                          ? new Date(userData.fecha_nacimiento).toLocaleDateString()
                          : "No especificado"
                      }
                    />
                    <InfoItem label="Email" value={userData.email} />
                    <InfoItem label="Teléfono" value={userData.telefono1} />
                    <InfoItem label="Teléfono 2" value={userData.telefono2 || "No especificado"} />
                    <InfoItem label="Nivel Académico" value={userData.nivel_academico} />
                  </div>

                  <div className="pt-4">
                    <h3 className="font-medium mb-2">Dirección</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InfoItem label="Dirección" value={userData.direccion} />
                      <InfoItem label="Población" value={userData.poblacion} />
                      <InfoItem label="Código Postal" value={userData.cp} />
                      <InfoItem label="Provincia" value={userData.provincia} />
                      <InfoItem label="País" value={userData.pais} />
                    </div>
                  </div>

                  <div className="pt-4">
                    <h3 className="font-medium mb-2">Información del Alta</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InfoItem
                        label="Fecha Alta"
                        value={
                          userData.fecha_alta ? new Date(userData.fecha_alta).toLocaleDateString() : "No especificado"
                        }
                      />
                      <InfoItem label="Entidad Alta" value={userData.entidad_alta || "No especificado"} />
                      <InfoItem label="Recurso Alta" value={userData.recurso_alta || "No especificado"} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Datos Adicionales */}
            <TabsContent value="adicionales">
              <Card>
                <CardHeader>
                  <CardTitle>Información Adicional</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoItem
                      label="Estado"
                      value={
                        userData.datos_adicionales?.estado ? (
                          <Badge variant={userData.datos_adicionales.estado === "activo" ? "default" : "secondary"}>
                            {userData.datos_adicionales.estado}
                          </Badge>
                        ) : (
                          "No especificado"
                        )
                      }
                    />
                    <InfoItem
                      label="Nacionalidad"
                      value={userData.datos_adicionales?.nacionalidad || "No especificado"}
                    />
                    <InfoItem
                      label="Fecha Padronamiento"
                      value={
                        userData.datos_adicionales?.fecha_padronamiento
                          ? new Date(userData.datos_adicionales.fecha_padronamiento).toLocaleDateString()
                          : "No especificado"
                      }
                    />
                    <InfoItem
                      label="Permiso Trabajo"
                      value={userData.datos_adicionales?.permiso_trabajo || "No especificado"}
                    />
                  </div>

                  <div className="pt-4">
                    <h3 className="font-medium mb-2">Preferencias de Contratación</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InfoItem
                        label="Intereses"
                        value={userData.preferencias_contratacion?.intereses || "No especificado"}
                      />
                      <InfoItem
                        label="Tipo Contrato"
                        value={userData.preferencias_contratacion?.tipo_contrato || "No especificado"}
                      />
                      <InfoItem
                        label="Tipo Jornada"
                        value={userData.preferencias_contratacion?.tipo_jornada || "No especificado"}
                      />
                      <InfoItem
                        label="Disp. Geográfica"
                        value={userData.preferencias_contratacion?.disp_geografica || "No especificado"}
                      />
                      <InfoItem
                        label="Objetivo Salarial"
                        value={userData.preferencias_contratacion?.objetivo_salarial || "No especificado"}
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <h3 className="font-medium mb-2">Carnets y Vehículos</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InfoItem
                        label="Carnets"
                        value={
                          userData.carnets_vehiculos?.carnets && userData.carnets_vehiculos.carnets.length > 0
                            ? userData.carnets_vehiculos.carnets.join(", ")
                            : "No especificado"
                        }
                      />
                      <InfoItem
                        label="Dispone Vehículo"
                        value={userData.carnets_vehiculos?.dispone_vehiculo ? "Sí" : "No"}
                      />
                      <InfoItem label="Vehículo" value={userData.carnets_vehiculos?.vehiculo || "No especificado"} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Experiencia */}
            <TabsContent value="experiencia">
              <Card>
                <CardHeader>
                  <CardTitle>Experiencia Laboral y Formación</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-3">Experiencia Laboral</h3>
                    {userData.experiencias_laborales && userData.experiencias_laborales.length > 0 ? (
                      <div className="space-y-4">
                        {userData.experiencias_laborales.map((exp: any, index: number) => (
                          <div key={index} className="border p-3 rounded-md">
                            <p className="font-medium">{exp.ocupacion}</p>
                            <p className="text-sm text-muted-foreground">
                              Duración: {exp.duracion || "No especificada"}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No hay experiencia laboral registrada</p>
                    )}
                  </div>

                  <div>
                    <h3 className="font-medium mb-3">Formación Académica</h3>
                    {userData.experiencias_formativas && userData.experiencias_formativas.length > 0 ? (
                      <div className="space-y-4">
                        {userData.experiencias_formativas.map((form: any, index: number) => (
                          <div key={index} className="border p-3 rounded-md">
                            <p className="font-medium">{form.titulacion}</p>
                            <p className="text-sm text-muted-foreground">
                              Año finalización: {form.anio_finalizacion || "No especificado"}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No hay formación académica registrada</p>
                    )}
                  </div>

                  <div>
                    <h3 className="font-medium mb-3">Idiomas</h3>
                    {userData.idiomas && userData.idiomas.length > 0 ? (
                      <div className="space-y-4">
                        {userData.idiomas.map((idioma: any, index: number) => (
                          <div key={index} className="border p-3 rounded-md">
                            <p className="font-medium">{idioma.idioma}</p>
                            <div className="flex justify-between">
                              <p className="text-sm text-muted-foreground">
                                Nivel: {idioma.nivel || "No especificado"}
                              </p>
                              {idioma.homologado && <Badge>Homologado</Badge>}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No hay idiomas registrados</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Archivos */}
            <TabsContent value="archivos">
              <Card>
                <CardHeader>
                  <CardTitle>Archivos Adjuntos</CardTitle>
                </CardHeader>
                <CardContent>
                  {userData.foto_url && (
                    <div className="mb-6">
                      <h3 className="font-medium mb-3">Foto</h3>
                      <div className="flex justify-center">
                        <img
                          src={userData.foto_url || "/placeholder.svg"}
                          alt="Foto del usuario"
                          className="max-w-[200px] max-h-[200px] object-cover rounded-md border"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <h3 className="font-medium">Documentos</h3>
                    {userData.archivos && userData.archivos.length > 0 ? (
                      <div className="space-y-3">
                        {userData.archivos.map((archivo: any) => (
                          <div key={archivo.id} className="flex items-center justify-between p-3 border rounded-md">
                            <div>
                              <p className="font-medium">{archivo.nombre_archivo}</p>
                              <p className="text-sm text-muted-foreground">
                                {archivo.tipo_archivo} - {new Date(archivo.fecha_subida).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" asChild>
                                <a href={archivo.url} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-4 w-4 mr-1" />
                                  Ver
                                </a>
                              </Button>
                              <Button variant="outline" size="sm" asChild>
                                <a href={archivo.url} download>
                                  <Download className="h-4 w-4 mr-1" />
                                  Descargar
                                </a>
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No hay documentos adjuntos</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center py-4">No se pudieron cargar los datos del usuario</div>
        )}
      </DialogContent>
    </Dialog>
  )
}

// Componente auxiliar para mostrar información
function InfoItem({ label, value }: { label: string; value: any }) {
  return (
    <div>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="mt-1">{value || "No especificado"}</p>
    </div>
  )
}
