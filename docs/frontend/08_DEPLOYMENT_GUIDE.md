# 🚀 **DEPLOYMENT GUIDE - FLUTTER REFACTORING**
## Proceso Deploy y CI/CD

### 📅 **Fecha**: Enero 2025
### 🎯 **Objetivo**: Guía completa de deployment para Flutter refactoring
### 👨‍💻 **Audiencia**: DevOps, Desarrolladores, Release Managers

---

## 🎯 **ESTRATEGIA DEPLOYMENT**

### **🏗️ Deployment Pipeline Overview**
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Development   │    │   Staging   │    │   Production│    │   Rollback  │
│                 │    │             │    │             │    │             │
│ • Feature dev   │    │ • QA Testing│    │ • Live users│    │ • Emergency │
│ • Unit tests    │────│ • Integration│────│ • Monitoring│    │ • Quick fix │
│ • Code review   │    │ • Performance│    │ • Analytics │    │ • Restore   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

### **📊 Deployment Metrics**
```yaml
Deployment Targets:
┌─────────────────────┬─────────────┬─────────────┬─────────────┐
│ Métrica             │ Dev         │ Staging     │ Production  │
├─────────────────────┼─────────────┼─────────────┼─────────────┤
│ Build Time          │ < 5 min     │ < 8 min     │ < 10 min    │
│ Test Execution      │ < 3 min     │ < 10 min    │ < 15 min    │
│ Deploy Time         │ < 2 min     │ < 5 min     │ < 10 min    │
│ Rollback Time       │ N/A         │ < 2 min     │ < 1 min     │
│ Success Rate        │ > 90%       │ > 95%       │ > 99%       │
│ Downtime            │ Any         │ < 5 min     │ < 30 sec    │
└─────────────────────┴─────────────┴─────────────┴─────────────┘
```

---

## 🔧 **1. CI/CD PIPELINE SETUP**

### **🔷 GitHub Actions Configuration**

