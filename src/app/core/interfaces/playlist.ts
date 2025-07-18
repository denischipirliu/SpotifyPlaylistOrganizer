import {Track} from './track';

export interface Playlist {
  id: string;
  name: string;
  tracks?: {
    total: number;
    items: {
      track: Track;
    }[]
  }
}
