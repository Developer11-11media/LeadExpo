import { useRouter } from 'expo-router';
import React, { useContext, useEffect } from 'react';
import { Alert, Platform, View } from 'react-native';
import { GetTicketFromExcel, Registerpotential_clients, validateProspect, validate_potential_clients } from "../../services/functionsDB";
import { UserContext } from "../../services/UserContext";
import QRScannerScreen from '../QRScannerScreen';
export default function QRScannerTab() {
  const router = useRouter();
  const { user, loading: userLoading } = useContext(UserContext);


  const handleQRScanned = async (data: string) => {
    try {
      try {

        //Validamos que si es admin debe registrarlo en los ticket 
        if (user && user.role === "admin") {
          if (!(typeof data === "string" && data.toLowerCase().startsWith("http"))) {

            if (Platform.OS === 'web') {
              window.alert(
                'El código QR ya esta generado '
              );
            } else {
              Alert.alert(
                'QR Insuficiente',
                'El código QR ya esta generado.'
              );
            }
            return;
          }

          const partes = data.split('/');
          const ticket = partes[partes.length - 1];

          const Excel = await GetTicketFromExcel(ticket);

          //Antes de crear el QR, Validamos
          const hasValidName = (Excel.firstname || Excel.lastname) &&
            ((Excel.firstname?.trim().length || 0) > 0 || (Excel.lastname?.trim().length || 0) > 0);
          const hasValidEmail = Excel.email && Excel.email.includes('@');

          if (!hasValidName && !hasValidEmail) {

            if (Platform.OS === 'web') {
              window.alert('El código QR no contiene información suficiente (nombre o email). Intenta con un QR que contenga datos de contacto.');
            } else {
              Alert.alert('QR Insuficiente', 'El código QR no contiene información suficiente (nombre o email). Intenta con un QR que contenga datos de contacto.');
            }
            return;
          }
          // Verificar si el prospecto ya existe (solo si tenemos email o teléfono)
          if (Excel.email || Excel.phone) {
            const existingProspects = await validateProspect(Excel.email, Excel.phone);

            if (existingProspects.exists) {
              const p = existingProspects.prospect;
              const existingName = `${p.firstname || ""} ${p.lastname || ""}`.trim();

              if (Platform.OS === 'web') {
                if (window.confirm(`Este prospecto ya está registrado: ${existingName}\n\n¿Quieres ver los detalles?`)) {
                  router.push({
                    pathname: '/prospect-detail',
                    params: { prospectId: existingProspects.id }
                  });
                }
              } else {
                Alert.alert(
                  'Prospecto Existente',
                  `Este prospecto ya está registrado: ${existingName}`,
                  [
                    {
                      text: 'Ver Detalles', onPress: () => {
                        router.push({
                          pathname: '/prospect-detail',
                          params: { prospectId: existingProspects.id }
                        });
                      }
                    },
                    { text: 'Cancelar', style: 'cancel' }
                  ]
                );
              }

              return;
            }
          }

          //Hacemos QR
          router.push({
            pathname: "/PreviewBadge.modal",
            params: {
              idticket: 0,
              ticket_number_GlupUp: ticket,
              firstname: Excel.firstname,
              lastname: Excel.lastname,
              email: Excel.email,
              company: Excel.company,
              position_title: Excel.employee,
              phone_number: Excel.phone,
              type_ticket: Excel.type_ticket,
            },
          });

        } else {
          //registramos cliente pontencial
          const qrjson = JSON.parse(data);
          const iduser = Number(user?.id);
          //antes de registrar necesitamos validar que exista 
          const existingpotential = await validate_potential_clients(qrjson.idticket);

          if (existingpotential.exists) {

            if (Platform.OS === 'web') {
              window.alert('El código QR ya esta registrado.');
            } else {
              Alert.alert('El código QR ya esta registrado.');
            }

            return;
          }
          await Registerpotential_clients(
            qrjson.idticket,
            iduser,
            user?.exhibitor_id,
          );
          if (Platform.OS === 'web') {
            window.alert('El código QR ya se registro.');
          } else {
            Alert.alert('El código QR ya se registro.');
          }
        }
        //Get api Glue Up


      } catch (error) {
        console.error('Error llamando al proxy:', error);
      }
      //Fin Get Api

    } catch (error) {
      console.error('Error processing QR:', error);
      //Implementar para las plaformas
      if (Platform.OS === 'web') {
        window.alert('No se pudo procesar el código QR. Intenta de nuevo.');
      } else {
        Alert.alert('Error', 'No se pudo procesar el código QR. Intenta de nuevo.');
      }

    }
  };
  
  useEffect(() => {
    if (!user) {
      router.replace('/login'); // redirige al login si no hay usuario
    }
  }, [user]);

  return (
    <View style={{ flex: 1 }}>
      <QRScannerScreen
        onQRScanned={handleQRScanned}
        onBack={() => { }}
      />
    </View>
  );
}
