"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function guardarFormulario(formData: FormData) {
  try {
    const supabase = createServerSupabaseClient()

    // Crear un bucket para los archivos si no existe
    const { data: bucketData, error: bucketError } = await supabase.storage.getBucket("formularios")
    if (bucketError && bucketError.message.includes("does not exist")) {
      await supabase.storage.createBucket("formularios", {
        public: true,
        fileSizeLimit: 10485760, // 10MB
      })
    }

    // Extraer datos básicos del usuario
    const nif = formData.get("nif") as string
    const nombre = formData.get("nombre") as string
    const apellido1 = formData.get("apellido1") as string
    const apellido2 = formData.get("apellido2") as string
    const email = formData.get("email") as string
    const fechaAlta = formData.get("fecha-alta") as string

    // Verificar datos obligatorios
    if (!nif || !nombre || !apellido1 || !email || !fechaAlta) {
      return {
        success: false,
        message: "Faltan campos obligatorios",
      }
    }

    // Insertar datos del usuario
    const { data: userData, error: userError } = await supabase
      .from("usuarios")
      .insert({
        nif,
        nombre,
        apellido1,
        apellido2,
        email,
        fecha_alta: fechaAlta,
        entidad_alta: formData.get("entidad-alta") as string,
        recurso_alta: formData.get("recurso-alta") as string,
        fecha_derivacion: (formData.get("fecha-derivacion") as string) || null,
        entidad_derivacion: formData.get("entidad-derivacion") as string,
        recurso_derivacion: formData.get("recurso-derivacion") as string,
        estado_revision: formData.get("estado-revision") as string,
        fecha_ultima_revision: (formData.get("fecha-ultima-revision") as string) || null,
        fecha_proxima_revision: (formData.get("fecha-proxima-revision") as string) || null,
        sexo: formData.get("sexo") as string,
        fecha_nacimiento: (formData.get("fecha-nacimiento") as string) || null,
        direccion: formData.get("direccion") as string,
        poblacion: formData.get("poblacion") as string,
        cp: formData.get("cp") as string,
        provincia: formData.get("provincia") as string,
        pais: formData.get("pais") as string,
        telefono1: formData.get("telefono1") as string,
        telefono2: formData.get("telefono2") as string,
        barrio_preferente: formData.get("barrio-preferente") === "si",
        barrio_especifico: formData.get("barrio-especifico") as string,
        nivel_academico: formData.get("nivel-academico") as string,
        foto_url: (formData.get("foto-url") as string) || null,
      })
      .select("id")
      .single()

    if (userError) {
      console.error("Error al insertar usuario:", userError)
      return {
        success: false,
        message: "Error al guardar los datos del usuario",
      }
    }

    const usuarioId = userData.id

    // Insertar datos adicionales
    await supabase.from("datos_adicionales").insert({
      usuario_id: usuarioId,
      fecha_padronamiento: (formData.get("fecha-padronamiento") as string) || null,
      nacionalidad: formData.get("nacionalidad") as string,
      permiso_trabajo: formData.get("permiso-trabajo") as string,
      fecha_permiso: (formData.get("fecha-permiso") as string) || null,
      formacion: formData.get("formacion") as string,
      idiomas: formData.get("idiomas") as string,
      informatica: formData.get("informatica") as string,
      carnets: formData.get("carnets") as string,
      experiencia_laboral: formData.get("experiencia-laboral") as string,
      fecha_inscripcion: (formData.get("fecha-inscripcion") as string) || null,
      fecha_renovacion: (formData.get("fecha-renovacion") as string) || null,
      estado: formData.get("estado") as string,
      actuaciones: getActuaciones(formData),
      anotaciones_otros: formData.get("anotaciones-otros") as string,
      cv_url: (formData.get("cv-url") as string) || null,
      consentimiento_url: (formData.get("consentimiento-url") as string) || null,
      anotaciones: formData.get("anotaciones") as string,
    })

    // Insertar preferencias de contratación
    await supabase.from("preferencias_contratacion").insert({
      usuario_id: usuarioId,
      intereses: formData.get("intereses") as string,
      tipo_contrato: formData.get("tipo-contrato") as string,
      tipo_jornada: formData.get("tipo-jornada") as string,
      disp_geografica: formData.get("disp-geografica") as string,
      disp_viajar: formData.get("disp-viajar") as string,
      ocupacion_especifica: formData.get("ocupacion-especifica") as string,
      objetivo_salarial: formData.get("objetivo-salarial") as string,
      perfil_profesional1: formData.get("perfil-profesional1") as string,
      perfil_profesional2: formData.get("perfil-profesional2") as string,
      perfil_profesional3: formData.get("perfil-profesional3") as string,
      fecha_demanda_empleo: (formData.get("fecha-demanda-empleo") as string) || null,
    })

    // Insertar carnets y vehículos
    await supabase.from("carnets_vehiculos").insert({
      usuario_id: usuarioId,
      carnets: getCarnets(formData),
      dispone_vehiculo: formData.get("dispone-vehiculo") === "si",
      vehiculo: formData.get("vehiculo") as string,
      dispone_vehiculo2: formData.get("dispone-vehiculo2") === "si",
      vehiculo2: formData.get("vehiculo2") as string,
      carnets_profesionales: getCarnetsProfesionales(formData),
    })

    // Insertar experiencias laborales
    for (let i = 1; i <= 4; i++) {
      const duracion = formData.get(`experiencia${i}-duracion`) as string
      const ocupacion = formData.get(`experiencia${i}-ocupacion`) as string

      if (duracion || ocupacion) {
        await supabase.from("experiencias_laborales").insert({
          usuario_id: usuarioId,
          duracion,
          ocupacion,
        })
      }
    }

    // Insertar experiencias formativas
    for (let i = 1; i <= 3; i++) {
      const anio = formData.get(`formacion-anio-${i}`) as string
      const titulacion = formData.get(`formacion-titulacion-${i}`) as string

      if (anio || titulacion) {
        await supabase.from("experiencias_formativas").insert({
          usuario_id: usuarioId,
          anio_finalizacion: anio,
          titulacion,
        })
      }
    }

    // Insertar idiomas
    for (let i = 1; i <= 4; i++) {
      const idioma = formData.get(`idioma${i}`) as string
      const nivel = formData.get(`nivel${i}`) as string
      const homologado = formData.get(`homologado${i}`) === "on"

      if (idioma) {
        await supabase.from("idiomas_usuario").insert({
          usuario_id: usuarioId,
          idioma,
          nivel,
          homologado,
        })
      }
    }

    // Registrar archivos subidos
    const fotoUrl = formData.get("foto-url") as string
    const cvUrl = formData.get("cv-url") as string
    const consentimientoUrl = formData.get("consentimiento-url") as string

    if (fotoUrl) {
      await registrarArchivo(supabase, usuarioId, "foto", "imagen", fotoUrl)
    }

    if (cvUrl) {
      await registrarArchivo(supabase, usuarioId, "cv", "documento", cvUrl)
    }

    if (consentimientoUrl) {
      await registrarArchivo(supabase, usuarioId, "consentimiento", "documento", consentimientoUrl)
    }

    return {
      success: true,
      message: "Formulario guardado correctamente",
    }
  } catch (error) {
    console.error("Error al guardar el formulario:", error)
    return {
      success: false,
      message: "Error al guardar el formulario",
    }
  }
}

