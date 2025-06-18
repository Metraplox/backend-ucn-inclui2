# ⚡ **PERFORMANCE OPTIMIZATION - FLUTTER REFACTORING**
## Benchmarks y Métricas Específicas

### 📅 **Fecha**: Enero 2025
### 🎯 **Objetivo**: Optimización performance para Flutter refactoring
### 👨‍💻 **Audiencia**: Desarrolladores Flutter, Performance Engineers

---

## 🎯 **OBJETIVOS PERFORMANCE**

### **📊 Benchmarks Específicos**
```yaml
Performance Targets:
┌─────────────────────┬─────────────┬─────────────┬─────────────┐
│ Métrica             │ Antes       │ Después     │ Mejora      │
├─────────────────────┼─────────────┼─────────────┼─────────────┤
│ App Startup (Cold)  │ 4.2s        │ < 3.0s      │ -30%        │
│ App Startup (Warm)  │ 1.8s        │ < 1.2s      │ -33%        │
│ Hot Reload          │ 3.2s        │ < 1.8s      │ -44%        │
│ Build Time          │ 45s         │ < 35s       │ -22%        │
│ Frame Rendering     │ 55 FPS      │ 60 FPS      │ +9%         │
│ Memory Usage        │ 180MB       │ < 150MB     │ -17%        │
│ Bundle Size (APK)   │ 65MB        │ < 50MB      │ -23%        │
│ Navigation Time     │ 350ms       │ < 200ms     │ -43%        │
│ List Scroll         │ Occasional  │ Smooth      │ Jank-free   │
│ Image Loading       │ 2.1s        │ < 1.0s      │ -52%        │
└─────────────────────┴─────────────┴─────────────┴─────────────┘
```

### **🏆 Performance KPIs**
- **User Experience**: 60 FPS consistent, no jank
- **Responsiveness**: UI interactions < 100ms
- **Loading**: Critical screens < 1s
- **Memory**: Stable usage, no leaks
- **Network**: Efficient API calls, smart caching

---

## 🚀 **1. APP STARTUP OPTIMIZATION**

### **🔷 Startup Performance Strategy**

#### **Lazy Initialization Pattern**
```dart
// lib/core/app_initialization.dart
class AppInitializer {
  static final _instance = AppInitializer._internal();
  factory AppInitializer() => _instance;
  AppInitializer._internal();
  
  bool _isInitialized = false;
  final Map<String, dynamic> _services = {};
  
  Future<void> initializeApp() async {
    if (_isInitialized) return;
    
    final stopwatch = Stopwatch()..start();
    
    // 1. Critical services first (parallel)
    await Future.wait([
      _initializeCriticalServices(),
      _setupErrorHandling(),
      _initializeCache(),
    ]);
    
    // 2. Secondary services (can be deferred)
    _initializeSecondaryServices();
    
    _isInitialized = true;
    stopwatch.stop();
    
    _logStartupTime(stopwatch.elapsedMilliseconds);
  }
  
  Future<void> _initializeCriticalServices() async {
    // Only services needed for first screen
    _services['sharedPreferences'] = await SharedPreferences.getInstance();
    _services['localDb'] = await _initializeLocalDatabase();
  }
  
  void _initializeSecondaryServices() {
    // Defer non-critical services
    Timer(const Duration(milliseconds: 500), () async {
      _services['analytics'] = await _initializeAnalytics();
      _services['crashlytics'] = await _initializeCrashlytics();
      _services['notifications'] = await _initializeNotifications();
    });
  }
}
```

#### **Optimized Main Function**
```dart
// lib/main.dart
void main() async {
  // Minimize work in main()
  WidgetsFlutterBinding.ensureInitialized();
  
  // Only critical initialization
  await AppInitializer().initializeApp();
  
  runApp(const ProviderScope(child: UCNApp()));
}

class UCNApp extends ConsumerWidget {
  const UCNApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return MaterialApp.router(
      title: 'UCN INCLUI2',
      theme: UCNTheme.lightTheme,
      routerConfig: ref.watch(routerProvider),
      
      // Performance optimizations
      builder: (context, child) {
        return MediaQuery(
          // Disable text scaling for performance
          data: MediaQuery.of(context).copyWith(
            textScaleFactor: 1.0,
          ),
          child: child!,
        );
      },
      
      // Deferred loading for non-critical screens
      onGenerateRoute: (settings) {
        return _deferredRouteGeneration(settings);
      },
    );
  }
}
```

