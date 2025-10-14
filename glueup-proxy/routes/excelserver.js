import express from "express";
import helmet from "helmet";
import path from "path";
import XLSX from "xlsx";

const router = express.Router();

// Middleware de seguridad
router.use(helmet());

// Endpoint para buscar ticket
router.get("/ticket/:id", (req, res) => {
    try {
        const filePath = path.join(process.cwd(), "glueup-proxy", "DataExcel", "GlupUpData.xlsx");
        const workbook = XLSX.readFile(filePath);
        const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
        const record = sheet.find(r => String(r["Ticket ID #"]) === req.params.id);
        if (!record) return res.status(404).json({ error: "No encontrado" });

        res.json({
            ticket_number_GlupUp: record["Ticket ID #"],
            firstname: record["First Name"],
            lastname: record["Last Name"],
            phone: record.Phone,
            company: record.Company,
            employee: record["Title/Position"],
            email: record.Email,
            type_ticket: record["Ticket Name"],
        });
    } catch (error) {
        console.error("Error al leer Excel:", error);
        res.status(500).json({ error: "Error al leer el archivo Excel" });
    }
});

export default router;

