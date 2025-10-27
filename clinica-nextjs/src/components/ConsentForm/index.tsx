import { useEffect, useState } from "react"
import { Card, CardContent, } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

import { DialogContent, DialogHeader, DialogTitle, } from "@/components/ui/dialog"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import {
	FileText,
	FileSignature
} from 'lucide-react'

import { newConsentimiento } from "@/actions/consentimientos"
import { useNotification } from "../UseNotification"
import { ConsentFileUpload } from "../ConsentFileUpload"
import { useQueryClient } from "@tanstack/react-query"
interface ConsentProps {
	expedienteId: number,
	pacienteId: number,
	onClose: () => void,
}

export const ConsentDialog = ({ onClose, expedienteId, pacienteId }: ConsentProps) => {
	const [currentStep, setCurrentStep] = useState(1)
	const [uploadedFile, setUploadedFile] = useState<File | null>(null)
	const { showNotification } = useNotification()
	const queryClient = useQueryClient();

	// Reset form
	const resetForm = () => {
		setCurrentStep(1)
		setUploadedFile(null)
	}

	// Handle form submission
	const handleSubmitConsent = async () => {
		if (!pacienteId || !expedienteId || !uploadedFile) return


		const data = {
			idPaciente: pacienteId,
			categoria: 'consentimiento' as const,
			idExpediente: expedienteId,
			files: uploadedFile
		}
		const result = await newConsentimiento(data)

		console.log(result)
		handleDialogClose();
		resetForm()
		if (!result.success) {
			showNotification({
				type: 'error',
				title: 'error al subir el archivo',
				message: result.message
			})
		} else {
			showNotification({
				type: 'success',
				title: 'Exito!',
				message: result.message
			})
			queryClient.invalidateQueries({
				queryKey: ['consentimientos'],
			});
		}
	}

	const handleDialogClose = () => {
		onClose();
	}
	return (
		<>
			<DialogHeader>
				<DialogTitle>Crear Nuevo Consentimiento </DialogTitle>
			</DialogHeader>

			{/* Step indicator */}
			<div className="flex items-center justify-center space-x-4 mb-6" >
				{
					[1, 2].map((step) => (
						<div key={step} className="flex items-center" >
							<div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep >= step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
								}`} >
								{step}
							</div>
							{step < 2 && <div className={`w-12 h-0.5 ${currentStep > step ? 'bg-primary' : 'bg-muted'}`} />}
						</div>
					))}
			</div>




			{/* Step 1: Document/Signature */}
			{
				currentStep === 1 && (
					<div className="space-y-4" >
						<h3 className="text-lg font-semibold" > Paso 1: Documento con firma </h3>

						<div className="space-y-4" >
							<ConsentFileUpload onFileSelect={setUploadedFile} />
							{
								uploadedFile && (
									<Alert>
										<FileText className="h-4 w-4" />
										<AlertDescription>
											Archivo cargado: {uploadedFile.name}
										</AlertDescription>
									</Alert>
								)
							}
						</div>

						< div className="space-y-2" >

						</div>
						< div className="flex justify-between" >

							<Button
								onClick={() => setCurrentStep(2)}
								disabled={!uploadedFile}
							>
								Siguiente
							</Button>
						</div>
					</div>
				)}

			{/* Step 2: Review */}
			{
				currentStep === 2 && (
					<div className="space-y-4" >
						<h3 className="text-lg font-semibold" > Paso 2: Revisión y Confirmación </h3>
						< Card >
							<CardContent className="p-6 space-y-4" >
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4" >
									<div>
										<h4 className="font-medium text-sm text-muted-foreground" > PACIENTE </h4>
										<p className="font-medium" > {"paciente"} </p>
										<p className="text-sm text-muted-foreground" > {"cedula"} </p>
									</div>
								</div>
								< Separator />
								<div>
									<h4 className="font-medium text-sm text-muted-foreground mb-2" > DOCUMENTO </h4>
									{
										uploadedFile && (
											<div className="flex items-center gap-2" >
												<FileText className="w-4 h-4" />
												<span>{uploadedFile.name} </span>
											</div>
										)
									}

								</div>

							</CardContent>
						</Card>
						< div className="flex justify-between" >
							<Button variant="outline" onClick={() => setCurrentStep(1)
							}>
								Anterior
							</Button>
							< form action={handleSubmitConsent} >
								<Button type="submit" >
									<FileSignature className="w-4 h-4 mr-2" />
									Crear Consentimiento
								</Button>
							</form>
						</div>
					</div>
				)}
		</>
	);
}
