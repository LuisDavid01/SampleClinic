'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Edit, 
  User, 
  Calendar, 
  Phone, 
  AlertTriangle, 
  Pill, 
  Heart, 
  Stethoscope,
  FileText,
  Shield
} from 'lucide-react';
import { AntecedenteClinico } from '@/types/Antecedentes';

interface AntecedentesViewProps {
  antecedente: AntecedenteClinico;
  onEdit?: () => void;
  canEdit?: boolean;
}

export default function AntecedentesView({ antecedente, onEdit, canEdit = true }: AntecedentesViewProps) {

  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['informacion-general']));

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const hasContent = (content?: string | null) => {
    if (content === null || content === undefined) return false;
    return content.trim().length > 0;
  };

  const sections = [
    {
      id: 'informacion-general',
      title: 'Información General',
      icon: FileText,
      fields: [
        { key: 'historialMedico', label: 'Historial Médico', value: antecedente.historialMedico },
        { key: 'condicionesPreexistentes', label: 'Condiciones Preexistentes', value: antecedente.condicionesPreexistentes }
      ]
    },
    {
      id: 'alergias',
      title: 'Alergias',
      icon: AlertTriangle,
      fields: [
        { key: 'alergiasMedicamentos', label: 'Alergias a Medicamentos', value: antecedente.alergiasMedicamentos },
        { key: 'alergiasAlimentos', label: 'Alergias Alimentarias', value: antecedente.alergiasAlimentos },
        { key: 'alergiasAmbientales', label: 'Alergias Ambientales', value: antecedente.alergiasAmbientales },
        { key: 'alergiasOtras', label: 'Otras Alergias', value: antecedente.alergiasOtras }
      ]
    },
    {
      id: 'medicamentos',
      title: 'Medicamentos',
      icon: Pill,
      fields: [
        { key: 'medicamentosActuales', label: 'Medicamentos Actuales', value: antecedente.medicamentosActuales },
        { key: 'medicamentosPrevios', label: 'Medicamentos Previos', value: antecedente.medicamentosPrevios }
      ]
    },
    {
      id: 'cirugias',
      title: 'Historial de Cirugías',
      icon: Stethoscope,
      fields: [
        { key: 'cirugiasPrevias', label: 'Cirugías Previas', value: antecedente.cirugiasPrevias },
        { key: 'procedimientosMedicos', label: 'Procedimientos Médicos', value: antecedente.procedimientosMedicos },
        { key: 'hospitalizacionesPrevias', label: 'Hospitalizaciones Previas', value: antecedente.hospitalizacionesPrevias }
      ]
    },
    {
      id: 'condiciones-cronicas',
      title: 'Condiciones Crónicas',
      icon: Heart,
      fields: [
        { key: 'antecedentesFamiliares', label: 'Antecedentes Familiares', value: antecedente.antecedentesFamiliares },
        { key: 'habitosToxicos', label: 'Hábitos Tóxicos', value: antecedente.habitosToxicos }
      ]
    },
    {
      id: 'emergencias',
      title: 'Información de Emergencia',
      icon: Shield,
      fields: [
        { key: 'urgenciasMedicas', label: 'Urgencias Médicas', value: antecedente.urgenciasMedicas },
        { key: 'contactoEmergenciaNombre', label: 'Nombre del Contacto', value: antecedente.contactoEmergenciaNombre },
        { key: 'contactoEmergenciaTelefono', label: 'Teléfono de Emergencia', value: antecedente.contactoEmergenciaTelefono },
        { key: 'contactoEmergenciaRelacion', label: 'Relación', value: antecedente.contactoEmergenciaRelacion }
      ]
    },
    {
      id: 'notas-adicionales',
      title: 'Notas Adicionales',
      icon: FileText,
      fields: [
        { key: 'notasAdicionales', label: 'Notas Adicionales', value: antecedente.notasAdicionales }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header con información del registro */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Antecedentes Clínicos
              </CardTitle>
              <CardDescription>
                Información médica del paciente
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">Registrado:</span>
              <span>{formatDate(antecedente.fechaRegistro)}</span>
            </div>
            {antecedente.fechaActualizacion && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">Actualizado:</span>
                <span>{formatDate(antecedente.fechaActualizacion)}</span>
              </div>
            )}
            {antecedente.medicoRegistro && (
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">Médico:</span>
                <span>{antecedente.medicoRegistro.nombre} {antecedente.medicoRegistro.apellido1}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Secciones de antecedentes */}
      {sections.map((section) => {
        const hasAnyContent = section.fields.some(field => hasContent(field.value));
        const isExpanded = expandedSections.has(section.id);
        const Icon = section.icon;

        return (
          <Card key={section.id}>
            <CardHeader 
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => toggleSection(section.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="w-5 h-5" />
                  <CardTitle className="text-lg">{section.title}</CardTitle>
                  {!hasAnyContent && (
                    <Badge variant="secondary" className="text-xs">
                      Sin información
                    </Badge>
                  )}
                </div>
                <Button variant="ghost" size="sm">
                  {isExpanded ? 'Ocultar' : 'Mostrar'}
                </Button>
              </div>
            </CardHeader>
            
            {isExpanded && (
              <CardContent>
                {hasAnyContent ? (
                  <div className="space-y-4">
                    {section.fields.map((field) => (
                      hasContent(field.value) && (
                        <div key={field.key} className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm text-muted-foreground">
                              {field.label}:
                            </span>
                          </div>
                          <div className="pl-4">
                            <p className="text-sm whitespace-pre-wrap bg-muted/30 p-3 rounded-md">
                              {field.value}
                            </p>
                          </div>
                        </div>
                      )
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Icon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No hay información registrada en esta sección</p>
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}
