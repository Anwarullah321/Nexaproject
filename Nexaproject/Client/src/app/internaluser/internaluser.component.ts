//internalwelcome.component.ts(internal user)
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, map, tap, throwError } from 'rxjs';
interface FileData {
  name: string;
  type: string;
  lastModified: number;
  size: number;
  data: File;
  submitted: boolean;
  userId: string; // Add a property for the user ID
  documentName?: string; // Add this line
  internalUserName?: string;
  status: string;
  submittedByEmail: string;
  submittedToEmails: string[];
  publicId: string; 
}
@Component({
  selector: 'app-internaluser',
  templateUrl: './internaluser.component.html',
  styleUrls: ['./internaluser.component.css']
})
export class InternalwelcomeComponent {
    files: FileList | null = null;
    uploadedFiles: any[] = [];
    submittedFiles: any[] = [];
    isSubmitted = false;
    userId: string; 
    allFiles: FileData[] = [];
    documentName: string = '';
    externalUserName: string = '';
    showModal: boolean = false;
    selectedExternalUsers: string[] = []; // Define selectedExternalUsers property
    externalUsers: { email: string }[] = []; // Define externalUsers property
    emailFilter: string = '';
    filteredFiles: FileData[] = [];
    showAllFiles = false;
    allFilesFetched = false; 
    userEmail: string = '';
    constructor(private cdr: ChangeDetectorRef, private router: Router, private http: HttpClient) {
      this.userId = localStorage.getItem('userId') || 'defaultUserId';
      console.log('User ID:', this.userId);
      
    }

    logout() {
      // Clear user data from local storage
      //localStorage.clear();
   
      this.router.navigate(['/login']); 
   }
    
    filterFilesByEmail() {
      console.log('Filtering files by email:', this.emailFilter);
     
      // If emailFilter is empty or being cleared, reset the allFiles and submittedFiles to their original unfiltered state
      if (!this.emailFilter ) {
         // Reset to the original unfiltered state
         this.fetchAllFiles().subscribe(() => {
          // After fetching all files, update the submittedFiles array
          this.updateSubmittedFiles();
          // Optionally, trigger change detection to ensure the view updates
          this.cdr.detectChanges();
        });
         this.allFiles = this.allFiles.filter(file => file.submitted); // Assuming you want to keep only submitted files
         this.submittedFiles = this.allFiles;
         console.log('Email filter cleared. Displaying all files.');
      } else {
         // Filter allFiles based on the emailFilter
         this.allFiles = this.allFiles.filter(file => {
           return file.submitted && // Ensure files are submitted
             file.submittedToEmails.some(email => {
              const remainingEmail = email.split('@')[0]; // Extract the part before '@'
              return remainingEmail.includes(this.emailFilter);
             });
         });
     
         // Update submittedFiles based on the filtered allFiles
         this.submittedFiles = this.allFiles;
     
         console.log('Filtered submittedFiles:', this.submittedFiles);
         console.log('Filtered allFiles:', this.allFiles);
      }
    }
     
    
      
     
     

