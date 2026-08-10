/**
 * ResiSync - Core Interactive Application Controller
 * Handles Screen Routing, Role Personas, IoT Telemetry, Modals & State Management
 */

// Application State
const ResiSyncState = {
  currentScreenId: '3', // Default: Resident Dashboard
  currentRole: 'resident', // 'resident' | 'security' | 'admin'
  viewMode: 'emulator', // 'emulator' | 'showcase'
  maintenanceStatus: 'PENDING',
  visitors: [
    { id: 1, name: 'Amit Sharma', type: 'Personal Guest', time: 'Today, 11:00 AM', status: 'Expected', category: 'today', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80' },
    { id: 2, name: 'Rohit Verma', type: 'Delivery', time: 'Today, 02:30 PM', status: 'Expected', category: 'today', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80' },
    { id: 3, name: 'Neha Kapoor', type: 'Service Provider', time: 'Tomorrow, 10:00 AM', status: 'Expected', category: 'upcoming', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80' }
  ],
  iot: {
    powerUsage: 72,
    waterTank: 78,
    parkingSpaces: 18,
    temperature: 26,
    aqi: 42,
    overallHealth: 96
  },
  sosCountdownTimer: null
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  renderActiveScreen();
  renderShowcaseGrid();
  startIoTSimulation();
});

/**
 * Screen Navigation Engine
 */
function navigateToScreen(screenId) {
  ResiSyncState.currentScreenId = String(screenId);

  // Sync Select Dropdown in Desktop Bar
  const screenSelect = document.getElementById('screenSelect');
  if (screenSelect) {
    screenSelect.value = String(screenId);
  }

  // If in emulator mode, render active screen
  renderActiveScreen();

  // Scroll to top of active screen
  const viewport = document.getElementById('activeScreenViewport');
  if (viewport) {
    const scrollable = viewport.querySelector('.screen-scroll-content, .screen-body');
    if (scrollable) scrollable.scrollTop = 0;
  }
}

/**
 * Render Screen in Single Phone Emulator
 */
function renderActiveScreen() {
  const viewport = document.getElementById('activeScreenViewport');
  const template = document.getElementById(`template-screen-${ResiSyncState.currentScreenId}`);
  
  if (!viewport || !template) return;

  // Clone template content to prevent DOM detachment
  viewport.innerHTML = template.innerHTML;
  
  // Re-bind dynamic values if needed
  updateDynamicUiElements(viewport);
}

/**
 * Render All 12 Screens into the Showcase Grid
 */
function renderShowcaseGrid() {
  const mount = document.getElementById('showcaseScreensMount');
  if (!mount) return;

  mount.innerHTML = '';

  for (let i = 1; i <= 12; i++) {
    const template = document.getElementById(`template-screen-${i}`);
    if (template) {
      const card = document.createElement('div');
      card.className = 'showcase-screen-card';
      card.setAttribute('data-screen-id', String(i));
      card.innerHTML = template.innerHTML;
      
      // Make card clickable to inspect in emulator
      card.addEventListener('click', (e) => {
        // If not clicking interactive button
        if (!e.target.closest('button, a, input, select')) {
          navigateToScreen(i);
          setViewMode('emulator');
          openToast(`Switched to Screen ${i} in Interactive Emulator`);
        }
      });

      mount.appendChild(card);
    }
  }
}

/**
 * View Mode Switcher: 'emulator' (Single phone) vs 'showcase' (12-screen grid)
 */
function setViewMode(mode) {
  ResiSyncState.viewMode = mode;
  document.body.className = `mode-${mode}`;

  document.getElementById('btnPhoneView')?.classList.toggle('active', mode === 'emulator');
  document.getElementById('btnShowcaseView')?.classList.toggle('active', mode === 'showcase');

  if (mode === 'showcase') {
    renderShowcaseGrid();
  }
}

/**
 * Role Persona Switcher
 */
function switchRole(role) {
  ResiSyncState.currentRole = role;

  document.querySelectorAll('.role-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-role') === role);
  });

  if (role === 'resident') {
    navigateToScreen('3'); // Resident Dashboard
    openToast('Switched to Resident Persona: Shivani (Flat A-204)');
  } else if (role === 'security') {
    navigateToScreen('11'); // Security Guard
    openToast('Switched to Gate 01 Security Guard Console');
  } else if (role === 'admin') {
    navigateToScreen('10'); // Admin Dashboard
    openToast('Switched to Society Management Admin Portal');
  }
}

/**
 * Updates UI values (e.g. IoT telemetry, paid status) across visible screens
 */
