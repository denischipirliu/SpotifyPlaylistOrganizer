import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Callback } from './callback/callback';

export const routes: Routes = [
  {
    path: '',
    component: Home,
  },
  {
    path: 'callback',
    component: Callback,
  },
];
