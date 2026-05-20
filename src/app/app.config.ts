import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideNzI18n, ru_RU } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import ru from '@angular/common/locales/ru';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import {
  UserOutline,
  MailOutline,
  PlusOutline,
  EditOutline,
  DeleteOutline,
  EyeOutline,
  ArrowLeftOutline,
  SearchOutline,
  PhoneOutline,
  GlobalOutline,
  HomeOutline,
  BankOutline,
} from '@ant-design/icons-angular/icons';

import { routes } from './app.routes';

registerLocaleData(ru);

const icons = [
  UserOutline,
  MailOutline,
  PlusOutline,
  EditOutline,
  DeleteOutline,
  EyeOutline,
  ArrowLeftOutline,
  SearchOutline,
  PhoneOutline,
  GlobalOutline,
  HomeOutline,
  BankOutline,
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withFetch()),
    provideAnimationsAsync(),
    provideNzI18n(ru_RU),
    provideNzIcons(icons),
  ],
};
