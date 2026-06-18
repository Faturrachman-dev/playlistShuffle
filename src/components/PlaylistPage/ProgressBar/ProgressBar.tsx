import { memo } from 'react';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import {
  setPercentage,
  setSeekTo,
  setSeeking,
  setProgress,
  setVideoCountdown,
} from '../../../redux/slices/playerSlice';

function ProgressBar() {
  const dispatch = useAppDispatch();
  const player = useAppSelector((state) => state.player);

  const secondsToTime = (e: number): string => {
    const h = Math.floor(e / 3600).toString().padStart(2, '0');
    const m = Math.floor((e % 3600) / 60).toString().padStart(2, '0');
    const s = Math.floor(e % 60).toString().padStart(2, '0');
    return h === '00' ? `${m}:${s}` : `${h}:${m}:${s}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    dispatch(setProgress(Math.ceil(val * player.videoDuration)));
    dispatch(setSeekTo(val));
    dispatch(
      setPercentage(
        parseInt(
          String((Math.ceil(val * player.videoDuration) / player.videoDuration) * 100),
          10,
        ),
      ),
    );
  };

  const handleMouseDown = () => dispatch(setSeeking(true));

  const handleMouseUp = (e: React.MouseEvent<HTMLInputElement> | React.TouchEvent<HTMLInputElement>) => {
    dispatch(setSeekTo(parseFloat((e.target as HTMLInputElement).value)));
  };

  return (
    <div className="flex flex-col justify-center w-full md:mb-[-20px]">
      <input
        aria-label="progress bar"
        type="range"
        className="w-full accent-primary hover:accent-secondary active:accent-secondary"
        name="volume"
        id="volume"
        value={player.videoPercentage / 100}
        min={0}
        onChange={handleChange}
        max={0.99}
        step="0.01"
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
        onMouseUp={handleMouseUp}
        onTouchEnd={handleMouseUp}
      />
      <div className="flex font-medium justify-between">
        <div className="font-nunito text-textColor cursor-default">
          {secondsToTime(player.progress)}
        </div>
        <button
          type="button"
          className="font-nunito text-textColor cursor-default"
          onClick={() => dispatch(setVideoCountdown(!player.videoCountdown))}
        >
          {player.videoCountdown
            ? `- ${secondsToTime(player.videoDuration - player.progress)}`
            : secondsToTime(player.videoDuration)}
        </button>
      </div>
    </div>
  );
}

export default memo(ProgressBar);
