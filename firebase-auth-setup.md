# Firebase Authentication Setup Guide

## 1. Firebase Console Authentication Settings

### Sign-in Methods
Navigate to **Authentication > Sign-in method** in your Firebase console and enable:

#### ✅ Enabled Providers:
- **Email/Password**: Enable this for username/password authentication
- **Google** (Optional): For Google SSO integration

#### ❌ Disabled Providers:
- Keep all other providers disabled for security

### Authorized Domains
In **Authentication > Settings > Authorized domains**, add:
- `localhost` (for development)
- Your Netlify domain when deployed (e.g., `your-app.netlify.app`)

### Email Templates
Customize the email templates in **Authentication > Templates**:
- **Password reset email**: Customize with T-Mobile branding
- **Email verification**: Enable email verification requirement

## 2. Authentication Security Rules

### Email Verification Requirement
Go to **Authentication > Settings > User actions** and:
- ✅ **Enable email verification** - Require users to verify their email before they can sign in
- Set **Email verification** to **Required**

### Password Policy
Configure password requirements:
- ✅ **Minimum password length**: 8 characters
- ✅ **Require lowercase letters**
- ✅ **Require uppercase letters**
- ✅ **Require numbers**
- ✅ **Require non-alphanumeric characters**

## 3. Firestore Security Rules

Create these security rules in **Firestore > Rules**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read and write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Location-based access control
    match /locations/{locationId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Customers access - users can only access customers from their location
    match /customers/{customerId} {
      allow read: if request.auth != null &&
        request.auth.token.email_verified == true &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.locationId ==
        resource.data.locationId;
      allow write: if request.auth != null &&
        request.auth.token.email_verified == true &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.locationId ==
        resource.data.locationId;
    }

    // Leads access - users can read all leads from their location
    // but can only write leads they own or if they're a manager
    match /leads/{leadId} {
      allow read: if request.auth != null &&
        request.auth.token.email_verified == true &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.locationId ==
        resource.data.locationId;
      allow write: if request.auth != null &&
        request.auth.token.email_verified == true &&
        (request.auth.uid == resource.data.assignedTo ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['manager', 'admin'] ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.locationId == resource.data.locationId);
    }

    // Appointments access
    match /appointments/{appointmentId} {
      allow read: if request.auth != null &&
        request.auth.token.email_verified == true &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.locationId ==
        resource.data.locationId;
      allow write: if request.auth != null &&
        request.auth.token.email_verified == true &&
        (request.auth.uid == resource.data.assignedTo ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['manager', 'admin']);
    }

    // Communications access
    match /communications/{communicationId} {
      allow read: if request.auth != null &&
        request.auth.token.email_verified == true &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.locationId ==
        resource.data.locationId;
      allow write: if request.auth != null &&
        request.auth.token.email_verified == true &&
        request.auth.uid == resource.data.userId;
    }
  }
}
```

## 4. Firebase Storage Rules (if using file uploads)

If you plan to add file uploads, create these rules in **Storage > Rules**:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Users can upload their own profile pictures
    match /users/{userId}/profile.{extension} {
      allow read, write: if request.auth != null &&
        request.auth.uid == userId &&
        request.auth.token.email_verified == true;
    }

    // Users can upload customer-related documents
    match /customers/{customerId}/{allPaths=**} {
      allow read, write: if request.auth != null &&
        request.auth.token.email_verified == true &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.locationId ==
        get(/databases/$(database)/documents/customers/$(customerId)).data.locationId;
    }
  }
}
```

## 5. Additional Security Measures

### Session Management
- **Session timeout**: Configure in Firebase console (default is good)
- **Refresh token rotation**: Enabled by default

### Rate Limiting
Firebase has built-in rate limiting, but you can monitor usage in the console.

### Data Validation
Add these validation rules to your Firestore:

```javascript
// Example validation functions
function isValidEmail(email) {
  return email.matches("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}");
}

function isValidPhone(phone) {
  return phone.matches("^\\+?[1-9]\\d{1,14}$");
}
```

## 6. Implementation Checklist

- [ ] Enable Email/Password authentication
- [ ] Configure authorized domains
- [ ] Enable email verification requirement
- [ ] Set password policy
- [ ] Copy and paste Firestore security rules
- [ ] Test authentication flow
- [ ] Verify email verification is working
- [ ] Test role-based access control

## 7. Testing Your Setup

After configuring these rules:

1. **Test Email Verification**: Create a new account and verify email verification is required
2. **Test Password Requirements**: Try weak passwords to ensure policy enforcement
3. **Test Role-Based Access**: Create users with different roles and test permissions
4. **Test Location-Based Access**: Ensure users can only access data from their location

## 8. Production Considerations

Before going live:

- [ ] Review and test all security rules
- [ ] Enable Firebase Security Monitoring
- [ ] Set up Firebase Crashlytics for error monitoring
- [ ] Configure Firebase Performance Monitoring
- [ ] Set up proper logging and alerting
- [ ] Review GDPR compliance requirements
- [ ] Implement proper data retention policies

## 9. Emergency Access

For admin access in emergencies, consider adding:

```javascript
// Admin override function (use sparingly)
match /{document=**} {
  allow read, write: if request.auth != null &&
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
}
```

This setup provides comprehensive security for your T-Mobile customer tracking application while ensuring proper access controls and user management.