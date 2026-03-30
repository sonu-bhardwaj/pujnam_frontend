# Pujnam Store

Pujnam Store is a full-stack e-commerce project for puja and spiritual products. It includes a React + Vite frontend, an Express + MongoDB backend, customer authentication, admin management, order handling, payment integration, media uploads, and store settings.

## Features

- Customer storefront with categories, product listing, product detail pages, cart, checkout, profile, orders, contact, legal pages, and festival content.
- Admin panel for products, categories, banners, coupons, customers, orders, festivals, promo blocks, panchang, section videos, and store settings.
- Authentication with registration, login, email verification, forgot password, password reset OTP, and admin login.
- Payment flow using Cashfree.
- Image and video upload support.
- Email sending for verification and password OTP flows.
- Store customization through backend-managed settings.

## Tech Stack

- Frontend: React, TypeScript, Vite
- Backend: Node.js, Express, MongoDB, Mongoose
- Payments: Cashfree
- Email: Hostinger SMTP and/or Mailgun

## Project Structure

```text
Pujnam Store/
├─ src/                  Frontend source
├─ dist/                 Built frontend output
├─ backend/              Express API and server code
├─ supabase/             SQL / data-related assets used by the project
├─ package.json          Frontend scripts
└─ backend/package.json  Backend scripts
```

## Setup

### 1. Install dependencies

Frontend:

```bash
npm install
```

Backend:

```bash
cd backend
npm install
```

### 2. Create environment files

Frontend `.env` in the project root:

```env
VITE_API_URL=http://localhost:5001/api
```

Backend `.env` in `backend/`:

```env
MONGODB_URI=
JWT_SECRET=
FRONTEND_URL=http://localhost:5173

NODE_ENV=development
PORT=5001
COOKIE_DOMAIN=

CASHFREE_ENV=SANDBOX
CASHFREE_KEY_ID=
CASHFREE_KEY_SECRET=

FREE_ASTROLOGY_API_KEY=

HOSTINGER_EMAIL_USER=
HOSTINGER_EMAIL_PASSWORD=
HOSTINGER_SMTP_PORT=465

MAILGUN_API_KEY=
MAILGUN_DOMAIN=
MAILGUN_BASE_URL=
```

## Environment Variables

### Frontend

- `VITE_API_URL`: Backend API base URL used by the frontend.

### Backend Required

- `MONGODB_URI`: MongoDB connection string.
- `JWT_SECRET`: Secret used for auth tokens.
- `FRONTEND_URL`: Frontend base URL used in auth/email flows.

### Backend Usually Needed

- `NODE_ENV`: Usually `development` or `production`.
- `PORT`: Backend server port. Default in code is `5001`.
- `COOKIE_DOMAIN`: Optional cookie domain for production auth cookies.

### Payment Variables

- `CASHFREE_ENV`: Cashfree environment, for example `SANDBOX` or `PRODUCTION`.
- `CASHFREE_KEY_ID`: Cashfree key id.
- `CASHFREE_KEY_SECRET`: Cashfree secret key.

### Panchang / Astrology

- `FREE_ASTROLOGY_API_KEY`: Required if panchang/astrology API features are used.

### Email Variables

Use at least one working email provider setup.

Hostinger SMTP:

- `HOSTINGER_EMAIL_USER`
- `HOSTINGER_EMAIL_PASSWORD`
- `HOSTINGER_SMTP_PORT`

Mailgun:

- `MAILGUN_API_KEY`
- `MAILGUN_DOMAIN`
- `MAILGUN_BASE_URL` optional, only if a custom Mailgun API base URL is needed

## Run the Project

Frontend:

```bash
npm run dev
```

Backend:

```bash
cd backend
npm run dev
```

## Build

Frontend production build:

```bash
npm run build
```

Frontend preview:

```bash
npm run preview
```

Backend production start:

```bash
cd backend
npm start
```

## Useful Scripts

Frontend:

- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run lint`
- `npm run typecheck`

Backend:

- `npm run dev`
- `npm start`
- `npm run seed`
- `npm run cleanup-unverified`

## Notes

- The frontend default local API target is `http://localhost:5001/api`.
- OTP, verification, and password reset features depend on backend email configuration.
- Admin routes require an authenticated admin account.
- `dist/` contains compiled frontend assets and may need a rebuild after frontend changes.
