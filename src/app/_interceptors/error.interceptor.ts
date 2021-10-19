import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { NavigationExtras, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(private router: Router, private toastr: ToastrService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError(error => {
        //error = JSON.parse(error)

        if (error){
          switch (error.status) {
            case 400:
              if (typeof(error.error) === 'object'){
                if(error.error.errors){
                  const modalStateErrors = [];
                  for(const key in error.error.errors){
                    if(error.error.errors[key]){
                      modalStateErrors.push(error.error.errors[key]);
                    }
                  }
                  throw modalStateErrors.flat();
                }
                else{
                  this.toastr.error(error.error.title, error.status);
                }
              }
              else {
                // var ers = JSON.parse(error.error)
                // if (Array.isArray(ers)){
                //   for(var e of ers){
                //     this.toastr.error(e, error.status);
                //   }
                // } else
                  this.toastr.error(error.error, error.status);
              }
              break;
            case 401:
              if(error.error.title)
                this.toastr.error(error.error.title, error.status);
              else
                this.toastr.error(error.error, error.status);
              break;
            case 404:
              this.router.navigateByUrl("/not-found");
              break;
            case 500:
              const navigationExtras: NavigationExtras = {state: {error: error.error}};
              this.router.navigateByUrl('/server-error', navigationExtras);
              break;
            default:
              this.toastr.error('Something unexpectedly went wrong. See browser console for more information.');
              console.error(error)
              break;
          }
        }
        return throwError(error);
      })
    );
  }
}
