import { useRouter } from 'expo-router';
import React, { useContext, useEffect, useState } from 'react';
import { Alert, Platform, SafeAreaView, StyleSheet } from 'react-native';
import { exportToExcel } from 'services/ExportData';
import { ExportService } from '../../services/exportService';
import { ProspectsList, ProspectsListexhibitors } from "../../services/functionsDB";
import { ProspectDatabase } from '../../services/prospectDatabase';
import { UserContext } from "../../services/UserContext";
import ProspectsListScreen from '../ProspectsListScreen';
export default function ProspectsTab() {
  const router = useRouter();
  const [users, setUser] = useState<any>(null);
  const { user, loading: userLoading } = useContext(UserContext);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true); // marca que ya montamos
  }, []);

  useEffect(() => {
    if (!mounted) return; // no navegamos hasta que esté montado
    if (user === null) {
      router.replace("/login");
    }
  }, [mounted, user]);

  useEffect(() => {

    const syncProspectsFromServer = async () => {
      try {
        if (!user) return;
        //validamos el rol
        let remoteProspects;
        if (user && user.role === "admin") {
          remoteProspects = await ProspectsList();
        } else {
          remoteProspects = await ProspectsListexhibitors(user?.email ?? "", user?.exhibitor_id ?? 0);
        }

        if (!remoteProspects || remoteProspects.length === 0) {

          return;
        }
        let importedCount = 0;

        for (const p of remoteProspects) {
          const existing = await ProspectDatabase.searchProspects({
            searchTerm: p.email || p.phone
          });

          const alreadyExists = existing.some(
            (x) =>
              (p.email && x.email === p.email) ||
              (p.phone && x.phone === p.phone)
          );


        }



      } catch (error) {
        console.error('Error al sincronizar prospectos:', error);
      }
    };
    syncProspectsFromServer();
  }, [user]);





  const handleAddRegisterTicket = () => {
    // Navegar al formulario de registro manual
    router.push({
      pathname: '/RegisterTicket',
      params: { showRole: 'true' }
    });
  };

  const handleonAddUploadExcel = () => {
    // Navegar al formulario de registro manual
    router.push({
      pathname: '/UploadExcelScreen',
      params: { showRole: 'true' }
    });
  };


  const handleSettings = () => {
    // Navegar al formulario de registro manual
    router.push({
      pathname: '/settingsScreen',
      params: { showRole: 'true' }
    });
  };

  const handleProspectSelect = (prospectId: string) => {
    // Navegar a la pantalla de detalles del prospecto
    router.push({
      pathname: '/prospect-detail',
      params: { prospectId }
    });
  };
  const handleScanQR = () => {
    // Cambiar a la tab del scanner
    router.push('/(tabs)/qrscanner');
  };


  const handleLogout = () => {
    const logoutAction = async () => {
      try {
        router.replace('/');
      } catch (error) {
        console.error('Error al cerrar sesión:', error);
      }
    };

    if (Platform.OS === 'web') {
      const confirmLogout = window.confirm('¿Seguro que deseas cerrar sesión?');
      if (confirmLogout) logoutAction();
    } else {
      Alert.alert(
        'Cerrar sesión',
        '¿Seguro que deseas salir?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Cerrar sesión', style: 'destructive', onPress: logoutAction },
        ]
      );
    }
  };

  const handleExportAll = async () => {
    try {
      let prospects;

      if (user && user.role === "admin") {
        prospects = await ProspectsList();
      } else {
        prospects = await ProspectsListexhibitors(user?.email ?? "", user?.exhibitor_id ?? 0);
      }

      if (prospects.length === 0) {
        Alert.alert('Sin Datos', 'No hay prospectos para exportar');
        return;
      }

      if (Platform.OS === 'web') {
        exportToExcel(prospects)

      } else {
        Alert.alert(
          'Exportar Prospectos',
          `Tienes ${prospects.length} prospectos. ¿En qué formato quieres exportarlos?`,
          [
            {
              text: 'CSV',
              onPress: async () => {
                await ExportService.exportProspects({
                  format: 'CSV',
                  includeNotes: true,
                  prospects: prospects
                });
              }
            },
            {
              text: 'Excel',
              onPress: async () => {
                await ExportService.exportProspects({
                  format: 'EXCEL',
                  includeNotes: true,
                  prospects: prospects
                });
              }
            },
            {
              text: 'JSON',
              onPress: async () => {
                await ExportService.exportProspects({
                  format: 'JSON',
                  includeNotes: true,
                  prospects: prospects
                });
              }
            },
            { text: 'Cancelar', style: 'cancel' }
          ]
        );
      }

    } catch (error) {
      console.error('Error al obtener prospectos:', error);
      Alert.alert('Error', 'No se pudieron cargar los prospectos para exportar');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ProspectsListScreen
        onProspectSelect={handleProspectSelect}
        onAddRegisterTicket={handleAddRegisterTicket}
        onAddUploadExcel={handleonAddUploadExcel}
        onSettings={handleSettings}
        onScanQR={handleScanQR}
        onExportAll={handleExportAll}
        onLogout={handleLogout}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});