"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "@/components/ui/use-toast"
import { Loader2, ArrowLeft } from "lucide-react"

interface EditUserFormProps {
  userId: number
}

export default function EditUserForm({ userId }: EditUserFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [userData, setUserData] = useState<any>(null)
  const [formData, setFormData] = useState<any>({})

  useEffect(() => {
    fetchUserData()
  }, [userId])

  const fetchUserData = async () => {
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

      // Combinar los datos
      const completeUserData = {
        ...userData,
        datos_adicionales: datosAdicionalesData || null,
        preferencias_contratacion: preferenciasData || null,
      }

      setUserData(completeUserData)
      setFormData({
        // Datos personales
        nif: userData.nif || "",
        nombre: userData.nombre || "",
        apellido1: userData.apellido1 || "",
        apellido2: userData.apellido2 || "",
        sexo: userData.sexo || "",
        fecha_nacimiento: userData.fecha_nacimiento || "",
        direccion: userData.direccion || "",
        poblacion: userData.poblacion || "",
        cp: userData.cp || "",
        provincia: userData.provincia || "",
        pais: userData.pais || "",
        telefono1: userData.telefono1 || "",
        telefono2: userData.telefono2 || "",
        email: userData.email || "",
        barrio_preferente: userData.barrio_preferente || false,
        barrio_especifico: userData.barrio_especifico || "",
        nivel_academico: userData.nivel_academico || "",

        // Datos adicionales
        fecha_padronamiento: datosAdicionalesData?.fecha_padronamiento || "",
        nacionalidad: datosAdicionalesData?.nacionalidad || "",
        permiso_trabajo: datosAdicionalesData?.permiso_trabajo || "",
        fecha_permiso: datosAdicionalesData?.fecha_permiso || "",
        estado: datosAdicionalesData?.estado || "",

        // Preferencias
        intereses: preferenciasData?.intereses || "",
        tipo_contrato: preferenciasData?.tipo_contrato || "",
        tipo_jornada: preferenciasData?.tipo_jornada || "",
        disp_geografica: preferenciasData?.disp_geografica || "",
        disp_viajar: preferenciasData?.disp_viajar || "",
        ocupacion_especifica: preferenciasData?.ocupacion_especifica || "",
        objetivo_salarial: preferenciasData?.objetivo_salarial || "",
      })
    } catch (error) {
      console.error("Error al cargar datos del usuario:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos del usuario",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev: any) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData((prev: any) => ({ ...prev, [name]: checked }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const supabase = getSupabaseClient()

      // Actualizar datos del usuario
      const { error: userError } = await supabase
        .from("usuarios")
        .update({
          nif: formData.nif,
          nombre: formData.nombre,
          apellido1: formData.apellido1,
          apellido2: formData.apellido2,
          sexo: formData.sexo,
          fecha_nacimiento: formData.fecha_nacimiento,
          direccion: formData.direccion,
          poblacion: formData.poblacion,
          cp: formData.cp,
          provincia: formData.provincia,
          pais: formData.pais,
          telefono1: formData.telefono1,
          telefono2: formData.telefono2,
          email: formData.email,
          barrio_preferente: formData.barrio_preferente,
          barrio_especifico: formData.barrio_especifico,
          nivel_academico: formData.nivel_academico,
        })
        .eq("id", userId)

      if (userError) throw userError

      // Actualizar datos adicionales
      if (userData.datos_adicionales?.id) {
        const { error: datosError } = await supabase
          .from("datos_adicionales")
          .update({
            fecha_padronamiento: formData.fecha_padronamiento,
            nacionalidad: formData.nacionalidad,
            permiso_trabajo: formData.permiso_trabajo,
            fecha_permiso: formData.fecha_permiso,
            estado: formData.estado,
          })
          .eq("id", userData.datos_adicionales.id)

        if (datosError) throw datosError
      } else {
        // Si no existen datos adicionales, crear nuevos
        await supabase.from("datos_adicionales").insert({
          usuario_id: userId,
          fecha_padronamiento: formData.fecha_padronamiento,
          nacionalidad: formData.nacionalidad,
          permiso_trabajo: formData.permiso_trabajo,
          fecha_permiso: formData.fecha_permiso,
          estado: formData.estado,
        })
      }

      // Actualizar preferencias de contratación
      if (userData.preferencias_contratacion?.id) {
        const { error: prefError } = await supabase
          .from("preferencias_contratacion")
          .update({
            intereses: formData.intereses,
            tipo_contrato: formData.tipo_contrato,
            tipo_jornada: formData.tipo_jornada,
            disp_geografica: formData.disp_geografica,
            disp_viajar: formData.disp_viajar,
            ocupacion_especifica: formData.ocupacion_especifica,
            objetivo_salarial: formData.objetivo_salarial,
          })
          .eq("id", userData.preferencias_contratacion.id)

        if (prefError) throw prefError
      } else {
        // Si no existen preferencias, crear nuevas
        await supabase.from("preferencias_contratacion").insert({
          usuario_id: userId,
          intereses: formData.intereses,
          tipo_contrato: formData.tipo_contrato,
          tipo_jornada: formData.tipo_jornada,
          disp_geografica: formData.disp_geografica,
          disp_viajar: formData.disp_viajar,
          ocupacion_especifica: formData.ocupacion_especifica,
          objetivo_salarial: formData.objetivo_salarial,
        })
      }

      toast({
        title: "Usuario actualizado",
        description: "Los datos del usuario han sido actualizados correctamente",
      })

      // Redirigir al panel de administración
      router.push("/admin")
    } catch (error) {
      console.error("Error al actualizar usuario:", error)
      toast({
        title: "Error",
        description: "No se pudieron actualizar los datos del usuario",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-4">
              <p className="mb-4">No se encontró el usuario o no se pudieron cargar los datos.</p>
              <Button onClick={() => router.push("/admin")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al panel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Button variant="outline" onClick={() => router.push("/admin")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al panel
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Editar Usuario</CardTitle>
          <CardDescription>
            Editar información de {userData.nombre} {userData.apellido1}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="grid grid-cols-1 md:grid-cols-3 mb-4">
                <TabsTrigger value="personal">Datos Personales</TabsTrigger>
                <TabsTrigger value="adicionales">Datos Adicionales</TabsTrigger>
                <TabsTrigger value="preferencias">Preferencias</TabsTrigger>
              </TabsList>

              {/* Datos Personales */}
              <TabsContent value="personal">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nif">NIF</Label>
                    <Input id="nif" name="nif" value={formData.nif} onChange={handleInputChange} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nombre">Nombre</Label>
                      <Input id="nombre" name="nombre" value={formData.nombre} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="apellido1">Primer Apellido</Label>
                      <Input id="apellido1" name="apellido1" value={formData.apellido1} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="apellido2">Segundo Apellido</Label>
                      <Input id="apellido2" name="apellido2" value={formData.apellido2} onChange={handleInputChange} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sexo">Sexo</Label>
                      <Select
                        name="sexo"
                        value={formData.sexo}
                        onValueChange={(value) => handleSelectChange("sexo", value)}
                      >
                        <SelectTrigger id="sexo">
                          <SelectValue placeholder="Seleccione..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hombre">Hombre</SelectItem>
                          <SelectItem value="mujer">Mujer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fecha_nacimiento">Fecha Nacimiento</Label>
                      <Input
                        type="date"
                        id="fecha_nacimiento"
                        name="fecha_nacimiento"
                        value={formData.fecha_nacimiento}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="direccion">Dirección</Label>
                    <Input id="direccion" name="direccion" value={formData.direccion} onChange={handleInputChange} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="poblacion">Población</Label>
                      <Input id="poblacion" name="poblacion" value={formData.poblacion} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cp">Código Postal</Label>
                      <Input id="cp" name="cp" value={formData.cp} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="provincia">Provincia</Label>
                      <Select
                        name="provincia"
                        value={formData.provincia}
                        onValueChange={(value) => handleSelectChange("provincia", value)}
                      >
                        <SelectTrigger id="provincia">
                          <SelectValue placeholder="Seleccione..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="valencia">Valencia</SelectItem>
                          <SelectItem value="alicante">Alicante</SelectItem>
                          <SelectItem value="castellon">Castellón</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="telefono1">Teléfono 1</Label>
                      <Input id="telefono1" name="telefono1" value={formData.telefono1} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="telefono2">Teléfono 2</Label>
                      <Input id="telefono2" name="telefono2" value={formData.telefono2} onChange={handleInputChange} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} />
                  </div>

                  <div className="space-y-2">
                    <Label>Barrio preferente</Label>
                    <RadioGroup
                      name="barrio_preferente"
                      value={formData.barrio_preferente ? "si" : "no"}
                      onValueChange={(value) => handleCheckboxChange("barrio_preferente", value === "si")}
                      className="flex space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="barrio-preferente-no" />
                        <Label htmlFor="barrio-preferente-no" className="font-normal">
                          NO
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="si" id="barrio-preferente-si" />
                        <Label htmlFor="barrio-preferente-si" className="font-normal">
                          SI
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="barrio_especifico">Especifique el barrio</Label>
                    <Input
                      id="barrio_especifico"
                      name="barrio_especifico"
                      value={formData.barrio_especifico}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nivel_academico">Nivel académico</Label>
                    <Select
                      name="nivel_academico"
                      value={formData.nivel_academico}
                      onValueChange={(value) => handleSelectChange("nivel_academico", value)}
                    >
                      <SelectTrigger id="nivel_academico">
                        <SelectValue placeholder="Seleccione..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sin-estudios">Sin estudios</SelectItem>
                        <SelectItem value="primaria">Educación Primaria</SelectItem>
                        <SelectItem value="secundaria">Educación Secundaria</SelectItem>
                        <SelectItem value="bachillerato">Bachillerato</SelectItem>
                        <SelectItem value="fp-grado-medio">FP Grado Medio</SelectItem>
                        <SelectItem value="fp-grado-superior">FP Grado Superior</SelectItem>
                        <SelectItem value="universidad">Universidad</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              {/* Datos Adicionales */}
              <TabsContent value="adicionales">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fecha_padronamiento">Fecha padronamiento</Label>
                      <Input
                        type="date"
                        id="fecha_padronamiento"
                        name="fecha_padronamiento"
                        value={formData.fecha_padronamiento}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nacionalidad">Nacionalidad</Label>
                      <Input
                        id="nacionalidad"
                        name="nacionalidad"
                        value={formData.nacionalidad}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="permiso_trabajo">Permiso de trabajo/residencia</Label>
                      <Input
                        id="permiso_trabajo"
                        name="permiso_trabajo"
                        value={formData.permiso_trabajo}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fecha_permiso">Fecha permiso</Label>
                      <Input
                        type="date"
                        id="fecha_permiso"
                        name="fecha_permiso"
                        value={formData.fecha_permiso}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="estado">Estado</Label>
                    <Select
                      name="estado"
                      value={formData.estado}
                      onValueChange={(value) => handleSelectChange("estado", value)}
                    >
                      <SelectTrigger id="estado">
                        <SelectValue placeholder="Seleccione..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="activo">Activo</SelectItem>
                        <SelectItem value="pasivo">Pasivo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              {/* Preferencias */}
              <TabsContent value="preferencias">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="intereses">Intereses</Label>
                      <Input id="intereses" name="intereses" value={formData.intereses} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tipo_contrato">Tipo de contrato</Label>
                      <Input
                        id="tipo_contrato"
                        name="tipo_contrato"
                        value={formData.tipo_contrato}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="tipo_jornada">Tipo de jornada</Label>
                      <Input
                        id="tipo_jornada"
                        name="tipo_jornada"
                        value={formData.tipo_jornada}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="disp_geografica">Disp. geográfica</Label>
                      <Input
                        id="disp_geografica"
                        name="disp_geografica"
                        value={formData.disp_geografica}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="disp_viajar">Disp. viajar</Label>
                      <Input
                        id="disp_viajar"
                        name="disp_viajar"
                        value={formData.disp_viajar}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ocupacion_especifica">Ocupación específica</Label>
                      <Input
                        id="ocupacion_especifica"
                        name="ocupacion_especifica"
                        value={formData.ocupacion_especifica}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="objetivo_salarial">Objetivo salarial</Label>
                    <Input
                      id="objetivo_salarial"
                      name="objetivo_salarial"
                      value={formData.objetivo_salarial}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-6 flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => router.push("/admin")}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  "Guardar Cambios"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
