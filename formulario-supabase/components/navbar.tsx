"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Users, FileText } from "lucide-react"

export default function Navbar() {
  const pathname = usePathname()

  return (
    <header className="bg-white border-b sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl">
          Formulario de Usuarios
        </Link>

        <nav className="flex items-center gap-4">
          <Button variant={pathname === "/" ? "default" : "outline"} asChild>
            <Link href="/">
              <FileText className="mr-2 h-4 w-4" />
              Formulario
            </Link>
          </Button>

          <Button variant={pathname.startsWith("/admin") ? "default" : "outline"} asChild>
            <Link href="/admin">
              <Users className="mr-2 h-4 w-4" />
              Administración
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  )
}
