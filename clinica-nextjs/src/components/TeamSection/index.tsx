
"use client";

import { getEquipo } from "@/actions/equipo";
import { teamProfile } from "@/types/perfiles";
import { apiEndpoints, useApiClient } from "@/utils/apiClient";
import { useQuery } from "@tanstack/react-query";
import { Users } from "lucide-react";
import { useState } from "react"
export const TeamSection = () => {

	/*
	const teamMembers = [
		{
			id: 1,
			name: "Lic. Esteban José Porras Balladares",
			role: "Fisioterapeuta Principal",
			experience: "12+ años",
			description:
				"Especialista en terapia manual y rehabilitación deportiva con más de 12 años de experiencia.",
			specialties: ["Terapia Manual", "Rehabilitación Deportiva", "Electroterapia"],
			focusAreas: [
				"Rehabilitación en lesiones de Ligamento Cruzado Anterior",
				"Reemplazos de Rodilla y Cadera",
				"Rehabilitación Deportiva",
				"Traumatología y Ortopedia (Fracturas, Postoperatorios)",
				"Epicondilalgia Lateral y Medial (Codo de Tenista y de Golfista)",
			],
			bgGradient: "from-primary/20 via-accent/10 to-primary/5",
		},
		{
			id: 2,
			name: "Msc. María Eugenia Centeno Ávila",
			role: "Especialista en Rehabilitación",
			experience: "8+ años",
			description:
				"Apasionada por ayudar a los demás, enfocada en la recuperación funcional y post-quirúrgica.",
			specialties: ["Post-Quirúrgica", "Lesiones Musculares", "Kinesiología"],
			focusAreas: [
				"Disfunciones en Articulación Temporo-Mandibular (ATM)",
				"Rehabilitación en lesiones de Hombro",
				"Rehabilitación en Lumbalgias (Dolor de espalda baja)",
				"Máster en Rehabilitación de la Persona Adulta Mayor",
			],
			bgGradient: "from-accent/20 via-primary/10 to-accent/5",
		},
		{
			id: 3,
			name: "Dra. Ana Rodríguez",
			role: "Terapeuta Especializada",
			experience: "10+ años",
			description:
				"Certificada en técnicas de electroterapia y ejercicios terapéuticos personalizados.",
			specialties: ["Electroterapia", "Ejercicios Terapéuticos", "Masoterapia"],
			focusAreas: [
				"Terapias de electroestimulación",
				"Programas personalizados de ejercicio terapéutico",
				"Masoterapia avanzada para recuperación muscular",
			],
			bgGradient: "from-accent/20 via-primary/10 to-accent/5",
		},
	];
*/

	const apiClient = useApiClient();
	const { isLoading, data: teamData } = useQuery<{
		usuarios: teamProfile[]
		total: number
		totalPaginas: number
	}>({
		queryKey: ['team-members'],
		queryFn: async () => {
			const res = await getEquipo(1, 10, "")
			console.log(res)
			return {
				usuarios: res.perfiles,
				total: res.pagination.total,
				totalPaginas: res.pagination.pages,
			}
		},
		staleTime: 60 * 1000,
	})

	const teamMembers = teamData?.usuarios || []

	// 🔹 Estados
	const [filtered, setFiltered] = useState(teamMembers);
	const [search, setSearch] = useState("");
	const [activeTreatment, setActiveTreatment] = useState("");
	const filteredMembers = (
		teamMembers
			?.filter(m =>
				m.medico.nombre.includes(search) ||
				m.especialidad.includes(search) ||
				m.medico.apellido1.includes(search)
					)
					.filter(m => m.servicios.some(s => s.nombreServicio.includes(activeTreatment))
)

	);
	// 🔹 Todas las especialidades únicas
	const allTreatments = Array.from(new Set(teamMembers.flatMap((m) => m.servicios)));

	// 🔹 Filtrado
	const handleSearch = (query: string) => {
		setSearch(query);
	};

	const handleTreatmentClick = (service: string) => {
		const newTreatment = activeTreatment === service ? "" : service;
		setActiveTreatment(newTreatment);
	};

	return (
		<section className="p-4">


			{/* 🔎 Buscador */}
			<div className="flex justify-center mb-6">
				<input
					type="text"
					placeholder="Buscar por nombre, rol, especialidad o área de enfoque..."
					value={search}
					onChange={(e) => handleSearch(e.target.value)}
					className="border p-2 rounded w-full md:w-1/2 
                     bg-background text-text-primary 
                     placeholder-gray-400"
				/>
			</div>
			<div className="flex flex-wrap gap-2 justify-center mb-10">
				{allTreatments.map((t: any) => (
					<button
						key={`servicio-${t.idServicio}${t.nombreServicio}`}
						onClick={() => handleTreatmentClick(t.nombreServicio)}
						className={`px-4 py-2 rounded-full border transition ${activeTreatment === t.nombreServicio
							? "bg-blue-500 text-white border-blue-500"
							: "bg-card text-text-primary hover:bg-card/80"
							}`}
					>
						{t.nombreServicio}
					</button>
				))}
			</div>


			{/* 👨‍⚕️ Resultados */}
			{isLoading ? (
				<div>
					cargando...
				</div>
			)

				:
				(filteredMembers && filteredMembers.length > 0) ? (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
						{filteredMembers.map((member, index) => (
							<div
								key={member.idPerfil}
								className={`group relative bg-card/50 backdrop-blur-sm rounded-3xl p-8 border 
              border-card-foreground/10 transition-all 
              duration-500 hover:shadow-2xl hover:shadow-primary/10 
              hover:-translate-y-2`}
								style={{ animationDelay: `${index * 0.2}s` }}
							>

								<div className="relative z-10 text-center space-y-4">
									{/* Avatar */}
									<div className="relative mb-6">
										<div className="w-36 h-36 mx-auto rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-105 transition-transform duration-300">
											{member.fotografia != '' ? (
												<img src={member.fotografia} className="rounded" />
											) : (
												<img src={'/user-default.webp'} className="rounded" />
											)
											}
										</div>

									</div>

									{/* Info */}
									<h3 className="text-2xl font-bold text-text-primary">{member.medico.nombre}</h3>
									<p className="text-text-accent font-semibold text-lg break-words ">{member.especialidad}</p>
									<p className="text-text-primary/70 leading-relaxed text-sm">{member.experienciaProfesional}</p>

									{/* Especialidades */}
																	<div className="flex flex-wrap gap-2 justify-center mt-4">
									{member.servicios.map((servicio, idx) => (
										<span
											key={`${idx}${servicio.nombreServicio}`}
											className="px-3 py-1 bg-primary/10 text-text-primary text-xs font-medium rounded-full border border-primary/20"
										>
											{servicio.nombreServicio}
										</span>
									))}
								</div>

								</div>
							</div>
						))}
					</div>
				) : (
					<p className="text-red-500 text-center mt-6">
						No se encontraron profesionales con los criterios seleccionados.
					</p>
				)}
		</section>
	);
};

