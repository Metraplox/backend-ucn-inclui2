# 🏗️ **ARQUITECTURA FLUTTER - REFACTORING UCN INCLUI2**
## Patterns y Principios Arquitectónicos

### 📅 **Fecha**: Enero 2025
### 🎯 **Objetivo**: Definir arquitectura profesional para Flutter refactoring
### 👨‍💻 **Audiencia**: Desarrolladores Flutter, Tech Leads, Architects

---

## 🎯 **VISIÓN ARQUITECTÓNICA**

### **🏛️ Principios Fundamentales**
1. **Separation of Concerns** - Cada capa tiene una responsabilidad única
2. **Dependency Inversion** - Depender de abstracciones, no de implementaciones
3. **Single Responsibility** - Una clase, una responsabilidad
4. **Open/Closed Principle** - Abierto a extensión, cerrado a modificación
5. **Testability First** - Arquitectura que facilite testing

### **🎪 Patrón Arquitectónico: Layered Architecture + MVVM + Repository**
```
┌─────────────────────────┐
│     PRESENTATION        │ ← UI Widgets (ConsumerWidget)
│     (Views + ViewModels)│ ← State Management (Riverpod)
├─────────────────────────┤
│     BUSINESS LOGIC      │ ← Use Cases / Services
│     (Domain Layer)      │ ← Business Rules
├─────────────────────────┤
│     DATA ACCESS         │ ← Repository Pattern
│     (Repository Layer)  │ ← API Clients / Local Storage
├─────────────────────────┤
│     EXTERNAL SERVICES   │ ← HTTP / Database / Storage
│     (Infrastructure)    │ ← Platform-specific code
└─────────────────────────┘
```

---

## 🏗️ **ESTRUCTURA DE PROYECTO**

### **📁 Organización de Carpetas**
```
lib/
├── 📱 presentation/
│   ├── screens/          # Pantallas principales
│   ├── widgets/          # Widgets reutilizables
│   ├── providers/        # State management (Riverpod)
│   └── router/           # Navegación (GoRouter)
├── 🧠 domain/
│   ├── entities/         # Modelos de negocio
│   ├── repositories/     # Contratos/Interfaces
│   └── usecases/         # Lógica de negocio
├── 💾 data/
│   ├── repositories/     # Implementaciones Repository
│   ├── datasources/      # API clients / Local storage
│   ├── models/           # DTOs / Data models
│   └── mappers/          # Entity ↔ Model conversions
├── 🎨 shared/
│   ├── theme/            # UCN Design System
│   ├── constants/        # Constantes globales
│   ├── utils/            # Utilities / Helpers
│   └── extensions/       # Dart extensions
└── 🔧 core/
    ├── error/            # Error handling
    ├── network/          # HTTP configuration
    └── storage/          # Local storage setup
```

---

## 🎭 **PRESENTATION LAYER**

### **🔷 State Management con Riverpod**

#### **Provider Types y Casos de Uso**
```dart
// 1. StateNotifierProvider - Para estado mutable
final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(ref.read(authRepositoryProvider));
});

// 2. FutureProvider - Para operaciones async one-shot
final userProfileProvider = FutureProvider.family<UserProfile, String>((ref, userId) {
  return ref.read(userRepositoryProvider).getUserProfile(userId);
});

// 3. StreamProvider - Para data streams en tiempo real
final notificationsProvider = StreamProvider.autoDispose<List<Notification>>((ref) {
  return ref.read(notificationServiceProvider).getNotificationStream();
});

// 4. Provider - Para dependencias inmutables
final httpClientProvider = Provider<Dio>((ref) {
  return Dio()..interceptors.add(AuthInterceptor());
});
```

#### **State Management Patterns**

**🎯 Pattern 1: Feature-based StateNotifier**
```dart
// lib/presentation/providers/user_profile_provider.dart
@freezed
class UserProfileState with _$UserProfileState {
  const factory UserProfileState({
    @Default(false) bool isLoading,
    @Default(false) bool isEditing,
    UserProfile? profile,
    String? error,
  }) = _UserProfileState;
}

class UserProfileNotifier extends StateNotifier<UserProfileState> {
  final UserRepository _userRepository;
  
  UserProfileNotifier(this._userRepository) : super(const UserProfileState());
  
  Future<void> loadProfile(String userId) async {
    state = state.copyWith(isLoading: true, error: null);
    
    try {
      final profile = await _userRepository.getUserProfile(userId);
      state = state.copyWith(
        isLoading: false,
        profile: profile,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }
  
  void startEditing() {
    state = state.copyWith(isEditing: true);
  }
  
  Future<void> updateProfile(UserProfile updatedProfile) async {
    state = state.copyWith(isLoading: true);
    
    try {
      await _userRepository.updateUserProfile(updatedProfile);
      state = state.copyWith(
        isLoading: false,
        isEditing: false,
        profile: updatedProfile,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }
}
```

