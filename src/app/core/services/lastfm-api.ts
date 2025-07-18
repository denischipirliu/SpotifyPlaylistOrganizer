import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LastFmApi {
  private apiKey = process.env['LASTFM_API_KEY'];
  private apiUrl = 'https://ws.audioscrobbler.com/2.0/';

  constructor(private http: HttpClient) {}

  getArtistTags(artistName: string) {
    return this.http.get<any>(this.apiUrl, {
      params: {
        method: 'artist.getinfo',
        artist: artistName,
        api_key: this.apiKey!,
        format: 'json'
      }
    });
  }
}
