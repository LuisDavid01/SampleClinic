"use client";

import { Users } from "lucide-react";
import { useState } from "react";

export const TeamSection = () => {
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
      bgGradient: "from-complementario/20 via-secondary/10 to-complementario/5",
    },
  ];

  // 🔹 Estados
  const [filtered, setFiltered] = useState(teamMembers);
  const [search, setSearch] = useState("");
  const [activeTreatment, setActiveTreatment] = useState("");

  // 🔹 Todas las especialidades únicas
  const allTreatments = Array.from(new Set(teamMembers.flatMap((m) => m.specialties)));

  // 🔹 Filtrado
  const handleSearch = (query: string) => {
    setSearch(query);
    applyFilters(query, activeTreatment);
  };

  const handleTreatmentClick = (treatment: string) => {
    const newTreatment = activeTreatment === treatment ? "" : treatment;
    setActiveTreatment(newTreatment);
    applyFilters(search, newTreatment);
  };

  const applyFilters = (query: string, treatment: string) => {
    let results = teamMembers;

    if (query) {
      results = results.filter(
        (m) =>
          m.name.toLowerCase().includes(query.toLowerCase()) ||
          m.role.toLowerCase().includes(query.toLowerCase()) ||
          m.specialties.some((s) =>
            s.toLowerCase().includes(query.toLowerCase())
          ) ||
          m.focusAreas.some((f) =>
            f.toLowerCase().includes(query.toLowerCase())
          )
      );
    }

    if (treatment) {
      results = results.filter((m) => m.specialties.includes(treatment));
    }

    setFiltered(results);
  };

  return (
    <section className="p-6">
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">
        Nuestro Equipo <span className="text-accent">Profesional</span>
      </h2>

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

      {/* 🎯 Filtros tipo chips */}
      <div className="flex flex-wrap gap-2 justify-center mb-10">
        {allTreatments.map((t) => (
          <button
            key={t}
            onClick={() => handleTreatmentClick(t)}
            className={`px-4 py-2 rounded-full border transition ${
              activeTreatment === t
                ? "bg-blue-500 text-white border-blue-500"
                : "bg-card text-text-primary hover:bg-card/80"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* 👨‍⚕️ Resultados */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {filtered.map((member, index) => (
            <div
              key={member.id}
              className={`group relative bg-card/50 backdrop-blur-sm rounded-3xl p-8 border 
              border-card-foreground/10 transition-all 
              duration-500 hover:shadow-2xl hover:shadow-primary/10 
              hover:-translate-y-2`}
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${member.bgGradient} rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
              ></div>

              <div className="relative z-10 text-center space-y-4">
                {/* Avatar */}
                <div className="relative mb-6">
                  <div className="w-36 h-36 mx-auto rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-105 transition-transform duration-300">
                    <Users className="w-12 h-12 text-text-primary" />
                  </div>
                  <div className="absolute -top-2 -right-2 bg-accent text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                    {member.experience}
                  </div>
                </div>

                {/* Info */}
                <h3 className="text-2xl font-bold text-text-primary">{member.name}</h3>
                <p className="text-text-accent font-semibold text-lg">{member.role}</p>
                <p className="text-text-primary/70 leading-relaxed text-sm">{member.description}</p>

                {/* Especialidades */}
                <div className="flex flex-wrap gap-2 justify-center mt-4">
                  {member.specialties.map((specialty, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-primary/10 text-text-primary text-xs font-medium rounded-full border border-primary/20"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>

                {/* Áreas de enfoque */}
                <div className="mt-4 text-left">
                  <h4 className="text-sm font-semibold text-accent mb-2">
                    Áreas de Enfoque:
                  </h4>
                  <ul className="list-disc list-inside text-sm text-text-primary/80 space-y-1">
                    {member.focusAreas.map((area, idx) => (
                      <li key={idx}>{area}</li>
                    ))}
                  </ul>
                </div>

                {/* CTA */}
                <a
                  href="#citas"
                  className="inline-block mt-6 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                >
                  Agendar cita
                </a>
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
