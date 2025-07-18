import {Track} from './track';

export interface SavedTracks {
  href: string;
  items: Array<{
    added_at: string;
    track: Track;
  }>;
  limit: number;
  next: string | null;
  offset: number;
  previous: string | null;
  total: number;
}
