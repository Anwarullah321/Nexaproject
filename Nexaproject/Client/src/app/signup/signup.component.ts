//singup.component.tt
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  signupUsers: any[] = [];
  signupObj:any ={
    email: '',
    password: ''
  };
  onSignUp(){
    this.signupObj.role = 'admin';
    this.signupUsers.push(this.signupObj);
    localStorage.setItem('signUpUsers',JSON.stringify(this.signupUsers));
    this.signupObj = { email: '', password: '' };
  }


  



}
