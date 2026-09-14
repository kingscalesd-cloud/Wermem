# Kingscale Digitals — Firebase + GitHub Pages Ready 👑

This package contains the finalized Kingscale Digitals frontend connected to your Firebase Web App configuration.

## Included

- Google Authentication with Firebase Auth (redirect flow).
- Email/password authentication.
- Password reset.
- Auth-protected dashboard.
- Firestore `users/{uid}` profile documents.
- Firestore-backed account settings.
- Server-managed `subscriptions/{uid}` path.
- Firestore rules that prevent clients from changing protected subscription/referral fields.
- Dynamic referral links that use the actual deployed site origin.
- Static HTML/CSS/JS structure suitable for GitHub Pages.

## Your Firebase project

The Web App configuration supplied from Firebase Console is already installed in `firebase-config.js` for project:

`kingscale-digitals`

The Firebase browser config is not an Admin SDK secret. Do **not** add Admin SDK service-account JSON, private keys, payment secrets, or other server credentials to this repository.

## Firebase Console setup — required once

1. Open Firebase Console and select **Kingscale Digitals**.
2. Go to **Authentication → Sign-in method**.
3. Enable **Google**.
4. Enable **Email/Password**.
5. Go to **Firestore Database → Create database**.
6. Publish the included `firestore.rules`.
7. Go to **Authentication → Settings → Authorized domains** and add your GitHub Pages domain after it is created, for example `YOUR-USERNAME.github.io`.

For local testing, add `localhost` if Firebase requires it.

## GitHub Pages deployment

### Option A — easiest

1. Create a new GitHub repository, for example `kingscale-digitals`.
2. Extract this ZIP.
3. Upload **the contents of this folder** to the repository root. The repository root should contain `index.html`, `firebase.js`, `firebase-config.js`, `dashboard/`, `login/`, and `signup/`.
4. Commit the files.
5. On GitHub open **Settings → Pages**.
6. Under **Build and deployment**, select **Deploy from a branch**.
7. Select your main branch and `/ (root)`.
8. Save and wait for GitHub Pages to publish.
9. Copy the resulting `https://YOUR-USERNAME.github.io/REPOSITORY/` address.
10. Add the appropriate host/domain to Firebase Authentication **Authorized domains**.

### Important GitHub Pages note

If the repository is not the user's root `USERNAME.github.io` repository, GitHub Pages will normally publish under a repository subpath. This project uses relative page/module paths so the main pages can work from that structure.

## Firestore data model

### `users/{uid}`

Created automatically after successful Google or email/password authentication.

Typical fields:

- `uid`
- `name`
- `username`
- `email`
- `phone`
- `age`
- `photoURL`
- `provider`
- `referralCode`
- `settings.notifications`
- `settings.marketing`
- `settings.securityAlerts`
- `createdAt`
- `updatedAt`

### `subscriptions/{uid}`

Readable by the signed-in owner but not writable from the browser. Use a trusted backend/Cloud Functions process for plan changes, payments, renewals, expiry, and rewards.

Recommended fields:

- `planId`
- `planName`
- `status`
- `progress`
- `daysRemaining`
- `storage`
- `features`
- `startedAt`
- `expiresAt`
- `updatedAt`

## Local test

Do not open `index.html` using `file://`. Use an HTTP server, for example:

```bash
python3 -m http.server 8080
```

Then visit `http://localhost:8080/`.

## Security boundary

The browser is treated as untrusted. Firestore rules protect the database, and subscription/referral rewards that affect money or premium access should be calculated/verified on a trusted backend.

## Next production stage

After GitHub Pages + Firebase Auth + Firestore are verified, the recommended next layer is:

1. Cloud Functions/backend.
2. Real subscription/payment verification.
3. Server-controlled plan activation/expiry.
4. Server-controlled referral reward calculations.
5. Optional Firebase App Check.
6. Production monitoring and error logging.


## Kingscale page flow

The intended GitHub Pages flow is:

1. Blog/home page (`index.html`) → **Get Started** → Sign Up.
2. Sign Up → **Log In** (new accounts are sent to the login page after registration).
3. Login → **Blog** (`index.html#blog`) after successful authentication.
4. Blog/home page → **Get Started** → Dashboard for authenticated users.
5. Dashboard is protected by Firebase Authentication and sends signed-out visitors back to Login.
