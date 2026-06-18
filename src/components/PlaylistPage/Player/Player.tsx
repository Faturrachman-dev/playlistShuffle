import { useEffect, useRef } from 'react';
import ReactPlayer from 'react-player/youtube';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import {
  setIsPlaying,
  setCurrentSong,
  setProgress,
  setVideoDuration,
  setPercentage,
  setSeeking,
  setArtist,
  setTitle,
  setSeekKeyboard,
  setSeekTo,
} from '../../../redux/slices/playerSlice';
import {
  lastPlayedIndexPlaylistDetails,
  setPlaylistImage,
} from '../../../redux/slices/playlistDetailsSlice';

type TitleArtistResult = string | [string, string];

function getTitleAndArtist(titleStr: string, ownerTitle: string): TitleArtistResult {
  try {
    if (titleStr === 'Private video') return titleStr;
    if (titleStr.includes(' - ')) {
      const match = titleStr.match(/^(.*?)-(.*)$/);
      if (match) return [match[2] ?? '', match[1] ?? ''];
    }
    if (titleStr.includes('//')) {
      const match = titleStr.match(/^(.*?)\s\/\/\s(.*)$/);
      if (match) return [match[2] ?? '', match[1] ?? ''];
    }
    if (ownerTitle.includes(' - Topic')) {
      const match = ownerTitle.match(/^(.*?)\s-\sTopic$/);
      if (match) return [titleStr, match[1] ?? ''];
    }
    return [titleStr, ownerTitle];
  } catch {
    return titleStr;
  }
}

export default function Player() {
  const dispatch = useAppDispatch();
  const player = useAppSelector((state) => state.player);
  const playlistSongsById = useAppSelector((state) => state.playlistSongsById);
  const playlistDetails = useAppSelector((state) => state.playlistDetails);

  const playerRef = useRef<ReactPlayer>(null);

  const findPlaylistIndex = playlistDetails.findIndex(
    (el) => el.playlistId === player.currentActivePlaylistId,
  );
  const playlistEntry = playlistDetails[findPlaylistIndex];
  const currentPlaylist = playlistSongsById[player.currentActivePlaylistId] ?? [];

  useEffect(() => {
    if (player.seekKeyboard !== null) {
      playerRef.current?.seekTo(player.seekKeyboard, 'fraction');
    }
    dispatch(setSeekKeyboard(null));
  }, [player.seekKeyboard]);

  useEffect(() => {
    if (player.seeking && player.seekTo !== null) {
      playerRef.current?.seekTo(player.seekTo);
      dispatch(setSeeking(false));
      dispatch(setSeekTo(null));
    }
  }, [player.seekTo]);

  const afterSongEnds = () => {
    if (!playlistEntry) return;
    const currIndex = playlistEntry.currentIndex;
    if (currIndex < currentPlaylist.length - 1) {
      dispatch(lastPlayedIndexPlaylistDetails({ currentIndex: currIndex + 1, playlistId: player.currentActivePlaylistId }));
      const next = currentPlaylist[currIndex + 1];
      if (next) dispatch(setCurrentSong(next.snippet.resourceId.videoId));
    }
  };

  const handleEnd = () => {
    if (playlistEntry && playlistEntry.currentIndex === currentPlaylist.length) {
      dispatch(setIsPlaying(false));
    } else {
      afterSongEnds();
    }
  };

  const handleError = () => {
    if (playlistEntry && playlistEntry.currentIndex === playlistEntry.playlistLength) {
      dispatch(setIsPlaying(false));
    } else {
      afterSongEnds();
    }
  };

  const handleReady = () => {
    if (!playlistEntry) return;
    const currIdx = playlistEntry.currentIndex;
    const song = currentPlaylist[currIdx];
    if (!song) return;

    const result = getTitleAndArtist(song.snippet.title, song.snippet.videoOwnerChannelTitle);
    const [resolvedTitle, resolvedArtist] = Array.isArray(result) ? result : [result, ''];

    dispatch(setTitle(`${currIdx + 1} - ${resolvedTitle}`));
    dispatch(setArtist(resolvedArtist));
    dispatch(setProgress(0));
    dispatch(setVideoDuration(parseInt(String(playerRef.current?.getDuration() ?? 0), 10)));
    dispatch(setIsPlaying(true));
    dispatch(setPlaylistImage({
      playlistId: player.currentActivePlaylistId,
      playlistImage: `https://i.ytimg.com/vi/${player.currentSong}/mqdefault.jpg`,
    }));
  };

  const handleProgress = (e: { playedSeconds: number }) => {
    dispatch(setProgress(Math.ceil(e.playedSeconds)));
    const pct = (Math.ceil(e.playedSeconds) / player.videoDuration) * 100;
    dispatch(setPercentage(Math.ceil(parseInt(String(pct), 10))));
  };

  return (
    <div className="player relative h-full aspect-auto md:w-full md:mx-2 md:h-full">
      <ReactPlayer
        playing={player.isPlaying}
        ref={playerRef}
        muted={player.isMutedActive}
        passive="true"
        onProgress={handleProgress}
        onError={handleError}
        onPlay={() => dispatch(setIsPlaying(true))}
        onPause={() => dispatch(setIsPlaying(false))}
        light
        config={{ playerVars: { color: 'white' } }}
        onReady={handleReady}
        onEnded={handleEnd}
        volume={player.volume}
        width="100%"
        height="100%"
        controls
        loop={player.isLoopActive}
        url={`https://www.youtube.com/embed/${player.currentSong}`}
      />
      {player.isAudioOnlyMode && player.currentSong && (
        <img
          src={`https://i.ytimg.com/vi/${player.currentSong}/hqdefault.jpg`}
          alt="audio only mode"
          className="absolute inset-0 w-full h-full object-cover z-10 pointer-events-none"
        />
      )}
    </div>
  );
}
