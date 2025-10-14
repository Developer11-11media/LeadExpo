const UrlLocalApi = 'http://192.168.1.80:4000/';

const UrlPro = 'https://leadexpo-backend.onrender.com/';

export async function login(email: string, password: string) {
  try {
    const response = await fetch(UrlPro + "api/db/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Error en login");
    }

    return data; // { message, user }
  } catch (err) {
    console.error("Error en login:", err);
    throw err;
  }
}