**🎯 Pattern 2: Reactive Dependencies**
```dart
// Auto-refresh cuando auth state cambia
final currentUserProvider = FutureProvider<User?>((ref) async {
  final authState = ref.watch(authProvider);
  
  if (!authState.isAuthenticated) {
    return null;
  }
  
  return ref.read(userRepositoryProvider).getCurrentUser();
});

// Invalidar cache cuando datos cambian
final usersListProvider = FutureProvider<List<User>>((ref) async {
  // Escuchar cambios en user updates
  ref.listen(userUpdateStreamProvider, (previous, next) {
    // Invalidar cache cuando hay updates
    ref.invalidateSelf();
  });
  
  return ref.read(userRepositoryProvider).getUsers();
});
```

### **🧭 Navigation Architecture con GoRouter**

#### **Declarative Routing Structure**
```dart
// lib/presentation/router/app_router.dart
final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authProvider);
  
  return GoRouter(
    initialLocation: '/splash',
    refreshListenable: GoRouterRefreshStream(authState),
    redirect: (context, state) => _handleRedirect(context, state, authState),
    routes: [
      // Splash y Auth
      GoRoute(
        path: '/splash',
        builder: (context, state) => const SplashScreen(),
      ),
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      
      // Main App Shell con Bottom Navigation
      ShellRoute(
        builder: (context, state, child) => MainAppShell(child: child),
        routes: [
          GoRoute(
            path: '/',
            builder: (context, state) => const HomeScreen(),
            routes: [
              GoRoute(
                path: 'profile/:userId',
                builder: (context, state) => UserProfileScreen(
                  userId: state.pathParameters['userId']!,
                ),
              ),
            ],
          ),
          GoRoute(
            path: '/discover',
            builder: (context, state) => const DiscoverScreen(),
          ),
          GoRoute(
            path: '/settings',
            builder: (context, state) => const SettingsScreen(),
          ),
        ],
      ),
      
      // Rutas protegidas con guards
      GoRoute(
        path: '/admin',
        redirect: (context, state) => _requireRole(context, state, 'admin'),
        builder: (context, state) => const AdminScreen(),
      ),
    ],
    errorBuilder: (context, state) => ErrorScreen(error: state.error),
  );
});

String? _handleRedirect(BuildContext context, GoRouterState state, AuthState authState) {
  final isLoggedIn = authState.isAuthenticated;
  final isLoggingIn = state.uri.path == '/login';
  final isSplash = state.uri.path == '/splash';
  
  // Si no está autenticado y no está en login/splash, redirigir a login
  if (!isLoggedIn && !isLoggingIn && !isSplash) {
    return '/login';
  }
  
  // Si está autenticado y está en login, redirigir a home
  if (isLoggedIn && isLoggingIn) {
    return '/';
  }
  
  return null;
}
```

#### **Deep Linking Strategy**
```dart
// lib/presentation/router/route_parser.dart
class UCNRouteInformationParser extends RouteInformationParser<UCNRoutePath> {
  @override
  Future<UCNRoutePath> parseRouteInformation(RouteInformation routeInformation) async {
    final uri = Uri.parse(routeInformation.location ?? '/');
    
    // Handle deep links
    if (uri.pathSegments.isEmpty) {
      return UCNRoutePath.home();
    }
    
    if (uri.pathSegments.length == 2 && uri.pathSegments[0] == 'profile') {
      final userId = uri.pathSegments[1];
      return UCNRoutePath.profile(userId);
    }
    
    // Handle query parameters for shared content
    if (uri.queryParameters.containsKey('shared_post')) {
      final postId = uri.queryParameters['shared_post']!;
      return UCNRoutePath.sharedPost(postId);
    }
    
    return UCNRoutePath.unknown();
  }
}
```

---

## 🧠 **DOMAIN LAYER**

### **🎯 Entity Design Patterns**

#### **Domain Entities**
```dart
// lib/domain/entities/user.dart
@freezed
class User with _$User {
  const factory User({
    required String id,
    required String email,
    required String name,
    required UserRole role,
    String? avatarUrl,
    required DateTime createdAt,
    DateTime? lastActiveAt,
  }) = _User;
  
  const User._();
  
  // Business logic methods
  bool get isActive => lastActiveAt != null && 
    DateTime.now().difference(lastActiveAt!).inDays < 30;
    
  bool canAccessAdminFeatures() => role == UserRole.admin || role == UserRole.moderator;
  
  String get displayName => name.isEmpty ? email.split('@').first : name;
}

enum UserRole { 
  student, 
  teacher, 
  admin, 
  moderator 
}
```

