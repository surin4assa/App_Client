import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { User } from '../_models/user';
import { BehaviorSubject } from 'rxjs';
import { take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PresenceService {
  hubUrl = environment.hubUrl;
  private hubConnection: HubConnection;
  private onlineUsersSource = new BehaviorSubject<string[]>([]);
  onlineUsers$ = this.onlineUsersSource.asObservable();

  constructor(private toastr: ToastrService, private router: Router) { }

  createHubConnection(user: User){
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(`${this.hubUrl}presence`, {
        accessTokenFactory: () => user.token
      })
      .withAutomaticReconnect()
      .build()

    this.hubConnection
      .start()
      .catch(error => console.error(error));

    this.hubConnection.on('UserIsOnline', username => {
      this.onlineUsers$.pipe(take(1)).subscribe(usernames => {
        console.log('UserIsOnline '+usernames)
        this.onlineUsersSource.next([...usernames, username]);
      })
    })

    this.hubConnection.on('UserIsOffline', username => {
      this.onlineUsers$.pipe(take(1)).subscribe(usernames => {
        console.log('UserIsOnffline '+usernames)
        this.onlineUsersSource.next([...usernames.filter(x => x !== username)]);
    })

    this.hubConnection.on('GetOnlineUsers', (usernames: string[]) => {
        console.log('GetOnlineUsers '+usernames)
        this.onlineUsersSource.next(usernames);
      })
    })

    this.hubConnection.on('NewMessageReceived', ({username, knownAs}) => {
      this.toastr.info(knownAs + ' has sent you a new message!')
        .onTap.pipe(take(1))
        .subscribe(() => {
          this.router.navigateByUrl(`/members/${username}?tab=3`)
        });
    })
  }

  stopHubConnection(){
    if(this.hubConnection){
      this.hubConnection.stop().catch(error => console.error(error));
    }
  }
}
