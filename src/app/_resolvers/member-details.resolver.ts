import { Observable } from 'rxjs';
import { MembersService } from 'src/app/_services/members.service';
import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve } from "@angular/router";
import { Member } from "../_models/member";

@Injectable({
  providedIn: 'root'
})

export class MemberDetailsResolver implements Resolve<Member> {
  constructor(private membersService: MembersService) {}

  resolve(route: ActivatedRouteSnapshot) : Observable<Member> {
    return this.membersService.getMember(route.paramMap.get('username'));
  }
}
