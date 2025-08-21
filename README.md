# GEBEYA API

A **comprehensive backend API** for a **multi-vendor e-commerce platform**, built with **NestJS**, **PostgreSQL**, and **TypeORM**.  
It follows the **CQRS pattern** with **event-driven architecture** and provides robust features for **admins, vendors, and users**.  

<div>
  <img width="701" height="327" alt="image" src="https://github.com/user-attachments/assets/8c00fdeb-0ef3-4eff-a59b-eb903ed3419b" />

</div>
---

## ✨ Features

- **Authentication & Authorization** (Admin, Vendor, Customer roles)  
- **Multi-vendor store support** with admin validation  
- **Product management** (CRUD, approval workflow, categories)  
- **Advanced filtering & pagination** for products and stores  
- **Chapa payment integration** (initialize & verify transactions)  
- **Persistent cart** (7-day expiration with cron job cleanup)  
- **Order management** with payment validation  
- **Comments & Reviews** (products and stores, editable)  
- **Email service** for signup, store creation, order confirmation, and payment verification  
- **CQRS + Event-driven architecture** for scalability
- **Full Test Coverage** (Unit Test) 

---

## 🛠 Tech Stack

- **Framework**: NestJS  
- **Database**: PostgreSQL + TypeORM  
- **Payment Gateway**: Chapa  
- **Email Service**: Gmail SMTP  
- **Architecture**: CQRS + Event-driven  
- **Other**: Cron jobs for cart cleanup
- **Test**: Jest

---

## ⚙️ Environment Variables

Create a `.env` file in the project root with the following values:

```env
# Application
PORT=3000
PUBLIC_URL=http://localhost:3000
BASE_URL=http://localhost:3000
FRONTEND_URL=""

# Database
DATABASE_URL="postgres://username:password@localhost:5432/gebeya"

# JWT
JWT_SECRET="your-secret-key"

# Gmail SMTP (for email notifications)
GMAIL_HOST=smtp.gmail.com
GMAIL_PORT=587
GMAIL_USER="your-email@gmail.com"
GMAIL_PASSWORD="your-app-password"

# Chapa Payment Integration
CHAPA_INITIALIZER="https://api.chapa.co/v1/transaction/initialize"
CHAPA_VERIFY_URL="https://api.chapa.co/v1/transaction/verify"
CHAPA_PUBLIC_KEY="your-public-key"
CHAPA_SECRET_KEY="your-secret-key"
```
---

## Installation

Clone the repository:
```bash
git clone https://github.com/Estifanos58/gebeya-api.git
cd gebeya-api
```

Install dependencies:
```bash
npm install
```

Run database migrations:
```bash
npm run typeorm migration:run
```

Start the development server:
```bash
npm run start:dev
```

For Testing
```bash
npm run test
```


