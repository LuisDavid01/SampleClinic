import { useRef, useState } from "react"
import { Button } from "../ui/button"
import { Upload } from "lucide-react"
import { Progress } from "../ui/progress"

// File Upload Component
export const ConsentFileUpload = ({ onFileSelect }: { onFileSelect: (file: File) => void }) => {
	const [dragActive, setDragActive] = useState(false)
	const [uploadProgress, setUploadProgress] = useState(0)
	const [isUploading, setIsUploading] = useState(false)
	const fileInputRef = useRef<HTMLInputElement>(null)

	const handleDrag = (e: React.DragEvent) => {
		e.preventDefault()
		e.stopPropagation()
		if (e.type === "dragenter" || e.type === "dragover") {
			setDragActive(true)
		} else if (e.type === "dragleave") {
			setDragActive(false)
		}
	}

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault()
		e.stopPropagation()
		setDragActive(false)

		if (e.dataTransfer.files && e.dataTransfer.files[0]) {
			handleFile(e.dataTransfer.files[0])
		}
	}

	const handleFile = (file: File) => {
		if (file.size > 5 * 1024 * 1024) {
			alert("El archivo es demasiado grande. Máximo 10MB.")
			return
		}

		if (!['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)) {
			alert("Formato no válido. Solo PDF, JPG y PNG.")
			return
		}

		setIsUploading(true)
		// Simulate upload progress
		let progress = 0
		const interval = setInterval(() => {
			progress += 10
			setUploadProgress(progress)
			if (progress >= 100) {
				clearInterval(interval)
				setIsUploading(false)
				setUploadProgress(0)
				onFileSelect(file)
			}
		}, 100)
	}

	const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			handleFile(e.target.files[0])
		}
	}

	return (
		<div className="space-y-4">
			<div
				className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive
					? 'border-primary bg-primary/5'
					: 'border-input hover:border-primary/50'
					}`}
				onDragEnter={handleDrag}
				onDragLeave={handleDrag}
				onDragOver={handleDrag}
				onDrop={handleDrop}
			>
				<Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
				<p className="text-lg font-medium mb-2">Arrastra tu archivo aquí</p>
				<p className="text-sm text-muted-foreground mb-4">
					o haz clic para seleccionar
				</p>
				<Button
					variant="outline"
					onClick={() => fileInputRef.current?.click()}
					disabled={isUploading}
				>
					Seleccionar Archivo
				</Button>
				<input
					ref={fileInputRef}
					type="file"
					className="hidden"
					accept=".pdf,.jpg,.jpeg,.png"
					onChange={handleFileInput}
				/>
				<p className="text-xs text-muted-foreground mt-4">
					Formatos: PDF, JPG, PNG • Máximo: 10MB
				</p>
			</div>

			{isUploading && (
				<div className="space-y-2">
					<div className="flex justify-between text-sm">
						<span>Subiendo archivo...</span>
						<span>{uploadProgress}%</span>
					</div>
					<Progress value={uploadProgress} />
				</div>
			)}
		</div>
	)
}

