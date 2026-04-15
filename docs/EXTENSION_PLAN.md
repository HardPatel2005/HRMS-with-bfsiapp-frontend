# BFSI Extension Plan (Auth + Mutual Fund + FATCA)

## 1) Auth APIs to build in ASP.NET

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/verify-email`
- `GET /api/auth/oauth/google/start`
- `GET /api/auth/oauth/google/callback`
- `GET /api/auth/oauth/microsoft/start`
- `GET /api/auth/oauth/microsoft/callback`

## 2) Customer + Mutual Fund Onboarding fields

### Core identity
- `firstName`, `lastName`, `dob`, `pan`, `aadhaarLast4`
- `email`, `mobile`, `address`

### Mutual fund specific
- `folioNumber`
- `riskProfile` (Low/Medium/High)
- `investmentGoal`
- `nomineeName`
- `nomineeRelation`

### FATCA/CRS
- `taxResidencyCountry`
- `isUsPerson`
- `usTin` (nullable)
- `fatcaDeclarationAccepted`
- `fatcaDeclaredAt`

## 3) Validation rules (frontend + backend)

- PAN format validation
- Folio number format and uniqueness
- Email OTP verification before account activation
- FATCA required: `isUsPerson` + tax residency selection
- If `isUsPerson = true`, `usTin` must be mandatory

## 4) Security controls

- Always enforce HTTPS/TLS 1.2+
- JWT access token + refresh token rotation
- Store only access token in frontend (short-lived)
- Hash passwords with ASP.NET Identity
- Use Data Protection / encrypted columns for sensitive PII at rest
- Add rate limit + account lockout on auth endpoints
- Enable CORS only for approved frontend origins
- Use audit logs for onboarding and FATCA declaration changes

## 5) Recommended rollout

1. Auth + email verification
2. Customer onboarding with folio
3. FATCA/CRS declaration wizard
4. Mutual fund application workflow
5. Reporting and compliance exports
