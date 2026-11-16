
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  teamName = '';
  discordName = '';

  private API_URL = 'http://localhost:8000';

  constructor(private http: HttpClient) {}

  // Set Guest Information
  setGuest() {
    this.teamName = 'Guest';
    this.discordName = 'Guest';
  }

  // Retrieve Discord Information from FastAPI
  getDiscordInfo(): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/auth/me`, {
      withCredentials: true
    });
  }

  // Store Discord Information
  setDiscordInfo(response: any) {
    this.teamName = response.team_name;
    this.discordName = response.discord_name;
  }

  
}
