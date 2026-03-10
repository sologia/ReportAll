import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import L from 'leaflet';
import 'leaflet-draw';
import wellknown from 'wellknown'; // npm i wellknown (bundle con tu build tool)

const map = L.map('map').setView([0, 0], 2);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

const drawLayer = new L.FeatureGroup();
map.addLayer(drawLayer);

const drawControl = new L.Control.Draw({
  edit: { featureGroup: drawLayer },
  draw: { polyline: true, polygon: true, rectangle: true, circle: true, marker: true }
});
map.addControl(drawControl);

let lastLayer = null;
map.on(L.Draw.Event.CREATED, function (e) {
  const layer = e.layer;
  drawLayer.clearLayers();
  drawLayer.addLayer(layer);
  lastLayer = layer;
});

// permite activar una única selección por clic en el mapa
export function enableMapClickForMarker() {
  function onClick(e) {
    setMarker(e.latlng.lat, e.latlng.lng);
    map.off('click', onClick);
  }
  map.on('click', onClick);
}

export function setMarker(lat, lng, zoom = 16) {
  drawLayer.clearLayers();
  const marker = L.marker([lat, lng]);
  drawLayer.addLayer(marker);
  lastLayer = marker;
  map.setView([lat, lng], zoom);
}

export function clearDrawn() {
  drawLayer.clearLayers();
  lastLayer = null;
}

export function hasGeometry() {
  return lastLayer !== null;
}

export function getGeometryWKT() {
  if (!lastLayer) return null;
  const feature = lastLayer.toGeoJSON();
  const geojsonGeometry = feature.geometry;
  return wellknown.stringify(geojsonGeometry);
}

// función que envía datos al backend (usa FormData para adjuntar imagen si hay)
// mantiene compatibilidad con la versión previa: usa la geometría actualmente dibujada
export async function sendReport(formFields, fileInput) {
  const wkt = getGeometryWKT();
  if (!wkt) {
    throw new Error('Dibuja la geometría en el mapa antes de enviar.');
  }

  const fd = new FormData();
  Object.entries(formFields).forEach(([k, v]) => {
    if (v !== undefined && v !== null) fd.append(k, v);
  });
  fd.append('GeoM', wkt); // el backend esperará WKT
  if (fileInput && fileInput.files && fileInput.files[0]) {
    fd.append('BINPhoto', fileInput.files[0]); // campo que espera multer en backend
  }

  const res = await fetch('/api/reports', {
    method: 'POST',
    body: fd
  });
  if (!res.ok) throw new Error(`Error: ${res.status}`);
  return res.json();
}

export default map;     