"use client"

import type React from "react"

import { useState } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Upload, X } from "lucide-react"

interface FileUploadProps {
  id: string
  label: string
  accept?: string
  required?: boolean
  onChange: (url: string, fileName: string) => void
}

export default function FileUpload({ id, label, accept, required, onChange }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const [fileUrl, setFileUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setError(null)

    try {
      const supabase = getSupabaseClient()

      // Crear un nombre de archivo único
      const fileExt = file.name.split(".").pop()
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
      const filePath = `uploads/${fileName}`

      // Subir el archivo a Supabase Storage
      const { data, error } = await supabase.storage.from("formularios").upload(filePath, file)

      if (error) throw error

      // Obtener la URL pública del archivo
      const {
        data: { publicUrl },
      } = supabase.storage.from("formularios").getPublicUrl(filePath)

      setFileName(file.name)
      setFileUrl(publicUrl)
      onChange(publicUrl, file.name)
    } catch (error) {
      console.error("Error al subir el archivo:", error)
      setError("Error al subir el archivo. Por favor, inténtalo de nuevo.")
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveFile = () => {
    setFileName(null)
    setFileUrl(null)
    onChange("", "")
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className={required ? "required" : ""}>
        {label}
      </Label>

      {!fileName ? (
        <div className="flex items-center gap-2">
          <input
            type="file"
            id={id}
            accept={accept}
            required={required}
            onChange={handleFileChange}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById(id)?.click()}
            disabled={isUploading}
            className="w-full"
          >
            <Upload className="mr-2 h-4 w-4" />
            {isUploading ? "Subiendo..." : "Seleccionar archivo"}
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-between p-2 border rounded-md">
          <span className="text-sm truncate max-w-[200px]">{fileName}</span>
          <Button type="button" variant="ghost" size="sm" onClick={handleRemoveFile} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
            <span className="sr-only">Eliminar archivo</span>
          </Button>
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}
