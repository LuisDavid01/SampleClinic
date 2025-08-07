'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { useDropzone } from 'react-dropzone'
import { Trash2, Upload, FileText, Image, FlaskConical, File, Download } from 'lucide-react'
import clsx from 'clsx'

interface ArchivoGuardado {
  id: string
  nombre: string
  extension: string
  tipo: 'Receta' | 'Imagen' | 'Laboratorio' | 'Otro'
  fechaSubida: string
  tamaño: string
  url: string
}

// Datos de prueba - archivos ya subidos
const archivosMock: ArchivoGuardado[] = [
  {
    id: '1',
    nombre: 'Receta_Antibioticos_Juan_Perez',
    extension: 'pdf',
    tipo: 'Receta',
    fechaSubida: '2024-01-15',
    tamaño: '245 KB',
    url: '/mock/receta-antibioticos.pdf'
  },
  {
    id: '2',
    nombre: 'Radiografia_Torax_Lateral',
    extension: 'jpg',
    tipo: 'Imagen',
    fechaSubida: '2024-01-14',
    tamaño: '1.2 MB',
    url: '/mock/radiografia-torax.jpg'
  },
  {
    id: '3',
    nombre: 'Resultados_Hemograma_Completo',
    extension: 'pdf',
    tipo: 'Laboratorio',
    fechaSubida: '2024-01-12',
    tamaño: '156 KB',
    url: '/mock/hemograma-completo.pdf'
  },
  {
    id: '4',
    nombre: 'Consentimiento_Informado_Firmado',
    extension: 'docx',
    tipo: 'Otro',
    fechaSubida: '2024-01-10',
    tamaño: '89 KB',
    url: '/mock/consentimiento-informado.docx'
  }
]

interface Documento {
  file: File
  tipo: 'Receta' | 'Imagen' | 'Laboratorio' | 'Otro'
  id: string
}

const tiposDocumento = [
  { value: 'Receta', label: 'Receta', icon: FileText },
  { value: 'Imagen', label: 'Imagen', icon: Image },
  { value: 'Laboratorio', label: 'Laboratorio', icon: FlaskConical },
  { value: 'Otro', label: 'Otro', icon: File }
] as const

