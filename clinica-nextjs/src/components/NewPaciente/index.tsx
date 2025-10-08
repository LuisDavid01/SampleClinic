"use client";

import { useState } from "react";
import { useApiClient, apiEndpoints } from "@/utils/apiClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, UserPlus, Save, X } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { CreatePacienteRequest } from "@/types/AdminPaciente";

interface PacienteFormData {
  nombre: string;
  apellido1: string;
  apellido2: string;
  fechaNacimiento: Date | null;
  telefonoPrincipal: string;
  telefonoSecundario: string;
  correoElectronico: string;
  direccionResidencia: string;
}

interface NewPacienteProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function NewPaciente({ onSuccess, onCancel }: NewPacienteProps) {
  const apiClient = useApiClient();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<PacienteFormData>({
    nombre: "",
    apellido1: "",
    apellido2: "",
    fechaNacimiento: null,
    telefonoPrincipal: "",
    telefonoSecundario: "",
    correoElectronico: "",
    direccionResidencia: "",
  });

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validaciones requeridas
    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es requerido";
    } else if (formData.nombre.trim().length < 2) {
      newErrors.nombre = "El nombre debe tener al menos 2 caracteres";
    } else if (formData.nombre.trim().length > 100) {
      newErrors.nombre = "El nombre no puede exceder 100 caracteres";
    }

    if (!formData.apellido1.trim()) {
      newErrors.apellido1 = "El primer apellido es requerido";
    } else if (formData.apellido1.trim().length < 2) {
      newErrors.apellido1 = "El primer apellido debe tener al menos 2 caracteres";
    } else if (formData.apellido1.trim().length > 100) {
      newErrors.apellido1 = "El primer apellido no puede exceder 100 caracteres";
    }

    if (formData.apellido2 && formData.apellido2.trim().length > 100) {
      newErrors.apellido2 = "El segundo apellido no puede exceder 100 caracteres";
    }

    if (!formData.correoElectronico.trim()) {
      newErrors.correoElectronico = "El correo electrónico es requerido";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correoElectronico)) {
      newErrors.correoElectronico = "El formato del correo electrónico no es válido";
    } else if (formData.correoElectronico.trim().length > 150) {
      newErrors.correoElectronico = "El correo electrónico no puede exceder 150 caracteres";
    }

    if (!formData.telefonoPrincipal.trim()) {
      newErrors.telefonoPrincipal = "El teléfono principal es requerido";
    } else if (formData.telefonoPrincipal.trim().length < 5) {
      newErrors.telefonoPrincipal = "El teléfono debe tener al menos 5 caracteres";
    } else if (formData.telefonoPrincipal.trim().length > 20) {
      newErrors.telefonoPrincipal = "El teléfono principal no puede exceder 20 caracteres";
    } else {
      // Validar que el teléfono contenga solo números y caracteres válidos
      const phoneRegex = /^[\d\s\+\-\(\)]+$/;
      if (!phoneRegex.test(formData.telefonoPrincipal.trim())) {
        newErrors.telefonoPrincipal = "El teléfono solo puede contener números, espacios, +, -, ( y )";
      }
    }

    if (formData.telefonoSecundario && formData.telefonoSecundario.trim().length > 20) {
      newErrors.telefonoSecundario = "El teléfono secundario no puede exceder 20 caracteres";
    } else if (formData.telefonoSecundario && formData.telefonoSecundario.trim()) {
      const phoneRegex = /^[\d\s\+\-\(\)]+$/;
      if (!phoneRegex.test(formData.telefonoSecundario.trim())) {
        newErrors.telefonoSecundario = "El teléfono secundario solo puede contener números, espacios, +, -, ( y )";
      }
    }

    if (formData.direccionResidencia && formData.direccionResidencia.trim().length > 255) {
      newErrors.direccionResidencia = "La dirección no puede exceder 255 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const pacienteData = {
        nombre: formData.nombre.trim(),
        apellido1: formData.apellido1.trim(),
        apellido2: formData.apellido2.trim(),
        fechaNacimiento: formData.fechaNacimiento?.toISOString().split('T')[0],
        telefonoPrincipal: formData.telefonoPrincipal.trim(),
        telefonoSecundario: formData.telefonoSecundario.trim() || null,
        correoElectronico: formData.correoElectronico.trim(),
        direccionResidencia: formData.direccionResidencia.trim() || null,
        idRol: 4, // Rol de paciente
        activo: true
      };

      console.log("📝 Creando nuevo paciente:", pacienteData);

      const response = await apiClient.post(apiEndpoints.createUsuario(), pacienteData);
      
      console.log("✅ Paciente creado exitosamente:", response);

      // Limpiar formulario
      setFormData({
        nombre: "",
        apellido1: "",
        apellido2: "",
        fechaNacimiento: null,
        telefonoPrincipal: "",
        telefonoSecundario: "",
        correoElectronico: "",
        direccionResidencia: "",
      });

      onSuccess?.();
    } catch (error) {
      console.error("❌ Error creando paciente:", error);
      
      if (error instanceof Error) {
        if (error.message.includes("409")) {
          setErrors({ correoElectronico: "Ya existe un usuario con este correo electrónico" });
        } else {
          setErrors({ general: "Error al crear el paciente. Por favor, intenta de nuevo." });
        }
      } else {
        setErrors({ general: "Error inesperado. Por favor, intenta de nuevo." });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof PacienteFormData, value: string | Date | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Validaciones en tiempo real para teléfonos
    if (field === 'telefonoPrincipal' && typeof value === 'string') {
      const phoneRegex = /^[\d\s\+\-\(\)]*$/;
      if (value && !phoneRegex.test(value)) {
        setErrors(prev => ({ ...prev, [field]: "Solo se permiten números, espacios, +, -, ( y )" }));
        return;
      }
    }
    
    if (field === 'telefonoSecundario' && typeof value === 'string') {
      const phoneRegex = /^[\d\s\+\-\(\)]*$/;
      if (value && !phoneRegex.test(value)) {
        setErrors(prev => ({ ...prev, [field]: "Solo se permiten números, espacios, +, -, ( y )" }));
        return;
      }
    }
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleBlur = (field: keyof PacienteFormData) => {
    const value = formData[field];
    
    // Validaciones para nombre y apellidos (solo letras)
    if ((field === 'nombre' || field === 'apellido1' || field === 'apellido2') && typeof value === 'string') {
      const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]*$/;
      if (value && !nameRegex.test(value)) {
        setErrors(prev => ({ ...prev, [field]: "Solo se permiten letras y espacios" }));
      } else if (value && value.trim().length > 0) {
        // Limpiar error si el campo es válido
        setErrors(prev => ({ ...prev, [field]: "" }));
      }
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-primary" />
          Registro de Nuevo Paciente
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.general && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
              {errors.general}
            </div>
          )}

          {/* Información Personal */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Información Personal</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre *</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => handleInputChange("nombre", e.target.value)}
                  onBlur={() => handleBlur("nombre")}
                  placeholder="Ingrese el nombre (solo letras)"
                  className={errors.nombre ? "border-red-500" : ""}
                />
                {errors.nombre && (
                  <p className="text-sm text-red-600">{errors.nombre}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="apellido1">Primer Apellido *</Label>
                <Input
                  id="apellido1"
                  value={formData.apellido1}
                  onChange={(e) => handleInputChange("apellido1", e.target.value)}
                  onBlur={() => handleBlur("apellido1")}
                  placeholder="Ingrese el primer apellido (solo letras)"
                  className={errors.apellido1 ? "border-red-500" : ""}
                />
                {errors.apellido1 && (
                  <p className="text-sm text-red-600">{errors.apellido1}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="apellido2">Segundo Apellido</Label>
                <Input
                  id="apellido2"
                  value={formData.apellido2}
                  onChange={(e) => handleInputChange("apellido2", e.target.value)}
                  onBlur={() => handleBlur("apellido2")}
                  placeholder="Ingrese el segundo apellido (opcional - solo letras)"
                  className={errors.apellido2 ? "border-red-500" : ""}
                />
                {errors.apellido2 && (
                  <p className="text-sm text-red-600">{errors.apellido2}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="fechaNacimiento">Fecha de Nacimiento</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.fechaNacimiento && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.fechaNacimiento ? (
                        format(formData.fechaNacimiento, "PPP", { locale: es })
                      ) : (
                        <span>Seleccionar fecha</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.fechaNacimiento || undefined}
                      onSelect={(date) => handleInputChange("fechaNacimiento", date || null)}
                      initialFocus
                      locale={es}
                      showOutsideDays={false}
                      fixedWeeks
                      captionLayout="dropdown"
                      fromYear={1900}
                      toYear={new Date().getFullYear()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          {/* Información de Contacto */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Información de Contacto</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="correoElectronico">Correo Electrónico *</Label>
                <Input
                  id="correoElectronico"
                  type="email"
                  value={formData.correoElectronico}
                  onChange={(e) => handleInputChange("correoElectronico", e.target.value)}
                  placeholder="ejemplo@correo.com"
                  className={errors.correoElectronico ? "border-red-500" : ""}
                />
                {errors.correoElectronico && (
                  <p className="text-sm text-red-600">{errors.correoElectronico}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefonoPrincipal">Teléfono Principal *</Label>
                <Input
                  id="telefonoPrincipal"
                  value={formData.telefonoPrincipal}
                  onChange={(e) => handleInputChange("telefonoPrincipal", e.target.value)}
                  placeholder="+506 8888-8888 (solo números, espacios, +, -, ( y ))"
                  className={errors.telefonoPrincipal ? "border-red-500" : ""}
                  maxLength={20}
                />
                {errors.telefonoPrincipal && (
                  <p className="text-sm text-red-600">{errors.telefonoPrincipal}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefonoSecundario">Teléfono Secundario</Label>
                <Input
                  id="telefonoSecundario"
                  value={formData.telefonoSecundario}
                  onChange={(e) => handleInputChange("telefonoSecundario", e.target.value)}
                  placeholder="+506 8888-8889 (opcional - solo números, espacios, +, -, ( y ))"
                  className={errors.telefonoSecundario ? "border-red-500" : ""}
                  maxLength={20}
                />
                {errors.telefonoSecundario && (
                  <p className="text-sm text-red-600">{errors.telefonoSecundario}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="direccionResidencia">Dirección de Residencia</Label>
                <Textarea
                  id="direccionResidencia"
                  value={formData.direccionResidencia}
                  onChange={(e) => handleInputChange("direccionResidencia", e.target.value)}
                  placeholder="Dirección completa (opcional)"
                  rows={2}
                />
              </div>
            </div>
          </div>


          {/* Botones de Acción */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Crear Paciente
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
