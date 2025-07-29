import { Star } from "lucide-react";
import { Suspense } from "react";

export const ReviewsSection = () => {
  const reviews = [
    {
      name: "María González",
      role: "Paciente desde 2023",
      text: "Después de mi lesión de rodilla, pensé que no volvería a caminar normalmente. El tratamiento personalizado y la dedicación del equipo me ayudaron a recuperar completamente mi movilidad. ¡Incluso puedo correr otra vez!",
      rating: 5,
      avatar: "M",
    },
    {
      name: "Carlos Ruiz",
      role: "Atleta profesional",
      text: "Como deportista de alto rendimiento, necesito un cuidado especializado y preciso. Aquí encontré profesionales que realmente entienden las demandas del deporte y me ayudaron a volver más fuerte que antes.",
      rating: 5,
      avatar: "C",
    },
    {
      name: "Ana López",
      role: "Recuperación post-cirugía",
      text: "El seguimiento continuo y la dedicación personalizada del equipo fueron fundamentales en mi proceso de rehabilitación. Su apoyo emocional fue tan importante como el tratamiento físico.",
      rating: 5,
      avatar: "A",
    },
  ];

  return (
    <Suspense fallback={<div>loading...</div>}>

    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {reviews.map((testimonial, index) => (
        <div
          key={index}
          className="group bg-card rounded-2xl p-8 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-primary/10"
        >
          {/* Rating stars */}
          <div className="flex mb-4">
            {[...Array(testimonial.rating)].map((_, i) => (
              <Star key={i} className="w-5 h-5 text-yellow-400" />
            ))}
          </div>

          <p className="text-text-primary leading-relaxed mb-6 italic">
            "{testimonial.text}"
          </p>

          <div className="flex items-center">
            <div className="w-14 h-14 bg-accent rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
              {testimonial.avatar}
            </div>
            <div>
              <h3 className="font-bold text-text-primary text-lg">
                {testimonial.name}
              </h3>
              <p className="text-text-primary text-sm opacity-75">
                {testimonial.role}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
    </Suspense>
  );
};