// Funciones auxiliares
function getActuaciones(formData: FormData): string[] {
  const actuaciones: string[] = []

  if (formData.get("actuacion-cv") === "on") actuaciones.push("Elaboración de CV")
  if (formData.get("actuacion-formacion") === "on") actuaciones.push("Facilitar acciones formativas")
  if (formData.get("actuacion-derivaciones") === "on") actuaciones.push("Derivaciones")
  if (formData.get("actuacion-otros") === "on") actuaciones.push("Otros")

  return actuaciones
}

function getCarnets(formData: FormData): string[] {
  const carnets: string[] = []

  for (let i = 1; i <= 10; i++) {
    const carnet = formData.get(`carnet${i}`) as string
    if (carnet) carnets.push(carnet)
  }

  return carnets
}

function getCarnetsProfesionales(formData: FormData): string[] {
  const carnets: string[] = []

  for (let i = 1; i <= 5; i++) {
    const carnet = formData.get(`carnet-profesional${i}`) as string
    if (carnet) carnets.push(carnet)
  }

  return carnets
}

async function registrarArchivo(
  supabase: any,
  usuarioId: number,
  nombreArchivo: string,
  tipoArchivo: string,
  url: string,
) {
  await supabase.from("archivos").insert({
    usuario_id: usuarioId,
    nombre_archivo: nombreArchivo,
    tipo_archivo: tipoArchivo,
    url,
    tamano: 0, // No podemos obtener el tamaño del archivo desde la URL
  })
}
