import { StoreSchedule } from '../models/auth.model';
import { StoreLocation } from '../models/store-location.model';

export class VerifyActivationCredentials {
  static readonly type = '[Auth] Verify Activation Credentials';
  constructor(public token: string, public email: string, public currentPassword: string) {}
}

export class ForgotPassword {
  static readonly type = '[Auth] Forgot Password';
  constructor(public email: string) {}
}

export class ResetPassword {
  static readonly type = '[Auth] Reset Password';
  constructor(public token: string, public email: string, public password: string) {}
}

export class ActivateStore {
  static readonly type = '[Auth] Activate Store';
  constructor(
    public token: string,
    public email: string,
    public currentPassword: string,
    public newPassword: string
  ) {}
}

export class Login {
  static readonly type = '[Auth] Login';
  constructor(public email: string, public pass: string, public remember: boolean) {}
}

export class Logout {
  static readonly type = '[Auth] Logout';
}

export class ClearAuthError {
  static readonly type = '[Auth] Clear Error';
}

export class RefreshStore {
  static readonly type = '[Auth] Refresh Store';
}

export class UpdateProfile {
  static readonly type = '[Auth] Update Profile';
  constructor(public payload: { workingHours: StoreSchedule }) {}
}

export class UpdateStoreLocation {
  static readonly type = '[Auth] Update Store Location';
  constructor(public payload: StoreLocation) {}
}

export class ChangePassword {
  static readonly type = '[Auth] Change Password';
  constructor(
    public payload: {
      currentPass: string;
      newPass: string;
    }
  ) {}
}
