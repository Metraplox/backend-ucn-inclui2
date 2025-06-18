# 📋 **CÓDIGO TEMPLATES - FLUTTER REFACTORING**
## Templates Copy-Paste Ready para Implementación

### 📅 **Fecha**: Enero 2025
### 🎯 **Objetivo**: Templates listos para usar durante refactoring
### 👨‍💻 **Audiencia**: Desarrolladores Flutter implementando refactoring

---

## 🏗️ **1. RIVERPOD STATE MANAGEMENT TEMPLATES**

### **🔷 StateNotifier Provider Template**
```dart
// lib/providers/auth_provider.dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:freezed_annotation/freezed_annotation.dart';

part 'auth_provider.freezed.dart';

@freezed
class AuthState with _$AuthState {
  const factory AuthState({
    @Default(false) bool isLoading,
    @Default(false) bool isAuthenticated,
    String? user,
    String? error,
  }) = _AuthState;
}

class AuthNotifier extends StateNotifier<AuthState> {
  AuthNotifier() : super(const AuthState());

  Future<void> login(String email, String password) async {
    state = state.copyWith(isLoading: true, error: null);
    
    try {
      // API call simulation
      await Future.delayed(const Duration(seconds: 2));
      
      state = state.copyWith(
        isLoading: false,
        isAuthenticated: true,
        user: email,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  void logout() {
    state = const AuthState();
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier();
});
```

### **🔷 FutureProvider Template**
```dart
// lib/providers/data_provider.dart
import 'package:flutter_riverpod/flutter_riverpod.dart';

// Simple FutureProvider
final usersProvider = FutureProvider<List<User>>((ref) async {
  // Simular API call
  await Future.delayed(const Duration(seconds: 1));
  return [
    User(id: '1', name: 'Juan Pérez', email: 'juan@ucn.cl'),
    User(id: '2', name: 'María González', email: 'maria@ucn.cl'),
  ];
});

// FutureProvider con parámetros
final userByIdProvider = FutureProvider.family<User?, String>((ref, userId) async {
  await Future.delayed(const Duration(milliseconds: 500));
  final users = await ref.watch(usersProvider.future);
  return users.firstWhere((user) => user.id == userId);
});

// FutureProvider con auto-refresh
final statsProvider = FutureProvider.autoDispose<AppStats>((ref) async {
  // Auto-dispose cuando widget se desmonta
  final api = ref.watch(apiClientProvider);
  return api.getStats();
});
```

### **🔷 StreamProvider Template**
```dart
// lib/providers/notifications_provider.dart
import 'package:flutter_riverpod/flutter_riverpod.dart';

final notificationsProvider = StreamProvider<List<Notification>>((ref) {
  return Stream.periodic(
    const Duration(seconds: 5),
    (count) => [
      Notification(
        id: count.toString(),
        title: 'Nueva notificación $count',
        timestamp: DateTime.now(),
      ),
    ],
  );
});

// StreamProvider con WebSocket simulation
final realTimeDataProvider = StreamProvider.autoDispose<RealtimeData>((ref) {
  late StreamController<RealtimeData> controller;
  
  controller = StreamController<RealtimeData>(
    onListen: () {
      // Simular conexión WebSocket
      Timer.periodic(const Duration(seconds: 2), (timer) {
        if (controller.isClosed) {
          timer.cancel();
          return;
        }
        
        controller.add(RealtimeData(
          value: Random().nextInt(100),
          timestamp: DateTime.now(),
        ));
      });
    },
    onCancel: () => controller.close(),
  );
  
  ref.onDispose(() => controller.close());
  return controller.stream;
});
```

---

## 📱 **2. CONSUMER WIDGET TEMPLATES**