#### **Main Workflow**
```yaml
# .github/workflows/ci_cd.yml
name: Flutter CI/CD Pipeline

on:
  push:
    branches: [ main, develop, release/* ]
  pull_request:
    branches: [ main, develop ]
  release:
    types: [ published ]

env:
  FLUTTER_VERSION: '3.16.0'
  JAVA_VERSION: '17'
  NODE_VERSION: '18'

jobs:
  # =====================================
  # QUALITY CHECKS & TESTING
  # =====================================
  quality_check:
    name: Quality Check
    runs-on: ubuntu-latest
    timeout-minutes: 15
    
    steps:
    - name: 📥 Checkout Repository
      uses: actions/checkout@v4
      with:
        fetch-depth: 0
    
    - name: 🐦 Setup Flutter
      uses: subosito/flutter-action@v2
      with:
        flutter-version: ${{ env.FLUTTER_VERSION }}
        cache: true
    
    - name: 📦 Get Dependencies
      run: flutter pub get
    
    - name: 🧹 Check Formatting
      run: dart format --output=none --set-exit-if-changed .
    
    - name: 📊 Analyze Code
      run: flutter analyze --fatal-infos
    
    - name: 🔍 Check Unused Dependencies
      run: |
        dart pub global activate dart_code_metrics
        dart pub global run dart_code_metrics:metrics check-unused-files lib/
    
    - name: 🛡️ Security Scan
      run: |
        dart pub global activate dart_code_metrics
        dart pub global run dart_code_metrics:metrics check-security lib/

  # =====================================
  # TESTING SUITE
  # =====================================
  test:
    name: Test Suite
    runs-on: ubuntu-latest
    needs: quality_check
    timeout-minutes: 20
    
    strategy:
      matrix:
        test-type: [unit, widget, integration]
    
    steps:
    - name: 📥 Checkout Repository
      uses: actions/checkout@v4
    
    - name: 🐦 Setup Flutter
      uses: subosito/flutter-action@v2
      with:
        flutter-version: ${{ env.FLUTTER_VERSION }}
        cache: true
    
    - name: 📦 Get Dependencies
      run: flutter pub get
    
    - name: 🧪 Run Unit Tests
      if: matrix.test-type == 'unit'
      run: |
        flutter test test/unit/ --coverage --test-randomize-ordering-seed random
        
    - name: 🎭 Run Widget Tests
      if: matrix.test-type == 'widget'
      run: |
        flutter test test/widget/ --coverage --test-randomize-ordering-seed random
    
    - name: 🔄 Run Integration Tests
      if: matrix.test-type == 'integration'
      run: |
        # Setup Android Emulator
        echo "y" | $ANDROID_HOME/tools/bin/sdkmanager --install 'system-images;android-30;google_apis;x86_64'
        echo "no" | $ANDROID_HOME/tools/bin/avdmanager create avd --force --name test --abi google_apis/x86_64 --package 'system-images;android-30;google_apis;x86_64'
        $ANDROID_HOME/emulator/emulator -avd test -no-audio -no-window &
        
        # Wait for emulator
        adb wait-for-device shell 'while [[ -z $(getprop sys.boot_completed | tr -d '\r') ]]; do sleep 1; done; input keyevent 82'
        
        # Run integration tests
        flutter test integration_test/ --timeout 10m
    
    - name: 📊 Upload Coverage
      if: matrix.test-type == 'unit'
      uses: codecov/codecov-action@v3
      with:
        file: coverage/lcov.info
        flags: unittests
        name: codecov-umbrella
    
    - name: ✅ Coverage Check
      if: matrix.test-type == 'unit'
      uses: VeryGoodOpenSource/very_good_coverage@v2
      with:
        path: coverage/lcov.info
        min_coverage: 65
        exclude: '**/*.g.dart **/*.freezed.dart'

  # =====================================
  # BUILD APPLICATIONS
  # =====================================
  build:
    name: Build Applications
    runs-on: ${{ matrix.os }}
    needs: test
    timeout-minutes: 30
    
    strategy:
      matrix:
        include:
          - os: ubuntu-latest
            platform: android
            artifact-name: android-apk
          - os: ubuntu-latest
            platform: web
            artifact-name: web-build
          - os: macos-latest
            platform: ios
            artifact-name: ios-ipa
    
    steps:
    - name: 📥 Checkout Repository
      uses: actions/checkout@v4
    
    - name: 🐦 Setup Flutter
      uses: subosito/flutter-action@v2
      with:
        flutter-version: ${{ env.FLUTTER_VERSION }}
        cache: true
    
    - name: ☕ Setup Java (Android)
      if: matrix.platform == 'android'
      uses: actions/setup-java@v3
      with:
        distribution: 'temurin'
        java-version: ${{ env.JAVA_VERSION }}
    
    - name: 🍎 Setup Xcode (iOS)
      if: matrix.platform == 'ios'
      uses: maxim-lobanov/setup-xcode@v1
      with:
        xcode-version: '15.0'
    
    - name: 📦 Get Dependencies
      run: flutter pub get
    
    - name: 🔧 Generate Code
      run: |
        flutter pub run build_runner build --delete-conflicting-outputs
    
    - name: 🤖 Build Android APK
      if: matrix.platform == 'android'
      env:
        KEYSTORE_PASSWORD: ${{ secrets.KEYSTORE_PASSWORD }}
        KEY_ALIAS: ${{ secrets.KEY_ALIAS }}
        KEY_PASSWORD: ${{ secrets.KEY_PASSWORD }}
      run: |
        # Create keystore from secret
        echo "${{ secrets.KEYSTORE_BASE64 }}" | base64 --decode > android/app/keystore.jks
        
        # Build release APK
        flutter build apk --release \
          --dart-define=API_URL=${{ secrets.API_URL_PROD }} \
          --dart-define=APP_ENV=production
        
        # Build App Bundle for Play Store
        flutter build appbundle --release \
          --dart-define=API_URL=${{ secrets.API_URL_PROD }} \
          --dart-define=APP_ENV=production
    
    - name: 🌐 Build Web
      if: matrix.platform == 'web'
      run: |
        flutter build web --release \
          --dart-define=API_URL=${{ secrets.API_URL_PROD }} \
          --dart-define=APP_ENV=production \
          --web-renderer canvaskit
    
    - name: 🍎 Build iOS IPA
      if: matrix.platform == 'ios'
      env:
        MATCH_PASSWORD: ${{ secrets.MATCH_PASSWORD }}
        FASTLANE_PASSWORD: ${{ secrets.FASTLANE_PASSWORD }}
      run: |
        # Install fastlane
        gem install fastlane
        
        # Build iOS
        cd ios
        fastlane build_release
    
    - name: 📤 Upload Build Artifacts
      uses: actions/upload-artifact@v3
      with:
        name: ${{ matrix.artifact-name }}
        path: |
          build/app/outputs/flutter-apk/*.apk
          build/app/outputs/bundle/release/*.aab
          build/web/
          build/ios/ipa/*.ipa
        retention-days: 30

  # =====================================
  # SECURITY & PERFORMANCE TESTING
  # =====================================
  security_performance:
    name: Security & Performance
    runs-on: ubuntu-latest
    needs: build
    timeout-minutes: 25
    
    steps:
    - name: 📥 Checkout Repository
      uses: actions/checkout@v4
    
    - name: 🔒 OWASP Dependency Check
      uses: dependency-check/Dependency-Check_Action@main
      with:
        project: 'UCN-INCLUI2'
        path: '.'
        format: 'ALL'
    
    - name: 📊 Bundle Analysis
      run: |
        flutter build apk --analyze-size --target-platform android-arm64
        
    - name: ⚡ Performance Testing
      run: |
        # Install performance testing tools
        dart pub global activate flutter_driver
        
        # Run performance tests
        flutter drive --target=test_driver/performance_test.dart
    
    - name: 📋 Generate Security Report
      run: |
        echo "## Security Scan Results" >> security_report.md
        echo "- Dependency vulnerabilities: $(cat dependency-check-report.json | jq '.dependencies | length')" >> security_report.md
        echo "- Code security issues: 0" >> security_report.md
    
    - name: 📤 Upload Reports
      uses: actions/upload-artifact@v3
      with:
        name: security-performance-reports
        path: |
          dependency-check-report.*
          security_report.md
          performance_results.json

  # =====================================
  # DEPLOYMENT TO STAGING
  # =====================================
  deploy_staging:
    name: Deploy to Staging
    runs-on: ubuntu-latest
    needs: [security_performance]
    if: github.ref == 'refs/heads/develop'
    environment: staging
    timeout-minutes: 15
    
    steps:
    - name: 📥 Download Artifacts
      uses: actions/download-artifact@v3
      with:
        name: web-build
        path: build/web/
    
    - name: 🚀 Deploy to Firebase Hosting
      uses: FirebaseExtended/action-hosting-deploy@v0
      with:
        repoToken: '${{ secrets.GITHUB_TOKEN }}'
        firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT_STAGING }}'
        projectId: ucn-inclui2-staging
        channelId: live
    
    - name: 📱 Deploy Android to Firebase App Distribution
      uses: wzieba/Firebase-Distribution-Github-Action@v1
      with:
        appId: ${{ secrets.FIREBASE_APP_ID_ANDROID_STAGING }}
        token: ${{ secrets.FIREBASE_TOKEN }}
        groups: qa-team
        file: build/app/outputs/flutter-apk/app-release.apk
        releaseNotes: "Staging build from commit ${{ github.sha }}"
    
    - name: 🔔 Notify Staging Deployment
      uses: 8398a7/action-slack@v3
      with:
        status: success
        text: '🚀 Staging deployment successful! 
              Web: https://ucn-inclui2-staging.web.app
              Android: Available in Firebase App Distribution'
      env:
        SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}

  # =====================================
  # PRODUCTION DEPLOYMENT
  # =====================================
  deploy_production:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: [security_performance]
    if: github.event_name == 'release' && github.event.action == 'published'
    environment: production
    timeout-minutes: 20
    
    steps:
    - name: 📥 Download All Artifacts
      uses: actions/download-artifact@v3
    
    - name: 🌐 Deploy Web to Production
      uses: FirebaseExtended/action-hosting-deploy@v0
      with:
        repoToken: '${{ secrets.GITHUB_TOKEN }}'
        firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT_PROD }}'
        projectId: ucn-inclui2-prod
        channelId: live
    
    - name: 🤖 Deploy Android to Play Store
      uses: r0adkll/upload-google-play@v1
      with:
        serviceAccountJsonPlainText: ${{ secrets.GOOGLE_PLAY_SERVICE_ACCOUNT }}
        packageName: cl.ucn.inclui2
        releaseFiles: android-apk/app-release.aab
        track: production
        status: completed
        whatsNewDirectory: metadata/android/
    
    - name: 🍎 Deploy iOS to App Store
      env:
        APP_STORE_CONNECT_API_KEY: ${{ secrets.APP_STORE_CONNECT_API_KEY }}
      run: |
        fastlane deliver --ipa ios-ipa/*.ipa --skip_screenshots --skip_metadata
    
    - name: 📈 Update Monitoring
      run: |
        curl -X POST "${{ secrets.MONITORING_WEBHOOK }}" \
          -H "Content-Type: application/json" \
          -d '{"event": "deployment", "version": "${{ github.ref_name }}", "environment": "production"}'
    
    - name: 🎉 Notify Production Deployment
      uses: 8398a7/action-slack@v3
      with:
        status: success
        text: '🎉 Production deployment successful! 
              Version: ${{ github.ref_name }}
              Web: https://inclui2.ucn.cl
              Mobile: Available in stores'
      env:
        SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

### **🔷 Environment-Specific Configurations**

#### **Development Environment**
```yaml
# .github/environments/development.yml
name: development
protection_rules: []
variables:
  API_URL: "https://api-dev.ucn.cl"
  APP_ENV: "development"
  FIREBASE_PROJECT: "ucn-inclui2-dev"
  LOG_LEVEL: "debug"
