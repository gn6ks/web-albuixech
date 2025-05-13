"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { guardarFormulario } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import FileUpload from "@/components/file-upload"

export default function FormularioPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("informacion-alta")

  // Estado unificado para todos los campos del formulario
  const [formData, setFormData] = useState({
    // Archivos
    "foto-url": "",
    "foto-nombre": "",
    "cv-url": "",
    "cv-nombre": "",
    "consentimiento-url": "",
    "consentimiento-nombre": "",

    // Información del Alta
    "fecha-alta": "",
    "entidad-alta": "",
    "recurso-alta": "",
    "fecha-derivacion": "",
    "entidad-derivacion": "",
    "recurso-derivacion": "",
    "estado-revision": "",
    "fecha-ultima-revision": "",
    "fecha-proxima-revision": "",

    // Datos Personales
    nif: "",
    nombre: "",
    apellido1: "",
    apellido2: "",
    sexo: "",
    "fecha-nacimiento": "",
    direccion: "",
    poblacion: "",
    cp: "",
    provincia: "",
    pais: "",
    telefono1: "",
    telefono2: "",
    email: "",
    "barrio-preferente": "no",
    "barrio-especifico": "",
    "nivel-academico": "",

    // Datos Adicionales
    "fecha-padronamiento": "",
    nacionalidad: "",
    "permiso-trabajo": "",
    "fecha-permiso": "",
    emprendedor: false,
    "programa-incorpora": false,
    "fecha-inscripcion": "",
    "fecha-renovacion": "",
    estado: "",
    "actuacion-cv": false,
    "actuacion-formacion": false,
    "actuacion-derivaciones": false,
    "actuacion-otros": false,
    "anotaciones-otros": "",
    anotaciones: "",

    // Preferencias
    intereses: "",
    "tipo-contrato": "",
    "tipo-jornada": "",
    "disp-geografica": "",
    "disp-viajar": "",
    "ocupacion-especifica": "",
    "objetivo-salarial": "",
    "perfil-profesional1": "",
    "perfil-profesional2": "",
    "perfil-profesional3": "",
    "fecha-demanda-empleo": "",

    // Carnets y vehículos
    carnet1: "",
    carnet2: "",
    "dispone-vehiculo": "",
    vehiculo: "",
    "dispone-vehiculo2": "",
    vehiculo2: "",
    "carnet-profesional1": "",
    "carnet-profesional2": "",
    "carnet-profesional3": "",

    // Experiencia
    "experiencia1-duracion": "",
    "experiencia1-ocupacion": "",
    "experiencia2-duracion": "",
    "experiencia2-ocupacion": "",
    "experiencia3-duracion": "",
    "experiencia3-ocupacion": "",
    "experiencia4-duracion": "",
    "experiencia4-ocupacion": "",

    // Formación
    "formacion-anio-1": "",
    "formacion-titulacion-1": "",
    "formacion-anio-2": "",
    "formacion-titulacion-2": "",
    "formacion-anio-3": "",
    "formacion-titulacion-3": "",
    idioma1: "",
    nivel1: "",
    homologado1: false,
    idioma2: "",
    nivel2: "",
    homologado2: false,
    idioma3: "",
    nivel3: "",
    homologado3: false,
    idioma4: "",
    nivel4: "",
    homologado4: false,
  })

  // Manejador genérico para inputs, textareas y selects
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  // Manejador para checkboxes
  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }))
  }

  // Manejador para selects (componente shadcn)
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Manejador para radio buttons
  const handleRadioChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Manejador para archivos
  const handleFileChange = (field: string, url: string, fileName: string) => {
    setFormData((prev) => ({
      ...prev,
      [`${field}-url`]: url,
      [`${field}-nombre`]: fileName,
    }))
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const form = new FormData()

      // Agregar todos los campos del estado al FormData
      Object.entries(formData).forEach(([key, value]) => {
        // Convertir booleanos a 'on' o vacío para que coincida con el comportamiento de los checkboxes HTML
        if (typeof value === "boolean") {
          if (value) form.append(key, "on")
        } else {
          form.append(key, value as string)
        }
      })

      const result = await guardarFormulario(form)

      if (result.success) {
        toast({
          title: "Éxito",
          description: result.message,
          variant: "default",
        })

        // Opcional: redirigir a una página de confirmación
        // router.push('/confirmacion');
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error al enviar el formulario:", error)
      toast({
        title: "Error",
        description: "Ha ocurrido un error al enviar el formulario",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Formulario de Usuario</h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 mb-4">
            <TabsTrigger value="informacion-alta">Información del Alta</TabsTrigger>
            <TabsTrigger value="datos-personales">Datos Personales</TabsTrigger>
            <TabsTrigger value="datos-adicionales">Datos Adicionales</TabsTrigger>
            <TabsTrigger value="preferencias">Preferencias</TabsTrigger>
            <TabsTrigger value="experiencia">Experiencia</TabsTrigger>
            <TabsTrigger value="formacion">Formación</TabsTrigger>
          </TabsList>

          {/* Información del Alta */}
          <TabsContent value="informacion-alta">
            <Card>
              <CardHeader>
                <CardTitle>Información del Alta</CardTitle>
                <CardDescription>Información sobre el alta del usuario en el sistema</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fecha-alta" className="required">
                      Fecha:
                    </Label>
                    <Input
                      type="date"
                      id="fecha-alta"
                      name="fecha-alta"
                      value={formData["fecha-alta"]}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="entidad-alta" className="required">
                      Entidad:
                    </Label>
                    <Input
                      type="text"
                      id="entidad-alta"
                      name="entidad-alta"
                      value={formData["entidad-alta"]}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="recurso-alta" className="required">
                      Recurso:
                    </Label>
                    <Input
                      type="text"
                      id="recurso-alta"
                      name="recurso-alta"
                      value={formData["recurso-alta"]}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <CardTitle className="text-lg mb-2">Información de la derivación</CardTitle>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fecha-derivacion" className="required">
                        Fecha:
                      </Label>
                      <Input
                        type="date"
                        id="fecha-derivacion"
                        name="fecha-derivacion"
                        value={formData["fecha-derivacion"]}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="entidad-derivacion" className="required">
                        Entidad:
                      </Label>
                      <Input
                        type="text"
                        id="entidad-derivacion"
                        name="entidad-derivacion"
                        value={formData["entidad-derivacion"]}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="recurso-derivacion" className="required">
                        Recurso:
                      </Label>
                      <Input
                        type="text"
                        id="recurso-derivacion"
                        name="recurso-derivacion"
                        value={formData["recurso-derivacion"]}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <CardTitle className="text-lg mb-2">Información de la revisión</CardTitle>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="estado-revision" className="required">
                        Estado:
                      </Label>
                      <Input
                        type="text"
                        id="estado-revision"
                        name="estado-revision"
                        value={formData["estado-revision"]}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fecha-ultima-revision" className="required">
                        F. última rev.:
                      </Label>
                      <Input
                        type="date"
                        id="fecha-ultima-revision"
                        name="fecha-ultima-revision"
                        value={formData["fecha-ultima-revision"]}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fecha-proxima-revision" className="required">
                        F. próxima rev.:
                      </Label>
                      <Input
                        type="date"
                        id="fecha-proxima-revision"
                        name="fecha-proxima-revision"
                        value={formData["fecha-proxima-revision"]}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Datos Personales */}
          <TabsContent value="datos-personales">
            <Card>
              <CardHeader>
                <CardTitle>Datos Personales</CardTitle>
                <CardDescription>Información personal del usuario</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nif" className="required">
                    NIF (Indicar el DNI sin puntos, guiones o espacios)
                  </Label>
                  <Input type="text" id="nif" name="nif" value={formData.nif} onChange={handleInputChange} required />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombre" className="required">
                      Nombre:
                    </Label>
                    <Input
                      type="text"
                      id="nombre"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="apellido1" className="required">
                      Apellido 1:
                    </Label>
                    <Input
                      type="text"
                      id="apellido1"
                      name="apellido1"
                      value={formData.apellido1}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="apellido2" className="required">
                      Apellido 2:
                    </Label>
                    <Input
                      type="text"
                      id="apellido2"
                      name="apellido2"
                      value={formData.apellido2}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sexo" className="required">
                      Sexo:
                    </Label>
                    <Select
                      name="sexo"
                      value={formData.sexo}
                      onValueChange={(value) => handleSelectChange("sexo", value)}
                      required
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
                    <Label htmlFor="fecha-nacimiento" className="required">
                      Fecha nacimiento:
                    </Label>
                    <Input
                      type="date"
                      id="fecha-nacimiento"
                      name="fecha-nacimiento"
                      value={formData["fecha-nacimiento"]}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="direccion" className="required">
                    Dirección:
                  </Label>
                  <Input
                    type="text"
                    id="direccion"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="poblacion" className="required">
                      Población:
                    </Label>
                    <Input
                      type="text"
                      id="poblacion"
                      name="poblacion"
                      value={formData.poblacion}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cp" className="required">
                      Código Postal:
                    </Label>
                    <Input type="text" id="cp" name="cp" value={formData.cp} onChange={handleInputChange} required />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="provincia" className="required">
                      Provincia:
                    </Label>
                    <Select
                      name="provincia"
                      value={formData.provincia}
                      onValueChange={(value) => handleSelectChange("provincia", value)}
                      required
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
                  <div className="space-y-2">
                    <Label htmlFor="pais" className="required">
                      País:
                    </Label>
                    <Select
                      name="pais"
                      value={formData.pais}
                      onValueChange={(value) => handleSelectChange("pais", value)}
                      required
                    >
                      <SelectTrigger id="pais">
                        <SelectValue placeholder="Seleccione..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="espana">España</SelectItem>
                        <SelectItem value="francia">Francia</SelectItem>
                        <SelectItem value="italia">Italia</SelectItem>
                        <SelectItem value="marruecos">Marruecos</SelectItem>
                        <SelectItem value="alemania">Alemania</SelectItem>
                        <SelectItem value="rumania">Rumania</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="telefono1" className="required">
                      Teléfono 1:
                    </Label>
                    <Input
                      type="tel"
                      id="telefono1"
                      name="telefono1"
                      value={formData.telefono1}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefono2">Teléfono 2:</Label>
                    <Input
                      type="tel"
                      id="telefono2"
                      name="telefono2"
                      value={formData.telefono2}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="required">
                    E-mail:
                  </Label>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Barrio preferente:</Label>
                  <RadioGroup
                    name="barrio-preferente"
                    value={formData["barrio-preferente"]}
                    onValueChange={(value) => handleRadioChange("barrio-preferente", value)}
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
                  <Label htmlFor="barrio-especifico">Especifique el barrio:</Label>
                  <Input
                    type="text"
                    id="barrio-especifico"
                    name="barrio-especifico"
                    value={formData["barrio-especifico"]}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nivel-academico" className="required">
                    Nivel académico:
                  </Label>
                  <Select
                    name="nivel-academico"
                    value={formData["nivel-academico"]}
                    onValueChange={(value) => handleSelectChange("nivel-academico", value)}
                    required
                  >
                    <SelectTrigger id="nivel-academico">
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

                <FileUpload
                  id="foto"
                  label="Foto:"
                  accept="image/jpeg,image/png,image/webp"
                  required
                  onChange={(url, fileName) => handleFileChange("foto", url, fileName)}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Datos Adicionales */}
          <TabsContent value="datos-adicionales">
            <Card>
              <CardHeader>
                <CardTitle>Datos Adicionales</CardTitle>
                <CardDescription>Información administrativa y de seguimiento</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="pt-2">
                  <CardTitle className="text-lg mb-2">Información administrativa</CardTitle>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fecha-padronamiento" className="required">
                        Fecha padronamiento:
                      </Label>
                      <Input
                        type="date"
                        id="fecha-padronamiento"
                        name="fecha-padronamiento"
                        value={formData["fecha-padronamiento"]}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nacionalidad" className="required">
                        Nacionalidad:
                      </Label>
                      <Input
                        type="text"
                        id="nacionalidad"
                        name="nacionalidad"
                        value={formData.nacionalidad}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="permiso-trabajo" className="required">
                        Permiso de trabajo/residencia:
                      </Label>
                      <Input
                        type="text"
                        id="permiso-trabajo"
                        name="permiso-trabajo"
                        value={formData["permiso-trabajo"]}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fecha-permiso">Fecha permiso:</Label>
                      <Input
                        type="date"
                        id="fecha-permiso"
                        name="fecha-permiso"
                        value={formData["fecha-permiso"]}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <CardTitle className="text-lg mb-2">Tipo de expediente</CardTitle>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="emprendedor"
                        name="emprendedor"
                        checked={formData.emprendedor as boolean}
                        onCheckedChange={(checked) => handleCheckboxChange("emprendedor", checked as boolean)}
                      />
                      <Label htmlFor="emprendedor" className="font-normal">
                        Es emprendedor
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="programa-incorpora"
                        name="programa-incorpora"
                        checked={formData["programa-incorpora"] as boolean}
                        onCheckedChange={(checked) => handleCheckboxChange("programa-incorpora", checked as boolean)}
                      />
                      <Label htmlFor="programa-incorpora" className="font-normal">
                        Programa INCORPORA
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <CardTitle className="text-lg mb-2">Datos de seguimiento</CardTitle>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fecha-inscripcion">Fecha inscripción:</Label>
                      <Input
                        type="date"
                        id="fecha-inscripcion"
                        name="fecha-inscripcion"
                        value={formData["fecha-inscripcion"]}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fecha-renovacion">Próxima fecha de renovación demanda:</Label>
                      <Input
                        type="date"
                        id="fecha-renovacion"
                        name="fecha-renovacion"
                        value={formData["fecha-renovacion"]}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-2 mt-4">
                    <Label htmlFor="estado">Estado:</Label>
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

                <div className="pt-4">
                  <CardTitle className="text-lg mb-2">Actuaciones realizadas</CardTitle>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="actuacion-cv"
                        name="actuacion-cv"
                        checked={formData["actuacion-cv"] as boolean}
                        onCheckedChange={(checked) => handleCheckboxChange("actuacion-cv", checked as boolean)}
                      />
                      <Label htmlFor="actuacion-cv" className="font-normal">
                        Elaboración de CV
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="actuacion-formacion"
                        name="actuacion-formacion"
                        checked={formData["actuacion-formacion"] as boolean}
                        onCheckedChange={(checked) => handleCheckboxChange("actuacion-formacion", checked as boolean)}
                      />
                      <Label htmlFor="actuacion-formacion" className="font-normal">
                        Facilitar acciones formativas
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="actuacion-derivaciones"
                        name="actuacion-derivaciones"
                        checked={formData["actuacion-derivaciones"] as boolean}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange("actuacion-derivaciones", checked as boolean)
                        }
                      />
                      <Label htmlFor="actuacion-derivaciones" className="font-normal">
                        Derivaciones
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="actuacion-otros"
                        name="actuacion-otros"
                        checked={formData["actuacion-otros"] as boolean}
                        onCheckedChange={(checked) => handleCheckboxChange("actuacion-otros", checked as boolean)}
                      />
                      <Label htmlFor="actuacion-otros" className="font-normal">
                        Otros
                      </Label>
                    </div>
                    <Textarea
                      id="anotaciones-otros"
                      name="anotaciones-otros"
                      rows={4}
                      value={formData["anotaciones-otros"]}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <CardTitle className="text-lg mb-2">Documentación adjunta</CardTitle>
                  <div className="space-y-4">
                    <FileUpload
                      id="cv"
                      label="Adjuntar CV:"
                      accept=".pdf,.docx"
                      onChange={(url, fileName) => handleFileChange("cv", url, fileName)}
                    />

                    <FileUpload
                      id="consentimiento"
                      label="Consentimiento informado:"
                      accept=".pdf,.docx"
                      onChange={(url, fileName) => handleFileChange("consentimiento", url, fileName)}
                    />

                    <div className="space-y-2">
                      <Label htmlFor="anotaciones">Anotaciones importantes:</Label>
                      <Textarea
                        id="anotaciones"
                        name="anotaciones"
                        rows={4}
                        value={formData.anotaciones}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferencias */}
          <TabsContent value="preferencias">
            <Card>
              <CardHeader>
                <CardTitle>Preferencias de Contratación</CardTitle>
                <CardDescription>Preferencias laborales del usuario</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="intereses">Intereses:</Label>
                      <Input
                        type="text"
                        id="intereses"
                        name="intereses"
                        value={formData.intereses}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tipo-contrato">Tipo de contrato:</Label>
                      <Input
                        type="text"
                        id="tipo-contrato"
                        name="tipo-contrato"
                        value={formData["tipo-contrato"]}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="tipo-jornada">Tipo de jornada:</Label>
                      <Input
                        type="text"
                        id="tipo-jornada"
                        name="tipo-jornada"
                        value={formData["tipo-jornada"]}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="disp-geografica">Disp. geográfica:</Label>
                      <Input
                        type="text"
                        id="disp-geografica"
                        name="disp-geografica"
                        value={formData["disp-geografica"]}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="disp-viajar">Disp. viajar:</Label>
                      <Input
                        type="text"
                        id="disp-viajar"
                        name="disp-viajar"
                        value={formData["disp-viajar"]}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ocupacion-especifica">Ocupación específica:</Label>
                      <Input
                        type="text"
                        id="ocupacion-especifica"
                        name="ocupacion-especifica"
                        value={formData["ocupacion-especifica"]}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="objetivo-salarial">Objetivo salarial:</Label>
                    <Input
                      type="text"
                      id="objetivo-salarial"
                      name="objetivo-salarial"
                      value={formData["objetivo-salarial"]}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="perfil-profesional1">Perfil Prof. Preferido 1:</Label>
                    <Input
                      type="text"
                      id="perfil-profesional1"
                      name="perfil-profesional1"
                      value={formData["perfil-profesional1"]}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="perfil-profesional2">Perfil Prof. Preferido 2:</Label>
                    <Input
                      type="text"
                      id="perfil-profesional2"
                      name="perfil-profesional2"
                      value={formData["perfil-profesional2"]}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="perfil-profesional3">Perfil Prof. Preferido 3:</Label>
                    <Input
                      type="text"
                      id="perfil-profesional3"
                      name="perfil-profesional3"
                      value={formData["perfil-profesional3"]}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fecha-demanda-empleo">Fecha demanda empleo:</Label>
                    <Input
                      type="date"
                      id="fecha-demanda-empleo"
                      name="fecha-demanda-empleo"
                      value={formData["fecha-demanda-empleo"]}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Carnets de conducir y disponibilidad de vehículo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="carnet1">Carnet 1:</Label>
                      <Input
                        type="text"
                        id="carnet1"
                        name="carnet1"
                        value={formData.carnet1}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="carnet2">Carnet 2:</Label>
                      <Input
                        type="text"
                        id="carnet2"
                        name="carnet2"
                        value={formData.carnet2}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dispone-vehiculo">Dispone de vehículo:</Label>
                      <Select
                        name="dispone-vehiculo"
                        value={formData["dispone-vehiculo"]}
                        onValueChange={(value) => handleSelectChange("dispone-vehiculo", value)}
                      >
                        <SelectTrigger id="dispone-vehiculo">
                          <SelectValue placeholder="Seleccione..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="si">Sí</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vehiculo">Vehículo:</Label>
                      <Input
                        type="text"
                        id="vehiculo"
                        name="vehiculo"
                        value={formData.vehiculo}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dispone-vehiculo2">Dispone 2º vehículo:</Label>
                      <Select
                        name="dispone-vehiculo2"
                        value={formData["dispone-vehiculo2"]}
                        onValueChange={(value) => handleSelectChange("dispone-vehiculo2", value)}
                      >
                        <SelectTrigger id="dispone-vehiculo2">
                          <SelectValue placeholder="Seleccione..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="si">Sí</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vehiculo2">2º Vehículo:</Label>
                      <Input
                        type="text"
                        id="vehiculo2"
                        name="vehiculo2"
                        value={formData.vehiculo2}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <CardTitle className="text-lg mb-2">Carnets Profesionales</CardTitle>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="carnet-profesional1">Carnet 1:</Label>
                      <Input
                        type="text"
                        id="carnet-profesional1"
                        name="carnet-profesional1"
                        value={formData["carnet-profesional1"]}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="carnet-profesional2">Carnet 2:</Label>
                      <Input
                        type="text"
                        id="carnet-profesional2"
                        name="carnet-profesional2"
                        value={formData["carnet-profesional2"]}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="carnet-profesional3">Carnet 3:</Label>
                      <Input
                        type="text"
                        id="carnet-profesional3"
                        name="carnet-profesional3"
                        value={formData["carnet-profesional3"]}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Experiencia */}
          <TabsContent value="experiencia">
            <Card>
              <CardHeader>
                <CardTitle>Experiencia Laboral</CardTitle>
                <CardDescription>Experiencia laboral del usuario</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <CardTitle className="text-lg">Experiencia 1</CardTitle>
                    <div className="space-y-2">
                      <Label htmlFor="experiencia1-duracion">Duración:</Label>
                      <Input
                        type="text"
                        id="experiencia1-duracion"
                        name="experiencia1-duracion"
                        value={formData["experiencia1-duracion"]}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="experiencia1-ocupacion">Ocupación:</Label>
                      <Input
                        type="text"
                        id="experiencia1-ocupacion"
                        name="experiencia1-ocupacion"
                        value={formData["experiencia1-ocupacion"]}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <CardTitle className="text-lg">Experiencia 2</CardTitle>
                    <div className="space-y-2">
                      <Label htmlFor="experiencia2-duracion">Duración:</Label>
                      <Input
                        type="text"
                        id="experiencia2-duracion"
                        name="experiencia2-duracion"
                        value={formData["experiencia2-duracion"]}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="experiencia2-ocupacion">Ocupación:</Label>
                      <Input
                        type="text"
                        id="experiencia2-ocupacion"
                        name="experiencia2-ocupacion"
                        value={formData["experiencia2-ocupacion"]}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <CardTitle className="text-lg">Experiencia 3</CardTitle>
                    <div className="space-y-2">
                      <Label htmlFor="experiencia3-duracion">Duración:</Label>
                      <Input
                        type="text"
                        id="experiencia3-duracion"
                        name="experiencia3-duracion"
                        value={formData["experiencia3-duracion"]}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="experiencia3-ocupacion">Ocupación:</Label>
                      <Input
                        type="text"
                        id="experiencia3-ocupacion"
                        name="experiencia3-ocupacion"
                        value={formData["experiencia3-ocupacion"]}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <CardTitle className="text-lg">Experiencia 4</CardTitle>
                    <div className="space-y-2">
                      <Label htmlFor="experiencia4-duracion">Duración:</Label>
                      <Input
                        type="text"
                        id="experiencia4-duracion"
                        name="experiencia4-duracion"
                        value={formData["experiencia4-duracion"]}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="experiencia4-ocupacion">Ocupación:</Label>
                      <Input
                        type="text"
                        id="experiencia4-ocupacion"
                        name="experiencia4-ocupacion"
                        value={formData["experiencia4-ocupacion"]}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Formación */}
          <TabsContent value="formacion">
            <Card>
              <CardHeader>
                <CardTitle>Experiencias Formativas</CardTitle>
                <CardDescription>Formación académica y profesional</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <CardTitle className="text-lg">Formación 1</CardTitle>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="formacion-anio-1">Año finalización:</Label>
                        <Input
                          type="text"
                          id="formacion-anio-1"
                          name="formacion-anio-1"
                          value={formData["formacion-anio-1"]}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="formacion-titulacion-1">Titulación:</Label>
                        <Input
                          type="text"
                          id="formacion-titulacion-1"
                          name="formacion-titulacion-1"
                          value={formData["formacion-titulacion-1"]}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <CardTitle className="text-lg">Formación 2</CardTitle>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="formacion-anio-2">Año finalización:</Label>
                        <Input
                          type="text"
                          id="formacion-anio-2"
                          name="formacion-anio-2"
                          value={formData["formacion-anio-2"]}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="formacion-titulacion-2">Titulación:</Label>
                        <Input
                          type="text"
                          id="formacion-titulacion-2"
                          name="formacion-titulacion-2"
                          value={formData["formacion-titulacion-2"]}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <CardTitle className="text-lg">Formación 3</CardTitle>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="formacion-anio-3">Año finalización:</Label>
                        <Input
                          type="text"
                          id="formacion-anio-3"
                          name="formacion-anio-3"
                          value={formData["formacion-anio-3"]}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="formacion-titulacion-3">Titulación:</Label>
                        <Input
                          type="text"
                          id="formacion-titulacion-3"
                          name="formacion-titulacion-3"
                          value={formData["formacion-titulacion-3"]}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <CardTitle className="text-lg mb-4">Idiomas</CardTitle>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                      <div className="space-y-2">
                        <Label htmlFor="idioma1">Idioma 1:</Label>
                        <Select
                          name="idioma1"
                          value={formData.idioma1}
                          onValueChange={(value) => handleSelectChange("idioma1", value)}
                        >
                          <SelectTrigger id="idioma1">
                            <SelectValue placeholder="Seleccione..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ingles">Inglés</SelectItem>
                            <SelectItem value="frances">Francés</SelectItem>
                            <SelectItem value="aleman">Alemán</SelectItem>
                            <SelectItem value="arabe">Árabe</SelectItem>
                            <SelectItem value="italiano">Italiano</SelectItem>
                            <SelectItem value="rumano">Rumano</SelectItem>
                            <SelectItem value="catalan">Catalán</SelectItem>
                            <SelectItem value="espanol">Español</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="nivel1">Nivel:</Label>
                        <Select
                          name="nivel1"
                          value={formData.nivel1}
                          onValueChange={(value) => handleSelectChange("nivel1", value)}
                        >
                          <SelectTrigger id="nivel1">
                            <SelectValue placeholder="Seleccione..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="basico">Básico</SelectItem>
                            <SelectItem value="medio">Medio</SelectItem>
                            <SelectItem value="alto">Alto</SelectItem>
                            <SelectItem value="avanzado">Avanzado</SelectItem>
                            <SelectItem value="nativo">Nativo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="homologado1"
                          name="homologado1"
                          checked={formData.homologado1 as boolean}
                          onCheckedChange={(checked) => handleCheckboxChange("homologado1", checked as boolean)}
                        />
                        <Label htmlFor="homologado1" className="font-normal">
                          Homologado
                        </Label>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                      <div className="space-y-2">
                        <Label htmlFor="idioma2">Idioma 2:</Label>
                        <Select
                          name="idioma2"
                          value={formData.idioma2}
                          onValueChange={(value) => handleSelectChange("idioma2", value)}
                        >
                          <SelectTrigger id="idioma2">
                            <SelectValue placeholder="Seleccione..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ingles">Inglés</SelectItem>
                            <SelectItem value="frances">Francés</SelectItem>
                            <SelectItem value="aleman">Alemán</SelectItem>
                            <SelectItem value="arabe">Árabe</SelectItem>
                            <SelectItem value="italiano">Italiano</SelectItem>
                            <SelectItem value="rumano">Rumano</SelectItem>
                            <SelectItem value="catalan">Catalán</SelectItem>
                            <SelectItem value="espanol">Español</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="nivel2">Nivel:</Label>
                        <Select
                          name="nivel2"
                          value={formData.nivel2}
                          onValueChange={(value) => handleSelectChange("nivel2", value)}
                        >
                          <SelectTrigger id="nivel2">
                            <SelectValue placeholder="Seleccione..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="basico">Básico</SelectItem>
                            <SelectItem value="medio">Medio</SelectItem>
                            <SelectItem value="alto">Alto</SelectItem>
                            <SelectItem value="avanzado">Avanzado</SelectItem>
                            <SelectItem value="nativo">Nativo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="homologado2"
                          name="homologado2"
                          checked={formData.homologado2 as boolean}
                          onCheckedChange={(checked) => handleCheckboxChange("homologado2", checked as boolean)}
                        />
                        <Label htmlFor="homologado2" className="font-normal">
                          Homologado
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between gap-4">
          <Button type="button" variant="outline" onClick={() => window.location.reload()}>
            Deshacer
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Enviando..." : "Enviar Datos"}
          </Button>
        </div>
      </form>
    </div>
  )
}
