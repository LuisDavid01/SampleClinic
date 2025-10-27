"use client";

import { Cita } from "@/types/PacienteTypes";
import jsPDF from "jspdf";

interface PDFGeneratorProps {
  citas: Cita[];
  pacienteNombre: string;
  fechaGeneracion: Date;
}

export const generateHistorialPDF = ({ citas, pacienteNombre, fechaGeneracion }: PDFGeneratorProps) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;

  // Colores médicos profesionales
  const colors = {
    primary: '#1e40af',      // Azul médico
    secondary: '#475569',    // Gris profesional
    accent: '#0ea5e9',       // Azul claro
    success: '#059669',      // Verde médico
    warning: '#d97706',      // Naranja
    danger: '#dc2626',       // Rojo
    light: '#f1f5f9',        // Gris muy claro
    dark: '#0f172a',        // Negro médico
    medical: '#0d9488',     // Verde médico
    border: '#e2e8f0'       // Borde sutil
  };

  // Función para agregar texto con estilo
  const addText = (text: string, x: number, y: number, options: any = {}) => {
    doc.setFontSize(options.fontSize || 12);
    doc.setTextColor(options.color || colors.dark);
    doc.setFont(options.font || 'helvetica', options.style || 'normal');
    
    // Limpiar caracteres especiales para mejor compatibilidad
    const cleanText = text
      .replace(/ñ/g, 'n')
      .replace(/Ñ/g, 'N')
      .replace(/á/g, 'a')
      .replace(/é/g, 'e')
      .replace(/í/g, 'i')
      .replace(/ó/g, 'o')
      .replace(/ú/g, 'u')
      .replace(/Á/g, 'A')
      .replace(/É/g, 'E')
      .replace(/Í/g, 'I')
      .replace(/Ó/g, 'O')
      .replace(/Ú/g, 'U')
      .replace(/ü/g, 'u')
      .replace(/Ü/g, 'U')
      .replace(/ç/g, 'c')
      .replace(/Ç/g, 'C')
      .replace(/[^\x00-\x7F]/g, ''); // Remover cualquier carácter no ASCII
    
    // Manejar texto largo dividiendo en líneas
    const maxWidth = options.maxWidth || (pageWidth - x - 20);
    const lines = doc.splitTextToSize(cleanText, maxWidth);
    
    if (Array.isArray(lines)) {
      lines.forEach((line: string, index: number) => {
        doc.text(line, x, y + (index * (options.lineHeight || 5)));
      });
    } else {
      doc.text(lines, x, y);
    }
  };

  // Función para agregar línea
  const addLine = (x1: number, y1: number, x2: number, y2: number, color: string = colors.border, width: number = 0.5) => {
    doc.setDrawColor(color);
    doc.setLineWidth(width);
    doc.line(x1, y1, x2, y2);
  };

  // Función para agregar rectángulo
  const addRect = (x: number, y: number, width: number, height: number, color: string = colors.light, stroke: boolean = false) => {
    if (stroke) {
      doc.setDrawColor(color);
      doc.setLineWidth(0.5);
      doc.rect(x, y, width, height);
    } else {
      doc.setFillColor(color);
      doc.rect(x, y, width, height, 'F');
    }
  };

  // Función para agregar texto centrado
  const addCenteredText = (text: string, y: number, options: any = {}) => {
    const textWidth = doc.getTextWidth(text);
    const x = (pageWidth - textWidth) / 2;
    addText(text, x, y, options);
  };

  // Header médico profesional mejorado
  addRect(0, 0, pageWidth, 80, colors.primary);
  
  // Logo/Icono médico simulado (usar texto en lugar de emoji)
  addRect(20, 20, 50, 50, '#ffffff', true);
  addText('H+', 35, 45, { fontSize: 20, color: colors.primary, style: 'bold' });
  
  // Título principal (más espaciado)
  addText('HISTORIAL MEDICO', 85, 35, { 
    fontSize: 22, 
    color: '#ffffff', 
    style: 'bold' 
  });
  addText('Clinica de Fisioterapia y Rehabilitacion', 85, 48, { 
    fontSize: 13, 
    color: '#e2e8f0' 
  });
