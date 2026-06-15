# simple-survey-mobile

Mobile app for the Simple Survey platform — built with **React Native** and **Expo**.

## Prerequisites

- Node.js v18 or higher
- npm
- Expo Go app installed on your Android phone (from Google Play Store)
- Expo account at https://expo.dev (for building APK)
- Phone and PC on the same WiFi network for Expo Go testing

## Technologies Used

- React Native
- Expo SDK 53
- React Navigation (Stack)

## Screens

| Screen | Description |
|--------|-------------|
| `SurveyList` | Browse and select available surveys |
| `SurveyForm` | Step-by-step form with review page before submission |

## Getting Started

```bash
git clone https://github.com/symonmwangi/simple-survey-mobile.git
cd simple-survey-mobile
npm install
npx expo start
```

Scan the QR code with the **Expo Go** app on your phone.

## Features

- Lists all active surveys from the API
- Step-by-step question flow with progress bar
- **Review page** before submitting — tap Edit to go back to any question
- Supports question types: text, textarea, email, multiple_choice, checkbox, rating
- Required field validation with native alerts
- Clean indigo + white UI

## Building APK (Android)

```bash
npx eas build --platform android --profile preview
```

Requires an [Expo account](https://expo.dev) and EAS CLI.

## API

Connects to: `https://simple-survey-api-production.up.railway.app/api`

Configured in `src/lib/api.js`.

## Assumptions Made

- The mobile app is implemented as a WebView wrapper loading the live web application (https://simple-survey-web-one.vercel.app). This approach was chosen for reliability after native React Navigation modules caused consistent crashes on Android 14 devices.
- The app requires an internet connection to function as all data is fetched from the live API.
- Any updates to the web application are automatically reflected in the mobile app without requiring an APK rebuild.
- File downloads (certificates) are handled by opening the download URL in the device's default browser since Android WebViews do not support file downloads natively.
- The Android back button is handled to navigate back through web history rather than closing the app.
