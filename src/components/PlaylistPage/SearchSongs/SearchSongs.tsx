import { IoMdClose } from 'react-icons/io';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { setWordsToSearch } from '../../../redux/slices/playerSlice';

export default function SearchSongs() {
  const dispatch = useAppDispatch();
  const player = useAppSelector((state) => state.player);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setWordsToSearch(e.target.value.toLowerCase()));
  };

  return (
    <div className="w-full flex justify-center">
      <input
        onChange={handleChange}
        value={player.searchWords}
        type="text"
        placeholder="Search"
        className="inputSearch w-full md:w-[90%] py-2 mx-auto px-2 bg-backColor image:bg-[unset] text-textColor text-center md:text-left rounded-md font-open focus:outline-double focus:outline-secondary pr-10 md:mr-0.5 md:mx-4 text-base pl-10 md:pl-2"
      />
      <button
        type="button"
        aria-label="delete text"
        onClick={() => dispatch(setWordsToSearch(''))}
        className={`my-auto text-gray mx-1 -ml-9 w-[8%] md:w-[12%] cursor-pointer${player.searchWords.length ? '' : ' invisible'}`}
      >
        <IoMdClose size={25} />
      </button>
    </div>
  );
}
