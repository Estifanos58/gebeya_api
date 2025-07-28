## GEBEYA API

# Authentication
 - [x] Registration, Login (JWT)
 - [x] Roles: (admin, merchant, customer, delivery)
 - [x] Email verification via OTP
 - [x] Password reset via email + expiration
 - [x] Refresh token + Access token management
 - [x] Rate-limiting on Login, OTP, reset
 - [] Session activity tracking (devices, IP)
 - [] User ban. disable by admin

# store 
  - [x] create a store
  - [x] Store rating and Reviews
  - [] Inventory managenment(stoke, low stoke warning) ***
  - [x] Add Product to Store
  - [x] Update Product In Store
  - [x] Remove product from Store 
  - [x] get store Data
  - [x] get product detail 
  - [] Notify Store Owner When certain Product quantity reachs Low Point ***
  - [x] Notify Store Owner When A Product is Purchased

# Cart System
  - [x] Add/ update / remove items from Cart
  - [x] Sync Cart When User Logs In
  - [] Cart expires after X days  ***
  - [x] Save for Later

# Order System
  - [x] Order status (pending, shipped, delivered, cancelled)
  - [x] Automatic order number generator
  - [x] Delivery address + contact info on Order
  - [] Merchant see All Orders

# Product Reviews and Ratings
  - [x] Review system(1-5 stars + comments)
  - [x] Full-text search by name,  category
  - [x] Price range filtering
  - [x] Sort by price, populating, rating
  - [] Related/ recommended products
  - [] Search analytitcs/ logging

# Admin Dashboard
  - [] View metrics (total sales, users, acive merchants)
  - [] Approve/ reject products/ stores
  - [] View best selling products
  - [] Block users/stores/products
  - [] View transactions and payment Status
  - [] Export CSV report

# Payment System 💳 (NEW)
  - [x] Integrate with payment gateway (e.g., Stripe, Chapa, Flutterwave)
  - [x] Generate payment session URL (redirect / inline)
  - [x] Payment webhook listener (success, failure, timeout)
  - [x] Mark order as paid on successful payment
  - [x] Save transaction metadata (payment ID, gateway, status)
  - [] User payment history endpoint
  - [] Merchant payout tracking
  - [] Admin view all transactions
  - [] Support refund logic
  - [] Support internal wallet/credit balance (optional)
  - [] OTP-confirmed high-value transactions (optional)

⚙️ Future: Automation, Cron, Events, Queues
  - [] Cron job to clean expired carts
  - [x] Event-based notification system
  - [] Background queue to process emails
  - [] Low-stock product alert via queue
  - [] Retry failed payments automatically
  - [] Reward system using scheduled tasks
<!-- # Customer
  [] register
  [] search store
  [] search product
  [] send email when purchase made
  [] make a purchase 
  [] add  -->