#### **Splash Screen Optimization**
```dart
// lib/screens/splash_screen.dart
class SplashScreen extends ConsumerStatefulWidget {
  const SplashScreen({super.key});

  @override
  ConsumerState<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends ConsumerState<SplashScreen> 
    with SingleTickerProviderStateMixin {
  
  late AnimationController _controller;
  
  @override
  void initState() {
    super.initState();
    
    _controller = AnimationController(
      duration: const Duration(milliseconds: 1500),
      vsync: this,
    );
    
    // Start background initialization
    _initializeAndNavigate();
  }
  
  Future<void> _initializeAndNavigate() async {
    // Start animation
    _controller.forward();
    
    // Initialize app data in parallel with animation
    final initializationFuture = _initializeAppData();
    final animationFuture = _controller.forward();
    
    // Wait for both to complete
    await Future.wait([initializationFuture, animationFuture]);
    
    // Navigate to next screen
    if (mounted) {
      context.go('/');
    }
  }
  
  Future<void> _initializeAppData() async {
    // Load critical data for home screen
    await ref.read(authProvider.notifier).checkAuthStatus();
    
    // Preload essential data
    ref.read(userPreferencesProvider);
    ref.read(appConfigProvider);
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: UCNTheme.primaryColor,
      body: Center(
        child: FadeTransition(
          opacity: _controller,
          child: const Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              UCNLogo(size: 120),
              SizedBox(height: 24),
              Text(
                'UCN INCLUI2',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
```

---

## 🧠 **2. STATE MANAGEMENT OPTIMIZATION**

### **🔷 Riverpod Performance Patterns**

#### **Optimized Provider Structure**
```dart
// lib/providers/optimized_providers.dart

// ✅ DO: Use .family for parameterized providers
final userProvider = FutureProvider.family<User, String>((ref, userId) async {
  return ref.read(userRepositoryProvider).getUserById(userId);
});

// ✅ DO: Use .autoDispose for temporary data
final searchResultsProvider = FutureProvider.autoDispose
    .family<List<Post>, String>((ref, query) async {
  // Auto-dispose when widget unmounts
  final repository = ref.read(postRepositoryProvider);
  return repository.searchPosts(query);
});

// ✅ DO: Use selective watching to prevent unnecessary rebuilds
class OptimizedHomeScreen extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Only watch specific parts of state
    final isLoading = ref.watch(authProvider.select((state) => state.isLoading));
    final user = ref.watch(authProvider.select((state) => state.user));
    
    return Scaffold(
      appBar: AppBar(
        title: const Text('Home'),
        // Only rebuild AppBar when user changes
        actions: [
          if (user != null)
            Consumer(
              builder: (context, ref, child) {
                final userState = ref.watch(userProvider(user.id));
                return userState.when(
                  data: (userData) => UserAvatar(user: userData),
                  loading: () => const CircularProgressIndicator(),
                  error: (_, __) => const Icon(Icons.error),
                );
              },
            ),
        ],
      ),
      body: isLoading 
          ? const Center(child: CircularProgressIndicator())
          : const HomeContent(),
    );
  }
}
```

#### **Smart Caching Strategy**
```dart
// lib/providers/cached_provider.dart
class CachedDataNotifier extends StateNotifier<AsyncValue<List<Post>>> {
  CachedDataNotifier(this._repository) : super(const AsyncValue.loading()) {
    _loadData();
  }
  
  final PostRepository _repository;
  Timer? _refreshTimer;
  DateTime? _lastFetch;
  
  static const _cacheDuration = Duration(minutes: 5);
  static const _refreshInterval = Duration(minutes: 1);
  
  Future<void> _loadData() async {
    // Check if cached data is still valid
    if (_lastFetch != null && 
        DateTime.now().difference(_lastFetch!) < _cacheDuration) {
      return; // Use cached data
    }
    
    state = const AsyncValue.loading();
    
    try {
      final posts = await _repository.getPosts();
      state = AsyncValue.data(posts);
      _lastFetch = DateTime.now();
      
      // Schedule periodic refresh
      _scheduleRefresh();
      
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }
  
  void _scheduleRefresh() {
    _refreshTimer?.cancel();
    _refreshTimer = Timer(_refreshInterval, () {
      if (mounted) {
        _loadData();
      }
    });
  }
  
  void forceRefresh() {
    _lastFetch = null;
    _loadData();
  }
  
  @override
  void dispose() {
    _refreshTimer?.cancel();
    super.dispose();
  }
}
```

