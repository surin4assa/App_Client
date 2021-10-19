import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { FormValidator } from './../../_utils/formValidator';
import { PasswordUpdate } from './../../_models/passwordUpdate';
import { MembersService } from 'src/app/_services/members.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-member-password',
  templateUrl: './member-password.component.html',
  styleUrls: ['./member-password.component.css']
})
export class MemberPasswordComponent implements OnInit {
  passwordUpdateForm: FormGroup;
  //passwordUpdate: PasswordUpdate = {username: "", email: "", currentPassword: "", newPassword: ""}
  formValidator = new FormValidator();
  validationErrors: string[] = [];


  constructor(private membersService: MembersService, private fb: FormBuilder, private toastr: ToastrService, private router: Router) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(){
    this.passwordUpdateForm = this.fb.group ({
      email: ['', [
        Validators.required,
        Validators.email
      ]],
      currentPassword: ['', Validators.required],
      newPassword: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(24),
        this.formValidator.isPasswordRepeat('currentPassword')
      ]],
      confirmPassword: ['', [Validators.required, this.formValidator.matchValues('newPassword')]]
    })

    this.passwordUpdateForm.controls.currentPassword.valueChanges.subscribe(() => {
      this.passwordUpdateForm.controls.newPassword.updateValueAndValidity()
    })
    this.passwordUpdateForm.controls.newPassword.valueChanges.subscribe(() => {
      this.passwordUpdateForm.controls.confirmPassword.updateValueAndValidity()
    })

  }

  changePassword(){
    this.membersService.changePassword(this.passwordUpdateForm.value).pipe(take(1)).subscribe((response) => {
      this.toastr.success('Password updated successfully');
      this.router.navigateByUrl('/members');
    }, errors => {
      this.validationErrors = errors;
    })
  }
}
