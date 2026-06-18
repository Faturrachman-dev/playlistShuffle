import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import fetchPlaylistVideos from '../../../utils/fetchPlaylistVideos';
import fetchPlaylistData from '../../../utils/fetchPlaylistData';
import validateId from '../../../utils/validateId';
import {
  setCurrentSong,
  setCurrentActivePlaylistId,
  setIsShuffleActive,
  setIsPlLoading,
} from '../../../redux/slices/playerSlice';
import { setSearchInput } from '../../../redux/slices/homepageSlice';
import {
  addToPlaylistDetails,
  modifyEtagInPlaylistDetailsById,
} from '../../../redux/slices/playlistDetailsSlice';
import { addSongsByPlaylistID } from '../../../redux/slices/playlistSongsByIdSlice';
import type { FetchVideosSuccess } from '../../../types/playlist';

function isFetchSuccess(data: unknown): data is FetchVideosSuccess {
  return typeof data === 'object' && data !== null && 'responseArrToAdd' in data;
}

export default function Search() {
  const dispatch = useAppDispatch();
  const player = useAppSelector((state) => state.player);
  const playlistDetails = useAppSelector((state) => state.playlistDetails);
  const playlistSongsById = useAppSelector((state) => state.playlistSongsById);
  const homepage = useAppSelector((state) => state.homepage);

  const auth = useAppSelector((state) => state.auth);
  const [isIdInvalid, setIsIdInvalid] = useState(false);
  const [errorReason, setErrorReason] = useState('');
  const navigate = useNavigate();

  const accessToken = (auth.accessToken && auth.expiresAt && Date.now() < auth.expiresAt)
    ? auth.accessToken : undefined;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const PLinput = validateId(homepage.searchInput);
    console.log('[Search] validateId result:', PLinput);

    if (PLinput === null) {
      setErrorReason("The playlist doesn't seem to be valid");
      dispatch(setIsPlLoading(false));
      setIsIdInvalid(true);
      return;
    }

    if (typeof PLinput === 'string') {
      const existingPL = playlistDetails.find((el) => el.playlistId === PLinput);
      if (existingPL) {
        console.log('[Search] playlist already cached, navigating directly');
        const findPLIndex = playlistDetails.findIndex((el) => el.playlistId === PLinput);
        dispatch(setCurrentActivePlaylistId(PLinput));
        const pl = playlistSongsById[PLinput];
        const entry = playlistDetails[findPLIndex];
        if (pl && entry) {
          const song = pl[entry.currentIndex];
          if (song) dispatch(setCurrentSong(song.snippet.resourceId.videoId));
        }
        dispatch(setSearchInput(''));
        navigate(`/${PLinput}`);
        return;
      }
      try {
        dispatch(setIsPlLoading(true));
        console.log('[Search] fetching videos for', PLinput);
        const data = await fetchPlaylistVideos(PLinput, '', accessToken);
        console.log('[Search] fetchPlaylistVideos result:', data);
        if (data === 404) {
          setErrorReason("The playlist doesn't seem to be valid");
          dispatch(setIsPlLoading(false));
          setIsIdInvalid(true);
          return;
        }
        if (data === 403) {
          setErrorReason("You're out of luck, try in a few hours");
          dispatch(setIsPlLoading(false));
          setIsIdInvalid(true);
          return;
        }
        if (data === 'private') {
          setErrorReason(
            accessToken
              ? "This playlist is private or not accessible with your account"
              : "This playlist is private — sign in with YouTube (top-right) to load your own playlists",
          );
          dispatch(setIsPlLoading(false));
          setIsIdInvalid(true);
          return;
        }
        if (!isFetchSuccess(data)) {
          console.warn('[Search] isFetchSuccess=false, data:', data, '— stopping silently');
          dispatch(setIsPlLoading(false));
          return;
        }
        console.log('[Search] fetching playlist metadata for', PLinput);
        const playlistDataInfo = await fetchPlaylistData(PLinput, data.playlistEtag, accessToken);
        console.log('[Search] fetchPlaylistData result:', playlistDataInfo);
        if (playlistDataInfo) {
          // playlistLength is optional on PlaylistDetail, so Omit<…> is assignable
          dispatch(addToPlaylistDetails({ ...playlistDataInfo }));
        } else {
          console.warn('[Search] fetchPlaylistData returned null — playlist will have no metadata entry, PlaylistPage will redirect back to /');
        }
        dispatch(addSongsByPlaylistID({ id: PLinput, songs: data.responseArrToAdd }));
        dispatch(modifyEtagInPlaylistDetailsById({ playlistId: PLinput, etag: data.playlistEtag }));
        dispatch(setCurrentSong(data.currentSong));
        dispatch(setCurrentActivePlaylistId(PLinput));
        dispatch(setIsShuffleActive(false));
        dispatch(setSearchInput(''));
        setErrorReason('');
        dispatch(setIsPlLoading(false));
        navigate(`/${PLinput}`);
      } catch (err) {
        console.error('[Search] unexpected error:', err);
        dispatch(setIsPlLoading(false));
      }
      return;
    }

    // Mix playlist (object)
    const mixArr: FetchVideosSuccess['responseArrToAdd'] = [];
    dispatch(setIsPlLoading(true));
    for (let i = 0; i < PLinput.playlists.length; i += 1) {
      const plId = PLinput.playlists[i];
      if (!plId) continue;
      // eslint-disable-next-line no-await-in-loop
      const data = await fetchPlaylistVideos(plId, '', accessToken);
      if (data === 403) {
        dispatch(setIsPlLoading(false));
        setErrorReason("You're out of luck, try in a few hours");
        setIsIdInvalid(true);
        return;
      }
      if (!isFetchSuccess(data)) {
        // eslint-disable-next-line no-console
        console.log(`Error on playlist ${plId}`);
        continue;
      }
      if (mixArr.length > 15000) break;
      mixArr.push(...data.responseArrToAdd);
    }
    if (mixArr.length === 0) {
      dispatch(setIsPlLoading(false));
      return;
    }
    const mixPlId = `MIXpl${Math.random().toString().slice(2, 20)}`;
    const firstSong = mixArr[0];
    if (!firstSong) {
      dispatch(setIsPlLoading(false));
      return;
    }
    const playlistDetailsObject = {
      playlistName: PLinput.name,
      playlistId: mixPlId,
      playlistImage: `https://i.ytimg.com/vi/${firstSong.snippet.resourceId.videoId}/mqdefault.jpg`,
      playlistEtag: '',
      currentIndex: 0,
    };
    dispatch(addToPlaylistDetails(playlistDetailsObject));
    dispatch(addSongsByPlaylistID({ id: mixPlId, songs: mixArr }));
    dispatch(setCurrentActivePlaylistId(mixPlId));
    dispatch(setCurrentSong(firstSong.snippet.resourceId.videoId));
    dispatch(setIsShuffleActive(false));
    dispatch(setIsPlLoading(false));
    navigate(`/${mixPlId}`);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchInput(e.target.value));
  };

  return (
    <div className="searchContainer w-full my-4 mx-auto">
      <form onSubmit={handleSubmit}>
        {isIdInvalid ? (
          <p className="text-textColor font-open">{errorReason}</p>
        ) : (
          <p className="text-textColor font-open">
            To add multiple playlist read&nbsp;
            <a
              className="text-secondary font-semibold font-open hover:scale-110 underline"
              href="https://github.com/jooonathann/playlistShuffle#How-to-combine-multiple-playlist"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="github link"
            >
              here
            </a>
            &nbsp;or Enter a playlist URL or ID:
          </p>
        )}
        <div className="w-full flex my-2 justify-between">
          <input
            className={`inputSearch w-5/6 md:w-11/12 mr-2 py-2 px-2 rounded-md font-open shadow-lg focus:outline-none focus:shadow-outline${isIdInvalid ? ' border border-red' : ''}`}
            placeholder="example of a PL ID: PLi9drqWffJ9FWBo7ZVOiaVy0UQQEm4IbP"
            type="text"
            required
            onChange={handleChange}
            value={homepage.searchInput}
          />
          <button
            className="rounded-md px-4 w-2/12 md:w-1/12 font-open shadow-shadowBox active:shadow-none dark:shadow-shadowBoxDarkMode dark:active:shadow-none flex items-center justify-center text-textColorInside hover:bg-secondary bg-primary active:scale-105"
            type="submit"
          >
            {player.isPlLoading ? (
              <svg
                className="animate-spin mx-auto h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              'Play'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
