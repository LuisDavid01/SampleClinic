"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, FileText, Loader2 } from "lucide-react";
import { Diagnostico } from "@/types/paciente";

interface PDFExportProps {
  diagnostico: Diagnostico;
  pacienteNombre: string;
  className?: string;
}

export function PDFExport({ diagnostico, pacienteNombre, className }: PDFExportProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = async () => {
    setIsExporting(true);
    
    try {
      // Aquí se implementaría la lógica real de exportación a PDF
      // Por ahora simulamos un delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // En producción, esto generaría y descargaría el PDF
      console.log('Exportando diagnóstico a PDF:', diagnostico.id);
      
      // Simular descarga
      const link = document.createElement('a');
      link.href = '#';
      link.download = `diagnostico-${diagnostico.id}-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Error al exportar PDF:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      onClick={handleExportPDF}
      disabled={isExporting}
      className={className}
      variant="outline"
      size="sm"
    >
      {isExporting ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <Download className="w-4 h-4 mr-2" />
      )}
      {isExporting ? 'Generando PDF...' : 'Exportar PDF'}
    </Button>
  );
}

// Componente para generar el contenido del PDF
export function generatePDFContent(diagnostico: Diagnostico, pacienteNombre: string) {
  const formatFecha = (fecha: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(fecha);
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Diagnóstico - ${pacienteNombre}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 40px;
          line-height: 1.6;
        }
        .header {
          text-align: center;
          border-bottom: 2px solid #333;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .section {
          margin-bottom: 25px;
        }
        .section-title {
          font-size: 18px;
          font-weight: bold;
          color: #333;
          margin-bottom: 10px;
          border-bottom: 1px solid #ccc;
          padding-bottom: 5px;
        }
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }
        .info-item {
          margin-bottom: 10px;
        }
        .info-label {
          font-weight: bold;
          color: #555;
        }
        .medicamentos-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }
        .medicamentos-table th,
        .medicamentos-table td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        .medicamentos-table th {
          background-color: #f5f5f5;
          font-weight: bold;
        }
        .footer {
          margin-top: 40px;
          text-align: center;
          font-size: 12px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Clínica Esteban Porras</h1>
        <h2>Diagnóstico Médico</h2>
        <p>Fecha: ${formatFecha(diagnostico.fecha)}</p>
      </div>

      <div class="section">
        <div class="section-title">Información del Paciente</div>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">Paciente:</span> ${pacienteNombre}
          </div>
          <div class="info-item">
            <span class="info-label">Fecha de Diagnóstico:</span> ${formatFecha(diagnostico.fecha)}
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Síntomas Reportados</div>
        <p>${diagnostico.sintomas}</p>
      </div>

      <div class="section">
        <div class="section-title">Evaluación Física</div>
        <p>${diagnostico.evaluacion}</p>
      </div>

      <div class="section">
        <div class="section-title">Diagnóstico</div>
        <p>${diagnostico.diagnostico}</p>
      </div>

      <div class="section">
        <div class="section-title">Plan de Tratamiento</div>
        <p>${diagnostico.planTratamiento.replace(/\n/g, '<br>')}</p>
      </div>

      <div class="section">
        <div class="section-title">Recomendaciones</div>
        <p>${diagnostico.recomendaciones.replace(/\n/g, '<br>')}</p>
      </div>

      ${diagnostico.medicamentos && diagnostico.medicamentos.length > 0 ? `
        <div class="section">
          <div class="section-title">Medicamentos Recetados</div>
          <table class="medicamentos-table">
            <thead>
              <tr>
                <th>Medicamento</th>
                <th>Dosis</th>
                <th>Frecuencia</th>
                <th>Duración</th>
                <th>Instrucciones</th>
              </tr>
            </thead>
            <tbody>
              ${diagnostico.medicamentos.map(med => `
                <tr>
                  <td>${med.nombre}</td>
                  <td>${med.dosis}</td>
                  <td>${med.frecuencia}</td>
                  <td>${med.duracion}</td>
                  <td>${med.instrucciones}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      ` : ''}

      <div class="footer">
        <p>Este documento fue generado el ${new Date().toLocaleDateString('es-ES')}</p>
        <p>Clínica Esteban Porras - Fisioterapia y Rehabilitación</p>
      </div>
    </body>
    </html>
  `;
} 