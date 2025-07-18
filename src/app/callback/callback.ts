import { Component, inject, OnInit } from '@angular/core';
import { AccessTokenService } from '../core/services/access-token';
import { Router } from '@angular/router';

@Component({
  selector: 'app-callback',
  imports: [],
  templateUrl: './callback.html',
  styleUrl: './callback.scss',
})
export class Callback implements OnInit {
  accessTokenService = inject(AccessTokenService);
  _router = inject(Router);

  ngOnInit(): void {
    const previousState = localStorage.getItem('auth-state');
    const previousCodeVerifier = localStorage.getItem('code-verifier');

    const returnedData = new URLSearchParams(window.location.search);
    const returnedState = returnedData.get('state');
    const returnedCode = returnedData.get('code');

    if (
      returnedState &&
      returnedCode &&
      previousState &&
      previousCodeVerifier
    ) {
      if (returnedState != previousState) {
        this._router.navigate(['']);
      } else {
        this.accessTokenService
          .getData(returnedCode, previousCodeVerifier)
          .subscribe({
            next: (result) => {
              console.log(result);
              localStorage.setItem('auth_object', JSON.stringify(result));
            },
            complete: () => {
              console.log('done');
              this._router.navigate(['']);
            },
          });
      }
    } else {
      this._router.navigate(['']);
    }
  }
}
