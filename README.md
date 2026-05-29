<div align="center">

# 🍔 Bite Buddy

### A Full-Stack Food Delivery & Logistics Management Platform

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101)](https://socket.io/)

*Seamless food ordering · Real-time delivery tracking · Multi-role platform management*

</div>

---

## 📖 Overview

**Bite Buddy** is a full-stack food delivery and logistics management platform built with a scalable **multi-role architecture** supporting four core entities — **Customer**, **Restaurant Owner**, **Delivery Agent**, and **Admin**.

The platform focuses on real-time order management, secure online payments, logistics coordination, and a responsive user experience across all devices.

---

## 🚀 Features

<details>
<summary><b>👤 Customer Module</b></summary>

- User authentication and authorization
- Browse restaurants and dynamic food menus
- Add/remove items from cart
- Secure online payments via **Razorpay**
- Real-time order tracking with live map integration
- Order history and profile management
- Responsive and smooth UI/UX

</details>

<details>
<summary><b>🍽️ Restaurant Owner Module</b></summary>

- Restaurant dashboard management
- Add, update, and remove food items
- Manage pricing and food availability
- Handle incoming orders in real time
- Monitor restaurant operations efficiently

</details>

<details>
<summary><b>🛵 Delivery Agent Module</b></summary>

- Dedicated delivery dashboard
- Manage assigned deliveries
- Update delivery status dynamically
- Real-time location tracking via **Leaflet Maps**
- Improved logistics and delivery coordination

</details>

<details>
<summary><b>🛠️ Admin Module</b></summary>

- Centralized platform management
- Manage users, restaurants, and delivery agents
- Monitor orders and payments
- Control operational workflows across the platform
- Role-based access and management

</details>

---

## ⚡ Core Highlights

| Feature | Description |
|---|---|
| 🔐 Multi-Role Auth | JWT-based authentication with role-based authorization |
| 📡 Real-Time Sync | Live order updates via Socket.io |
| 🗺️ Live Tracking | Real-time delivery tracking with Leaflet Maps |
| 💳 Secure Payments | Integrated Razorpay payment gateway |
| ☁️ Cloud Storage | Media management via Cloudinary |
| 📱 Responsive UI | Fully responsive frontend across all devices |
| 🔄 REST API | Scalable REST API architecture |

---

## 🧑‍💻 Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React.js · Redux Toolkit · TypeScript · Tailwind CSS |
| **Backend** | Node.js · Express.js |
| **Database** | MongoDB |
| **Auth & Security** | JWT Authentication · Role-Based Authorization |
| **Real-Time** | Socket.io |
| **Payments** | Razorpay |
| **Maps** | Leaflet Maps |
| **Media Storage** | Cloudinary |

---

## 📦 Architecture

Bite Buddy is built around four interconnected entities that communicate and synchronize in real time:

```
┌─────────────┐     places orders      ┌─────────────────────┐
│  Customer   │ ──────────────────────► │  Restaurant Owner   │
│             │ ◄─────────────────────  │                     │
└─────────────┘   live order updates    └─────────────────────┘
       │                                          │
       │ tracks delivery                confirms & prepares
       ▼                                          ▼
┌─────────────────┐  assigned deliveries  ┌─────────────┐
│  Delivery Agent │ ◄──────────────────── │    Admin    │
│                 │                       │  (Controls  │
└─────────────────┘                       │  Platform)  │
                                          └─────────────┘
```

---

## 🔄 Platform Workflow & Onboarding

To maintain platform authenticity and quality, restaurant owners and delivery agents go through an **Admin-approved onboarding process** before gaining dashboard access.

### 👨‍🍳 Restaurant Owner Flow

```
Register → Select "Restaurant Owner Applicant" → Submit Application
       → Admin Review → Approval → Dashboard Access Enabled
```

### 🛵 Delivery Agent Flow

```
Register → Select "Delivery Agent Applicant" → Submit Application
       → Admin Review → Approval → Delivery Dashboard Enabled
```

---

## 📦 Order Lifecycle

Every order moves through a structured real-time status pipeline:

```
Pending → Placed → Confirmed → Preparing → ReadyForPickup
       → AcceptedByAgent → OutForDelivery → Delivered
                                         ↘ Canceled (if applicable)
```

| Status | Description |
|---|---|
| `Pending` | Order created, awaiting payment confirmation |
| `Placed` | Payment successful, forwarded to restaurant |
| `Confirmed` | Restaurant accepted the order |
| `Preparing` | Restaurant actively preparing the food |
| `ReadyForPickup` | Food packed and ready for agent pickup |
| `AcceptedByAgent` | Delivery agent has accepted the assignment |
| `OutForDelivery` | Agent picked up order, en route to customer |
| `Delivered` | Order successfully delivered |
| `Canceled` | Order canceled (rejection / payment failure / unavailability) |

---

## 🚀 Unique Logistics System — Fallback Agent Program

One of Bite Buddy's key differentiators is its **Fallback Agent Program**, designed to minimize order cancellations caused by delivery agent unavailability.

### Intelligent Agent Assignment

When an order reaches `ReadyForPickup`, the system automatically finds the most optimal available agent:

```
Eligibility Condition:
  Agent must be AVAILABLE and within a 5 KM radius of the restaurant
```

### Fallback Mechanism

Each delivery agent is required to register as a fallback partner for **up to 5 nearby restaurants**. If no nearby agent accepts an order, the system **automatically assigns** it to a registered fallback agent.

```
Normal Flow:    ReadyForPickup → Nearby agents notified → Agent accepts
Fallback Flow:  No nearby agents → Auto-assign to registered fallback agent
```

This hybrid approach ensures reduced cancellation rates, improved delivery reliability, and better customer satisfaction.

---

## 💼 Business & Revenue Model

Bite Buddy is designed as a scalable business ecosystem benefiting all four entities.

### Admin Revenue Streams

**1. Per-Dish Platform Margin**
```
Final Customer Price = Restaurant Price + Platform Margin
```

**2. Service / Convenience Fee** — charged at checkout on every order.

### Value for Each Entity

| Entity | Benefit |
|---|---|
| 👤 Customer | Easy discovery, secure payments, live tracking |
| 🍽️ Restaurant Owner | Online exposure, order management, delivery coordination |
| 🛵 Delivery Agent | Consistent work via fallback program, live route visibility |
| 🛠️ Admin | Platform revenue through margins and service fees |

---

## ⚙️ Installation & Setup

```bash
# Clone the repository
git clone <repository-url>

# Navigate to the project
cd bite-buddy

# Install dependencies
npm install

# Start the development server
npm run dev
```

---

## 🎯 Objectives

- Simplify the online food ordering experience
- Improve last-mile delivery coordination
- Provide real-time operational management for all roles
- Build a scalable, multi-user platform
- Deliver a smooth and secure end-to-end user experience

---

## 📸 Upcoming Features

- [ ] AI-based food recommendations
- [ ] Advanced analytics dashboard
- [ ] Push notifications
- [ ] In-app chat system
- [ ] Coupon and loyalty system
- [ ] Route optimization for delivery agents

---

## 🤝 Contributing

Contributions, suggestions, and improvements are always welcome!

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## 📬 Contact

For collaboration or queries, feel free to connect!

---

<div align="center">

Made with ❤️ 

</div>
