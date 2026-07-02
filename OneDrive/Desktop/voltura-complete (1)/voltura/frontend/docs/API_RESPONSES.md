# API Reference — Sample Requests & Responses

Every endpoint the frontend calls, with a representative request and the
exact response envelope the backend returns. Field names match the FastAPI
Pydantic schemas exactly (`backend/app/schemas/*.py`), and the mock layer
(`src/mocks/`) returns these same shapes so switching `VITE_USE_MOCK_API`
to `false` requires no frontend changes.

All authenticated endpoints expect `Authorization: Bearer <access_token>`.
All responses use the envelope `{ success, data }` or `{ success, data, meta }`
for paginated lists; errors use `{ success: false, error: { code, message, details } }`.

---

## Auth

### `POST /auth/login`

**Request**
```json
{ "email": "ananya.rao@voltura.com", "password": "Password123!" }
```

**Response `200`**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
    "token_type": "bearer",
    "user": {
      "id": "usr_1",
      "name": "Ananya Rao",
      "email": "ananya.rao@voltura.com",
      "phone": "+91 98450 11223",
      "avatar_url": null,
      "status": "active",
      "is_email_verified": true,
      "last_active_at": "2026-06-29T10:12:00Z",
      "created_at": "2025-12-01T08:00:00Z",
      "role": { "id": "role_admin", "name": "admin", "description": "Admin role" }
    }
  }
}
```

**Error `401`**
```json
{ "success": false, "error": { "code": "AUTHENTICATION_ERROR", "message": "Invalid email or password", "details": null } }
```

### `POST /auth/refresh`
```json
// Request
{ "refresh_token": "eyJhbGciOiJIUzI1NiIs..." }

// Response 200
{ "success": true, "data": { "access_token": "eyJhbGciOiJIUzI1NiIs...", "token_type": "bearer" } }
```

### `GET /auth/me` → `200`
Same `user` object shape as the login response's `data.user`.

---

## Users

### `GET /users/?search=&status=&page=1&page_size=20`

**Response `200`**
```json
{
  "success": true,
  "data": [
    {
      "id": "usr_1",
      "name": "Ananya Rao",
      "email": "ananya.rao@voltura.com",
      "status": "active",
      "role": { "id": "role_admin", "name": "admin" },
      "last_active_at": "2026-06-29T10:12:00Z",
      "created_at": "2025-12-01T08:00:00Z"
    }
  ],
  "meta": { "page": 1, "page_size": 20, "total": 6, "total_pages": 1 }
}
```

### `POST /users/`
```json
// Request
{ "name": "Kavya Iyer", "email": "kavya.iyer@voltura.com", "role": "analyst", "phone": null }