#### **Memory-Efficient List Management**
```dart
// lib/providers/paginated_list_provider.dart
class PaginatedListNotifier extends StateNotifier<PaginatedState<Post>> {
  PaginatedListNotifier(this._repository) : super(PaginatedState.initial());
  
  final PostRepository _repository;
  static const _pageSize = 20;
  
  Future<void> loadNextPage() async {
    if (state.isLoading || !state.hasMore) return;
    
    state = state.copyWith(isLoading: true);
    
    try {
      final newPosts = await _repository.getPosts(
        page: state.currentPage + 1,
        limit: _pageSize,
      );
      
      // Implement sliding window to prevent memory leaks
      final allPosts = [...state.items, ...newPosts];
      
      // Keep only last 100 items in memory
      final optimizedPosts = allPosts.length > 100 
          ? allPosts.skip(allPosts.length - 100).toList()
          : allPosts;
      
      state = state.copyWith(
        items: optimizedPosts,
        currentPage: state.currentPage + 1,
        isLoading: false,
        hasMore: newPosts.length == _pageSize,
      );
      
    } catch (error) {
      state = state.copyWith(
        isLoading: false,
        error: error.toString(),
      );
    }
  }
  
  void reset() {
    state = PaginatedState.initial();
    loadNextPage();
  }
}
```

---

## 📱 **3. UI PERFORMANCE OPTIMIZATION**

### **🔷 Widget Optimization Patterns**

#### **Optimized List Rendering**
```dart
// lib/widgets/performance_optimized_list.dart
class PerformanceOptimizedList extends StatefulWidget {
  final List<Post> posts;
  final VoidCallback? onLoadMore;
  
  const PerformanceOptimizedList({
    required this.posts,
    this.onLoadMore,
    super.key,
  });

  @override
  State<PerformanceOptimizedList> createState() => _PerformanceOptimizedListState();
}

class _PerformanceOptimizedListState extends State<PerformanceOptimizedList> {
  final ScrollController _scrollController = ScrollController();
  
  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
  }
  
  void _onScroll() {
    if (_scrollController.position.pixels >= 
        _scrollController.position.maxScrollExtent - 200) {
      widget.onLoadMore?.call();
    }
  }
  
  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      controller: _scrollController,
      
      // Performance optimizations
      cacheExtent: 1000, // Pre-render items outside viewport
      addAutomaticKeepAlives: false, // Don't keep all items alive
      addRepaintBoundaries: false, // Reduce repaint boundaries for simple items
      
      itemCount: widget.posts.length,
      itemBuilder: (context, index) {
        final post = widget.posts[index];
        
        // Use repaint boundary for complex items
        return RepaintBoundary(
          child: OptimizedPostCard(
            key: ValueKey(post.id), // Stable keys for efficient rebuilds
            post: post,
          ),
        );
      },
    );
  }
}

class OptimizedPostCard extends StatelessWidget {
  final Post post;
  
  const OptimizedPostCard({
    required this.post,
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: InkWell(
        onTap: () => context.push('/post/${post.id}'),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Optimized image loading
              OptimizedImageWidget(
                imageUrl: post.imageUrl,
                width: double.infinity,
                height: 200,
              ),
              
              const SizedBox(height: 12),
              
              // Text rendering optimization
              Text(
                post.title,
                style: Theme.of(context).textTheme.titleMedium,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              
              const SizedBox(height: 8),
              
              Text(
                post.content,
                style: Theme.of(context).textTheme.bodyMedium,
                maxLines: 3,
                overflow: TextOverflow.ellipsis,
              ),
              
              const SizedBox(height: 12),
              
              // Optimized action buttons
              _buildActionButtons(),
            ],
          ),
        ),
      ),
    );
  }
  
  Widget _buildActionButtons() {
    return Row(
      children: [
        IconButton(
          onPressed: () => _handleLike(),
          icon: Icon(
            post.isLiked ? Icons.favorite : Icons.favorite_border,
            color: post.isLiked ? Colors.red : null,
          ),
        ),
        Text('${post.likeCount}'),
        const SizedBox(width: 16),
        IconButton(
          onPressed: () => _handleShare(),
          icon: const Icon(Icons.share),
        ),
      ],
    );
  }
  
  void _handleLike() {
    // Optimistic UI update
    HapticFeedback.lightImpact();
    // Handle like logic
  }
  
  void _handleShare() {
    // Handle share logic
  }
}
```