//   addText('Reporte de Consultas Medicas', 85, 60, { 
//     fontSize: 11, 
//     color: '#cbd5e1' 
//   });
  
  // Fecha y número de reporte (mejor posicionamiento y espaciado)
  const fechaTexto = `Fecha: ${fechaGeneracion.toLocaleDateString('es-ES')}`;
  const reporteTexto = `Reporte #${Date.now().toString().slice(-6)}`;
  const horaTexto = `Hora: ${fechaGeneracion.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
  
//   addText(fechaTexto, pageWidth - 120, 35, { 
//     fontSize: 11, 
//     color: '#e2e8f0' 
//   });
//   addText(reporteTexto, pageWidth - 120, 48, { 
//     fontSize: 11, 
//     color: '#e2e8f0' 
//   });
//   addText(horaTexto, pageWidth - 120, 60, { 
//     fontSize: 10, 
//     color: '#cbd5e1' 
//   });

  yPosition = 100;

  // Sección 1: Información del paciente mejorada
  addRect(15, yPosition - 8, pageWidth - 30, 50, colors.light);
  addLine(15, yPosition - 8, pageWidth - 15, yPosition - 8, colors.primary, 3);
  
  // Título de sección
  addText('INFORMACION DEL PACIENTE', 20, yPosition, { 
    fontSize: 16, 
    color: colors.primary, 
    style: 'bold' 
  });
  yPosition += 12;
  
  // Información en dos columnas
  const col1X = 20;
  const col2X = pageWidth / 2 + 5;
  
  addText(`Nombre Completo: ${pacienteNombre}`, col1X, yPosition, { fontSize: 12, style: 'bold' });
  addText(`Total de Consultas: ${citas.length}`, col2X, yPosition, { fontSize: 12, style: 'bold' });
  yPosition += 8;
  
  addText(`Periodo: ${citas.length > 0 ? citas[citas.length - 1].fecha.toLocaleDateString('es-ES') : 'N/A'} - ${citas.length > 0 ? citas[0].fecha.toLocaleDateString('es-ES') : 'N/A'}`, col1X, yPosition, { fontSize: 11 });
  addText(`Generado: ${fechaGeneracion.toLocaleDateString('es-ES')} ${fechaGeneracion.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`, col2X, yPosition, { fontSize: 11, color: colors.secondary });
  
  yPosition += 25;

  yPosition += 20;

  // Sección 2: Historial de consultas médicas
  yPosition += 20;
  addRect(15, yPosition - 8, pageWidth - 30, 25, colors.light);
  addLine(15, yPosition - 8, pageWidth - 15, yPosition - 8, colors.accent, 3);
  
  addText('HISTORIAL DE CONSULTAS MEDICAS', 20, yPosition, { 
    fontSize: 16, 
    color: colors.accent, 
    style: 'bold' 
  });
  yPosition += 15;

  citas.forEach((cita, index) => {
    // Verificar si necesitamos una nueva página
    if (yPosition > pageHeight - 120) {
      doc.addPage();
      yPosition = 20;
    }

    yPosition += 15;

    // Card de consulta mejorado
    addRect(15, yPosition - 8, pageWidth - 30, 35, colors.light);
    addLine(15, yPosition - 8, pageWidth - 15, yPosition - 8, colors.primary, 2);
    
    // Header de la consulta
    addText(`CONSULTA MEDICA #${index + 1}`, 20, yPosition, { 
      fontSize: 13, 
      color: colors.primary, 
      style: 'bold' 
    });
    
    // Información en dos columnas
    addText(`Fecha: ${cita.fecha.toLocaleDateString('es-ES')}`, 20, yPosition + 10, { fontSize: 11, style: 'bold' });
    addText(`Estado: ${cita.estado.toUpperCase()}`, pageWidth - 80, yPosition + 10, { fontSize: 11, color: colors.secondary });
    addText(`Tipo: ${cita.tipo.toUpperCase()}`, pageWidth - 80, yPosition + 20, { fontSize: 11, color: colors.secondary });
    
    // Profesional
    addText(`Profesional: ${cita.fisioterapeutaNombre}`, 20, yPosition + 20, { fontSize: 11, style: 'bold' });

    yPosition += 40;

    // Evaluación médica si existe
    if (cita.evaluacionCompleta) {
      addRect(15, yPosition, pageWidth - 30, 12, colors.medical);
      addText('EVALUACION MEDICA', 20, yPosition + 8, { 
        fontSize: 11, 
        color: '#ffffff', 
        style: 'bold' 
      });
      yPosition += 20;
      
      if (cita.evaluacionCompleta.diagnosticoPrincipal) {
        addText(`• Diagnostico Principal: ${cita.evaluacionCompleta.diagnosticoPrincipal}`, 20, yPosition, { 
          fontSize: 10, 
          maxWidth: pageWidth - 40,
          lineHeight: 4
        });
        yPosition += 8;
      }
      
      if (cita.evaluacionCompleta.sintomasReportados) {
        addText(`• Sintomas Reportados: ${cita.evaluacionCompleta.sintomasReportados}`, 20, yPosition, { 
          fontSize: 10, 
          maxWidth: pageWidth - 40,
          lineHeight: 4
        });
        yPosition += 8;
      }
      
      if (cita.evaluacionCompleta.evaluacionFisica) {
        addText(`• Evaluacion Fisica: ${cita.evaluacionCompleta.evaluacionFisica}`, 20, yPosition, { 
          fontSize: 10, 
          maxWidth: pageWidth - 40,
          lineHeight: 4
        });
        yPosition += 8;
      }
      
      if (cita.evaluacionCompleta.planTratamiento) {
        // Dividir el plan de tratamiento en líneas
        const planLines = cita.evaluacionCompleta.planTratamiento.split('\n').filter(line => line.trim());
        addText(`• Plan de Tratamiento:`, 20, yPosition, { fontSize: 10, style: 'bold' });
        yPosition += 8;
        
        planLines.forEach((line, index) => {
          const cleanLine = line.trim().replace(/^\d+\.\s*/, ''); // Remover numeración si existe
          addText(`  ${index + 1}. ${cleanLine}`, 20, yPosition, { 
            fontSize: 9, 
            maxWidth: pageWidth - 40,
            lineHeight: 4
          });
          yPosition += 6;
        });
        yPosition += 4;
      }
      
      if (cita.evaluacionCompleta.recomendaciones) {
        addText(`• Recomendaciones: ${cita.evaluacionCompleta.recomendaciones}`, 20, yPosition, { 
          fontSize: 10, 
          maxWidth: pageWidth - 40,
          lineHeight: 4
        });
        yPosition += 8;
      }
    }

    // Archivos médicos si existen
    if (cita.archivos && cita.archivos.length > 0) {
      addRect(15, yPosition, pageWidth - 30, 12, colors.accent);
      addText(`DOCUMENTOS MEDICOS (${cita.archivos.length})`, 20, yPosition + 8, { 
        fontSize: 11, 
        color: '#ffffff', 
        style: 'bold' 
      });
      yPosition += 18;
      
      cita.archivos.forEach((archivo, archivoIndex) => {
        const archivoText = `• ${archivo.nombreOriginal} (${archivo.categoria || 'Sin categoria'})`;
        addText(archivoText, 20, yPosition, { 
          fontSize: 9, 
          color: colors.secondary,
          maxWidth: pageWidth - 40,
          lineHeight: 4
        });
        yPosition += 7;
      });
    }

    yPosition += 15;
    addLine(15, yPosition, pageWidth - 15, yPosition, colors.border, 0.5);
    yPosition += 10;
  });

  // Footer médico profesional mejorado
  const footerY = pageHeight - 35;
  addLine(15, footerY - 20, pageWidth - 15, footerY - 20, colors.border, 2);
  
  // Información de la clínica
  addText('Clinica de Fisioterapia y Rehabilitacion', 20, footerY - 8, { 
    fontSize: 10, 
    color: colors.primary, 
    style: 'bold' 
  });
  addText('Sistema de Gestion Clinica - Reporte Medico', 20, footerY + 2, { 
    fontSize: 9, 
    color: colors.secondary 
  });
  
  // Información de la página
  addText(`Pagina ${doc.getNumberOfPages()} de ${doc.getNumberOfPages()}`, pageWidth - 40, footerY - 8, { 
    fontSize: 9, 
    color: colors.secondary 
  });
  addText(`Confidencial - Uso Medico`, pageWidth - 40, footerY + 2, { 
    fontSize: 9, 
    color: colors.danger, 
    style: 'bold' 
  });

  return doc;
};