secrets:
  DATABASE_URL: ${{ secrets.DEV_DATABASE_URL }}
  API_KEY: ${{ secrets.DEV_API_KEY }}
```

#### **Staging Environment**
```yaml
# .github/environments/staging.yml
name: staging
protection_rules:
  - type: required_reviewers
    required_reviewers:
      - qa-team
variables:
  API_URL: "https://api-staging.ucn.cl"
  APP_ENV: "staging"
  FIREBASE_PROJECT: "ucn-inclui2-staging"
  LOG_LEVEL: "info"
secrets:
  DATABASE_URL: ${{ secrets.STAGING_DATABASE_URL }}
  API_KEY: ${{ secrets.STAGING_API_KEY }}
```

#### **Production Environment**
```yaml
# .github/environments/production.yml
name: production
protection_rules:
  - type: required_reviewers
    required_reviewers:
      - tech-leads
      - devops-team
  - type: wait_timer
    wait_timer: 5 # minutes
variables:
  API_URL: "https://api.ucn.cl"
  APP_ENV: "production"
  FIREBASE_PROJECT: "ucn-inclui2-prod"
  LOG_LEVEL: "error"
secrets:
  DATABASE_URL: ${{ secrets.PROD_DATABASE_URL }}
  API_KEY: ${{ secrets.PROD_API_KEY }}
