import { memo } from 'react';
import { useAppSelector } from '../../../redux/hooks';

function PlayingRightNow() {
  const player = useAppSelector((state) => state.player);

  return (
    <div className="flex md:w-1/4 justify-center md:justify-normal w-full items-center">
      <div className="md:text-clip max-w-[75%] ml-1 md:w-full">
        <p className="songTitle text-textColor font-semibold text-center md:text-left text-md truncate tracking-wide mx-auto md:w-[95%] md:mt-0 font-open">
          {player.artist ? (
            <a
              href={`https://www.google.com/search?q=${player.title} ${player.artist} lyrics`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {player.title}
            </a>
          ) : (
            ''
          )}
        </p>
        <p className="songTitle text-sm text-gray font-normal tracking-wide text-center md:text-left lg:text-md truncate font-open mx-auto md:w-[95%]">
          {player.artist ? (
            <a
              href={`https://www.youtube.com/results?search_query=${player.artist}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {player.artist}
            </a>
          ) : (
            ''
          )}
        </p>
      </div>
    </div>
  );
}

export default memo(PlayingRightNow);
