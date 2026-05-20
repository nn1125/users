import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { catchError, of, tap } from 'rxjs';

import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzTagModule } from 'ng-zorro-antd/tag';

import { User } from '../../models/user.model';
import { UserStoreService } from '../../services/user-store.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    NzCardModule,
    NzDescriptionsModule,
    NzButtonModule,
    NzIconModule,
    NzSpinModule,
    NzPopconfirmModule,
    NzResultModule,
    NzTagModule,
  ],
  templateUrl: './user-detail.component.html',
  styleUrl: './user-detail.component.scss',
})
export class UserDetailComponent {
  private readonly store = inject(UserStoreService);
  private readonly api = inject(UserService);
  private readonly message = inject(NzMessageService);
  private readonly router = inject(Router);

  readonly id = input.required<string>();

  private readonly numericId = computed(() => Number(this.id()));

  readonly loading = signal(false);
  readonly error = signal(false);
  private readonly fetched = signal<User | null>(null);

  readonly user = computed<User | null>(() => {
    const fromStore = this.store.getUserById(this.numericId());
    return fromStore ?? this.fetched();
  });

  constructor() {
    queueMicrotask(() => this.load());
  }

  private load(): void {
    const id = this.numericId();
    if (Number.isNaN(id)) {
      this.error.set(true);
      return;
    }
    if (this.store.getUserById(id)) {
      return;
    }
    this.loading.set(true);
    this.error.set(false);
    this.api
      .getUser(id)
      .pipe(
        tap((u) => {
          this.fetched.set(u);
          this.loading.set(false);
        }),
        catchError(() => {
          this.error.set(true);
          this.loading.set(false);
          return of(null);
        }),
      )
      .subscribe();
  }

  deleteUser(): void {
    const user = this.user();
    if (!user) return;
    this.store.deleteUser(user.id).subscribe({
      next: () => {
        this.message.success(`Пользователь "${user.name}" удалён`);
        this.router.navigate(['/users']);
      },
      error: () => this.message.error('Ошибка удаления'),
    });
  }
}
