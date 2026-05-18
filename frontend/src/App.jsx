import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MoviesPage from './pages/MoviesPage';
import TVSeriesPage from './pages/TVSeriesPage';
import LandingPage from './pages/LandingPage';
import AuthGate from './components/AuthGate';

function App() {
  return (
    <BrowserRouter>
      <AuthGate>
        <Routes>
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/" element={<MoviesPage />} />
          <Route path="/movies" element={<MoviesPage />} />
          <Route path="/tv" element={<TVSeriesPage />} />
        </Routes>
      </AuthGate>
    </BrowserRouter>
  );
}

export default App;
