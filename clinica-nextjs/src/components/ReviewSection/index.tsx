
import { Suspense } from "react";
import { InfiniteMovingCards } from "../ui/infinite-moving-cards";

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
    <InfiniteMovingCards
    items={reviews}
    direction="right"
    speed="slow"
    />
    </Suspense>
  );
};
