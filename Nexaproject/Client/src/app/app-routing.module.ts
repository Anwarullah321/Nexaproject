//app-routing.module.ts
import { Component, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';

import { AdminComponent } from './admin/admin.component';
import { UserComponent } from './user/user.component';
import { InternalwelcomeComponent } from './internaluser/internaluser.component';
import { WelcomeComponent } from './externaluser/externaluser.component';



const routes: Routes = [
  {
 path:'', redirectTo:'login',pathMatch:'full'
  },
  {
    path:'login', component:LoginComponent
  },
  {
    path:'signup', component:SignupComponent
  },
  {
  path:'welcome', component:WelcomeComponent
  },
  {
  path:'admin', component:AdminComponent
  },
  {
  path:'create-user', component:UserComponent
  },
  {
    path: 'internalwelcome',
    component: InternalwelcomeComponent
  }
];

@NgModule({
  declarations: [],
  imports: [
    RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
