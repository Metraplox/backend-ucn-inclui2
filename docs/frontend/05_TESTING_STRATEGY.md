# 🧪 **TESTING STRATEGY - FLUTTER REFACTORING**
## Estrategia Testing Comprehensiva

### 📅 **Fecha**: Enero 2025
### 🎯 **Objetivo**: Definir estrategia testing completa para refactoring Flutter
### 👨‍💻 **Audiencia**: Desarrolladores, QA Engineers, Tech Leads

---

## 🎯 **OBJETIVOS TESTING**

### **📊 Coverage Targets**
- **Overall Coverage**: 65%+ (objetivo mínimo)
- **Unit Tests**: 85%+ coverage
- **Widget Tests**: 70%+ coverage  
- **Integration Tests**: 100% critical user flows
- **Provider Tests**: 90%+ coverage

### **🏆 Quality Gates**
```yaml
Testing Requirements:
✅ All tests pass in CI/CD
✅ Coverage thresholds met
✅ No flaky tests (>95% pass rate)
✅ Performance tests within bounds
✅ Security tests passed
✅ Accessibility tests > 90 score
```

---

## 🧪 **PYRAMID TESTING STRATEGY**

### **🔺 Testing Pyramid**
```
                    E2E Tests (5%)
                   ┌─────────────┐
                   │   Manual    │
                   │  Exploratory │
                   └─────────────┘
                 ┌─────────────────┐
                 │ Integration (15%)│
                 │   Widget Tests   │
                 │   Flow Tests     │
                 └─────────────────┘
               ┌─────────────────────┐
               │    Unit Tests (80%)  │
               │   Providers, Logic   │
               │   Utils, Models      │
               └─────────────────────┘
```

### **⚖️ Balance Testing Types**
- **80% Unit Tests** - Rápidos, aislados, feedback inmediato
- **15% Integration Tests** - Widgets + Provider interactions  
- **5% E2E Tests** - Critical user journeys completos

---

## 🔧 **1. UNIT TESTING**

### **🎯 Unit Test Strategy**

