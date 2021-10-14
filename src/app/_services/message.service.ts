import { Group } from './../_models/group';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { PaginationService } from './pagination.service';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Message } from '../_models/message';
import { User } from '../_models/user';
import { BehaviorSubject } from 'rxjs';
import { take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  hubUrl = environment.hubUrl;
  baseUrl = environment.apiUrl;
  private hubConnection: HubConnection;
  private messageThreadSource = new BehaviorSubject<Message[]>([]);
  messageThread$ = this.messageThreadSource.asObservable();

  constructor(private http: HttpClient, private paginationService: PaginationService) {
  }

  createHubConnection(user: User, otherUsername: string){
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(this.hubUrl + 'message?user=' + otherUsername, {
        accessTokenFactory: () => user.token
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection.start().catch(error => console.error(error));

    this.hubConnection.on('ReceiveMessageThread', messages => {
      this.messageThreadSource.next(messages);
    });

    this.hubConnection.on('NewMessage', message => {
      this.messageThread$.pipe(take(1)).subscribe(messages => {
        this.messageThreadSource.next([...messages, message])
      })
    })

    this.hubConnection.on("UpdatedGroup", (group: Group) => {
      if(group.connections.some(x => x.username == otherUsername)){
        this.messageThread$.pipe(take(1)).subscribe(messages => {
          messages.forEach(message => {
            if(!message.dateRead){
              message.dateRead = new Date(Date.now())
            }
          })
          this.messageThreadSource.next([...messages])
        })
      }
    })
  }

  stopHubConnection(){
    if(this.hubConnection){
      this.hubConnection.stop();
    }
  }
  getMessages(pageNumber: number, pageSize: number, container: string){
    let params = this.paginationService.getPaginationHeaders(pageNumber, pageSize);
    params = params.append('Container', container);
    return this.paginationService.getPaginatedResult<Message[]>(`${this.baseUrl}messages`, params);
  }

  getMessageThread(username: string){
    return this.http.get<Message[]>(`${this.baseUrl}messages/thread/${username}`);
  }

  async sendMessage(username: string, content: string){
    return this.hubConnection.invoke('SendMessage', {recipientUsername: username, content})
      .catch(error => console.error(error));
  }

  deleteMessage(id: number){
    return this.http.delete(`${this.baseUrl}messages/${id}`);
  }
}
