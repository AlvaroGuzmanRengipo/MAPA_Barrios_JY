const DATA_URL = 'https://script.google.com/macros/s/AKfycbw-3QdVthb8OLx9gPL1ehqbw3MpdS7Fu_5LPsvS169o8Sk2aEI9mEIKYGvRX16a6Cjhrw/exec';

let map = L.map('map').setView([-24.188, -65.302], 14);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

const puntoLayerGroup = L.layerGroup().addTo(map);
const barrioLayerGroup = L.layerGroup().addTo(map);

let datosOriginales = {
  barrios: [],
  casas: []
};

const barriosFijos = [
  "CIUDAD DE NIEVA", "SAN MARTIN", "CHIJRA", "NUEVO",
  "CAMPO VERDE", "MARIANO MORENO", "GORRITI", "EL CHINGO",
  "BELGRANO", "SAN PEDRITO", "LOS PERALES", "PUNTA DIAMANTE"
];

// Mostrar / ocultar loader
function mostrarCargando(mostrar) {
  const loader = document.getElementById('loader');
  if (loader) loader.style.display = mostrar ? 'block' : 'none';
}

// Crear popup para casas
function crearPopupCasa(casa) {
  return `<b>Evento:</b> ${casa.evento}<br><b>Barrio:</b> ${casa.barrio}<br><b>Dirección:</b> ${casa.direccion}<br><b>Apellido y Nombre (JEF.FAM):</b> ${casa.Apellido_Nombre_DNI_JefeFamilia}<br><b>DNI (JEF.FAM):</b> ${casa.DocumentoJefeFlia}`;
}

// Crear popup para barrios
function crearPopupBarrio(nombre) {
  return `<b>Barrio:</b> ${nombre}`;
}

// Cargar y mostrar los datos
function cargarDatos() {
  mostrarCargando(true);
  fetch(DATA_URL)
    .then(res => res.json())
    .then(data => {
      mostrarCargando(false);
      datosOriginales = data;

      // Mostrar polígonos
      barrioLayerGroup.clearLayers();
      data.barrios.forEach(barrio => {
        const polygon = L.polygon(barrio.coordenadas, {
          color: '#0077cc',
          fillOpacity: 0.2,
          weight: 2
        }).bindPopup(crearPopupBarrio(barrio.nombre_barrio));
        barrioLayerGroup.addLayer(polygon);
      });

      // Mostrar todos los puntos al inicio
      mostrarPuntos(data.casas);

      // Generar selects dinámicos
      llenarSelectEventos(data.casas);
      llenarSelectBarrios(data.casas);
    })
    .catch(err => {
      mostrarCargando(false);
      console.error('Error cargando datos:', err);
    });
}

// Mostrar marcadores de puntos
function mostrarPuntos(casasFiltradas) {
  puntoLayerGroup.clearLayers();
  casasFiltradas.forEach(casa => {
    const marker = L.marker([casa.lat, casa.lng])
      .bindPopup(crearPopupCasa(casa));
    puntoLayerGroup.addLayer(marker);
  });
}

// Llenar select con eventos únicos + base
function llenarSelectEventos(casas) {
  const select = document.getElementById('evento');
  const eventos = [...new Set([
    ...casas.map(c => c.evento.trim()).filter(e => e),
    // ...["Evento 1", "Evento 2"] // podés poner eventos base si querés
  ])];

  select.innerHTML = `<option value="">Todos</option>`;
  eventos.sort().forEach(evento => {
    const opt = document.createElement('option');
    opt.value = evento;
    opt.textContent = evento;
    select.appendChild(opt);
  });
}

// Llenar select con barrios únicos + base
function llenarSelectBarrios(casas) {
  const select = document.getElementById('barrio');
  const barrios = [...new Set([
    ...casas.map(c => c.barrio.trim().toUpperCase()).filter(b => b),
    // ...barriosFijos
  ])];

  select.innerHTML = `<option value="">Todos</option>`;
  barrios.sort().forEach(barrio => {
    const opt = document.createElement('option');
    opt.value = barrio;
    opt.textContent = barrio;
    select.appendChild(opt);
  });
}

// Aplicar filtro combinado
function aplicarFiltro() {
  const eventoSeleccionado = document.getElementById('evento').value;
  const barrioSeleccionado = document.getElementById('barrio').value;

  const casasFiltradas = datosOriginales.casas.filter(casa => {
    const coincideEvento = !eventoSeleccionado || casa.evento === eventoSeleccionado;
    const coincideBarrio = !barrioSeleccionado || casa.barrio.toUpperCase() === barrioSeleccionado;
    return coincideEvento && coincideBarrio;
  });

  mostrarPuntos(casasFiltradas);
}

document.getElementById('btnFiltrar').addEventListener('click', aplicarFiltro);
document.getElementById('btnReiniciar').addEventListener('click', () => {
  document.getElementById('evento').value = '';
  document.getElementById('barrio').value = '';
  mostrarPuntos(datosOriginales.casas);
});
// Mostrar/Ocultar panel de filtros
const btnToggle = document.getElementById('toggleFiltros');
const panelFiltros = document.getElementById('filtros');

btnToggle.addEventListener('click', () => {
  panelFiltros.classList.toggle('d-none');
});

// Cargar al inicio
cargarDatos();
