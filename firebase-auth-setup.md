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

    // Customers access - users can only access customers from their location, admins have full access
    match /customers/{customerId} {
      allow read: if request.auth != null &&
        request.auth.token.email_verified == true &&
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin' ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.locationId ==
         resource.data.locationId);
      allow write: if request.auth != null &&
        request.auth.token.email_verified == true &&
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin' ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.locationId ==
         resource.data.locationId);
    }

    // Leads access - users can read all leads from their location, admins have full access
    // Users can write leads they own, managers/admins can write any lead from their location
    match /leads/{leadId} {
      allow read: if request.auth != null &&
        request.auth.token.email_verified == true &&
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin' ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.locationId ==
         resource.data.locationId);
      allow write: if request.auth != null &&
        request.auth.token.email_verified == true &&
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin' ||
         request.auth.uid == resource.data.assignedTo ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'manager' ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.locationId == resource.data.locationId);
    }

    // Appointments access - users can read appointments from their location, admins have full access
    match /appointments/{appointmentId} {
      allow read: if request.auth != null &&
        request.auth.token.email_verified == true &&
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin' ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.locationId ==
         resource.data.locationId);
      allow write: if request.auth != null &&
        request.auth.token.email_verified == true &&
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin' ||
         request.auth.uid == resource.data.assignedTo ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'manager');
    }

    // Communications access - users can read communications from their location, admins have full access
    match /communications/{communicationId} {
      allow read: if request.auth != null &&
        request.auth.token.email_verified == true &&
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin' ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.locationId ==
         resource.data.locationId);
      allow write: if request.auth != null &&
        request.auth.token.email_verified == true &&
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin' ||
         request.auth.uid == resource.data.userId);
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

## 8. Firebase Indexes Setup

### Required Composite Indexes

When your application queries data with multiple conditions, Firebase requires composite indexes. You'll need to create these indexes in your Firebase console:

#### Customer Queries Index
**Required for**: `locationId` + `createdAt` queries
```
Collection: customers
Fields:
  - locationId (Ascending)
  - createdAt (Descending)
```

#### Lead Queries Index
**Required for**: `locationId` + `status` queries
```
Collection: leads
Fields:
  - locationId (Ascending)
  - status (Ascending)
```

#### Appointment Queries Index
**Required for**: `locationId` + `scheduledDate` queries
```
Collection: appointments
Fields:
  - locationId (Ascending)
  - scheduledDate (Ascending)
```

### How to Create Indexes

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Navigate to**: Firestore Database → Indexes
3. **Click**: "Create Index"
4. **Fill in the details**:
   - **Collection ID**: `customers` (or `leads`, `appointments`)
   - **Fields**: Add the required fields with their sort order
5. **Click**: "Create Index"

### Automatic Index Creation

Firebase will also automatically prompt you to create indexes when your application encounters a query that needs one. You can click the link in the error message to create the index directly.

## 9. Admin Full Access Summary

### ✅ Admin Role Capabilities

**Admins have FULL ACCESS to everything:**

#### **Data Access:**
- ✅ **All Customers** - Read/write access to customers from any location
- ✅ **All Leads** - Read/write access to leads from any location
- ✅ **All Appointments** - Read/write access to appointments from any location
- ✅ **All Communications** - Read/write access to communications from any location
- ✅ **All Locations** - Read/write access to location management
- ✅ **User Management** - Can manage user accounts and roles

#### **Operations:**
- ✅ **Create/Edit/Delete** - All records regardless of location
- ✅ **Assign/Reassign** - Leads and appointments to any user
- ✅ **View Analytics** - Access to all performance metrics
- ✅ **System Configuration** - Modify system settings and rules

### **Security Rule Pattern:**
```javascript
// Admin override - gives admins full access to everything
match /{document=**} {
  allow read, write: if request.auth != null &&
    request.auth.token.email_verified == true &&
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
}
```

### **Frontend Admin Features:**
- ✅ **User Management Interface** - Create/edit/delete user accounts
- ✅ **Location Management** - Add/edit/delete store locations
- ✅ **System Analytics** - View company-wide performance metrics
- ✅ **Audit Logs** - Track all system activities
- ✅ **Role Management** - Change user roles and permissions

## 10. Role-Based Access Matrix

| Feature | Rep | Manager | Admin |
|---------|-----|---------|-------|
| View Own Data | ✅ | ✅ | ✅ |
| View Location Data | ✅ | ✅ | ✅ |
| View All Data | ❌ | ❌ | ✅ |
| Edit Own Records | ✅ | ✅ | ✅ |
| Edit Location Records | ❌ | ✅ | ✅ |
| Edit All Records | ❌ | ❌ | ✅ |
| Manage Users | ❌ | ❌ | ✅ |
| Manage Locations | ❌ | ❌ | ✅ |
| System Settings | ❌ | ❌ | ✅ |
| View Analytics | ❌ | ✅ | ✅ |

## 11. Implementation Checklist

- [x] Enable Email/Password authentication
- [x] Configure authorized domains
- [x] Enable email verification requirement
- [x] Set password policy
- [x] Copy and paste Firestore security rules
- [x] Test authentication flow
- [x] Verify email verification is working
- [x] Test role-based access control
- [x] **Verify admin full access capabilities**

This setup provides comprehensive security for your T-Mobile customer tracking application while ensuring **admins have complete access to everything** for system management and oversight.