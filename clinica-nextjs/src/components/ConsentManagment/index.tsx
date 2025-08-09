"use client"

import { useState, useRef, useCallback, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Search, Plus,Filter,  FileText, Download, Edit, Trash2, Eye, Upload, PenTool, CalendarIcon, Check, ChevronsUpDown, X, 
     ChevronRight,
   ChevronLeft,
   ChevronsLeft,
   ChevronsRight, Clock, CheckCircle, XCircle, Archive, User, Stethoscope, FileSignature } from 'lucide-react'
import { format } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"


// Mock data
const mockConsentimientos = [
  {
    id: 1,
    paciente: {
      id: "PAT-001",
      nombre: "Juan Pérez Rodríguez",
      cedula: "1-2345-6789",
      telefono: "+506 8888-8888"
    },
    tratamiento: {
      tipo: "Cirugía General",
      descripcion: "Apendicectomía laparoscópica",
      codigo: "SURG-001"
    },
    estado: "firmado",
    fechaCreacion: new Date('2025-08-01T10:00:00'),
    fechaFirma: new Date('2025-08-01T14:30:00'),
    doctorResponsable: {
      nombre: "Dr. Carlos Mendoza",
      especialidad: "Cirujano General"
    },
    documento: {
      tipo: "digital",
      archivo: "consentimiento_001.pdf",
      firmaDigital: true
    },
    notas: "Paciente informado sobre riesgos y beneficios del procedimiento",
    vencimiento: new Date('2025-12-01T00:00:00')
  },
  {
    id: 2,
    paciente: {
      id: "PAT-002",
      nombre: "Juan Pérez Rodríguez",
      cedula: "2-3456-7890",
      telefono: "+506 7777-7777"
    },
    tratamiento: {
      tipo: "Dislocación de hombro",
      descripcion: "lesion severa",
      codigo: "DENT-005"
    },
    estado: "pendiente",
    fechaCreacion: new Date('2025-08-06T09:00:00'),
    fechaFirma: null,
    doctorResponsable: {
      nombre: "Juan Domingo",
      especialidad: "Fisioterapia"
    },
    documento: {
      tipo: "pendiente",
      archivo: null,
      firmaDigital: false
    },
    notas: "Pendiente de explicación de procedimiento",
    vencimiento: new Date('2025-08-13T00:00:00')
  },
  {
    id: 3,
    paciente: {
      id: "PAT-003",
      nombre: "Juan Pérez Rodríguez",
      cedula: "3-4567-8901",
      telefono: "+506 6666-6666"
    },
    tratamiento: {
      tipo: "Anestesia",
      descripcion: "Anestesia general para cirugía ortopédica",
      codigo: "ANES-002"
    },
    estado: "vencido",
    fechaCreacion: new Date('2025-07-15T11:00:00'),
    fechaFirma: null,
    doctorResponsable: {
      nombre: "Dr. Luis Ramírez",
      especialidad: "Anestesiología"
    },
    documento: {
      tipo: "pendiente",
      archivo: null,
      firmaDigital: false
    },
    notas: "Consentimiento vencido - requiere renovación",
    vencimiento: new Date('2025-08-05T00:00:00')
  }
]

const mockPacientes = [
  { id: "PAT-001", nombre: "Juan Pérez Rodríguez", cedula: "1-2345-6789" },
  { id: "PAT-002", nombre: "María González López", cedula: "2-3456-7890" },
  { id: "PAT-003", nombre: "Pedro Jiménez Castro", cedula: "3-4567-8901" },
  { id: "PAT-004", nombre: "Ana Morales Vega", cedula: "4-5678-9012" },
  { id: "PAT-005", nombre: "Carlos Herrera Soto", cedula: "5-6789-0123" }
]

