## Chat en tiempo real con Gorilla WebSockets
Microservicio  encargado de manejar alta carga de conexiones de forma eficiente y escalable 
</br>
![golang](https://img.icons8.com/?size=64&id=44442&format=png)
![swagger](https://img.icons8.com/?size=64&id=rdKV2dee9wxd&format=png&color=000000)
## Caractetisticas:
- Autorizacion por medio de clerk
- Autorizacion por roles
- Manejo de salas de chat
- Persistencia de mensajes en memoria
- Escalabilidad
- documentacion con swagger

## Requisitos:
- GO 1.20+

## Instalacion:
1. Clonar el repositorio

2. Instalar dependencias
 ``` bash
    go mod tidy
```
3. Configurar variables de entorno
4. Instalar Air para desarrollo
``` bash
    go install github.com/air-verse/air@latest
```
5. Ejecutar la aplicacion (Asegurarse de estar en el directorio raiz)
``` bash
    air
```
## Diagrama
![Diagrama del chat](./diagrama-chat.png)

## TESTS

Para ejecutar los tests:

```bash
go test ./...
```
