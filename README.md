# 🎯 SetLined - Customer Tracking System

A modern, enterprise-grade customer relationship management (CRM) system built specifically for T-Mobile retail locations. Built with React, TypeScript, Firebase, and Material-UI.

![SetLined Dashboard](https://via.placeholder.com/800x400/1976D2/FFFFFF?text=SetLined+Dashboard)

## ✨ Features

### 🔐 **Security & Authentication**
- **Firebase Authentication** with email verification
- **Role-based access control** (Rep, Manager, Admin)
- **Location-based data isolation** for multi-store support
- **Enterprise-grade security** with comprehensive Firestore rules

### 📊 **Real-Time Dashboard**
- **Live metrics** and KPIs
- **Real-time data updates** via Firestore listeners
- **Recent activity feed**
- **Performance analytics**

### 👥 **Customer Management**
- **Complete customer profiles** with contact information
- **Customer segmentation** (New, Existing, Loyalty)
- **Purchase history** and loyalty points tracking
- **Advanced search and filtering**

### 🎯 **Lead Management**
- **Lead lifecycle tracking** (New → Contacted → Qualified → Converted)
- **Priority management** and source tracking
- **Follow-up scheduling** and conversion analytics
- **Customer association** and lead scoring

### 📅 **Appointment Scheduling**
- **Calendar integration** with date/time scheduling
- **Appointment types** (Follow-up, Consultation, Sale)
- **Status management** and duration tracking
- **Customer/Lead association**

### 📱 **Mobile-First Design**
- **Responsive layout** optimized for all devices
- **Touch-friendly interface** with mobile FABs
- **Offline-capable** architecture
- **Progressive Web App** ready

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Firebase project with Firestore
- GitHub account (for deployment)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/setlined.git
cd setlined

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Firebase configuration

# Start development server
npm run dev
```

### Firebase Setup

1. **Create Firebase Project** at https://console.firebase.google.com/
2. **Enable Authentication** (Email/Password)
3. **Create Firestore Database**
4. **Copy security rules** from `firebase-auth-setup.md`
5. **Update environment variables** in `.env`

## 🏗️ Architecture

```
setlined/
├── src/
│   ├── components/          # Reusable UI components
│   ├── contexts/           # React contexts (Auth, etc.)
│   ├── hooks/             # Custom Firebase hooks
│   ├── pages/             # Main application pages
│   ├── types/             # TypeScript type definitions
│   └── firebase.ts        # Firebase configuration
├── public/                # Static assets
├── netlify.toml          # Netlify deployment config
└── firebase-auth-setup.md # Firebase configuration guide
```

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **UI Framework**: Material-UI (MUI)
- **Backend**: Firebase (Firestore + Auth)
- **Build Tool**: Vite
- **Deployment**: Netlify
- **State Management**: React Context + Custom Hooks
- **Real-time**: Firestore listeners

## 📁 Project Structure

### Core Components
- **Dashboard**: Real-time metrics and activity feed
- **Customers**: Customer profile management
- **Leads**: Lead tracking and conversion
- **Calendar**: Appointment scheduling

### Custom Hooks
- `useCustomers()`: Customer CRUD operations
- `useLeads()`: Lead management
- `useAppointments()`: Appointment scheduling
- `useAuth()`: Authentication state

## 🚀 Deployment

### Netlify (Recommended)
```bash
# Build the project
npm run build

# Deploy to Netlify
netlify deploy --prod --dir=dist
```

See `DEPLOYMENT.md` for detailed deployment instructions.

### Manual Deployment
```bash
# Build for production
npm run build

# Serve the dist folder on any static hosting service
# - Netlify
# - Vercel
# - AWS S3 + CloudFront
# - GitHub Pages
```

## 🔧 Configuration

### Environment Variables
```env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

### Firebase Security Rules
See `firebase-auth-setup.md` for comprehensive security configuration.

## 🧪 Testing

```bash
# Run tests
npm test

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📊 Performance

- **Bundle Size**: Optimized with code splitting
- **Loading**: Lazy-loaded components
- **Caching**: Static asset optimization
- **Real-time**: Efficient Firestore listeners

## 🔒 Security

- **Authentication**: Firebase Auth with email verification
- **Authorization**: Role-based access control
- **Data Isolation**: Location-based security rules
- **Input Validation**: Client and server-side validation
- **HTTPS**: Enforced on all deployments

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is proprietary software for T-Mobile use.

## 🆘 Support

For support and questions:
- Check `DEPLOYMENT.md` for common issues
- Review Firebase documentation
- Check browser console for errors

## 🎯 Roadmap

- [ ] Email notifications for appointments
- [ ] Calendar integrations (Google Calendar)
- [ ] Advanced reporting and analytics
- [ ] File attachments for customer documents
- [ ] SMS notifications
- [ ] Mobile app (React Native)

---

**Built with ❤️ for T-Mobile retail teams**

*Transforming customer relationships, one interaction at a time.*
