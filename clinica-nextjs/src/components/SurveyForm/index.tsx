'use client'

import { useActionState, useState } from 'react'
import {
	Form,
	FormGroup,
	FormLabel,
	FormInput,
	FormTextarea,
	FormSelect,
	FormError,
} from '../FormWithActions'

import { submitSurvey } from '@/actions/survey'
import { Button } from '../ui/button'

const initialState: ActionResponse = {
	success: false,
	message: '',
	errors: undefined,
}

export const SurveyForm = ({ handleExitForm }) => {
	const [aswered, setAnswered] = useState(false);
	const [state, formAction, isPending] = useActionState<
		ActionResponse,
		FormData
	>(async (prevState: ActionResponse, formData: FormData) => {
		// Extract data from form
		const data = {
			idUsuario: Number(formData.get('idUsuario')),
			calificacion: Number(formData.get('calificacion')),
			comentario: formData.get('comentario')?.toString(),
		}

		try {
			const result = await submitSurvey(data)

			// Handle successful submission
			if (result.success) {
				setAnswered(true);

			}

			return result
		} catch (err) {
			return {
				success: false,
				message: (err as Error).message || 'An error occurred',
				errors: undefined,
			}
		}
	}, initialState)

	const rankingOptions = [
		{ value: '1', label: '1 - muy insatisfecho' },
		{ value: '2', label: '2 - insatisfecho' },
		{ value: '3', label: '3 - regular' },
		{ value: '4', label: '4 - satisfecho' },
		{ value: '5', label: '5 - muy satisfecho' },

	]
	const handleClose = () => {
		handleExitForm();
	};
	return (
		<div className="flex flex-col  h-full px-6  text-center justify-around">
			{aswered ? (
				<>
					<p className='text-lg lg:text-xl bg-green-100 text-foreground '>
						Gracias por contestar la encuesta! 😊
					</p>
					<div className="p-4">

						<Button
							variant="outline"
							onClick={handleClose}
							className="mt-4"
						>
							Cerrar encuesta
						</Button>
					</div>
				</>
			) :
				<>
					<h4 className='text-lg lg:text-xl font-semibold pb-3'>Encuesta de satisfaccion</h4>
					<Form action={formAction}>
						{state?.message && (
							<FormError
								className={`mb-4 ${state.success ? 'bg-green-100 text-green-800 border-green-300' : ''
									}`}
							>
								{state.message}
							</FormError>
						)}


						<FormInput

							id="idUsuario"
							name="idUsuario"
							value={"1"}
							type='hidden'
							required
						/>

						<FormGroup>
							<FormLabel htmlFor="comentario">Comentario</FormLabel>
							<FormTextarea
								id="comentario"
								name="comentario"
								placeholder="Si tienes algun comentario, sugerencia o queja, dejala aqui!😊"
								rows={4}
								defaultValue={''}

								disabled={isPending}
								aria-describedby="description-error"
								className={state?.errors?.comentario ? 'border-red-500' : ''}
							/>
							{state?.errors?.comentario && (
								<p id="description-error" className="text-sm text-red-500">
									{state.errors.comentario[0]}
								</p>
							)}
						</FormGroup>

						<div className="grid grid-cols-1 md:grid-cols-1 gap-4">
							<FormGroup>
								<FormLabel htmlFor="calificacion">Como fue tu experiencia</FormLabel>
								<FormSelect
									id="calificacion"
									name="calificacion"
									defaultValue={'regular'}
									options={rankingOptions}
									disabled={isPending}
									required
									aria-describedby="status-error"
									className={state?.errors?.ranking ? 'border-red-500' : ''}
								/>
								{state?.errors?.ranking && (
									<p id="status-error" className="text-sm text-red-500">
										{state.errors.ranking[0]}
									</p>
								)}
							</FormGroup>


						</div>

						<div className="flex justify-center  mt-6">

							<Button type="submit" disabled={isPending}>
								Enviar encuesta
							</Button>
						</div>
					</Form>
					<div className='flex justify-center'>
						<Button
							variant="link"
							size="sm"
							onClick={handleExitForm}
							className="items-center mt-4 text-sm hover:text-red-600"
						>
							<span>No, gracias</span>
						</Button>
					</div>
					<p className='text-xs px-6  text-center '>
						Tu opinion nos importa! Porfavor llena esta encuesta para mejorar nuestro servicio.
					</p>

				</>
			}
		</div>
	)
}
