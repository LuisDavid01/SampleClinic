import { z } from "zod";
const SurveySchema = z.object({
	idRecepcionista: z.number('Invalido').optional().nullable(),
	nombrePaciente: z.string(),
	rating: z.number().min(1).max(5),
	comentario: z.string().max(300).optional().nullable(),
	fecha: z.string().refine((date) => !isNaN(Date.parse(date))),
})

export type SurveyData = z.infer<typeof SurveySchema>

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL

export const submitSurvey = async (data: SurveyData) => {

	const res = await fetch(`${baseUrl}/encuesta`, {
		method: 'POST',
		headers: {
			"content-type": 'application/json',
		},
		body: JSON.stringify(data),
	})
	if (!res.ok) {
		throw new Error('Failed to fetch expedientes');
	}
	return res.json();
}
