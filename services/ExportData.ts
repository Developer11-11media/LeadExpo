import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

export  function exportToExcel(prospects: any[]) {
  if (!prospects || prospects.length === 0) {
    alert('No hay prospectos para exportar');
    return;
  }

  // Convertir la lista de prospectos a una hoja de Excel
  const worksheet = XLSX.utils.json_to_sheet(prospects);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Prospects');

  // Generar el archivo en formato Excel
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

  // Crear Blob y forzar descarga
  const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
  saveAs(data, 'prospects.xlsx');
}