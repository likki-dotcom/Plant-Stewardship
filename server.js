const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

const plants = [
  {
    id: 'lipstick-palm',
    name: 'Lipstick Palm',
    scientificName: 'Cyrtostachys renda',
    commonNames: ['Lipstick Palm', 'Red Sealing Wax Palm'],
    description:
      'A tropical ornamental palm recognized by its vibrant red crownshafts and leaf stems.',
    image:
      'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=1200&q=80',
    care: {
      light: 'Full sun to partial shade',
      water: 'High and consistent moisture',
      soil: 'Rich, well-draining soil'
    },
    currentSetting: 'Nursery polybag',
    currentHealth: 'Healthy',
    lastChecked: '30 September 2026',
    currentStudent: 'Student A',
    stewardshipStart: '25 September 2026',
    handoverHistory: [
      { from: 'Student A', to: 'Student B', date: '30 September 2026' },
      { from: 'Student B', to: 'Student A', date: '10 September 2026' }
    ],
    healthHistory: [
      { date: '30 Sep', condition: 'Healthy' },
      { date: '29 Sep', condition: 'Healthy' },
      { date: '28 Sep', condition: 'Mild Stress' },
      { date: '27 Sep', condition: 'Healthy' }
    ],
    reviews: [
      { rating: 5, text: 'The plant looks well maintained.', author: 'Anonymous' },
      { rating: 4, text: 'Healthy foliage and a consistent care routine.', author: 'Student B' }
    ],
    traditionalInfo: ''
  },
  {
    id: 'ti-plant',
    name: 'Ti Plant',
    scientificName: 'Cordyline fruticosa',
    commonNames: ['Ti Plant', 'Hawaiian Ti'],
    description:
      'An ornamental plant with reddish-pink and dark-green foliage, widely used for decorative accents.',
    image:
      'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1200&q=80',
    care: {
      light: 'Bright, indirect sunlight',
      water: 'Keep soil consistently moist',
      soil: 'Rich, well-draining potting mix'
    },
    currentSetting: 'Indoor planter',
    currentHealth: 'Healthy',
    lastChecked: '30 September 2026',
    currentStudent: 'Student A',
    stewardshipStart: '27 September 2026',
    handoverHistory: [
      { from: 'Student A', to: 'Student C', date: '22 September 2026' },
      { from: 'Student C', to: 'Student A', date: '05 September 2026' }
    ],
    healthHistory: [
      { date: '30 Sep', condition: 'Healthy' },
      { date: '29 Sep', condition: 'Healthy' },
      { date: '28 Sep', condition: 'Healthy' },
      { date: '27 Sep', condition: 'Mild Stress' }
    ],
    traditionalInfo:
      'Traditional or cultural information: In some communities, Ti plants are valued for decorative and cultural purposes and are often used in ceremonial or festive arrangements. This information is presented as cultural context and is not a medical claim or scientific treatment.',
    reviews: [
      { rating: 5, text: 'Leaves are vibrant and the colour is very attractive.', author: 'Anonymous' },
      { rating: 4, text: 'A beautiful ornamental plant with a healthy appearance.', author: 'Student C' }
    ]
  }
];

const appState = {
  currentSteward: 'Student A',
  reviews: [
    { rating: 5, text: 'The plant looks well maintained.', author: 'Anonymous' },
    { rating: 4, text: 'Healthy foliage and a consistent care routine.', author: 'Student B' }
  ],
  handoverHistory: [
    { from: 'Student A', to: 'Student B', date: '30 September 2026' },
    { from: 'Student B', to: 'Student A', date: '10 September 2026' }
  ],
  careCalendar: [
    { day: 'Monday', done: true },
    { day: 'Tuesday', done: true },
    { day: 'Wednesday', done: false },
    { day: 'Thursday', done: true },
    { day: 'Friday', done: true }
  ],
  selectedPlantId: 'lipstick-palm'
};

app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.get('/api/plants', (req, res) => {
  res.json({
    plants,
    currentSteward: appState.currentSteward,
    reviews: appState.reviews,
    handoverHistory: appState.handoverHistory,
    careCalendar: appState.careCalendar,
    selectedPlantId: appState.selectedPlantId
  });
});

app.post('/api/health-check', (req, res) => {
  const { plantId, condition } = req.body;

  if (!plantId || !condition) {
    return res.status(400).json({ error: 'plantId and condition are required' });
  }

  const plant = plants.find((item) => item.id === plantId);
  if (!plant) {
    return res.status(404).json({ error: 'Plant not found' });
  }

  const today = new Date();
  const dateLabel = today.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short'
  });

  plant.healthHistory.unshift({ date: dateLabel, condition });
  plant.currentHealth = condition;
  plant.lastChecked = today.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const lastIndex = appState.careCalendar.length - 1;
  if (lastIndex >= 0) {
    appState.careCalendar[lastIndex] = { ...appState.careCalendar[lastIndex], done: true };
  }

  res.json({
    success: true,
    plants,
    currentSteward: appState.currentSteward,
    reviews: appState.reviews,
    handoverHistory: appState.handoverHistory,
    careCalendar: appState.careCalendar,
    selectedPlantId: appState.selectedPlantId
  });
});

app.post('/api/handover', (req, res) => {
  const { newStudent } = req.body;

  if (!newStudent) {
    return res.status(400).json({ error: 'newStudent is required' });
  }

  const previous = appState.currentSteward;
  appState.currentSteward = newStudent;
  appState.handoverHistory.unshift({
    from: previous,
    to: newStudent,
    date: '30 September 2026'
  });

  const activePlant = plants.find((plant) => plant.id === appState.selectedPlantId);
  if (activePlant) {
    activePlant.currentStudent = newStudent;
    activePlant.handoverHistory.unshift({
      from: previous,
      to: newStudent,
      date: '30 September 2026'
    });
  }

  res.json({
    success: true,
    plants,
    currentSteward: appState.currentSteward,
    reviews: appState.reviews,
    handoverHistory: appState.handoverHistory,
    careCalendar: appState.careCalendar,
    selectedPlantId: appState.selectedPlantId
  });
});

app.post('/api/reviews', (req, res) => {
  const { rating, text, author } = req.body;

  if (!text || !rating) {
    return res.status(400).json({ error: 'rating and text are required' });
  }

  appState.reviews.unshift({
    rating: Number(rating),
    text,
    author: author || 'Student Demo'
  });

  res.json({
    success: true,
    plants,
    currentSteward: appState.currentSteward,
    reviews: appState.reviews,
    handoverHistory: appState.handoverHistory,
    careCalendar: appState.careCalendar,
    selectedPlantId: appState.selectedPlantId
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Plant stewardship prototype running on http://localhost:${PORT}`);
});
