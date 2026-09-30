const API_BASE = '/api';

const state = {
  plants: [],
  activeView: 'home',
  selectedPlantId: 'lipstick-palm',
  currentRole: null,
  currentSteward: 'Student A',
  reviews: [],
  handoverHistory: [],
  careCalendar: [],
  selectedRating: 5
};

async function apiRequest(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json'
    },
    ...options
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.error || 'Request failed');
  }

  return payload;
}

async function loadServerData() {
  try {
    const data = await apiRequest(`${API_BASE}/plants`);
    state.plants = data.plants || [];
    state.currentSteward = data.currentSteward || 'Student A';
    state.reviews = data.reviews || [];
    state.handoverHistory = data.handoverHistory || [];
    state.careCalendar = data.careCalendar || [];
    state.selectedPlantId = data.selectedPlantId || state.plants[0]?.id || 'lipstick-palm';
    syncPlantData();
    renderAll();
  } catch (error) {
    console.error('Failed to load prototype data:', error);
  }
}

function syncPlantData() {
  state.plants.forEach((plant) => {
    plant.healthHistory = plant.healthHistory || [];
    plant.reviews = plant.reviews || [];
    plant.handoverHistory = plant.handoverHistory || [];
  });
}

function getPlantById(id) {
  return state.plants.find((plant) => plant.id === id);
}

function renderAll() {
  renderPlants();
  renderPlantDetails();
  renderGeneralDashboard();
  renderStudentDashboard();
  renderHealthHistory();
  renderCareCalendar();
  renderHandover();
  renderReviews();
}

function renderPlants() {
  const grid = document.getElementById('plantGrid');
  if (!grid) return;

  grid.innerHTML = state.plants
    .map(
      (plant) => `
        <article class="plant-card">
          <img src="${plant.image}" alt="${plant.name}" />
          <div class="plant-card-body">
            <div class="row">
              <h3>${plant.name}</h3>
              <span class="badge">${plant.currentHealth}</span>
            </div>
            <div class="meta">${plant.scientificName}</div>
            <p>${plant.description}</p>
            <ul class="care-list">
              <li>Light: ${plant.care.light}</li>
              <li>Water: ${plant.care.water}</li>
              <li>Soil: ${plant.care.soil}</li>
            </ul>
            <div class="row">
              <span class="badge">${plant.currentSetting}</span>
              <button class="action-btn" data-view="plant-details" data-plant-id="${plant.id}">View Plant</button>
            </div>
          </div>
        </article>
      `
    )
    .join('');
}