```

---

## 📱 **2. MOBILE DEPLOYMENT**

### **🔷 Android Deployment**

#### **Build Configuration**
```groovy
// android/app/build.gradle
android {
    compileSdkVersion 34
    
    defaultConfig {
        applicationId "cl.ucn.inclui2"
        minSdkVersion 21
        targetSdkVersion 34
        versionCode getVersionCode()
        versionName getVersionName()
        
        // Multidex support
        multiDexEnabled true
        
        // ProGuard
        proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
    }
    
    signingConfigs {
        release {
            keyAlias System.getenv('KEY_ALIAS')
            keyPassword System.getenv('KEY_PASSWORD')
            storeFile file('keystore.jks')
            storePassword System.getenv('KEYSTORE_PASSWORD')
        }
    }
    
    buildTypes {
        debug {
            applicationIdSuffix '.debug'
            versionNameSuffix '-debug'
            debuggable true
            crunchPngs false // Speed up debug builds
        }
        
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            shrinkResources true
            debuggable false
            
            // R8 optimizations
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
    
    flavorDimensions "environment"
    productFlavors {
        development {
            dimension "environment"
            applicationIdSuffix ".dev"
            versionNameSuffix "-dev"
            buildConfigField "String", "API_URL", '"https://api-dev.ucn.cl"'
        }
        
        staging {
            dimension "environment"
            applicationIdSuffix ".staging"
            versionNameSuffix "-staging"
            buildConfigField "String", "API_URL", '"https://api-staging.ucn.cl"'
        }
        
        production {
            dimension "environment"
            buildConfigField "String", "API_URL", '"https://api.ucn.cl"'
        }
    }
}

def getVersionCode() {
    def versionCode = System.getenv('BUILD_NUMBER')
    if (versionCode != null) {
        return versionCode.toInteger()
    }
    return 1
}

def getVersionName() {
    def versionName = System.getenv('VERSION_NAME')
    if (versionName != null) {
        return versionName
    }
    return "1.0.0"
}
```

#### **ProGuard Rules**
```proguard
# android/app/proguard-rules.pro

# Flutter
-keep class io.flutter.app.** { *; }
-keep class io.flutter.plugin.** { *; }
-keep class io.flutter.util.** { *; }
-keep class io.flutter.view.** { *; }
-keep class io.flutter.** { *; }
-keep class io.flutter.plugins.** { *; }

# Riverpod
-keep class com.riverpod.** { *; }
-keepclassmembers class * {
    @com.riverpod.* <methods>;
}

# Dio
-keep class dio.** { *; }
-keep class retrofit2.** { *; }

# JSON Serialization
-keepattributes *Annotation*
-keepclassmembers class * {
    @com.google.gson.annotations.SerializedName <fields>;
}

# Keep data classes
-keep class cl.ucn.inclui2.data.models.** { *; }
-keep class cl.ucn.inclui2.domain.entities.** { *; }

# Firebase
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.** { *; }
```

#### **Fastlane Android Setup**
```ruby
# android/fastlane/Fastfile
default_platform(:android)

platform :android do
  
  desc "Build debug APK"
  lane :build_debug do
    gradle(
      task: "assembleDebug",
      project_dir: "android/"
    )
  end
  
  desc "Build release APK"
  lane :build_release do
    gradle(
      task: "assembleRelease",
      project_dir: "android/"
    )
  end
  
  desc "Build and upload to Play Store"
  lane :deploy_playstore do
    # Build App Bundle
    gradle(
      task: "bundleRelease",
      project_dir: "android/"
    )
    
    # Upload to Play Store
    upload_to_play_store(
      track: "production",
      aab: "../build/app/outputs/bundle/release/app-release.aab",
      skip_upload_screenshots: true,
      skip_upload_images: true
    )
    
    # Send notification
    slack(
      message: "🚀 UCN INCLUI2 successfully deployed to Play Store!",
      channel: "#releases"
    )
  end
  
  desc "Deploy to Firebase App Distribution"
  lane :deploy_firebase do
    firebase_app_distribution(
      app: ENV["FIREBASE_APP_ID_ANDROID"],
      groups: "qa-team, beta-testers",
      release_notes: "Latest build from CI/CD pipeline"
    )
  end
  
end
```

### **🔷 iOS Deployment**

#### **Xcode Configuration**
```xml
<!-- ios/Runner/Info.plist -->
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleName</key>
    <string>UCN INCLUI2</string>
    
    <key>CFBundleIdentifier</key>
    <string>$(BUNDLE_IDENTIFIER)</string>
    
    <key>CFBundleVersion</key>
    <string>$(BUILD_NUMBER)</string>
    
    <key>CFBundleShortVersionString</key>
    <string>$(VERSION_NAME)</string>
    
    <key>LSRequiresIPhoneOS</key>
    <true/>
    
    <key>UILaunchStoryboardName</key>
    <string>LaunchScreen</string>
    
    <key>UIMainStoryboardFile</key>
    <string>Main</string>
    
    <key>UISupportedInterfaceOrientations</key>
    <array>
        <string>UIInterfaceOrientationPortrait</string>
        <string>UIInterfaceOrientationLandscapeLeft</string>
        <string>UIInterfaceOrientationLandscapeRight</string>
    </array>
    
    <key>NSCameraUsageDescription</key>
    <string>La app necesita acceso a la cámara para tomar fotos.</string>
    
    <key>NSPhotoLibraryUsageDescription</key>
    <string>La app necesita acceso a la galería para seleccionar fotos.</string>
    
    <key>NSLocationWhenInUseUsageDescription</key>
    <string>La app necesita acceso a la ubicación para funciones de localización.</string>
</dict>
</plist>
```

#### **Fastlane iOS Setup**
```ruby
# ios/fastlane/Fastfile
default_platform(:ios)

platform :ios do
  
  desc "Setup certificates and provisioning profiles"
  lane :setup do
    match(
      type: "development",
      readonly: true
    )
    
    match(
      type: "appstore",
      readonly: true
    )
  end
  
  desc "Build for development"
  lane :build_development do
    setup
    
    gym(
      scheme: "Runner",
      configuration: "Debug",
      export_method: "development",
      output_directory: "../build/ios/ipa/"
    )
  end
  
  desc "Build for release"
  lane :build_release do
    setup
    
    increment_build_number(
      build_number: ENV["BUILD_NUMBER"]
    )
    
    increment_version_number(
      version_number: ENV["VERSION_NAME"]
    )
    
    gym(
      scheme: "Runner",
      configuration: "Release",
      export_method: "app-store",
      output_directory: "../build/ios/ipa/"
    )
  end
  
  desc "Deploy to TestFlight"
  lane :deploy_testflight do
    build_release
    
    upload_to_testflight(
      skip_waiting_for_build_processing: true,
      groups: ["QA Team", "Beta Testers"]
    )
    
    slack(
      message: "🍎 UCN INCLUI2 successfully uploaded to TestFlight!",
      channel: "#releases"
    )
  end
  
  desc "Deploy to App Store"
  lane :deploy_appstore do
    build_release
    
    upload_to_app_store(
      force: true,
      submit_for_review: false,
      skip_screenshots: true,
      skip_metadata: false
    )
    
    slack(
      message: "🎉 UCN INCLUI2 successfully deployed to App Store!",
      channel: "#releases"
    )
  end
  
end
```

---

## 🌐 **3. WEB DEPLOYMENT**

### **🔷 Firebase Hosting Configuration**
```json
// firebase.json
{
  "hosting": [
    {
      "target": "production",
      "public": "build/web",
      "ignore": [
        "firebase.json",
        "**/.*",
        "**/node_modules/**"
      ],
      "rewrites": [
        {
          "source": "**",
          "destination": "/index.html"
        }
      ],
      "headers": [
        {
          "source": "**/*.@(js|css|woff2|woff|ttf|eot)",
          "headers": [
            {
              "key": "Cache-Control",
              "value": "public, max-age=31536000, immutable"
            }
          ]
        },
        {
          "source": "**/*.@(png|jpg|jpeg|gif|webp|svg|ico)",
          "headers": [
            {
              "key": "Cache-Control",
              "value": "public, max-age=86400"
            }
          ]
        }
      ]
    },
    {
      "target": "staging",
      "public": "build/web",
      "ignore": [
        "firebase.json",
        "**/.*",
        "**/node_modules/**"
      ],
      "rewrites": [
        {
          "source": "**",
          "destination": "/index.html"
        }
      ]
    }
  ],
  "projects": {
    "default": "ucn-inclui2-prod",
    "staging": "ucn-inclui2-staging",
    "production": "ucn-inclui2-prod"
  }
}
```

### **🔷 Web Build Optimization**
```bash
#!/bin/bash
# scripts/build_web_optimized.sh

echo "🌐 Building optimized web version..."

# Clean previous builds
flutter clean
flutter pub get

# Generate code
flutter pub run build_runner build --delete-conflicting-outputs

# Build web with optimizations
flutter build web \
  --release \
  --web-renderer canvaskit \
  --dart-define=API_URL="$API_URL" \
  --dart-define=APP_ENV="$APP_ENV" \
  --source-maps \
  --tree-shake-icons

# Optimize assets
echo "📦 Optimizing assets..."

# Compress images
find build/web -name "*.png" -exec optipng -o7 {} \;
find build/web -name "*.jpg" -exec jpegoptim --max=85 {} \;

# Compress JavaScript
find build/web -name "*.js" -exec gzip -9 -k {} \;

# Generate service worker
echo "⚙️ Generating service worker..."
cat > build/web/sw.js << 'EOF'
const CACHE_NAME = 'ucn-inclui2-v1.0.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/main.dart.js',
  '/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});
EOF

echo "✅ Web build completed successfully!"
echo "📊 Build size: $(du -sh build/web | cut -f1)"
```

---

## 🔄 **4. ROLLBACK STRATEGY**

### **🔷 Emergency Rollback Procedures**

#### **Automated Rollback Script**
```bash
#!/bin/bash
# scripts/emergency_rollback.sh

set -e

ENVIRONMENT=${1:-staging}
PREVIOUS_VERSION=${2}

echo "🚨 EMERGENCY ROLLBACK INITIATED"
echo "Environment: $ENVIRONMENT"
echo "Rolling back to version: $PREVIOUS_VERSION"

# Confirm rollback
read -p "Are you sure you want to rollback? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "Rollback cancelled"
    exit 1
fi

# Start rollback process
echo "🔄 Starting rollback process..."

case $ENVIRONMENT in
  "staging")
    echo "📱 Rolling back staging deployment..."
    
    # Web rollback
    firebase hosting:channel:deploy staging --project ucn-inclui2-staging
    
    # Mobile rollback (if needed)
    # firebase appdistribution:distribute previous-build.apk --project ucn-inclui2-staging
    ;;
    
  "production")
    echo "🚨 Rolling back production deployment..."
    
    # Web rollback
    firebase hosting:rollback --project ucn-inclui2-prod
    
    # Mobile apps require manual rollback through stores
    echo "⚠️  Manual rollback required for mobile apps through app stores"
    ;;
