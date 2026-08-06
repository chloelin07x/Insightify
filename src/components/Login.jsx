import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { spotifyApi } from '../services/spotifyApi';
import { auth } from '../services/auth';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleAuth = async () => {
      // Check if Spotify worked
      const params = new URLSearchParams(location.search);
      const code = params.get('code');
      
      if (code) {
        // Exchange code for token
        try {
          const token = await auth.handleCallback(code);
          spotifyApi.setToken(token);
          // Redirect to dashboard after successful login
          navigate('/dashboard');
        } catch (err) {
          console.error('Login failed:', err);
          // Clear the code from URL on error
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      } else {
        // No code - check if already authenticated
        const token = auth.getAccessToken();
        if (token && auth.isAuthenticated()) {
          spotifyApi.setToken(token);
          navigate('/dashboard');
        } else {
          // Not authenticated - redirect to Spotify login
          auth.initiateLogin();
        }
      }
    };
    
    handleAuth();
  }, [location, navigate]);

  return (
    <div>
      <h2>Connecting...</h2>
    </div>
  );
}

export default Login;