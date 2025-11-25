'use client'

import { useQuery } from '@tanstack/react-query'
import { Expediente } from '../../types/Expediente'
import { getExpedienteByID } from '../../actions/expedientes'
import NewExpediente from '../NewExpediente'
interface ExpedienteByIDProps {
	id: string | number;
	isReadOnly?: boolean;
}

export const ExpedienteByID = ({ id, isReadOnly = false }: ExpedienteByIDProps) => {
	const { isLoading, data } = useQuery<Expediente>({
		queryKey: [`expediente`, id],
		queryFn: async () => {
			const res = await getExpedienteByID(Number(id));
			console.log(res);
			return res
		},
		staleTime: 0,
	})

	if (isLoading) return (<div> Cargando...</div >)
	if (data) {
		return <NewExpediente expediente={data} isEditing={!isReadOnly} />
	}

	return <div>No encontre el expediente</div>
}
