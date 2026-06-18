import { BiVolumeMute, BiVolumeLow, BiVolumeFull } from 'react-icons/bi';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { setIsMutedActive, setVolume } from '../../../redux/slices/playerSlice';

export default function VolumeManager() {
  const dispatch = useAppDispatch();
  const player = useAppSelector((state) => state.player);

  const handleIconClick = () => {
    dispatch(setIsMutedActive(!player.isMutedActive));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setIsMutedActive(false));
    dispatch(setVolume(parseFloat(e.target.value)));
  };

  return (
    <div className="flex justify-between w-2/3 sm:w-1/2 mx-auto mb-2 md:mb-0 md:w-1/6 md:items-center">
      {player.volume >= 0.5 && !player.isMutedActive && (
        <BiVolumeFull
          className="text-primary hover:text-secondary active:drop-shadow-svgShadow active:scale-110"
          size={30}
          onClick={handleIconClick}
        />
      )}
      {player.volume < 0.5 && !player.isMutedActive && (
        <BiVolumeLow
          className="text-primary hover:text-secondary active:drop-shadow-svgShadow active:scale-110"
          size={30}
          onClick={handleIconClick}
        />
      )}
      {player.isMutedActive && (
        <BiVolumeMute
          className="text-primary hover:text-secondary active:drop-shadow-svgShadow active:scale-110"
          size={30}
          onClick={handleIconClick}
        />
      )}
      <input
        aria-label="volume manager"
        type="range"
        className="mx-2 w-full accent-primary hover:accent-secondary active:accent-secondary"
        name="volume"
        id="volume"
        value={player.volume}
        min={0}
        onChange={handleChange}
        max={1}
        step="any"
      />
      <div className="w-4" />
    </div>
  );
}