#### **Image Loading Optimization**
```dart
// lib/widgets/optimized_image_widget.dart
class OptimizedImageWidget extends StatelessWidget {
  final String? imageUrl;
  final double? width;
  final double? height;
  final BoxFit fit;
  
  const OptimizedImageWidget({
    this.imageUrl,
    this.width,
    this.height,
    this.fit = BoxFit.cover,
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    if (imageUrl == null || imageUrl!.isEmpty) {
      return _buildPlaceholder();
    }
    
    return CachedNetworkImage(
      imageUrl: imageUrl!,
      width: width,
      height: height,
      fit: fit,
      
      // Performance optimizations
      memCacheWidth: width?.toInt(),
      memCacheHeight: height?.toInt(),
      maxWidthDiskCache: (width ?? 400).toInt(),
      maxHeightDiskCache: (height ?? 400).toInt(),
      
      // Progressive loading
      progressIndicatorBuilder: (context, url, progress) {
        return _buildProgressIndicator(progress.progress);
      },
      
      errorWidget: (context, url, error) => _buildErrorWidget(),
      
      // Custom cache manager for better performance
      cacheManager: UCNCacheManager.instance,
      
      // Fade in animation
      fadeInDuration: const Duration(milliseconds: 200),
      fadeOutDuration: const Duration(milliseconds: 100),
    );
  }
  
  Widget _buildPlaceholder() {
    return Container(
      width: width,
      height: height,
      decoration: BoxDecoration(
        color: Colors.grey[200],
        borderRadius: BorderRadius.circular(8),
      ),
      child: const Icon(
        Icons.image,
        color: Colors.grey,
        size: 48,
      ),
    );
  }
  
  Widget _buildProgressIndicator(double? progress) {
    return Container(
      width: width,
      height: height,
      decoration: BoxDecoration(
        color: Colors.grey[100],
        borderRadius: BorderRadius.circular(8),
      ),
      child: Center(
        child: CircularProgressIndicator(
          value: progress,
          strokeWidth: 2,
        ),
      ),
    );
  }
  
  Widget _buildErrorWidget() {
    return Container(
      width: width,
      height: height,
      decoration: BoxDecoration(
        color: Colors.grey[300],
        borderRadius: BorderRadius.circular(8),
      ),
      child: const Icon(
        Icons.broken_image,
        color: Colors.grey,
        size: 48,
      ),
    );
  }
}

// Enhanced cache manager
class UCNCacheManager {
  static final instance = CacheManager(
    Config(
      'ucn_image_cache',
      stalePeriod: const Duration(days: 7),
      maxNrOfCacheObjects: 200,
      repo: JsonCacheInfoRepository(databaseName: 'ucn_image_cache.db'),
      fileService: HttpFileService(
        httpClient: OptimizedHttpClient(),
      ),
    ),
  );
}

class OptimizedHttpClient extends HttpClient {
  OptimizedHttpClient() {
    // Connection optimizations
    maxConnectionsPerHost = 6;
    connectionTimeout = const Duration(seconds: 10);
    idleTimeout = const Duration(seconds: 30);
  }
}
```