#### **Value Objects Pattern**
```dart
// lib/domain/value_objects/email.dart
@freezed
class Email with _$Email {
  const factory Email._(String value) = _Email;
  
  const Email._();
  
  factory Email(String input) {
    if (!_isValidEmail(input)) {
      throw ArgumentError('Invalid email format: $input');
    }
    return Email._(input.toLowerCase().trim());
  }
  
  String get value => when((value) => value);
  String get domain => value.split('@').last;
  
  static bool _isValidEmail(String email) {
    return RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(email);
  }
}
```

### **🔄 Repository Contracts**
```dart
// lib/domain/repositories/user_repository.dart
abstract class UserRepository {
  Future<User> getCurrentUser();
  Future<User> getUserById(String id);
  Future<List<User>> searchUsers(String query);
  Future<void> updateUser(User user);
  Future<void> deleteUser(String id);
  Stream<User> watchUser(String id);
}

// lib/domain/repositories/content_repository.dart
abstract class ContentRepository {
  Future<PaginatedList<Post>> getPosts({
    int page = 1,
    int limit = 20,
    String? category,
  });
  Future<Post> createPost(CreatePostRequest request);
  Future<void> likePost(String postId);
  Future<void> sharePost(String postId);
  Stream<List<Post>> watchUserFeed(String userId);
}
```

### **🎯 Use Cases Pattern**
```dart
// lib/domain/usecases/authenticate_user.dart
class AuthenticateUser {
  final AuthRepository _authRepository;
  final UserRepository _userRepository;
  final AnalyticsService _analytics;
  
  AuthenticateUser(
    this._authRepository,
    this._userRepository,
    this._analytics,
  );
  
  Future<AuthResult> call(AuthRequest request) async {
    try {
      // 1. Validate input
      if (!_isValidCredentials(request)) {
        return AuthResult.failure(AuthError.invalidCredentials);
      }
      
      // 2. Authenticate with backend
      final authResponse = await _authRepository.authenticate(request);
      
      // 3. Load user profile
      final user = await _userRepository.getUserById(authResponse.userId);
      
      // 4. Track analytics
      await _analytics.track('user_login', {
        'user_id': user.id,
        'login_method': request.method.name,
      });
      
      // 5. Return success result
      return AuthResult.success(
        user: user,
        accessToken: authResponse.accessToken,
        refreshToken: authResponse.refreshToken,
      );
      
    } on NetworkException catch (e) {
      return AuthResult.failure(AuthError.networkError);
    } on AuthException catch (e) {
      return AuthResult.failure(AuthError.fromException(e));
    }
  }
  
  bool _isValidCredentials(AuthRequest request) {
    return request.email.isNotEmpty && request.password.length >= 6;
  }
}
```

---

## 💾 **DATA LAYER**

### **🔄 Repository Implementation Pattern**
```dart
// lib/data/repositories/user_repository_impl.dart
class UserRepositoryImpl implements UserRepository {
  final UserRemoteDataSource _remoteDataSource;
  final UserLocalDataSource _localDataSource;
  final NetworkInfo _networkInfo;
  
  UserRepositoryImpl(
    this._remoteDataSource,
    this._localDataSource,
    this._networkInfo,
  );
  
  @override
  Future<User> getCurrentUser() async {
    try {
      if (await _networkInfo.isConnected) {
        // Try remote first
        final userModel = await _remoteDataSource.getCurrentUser();
        
        // Cache locally
        await _localDataSource.cacheUser(userModel);
        
        return userModel.toEntity();
      } else {
        // Fallback to local cache
        final cachedUser = await _localDataSource.getCachedCurrentUser();
        if (cachedUser != null) {
          return cachedUser.toEntity();
        }
        throw CacheException('No cached user found');
      }
    } on ServerException {
      // Try local cache as fallback
      final cachedUser = await _localDataSource.getCachedCurrentUser();
      if (cachedUser != null) {
        return cachedUser.toEntity();
      }
      rethrow;
    }
  }
  
  @override
  Stream<User> watchUser(String id) async* {
    // Emit cached data immediately
    final cachedUser = await _localDataSource.getCachedUser(id);
    if (cachedUser != null) {
      yield cachedUser.toEntity();
    }
    
    // Then listen to real-time updates
    await for (final userModel in _remoteDataSource.watchUser(id)) {
      await _localDataSource.cacheUser(userModel);
      yield userModel.toEntity();
    }
  }
}
```

