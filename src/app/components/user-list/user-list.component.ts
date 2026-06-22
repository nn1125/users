import { CommonModule } from '@angular/common';
import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { NzTableModule } from 'ng-zorro-antd/table';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';

import { User } from '../../models/user.model';
import { UserStoreService } from '../../services/user-store.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    NzTableModule,
    NzInputModule,
    NzButtonModule,
    NzIconModule,
    NzPopconfirmModule,
    NzSpinModule,
    NzEmptyModule,
    NzToolTipModule,
    NzPaginationModule,
  ],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss',
})
export class UserListComponent {
  private readonly store = inject(UserStoreService);
  private readonly message = inject(NzMessageService);
  private readonly router = inject(Router);

  readonly loading = this.store.loading;
  readonly search = signal('');
  readonly pageIndex = signal(1);
  readonly pageSize = signal(5);
  readonly isMobile = signal(this.readIsMobile());

  readonly filtered = computed<User[]>(() => {
    const term = this.search().trim().toLowerCase();
    const users = this.store.users();
    if (!term) {
      return users;
    }
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term),
    );
  });

  readonly total = computed(() => this.filtered().length);

  // Текущая страница для карточек на мобильных (таблица пагинирует сама)
  readonly paged = computed<User[]>(() => {
    const start = (this.pageIndex() - 1) * this.pageSize();
    return this.filtered().slice(start, start + this.pageSize());
  });

  private readIsMobile(): boolean {
    return typeof window !== 'undefined' && window.innerWidth < 768;
  }

  @HostListener('window:resize')
  onResize(): void {
    this.isMobile.set(this.readIsMobile());
  }

  constructor() {
    if (!this.store.loaded()) {
      this.store.loadUsers().subscribe({
        error: () => this.message.error('Не удалось загрузить пользователей'),
      });
    }
  }

  onSearchChange(value: string): void {
    this.search.set(value);
    this.pageIndex.set(1);
  }

  trackById = (_: number, user: User) => user.id;

  deleteUser(user: User): void {
    this.store.deleteUser(user.id).subscribe({
      next: () => this.message.success(`Пользователь "${user.name}" удалён`),
      error: () => this.message.error('Ошибка удаления'),
    });
  }

  goToCreate(): void {
    this.router.navigate(['/users/new']);
  }
}