#### **Animation Performance**
```dart
// lib/widgets/optimized_animations.dart
class OptimizedAnimatedWidget extends StatefulWidget {
  final Widget child;
  final Duration duration;
  
  const OptimizedAnimatedWidget({
    required this.child,
    this.duration = const Duration(milliseconds: 300),
    super.key,
  });

  @override
  State<OptimizedAnimatedWidget> createState() => _OptimizedAnimatedWidgetState();
}

class _OptimizedAnimatedWidgetState extends State<OptimizedAnimatedWidget>
    with SingleTickerProviderStateMixin {
  
  late AnimationController _controller;
  late Animation<double> _animation;
  
  @override
  void initState() {
    super.initState();
    
    _controller = AnimationController(
      duration: widget.duration,
      vsync: this,
    );
    
    // Use optimized curve for better performance
    _animation = CurvedAnimation(
      parent: _controller,
      curve: Curves.easeOutCubic, // GPU-friendly curve
    );
    
    _controller.forward();
  }
  
  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }
  
  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _animation,
      
      // Performance optimization: separate child
      child: widget.child,
      
      builder: (context, child) {
        return Transform.translate(
          offset: Offset(0, 20 * (1 - _animation.value)),
          child: Opacity(
            opacity: _animation.value,
            child: child,
          ),
        );
      },
    );
  }
}

// Shared animation controller for multiple widgets
class SharedAnimationController {
  static final _instance = SharedAnimationController._internal();
  factory SharedAnimationController() => _instance;
  SharedAnimationController._internal();
  
  final Map<String, AnimationController> _controllers = {};
  
  AnimationController getController(
    String key,
    TickerProvider vsync,
    Duration duration,
  ) {
    if (_controllers[key] == null) {
      _controllers[key] = AnimationController(
        duration: duration,
        vsync: vsync,
      );
    }
    return _controllers[key]!;
  }
  
  void disposeController(String key) {
    _controllers[key]?.dispose();
    _controllers.remove(key);
  }
}
```

---

## 🌐 **4. NETWORK OPTIMIZATION**

### **🔷 HTTP Client Optimization**
```dart
// lib/core/network/optimized_http_client.dart
class OptimizedHttpClient {
  static final _instance = OptimizedHttpClient._internal();
  factory OptimizedHttpClient() => _instance;
  OptimizedHttpClient._internal();
  
  late final Dio _dio;
  
  void initialize() {
    _dio = Dio(BaseOptions(
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 15),
      sendTimeout: const Duration(seconds: 10),
      
      // Compression
      headers: {
        'Accept-Encoding': 'gzip, deflate, br',
        'User-Agent': 'UCN-INCLUI2-Mobile/1.0',
      },
    ));
    
    // Add interceptors for optimization
    _dio.interceptors.addAll([
      _cacheInterceptor(),
      _compressionInterceptor(),
      _retryInterceptor(),
      _connectionPoolInterceptor(),
    ]);
  }
  
  InterceptorsWrapper _cacheInterceptor() {
    return InterceptorsWrapper(
      onRequest: (options, handler) {
        // Add cache headers for GET requests
        if (options.method == 'GET') {
          options.headers['Cache-Control'] = 'max-age=300'; // 5 minutes
        }
        handler.next(options);
      },
      
      onResponse: (response, handler) {
        // Cache successful responses
        if (response.statusCode == 200) {
          CacheManager.instance.cacheResponse(response);
        }
        handler.next(response);
      },
      
      onError: (error, handler) async {
        // Try cache on network error
        if (error.type == DioExceptionType.connectionError) {
          final cachedResponse = await CacheManager.instance
              .getCachedResponse(error.requestOptions);
          
          if (cachedResponse != null) {
            handler.resolve(cachedResponse);
            return;
          }
        }
        handler.next(error);
      },
    );
  }
  
  InterceptorsWrapper _compressionInterceptor() {
    return InterceptorsWrapper(
      onRequest: (options, handler) {
        // Enable compression for large payloads
        if (options.data != null && 
            jsonEncode(options.data).length > 1024) {
          options.headers['Content-Encoding'] = 'gzip';
        }
        handler.next(options);
      },
    );
  }
  
  InterceptorsWrapper _retryInterceptor() {
    return InterceptorsWrapper(
      onError: (error, handler) async {
        if (_shouldRetry(error)) {
          try {
            final response = await _dio.fetch(error.requestOptions);
            handler.resolve(response);
            return;
          } catch (e) {
            // Fall through to original error
          }
        }
        handler.next(error);
      },
    );
  }
  
  bool _shouldRetry(DioException error) {
    return error.type == DioExceptionType.connectionTimeout ||
           error.type == DioExceptionType.receiveTimeout ||
           (error.response?.statusCode ?? 0) >= 500;
  }
}
```

