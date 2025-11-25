import { useEffect, useState } from "react"
import { Card, CardContent, } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

import { DialogContent, DialogHeader, DialogTitle, } from "@/components/ui/dialog"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import {
	FileText,
	FileSignature,
	X
} from 'lucide-react'

import { updateConsentimiento } from "@/actions/consentimientos"
import { useNotification } from "../UseNotification"
import { Archivo } from "@/types/Consent"
import { ConsentFileUpload } from "../ConsentFileUpload"
import { Badge } from "../ui/badge"
import { Label } from "../ui/label"
import { Checkbox } from "../ui/checkbox"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"
import { useQueryClient } from "@tanstack/react-query"
interface ConsentProps {
	expedienteId: number,
	pacienteId: number,
	consentimiento: Archivo,
	isEditing?: boolean,
	onClose: () => void,
}

export const EditConsentDialog = ({ onClose, expedienteId, pacienteId, consentimiento }: ConsentProps) => {
	const queryClient = useQueryClient();
	const [currentStep, setCurrentStep] = useState(1)
	const [readOnly, setReadOnly] = useState(true)
	const { showNotification } = useNotification()
	const [formData, setFormData] = useState({
		descripcion: consentimiento.descripcion ?? '',
		etiquetas: consentimiento.etiquetas
			? consentimiento.etiquetas
				.split(', ')
				.map(tag => tag.trim())
				.filter(tag => tag.length > 0)
			: [] as string[],
		esPublico: consentimiento.esPublico,
	})
	//si esta editando se reinicia el formulario
	useEffect(() => {
		console.log('El archivo  cambio')
		setCurrentStep(1)
	}, [consentimiento])
	// Reset form
	const resetForm = () => {
		setCurrentStep(1)
	}
	const updateFormData = (newData: Partial<typeof formData>) => {
		setFormData(prev => ({ ...prev, ...newData }));
	};
	// Handle form submission
	const handleUpdateConsent = async () => {
		if (!pacienteId || !expedienteId) return

		const data = {
			idPaciente: pacienteId,
			categoria: 'consentimiento' as const,
			idExpediente: expedienteId,
			descripcion: formData.descripcion,
			etiquetas: etiquetasToString(),
			esPublico: formData.esPublico,
		}
		console.log(consentimiento.idArchivo)
		const result = await updateConsentimiento(consentimiento.idUsuario, consentimiento!.idArchivo, data)

		console.log(result)
		handleDialogClose();
		resetForm()
		if (!result.success) {
			showNotification({
				type: 'error',
				title: 'error al editar el archivo',
				message: result.message
			})
		} else {
			showNotification({
				type: 'success',
				title: 'Exito editanto el archivo!',
				message: result.message
			})
			queryClient.invalidateQueries({
				queryKey: ['consentimientos'],
			});
		}
	}
	const addEtiqueta = (etiqueta: string) => {
		if (!etiqueta.trim() || formData.etiquetas.includes(etiqueta)) return;

		updateFormData({
			etiquetas: [...formData.etiquetas, etiqueta.trim()]
		});
	};

	const removeEtiqueta = (etiquetaAEliminar: string) => {
		updateFormData({
			etiquetas: formData.etiquetas.filter(etiqueta => etiqueta !== etiquetaAEliminar)
		});
	};

	// Función para convertir array de etiquetas a string para el FormData
	const etiquetasToString = () => formData.etiquetas.join(', ');
	const etiquetasToArray = (etiquetas: string) => etiquetas.split(', ');
	const handleDialogClose = () => {
		onClose();
	}


	return (
		<>
			<DialogHeader>
				<DialogTitle>Editar consentimiento</DialogTitle>
			</DialogHeader>

			{/* Step indicator */}
			<div className="flex items-center justify-center space-x-4 mb-6">
				{[1, 2].map((step) => (
					<div key={step} className="flex items-center">
						<div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep >= step
							? 'bg-primary text-primary-foreground'
							: 'bg-muted text-muted-foreground'
							}`}>
							{step}
						</div>
						{step < 2 && (
							<div className={`w-12 h-0.5 ${currentStep > step ? 'bg-primary' : 'bg-muted'
								}`} />
						)}
					</div>
				))}
			</div>

			{/* FORMULARIO PRINCIPAL */}
			<form action={handleUpdateConsent} className="space-y-6">
				{/* PASO 1: Información del documento y detalles */}
				{currentStep === 1 && (
					<div className="space-y-4">
						<h3 className="text-lg font-semibold">Paso 1: Documento con firma</h3>

						{/* Información del archivo */}
						<Alert>
							<FileText className="h-4 w-4" />
							<AlertDescription>
								Archivo cargado: <strong>{consentimiento.nombreArchivo}</strong>
							</AlertDescription>
						</Alert>

						{/* Descripción */}
						<div className="space-y-2">
							<Label htmlFor="descripcion">Descripción</Label>
							<Textarea
								id="descripcion"
								name="descripcion"
								value={formData.descripcion}
								onChange={(e) => updateFormData({ descripcion: e.target.value })}
								placeholder="Describe el contenido del consentimiento..."
								className="min-h-[100px]"
							/>
							<p className="text-sm text-muted-foreground">
								{formData.descripcion.length}/500 caracteres
							</p>
						</div>

						{/* Etiquetas */}
						<div className="space-y-2">
							<Label>Etiquetas</Label>
							<div className="flex gap-2 mb-2">
								<Input
									placeholder="Agregar etiqueta (ej: consentimiento, médico, firma)"
									onKeyDown={(e) => {
										if (e.key === 'Enter' && e.currentTarget.value) {
											e.preventDefault();
											addEtiqueta(e.currentTarget.value);
											e.currentTarget.value = '';
										}
									}}
									className="max-w-xs"
								/>
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={() => {
										const input = document.querySelector('input[placeholder*="etiqueta"]') as HTMLInputElement;
										if (input?.value) addEtiqueta(input.value);
									}}
								>
									Agregar
								</Button>
							</div>

							{/* Lista de etiquetas */}
							{formData.etiquetas.length > 0 ? (
								<div className="flex flex-wrap gap-1">
									{formData.etiquetas.map((etiqueta) => (
										<Badge
											key={etiqueta}
											variant="secondary"
											className="flex items-center gap-1 px-2 py-1"
										>
											{etiqueta}
											<Button
												type="button"
												variant="ghost"
												size="sm"
												className="h-4 w-4 p-0"
												onClick={() => removeEtiqueta(etiqueta)}
											>
												<X className="h-3 w-3" />
											</Button>
										</Badge>
									))}
								</div>
							) : (
								<p className="text-sm text-muted-foreground">No hay etiquetas agregadas</p>
							)}
						</div>

						{/* Visibilidad */}
						<div className="space-y-2">
							<Label className="flex items-center gap-2">
								<Checkbox
									id="esPublico"
									name="esPublico"
									checked={formData.esPublico}
									onCheckedChange={(checked) => updateFormData({ esPublico: !!checked })}
								/>
								¿Es público?
							</Label>
							<p className="text-sm text-muted-foreground">
								{formData.esPublico
									? 'Este consentimiento será visible para todos los usuarios'
									: 'Solo personal autorizado puede ver este consentimiento'
								}
							</p>
						</div>

						<div className="flex justify-end">
							<Button
								type="button"
								onClick={() => setCurrentStep(2)}
								disabled={!formData.descripcion.trim()} // Deshabilitar si no hay descripción
							>
								Siguiente
							</Button>
						</div>
					</div>
				)}

				{/* PASO 2: Revisión */}
				{currentStep === 2 && (
					<div className="space-y-4">
						<h3 className="text-lg font-semibold">Paso 2: Revisión y Confirmación</h3>

						<Card>
							<CardContent className="p-6 space-y-4">
								{/* Información del paciente (datos de lectura) */}
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<h4 className="font-medium text-sm text-muted-foreground">PACIENTE</h4>
									</div>

									<div>
										<h4 className="font-medium text-sm text-muted-foreground">VISIBILIDAD</h4>
										<Badge variant={formData.esPublico ? "default" : "secondary"}>
											{formData.esPublico ? "Público" : "Privado"}
										</Badge>
									</div>
								</div>

								<Separator />

								{/* Información del documento */}
								<div>
									<h4 className="font-medium text-sm text-muted-foreground mb-2">DOCUMENTO</h4>
									<div className="flex items-center gap-2 mb-2">
										<FileText className="w-4 h-4" />
										<span className="font-medium">{consentimiento.nombreArchivo}</span>
									</div>

									{/* Descripción */}
									<div className="mb-4">
										<h5 className="font-medium text-sm mb-1">Descripción</h5>
										<p className="text-sm text-muted-foreground whitespace-pre-wrap">
											{formData.descripcion || 'Sin descripción'}
										</p>
									</div>

									{/* Etiquetas */}
									{formData.etiquetas.length > 0 && (
										<div>
											<h5 className="font-medium text-sm mb-1">Etiquetas</h5>
											<div className="flex flex-wrap gap-1">
												{formData.etiquetas.map((etiqueta) => (
													<Badge key={etiqueta} variant="outline" className="text-xs">
														{etiqueta}
													</Badge>
												))}
											</div>
										</div>
									)}
								</div>
							</CardContent>
						</Card>

						{/* Campos ocultos para enviar los datos del formulario */}
						<input type="hidden" name="descripcion" value={formData.descripcion} />
						<input type="hidden" name="etiquetas" value={etiquetasToString()} />
						<input type="hidden" name="esPublico" value={formData.esPublico ? 'on' : 'off'} />

						{/* Botones de navegación */}
						<div className="flex justify-between">
							<Button
								type="button"
								variant="outline"
								onClick={() => setCurrentStep(1)}
							>
								Anterior
							</Button>

							<Button type="submit">
								<FileSignature className="w-4 h-4 mr-2" />
								Confirmar cambios
							</Button>
						</div>
					</div>
				)}
			</form>
		</>
	);

}
