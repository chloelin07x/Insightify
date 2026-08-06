import './Dashboard.css'
import WebPlayback from './WebPlayback';
import { spotifyApi } from './services/spotifyApi';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';

function Dashboard() {
    const navigate = useNavigate();
    const [userProfile, setUserProfile] = useState(null);
    const [recentTracks, setRecentTracks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tracksLoading, setTracksLoading] = useState(true);
    const [error, setError] = useState(null);
    const [tracksError, setTracksError] = useState(null);
    const [stats, setStats] = useState(null);
    const [selectedTrackUri, setSelectedTrackUri] = useState(null);
    const [spotifyToken, setSpotifyToken] = useState(null);
    const [recentTrackUris, setRecentTrackUris] = useState([]);

    // Fed back from WebPlayback via onPauseChange
    const [isPaused, setIsPaused] = useState(true);

    const playerRef = useRef(null);

    useEffect(() => {
        const token = localStorage.getItem('spotify_access_token');
        setSpotifyToken(token);
    }, []);

    const handlePlayTrack = (trackUri) => {
        if (selectedTrackUri === trackUri) {
            // Same track — toggle play/pause
            playerRef.current?.togglePlay();
        } else {
            // New track — start playing it
            setSelectedTrackUri(trackUri);
            setIsPaused(false);
        }
    };

    useEffect(() => {
        let cancelled = false;

        const fetchProfile = async () => {
            try {
                const profile = await spotifyApi.getCurrentUser();
                if (!cancelled) setUserProfile(profile);
            } catch (err) {
                if (!cancelled) setError(err.message);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        const getListeningStats = (tracks) => {
            const hours = tracks.map(item => new Date(item.played_at).getHours());

            const timeOfDay = (hour) => {
                if (hour >= 5 && hour < 12) return 'Morning';
                if (hour >= 12 && hour < 17) return 'Afternoon';
                if (hour >= 17 && hour < 21) return 'Evening';
                return 'Night';
            };

            const timeCounts = hours.reduce((acc, h) => {
                const period = timeOfDay(h);
                acc[period] = (acc[period] || 0) + 1;
                return acc;
            }, {});

            const mostActiveTime = Object.entries(timeCounts)
                .sort((a, b) => b[1] - a[1])[0][0];

            const artistCounts = tracks.reduce((acc, item) => {
                const artist = item.track.artists[0].name;
                acc[artist] = (acc[artist] || 0) + 1;
                return acc;
            }, {});

            const topArtist = Object.entries(artistCounts)
                .sort((a, b) => b[1] - a[1])[0][0];

            return { totalTracksToday: tracks.length, mostActiveTime, topArtist };
        };

        const fetchRecentTracks = async () => {
            try {
                const tracks = await spotifyApi.getRecentlyPlayed(10);
                if (!cancelled) {
                    const seen = new Set();
                    const unique = tracks.filter(item => {
                        if (seen.has(item.track.id)) return false;
                        seen.add(item.track.id);
                        return true;
                    }).slice(0, 5);
                    setRecentTracks(unique);
                    setRecentTrackUris(unique.map(item => item.track.uri));
                    setStats(getListeningStats(tracks));
                }
            } catch (err) {
                if (!cancelled) setTracksError(err.message);
            } finally {
                if (!cancelled) setTracksLoading(false);
            }
        };

        fetchProfile();
        fetchRecentTracks();

        return () => { cancelled = true; };
    }, []);

    const goToDashboard = () => navigate("/dashboard");
    const goToMoodChart = () => navigate("/moodchart");
    const goToMoodSummary = () => navigate("/moodsummary");
    const goToMoodPredict = () => navigate("/moodpredict");

    return (
        <div className="container">
            <div className="row">
                <ul className="headerRow">
                    <li><i className="fa-regular fa-house fa-xl" onClick={goToDashboard}></i></li>
                    <li><span className="borders" onClick={goToMoodChart}>Chart</span></li>
                    <li><span className="borders" onClick={goToMoodSummary}>Summary</span></li>
                    <li><span className="borders" onClick={goToMoodPredict}>Predict</span></li>
                    <li><i className="fa-regular fa-user fa-xl" onClick={goToDashboard}></i></li>
                </ul>
            </div>

            <span className="title">Dashboard</span>
            <span className="description">An overview of your Spotify listening</span>

            <div className="mainArea">
                <section className="recentTracks">
                    <span className="title">Recent Tracks</span>

                    {tracksLoading && <span>Loading tracks...</span>}
                    {tracksError && <span>Error: {tracksError}</span>}

                    <ul className="trackList">
                        {recentTracks.map((item) => {
                            const isThisTrackPlaying = selectedTrackUri === item.track.uri && !isPaused;
                            return (
                                <li key={item.track.id} className="trackItem">
                                    <img
                                        src={item.track.album.images?.[1]?.url || item.track.album.images?.[2]?.url || null}
                                        alt={item.track.album.name}
                                        className="trackCover"
                                    />
                                    <div className="trackInfo">
                                        <span className="trackName">{item.track.name}</span>
                                        <span className="trackArtist">
                                            {item.track.artists.map(a => a.name).join(', ')}
                                        </span>
                                        <section className="playback">
                                            <button className="tracks" onClick={() => playerRef.current?.previousTrack()}>⏮</button>
                                            <button className="playButton" onClick={() => handlePlayTrack(item.track.uri)}>
                                                {isThisTrackPlaying ? '⏸' : '▶'}
                                            </button>
                                            <button className="tracks" onClick={() => playerRef.current?.nextTrack()}>⏭</button>
                                        </section>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </section>

                <section className="profile">
                    <span className="title">Profile</span>
                    {loading && <span>Loading profile...</span>}
                    {error && <span>Error: {error}</span>}
                    {userProfile && (
                        <div className="profileContent">
                            <img
                                src={userProfile.images?.[0]?.url || null}
                                alt="Profile"
                                className="profilePicture"
                            />
                            <span className="profileName">{userProfile.display_name}</span>
                            <span className="profileFollowers">
                                {userProfile.followers?.total} followers
                            </span>
                        </div>
                    )}

                    <section className="subprofile">
                        <div className="listeningStats">
                            <span>Total Tracks Today:</span>
                            <span>Most Active During:</span>
                            <span>Top Artist:</span>
                        </div>

                        {stats && (
                            <div className="listeningData">
                                <span>{stats.totalTracksToday}</span>
                                <span>{stats.mostActiveTime}</span>
                                <span>{stats.topArtist}</span>
                            </div>
                        )}
                    </section>
                </section>
            </div>

            {spotifyToken && (
                <WebPlayback
                    token={spotifyToken}
                    trackUri={selectedTrackUri}
                    trackUris={recentTrackUris}
                    playerRef={playerRef}
                    onPauseChange={setIsPaused}
                />
            )}
        </div>
    );
}

export default Dashboard;