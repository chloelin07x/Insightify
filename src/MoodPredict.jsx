import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { weeklyTestData, monthlyTestData } from "./MoodTestData";
import "./MoodPredict.css";

// ─── Recommendation Logic ─────────────────────────────────────────────────────

function getRecommendations(happiness, energy) {
  const h = happiness >= 0.6 ? 'high' : happiness >= 0.35 ? 'mid' : 'low';
  const e = energy    >= 0.6 ? 'high' : energy    >= 0.35 ? 'mid' : 'low';

  const map = {
    'high-high': {
      mood: 'Energised & Happy',
      genres: ['Dance-pop', 'Hyperpop', 'Funk'],
      artists: ['Doja Cat', 'Charli XCX', 'Bruno Mars'],
    },
    'high-mid': {
      mood: 'Content & Flowing',
      genres: ['Indie pop', 'Neo-soul', 'Chillhop'],
      artists: ['Rex Orange County', 'Frank Ocean', 'Surfaces'],
    },
    'high-low': {
      mood: 'Calm & Happy',
      genres: ['Acoustic', 'Bossa nova', 'Lo-fi'],
      artists: ['Jack Johnson', 'Novo Amor', 'Clairo'],
    },
    'mid-high': {
      mood: 'Driven & Focused',
      genres: ['Alternative rock', 'Electronic', 'Hip-hop'],
      artists: ['Tame Impala', 'Kendrick Lamar', 'Jamie xx'],
    },
    'mid-mid': {
      mood: 'Balanced',
      genres: ['Indie rock', 'R&B', 'Pop'],
      artists: ['Arctic Monkeys', 'SZA', 'The 1975'],
    },
    'mid-low': {
      mood: 'Reflective',
      genres: ['Singer-songwriter', 'Ambient', 'Folk'],
      artists: ['Phoebe Bridgers', 'Bon Iver', 'Iron & Wine'],
    },
    'low-high': {
      mood: 'Tense & Restless',
      genres: ['Post-punk', 'Dark electronic', 'Emo'],
      artists: ['Idles', 'Portrayal of Guilt', 'Nothing'],
    },
    'low-mid': {
      mood: 'Heavy & Brooding',
      genres: ['Shoegaze', 'Slowcore', 'Dream pop'],
      artists: ['Slowdive', 'Beach House', 'Mazzy Star'],
    },
    'low-low': {
      mood: 'Melancholic',
      genres: ['Sad indie', 'Ambient', 'Classical'],
      artists: ['Elliott Smith', 'Nick Drake', 'Sufjan Stevens'],
    },
  };

  return map[`${h}-${e}`];
}

// ─── ML Helpers ───────────────────────────────────────────────────────────────

function weightedMA(arr) {
  let num = 0, den = 0;
  arr.forEach((v, i) => { const w = i + 1; num += v * w; den += w; });
  return num / den;
}

function detectOscillation(arr) {
  let swings = 0;
  for (let i = 1; i < arr.length - 1; i++) {
    const up = arr[i] > arr[i - 1];
    const down = arr[i + 1] < arr[i];
    if ((up && down) || (!up && !down)) swings++;
  }
  return swings >= Math.floor(arr.length / 2);
}

function predictNext(arr) {
  const wma = weightedMA(arr);
  const last = arr[arr.length - 1];
  const oscillating = detectOscillation(arr);
  let pred;
  if (oscillating) {
    const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
    pred = mean + (mean - last) * 0.45;
  } else {
    pred = wma * 0.6 + last * 0.4;
  }
  return Math.max(0.05, Math.min(0.99, pred));
}

function moodLabel(v) {
  if (v >= 0.75) return "High";
  if (v >= 0.45) return "Medium";
  return "Low";
}

