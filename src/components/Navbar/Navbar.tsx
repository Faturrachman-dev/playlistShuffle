import { memo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BsFillMoonFill, BsFillSunFill, BsImageFill } from 'react-icons/bs';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import {
  setIsPlaying,
  setIsShuffleActive,
  setCurrentActivePlaylistId,
  setTheme,
  setTitle,
  setArtist,
  setWordsToSearch,
  setIsPlLoading,
} from '../../redux/slices/playerSlice';
import { setSearchInput } from '../../redux/slices/homepageSlice';
import type { Theme } from '../../redux/slices/playerSlice';
import AuthButton from './AuthButton';

function Navbar() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const player = useAppSelector((state) => state.player);

  const handleClickHome = () => {
    dispatch(setIsPlaying(true));
    dispatch(setIsShuffleActive(false));
    dispatch(setCurrentActivePlaylistId(''));
    dispatch(setIsPlLoading(false));
    dispatch(setTitle(''));
    dispatch(setArtist(''));
    dispatch(setSearchInput(''));
    dispatch(setWordsToSearch(''));
    navigate('/');
  };

  useEffect(() => {
    const { theme } = player;
    document.documentElement.classList.remove('dark', 'light', 'image');
    document.documentElement.classList.add(theme);
  }, []);

  const handleClickTheme = () => {
    const next: Theme =
      player.theme === 'light' ? 'dark' : player.theme === 'dark' ? 'image' : 'light';
    document.documentElement.classList.remove('dark', 'light', 'image');
    document.documentElement.classList.add(next);
    dispatch(setTheme(next));
  };

  return (
    <div className="w-full px-1">
      <div className="flex justify-between w-full mx-1 my-1">
        <button type="button" onClick={handleClickHome}>
          <h1
            className="text-lg font-bold text-left cursor-pointer navbar sm:text-2xl font-open text-textColor"
          >
            Shuffle Playlist{' '}
          </h1>
        </button>
        <div className="flex flex-row mr-2 items-center">
          <AuthButton />
          {player.theme === 'image' && (
            <div className="flex">
              <div className="flex flex-row mx-4 my-auto rounded-md w-44 justify-evenly hover:scale-105 active:scale-110">
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://www.buymeacoffee.com/shufflePlaylist"
                  aria-label="buy me a coffee link"
                >
                  <img
                    src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=☕&slug=playlistshuffle&button_colour=E94747&font_colour=FFFFFF&font_family=Lato&outline_colour=000000&coffee_colour=FFDD00"
                    alt="buy me a coffee button"
                    className="h-[37px]"
                  />
                </a>
              </div>
              <div className="my-auto mr-1">
                <BsFillSunFill
                  fill="white"
                  onClick={handleClickTheme}
                  className="cursor-pointer"
                  aria-label="sun icon"
                  size={25}
                />
              </div>
            </div>
          )}
          {player.theme === 'dark' && (
            <div className="flex">
              <div className="flex flex-row mx-4 my-auto rounded-md w-44 justify-evenly hover:scale-105 active:scale-110">
                <a
                  href="https://www.buymeacoffee.com/shufflePlaylist"
                  aria-label="buy me a coffee link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=☕&slug=playlistshuffle&button_colour=008BA7&font_colour=FFFFFF&font_family=Lato&outline_colour=000000&coffee_colour=FFDD00"
                    alt="buy me a coffee button"
                    className="h-[37px]"
                  />
                </a>
              </div>
              <div className="my-auto mr-1">
                <BsImageFill
                  fill="white"
                  onClick={handleClickTheme}
                  className="cursor-pointer"
                  aria-label="image icon"
                  size={25}
                />
              </div>
            </div>
          )}
          {player.theme === 'light' && (
            <div className="flex">
              <div className="flex flex-row mx-4 my-auto rounded-md w-44 justify-evenly hover:scale-105 active:scale-110">
                <a
                  href="https://www.buymeacoffee.com/shufflePlaylist"
                  aria-label="buy me a coffee link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=☕&slug=playlistshuffle&button_colour=006868&font_colour=FFFFFF&font_family=Lato&outline_colour=000000&coffee_colour=FFDD00"
                    alt="buy me a coffee button"
                    className="h-[37px]"
                  />
                </a>
              </div>
              <div className="my-auto mr-1">
                <BsFillMoonFill
                  fill="black"
                  onClick={handleClickTheme}
                  className="cursor-pointer"
                  aria-label="moon icon"
                  size={25}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(Navbar);
