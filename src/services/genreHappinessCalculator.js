
// 0.0 = Very Sad, 1.0 = Very Happy
const genreMoodMap = {
  // Very Happy genres (0.8 - 1.0)
  'pop': 0.85,
  'dance pop': 0.88,
  'electropop': 0.82,
  'disco': 0.90,
  'funk': 0.87,
  'soul': 0.80,
  'reggae': 0.85,
  'ska': 0.88,
  'happy hardcore': 0.95,
  'europop': 0.85,
  'k-pop': 0.82,
  'j-pop': 0.80,
  
  // Happy genres (0.6 - 0.8)
  'rock': 0.70,
  'indie rock': 0.68,
  'alternative rock': 0.65,
  'pop rock': 0.75,
  'electronic': 0.72,
  'edm': 0.75,
  'house': 0.78,
  'techno': 0.70,
  'trance': 0.72,
  'drum and bass': 0.68,
  'funk rock': 0.78,
  'disco house': 0.85,
  
  // Neutral genres (0.4 - 0.6)
  'folk': 0.55,
  'indie folk': 0.52,
  'acoustic': 0.50,
  'country': 0.48,
  'americana': 0.50,
  'jazz': 0.52,
  'classical': 0.45,
  'instrumental': 0.50,
  'ambient': 0.45,
  'chill': 0.55,
  'lo-fi': 0.50,
  
  // Sad genres (0.2 - 0.4)
  'blues': 0.30,
  'delta blues': 0.25,
  'sad': 0.20,
  'emo': 0.25,
  'gothic': 0.22,
  'darkwave': 0.25,
  'doom metal': 0.20,
  'sadcore': 0.18,
  'slowcore': 0.22,
  
  // Very Sad genres (0.0 - 0.2)
  'funeral doom': 0.10,
  'depressive': 0.05,
  'black metal': 0.15,
  'dark ambient': 0.12,
  'sorrow': 0.08
};

// calculate happiness from a single genre
export const getHappinessForGenre = (genre) => {
  const genreName = genre.toLowerCase();
  
  // find match
  if (genreMoodMap[genreName]) {
    return genreMoodMap[genreName];
  }
  
  // Partial match (if the genre contains the word)
  for (const [key, value] of Object.entries(genreMoodMap)) {
    if (genreName.includes(key) || key.includes(genreName)) {
      return value;
    }
  }
  
  // default value - neutral
  return 0.5;
};

// Calculate overall happiness from multiple genres
export const calculateHappinessFromGenres = (genres, popularity = null) => {
  if (!genres || genres.length === 0) {
    return 0.5; // Neutral if no genres
  }
  
  // Get happiness for each genre
  const happinessScores = genres.map(genre => getHappinessForGenre(genre));
  
  // Average the scores
  let totalHappiness = happinessScores.reduce((sum, score) => sum + score, 0);
  let averageHappiness = totalHappiness / happinessScores.length;
  
  // Ensure within bounds
  return Math.max(0.0, Math.min(1.0, averageHappiness));
};

// Get happiness category for display
export const getHappinessCategory = (happinessScore) => {
  if (happinessScore >= 0.8) return { 
    label: 'Very Happy', 
    color: '#4caf50', 
    range: '80-100%' 
  };
  if (happinessScore >= 0.6) return { 
    label: 'Happy', 
    color: '#8bc34a', 
    range: '60-80%' 
  };
  if (happinessScore >= 0.4) return { 
    label: 'Neutral', 
    color: '#ffc107', 
    range: '40-60%' 
  };
  if (happinessScore >= 0.2) return { 
    label: 'Sad', 
    color: '#ff9800', 
    range: '20-40%' 
  };
  return { 
    label: 'Very Sad', 
    color: '#f44336', 
    range: '0-20%' 
  };
};

// Get top contributing genres for a track
export const getTopGenres = (genres, limit = 3) => {
  if (!genres || genres.length === 0) return [];
  
  return genres
    .map(genre => ({
      genre,
      happiness: getHappinessForGenre(genre),
      category: getHappinessCategory(getHappinessForGenre(genre))
    }))
    .sort((a, b) => b.happiness - a.happiness)
    .slice(0, limit);
};

// Analyze happiness distribution across tracks
export const analyzeHappinessDistribution = (tracks) => {
  const distribution = {
    veryHappy: 0,
    happy: 0,
    neutral: 0,
    sad: 0,
    verySad: 0
  };
  
  tracks.forEach(track => {
    const category = getHappinessCategory(track.happiness);
    switch (category.label) {
      case 'Very Happy': distribution.veryHappy++; break;
      case 'Happy': distribution.happy++; break;
      case 'Neutral': distribution.neutral++; break;
      case 'Sad': distribution.sad++; break;
      case 'Very Sad': distribution.verySad++; break;
    }
  });
  
  return distribution;
};

// message based on happiness
export const getMoodTip = (happinessScore) => {
  if (happinessScore >= 0.8) {
    return "You're feeling amazing!";
  }
  if (happinessScore >= 0.6) {
    return "You're in a good mood!";
  }
  if (happinessScore >= 0.4) {
    return "You're OK!";
  }
  if (happinessScore >= 0.2) {
    return "You might be feeling down.";
  }
  return "You are depressed :(";
};