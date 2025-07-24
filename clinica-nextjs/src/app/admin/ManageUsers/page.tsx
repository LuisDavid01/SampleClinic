import { redirect } from "next/navigation"
import { checkRole } from "@/utils/roles"
import { SearchUsers } from "./SearchUsers"
import { clerkClient } from "@clerk/nextjs/server"
import { removeRole, setRole } from "./_actions"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Shield, UserCheck, Search, Mail, MoreVertical } from "lucide-react"

export default async function AdminDashboard(params: {
  searchParams: Promise<{ search?: string }>
}) {
  if (!checkRole("admin")) {
    redirect("/")
  }

  const query = (await params.searchParams).search
  const client = await clerkClient()
  const users = query
    ? (await client.users.getUserList({ query })).data
    : (await client.users.getUserList({ limit: 100, offset: 0 })).data

  // Calcular estadísticas
  const stats = {
    total: users.length,
    admins: users.filter((user) => user.publicMetadata.role === "admin").length,
    moderators: users.filter((user) => user.publicMetadata.role === "moderator").length,
    regular: users.filter((user) => !user.publicMetadata.role).length,
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-3 sm:p-6 space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
            Panel de Administración
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Gestiona usuarios y roles del sistema
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="bg-card border-muted hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-card-foreground">
                Total Usuarios
              </CardTitle>
              <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <div className="text-xl sm:text-2xl font-bold text-text-primary">{stats.total}</div>
              <p className="text-xs text-muted-foreground mt-1">Registrados</p>
            </CardContent>
          </Card>

          <Card className="bg-accent border-accent hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-accent-foreground">
                Admins
              </CardTitle>
              <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-accent-foreground/70" />
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <div className="text-xl sm:text-2xl font-bold text-accent-foreground">{stats.admins}</div>
              <p className="text-xs text-accent-foreground/70 mt-1">Completos</p>
            </CardContent>
          </Card>

          <Card className="bg-secondary border-secondary hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-secondary-foreground">
                Moderadores
              </CardTitle>
              <UserCheck className="h-3 w-3 sm:h-4 sm:w-4 text-secondary-foreground/70" />
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <div className="text-xl sm:text-2xl font-bold text-secondary-foreground">{stats.moderators}</div>
              <p className="text-xs text-secondary-foreground/70 mt-1">Limitados</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-muted hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-card-foreground">
                Regulares
              </CardTitle>
              <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <div className="text-xl sm:text-2xl font-bold text-text-primary">{stats.regular}</div>
              <p className="text-xs text-muted-foreground mt-1">Sin roles</p>
            </CardContent>
          </Card>
        </div>

        {/* Search Section */}
        <Card className="bg-card border-muted">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-text-primary text-lg sm:text-xl">
              <Search className="h-4 w-4 sm:h-5 sm:w-5" />
              Buscar Usuarios
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <SearchUsers />
          </CardContent>
        </Card>

        {/* Users Section */}
        <Card className="bg-card border-muted">
          <CardHeader className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <CardTitle className="text-text-primary text-lg sm:text-xl">Gestión de Usuarios</CardTitle>
              <Badge variant="secondary" className="text-sm bg-muted text-muted-foreground w-fit">
                {users.length} usuarios
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            {users.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
                </div>
                <h3 className="text-base sm:text-lg font-medium text-text-primary mb-2">
                  No se encontraron usuarios
                </h3>
                <p className="text-sm text-muted-foreground">Intenta con una búsqueda diferente</p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {users.map((user) => {
                  const currentRole = user.publicMetadata.role as string
                  const primaryEmail = user.emailAddresses.find(
                    (email) => email.id === user.primaryEmailAddressId,
                  )?.emailAddress

                  return (
                    <Card key={user.id} className="bg-background border-muted hover:shadow-md transition-shadow">
                      <CardContent className="p-4 sm:p-6">
                        <div className="space-y-4">
                          {/* User Info */}
                          <div className="flex items-start gap-3 sm:gap-4">
                            <Avatar className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
                              <AvatarImage
                                src={user?.imageUrl || "/placeholder.svg"}
                                alt={user?.fullName || "Usuario"}
                              />
                              <AvatarFallback className="bg-muted text-text-primary text-sm">
                                {user.firstName?.[0]}
                                {user.lastName?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0 space-y-1">
                              <h3 className="font-semibold text-base sm:text-lg text-text-primary truncate">
                                {user.firstName} {user.lastName}
                              </h3>
                              <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                                <Mail className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                                <span className="truncate">{primaryEmail}</span>
                              </div>
                            </div>
                          </div>

                          {/* Role Badge */}
                          <div className="flex items-center gap-2">
                            <span className="text-xs sm:text-sm text-muted-foreground">Rol:</span>
                            {currentRole === "admin" ? (
                              <Badge className="gap-1 bg-accent text-accent-foreground border-accent text-xs">
                                <Shield className="h-3 w-3" />
                                Administrador
                              </Badge>
                            ) : currentRole === "moderator" ? (
                              <Badge className="gap-1 bg-secondary text-secondary-foreground border-secondary text-xs">
                                <UserCheck className="h-3 w-3" />
                                Moderador
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="gap-1 text-xs">
                                <Users className="h-3 w-3" />
                                Usuario
                              </Badge>
                            )}
                          </div>

                          {/* Actions - Mobile Optimized */}
                          <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-muted">
                            <form action={setRole} className="flex-1 sm:flex-initial">
                              <input type="hidden" value={user.id} name="id" />
                              <input type="hidden" value="admin" name="role" />
                              <Button
                                type="submit"
                                size="sm"
                                disabled={currentRole === "admin"}
                                className="w-full sm:w-auto bg-accent text-accent-foreground hover:bg-accent/90 disabled:bg-muted disabled:text-muted-foreground text-xs sm:text-sm"
                              >
                                Hacer Admin
                              </Button>
                            </form>
                            
                            <form action={setRole} className="flex-1 sm:flex-initial">
                              <input type="hidden" value={user.id} name="id" />
                              <input type="hidden" value="moderator" name="role" />
                              <Button
                                type="submit"
                                size="sm"
                                disabled={currentRole === "moderator"}
                                className="w-full sm:w-auto bg-secondary text-secondary-foreground hover:bg-secondary/90 disabled:bg-muted disabled:text-muted-foreground text-xs sm:text-sm"
                              >
                                Hacer Moderador
                              </Button>
                            </form>
                            
                            <form action={removeRole} className="flex-1 sm:flex-initial">
                              <input type="hidden" value={user.id} name="id" />
                              <Button
                                type="submit"
                                variant="outline"
                                size="sm"
                                disabled={!currentRole}
                                className="w-full sm:w-auto bg-transparent hover:bg-muted text-xs sm:text-sm"
                              >
                                Quitar Rol
                              </Button>
                            </form>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}