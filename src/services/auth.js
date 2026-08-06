import { spotifyApi } from "./spotifyApi";

const clientId = "4a6a2a9e96ab450b944cdb1dac34078c";
const redirectUri = "http://127.0.0.1:5173/callback";

const SCOPES = [
  'user-read-private',
  'user-read-email',
  'user-read-recently-played',
  'user-top-read',
  'playlist-read-private',
  'streaming',                   // required for Web Playback SDK
  'user-read-playback-state',
  'user-modify-playback-state',
];

const generateCodeVerifier = (length) => {
  let text = '';
  let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

const generateCodeChallenge = async (codeVerifier) => {
  const data = new TextEncoder().encode(codeVerifier);
  const digest = await window.crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

class AuthService {
  constructor() {
    this.loadFromStorage();
  }

  loadFromStorage() {
    this.accessToken = localStorage.getItem('spotify_access_token');
    this.refreshToken = localStorage.getItem('spotify_refresh_token');
    this.tokenExpiry = localStorage.getItem('spotify_token_expiry');

    if (this.tokenExpiry) {
      this.tokenExpiry = parseInt(this.tokenExpiry);
    }

    if (this.accessToken) {
      spotifyApi.setToken(this.accessToken);
    }
  }

  saveToStorage() {
    if (this.accessToken) {
      localStorage.setItem('spotify_access_token', this.accessToken);
    }
    if (this.refreshToken) {
      localStorage.setItem('spotify_refresh_token', this.refreshToken);
    }
    if (this.tokenExpiry) {
      localStorage.setItem('spotify_token_expiry', this.tokenExpiry.toString());
    }
  }

  clearStorage() {
    localStorage.removeItem('spotify_access_token');
    localStorage.removeItem('spotify_refresh_token');
    localStorage.removeItem('spotify_token_expiry');
    localStorage.removeItem('verifier');
  }

  async initiateLogin() {
    const verifier = generateCodeVerifier(128);
    const challenge = await generateCodeChallenge(verifier);

    localStorage.setItem("verifier", verifier);

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("response_type", "code");
    params.append("redirect_uri", redirectUri);
    params.append("scope", SCOPES.join(' '));
    params.append("code_challenge_method", "S256");
    params.append("code_challenge", challenge);

    window.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
  }

  async handleCallback(code) {
    const verifier = localStorage.getItem("verifier");

    if (!verifier) {
      throw new Error("No verifier found. Please restart the auth flow.");
    }

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("redirect_uri", redirectUri);
    params.append("code_verifier", verifier);

    const result = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params
    });

    if (!result.ok) {
      const errorData = await result.json();
      throw new Error(`Token error: ${errorData.error} - ${errorData.error_description}`);
    }

    const data = await result.json();

    this.accessToken = data.access_token;
    this.refreshToken = data.refresh_token;
    this.tokenExpiry = Date.now() + (data.expires_in * 1000);

    this.saveToStorage();
    spotifyApi.setToken(this.accessToken);
    localStorage.removeItem("verifier");

    return this.accessToken;
  }

  async refreshAccessToken() {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("grant_type", "refresh_token");
    params.append("refresh_token", this.refreshToken);

    const result = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params
    });

    if (!result.ok) {
      throw new Error('Token refresh failed');
    }

    const data = await result.json();

    this.accessToken = data.access_token;
    this.tokenExpiry = Date.now() + (data.expires_in * 1000);

    this.saveToStorage();
    spotifyApi.setToken(this.accessToken);

    return this.accessToken;
  }

  getAccessToken() {
    return this.accessToken;
  }

  isAuthenticated() {
    if (!this.accessToken || !this.tokenExpiry) {
      return false;
    }

    const bufferTime = 5 * 60 * 1000;
    const isValid = this.tokenExpiry > Date.now() + bufferTime;

    if (!isValid && this.refreshToken) {
      console.log('Token expiring soon, refreshing...');
      this.refreshAccessToken().catch(err => {
        console.error('Failed to refresh token:', err);
      });
    }

    return this.tokenExpiry > Date.now();
  }

  logout() {
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiry = null;
    spotifyApi.setToken(null);
    this.clearStorage();
    sessionStorage.removeItem('cache_profile');
    sessionStorage.removeItem('cache_recent_tracks');
    window.location.href = '/login';
  }
}

export const auth = new AuthService();