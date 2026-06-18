import AutoSizer, { type Size } from 'react-virtualized-auto-sizer';
import VideoCard from './VideoCard';

export default function List() {
  return (
    <div className="h-full w-full mt-2">
      <AutoSizer>
        {({ height, width }: Size) => <VideoCard height={height} width={width} />}
      </AutoSizer>
    </div>
  );
}