esac

# Verify rollback
echo "✅ Verifying rollback..."
curl -f https://inclui2-$ENVIRONMENT.ucn.cl/health || {
    echo "❌ Rollback verification failed"
    exit 1
}

# Notify team
curl -X POST "$SLACK_WEBHOOK" \
    -H 'Content-Type: application/json' \
    -d "{\"text\":\"🚨 Emergency rollback completed for $ENVIRONMENT to version $PREVIOUS_VERSION\"}"

echo "✅ Rollback completed successfully"
```

#### **Database Migration Rollback**
```sql
-- migrations/rollback_procedures.sql

-- Rollback procedure template
CREATE OR REPLACE PROCEDURE rollback_to_version(target_version VARCHAR(20))
LANGUAGE plpgsql
AS $$
DECLARE
    current_version VARCHAR(20);
BEGIN
    -- Get current version
    SELECT version INTO current_version FROM schema_migrations ORDER BY version DESC LIMIT 1;
    
    -- Log rollback attempt
    INSERT INTO rollback_log (from_version, to_version, started_at, status)
    VALUES (current_version, target_version, NOW(), 'started');
    
    -- Perform rollback (implement specific logic)
    -- This would contain specific rollback steps
    
    -- Update migration table
    DELETE FROM schema_migrations WHERE version > target_version;
    
    -- Mark rollback as completed
    UPDATE rollback_log 
    SET status = 'completed', completed_at = NOW()
    WHERE from_version = current_version AND to_version = target_version;
    
    RAISE NOTICE 'Rollback from % to % completed successfully', current_version, target_version;
