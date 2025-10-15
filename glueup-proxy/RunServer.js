import cors from 'cors';
import express from 'express';
import path from "path";
import dbRoutes from './routes/DbServer.js';
import excelRoutes from './routes/excelserver.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(express.json());

app.use('/api/db', dbRoutes);
app.use('/api/excel', excelRoutes);
app.use("/DataExcel", express.static(path.join(process.cwd(), "DataExcel")));

const PORT = 4000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