function updateDynamicUiElements(container) {
  // Update IoT Values
  const powerEl = container.querySelector('#iotPowerUsage');
  if (powerEl) powerEl.textContent = `${ResiSyncState.iot.powerUsage}% Usage`;

  const waterEl = container.querySelector('#iotWaterTank');
  if (waterEl) waterEl.textContent = `Tank ${ResiSyncState.iot.waterTank}%`;

  const parkEl = container.querySelector('#iotParkingSpaces');
  if (parkEl) parkEl.textContent = `${ResiSyncState.iot.parkingSpaces} Spaces`;

  const tempEl = container.querySelector('#iotTemp');
  if (tempEl) tempEl.textContent = `${ResiSyncState.iot.temperature}°C`;

  const aqiEl = container.querySelector('#iotAqi');
  if (aqiEl) aqiEl.textContent = `AQI ${ResiSyncState.iot.aqi}`;

  // Maintenance Status Update
  if (ResiSyncState.maintenanceStatus === 'PAID') {
    const dueAmtEl = container.querySelector('#mainDueAmount');
    if (dueAmtEl) dueAmtEl.textContent = '₹0.00';

    const payBtn = container.querySelector('#btnPayNow');
    if (payBtn) {
      payBtn.textContent = '✓ Paid for August 2026';
      payBtn.style.background = '#00E676';
      payBtn.style.color = '#000';
    }
  }
}

/**
 * Live IoT Telemetry Simulator
 */
function startIoTSimulation() {
  setInterval(() => {
    // Subtle realistic variations
    ResiSyncState.iot.powerUsage = Math.min(95, Math.max(60, ResiSyncState.iot.powerUsage + (Math.random() > 0.5 ? 1 : -1)));
    ResiSyncState.iot.parkingSpaces = Math.min(24, Math.max(8, ResiSyncState.iot.parkingSpaces + (Math.random() > 0.6 ? (Math.random() > 0.5 ? 1 : -1) : 0)));
    
    // Update active screen if on IoT screen
    if (ResiSyncState.currentScreenId === '9' || ResiSyncState.currentScreenId === '3') {
      const activeViewport = document.getElementById('activeScreenViewport');
      if (activeViewport) updateDynamicUiElements(activeViewport);
    }
  }, 4000);
}

function refreshIoTTelemetry() {
  ResiSyncState.iot.powerUsage = 71;
  ResiSyncState.iot.waterTank = 82;
  ResiSyncState.iot.temperature = 25;
  ResiSyncState.iot.aqi = 38;
  renderActiveScreen();
  openToast('IoT Sensors & Gateway Mesh synchronized successfully');
}

/**
 * Authentication Simulation
 */
function handleLoginSubmit(event) {
  event.preventDefault();
  openToast('Welcome back, Shivani! Authenticating biometrics...');
  setTimeout(() => {
    navigateToScreen('3');
  }, 600);
}

function togglePasswordVisibility(inputId, btn) {
  const input = document.getElementById(inputId) || btn.closest('.input-group')?.querySelector('input');
  if (input) {
    input.type = input.type === 'password' ? 'text' : 'password';
  }
}

function handleLogout() {
  openToast('Logged out of ResiSync. Redirecting to Splash...');
  setTimeout(() => {
    navigateToScreen('1');
  }, 500);
}

/**
 * Visitor Management Logic
 */
function filterVisitors(category, btn) {
  const parentScreen = btn.closest('.screen') || document;
  parentScreen.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  const cards = parentScreen.querySelectorAll('#visitorCardsContainer .visitor-item-card');
  cards.forEach(card => {
    if (category === 'history') {
      card.style.display = 'flex';
      card.style.opacity = '0.7';
    } else {
      card.style.opacity = '1';
      card.style.display = (card.getAttribute('data-category') === category || category === 'upcoming') ? 'flex' : 'none';
    }
  });
}

function handleVisitorAction(btn, action) {
  const card = btn.closest('.visitor-item-card');
  const name = card.querySelector('h5')?.textContent || 'Visitor';
  
  const actionRow = card.querySelector('.action-btn-row');
  if (actionRow) {
    actionRow.innerHTML = `<span class="tag-status ${action === 'Approved' ? 'resolved' : 'urgent-card'}" style="padding:4px 10px; font-size:10px;">${action}</span>`;
  }
  openToast(`${action} entry pass for ${name}`);
}

function openInviteVisitorModal() {
  openModal('inviteVisitorModal');
}

function handleInviteVisitorSubmit(event) {
  event.preventDefault();
  const name = document.getElementById('visitorNameInput').value;
  const purpose = document.getElementById('visitorPurposeSelect').value;
  
  closeModal('inviteVisitorModal');
  openQrModal(name, `Flat A-204 • ${purpose}`);
  openToast(`Invited ${name}! Digital QR Pass generated.`);
}

function openQrModal(name, subtitle) {
  document.getElementById('qrPassName').textContent = name;
  document.getElementById('qrPassFlat').textContent = subtitle;
  openModal('qrModal');
}

