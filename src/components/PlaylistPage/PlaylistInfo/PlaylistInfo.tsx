import { memo, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useAppSelector } from '../../../redux/hooks';

function PlaylistInfo() {
  const { id } = useParams<{ id: string }>();
  const playlistDetails = useAppSelector((state) => state.playlistDetails);

  const info = useMemo(
    () => playlistDetails.find((ele) => ele.playlistId === id),
    [playlistDetails, id],
  );

  if (!info) return null;

  return (
    <div className="flex my-1 justify-center md:justify-start text-secondary">
      <p className="ml-2 tracking-tight font-open font-semibold truncate">
        <a
          href={`https://www.youtube.com/playlist?list=${id}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {info.playlistName}&nbsp;
        </a>
      </p>
      <p className="ml-2 tracking-tight font-open font-semibold">
        {info.currentIndex + 1}/{(info.playlistLength ?? 0) + 1}
      </p>
    </div>
  );
}

export default memo(PlaylistInfo);