const tiposTratamiento = [
  { codigo: "SURG-001", tipo: "Cirugía General", descripcion: "Procedimientos quirúrgicos generales" },
  { codigo: "DENT-005", tipo: "Procedimiento Dental", descripcion: "Tratamientos odontológicos" },
  { codigo: "ANES-002", tipo: "Anestesia", descripcion: "Procedimientos anestésicos" },
  { codigo: "ONCO-001", tipo: "Tratamiento Oncológico", descripcion: "Tratamientos contra el cáncer" },
  { codigo: "CARD-003", tipo: "Procedimiento Cardiológico", descripcion: "Intervenciones cardíacas" }
]

const doctores = [
  { nombre: "Dr. Carlos Mendoza", especialidad: "Cirujano General" },
  { nombre: "Dra. Ana Vargas", especialidad: "Odontología" },
  { nombre: "Dr. Luis Ramírez", especialidad: "Anestesiología" },
  { nombre: "Dra. Patricia Solís", especialidad: "Oncología" },
  { nombre: "Dr. Roberto Castro", especialidad: "Cardiología" }
]

// Signature Canvas Component
const SignatureCanvas = ({ onSave, onClear }: { onSave: (signature: string) => void, onClear: () => void }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSignature, setHasSignature] = useState(false)

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true)
    setHasSignature(true)
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.beginPath()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    ctx.moveTo(clientX - rect.left, clientY - rect.top)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    ctx.lineTo(clientX - rect.left, clientY - rect.top)
    ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasSignature(false)
    onClear()
  }

  const saveSignature = () => {
    const canvas = canvasRef.current
    if (!canvas || !hasSignature) return
    const dataURL = canvas.toDataURL()
    onSave(dataURL)
  }

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-input rounded-lg p-4">
        <canvas
          ref={canvasRef}
          width={400}
          height={200}
          className="w-full h-48 border border-input rounded cursor-crosshair touch-none"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        <p className="text-sm text-muted-foreground mt-2 text-center">
          Firme en el área de arriba usando el mouse o su dedo
        </p>
      </div>
      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={clearCanvas}>
          <X className="w-4 h-4 mr-2" />
          Limpiar
        </Button>
        <Button onClick={saveSignature} disabled={!hasSignature}>
          <Check className="w-4 h-4 mr-2" />
          Guardar Firma
        </Button>
      </div>
    </div>
  )
}

// File Upload Component
const FileUpload = ({ onFileSelect }: { onFileSelect: (file: File) => void }) => {
  const [dragActive, setDragActive] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleFile = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      alert("El archivo es demasiado grande. Máximo 10MB.")
      return
    }
    
    if (!['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)) {
      alert("Formato no válido. Solo PDF, JPG y PNG.")
      return
    }

    setIsUploading(true)
    // Simulate upload progress
    let progress = 0
    const interval = setInterval(() => {
      progress += 10
      setUploadProgress(progress)
      if (progress >= 100) {
        clearInterval(interval)
        setIsUploading(false)
        setUploadProgress(0)
        onFileSelect(file)
      }
    }, 100)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive 
            ? 'border-primary bg-primary/5' 
            : 'border-input hover:border-primary/50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-lg font-medium mb-2">Arrastra tu archivo aquí</p>
        <p className="text-sm text-muted-foreground mb-4">
          o haz clic para seleccionar
        </p>
        <Button 
          variant="outline" 
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          Seleccionar Archivo
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileInput}
        />
        <p className="text-xs text-muted-foreground mt-4">
          Formatos: PDF, JPG, PNG • Máximo: 10MB
        </p>
      </div>
      
      {isUploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subiendo archivo...</span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} />
        </div>
      )}
    </div>
  )
}

