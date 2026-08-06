import React, { useEffect, useRef } from 'react';
 
function WebPlayback({ token, trackUri, trackUris, playerRef, onPauseChange }) {
  const deviceIdRef = useRef(null);
  const tokenRef = useRef(token);
 
  useEffect(() => {
    tokenRef.current = token;
  }, [token]);
 
  useEffect(() => {
    if (!token) return;
 
    const initPlayer = () => {
      if (playerRef.current) return;
 
      const newPlayer = new window.Spotify.Player({
        name: 'Insightify Web Player',
        getOAuthToken: cb => cb(tokenRef.current),
        volume: 0.5
      });
 
      playerRef.current = newPlayer;
 
      newPlayer.addListener('ready', ({ device_id }) => {
        console.log('Ready with Device ID', device_id);
        deviceIdRef.current = device_id;
 
        fetch('https://api.spotify.com/v1/me/player', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${tokenRef.current}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ device_ids: [device_id], play: false })
        }).then(res => {
          if (!res.ok) console.error('Transfer playback failed', res.status);
        });
      });
 
      newPlayer.addListener('not_ready', ({ device_id }) => {
        console.warn('Device has gone offline', device_id);
      });
 
      newPlayer.addListener('player_state_changed', state => {
        if (!state) return;
        // Report real paused state back up to Dashboard
        onPauseChange?.(state.paused);
      });
 
      newPlayer.connect();
    };
 
    if (window.Spotify) {
      initPlayer();
    } else if (!document.getElementById('spotify-sdk')) {
      const script = document.createElement('script');
      script.id = 'spotify-sdk';
      script.src = 'https://sdk.scdn.co/spotify-player.js';
      script.async = true;
      document.body.appendChild(script);
      window.onSpotifyWebPlaybackSDKReady = initPlayer;
    } else {
      window.onSpotifyWebPlaybackSDKReady = initPlayer;
    }
 
    return () => {
      if (playerRef.current) {
        playerRef.current.disconnect();
        playerRef.current = null;
      }
    };
  }, [token]);
 
  useEffect(() => {
    if (!trackUri || !deviceIdRef.current || !tokenRef.current) return;
 
    const uris = trackUris?.length ? trackUris : [trackUri];
    const position = trackUris?.length ? trackUris.indexOf(trackUri) : 0;
    const offset = position >= 0 ? { position } : { uri: trackUri };
 
    fetch('https://api.spotify.com/v1/me/player/play', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${tokenRef.current}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ uris, offset, device_id: deviceIdRef.current })
    }).then(res => {
      if (!res.ok) console.error('Play failed', res.status);
    });
  }, [trackUri]);

  return (
    <>
    </>
  );
}

export default WebPlayback;