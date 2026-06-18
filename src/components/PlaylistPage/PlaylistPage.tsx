import { useEffect, useRef } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import HelmetHelper from '../Helmet/HelmetHelper';
import List from './VideoCard/List';
import useDocumentVisibility from '../../hooks/visibility';
import MediaButtons from './MediaButtons/MediaButtons';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import {
  setIsPlaying,
  setIsLoopActive,
  setIsShuffleActive,
  setCurrentSong,
  setIsMutedActive,
  setVolume,
  setSeekKeyboard,
  setCurrentActivePlaylistId,
  setWordsToSearch,
  setProgress,
  setSeekTo,
  setPercentage,
} from '../../redux/slices/playerSlice';
import { setSearchInput } from '../../redux/slices/homepageSlice';
import {
  lastPlayedIndexPlaylistDetails,
  setPlaylistImage,
} from '../../redux/slices/playlistDetailsSlice';
import PlayingRightNow from './PlayingRightNow/PlayingRightNow';
import Navbar from '../Navbar/Navbar';
import PlaylistInfo from './PlaylistInfo/PlaylistInfo';
import Player from './Player/Player';
import ProgressBar from './ProgressBar/ProgressBar';
import VolumeManger from './MediaButtons/VolumeManager';
import SearchSongs from './SearchSongs/SearchSongs';
import PlayerToolbar from './PlayerToolbar/PlayerToolbar';
import Lyrics from './Lyrics/Lyrics';
import { prefetchPlaylistLyrics } from '../../utils/fetchLyrics';

