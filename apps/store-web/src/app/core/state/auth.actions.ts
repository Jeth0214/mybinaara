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