// Response 201 — full UserRead object, status defaults to "pending"
```

### `PUT /users/{id}/role`
```json
// Request
{ "role": "admin" }
```

### `PUT /users/{id}/status`
```json
// Request
{ "status": "suspended" }
```

---

## Power Purchase

### `GET /power-purchase/?date_from=2026-06-01&date_to=2026-06-29&page=1&page_size=20`
```json
{
  "success": true,
  "data": [
    {
      "id": "pp_1000",
      "source_id": "src_thermal",
      "date": "2026-06-29",
      "quantity_mu": 187.42,
      "rate_per_unit": 4.12,
      "amount": 772174.04,
      "status": "approved",
      "remarks": null,
      "created_at": "2026-06-29T06:00:00Z"
    }
  ],
  "meta": { "page": 1, "page_size": 20, "total": 30, "total_pages": 2 }
}
```

### `GET /power-purchase/summary?date_from=&date_to=`
```json
{ "success": true, "data": { "total_quantity_mu": 4982.6, "total_amount": 19842000.5, "transaction_count": 30 } }
```

### `POST /power-purchase/`
```json
// Request
{ "source_id": "src_thermal", "date": "2026-06-29", "quantity_mu": 180.5, "rate_per_unit": 4.05, "remarks": null }
// Response 201 — full PowerPurchaseRead, amount computed server-side as quantity_mu * rate_per_unit
```

---

## Open Access

### `GET /open-access/?date_from=&date_to=&status=`
```json
{
  "success": true,
  "data": [
    {
      "id": "oa_2000",
      "date": "2026-06-29",
      "consumer_name": "Tata Steel Ltd",
      "generator_id": "src_thermal",
      "quantity_mu": 62.3,
      "wheeling_charges": 28400.0,
      "transmission_charges": 15600.0,
      "total_charges": 44000.0,
      "status": "pending",
      "created_at": "2026-06-29T06:00:00Z"
    }
  ],
  "meta": { "page": 1, "page_size": 20, "total": 24, "total_pages": 2 }
}
```

---

## Generation / Consumption / Peak Demand

### `GET /generation/source-wise?date_from=&date_to=`
```json
{
  "success": true,
  "data": [
    { "source_type": "thermal", "source_name": "Thermal", "quantity_mwh": 4820 },
    { "source_type": "solar", "source_name": "Solar", "quantity_mwh": 2960 }
  ]
}
```

### `GET /peak-demand/trend?date_from=&date_to=`
```json
{
  "success": true,
  "data": [
    { "date": "2026-06-28", "demand_mw": 478.2 },
    { "date": "2026-06-29", "demand_mw": 482.6 }
  ]
}
```

### `GET /consumption/by-feeder?date_from=&date_to=`
```json
{
  "success": true,
  "data": [
    { "feeder_name": "Whitefield Feeder", "quantity_mwh": 3820 },
    { "feeder_name": "Electronic City Feeder", "quantity_mwh": 2910 }
  ]
}
```

---

## Billing & Settlement

### `GET /billing/?status=pending`
```json
{
  "success": true,
  "data": [
    {
      "id": "bill_3000",
      "period_start": "2026-05-01",
      "period_end": "2026-05-30",
      "feeder_id": "feeder_1",
      "units_consumed_mu": 245.8,
      "rate_per_unit": 4.5,
      "amount": 1106100.0,
      "due_date": "2026-06-14",
      "status": "pending",
      "created_at": "2026-05-30T18:00:00Z"
    }
  ],
  "meta": { "page": 1, "page_size": 20, "total": 18, "total_pages": 1 }
}
```

### `GET /billing/monthly-summary?date_from=&date_to=`
```json
{
  "success": true,
  "data": [
    { "month": "2026-01-01", "billed": 420000.0, "settled": 390000.0 },
    { "month": "2026-02-01", "billed": 455000.0, "settled": 430000.0 }
  ]
}
```

### `POST /settlement/`
```json
// Request
{ "billing_id": "bill_3000", "paid_amount": 1106100.0, "settlement_date": "2026-06-10", "reference_number": "UTR2026061001" }
// Response 201 — SettlementRead; parent billing.status flips to "settled" if paid_amount >= amount
```

---

## Analytics & Dashboard

### `GET /analytics/dashboard-summary?date_from=&date_to=`
```json
{
  "success": true,
  "data": {
    "power_purchase_mu": { "label": "Power Purchase", "value": 4982.6, "unit": "MU", "change_percent": 4.2 },
    "generation_mwh": { "label": "Energy Generation", "value": 9862.0, "unit": "MWh", "change_percent": -1.8 },
    "peak_demand_mw": { "label": "Peak Demand", "value": 482.6, "unit": "MW", "change_percent": 6.5 },
    "open_access_mu": { "label": "Open Access Volume", "value": 1312.4, "unit": "MU", "change_percent": 2.1 },
    "outstanding_billing": { "label": "Outstanding Billing", "value": 4820000.0, "unit": "INR", "change_percent": null },
    "active_alerts": { "label": "Active Alerts", "value": 2, "unit": "count", "change_percent": null }
  }
}
```

### `GET /analytics/combined-trend?date_from=&date_to=`
```json
{
  "success": true,
  "data": [
    { "date": "2026-06-28", "purchase": 182, "generation": 156, "consumption": 168 },
    { "date": "2026-06-29", "purchase": 187, "generation": 149, "consumption": 172 }
  ]
}
```

---

## Reports

### `POST /reports/generate`
```json
// Request
{ "report_type": "financial", "date_from": "2026-06-01", "date_to": "2026-06-29" }

