
# Fisioterapia Esteban Porras - Plataforma de la Clínica

![Banner del Proyecto](https://res.cloudinary.com/duoghrh9k/image/upload/v1718858839/fisioterapia_esteban_porras_vj4f0p.svg)

Esta es una plataforma integral para la clínica "Fisioterapia Esteban Porras", diseñada para optimizar la gestión de pacientes, la programación de citas y la comunicación interna. El proyecto está construido con un stack tecnológico moderno, que incluye un frontend con Next.js y un backend con Go, todo contenedorizado con Docker para facilitar el despliegue y la escalabilidad.

## Estructura del Proyecto

El repositorio está organizado como un monorepo con dos servicios principales:

-   **`clinica-nextjs`**: Una aplicación de [Next.js](https://nextjs.org/) que funciona como el frontend para el usuario. Maneja todo, desde la página de inicio hasta los paneles de administración y de usuario.
-   **`clinica-chat-api`**: Una aplicación de [Go](https://go.dev/) que impulsa la funcionalidad de chat en tiempo real, permitiendo una comunicación fluida entre pacientes y personal.

## Tecnologías Utilizadas

### Frontend (`clinica-nextjs`)

-   **Framework**: [Next.js](https://nextjs.org/)
-   **Lenguaje**: [TypeScript](https://www.typescriptlang.org/)
-   **Estilos**: [Tailwind CSS](https://tailwindcss.com/)
-   **Componentes de UI**: [Shadcn UI](https://ui.shadcn.com/)
-   **Autenticación**: [Clerk](https://clerk.com/)

### Backend chat (`clinica-chat-api`)

-   **Lenguaje**: [Go](https://go.dev/)
-   **Framework Backend**: [Gin](https://gin-gonic.com/)
-   **Comunicación en Tiempo Real**: [Gorilla WebSocket](https://github.com/gorilla/websocket)

### Backend de la clinica (`clinica-api`)
-   **Lenguaje**: [javascript](https://www.javascript.com/)
-   **Framework Backend**: [Express](https://expressjs.com/)
-   **Autenticación**: [Clerk](https://clerk.com/)

### Contenerización

-   **Orquestación**: [Docker Compose](https.docs.docker.com/compose/)

## Cómo Ejecutar el Proyecto

Puedes ejecutar el proyecto usando Docker (recomendado) o configurando cada servicio manualmente.

### Con Docker (Recomendado)

Esta es la forma más sencilla de poner en marcha toda la aplicación.

1.  **Prerrequisitos**: Asegúrate de tener [Docker](https://www.docker.com/get-started) y [Docker Compose](https://docs.docker.com/compose/install/) instalados.

2.  **Construir y Ejecutar**:
    ```bash
    docker-compose up --build
    ```

    Este comando construirá las imágenes tanto para el frontend como para el backend y arrancará los contenedores. La aplicación estará accesible en [http://localhost:3000](http://localhost:3000).

### Sin Docker

Si prefieres ejecutar cada servicio manualmente, sigue estos pasos.

#### Backend del chat (`clinica-chat-api`)

1.  **Navega al directorio**:
    ```bash
    cd clinica-chat-api
    ```

2.  **Instala las dependencias**:
    ```bash
    go mod tidy
    ```

3.  **Ejecuta el servidor**:
    ```bash
    go run main.go
    ```

    La API se estará ejecutando en el puerto `8080`.

#### Frontend (`clinica-nextjs`)

1.  **Navega al directorio**:
    ```bash
    cd clinica-nextjs
    ```

2.  **Instala las dependencias**:
    ```bash
    npm install
    ```

3.  **Configura las variables de entorno**:
    Crea un archivo `.env.local` copiando el ejemplo:
    ```bash
    cp .env.example .env.local
    ```
    Actualiza el archivo `.env.local` con tus propias credenciales.

4.  **Ejecuta el servidor de desarrollo**:
    ```bash
    npm run dev
    ```

    El frontend estará accesible en [http://localhost:3000](http://localhost:3000).

#### Makefile

Para facilitar el despliegue se creo un archivo `Makefile` que contiene comandos utiles.
**Nota**: Debe ejecutarse en el directorio raiz del proyecto.

**Variables de entorno**: Debe definir las variables de entorno en consola usando la terminal 
de su preferencia, por ejemplo:
```bash
export BUILD_TAG=latest
```

-   `build-chat-windows`: Compila el backend del chat para Windows.\
-   `build-chat`: Compila el backend del chat para Linux.\
-   `run-chat-windows`: Ejecuta el backend del chat en Windows.\
-   `run-chat`: Ejecuta el backend del chat en Linux.\
-   `build-image-chat`: Construye la imagen del backend del chat.\
-   `build-image-chat-promote`: Construye la imagen del backend del chat y la etiqueta la con la versión actual.\
-   `down`: Detiene los contenedores de la aplicación.\
-   `up`: Lanza los contenedores de la aplicación.

ejemplo de uso:
```bash
make build-chat-windows
```

##### instrucciones para generar una imagen y promoverla
usar latest para el deploy a producción
```bash
export BUILD_TAG=latest
make build-image-chat
make build-image-chat-promote
```

## Cómo Contribuir

¡Las contribuciones son bienvenidas! Si tienes alguna idea, sugerencia o reporte de error, por favor abre un *issue* o envía un *pull request*.

## Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo [LICENSE](LICENSE) para más detalles.
