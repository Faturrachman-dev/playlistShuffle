import { memo } from 'react';
import { Helmet } from 'react-helmet-async';

interface Props {
  title: string;
  percentage?: number;
}

function HelmetHelper({ percentage = 0, title }: Props) {
  return (
    <Helmet
      defaultTitle="Playlist Randomizer - Shuffle Youtube Playlists up to 12000 videos"
      title={`${percentage ? `${percentage}%` : ''} ${title}`}
      defer={false}
    />
  );
}

export default memo(HelmetHelper);
