import bcrypt from "bcryptjs";
import express from "express";
import sql from "mssql";

const router = express.Router();

const dbConfig = {
  user: "QRScan",
  password: "Expo1111Media!",
  server: "192.168.1.80",
  database: "QRScan",
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};


router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    let pool = await sql.connect(dbConfig);
    let result = await pool
      .request()
      .input("email", sql.VarChar, email)
      .query("SELECT * FROM users WHERE email = @email");

    if (result.recordset.length === 0) {
      return res.status(401).json({ message: "User not found" });
    }

    const user = result.recordset[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ message: "Incorrect password" });
    }
    res.json({ message: "Successful login", user: { id: user.id, first_name: user.first_name, email: user.email, role: user.role, exhibitor_id: user.exhibitor_id } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/registeraccounts", async (req, res) => {
  const { first_name, last_name, email, password, role, exhibitor_id } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const pool = await sql.connect(dbConfig);

    await pool.request()
      .input("first_name", sql.NVarChar(100), first_name)
      .input("last_name", sql.NVarChar(100), last_name)
      .input("email", sql.NVarChar(255), email)
      .input("password", sql.NVarChar(255), hashedPassword)
      .input("role", sql.NVarChar(50), role)
      .input("exhibitor_id", sql.Int, exhibitor_id || null)
      .input("created_at", sql.DateTime, new Date())
      .query(`
        INSERT INTO [dbo].[users] 
          ([first_name], [last_name], [email], [password], [role], [exhibitor_id], [created_at])
        VALUES 
          (@first_name, @last_name, @email, @password, @role, @exhibitor_id, @created_at)
      `);

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
    let pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input("ticket_number_GlupUp", sql.VarChar, ticket_number_GlupUp)
      .input("first_name", sql.VarChar, firstname)
      .input("last_name", sql.VarChar, lastname)
      .input("email", sql.VarChar, email)
      .input("company", sql.VarChar, company)
      .input("position_title", sql.VarChar, position_title)
      .input("phone_number", sql.VarChar, phone)
      .input("type_ticket", sql.VarChar, ticketType)
      .input("created_at", sql.DateTime, created_at || new Date())
      .input("created_by", sql.VarChar, created_by || "system")
      .query(`
        INSERT INTO [dbo].[tickets]
        ([ticket_number_GlupUp],[first_name],[last_name], [email], [company], [position_title],
         [phone_number], [type_ticket], [created_at], [created_by])
         OUTPUT INSERTED.id
         VALUES
        (@ticket_number_GlupUp,@first_name,@last_name, @email, @company, @position_title, 
         @phone_number, @type_ticket, @created_at, @created_by)
      `);

    res.status(200).json({ id: result.recordset[0].id });
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
    const pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input("email", sql.NVarChar, email || "")
      .input("phone", sql.NVarChar, phone || "")
      .query(`
        SELECT TOP 1 id, first_name, last_name, email, phone_number
        FROM tickets
        WHERE email = @email OR phone_number = @phone
      `);

    if (result.recordset.length > 0) {
      const existing = result.recordset[0];
      return res.status(200).json({
        exists: true,
        prospect: existing
      });
    }

    res.status(200).json({ exists: false });
  } catch (err) {
    console.error("Error validate prospects:", err);
    res.status(500).json({ message: "Error  validate prospects" });
  }
});

router.get("/list-prospects", async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);

    const result = await pool.request().query(`
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
    `);


    if (!result.recordset || result.recordset.length === 0) {
      return res.status(200).json([]);
    }
    const prospects = result.recordset.map((r) => ({
      id: r.id,
      firstname: r.first_name,
      lastname: r.last_name,
      email: r.email || '',
      phone: r.phone_number || '',
      company: r.company || '',
      position: r.position || '',
      type_ticket: r.type_ticket || 'Other',
      created_at: r.created_at || null
    }));

    res.status(200).json(prospects);
  } catch (err) {
    console.error("Error registering prospects :", err);
    res.status(500).json({ message: "Error registering prospects" });
  }
});

