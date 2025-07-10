import express from "express";
import cors from "cors";
import logger from "morgan";
import bodyParser from "body-parser";
import compression from "compression";
import helmet from "helmet";



const port = process.env.PORT ?? 42069;
const app = express();
// Middleware
app.use(helmet());

app.use(bodyParser.json({ limit: "5mb" }));

app.use(cors({
    origin: "*", // Cors del servidor http
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));
app.use(logger('dev'));
// comprime las respuestas del api
app.use(compression({
	level: 3,
	threshold: 0
}));
// desactivamos el header x x-powered-by
app.disable('x-powered-by');


//rutas del api



//iniciamos el servidor
app.listen(port, () => console.log(`El servidor esta corriendo en: http://localhost:${port} `));