export default function PlaylistPage() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const player = useAppSelector((state) => state.player);
  const playlistSongsById = useAppSelector((state) => state.playlistSongsById);
  const playlistDetails = useAppSelector((state) => state.playlistDetails);

  const isDocumentVisible = useDocumentVisibility();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dispatch(setWordsToSearch(''));
  }, []);

  useEffect(() => {
    const songs = playlistSongsById[player.currentActivePlaylistId];
    const entry = playlistDetails.find((el) => el.playlistId === player.currentActivePlaylistId);
    if (songs?.length) prefetchPlaylistLyrics(songs, entry?.currentIndex ?? 0);
  }, [player.currentActivePlaylistId]);

  let findPlaylistIndex = playlistDetails.findIndex(
    (el) => el.playlistId === player.currentActivePlaylistId,
  );

  if (player.currentActivePlaylistId !== id) {
    const doesPlExist = playlistDetails.findIndex((el) => el.playlistId === id);
    if (doesPlExist !== -1) {
      dispatch(setCurrentActivePlaylistId(id ?? ''));
      findPlaylistIndex = doesPlExist;
      const pl = playlistSongsById[id ?? ''];
      const entry = playlistDetails[doesPlExist];
      if (pl && entry) {
        const song = pl[entry.currentIndex];
        if (song) dispatch(setCurrentSong(song.snippet.resourceId.videoId));
      }
    } else {
      dispatch(setSearchInput(id ?? ''));
      return <Navigate to="/" />;
    }
  }

  const playlistEntry = playlistDetails[findPlaylistIndex];
  const currentPlaylist = playlistSongsById[player.currentActivePlaylistId] ?? [];
  const currentSongEntry = currentPlaylist[playlistEntry?.currentIndex ?? 0];
  const currentVideoName = currentSongEntry?.snippet.title ?? '';

  useEffect(() => {
    const idx = playlistDetails.findIndex(
      (el) => el.playlistId === player.currentActivePlaylistId,
    );
    const entry = playlistDetails[idx];
    const currIndex = entry?.currentIndex ?? 0;
    const pl = playlistSongsById[player.currentActivePlaylistId] ?? [];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.ctrlKey && e.code === 'ArrowLeft') {
        if (player.progress > 5) {
          const backwardTo = (player.progress - 5) / player.videoDuration;
          dispatch(setProgress(Math.ceil(backwardTo * player.videoDuration)));
          dispatch(setSeekTo(backwardTo));
          dispatch(setPercentage(parseInt(String((Math.ceil(backwardTo * player.videoDuration) / player.videoDuration) * 100), 10)));
        }
        return;
      }
      if (e.ctrlKey && e.code === 'ArrowRight') {
        if (player.videoDuration - player.progress > 5) {
          const forwardTo = (player.progress + 5) / player.videoDuration;
          dispatch(setProgress(Math.ceil(forwardTo * player.videoDuration)));
          dispatch(setSeekTo(forwardTo));
          dispatch(setPercentage(parseInt(String((Math.ceil(forwardTo * player.videoDuration) / player.videoDuration) * 100), 10)));
        }
        return;
      }
      switch (e.code) {
        case 'Space': dispatch(setIsPlaying(player.isPlaying !== true)); break;
        case 'KeyR': dispatch(setIsLoopActive(player.isLoopActive !== true)); break;
        case 'KeyS': dispatch(setIsShuffleActive(player.isShuffleActive !== true)); break;
        case 'KeyM': dispatch(setIsMutedActive(player.isMutedActive !== true)); break;
        case 'ArrowUp':
          dispatch(setVolume(Math.min(player.volume + 0.05, 1)));
          dispatch(setIsMutedActive(false));
          break;
        case 'ArrowDown':
          if (player.volume - 0.05 > 0.006) {
            dispatch(setVolume(player.volume - 0.05));
          } else {
            dispatch(setIsMutedActive(true));
            dispatch(setVolume(0));
          }
          break;
        case 'ArrowLeft':
          if (currIndex > 0 && entry) {
            dispatch(lastPlayedIndexPlaylistDetails({ currentIndex: currIndex - 1, playlistId: player.currentActivePlaylistId }));
            const prev = pl[currIndex - 1];
            if (prev) {
              dispatch(setCurrentSong(prev.snippet.resourceId.videoId));
              dispatch(setPlaylistImage({ playlistId: player.currentActivePlaylistId, playlistImage: `https://i.ytimg.com/vi/${prev.snippet.resourceId.videoId}/mqdefault.jpg` }));
            }
          }
          break;
        case 'ArrowRight':
          if (currIndex < pl.length - 1 && entry) {
            dispatch(lastPlayedIndexPlaylistDetails({ currentIndex: currIndex + 1, playlistId: player.currentActivePlaylistId }));
            const next = pl[currIndex + 1];
            if (next) {
              dispatch(setCurrentSong(next.snippet.resourceId.videoId));
              dispatch(setPlaylistImage({ playlistId: player.currentActivePlaylistId, playlistImage: `https://i.ytimg.com/vi/${next.snippet.resourceId.videoId}/mqdefault.jpg` }));
            }
          }
          break;
        case 'Numpad0': case 'Digit0': dispatch(setSeekKeyboard(0)); break;
        case 'Numpad1': case 'Digit1': dispatch(setSeekKeyboard(0.1)); break;
        case 'Numpad2': case 'Digit2': dispatch(setSeekKeyboard(0.2)); break;
        case 'Numpad3': case 'Digit3': dispatch(setSeekKeyboard(0.3)); break;
        case 'Numpad4': case 'Digit4': dispatch(setSeekKeyboard(0.4)); break;
        case 'Numpad5': case 'Digit5': dispatch(setSeekKeyboard(0.5)); break;
        case 'Numpad6': case 'Digit6': dispatch(setSeekKeyboard(0.6)); break;
        case 'Numpad7': case 'Digit7': dispatch(setSeekKeyboard(0.7)); break;
        case 'Numpad8': case 'Digit8': dispatch(setSeekKeyboard(0.8)); break;
        case 'Numpad9': case 'Digit9': dispatch(setSeekKeyboard(0.9)); break;
        default: break;
      }
    };

    const element = ref.current;
    if (
      element &&
      ((document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.id !== 'widget2') ||
        !isDocumentVisible)
    ) {
      element.focus();
    }
    element?.addEventListener('keydown', handleKeyDown, { passive: true });
    return () => element?.removeEventListener('keydown', handleKeyDown, { passive: true } as EventListenerOptions);
  }, [player]);

  return (
    <div
      ref={ref}
      tabIndex={0}
      className="h-screen min-h-screen transition-colors bg-backColor image:bg-[unset] focus:outline-none"
    >
      <HelmetHelper
        percentage={player.videoPercentage}
        title={
          currentVideoName
            ? `${currentVideoName} - NEXC Playerlist`
            : 'NEXC Playerlist | shuffle your YouTube playlist'
        }
      />
      <div className="h-full flex flex-col overflow-hidden md:block items-center md:mx-auto">
        <Navbar />
        <div className="h-1/5 w-full md:float-left md:w-3/5 md:h-[70%] flex flex-col">
          <PlaylistInfo />
          <div className={player.isLyricsActive ? 'h-[45%] md:h-[50%]' : 'flex-1 min-h-0'}>
            <Player />
          </div>
          <PlayerToolbar />
          {player.isLyricsActive && <Lyrics />}
        </div>
        <div className="w-10/12 h-full mt-12 md:mt-8 mb-2 md:float-right md:w-2/5 md:h-[69%] flex flex-col">
          <SearchSongs />
          <List />
        </div>
        <div className="w-11/12 md:w-full md:clear-both md:absolute md:bottom-0 md:flex md:left-0 md:right-0">
          <PlayingRightNow />
          <div className="md:w-2/4">
            <ProgressBar />
            <MediaButtons />
          </div>
          <VolumeManger />
        </div>
      </div>
    </div>
  );
}
