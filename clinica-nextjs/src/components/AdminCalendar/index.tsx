"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Plus, Search, Calendar, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"


export default function AdminCalendar() {

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewType, setViewType] = useState<"week" | "month">("month")
  const [searchTerm, setSearchTerm] = useState("")

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      const prevMonthDay = new Date(year, month, -startingDayOfWeek + i + 1)
      days.push({ date: prevMonthDay, isCurrentMonth: false })
    }

    // Add days of the current month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({ date: new Date(year, month, day), isCurrentMonth: true })
    }

    // Add empty cells to complete the grid (42 cells total for 6 weeks)
    const remainingCells = 42 - days.length
    for (let i = 1; i <= remainingCells; i++) {
      const nextMonthDay = new Date(year, month + 1, i)
      days.push({ date: nextMonthDay, isCurrentMonth: false })
    }

    return days
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const days = getDaysInMonth(currentDate)
return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary md:text-3xl">Appointments</h1>
            <p className="text-sm text-muted-foreground">Here is the latest update for the last 7 days, check now</p>
          </div>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 md:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            New Appointment
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <Card className="bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Appointments</p>
                <p className="text-2xl font-bold text-text-primary">0</p>
              </div>
            </div>
          </Card>
          <Card className="bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-text-accent/10 p-2">
                <Users className="h-5 w-5 text-text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Today's Appointments</p>
                <p className="text-2xl font-bold text-text-primary">0</p>
              </div>
            </div>
          </Card>
          <Card className="bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-complementario/10 p-2">
                <Calendar className="h-5 w-5 text-complementario" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold text-text-primary">0</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Controls */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="text-primary bg-transparent">
              <Users className="mr-2 h-4 w-4" />
              All Appointments
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search anything here"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 md:w-64"
              />
            </div>
            <select
              value={viewType}
              onChange={(e) => setViewType(e.target.value as "week" | "month")}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="week">Week</option>
              <option value="month">Month</option>
            </select>
          </div>
        </div>

        {/* Calendar Navigation */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-lg font-semibold text-text-primary">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Showing {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </p>
        </div>

        {/* Calendar Grid */}
        <Card className="bg-card p-4 md:p-6">
          {/* Day Headers */}
          <div className="mb-4 grid grid-cols-7 gap-2">
            {dayNames.map((day) => (
              <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-2">
            {days.map((day, index) => {
              const isToday = day.date.toDateString() === new Date().toDateString()

              return (
                <div
                  key={index}
                  className={`min-h-[100px] rounded-lg border p-2 transition-colors hover:bg-muted/50 md:min-h-[120px] ${
                    day.isCurrentMonth ? "bg-background" : "bg-muted/20"
                  } ${isToday ? "border-primary bg-primary/5" : "border-border"}`}
                >
                  <div
                    className={`mb-2 text-sm font-medium ${
                      day.isCurrentMonth ? "text-text-primary" : "text-muted-foreground"
                    } ${isToday ? "text-primary" : ""}`}
                  >
                    {day.date.getDate()}
                  </div>

                  {/* Empty space for future appointments */}
                  <div className="space-y-1">{/* No appointments to display */}</div>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Empty State Message */}
        <div className="mt-8 text-center">
          <div className="mx-auto max-w-md">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-text-primary mb-2">No appointments scheduled</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Get started by creating your first appointment. Click the "New Appointment" button to begin.
            </p>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Schedule First Appointment
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

