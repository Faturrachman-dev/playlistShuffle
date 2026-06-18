import { MdVideocam, MdVideocamOff, MdLyrics, MdOutlineLyrics } from 'react-icons/md';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { setIsAudioOnlyMode, setIsLyricsActive } from '../../../redux/slices/playerSlice';

const ICON_SIZE = 22;
const BTN_CLASS = 'p-1 cursor-pointer text-primary hover:text-secondary active:scale-110 drop-shadow-svgShadow dark:drop-shadow-svgShadowDarkMode transition-transform';
const ACTIVE_CLASS = 'text-secondary drop-shadow-svgShadow dark:drop-shadow-svgShadowDarkMode';

export default function PlayerToolbar() {
  const dispatch = useAppDispatch();
  const { isAudioOnlyMode, isLyricsActive } = useAppSelector((state) => state.player);

  return (
    <div className="flex items-center justify-start gap-1 px-3 py-1">
      <button
        type="button"
        aria-label={isAudioOnlyMode ? 'show video' : 'audio only mode'}
        className={`${BTN_CLASS}${isAudioOnlyMode ? ` ${ACTIVE_CLASS}` : ''}`}
        onClick={() => dispatch(setIsAudioOnlyMode(!isAudioOnlyMode))}
      >
        {isAudioOnlyMode ? <MdVideocamOff size={ICON_SIZE} /> : <MdVideocam size={ICON_SIZE} />}
      </button>
      <button
        type="button"
        aria-label={isLyricsActive ? 'hide lyrics' : 'show lyrics'}
        className={`${BTN_CLASS}${isLyricsActive ? ` ${ACTIVE_CLASS}` : ''}`}
        onClick={() => dispatch(setIsLyricsActive(!isLyricsActive))}
      >
        {isLyricsActive ? <MdLyrics size={ICON_SIZE} /> : <MdOutlineLyrics size={ICON_SIZE} />}
      </button>
    </div>
  );
}