### **🔷 Request Batching & Deduplication**
```dart
// lib/core/network/request_batcher.dart
class RequestBatcher {
  static final _instance = RequestBatcher._internal();
  factory RequestBatcher() => _instance;
  RequestBatcher._internal();
  
  final Map<String, Future<dynamic>> _pendingRequests = {};
  final Map<String, Timer> _batchTimers = {};
  
  Future<T> batchRequest<T>(
    String key,
    Future<T> Function() request,
  ) async {
    // Deduplicate identical requests
    if (_pendingRequests.containsKey(key)) {
      return _pendingRequests[key] as Future<T>;
    }
    
    final future = request();
    _pendingRequests[key] = future;
    
    // Clean up after completion
    future.whenComplete(() {
      _pendingRequests.remove(key);
    });
    
    return future;
  }
  
  void batchMultipleRequests(
    Map<String, Future<dynamic> Function()> requests,
    Duration delay,
  ) {
    final batchKey = requests.keys.join(',');
    
    _batchTimers[batchKey]?.cancel();
    _batchTimers[batchKey] = Timer(delay, () async {
      // Execute all requests in parallel
      final futures = requests.values.map((request) => request()).toList();
      await Future.wait(futures);
      
      _batchTimers.remove(batchKey);
    });
  }
}

// Usage example
class UserRepository {
  final RequestBatcher _batcher = RequestBatcher();
  
  Future<User> getUserById(String id) {
    return _batcher.batchRequest(
      'user:$id',
      () => _httpClient.get('/users/$id'),
    );
  }
  
  Future<List<Post>> getUserPosts(String userId) {
    return _batcher.batchRequest(
      'user_posts:$userId',
      () => _httpClient.get('/users/$userId/posts'),
    );
  }
}
```

---

## 💾 **5. MEMORY OPTIMIZATION**

### **🔷 Memory Management Strategy**
```dart
// lib/core/memory/memory_manager.dart
class MemoryManager {
  static final _instance = MemoryManager._internal();
  factory MemoryManager() => _instance;
  MemoryManager._internal();
  
  final Map<String, WeakReference<Object>> _cache = {};
  final Map<String, Timer> _cleanupTimers = {};
  
  void cacheObject(String key, Object object, Duration ttl) {
    // Store weak reference to allow GC
    _cache[key] = WeakReference(object);
    
    // Schedule cleanup
    _cleanupTimers[key]?.cancel();
    _cleanupTimers[key] = Timer(ttl, () {
      _cache.remove(key);
      _cleanupTimers.remove(key);
    });
  }
  
  T? getCachedObject<T>(String key) {
    final weakRef = _cache[key];
    if (weakRef?.target == null) {
      _cache.remove(key);
      _cleanupTimers[key]?.cancel();
      _cleanupTimers.remove(key);
      return null;
    }
    return weakRef!.target as T?;
  }
  
  void clearCache() {
    _cache.clear();
    for (final timer in _cleanupTimers.values) {
      timer.cancel();
    }
    _cleanupTimers.clear();
  }
  
  // Monitor memory usage
  void startMemoryMonitoring() {
    Timer.periodic(const Duration(seconds: 30), (timer) {
      _logMemoryUsage();
      _performCleanupIfNeeded();
    });
  }
  
  void _logMemoryUsage() {
    final info = ProcessInfo.currentRss;
    Logger.debug('Memory usage: ${(info / 1024 / 1024).toStringAsFixed(1)} MB');
    
    if (info > 150 * 1024 * 1024) { // 150MB threshold
      Logger.warning('High memory usage detected');
      _performAggressiveCleanup();
    }
  }
  
  void _performCleanupIfNeeded() {
    // Clean up expired entries
    final now = DateTime.now();
    final keysToRemove = <String>[];
    
    for (final entry in _cache.entries) {
      if (entry.value.target == null) {
        keysToRemove.add(entry.key);
      }
    }
    
    for (final key in keysToRemove) {
      _cache.remove(key);
      _cleanupTimers[key]?.cancel();
      _cleanupTimers.remove(key);
    }
  }
  
  void _performAggressiveCleanup() {
    // Clear all non-essential cached data
    clearCache();
    
    // Force garbage collection (if available)
    System.gc();
    
    // Clear image caches
    PaintingBinding.instance.imageCache.clear();
    PaintingBinding.instance.imageCache.clearLiveImages();
  }
}
```