/**
 * Maintenance Payment Flow
 */
function openPaymentGatewayModal() {
  openModal('paymentModal');
}

function processPayment() {
  closeModal('paymentModal');
  ResiSyncState.maintenanceStatus = 'PAID';
  openToast('Payment of ₹3,500 processed successfully via UPI!');
  
  // Re-render maintenance screen
  renderActiveScreen();

  // Open Receipt
  setTimeout(() => {
    openReceiptModal('10 Aug 2026', '₹3,500.00', 'PAID');
  }, 400);
}

function openReceiptModal(date, amt, status) {
  document.getElementById('rcptDate').textContent = date;
  document.getElementById('rcptAmt').textContent = amt;
  document.getElementById('rcptStatus').textContent = status;
  openModal('receiptModal');
}

function downloadReceiptPdf() {
  closeModal('receiptModal');
  openToast('Downloading Grand_Palm_Heights_Maintenance_Aug2026.pdf...');
}

/**
 * Amenities Booking Flow
 */
function filterAmenities(filter, btn) {
  const parent = btn.closest('.screen') || document;
  parent.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  const cards = parent.querySelectorAll('#amenitiesCardsContainer .amenity-card');
  cards.forEach((card, idx) => {
    if (filter === 'my') {
      card.style.display = idx === 0 ? 'flex' : 'none'; // Only show 1 booked
    } else {
      card.style.display = 'flex';
    }
  });
}

function openAmenityBookingModal(amenityName) {
  document.getElementById('amenityModalTitle').textContent = `Book ${amenityName}`;
  openModal('amenityModal');
}

function selectSlot(btn) {
  btn.closest('.slot-picker-grid').querySelectorAll('.slot-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function handleAmenityBookingSubmit(event) {
  event.preventDefault();
  closeModal('amenityModal');
  openToast('Amenity slot confirmed! Added to My Bookings.');
}

/**
 * Helpdesk Flow
 */
function selectHelpdeskCategory(catName, btn) {
  btn.closest('.screen').querySelectorAll('.cat-pill').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  openToast(`Filtered requests by ${catName}`);
}

function openRaiseTicketModal() {
  openModal('ticketModal');
}

function handleRaiseTicketSubmit(event) {
  event.preventDefault();
  const category = document.getElementById('ticketCategorySelect').value;
  const desc = document.getElementById('ticketDescInput').value;

  closeModal('ticketModal');
  openToast(`Ticket REQ${Math.floor(1000 + Math.random() * 9000)} created for ${category}! Technician assigned.`);
}

/**
 * Alerts & SOS Emergency Flow
 */
function filterAlerts(filter, btn) {
  btn.closest('.screen').querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  const feed = btn.closest('.screen').querySelector('#alertsFeed');
  if (feed) {
    feed.querySelectorAll('.alert-item-card').forEach((item, index) => {
      item.style.display = (filter === 'unread' && index > 2) ? 'none' : 'flex';
    });
  }
}

function triggerSosEmergency() {
  openModal('sosModal');
  let count = 3;
  const countEl = document.getElementById('sosCount');
  if (countEl) countEl.textContent = count;

  if (ResiSyncState.sosCountdownTimer) clearInterval(ResiSyncState.sosCountdownTimer);

  ResiSyncState.sosCountdownTimer = setInterval(() => {
    count--;
    if (countEl) countEl.textContent = count;
    if (count <= 0) {
      clearInterval(ResiSyncState.sosCountdownTimer);
      openToast('🚨 ALARM BROADCASTED: Gate Security and Ambulances dispatched to Flat A-204');
    }
  }, 1000);
}

function cancelSos() {
  if (ResiSyncState.sosCountdownTimer) clearInterval(ResiSyncState.sosCountdownTimer);
  closeModal('sosModal');
  openToast('Emergency SOS Siren cancelled by Resident');
}

/**
 * Gate Security Functions
 */
function openQrScannerSimulator() {
  openToast('📷 Camera Active: Scanning Visitor Entry QR...');
  setTimeout(() => {
    openToast('✓ QR Verified: Amit Sharma authorized for Flat A-204');
  }, 1200);
}

function openRegisterVisitorGuardModal() {
  openInviteVisitorModal();
}

function openDeliveryEntryGuardModal() {
  openToast('Quick Delivery Log: Amazon / Zomato courier logged at Gate 1');
}

function handleGuardCheckIn(btn) {
  btn.textContent = '✓ Inside';
  btn.style.background = '#4CAF50';
  btn.style.color = '#fff';
  btn.disabled = true;
  openToast('Visitor Amit Sharma checked in through Gate 01');
}

/**
 * Global Modal Helpers
 */
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('show');
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('show');
  }
}

/**
 * Global Toast Notification Helper
 */
function openToast(message) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 2800);
}
