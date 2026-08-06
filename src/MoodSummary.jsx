import './MoodSummary.css'
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Scatter } from "react-chartjs-2";
import { weeklyTestData, monthlyTestData } from './moodTestData';

import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Title
} from "chart.js";

ChartJS.register(
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Title
);

function MoodSummary(){
  const navigate = useNavigate();
  const [view, setView] = useState('weekly'); // 'weekly' or 'monthly'

  // Get the active data based on view
  const activeData = view === 'weekly' ? weeklyTestData : monthlyTestData;

  // Extract happiness and energy data
  const happinessData = activeData.datasets.find(ds => ds.label === "Happiness")?.data || [];
  const energyData = activeData.datasets.find(ds => ds.label === "Energy")?.data || [];

  // Convert happiness/energy from 0-1 scale to -1 to 1 scale for quadrant display
  // Formula: mappedValue = (value - 0.5) * 2
  // So: 0.0 → -1, 0.5 → 0, 1.0 → +1
  const mapToQuadrantScale = (value) => (value - 0.5) * 2;

  // Combine into points for scatter plot (x=energy, y=happiness) with proper scaling
  const scatterPoints = [];
  for (let i = 0; i < happinessData.length; i++) {
    if (happinessData[i] && energyData[i]) {
      scatterPoints.push({
        x: mapToQuadrantScale(energyData[i].y),   // Energy mapped to -1..1
        y: mapToQuadrantScale(happinessData[i].y), // Happiness mapped to -1..1
        originalHappiness: happinessData[i].y,
        originalEnergy: energyData[i].y,
        name: activeData.labels[i],
        top3: happinessData[i].top3 || []
      });
    }
  }

  const chartData = {
    datasets: [
      {
        label: view === 'weekly' ? "Daily Tracks" : "Weekly Averages",
        data: scatterPoints,
        backgroundColor: "#1DB954",
        pointRadius: 10,
        pointHoverRadius: 14,
        pointBorderColor: "#fff",
        pointBorderWidth: 2
      }
    ]
  };

  // Calculate statistics from original 0-1 scale
  const avgHappiness = happinessData.reduce((sum, d) => sum + d.y, 0) / happinessData.length;
  const avgEnergy = energyData.reduce((sum, d) => sum + d.y, 0) / energyData.length;

  // Count tracks in each quadrant using mapped values
  const quadrants = {
    happyEnergetic: scatterPoints.filter(p => p.x >= 0 && p.y >= 0).length,   // Top Right
    intense: scatterPoints.filter(p => p.x >= 0 && p.y < 0).length,           // Top Left (Energy high, Happiness low)
    calm: scatterPoints.filter(p => p.x < 0 && p.y >= 0).length,              // Bottom Right (Energy low, Happiness high)
    melancholic: scatterPoints.filter(p => p.x < 0 && p.y < 0).length         // Bottom Left
  };
  
  const total = scatterPoints.length;
  
  // Determine dominant mood
  let dominantMood = { name: "Happy & Energetic", emoji: "😄", desc: "Most of your tracks are upbeat and full of energy" };
  let highestPct = (quadrants.happyEnergetic / total) * 100;
  
  if ((quadrants.intense / total) * 100 > highestPct) {
    highestPct = (quadrants.intense / total) * 100;
    dominantMood = { name: "Intense", emoji: "😤", desc: "Your tracks have high energy but lower happiness" };
  }
  if ((quadrants.calm / total) * 100 > highestPct) {
    highestPct = (quadrants.calm / total) * 100;
    dominantMood = { name: "Calm", emoji: "😌", desc: "Your tracks are relaxed and peaceful" };
  }
  if ((quadrants.melancholic / total) * 100 > highestPct) {
    highestPct = (quadrants.melancholic / total) * 100;
    dominantMood = { name: "Melancholic", emoji: "😔", desc: "Your tracks are more emotional and reflective" };
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const point = ctx.raw;
            return [
              `${point.name}`,
              `😊 Happiness: ${(point.originalHappiness * 100).toFixed(0)}%`,
              `⚡ Energy: ${(point.originalEnergy * 100).toFixed(0)}%`,
              `🎵 Top tracks: ${point.top3?.slice(0, 2).join(', ') || 'N/A'}`
            ];
          }
        },
        backgroundColor: "#111",
        titleColor: "#fff",
        bodyColor: "#aaa",
        borderColor: "#333",
        borderWidth: 1
      },
      legend: {
        labels: { color: "white", font: { size: 12 } }
      },
      title: {
        display: true,
        text: view === 'weekly' ? "Weekly Mood Quadrant" : "Monthly Mood Quadrant",
        color: "white",
        font: { size: 16, weight: 'bold' }
      }
    },
    scales: {
      x: {
        position: "center",
        min: -1,
        max: 1,
        ticks: {
          color: "white",
          stepSize: 0.5,
          callback: (v) => {
            if (v === -1) return "Low Energy";
            if (v === 1) return "High Energy";
            return "";
          }
        },
        title: {
          display: true,
          color: "white",
          font: { size: 12 }
        },
        grid: {
          color: (ctx) => ctx.tick.value === 0 ? "#ffffff" : "#444",
          lineWidth: (ctx) => ctx.tick.value === 0 ? 3 : 1
        }
      },
      y: {
        position: "center",
        min: -1,
        max: 1,
        ticks: {
          color: "white",
          stepSize: 0.5,
          callback: (v) => {
            if (v === -1) return "Low Happiness";
            if (v === 1) return "High Happiness";
            return "";
          }
        },
        title: {
          display: true,
          color: "white",
          font: { size: 12 }
        },
        grid: {
          color: (ctx) => ctx.tick.value === 0 ? "#ffffff" : "#444",
          lineWidth: (ctx) => ctx.tick.value === 0 ? 3 : 1
        }
      }
    }
  };

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

      <span className="title">Mood Summary</span>
      <span className="subtitle">Based on your {view === 'weekly' ? 'daily' : 'weekly'} listening patterns</span>

      {/* Dominant Mood Card */}
      <div className="moodCard">
        <span className="moodEmoji">{dominantMood.emoji}</span>
        <div className="moodCardText">
          <span className="moodCardTitle">Your dominant mood</span>
          <span className="moodCardLabel">{dominantMood.name}</span>
          <span className="moodCardDesc">{dominantMood.desc}</span>
        </div>
      </div>

      <div className="mainArea">
        {/* Scatter Plot */}
        <section className="squareDiagram">
            <div className="toggleButtons">
                <button
                    className={view === 'weekly' ? 'active' : ''}
                    onClick={() => setView('weekly')}
                >Weekly</button>
                <button
                    className={view === 'monthly' ? 'active' : ''}
                    onClick={() => setView('monthly')}
                >Monthly</button>
            </div>

            <div className="chartWrapper">
                <div className="quadrantLabels">
                    <span className="quadLabel topLeft">😤 Intense<br/><span className="quadSmall">High Energy · Low Happiness</span></span>
                    <span className="quadLabel topRight">😄 Happy<br/><span className="quadSmall">High Energy · High Happiness</span></span>
                    <span className="quadLabel bottomLeft">😔 Melancholic<br/><span className="quadSmall">Low Energy · Low Happiness</span></span>
                    <span className="quadLabel bottomRight">😌 Calm<br/><span className="quadSmall">Low Energy · High Happiness</span></span>
                </div>
                <Scatter data={chartData} options={options}/>
            </div>
        </section>

        {/* Right side panel */}
        <div className="sidePanel">

          {/* Mood Breakdown */}
          <section className="moodBreakdown">
            <span className="panelTitle">Mood Breakdown</span>
            <div className="breakdownItem">
              <span className="breakdownEmoji">😄</span>
              <span className="breakdownLabel">Happy & Energetic</span>
              <div className="breakdownBarBg">
                <div className="breakdownBar" style={{ width: `${(quadrants.happyEnergetic / total) * 100}%`, backgroundColor: '#1DB954' }}/>
              </div>
              <span className="breakdownPct">{Math.round((quadrants.happyEnergetic / total) * 100)}%</span>
            </div>
            <div className="breakdownItem">
              <span className="breakdownEmoji">😤</span>
              <span className="breakdownLabel">Intense</span>
              <div className="breakdownBarBg">
                <div className="breakdownBar" style={{ width: `${(quadrants.intense / total) * 100}%`, backgroundColor: '#f97316' }}/>
              </div>
              <span className="breakdownPct">{Math.round((quadrants.intense / total) * 100)}%</span>
            </div>
            <div className="breakdownItem">
              <span className="breakdownEmoji">😌</span>
              <span className="breakdownLabel">Calm</span>
              <div className="breakdownBarBg">
                <div className="breakdownBar" style={{ width: `${(quadrants.calm / total) * 100}%`, backgroundColor: '#60a5fa' }}/>
              </div>
              <span className="breakdownPct">{Math.round((quadrants.calm / total) * 100)}%</span>
            </div>
            <div className="breakdownItem">
              <span className="breakdownEmoji">😔</span>
              <span className="breakdownLabel">Melancholic</span>
              <div className="breakdownBarBg">
                <div className="breakdownBar" style={{ width: `${(quadrants.melancholic / total) * 100}%`, backgroundColor: '#a78bfa' }}/>
              </div>
              <span className="breakdownPct">{Math.round((quadrants.melancholic / total) * 100)}%</span>
            </div>
          </section>

          {/* Average Scores */}
          <section className="averageScores">
            <span className="panelTitle">Average Scores</span>
            <div className="scoreRow">
              <span className="scoreLabel">😊 Happiness</span>
              <div className="breakdownBarBg">
                <div className="breakdownBar" style={{ width: `${avgHappiness * 100}%`, backgroundColor: '#1DB954' }}/>
              </div>
              <span className="scoreValue">{Math.round(avgHappiness * 100)}%</span>
            </div>
            <div className="scoreRow">
              <span className="scoreLabel">⚡ Energy</span>
              <div className="breakdownBarBg">
                <div className="breakdownBar" style={{ width: `${avgEnergy * 100}%`, backgroundColor: '#f97316' }}/>
              </div>
              <span className="scoreValue">{Math.round(avgEnergy * 100)}%</span>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default MoodSummary;