// Response 202 — status starts as "processing"; client polls GET /reports/{id} or listens for a notification
{
  "success": true,
  "data": {
    "id": "rpt_91234",
    "name": "Monthly Financial Summary — 2026-06-01 to 2026-06-29",
    "report_type": "financial",
    "status": "processing",
    "generated_at": null,
    "file_path": null
  }
}
```

### `GET /reports/financial` → `200`
Array of `ReportRead` objects, same shape as above, with `status: "approved"` and a populated `file_path` once rendering completes.

---

## Alerts & Notifications

### `GET /alerts/notifications?acknowledged=false&page=1&page_size=20`
```json
{
  "success": true,
  "data": [
    {
      "id": "notif_1",
      "rule_id": "rule_1",
      "title": "Peak Demand gt 480 — current value 482.60",
      "triggered_value": 482.6,
      "triggered_at": "2026-06-29T08:00:00Z",
      "acknowledged": false,
      "acknowledged_at": null,
      "rule": {
        "id": "rule_1",
        "name": "Peak demand threshold",
        "metric": "peak_demand",
        "condition": "gt",
        "threshold": 480,
        "severity": "critical",
        "is_active": true
      }
    }
  ],
  "meta": { "page": 1, "page_size": 20, "total": 2, "total_pages": 1 }
}
```

### `PUT /alerts/notifications/{id}/acknowledge`
```json
// Request
{ "note": null }
// Response 200 — same AlertNotificationRead shape, acknowledged: true, acknowledged_at populated
```

---

## File Upload (two-phase: validate → commit)

### `POST /uploads/generation` (multipart/form-data, field name `file`)

**Response `200` — validation report, nothing persisted yet**
```json
{
  "success": true,
  "data": {
    "upload_id": "upl_91500",
    "filename": "generation_june_2026.xlsx",
    "data_type": "generation",
    "status": "validated",
    "total_rows": 240,
    "valid_rows": 236,
    "error_rows": 4,
    "errors": [
      { "row_number": 12, "error_message": "Missing required field 'quantity_mwh'", "raw_data": { "date": "2026-06-12" } }
    ],
    "preview": [
      { "plant_id": "src_thermal", "date": "2026-06-01", "quantity_mwh": 142.6 }
    ]
  }
}
```

### `POST /uploads/{upload_id}/commit`
```json
{ "success": true, "data": { "upload_id": "upl_91500", "status": "committed", "rows_committed": 236 } }
```

### `GET /uploads/history?page=1&page_size=20`
```json
{
  "success": true,
  "data": [
    {
      "id": "upl_91500",
      "filename": "generation_june_2026.xlsx",
      "file_type": "excel",
      "data_type": "generation",
      "status": "committed",
      "total_rows": 240,
      "valid_rows": 236,
      "error_rows": 4,
      "created_at": "2026-06-29T09:00:00Z"
    }
  ],
  "meta": { "page": 1, "page_size": 20, "total": 3, "total_pages": 1 }
}
```

---

## Error envelope (every endpoint, on failure)

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [
      { "field": "body.quantity_mu", "message": "Input should be greater than 0" }
    ]
  }
}
```

Common `code` values: `AUTHENTICATION_ERROR` (401), `INSUFFICIENT_PERMISSION` (403),
`NOT_FOUND` (404), `DUPLICATE_RESOURCE` (409), `VALIDATION_ERROR` (422),
`BUSINESS_RULE_VIOLATION` (400), `FILE_PROCESSING_ERROR` (400), `INTERNAL_ERROR` (500).
