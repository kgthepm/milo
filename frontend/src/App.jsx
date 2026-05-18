import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MoviesPage from './pages/MoviesPage';
import TVSeriesPage from './pages/TVSeriesPage';
import AuthGate from './components/AuthGate';

function App() {
  return (
    <AuthGate>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MoviesPage />} />
          <Route path="/movies" element={<MoviesPage />} />
          <Route path="/tv" element={<TVSeriesPage />} />
        </Routes>
      </BrowserRouter>
    </AuthGate>
  );
}

export default App;