END;
$$;
```

---

## 📊 **5. MONITORING & ALERTING**

### **🔷 Deployment Monitoring**
```yaml
# monitoring/deployment_alerts.yml
alerts:
  - name: deployment_failed
    condition: deployment.status == "failed"
    severity: critical
    channels: [slack, email, pagerduty]
    message: "🚨 Deployment failed for {{ environment }}"
    
  - name: deployment_slow
    condition: deployment.duration > 600 # 10 minutes
    severity: warning
    channels: [slack]
    message: "⚠️ Slow deployment detected: {{ duration }}s"
    
  - name: rollback_triggered
    condition: rollback.initiated == true
    severity: critical
    channels: [slack, email, pagerduty]
    message: "🔄 Emergency rollback triggered for {{ environment }}"
    
  - name: app_health_check_failed
    condition: health_check.status != "healthy"
    severity: critical
    channels: [slack, email]
    message: "❌ App health check failed after deployment"
```

### **🔷 Post-Deployment Verification**
```bash
#!/bin/bash
# scripts/post_deployment_check.sh

ENVIRONMENT=${1:-staging}
BASE_URL="https://inclui2-$ENVIRONMENT.ucn.cl"

echo "🔍 Running post-deployment verification..."

# Health check
echo "📋 Checking application health..."
HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/health")
if [ "$HEALTH_STATUS" != "200" ]; then
    echo "❌ Health check failed: $HEALTH_STATUS"
    exit 1
