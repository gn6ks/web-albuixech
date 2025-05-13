export function exportToCSV(data: any[], filename: string) {
  if (!data || !data.length) {
    return
  }

  // Obtener las cabeceras (nombres de las propiedades)
  const headers = Object.keys(data[0])

  // Crear el contenido CSV
  const csvContent = [
    // Cabeceras
    headers.join(","),
    // Filas de datos
    ...data.map((row) =>
      headers
        .map((header) => {
          // Formatear el valor para CSV (escapar comas y comillas)
          const value = row[header] === null || row[header] === undefined ? "" : row[header]
          const formattedValue = typeof value === "string" ? `"${value.replace(/"/g, '""')}"` : value
          return formattedValue
        })
        .join(","),
    ),
  ].join("\n")

  // Crear un blob con el contenido CSV
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })

  // Crear un enlace para descargar el archivo
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)

  link.setAttribute("href", url)
  link.setAttribute("download", `${filename}_${new Date().toISOString().split("T")[0]}.csv`)
  link.style.visibility = "hidden"

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
