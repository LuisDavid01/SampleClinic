"use client";
import React from "react";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalTrigger,
} from "../ui/animated-modal";

import { motion } from "motion/react";
import { StarRating } from "../StarRating";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { MessageSquareShare, Send } from "lucide-react";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";

export function NewTestimonio() {
  return (
    <div className=" flex items-center justify-center">
      <Modal>
        <ModalTrigger className="group  backdrop-blur-sm  border-2 border-primary px-8 py-4 rounded-xl font-semibold bg-primary text-black hover:-translate-y-1 shadow-xl hover:shadow-cyan-500/50  transition-all duration-300 flex items-center justify-center gap-2 mx-auto">
          <span className=" ">
            <MessageSquareShare/> 
          </span>
          Comparte tu experiencia!
        </ModalTrigger>
        <ModalBody>
          <ModalContent>
             <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-center mb-8"
          >
            <h4 className="text-2xl md:text-3xl text-text-primary font-bold mb-2">
              Comparte tu Experiencia
            </h4>
            <p className="text-muted-foreground text-sm md:text-base">
              Tu opinión nos ayuda a mejorar nuestros servicios de salud
            </p>
          </motion.div>
           <form>
            {/* Sistema de Calificación */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <label className="block text-text-primary font-medium mb-3 text-center">
                ¿Cómo calificarías nuestro servicio?
              </label>
              <StarRating
                value={0}
                onChange={() => {}}
              />

            </motion.div>


            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <label className="block text-text-primary font-medium mb-2">
                Cuéntanos sobre tu experiencia
              </label>
              <Textarea
                placeholder="Comparte tu experiencia con nosotros..."
                className="min-h-[120px] bg-input border-input text-text-primary placeholder:text-muted-foreground resize-none"
              />
              <div className="flex justify-between items-center my-2">
                <span className="text-xs text-muted-foreground">
                  Mínimo 10 caracteres
                </span>
                <span className="text-xs text-muted-foreground">
                  {0}/500
                </span>
              </div>
              
            </motion.div>

           <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center  space-x-2"
            >
            <Checkbox id="anonymous" />
            <label
                htmlFor="anonymous"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
                Enviar de forma anónima
            </label>
            </motion.div>

           </form>
            </ModalContent>
            <ModalFooter className="gap-4 pt-6 border-t border-muted">
              <Button
                type="submit"
                disabled
                className="px-6 py-2 bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2"
              >
                
                  <>
                    <Send className="w-4 h-4" />
                    Enviar Testimonio
                  </>
              </Button>
            </ModalFooter>
          
        </ModalBody>
      </Modal>
    </div>
  );
}