### **🔷 Widget Memory Optimization**
```dart
// lib/widgets/memory_optimized_list.dart
class MemoryOptimizedListView extends StatefulWidget {
  final List<dynamic> items;
  final Widget Function(dynamic item) itemBuilder;
  final int maxItemsInMemory;
  
  const MemoryOptimizedListView({
    required this.items,
    required this.itemBuilder,
    this.maxItemsInMemory = 50,
    super.key,
  });

  @override
  State<MemoryOptimizedListView> createState() => _MemoryOptimizedListViewState();
}

class _MemoryOptimizedListViewState extends State<MemoryOptimizedListView> {
  late final ScrollController _scrollController;
  final Map<int, Widget> _builtWidgets = {};
  int _firstVisibleIndex = 0;
  int _lastVisibleIndex = 0;
  
  @override
  void initState() {
    super.initState();
    _scrollController = ScrollController();
    _scrollController.addListener(_onScroll);
  }
  
  void _onScroll() {
    final viewport = _scrollController.position.viewportDimension;
    final offset = _scrollController.position.pixels;
    
    // Calculate visible range (approximate)
    final itemHeight = 100.0; // Estimate
    _firstVisibleIndex = (offset / itemHeight).floor();
    _lastVisibleIndex = ((offset + viewport) / itemHeight).ceil();
    
    // Clean up widgets outside visible range + buffer
    _cleanupInvisibleWidgets();
  }
  
  void _cleanupInvisibleWidgets() {
    const buffer = 10; // Keep some widgets as buffer
    final minIndex = (_firstVisibleIndex - buffer).clamp(0, widget.items.length);
    final maxIndex = (_lastVisibleIndex + buffer).clamp(0, widget.items.length);
    
    final keysToRemove = _builtWidgets.keys
        .where((index) => index < minIndex || index > maxIndex)
        .toList();
    
    for (final key in keysToRemove) {
      _builtWidgets.remove(key);
    }
    
    // Limit total widgets in memory
    if (_builtWidgets.length > widget.maxItemsInMemory) {
      final sortedKeys = _builtWidgets.keys.toList()..sort();
      final keysToRemoveCount = _builtWidgets.length - widget.maxItemsInMemory;
      
      for (int i = 0; i < keysToRemoveCount; i++) {
        _builtWidgets.remove(sortedKeys[i]);
      }
    }
  }
  
  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      controller: _scrollController,
      itemCount: widget.items.length,
      itemBuilder: (context, index) {
        // Reuse built widgets when possible
        if (!_builtWidgets.containsKey(index)) {
          _builtWidgets[index] = widget.itemBuilder(widget.items[index]);
        }
        
        return _builtWidgets[index]!;
      },
    );
  }
  
  @override
  void dispose() {
    _scrollController.dispose();
    _builtWidgets.clear();
    super.dispose();
  }
}
```

---

## 📊 **6. PERFORMANCE MONITORING**

