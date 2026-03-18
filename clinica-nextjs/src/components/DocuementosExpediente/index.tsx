'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { useDropzone } from 'react-dropzone'
import {
	Trash2, Upload, FileText, Image, FlaskConical, File, Download, ChevronRight,
	ChevronLeft,
	ChevronsLeft,
	ChevronsRight,
} from 'lucide-react'
import clsx from 'clsx'
import { createArchivo, deleteArchivo, downloadArchivo, getArchivosByUser } from '@/actions/archivos'
import { Archivo } from '@/types/Consent'
import { useQueries, useQueryClient } from '@tanstack/react-query'
import { useNotification } from '../UseNotification'







export default function DocumentosExpediente({ expedienteId,
	pacienteId }:
	{
		expedienteId: number,
		pacienteId: number
	}) {
	const { showNotification } = useNotification()
	const queryClient = useQueryClient()
	const [files, setFiles] = useState<File[]>([])
	const [isUploading, setIsUploading] = useState(false)
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);
	const results = useQueries({
		queries: [
			{
				queryKey: ['archivos', page, limit, pacienteId],
				queryFn: async () => {
					// Obtener el usuario actual desde la base de datos
					console.log("id del paciente", pacienteId)
					const res = await getArchivosByUser(pacienteId, page, limit)
					const archivos = res.data
						.filter((
							archivo: Archivo) =>
							archivo.categoria === 'archivo' && archivo.activo === true
						) ?? [];
					console.log(archivos);
					return archivos;
				},
				staleTime: 60 * 1000,
			},

		]
	});
	const isLoading = results.some((r) => r.isLoading);
	const archivos = results[0].data ?? [];

	const onDrop = (acceptedFiles: File[]) => {

		setFiles(prev => [...prev, ...acceptedFiles])
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



	const handleGuardarDocumentos = async () => {
		setIsUploading(true)
		try {
			const data = {
				idPaciente: pacienteId,
				idExpediente: expedienteId,
				categoria: 'archivo' as const,
				files: files as File[]
			}

			const result = await createArchivo(data)

			if (!result.success) {
				showNotification({
					type: 'error',
					title: 'Error al subir archivos',
					message: result.message
				})
			} else {
				showNotification({
					type: 'success',
					title: 'Archivos subidos',
					message: `${files.length === 1 ? 'Se ha' : 'Se han'} subido ${files.length} archivo${files.length !== 1 ? 's' : ''} correctamente`
				})

				queryClient.invalidateQueries({
					queryKey: ['archivos', page, limit, pacienteId]
				})
			}

			setFiles([])
		} catch (error) {
			console.error('Error al guardar files:', error)
			showNotification({
				type: 'error',
				title: 'Error',
				message: 'Ocurrió un error al subir los archivos'
			})
		} finally {
			setIsUploading(false)
		}
	}

	return (
		<div className="space-y-6">


			{/* Archivos ya subidos */}
			{archivos.length > 0 && (
				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<h3 className="text-sm font-medium text-text-primary">
							Documentos guardados ({archivos.length})
						</h3>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
						{archivos.map((archivo: Archivo) => {
							const IconComponent = getFileIconByExtension(archivo.extension)
							return (
								<div
									key={archivo.idArchivo + archivo.nombreOriginal}
									className="border border-border rounded-lg p-4 bg-card hover:bg-muted-foreground/10 transition-colors"
								>
									<div className="flex items-start gap-3">
										{/* Icono del archivo */}
										<div className="p-2 bg-accent/10 rounded-lg">
											{IconComponent}
										</div>

										{/* Contenido */}
										<div className="flex-1 min-w-0">
											{/* Encabezado con tipo y acciones */}
											<div className="flex items-start justify-between mb-2">
												<div className="flex items-center gap-2 flex-wrap">
												</div>
												<div className="flex gap-1 ml-2">
													<Button
														size="sm"
														variant="ghost"
														className="h-8 w-8 p-0"
														onClick={async () => {

															const response = await downloadArchivo(pacienteId, archivo.idArchivo)
															if (response.success === false) {
																alert(response.message)
																return
															}
															const blobArchivo = response.data

															const url = window.URL.createObjectURL(blobArchivo!)
															const link = document.createElement('a')

															link.href = url
															link.download = archivo.nombreArchivo
															link.rel = 'noopener noreferrer' // Para seguridad

															// Append al body y click automático
															document.body.appendChild(link)
															link.click()

															// Cleanup inmediato
															document.body.removeChild(link)
															window.URL.revokeObjectURL(url)

														}}
													>
														<Download className="h-4 w-4" />
													</Button>
													<Button
														size="sm"
														variant="destructive"
														className="h-8 w-8 p-0 "
														onClick={async () => {
															await deleteArchivo(archivo.idArchivo, pacienteId)
															results[0].refetch()
														}}
													>
														<Trash2 className="h-4 w-4" />
													</Button>
												</div>
											</div>

											{/* Nombre del archivo */}
											<h4 className="font-medium text-text-primary text-sm mb-1 truncate">
												{archivo.nombreArchivo}
											</h4>

											{/* Detalles */}
											<div className="text-xs text-text-primary space-y-1">
												<p>{formatFileSize(archivo.tamanoArchivo)}</p>
												<p>Subido el {formatearFecha(archivo.fechaSubida)}</p>
											</div>
										</div>
									</div>
								</div>
							)
						})}

					</div>
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
			{files.length > 0 && (
				<div className="space-y-3">
					<h3 className="text-sm font-medium text-text-primary">
						Archivos cargados ({files.length})
					</h3>

					<div className="space-y-2">
						{files.map((doc) => (
							<Card key={doc.name + doc.type} className="transition-all hover:shadow-md">
								<CardContent className="p-4">
									<div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
										<div className="flex items-center gap-3 flex-1 min-w-0">
											{getFileIcon(doc.type)}
											<div className="flex-1 min-w-0">
												<p className="text-sm font-medium text-text-primary truncate">
													{doc.name}
												</p>
												<p className="text-xs text-muted-foreground">
													{formatFileSize(doc.size)}
												</p>
											</div>
										</div>

										<div className="flex items-center gap-2 w-full md:w-auto">

											<Button
												variant="ghost"
												size="icon"
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
			{files.length > 0 && (
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
							'Guardar files'
						)}
					</Button>
				</div>
			)}

			{files.length === 0 && (
				<div className="text-center py-8">
					<FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
					<p className="text-sm text-muted-foreground">
						No hay files cargados
					</p>
				</div>
			)}
		</div>
	)
}
