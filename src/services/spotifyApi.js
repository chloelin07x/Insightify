
import { 
  calculateHappinessFromGenres, 
  getHappinessCategory, 
  getTopGenres,
  getMoodTip 
} from './genreHappinessCalculator';

import { 
  calculateEnergyFromGenres,
  getEnergyCategory,
  getTopEnergyGenres,
  getEnergyTip
} from './genreEnergyCalculator';

// define base url for spotify endpoint
const API_BASE = "https://api.spotify.com/v1";

class SpotifyApiService {
  constructor() {
    this.accessToken = null;
    this.artistCache = new Map();
    
    // Load caches from sessionStorage on init
    this.profileCache = JSON.parse(sessionStorage.getItem('cache_profile')) || null;
    this.recentTracksCache = JSON.parse(sessionStorage.getItem('cache_recent_tracks')) || null;
  }

  setToken(token) {
    this.accessToken = token;
  }

  async request(endpoint, options = {}) {
    if (!this.accessToken) {
      throw new Error("No access token available");
    }
    
    // HTTP Fetch request
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        "Authorization": `Bearer ${this.accessToken}`, // pass token to authenticate request
        "Content-Type": "application/json",
        ...options.headers
      }
    });
    
    // error handling if fetch request fails 
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || `HTTP ${response.status}`);
    }
    
    return response.json();
  }

  // Get profile data (user's name, email, pfp etc.)
  async getCurrentUser() {
    if (this.profileCache) return this.profileCache;
    const data = await this.request("/me");
    this.profileCache = data;
    sessionStorage.setItem('cache_profile', JSON.stringify(data));
    return data;
  }

  // Return array of track objects if found, otherwise empty array
  async getRecentlyPlayed(limit = 50) {
    if (this.recentTracksCache) return this.recentTracksCache;
    const response = await this.request(`/me/player/recently-played?limit=${limit}`);
    this.recentTracksCache = response.items || [];
    sessionStorage.setItem('cache_recent_tracks', JSON.stringify(this.recentTracksCache));
    return this.recentTracksCache;
  }

  // Get artist details with genres
  async getArtists(artistIds) {
    if (!artistIds.length) return [];
    
    // Filter out cached artists
    const uncachedIds = artistIds.filter(id => !this.artistCache.has(id));
    
    if (uncachedIds.length === 0) {
      // Return from cache
      return artistIds.map(id => this.artistCache.get(id));
    }
    
    // Split into batches of 50 (API limit)
    const batches = [];
    for (let i = 0; i < uncachedIds.length; i += 50) {
      batches.push(uncachedIds.slice(i, i + 50));
    }
    
    const allArtists = [];
    for (const batch of batches) {
      const response = await this.request(`/artists?ids=${batch.join(',')}`);
      if (response.artists) {
        allArtists.push(...response.artists);
      }
      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Cache results
    allArtists.forEach(artist => {
      this.artistCache.set(artist.id, artist);
    });
    
    // Return in original order
    return artistIds.map(id => this.artistCache.get(id) || null);
  }

  // Get track details (for popularity and additional info)
  async getTrackDetails(trackIds) {
    if (!trackIds.length) return [];
    
    // Split into batches of 50
    const batches = [];
    for (let i = 0; i < trackIds.length; i += 50) {
      batches.push(trackIds.slice(i, i + 50));
    }
    
    const allTracks = [];
    for (const batch of batches) {
      const response = await this.request(`/tracks?ids=${batch.join(',')}`);
      if (response.tracks) {
        allTracks.push(...response.tracks);
      }
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    return allTracks;
  }

  // Get all music data (happiness and energy)
  async getAllMusicData(limit = 50) {
    const recentTracks = await this.getRecentlyPlayed(limit);
    
    if (!recentTracks.length) throw new Error("NO_RECENT_TRACKS");

    // Build list of tracks to send to Claude
    const trackList = recentTracks.map(item => ({
      id: item.track.id,
      name: item.track.name,
      artist: item.track.artists.map(a => a.name).join(', ')
    }));

    // Ask Claude to score happiness and energy for each track
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [{
          role: "user",
          content: `For each track, give a happiness score (0.0-1.0) and energy score (0.0-1.0) based on the song and artist. Return ONLY a JSON array with objects containing id, happiness, energy. No other text.
          
  Tracks: ${JSON.stringify(trackList)}`
        }]
      })
    });

    const aiData = await response.json();
    const text = aiData.content[0].text.replace(/```json|```/g, '').trim();
    const scores = JSON.parse(text);
    const scoreMap = {};
    scores.forEach(s => { scoreMap[s.id] = s; });

    const mappedTracks = recentTracks.map((item) => {
      const track = item.track;
      const score = scoreMap[track.id] || { happiness: 0.5, energy: 0.5 };

      return {
        id: track.id,
        name: track.name,
        artists: track.artists,
        album: track.album,
        played_at: item.played_at,
        happiness: score.happiness,
        happiness_category: getHappinessCategory(score.happiness),
        mood_tip: getMoodTip(score.happiness),
        top_happiness_genres: [],
        energy: score.energy,
        energy_category: getEnergyCategory(score.energy),
        energy_tip: getEnergyTip(score.energy),
        top_energy_genres: [],
        popularity: track.popularity,
        duration_ms: track.duration_ms,
        explicit: track.explicit,
        all_genres: [],
        spotify_track: track
      };
    });

    return mappedTracks;
  }

  // Get mood and energy statistics
  async getMoodStats(limit = 50) {
    const tracks = await this.getAllMusicData(limit);
    
    if (!tracks.length) return null;
    
    // Calculate averages
    const totalHappiness = tracks.reduce((sum, t) => sum + t.happiness, 0);
    const avgHappiness = totalHappiness / tracks.length;
    const happinessCategory = getHappinessCategory(avgHappiness);
    
    const totalEnergy = tracks.reduce((sum, t) => sum + t.energy, 0);
    const avgEnergy = totalEnergy / tracks.length;
    const energyCategory = getEnergyCategory(avgEnergy);
    
    const moodTip = getMoodTip(avgHappiness);
    const energyTip = getEnergyTip(avgEnergy);
    
    // Count tracks by happiness category
    const happinessDistribution = {
      veryHappy: tracks.filter(t => t.happiness >= 0.8).length,
      happy: tracks.filter(t => t.happiness >= 0.6 && t.happiness < 0.8).length,
      neutral: tracks.filter(t => t.happiness >= 0.4 && t.happiness < 0.6).length,
      sad: tracks.filter(t => t.happiness >= 0.2 && t.happiness < 0.4).length,
      verySad: tracks.filter(t => t.happiness < 0.2).length
    };
    
    // Count tracks by energy category
    const energyDistribution = {
      veryHighEnergy: tracks.filter(t => t.energy >= 0.8).length,
      highEnergy: tracks.filter(t => t.energy >= 0.6 && t.energy < 0.8).length,
      mediumEnergy: tracks.filter(t => t.energy >= 0.4 && t.energy < 0.6).length,
      lowEnergy: tracks.filter(t => t.energy >= 0.2 && t.energy < 0.4).length,
      veryLowEnergy: tracks.filter(t => t.energy < 0.2).length
    };
    
    // Get most common genres
    const allGenres = tracks.flatMap(t => t.all_genres || []);
    const genreFrequency = {};
    allGenres.forEach(genre => {
      genreFrequency[genre] = (genreFrequency[genre] || 0) + 1;
    });
    const topGenres = Object.entries(genreFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([genre, count]) => ({ genre, count }));
    
    return {
      averageHappiness: avgHappiness,
      happinessCategory,
      averageEnergy: avgEnergy,
      energyCategory,
      moodTip,
      energyTip,
      trackCount: tracks.length,
      happinessDistribution,
      energyDistribution,
      topGenres,
      tracks
    };
  }

  // Clear artist cache
  clearCache() {
    this.artistCache.clear();
    console.log('Artist cache cleared');
  }
}

export const spotifyApi = new SpotifyApiService();