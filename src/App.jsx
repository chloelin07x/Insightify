import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './Dashboard';
import MoodChart from './MoodChart';
import { auth } from './services/auth';
import { AnimatePresence } from 'framer-motion';
import MoodSummary from './MoodSummary';
import MoodPredict from './MoodPredict';
import PageWrapper from './PageWrapper';

const ProtectedRoute = ({ children }) => {
  return auth.isAuthenticated() ? children : <Navigate to="/login" />;
};

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* No animation on auth pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/callback" element={<Login />} />

        {/* Animated pages */}
        <Route path="/moodchart" element={
          <PageWrapper><MoodChart /></PageWrapper>
        } />
        <Route path="/moodsummary" element={
          <PageWrapper><MoodSummary /></PageWrapper>
        } />
        <Route path="/moodpredict" element={
          <PageWrapper><MoodPredict /></PageWrapper>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <PageWrapper><Dashboard /></PageWrapper>
          </ProtectedRoute>
        } />

        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <Router>
      <AnimatedRoutes />
    </Router>
  );
}

export default App;