#### **Provider Testing con Riverpod**
```dart
// test/providers/auth_provider_test.dart
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mockito/mockito.dart';
import 'package:mockito/annotations.dart';

// Generate mocks
@GenerateMocks([AuthRepository])
import 'auth_provider_test.mocks.dart';

void main() {
  group('AuthProvider Tests', () {
    late ProviderContainer container;
    late MockAuthRepository mockAuthRepository;
    
    setUp(() {
      mockAuthRepository = MockAuthRepository();
      container = ProviderContainer(
        overrides: [
          authRepositoryProvider.overrideWithValue(mockAuthRepository),
        ],
      );
    });
    
    tearDown(() {
      container.dispose();
    });
    
    group('Initial State', () {
      test('should start with unauthenticated state', () {
        final authState = container.read(authProvider);
        
        expect(authState.isAuthenticated, false);
        expect(authState.isLoading, false);
        expect(authState.user, null);
        expect(authState.error, null);
      });
    });
    
    group('Login Flow', () {
      test('should update state correctly on successful login', () async {
        // Arrange
        const email = 'test@ucn.cl';
        const password = 'password123';
        const mockUser = User(id: '1', email: email, name: 'Test User');
        
        when(mockAuthRepository.login(email, password))
            .thenAnswer((_) async => mockUser);
        
        final notifier = container.read(authProvider.notifier);
        
        // Act
        await notifier.login(email, password);
        
        // Assert
        final state = container.read(authProvider);
        expect(state.isAuthenticated, true);
        expect(state.isLoading, false);
        expect(state.user, mockUser);
        expect(state.error, null);
        
        verify(mockAuthRepository.login(email, password)).called(1);
      });
      
      test('should handle login failure correctly', () async {
        // Arrange
        const email = 'test@ucn.cl';
        const password = 'wrongpassword';
        const errorMessage = 'Invalid credentials';
        
        when(mockAuthRepository.login(email, password))
            .throwsA(AuthException(errorMessage));
        
        final notifier = container.read(authProvider.notifier);
        
        // Act
        await notifier.login(email, password);
        
        // Assert
        final state = container.read(authProvider);
        expect(state.isAuthenticated, false);
        expect(state.isLoading, false);
        expect(state.user, null);
        expect(state.error, errorMessage);
      });
      
      test('should show loading state during login', () async {
        // Arrange
        const email = 'test@ucn.cl';
        const password = 'password123';
        
        final completer = Completer<User>();
        when(mockAuthRepository.login(email, password))
            .thenAnswer((_) => completer.future);
        
        final notifier = container.read(authProvider.notifier);
        
        // Act
        final loginFuture = notifier.login(email, password);
        
        // Assert loading state
        final loadingState = container.read(authProvider);
        expect(loadingState.isLoading, true);
        expect(loadingState.error, null);
        
        // Complete the login
        completer.complete(const User(id: '1', email: email, name: 'Test'));
        await loginFuture;
        
        // Assert final state
        final finalState = container.read(authProvider);
        expect(finalState.isLoading, false);
        expect(finalState.isAuthenticated, true);
      });
    });
    
    group('Logout Flow', () {
      test('should reset state on logout', () async {
        // Arrange - set authenticated state first
        final notifier = container.read(authProvider.notifier);
        when(mockAuthRepository.login(any, any))
            .thenAnswer((_) async => const User(id: '1', email: 'test@ucn.cl', name: 'Test'));
        
        await notifier.login('test@ucn.cl', 'password123');
        expect(container.read(authProvider).isAuthenticated, true);
        
        // Act
        notifier.logout();
        
        // Assert
        final state = container.read(authProvider);
        expect(state.isAuthenticated, false);
        expect(state.user, null);
        expect(state.error, null);
        expect(state.isLoading, false);
      });
    });
    
    group('Auto-refresh Token', () {
      test('should refresh token when expired', () async {
        // Arrange
        when(mockAuthRepository.refreshToken())
            .thenAnswer((_) async => const AuthToken(
              accessToken: 'new_token',
              refreshToken: 'new_refresh_token',
            ));
        
        final notifier = container.read(authProvider.notifier);
        
        // Act
        await notifier.refreshToken();
        
        // Assert
        verify(mockAuthRepository.refreshToken()).called(1);
      });
    });
  });
}
```

#### **Repository Testing Pattern**
```dart
// test/data/repositories/user_repository_test.dart
import 'package:flutter_test/flutter_test.dart';
import 'package:mockito/mockito.dart';

@GenerateMocks([UserRemoteDataSource, UserLocalDataSource, NetworkInfo])
import 'user_repository_test.mocks.dart';

void main() {
  group('UserRepository Tests', () {
    late UserRepositoryImpl repository;
    late MockUserRemoteDataSource mockRemoteDataSource;
    late MockUserLocalDataSource mockLocalDataSource;
    late MockNetworkInfo mockNetworkInfo;
    
    setUp(() {
      mockRemoteDataSource = MockUserRemoteDataSource();
      mockLocalDataSource = MockUserLocalDataSource();
      mockNetworkInfo = MockNetworkInfo();
      
      repository = UserRepositoryImpl(
        mockRemoteDataSource,
        mockLocalDataSource,
        mockNetworkInfo,
      );
    });
    
    group('getCurrentUser', () {
      const tUserModel = UserModel(
        id: '1',
        email: 'test@ucn.cl',
        name: 'Test User',
        role: 'student',
      );
      
      test('should return remote data when device is online', () async {
        // Arrange
        when(mockNetworkInfo.isConnected).thenAnswer((_) async => true);
        when(mockRemoteDataSource.getCurrentUser())
            .thenAnswer((_) async => tUserModel);
        
        // Act
        final result = await repository.getCurrentUser();
        
        // Assert
        verify(mockRemoteDataSource.getCurrentUser());
        verify(mockLocalDataSource.cacheUser(tUserModel));
        expect(result, tUserModel.toEntity());
      });
      
      test('should return cached data when device is offline', () async {
        // Arrange
        when(mockNetworkInfo.isConnected).thenAnswer((_) async => false);
        when(mockLocalDataSource.getCachedCurrentUser())
            .thenAnswer((_) async => tUserModel);
        
        // Act
        final result = await repository.getCurrentUser();
        
        // Assert
        verifyNever(mockRemoteDataSource.getCurrentUser());
        verify(mockLocalDataSource.getCachedCurrentUser());
        expect(result, tUserModel.toEntity());
      });
      
      test('should throw CacheException when offline and no cache', () async {
        // Arrange
        when(mockNetworkInfo.isConnected).thenAnswer((_) async => false);
        when(mockLocalDataSource.getCachedCurrentUser())
            .thenAnswer((_) async => null);
        
        // Act & Assert
        expect(
          () => repository.getCurrentUser(),
          throwsA(isA<CacheException>()),
        );
      });
    });
  });
}
```

