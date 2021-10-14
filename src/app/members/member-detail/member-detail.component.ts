import { AccountService } from './../../_services/account.service';
import { PresenceService } from './../../_services/presence.service';
import { MessageService } from './../../_services/message.service';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxGalleryAnimation, NgxGalleryImage, NgxGalleryOptions } from '@kolkov/ngx-gallery';
import { TabDirective, TabsetComponent } from 'ngx-bootstrap/tabs';
import { Member } from 'src/app/_models/member';
import { Message } from 'src/app/_models/message';
import { take } from 'rxjs/operators';
import { User } from 'src/app/_models/user';

@Component({
  selector: 'app-member-detail',
  templateUrl: './member-detail.component.html',
  styleUrls: ['./member-detail.component.css']
})
export class MemberDetailComponent implements OnInit, OnDestroy {
  @ViewChild('memberTabs', {static: true}) memberTabs: TabsetComponent;
  member: Member;
  galleryOptions: NgxGalleryOptions[] = [];
  galleryImages: NgxGalleryImage[] = [];
  activeTab: TabDirective;
  messages: Message[] = [];
  user: User;

  constructor(private route: ActivatedRoute, private messageService: MessageService,
    public presence: PresenceService, private accountService: AccountService, private router: Router) {
      this.accountService.currentUser$.pipe(take(1)).subscribe(user => this.user = user)
  }

  ngOnInit(): void {
    this.route.data.subscribe(data => {
      this.member = data.member;
    })

    this.route.queryParams.subscribe(params => {
      params.tab ? this.selectTab(params.tab) : this.selectTab(0);
    })

    this.galleryOptions = [
      {
        width: '500px',
        height: '500px',
        imagePercent: 100,
        thumbnailsColumns: 4,
        imageAnimation: NgxGalleryAnimation.Fade,
        preview: false
      }
    ]
    this.galleryImages = this.getImages();
  }

  getImages(): NgxGalleryImage[] {
    const imageUrls = [];
    for (const photo of this.member.photos) {
      imageUrls.push({
        small: photo?.url == undefined ? './assets/user.png' : photo.url,
        medium: photo?.url == undefined ? './assets/user.png' : photo.url,
        big: photo?.url == undefined ? './assets/user.png' : photo.url,
      })
    }

    return imageUrls;
  }

  loadMessages(){
    this.messageService.getMessageThread(this.member.username).subscribe(messages => {
      this.messages = messages;
    })
  }

  selectTab(tabId: number){
    this.memberTabs.tabs[tabId].active = true;
  }

  onTabActivated(data: TabDirective, tabId: number){
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: tabId }
    });
    this.activeTab = data;
    if(this.activeTab.heading == 'Messages' && this.messages.length === 0){
      this.messageService.createHubConnection(this.user, this.member.username)

    } else {
      this.messageService.stopHubConnection();
    }
  }

  ngOnDestroy(): void {
    this.messageService.stopHubConnection();
  }

}