    getStatusColor(status: string): string {
      switch (status) {
         case 'New':
           return '#007bff'; // Light blue for "New"
         case 'Approved':
           return '#28a745'; // Green for "Approve"
         case 'Rejected':
           return '#dc3545'; // Red for "Reject"
         default:
           return '#6c757d'; // A neutral grey for default or unrecognized statuses
      }
     }
     

     
    onSubmitClick() {
      console.log('Submit button clicked');
      console.log('External User Name:', this.externalUserName); 
      
      // Assuming the document name is the name of the first uploaded file
      if (this.uploadedFiles.length >  0) {
        this.documentName = this.uploadedFiles[0].name;
        console.log('Document name:', this.documentName);
      }
      this.showModal = true;
    }
    ngOnInit() {
      this.loadSubmittedFiles();
      this.getExternalUsers(); 
      console.log(this.allFiles);
      //this.viewAllFiles();
      this.fetchExternalUserEmails();
      this.fetchAllFiles().subscribe(() => {
        // After fetching all files, update the submittedFiles array
        this.updateSubmittedFiles();
        // Optionally, trigger change detection to ensure the view updates
        this.cdr.detectChanges();
     });
     this.fetchInternalUserEmail().subscribe(
      (response: any) => {
        console.log('API Response:', response); 
        console.log("UserEmail: ",response.submittedByEmail);
        // Assuming the response contains the email in a property named 'email'
        this.userEmail = response.submittedByEmail;
        this.cdr.detectChanges(); 
      },
      error => {
        console.error('Error fetching internal user email:', error);
      }
    );
    }
    getExternalUsers() {
      const signUpUsers = JSON.parse(localStorage.getItem('signUpUsers') || '[]');
      this.externalUsers = signUpUsers.filter((user: { role: string }) => user.role === 'external');

      console.log('External Users:', this.externalUsers);
    }
    cancel() {
      // Reset form or close modal
      this.showModal = false;
      
      // Reset other form fields as needed
     }
     
// Add this method to your internalwelcome.component.ts
fetchExternalUserEmails() {
  this.http.get('http://localhost:8080/api/internalUser/getAllExternalUserEmails').subscribe(
     (response: any) => {
       // Check if the response is an array and contains objects with an 'email' property
       
       if (Array.isArray(response) && response.every(item => item.hasOwnProperty('email'))) {
        
         this.externalUsers = response.map((user: { email: string }) => ({ email: user.email }));
         //this.externalUserName = this.externalUsers.map(user => user.email).join(', ');
       } else {
         console.log('Unexpected response structure.');
       }
     },
     error => {
       console.error('Error fetching external user emails:', error);
     }
  );
 }
 
 
 
 


    onFileSelected(event: Event) {
      console.log('onFileSelected called');
      const target = event.target as HTMLInputElement;
      this.files = target.files;
      if (this.files) {
        this.uploadedFiles = Array.from(this.files).map(file => ({
          name: file.name,
          type: file.type,
          lastModified: file.lastModified,
          size: file.size,
          data: file,
          submitted: true,
          userId: this.userId,
          status: 'New',
          submittedToEmails: [],
        
        }));
        
        console.log('Uploaded files:', this.uploadedFiles, ); 
        
      }
      this.cdr.detectChanges();
    }
  
    updateSubmittedFiles() {
      // Filter allFiles to include only those files that are considered "submitted"
      this.submittedFiles = this.allFiles.filter(file => file.submitted);
      
      console.log('Updated submittedFiles:', this.submittedFiles);
      // Trigger change detection to update the view
      this.cdr.detectChanges();
      
     }

     fetchAllFiles(): Observable<any> {
      const token = localStorage.getItem('token'); // Adjust this line based on how you store the token
      console.log('token in fetchallfiles: ',token);
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
console.log('headers in fetchallfiles: ',headers);
      return this.http.get('http://localhost:8080/api/internalUser/getAllFiles', { headers }).pipe(
         tap((response: any) => {
           console.log('Response:', response);
           // Check if the response contains a 'data' array
           if (response.data && Array.isArray(response.data)) {
             // Map the response to the FileData interface
             this.allFiles = response.data.map((file: any) => ({
               name: file.fileName,
               type: 'application/pdf',
               lastModified: new Date().getTime(),
               size: 0,
               data: file.pdfUrl,
               submitted: true,
               userId: this.userId,
               documentName: file.fileName,
               internalUserName: '',
               status: file.status || 'New',
               submittedByEmail: '',
               submittedToEmails: file.submittedToEmails || [],
               publicId: file.publicId 
             }));
             console.log('All Files:', this.allFiles);
             // Trigger change detection to update the view
            this.updateSubmittedFiles();
             this.cdr.detectChanges();
           } else {
             console.log('Unexpected response structure.');
             // Handle the unexpected response structure here
             // For example, you might want to display an error message to the user
           }
         },
           error => {
             console.error('Error fetching all files:', error);
           })
       );
     }

     fetchInternalUserEmail(): Observable<any> {
      // Assuming `token` is the JWT token obtained from the server
      // You need to obtain the token from wherever it's stored (e.g., localStorage)
      const token = localStorage.getItem('token'); // Adjust this line based on how you store the token
      console.log('Token being used:', token); 

      if (!token) {
        console.error('Missing token for internal user email request.');
        return throwError('Missing token'); // Handle missing token gracefully
      }
      // Set the Authorization header with the token
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
     
      // Make the HTTP GET request with the headers
      return this.http.get<any>('http://localhost:8080/api/internalUser/getEmail', { headers });
     }
     


