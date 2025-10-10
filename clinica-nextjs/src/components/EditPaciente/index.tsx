"use client";

import { useState, useEffect } from "react";
import { useApiClient, apiEndpoints } from "@/utils/apiClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Save, X, User, Mail, Phone, MapPin, Calendar as CalendarIcon2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { AdminPaciente } from "@/types/AdminPaciente";

interface EditPacienteProps {
  paciente: AdminPaciente;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function EditPaciente({ paciente, onSuccess, onCancel }: EditPacienteProps) {
  const apiClient = useApiClient();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    nombre: paciente.nombre,
    apellido1: paciente.apellido1,
    apellido2: paciente.apellido2 || "",
    fechaNacimiento: paciente.fechaNacimiento ? new Date(paciente.fechaNacimiento) : null,
    telefonoPrincipal: paciente.telefonoPrincipal || "",
    telefonoSecundario: paciente.telefonoSecundario || "",
    correoElectronico: paciente.correoElectronico,
    direccionResidencia: paciente.direccionResidencia || "",
    activo: paciente.activo
  });

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validaciones requeridas
    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es requerido";
    }

    if (!formData.apellido1.trim()) {
      newErrors.apellido1 = "El primer apellido es requerido";
    }

    if (!formData.correoElectronico.trim()) {
      newErrors.correoElectronico = "El correo electrónico es requerido";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correoElectronico)) {
      newErrors.correoElectronico = "El formato del correo electrónico no es válido";
    }

    if (!formData.telefonoPrincipal.trim()) {
      newErrors.telefonoPrincipal = "El teléfono principal es requerido";
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
      // Validar que los campos requeridos no estén vacíos
      if (!formData.nombre?.trim()) {
        setErrors({ nombre: "El nombre es requerido" });
        return;
      }
      if (!formData.apellido1?.trim()) {
        setErrors({ apellido1: "El primer apellido es requerido" });
        return;
      }
      if (!formData.correoElectronico?.trim()) {
        setErrors({ correoElectronico: "El correo electrónico es requerido" });
        return;
      }

      const updateData = {
        nombre: formData.nombre.trim(),
        apellido1: formData.apellido1.trim(),
        apellido2: formData.apellido2.trim() || null,
        fechaNacimiento: formData.fechaNacimiento?.toISOString() || null,
        telefonoPrincipal: formData.telefonoPrincipal.trim(),
        telefonoSecundario: formData.telefonoSecundario.trim() || null,
        correoElectronico: formData.correoElectronico.trim(),
        direccionResidencia: formData.direccionResidencia.trim() || null,
        activo: Boolean(formData.activo) // Asegurar que sea boolean
      };

      // Limpiar campos vacíos para evitar problemas con la base de datos
      if (updateData.apellido2 === '') {
        updateData.apellido2 = null;
      }
      if (updateData.telefonoSecundario === '') {
        updateData.telefonoSecundario = null;
      }
      if (updateData.direccionResidencia === '') {
        updateData.direccionResidencia = null;
      }

      // Validaciones adicionales antes de enviar
      if (updateData.nombre.length < 2) {
        setErrors({ nombre: "El nombre debe tener al menos 2 caracteres" });
        return;
      }

      if (updateData.apellido1.length < 2) {
        setErrors({ apellido1: "El primer apellido debe tener al menos 2 caracteres" });
        return;
      }

      if (updateData.telefonoPrincipal.length < 5) {
        setErrors({ telefonoPrincipal: "El teléfono debe tener al menos 5 caracteres" });
        return;
      }

      // Validar que el teléfono principal contenga solo números, espacios, +, -, (, )
      const phoneRegex = /^[\d\s\+\-\(\)]+$/;
      if (!phoneRegex.test(updateData.telefonoPrincipal)) {
        setErrors({ telefonoPrincipal: "El teléfono solo puede contener números, espacios, +, -, ( y )" });
        return;
      }

      // Validar formato de correo
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(updateData.correoElectronico)) {
        setErrors({ correoElectronico: "El formato del correo electrónico no es válido" });
        return;
      }

      // Validar longitud máxima de campos
      if (updateData.nombre.length > 100) {
        setErrors({ nombre: "El nombre no puede exceder 100 caracteres" });
        return;
      }

      if (updateData.apellido1.length > 100) {
        setErrors({ apellido1: "El primer apellido no puede exceder 100 caracteres" });
        return;
      }

      if (updateData.apellido2 && updateData.apellido2.length > 100) {
        setErrors({ apellido2: "El segundo apellido no puede exceder 100 caracteres" });
        return;
      }

      if (updateData.telefonoPrincipal.length > 20) {
        setErrors({ telefonoPrincipal: "El teléfono principal no puede exceder 20 caracteres" });
        return;
      }

      if (updateData.telefonoSecundario && updateData.telefonoSecundario.length > 20) {
        setErrors({ telefonoSecundario: "El teléfono secundario no puede exceder 20 caracteres" });
        return;
      }

      // Validar que el teléfono secundario contenga solo números, espacios, +, -, (, )
      if (updateData.telefonoSecundario && !phoneRegex.test(updateData.telefonoSecundario)) {
        setErrors({ telefonoSecundario: "El teléfono secundario solo puede contener números, espacios, +, -, ( y )" });
        return;
      }

      if (updateData.direccionResidencia && updateData.direccionResidencia.length > 255) {
        setErrors({ direccionResidencia: "La dirección no puede exceder 255 caracteres" });
        return;
      }

      if (updateData.correoElectronico.length > 150) {
        setErrors({ correoElectronico: "El correo electrónico no puede exceder 150 caracteres" });
        return;
      }

      // Validar tipos de datos
      console.log("📝 Validando tipos de datos:");
      console.log("  - nombre:", typeof updateData.nombre, updateData.nombre);
      console.log("  - apellido1:", typeof updateData.apellido1, updateData.apellido1);
      console.log("  - correoElectronico:", typeof updateData.correoElectronico, updateData.correoElectronico);
      console.log("  - telefonoPrincipal:", typeof updateData.telefonoPrincipal, updateData.telefonoPrincipal);
      console.log("  - activo:", typeof updateData.activo, updateData.activo);
      console.log("  - fechaNacimiento:", typeof updateData.fechaNacimiento, updateData.fechaNacimiento);
      
      console.log("📝 Datos del formulario (formData):", formData);
      console.log("📝 Datos a enviar (updateData):", updateData);

      console.log("📝 Actualizando paciente:", updateData);
      console.log("📝 ID del paciente:", paciente.idUsuario);
      console.log("📝 Endpoint:", apiEndpoints.updateUsuario(paciente.idUsuario.toString()));

      const response = await apiClient.put(apiEndpoints.updateUsuario(paciente.idUsuario.toString()), updateData);
      
      console.log("✅ Paciente actualizado exitosamente:", response);

      onSuccess?.();
    } catch (error) {
      console.error("❌ Error actualizando paciente:", error);
      
      if (error instanceof Error) {
        if (error.message.includes("409")) {
          setErrors({ correoElectronico: "Ya existe un usuario con este correo electrónico" });
        } else if (error.message.includes("403")) {
          setErrors({ general: "No tienes permisos para actualizar este paciente" });
        } else if (error.message.includes("404")) {
          setErrors({ general: "El paciente no fue encontrado" });
        } else if (error.message.includes("400")) {
          setErrors({ general: "Los datos proporcionados no son válidos" });
        } else {
          setErrors({ general: `Error al actualizar el paciente: ${error.message}` });
        }
      } else {
        setErrors({ general: "Error inesperado. Por favor, intenta de nuevo." });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | Date | boolean | null) => {
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

  const handleBlur = (field: string) => {
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

  const getNombreCompleto = () => {
    return `${formData.nombre} ${formData.apellido1}${formData.apellido2 ? ` ${formData.apellido2}` : ''}`;
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5 text-primary" />
          Editar Paciente
        </CardTitle>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Badge variant={formData.activo ? "default" : "secondary"}>
            {formData.activo ? "Activo" : "Inactivo"}
          </Badge>
          <span>•</span>
          <span>ID: {paciente.idUsuario}</span>
        </div>
      </CardHeader>
      <CardContent className="p-8">
        <form onSubmit={handleSubmit} className="space-y-8 w-full">
          {errors.general && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
              {errors.general}
            </div>
          )}

          {/* Información Personal */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <User className="w-4 h-4" />
              Información Personal
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre *</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => handleInputChange("nombre", e.target.value)}
                  onBlur={() => handleBlur("nombre")}
                  placeholder="Ingrese el nombre (solo letras)"
                  className={`${errors.nombre ? "border-red-500" : ""} max-w-full h-10`}
                  maxLength={100}
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
                  className={`${errors.apellido1 ? "border-red-500" : ""} max-w-full h-10`}
                  maxLength={100}
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
                  className={`${errors.apellido2 ? "border-red-500" : ""} h-10`}
                />
                {errors.apellido2 && (
                  <p className="text-sm text-red-600">{errors.apellido2}</p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="fechaNacimiento">Fecha de Nacimiento</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal min-h-[40px]",
                        !formData.fechaNacimiento && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                      <span className="truncate">
                        {formData.fechaNacimiento ? (
                          format(formData.fechaNacimiento, "PPP", { locale: es })
                        ) : (
                          "Seleccionar fecha"
                        )}
                      </span>
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
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Información de Contacto
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <div className="space-y-2">
                <Label htmlFor="correoElectronico">Correo Electrónico *</Label>
                <Input
                  id="correoElectronico"
                  type="email"
                  value={formData.correoElectronico}
                  onChange={(e) => handleInputChange("correoElectronico", e.target.value)}
                  placeholder="ejemplo@correo.com"
                  className={`${errors.correoElectronico ? "border-red-500" : ""} max-w-full h-10`}
                  maxLength={150}
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
                  className={`${errors.telefonoPrincipal ? "border-red-500" : ""} max-w-full h-10`}
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
                  className="h-10"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="direccionResidencia">Dirección de Residencia</Label>
                <Textarea
                  id="direccionResidencia"
                  value={formData.direccionResidencia}
                  onChange={(e) => handleInputChange("direccionResidencia", e.target.value)}
                  placeholder="Dirección completa (opcional)"
                  rows={2}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Estado del Usuario */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <CalendarIcon2 className="w-4 h-4" />
              Estado del Usuario
            </h3>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="activo"
                checked={formData.activo}
                onChange={(e) => handleInputChange("activo", e.target.checked)}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                aria-label="Usuario activo"
              />
              <Label htmlFor="activo" className="text-sm font-medium">
                Usuario activo
              </Label>
            </div>
            <p className="text-sm text-muted-foreground">
              Los usuarios inactivos no pueden acceder al sistema
            </p>
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
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
