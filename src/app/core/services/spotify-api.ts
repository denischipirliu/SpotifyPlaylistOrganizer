import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {User} from '../interfaces/user';
import {SavedTracks} from '../interfaces/saved-tracks';
import {Observable, of, switchMap} from 'rxjs';
import {Artist} from '../interfaces/artist';
import {create} from 'node:domain';
import {CreatePlaylist} from '../interfaces/create-playlist';
import {Playlist} from '../interfaces/playlist';

@Injectable({
  providedIn: 'root'
})
export class SpotifyAPI {
  url = 'https://api.spotify.com/v1/';
  http: HttpClient = inject(HttpClient);


  getUserProfile() {
    return this.http.get<User>(this.url + 'me');
  }

  getSavedTracks(accumulated: SavedTracks['items'] = [], offset = 0): Observable<SavedTracks['items']> {
    return this.http.get<SavedTracks>(this.url + `me/tracks`, {
      params: {
        limit: 50,
        offset: offset
      }
    }).pipe(
      switchMap(response => {
        const allItems = accumulated.concat(response.items);
        if (response.next) {
          return this.getSavedTracks(allItems, offset + 50);
        } else {
          return of(allItems);
        }
      })
    );
  }

  getArtists(accumulated: Artist[] = [], ids: string[]): Observable<Artist[]> {
    const batch = ids.slice(0, 50);
    const remaining = ids.slice(50);

    return this.http.get<{ artists: Artist[] }>(this.url + `artists`, {
      params: {
        ids: batch.join(',')
      }
    }).pipe(
      switchMap(response => {
        const allArtists = accumulated.concat(response.artists);
        if (remaining.length > 0) {
          return this.getArtists(allArtists, remaining);
        } else {
          return of(allArtists);
        }
      })
    );


  }

  createPlaylist(playlist: CreatePlaylist, userId: string) {
    return this.http.post<Playlist>(this.url + `users/${userId}/playlists`, playlist)
  }

  addTracksToPlaylist(playlist: Playlist, uris: string[]) {
    return this.http.post(this.url + `playlists/${playlist.id}/tracks`, {"uris": uris, "position": 0})
  }


}
