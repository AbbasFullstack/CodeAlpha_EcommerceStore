# 🛍️ CodeAlpha E-commerce Store

A complete full-stack e-commerce store built for the **CodeAlpha Full Stack Development Internship** using HTML, CSS, JavaScript, Node.js, Express.js, and MongoDB.

## ✨ Features

- 🛒 Product listings with responsive product cards
- 🔎 Product search
- 🗂️ Category filtering
- 📄 Pagination
- 🔍 Product details
- 🛍️ Authenticated shopping cart
- 📦 Order processing and order history
- 👤 User registration and login
- 🔐 JWT authentication
- 🔒 Password hashing with bcrypt
- 👑 Admin-only product management and order status updates
- 🧾 Server-side order total calculation
- 📉 Stock validation and deduction
- 🛡️ Helmet security headers
- 🌐 CORS support
- 📝 Morgan request logging
- ❤️ Health-check endpoint
- 📱 Responsive mobile-friendly frontend
- 🧪 Automated API smoke tests
- ⚙️ GitHub Actions CI on Node.js 20 and 22
- 🌱 Demo product seed script

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Authentication | JWT + bcryptjs |
| Security | Helmet, CORS |
| Logging | Morgan |
| Testing | Node.js built-in test runner |
| CI | GitHub Actions |

## 📁 Project Structure

```text
CodeAlpha_EcommerceStore/
├── .github/
│   └── workflows/
│       └── ci.yml
├── config/
│   └── db.js
├── controllers/
│   ├── authController.js
│   ├── cartController.js
│   ├── orderController.js
│   └── productController.js
├── middleware/
│   ├── admin.js
│   ├── auth.js
│   ├── errorHandler.js
│   └── validate.js
├── models/
│   ├── Cart.js
│   ├── Order.js
│   ├── Product.js
│   └── User.js
├── public/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── app.js
│   └── index.html
├── routes/
│   ├── authRoutes.js
│   ├── cartRoutes.js
│   ├── orderRoutes.js
│   └── productRoutes.js
├── tests/
│   └── app.test.js
├── .env.example
├── .gitignore
├── package.json
├── README.md
├── seed.js
└── server.js
```

## 🚀 Setup

### 1. Clone the repository

```bash
git clone https://github.com/AbbasFullstack/CodeAlpha_EcommerceStore.git
cd CodeAlpha_EcommerceStore
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy `.env.example` to `.env` and set your MongoDB connection string and a strong JWT secret.

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/codealpha_ecommerce
JWT_SECRET=replace_with_a_long_random_secret
```

For MongoDB Atlas, replace `MONGODB_URI` with your Atlas connection string.

### 4. Add demo products

Make sure MongoDB is running, then run:

```bash
node seed.js
```

This inserts eight ready-to-use demo products.

### 5. Start the application

Development:

```bash
npm run dev
```

Production-style start:

```bash
npm start
```

Open **http://localhost:5000**.

## 🧪 Testing

Run:

```bash
npm test
```

The automated suite checks:

- API health endpoint
- 404 handling
- JWT-protected routes
- Cart and order authentication
- Registration validation
- Login validation
- Invalid product IDs
- Static frontend delivery

GitHub Actions runs the test suite automatically on pushes and pull requests targeting `main`.

## 🔌 API

### Authentication

| Method | Endpoint | Auth |
|---|---|---|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/profile` | User |

### Products

| Method | Endpoint | Auth |
|---|---|---|
| GET | `/api/products` | Public |
| GET | `/api/products/:id` | Public |
| POST | `/api/products` | Admin |
| PUT | `/api/products/:id` | Admin |
| DELETE | `/api/products/:id` | Admin |

### Cart

| Method | Endpoint | Auth |
|---|---|---|
| GET | `/api/cart` | User |
| POST | `/api/cart/add` | User |
| DELETE | `/api/cart/remove/:productId` | User |

### Orders

| Method | Endpoint | Auth |
|---|---|---|
| POST | `/api/orders` | User |
| GET | `/api/orders` | User |
| GET | `/api/orders/:id` | User/Admin |
| PATCH | `/api/orders/:id/status` | Admin |

## 🔐 Authentication & Roles

A successful registration or login returns a JWT. The frontend sends it using:

```http
Authorization: Bearer <token>
```

Passwords are hashed with bcrypt before database storage.

New users receive the `user` role. Product management and order-status updates require the `admin` role.

For local development, register an account and change its role from `user` to `admin` directly in MongoDB.

## 🗃️ Database Models

- **User** — name, email, hashed password, role, timestamps
- **Product** — name, description, price, image, category, stock
- **Cart** — one cart per user with product quantities
- **Order** — user, item snapshots, total amount, status, timestamps

## 📱 Frontend

The responsive frontend provides:

- Sticky navigation
- Hero section
- Product grid
- Search and category filters
- Product detail view
- Login/register modal
- Shopping cart
- Checkout/order placement
- Order history
- Toast notifications
- Mobile responsive layout

## ⚠️ Production Notes

- Never commit a real `.env` file or JWT secret.
- Replace demo image URLs with your own production assets if required.
- A payment gateway is not included because it is outside the CodeAlpha Task 1 requirements.
- For production deployment, use HTTPS, a secured MongoDB deployment, restricted CORS origins, rate limiting, secure authentication storage, and a real payment provider.

## 👨‍💻 Author

**Abbas Hussain** — Full-Stack Developer

Built for the **CodeAlpha Full Stack Development Internship**.

## 📄 License

MIT License