#### **Use Case Testing**
```dart
// test/domain/usecases/authenticate_user_test.dart
void main() {
  group('AuthenticateUser UseCase', () {
    late AuthenticateUser useCase;
    late MockAuthRepository mockAuthRepository;
    late MockUserRepository mockUserRepository;
    late MockAnalyticsService mockAnalytics;
    
    setUp(() {
      mockAuthRepository = MockAuthRepository();
      mockUserRepository = MockUserRepository();
      mockAnalytics = MockAnalyticsService();
      
      useCase = AuthenticateUser(
        mockAuthRepository,
        mockUserRepository,
        mockAnalytics,
      );
    });
    
    test('should return success result when authentication succeeds', () async {
      // Arrange
      const request = AuthRequest(
        email: 'test@ucn.cl',
        password: 'password123',
        method: AuthMethod.email,
      );
      
      const authResponse = AuthResponse(
        userId: '1',
        accessToken: 'token123',
        refreshToken: 'refresh123',
      );
      
      const user = User(
        id: '1',
        email: 'test@ucn.cl',
        name: 'Test User',
      );
      
      when(mockAuthRepository.authenticate(request))
          .thenAnswer((_) async => authResponse);
      when(mockUserRepository.getUserById('1'))
          .thenAnswer((_) async => user);
      
      // Act
      final result = await useCase(request);
      
      // Assert
      expect(result.isSuccess, true);
      expect(result.user, user);
      expect(result.accessToken, 'token123');
      
      verify(mockAnalytics.track('user_login', any));
    });
    
    test('should return failure when credentials are invalid', () async {
      // Arrange
      const request = AuthRequest(
        email: '',
        password: '123',
        method: AuthMethod.email,
      );
      
      // Act
      final result = await useCase(request);
      
      // Assert
      expect(result.isFailure, true);
      expect(result.error, AuthError.invalidCredentials);
      
      verifyNever(mockAuthRepository.authenticate(any));
    });
  });
}
```

---

## 🖼️ **2. WIDGET TESTING**

### **🎯 Widget Test Strategy**

