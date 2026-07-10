export class AdminLogin {
  static readonly type = '[Admin Auth] Login';
  constructor(public email: string, public password: string) {}
}

export class AdminLogout {
  static readonly type = '[Admin Auth] Logout';
}

export class ClearAdminAuthError {
  static readonly type = '[Admin Auth] Clear Error';
}
