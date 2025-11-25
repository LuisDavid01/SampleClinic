"use client";
import { InfiniteMovingCards } from "../ui/infinite-moving-cards";
import { useQuery } from "@tanstack/react-query";
import {  getTestimonies } from "@/actions/historiasExito";
import { HistoriaExito } from "@/types/Testimony";
import { Loader2 } from "lucide-react";

export const ReviewsSection = () => {
	const { data, isLoading } = useQuery({
		queryKey: ['reviews-publicadas'],
		queryFn: async () => {
			const res = await getTestimonies(1, 10, "")
			const historias = res.historias.filter((h: HistoriaExito) => h.publicado)
			console.log(historias)
			return historias
		}
	})
	return (
		<>
			{isLoading ? (
				<div className="flex items-center justify-center w-full">
					<Loader2 className="w-4 h-4 animate-spin" />
					<span>Cargando...</span>
				</div>
			) : (!data || data?.length === 0 ) ? (
				<p className="text-center">
				no hay testimonios en este momento
				</p>

			) : (

				<InfiniteMovingCards
					items={data}
					direction="right"
					speed="slow"
				/>
			)}
		</>
	);
};
