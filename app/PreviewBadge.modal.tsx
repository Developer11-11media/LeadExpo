import * as Print from "expo-print";
import { useLocalSearchParams, useRouter } from "expo-router";
import QRCode from "qrcode";
import React, { useRef } from "react";
import { Button, Platform, StyleSheet, View } from "react-native";
import ViewShot from "react-native-view-shot";
import { RegisterTicketdb } from "../services/functionsDB";
import TicketBadge from "./TicketBadge";

export const unstable_settings = {
  presentation: 'modal',
};


export default function PreviewBadgeModal() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Ref nativo (solo mobile)
  const viewRef = useRef<any>(null);

  const ticketData = {
    idticket: params.idticket ? Number(params.idticket) : 0,
    ticket_number_GlupUp: params.ticket_number_GlupUp as string,
    firstname: params.firstname as string,
    lastname: params.lastname as string,
    email: params.email as string,
    company: params.company as string,
    position_title: params.position_title as string,
    phone_number: params.phone_number as string,
    type_ticket: params.type_ticket as string,
  };


  async function getBase64FromUrl(imageUrl: string): Promise<string | null> {
    try {
      const response = await fetch(imageUrl, { mode: "cors" });
      const blob = await response.blob();
      const reader = new FileReader();
      return await new Promise((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error("Error al convertir imagen:", error);
      return null;
    }
  }

  const handlePrint = async () => {
    try {

      //Registrar la informacion
      if(ticketData.idticket === 0){
        const dataticket = await RegisterTicketdb(
        ticketData.ticket_number_GlupUp,
        ticketData.firstname,
        ticketData.lastname,
        ticketData.email,
        ticketData.company,
        ticketData.position_title,
        ticketData.phone_number,
        ticketData.type_ticket,
        "",
        "QR System"
      );
      ticketData.idticket = dataticket;
      router.back();
      }

     
      if (Platform.OS === "web") {
        // 1. Generar QR en base64
        const qrDataUrl = await QRCode.toDataURL(JSON.stringify(ticketData));
        const imgnahica = "https://leads.expocontratista.com/img/nahica.jpeg";
        const imgsponser = "https://leads.expocontratista.com/img/Sponsors-01-01.png";
        // 2. Abrir ventana de impresión
        const win = window.open("", "_blank");
        if (!win) return;

        win.document.write(`
        <!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Imprimir Badge</title>
    <style>
      @page {
        size: 4in 6in;
        margin: 0;
      }

      body {
        margin: 0;
        padding: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        background: white;
      }

      .badge {
        width: 4in;
        height: 6in;
        background: white;
        border: 2px solid black;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        padding: 20px;
        box-sizing: border-box;
        font-family: Arial, sans-serif;
      }

      /* fila superior con logo izquierda y QR derecha */
      .top-row {
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .top-row img {
        height: 100px;
        object-fit: contain;
      }

      /* Contenedor de información centrado */
      .info {
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
      }

      .name {
        font-size: 30px;
        font-weight: bold;
        margin: 10px 0;
        margin-top: 0px;
      }

      .company,
      .position,
      .type {
        font-size: 20px;
        margin: 33px 0;
      }

      /* Divider justo arriba del logo */
      .divider {
        width: 100%;
        height: 2px;
        background: black;
        margin: 10px 0;
      }

      .sponsor {
        width: 370px;
        height: auto;
      }
    </style>
  </head>
  <body>
    <div class="badge">
      <!-- fila superior -->
      <div class="top-row">
        <img src="${imgnahica}" alt="Logo" style="width:150px;" />
        <img src="${qrDataUrl}" alt="Código QR" style="width:120px; height:120px;" />
      </div>

      <!-- datos centrados -->
      <div class="info">
        <div class="name">${ticketData.firstname + " " + ticketData.lastname}</div>
        <div class="company">${ticketData.company || ""}</div>
        <div class="position">${ticketData.position_title || ""}</div>
        <div class="type">${ticketData.type_ticket}</div>
      </div>

      <!-- divider arriba del logo -->
      <div class="divider"></div>

      <!-- logo inferior -->
      <img class="sponsor" src="${imgsponser}" alt="Patrocinador" />
    </div>

    <script>
      window.onload = () => {
        window.print();
      };
    </script>
  </body>
</html>

      `);

        win.document.close();
      } else {
        // 📱 Mobile -> igual que antes con ViewShot
        if (!viewRef.current) return;
        const uri = await viewRef.current.capture();
        await Print.printAsync({ uri });
      }
    } catch (err) {
      console.error("Error imprimiendo badge:", err);
    }
  };

  return (
    <View style={styles.modalContainer}>

      {Platform.OS === "web" ? (
        // 🌐 Web
        <View nativeID="badge" className="badgeWeb">
          <TicketBadge ticketData={ticketData} />
        </View>
      ) : (
        // 📱 Mobile
        <ViewShot
          ref={viewRef}
          options={{
            format: "png",
            quality: 1,
            width: 1200, // 4in a 300dpi
            height: 1800, // 6in a 300dpi
          }}
        >
          <View style={{ flex: 1, backgroundColor: "white" }}>
            <TicketBadge ticketData={ticketData} />
          </View>
        </ViewShot>
      )}

      <View style={styles.actions}>
        <Button title="Imprimir" onPress={handlePrint} />
        <Button title="Cerrar" onPress={() => router.back()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "white",
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
    gap: 10,
  },
});
