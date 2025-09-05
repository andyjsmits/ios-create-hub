# Account Deletion Feature Setup

This document explains the account deletion feature implementation for App Store compliance with Guideline 5.1.1(v).

## Overview

The app now includes a comprehensive account deletion feature that allows users to permanently delete their account and all associated data, meeting Apple's App Store requirements.

## Feature Location

Users can find the account deletion option in:
**User Page → Account Actions → Delete Account**

## Implementation Details

### 1. User Interface
- **Location**: `src/pages/UserPage.tsx`
- **UI Components**: 
  - Red "Delete Account" button in the Account Actions section
  - Confirmation dialog with detailed explanation of what will be deleted
  - Loading state during deletion process
  - Success/error notifications

### 2. Database Function
- **File**: `supabase/migrations/20240101000000_add_delete_user_function.sql`
- **Function**: `delete_user_account()`
- **Security**: SECURITY DEFINER with user authentication checks
- **Scope**: Deletes user from `auth.users` table and cascades to related data

### 3. Data Deletion Scope

When a user deletes their account, the following data is permanently removed:

- ✅ **User authentication data** (email, password, etc.)
- ✅ **User profile information**
- ✅ **All habit tracking data** (if tables exist)
- ✅ **Prayer logs and personal notes** (if tables exist)
- ✅ **App settings and preferences**
- ✅ **Any other user-specific data in the database**

### 4. User Experience Flow

1. User navigates to User Page
2. Clicks "Delete Account" button
3. Confirmation dialog appears with detailed explanation
4. User must confirm by clicking "Yes, delete my account"
5. Account deletion process runs
6. User receives success notification
7. User is automatically signed out and redirected to auth page

## App Store Compliance

This implementation meets Apple's requirements:

- ✅ **Complete account deletion**: Not just deactivation
- ✅ **In-app functionality**: No need to visit external websites
- ✅ **Clear confirmation process**: Prevents accidental deletion
- ✅ **Detailed explanation**: Users understand what will be deleted
- ✅ **Immediate effect**: Account is deleted instantly, not scheduled

## Database Setup Required

To complete the setup, run the database migration:

1. Apply the migration file `supabase/migrations/20240101000000_add_delete_user_function.sql`
2. The function will be automatically available for RPC calls from the client

### Manual Setup (if needed)

If you need to set up the function manually in your Supabase database:

1. Go to Supabase Dashboard → SQL Editor
2. Copy and paste the contents of the migration file
3. Execute the SQL to create the function

### Customization for Additional Tables

If you have additional user data tables, update the migration file to include DELETE statements for those tables:

```sql
-- Add these lines to the function for any additional user tables
DELETE FROM your_table_name WHERE user_id = current_user_id;
DELETE FROM another_table WHERE user_id = current_user_id;
```

## Testing

To test the account deletion feature:

1. Create a test user account
2. Add some data (habits, prayers, etc.)
3. Go to User Page → Delete Account
4. Confirm the deletion
5. Verify the account no longer exists
6. Verify all associated data has been removed

## Support

The implementation includes error handling and user-friendly messages. If deletion fails, users will see appropriate error messages and can contact support if needed.

## App Store Review Response

If Apple requests clarification on where to find the account deletion feature, respond with:

> "The account deletion feature is located in the User Page under 'Account Actions'. Users can tap the red 'Delete Account' button, which will show a confirmation dialog explaining what data will be deleted. Once confirmed, the account and all associated data are immediately and permanently deleted from our servers."