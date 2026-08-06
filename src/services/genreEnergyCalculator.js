
// 0.0 = Very Low Energy (slow, calm), 1.0 = Very High Energy (fast, intense)
const genreEnergyMap = {
  // Very High Energy genres (0.8 - 1.0)
  'drum and bass': 0.95,
  'hardcore': 0.98,
  'speed metal': 0.96,
  'thrash metal': 0.94,
  'edm': 0.92,
  'techno': 0.90,
  'house': 0.88,
  'trance': 0.85,
  'happy hardcore': 0.97,
  'hardstyle': 0.96,
  'gabber': 0.98,
  'breakbeat': 0.87,
  'big beat': 0.85,
  'electro': 0.86,
  'dubstep': 0.88,
  'trap': 0.84,
  
  // High Energy genres (0.6 - 0.8)
  'rock': 0.75,
  'punk': 0.82,
  'pop punk': 0.78,
  'alternative rock': 0.72,
  'indie rock': 0.68,
  'hard rock': 0.85,
  'metal': 0.82,
  'heavy metal': 0.84,
  'pop rock': 0.70,
  'funk rock': 0.78,
  'disco': 0.76,
  'funk': 0.74,
  'ska': 0.80,
  'reggae': 0.65,
  'dance pop': 0.72,
  'electropop': 0.70,
  'k-pop': 0.75,
  'j-pop': 0.68,
  'pop': 0.65,
  
  // Medium Energy genres (0.4 - 0.6)
  'electronic': 0.55,
  'synthwave': 0.52,
  'indie pop': 0.50,
  'folk rock': 0.48,
  'country rock': 0.45,
  'blues rock': 0.50,
  'soul': 0.52,
  'r&b': 0.48,
  'neo-soul': 0.45,
  'hip hop': 0.55,
  'rap': 0.58,
  'trip hop': 0.42,
  'downtempo': 0.45,
  'chill': 0.48,
  'lo-fi': 0.40,
  
  // Low Energy genres (0.2 - 0.4)
  'folk': 0.35,
  'indie folk': 0.32,
  'acoustic': 0.28,
  'country': 0.30,
  'americana': 0.32,
  'jazz': 0.35,
  'blues': 0.38,
  'delta blues': 0.30,
  'sad': 0.25,
  'emo': 0.35,
  'slowcore': 0.28,
  'sadcore': 0.26,
  
  // Very Low Energy genres (0.0 - 0.2)
  'classical': 0.18,
  'instrumental': 0.15,
  'ambient': 0.08,
  'dark ambient': 0.05,
  'meditation': 0.02,
  'soundtrack': 0.12,
  'choral': 0.10,
  'opera': 0.12,
  'ballad': 0.20,
  'doom metal': 0.22,
  'funeral doom': 0.05,
  'depressive': 0.10,
  'gothic': 0.25
};

// calculate energy from a single genre
export const getEnergyForGenre = (genre) => {
  const genreName = genre.toLowerCase();
  
  // find match
  if (genreEnergyMap[genreName]) {
    return genreEnergyMap[genreName];
  }
  
  // Partial match (if the genre contains the word)
  for (const [key, value] of Object.entries(genreEnergyMap)) {
    if (genreName.includes(key) || key.includes(genreName)) {
      return value;
    }
  }
  
  // default value - medium energy
  return 0.5;
};

// Calculate overall energy from multiple genres
export const calculateEnergyFromGenres = (genres, popularity = null) => {
  if (!genres || genres.length === 0) {
    return 0.5; // Medium energy if no genres
  }
  
  // Get energy for each genre
  const energyScores = genres.map(genre => getEnergyForGenre(genre));
  
  // Average the scores
  let totalEnergy = energyScores.reduce((sum, score) => sum + score, 0);
  let averageEnergy = totalEnergy / energyScores.length;
  
  // Ensure within bounds
  return Math.max(0.0, Math.min(1.0, averageEnergy));
};

// Get energy category for display
export const getEnergyCategory = (energyScore) => {
  if (energyScore >= 0.8) return { 
    label: 'Very High Energy', 
    color: '#f44336', 
    range: '80-100%',
    description: 'Fast, intense, energetic'
  };
  if (energyScore >= 0.6) return { 
    label: 'High Energy', 
    color: '#ff9800', 
    range: '60-80%',
    description: 'Upbeat, driving, active'
  };
  if (energyScore >= 0.4) return { 
    label: 'Medium Energy', 
    color: '#ffc107', 
    range: '40-60%',
    description: 'Moderate, balanced, steady'
  };
  if (energyScore >= 0.2) return { 
    label: 'Low Energy', 
    color: '#8bc34a', 
    range: '20-40%',
    description: 'Calm, relaxed, gentle'
  };
  return { 
    label: 'Very Low Energy', 
    color: '#4caf50', 
    range: '0-20%',
    description: 'Slow, ambient, meditative'
  };
};

// Get top contributing genres for a track (by energy)
export const getTopEnergyGenres = (genres, limit = 3) => {
  if (!genres || genres.length === 0) return [];
  
  return genres
    .map(genre => ({
      genre,
      energy: getEnergyForGenre(genre),
      category: getEnergyCategory(getEnergyForGenre(genre))
    }))
    .sort((a, b) => b.energy - a.energy)
    .slice(0, limit);
};

// Analyze energy distribution across tracks
export const analyzeEnergyDistribution = (tracks) => {
  const distribution = {
    veryHighEnergy: 0,
    highEnergy: 0,
    mediumEnergy: 0,
    lowEnergy: 0,
    veryLowEnergy: 0
  };
  
  tracks.forEach(track => {
    const category = getEnergyCategory(track.energy);
    switch (category.label) {
      case 'Very High Energy': distribution.veryHighEnergy++; break;
      case 'High Energy': distribution.highEnergy++; break;
      case 'Medium Energy': distribution.mediumEnergy++; break;
      case 'Low Energy': distribution.lowEnergy++; break;
      case 'Very Low Energy': distribution.veryLowEnergy++; break;
    }
  });
  
  return distribution;
};

// Get energy tip based on energy score
export const getEnergyTip = (energyScore) => {
  if (energyScore >= 0.8) {
    return "High energy";
  }
  if (energyScore >= 0.6) {
    return "Good energy level.";
  }
  if (energyScore >= 0.4) {
    return "Chill energy.";
  }
  if (energyScore >= 0.2) {
    return "Low energy music.";
  }
  return "Very calm music.";
};