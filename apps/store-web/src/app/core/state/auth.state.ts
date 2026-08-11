import { Injectable } from '@angular/core';
import { State, Action, StateContext, Selector, NgxsOnInit } from '@ngxs/store';
import { tap, catchError } from 'rxjs/operators';
import { of, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { AuthStateModel, StoreUser } from '../models/auth.model';
import * as AuthActions from './auth.actions';

const defaultState: AuthStateModel = {
  user: null,
  loading: false,
  error: null,
};

@State<AuthStateModel>({
  name: 'auth',
  defaults: defaultState,
})
@Injectable()
export class AuthState implements NgxsOnInit {
  constructor(private authService: AuthService) {}

  ngxsOnInit(ctx: StateContext<AuthStateModel>) {
    const user = this.authService.getCurrentUser();
    if (user) {
      ctx.patchState({ user });
      // Stale-while-revalidate: show the cached session immediately, then
      // quietly refresh from the API in case the store changed elsewhere
      // (e.g. an admin edited it) since this session was last saved.
      ctx.dispatch(new AuthActions.RefreshStore());
    }
  }

  @Selector()
  static user(state: AuthStateModel): StoreUser | null {
    return state.user;
  }

  @Selector()
  static loading(state: AuthStateModel): boolean {
    return state.loading;
  }

  @Selector()
  static error(state: AuthStateModel): string | null {
    return state.error;
  }

  @Selector()
  static isAuthenticated(state: AuthStateModel): boolean {
    return !!state.user;
  }

  @Action(AuthActions.ClearAuthError)
  clearError(ctx: StateContext<AuthStateModel>) {
    ctx.patchState({ error: null });
  }

  @Action(AuthActions.Login)
  login(ctx: StateContext<AuthStateModel>, action: AuthActions.Login) {
    ctx.patchState({ loading: true, error: null });
    return this.authService.login(action.email, action.pass, action.remember).pipe(
      tap((user) => {
        ctx.patchState({ user, loading: false });
      }),
      catchError((err) => {
        ctx.patchState({ error: err.message, loading: false });
        return throwError(() => err);
      })
    );
  }

  @Action(AuthActions.VerifyActivationCredentials)
  verifyActivationCredentials(ctx: StateContext<AuthStateModel>, action: AuthActions.VerifyActivationCredentials) {
    ctx.patchState({ loading: true, error: null });
    return this.authService.verifyActivationCredentials(action.token, action.email, action.currentPassword).pipe(
      tap(() => {
        ctx.patchState({ loading: false });
      }),
      catchError((err) => {
        ctx.patchState({ error: err.message, loading: false });
        return throwError(() => err);
      })
    );
  }

  @Action(AuthActions.ForgotPassword)
  forgotPassword(ctx: StateContext<AuthStateModel>, action: AuthActions.ForgotPassword) {
    ctx.patchState({ loading: true, error: null });
    return this.authService.forgotPassword(action.email).pipe(
      tap(() => {
        ctx.patchState({ loading: false });
      }),
      catchError((err) => {
        ctx.patchState({ error: err.message, loading: false });
        return throwError(() => err);
      })
    );
  }

  @Action(AuthActions.ResetPassword)
  resetPassword(ctx: StateContext<AuthStateModel>, action: AuthActions.ResetPassword) {
    ctx.patchState({ loading: true, error: null });
    return this.authService.resetPassword(action.token, action.email, action.password).pipe(
      tap(() => {
        ctx.patchState({ loading: false });
      }),
      catchError((err) => {
        ctx.patchState({ error: err.message, loading: false });
        return throwError(() => err);
      })
    );
  }

  @Action(AuthActions.ActivateStore)
  activateStore(ctx: StateContext<AuthStateModel>, action: AuthActions.ActivateStore) {
    ctx.patchState({ loading: true, error: null });
    return this.authService.activateStore(action.token, action.email, action.currentPassword, action.newPassword).pipe(
      tap((user) => {
        ctx.patchState({ user, loading: false });
      }),
      catchError((err) => {
        ctx.patchState({ error: err.message, loading: false });
        return throwError(() => err);
      })
    );
  }

  @Action(AuthActions.RefreshStore)
  refreshStore(ctx: StateContext<AuthStateModel>) {
    return this.authService.refreshStore().pipe(
      tap((user) => {
        ctx.patchState({ user });
      }),
      catchError(() => of(void 0)) // best-effort background refresh; keep the cached session on failure
    );
  }

  @Action(AuthActions.UpdateProfile)
  updateProfile(ctx: StateContext<AuthStateModel>, action: AuthActions.UpdateProfile) {
    const state = ctx.getState();
    if (!state.user) {
      return throwError(() => new Error('Not authenticated'));
    }
    ctx.patchState({ loading: true, error: null });
    return this.authService.updateProfile(state.user.storeId, action.payload.workingHours).pipe(
      tap((user) => {
        ctx.patchState({ user, loading: false });
      }),
      catchError((err) => {
        ctx.patchState({ error: err.message, loading: false });
        return throwError(() => err);
      })
    );
  }

  @Action(AuthActions.UpdateStoreLocation)
  updateStoreLocation(ctx: StateContext<AuthStateModel>, action: AuthActions.UpdateStoreLocation) {
    const state = ctx.getState();
    if (!state.user) {
      return throwError(() => new Error('Not authenticated'));
    }
    ctx.patchState({ loading: true, error: null });
    return this.authService.updateStoreLocation(state.user.storeId, action.payload).pipe(
      tap((user) => {
        ctx.patchState({ user, loading: false });
      }),
      catchError((err) => {
        ctx.patchState({ error: err.message, loading: false });
        return throwError(() => err);
      })
    );
  }

  @Action(AuthActions.ChangePassword)
  changePassword(ctx: StateContext<AuthStateModel>, action: AuthActions.ChangePassword) {
    const state = ctx.getState();
    if (!state.user) {
      return throwError(() => new Error('Not authenticated'));
    }
    ctx.patchState({ loading: true, error: null });
    return this.authService.changePassword(state.user.id, action.payload.currentPass, action.payload.newPass).pipe(
      tap(() => {
        ctx.patchState({ loading: false });
      }),
      catchError((err) => {
        ctx.patchState({ error: err.message, loading: false });
        return throwError(() => err);
      })
    );
  }

  @Action(AuthActions.Logout)
  logout(ctx: StateContext<AuthStateModel>) {
    ctx.setState(defaultState);
    return this.authService.logout().pipe(catchError(() => of(void 0)));
  }
}
