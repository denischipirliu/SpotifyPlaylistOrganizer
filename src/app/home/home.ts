import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';

import {MatButtonModule} from '@angular/material/button';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatListModule} from '@angular/material/list';
import {MatPaginatorModule, PageEvent} from '@angular/material/paginator';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatProgressBarModule} from '@angular/material/progress-bar';

import {LastFmApi} from '../core/services/lastfm-api';
import {SpotifyAPI} from '../core/services/spotify-api';

import {Artist} from '../core/interfaces/artist';
import {SavedTracks} from '../core/interfaces/saved-tracks';
import {SidebarCategory} from '../core/interfaces/sidebar-categories';
import {Track} from '../core/interfaces/track';
import {User} from '../core/interfaces/user';
import {forkJoin, map, of, switchMap} from 'rxjs';
import {Sidebar} from '../core/services/sidebar';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatCardModule} from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';
import {MatFormFieldModule} from '@angular/material/form-field';
import {CreatePlaylist} from '../core/interfaces/create-playlist';
import {FormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatCheckbox} from '@angular/material/checkbox';
import {Playlist} from '../core/interfaces/playlist';
import {MatDialog} from '@angular/material/dialog';
import {SuccessDialog} from './success-dialog';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatExpansionModule,
    MatListModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSidenavModule,
    MatProgressBarModule,
    MatButtonToggleModule,
    MatCardModule,
    MatIconModule,
    MatFormFieldModule,
    FormsModule,
    MatInputModule,
    MatSlideToggleModule,
    MatCheckbox,
  ],
  templateUrl: './home.html',
  styleUrls: ['./home.scss'],
})
export class Home implements OnInit {
  public isExpanded: boolean = false;
  public loading: boolean = false;
  public createPlaylist: CreatePlaylist = {name: '', description: '', public: false};
  public playlist: Playlist | null = null;
  public user: User | null = null;
  public savedTracks: SavedTracks['items'] = [];
  public uniqueTracks: Track[] = [];
  public artists = new Map<string, Artist>();
  public sidebarCategories: SidebarCategory[] = [];
  public currentFilters: Map<string, string[]> = new Map<string, string[]>();
  public pageSize = 10;
  public currentPage = 0;
  protected readonly Array = Array;


  constructor(
    private readonly spotifyAPI: SpotifyAPI,
    private readonly lastFmAPI: LastFmApi,
    private readonly cdr: ChangeDetectorRef,
    private readonly sidebar: Sidebar,
    private readonly dialog: MatDialog,
  ) {
  }

  public ngOnInit(): void {
    this.sidebar.expanded$.subscribe(state => {
      this.isExpanded = state;
    });
    if (!localStorage.getItem('auth_object')) {
      return;
    }

    this.loadUserProfile();
    this.loadTracksFromCacheOrApi();
  }

  private loadUserProfile(): void {
    this.spotifyAPI.getUserProfile().subscribe({
      next: (profile) => (this.user = profile),
      error: (err) => console.error('Failed to load user:', err),
    });
  }

  private loadTracksFromCacheOrApi(): void {
    const cached = localStorage.getItem('tracks');
    if (cached) {
      this.uniqueTracks = JSON.parse(cached);
      this.loadArtistsFromCacheOrApi();
    } else {
      this.spotifyAPI.getSavedTracks().subscribe({
          next: (resp) => {
            this.savedTracks = resp;
            this.uniqueTracks = this.removeDuplicateTracks();
            localStorage.setItem('tracks', JSON.stringify(this.uniqueTracks));
            this.loadArtistsFromCacheOrApi();
          },
          error: (err) => console.error('Failed to load saved tracks:', err),
        }
      );
    }
  }

  private loadArtistsFromCacheOrApi(): void {
    const cached = localStorage.getItem('artists');
    if (cached) {
      JSON.parse(cached).forEach((a: Artist) => this.artists.set(a.id, a));
      this.buildSidebarCategories();
      this.loading = false;
    } else {
      this.fetchArtists();
    }
  }

  private fetchArtists(): void {
    const ids = Array.from(new Set(this.uniqueTracks.map(t => t.artists[0].id)));
    this.spotifyAPI.getArtists([], ids).pipe(
      switchMap((list) => {
        list.forEach((a) => this.artists.set(a.id, a));

        const genreFetches = list.map((artist) => {
          if (!artist.genres.length) {
            return this.lastFmAPI.getArtistTags(artist.name).pipe(
              map((data) => {
                artist.genres = data.artist.tags.tag.map((t: any) => t.name.toLowerCase());
                return artist;
              })
            );
          } else {
            return of(artist);
          }
        });

        return forkJoin(genreFetches);
      })
    ).subscribe({
      next: (updatedArtists) => {
        updatedArtists.forEach(a => this.artists.set(a.id, a));
        this.buildSidebarCategories();
        localStorage.setItem('artists', JSON.stringify(updatedArtists));
      },
      error: (err) => console.error('Failed to get artists or genres:', err),
    });
  }

