import { StoreSchedule } from '../models/auth.model';

export class VerifyTemporaryCredentials {
  static readonly type = '[Auth] Verify Temporary Credentials';
  constructor(public email: string, public tempPass: string) {}
}

export class UpdateActivationPassword {
  static readonly type = '[Auth] Update Activation Password';
  constructor(public email: string, public newPass: string) {}
}

export class VerifyActivationOtp {
  static readonly type = '[Auth] Verify Activation Otp';
  constructor(public email: string, public otpCode: string) {}
}

export class Login {
  static readonly type = '[Auth] Login';
  constructor(public email: string, public pass: string) {}
}

export class Logout {
  static readonly type = '[Auth] Logout';
}

export class ClearAuthError {
  static readonly type = '[Auth] Clear Error';
}

export class UpdateProfile {
  static readonly type = '[Auth] Update Profile';
  constructor(
    public payload: {
      storeName: string;
      logoUrl?: string;
      city?: string;
      phone: string;
      whatsapp?: string;
      workingHours?: StoreSchedule;
    }
  ) {}
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

export class UpgradeSubscription {
  static readonly type = '[Auth] Upgrade Subscription';
  constructor(public plan: 'Free' | 'Pro' | 'Enterprise') {}
}
