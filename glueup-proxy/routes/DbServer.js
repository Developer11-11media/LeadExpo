import bcrypt from "bcryptjs";
import express from "express";
import mysql from "mysql2/promise";

const router = express.Router();

const dbConfig = {
  host: "192.185.73.182",
  user: "expocont_LeadUser",
  password: "1111Media@!",
  database: "expocont_LeadExpo",
};

const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});


router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Ejecutar consulta segura con placeholders
    const [rows] = await pool.execute(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "User not found" });
    }

    const user = rows[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    res.json({
      message: "Successful login",
      user: {
        id: user.id,
        first_name: user.first_name,
        email: user.email,
        role: user.role,
        exhibitor_id: user.exhibitor_id,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/registeraccounts", async (req, res) => {
  const { first_name, last_name, email, password, role, exhibitor_id } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar usuario usando placeholders para seguridad
    const sql = `
      INSERT INTO users 
        (first_name, last_name, email, password, role, exhibitor_id, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      first_name,
      last_name,
      email,
      hashedPassword,
      role,
      exhibitor_id || null,
      new Date()
    ];

    await pool.execute(sql, params);

    res.json({ message: "Successfully registered user" });
  } catch (err) {
    console.error("Error registering user:", err);
    res.status(500).json({ message: "Error registering user", error: err.message });
  }
});

router.post("/registerticket", async (req, res) => {
  const {
    ticket_number_GlupUp,
    firstname,
    lastname,
    email,
    company,
    position_title,
    phone,
    ticketType,
    created_at,
    created_by
  } = req.body;

  try {
    const sql = `
      INSERT INTO tickets
        (ticket_number_GlupUp, first_name, last_name, email, company, position_title,
         phone_number, type_ticket, created_at, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      ticket_number_GlupUp,
      firstname,
      lastname,
      email,
      company,
      position_title,
      phone,
      ticketType,
      created_at || new Date(),
      created_by || "system"
    ];

    const [result] = await pool.execute(sql, params);

    // Obtener el ID del registro insertado
    res.status(200).json({ id: result.insertId });
  } catch (err) {
    console.error("Error registering Ticket:", err);
    res.status(500).json({ message: "Error registering Ticket" });
  }
});

router.post("/validate-prospect", async (req, res) => {
  const { email, phone } = req.body;

  if (!email && !phone) {
    return res.status(400).json({ message: "Email or phone required" });
  }

  try {
    const sql = `
      SELECT id, first_name, last_name, email, phone_number
      FROM tickets
      WHERE email = ? OR phone_number = ?
      LIMIT 1
    `;

    const params = [email || "", phone || ""];
    const [rows] = await pool.execute(sql, params);

    if (rows.length > 0) {
      return res.status(200).json({
        exists: true,
        prospect: rows[0]
      });
    }

    res.status(200).json({ exists: false });
  } catch (err) {
    console.error("Error validate prospects:", err);
    res.status(500).json({ message: "Error validate prospects" });
  }
});


router.get("/list-prospects", async (req, res) => {
  try {
    const sql = `
      SELECT 
        id,
        first_name,
        last_name,
        email,
        phone_number,
        company,
        position_title,
        type_ticket,
        created_at
      FROM tickets
      ORDER BY created_at DESC
    `;

    const [rows] = await pool.execute(sql);

    if (!rows || rows.length === 0) {
      return res.status(200).json([]);
    }

    const prospects = rows.map((r) => ({
      id: r.id,
      firstname: r.first_name,
      lastname: r.last_name,
      email: r.email || '',
      phone: r.phone_number || '',
      company: r.company || '',
      position: r.position_title || '',
      type_ticket: r.type_ticket || 'Other',
      created_at: r.created_at || null
    }));

    res.status(200).json(prospects);
  } catch (err) {
    console.error("Error listing prospects:", err);
    res.status(500).json({ message: "Error listing prospects" });
  }
});

router.post("/registerexhibitor", async (req, res) => {
  const { name, contact_firstname, contact_lastname, contact_phone, address, website, industry } = req.body;

  try {
    const sql = `
      INSERT INTO exhibitors
        (name, contact_firstname, contact_lastname, contact_phone, address, website, industry, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      name,
      contact_firstname,
      contact_lastname,
      contact_phone,
      address,
      website,
      industry,
      new Date()
    ];

    await pool.execute(sql, params);

    res.json({ message: "Successfully registered exhibitor" });
  } catch (err) {
    console.error("Error registering exhibitor:", err);
    res.status(500).json({ message: "Error registering exhibitor", error: err.message });
  }
});

router.get("/getexhibitor", async (req, res) => {
  try {
    const sql = `
      SELECT 
        id,
        name,
        contact_firstname,
        contact_lastname,
        contact_email,
        contact_phone,
        address,
        website,
        industry,
        created_at
      FROM exhibitors
      ORDER BY created_at DESC
    `;

    const [rows] = await pool.execute(sql);

    if (!rows || rows.length === 0) {
      return res.status(200).json([]);
    }

    const listExhibitor = rows.map((r) => ({
      id: r.id,
      name: r.name || '',
      contact_name: `${r.contact_firstname || ''} ${r.contact_lastname || ''}`.trim(),
      contact_email: r.contact_email || '',
      contact_phone: r.contact_phone || '',
      address: r.address || '',
      website: r.website || '',
      industry: r.industry || '',
      created_at: r.created_at || null
    }));

    res.status(200).json(listExhibitor);
  } catch (err) {
    console.error("Error get Exhibitor:", err);
    res.status(500).json({ message: "Error get Exhibitor" });
  }
});

router.get("/ProspectsListexhibitors", async (req, res) => {
  const { email, exhibitor_id } = req.query;

  res.setHeader("Cache-Control", "no-store");
  if (!email || !exhibitor_id) {
    return res.status(400).json({ message: "Missing email or exhibitor_id" });
  }

  try {
    const sql = `
      SELECT 
        t.first_name,
        t.last_name,
        t.email,
        t.phone_number,
        t.company,
        pc.scanned_at
      FROM potential_clients pc
      INNER JOIN users u ON u.id = pc.user_id
      INNER JOIN tickets t ON t.id = pc.ticket_id
      WHERE u.email = ?
        AND pc.exhibitor_id = ?
      ORDER BY pc.scanned_at DESC
    `;

    const params = [email, Number(exhibitor_id)];
    const [rows] = await pool.execute(sql, params);

    if (!rows || rows.length === 0) {
      return res.status(200).json([]);
    }

    // Formateamos los datos
    const prospects = rows.map(r => ({
      firstname: r.first_name,
      last_name: r.last_name,
      email: r.email || '',
      phone: r.phone_number || '',
      company: r.company || '',
      scanned_at: r.scanned_at || null
    }));

    res.status(200).json(prospects);
  } catch (err) {
    console.error("Error fetching prospects:", err);
    res.status(500).json({ message: "Error fetching prospects" });
  }
});

router.post("/Registerpotential", async (req, res) => {
  const { ticket_id, user_id, exhibitor_id } = req.body;

  // Validaciones básicas
  if (!ticket_id || !user_id || !exhibitor_id) {
    return res.status(400).json({ message: "ticket_id, user_id y exhibitor_id son requeridos" });
  }

  try {
    const sql = `
      INSERT INTO potential_clients (ticket_id, user_id, exhibitor_id)
      VALUES (?, ?, ?)
    `;

    const params = [ticket_id, user_id, exhibitor_id];
    await pool.execute(sql, params);

    res.status(200).json({ message: "Potential client registrado correctamente" });
  } catch (err) {
    console.error("Error registering potential client:", err);
    res.status(500).json({ message: "Error registering potential client" });
  }
});

router.post("/validate_potential_clients", async (req, res) => {
  const { ticket_id } = req.body;

  if (!ticket_id) {
    return res.status(400).json({ message: "Ticket_id required" });
  }

  try {
    const sql = `
      SELECT id, ticket_id, user_id, exhibitor_id, scanned_at
      FROM potential_clients
      WHERE ticket_id = ?
      LIMIT 1
    `;

    const params = [ticket_id];
    const [rows] = await pool.execute(sql, params);

    if (rows.length > 0) {
      return res.status(200).json({
        exists: true,
        potential: rows[0]
      });
    }

    res.status(200).json({ exists: false });
  } catch (err) {
    console.error("Error validate prospects:", err);
    res.status(500).json({ message: "Error validate prospects" });
  }
});

router.post("/registerExcelData", async (req, res) => {
  const data = req.body.data; // Esperamos un array de objetos

  if (!data || !Array.isArray(data) || data.length === 0) {
    return res.status(400).json({ message: "No data provided" });
  }
  try {
    await pool.query("SET SQL_SAFE_UPDATES = 0");
    await pool.query("DELETE FROM DataGlupUp");
    await pool.query("ALTER TABLE DataGlupUp AUTO_INCREMENT = 1");

    const sql = `
      INSERT INTO DataGlupUp
      (
        ticket_id, contact_id, first_name, last_name, company, title, email, phone,
        category, internal_note, internal_group, ticket_name, price_option,
        registration_id, registration_date,
        reg_contact_first_name, reg_contact_last_name, reg_contact_email, reg_contact_phone
      )
      VALUES ?
    `;

    // Convertir la fecha a formato MySQL y mapear valores
    const values = data.map((row) => [
      row.ticket_id || null,
      row.contact_id || null,
      row.first_name || null,
      row.last_name || null,
      row.company || null,
      row.title || null,
      row.email || null,
      row.phone || null,
      row.category || null,
      row.internal_note || null,
      row.internal_group || null,
      row.ticket_name || null,
      row.price_option || null,
      row.registration_id || null,
      row.registration_date
        ? new Date(row.registration_date).toISOString().slice(0, 19).replace("T", " ")
        : null,
      row.reg_contact_first_name || null,
      row.reg_contact_last_name || null,
      row.reg_contact_email || null,
      row.reg_contact_phone || null,
    ]);

    await pool.query(sql, [values]);

    res.json({ message: "Data inserted successfully", inserted: values.length });
  } catch (err) {
    console.error("Error inserting Excel data:", err);
    res.status(500).json({ message: "Error inserting Excel data", error: err.message });
  }
});

router.get("/DataGlupUp/:ticket_id", async (req, res) => {
  try {
    const { ticket_id } = req.params;

    if (!ticket_id) {
      return res.status(400).json({ message: "ticket_id es requerido" });
    }

    const sql = `

      SELECT 
  ticket_id AS ticket_number_GlupUp,
  first_name AS firstname,
  last_name AS lastname,
  Phone AS phone,
  Company AS company,
  title AS employee,
  Email AS email,
  ticket_name AS type_ticket
FROM DataGlupUp
WHERE ticket_id = ?
LIMIT 1;
    `;

    const [rows] = await pool.execute(sql, [ticket_id]);

    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: "No se encontró el ticket" });
    }

    const record = rows[0];

    res.status(200).json({
      ticket_number_GlupUp: record.ticket_number_GlupUp,
      firstname: record.firstname,
      lastname: record.lastname,
      phone: record.phone,
      company: record.company,
      employee: record.employee,
      email: record.email,
      type_ticket: record.type_ticket
    });
  } catch (err) {
    console.error("Error get DataGlupUp:", err);
    res.status(500).json({ message: "Error al obtener DataGlupUp" });
  }
});


export default router;