### **🔷 Performance Metrics Collection**
```dart
// lib/core/performance/performance_monitor.dart
class PerformanceMonitor {
  static final _instance = PerformanceMonitor._internal();
  factory PerformanceMonitor() => _instance;
  PerformanceMonitor._internal();
  
  final Map<String, Stopwatch> _timers = {};
  final List<PerformanceMetric> _metrics = [];
  
  void startTimer(String name) {
    _timers[name] = Stopwatch()..start();
  }
  
  void stopTimer(String name) {
    final timer = _timers[name];
    if (timer != null) {
      timer.stop();
      
      final metric = PerformanceMetric(
        name: name,
        duration: timer.elapsedMilliseconds,
        timestamp: DateTime.now(),
      );
      
      _metrics.add(metric);
      _timers.remove(name);
      
      // Log if exceeds threshold
      if (timer.elapsedMilliseconds > _getThreshold(name)) {
        Logger.warning('Performance threshold exceeded: $name took ${timer.elapsedMilliseconds}ms');
      }
    }
  }
  
  int _getThreshold(String name) {
    switch (name) {
      case 'app_startup': return 3000;
      case 'screen_navigation': return 200;
      case 'list_scroll': return 16; // 60 FPS
      case 'image_load': return 1000;
      default: return 500;
    }
  }
  
  void trackMemoryUsage() {
    Timer.periodic(const Duration(seconds: 10), (timer) {
      final usage = ProcessInfo.currentRss;
      final metric = PerformanceMetric(
        name: 'memory_usage',
        value: usage / 1024 / 1024, // MB
        timestamp: DateTime.now(),
      );
      
      _metrics.add(metric);
      
      // Clean old metrics (keep last 100)
      if (_metrics.length > 100) {
        _metrics.removeRange(0, _metrics.length - 100);
      }
    });
  }
  
  void trackFrameRate() {
    WidgetsBinding.instance.addTimingsCallback((timings) {
      for (final timing in timings) {
        final frameTime = timing.totalSpan.inMicroseconds / 1000.0; // ms
        
        if (frameTime > 16.67) { // Dropped frame (< 60 FPS)
          Logger.debug('Dropped frame: ${frameTime.toStringAsFixed(2)}ms');
          
          final metric = PerformanceMetric(
            name: 'dropped_frame',
            duration: frameTime.toInt(),
            timestamp: DateTime.now(),
          );
          
          _metrics.add(metric);
        }
      }
    });
  }
  
  List<PerformanceMetric> getMetrics({String? name}) {
    if (name != null) {
      return _metrics.where((m) => m.name == name).toList();
    }
    return List.from(_metrics);
  }
  
  void exportMetrics() async {
    final json = jsonEncode(_metrics.map((m) => m.toJson()).toList());
    
    // Save to file or send to analytics
    await File('performance_metrics.json').writeAsString(json);
    
    // Send to analytics service
    AnalyticsService.instance.trackPerformanceMetrics(_metrics);
  }
}

class PerformanceMetric {
  final String name;
  final int? duration;
  final double? value;
  final DateTime timestamp;
  
  PerformanceMetric({
    required this.name,
    this.duration,
    this.value,
    required this.timestamp,
  });
  
  Map<String, dynamic> toJson() => {
    'name': name,
    'duration': duration,
    'value': value,
    'timestamp': timestamp.toIso8601String(),
  };
}
```

### **🔷 Performance Testing Integration**
```dart
// test/performance/performance_test.dart
void main() {
  group('Performance Tests', () {
    
    testWidgets('home screen should load within 1 second', (tester) async {
      final monitor = PerformanceMonitor();
      
      monitor.startTimer('home_screen_load');
      
      await tester.pumpWidget(const UCNApp());
      await tester.pumpAndSettle();
      
      monitor.stopTimer('home_screen_load');
      
      final metrics = monitor.getMetrics(name: 'home_screen_load');
      expect(metrics.last.duration, lessThan(1000));
    });
    
    testWidgets('list scrolling should maintain 60 FPS', (tester) async {
      await tester.pumpWidget(const UCNApp());
      await tester.pumpAndSettle();
      
      // Navigate to list screen
      await tester.tap(find.byKey(const Key('nav_discover')));
      await tester.pumpAndSettle();
      
      final listView = find.byType(ListView);
      expect(listView, findsOneWidget);
      
      // Measure scroll performance
      final monitor = PerformanceMonitor();
      monitor.trackFrameRate();
      
      // Perform scroll
      await tester.timedDrag(
        listView,
        const Offset(0, -500),
        const Duration(milliseconds: 300),
      );
      
      await tester.pumpAndSettle();
      
      // Check for dropped frames
      final droppedFrames = monitor.getMetrics(name: 'dropped_frame');
      expect(droppedFrames.length, lessThan(3)); // Allow some tolerance
    });
    
    testWidgets('memory usage should remain stable', (tester) async {
      final monitor = PerformanceMonitor();
      monitor.trackMemoryUsage();
      
      await tester.pumpWidget(const UCNApp());
      
      // Simulate user interaction
      for (int i = 0; i < 10; i++) {
        await tester.tap(find.byKey(const Key('nav_profile')));
        await tester.pumpAndSettle();
        
        await tester.tap(find.byKey(const Key('nav_home')));
        await tester.pumpAndSettle();
      }
      
      final memoryMetrics = monitor.getMetrics(name: 'memory_usage');
      expect(memoryMetrics.isNotEmpty, true);
      
      // Memory should not grow continuously
      final firstMeasurement = memoryMetrics.first.value!;
      final lastMeasurement = memoryMetrics.last.value!;
      final memoryGrowth = lastMeasurement - firstMeasurement;
      
      expect(memoryGrowth, lessThan(50)); // Less than 50MB growth
    });
  });
}
```

---

**⚡ PERFORMANCE OPTIMIZATION** | **📅 Versión**: 1.0 | **🎯 Estado**: READY FOR IMPLEMENTATION 