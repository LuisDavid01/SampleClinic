import { redirect } from "next/navigation";
import { checkRole } from "@/utils/roles";
import { clerkClient } from "@clerk/nextjs/server";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  User,
  MessageSquare,
  DollarSign,
  TrendingUp,
  BarChart3,
  Settings,
  Inbox,
  Palette,
  Target,
  Menu,
  X
} from "lucide-react";
export default async function AdminDashboard(params: {
  searchParams: Promise<{ search?: string }>;
}) {
  if (!checkRole("admin")) {
    redirect("/");
  }

  const query = (await params.searchParams).search;

  const client = await clerkClient();

  const users = query ? (await client.users.getUserList({ query })).data : [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <h1 className="text-6xl text-center text-text-primary"> este es el layout de admin</h1>
    </div>
  );
}
