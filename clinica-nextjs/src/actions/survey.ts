import { z } from "zod";
const SurveySchema = z.object({
	idUsuario: z.number('Invalido'),
	calificacion: z.number().min(1).max(5),
	comentario: z.string().max(300).optional().nullable(),
})

export type SurveyData = z.infer<typeof SurveySchema>

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL

export const submitSurvey = async (data: SurveyData) => {
	console.log(data.idUsuario, data.calificacion, data.comentario)
	const res = await fetch(`${baseUrl}/encuestas`, {
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