function moodColor(v) {
  if (v >= 0.75) return "#1DB954";
  if (v >= 0.45) return "#F59B00";
  return "#E3365A";
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatPill({ label, value, color }) {
  return (
    <div className="statPill">
      <div className="statPillLabel">{label}</div>
      <div className="statPillValue">
        {(value * 100).toFixed(0)}<span>%</span>
      </div>
      <div className="statPillBar">
        <div className="statPillBarFill" style={{ width: `${value * 100}%`, background: color }} />
      </div>
      <div className="statPillMoodLabel" style={{ color: moodColor(value) }}>
        {moodLabel(value)}
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#111", border: "1px solid #333", borderRadius: 10,
      padding: "10px 14px", fontSize: 12, color: "#ccc",
    }}>
      <div style={{ fontWeight: 600, marginBottom: 6, color: "#fff" }}>{label}</div>
      {payload.map((p) => (
        <div key={p.name} style={{ color: p.color, marginBottom: 2 }}>
          {p.name}: <strong>{(p.value * 100).toFixed(0)}%</strong>
        </div>
      ))}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

function normalise(raw) {
  const happinessDs = raw.datasets.find((ds) => ds.label === "Happiness");
  const energyDs    = raw.datasets.find((ds) => ds.label === "Energy");
  return {
    labels:    raw.labels,
    happiness: happinessDs.data.map((p) => p.y),
    energy:    energyDs.data.map((p) => p.y),
    top3:      happinessDs.data.map((p) => p.top3 ?? []),
  };
}

export default function MoodPredictor() {
  const navigate = useNavigate();
  const [view, setView] = useState("weekly");
  const raw = view === "weekly" ? weeklyTestData : monthlyTestData;
  const d   = normalise(raw);

  const predH = predictNext(d.happiness);
  const predE = predictNext(d.energy);
  const nextLabel = view === "weekly" ? "Mon (pred)" : "Week 5 (pred)";

  const lastHappiness = d.happiness[d.happiness.length - 1];
  const lastEnergy = d.energy[d.energy.length - 1];

  const goToDashboard = () => navigate("/dashboard");
  const goToMoodChart = () => navigate("/moodchart");
  const goToMoodSummary = () => navigate("/moodsummary");
  const goToMoodPredict = () => navigate("/moodpredict");

  const chartData = [];
  
  for (let i = 0; i < d.labels.length; i++) {
    chartData.push({
        label: d.labels[i],
        Happiness: d.happiness[i],
        Energy: d.energy[i],
        HappinessPred: i === d.labels.length - 1 ? lastHappiness : null,
        EnergyPred: i === d.labels.length - 1 ? lastEnergy : null,
    });
  }
  
  chartData.push({
    label: nextLabel,
    Happiness: null,
    Energy: null,
    HappinessPred: predH,
    EnergyPred: predE,
  });

  return (
    <div className="predictContainer">
      {/* Navigation Bar */}
      <div className="row">
        <ul className="headerRow">
          <li><i className="fa-regular fa-house fa-xl" onClick={goToDashboard}></i></li>
          <li><span className="borders" onClick={goToMoodChart}>Chart</span></li>
          <li><span className="borders" onClick={goToMoodSummary}>Summary</span></li>
          <li><span className="borders" onClick={goToMoodPredict}>Predict</span></li>
          <li><i className="fa-regular fa-user fa-xl" onClick={goToDashboard}></i></li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="predictContent">
        <div className="predictHeader">
          <h1>What's next?</h1>
          <p>Predicting your mood from listening patterns</p>
        </div>

        {/* Tab switcher */}
        <div className="tabSwitcher">
          <button className={view === "weekly" ? "active" : ""} onClick={() => setView("weekly")}>
            Weekly
          </button>
          <button className={view === "monthly" ? "active" : ""} onClick={() => setView("monthly")}>
            Monthly
          </button>
        </div>

        {/* Prediction cards */}
        <div className="statPillRow">
          <StatPill label="Happiness forecast" value={predH} color="#1DB954" />
          <StatPill label="Energy forecast" value={predE} color="#E3365A" />
        </div>

        {/* Chart */}
        <div className="chartCard">
          <div className="chartCardLabel">Trend + prediction</div>
          <div className="chartWrapper">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ left: -10, right: 16 }}>
                <CartesianGrid stroke="#1a1a1a" strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fill: "#444", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 1]} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} tick={{ fill: "#444", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine x={nextLabel} stroke="#333" strokeDasharray="4 4" label={{ value: "pred", fill: "#444", fontSize: 10 }} />
                
                <Line type="linear" dataKey="Happiness" stroke="#1DB954" strokeWidth={2} dot={{ r: 4, fill: "#1DB954" }} activeDot={{ r: 6 }} connectNulls={true} />
                <Line type="linear" dataKey="HappinessPred" stroke="#1DB954" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 6, fill: "#1DB954", stroke: "#fff", strokeWidth: 2 }} connectNulls={true} />
                <Line type="linear" dataKey="Energy" stroke="#E3365A" strokeWidth={2} dot={{ r: 4, fill: "#E3365A" }} activeDot={{ r: 6 }} connectNulls={true} />
                <Line type="linear" dataKey="EnergyPred" stroke="#E3365A" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 6, fill: "#E3365A", stroke: "#fff", strokeWidth: 2 }} connectNulls={true} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="chartLegend">
            <div className="chartLegendItem">
              <div className="legendLine solid" style={{ background: "#1DB954" }}></div>
              <span>Happiness</span>
            </div>
            <div className="chartLegendItem">
              <div className="legendLine dashed" style={{ background: "#1DB954" }}></div>
              <span>pred</span>
            </div>
            <div className="chartLegendItem">
              <div className="legendLine solid" style={{ background: "#E3365A" }}></div>
              <span>Energy</span>
            </div>
            <div className="chartLegendItem">
              <div className="legendLine dashed" style={{ background: "#E3365A" }}></div>
              <span>pred</span>
            </div>
          </div>
        </div>
        {(() => {
            const rec = getRecommendations(predH, predE);
            return (
                <div className="recCard">
                <div className="recCardMood">Predicted mood: <strong>{rec.mood}</strong></div>
                <div className="recCardSection">
                    <span className="recLabel">Genres</span>
                    <div className="recTags">
                    {rec.genres.map(g => <span key={g} className="recTag">{g}</span>)}
                    </div>
                </div>
                <div className="recCardSection">
                    <span className="recLabel">Artists to try</span>
                    <div className="recTags">
                    {rec.artists.map(a => <span key={a} className="recTag artist">{a}</span>)}
                    </div>
                </div>
                </div>
            );
            })()}
      </div>
    </div>
  );
}