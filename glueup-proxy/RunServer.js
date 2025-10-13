import cors from 'cors';
import express from 'express';
import dbRoutes from './routes/DbServer.js';
import excelRoutes from './routes/excelserver.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/db', dbRoutes);
app.use('/api/excel', excelRoutes);

const PORT = 4000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