    submitFiles(documentName: string, externalUserName: string) {
      console.log('external user are: ', externalUserName);
    //  const userEmail = this.getUserEmail(this.userId);
      //console.log("useremail and userid: ", userEmail, this.userId);

      if (!this.uploadedFiles || this.uploadedFiles.length === 0) {
        alert('Please select a document before submitting.');
        return;
      }
      // Check if externalUserName is provided and not just whitespace
      if (!externalUserName || externalUserName.trim().length === 0) {
         alert('Please select email before submitting the file.');
         return; // Exit the method if the external user name is not provided or is just whitespace
      }
     
      // Assuming externalUserName is a string of emails separated by commas
      const externalUserEmails = externalUserName.split(',').map(email => email.trim());
     
      this.fetchInternalUserEmail().subscribe(
        (response: any) => {
           console.log("Fetched user email response: ", response);
           const userEmail = response.submittedByEmail; // Extract the email address from the response
           console.log("Fetched user email: ", userEmail);

      // Filter out any files that have already been submitted to the same external user
      const newFiles = this.uploadedFiles.filter(file => {
         // Check if the file has already been submitted to any of the selected external users
         const alreadySubmittedToExternalUser = externalUserEmails.some(externalUserEmail => {
           return this.submittedFiles.some(f => f.name === file.name && f.userId === file.userId && f.submittedToEmails.includes(externalUserEmail));
         });
         return !alreadySubmittedToExternalUser;
      });
     
      if (newFiles.length > 0) {
         const formData = new FormData();
         newFiles.forEach((file: FileData, index) => {
           file.documentName = documentName;
           file.internalUserName = userEmail;
           file.submittedByEmail = userEmail;
           
           file.submittedToEmails = externalUserEmails;
           console.log("submittedtoemails is: ", file.submittedToEmails);
           // Append each file to the FormData object with the field name 'file'
           formData.append('name', documentName);
           formData.append('submittedToEmails', JSON.stringify(externalUserEmails));
           formData.append('internalUserEmail', userEmail);
           formData.append('file', file.data, file.name);
           
           
         });
     
         const token = localStorage.getItem('token'); // Adjust this line based on how you store the token
         const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
         console.log('headers in submitted files: ',headers);
         // Send the FormData object to the server
         this.http.post('http://localhost:8080/api/internalUser/uploadFile', formData,
          { headers }).subscribe(
           (response: any) => {

             console.log('Files uploaded successfully:', response);
             // Update the submittedFiles array to include the new files
            // this.submittedFiles.push(...newFiles);
             // Clear the uploadedFiles array
             this.uploadedFiles = [];
             // Indicate that the files have been submitted
             this.isSubmitted = true;
             if (response.data && Array.isArray(response.data)) {
              response.data.forEach((uploadedFile: any) => {
                // Extract publicId from the data array
                const publicId = uploadedFile.public_id;
                const newFile: FileData = {
                  name: documentName, // Assuming documentName is the name of the file
                  type: 'application/pdf', // Adjust as necessary
                  lastModified: new Date().getTime(), // Adjust as necessary
                  size: 0, // Adjust as necessary
                  data: uploadedFile.pdfUrl, // Assuming pdfUrl is the URL of the uploaded file
                  submitted: true,
                  userId: this.userId,
                  documentName: documentName,
                  internalUserName: '', // Adjust as necessary
                  status: 'New', // Adjust as necessary
                  submittedByEmail: userEmail, // Assuming userEmail is the email of the user who submitted the file
                  submittedToEmails: externalUserEmails, // Assuming externalUserEmails is an array of emails
                  publicId: publicId,
                };
                // Add the new file to the allFiles array
                console.log("newfile: ",newFile);
                this.allFiles.push(newFile);
              });
            }
              // Update the allFiles array with the newly submitted files
      //this.allFiles.push(...newFiles);
              // Manually trigger change detection to update the view
        this.cdr.detectChanges();
           },
           error => {
             console.error('Error uploading files:', error);
           }
         );
      }
     }, error => {
      console.error('Error fetching internal user email:', error);
    }
 );
}
     
     
   
     
     
     

