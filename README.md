
## Запуск
```bash
npm install
npm start  
```

Сборка production:

```bash
npm run build
```

## Структура

```
src/app/
  app.ts / app.html / app.scss       — корневой layout (header + content + footer)
  app.config.ts                       — провайдеры HttpClient, анимаций, NG-ZORRO i18n/icons
  app.routes.ts                       — маршрутизация
  models/user.model.ts                — типы User, Address, Company, UserPayload
  services/
    user.service.ts                   — HTTP-клиент к /users (CRUD)
    user-store.service.ts             — signal-store, синхронизирует клиентское состояние
  components/
    user-list/                        — таблица + поиск + пагинация
    user-detail/                      — карточка пользователя по :id
    user-form/                        — Reactive Forms create/edit
```

## Маршруты

| Путь                  | Компонент           | Описание                          |
| --------------------- | ------------------- | --------------------------------- |
| `/users`              | UserListComponent   | Список с поиском и пагинацией     |
| `/users/new`          | UserFormComponent   | Создание                          |
| `/users/:id`          | UserDetailComponent | Просмотр деталей                  |
| `/users/:id/edit`     | UserFormComponent   | Редактирование                    |

Параметр `:id` передаётся в компоненты через
`withComponentInputBinding()` и `input.required<string>()`.

## API

`UserService` оборачивает все эндпоинты JSONPlaceholder:

| Метод           | Запрос                              |
| --------------- | ----------------------------------- |
| `getUsers()`    | `GET    /users`                     |
| `getUser(id)`   | `GET    /users/{id}`                |
| `createUser()`  | `POST   /users`                     |
| `updateUser()`  | `PUT    /users/{id}`                |
| `deleteUser()`  | `DELETE /users/{id}`                |

JSONPlaceholder не сохраняет POST/PUT/DELETE, поэтому `UserStoreService`
дублирует изменения в клиентском signal-state, чтобы CRUD ощущался живым.

## Формы и валидация

`UserFormComponent` использует `FormBuilder`/`FormGroup` с вложенными
группами для адреса и компании. Валидация:

- `name`, `username` — `Validators.required`, `minLength(2)`
- `email` — `Validators.required`, `Validators.email` (формат email)

Подсказки об ошибках выводятся через `nz-form-control [nzErrorTip]`.

## Поиск и пагинация

В списке:

- поиск по имени или email (computed-фильтр поверх signal-стора)
- пагинация NG-ZORRO с переключателем размера страницы (5/10/20)
- кнопки просмотра, редактирования и удаления с подтверждением
  `nz-popconfirm`

