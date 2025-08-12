import { Users } from "lucide-react";
import { Suspense } from "react";

export const TeamSection = () => {
  const teamMembers = [
    {
      id: 1,
      name: "Lic. Esteban josé Porras Balladares",
      role: "Fisioterapeuta Principal",
      experience: "12+ años",
      description:
        "Especialista en terapia manual y rehabilitación deportiva con más de 12 años de experiencia",
      specialties: [
        "Terapia Manual",
        "Rehabilitación Deportiva",
        "Electroterapia",
      ],
      bgGradient: "from-primary/20 via-accent/10 to-primary/5",
    },
    {
      id: 2,
      name: "Ms. María Eugenia Centeno Avila",
      role: "Especialista en Rehabilitación",
      experience: "8+ años",
      description:
        "Dentro de lo que me describe como terapeuta fisica, me interesa ayudar a los demás y el bien de los que más lo necesitan mejorando las habilidades de aquellos que las han perdido.",
      specialties: ["Post-Quirúrgica", "Lesiones Musculares", "Kinesiología"],
      bgGradient: "from-accent/20 via-primary/10 to-accent/5",
    },
    {
      id: 3,
      name: "Dra. Ana Rodríguez",
      role: "Terapeuta Especializada",
      experience: "10+ años",
      description:
        "Certificada en técnicas de electroterapia y ejercicios terapéuticos personalizados",
      specialties: ["Electroterapia", "Ejercicios Terapéuticos", "Masoterapia"],
      bgGradient: "from-complementario/20 via-secondary/10 to-complementario/5",
    },
  ];

  return (
    <Suspense fallback={<div>loading...</div>}>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
      {teamMembers.map((member, index) => (
        <div
          key={member.id}
          className={`group relative bg-card/50 backdrop-blur-sm rounded-3xl p-8 border 
				border-card-foreground/10 transition-all 
				duration-500 hover:shadow-2xl hover:shadow-primary/10 
				hover:-translate-y-2 }`}
          style={{
            animationDelay: `${index * 0.2}s`,
          }}
        >
          {/* Fondo gradiente  */}
          <div
            className={`absolute inset-0 bg-gradient-to-br from-accent/20 via-primary/10 to-accent/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
          ></div>

          <div className="relative z-10">
            {/* Avatar mejorado */}
            <div className="relative mb-6">
              <div className="w-36 h-36 mx-auto  rounded-2xl flex items-center justify-center overflow-hidden shadow-xl transform group-hover:scale-105 transition-transform duration-300">
                <div className="w-32 h-32  flex items-center justify-center">
                  <Users className="w-12 h-12 text-text-primary" />
                </div>
              </div>

              {/* Badge de experiencia */}
              <div className="absolute -top-2 -right-2 bg-accent text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                {member.experience}
              </div>
            </div>

            {/* Contenido */}
            <div className="text-center space-y-4">
              <h3 className="text-2xl font-bold text-text-primary  transition-colors duration-300">
                {member.name}
              </h3>

              <p className="text-text-accent font-semibold text-lg">
                {member.role}
              </p>

              <p className="text-text-primary/70 leading-relaxed text-sm">
                {member.description}
              </p>

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
            </div>
          </div>
        </div>
      ))}
    </div>
    </Suspense>
  );
};