#### **UCN Component Testing**
```dart
// test/widgets/ucn_button_test.dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

void main() {
  group('UCNButton Widget Tests', () {
    
    Widget createTestWidget(Widget child) {
      return ProviderScope(
        child: MaterialApp(
          theme: UCNTheme.lightTheme,
          home: Scaffold(body: child),
        ),
      );
    }
    
    group('Rendering Tests', () {
      testWidgets('should display text correctly', (tester) async {
        // Arrange
        const buttonText = 'Test Button';
        
        // Act
        await tester.pumpWidget(
          createTestWidget(
            UCNButton(
              text: buttonText,
              onPressed: () {},
            ),
          ),
        );
        
        // Assert
        expect(find.text(buttonText), findsOneWidget);
        expect(find.byType(ElevatedButton), findsOneWidget);
      });
      
      testWidgets('should show icon when provided', (tester) async {
        // Act
        await tester.pumpWidget(
          createTestWidget(
            UCNButton(
              text: 'Icon Button',
              icon: Icons.add,
              onPressed: () {},
            ),
          ),
        );
        
        // Assert
        expect(find.byIcon(Icons.add), findsOneWidget);
        expect(find.text('Icon Button'), findsOneWidget);
      });
      
      testWidgets('should apply correct theme colors', (tester) async {
        // Act
        await tester.pumpWidget(
          createTestWidget(
            UCNButton(
              text: 'Themed Button',
              onPressed: () {},
            ),
          ),
        );
        
        // Assert
        final button = tester.widget<ElevatedButton>(find.byType(ElevatedButton));
        final buttonStyle = button.style;
        
        expect(
          buttonStyle?.backgroundColor?.resolve({}),
          UCNTheme.primaryColor,
        );
      });
    });
    
    group('Interaction Tests', () {
      testWidgets('should trigger onPressed when tapped', (tester) async {
        // Arrange
        bool wasPressed = false;
        
        // Act
        await tester.pumpWidget(
          createTestWidget(
            UCNButton(
              text: 'Tap Button',
              onPressed: () => wasPressed = true,
            ),
          ),
        );
        
        await tester.tap(find.byType(UCNButton));
        await tester.pump();
        
        // Assert
        expect(wasPressed, true);
      });
      
      testWidgets('should not trigger onPressed when disabled', (tester) async {
        // Arrange
        bool wasPressed = false;
        
        // Act
        await tester.pumpWidget(
          createTestWidget(
            UCNButton(
              text: 'Disabled Button',
              onPressed: null, // Disabled
            ),
          ),
        );
        
        await tester.tap(find.byType(UCNButton));
        await tester.pump();
        
        // Assert
        expect(wasPressed, false);
      });
    });
    
    group('Loading State Tests', () {
      testWidgets('should show loading indicator when isLoading is true', (tester) async {
        // Act
        await tester.pumpWidget(
          createTestWidget(
            UCNButton(
              text: 'Loading Button',
              isLoading: true,
              onPressed: () {},
            ),
          ),
        );
        
        // Assert
        expect(find.byType(CircularProgressIndicator), findsOneWidget);
      });
      
      testWidgets('should be disabled when loading', (tester) async {
        // Arrange
        bool wasPressed = false;
        
        // Act
        await tester.pumpWidget(
          createTestWidget(
            UCNButton(
              text: 'Loading Button',
              isLoading: true,
              onPressed: () => wasPressed = true,
            ),
          ),
        );
        
        await tester.tap(find.byType(UCNButton));
        await tester.pump();
        
        // Assert
        expect(wasPressed, false);
      });
    });
    
    group('Accessibility Tests', () {
      testWidgets('should have proper semantics', (tester) async {
        // Act
        await tester.pumpWidget(
          createTestWidget(
            UCNButton(
              text: 'Accessible Button',
              onPressed: () {},
            ),
          ),
        );
        
        // Assert
        expect(
          tester.getSemantics(find.byType(UCNButton)),
          matchesSemantics(
            label: 'Accessible Button',
            isButton: true,
            isEnabled: true,
            hasTapAction: true,
          ),
        );
      });
    });
  });
}
```

