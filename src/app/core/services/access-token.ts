import { Injectable } from '@angular/core'
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http'
import { Observable} from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class AccessTokenService {
  client_id = '7f29c29c76974a57927d29d6d14a6ac6'
  url = 'https://accounts.spotify.com/api/token'
  redirect_uri = 'https://127.0.0.1:4200/callback'

  headers = new HttpHeaders({
    'Content-Type': 'application/x-www-form-urlencoded',
  })

  constructor (private http: HttpClient) {}

  getData (code: string, codeVerifier: string): Observable<any> {
    const body = new HttpParams()
    .set('code', code)
    .set('redirect_uri', this.redirect_uri)
    .set('grant_type', 'authorization_code')
    .set('client_id', this.client_id)
    .set('code_verifier', codeVerifier)

    return this.http.post(this.url, body, { headers: this.headers })
  }
}