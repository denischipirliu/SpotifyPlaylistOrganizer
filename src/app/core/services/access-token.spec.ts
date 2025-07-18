import { TestBed } from '@angular/core/testing';

import { AccessToken } from './access-token';

describe('AccessToken', () => {
  let service: AccessToken;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AccessToken);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