#### **Screen Testing with Providers**
```dart
// test/screens/home_screen_test.dart
void main() {
  group('HomeScreen Widget Tests', () {
    
    Widget createTestWidget({
      AuthState? authState,
      List<Override> overrides = const [],
    }) {
      return ProviderScope(
        overrides: [
          if (authState != null)
            authProvider.overrideWith((ref) => authState),
          ...overrides,
        ],
        child: MaterialApp(
          home: const HomeScreen(),
        ),
      );
    }
    
    group('Authentication States', () {
      testWidgets('should show loading indicator when auth is loading', (tester) async {
        // Arrange
        const authState = AuthState(isLoading: true);
        
        // Act
        await tester.pumpWidget(createTestWidget(authState: authState));
        
        // Assert
        expect(find.byType(CircularProgressIndicator), findsOneWidget);
      });
      
      testWidgets('should show error message when auth failed', (tester) async {
        // Arrange
        const authState = AuthState(error: 'Login failed');
        
        // Act
        await tester.pumpWidget(createTestWidget(authState: authState));
        
        // Assert
        expect(find.text('Error: Login failed'), findsOneWidget);
        expect(find.text('Reintentar'), findsOneWidget);
      });
      
      testWidgets('should show welcome message when authenticated', (tester) async {
        // Arrange
        const authState = AuthState(
          isAuthenticated: true,
          user: 'test@ucn.cl',
        );
        
        // Act
        await tester.pumpWidget(createTestWidget(authState: authState));
        
        // Assert
        expect(find.textContaining('Bienvenido'), findsOneWidget);
        expect(find.byIcon(Icons.logout), findsOneWidget);
      });
    });
    
    group('Navigation Tests', () {
      testWidgets('should trigger logout when logout button tapped', (tester) async {
        // Arrange
        const authState = AuthState(
          isAuthenticated: true,
          user: 'test@ucn.cl',
        );
        
        bool logoutCalled = false;
        final mockAuthNotifier = MockAuthNotifier();
        when(mockAuthNotifier.logout()).thenAnswer((_) {
          logoutCalled = true;
        });
        
        // Act
        await tester.pumpWidget(
          createTestWidget(
            authState: authState,
            overrides: [
              authProvider.notifier.overrideWith((ref) => mockAuthNotifier),
            ],
          ),
        );
        
        await tester.tap(find.byIcon(Icons.logout));
        await tester.pump();
        
        // Assert
        expect(logoutCalled, true);
      });
    });
    
    group('Retry Functionality', () {
      testWidgets('should refresh provider when retry button tapped', (tester) async {
        // Arrange
        const authState = AuthState(error: 'Network error');
        
        // Act
        await tester.pumpWidget(createTestWidget(authState: authState));
        
        await tester.tap(find.text('Reintentar'));
        await tester.pump();
        
        // Assert - would verify refresh call in real implementation
      });
    });
  });
}
```

---

## 🔄 **3. INTEGRATION TESTING**

### **🎯 Integration Test Strategy**

