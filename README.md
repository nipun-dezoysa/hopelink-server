# Hopelink Platform - Backend

The **Hopelink Platform** backend is built using the **Express.js** framework, adhering to the RESTful API principles. The system is modularly designed with a focus on **security**, **scalability**, and **performance** to efficiently manage user sessions, campaign management, and secure payment processing.
<br><br>**Live Website**: [Hopelink Platform](https://hopelinks.netlify.app)
---

## Features

1. **Authentication & Authorization**:
   - JWT-based user authentication.
   - Role-based access control for Admin, Registered Users, and Guest Users.

2. **Payment Processing**:
   - Secure donation processing with Stripe API.
   - Real-time payment status tracking.

3. **Email Notifications**:
   - Automated notifications for registration, donation receipts, and campaign updates.
   - Email templates built using the Builder pattern for scalability.

4. **File Management**:
   - Custom middleware for handling campaign-related media (images, PDFs).
   - Files stored securely in MongoDB and retrievable via API.

---

## Technologies Used

- **Backend Framework**: Express.js
- **Database**: MongoDB
- **Authentication**: JWT
- **Payment Gateway**: Stripe API
- **Email Services**: Nodemailer with Gmail SMTP
- **File Management**: Multer (middleware)

---
