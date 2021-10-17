import { ConfirmService } from './../_services/confirm.service';
import { MessageService } from './../_services/message.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Message } from '../_models/message';
import { Pagination } from '../_models/pagination';
@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})
export class MessagesComponent implements OnInit {
  messages: Message[];
  pagination: Pagination;
  container: string = 'Inbox';
  pageNumber: number = 1;
  pageSize: number = 6;
  loading = false;

  constructor(private messageService: MessageService, private confirmService: ConfirmService) { }

  ngOnInit(): void {
    this.loadMessages();
  }

  loadMessages(){
    this.loading = true;
    this.messageService.getMessages(this.pageNumber, this.pageSize, this.container).subscribe(response => {
        this.messages = response.result;
        this.pagination = response.pagination;
        this.loading = false;
    });
  }

  deleteMessage(id: number){
    this.messageService.deleteMessage(id).subscribe(() => {
      this.messages.splice(this.messages.findIndex(m => m.id === id), 1);
    })
  }

  deleteMessages(){
    if(this.messages.every(m => !m.isToDelete)) return; //nothing checked
    this.confirmService.confirm("Confirm delete message", 'This cannot be undone').subscribe(result => {
      if(result){
        for(let message of this.messages){
          if (message.isToDelete){
            this.deleteMessage(message.id);
          }
        }
      }
    })
  }

  pageChanged(event: any){
    this.pageNumber = event.page;
    this.loadMessages();
  }
}
