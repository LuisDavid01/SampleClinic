"use client";
import React, { useState, useEffect } from "react";

const HealthCheck: React.FC = () => {
  const [status, setStatus] = useState<string>("Verificando...");
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);

  useEffect(() => {
    const checkHealth = async (): Promise<void> => {
      try {
        const response = await fetch("/api/health");
        const text = await response.text();

        if (response.ok) {
          setStatus(text);
          setIsHealthy(true);
        } else {
          setStatus("Servicio no disponible");
          setIsHealthy(false);
        }
      } catch (error) {
        setStatus("Error de conexión");
        setIsHealthy(false);
      }
    };

    checkHealth();
  }, []);

  return (
    <div
      style={{
        padding: "10px",
        borderRadius: "5px",
        backgroundColor:
          isHealthy === true
            ? "#d4edda"
            : isHealthy === false
              ? "#f8d7da"
              : "#fff3cd",
        color:
          isHealthy === true
            ? "#155724"
            : isHealthy === false
              ? "#721c24"
              : "#856404",
      }}
    >
      <strong>Estado del servicio:</strong> {status}
    </div>
  );
};

export default HealthCheck;
