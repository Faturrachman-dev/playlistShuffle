import { useEffect, useRef, useState } from 'react';
import MersenneTwister from 'mersenne-twister';
import { FixedSizeList, type ListChildComponentProps } from 'react-window';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import {
  setCurrentSong,
  setIsShuffleActive,
  setVideoDuration,
} from '../../../redux/slices/playerSlice';
import {
  lastPlayedIndexPlaylistDetails,
  setPlaylistImage,
  setPlaylistLength,
} from '../../../redux/slices/playlistDetailsSlice';
import { addSongsByPlaylistID } from '../../../redux/slices/playlistSongsByIdSlice';
import type { SearchResultSong } from '../../../types/playlist';

interface Props {
  width: number;
  height: number;
}

export default function VideoCard({ width, height }: Props) {
  const dispatch = useAppDispatch();
  const player = useAppSelector((state) => state.player);
  const playlistSongsById = useAppSelector((state) => state.playlistSongsById);
  const playlistDetails = useAppSelector((state) => state.playlistDetails);

  const [searchResults, setSearchResults] = useState<SearchResultSong[]>([]);
  const listRef = useRef<FixedSizeList>(null);

  const currentPlaylist = playlistSongsById[player.currentActivePlaylistId] ?? [];

  const shuffleIsActive = () => {
    dispatch(setVideoDuration(0));
    const generator = new MersenneTwister();
    const shuffleArr = [...currentPlaylist];
    for (let i = shuffleArr.length - 1; i > 0; i -= 1) {
      const j = Math.floor(generator.random() * (i + 1));
      [shuffleArr[i], shuffleArr[j]] = [shuffleArr[j], shuffleArr[i]];
    }
    dispatch(addSongsByPlaylistID({ id: player.currentActivePlaylistId, songs: shuffleArr }));
    const firstSong = shuffleArr[0];
    if (firstSong) {
      dispatch(setCurrentSong(firstSong.snippet.resourceId.videoId));
      dispatch(setPlaylistImage({
        playlistId: player.currentActivePlaylistId,
        playlistImage: `https://i.ytimg.com/vi/${firstSong.snippet.resourceId.videoId}/mqdefault.jpg`,
      }));
    }
    dispatch(lastPlayedIndexPlaylistDetails({ currentIndex: 0, playlistId: player.currentActivePlaylistId }));
    dispatch(setIsShuffleActive(false));
  };

  useEffect(() => {
    if (player.isShuffleActive) shuffleIsActive();
  }, [player.isShuffleActive]);

  const handleClick = (index: number) => {
    dispatch(lastPlayedIndexPlaylistDetails({ currentIndex: index, playlistId: player.currentActivePlaylistId }));
    const song = currentPlaylist[index];
    if (!song) return;
    dispatch(setCurrentSong(song.snippet.resourceId.videoId));
    dispatch(setPlaylistImage({
      playlistId: player.currentActivePlaylistId,
      playlistImage: `https://i.ytimg.com/vi/${song.snippet.resourceId.videoId}/mqdefault.jpg`,
    }));
  };

  useEffect(() => {
    if (player.searchWords.length >= 3) {
      const result = currentPlaylist.reduce<SearchResultSong[]>((filtered, song, index) => {
        if (!song.snippet.videoOwnerChannelTitle) return filtered;
        if (
          song.snippet.title.toLowerCase().includes(player.searchWords) ||
          song.snippet.videoOwnerChannelTitle.toLowerCase().includes(player.searchWords)
        ) {
          filtered.push({ ...song, index });
        }
        return filtered;
      }, []);
      setSearchResults(result);
    }
    if (searchResults.length && player.searchWords.length >= 3) {
      listRef.current?.scrollToItem(0, 'start');
    } else if (player.searchWords.length < 3 || searchResults.length === 0) {
      const findPlaylistIndex = playlistDetails.findIndex(
        (el) => el.playlistId === player.currentActivePlaylistId,
      );
      if (findPlaylistIndex !== -1) {
        listRef.current?.scrollToItem(
          playlistDetails[findPlaylistIndex]?.currentIndex ?? 0,
          'start',
        );
      }
    }
  }, [player.currentSong, player.searchWords]);

  useEffect(() => {
    dispatch(setPlaylistLength({
      playlistLength: currentPlaylist.length - 1,
      playlistId: player.currentActivePlaylistId,
    }));
  }, [currentPlaylist]);

  if (player.searchWords && player.searchWords.length >= 3 && searchResults.length !== 0) {
    return (
      <div className="h-full w-full">
        <FixedSizeList
          className="list"
          ref={listRef}
          width={width}
          height={height}
          itemCount={searchResults.length}
          itemSize={50}
        >
          {({ index, style }: ListChildComponentProps) => {
            const song = searchResults[index];
            if (!song) return null;
            return (
              <button
                type="button"
                className="w-full my-1 cursor-default"
                style={style}
                title={song.snippet.title}
                id={song.snippet.resourceId.videoId}
                onClick={() => handleClick(song.index)}
                key={index}
              >
                <div className="text-center group">
                  <div className="flex justify-between group-hover:text-secondary">
                    <div
                      className={`${
                        player.currentSong === song.snippet.resourceId.videoId
                          ? 'text-secondary font-semibold'
                          : 'text-textColor'
                      } font-normal w-full text-center md:text-left md:mx-4 md:truncate font-open`}
                    >
                      <p className="truncate group-hover:text-secondary">
                        {`${song.index + 1} - ${song.snippet.title}`}
                      </p>
                      <p
                        className={`${
                          player.currentSong === song.snippet.resourceId.videoId
                            ? 'text-secondary'
                            : 'text-gray group-hover:text-secondary'
                        } truncate text-sm font-open`}
                      >
                        {song.snippet.videoOwnerChannelTitle}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`${
                      player.currentSong === song.snippet.resourceId.videoId
                        ? 'bg-secondary shadow-none'
                        : 'bg-gray'
                    } w-[88%] h-0.5 mx-auto rounded-full group-hover:bg-secondary`}
                  />
                </div>
              </button>
            );
          }}
        </FixedSizeList>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <FixedSizeList
        className="list"
        ref={listRef}
        width={width}
        height={height}
        itemCount={currentPlaylist.length}
        itemSize={50}
      >
        {({ index, style }: ListChildComponentProps) => {
          const song = currentPlaylist[index];
          if (!song) return null;
          return (
            <button
              type="button"
              className="w-full my-1 cursor-default"
              style={style}
              title={song.snippet.title}
              id={song.snippet.resourceId.videoId}
              onClick={() => handleClick(index)}
              key={index}
            >
              <div
                className={`${
                  player.currentSong === song.snippet.resourceId.videoId
                    ? 'border-b-secondary'
                    : ''
                } text-center group`}
              >
                <div className="flex justify-between group-hover:text-secondary">
                  <div
                    className={`${
                      player.currentSong === song.snippet.resourceId.videoId
                        ? 'text-secondary font-semibold'
                        : 'text-textColor'
                    } font-normal w-full text-center md:text-left md:mx-4 md:truncate font-open`}
                  >
                    <p className="truncate group-hover:text-secondary">
                      {`${index + 1} - ${song.snippet.title}`}
                    </p>
                    <p
                      className={`${
                        player.currentSong === song.snippet.resourceId.videoId
                          ? 'text-secondary'
                          : 'text-gray group-hover:text-secondary'
                      } truncate text-sm font-open`}
                    >
                      {song.snippet.videoOwnerChannelTitle}
                    </p>
                  </div>
                </div>
                <div
                  className={`${
                    player.currentSong === song.snippet.resourceId.videoId
                      ? 'bg-secondary shadow-none'
                      : 'bg-gray'
                  } w-[88%] h-0.5 mx-auto rounded-full group-hover:bg-secondary`}
                />
              </div>
            </button>
          );
        }}
      </FixedSizeList>
    </div>
  );
}