router.post("/registerexhibitor", async (req, res) => {
  const { name, contact_firstname, contact_lastname, contact_phone, address, website, industry } = req.body;

  try {
    const pool = await sql.connect(dbConfig);

    await pool.request()
      .input("name", sql.NVarChar(150), name)
      .input("contact_firstname", sql.NVarChar(100), contact_firstname)
      .input("contact_lastname", sql.NVarChar(100), contact_lastname)
      .input("contact_phone", sql.NVarChar(50), contact_phone)
      .input("address", sql.NVarChar(255), address)
      .input("website", sql.NVarChar(150), website)
      .input("industry", sql.NVarChar(100), industry)
      .input("created_at", sql.DateTime, new Date())
      .query(`
        INSERT INTO [dbo].[exhibitors] 
          ([name], [contact_firstname], [contact_lastname], [address], [website], [industry], [created_at])
        VALUES 
          (@name, @contact_firstname, @contact_lastname, @address, @website, @industry, @created_at)
      `);

    res.json({ message: "Successfully registered exhibitor" });

  } catch (err) {
    console.error("Error registering exhibitor:", err);
    res.status(500).json({ message: "Error registering exhibitor", error: err.message });
  }
});

router.get("/getexhibitor", async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);

    const result = await pool.request().query(`
     SELECT 
      id
      ,name
      ,contact_firstname
      ,contact_lastname
      ,contact_email
      ,contact_phone
      ,address
      ,website
      ,industry
      ,created_at
  FROM exhibitors
      ORDER BY created_at DESC
    `);


    if (!result.recordset || result.recordset.length === 0) {
      return res.status(200).json([]);
    }
    const listExhibitor = result.recordset.map((r) => ({
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
    console.error("Error get Exhibitor :", err);
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
    const pool = await sql.connect(dbConfig);

    const result = await pool.request()
      .input("email", sql.VarChar, email)
      .input("exhibitor_id", sql.Int, Number(exhibitor_id))
      .query(`
        SELECT 
          t.first_name,
          t.last_name,
          t.email,
          t.phone_number,
          t.company,
          pc.scanned_at
        FROM dbo.potential_clients pc
        INNER JOIN dbo.users u ON u.id = pc.user_id
        INNER JOIN dbo.tickets t ON t.id = pc.ticket_id
        WHERE u.email = @email
          AND pc.exhibitor_id = @exhibitor_id
        ORDER BY pc.scanned_at DESC;
      `);

    if (!result.recordset || result.recordset.length === 0) {
      return res.status(200).json([]);
    }

    // Formateamos los datos
    const prospects = result.recordset.map(r => ({
      firstname: first_name,
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
    const pool = await sql.connect(dbConfig);

    await pool.request()
      .input("ticket_id", sql.Int, ticket_id)
      .input("user_id", sql.Int, user_id)
      .input("exhibitor_id", sql.Int, exhibitor_id)
      .query(`
        INSERT INTO dbo.potential_clients (ticket_id, user_id, exhibitor_id)
        VALUES (@ticket_id, @user_id, @exhibitor_id)
      `);

    // Retornamos un mensaje de éxito
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
    const pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input("Ticket_id", sql.Int, ticket_id)
      .query(`
        SELECT TOP 1 id, Ticket_id, user_id, exhibitor_id, scanned_at
        FROM potential_clients
        WHERE Ticket_id = @Ticket_id
      `);

    if (result.recordset.length > 0) {
      const existing = result.recordset[0];
      return res.status(200).json({
        exists: true,
        potential: existing
      });
    }

    res.status(200).json({ exists: false });
  } catch (err) {
    console.error("Error validate prospects:", err);
    res.status(500).json({ message: "Error  validate prospects" });
  }
});

export default router;
