import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MoviesPage from './pages/MoviesPage';
import TVSeriesPage from './pages/TVSeriesPage';
import LandingPage from './pages/LandingPage';
import SettingsPage from './pages/SettingsPage';
import FriendsPage from './pages/FriendsPage';
import FriendProfilePage from './pages/FriendProfilePage';
import AuthGate from './components/AuthGate';
import MiloAssistantFab from './components/shared/MiloAssistantFab';
import { loadUserPrefs, subscribeUserPrefs } from './utils/userPrefs';
import { IS_CLOUD } from './utils/mode';

function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === 'light') {
    root.classList.remove('dark');
    root.classList.add('light');
  } else {
    root.classList.remove('light');
    root.classList.add('dark');
  }
}

function App() {
  useEffect(() => {
    applyTheme(loadUserPrefs().theme);
    return subscribeUserPrefs((p) => applyTheme(p.theme));
  }, []);

  return (
    <BrowserRouter>
      <AuthGate>
        <Routes>
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/" element={<MoviesPage />} />
          <Route path="/movies" element={<MoviesPage />} />
          <Route path="/tv" element={<TVSeriesPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          {IS_CLOUD && <Route path="/friends" element={<FriendsPage />} />}
          {IS_CLOUD && <Route path="/friends/:friendId" element={<FriendProfilePage />} />}
        </Routes>
        <MiloAssistantFab />
      </AuthGate>
    </BrowserRouter>
  );
}

export default App;