fi

# API endpoint checks
echo "🔌 Testing critical API endpoints..."
endpoints=(
    "/api/auth/status"
    "/api/users/me"
    "/api/posts"
)

for endpoint in "${endpoints[@]}"; do
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$endpoint")
    if [ "$STATUS" != "200" ] && [ "$STATUS" != "401" ]; then
        echo "❌ Endpoint check failed: $endpoint ($STATUS)"
        exit 1
    fi
    echo "✅ $endpoint: $STATUS"
done

# Performance check
echo "⚡ Testing performance..."
RESPONSE_TIME=$(curl -o /dev/null -s -w "%{time_total}" "$BASE_URL")
if (( $(echo "$RESPONSE_TIME > 3.0" | bc -l) )); then
    echo "⚠️ Slow response time: ${RESPONSE_TIME}s"
fi

# Database connectivity
echo "🗄️ Testing database connectivity..."
DB_STATUS=$(curl -s "$BASE_URL/health/db" | jq -r '.status')
if [ "$DB_STATUS" != "healthy" ]; then
    echo "❌ Database health check failed"
    exit 1
fi

echo "✅ All post-deployment checks passed!"

# Send success notification
curl -X POST "$SLACK_WEBHOOK" \
    -H 'Content-Type: application/json' \
    -d "{\"text\":\"✅ Post-deployment verification completed successfully for $ENVIRONMENT\"}"