function renderPlantDetails() {
  const container = document.getElementById('plantDetailsContent');
  if (!container) return;

  const plant = getPlantById(state.selectedPlantId);
  if (!plant) return;

  const statusClass =
    plant.currentHealth === 'Healthy'
      ? ''
      : plant.currentHealth === 'Mild Stress'
        ? 'warning'
        : 'danger';

  const historyMarkup = (plant.healthHistory || []).map(
    (item) => `
      <div class="history-row">
        <strong>${item.date}</strong>
        <span>${item.condition}</span>
      </div>
    `
  ).join('');

  const reviewMarkup = (plant.reviews || []).map(
    (entry) => `
      <div class="review-item">
        <div>
          <strong>${'★'.repeat(entry.rating)}${'☆'.repeat(5 - entry.rating)}</strong>
          <p>${entry.text}</p>
        </div>
        <span>${entry.author}</span>
      </div>
    `
  ).join('');

  const handoverMarkup = (plant.handoverHistory || []).map(
    (entry) => `
      <div class="history-row">
        <strong>${entry.from} → ${entry.to}</strong>
        <span>${entry.date}</span>
      </div>
    `
  ).join('');

  container.innerHTML = `
    <div class="detail-card">
      <div class="detail-header">
        <img src="${plant.image}" alt="${plant.name}" />
        <div class="detail-content">
          <span class="eyebrow accent">Plant Details</span>
          <h2>${plant.name}</h2>
          <div class="detail-subtitle">Scientific name: <strong>${plant.scientificName}</strong></div>
          <div class="detail-subtitle">Common names: ${plant.commonNames.join(', ')}</div>
          <p class="detail-description">${plant.description}</p>

          <div class="health-summary">
            <span class="status-pill ${statusClass}">${plant.currentHealth}</span>
            <span class="status-pill">Last checked: ${plant.lastChecked}</span>
          </div>

          <div class="info-grid">
            <div class="info-item">
              <h4>Care Requirements</h4>
              <ul>
                <li><strong>Light:</strong> ${plant.care.light}</li>
                <li><strong>Water:</strong> ${plant.care.water}</li>
                <li><strong>Soil:</strong> ${plant.care.soil}</li>
              </ul>
            </div>
            <div class="info-item">
              <h4>Current Stewardship</h4>
              <p>Current student: ${plant.currentStudent}</p>
              <p>Stewardship start: ${plant.stewardshipStart}</p>
              <p>Current setting: ${plant.currentSetting}</p>
            </div>
          </div>

          ${plant.traditionalInfo ? `
            <div class="info-item" style="margin-bottom: 24px;">
              <h4>Traditional / Cultural Information</h4>
              <p>${plant.traditionalInfo}</p>
            </div>
          ` : ''}

          <div class="info-item">
            <h4>Health History</h4>
            <div class="history-list">${historyMarkup}</div>
          </div>

          <div class="info-item" style="margin-top: 18px;">
            <h4>Handover History</h4>
            <div class="history-list">${handoverMarkup}</div>
          </div>

          <div class="info-item" style="margin-top: 18px;">
            <h4>Public Reviews</h4>
            <div class="review-list">${reviewMarkup}</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderGeneralDashboard() {
  const container = document.getElementById('generalDashboardContent');
  if (!container) return;

  container.innerHTML = `
    <div class="dashboard-grid">
      <div class="stat-card">
        <h3>My Profile</h3>
        <p>General User role</p>
      </div>
      <div class="stat-card">
        <h3>Plants</h3>
        <p>2 plants in collection</p>
      </div>
      <div class="stat-card">
        <h3>Current Health</h3>
        <p>Healthy overall</p>
      </div>
    </div>

    <div class="dashboard-menu">
      <div class="menu-card">
        <h4>Plant Details</h4>
        <p>View the scientific and care information for each monitored plant.</p>
      </div>
      <div class="menu-card">
        <h4>Health History</h4>
        <p>Review previous conditions and track plant wellbeing over time.</p>
      </div>
      <div class="menu-card">
        <h4>Stewardship</h4>
        <p>Check current student responsibility and plant continuity records.</p>
      </div>
      <div class="menu-card">
        <h4>Handover History</h4>
        <p>Understand how responsibility has been transferred across students.</p>
      </div>
      <div class="menu-card">
        <h4>Care Requirements</h4>
        <p>Inspect light, water and soil requirements for each plant.</p>
      </div>
      <div class="menu-card">
        <h4>Public Reviews</h4>
        <p>Read public feedback and observations from the plant care community.</p>
      </div>
    </div>
  `;
}

function renderStudentDashboard() {
  const container = document.getElementById('studentDashboardContent');
  if (!container) return;

  const plant = getPlantById(state.selectedPlantId);
  if (!plant) return;

  const latestCondition = plant.healthHistory?.[0]?.condition || plant.currentHealth;
  const streakCount = state.careCalendar.filter((day) => day.done).length;

  container.innerHTML = `
    <div class="student-top">
      <div class="student-plant-card">
        <img src="${plant.image}" alt="${plant.name}" />
        <div class="student-plant-body">
          <h3>${plant.name}</h3>
          <div class="status-pill ${latestCondition === 'Healthy' ? '' : latestCondition === 'Mild Stress' ? 'warning' : 'danger'}">Current condition: ${latestCondition}</div>
          <p style="color: var(--muted); margin-top: 12px;">Last health check: ${plant.lastChecked}</p>
        </div>
      </div>

      <div class="details-stack">
        <div class="detail-item">
          <strong>Current Steward</strong>
          <span>${state.currentSteward}</span>
        </div>
        <div class="detail-item">
          <strong>Stewardship Start</strong>
          <span>${plant.stewardshipStart}</span>
        </div>
        <div class="detail-item">
          <strong>Care Streak</strong>
          <span>${streakCount} Day Care Streak</span>
        </div>
        <div class="detail-item">
          <strong>Condition Summary</strong>
          <span>5 consecutive days of recorded care.</span>
        </div>
      </div>
    </div>

    <div class="dashboard-grid">
      <button class="status-card" data-view="daily-health">
        <h3>Daily Health Check</h3>
        <p>Record a new observation for the plant.</p>
      </button>
      <button class="status-card" data-view="health-history">
        <h3>Health History</h3>
        <p>Review prior conditions and notes.</p>
      </button>
      <button class="status-card" data-view="care-calendar">
        <h3>Care Calendar</h3>
        <p>View care regularity and schedule.</p>
      </button>
      <button class="status-card" data-view="care-calendar">
        <h3>Care Streak</h3>
        <p>Track consistency of plant care.</p>
      </button>
      <button class="status-card" data-view="care-calendar">
        <h3>Stress Alert</h3>
        <p>Check if repeated stress needs attention.</p>
      </button>
      <button class="status-card" data-view="handover">
        <h3>Handover</h3>
        <p>Transfer responsibility to another student.</p>
      </button>
    </div>

    <div class="alert-box">
      <strong>Repeated Stress Detected</strong><br />
      Please pay additional attention to the plant's care.
    </div>
  `;
}

function renderHealthHistory() {
  const container = document.getElementById('healthHistoryContent');
  if (!container) return;

  const plant = getPlantById(state.selectedPlantId);
  if (!plant) return;

  const records = plant.healthHistory || [];

  container.innerHTML = `
    <table style="width: 100%; border-collapse: collapse; background: white; border:1px solid var(--line); border-radius: 18px; overflow: hidden; box-shadow: var(--shadow);">
      <thead>
        <tr style="background: var(--panel-soft);">
          <th style="padding: 16px; text-align: left;">Date</th>
          <th style="padding: 16px; text-align: left;">Condition</th>
        </tr>
      </thead>
      <tbody>
        ${records
          .map(
            (record) => `
              <tr>
                <td style="padding: 16px; border-top:1px solid var(--line);">${record.date}</td>
                <td style="padding: 16px; border-top:1px solid var(--line);">${record.condition}</td>
              </tr>
            `
          )
          .join('')}
      </tbody>
    </table>
  `;
}

function renderCareCalendar() {
  const container = document.getElementById('careCalendarContent');
  if (!container) return;

  container.innerHTML = `
    <div class="calendar-grid">
      ${state.careCalendar
        .map(
          (entry) => `
            <div class="day-cell ${entry.done ? 'done' : 'missed'}">
              <div>${entry.day}</div>
              <div style="font-size: 1.4rem; margin-top: 8px;">${entry.done ? '✓' : '✕'}</div>
            </div>
          `
        )
        .join('')}
    </div>
  `;
}

function renderHandover() {
  const container = document.getElementById('handoverContent');
  if (!container) return;

  const studentOptions = ['Student A', 'Student B', 'Student C', 'Student D']
    .filter((student) => student !== state.currentSteward)
    .map((student) => `<option value="${student}">${student}</option>`)
    .join('');

  container.innerHTML = `
    <div class="handover-box">
      <h3>Current Student</h3>
      <p style="margin: 12px 0 18px; font-size: 1.1rem; font-weight: 700;">${state.currentSteward}</p>
      <button class="primary-btn" id="handoverStartBtn">Hand Over Plant</button>

      <div id="handoverForm" style="display: none;">
        <label for="newStudentSelect" style="display:block; font-weight:700; margin-bottom: 8px;">Select New Student</label>
        <select id="newStudentSelect">
          ${studentOptions}
        </select>
        <button class="primary-btn full-width" id="confirmHandoverBtn">Confirm Handover</button>
      </div>

      <div style="margin-top: 24px;">
        <h4>Handover History</h4>
        <div class="history-list">
          ${state.handoverHistory
            .map(
              (entry) => `
                <div class="history-row">
                  <strong>${entry.from} → ${entry.to}</strong>
                  <span>${entry.date}</span>
                </div>
              `
            )
            .join('')}
        </div>
      </div>
    </div>
  `;

  document.getElementById('handoverStartBtn')?.addEventListener('click', () => {
    document.getElementById('handoverForm').style.display = 'block';
  });

  document.getElementById('confirmHandoverBtn')?.addEventListener('click', async () => {
    const select = document.getElementById('newStudentSelect');
    const nextStudent = select.value;

    try {
      await apiRequest(`${API_BASE}/handover`, {
        method: 'POST',
        body: JSON.stringify({ newStudent: nextStudent })
      });
      await loadServerData();
      showView('student-dashboard');
    } catch (error) {
      console.error('Handover failed:', error);
    }
  });
}

function renderReviews() {
  const container = document.getElementById('reviewsContent');
  if (!container) return;

  const reviewList = [...state.reviews]
    .map(
      (review) => `
        <div class="review-item">
          <div>
            <strong>${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</strong>
            <p>${review.text}</p>
          </div>
          <span>${review.author}</span>
        </div>
      `
    )
    .join('');

  container.innerHTML = `
    <div class="review-list">${reviewList}</div>

    <div class="review-form">
      <h3>Add a review</h3>
      <div class="review-stars">
        ${[1, 2, 3, 4, 5]
          .map(
            (star) => `
              <button class="star-btn ${state.selectedRating >= star ? 'active' : ''}" data-star="${star}">
                ★
              </button>
            `
          )
          .join('')}
      </div>

      <div class="field-row">
        <label for="reviewText">Review</label>
        <textarea id="reviewText" placeholder="Share your feedback about the plant's care and upkeep."></textarea>
      </div>

      <button class="primary-btn full-width" id="submitReviewBtn" style="margin-top: 18px;">Submit Review</button>
    </div>
  `;

  document.querySelectorAll('.star-btn').forEach((button) => {
    button.addEventListener('click', () => {
      state.selectedRating = Number(button.dataset.star);
      renderReviews();
    });
  });

  document.getElementById('submitReviewBtn')?.addEventListener('click', async () => {
    const text = document.getElementById('reviewText').value.trim();
    if (!text) return;

    try {
      await apiRequest(`${API_BASE}/reviews`, {
        method: 'POST',
        body: JSON.stringify({
          rating: state.selectedRating,
          text,
          author: 'Student Demo'
        })
      });
      await loadServerData();
      showView('reviews');
    } catch (error) {
      console.error('Review submission failed:', error);
    }
  });
}

function showView(viewName) {
  state.activeView = viewName;
  document.querySelectorAll('.view').forEach((view) => {
    view.classList.toggle('hidden', view.id !== viewName);
    view.classList.toggle('active', view.id === viewName);
  });

  if (viewName === 'plant-details') {
    renderPlantDetails();
  }

  if (viewName === 'general-dashboard') {
    renderGeneralDashboard();
  }

  if (viewName === 'student-dashboard') {
    renderStudentDashboard();
  }

  if (viewName === 'health-history') {
    renderHealthHistory();
  }

  if (viewName === 'care-calendar') {
    renderCareCalendar();
  }

  if (viewName === 'handover') {
    renderHandover();
  }

  if (viewName === 'reviews') {
    renderReviews();
  }
}

function routeToView(targetName) {
  const normalized = targetName || 'home';

  if (normalized === 'login') {
    showView('login');
    return;
  }

  if (normalized === 'plants') {
    showView('plants');
    return;
  }

  if (normalized === 'home' || normalized === 'how-it-works' || normalized === 'about-project') {
    showView('home');
    const section = document.getElementById(normalized);
    if (section) {
      setTimeout(() => {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 0);
    }
    return;
  }

  if (normalized === 'plant-details') {
    showView('plant-details');
    return;
  }

  if (normalized === 'general-dashboard' || normalized === 'student-dashboard' || normalized === 'daily-health' || normalized === 'health-history' || normalized === 'care-calendar' || normalized === 'handover' || normalized === 'reviews') {
    showView(normalized);
  }
}

function initializeNavigation() {
  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-view]');
    if (!trigger) return;

    const targetView = trigger.dataset.view;
    const anchorHref = trigger.getAttribute('href');

    if (anchorHref && anchorHref.startsWith('#')) {
      event.preventDefault();
      routeToView(anchorHref.slice(1));
      return;
    }

    routeToView(targetView);
  });

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const hash = link.getAttribute('href');
      if (!hash || !hash.startsWith('#')) return;
      event.preventDefault();
      routeToView(hash.slice(1));
    });
  });

  document.querySelector('.nav-toggle')?.addEventListener('click', () => {
    document.querySelector('.nav-links')?.classList.toggle('open');
  });

  window.addEventListener('hashchange', () => {
    routeToView(location.hash.replace('#', '') || 'home');
  });

  routeToView(location.hash.replace('#', '') || 'home');
}

function handleRoleSelection() {
  document.addEventListener('click', (event) => {
    const card = event.target.closest('.role-card');
    if (!card) return;

    state.currentRole = card.dataset.role;
    if (state.currentRole === 'general') {
      showView('general-dashboard');
    } else {
      showView('student-dashboard');
    }
  });
}

function handleHealthForm() {
  const form = document.getElementById('healthCheckForm');
  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const plantId = document.getElementById('plantSelect').value;
    const condition = document.getElementById('conditionSelect').value;

    try {
      await apiRequest(`${API_BASE}/health-check`, {
        method: 'POST',
        body: JSON.stringify({ plantId, condition })
      });
      await loadServerData();
      alert('Health check submitted successfully.');
      showView('student-dashboard');
    } catch (error) {
      console.error('Health check submission failed:', error);
    }
  });
}

async function initialize() {
  await loadServerData();
  initializeNavigation();
  handleRoleSelection();
  handleHealthForm();
}

initialize();
