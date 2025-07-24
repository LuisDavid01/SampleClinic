import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
export default async function AdminDashboard() {
  
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Welcome to your admin dashboard</p>
          </div>

          {/* Notification Banner */}
          <div className="mb-8 p-4 bg-primary/10 border border-primary/20 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-primary">
                  New: Realtime Colors now has templates available! Have a cool template idea?
                </p>
              </div>
              <Button size="sm" variant="outline" className="text-primary border-primary hover:bg-primary hover:text-primary-foreground">
                Submit it!
              </Button>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-card/50 border-primary/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">New users</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">150,040</div>
                <div className="flex items-center text-xs text-primary">
                  <TrendingUp className="mr-1 h-3 w-3" />
                  +40%
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-primary/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">New messages</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">300</div>
                <div className="flex items-center text-xs text-primary">
                  <TrendingUp className="mr-1 h-3 w-3" />
                  +30%
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-primary/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sales</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$2,340</div>
                <div className="flex items-center text-xs text-primary">
                  <TrendingUp className="mr-1 h-3 w-3" />
                  +25%
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-primary/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conversion rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">42%</div>
                <div className="flex items-center text-xs text-primary">
                  <TrendingUp className="mr-1 h-3 w-3" />
                  +12%
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chart and Info Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Page Views Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Page views / Revenue
                  <Button variant="ghost" size="sm">
                    <Menu className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-32 flex items-end justify-between px-4">
                  {[60, 80, 40, 100, 70, 90, 45, 85, 60, 95].map((height, i) => (
                    <div
                      key={i}
                      className="bg-primary w-4 rounded-t"
                      style={{ height: `${height}%` }}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Tickets */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Recent tickets
                  <Button variant="ghost" size="sm">
                    <Menu className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Add custom exports</span>
                  <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">Released</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Add more templates</span>
                  <span className="text-xs bg-secondary/20 text-secondary px-2 py-1 rounded">In progress</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">More accessibility options</span>
                  <span className="text-xs bg-secondary/20 text-secondary px-2 py-1 rounded">In progress</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Top categories
                <Button variant="ghost" size="sm">
                  <Menu className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border border-border rounded-lg">
                  <div className="font-medium">Development</div>
                </div>
                <div className="p-4 border border-border rounded-lg">
                  <div className="font-medium">Web Design</div>
                </div>
                <div className="p-4 border border-border rounded-lg">
                  <div className="font-medium">Graphic Design</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
    </div>
  );
}
