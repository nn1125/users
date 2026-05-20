import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'users' },
  {
    path: 'users',
    loadComponent: () =>
      import('./components/user-list/user-list.component').then((m) => m.UserListComponent),
    title: 'Пользователи',
  },
  {
    path: 'users/new',
    loadComponent: () =>
      import('./components/user-form/user-form.component').then((m) => m.UserFormComponent),
    title: 'Новый пользователь',
  },
  {
    path: 'users/:id',
    loadComponent: () =>
      import('./components/user-detail/user-detail.component').then((m) => m.UserDetailComponent),
    title: 'Пользователь',
  },
  {
    path: 'users/:id/edit',
    loadComponent: () =>
      import('./components/user-form/user-form.component').then((m) => m.UserFormComponent),
    title: 'Редактирование пользователя',
  },
  { path: '**', redirectTo: 'users' },
];