export default function ConsentManagement() {
  const [consentimientos, setConsentimientos] = useState(mockConsentimientos)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("todos")
  const [treatmentFilter, setTreatmentFilter] = useState("todos")
  const [isNewConsentDialogOpen, setIsNewConsentDialogOpen] = useState(false)
  const [selectedConsent, setSelectedConsent] = useState<any>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  
  // New consent form state
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedPatient, setSelectedPatient] = useState<any>(null)
  const [selectedTreatment, setSelectedTreatment] = useState<any>(null)
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null)
  const [consentMethod, setConsentMethod] = useState("upload")
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [signature, setSignature] = useState<string | null>(null)
  const [notes, setNotes] = useState("")
  const [expirationDate, setExpirationDate] = useState<Date>()
  const [isPatientComboOpen, setIsPatientComboOpen] = useState(false)

  // Filter and search logic
  const filteredConsentimientos = useMemo(() => {
    return consentimientos.filter(consent => {
      const matchesSearch = consent.paciente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           consent.paciente.cedula.includes(searchTerm) ||
                           consent.tratamiento.tipo.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === "todos" || consent.estado === statusFilter
      
      const matchesTreatment = treatmentFilter === "todos" || 
                              consent.tratamiento.tipo.toLowerCase().includes(treatmentFilter.toLowerCase())
      
      return matchesSearch && matchesStatus && matchesTreatment
    })
  }, [consentimientos, searchTerm, statusFilter, treatmentFilter])

  // Status badge styling
  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case 'firmado':
        return <Badge className="bg-primary text-primary-foreground"><CheckCircle className="w-3 h-3 mr-1" />Firmado</Badge>
      case 'pendiente':
        return <Badge className="bg-secondary-button text-text-primary"><Clock className="w-3 h-3 mr-1" />Pendiente</Badge>
      case 'vencido':
        return <Badge variant="destructive" ><XCircle className="w-3 h-3 mr-1" />Vencido</Badge>
      case 'archivado':
        return <Badge variant="secondary"><Archive className="w-3 h-3 mr-1" />Archivado</Badge>
      default:
        return <Badge variant="outline">{estado}</Badge>
    }
  }

  // Reset form
  const resetForm = () => {
    setCurrentStep(1)
    setSelectedPatient(null)
    setSelectedTreatment(null)
    setSelectedDoctor(null)
    setConsentMethod("upload")
    setUploadedFile(null)
    setSignature(null)
    setNotes("")
    setExpirationDate(undefined)
  }

  // Handle form submission
  const handleSubmitConsent = () => {
    if (!selectedPatient || !selectedTreatment || !selectedDoctor) return
    alert('se ha subido el documento')
    setIsNewConsentDialogOpen(false)
    resetForm()
  }

  // Stats calculation
  const stats = useMemo(() => {
    const total = consentimientos.length
    const firmados = consentimientos.filter(c => c.estado === 'firmado').length
    const pendientes = consentimientos.filter(c => c.estado === 'pendiente').length
    const vencidos = consentimientos.filter(c => c.estado === 'vencido').length
    
    return { total, firmados, pendientes, vencidos }
  }, [consentimientos])

  return (
     <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
         
          <Dialog open={isNewConsentDialogOpen} onOpenChange={setIsNewConsentDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 cursor-pointer">
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Consentimiento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Crear Nuevo Consentimiento</DialogTitle>
              </DialogHeader>
              
              {/* Step indicator */}
              <div className="flex items-center justify-center space-x-4 mb-6">
                {[1, 2, 3, 4].map((step) => (
                  <div key={step} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      currentStep >= step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}>
                      {step}
                    </div>
                    {step < 4 && <div className={`w-12 h-0.5 ${currentStep > step ? 'bg-primary' : 'bg-muted'}`} />}
                  </div>
                ))}
              </div>

              {/* Step 1: Patient Selection */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Paso 1: Seleccionar Paciente</h3>
                  <div className="space-y-2">
                    <Label>Paciente</Label>
                    <Popover open={isPatientComboOpen} onOpenChange={setIsPatientComboOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={isPatientComboOpen}
                          className="w-full justify-between"
                        >
                          {selectedPatient ? selectedPatient.nombre : "Seleccionar paciente..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Buscar paciente..." />
                          <CommandList>
                            <CommandEmpty>No se encontró el paciente.</CommandEmpty>
                            <CommandGroup>
                              {mockPacientes.map((paciente) => (
                                <CommandItem
                                  key={paciente.id}
                                  value={paciente.nombre}
                                  onSelect={() => {
                                    setSelectedPatient(paciente)
                                    setIsPatientComboOpen(false)
                                  }}
                                >
                                  <Check
                                    className={`mr-2 h-4 w-4 ${
                                      selectedPatient?.id === paciente.id ? "opacity-100" : "opacity-0"
                                    }`}
                                  />
                                  <div>
                                    <p className="font-medium">{paciente.nombre}</p>
                                    <p className="text-sm ">{paciente.cedula}</p>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="flex justify-end">
                    <Button 
                      onClick={() => setCurrentStep(2)} 
                      disabled={!selectedPatient}
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Treatment Selection */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Paso 2: Seleccionar Tratamiento</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Tipo de Tratamiento</Label>
                      <Select onValueChange={(value) => {
                        const treatment = tiposTratamiento.find(t => t.codigo === value)
                        setSelectedTreatment(treatment)
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar tratamiento" />
                        </SelectTrigger>
                        <SelectContent>
                          {tiposTratamiento.map((tratamiento) => (
                            <SelectItem key={tratamiento.codigo} value={tratamiento.codigo}>
                              <div>
                                <p className="font-medium">{tratamiento.tipo}</p>
                                <p className="text-sm ">{tratamiento.descripcion}</p>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Doctor Responsable</Label>
                      <Select onValueChange={(value) => {
                        const doctor = doctores.find(d => d.nombre === value)
                        setSelectedDoctor(doctor)
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar doctor" />
                        </SelectTrigger>
                        <SelectContent>
                          {doctores.map((doctor) => (
                            <SelectItem key={doctor.nombre} value={doctor.nombre}>
                              <div>
                                <p className="font-medium">{doctor.nombre}</p>
                                <p className="text-sm ">{doctor.especialidad}</p>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Fecha de Vencimiento</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {expirationDate ? format(expirationDate, "PPP", { locale: es }) : "Seleccionar fecha"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={expirationDate}
                          onSelect={setExpirationDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setCurrentStep(1)}>
                      Anterior
                    </Button>
                    <Button 
                      onClick={() => setCurrentStep(3)} 
                      disabled={!selectedTreatment || !selectedDoctor}
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Document/Signature */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Paso 3: Documento o Firma</h3>
                  <Tabs value={consentMethod} onValueChange={setConsentMethod}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="upload">Cargar Documento</TabsTrigger>
                      <TabsTrigger value="signature">Firmar Digitalmente</TabsTrigger>
                    </TabsList>
                    <TabsContent value="upload" className="space-y-4">
                      <FileUpload onFileSelect={setUploadedFile} />
                      {uploadedFile && (
                        <Alert>
                          <FileText className="h-4 w-4" />
                          <AlertDescription>
                            Archivo cargado: {uploadedFile.name}
                          </AlertDescription>
                        </Alert>
                      )}
                    </TabsContent>
                    <TabsContent value="signature" className="space-y-4">
                      <SignatureCanvas 
                        onSave={setSignature} 
                        onClear={() => setSignature(null)} 
                      />
                      {signature && (
                        <Alert>
                          <PenTool className="h-4 w-4" />
                          <AlertDescription>
                            Firma digital guardada correctamente
                          </AlertDescription>
                        </Alert>
                      )}
                    </TabsContent>
                  </Tabs>
                  <div className="space-y-2">
                    <Label>Notas Adicionales</Label>
                    <Textarea 
                      placeholder="Observaciones sobre el consentimiento..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setCurrentStep(2)}>
                      Anterior
                    </Button>
                    <Button 
                      onClick={() => setCurrentStep(4)} 
                      disabled={!uploadedFile && !signature}
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 4: Review */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Paso 4: Revisión y Confirmación</h3>
                  <Card>
                    <CardContent className="p-6 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-sm text-muted-foreground">PACIENTE</h4>
                          <p className="font-medium">{selectedPatient?.nombre}</p>
                          <p className="text-sm text-muted-foreground">{selectedPatient?.cedula}</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-sm text-muted-foreground">TRATAMIENTO</h4>
                          <p className="font-medium">{selectedTreatment?.tipo}</p>
                          <p className="text-sm text-muted-foreground">{selectedTreatment?.descripcion}</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-sm text-muted-foreground">DOCTOR RESPONSABLE</h4>
                          <p className="font-medium">{selectedDoctor?.nombre}</p>
                          <p className="text-sm text-muted-foreground">{selectedDoctor?.especialidad}</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-sm text-muted-foreground">VENCIMIENTO</h4>
                          <p className="font-medium">
                            {expirationDate ? format(expirationDate, "PPP", { locale: es }) : "90 días (por defecto)"}
                          </p>
                        </div>
                      </div>
                      <Separator />
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground mb-2">DOCUMENTO</h4>
                        {uploadedFile && (
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            <span>{uploadedFile.name}</span>
                          </div>
                        )}
                        {signature && (
                          <div className="flex items-center gap-2">
                            <PenTool className="w-4 h-4" />
                            <span>Firma digital capturada</span>
                          </div>
                        )}
                      </div>
                      {notes && (
                        <div>
                          <h4 className="font-medium text-sm text-muted-foreground mb-2">NOTAS</h4>
                          <p className="text-sm">{notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setCurrentStep(3)}>
                      Anterior
                    </Button>
                    <Button onClick={handleSubmitConsent}>
                      <FileSignature className="w-4 h-4 mr-2" />
                      Crear Consentimiento
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>

        

        {/* Filters and Search */}
<Card>
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <Filter className="w-5 h-5" />
      Filtros y Búsqueda
    </CardTitle>
  </CardHeader>

  <CardContent className="p-6">
    <div className="flex flex-wrap gap-4">
      {/* Input de búsqueda */}
      <div className="w-full lg:flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground w-4 h-4" />
          <Input
            placeholder="Buscar por paciente, cédula o tratamiento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 bg-background border border-muted rounded-lg text-sm sm:text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors duration-200"
          />
        </div>
      </div>

      {/* Contenedor de selects */}
      <div className="flex flex-wrap gap-2 w-full lg:w-auto">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los estados</SelectItem>
            <SelectItem value="firmado">Firmados</SelectItem>
            <SelectItem value="pendiente">Pendientes</SelectItem>
            <SelectItem value="vencido">Vencidos</SelectItem>
          </SelectContent>
        </Select>

        <Select value={treatmentFilter} onValueChange={setTreatmentFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los tratamientos</SelectItem>
            <SelectItem value="cirugía">Cirugía General</SelectItem>
            <SelectItem value="dental">Procedimiento Dental</SelectItem>
            <SelectItem value="anestesia">Anestesia</SelectItem>
            <SelectItem value="oncológico">Tratamiento Oncológico</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  </CardContent>
</Card>
        {/* Consent List */}
        <div className="space-y-4">
          {filteredConsentimientos.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No se encontraron consentimientos</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || statusFilter !== "todos" || treatmentFilter !== "todos" 
                    ? "Intenta ajustar los filtros de búsqueda"
                    : "Comienza creando tu primer consentimiento informado"
                  }
                </p>
                {!searchTerm && statusFilter === "todos" && treatmentFilter === "todos" && (
                  <Button onClick={() => setIsNewConsentDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Crear Primer Consentimiento
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredConsentimientos.map((consent) => (
                            <div
                key={consent.id}
                className="border border-border rounded-lg p-4 bg-card hover:bg-muted-foreground/10 transition-colors"
              >
                {/* Encabezado */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-text-primary">
                      {consent.paciente.nombre}
                    </span>
                    {getStatusBadge(consent.estado)}
                  </div>

                  {/* Botones de acción */}
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      onClick={() => {
                        setSelectedConsent(consent)
                        setIsViewDialogOpen(true)
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Link href={`/admin/files/consent/${consent.id}`}>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 cursor-pointer"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-8 w-8 p-0 "
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Detalles */}
                <div className="text-sm text-text-primary space-y-1">
                  <p>
                    <span className="font-medium">Cédula:</span>{" "}
                    {consent.paciente.cedula}
                  </p>
                  <p>
                    <span className="font-medium">Tratamiento:</span>{" "}
                    {consent.tratamiento.tipo}
                  </p>
                  <p>
                    <span className="font-medium">Doctor:</span>{" "}
                    {consent.doctorResponsable.nombre}
                  </p>
                  <p>
                    <span className="font-medium">Creado:</span>{" "}
                    {format(consent.fechaCreacion, "dd 'de' MMMM 'de' yyyy", {
                      locale: es,
                    })}
                  </p>
                </div>
              </div>
            ))
          )}
          {/* Pagination */}
<Card>
  <CardContent className="p-4">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      
      {/* Selector de cantidad */}
      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-sm">
        <span className="text-muted-foreground">Mostrar</span>
        <Select defaultValue="10">
          <SelectTrigger className="w-20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="25">25</SelectItem>
            <SelectItem value="50">50</SelectItem>
            <SelectItem value="100">100</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-muted-foreground">
          de {2} registros
        </span>
      </div>

                {/* Controles de paginación */}
                <div className="flex items-center justify-center gap-1 sm:gap-2">
                  <Button variant="outline" size="icon" className="h-8 w-8" disabled>
                    <ChevronsLeft className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8" disabled>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>

                  <span className="text-sm px-2 sm:px-4">
                    Página 1 de 2
                  </span>

                  <Button variant="outline" size="icon" className="h-8 w-8" disabled>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8" disabled>
                    <ChevronsRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* View Consent Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detalles del Consentimiento</DialogTitle>
              <DialogDescription>
                Informacion detallada del consentimiento de los pacientes
              </DialogDescription>
            </DialogHeader>
            {selectedConsent && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Información del Paciente
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <span className="font-medium">Nombre:</span> {selectedConsent.paciente.nombre}
                      </div>
                      <div>
                        <span className="font-medium">Cédula:</span> {selectedConsent.paciente.cedula}
                      </div>
                      <div>
                        <span className="font-medium">Teléfono:</span> {selectedConsent.paciente.telefono}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Stethoscope className="w-5 h-5" />
                        Información del Tratamiento
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <span className="font-medium">Tipo:</span> {selectedConsent.tratamiento.tipo}
                      </div>
                      <div>
                        <span className="font-medium">Descripción:</span> {selectedConsent.tratamiento.descripcion}
                      </div>
                      <div>
                        <span className="font-medium">Código:</span> {selectedConsent.tratamiento.codigo}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Estado del Consentimiento</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Estado actual:</span>
                      {getStatusBadge(selectedConsent.estado)}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="font-medium">Fecha de creación:</span>
                        <p>{format(selectedConsent.fechaCreacion, "PPPp", { locale: es })}</p>
                      </div>
                      {selectedConsent.fechaFirma && (
                        <div>
                          <span className="font-medium">Fecha de firma:</span>
                          <p>{format(selectedConsent.fechaFirma, "PPPp", { locale: es })}</p>
                        </div>
                      )}
                      <div>
                        <span className="font-medium">Doctor responsable:</span>
                        <p>{selectedConsent.doctorResponsable.nombre}</p>
                        <p className="text-sm text-muted-foreground">{selectedConsent.doctorResponsable.especialidad}</p>
                      </div>
                      <div>
                        <span className="font-medium">Vencimiento:</span>
                        <p>{format(selectedConsent.vencimiento, "PPP", { locale: es })}</p>
                      </div>
                    </div>
                    {selectedConsent.notas && (
                      <div>
                        <span className="font-medium">Notas:</span>
                        <p className="mt-1 p-3 bg-muted rounded-md">{selectedConsent.notas}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="flex justify-end gap-2">
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Descargar PDF
                  </Button>
                  <Button variant="outline">
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

  )
}