#### **Complete User Flow Testing**
```dart
// integration_test/auth_flow_test.dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:my_app/main.dart' as app;

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();
  
  group('Authentication Flow Integration Tests', () {
    
    testWidgets('complete login and logout flow should work', (tester) async {
      // Start app
      app.main();
      await tester.pumpAndSettle();
      
      // Should start on splash/login screen
      expect(find.text('UCN INCLUI2'), findsOneWidget);
      
      // Navigate to login if not already there
      if (find.text('Iniciar Sesión').evaluate().isNotEmpty) {
        await tester.tap(find.text('Iniciar Sesión'));
        await tester.pumpAndSettle();
      }
      
      // Enter valid credentials
      await tester.enterText(
        find.byKey(const Key('email_field')),
        'test@ucn.cl',
      );
      await tester.enterText(
        find.byKey(const Key('password_field')),
        'password123',
      );
      
      // Submit login
      await tester.tap(find.byKey(const Key('login_button')));
      
      // Wait for login to complete (with timeout)
      await tester.pumpAndSettle(const Duration(seconds: 5));
      
      // Should be on home screen now
      expect(find.textContaining('Bienvenido'), findsOneWidget);
      expect(find.byIcon(Icons.logout), findsOneWidget);
      
      // Test logout
      await tester.tap(find.byIcon(Icons.logout));
      await tester.pumpAndSettle();
      
      // Should be back to login screen
      expect(find.text('Iniciar Sesión'), findsOneWidget);
    });
    
    testWidgets('invalid credentials should show error', (tester) async {
      // Start app
      app.main();
      await tester.pumpAndSettle();
      
      // Navigate to login
      await _navigateToLogin(tester);
      
      // Enter invalid credentials
      await tester.enterText(
        find.byKey(const Key('email_field')),
        'invalid@ucn.cl',
      );
      await tester.enterText(
        find.byKey(const Key('password_field')),
        'wrongpassword',
      );
      
      // Submit login
      await tester.tap(find.byKey(const Key('login_button')));
      await tester.pumpAndSettle(const Duration(seconds: 3));
      
      // Should show error message
      expect(find.textContaining('Error'), findsOneWidget);
      expect(find.text('Iniciar Sesión'), findsOneWidget); // Still on login
    });
    
    testWidgets('navigation between screens should work', (tester) async {
      // Login first
      await _performLogin(tester);
      
      // Test navigation to profile
      await tester.tap(find.byKey(const Key('nav_profile')));
      await tester.pumpAndSettle();
      
      expect(find.text('Mi Perfil'), findsOneWidget);
      
      // Navigate back to home
      await tester.tap(find.byIcon(Icons.arrow_back));
      await tester.pumpAndSettle();
      
      expect(find.textContaining('Bienvenido'), findsOneWidget);
      
      // Test navigation to settings
      await tester.tap(find.byKey(const Key('nav_settings')));
      await tester.pumpAndSettle();
      
      expect(find.text('Configuración'), findsOneWidget);
    });
  });
  
  group('Offline Behavior Tests', () {
    testWidgets('should handle network errors gracefully', (tester) async {
      // Simulate network disconnection
      await tester.binding.defaultBinaryMessenger.setMockMethodCallHandler(
        const MethodChannel('connectivity_plus'),
        (methodCall) async {
          if (methodCall.method == 'check') {
            return 'none'; // No connectivity
          }
          return null;
        },
      );
      
      app.main();
      await tester.pumpAndSettle();
      
      // Try to login while offline
      await _navigateToLogin(tester);
      
      await tester.enterText(
        find.byKey(const Key('email_field')),
        'test@ucn.cl',
      );
      await tester.enterText(
        find.byKey(const Key('password_field')),
        'password123',
      );
      
      await tester.tap(find.byKey(const Key('login_button')));
      await tester.pumpAndSettle(const Duration(seconds: 3));
      
      // Should show network error
      expect(find.textContaining('conexión'), findsOneWidget);
    });
  });
}

// Helper functions
Future<void> _navigateToLogin(WidgetTester tester) async {
  if (find.text('Iniciar Sesión').evaluate().isNotEmpty) {
    await tester.tap(find.text('Iniciar Sesión'));
    await tester.pumpAndSettle();
  }
}

Future<void> _performLogin(WidgetTester tester) async {
  app.main();
  await tester.pumpAndSettle();
  
  await _navigateToLogin(tester);
  
  await tester.enterText(find.byKey(const Key('email_field')), 'test@ucn.cl');
  await tester.enterText(find.byKey(const Key('password_field')), 'password123');
  
  await tester.tap(find.byKey(const Key('login_button')));
  await tester.pumpAndSettle(const Duration(seconds: 5));
}
```

