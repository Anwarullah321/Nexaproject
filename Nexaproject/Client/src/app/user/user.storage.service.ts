import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  createUser(user: { email: string, password: string }) {
    // Add logic to create user with email and password
    console.log('Creating user:', user);
  }
}