### **🔷 ConsumerWidget Básico**
```dart
// lib/screens/home_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);
    
    return Scaffold(
      appBar: AppBar(
        title: const Text('UCN INCLUI2'),
        actions: [
          if (authState.isAuthenticated)
            IconButton(
              onPressed: () => ref.read(authProvider.notifier).logout(),
              icon: const Icon(Icons.logout),
            ),
        ],
      ),
      body: authState.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stack) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error, size: 64, color: Colors.red),
              const SizedBox(height: 16),
              Text('Error: $error'),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () => ref.refresh(authProvider),
                child: const Text('Reintentar'),
              ),
            ],
          ),
        ),
        data: (user) => _buildHomeContent(context, ref, user),
      ),
    );
  }

  Widget _buildHomeContent(BuildContext context, WidgetRef ref, String? user) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Bienvenido, $user',
            style: Theme.of(context).textTheme.headlineMedium,
          ),
          const SizedBox(height: 24),
          // Contenido principal
          Expanded(
            child: _buildDashboardGrid(context, ref),
          ),
        ],
      ),
    );
  }
}
```

### **🔷 ConsumerStatefulWidget Template**
```dart
// lib/widgets/paginated_list_widget.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class PaginatedListWidget extends ConsumerStatefulWidget {
  const PaginatedListWidget({super.key});

  @override
  ConsumerState<PaginatedListWidget> createState() => _PaginatedListWidgetState();
}

class _PaginatedListWidgetState extends ConsumerState<PaginatedListWidget> {
  final ScrollController _scrollController = ScrollController();
  int _currentPage = 1;
  final List<dynamic> _items = [];
  bool _isLoadingMore = false;

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadInitialData();
    });
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.position.pixels >= 
        _scrollController.position.maxScrollExtent - 200) {
      _loadMoreData();
    }
  }

  Future<void> _loadInitialData() async {
    final data = await ref.read(paginatedDataProvider(1).future);
    if (mounted) {
      setState(() {
        _items.addAll(data);
      });
    }
  }

  Future<void> _loadMoreData() async {
    if (_isLoadingMore) return;
    
    setState(() => _isLoadingMore = true);
    
    try {
      final data = await ref.read(paginatedDataProvider(_currentPage + 1).future);
      if (mounted) {
        setState(() {
          _currentPage++;
          _items.addAll(data);
          _isLoadingMore = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoadingMore = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error cargando datos: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      controller: _scrollController,
      itemCount: _items.length + (_isLoadingMore ? 1 : 0),
      itemBuilder: (context, index) {
        if (index >= _items.length) {
          return const Center(
            child: Padding(
              padding: EdgeInsets.all(16),
              child: CircularProgressIndicator(),
            ),
          );
        }
        
        return ListTile(
          title: Text(_items[index].title),
          subtitle: Text(_items[index].description),
          onTap: () => _onItemTap(_items[index]),
        );
      },
    );
  }

  void _onItemTap(dynamic item) {
    // Handle item tap
    context.push('/item/${item.id}');
  }
}
```

---

## 🧭 **3. GO_ROUTER TEMPLATES**

### **🔷 Router Básico**
```dart
// lib/router/app_router.dart
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authProvider);
  
  return GoRouter(
    initialLocation: '/',
    redirect: (context, state) {
      final isAuthenticated = authState.isAuthenticated;
      final isLoginPage = state.uri.path == '/login';
      
      // Si no está autenticado y no está en login, redirigir a login
      if (!isAuthenticated && !isLoginPage) {
        return '/login';
      }
      
      // Si está autenticado y está en login, redirigir a home
      if (isAuthenticated && isLoginPage) {
        return '/';
      }
      
      return null; // No redirect
    },
    routes: [
      GoRoute(
        path: '/',
        name: 'home',
        builder: (context, state) => const HomeScreen(),
        routes: [
          GoRoute(
            path: 'profile',
            name: 'profile',
            builder: (context, state) => const ProfileScreen(),
          ),
          GoRoute(
            path: 'settings',
            name: 'settings', 
            builder: (context, state) => const SettingsScreen(),
          ),
        ],
      ),
      GoRoute(
        path: '/login',
        name: 'login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/item/:id',
        name: 'item-detail',
        builder: (context, state) {
          final id = state.pathParameters['id']!;
          return ItemDetailScreen(itemId: id);
        },
      ),
    ],
    errorBuilder: (context, state) => ErrorScreen(error: state.error),
  );
});
```

