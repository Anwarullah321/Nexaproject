// user.component.ts

import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {
  userForm: FormGroup = this.formBuilder.group({ // Provide a default value
    email: '',
    password: '',
    role: 'external' // Default role
  });

  
  constructor(private formBuilder: FormBuilder, private router: Router, private http: HttpClient) {} 

  ngOnInit() {
   
  }
 // user.component.ts

createUser() {
  const userData = this.userForm.value;
  const apiUrl = 'http://localhost:8080/api/adminUser/create'; // Your API endpoint
 
  this.http.post(apiUrl, userData).subscribe(
     (response) => {
       console.log('User created successfully:', response);
       this.userForm.reset();
       this.router.navigate(['/admin']);
     },
     (error) => {
       console.error('Error creating user:', error);
     }
  );
 }
 
  
  
}