### **🌐 Data Source Patterns**

#### **Remote Data Source**
```dart
// lib/data/datasources/user_remote_datasource.dart
abstract class UserRemoteDataSource {
  Future<UserModel> getCurrentUser();
  Future<UserModel> getUserById(String id);
  Future<List<UserModel>> searchUsers(String query);
  Stream<UserModel> watchUser(String id);
}

class UserRemoteDataSourceImpl implements UserRemoteDataSource {
  final Dio _httpClient;
  final String _baseUrl;
  
  UserRemoteDataSourceImpl(this._httpClient, this._baseUrl);
  
  @override
  Future<UserModel> getCurrentUser() async {
    try {
      final response = await _httpClient.get('$_baseUrl/users/me');
      
      if (response.statusCode == 200) {
        return UserModel.fromJson(response.data);
      } else {
        throw ServerException('Failed to load current user');
      }
    } on DioException catch (e) {
      throw ServerException('Network error: ${e.message}');
    }
  }
  
  @override
  Stream<UserModel> watchUser(String id) {
    // WebSocket or Server-Sent Events implementation
    return _webSocketService.connect('/users/$id/stream')
        .map((data) => UserModel.fromJson(data));
  }
}
```

#### **Local Data Source**
```dart
// lib/data/datasources/user_local_datasource.dart
abstract class UserLocalDataSource {
  Future<UserModel?> getCachedCurrentUser();
  Future<UserModel?> getCachedUser(String id);
  Future<void> cacheUser(UserModel user);
  Future<void> clearCache();
}

class UserLocalDataSourceImpl implements UserLocalDataSource {
  final SharedPreferences _sharedPreferences;
  final HiveBox<UserModel> _userBox;
  
  UserLocalDataSourceImpl(this._sharedPreferences, this._userBox);
  
  @override
  Future<UserModel?> getCachedCurrentUser() async {
    final currentUserId = _sharedPreferences.getString('current_user_id');
    if (currentUserId != null) {
      return _userBox.get(currentUserId);
    }
    return null;
  }
  
  @override
  Future<void> cacheUser(UserModel user) async {
    await _userBox.put(user.id, user);
    
    // Update current user if it's the same
    final currentUserId = _sharedPreferences.getString('current_user_id');
    if (currentUserId == user.id) {
      await _sharedPreferences.setString('current_user_id', user.id);
    }
  }
}
```

---

## ⚡ **PERFORMANCE PATTERNS**

### **🚀 Optimization Strategies**

#### **1. Lazy Loading Pattern**
```dart
// lib/presentation/widgets/lazy_list_view.dart
class LazyListView<T> extends ConsumerStatefulWidget {
  final Future<List<T>> Function(int page) loadItems;
  final Widget Function(T item) itemBuilder;
  final int itemsPerPage;
  
  const LazyListView({
    required this.loadItems,
    required this.itemBuilder,
    this.itemsPerPage = 20,
    super.key,
  });

  @override
  ConsumerState<LazyListView<T>> createState() => _LazyListViewState<T>();
}

class _LazyListViewState<T> extends ConsumerState<LazyListView<T>> {
  final List<T> _items = [];
  int _currentPage = 1;
  bool _isLoading = false;
  bool _hasMore = true;
  
  final ScrollController _scrollController = ScrollController();
  
  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
    _loadInitialItems();
  }
  
  void _onScroll() {
    if (_scrollController.position.pixels >= 
        _scrollController.position.maxScrollExtent - 200) {
      _loadMoreItems();
    }
  }
  
  Future<void> _loadMoreItems() async {
    if (_isLoading || !_hasMore) return;
    
    setState(() => _isLoading = true);
    
    try {
      final newItems = await widget.loadItems(_currentPage);
      
      setState(() {
        _items.addAll(newItems);
        _currentPage++;
        _hasMore = newItems.length == widget.itemsPerPage;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      // Handle error
    }
  }
}
```

