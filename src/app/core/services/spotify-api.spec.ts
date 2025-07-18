import { TestBed } from '@angular/core/testing';

import { SpotifyAPI } from './spotify-api';

describe('SpotifyAPI', () => {
  let service: SpotifyAPI;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SpotifyAPI);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
