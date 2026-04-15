# MF Investing Structural and System Design

## 1. Objective
Enable users to perform and track mutual fund operations with clear workflow visibility:
- Lumpsum
- SIP (Systematic Investment Plan)
- SWP (Systematic Withdrawal Plan)
- Withdrawal

The dashboard provides total NAV, allocation, trend analytics, and transaction lifecycle tracking.

## 2. Logical Architecture
- Presentation Layer (Angular):
  - `MfInvestingDashboardComponent`
  - Highcharts visualizations (Pie + NAV trend)
  - Transaction form and activity table
- Domain Layer (Frontend Service):
  - `MfInvestingService`
  - Computes portfolio summary and updates NAV metrics
- Data Contracts:
  - `mf-investment.model.ts`
  - Typed models for portfolio metrics and transaction entities

## 3. Transaction Tree
- MF Investing
  - Lumpsum
    - one-time buy order
    - instant unit allocation
    - NAV and allocation recalculation
  - SIP
    - mandate validation
    - periodic scheduler
    - recurring unit purchase
  - SWP
    - periodic redemption scheduler
    - payout transfer
    - tax event capture
  - Withdrawal
    - ad-hoc redemption
    - compliance and limit checks
    - payout settlement

## 4. Portfolio Metrics
- Total Invested
- Total NAV
- Unrealized Gain
- Return Percentage
- Category-wise NAV allocation (Pie chart)
- 6-period NAV trend (Area chart)

## 5. Integration in Project
- Route: `/mf-investing` (guarded)
- Navigation: Navbar entry `MF Investing`
- Provider: `provideHighcharts()` in `app.config.ts`
- Dependency: `highcharts` + `highcharts-angular`

## 6. Future Backend Expansion (Recommended)
- Persist transactions in API and DB
- NAV feed integration from market data source
- SIP/SWP scheduler from backend jobs
- Folio mapping and FATCA flags per investor
- End-to-end audit trail and notifications
