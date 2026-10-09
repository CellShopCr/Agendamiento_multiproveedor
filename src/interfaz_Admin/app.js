
const doctorsByService = {
  "Cardiología": [
    { id: "1", name: "Dr. Carlos Pérez (Cardiología)" }
  ],
  "Dentista": [
    { id: "2", name: "Dra. Ana Gómez (Dentista)" }
  ],
  "Consultoría": [
    { id: "3", name: "Ing. Roberto Silva (Consultoría)" }
  ]
};

const btnNextStep = document.getElementById('btnNextStep');
const btnBackStep = document.getElementById('btnBackStep');
const step2 = document.getElementById('step2');
const serviceType = document.getElementById('serviceType');
const providerSelect = document.getElementById('providerId');
const startTimeInput = document.getElementById('startTime');
const endTimeInput = document.getElementById('endTime');
const btnSubmit = document.getElementById('btnSubmit');

const appointmentForm = document.getElementById('appointmentForm');
const alertBox = document.getElementById('alertBox');
const alertMessage = document.getElementById('alertMessage');
const alertIcon = document.getElementById('alertIcon');
const appointmentsList = document.getElementById('appointmentsList');
const kpiTotal = document.getElementById('kpi-total');

let appointments = [];

// Evento: Pasar al Paso 2
btnNextStep.addEventListener('click', () => {
  const name = document.getElementById('clientName').value.trim();
  const id = document.getElementById('clientId').value.trim();
  const phone = document.getElementById('clientPhone').value.trim();
  const email = document.getElementById('clientEmail').value.trim();
  const service = serviceType.value;

  if (!name || !id || !phone || !email || !service) {
    showAlert('Por favor completa todos los datos del paciente y el servicio requerido.', 'error');
    return;
  }

  // Filtrar doctores para el servicio seleccionado
  providerSelect.innerHTML = '<option value="">Selecciona un profesional...</option>';
  const doctors = doctorsByService[service] || [];
  
  doctors.forEach(doc => {
    const opt = document.createElement('option');
    opt.value = doc.id;
    opt.textContent = doc.name;
    providerSelect.appendChild(opt);
  });

  // Habilitar controles del Paso 2
  step2.classList.remove('disabled-step');
  step2.classList.add('enabled-step');
  providerSelect.disabled = false;
  startTimeInput.disabled = false;
  endTimeInput.disabled = false;
  btnSubmit.disabled = false;

  showAlert('Selecciona el doctor y el horario para completar la reserva.', 'success');
});

// Evento: Volver al Paso 1
btnBackStep.addEventListener('click', () => {
  step2.classList.add('disabled-step');
  step2.classList.remove('enabled-step');
  providerSelect.disabled = true;
  startTimeInput.disabled = true;
  endTimeInput.disabled = true;
  btnSubmit.disabled = true;
});

// Enviar formulario completo
appointmentForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const doctorName = providerSelect.options[providerSelect.selectedIndex].text;

  const payload = {
    client_name: document.getElementById('clientName').value,
    client_id: document.getElementById('clientId').value,
    client_phone: document.getElementById('clientPhone').value,
    client_email: document.getElementById('clientEmail').value,
    service_type: serviceType.value,
    provider_id: providerSelect.value,
    provider_name: doctorName,
    start_time: startTimeInput.value,
    end_time: endTimeInput.value
  };

  try {
    const response = await fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (response.ok) {
      showAlert('¡Cita reservada con éxito!', 'success');
      appointmentForm.reset();
      
      // Bloquear de nuevo el Paso 2
      step2.classList.add('disabled-step');
      step2.classList.remove('enabled-step');
      providerSelect.disabled = true;
      startTimeInput.disabled = true;
      endTimeInput.disabled = true;
      btnSubmit.disabled = true;

      fetchAppointments();
    } else {
      showAlert(data.message || 'Error: Solapamiento de horario detectado.', 'error');
    }
  } catch (error) {
    showAlert('No se pudo conectar con el servidor backend.', 'error');
  }
});

function showAlert(msg, type) {
  alertBox.className = `alert-banner ${type}`;
  alertMessage.textContent = msg;
  alertIcon.className = type === 'success' ? 'fa-solid fa-circle-check' : 'fa-solid fa-triangle-exclamation';
}

async function fetchAppointments() {
  try {
    const response = await fetch('/api/appointments');
    if (response.ok) {
      appointments = await response.json();
      renderTable();
    }
  } catch (error) {
    console.error('Error cargando citas:', error);
  }
}

function renderTable() {
  kpiTotal.textContent = appointments.length;

  if (appointments.length === 0) {
    appointmentsList.innerHTML = `<tr><td colspan="5" class="empty-state">No hay citas registradas.</td></tr>`;
    return;
  }

  appointmentsList.innerHTML = appointments.map(app => `
    <tr>
      <td><strong>${app.client_name}</strong><br><small>CC: ${app.client_id || 'N/A'}</small></td>
      <td>${app.service_type || 'General'}</td>
      <td>${app.provider_name}</td>
      <td>${new Date(app.start_time).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}</td>
      <td><span class="badge confirmed">Confirmada</span></td>
    </tr>
  `).join('');
}

document.getElementById('btnRefresh').addEventListener('click', fetchAppointments);