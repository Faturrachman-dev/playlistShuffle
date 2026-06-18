import { memo } from 'react';
import { BiPlay, BiPause } from 'react-icons/bi';
import {
  MdSkipPrevious,
  MdSkipNext,
  MdShuffle,
  MdRepeat,
  MdRepeatOne,
} from 'react-icons/md';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import {
  setIsPlaying,
  setCurrentSong,
  setIsLoopActive,
  setIsShuffleActive,
} from '../../../redux/slices/playerSlice';
import {
  lastPlayedIndexPlaylistDetails,
  setPlaylistImage,
} from '../../../redux/slices/playlistDetailsSlice';

const MediaButtons = memo(function MediaButtons() {
  const dispatch = useAppDispatch();
  const player = useAppSelector((state) => state.player);
  const playlistSongsById = useAppSelector((state) => state.playlistSongsById);
  const playlistDetails = useAppSelector((state) => state.playlistDetails);

  const findPlaylistIndex = playlistDetails.findIndex(
    (el) => el.playlistId === player.currentActivePlaylistId,
  );
  const playlistEntry = playlistDetails[findPlaylistIndex];
  const currIndex = playlistEntry?.currentIndex ?? 0;
  const currentPlaylist = playlistSongsById[player.currentActivePlaylistId] ?? [];

  const handleClickPreviousButton = () => {
    if (currIndex > 0 && playlistEntry) {
      dispatch(lastPlayedIndexPlaylistDetails({ currentIndex: currIndex - 1, playlistId: player.currentActivePlaylistId }));
      const prev = currentPlaylist[currIndex - 1];
      if (prev) {
        dispatch(setCurrentSong(prev.snippet.resourceId.videoId));
        dispatch(setPlaylistImage({
          playlistId: player.currentActivePlaylistId,
          playlistImage: `https://i.ytimg.com/vi/${prev.snippet.resourceId.videoId}/mqdefault.jpg`,
        }));
      }
    }
  };

  const handleClickNextButton = () => {
    if (currIndex < currentPlaylist.length - 1 && playlistEntry) {
      dispatch(lastPlayedIndexPlaylistDetails({ currentIndex: currIndex + 1, playlistId: player.currentActivePlaylistId }));
      const next = currentPlaylist[currIndex + 1];
      if (next) {
        dispatch(setCurrentSong(next.snippet.resourceId.videoId));
        dispatch(setPlaylistImage({
          playlistId: player.currentActivePlaylistId,
          playlistImage: `https://i.ytimg.com/vi/${next.snippet.resourceId.videoId}/mqdefault.jpg`,
        }));
      }
    }
  };

  return (
    <div className="flex justify-center w-full">
      {player.isLoopActive ? (
        <button type="button" aria-label="no repeat video" className="p-[0.25rem] mx-2 md:mx-0 md:p-[0.50rem] cursor-auto">
          <MdRepeatOne
            className="active:drop-shadow-none text-primary hover:text-secondary drop-shadow-svgShadow dark:drop-shadow-svgShadowDarkMode active:scale-110"
            onClick={() => dispatch(setIsLoopActive(false))}
            size={35}
          />
        </button>
      ) : (
        <button type="button" aria-label="repeat video" className="active:drop-shadow-2xl cursor-auto p-[0.25rem] md:p-[0.50rem] mx-2 md:mx-0">
          <MdRepeat
            className="active:drop-shadow-none text-primary hover:text-secondary drop-shadow-svgShadow dark:drop-shadow-svgShadowDarkMode active:scale-110"
            onClick={() => dispatch(setIsLoopActive(true))}
            size={35}
          />
        </button>
      )}
      <div className="flex items-center">
        <button type="button" aria-label="previous video" className="p-[0.25rem] md:p-[0.50rem] cursor-auto mx-1 md:mx-0">
          <MdSkipPrevious
            className="active:drop-shadow-none text-primary hover:text-secondary drop-shadow-svgShadow dark:drop-shadow-svgShadowDarkMode active:scale-110"
            onClick={handleClickPreviousButton}
            size={35}
          />
        </button>
        {player.isPlaying ? (
          <button type="button" aria-label="pause video" className="rounded-full cursor-auto bg-accent mx-1 md:mx-0 my-0.5">
            <BiPause
              className="active:scale-105 text-primary"
              onClick={() => dispatch(setIsPlaying(false))}
              size={50}
            />
          </button>
        ) : (
          <button type="button" aria-label="play video" className="cursor-auto rounded-full bg-accent mx-1 md:mx-0 my-0.5">
            <BiPlay
              className="active:scale-105 pl-1 text-primary"
              onClick={() => dispatch(setIsPlaying(true))}
              size={50}
            />
          </button>
        )}
        <button type="button" aria-label="next video" className="p-[0.25rem] md:p-[0.50rem] cursor-auto mx-1 md:mx-0">
          <MdSkipNext
            className="active:drop-shadow-none text-primary hover:text-secondary drop-shadow-svgShadow dark:drop-shadow-svgShadowDarkMode active:scale-110"
            onClick={handleClickNextButton}
            size={35}
          />
        </button>
      </div>
      <button type="button" aria-label="shuffle playlist" className="p-[0.25rem] md:p-[0.50rem] cursor-auto mx-2 md:mx-0">
        <MdShuffle
          className="active:drop-shadow-none text-primary hover:text-secondary drop-shadow-svgShadow dark:drop-shadow-svgShadowDarkMode active:scale-110"
          onClick={() => dispatch(setIsShuffleActive(true))}
          size={35}
        />
      </button>
    </div>
  );
});

export default MediaButtons;
