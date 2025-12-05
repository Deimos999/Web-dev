# 🎭 Virtual Event Registration Portal

A comprehensive platform for hosting, registering, and streaming virtual events - similar to Steam's event system.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![React](https://img.shields.io/badge/react-18.2.0-blue.svg)

## 📋 Table of Contents

- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Database Schema](#database-schema)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)

## 🎯 Overview

A full-stack virtual event platform that enables users to discover, register, and attend online events with real-time streaming, interactive chat, Q&A, and payment processing.

### Key Capabilities

- 🎫 Event discovery and registration
- 💳 Integrated payment processing (Stripe)
- 🎥 Live and on-demand video streaming
- 💬 Real-time chat and Q&A
- 📊 Analytics dashboard for organizers
- 📧 Automated email notifications
- 🎨 Responsive design (mobile & desktop)

## 🏗️ System Architecture

### High-Level Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        A[Web Browser]
        B[Mobile Browser]
    end
    
    subgraph "Frontend - React App"
        C[React Components]
        D[State Management]
        E[WebSocket Client]
    end
    
    subgraph "Backend Services"
        F[Express API Server]
        G[WebSocket Server]
        H[Background Jobs]
    end
    
    subgraph "Data Layer"
        I[(PostgreSQL)]
        J[(Redis Cache)]
    end
    
    subgraph "External Services"
        K[Stripe Payments]
        L[SendGrid Email]
        M[Vimeo/YouTube]
        N[Clerk Auth]
    end
    
    A --> C
    B --> C
    C --> F
    C --> G
    F --> I
    G --> J
    F --> K
    F --> L
    F --> M
    F --> N
    H --> I
    H --> L
```

### Detailed Component Architecture

```mermaid
graph LR
    subgraph "Frontend Application"
        A1[Event Listing]
        A2[Event Details]
        A3[Registration Flow]
        A4[Video Player]
        A5[Chat Interface]
        A6[User Dashboard]
        A7[Admin Panel]
    end
    
    subgraph "API Layer"
        B1[Auth Routes]
        B2[Event Routes]
        B3[Registration Routes]
        B4[Payment Routes]
        B5[Stream Routes]
        B6[Chat Routes]
    end
    
    subgraph "Business Logic"
        C1[Auth Service]
        C2[Event Service]
        C3[Registration Service]
        C4[Payment Service]
        C5[Stream Service]
        C6[Notification Service]
    end
    
    A1 --> B2
    A2 --> B2
    A3 --> B3
    A4 --> B5
    A5 --> B6
    A6 --> B1
    A7 --> B2
    
    B1 --> C1
    B2 --> C2
    B3 --> C3
    B4 --> C4
    B5 --> C5
    B6 --> C1
```

### Data Flow - Registration Process

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as API Server
    participant DB as Database
    participant S as Stripe
    participant E as Email Service
    
    U->>F: Click "Register"
    F->>A: POST /api/registrations
    A->>DB: Check event capacity
    DB-->>A: Capacity available
    A->>S: Create checkout session
    S-->>A: Session URL
    A-->>F: Return checkout URL
    F->>S: Redirect to Stripe
    U->>S: Complete payment
    S->>A: Webhook: payment_success
    A->>DB: Create registration
    A->>E: Send confirmation email
    E-->>U: Email delivered
    A-->>F: Registration confirmed
    F->>U: Show success page
```

### Real-time Chat Architecture

```mermaid
graph TB
    subgraph "Client Side"
        A[User Browser]
        B[Socket.io Client]
    end
    
    subgraph "Server Side"
        C[Socket.io Server]
        D[Redis Pub/Sub]
        E[Message Queue]
    end
    
    subgraph "Storage"
        F[(Redis Cache)]
        G[(PostgreSQL)]
    end
    
    A --> B
    B <--> C
    C <--> D
    C --> E
    D --> F
    E --> G
    C --> F
```

## 🗄️ Database Schema

### Entity Relationship Diagram

```mermaid
erDiagram
    USERS ||--o{ REGISTRATIONS : creates
    USERS ||--o{ EVENTS : organizes
    USERS ||--o{ CHAT_MESSAGES : sends
    EVENTS ||--o{ REGISTRATIONS : has
    EVENTS ||--o{ CHAT_MESSAGES : contains
    EVENTS ||--o{ CATEGORIES : belongs_to
    REGISTRATIONS ||--|| PAYMENTS : has
    
    USERS {
        uuid id PK
        string email UK
        string name
        string role
        timestamp created_at
    }
    
    EVENTS {
        uuid id PK
        string title
        text description
        string image_url
        string video_url
        timestamp start_time
        int duration
        decimal price
        int capacity
        uuid organizer_id FK
        uuid category_id FK
        string status
    }
    
    REGISTRATIONS {
        uuid id PK
        uuid user_id FK
        uuid event_id FK
        string status
        uuid payment_id FK
        timestamp registered_at
    }
    
    PAYMENTS {
        uuid id PK
        uuid registration_id FK
        string stripe_payment_id
        decimal amount
        string currency
        string status
        timestamp paid_at
    }
    
    CATEGORIES {
        uuid id PK
        string name
        string slug
    }
    
    CHAT_MESSAGES {
        uuid id PK
        uuid event_id FK
        uuid user_id FK
        text message
        timestamp sent_at
    }
```

### Prisma Schema

```prisma
model User {
  id            String         @id @default(uuid())
  email         String         @unique
  name          String
  role          String         @default("user")
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  registrations Registration[]
  events        Event[]
  messages      ChatMessage[]
}

model Event {
  id            String         @id @default(uuid())
  title         String
  description   String
  imageUrl      String
  videoUrl      String?
  startTime     DateTime
  duration      Int            // in minutes
  price         Decimal        @default(0)
  capacity      Int
  organizerId   String
  categoryId    String
  status        String         @default("draft")
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  organizer     User           @relation(fields: [organizerId], references: [id])
  category      Category       @relation(fields: [categoryId], references: [id])
  registrations Registration[]
  messages      ChatMessage[]
}

model Registration {
  id            String    @id @default(uuid())
  userId        String
  eventId       String
  status        String    @default("pending")
  paymentId     String?   @unique
  registeredAt  DateTime  @default(now())
  user          User      @relation(fields: [userId], references: [id])
  event         Event     @relation(fields: [eventId], references: [id])
  payment       Payment?  @relation(fields: [paymentId], references: [id])
  
  @@unique([userId, eventId])
}

model Payment {
  id              String        @id @default(uuid())
  stripePaymentId String        @unique
  amount          Decimal
  currency        String        @default("usd")
  status          String
  paidAt          DateTime      @default(now())
  registration    Registration?
}

model Category {
  id      String  @id @default(uuid())
  name    String
  slug    String  @unique
  events  Event[]
}

model ChatMessage {
  id        String   @id @default(uuid())
  eventId   String
  userId    String
  message   String
  sentAt    DateTime @default(now())
  event     Event    @relation(fields: [eventId], references: [id])
  user      User     @relation(fields: [userId], references: [id])
}
```

## ✨ Features

### User Features
- Browse and search events
- Filter by category, date, price
- Register for free/paid events
- Secure payment processing
- Watch live and recorded streams
- Participate in live chat
- Ask questions in Q&A
- Download event materials
- Calendar integration

### Organizer Features
- Create and manage events
- Set pricing and capacity
- Upload promotional materials
- Track registrations
- View analytics dashboard
- Send bulk emails to attendees
- Moderate chat and Q&A
- Export attendee lists

### Admin Features
- User management
- Event approval workflow
- System analytics
- Revenue tracking
- Content moderation tools

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 18 + Vite
- **Styling:** TailwindCSS
- **State Management:** Zustand / React Query
- **Routing:** React Router v6
- **Real-time:** Socket.io Client
- **Video Player:** Video.js / React Player
- **Forms:** React Hook Form + Zod

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **ORM:** Prisma
- **Authentication:** Clerk / Firebase Auth
- **Real-time:** Socket.io
- **Job Queue:** Bull (Redis-based)
- **Email:** SendGrid / Resend
- **Payments:** Stripe

### Database & Cache
- **Primary DB:** PostgreSQL 15
- **Cache:** Redis 7
- **File Storage:** AWS S3 / Cloudflare R2

### DevOps
- **Frontend Hosting:** Vercel
- **Backend Hosting:** Railway / Render
- **CI/CD:** GitHub Actions
- **Monitoring:** Sentry
- **Analytics:** Mixpanel / PostHog

## 🚀 Getting Started

### Prerequisites

```bash
node >= 18.0.0
npm >= 9.0.0
postgresql >= 15
redis >= 7
```

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/event-portal.git
cd event-portal
```

2. **Install dependencies**
```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

3. **Environment Setup**

Create `.env` files in both frontend and backend directories:

**Backend `.env`:**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/eventportal"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-secret-key"
CLERK_SECRET_KEY="your-clerk-secret"
STRIPE_SECRET_KEY="your-stripe-secret"
STRIPE_WEBHOOK_SECRET="your-webhook-secret"
SENDGRID_API_KEY="your-sendgrid-key"
AWS_ACCESS_KEY_ID="your-aws-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret"
PORT=5000
```

**Frontend `.env`:**
```env
VITE_API_URL=http://localhost:5000
VITE_CLERK_PUBLISHABLE_KEY=your-clerk-key
VITE_STRIPE_PUBLISHABLE_KEY=your-stripe-key
```

4. **Database Setup**
```bash
cd backend
npx prisma migrate dev
npx prisma db seed
```

5. **Run the application**

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev

# Terminal 3 - Redis (if not running as service)
redis-server
```

Visit `http://localhost:5173` to see the app!

## 📡 API Documentation

### Authentication Endpoints

```
POST   /api/auth/register       - Register new user
POST   /api/auth/login          - Login user
POST   /api/auth/logout         - Logout user
GET    /api/auth/me             - Get current user
```

### Event Endpoints

```
GET    /api/events              - List all events
GET    /api/events/:id          - Get event details
POST   /api/events              - Create event (organizer)
PUT    /api/events/:id          - Update event (organizer)
DELETE /api/events/:id          - Delete event (organizer)
GET    /api/events/:id/stream   - Get stream access token
```

### Registration Endpoints

```
POST   /api/registrations       - Register for event
GET    /api/registrations/me    - Get my registrations
DELETE /api/registrations/:id   - Cancel registration
```

### Payment Endpoints

```
POST   /api/payments/checkout   - Create Stripe checkout session
POST   /api/payments/webhook    - Stripe webhook handler
GET    /api/payments/:id        - Get payment details
```

### Chat Endpoints (WebSocket)

```
connect    - Connect to chat server
join       - Join event chat room
message    - Send message
leave      - Leave chat room
disconnect - Disconnect from server
```

## 🎯 4-Week Development Timeline

```mermaid
gantt
    title 4-Week Project Timeline
    dateFormat  YYYY-MM-DD
    section Week 1
    Setup & Auth           :w1t1, 2024-01-01, 2d
    Event Listing         :w1t2, after w1t1, 3d
    section Week 2
    Registration System   :w2t1, 2024-01-08, 2d
    Payment Integration   :w2t2, after w2t1, 3d
    section Week 3
    Video Streaming       :w3t1, 2024-01-15, 2d
    Chat & Interactivity  :w3t2, after w3t1, 3d
    section Week 4
    Dashboard & Admin     :w4t1, 2024-01-22, 2d
    Testing & Polish      :w4t2, after w4t1, 2d
    Deployment           :w4t3, after w4t2, 1d
```

## 🌐 Deployment

### Frontend (Vercel)

```bash
cd frontend
vercel --prod
```

### Backend (Railway)

```bash
cd backend
railway up
```

### Environment Variables

Make sure to set all environment variables in your hosting platform's dashboard.

## 📊 Monitoring & Analytics

- **Error Tracking:** Sentry
- **Performance:** Vercel Analytics
- **User Analytics:** Mixpanel
- **Logs:** Better Stack (Logtail)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Your Name** - *Initial work* - [YourGitHub](https://github.com/yourusername)

## 🙏 Acknowledgments

- Inspired by Steam's event system
- Built with modern web technologies
- Community feedback and contributions

---

**⭐ Star this repo if you find it helpful!**