### **🔷 Router con Guards y Roles**
```dart
// lib/router/auth_guards.dart
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class AuthGuard {
  static String? redirectToLogin(BuildContext context, GoRouterState state) {
    // Implementar lógica de autenticación
    final container = ProviderScope.containerOf(context);
    final authState = container.read(authProvider);
    
    if (!authState.isAuthenticated) {
      return '/login?redirect=${state.uri.path}';
    }
    
    return null;
  }
  
  static String? requireRole(String requiredRole) {
    return (BuildContext context, GoRouterState state) {
      final container = ProviderScope.containerOf(context);
      final authState = container.read(authProvider);
      final userRole = container.read(userRoleProvider);
      
      if (!authState.isAuthenticated) {
        return '/login?redirect=${state.uri.path}';
      }
      
      if (userRole != requiredRole) {
        return '/unauthorized';
      }
      
      return null;
    };
  }
}

// Router con guards aplicados
final protectedRouterProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    routes: [
      // Rutas públicas
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      
      // Rutas protegidas
      GoRoute(
        path: '/admin',
        redirect: AuthGuard.requireRole('admin'),
        builder: (context, state) => const AdminScreen(),
        routes: [
          GoRoute(
            path: 'users',
            redirect: AuthGuard.requireRole('admin'),
            builder: (context, state) => const UserManagementScreen(),
          ),
        ],
      ),
      
      // Rutas que requieren autenticación
      GoRoute(
        path: '/dashboard',
        redirect: AuthGuard.redirectToLogin,
        builder: (context, state) => const DashboardScreen(),
      ),
    ],
  );
});
```

### **🔷 Navegación Declarativa**
```dart
// lib/utils/navigation_helper.dart
import 'package:go_router/go_router.dart';
import 'package:flutter/material.dart';

class NavigationHelper {
  static void goToHome(BuildContext context) {
    context.go('/');
  }
  
  static void goToProfile(BuildContext context) {
    context.push('/profile');
  }
  
  static void goToItemDetail(BuildContext context, String itemId) {
    context.push('/item/$itemId');
  }
  
  static void goToSettings(BuildContext context) {
    context.pushNamed('settings');
  }
  
  static void goBack(BuildContext context) {
    if (context.canPop()) {
      context.pop();
    } else {
      context.go('/');
    }
  }
  
  static void showModal(BuildContext context, Widget child) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (context) => child,
    );
  }
  
  static void replaceWithLogin(BuildContext context) {
    context.go('/login');
  }
}

// Extension para facilitar navegación
extension GoRouterExtension on BuildContext {
  void goToHome() => NavigationHelper.goToHome(this);
  void goToProfile() => NavigationHelper.goToProfile(this);
  void goToItemDetail(String id) => NavigationHelper.goToItemDetail(this, id);
  void goToSettings() => NavigationHelper.goToSettings(this);
  void goBackSafe() => NavigationHelper.goBack(this);
}
```

---

## 🎨 **4. UCN DESIGN SYSTEM TEMPLATES**

