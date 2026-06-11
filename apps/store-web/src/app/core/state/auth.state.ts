import { Injectable } from '@angular/core';
import { State, Action, StateContext, Selector, NgxsOnInit } from '@ngxs/store';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { AuthStateModel, StoreUser } from '../models/auth.model';
import * as AuthActions from './auth.actions';

const defaultState: AuthStateModel = {
  user: null,
  tempSession: null,
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
    }
  }

  @Selector()
  static user(state: AuthStateModel): StoreUser | null {
    return state.user;
  }

  @Selector()
  static tempSession(state: AuthStateModel) {
    return state.tempSession;
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
    return this.authService.login(action.email, action.pass).pipe(
      tap((user) => {
        ctx.patchState({ user, loading: false });
      }),
      catchError((err) => {
        ctx.patchState({ error: err.message, loading: false });
        return throwError(() => err);
      })
    );
  }

  @Action(AuthActions.VerifyTemporaryCredentials)
  verifyTemporaryCredentials(
    ctx: StateContext<AuthStateModel>,
    action: AuthActions.VerifyTemporaryCredentials
  ) {
    ctx.patchState({ loading: true, error: null });
    return this.authService.verifyTemporaryCredentials(action.email, action.tempPass).pipe(
      tap((res) => {
        ctx.patchState({
          tempSession: {
            email: res.email,
            tempPasswordVerified: true,
            newPasswordEntered: false,
          },
          loading: false,
        });
      }),
      catchError((err) => {
        ctx.patchState({ error: err.message, loading: false });
        return throwError(() => err);
      })
    );
  }

  @Action(AuthActions.UpdateActivationPassword)
  updateActivationPassword(
    ctx: StateContext<AuthStateModel>,
    action: AuthActions.UpdateActivationPassword
  ) {
    ctx.patchState({ loading: true, error: null });
    return this.authService.updatePassword(action.email, action.newPass).pipe(
      tap(() => {
        const state = ctx.getState();
        if (state.tempSession) {
          ctx.patchState({
            tempSession: {
              ...state.tempSession,
              newPasswordEntered: true,
            },
            loading: false,
          });
        } else {
          ctx.patchState({ loading: false });
        }
      }),
      catchError((err) => {
        ctx.patchState({ error: err.message, loading: false });
        return throwError(() => err);
      })
    );
  }

  @Action(AuthActions.VerifyActivationOtp)
  verifyActivationOtp(
    ctx: StateContext<AuthStateModel>,
    action: AuthActions.VerifyActivationOtp
  ) {
    ctx.patchState({ loading: true, error: null });
    return this.authService.verifyOtp(action.email, action.otpCode).pipe(
      tap((user) => {
        ctx.patchState({
          user,
          tempSession: null,
          loading: false,
        });
      }),
      catchError((err) => {
        ctx.patchState({ error: err.message, loading: false });
        return throwError(() => err);
      })
    );
  }

  @Action(AuthActions.UpdateProfile)
  updateProfile(ctx: StateContext<AuthStateModel>, action: AuthActions.UpdateProfile) {
    const state = ctx.getState();
    if (!state.user) {
      return throwError(() => new Error('Not authenticated'));
    }
    ctx.patchState({ loading: true, error: null });
    return this.authService.updateProfile(state.user.id, action.payload).pipe(
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

  @Action(AuthActions.UpgradeSubscription)
  upgradeSubscription(ctx: StateContext<AuthStateModel>, action: AuthActions.UpgradeSubscription) {
    const state = ctx.getState();
    if (!state.user) {
      return throwError(() => new Error('Not authenticated'));
    }
    ctx.patchState({ loading: true, error: null });
    return this.authService.upgradeSubscription(state.user.id, action.plan).pipe(
      tap((user) => {
        ctx.patchState({ user, loading: false });
      }),
      catchError((err) => {
        ctx.patchState({ error: err.message, loading: false });
        return throwError(() => err);
      })
    );
  }

  @Action(AuthActions.Logout)
  logout(ctx: StateContext<AuthStateModel>) {
    this.authService.logout();
    ctx.setState(defaultState);
  }
}
