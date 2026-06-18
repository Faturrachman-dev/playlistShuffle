export interface YouTubePlaylistItemSnippet {
  title: string;
  videoOwnerChannelTitle: string;
  position: number;
  resourceId: {
    videoId: string;
  };
}

export interface YouTubePlaylistItem {
  snippet: YouTubePlaylistItemSnippet;
}

export interface YouTubePlaylistItemsResponse {
  etag: string;
  nextPageToken?: string;
  pageInfo: {
    totalResults: number;
  };
  items: YouTubePlaylistItem[];
}

export interface YouTubePlaylistsResponse {
  items: Array<{
    id: string;
    snippet: {
      title: string;
      thumbnails: {
        medium: {
          url: string;
        };
      };
    };
  }>;
}