### **🔷 Theme UCN**
```dart
// lib/theme/ucn_theme.dart
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class UCNTheme {
  // Colores institucionales UCN
  static const Color primaryColor = Color(0xFF1565C0); // Azul UCN
  static const Color secondaryColor = Color(0xFF0D47A1); // Azul oscuro
  static const Color accentColor = Color(0xFF42A5F5); // Azul claro
  static const Color backgroundColor = Color(0xFFF5F5F5);
  static const Color surfaceColor = Color(0xFFFFFFFF);
  static const Color errorColor = Color(0xFFD32F2F);
  static const Color warningColor = Color(0xFFFF9800);
  static const Color successColor = Color(0xFF4CAF50);
  
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      colorScheme: const ColorScheme.light(
        primary: primaryColor,
        secondary: secondaryColor,
        tertiary: accentColor,
        surface: surfaceColor,
        background: backgroundColor,
        error: errorColor,
      ),
      textTheme: GoogleFonts.robotoTextTheme().copyWith(
        headlineLarge: GoogleFonts.roboto(
          fontSize: 32,
          fontWeight: FontWeight.bold,
          color: primaryColor,
        ),
        headlineMedium: GoogleFonts.roboto(
          fontSize: 24,
          fontWeight: FontWeight.w600,
          color: primaryColor,
        ),
        bodyLarge: GoogleFonts.roboto(
          fontSize: 16,
          fontWeight: FontWeight.normal,
        ),
        bodyMedium: GoogleFonts.roboto(
          fontSize: 14,
          fontWeight: FontWeight.normal,
        ),
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: primaryColor,
        foregroundColor: Colors.white,
        elevation: 2,
        centerTitle: true,
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primaryColor,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
        ),
      ),
      cardTheme: CardTheme(
        elevation: 2,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        margin: const EdgeInsets.all(8),
      ),
      inputDecorationTheme: InputDecorationTheme(
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: primaryColor, width: 2),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      ),
    );
  }
}
```

### **🔷 UCN Components**
```dart
// lib/widgets/ucn_components.dart
import 'package:flutter/material.dart';

class UCNCard extends StatelessWidget {
  final Widget child;
  final VoidCallback? onTap;
  final EdgeInsetsGeometry? padding;
  final bool isLoading;
  
  const UCNCard({
    super.key,
    required this.child,
    this.onTap,
    this.padding,
    this.isLoading = false,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: InkWell(
        onTap: isLoading ? null : onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: padding ?? const EdgeInsets.all(16),
          child: isLoading
              ? const Center(child: CircularProgressIndicator())
              : child,
        ),
      ),
    );
  }
}

class UCNButton extends StatelessWidget {
  final String text;
  final VoidCallback? onPressed;
  final ButtonType type;
  final bool isLoading;
  final IconData? icon;
  
  const UCNButton({
    super.key,
    required this.text,
    this.onPressed,
    this.type = ButtonType.primary,
    this.isLoading = false,
    this.icon,
  });

  @override
  Widget build(BuildContext context) {
    Widget button;
    
    switch (type) {
      case ButtonType.primary:
        button = ElevatedButton.icon(
          onPressed: isLoading ? null : onPressed,
          icon: _buildIcon(),
          label: _buildLabel(),
        );
        break;
      case ButtonType.secondary:
        button = OutlinedButton.icon(
          onPressed: isLoading ? null : onPressed,
          icon: _buildIcon(),
          label: _buildLabel(),
        );
        break;
      case ButtonType.text:
        button = TextButton.icon(
          onPressed: isLoading ? null : onPressed,
          icon: _buildIcon(),
          label: _buildLabel(),
        );
        break;
    }
    
    return SizedBox(
      height: 48,
      child: button,
    );
  }
  
  Widget _buildIcon() {
    if (isLoading) {
      return const SizedBox(
        width: 16,
        height: 16,
        child: CircularProgressIndicator(strokeWidth: 2),
      );
    }
    return icon != null ? Icon(icon) : const SizedBox.shrink();
  }
  
  Widget _buildLabel() {
    return Text(text);
  }
}

enum ButtonType { primary, secondary, text }

class UCNTextField extends StatelessWidget {
  final String label;
  final String? hint;
  final TextEditingController? controller;
  final String? Function(String?)? validator;
  final bool obscureText;
  final TextInputType? keyboardType;
  final IconData? prefixIcon;
  final Widget? suffixIcon;
  
  const UCNTextField({
    super.key,
    required this.label,
    this.hint,
    this.controller,
    this.validator,
    this.obscureText = false,
    this.keyboardType,
    this.prefixIcon,
    this.suffixIcon,
  });

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      controller: controller,
      validator: validator,
      obscureText: obscureText,
      keyboardType: keyboardType,
      decoration: InputDecoration(
        labelText: label,
        hintText: hint,
        prefixIcon: prefixIcon != null ? Icon(prefixIcon) : null,
        suffixIcon: suffixIcon,
      ),
    );
  }
}
```

