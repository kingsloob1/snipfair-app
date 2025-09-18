# Snipfair

A comprehensive beauty service marketplace platform built with Laravel 12 and Inertia.js (React), connecting customers with professional beauty stylists for seamless appointment booking and service management.

## 🎯 Overview

Snipfair is a modern beauty service platform that facilitates connections between customers seeking beauty services and professional stylists. The platform provides a complete ecosystem for appointment management, real-time communication, payment processing, and service delivery tracking.

## ✨ Key Features

### 👤 Multi-Role System
- **Customers**: Browse stylists, book appointments, manage payments
- **Stylists**: Manage services, schedules, earnings, and client interactions
- **Admins**: Platform oversight, user management, and system configuration

### 📅 Smart Appointment Management
- Real-time booking system with availability checking
- Flexible scheduling with time slot management
- Appointment status tracking (pending, approved, in-progress, completed)
- Cancellation and rescheduling with penalty management
- Unique booking codes for secure meetup confirmation

### 💰 Integrated Payment System (Not yet implemented)
- Wallet-based transactions with top-up functionality
- Subscription plans for stylists (Free, Basic, Premium)
- Automatic earning distribution (85% stylist, 15% platform)
- Withdrawal management with multiple payment methods
- Transaction history and financial reporting

### 🗨️ Real-time Communication
- WebSocket-powered live chat between customers and stylists
- Typing indicators and message status tracking
- File sharing capabilities
- Notification system for appointments and messages

### 📱 Portfolio & Service Management
- Rich media portfolio uploads for stylists
- Service categorization and pricing
- Featured stylist promotions
- Rating and review system
- Work sample galleries

### 📍 Location Services
- GPS-based stylist discovery
- Distance calculation between customers and stylists
- Location consent management
- Address validation for service delivery

### 🔔 Advanced Notifications
- Email verification with OTP
- Real-time push notifications
- Custom notification preferences
- Admin notification system

## 🛠️ Tech Stack

### Backend
- **Laravel 12** - Modern PHP framework
- **Inertia.js** - SPA-like experience without API complexity
- **Laravel Reverb** - Real-time WebSocket server
- **Laravel Sanctum** - Authentication system
- **Pusher** - Real-time event broadcasting

### Frontend
- **React 18** - Component-based UI library
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **Framer Motion** - Animation library
- **Recharts** - Data visualization

### Additional Tools
- **Vite** - Fast build tool and dev server
- **Ziggy** - Laravel route generation for JavaScript
- **Laravel Echo** - WebSocket client integration

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ruxy1212/snipfair.git
   cd snipfair
   ```

2. **Install PHP dependencies**
   ```bash
   composer install
   ```

3. **Install Node.js dependencies**
   ```bash
   pnpm install
   ```

4. **Environment setup**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

5. **Database setup**
   ```bash
   php artisan migrate
   php artisan db:seed
   ```

6. **Development server**
   ```bash
   composer run dev
   ```
   This runs Laravel server, queue worker, and Vite dev server concurrently.

## 📁 Project Structure

```
app/
├── Events/           # Real-time events (appointments, messages, notifications)
├── Models/           # Database models (User, Appointment, Portfolio, etc.)
├── Http/Controllers/ # API and web controllers by role
├── Helpers/          # Utility classes (notifications, admin, chat)
└── Notifications/    # Email and system notifications

resources/
├── js/
│   ├── Pages/       # Inertia.js page components
│   ├── Components/  # Reusable React components
│   └── Layouts/     # Application layouts
└── views/           # Blade templates

database/
├── migrations/      # Database schema
├── seeders/         # Sample data generators
└── factories/       # Model factories for testing
```

## 🔧 Development Commands

```bash
# Start development environment
composer run dev

# Run tests
composer run test

# Code formatting
npm run lint

# Build for production
npm run build

# Database operations
php artisan migrate:fresh --seed
```

## 🏗️ Core Models

- **User**: Multi-role user system (customer, stylist, admin)
- **Appointment**: Booking and service delivery management
- **Portfolio**: Stylist service offerings and media
- **Subscription**: Stylist subscription and payment plans
- **Transaction**: Financial operations and earning tracking
- **Conversation**: Real-time messaging system

## 🔐 Authentication & Authorization

- Email verification with OTP system
- Role-based access control
- Session-based authentication
- API token management for mobile apps

## 📊 Admin Features

- User management and approval workflows
- Payment verification and transaction oversight
- Content management (FAQs, reviews, featured stylists)
- System analytics and reporting
- Platform configuration management

## 🌐 API Endpoints

The platform provides RESTful APIs for:
- Customer booking operations
- Stylist appointment management
- Real-time location services
- Payment processing
- Admin panel functionality

## 📱 Mobile-Ready

- Responsive design for all device sizes
- Progressive Web App (PWA) capabilities
- Touch-optimized interfaces
- Mobile-specific features (GPS, camera integration)

---
