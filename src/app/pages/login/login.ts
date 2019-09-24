import {Component} from '@angular/core';
import {NgForm} from '@angular/forms';
import {Router} from '@angular/router';

import {UserData} from '../../providers/user-data';

import {UserOptions} from '../../interfaces/user-options';
import {KeycloakAuthService} from '../../../../dist/cmotion/ionic-keycloak-auth';


@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
  styleUrls: ['./login.scss'],
})
export class LoginPage {
  login: UserOptions = {username: '', password: ''};
  submitted = false;

  constructor(
    public userData: UserData,
    public router: Router,
    public keycloakAuthService: KeycloakAuthService,
  ) {
  }

  async keycloakLogin(isLogin: boolean) {
    await this.keycloakAuthService.login(isLogin, this.router.url);
    this.keycloakAuthService.user()
      .subscribe(async user => {
        if (user) {
          await this.userData.login(user.name);
          await this.router.navigateByUrl('/app/tabs/schedule');
        }
      });
  }

  onLogin(form: NgForm) {
    this.submitted = true;

    if (form.valid) {


    }
  }

  onSignup() {
    this.router.navigateByUrl('/signup');
  }
}