  private removeDuplicateTracks(): Track[] {
    const map = new Map<string, Track>();
    this.savedTracks.forEach((item) => {
      const key = `${item.track.name
        .toLowerCase()
        .trim()}::${item.track.artists[0].name.toLowerCase().trim()}`;
      if (!map.has(key)) {
        map.set(key, item.track);
      }
    });
    return Array.from(map.values());
  }

  private buildSidebarCategories(): void {
    this.sidebarCategories = [
      this.getDecadesCategory(),
      this.getGenresCategory(),
    ];
    this.loading = false;
    console.log(this.sidebarCategories.at(1));
    this.cdr.detectChanges();
  }

  private getDecade(year?: string): string {
    if (!year) {
      return 'Unknown Decade';
    }
    const num = parseInt(year, 10);
    return isNaN(num) ? 'Unknown Decade' : `${Math.floor(num / 10) * 10}s`;
  }

  private getDecadesCategory(): SidebarCategory {
    const stats = new Map<string, { trackCount: number; artists: Set<string> }>();
    this.uniqueTracks.forEach((t) => {
      const decade = this.getDecade(t.album.release_date.split('-')[0]);
      if (!stats.has(decade)) {
        stats.set(decade, {trackCount: 0, artists: new Set()});
      }
      const entry = stats.get(decade)!;
      entry.trackCount++;
      entry.artists.add(t.artists[0].name);
    });

    return {
      name: 'decades',
      items: Array.from(stats, ([name, data]) => ({
        name,
        trackCount: data.trackCount,
        artistCount: data.artists.size,
      })).sort((a, b) => b.trackCount - a.trackCount),
    };
  }

  private getGenresCategory(): SidebarCategory {
    const stats = new Map<string, { trackCount: number; artists: Set<string> }>();
    this.uniqueTracks.forEach((t) => {
      const artist = this.artists.get(t.artists[0].id);
      const genres = artist?.genres.length
        ? artist.genres
        : ['(unclassified genre)'];
      const mainGenre = genres.at(0)!;
      if (!stats.has(mainGenre)) {
        stats.set(mainGenre, {trackCount: 0, artists: new Set()});
      }
      const entry = stats.get(mainGenre)!;
      entry.trackCount++;
      entry.artists.add(t.artists[0].name);
    });
    //const cleanedStats = this.cleanGenresCategory(stats);

    return {
      name: 'genres',
      items: Array.from(stats, ([name, data]) => ({
        name,
        trackCount: data.trackCount,
        artistCount: data.artists.size,
      })).sort((a, b) => b.trackCount - a.trackCount),
    };
  }

  private cleanGenresCategory(stats: Map<string, { trackCount: number; artists: Set<string> }>): Map<string, {
    trackCount: number;
    artists: Set<string>
  }> {
    const cleanedStats = new Map<string, { trackCount: number; artists: Set<string> }>();
    const threshold = 3;
    let trackCount = 0;
    let artists = new Set<string>();
    stats.forEach((value, key) => {
      if (value.trackCount > threshold) {
        cleanedStats.set(key, value);
      } else {
        trackCount += value.trackCount;
        value.artists.forEach(artist => artists.add(artist));
      }
    })
    cleanedStats.set("other", {trackCount, artists});
    return cleanedStats;
  }

  public onFilterSelect(category: string, selectedValues: string[]): void {
    this.currentFilters.set(category, selectedValues);
    this.currentPage = 0;
  }

  public clearFilter(): void {
    this.currentFilters.clear();
    this.currentPage = 0;
  }

  public get filteredTracks(): Track[] {
    if (this.currentFilters.size === 0) return this.uniqueTracks;

    return this.uniqueTracks.filter((t) => {
      for (const [category, selectedValues] of this.currentFilters.entries()) {
        if (category === 'decades') {
          const decade = this.getDecade(t.album.release_date.split('-')[0]);
          if (!selectedValues.includes(decade)) return false;
        }
        if (category === 'genres') {
          const artist = this.artists.get(t.artists[0].id);
          const genres = artist?.genres.length ? artist.genres : ['(unclassified genre)'];
          const mainGenre = genres.at(0)!;
          if (!selectedValues.includes(mainGenre)) return false;
        }
      }
      return true;
    });
  }

  public get pagedTracks(): Track[] {
    const start = this.currentPage * this.pageSize;
    return this.filteredTracks.slice(start, start + this.pageSize);
  }

  public onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
    window.scrollTo({top: 0, behavior: 'smooth'});
  }

  private showSuccessDialog() {
    this.dialog.open(SuccessDialog, {
      data: 'Playlist created successfully!'
    });
  }

  public generatePlaylist() {
    this.spotifyAPI.createPlaylist(this.createPlaylist, this.user!.id).subscribe({
      next: (response) => {
        this.playlist = response;
        const uris: string[] = this.filteredTracks.map((t) => t.uri);
        this.spotifyAPI.addTracksToPlaylist(this.playlist, uris).subscribe({
          next: (response) => {
            this.createPlaylist = {name: '', description: '', public: false};
            this.playlist = null;
            this.showSuccessDialog();
          }
        });
      }
    })
  }

}
