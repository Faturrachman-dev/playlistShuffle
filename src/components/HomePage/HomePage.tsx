import { useEffect } from 'react';
import PlaylistUsed from './PlaylistUsed/PlaylistUsed';
import Search from './Search/Search';
import Navbar from '../Navbar/Navbar';
import HelmetHelper from '../Helmet/HelmetHelper';
import Footer from '../Footer/Footer';
import { useAppDispatch } from '../../redux/hooks';
import {
  setProgress,
  setPercentage,
  setSeekTo,
  setVideoDuration,
} from '../../redux/slices/playerSlice';

export default function HomePage() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setProgress(0));
    dispatch(setPercentage(0));
    dispatch(setSeekTo(null));
    dispatch(setVideoDuration(0));
  }, []);

  return (
    <div className="h-screen min-h-screen">
      <HelmetHelper title="Playlist Randomizer - Shuffle Youtube Playlists up to 12000 videos" />
      <div className="transition-colors bg-backColor image:bg-[unset] flex flex-col justify-between h-screen min-h-screen mx-auto">
        <Navbar />
        <div className="w-11/12 h-1/5 flex-col flex mx-auto md:max-w-[1600px]">
          <Search />
        </div>
        <PlaylistUsed />
        <Footer />
      </div>
    </div>
  );
}