---

## 🧪 **5. TESTING TEMPLATES**

### **🔷 Unit Test Template**
```dart
// test/providers/auth_provider_test.dart
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mockito/mockito.dart';

void main() {
  group('AuthProvider Tests', () {
    late ProviderContainer container;
    
    setUp(() {
      container = ProviderContainer();
    });
    
    tearDown(() {
      container.dispose();
    });
    
    test('initial state should be unauthenticated', () {
      final authState = container.read(authProvider);
      
      expect(authState.isAuthenticated, false);
      expect(authState.isLoading, false);
      expect(authState.user, null);
      expect(authState.error, null);
    });
    
    test('login should update state correctly on success', () async {
      final notifier = container.read(authProvider.notifier);
      
      // Act
      await notifier.login('test@ucn.cl', 'password123');
      
      // Assert
      final state = container.read(authProvider);
      expect(state.isAuthenticated, true);
      expect(state.isLoading, false);
      expect(state.user, 'test@ucn.cl');
      expect(state.error, null);
    });
    
    test('logout should reset state', () {
      final notifier = container.read(authProvider.notifier);
      
      // Arrange - set authenticated state first
      notifier.login('test@ucn.cl', 'password123');
      
      // Act
      notifier.logout();
      
      // Assert
      final state = container.read(authProvider);
      expect(state.isAuthenticated, false);
      expect(state.user, null);
    });
  });
}
```