export default function DocumentosExpediente() {
  const [documentos, setDocumentos] = useState<Documento[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const onDrop = (acceptedFiles: File[]) => {
    const nuevosDocs = acceptedFiles.map(file => ({
      file,
      tipo: 'Otro' as const,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }))
    setDocumentos(prev => [...prev, ...nuevosDocs])
  }

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    maxSize: 5 * 1024 * 1024, // 5MB
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    multiple: true
  })

  const actualizarTipo = (id: string, tipo: 'Receta' | 'Imagen' | 'Laboratorio' | 'Otro') => {
    setDocumentos(prev => 
      prev.map(doc => doc.id === id ? { ...doc, tipo } : doc)
    )
  }

  const eliminarDocumento = (id: string) => {
    setDocumentos(prev => prev.filter(doc => doc.id !== id))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase()
    switch (extension) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-500" />
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp':
        return <Image className="w-5 h-5 text-blue-500" />
      case 'doc':
      case 'docx':
        return <FileText className="w-5 h-5 text-blue-600" />
      default:
        return <File className="w-5 h-5 text-gray-500" />
    }
  }

  const getTipoIcon = (tipo: string) => {
    const tipoInfo = tiposDocumento.find(t => t.value === tipo)
    if (!tipoInfo) return <File className="w-4 h-4" />
    const IconComponent = tipoInfo.icon
    return <IconComponent className="w-4 h-4" />
  }

  const getFileIconByExtension = (extension: string) => {
    switch (extension.toLowerCase()) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-500" />
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp':
        return <Image className="w-5 h-5 text-blue-500" />
      case 'doc':
      case 'docx':
        return <FileText className="w-5 h-5 text-blue-600" />
      default:
        return <File className="w-5 h-5 text-gray-500" />
    }
  }

  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha)
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const handleDescargarArchivo = (archivo: ArchivoGuardado) => {
    // Simular descarga - en producción sería una llamada real al servidor
    console.log('Descargando archivo:', archivo.nombre)
    // window.open(archivo.url, '_blank')
  }

  const handleGuardarDocumentos = async () => {
    setIsUploading(true)
    try {
      // Aquí iría la lógica para subir los archivos al servidor
      // Por ejemplo, usando FormData y fetch
      console.log('Guardando documentos:', documentos)
      
      // Simular delay de subida
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Limpiar la lista después de guardar
      setDocumentos([])
    } catch (error) {
      console.error('Error al guardar documentos:', error)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <FileText className="w-5 h-5 text-text-primary" />
        <h2 className="text-lg font-semibold text-text-primary">
          Documentos del expediente
        </h2>
      </div>

      {/* Archivos ya subidos */}
      {archivosMock.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-text-primary">
              Documentos guardados ({archivosMock.length})
            </h3>
          </div>
          
          <div className="grid gap-3">
            {archivosMock.map((archivo) => (
              <Card key={archivo.id} className="transition-all hover:shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {getFileIconByExtension(archivo.extension)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs px-2 py-1 bg-accent text-white rounded-full font-medium">
                            {archivo.tipo}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-text-primary truncate">
                          {archivo.nombre}.{archivo.extension}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                          <span>{archivo.tamaño}</span>
                          <span>•</span>
                          <span>Subido el {formatearFecha(archivo.fechaSubida)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDescargarArchivo(archivo)}
                      className="flex items-center gap-2 shrink-0"
                    >
                      <Download className="w-4 h-4" />
                      <span className="hidden sm:inline">Descargar</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Zona de carga */}
      <Card>
        <CardContent className="p-0">
          <div
            {...getRootProps()}
            className={clsx(
              'border-2 border-dashed rounded-[var(--radius)] p-8 text-center cursor-pointer transition-all duration-200',
              isDragActive
                ? 'border-primary bg-accent scale-[1.02]'
                : 'border-muted bg-card hover:border-accent/50 hover:bg-primary/5'
            )}
          >
            <input {...getInputProps()} />
            <Upload 
              className={clsx(
                'mx-auto mb-3 transition-colors',
                isDragActive ? 'text-primary' : 'text-muted-foreground'
              )} 
              size={40} 
            />
            <p className="text-sm font-medium text-text-primary mb-1">
              {isDragActive 
                ? 'Suelta los archivos aquí' 
                : 'Arrastra y suelta archivos aquí o haz clic para seleccionar'
              }
            </p>
            <p className="text-xs text-muted-foreground">
              Tamaño máximo: 5MB por archivo
            </p>
            <p className="text-xs text-muted-foreground">
              Formatos: PDF, JPG, PNG, DOC, DOCX
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Errores de archivos rechazados */}
      {fileRejections.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-red-800 mb-2">
              Algunos archivos no pudieron ser cargados:
            </p>
            <ul className="text-xs text-red-600 space-y-1">
              {fileRejections.map(({ file, errors }) => (
                <li key={file.name}>
                  <strong>{file.name}</strong>: {errors.map(e => e.message).join(', ')}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Lista de archivos */}
      {documentos.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-text-primary">
            Archivos cargados ({documentos.length})
          </h3>
          
          <div className="space-y-2">
            {documentos.map((doc) => (
              <Card key={doc.id} className="transition-all hover:shadow-md">
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {getFileIcon(doc.file.name)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">
                          {doc.file.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(doc.file.size)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 w-full md:w-auto">
                      <Select
                        value={doc.tipo}
                        onValueChange={(value: 'Receta' | 'Imagen' | 'Laboratorio' | 'Otro') => 
                          actualizarTipo(doc.id, value)
                        }
                      >
                        <SelectTrigger className="w-full md:w-[160px]">
                          <div className="flex items-center gap-2">
                            {getTipoIcon(doc.tipo)}
                            <SelectValue placeholder="Tipo" />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          {tiposDocumento.map((tipo) => {
                            const IconComponent = tipo.icon
                            return (
                              <SelectItem key={tipo.value} value={tipo.value}>
                                <div className="flex items-center gap-2">
                                  <IconComponent className="w-4 h-4" />
                                  {tipo.label}
                                </div>
                              </SelectItem>
                            )
                          })}
                        </SelectContent>
                      </Select>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => eliminarDocumento(doc.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 size={18} />
                        <span className="sr-only">Eliminar documento</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Botón de guardar */}
      {documentos.length > 0 && (
        <div className="flex justify-end pt-4 border-t">
          <Button 
            onClick={handleGuardarDocumentos}
            disabled={isUploading}
            className="min-w-[140px]"
          >
            {isUploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Guardando...
              </>
            ) : (
              'Guardar documentos'
            )}
          </Button>
        </div>
      )}

      {documentos.length === 0 && (
        <div className="text-center py-8">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            No hay documentos cargados
          </p>
        </div>
      )}
    </div>
  )
}