#### **2. Image Caching Strategy**
```dart
// lib/shared/widgets/cached_network_image_widget.dart
class UCNCachedNetworkImage extends StatelessWidget {
  final String imageUrl;
  final double? width;
  final double? height;
  final BoxFit? fit;
  
  const UCNCachedNetworkImage({
    required this.imageUrl,
    this.width,
    this.height,
    this.fit,
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    return CachedNetworkImage(
      imageUrl: imageUrl,
      width: width,
      height: height,
      fit: fit ?? BoxFit.cover,
      placeholder: (context, url) => const UCNShimmerPlaceholder(),
      errorWidget: (context, url, error) => const UCNErrorPlaceholder(),
      cacheManager: UCNCacheManager.instance,
      memCacheWidth: width?.toInt(),
      memCacheHeight: height?.toInt(),
    );
  }
}

class UCNCacheManager {
  static final instance = CacheManager(
    Config(
      'ucn_image_cache',
      stalePeriod: const Duration(days: 7),
      maxNrOfCacheObjects: 100,
      repo: JsonCacheInfoRepository(databaseName: 'ucn_cache.db'),
    ),
  );
}
```

### **🎯 Memory Management**
```dart
// lib/core/memory/memory_manager.dart
class MemoryManager {
  static final _instance = MemoryManager._internal();
  factory MemoryManager() => _instance;
  MemoryManager._internal();
  
  final Map<String, Timer> _disposeTimers = {};
  
  void scheduleDispose(String key, VoidCallback dispose, Duration delay) {
    // Cancel existing timer
    _disposeTimers[key]?.cancel();
    
    // Schedule new disposal
    _disposeTimers[key] = Timer(delay, () {
      dispose();
      _disposeTimers.remove(key);
    });
  }
  
  void cancelDispose(String key) {
    _disposeTimers[key]?.cancel();
    _disposeTimers.remove(key);
  }
  
  void disposeAll() {
    for (final timer in _disposeTimers.values) {
      timer.cancel();
    }
    _disposeTimers.clear();
  }
}
```

---

## 🛡️ **ERROR HANDLING ARCHITECTURE**

### **🎯 Centralized Error Handling**
```dart
// lib/core/error/app_error.dart
@freezed
class AppError with _$AppError {
  const factory AppError.network({
    required String message,
    int? statusCode,
  }) = NetworkError;
  
  const factory AppError.authentication({
    required String message,
  }) = AuthenticationError;
  
  const factory AppError.validation({
    required String field,
    required String message,
  }) = ValidationError;
  
  const factory AppError.permission({
    required String message,
    required String requiredRole,
  }) = PermissionError;
  
  const factory AppError.unknown({
    required String message,
    Object? originalError,
  }) = UnknownError;
}

// Global error handler
class GlobalErrorHandler {
  static void handleError(AppError error) {
    // Log error
    Logger.error('App Error: ${error.toString()}');
    
    // Track in analytics
    AnalyticsService.instance.trackError(error);
    
    // Show user-friendly message
    _showErrorToUser(error);
  }
  
  static void _showErrorToUser(AppError error) {
    final message = error.when(
      network: (message, statusCode) => 'Problema de conexión. Inténtalo nuevamente.',
      authentication: (message) => 'Sesión expirada. Por favor, inicia sesión nuevamente.',
      validation: (field, message) => 'Error en $field: $message',
      permission: (message, requiredRole) => 'No tienes permisos para esta acción.',
      unknown: (message, originalError) => 'Ha ocurrido un error inesperado.',
    );
    
    // Show snackbar or dialog
    NotificationService.instance.showError(message);
  }
}
```

---

## 🧪 **TESTING ARCHITECTURE**

### **🎯 Testing Strategy**
```dart
// test/helpers/test_helpers.dart
class TestHelpers {
  static ProviderContainer createContainer({
    List<Override> overrides = const [],
  }) {
    return ProviderContainer(
      overrides: [
        // Mock repositories
        userRepositoryProvider.overrideWithValue(MockUserRepository()),
        authRepositoryProvider.overrideWithValue(MockAuthRepository()),
        ...overrides,
      ],
    );
  }
  
  static Widget createTestWidget(
    Widget child, {
    List<Override> overrides = const [],
  }) {
    return ProviderScope(
      overrides: overrides,
      child: MaterialApp(
        home: child,
      ),
    );
  }
}

// Integration test helpers
class IntegrationTestHelpers {
  static Future<void> authenticateTestUser(WidgetTester tester) async {
    await tester.enterText(find.byKey(const Key('email_field')), 'test@ucn.cl');
    await tester.enterText(find.byKey(const Key('password_field')), 'password123');
    await tester.tap(find.byKey(const Key('login_button')));
    await tester.pumpAndSettle();
  }
  
  static Future<void> navigateToScreen(WidgetTester tester, String route) async {
    await tester.tap(find.byKey(Key('nav_$route')));
    await tester.pumpAndSettle();
  }
}
```

---

**🏗️ ARQUITECTURA FLUTTER** | **📅 Versión**: 1.0 | **🎯 Estado**: READY FOR IMPLEMENTATION 