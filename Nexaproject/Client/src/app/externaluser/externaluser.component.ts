import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
interface FileData {
  fileName: string;
  type: string;
  lastModified: number;
  size: number;
  data: File;
  submitted: boolean;
  userId: string;
  internalUserName?: string;
   status?: string; 
   email: string;
   submittedToEmails: string[];
   statusSet?: boolean;
   publicId?: string;
   
}
@Component({
  selector: 'app-externaluser',
  templateUrl: './externaluser.component.html',
  styleUrls: ['./externaluser.component.css']
})
export class WelcomeComponent {
  searchEmail: string = '';
  files: Array<FileData> = [];
  filteredFiles: Array<FileData> = [];
  
  externalUserEmails: string[]; // Explicitly declare as an array of strings
  loggedInUserEmail!: string;
  constructor(private cdr: ChangeDetectorRef, private router: Router, private http: HttpClient) {
    this.externalUserEmails = JSON.parse(localStorage.getItem('externalUserEmails') || '["defaultEmail@example.com"]');
    console.log('External User Email:', this.externalUserEmails);
  }
  searchFiles() {
    console.log('Searching for files submitted by:', this.searchEmail);
    console.log('All files:', this.files); // Log all files for debugging
    if (this.searchEmail && this.searchEmail.trim() !== '') {
       this.filteredFiles = this.files.filter(file => {
         console.log('Checking file:', file.internalUserName); // Log each file's email for debugging
         return file.internalUserName && file.internalUserName.toLowerCase().includes(this.searchEmail.toLowerCase());
       });
    } else {
       this.filteredFiles = [...this.files];
    }
    console.log('Filtered files:', this.filteredFiles);
   }
   
   
   
   
   
   
  logout() {
    // Clear user data from local storage
    //localStorage.clear();
 
    this.router.navigate(['/login']); 
 }

ngOnInit() {
 const token = localStorage.getItem('token');
 console.log('Token:', token);
 const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
 console.log('headers: ',headers);
 this.http.get<any>('http://localhost:8080/api/external/getAllFiles', { headers }).subscribe(

    (response: any) => {
      console.log('Response:', response);
      if (response && response.data && Array.isArray(response.data)) {
        this.files = response.data.map((file: any) => ({
          fileName: file.fileName,
          type: file.type,
          lastModified: file.lastModified,
          size: file.size,
          data: file.data, // Ensure this is correctly handled
          submitted: file.submitted,
          userId: file.userId,
          internalUserName: file.internalUserName,
          status: file.status,
          email: file.email,
          submittedToEmails: file.submittedToEmails,
          statusSet: file.statusSet,
          publicId: file.publicId, 
        }));
        this.filteredFiles = [...this.files];
        this.cdr.detectChanges();
      } else {
        console.error('API response does not contain a data array:', response);
      }
    },
    error => {
      console.error('Error fetching files:', error);
    }
 );
}

 
 
 
 
 


  
  retrieveAllFiles(isExternalUser: boolean, loggedInUserEmail: string) {
    const keys = Object.keys(localStorage).filter(key => key.startsWith('userFiles_'));
    this.files = [];
   
    keys.forEach(key => {
       const storedFiles = localStorage.getItem(key);
   
       if (storedFiles) {
         try {
           const filesFromStorage = JSON.parse(storedFiles);
   
           const filesForCurrentUser = filesFromStorage.filter((file: FileData) => {
             if (isExternalUser) {
               return file.submittedToEmails && file.submittedToEmails.includes(loggedInUserEmail);
             } else {
               // Existing filtering logic for internal users
               return /* ... existing filtering logic based on submittedToEmails ... */;
             }
           });
   
           console.log(`Files for ${isExternalUser ? 'external' : 'internal'} user from key ${key}:`, filesForCurrentUser.length);
   
           // Process and map files
           filesForCurrentUser.forEach((file: FileData) => {
             // Assuming the structure of this.files is based on the properties you've shown
         
             const processedFile: FileData = {
              fileName: file.fileName,
              type: file.type,
              lastModified: file.lastModified, // Ensure this property is correctly set
              size: file.size, // Ensure this property is correctly set
              data: file.data, // Ensure this property is correctly set
              submitted: file.submitted, // Ensure this property is correctly set
              userId: file.userId, // Ensure this property is correctly set
              internalUserName: file.internalUserName || 'defaultUserName', // Provide a default if not available
              status: file.status || 'defaultStatus', // Provide a default if not available
              email: file.email,
              submittedToEmails: file.submittedToEmails,
              statusSet: file.statusSet || false,
              publicId: file.publicId, // Ensure this property is correctly set
             };
             
             this.files.push(processedFile);
           });
   
         } catch (error) {
           console.error('Error loading files:', error);
         }
       } else {
         console.log(`No files found in localStorage for key ${key}.`);
       }
    });
   
    console.log('Total files for current user:', this.files);
   }
   
  
   approveFile(file: FileData, externalUserEmail: string) {
    console.log('Approving file:', file, externalUserEmail);
    const url = `http://localhost:8080/api/external/approveFile/${file.publicId}`;
   
    // Make the PUT request to update the file status to "approved"
    this.http.put(url, { status: 'approved' }).subscribe(
       response => {
         console.log('File approved successfully:', response);
         // Optionally, update the local state to reflect the change
         // For example, update the file's status in the `files` array
         const index = this.files.findIndex(f => f.publicId === file.publicId? { ...f, status: 'approved', statusSet: true } : f);
        

         this.cdr.detectChanges();
       },
       error => {
         console.error('Error approving file:', error);
       }
    );
   }
   
   rejectFile(file: FileData, externalUserEmail: string) {
    console.log('Rejecting file:', file, externalUserEmail);
    const url = `http://localhost:8080/api/external/rejectFile/${file.publicId}`;
   
    // Make the PUT request to update the file status to "rejected"
    this.http.put(url, { status: 'rejected' }).subscribe(
       response => {
         console.log('File rejected successfully:', response);
         // Optionally, update the local state to reflect the change
         // For example, update the file's status in the `files` array
         const index = this.files.findIndex(f => f.publicId === file.publicId? { ...f, status: 'rejected', statusSet: true } : f);
       
         this.cdr.detectChanges();
       },
       error => {
         console.error('Error rejecting file:', error);
       }
    );
   }
   
   deleteFile(file: FileData) {
    const url = `http://localhost:8080/api/external/delete/${file.publicId}`;
    this.http.delete(url).subscribe(
       response => {
         console.log('File deleted successfully:', response);
         // Remove the file from the local array
         const index = this.files.findIndex(f => f.publicId === file.publicId);
         if (index !== -1) {
           this.files.splice(index, 1);
           // Optionally, update the filteredFiles array if it's being used
           this.filteredFiles = [...this.files];
         }
         this.cdr.detectChanges();
       },
       error => {
         console.error('Error deleting file:', error);
       }
    );
   }
   
   
   

   

}



