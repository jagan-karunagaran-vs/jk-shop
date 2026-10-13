# JK Shop — MERN E-Commerce Platform

JK Shop is a full-stack e-commerce application built with React, Node.js, Express, and MongoDB. It includes a customer storefront, a protected admin panel, and product recommendations using RapidMiner-generated data.

## Live Links

- Customer website: https://jk-shop-mauve.vercel.app
- Admin login: https://jk-shop-mauve.vercel.app/admin/login
- Backend API: https://jk-shop-backend.onrender.com
- GitHub repository: https://github.com/jagan-karunagaran-vs/jk-shop

## Technology Stack

### Frontend
- React and Vite
- React Router
- Redux Toolkit and React Redux
- Axios
- Bootstrap and custom CSS

### Backend
- Node.js and Express
- MongoDB and Mongoose
- JSON Web Tokens for authentication
- bcryptjs for password hashing
- express-rate-limit

### Deployment
- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas
- Version control: Git and GitHub

## Features

### Customer
- Registration, login, and logout
- Product listing and product details
- Product search, category filtering, sorting, and pagination
- Shopping cart and checkout
- Shipping address and Cash on Delivery
- Order history and eligible order cancellation
- Product ratings and reviews
- Profile management
- Contact form
- Indian rupee pricing and discount display
- Responsive layouts

### Admin
- Protected admin login and dashboard
- Product creation, editing, and archiving
- Product stock management
- Order management and status updates
- Customer management
- Contact message management
- Curated Best Sellers selection
- Dashboard statistics

Admin accounts are provisioned through a local setup script. Public registration creates customer accounts.

## Recommendation System

RapidMiner is used offline to generate product-to-product similarity data.

Workflow:

1. Export product data from MongoDB.
2. Process the exported data in RapidMiner.
3. Export the similarity results as CSV.
4. The backend reads the CSV to provide recommendations.

Files:

- `ecommerce-backend/scripts/exportProducts.js`
- `ecommerce-backend/rapidminer/products.csv`
- `ecommerce-backend/rapidminer/product_similarity.csv`

The similarity CSV contains `request`, `document`, and `distance` columns. Interpret the numeric values according to the similarity configuration used in the RapidMiner process.

Related products use product similarity data. Personalized recommendations use purchase history where available, with a catalog fallback for customers without purchase history.

This is an offline CSV integration; it does not call a hosted RapidMiner service for every request. Regenerate the exports when the product catalog changes.

## Project Structure

```text
ecommerce-app/
├── ecommerce-backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── rapidminer/
│   ├── routes/
│   ├── scripts/
│   ├── seed/
│   ├── utils/
│   ├── index.js
│   └── package.json
├── ecommerce-frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── redux/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── vercel.json
│   └── package.json
└── README.md
```

## Local Setup

### Prerequisites

- A Node.js version compatible with the project's Vite version
- npm
- MongoDB running locally or an accessible MongoDB Atlas database
- Git
- RapidMiner / Altair AI Studio if regenerating recommendation data

### Clone the Repository

```bash
git clone https://github.com/jagan-karunagaran-vs/jk-shop.git
cd jk-shop
```

### Backend Configuration

Create `ecommerce-backend/.env`:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/ecommerce_db
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
BEST_SELLER_MIN_ORDERS=10
LOW_STOCK_THRESHOLD=10
```

Use your own connection string and secret. Never commit `.env` files or passwords.

### Start the Backend

```bash
cd ecommerce-backend
npm ci
npm run dev
```

Local backend: http://localhost:5000

### Frontend Configuration

Create `ecommerce-frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Frontend environment variables are exposed to the browser. Do not place secrets in them.

### Start the Frontend

Open a separate terminal from the repository root:

```bash
cd ecommerce-frontend
npm ci
npm run dev
```

Local frontend: http://localhost:5173

### Create Admin Accounts

From `ecommerce-backend`:

```bash
npm run setup-admins
```

Follow the masked password prompts for the configured admin accounts. Keep passwords private.

### Optional Demo Products

For a development database that needs demo data:

```bash
node seed/seedProducts.js
```

The seed data includes demonstration reviews. These are sample reviews, not verified customer feedback.

### Export Products for RapidMiner

From `ecommerce-backend`:

```bash
node scripts/exportProducts.js
```

Process the generated product CSV in RapidMiner and export the similarity results to the backend's `rapidminer` directory.

## API Route Groups

| Base path | Purpose |
| --- | --- |
| `/api/auth` | Authentication |
| `/api/users` | Profiles and admin customer management |
| `/api/products` | Products, search, filtering, and reviews |
| `/api/orders` | Order creation and management |
| `/api/analytics` | Recommendations, Best Sellers, and dashboard statistics |
| `/api/contact` | Contact messages |

Protected endpoints require:

```http
Authorization: Bearer <token>
```

Admin endpoints additionally require an authorized admin account.

## Production Configuration

### Render Backend

- Root directory: `ecommerce-backend`
- Build command: `npm ci`
- Start command: `npm start`
- Configure backend environment variables in Render.
- Use the Atlas connection string for `MONGO_URI`.
- Set `CLIENT_URL` to the deployed frontend URL.
- Configure Atlas network access for the backend.

### Vercel Frontend

- Root directory: `ecommerce-frontend`
- Build command: `npm run build`
- Output directory: `dist`
- Set `VITE_API_URL` to:

```text
https://jk-shop-backend.onrender.com/api
```

`vercel.json` provides the React Router fallback for direct navigation and page refreshes.

## Verification

The following live flows were manually checked:

- Customer login
- Product loading
- Checkout and test order creation
- Admin login
- Customer order visibility in the admin panel

Local testing also covered responsive layouts and core shopping flows. This is manual verification, not a comprehensive automated test suite.

## Dependency Audit

At the latest local audit on 13 October 2026:

```bash
npm audit --omit=dev
```

reported zero known production dependency vulnerabilities.

The full audit still reported three high-severity findings in the development dependency chain involving nodemon, chokidar, and braces. These remain unresolved. A clean production audit is not a complete application security assessment.

## Notes

- Contact messages are stored in MongoDB; email delivery is not configured.
- Cash on Delivery does not process an online payment.
- Recommendation CSV files must be regenerated when needed.
- Credentials and database backups must not be committed to the repository.

## Author

Jagan Karunagaran

Built for the Full Stack Development V8 — Module 5 MERN integration assignment.