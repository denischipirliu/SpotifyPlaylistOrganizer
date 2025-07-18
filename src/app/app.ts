import {HttpParams} from '@angular/common/http';
import {Component, inject, OnInit} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {RouterOutlet} from '@angular/router';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatCardModule} from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';
import {Sidebar} from './core/services/sidebar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatButtonModule, MatToolbarModule, MatCardModule, MatIconModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  protected title = 'spotify-playlist-maker';
  isAuthenticated = false;
  isExpanded = true;
  sidebar = inject(Sidebar);

  ngOnInit(): void {
    this.isAuthenticated = !!localStorage.getItem('auth_object');
  }

  randomString(length: number): string {
    const chars =
      '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = length; i > 0; --i) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
  }

  base64UrlEncode(array: Uint8Array): string {
    return btoa(String.fromCharCode(...array))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  async generateCodeChallenge(codeVerifier: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return this.base64UrlEncode(new Uint8Array(digest));
  }

  async onAuthClick() {
    const generated_state = this.randomString(16);
    const codeVerifier = this.randomString(128);
    const codeChallenge = await this.generateCodeChallenge(codeVerifier);

    localStorage.setItem('auth-state', generated_state);
    localStorage.setItem('code-verifier', codeVerifier);

    const baseURL = 'https://accounts.spotify.com/authorize?';
    const paramObject = {
      response_type: 'code',
      client_id: '7f29c29c76974a57927d29d6d14a6ac6',
      scope:
        'user-read-private user-read-email user-library-read playlist-modify-public playlist-modify-private',
      redirect_uri: 'https://127.0.0.1:4200/callback',
      state: generated_state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    };
    const paramString = new HttpParams({fromObject: paramObject}).toString();
    window.location.href = baseURL + paramString;
  }

  onLogout() {
    localStorage.removeItem('auth_object');
    this.isAuthenticated = false;
    window.location.reload();
    this.clearCache();
  }

  toggleSidebar() {
    this.sidebar.toggle();
  }

  clearCache() {
    localStorage.removeItem('tracks');
    localStorage.removeItem('artists');
    location.reload();
  }
}