#### **Performance Integration Tests**
```dart
// integration_test/performance_test.dart
void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();
  
  group('Performance Tests', () {
    
    testWidgets('app startup performance should be within bounds', (tester) async {
      final binding = IntegrationTestWidgetsFlutterBinding.ensureInitialized();
      
      // Start measuring
      await binding.watchPerformance(() async {
        app.main();
        await tester.pumpAndSettle();
        
        // Navigate through key screens to warm up
        await _performLogin(tester);
        
        await tester.tap(find.byKey(const Key('nav_profile')));
        await tester.pumpAndSettle();
        
        await tester.tap(find.byIcon(Icons.arrow_back));
        await tester.pumpAndSettle();
      });
      
      // Performance should be recorded and can be analyzed
    });
    
    testWidgets('scrolling performance should be smooth', (tester) async {
      await _performLogin(tester);
      
      // Navigate to a list screen
      await tester.tap(find.byKey(const Key('nav_discover')));
      await tester.pumpAndSettle();
      
      final listFinder = find.byType(ListView);
      expect(listFinder, findsOneWidget);
      
      // Measure scroll performance
      await tester.timedDrag(
        listFinder,
        const Offset(0, -500),
        const Duration(milliseconds: 300),
      );
      
      await tester.pumpAndSettle();
      
      // Verify no jank (would need custom performance monitoring)
    });
  });
}
```

---

## 📊 **4. TEST COVERAGE & REPORTING**

### **🎯 Coverage Configuration**
```yaml
# coverage/lcov.info configuration
test:
  coverage: true
  coverage_excludes:
    - "lib/generated/**"
    - "lib/**.g.dart"
    - "lib/**.freezed.dart"
    - "lib/main.dart"
    - "lib/firebase_options.dart"
```

### **📈 Coverage Targets by Module**
```yaml
Coverage Requirements:
┌──────────────────┬─────────────┬─────────────┐
│ Module           │ Target      │ Critical    │
├──────────────────┼─────────────┼─────────────┤
│ Providers        │ 90%         │ 95%         │
│ Repositories     │ 85%         │ 90%         │
│ Use Cases        │ 95%         │ 100%        │
│ Models/Entities  │ 80%         │ 85%         │
│ Widgets          │ 70%         │ 80%         │
│ Utils/Helpers    │ 85%         │ 90%         │
│ Overall          │ 65%         │ 75%         │
└──────────────────┴─────────────┴─────────────┘
```

### **🔧 Coverage Scripts**
```bash
#!/bin/bash
# scripts/test_coverage.sh

echo "🧪 Running Flutter Tests with Coverage..."

# Clean previous coverage
flutter clean
flutter pub get

# Run tests with coverage
flutter test --coverage

# Generate HTML report
genhtml coverage/lcov.info -o coverage/html

# Check coverage thresholds
dart run coverage:check_coverage \
  --type lcov \
  --min 65 \
  coverage/lcov.info

echo "📊 Coverage report generated: coverage/html/index.html"

# Open coverage report (macOS/Linux)
if [[ "$OSTYPE" == "darwin"* ]]; then
  open coverage/html/index.html
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
  xdg-open coverage/html/index.html
fi
```

---

## 🚀 **5. CI/CD TESTING PIPELINE**

### **🔄 GitHub Actions Testing**
```yaml
# .github/workflows/test.yml
name: Flutter Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Flutter
      uses: subosito/flutter-action@v2
      with:
        flutter-version: '3.16.0'
        
    - name: Install dependencies
      run: flutter pub get
      
    - name: Verify formatting
      run: dart format --output=none --set-exit-if-changed .
      
    - name: Analyze project source
      run: flutter analyze --fatal-infos
      
    - name: Run unit tests
      run: flutter test --coverage --test-randomize-ordering-seed random
      
    - name: Check coverage threshold
      uses: VeryGoodOpenSource/very_good_coverage@v2
      with:
        path: coverage/lcov.info
        min_coverage: 65
        
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: coverage/lcov.info
        
  integration_test:
    runs-on: macos-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Flutter
      uses: subosito/flutter-action@v2
      
    - name: Install dependencies
      run: flutter pub get
      
    - name: Start iOS Simulator
      run: |
        xcrun simctl boot "iPhone 14"
        
    - name: Run integration tests
      run: flutter test integration_test/
```

