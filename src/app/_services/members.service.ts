import { AccountService } from './account.service';
import { UserParams } from './../_models/userParams';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Member } from '../_models/member';
import { User } from '../_models/user';
import { PaginationService } from './pagination.service';

@Injectable({
  providedIn: 'root'
})
export class MembersService {
  baseUrl = environment.apiUrl;
  members: Member[] = [];
  memberCache = new Map();
  user: User;
  userParams: UserParams;

  constructor(private http: HttpClient, private accountService: AccountService, private paginationService: PaginationService) {
    this.accountService.currentUser$.pipe(take(1)).subscribe(user => {
      this.user = user;
      this.userParams = new UserParams(user);
    })
  }

  getUserParams(){
    return this.userParams;
  }

  setUserparams(params: UserParams){
    this.userParams = params;
  }

  resetUserParams(){
    this.userParams = new UserParams(this.user);
    return this.userParams;
  }

  getMembers(userParams: UserParams){
    const memberCacheKey = Object.values(userParams).join('-');
    var response = this.memberCache.get(memberCacheKey)
    if(response){
      return of(response);
    }

    let params = this.paginationService.getPaginationHeaders(userParams.pageNumber, userParams.pageSize);

    params = params.append('minAge', userParams.minAge.toString());
    params = params.append('maxAge', userParams.maxAge.toString());
    params = params.append('gender', userParams.gender);
    params = params.append('orderBy', userParams.orderBy)

    return this.paginationService.getPaginatedResult<Member[]>(`${this.baseUrl}users`, params).pipe(
      map(response => {
        this.memberCache.set(memberCacheKey, response)
        return response;
      }))
  }

  getMember(username: string){
    const member = [...this.memberCache.values()]
      .reduce((arr, elem) => arr.concat(elem.result), [])
      .find((member: Member) => member.username === username);

    if (member) return of(member);
    return this.http.get<Member>(`${this.baseUrl}users/${username}`);
  }

  updateMember(member: Member){
    return this.http.put(`${this.baseUrl}users`, member).pipe(
      map(() => {
        const index = this.members.indexOf(member);
        this.members[index] = member;
      })
    );
  }

  setMainPhoto(photoId: number){
    return this.http.put(`${this.baseUrl}users/set-main-photo/${photoId}`, {});
  }

  deletePhoto(photoId: number){
    return this.http.delete(`${this.baseUrl}users/delete-photo/${photoId}`);
  }

  addLike(username: string){
    return this.http.post(`${this.baseUrl}likes/${username}`, {});
  }

  getLikes(predicate: string, pageNumber: number, pageSize: number){
    let params = this.paginationService.getPaginationHeaders(pageNumber, pageSize)
    params = params.append('predicate', predicate)
    return this.paginationService.getPaginatedResult<Partial<Member[]>>(`${this.baseUrl}likes`, params);
  }
}
