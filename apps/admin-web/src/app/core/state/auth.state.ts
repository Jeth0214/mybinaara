import { Injectable } from '@angular/core';
import { State, Action, StateContext, Selector, NgxsOnInit } from '@ngxs/store';
import { tap, catchError } from 'rxjs/operators';
import { of, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { AdminAuthStateModel, AdminUser } from '../models/auth.model';
import { AdminLogin, AdminLogout, ClearAdminAuthError } from './auth.actions';

const defaultState: AdminAuthStateModel = {
  user: null,
  loading: false,
  error: null,
};

@State<AdminAuthStateModel>({
  name: 'adminAuth',
  defaults: defaultState,
})
@Injectable()
export class AdminAuthState implements NgxsOnInit {
  constructor(private authService: AuthService) {}

  ngxsOnInit(ctx: StateContext<AdminAuthStateModel>): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      ctx.patchState({ user });
    }
  }

  // ── Selectors ──────────────────────────────────────────────────────────────

  @Selector()
  static user(state: AdminAuthStateModel): AdminUser | null {
    return state.user;
  }

  @Selector()
  static loading(state: AdminAuthStateModel): boolean {
    return state.loading;
  }

  @Selector()
  static error(state: AdminAuthStateModel): string | null {
    return state.error;
  }

  @Selector()
  static isAuthenticated(state: AdminAuthStateModel): boolean {
    return !!state.user;
  }

  @Selector()
  static userRole(state: AdminAuthStateModel): string | null {
    return state.user?.role ?? null;
  }

  @Selector()
  static permissions(state: AdminAuthStateModel): string[] {
    return state.user?.permissions ?? [];
  }

  // ── Actions ────────────────────────────────────────────────────────────────

  @Action(ClearAdminAuthError)
  clearError(ctx: StateContext<AdminAuthStateModel>): void {
    ctx.patchState({ error: null });
  }

  @Action(AdminLogin)
  login(ctx: StateContext<AdminAuthStateModel>, action: AdminLogin) {
    ctx.patchState({ loading: true, error: null });
    return this.authService.login(action.email, action.password, action.remember).pipe(
      tap((user) => {
        ctx.patchState({ user, loading: false });
      }),
      catchError((err) => {
        ctx.patchState({ error: err.message, loading: false });
        return throwError(() => err);
      })
    );
  }

  @Action(AdminLogout)
  logout(ctx: StateContext<AdminAuthStateModel>) {
    ctx.setState(defaultState);
    return this.authService.logout().pipe(catchError(() => of(void 0)));
  }
}