### **⚡ Quality Gates**
```dart
// scripts/quality_check.dart
void main() async {
  final results = <String, bool>{};
  
  // 1. Test Coverage Check
  results['coverage'] = await checkCoverage();
  
  // 2. Code Quality Check
  results['analysis'] = await runAnalysis();
  
  // 3. Test Performance Check
  results['test_performance'] = await checkTestPerformance();
  
  // 4. Security Check
  results['security'] = await runSecurityCheck();
  
  // Report results
  final passed = results.values.every((result) => result);
  
  if (passed) {
    print('✅ All quality gates passed!');
    exit(0);
  } else {
    print('❌ Quality gates failed:');
    results.forEach((check, passed) {
      if (!passed) print('  - $check: FAILED');
    });
    exit(1);
  }
}

Future<bool> checkCoverage() async {
  // Run coverage and check threshold
  final result = await Process.run('flutter', ['test', '--coverage']);
  
  if (result.exitCode != 0) return false;
  
  // Parse coverage percentage
  final lcovFile = File('coverage/lcov.info');
  if (!lcovFile.existsSync()) return false;
  
  final coverage = parseCoverage(lcovFile);
  return coverage >= 65.0;
}
```

---

## 🏆 **6. TESTING BEST PRACTICES**

### **📋 Testing Checklist**
```yaml
Unit Test Best Practices:
✅ Test one thing at a time
✅ Use descriptive test names
✅ Follow AAA pattern (Arrange, Act, Assert)
✅ Mock external dependencies
✅ Test edge cases and error scenarios
✅ Keep tests fast and independent
✅ Use const constructors for test data

Widget Test Best Practices:
✅ Test user interactions, not implementation
✅ Use semantic finders over widget type finders
✅ Test accessibility properties
✅ Verify proper state management integration
✅ Test responsive behavior
✅ Mock providers with test data

Integration Test Best Practices:
✅ Test complete user journeys
✅ Include error scenarios and edge cases
✅ Test offline/network error behavior
✅ Verify performance characteristics
✅ Use realistic test data
✅ Clean up test state between runs
```

### **🚫 Testing Anti-Patterns**
```dart
// ❌ DON'T: Test implementation details
test('should call setState when counter incremented', () {
  // This tests HOW something works, not WHAT it does
});

// ✅ DO: Test behavior
test('should increment counter when plus button tapped', () {
  // This tests WHAT the user sees/experiences
});

// ❌ DON'T: Create flaky tests
test('should load data after some time', () async {
  await Future.delayed(Duration(seconds: 1)); // Flaky timing
  expect(find.text('Data'), findsOneWidget);
});

// ✅ DO: Use reliable waiting mechanisms
test('should load data when available', () async {
  await tester.pumpAndSettle(); // Wait for all animations
  expect(find.text('Data'), findsOneWidget);
});
```

### **🎯 Test Data Management**
```dart
// test/helpers/test_data.dart
class TestData {
  static const User testUser = User(
    id: 'test-user-1',
    email: 'test@ucn.cl',
    name: 'Test User',
    role: UserRole.student,
  );
  
  static const AuthState authenticatedState = AuthState(
    isAuthenticated: true,
    user: testUser,
    isLoading: false,
  );
  
  static const AuthState loadingState = AuthState(
    isLoading: true,
  );
  
  static const AuthState errorState = AuthState(
    error: 'Test error message',
  );
  
  static List<Post> get samplePosts => [
    Post(
      id: '1',
      title: 'Test Post 1',
      content: 'This is a test post',
      author: testUser,
      createdAt: DateTime(2025, 1, 1),
    ),
    Post(
      id: '2',
      title: 'Test Post 2',
      content: 'Another test post',
      author: testUser,
      createdAt: DateTime(2025, 1, 2),
    ),
  ];
}
```

---

**🧪 TESTING STRATEGY** | **📅 Versión**: 1.0 | **🎯 Estado**: READY FOR IMPLEMENTATION 