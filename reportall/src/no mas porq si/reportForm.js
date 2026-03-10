import map, { enableMapClickForMarker, setMarker, clearDrawn, sendReport } from './map.js';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('reportForm');
  const fileInput = document.getElementById('BINPhoto');
  const btnMark = document.getElementById('btnMark');
  const btnUseCenter = document.getElementById('btnUseCenter');
  const btnClear = document.getElementById('btnClear');
  const status = document.getElementById('status');

  btnMark.addEventListener('click', (e) => {
    e.preventDefault();
    status.textContent = 'Haz clic en el mapa para marcar la geometría...';
    enableMapClickForMarker();
  });

  btnUseCenter.addEventListener('click', (e) => {
    e.preventDefault();
    const center = map.getCenter();
    setMarker(center.lat, center.lng, 16);
  });

  btnClear.addEventListener('click', (e) => {
    e.preventDefault();
    clearDrawn();
    status.textContent = 'Geometría borrada';
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.textContent = 'Enviando...';
    // Leer campos del formulario (ajusta IDs/nombres según tu HTML)
    const formFields = {
      Name_Problem: document.getElementById('Name_Problem').value,
      Urgency: document.getElementById('Urgency').value,
      Adress: document.getElementById('Adress').value,
      Name_Sector: document.getElementById('Name_Sector').value,
      Date_Time: document.getElementById('Date_Time').value, // asegúrate formato aceptado por SQL Server
      ClientID: document.getElementById('ClientID').value
    };

    try {
      const created = await sendReport(formFields, fileInput);
      status.textContent = 'Reporte creado. ID: ' + (created?.id ?? 'desconocido');
      form.reset();
      clearDrawn();
    } catch (err) {
      console.error(err);
      status.textContent = 'Error: ' + err.message;
    }
  });
});     