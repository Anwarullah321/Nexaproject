// admin.component.ts

import { Component } from '@angular/core';
import { User } from '../user/user.model';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { UserComponent } from '../user/user.component';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent {
  users: User[] = [];
  selectedUser: User | null = null; // Add this property
  showUpdateForm = false; // 
  searchEmail: string = '';

  constructor(private dialog: MatDialog, private router: Router, private http: HttpClient) {
    
    this.loadUsers();
  }
  logout() {
    // Clear user data from local storage
    //localStorage.clear();
 
    this.router.navigate(['/login']); 
 }
 // admin.component.ts

filterUsersByEmail() {
  if (this.searchEmail) {
     this.users = this.users.filter(user => user.email.toLowerCase().includes(this.searchEmail.toLowerCase()));
  } else {
     // If the search input is empty, reload the users to show all users
     this.loadUsers();
  }
 }
 
  openCreateUserDialog() {
    const dialogRef = this.dialog.open(UserComponent, {
       width: '400px',
       data: {} // Pass any data you need to the dialog here
    });
   
    dialogRef.afterClosed().subscribe(result => {
       console.log('The dialog was closed');
       // Handle the result of the dialog here, e.g., refresh the user list
       this.loadUsers();
    });
   }
   
  cancelUpdate() {
    this.selectedUser = null;
    this.showUpdateForm = false;
 }

loadUsers() {
  const apiUrl = 'http://localhost:8080/api/adminUser/getAll'; // Your API endpoint
 
  this.http.get<User[]>(apiUrl).subscribe(
     (userData) => {
      console.log('Fetched user data:', userData);
       this.users = userData;
     },
     (error) => {
       console.error('Error fetching user data:', error);
     }
  );
 }
 


  selectUserForUpdate(user: User) {
    this.selectedUser = { ...user }; // Create a copy of the user object
    console.log('Selected user ID:', this.selectedUser._id); 
    this.showUpdateForm = true;
  }
  updateUser() {
    if (this.selectedUser) {
       const userId = this.selectedUser._id;
       const apiUrl = `http://localhost:8080/api/adminUser/modify/${userId}`;
   
       // Prepare the updated user data
       const updatedUserData = {
         // Include all fields that can be updated
         email: this.selectedUser.email,
      //   role: this.selectedUser.role,
         // Add any other fields that can be updated
       };
   
       // Send the PUT request
       this.http.put(apiUrl, updatedUserData).subscribe(
         (response) => {
           console.log('User updated successfully:', response);
           // Optionally, refresh the user list
           this.loadUsers();
           this.selectedUser = null;
           this.showUpdateForm = false;
         },
         (error) => {
           console.error('Error updating user:', error);
         }
       );
    }
   }
   
   deleteUser(_id: string) {
    if (!_id) {
       console.error('User ID is undefined. Cannot delete user.');
       return;
    }
   
    // Confirm the action
    if (confirm('Are you sure you want to delete this user?')) {
       // Construct the API URL with the specific user ID
       const apiUrl = `http://localhost:8080/api/adminUser/delete/${_id}`;
   
       // Send the DELETE request
       this.http.delete(apiUrl).subscribe(
         (response) => {
           console.log('User deleted successfully:', response);
           // Refresh the list of users
           this.loadUsers();
         },
         (error) => {
           console.error('Error deleting user:', error);
         }
       );
    }
   }
   
}
