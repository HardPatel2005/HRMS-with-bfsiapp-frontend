// ============================================================
// src/app/models/auth.model.ts
//
// ROOT CAUSE OF LOGIN/REGISTER FAILING:
// The old AuthResponse only had { accessToken, refreshToken, expiresIn }
// but the backend returns { success, message, accessToken, refreshToken,
// expiresAt, user{}, device{} }.
//
// AuthService.setSession() was looking for raw['accessToken'] and finding
// nothing because the backend returns 'AccessToken' (PascalCase from .NET).
// The null-check caused setSession() to silently return without saving
// anything — so the user appeared logged out even after a 200 response.
// ============================================================

// ── Sub-types ─────────────────────────────────────────────────────────────

export interface DeviceInfo {
  deviceId?:        string;
  deviceName?:      string;
  deviceType?:      string;
  browser?:         string;
  browserVersion?:  string;
  operatingSystem?: string;
  osVersion?:       string;
  ipAddress?:       string;
  userAgent?:       string;
}

/** Maps to UserDto on the backend */
export interface UserDto {
  id:               string;
  fullName:         string;
  email:            string;
  role:             string;
  isEmailVerified:  boolean;
  isActive:         boolean;
  oAuthProvider?:   string | null;
  lastLoginDate?:   string | null;
}

/** Maps to DeviceDto on the backend */
export interface DeviceDto {
  id:            string;
  deviceName:    string;
  deviceType:    string;
  isTrusted:     boolean;
  loginCount:    number;
  lastLoginDate: string;
}

// ── Request models ────────────────────────────────────────────────────────

/** POST /api/auth/login → LoginRequestDto */
export interface LoginRequest {
  email:       string;
  password:    string;
  role:        string;
  deviceInfo?: DeviceInfo | null;
}

/** POST /api/auth/register → RegisterRequestDto */
export interface RegisterRequest {
  fullName:        string;
  email:           string;
  password:        string;
  confirmPassword: string;
  deviceInfo?:     DeviceInfo | null;
}

/** POST /api/auth/oauth-login → OAuthLoginRequestDto */
export interface OAuthLoginRequest {
  provider:        'Google' | 'Microsoft';
  idToken:         string;
  email?:          string | null;
  name?:           string | null;
  profilePicture?: string | null;
  deviceInfo?:     DeviceInfo | null;
}

/** POST /api/auth/refresh → RefreshTokenRequestDto
 *  NOTE: backend requires BOTH accessToken AND refreshToken */
export interface RefreshTokenRequest {
  accessToken:  string;
  refreshToken: string;
}

/** POST /api/auth/forgot-password */
export interface ForgotPasswordRequest {
  email: string;
}

/** POST /api/auth/reset-password */
export interface ResetPasswordRequest {
  token:       string;
  newPassword: string;
}

// ── Response models ───────────────────────────────────────────────────────

/**
 * Maps to AuthResponseDto on the backend.
 *
 * .NET JSON serialiser returns PascalCase by default:
 *   { "Success": true, "AccessToken": "...", "User": { ... } }
 *
 * AuthService.setSession() handles both casings (AccessToken / accessToken)
 * via the `raw` cast pattern so this interface uses camelCase (TS convention).
 */
export interface AuthResponse {
  success:       boolean;
  message:       string;
  accessToken?:  string | null;
  refreshToken?: string | null;
  expiresAt?:    string | null;   // ISO datetime string, NOT expiresIn (seconds)
  user?:         UserDto | null;
  device?:       DeviceDto | null;
}

/** Returned by /verify-email, /reset-password, /forgot-password */
export interface SimpleResponse {
  success: boolean;
  message: string;
}