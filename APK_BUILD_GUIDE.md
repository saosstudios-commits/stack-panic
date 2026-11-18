# Building Stack Panic as an Android APK

This project is a self-contained Vite + TypeScript + Three.js + cannon-es web game (`dist/` output) ready to be wrapped into an Android `.apk` with **Capacitor** (or **Cordova** / **Trusted Web Activity**).

## 1. Prerequisites
- Node.js 20+ and npm
- Java JDK 17+
- Android SDK (Android Studio or `cmdline-tools`) with `ANDROID_HOME` set

## 2. Build Web Bundle & Wrap with Capacitor
```bash
npm install
npm run build

# Install Capacitor & add Android project
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap add android
npx cap sync android
```

## 3. Lock Landscape Orientation (Recommended)
In `android/app/src/main/AndroidManifest.xml`, add `android:screenOrientation="sensorLandscape"` to the main `<activity>` tag so the game launches directly in landscape mode.

## 4. Build the Debug APK
```bash
cd android
./gradlew assembleDebug
```
The output APK will be at:
`android/app/build/outputs/apk/debug/app-debug.apk`

## 5. Build a Release APK (for distribution)
```bash
cd android
./gradlew assembleRelease
```
Sign the resulting APK with your keystore via `apksigner` or Android Studio **Build > Generate Signed Bundle / APK**.
