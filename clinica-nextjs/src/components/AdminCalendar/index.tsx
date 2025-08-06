"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Plus, Search, Calendar, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar"
// Sample appointment data
const sampleAppointments = [
  {
    id: 1,
    patientName: "Isagi Yoichi",
    time: "10:00 am - 11:00 am",
    date: new Date(2025, 0, 3), // January 3, 2025
    avatar: "/placeholder.svg?height=32&width=32",
    type: "Consulta General",
    status: "confirmed",
  },
  {
    id: 2,
    patientName: "Nagi Seishiro",
    time: "10:00 am - 11:00 am",
    date: new Date(2025, 0, 4),
    avatar: "/placeholder.svg?height=32&width=32",
    type: "Seguimiento",
    status: "pending",
  },
  {
    id: 3,
    patientName: "Kaiser Brown",
    time: "10:00 am - 11:00 am",
    date: new Date(2025, 0, 6),
    avatar: "/placeholder.svg?height=32&width=32",
    type: "Tratamiento",
    status: "confirmed",
  },
  {
    id: 4,
    patientName: "Alexandro Bernard",
    time: "10:00 am - 11:00 am",
    date: new Date(2025, 0, 13),
    avatar: "/placeholder.svg?height=32&width=32",
    type: "Consulta",
    status: "confirmed",
  },
  {
    id: 5,
    patientName: "Romanov Ey Betty",
    time: "10:00 am - 11:00 am",
    date: new Date(2025, 0, 17),
    avatar: "/placeholder.svg?height=32&width=32",
    type: "Revisión",
    status: "confirmed",
  },
  {
    id: 6,
    patientName: "Kitty Lily",
    time: "10:00 am - 11:00 am",
    date: new Date(2025, 0, 18),
    avatar: "/placeholder.svg?height=32&width=32",
    type: "Consulta",
    status: "confirmed",
  },
  {
    id: 7,
    patientName: "Lily Alexa",
    time: "10:00 am - 11:00 am",
    date: new Date(2025, 0, 21),
    avatar: "/placeholder.svg?height=32&width=32",
    type: "Tratamiento",
    status: "confirmed",
  },
  {
    id: 8,
    patientName: "Shaaa Brown",
    time: "10:00 am - 11:00 am",
    date: new Date(2025, 0, 24),
    avatar: "/placeholder.svg?height=32&width=32",
    type: "Seguimiento",
    status: "confirmed",
  },
  {
    id: 9,
    patientName: "Ahmed Lali",
    time: "10:00 am - 11:00 am",
    date: new Date(2025, 0, 27),
    avatar: "/placeholder.svg?height=32&width=32",
    type: "Consulta",
    status: "pending",
  },
  {
    id: 10,
    patientName: "Budiman Dio Salmon",
    time: "10:00 am - 11:00 am",
    date: new Date(2025, 0, 31),
    avatar: "/placeholder.svg?height=32&width=32",
    type: "Revisión",
    status: "confirmed",
  },
]

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

export default function AppointmentCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 0, 1)) // January 2025
  const [viewType, setViewType] = useState<"week" | "month">("month")
  const [searchTerm, setSearchTerm] = useState("")

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days: { date: Date; isCurrentMonth: boolean }[] = []

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

  const getAppointmentsForDate = (date: Date) => {
    return sampleAppointments.filter((appointment) => appointment.date.toDateString() === date.toDateString())
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
  const totalAppointments = sampleAppointments.length
  const todayAppointments = getAppointmentsForDate(new Date()).length

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
                <p className="text-2xl font-bold text-text-primary">{totalAppointments}</p>
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
                <p className="text-2xl font-bold text-text-primary">{todayAppointments}</p>
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
                <p className="text-2xl font-bold text-text-primary">
                  {sampleAppointments.filter((apt) => apt.date.getMonth() === currentDate.getMonth()).length}
                </p>
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
              const appointments = getAppointmentsForDate(day.date)
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

                  <div className="space-y-1">
                    {appointments.slice(0, 2).map((appointment) => (
                      <div key={appointment.id} className="rounded-md bg-primary/10 p-1 text-xs">
                        <div className="flex items-center gap-1">
                          <Avatar className="h-4 w-4">
                            <AvatarImage src={appointment.avatar || "/placeholder.svg"} />
                            <AvatarFallback className="text-xs">
                              {appointment.patientName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <span className="truncate text-text-primary">{appointment.patientName}</span>
                        </div>
                        <div className="mt-1 text-muted-foreground">{appointment.time.split(" - ")[0]}</div>
                      </div>
                    ))}
                    {appointments.length > 2 && (
                      <div className="text-xs text-muted-foreground">+{appointments.length - 2} more</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </div>
    </div>
  )
}
