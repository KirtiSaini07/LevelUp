import React, { useState, useEffect, useContext, useMemo } from 'react';
import { Cloud, BrainCircuit, Activity, BarChart2 } from 'lucide-react';
import { TaskContext } from '../context/TaskContext';
import { AuthContext } from '../context/AuthContext';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const { activeTasks, completedTasks } = useContext(TaskContext);
  const [weather, setWeather] = useState(null);
  const [advice, setAdvice] = useState('');
  const [loadingWeather, setLoadingWeather] = useState(true);

  useEffect(() => {
    // Fetch Weather Data
    const fetchWeather = async () => {
      try {
        const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=28.6139&longitude=77.2090&current_weather=true&hourly=precipitation_probability&timezone=Asia%2FKolkata');
        const data = await response.json();
        setWeather({ current: data.current_weather, hourly: data.hourly });
      } catch (error) {
        console.error("Error fetching weather:", error);
      } finally {
        setLoadingWeather(false);
      }
    };

    // Fetch AI Advice
    const fetchWisdom = async () => {
      try {
        const response = await fetch('/data/productivity_tips.json');
        const data = await response.json();
        const tips = data.tips;
        const index = Math.floor(Math.random() * tips.length);
        setAdvice(tips[index]);
      } catch (error) {
        console.error("Error fetching wisdom:", error);
        setAdvice("Consistency > Intensity: Small daily gains lead to massive long-term results.");
      }
    };

    fetchWeather();
    fetchWisdom();
  }, []);

  const getWeatherDetails = (weatherData) => {
    if (!weatherData || !weatherData.current) return null;
    const { current, hourly } = weatherData;
    
    // Determine condition from WMO code
    let condition = "Clear";
    const code = current.weathercode;
    if (code === 0) condition = "Sunny / Clear";
    else if ([1, 2, 3].includes(code)) condition = "Cloudy";
    else if ([45, 48].includes(code)) condition = "Foggy";
    else if ([51, 53, 55, 56, 57].includes(code)) condition = "Drizzle";
    else if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) condition = "Rainy";
    else if ([71, 73, 75, 77, 85, 86].includes(code)) condition = "Snowy";
    else if ([95, 96, 99].includes(code)) condition = "Thunderstorm";

    // Determine upcoming rain
    let rainPrediction = "No rain expected soon.";
    if (hourly && hourly.time && hourly.precipitation_probability) {
      const now = new Date();
      let closestIndex = 0;
      let minDiff = Infinity;
      
      hourly.time.forEach((timeStr, index) => {
        const time = new Date(timeStr);
        const diff = Math.abs(time - now);
        if (diff < minDiff) {
          minDiff = diff;
          closestIndex = index;
        }
      });

      // Check next 12 hours
      for (let i = closestIndex; i < closestIndex + 12 && i < hourly.precipitation_probability.length; i++) {
        if (hourly.precipitation_probability[i] > 50) {
          const rainTime = new Date(hourly.time[i]);
          rainPrediction = `Rain expected around ${rainTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
          break;
        }
      }
    }

    return { condition, rainPrediction };
  };

  const skillsData = useMemo(() => {
    const categories = { Logic: 0, Creativity: 0, Stamina: 0, Health: 0 };
    completedTasks.forEach(task => {
      if (categories[task.category] !== undefined) {
        categories[task.category] += task.xpReward;
      } else {
        categories.Logic += task.xpReward;
      }
    });
    return Object.keys(categories).map(key => ({
      subject: key,
      A: categories[key],
      fullMark: 500,
    }));
  }, [completedTasks]);

  // Build real consistency data from last 7 days
  const consistencyData = useMemo(() => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const result = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dayLabel = dayNames[d.getDay()];
      const dateStr = d.toISOString().split('T')[0];
      const count = completedTasks.filter(t => t.createdAt?.startsWith(dateStr)).length;
      result.push({ name: dayLabel, quests: count });
    }
    return result;
  }, [completedTasks]);

  const hasAnyCompleted = completedTasks.length > 0;

  const getWeatherSuggestion = () => {
    if (!weather) return "Loading world state...";
    if (weather.weathercode >= 60) {
      return "It's raining outside! Perfect time for an Indoor Coding Quest.";
    } else if (weather.temperature > 20) {
      return "It's warm out! Suggestion: Complete a Stamina Quest outdoors.";
    }
    return "Weather is stable. A balanced mix of Logic and Creativity quests is optimal.";
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        {user && <p style={{ color: 'var(--text-secondary)' }}>Welcome back, <strong style={{ color: 'var(--accent-primary)' }}>{user.username}</strong>!</p>}
      </div>
      
      <div className="stats-container glass-panel">
        <div className="stat-item">
          <span className="stat-label">Active Quests</span>
          <span className="stat-value">{activeTasks.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Completed Quests</span>
          <span className="stat-value">{completedTasks.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Total XP</span>
          <span className="stat-value">{completedTasks.reduce((acc, t) => acc + t.xpReward, 0)}</span>
        </div>
      </div>

      <div className="charts-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        {/* Skill Radar */}
        <div className="widget-card glass-panel" style={{ minHeight: '300px' }}>
          <div className="widget-header">
            <BarChart2 className="widget-icon" />
            <span>Skill Radar</span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            Shows your XP earned per skill category from completed quests.
          </p>
          {!hasAnyCompleted ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '32px 0', color: 'var(--text-secondary)' }}>
              <BarChart2 size={36} opacity={0.3} />
              <p style={{ fontSize: '0.9rem', textAlign: 'center' }}>Complete quests to grow your skill web!</p>
            </div>
          ) : (
            <div style={{ height: '240px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={skillsData}>
                  <PolarGrid stroke="var(--glass-border)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 'dataMax + 100']} tick={false} axisLine={false} />
                  <Radar name="Skills" dataKey="A" stroke="var(--accent-primary)" fill="var(--accent-primary)" fillOpacity={0.5} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Consistency Graph */}
        <div className="widget-card glass-panel" style={{ minHeight: '300px' }}>
          <div className="widget-header">
            <Activity className="widget-icon" />
            <span>Consistency Graph</span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            Quests completed each day over the last 7 days.
          </p>
          {!hasAnyCompleted ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '32px 0', color: 'var(--text-secondary)' }}>
              <Activity size={36} opacity={0.3} />
              <p style={{ fontSize: '0.9rem', textAlign: 'center' }}>Start completing quests to track your streak!</p>
            </div>
          ) : (
            <div style={{ height: '240px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={consistencyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorQuests" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--success)" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="var(--success)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="var(--text-secondary)" tick={{fontSize: 12}} />
                  <YAxis allowDecimals={false} stroke="var(--text-secondary)" tick={{fontSize: 12}} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--glass-border)' }} />
                  <Area type="monotone" dataKey="quests" stroke="var(--success)" fillOpacity={1} fill="url(#colorQuests)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <div className="dashboard-grid" style={{ marginTop: '0' }}>
        {/* Weather & World Event Widget */}
        <div className="widget-card glass-panel">
          <div className="widget-header">
            <Cloud className="widget-icon" />
            <span>Weather</span>
          </div>
          {loadingWeather ? (
            <p>Loading world state...</p>
          ) : weather && weather.current ? (
            (() => {
              const details = getWeatherDetails(weather);
              return (
                <div className="weather-info" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                    <span className="weather-temp">{weather.current.temperature}°C</span>
                    <span className="weather-desc" style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{details?.condition}</span>
                  </div>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Wind: {weather.current.windspeed} km/h
                  </p>
                  <p style={{ marginTop: '12px', color: 'var(--accent-secondary)', fontWeight: '500', fontSize: '0.9rem' }}>
                    {details?.rainPrediction}
                  </p>
                </div>
              );
            })()
          ) : (
            <p>Could not connect to world server.</p>
          )}
        </div>

        {/* AI Advice Widget */}
        <div className="widget-card glass-panel">
          <div className="widget-header">
            <BrainCircuit className="widget-icon" />
            <span>Wisdom Scroll</span>
          </div>
          <p className="advice-text">"{advice || 'Consulting the elders...'}"</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
