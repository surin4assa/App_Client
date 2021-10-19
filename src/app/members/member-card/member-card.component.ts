import { PresenceService } from './../../_services/presence.service';
import { ToastrService } from 'ngx-toastr';
import { Component, Input, OnInit } from '@angular/core';
import { Member } from 'src/app/_models/member';
import { MembersService } from 'src/app/_services/members.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-member-card',
  templateUrl: './member-card.component.html',
  styleUrls: ['./member-card.component.css'],
})
export class MemberCardComponent implements OnInit {
  @Input() member: Member;
  constructor(private memberService: MembersService, private toastr: ToastrService,
    public presence: PresenceService) {}

  ngOnInit(): void {
  }

  addLikes(member: Member){
    this.memberService.addLike(member.username).pipe(take(1)).subscribe(() => {
      this.toastr.success('You have liked ' + member.knownAs);
    })
  }

}