    private getUserEmail(userId: string): string {
      const allUserData = JSON.parse(localStorage.getItem('signUpUsers') || '[]');
      console.log("signUpUsers:", allUserData);
    
      const user = allUserData.find((user: any) => {
        console.log("Checking user:", user);
        console.log("userId:", user.userId);
        return user.id === parseInt(userId);
      });
    
      console.log("user is :", user);
      if (user) {
        return user.email || 'Email not found';
      } else {
        return 'Email not found';
      }
    }
    


    
      viewAllFiles() {
        this.showAllFiles = !this.showAllFiles;
        console.log('Show all files:', this.showAllFiles);
       this.cdr.detectChanges();
       }
       
    

  
  private loadSubmittedFiles() {
    const userFilesKey = `userFiles_${this.userId}`;
    console.log("Attempting to load submitted files with key: ", userFilesKey);
    const storedFiles = localStorage.getItem(userFilesKey);
    console.log("Retrieved data: ",storedFiles);
    //const storedFiles = localStorage.getItem('submittedFiles');
    console.log("data is loaded", storedFiles);
    if (storedFiles) {
        try {
          const allFiles: FileData[] = JSON.parse(storedFiles);
          console.log("Loaded allFiles:", allFiles); // Ensure this logs the expected data
          const userSpecificFiles = allFiles.filter(file => file.userId === this.userId);
          console.log(this.allFiles);
          this.submittedFiles = [...userSpecificFiles]; //.filter((file: FileData) => file.userId === this.userId);
          this.allFiles = allFiles; 
          console.log('Filtered submittedFiles length:', this.submittedFiles.length);
      console.log('Filtered submittedFiles:', this.submittedFiles);
          
         
          this.cdr.detectChanges();  
        } catch (error) {
            console.error('Error loading submitted files:', error);
            // Handle the error, e.g., by setting submittedFiles to an empty array
          //  this.submittedFiles = [];
          }
    }
  }


  deleteFile(file: FileData) {
    // Assuming file.publicId is the property that holds the public ID of the file
    const publicId = file.publicId;
    if (!publicId) {
       console.error('Public ID not found for the file. Cannot delete.');
       return;
    }
   
    // Construct the URL for the delete request
    const deleteUrl = `http://localhost:8080/api/internalUser/delete/${publicId}`;
   
    // Send the DELETE request to the server
    this.http.delete(deleteUrl).subscribe(
       (response: any) => {
         console.log('File deleted successfully:', response);
         // Remove the file from the allFiles array
         const index = this.allFiles.findIndex(file => file.publicId === publicId);
       //  const index = this.allFiles.indexOf(file);
         if (index !== -1) {
           this.allFiles.splice(index, 1);
           console.log('Removed from allFiles');
         }
         // Remove the file from the submittedFiles array if it exists there
 const indexInSubmittedFiles = this.submittedFiles.findIndex(f => f.publicId === file.publicId);
 if (indexInSubmittedFiles !== -1) {
    this.submittedFiles.splice(indexInSubmittedFiles, 1);
    console.log('Removed from submittedFiles');
 }

 // Optionally, save the updated submittedFiles array to local storage
 //this.saveSubmittedFilesToLocalStorage();
         // Optionally, update the local storage to reflect the deletion
         console.log('Updated submittedFiles:', this.submittedFiles); // Debugging line
         // Trigger change detection to update the view
         this.cdr.markForCheck(); // Mark the component to be checked for changes
         this.cdr.detectChanges();
       },
       error => {
         console.error('Error deleting file:', error);
       }
    );
   }
   

  handleAction(event: Event, file: FileData) {
    const action = (event.target as HTMLSelectElement).value;
    if (action) {
       // Update the file's status based on the selected action
       file.status = action;
   
       // Update the file in localStorage
       const userFilesKey = `userFiles_${this.userId}`;
       let existingUserFiles = JSON.parse(localStorage.getItem(userFilesKey) || '[]');
       const updatedFiles = existingUserFiles.map((f: { name: string; }) => f.name === file.name ? { ...f, status: action } : f);
       localStorage.setItem(userFilesKey, JSON.stringify(updatedFiles));
   
       // Optionally, refresh the view
       this.cdr.detectChanges();
    }
   }
   
  
}