### **🔷 Widget Test Template**
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
          home: Scaffold(body: child),
        ),
      );
    }
    
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
    
    testWidgets('should trigger onPressed when tapped', (tester) async {
      // Arrange
      bool wasPressed = false;
      
      // Act
      await tester.pumpWidget(
        createTestWidget(
          UCNButton(
            text: 'Test Button',
            onPressed: () => wasPressed = true,
          ),
        ),
      );
      
      await tester.tap(find.byType(UCNButton));
      await tester.pump();
      
      // Assert
      expect(wasPressed, true);
    });
    
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
    
    testWidgets('should be disabled when isLoading is true', (tester) async {
      // Arrange
      bool wasPressed = false;
      
      // Act
      await tester.pumpWidget(
        createTestWidget(
          UCNButton(
            text: 'Disabled Button',
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
}
```

### **🔷 Integration Test Template**
```dart
// integration_test/app_test.dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:my_app/main.dart' as app;

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();
  
  group('App Integration Tests', () {
    
    testWidgets('complete login flow should work', (tester) async {
      // Arrange
      app.main();
      await tester.pumpAndSettle();
      
      // Act - Navigate to login
      await tester.tap(find.text('Iniciar Sesión'));
      await tester.pumpAndSettle();
      
      // Enter credentials
      await tester.enterText(
        find.byType(TextField).first,
        'test@ucn.cl',
      );
      await tester.enterText(
        find.byType(TextField).last,
        'password123',
      );
      
      // Submit login
      await tester.tap(find.text('Ingresar'));
      await tester.pumpAndSettle(const Duration(seconds: 3));
      
      // Assert - Should be on home screen
      expect(find.text('Bienvenido'), findsOneWidget);
      expect(find.byIcon(Icons.logout), findsOneWidget);
    });
    
    testWidgets('navigation flow should work correctly', (tester) async {
      // Arrange
      app.main();
      await tester.pumpAndSettle();
      
      // Login first
      await _performLogin(tester);
      
      // Act - Navigate to profile
      await tester.tap(find.text('Perfil'));
      await tester.pumpAndSettle();
      
      // Assert
      expect(find.text('Mi Perfil'), findsOneWidget);
      
      // Navigate back
      await tester.tap(find.byIcon(Icons.arrow_back));
      await tester.pumpAndSettle();
      
      // Should be back on home
      expect(find.text('Bienvenido'), findsOneWidget);
    });
  });
}

Future<void> _performLogin(WidgetTester tester) async {
  await tester.tap(find.text('Iniciar Sesión'));
  await tester.pumpAndSettle();
  
  await tester.enterText(find.byType(TextField).first, 'test@ucn.cl');
  await tester.enterText(find.byType(TextField).last, 'password123');
  
  await tester.tap(find.text('Ingresar'));
  await tester.pumpAndSettle(const Duration(seconds: 3));
}
```

---

## 📱 **6. SCREEN TEMPLATES**

### **🔷 Lista con Paginación Infinita**
```dart
// lib/screens/items_list_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class ItemsListScreen extends ConsumerStatefulWidget {
  const ItemsListScreen({super.key});

  @override
  ConsumerState<ItemsListScreen> createState() => _ItemsListScreenState();
}

class _ItemsListScreenState extends ConsumerState<ItemsListScreen> {
  final ScrollController _scrollController = ScrollController();
  
  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
  }
  
  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }
  
  void _onScroll() {
    if (_scrollController.position.pixels >= 
        _scrollController.position.maxScrollExtent - 200) {
      ref.read(paginatedItemsProvider.notifier).loadMore();
    }
  }

  @override
  Widget build(BuildContext context) {
    final itemsState = ref.watch(paginatedItemsProvider);
    
    return Scaffold(
      appBar: AppBar(
        title: const Text('Items'),
        actions: [
          IconButton(
            onPressed: () => ref.refresh(paginatedItemsProvider),
            icon: const Icon(Icons.refresh),
          ),
        ],
      ),
      body: itemsState.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stack) => _buildErrorWidget(error),
        data: (items) => _buildItemsList(items),
      ),
    );
  }
  
  Widget _buildErrorWidget(Object error) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.error, size: 64, color: Colors.red),
          const SizedBox(height: 16),
          Text('Error: $error'),
          const SizedBox(height: 16),
          UCNButton(
            text: 'Reintentar',
            onPressed: () => ref.refresh(paginatedItemsProvider),
          ),
        ],
      ),
    );
  }
  
  Widget _buildItemsList(List<Item> items) {
    return RefreshIndicator(
      onRefresh: () => ref.refresh(paginatedItemsProvider.future),
      child: ListView.builder(
        controller: _scrollController,
        itemCount: items.length + 1, // +1 for loading indicator
        itemBuilder: (context, index) {
          if (index >= items.length) {
            final loadingState = ref.watch(paginationLoadingProvider);
            return loadingState 
                ? const Center(
                    child: Padding(
                      padding: EdgeInsets.all(16),
                      child: CircularProgressIndicator(),
                    ),
                  )
                : const SizedBox.shrink();
          }
          
          final item = items[index];
          return UCNCard(
            onTap: () => context.goToItemDetail(item.id),
            child: ListTile(
              leading: CircleAvatar(
                backgroundImage: NetworkImage(item.imageUrl),
              ),
              title: Text(item.title),
              subtitle: Text(item.description),
              trailing: const Icon(Icons.arrow_forward_ios),
            ),
          );
        },
      ),
    );
  }
}
```

---

## 🛠️ **7. COMANDOS ÚTILES**

### **🔷 Scripts de Desarrollo**
```bash
# Setup inicial
flutter pub get
flutter pub run build_runner build --delete-conflicting-outputs

# Testing
flutter test
flutter test --coverage
flutter test integration_test/

# Build
flutter build apk --release
flutter build web --release

# Análisis
flutter analyze
dart fix --apply

# Generate code
flutter pub run build_runner build
flutter pub run build_runner watch

# Clean
flutter clean
flutter pub get
```

### **🔷 Comandos Git**
```bash
# Feature branch workflow
git checkout -b feature/refactoring-week-1
git add .
git commit -m "feat: implement Riverpod state management"
git push origin feature/refactoring-week-1

# Code review
git checkout main
git pull origin main
git merge feature/refactoring-week-1
git push origin main
```

---

**📋 TEMPLATES FLUTTER** | **📅 Versión**: 1.0 | **🎯 Estado**: READY TO USE
