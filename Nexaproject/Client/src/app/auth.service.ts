//auth.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from './user/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);

  constructor() {
    // You would typically initialize the current user when the application starts
    this.initializeCurrentUser();
  }

  private initializeCurrentUser() {
    // Perform logic to fetch the current user details
    const currentUser: User | null = this.getCurrentUserFromStorage();
    this.currentUserSubject.next(currentUser);
  }

  private getCurrentUserFromStorage(): User | null {
    // Perform logic to fetch the current user from local storage or wherever it's stored
    // Return null if the user is not logged in
    // Example:
    const userJson = localStorage.getItem('currentUser');
    return userJson ? JSON.parse(userJson) : null;
  }

  getCurrentUser(): Observable<User | null> {
    return this.currentUserSubject.asObservable();
  }

  setCurrentUser(user: User) {
    // Perform logic to set the current user
    // Example:
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }
}


