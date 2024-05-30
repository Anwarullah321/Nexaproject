//login.component.ts
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginObj = {
    email: '',
    password: ''
  };
  signupUsers: any[] = []; // Initialize as an empty array

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit(): void {
   
  }

  onLogin() {
    console.log('Sending login request with:', this.loginObj);
    this.http.post('http://localhost:8080/api/login', this.loginObj).subscribe(
      (response: any) => {
        console.log('Received response:', response);
        if (response.status === 'success') {
          // Assuming the response includes a user role and an ID
          const userId = response.userID;
          const userRole = response.role; // Assuming the backend sends back the role
          const token = response.token; // Extract the token from the response
         
          // Store the token in localStorage
          localStorage.setItem('token', token);
          
          if (userRole === 'internal' || userRole === 'external') {
            console.log('Navigating to admin page');
            localStorage.setItem('userId', userId);
            localStorage.setItem('userEmail', this.loginObj.email);
            if (userRole === 'internal') {
              console.log('Navigating to internal welcome page');
              this.router.navigate(['/internalwelcome']);
            } else if (userRole === 'external') {
              console.log('Navigating to welcome page');
              localStorage.setItem('externaluser', this.loginObj.email);
              this.router.navigate(['/welcome']);
            }
          } else if (userRole === 'admin') {
            this.router.navigate(['/admin']);
          }
        } else {
          alert('Invalid credentials or user not found.');
        }
      },
      (error) => {
        console.error('Error during login:', error);
        alert('Error during login. Please try again.');
      }
    );
 }
  
  
  
  private generateUniqueUserId(): string {
    // Implement a method to generate a unique ID for each user
    // This could be a UUID, a combination of the user's email and a timestamp, etc.
    // For simplicity, we'll use a random string here
    return Math.random().toString(36).substring(2,  15) + Math.random().toString(36).substring(2,  15);
  }
}