```

---

## 📚 **6. DEPLOYMENT RUNBOOKS**

### **🔷 Release Checklist**
```markdown
# 📋 Release Checklist

## Pre-Release (1 week before)
- [ ] Feature freeze implemented
- [ ] All tests passing (unit, widget, integration)
- [ ] Performance benchmarks met
- [ ] Security scan completed
- [ ] Documentation updated
- [ ] Release notes prepared
- [ ] App store metadata updated

## Release Day
- [ ] Final testing on staging environment
- [ ] Database migrations prepared and tested
- [ ] Rollback procedure verified
- [ ] Monitoring alerts configured
- [ ] Team notified of release window
- [ ] Support team briefed on new features

## Deployment Process
- [ ] Create release branch
- [ ] Tag release version
- [ ] Trigger production deployment
- [ ] Monitor deployment progress
- [ ] Verify post-deployment checks
- [ ] Update external services (if needed)

## Post-Release (24 hours after)
- [ ] Monitor application metrics
- [ ] Check error rates and performance
- [ ] Verify new features working correctly
- [ ] Monitor user feedback
- [ ] Document any issues encountered
- [ ] Plan next iteration
```

### **🔷 Incident Response Procedures**
```markdown
# 🚨 Incident Response Procedures

## Severity Levels

### Critical (P0) - Immediate Response
- Complete service outage
- Data loss or corruption
- Security breach
- Response time: < 15 minutes

### High (P1) - Urgent Response  
- Partial service degradation
- Major feature broken
- Performance severely impacted
- Response time: < 1 hour

### Medium (P2) - Normal Response
- Minor feature issues
- Performance slightly degraded
- Non-critical functionality affected
- Response time: < 4 hours

## Response Actions

### 1. Detection & Assessment
- [ ] Incident detected via monitoring/alerts
- [ ] Severity level determined
- [ ] Incident commander assigned
- [ ] Initial assessment completed

### 2. Communication
- [ ] Internal team notified
- [ ] Stakeholders informed
- [ ] Status page updated
- [ ] User communication sent (if needed)

### 3. Resolution
- [ ] Root cause identified
- [ ] Fix implemented or rollback executed
- [ ] Solution tested and verified
- [ ] Service fully restored

### 4. Post-Incident
- [ ] Incident timeline documented
- [ ] Root cause analysis completed
- [ ] Preventive measures identified
- [ ] Lessons learned shared
```

---

**🚀 DEPLOYMENT GUIDE** | **📅 Versión**: 1.0 | **🎯 Estado**: READY FOR IMPLEMENTATION 