import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
    PlusIcon,
    Folder,

} from "lucide-react"

import { Suspense } from "react"
import ServiceList from "@/components/ServiceList"



export default function ServicesPage() {
    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-card">
                            <Folder className="h-6 w-6 text-accent" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">Servicios</h1>
                            <p className="text-muted-foreground">
                                Gestiona los servicios disponibles
                            </p>
                        </div>
                    </div>

                    {/* <Link href="@/components/NewServiceDialog">
                        <Button className="cursor-pointer">
                            <PlusIcon className="w-4 h-4 mr-2" />
                            Nuevo Servicio
                        </Button>
                    </Link> */}
                </div>
                <Suspense fallback={<div>Cargando Servicios...</div>}>
                    <ServiceList />
                </Suspense>
            </div>
        </div>
    )
}
