import { useEffect, useRef } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { useAppDispatch, useAppSelector } from './redux/hooks';
import { setWordsToSearch } from './redux/slices/playerSlice';
import HomePage from './components/HomePage/HomePage';
import PlaylistPage from './components/PlaylistPage/PlaylistPage';
import ErrorPage from './components/ErrorPage/ErrorPage';
import AboutPage from './components/AboutPage/AboutPage';
import './app.css';

export default function App() {
  const dispatch = useAppDispatch();
  const player = useAppSelector((state) => state.player);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dispatch(setWordsToSearch(''));
  }, []);

  const coverImage = `https://i.ytimg.com/vi/${player.currentSong}/hqdefault.jpg`;

  useEffect(() => {
    if (ref.current && player.theme === 'image') {
      ref.current.style.transition = 'background 700ms ease-in-out 150ms';
      ref.current.style.backgroundBlendMode = 'multiply';
      ref.current.style.backgroundSize = 'cover';
      ref.current.style.backgroundPosition = 'center';
      ref.current.style.backgroundColor = '#404040';
      ref.current.style.backgroundImage =
        player.currentSong === ''
          ? 'url(./assets/images/silivan-munguarakarama-NrR9gn3lFKU-unsplash.jpg)'
          : `url(${coverImage})`;
    }
  }, [player.currentSong, player.theme]);

  return (
    <div ref={ref} id="app">
      <div className="backdrop-blur-sm">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/:id" element={<PlaylistPage />} />
          <Route path="/error" element={<ErrorPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
        <Analytics />
      </div>
    </div>
  );
}
