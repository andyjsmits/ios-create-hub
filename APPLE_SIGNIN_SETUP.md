# Apple Sign-in Setup Guide

This guide will help you set up Sign in with Apple for your PULSE iOS app using Supabase.

## Prerequisites

1. **Apple Developer Account**: You need an active Apple Developer Program membership ($99/year)
2. **App ID**: Your app must have a registered App ID in the Apple Developer Portal
3. **Supabase Project**: Your existing Supabase project with authentication enabled

## Step 1: Apple Developer Portal Setup

### 1.1 Create an App ID (if not already done)
1. Go to [Apple Developer Portal](https://developer.apple.com/account/)
2. Navigate to **Certificates, Identifiers & Profiles** → **Identifiers**
3. Click the **+** button to create a new identifier
4. Select **App IDs** and continue
5. Choose **App** and continue
6. Configure your App ID:
   - **Description**: PULSE iOS App
   - **Bundle ID**: `app.smits.pulse` (should match your existing bundle ID)
   - **Capabilities**: Check "Sign In with Apple"
7. Click **Continue** and then **Register**

### 1.2 Create a Services ID
1. In **Identifiers**, click **+** again
2. Select **Services IDs** and continue
3. Configure your Services ID:
   - **Description**: PULSE Web Auth
   - **Identifier**: `app.smits.pulse.web` (must be different from your App ID)
4. Click **Continue** and **Register**
5. Select your newly created Services ID
6. Check **Sign In with Apple** and click **Configure**
7. Set up web authentication:
   - **Primary App ID**: Select your app's App ID (`app.smits.pulse`)
   - **Domains and Subdomains**: Add your Supabase project domain:
     - Format: `[your-project-ref].supabase.co`
     - Example: `abcdefghijklmnop.supabase.co`
   - **Return URLs**: Add your Supabase auth callback URL:
     - Format: `https://[your-project-ref].supabase.co/auth/v1/callback`
     - Example: `https://abcdefghijklmnop.supabase.co/auth/v1/callback`
8. Click **Save** and **Continue**

### 1.3 Create a Private Key for Apple Sign-in
1. Go to **Keys** in the left sidebar
2. Click **+** to create a new key
3. Configure your key:
   - **Key Name**: PULSE Apple Sign-in Key
   - **Services**: Check "Sign In with Apple"
4. Click **Configure** next to "Sign In with Apple"
5. Select your Primary App ID
6. Click **Save** and **Continue**
7. Click **Register**
8. **Important**: Download the `.p8` file immediately (you can only download it once)
9. Note down the **Key ID** (10-character string)

### 1.4 Get Your Team ID
1. In the Apple Developer Portal, go to **Membership**
2. Note down your **Team ID** (10-character string)

## Step 2: Supabase Configuration

### 2.1 Configure Apple OAuth Provider
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to **Authentication** → **Providers**
3. Find **Apple** and toggle it on
4. Configure the Apple provider with the following information:

#### Required Fields:
- **Services ID**: `app.smits.pulse.web` (from Step 1.2)
- **Team ID**: Your Team ID from Step 1.4
- **Key ID**: Your Key ID from Step 1.3
- **Private Key**: Open the `.p8` file you downloaded and copy the entire content including the header and footer lines

#### Callback URL (for reference):
Your callback URL should be: `https://[your-project-ref].supabase.co/auth/v1/callback`

### 2.2 Update Site URL (if needed)
1. In Supabase Dashboard, go to **Authentication** → **Settings**
2. Update your **Site URL** if needed:
   - For development: `http://localhost:5173` (or your dev port)
   - For production: your actual domain
3. Add additional redirect URLs if needed:
   - `app.smits.pulse://auth/callback` (for mobile app)

## Step 3: iOS App Configuration (Capacitor)

### 3.1 Update Info.plist
Add the following to your `ios/App/App/Info.plist`:

```xml
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleURLName</key>
        <string>app.smits.pulse</string>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>app.smits.pulse</string>
        </array>
    </dict>
</array>
```

### 3.2 Add Sign in with Apple Entitlement
Add this to your `ios/App/App/App.entitlements`:

```xml
<key>com.apple.developer.applesignin</key>
<array>
    <string>Default</string>
</array>
```

## Step 4: Testing

### 4.1 Web Testing
1. Run your web app in development
2. Navigate to the auth page
3. Click "Continue with Apple"
4. You should be redirected to Apple's sign-in page

### 4.2 iOS Testing
1. Build and run your iOS app on a physical device (Apple Sign-in doesn't work in simulator)
2. Tap "Continue with Apple"
3. Use Face ID/Touch ID or your Apple ID credentials

## Step 5: Production Deployment

### 5.1 Update Production URLs
When deploying to production:
1. Update your Services ID configuration in Apple Developer Portal
2. Add your production domain to **Domains and Subdomains**
3. Update the **Return URLs** with your production Supabase URL
4. Update your Supabase **Site URL** and redirect URLs

## Important Notes

- **Apple Sign-in requires HTTPS** in production
- **Mobile testing** requires a physical device (not simulator)
- **Private key security**: Keep your `.p8` file secure and never commit it to version control
- **App Store Review**: Apps using Apple Sign-in must also offer Apple Sign-in as the primary option if other social logins are present

## Troubleshooting

### Common Issues:
1. **"Invalid client" error**: Check your Services ID and Bundle ID match
2. **"Invalid redirect URI"**: Verify your Return URLs in Apple Developer Portal
3. **"Invalid private key"**: Ensure the entire `.p8` file content is copied correctly
4. **Mobile app not opening**: Check your URL scheme configuration in Info.plist

### Testing Tips:
- Test on different devices and iOS versions
- Clear browser cookies between tests
- Check Supabase Auth logs for detailed error messages

## Links and Resources

- [Apple Developer Portal](https://developer.apple.com/account/)
- [Sign in with Apple Documentation](https://developer.apple.com/documentation/sign_in_with_apple)
- [Supabase Apple OAuth Guide](https://supabase.com/docs/guides/auth/social-login/auth-apple)
- [Capacitor Deep Links](https://capacitorjs.com/docs/guides/deep-links)