import { Injectable, computed, inject, signal } from '@angular/core';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { User, UserPayload } from '../models/user.model';
import { UserService } from './user.service';

@Injectable({ providedIn: 'root' })
export class UserStoreService {
  private readonly api = inject(UserService);

  private readonly _users = signal<User[]>([]);
  private readonly _loading = signal(false);
  private readonly _loaded = signal(false);

  readonly users = computed(() => this._users());
  readonly loading = computed(() => this._loading());
  readonly loaded = computed(() => this._loaded());

  loadUsers(force = false): Observable<User[]> {
    this._loading.set(true);
    return this.api.getUsers().pipe(
      tap({
        next: (users) => {
          this._users.set(users);
          this._loaded.set(true);
          this._loading.set(false);
        },
        error: () => this._loading.set(false),
      }),
    );
  }

  getUserById(id: number): User | undefined {
    return this._users().find((u) => u.id === id);
  }

  createUser(payload: UserPayload): Observable<User> {
    return this.api.createUser(payload).pipe(
      tap((created) => {
        const list = this._users();
        const nextId =
          created?.id && !list.some((u) => u.id === created.id)
            ? created.id
            : (list.reduce((max, u) => Math.max(max, u.id), 0) || 0) + 1;
        const user: User = { ...(created ?? ({} as User)), ...payload, id: nextId };
        this._users.set([...list, user]);
      }),
    );
  }

  updateUser(id: number, payload: UserPayload): Observable<User> {
    return this.api.updateUser(id, payload).pipe(
      tap((updated) => {
        const merged: User = { ...(updated ?? ({} as User)), ...payload, id };
        this._users.set(this._users().map((u) => (u.id === id ? { ...u, ...merged } : u)));
      }),
    );
  }

  deleteUser(id: number): Observable<void> {
    return this.api.deleteUser(id).pipe(
      tap(() => this._users.set(this._users().filter((u) => u.id !== id))),
    );
  }
}
