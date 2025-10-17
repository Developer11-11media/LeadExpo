

const UrlLocalApi = 'http://192.168.1.80:4000/';

const UrlPro = 'https://leadexpo-backend.onrender.com/';

const UrlApi = UrlPro;

export async function registeraccounts(
  first_name: string, last_name: string, email: string, password: string, role: string, exhibitor_id: number) {
  try {
    const response = await fetch(UrlApi + "api/db/registeraccounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ first_name, last_name, email, password, role, exhibitor_id }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Error en register accounts");
    }

    return data;
  } catch (err) {
    console.error("Error en register:", err);
    throw err;
  }
}

export async function RegisterTicketdb(
  ticket_number_GlupUp: string | null, firstname: string, lastname: string, email: string, company: string | null, position_title: string | null,
  phone: string, ticketType: string, created_at: string, created_by: string) {
  try {
    const response = await fetch( UrlApi + "api/db/registerticket", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
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
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Error en register Ticket");
    }

    return data.id;
  } catch (err) {
    console.error("Error en register:", err);
    throw err;
  }
}

export async function GetTicketFromExcel(ticketNumber: string) {
  try {
    const response = await fetch(
      UrlApi + `api/db/DataGlupUp/${encodeURIComponent(ticketNumber)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer TU_TOKEN_SEGURIDAD", // No eh difinido aun el token
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "No se encontró el ticket");
    }

    return data;
  } catch (err) {
    console.error("Error al consultar el Excel:", err);
    throw err;
  }
}

export async function validateProspect(email: string, phone: string) {
  try {
    const response = await fetch(UrlApi + "api/db/validate-prospect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, phone }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error al validar prospecto:", error);
    return { exists: false };
  }
}

export async function ProspectsList() {
  try {
    const response = await fetch(UrlApi + "api/db/list-prospects", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();

    // Validamos que sea un array
    if (!Array.isArray(data)) {
      console.warn("Respuesta inesperada del servidor:", data);
      return [];
    }
    return data;
  } catch (error) {
    console.error("Error al obtener prospectos:", error);
    return [];
  }
}
export async function registeraexhibitor(
  name: string, contact_firstname: string, contact_lastname: string, contact_phone: string, address: string, website: string,
  industry: string) {
  try {
    const response = await fetch(UrlApi + "api/db/registerexhibitor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, contact_firstname, contact_lastname, contact_phone, address, website, industry }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Error en register exhibitor");
    }

    return data;
  } catch (err) {
    console.error("Error en register:", err);
    throw err;
  }
}

export async function getexhibitors() {
  try {
    const response = await fetch(UrlApi + "api/db/getexhibitor", {
       method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const data = await response.json();

    if (!Array.isArray(data)) {
      console.warn("Respuesta inesperada del servidor:", data);
      return [];
    }


    return data;
  } catch (err) {
    console.error("Error en get exhibitor:", err);
    throw err;
  }
}

export async function ProspectsListexhibitors(email: string , exhibitor_id: number) {
  try {
    const response = await fetch(
      UrlApi + `api/db/ProspectsListexhibitors?exhibitor_id=${exhibitor_id}&email=${encodeURIComponent(email)}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();

    // Validamos que sea un array
    if (!Array.isArray(data)) {
      console.warn("Respuesta inesperada del servidor:", data);
      return [];
    }
    return data;
  } catch (error) {
    console.error("Error al obtener prospectos:", error);
    return [];
  }
}

export async function Registerpotential_clients(ticket_id : number = 0, user_id :number = 0 ,exhibitor_id: number = 0 ) {
  try {
    const response = await fetch(UrlApi + "api/db/Registerpotential", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ticket_id,
        user_id,
        exhibitor_id,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Error en potential");
    }

    return data.id;
  } catch (err) {
    console.error("Error en potential:", err);
    throw err;
  }
}

export async function validate_potential_clients(ticket_id: number) {
  try {
    
    const response = await fetch(UrlApi + "api/db/validate_potential_clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticket_id }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error al validar prospecto:", error);
    return { exists: false };
  }
}

export async function registerExcelData(data: any[]) {
  try {
    const response = await fetch(UrlApi + "api/db/registerExcelData", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data }), // enviamos el array completo
    });

    const resData = await response.json();

    if (!response.ok) {
      throw new Error(resData.message || "Error al registrar los datos del Excel");
    }

    return resData; // { message: "Data inserted successfully", inserted: N }
  } catch (err) {
    console.error("Error al registrar Excel data:", err);
    throw err;
  }
}

export async function GetDataTicket(email: string) {
  try {
    const cleanEmail = email.replace(/^"|"$/g, "");
    const response = await fetch(
      UrlApi + `api/db/DataTicket/${encodeURIComponent(cleanEmail)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer TU_TOKEN_SEGURIDAD", // No eh difinido aun el token
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "No se encontró informaicon con el ticket");
    }

    return data;
  } catch (err) {
    console.error("Error al consultar el data:", err);
    throw err;
  }
}