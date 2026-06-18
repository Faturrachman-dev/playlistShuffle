import { useNavigate } from 'react-router-dom';
import { TbArrowsSort } from 'react-icons/tb';
import { TiDeleteOutline } from 'react-icons/ti';
import { MdUpdate } from 'react-icons/md';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import {
  addToPlaylistDetails,
  deleteFromPlaylistDetails,
  modifyEtagInPlaylistDetailsById,
  lastPlayedIndexPlaylistDetails,
} from '../../../redux/slices/playlistDetailsSlice';
import fetchPlaylistVideos from '../../../utils/fetchPlaylistVideos';
import fetchPlaylistData from '../../../utils/fetchPlaylistData';
import {
  addSongsByPlaylistID,
  removePlaylistSongsById,
} from '../../../redux/slices/playlistSongsByIdSlice';
import {
  setCurrentActivePlaylistId,
  setCurrentSong,
  setIsPlLoading,
  setIsShuffleActive,
} from '../../../redux/slices/playerSlice';

export default function PlaylistUsed() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const playlistDetails = useAppSelector((state) => state.playlistDetails);
  const playlistSongsById = useAppSelector((state) => state.playlistSongsById);
  const auth = useAppSelector((state) => state.auth);

  const accessToken = (auth.accessToken && auth.expiresAt && Date.now() < auth.expiresAt)
    ? auth.accessToken : undefined;

  const handleClickPlaylist = (id: string) => {
    dispatch(setIsShuffleActive(false));
    dispatch(setCurrentActivePlaylistId(id));
    dispatch(setIsPlLoading(true));
    const findPlaylistIndex = playlistDetails.findIndex((el) => el.playlistId === id);
    const entry = playlistDetails[findPlaylistIndex];
    const pl = playlistSongsById[id];
    if (entry && pl) {
      const song = pl[entry.currentIndex];
      if (song) dispatch(setCurrentSong(song.snippet.resourceId.videoId));
    }
    dispatch(setIsPlLoading(false));
    navigate(`/${id}`);
  };

  const handleDeleteFromPlaylist = (id: string) => {
    dispatch(setCurrentSong(''));
    dispatch(removePlaylistSongsById(id));
    dispatch(deleteFromPlaylistDetails(id));
  };

  const handleSortClick = (id: string) => {
    const pl = playlistSongsById[id];
    if (!pl) return;
    const sorted = [...pl].sort((a, b) => a.snippet.position - b.snippet.position);
    dispatch(addSongsByPlaylistID({ id, songs: sorted }));
    const first = sorted[0];
    if (first) dispatch(setCurrentSong(first.snippet.resourceId.videoId));
    dispatch(lastPlayedIndexPlaylistDetails({ currentIndex: 0, playlistId: id }));
    dispatch(setIsShuffleActive(false));
  };

  const handleUpdate = async (id: string) => {
    dispatch(setIsPlLoading(true));
    dispatch(setCurrentActivePlaylistId(id));
    const currentPlaylistInfo = playlistDetails.find((el) => el.playlistId === id);
    if (!currentPlaylistInfo) {
      dispatch(setIsPlLoading(false));
      return;
    }
    const data = await fetchPlaylistVideos(id, currentPlaylistInfo.playlistEtag, accessToken);
    if (!data || data === 304 || typeof data === 'number' || data === 'private') {
      dispatch(setIsPlLoading(false));
      return;
    }
    const playlistDataInfo = await fetchPlaylistData(id, data.playlistEtag, accessToken);
    if (playlistDataInfo) {
      dispatch(addToPlaylistDetails({ ...playlistDataInfo }));
    }
    dispatch(modifyEtagInPlaylistDetailsById({ playlistId: id, etag: data.playlistEtag }));
    dispatch(addSongsByPlaylistID({ id, songs: data.responseArrToAdd }));
    dispatch(setCurrentSong(data.currentSong));
    dispatch(lastPlayedIndexPlaylistDetails({ currentIndex: 0, playlistId: id }));
    dispatch(setIsPlLoading(false));
  };

  const playlists = playlistDetails.map((element) => (
    <div
      className="playlistUsedList flex justify-between my-2 mx-2 rounded-lg text-bgWhite bg-primary image:bg-primary/60 hover:bg-secondary hover:image:bg-primary/80"
      key={element.playlistId}
    >
      <button
        type="button"
        className="flex w-4/6 cursor-default"
        onClick={() => handleClickPlaylist(element.playlistId)}
      >
        <img
          className="object-cover h-14 rounded-l-lg"
          width="56px"
          alt={element.playlistName}
          src={element.playlistImage}
        />
        <p className="usedPlaylistName ml-2 text-sm md:text-base font-open text-bgWhite dark:text-bgWhite font-medium truncate">
          {element.playlistName}
        </p>
      </button>
      <div className="w-1/4 flex justify-end">
        {!element.playlistId.includes('MIX') && (
          <div className="group relative w-max my-auto">
            <button
              type="button"
              aria-label="update playlist"
              className="text-white mx-0.5 active:scale-110"
              onClick={() => handleUpdate(element.playlistId)}
            >
              <MdUpdate size="24" />
            </button>
            <span className="pointer-events-none absolute -translate-x-2/4 left-2/4 -bottom-full w-max rounded bg-bgBlack px-2 py-1 text-sm font-medium text-bgWhite opacity-0 shadow transition-opacity duration-250 ease-in group-hover:opacity-100">
              Update
            </span>
          </div>
        )}
        <div className="group relative w-max my-auto">
          <button
            type="button"
            aria-label="sort playlist"
            onClick={() => handleSortClick(element.playlistId)}
            className="text-bgWhite dark:text-bgWhite mx-0.5 active:scale-110"
          >
            <TbArrowsSort size="24" />
          </button>
          <span className="pointer-events-none absolute -translate-x-2/4 left-1/4 -bottom-full w-max rounded bg-bgBlack px-2 py-1 text-sm font-medium text-bgWhite opacity-0 shadow transition-opacity duration-250 ease-in group-hover:opacity-100">
            Sort by Default
          </span>
        </div>
        <div className="group relative w-max my-auto">
          <button
            type="button"
            aria-label="delete playlist"
            className="text-bgWhite dark:text-bgWhite mx-0.5 active:scale-110"
            onClick={() => handleDeleteFromPlaylist(element.playlistId)}
          >
            <TiDeleteOutline size="24" />
          </button>
          <span className="pointer-events-none absolute -translate-x-2/4 left-1/4 -bottom-full w-max rounded bg-bgBlack px-2 py-1 text-sm font-medium text-bgWhite opacity-0 shadow transition-opacity duration-250 ease-in group-hover:opacity-100">
            Delete
          </span>
        </div>
      </div>
    </div>
  ));

  return (
    <div className="playlistUsedContainer overflow-x-hidden overflow-y-auto h-3/6 my-4 w-11/12 mx-auto md:max-w-[1600px]">
      {playlistDetails.length ? playlists : null}
    </div>
  );
}
