import { memo } from 'react';
import { Helmet } from 'react-helmet-async';

interface Props {
  title: string;
  percentage?: number;
}

function HelmetHelper({ percentage = 0, title }: Props) {
  return (
    <Helmet
      defaultTitle="NEXC Playerlist - Shuffle your YouTube playlist"
      title={`${percentage ? `${percentage}%` : ''} ${title}`}
      defer={false}
    />
  );
}

export default memo(HelmetHelper);
