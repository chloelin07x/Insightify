import './MoodChart.css'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

import { Line } from "react-chartjs-2";
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { weeklyTestData, monthlyTestData } from './MoodTestData';

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

function MoodChart(){
    const navigate = useNavigate();
    const [view, setView] = useState('weekly');

    const rawData = view === 'weekly' ? weeklyTestData : monthlyTestData;

    const chartData = {
        ...rawData,
        datasets: rawData.datasets.map(dataset => ({
            ...dataset,
            tension: 0
        }))
    };
    
    // Calculate summary data based on selected view
    const summaryData = view === 'weekly' ? {
        currentVibe: 'Happy & Energetic',
        currentVibeEmoji: '😄',
        averageHappiness: 72,
        averageEnergy: 65,
        happiestDay: 'Monday',
        happiestDayValue: 89,
        mostEnergeticDay: 'Friday',
        mostEnergeticValue: 91,
        tracksAnalysed: 48
    } : {
        currentVibe: 'Energetic & Happy',
        currentVibeEmoji: '🎉',
        averageHappiness: 68,
        averageEnergy: 71,
        happiestDay: 'Week 2',
        happiestDayValue: 85,
        mostEnergeticDay: 'Week 3',
        mostEnergeticValue: 88,
        tracksAnalysed: 187
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                labels: { color: "white" }
            },
            title: {
                display: true,
                text: view === 'weekly' ? "Weekly Mood Trend" : "Monthly Mood Trend",
                color: "white"
            },
            tooltip: {
                callbacks: {
                    title: (items) => items[0].label,
                    label: (ctx) => {
                        const top3 = ctx.raw.top3?.join(', ') || '';
                        return [
                            `${ctx.dataset.label}: ${(ctx.parsed.y * 100).toFixed(0)}%`,
                            `Top songs: ${top3}`
                        ];
                    }
                }
            }
        },
        scales: {
            x: {
                ticks: { color: "white", maxRotation: 45 },
                grid: { color: "#444" }
            },
            y: {
                min: 0,
                max: 1,
                ticks: {
                    color: "white",
                    callback: (val) => `${(val * 100).toFixed(0)}%`
                },
                grid: { color: "#444" }
            }
        }
    };

    const goToDashboard = () => navigate("/dashboard");
    const goToMoodChart = () => navigate("/moodchart");
    const goToMoodSummary = () => navigate("/moodsummary");
    const goToMoodPredict = () => navigate("/moodpredict");

    return(
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

            <span className="pageTitle">Mood Chart</span>
            <span className="pageSubtitle">Your emotional journey through music</span>

            <div className="mainArea">
                <section className="lineGraph">
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
                    <Line data={chartData} options={options}/>
                </section>

                <aside className="moodSummary">
                    <div className="summaryCard">
                        <span className="summaryCardLabel">
                            {view === 'weekly' ? 'Happiest Day' : 'Happiest Period'}
                        </span>
                        <span className="summaryHighlight">{summaryData.happiestDay}</span>
                        <span className="summarySmall">Avg happiness {summaryData.happiestDayValue}%</span>
                    </div>

                    <div className="summaryCard">
                        <span className="summaryCardLabel">
                            {view === 'weekly' ? 'Most Energetic Day' : 'Most Energetic Period'}
                        </span>
                        <span className="summaryHighlight">{summaryData.mostEnergeticDay}</span>
                        <span className="summarySmall">Avg energy {summaryData.mostEnergeticValue}%</span>
                    </div>

                    <div className="summaryCard">
                        <span className="summaryCardLabel">Tracks Analysed</span>
                        <span className="summaryHighlight">{summaryData.tracksAnalysed}</span>
                    </div>
                </aside>
            </div>

            <div className="metricBar">
                <div className="summaryCard">
                    <span className="summaryCardLabel">Average Happiness</span>
                    <div className="summaryBarBg">
                        <div className="summaryBar happiness" style={{ width: `${summaryData.averageHappiness}%` }}/>
                    </div>
                    <span className="summaryBarValue">{summaryData.averageHappiness}%</span>
                </div>

                <div className="summaryCard">
                    <span className="summaryCardLabel">Average Energy</span>
                    <div className="summaryBarBg">
                        <div className="summaryBar energy" style={{ width: `${summaryData.averageEnergy}%` }}/>
                    </div>
                    <span className="summaryBarValue">{summaryData.averageEnergy}%</span>
                </div>
            </div>

        </div>
    )
}

export default MoodChart;