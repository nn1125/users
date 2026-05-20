import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { catchError, of, tap } from 'rxjs';

import { NzCardModule } from 'ng-zorro-antd/card';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzSpinModule } from 'ng-zorro-antd/spin';

import { UserPayload } from '../../models/user.model';
import { UserStoreService } from '../../services/user-store.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    NzCardModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzIconModule,
    NzGridModule,
    NzDividerModule,
    NzSpinModule,
  ],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.scss',
})
export class UserFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(UserStoreService);
  private readonly api = inject(UserService);
  private readonly message = inject(NzMessageService);
  private readonly router = inject(Router);

  readonly id = input<string | undefined>(undefined);

  readonly numericId = computed(() => {
    const raw = this.id();
    return raw !== undefined ? Number(raw) : undefined;
  });

  readonly isEdit = computed(() => this.numericId() !== undefined);
  readonly loading = signal(false);
  readonly submitting = signal(false);

  readonly form: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    username: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    website: [''],
    address: this.fb.group({
      street: [''],
      suite: [''],
      city: [''],
      zipcode: [''],
    }),
    company: this.fb.group({
      name: [''],
      catchPhrase: [''],
      bs: [''],
    }),
  });

  constructor() {
    queueMicrotask(() => this.initFormValue());
  }

  private initFormValue(): void {
    const id = this.numericId();
    if (id === undefined || Number.isNaN(id)) {
      return;
    }
    const cached = this.store.getUserById(id);
    if (cached) {
      this.form.patchValue(cached);
      return;
    }
    this.loading.set(true);
    this.api
      .getUser(id)
      .pipe(
        tap((u) => {
          this.form.patchValue(u);
          this.loading.set(false);
        }),
        catchError(() => {
          this.message.error('Не удалось загрузить пользователя');
          this.loading.set(false);
          this.router.navigate(['/users']);
          return of(null);
        }),
      )
      .subscribe();
  }

  submit(): void {
    if (this.form.invalid) {
      Object.values(this.form.controls).forEach((c) => {
        c.markAsDirty();
        c.updateValueAndValidity({ onlySelf: true });
      });
      this.message.warning('Проверьте корректность заполнения формы');
      return;
    }

    const payload = this.form.getRawValue() as UserPayload;
    const id = this.numericId();
    this.submitting.set(true);
    const request$ =
      id !== undefined
        ? this.store.updateUser(id, payload)
        : this.store.createUser(payload);

    request$.subscribe({
      next: () => {
        this.submitting.set(false);
        this.message.success(
          id !== undefined ? 'Пользователь обновлён' : 'Пользователь создан',
        );
        this.router.navigate(['/users']);
      },
      error: () => {
        this.submitting.set(false);
        this.message.error('Произошла ошибка при сохранении');
      },
    });
  }

  reset(): void {
    this.form.reset();
  }
}
