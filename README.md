# RentNest 🏠

**Find & List Rental Properties with Ease** — a backend REST API for a rental property marketplace where landlords list properties, tenants browse and rent them, and admins moderate the platform.

---

## 📋 Table of Contents
- [Overview](#overview)
- [Roles & Permissions](#roles--permissions)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Rental Lifecycle](#rental-lifecycle)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Testing the API](#testing-the-api)
- [Admin Credentials](#admin-credentials)
- [Project Structure](#project-structure)

---

## Overview

RentNest is a backend-only REST API (no frontend included by design — test via Postman/Thunder Client). Landlords list properties and manage rental requests; tenants browse listings, submit requests, pay via Stripe, and leave reviews; admins oversee users and content across the platform.

## Roles & Permissions

| Role | Description | Key Permissions |
|---|---|---|
| **Tenant** | Users looking for rental properties | Browse listings, submit rental requests, pay, leave reviews, manage own profile |
| **Landlord** | Property owners who list rentals | Create/manage listings, approve/reject/complete requests |
| **Admin** | Platform moderators | Manage all users, oversee all listings & requests, manage categories |

> Users select their role during registration (`TENANT` or `LANDLORD`). Admin accounts are seeded directly in the database.

## Tech Stack

| Technology | Purpose |
|---|---|
| Node.js + Express | REST API framework |
| TypeScript | Type safety |
| PostgreSQL + Prisma | Database + ORM |
| JWT | Authentication |
| bcrypt | Password hashing |
| Stripe | Payment processing |
| Vercel / Render | Deployment |

## Features

**Public**
- Browse all available properties with search/filter (location, price, type)
- View property details and reviews
- View property categories

**Tenant**
- Register/login, manage own profile
- Submit rental requests
- Pay for approved rentals via Stripe
- View own rental request and payment history
- Leave a review after a completed rental

**Landlord**
- Create, update, and delete property listings
- View rental requests on own properties
- Approve, reject, or mark a rental request as completed

**Admin**
- View and ban/unban users
- Manage property categories
- View all properties and rental requests across the platform

## Rental Lifecycle

A rental request moves through a fixed set of statuses, driven by the actions below:

```
PENDING
  │
  ├── landlord approves ──────────────► APPROVED
  │                                        │
  │                                        ├── tenant creates payment (Stripe)
  │                                        │
  │                                        └── tenant confirms payment ──► ACTIVE
  │                                                                          │
  │                                                        landlord marks complete
  │                                                                          │
  │                                                                          ▼
  │                                                                    COMPLETED
  │                                                                          │
  │                                                          tenant can now leave a review
  │
  └── landlord rejects ──────────────► REJECTED
```

Payment is a required gate — a rental cannot be marked `COMPLETED` until it has reached `ACTIVE` (i.e., successfully paid), and a review cannot be left until the rental is `COMPLETED`.

## API Endpoints

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/register` | Public | Register a new tenant or landlord |
| POST | `/login` | Public | Login, returns JWT |
| GET | `/me` | Authenticated | Get current user's profile |
| PATCH | `/me` | Authenticated | Update own profile (name, phone, avatar) |

### Properties — Public (`/api/properties`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/` | Public | Get all properties (supports `city`, `location`, `type`, `minPrice`, `maxPrice`, `amenities`, `page`, `limit` filters) |
| GET | `/:id` | Public | Get property details + reviews |

### Categories (`/api/categories`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/` | Public | Get all categories |
| POST | `/` | Admin | Create a category |
| PATCH | `/:id` | Admin | Update a category |
| DELETE | `/:id` | Admin | Delete a category |

### Landlord Management (`/api/landlord`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/properties` | Landlord | Create a new property listing |
| PUT | `/properties/:id` | Landlord | Update own property listing |
| DELETE | `/properties/:id` | Landlord | Remove own property listing |
| GET | `/requests` | Landlord | Get all rental requests for own properties |
| PATCH | `/requests/:id` | Landlord | Approve or reject a pending request |
| PATCH | `/requests/:id/complete` | Landlord | Mark a paid (active) rental as completed |

### Rental Requests (`/api/rentals`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/` | Tenant | Submit a rental request for a property |
| GET | `/` | Tenant | Get own rental request history |
| GET | `/:id` | Tenant / Landlord / Admin | Get rental request details |

### Payments (`/api/payments`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/create` | Tenant | Create a Stripe payment intent for an approved rental |
| POST | `/confirm` | Tenant | Confirm/verify the payment |
| GET | `/` | Tenant | Get own payment history |
| GET | `/:id` | Tenant / Landlord / Admin | Get payment details |

### Reviews (`/api/reviews`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/` | Tenant | Create a review (only after a completed rental) |
| GET | `/property/:propertyId` | Public | Get all reviews for a property |

### Admin (`/api/admin`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/users` | Admin | Get all users |
| PATCH | `/users/:id` | Admin | Update a user's status (ban/unban) |
| GET | `/properties` | Admin | Get all properties platform-wide |
| GET | `/rentals` | Admin | Get all rental requests platform-wide |

All error responses follow a consistent structure:
```json
{
  "success": false,
  "message": "Descriptive error message",
  "errorDetails": { }
}
```

## Database Schema

Core models (see `prisma/schema.prisma` for the full definition):

- **User** — auth, role (`TENANT`/`LANDLORD`/`ADMIN`), status (`ACTIVE`/`BANNED`)
- **Category** — property type categories
- **Property** — rental listings, linked to a landlord and a category
- **RentalRequest** — links a tenant to a property, tracks status through the rental lifecycle
- **Payment** — one-to-one with a rental request, tracks Stripe transaction details and status
- **Review** — one-to-one with a completed rental request

## Getting Started

```bash
# 1. Clone the repo
git clone https://github.com/your-username/rentnest-backend.git
cd rentnest-backend

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# then fill in the values (see below)

# 4. Run Prisma migrations
npx prisma migrate dev

# 5. Seed the database (creates admin account + sample categories)
npx prisma db seed

# 6. Start the dev server
npm run dev
```

## Environment Variables

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/rentnest"

# Auth
JWT_SECRET=your_jwt_secret_here

# Payment
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxx
```

## Testing the API

This is a backend-only project — no frontend is included. Use **Postman** or **Thunder Client** to test all endpoints. General flow:

1. Register a landlord and a tenant → login both → save JWTs
2. Admin creates a category (use seeded admin credentials)
3. Landlord creates a property under that category
4. Tenant submits a rental request for the property
5. Landlord approves the request
6. Tenant creates a payment, then confirms it (Stripe test card `pm_card_visa` is used automatically in test mode — no real card needed)
7. Landlord marks the (now paid/active) rental as completed
8. Tenant leaves a review

Full API documentation: *[add your Postman collection link here]*

## Admin Credentials

```
Email:    admin@rentnest.com
Password: admin123
```
*(Set via the seed script — update the values above to match whatever you actually seed.)*

## Project Structure

```
src/
├── config/
│   └── stripe.ts
├── lib/
│   └── prisma.ts
├── middlewares/
│   ├── auth.ts
│   ├── globalErrorHandler.ts
│   └── notFound.ts
├── modules/
│   ├── user/
│   ├── category/
│   ├── property/
│   ├── landlord/
│   ├── rentalRequest/
│   ├── payment/
│   ├── review/
│   └── admin/
│       └── (route / controller / service / interface per module)
├── routes/
│   └── index.ts
├── utils/
│   ├── catchAsync.ts
│   └── sentResponse.ts
└── app.ts
```

---

Built as part of the Programming Hero backend assignment (Assignment 4 — RentNest).
