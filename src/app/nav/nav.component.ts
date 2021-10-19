import { environment } from './../../environments/environment';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AccountService } from '../_services/account.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {
  model: any = {}
  title = environment.title;

  constructor(public accountService: AccountService, private router: Router, private toastr: ToastrService) { }

  ngOnInit(): void {
  }

  login(){
    for(let i in this.model) {
      this.model[i] = this.model[i].trim();
    }

    this.accountService.login(this.model).subscribe(() => {
      this.router.navigateByUrl('/members')
    }, errors => {
      console.error(errors);
      for(var err in errors){
        if (errors[err].toLowerCase().includes('username') | errors[err].toLowerCase().includes('password'))
          this.toastr.error(errors[err])
      }
    });
  }

  logout(){
    this.accountService.logout();
    this.router.navigateByUrl('/')
  }
}
