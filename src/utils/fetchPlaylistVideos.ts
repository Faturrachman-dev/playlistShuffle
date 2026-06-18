import axios from 'axios';
import type { FetchVideosResult } from '../types/playlist';
import type { YouTubePlaylistItemsResponse } from '../types/youtube';

export default async function fetchPlaylistVideos(
  id: string,
  etag: string,
  accessToken?: string,
): Promise<FetchVideosResult> {
  const baseApiUrl = 'https://www.googleapis.com/youtube/v3';
  const apiKey = import.meta.env.VITE_YT_API_KEY;
  const responseArr: YouTubePlaylistItemsResponse['items'] = [];
  let responseEtag = '';
  console.log(`[fetchPlaylistVideos] starting fetch for id=${id} (${accessToken ? 'OAuth' : 'apiKey'})`);
  try {
    let nextToken = '';
    let timesInLoop = 0;
    let totalVideos = 0;
    do {
      // eslint-disable-next-line no-await-in-loop
      const responseListItems = await axios.get<YouTubePlaylistItemsResponse>(
        `${baseApiUrl}/playlistItems`,
        {
          headers: {
            'If-None-Match': etag,
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
          params: {
            part: 'snippet',
            maxResults: 50,
            ...(accessToken ? {} : { key: apiKey }),
            pageToken: nextToken,
            playlistId: id,
            fields:
              'etag,nextPageToken,items(snippet(title,videoOwnerChannelTitle,position,resourceId(videoId))),pageInfo',
          },
        },
      );
      console.log(`[fetchPlaylistVideos] page ${timesInLoop + 1}: got ${responseListItems.data.items.length} items, totalResults=${responseListItems.data.pageInfo.totalResults}, nextPageToken=${responseListItems.data.nextPageToken ?? 'none'}`);
      responseArr.push(...responseListItems.data.items);
      totalVideos = responseListItems.data.pageInfo.totalResults;
      timesInLoop += 1;
      if (timesInLoop >= Math.ceil(totalVideos / 50)) break;
      if (responseEtag === '') {
        responseEtag = responseListItems.data.etag;
      }
      nextToken = responseListItems.data.nextPageToken ?? '';
    } while (nextToken);
  } catch (error: unknown) {
    if (!axios.isAxiosError(error) || error.response === undefined) {
      console.error(`[fetchPlaylistVideos] non-HTTP error for id=${id}:`, error);
      return undefined;
    }
    const { status } = error.response;
    console.error(`[fetchPlaylistVideos] HTTP ${status} for id=${id}:`, error.response.data);
    if (status === 304) return 304;
    if (status === 404) return 404;
    if (status === 403) return 403;
    if (status === 500) return 404;
    console.log('Error', error.response); // eslint-disable-line no-console
    return 404;
  }
  const firstItem = responseArr[0];
  if (!firstItem) {
    console.warn(`[fetchPlaylistVideos] fetch succeeded but responseArr is empty for id=${id} — likely private or requires sign-in`);
    return 'private';
  }
  console.log(`[fetchPlaylistVideos] done — ${responseArr.length} total videos for id=${id}`);
  return {
    playlistEtag: responseEtag,
    responseArrToAdd: responseArr,
    currentSong: firstItem.snippet.resourceId.videoId,
  };
}
