export interface AntecedenteClinico {
  id: number;
  idPaciente: number;
  historialMedico?: string;
  condicionesPreexistentes?: string;
  alergiasMedicamentos?: string;
  alergiasAlimentos?: string;
  alergiasAmbientales?: string;
  alergiasOtras?: string;
  medicamentosActuales?: string;
  medicamentosPrevios?: string;
  cirugiasPrevias?: string;
  procedimientosMedicos?: string;
  hospitalizacionesPrevias?: string;
  antecedentesFamiliares?: string;
  habitosToxicos?: string;
  urgenciasMedicas?: string;
  contactoEmergenciaNombre?: string;
  contactoEmergenciaTelefono?: string;
  contactoEmergenciaRelacion?: string;
  notasAdicionales?: string;
  fechaRegistro: string;
  fechaActualizacion?: string;
  idMedicoRegistro: number;
  paciente?: {
    idUsuario: number;
    nombre: string;
    apellido1: string;
    apellido2?: string;
    correoElectronico: string;
  };
  medicoRegistro?: {
    idUsuario: number;
    nombre: string;
    apellido1: string;
    apellido2?: string;
  };
}

export interface AntecedenteFormData {
  historialMedico?: string;
  condicionesPreexistentes?: string;
  alergiasMedicamentos?: string;
  alergiasAlimentos?: string;
  alergiasAmbientales?: string;
  alergiasOtras?: string;
  medicamentosActuales?: string;
  medicamentosPrevios?: string;
  cirugiasPrevias?: string;
  procedimientosMedicos?: string;
  hospitalizacionesPrevias?: string;
  antecedentesFamiliares?: string;
  habitosToxicos?: string;
  urgenciasMedicas?: string;
  contactoEmergenciaNombre?: string;
  contactoEmergenciaTelefono?: string;
  contactoEmergenciaRelacion?: string;
  notasAdicionales?: string;
}

export interface AntecedenteValidationErrors {
  [key: string]: string | undefined;
}

export interface AntecedenteSection {
  id: string;
  title: string;
  description: string;
  fields: AntecedenteField[];
}

export interface AntecedenteField {
  name: keyof AntecedenteFormData;
  label: string;
  type: 'textarea' | 'text' | 'tel';
  placeholder?: string;
  maxLength?: number;
  required?: boolean;
  rows?: number;
}
