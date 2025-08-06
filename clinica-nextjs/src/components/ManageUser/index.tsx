import { clerkClient } from "@clerk/nextjs/server";
import { removeRole, setRole } from "@/actions/_actions";
import { SearchUsers } from "@/components/SearchUsers";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  Shield,
  UserCheck,
  Mail,
  Stethoscope,
  Activity,
} from "lucide-react";

// Cambiar la firma del componente para recibir searchParams como prop
export default async function ManageUser({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const query = (await searchParams).search?.trim();
  const client = await clerkClient();

  const users = query
    ? (await client.users.getUserList({ query, limit: 10, offset: 0 })).data
    : (await client.users.getUserList({ limit: 10, offset: 0 })).data;

  const stats = {
    total: users.length,
    admins: users.filter((u) => u.publicMetadata.role === "admin").length,
    moderators: users.filter((u) => u.publicMetadata.role === "moderator")
      .length,
    regular: users.filter((u) => !u.publicMetadata.role).length,
  };

  return (
    <>
     

      {/* Bloque de estadísticas compacto */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <StatTile
          title="Usuarios"
          value={stats.total}
          icon={<Users className="h-4 w-4" />}
          tone="neutral"
        />
        <StatTile
          title="Admins"
          value={stats.admins}
          icon={<Shield className="h-4 w-4" />}
          tone="accent"
        />
        <StatTile
          title="Moderadores"
          value={stats.moderators}
          icon={<UserCheck className="h-4 w-4" />}
          tone="secondary"
        />
        <StatTile
          title="Regulares"
          value={stats.regular}
          icon={<Activity className="h-4 w-4" />}
          tone="muted"
        />
      </div>

      {/* Lista de usuarios */}
      <section className="space-y-3 sm:space-y-4">
        {users.length === 0 ? (
          <Card className="border-input bg-card">
            <CardContent className="p-10 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-base sm:text-lg font-medium text-text-primary">
                No se encontraron usuarios
              </h3>
              <p className="text-sm text-muted-foreground">
                Intenta con un nombre o correo diferente
              </p>
            </CardContent>
          </Card>
        ) : (
          users.map((user) => {
            const currentRole = user.publicMetadata.role as string | undefined;
            const primaryEmail = user.emailAddresses.find(
              (e) => e.id === user.primaryEmailAddressId
            )?.emailAddress;

            return (
              <Card
                key={user.id}
                className="border-input bg-background transition-shadow hover:shadow-sm"
              >
                <CardContent className="p-4 sm:p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    {/* Info principal */}
                    <div className="flex min-w-0 items-start gap-3 sm:gap-4">
                      <Avatar className="h-12 w-12 sm:h-14 sm:w-14">
                        <AvatarImage
                          src={user?.imageUrl || "/placeholder.svg"}
                          alt={user?.fullName || "Usuario"}
                        />
                        <AvatarFallback className="bg-muted text-text-primary">
                          {user.firstName?.[0]}
                          {user.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="truncate text-base sm:text-lg font-semibold text-text-primary">
                            {user.firstName} {user.lastName}
                          </h3>
                          <RoleBadge role={currentRole} />
                        </div>
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                          <Mail className="h-4 w-4" />
                          <span className="truncate">{primaryEmail}</span>
                        </div>
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="grid grid-cols-1 gap-2 sm:w-[520px] sm:grid-cols-3">
                      <form action={setRole}>
                        <input type="hidden" name="id" value={user.id} />
                        <input type="hidden" name="role" value="admin" />
                        <Button
                          type="submit"
                          size="sm"
                          disabled={currentRole === "admin"}
                          className="w-full bg-accent text-accent-foreground hover:bg-accent/90 disabled:bg-muted disabled:text-muted-foreground"
                        >
                          Hacer Administrador
                        </Button>
                      </form>

                      <form action={setRole}>
                        <input type="hidden" name="id" value={user.id} />
                        <input type="hidden" name="role" value="moderator" />
                        <Button
                          type="submit"
                          size="sm"
                          disabled={currentRole === "moderator"}
                          className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 disabled:bg-muted disabled:text-muted-foreground"
                        >
                          Hacer Moderador
                        </Button>
                      </form>

                      <form action={removeRole}>
                        <input type="hidden" name="id" value={user.id} />
                        <Button
                          type="submit"
                          variant="outline"
                          size="sm"
                          disabled={!currentRole}
                          className="w-full hover:bg-muted"
                        >
                          Quitar Rol
                        </Button>
                      </form>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </section>
    </>
  );
}

function RoleBadge({ role }: { role?: string }) {
  if (role === "admin") {
    return (
      <Badge className="gap-1 bg-accent text-accent-foreground border-accent">
        <Shield className="h-3.5 w-3.5" />
        Administrador
      </Badge>
    );
  }
  if (role === "moderator") {
    return (
      <Badge className="gap-1 bg-secondary text-secondary-foreground border-secondary">
        <UserCheck className="h-3.5 w-3.5" />
        Moderador
      </Badge>
    );
  }
  return <Badge variant="outline">Usuario</Badge>;
}

function StatTile({
  title,
  value,
  icon,
  tone,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  tone: "neutral" | "accent" | "secondary" | "muted";
}) {
  const toneClasses =
    tone === "accent"
      ? "bg-accent text-accent-foreground border-accent"
      : tone === "secondary"
      ? "bg-secondary text-secondary-foreground border-secondary"
      : tone === "muted"
      ? "bg-card text-card-foreground border-input"
      : "bg-card text-card-foreground border-input";
  const iconTone =
    tone === "accent"
      ? "text-accent-foreground/80"
      : tone === "secondary"
      ? "text-secondary-foreground/80"
      : "text-muted-foreground";

  return (
    <Card className={`transition-shadow hover:shadow-sm ${toneClasses}`}>
      <CardContent className="flex items-center justify-between p-3 sm:p-4">
        <div>
          <div className="text-xs sm:text-sm">{title}</div>
          <div className="text-xl sm:text-2xl font-semibold">{value}</div>
        </div>
        <div className={iconTone}>{icon}</div>
      </CardContent>
    </Card>
  );
}