export const downloadHistorialPDF = (citas: Cita[], pacienteNombre: string) => {
  const pdf = generateHistorialPDF({
    citas,
    pacienteNombre,
    fechaGeneracion: new Date()
  });
  
  const fileName = `historial_${pacienteNombre.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  pdf.save(fileName);
};

export const printHistorial = (citas: Cita[], pacienteNombre: string) => {
  // Crear una ventana de impresión
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const fechaGeneracion = new Date();
  const estadisticas = {
    total: citas.length,
    completadas: citas.filter(c => c.estado === 'completada').length,
    programadas: citas.filter(c => c.estado === 'programada').length,
    conEvaluacion: citas.filter(c => c.evaluacionCompleta).length
  };

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Historial Médico - ${pacienteNombre}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #1e293b;
          background: white;
        }
        
        .header {
          background: linear-gradient(135deg, #1e40af 0%, #0ea5e9 100%);
          color: white;
          padding: 2rem;
          text-align: center;
          margin-bottom: 2rem;
          border-radius: 0.5rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .header h1 {
          font-size: 2.2rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
        
        .header p {
          font-size: 1.1rem;
          opacity: 0.9;
          margin-bottom: 0.25rem;
        }
        
        .header .subtitle {
          font-size: 0.9rem;
          opacity: 0.8;
        }
        
        .patient-info {
          background: #f8fafc;
          padding: 1.5rem;
          border-radius: 0.5rem;
          margin-bottom: 2rem;
          border-left: 4px solid #2563eb;
        }
        
        .stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }
        
        .stat-card {
          background: white;
          padding: 1rem;
          border-radius: 0.5rem;
          text-align: center;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          border: 1px solid #e2e8f0;
        }
        
        .stat-number {
          font-size: 2rem;
          font-weight: 700;
          color: #2563eb;
          margin-bottom: 0.5rem;
        }
        
        .stat-label {
          color: #64748b;
          font-size: 0.9rem;
        }
        
        .cita {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .cita-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #e2e8f0;
        }
        
        .cita-title {
          font-size: 1.2rem;
          font-weight: 600;
          color: #1e293b;
        }
        
        .cita-date {
          color: #64748b;
          font-size: 0.9rem;
        }
        
        .cita-info {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 1rem;
        }
        
        .info-item {
          display: flex;
          flex-direction: column;
        }
        
        .info-label {
          font-size: 0.8rem;
          color: #64748b;
          text-transform: uppercase;
          font-weight: 600;
          margin-bottom: 0.25rem;
        }
        
        .info-value {
          color: #1e293b;
          font-weight: 500;
        }
        
        .evaluacion {
          background: #f0f9ff;
          border: 1px solid #0ea5e9;
          border-radius: 0.5rem;
          padding: 1rem;
          margin-top: 1rem;
        }
        
        .evaluacion-title {
          color: #0ea5e9;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }
        
        .archivos {
          background: #f0fdf4;
          border: 1px solid #10b981;
          border-radius: 0.5rem;
          padding: 1rem;
          margin-top: 1rem;
        }
        
        .archivos-title {
          color: #10b981;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }
        
        .archivo-item {
          display: flex;
          align-items: center;
          padding: 0.5rem;
          background: white;
          border-radius: 0.25rem;
          margin-bottom: 0.5rem;
          border: 1px solid #d1fae5;
        }
        
        .footer {
          margin-top: 3rem;
          padding-top: 1rem;
          border-top: 1px solid #e2e8f0;
          text-align: center;
          color: #64748b;
          font-size: 0.9rem;
        }
        
        @media print {
          body { margin: 0; }
          .header { background: #2563eb !important; -webkit-print-color-adjust: exact; }
          .cita { break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🏥 Historial Médico</h1>
        <p>Clínica de Fisioterapia y Rehabilitación</p>
        <p class="subtitle">Reporte de Consultas Médicas</p>
        <p class="subtitle">Generado el ${fechaGeneracion.toLocaleDateString('es-ES')} a las ${fechaGeneracion.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</p>
      </div>
      
      <div class="patient-info">
        <h2>📋 Información del Paciente</h2>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div>
            <p><strong>Nombre Completo:</strong> ${pacienteNombre}</p>
            <p><strong>Total de Consultas:</strong> ${estadisticas.total}</p>
          </div>
          <div>
            <p><strong>Período:</strong> ${citas.length > 0 ? citas[citas.length - 1].fecha.toLocaleDateString('es-ES') : 'N/A'} - ${citas.length > 0 ? citas[0].fecha.toLocaleDateString('es-ES') : 'N/A'}</p>
            <p><strong>Reporte:</strong> #${Date.now().toString().slice(-6)}</p>
          </div>
        </div>
      </div>
      
      <div class="stats">
        <h2 style="grid-column: 1 / -1; margin-bottom: 1rem; color: #1e40af;">📊 Resumen Clínico</h2>
        <div class="stat-card">
          <div class="stat-number">${estadisticas.total}</div>
          <div class="stat-label">Total Consultas</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">${estadisticas.completadas}</div>
          <div class="stat-label">Completadas</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">${estadisticas.programadas}</div>
          <div class="stat-label">Programadas</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">${estadisticas.conEvaluacion}</div>
          <div class="stat-label">Con Evaluación</div>
        </div>
      </div>
      
      <h2 style="margin-bottom: 1.5rem; color: #1e40af;">🏥 Historial de Consultas Médicas</h2>
      
      ${citas.map((cita, index) => `
        <div class="cita">
          <div class="cita-header">
            <div class="cita-title">🏥 Consulta Médica #${index + 1}</div>
            <div class="cita-date">${cita.fecha.toLocaleDateString('es-ES')}</div>
          </div>
          
          <div class="cita-info">
            <div class="info-item">
              <div class="info-label">Estado</div>
              <div class="info-value">${cita.estado.toUpperCase()}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Tipo</div>
              <div class="info-value">${cita.tipo}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Fisioterapeuta</div>
              <div class="info-value">${cita.fisioterapeutaNombre}</div>
            </div>
          </div>
          
          ${cita.evaluacionCompleta ? `
            <div class="evaluacion">
              <div class="evaluacion-title">🔬 Evaluación Médica</div>
              ${cita.evaluacionCompleta.diagnosticoPrincipal ? `<p><strong>📋 Diagnóstico Principal:</strong> ${cita.evaluacionCompleta.diagnosticoPrincipal}</p>` : ''}
              ${cita.evaluacionCompleta.sintomasReportados ? `<p><strong>🩺 Síntomas Reportados:</strong> ${cita.evaluacionCompleta.sintomasReportados}</p>` : ''}
              ${cita.evaluacionCompleta.evaluacionFisica ? `<p><strong>🔍 Evaluación Física:</strong> ${cita.evaluacionCompleta.evaluacionFisica}</p>` : ''}
              ${cita.evaluacionCompleta.planTratamiento ? `<p><strong>📝 Plan de Tratamiento:</strong> ${cita.evaluacionCompleta.planTratamiento}</p>` : ''}
              ${cita.evaluacionCompleta.recomendaciones ? `<p><strong>💡 Recomendaciones:</strong> ${cita.evaluacionCompleta.recomendaciones}</p>` : ''}
            </div>
          ` : ''}
          
          ${cita.archivos && cita.archivos.length > 0 ? `
            <div class="archivos">
              <div class="archivos-title">📎 Documentos Médicos (${cita.archivos.length})</div>
              ${cita.archivos.map(archivo => `
                <div class="archivo-item">
                  <strong>📄 ${archivo.nombreOriginal}</strong> - ${archivo.categoria || 'Sin categoría'}
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>
      `).join('')}
      
      <div class="footer">
        <p><strong>🏥 Clínica de Fisioterapia y Rehabilitación</strong></p>
        <p>Sistema de Gestión Clínica - Reporte Médico</p>
        <p><strong>⚠️ Confidencial - Uso Médico</strong></p>
        <p>Generado el ${fechaGeneracion.toLocaleDateString('es-ES')} a las ${fechaGeneracion.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</p>
      </div>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
  
  // Esperar a que se cargue el contenido y luego imprimir
  printWindow.onload = () => {
    printWindow.print();
  };
};
