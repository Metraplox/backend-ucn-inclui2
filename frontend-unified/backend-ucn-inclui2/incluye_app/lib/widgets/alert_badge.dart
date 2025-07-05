import 'package:flutter/material.dart';

/// Widget para mostrar alertas y notificaciones con contador
/// Integrado con WebSocket para actualizaciones en tiempo real
class AlertBadge extends StatelessWidget {
  final int count;
  final Color? backgroundColor;
  final Color? textColor;
  final double size;
  final bool showZero;
  final VoidCallback? onTap;

  const AlertBadge({
    super.key,
    required this.count,
    this.backgroundColor,
    this.textColor,
    this.size = 24,
    this.showZero = false,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    if (count == 0 && !showZero) {
      return const SizedBox.shrink();
    }

    final effectiveBackgroundColor =
        backgroundColor ??
        (count > 0 ? theme.colorScheme.error : theme.colorScheme.surface);
    final effectiveTextColor =
        textColor ??
        (count > 0 ? theme.colorScheme.onError : theme.colorScheme.onSurface);

    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 300),
        curve: Curves.elasticOut,
        constraints: BoxConstraints(minWidth: size, minHeight: size),
        padding: EdgeInsets.symmetric(
          horizontal: count > 99 ? 6 : 4,
          vertical: 2,
        ),
        decoration: BoxDecoration(
          color: effectiveBackgroundColor,
          borderRadius: BorderRadius.circular(size / 2),
          border:
              count == 0
                  ? Border.all(
                    color: theme.colorScheme.outline.withValues(alpha: 0.3),
                  )
                  : null,
          boxShadow:
              count > 0
                  ? [
                    BoxShadow(
                      color: effectiveBackgroundColor.withValues(alpha: 0.3),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ]
                  : null,
        ),
        child: Center(
          child: Text(
            count > 99 ? '99+' : count.toString(),
            style: theme.textTheme.labelSmall?.copyWith(
              color: effectiveTextColor,
              fontWeight: FontWeight.bold,
              fontSize: (size * 0.5).clamp(10, 14),
            ),
            textAlign: TextAlign.center,
          ),
        ),
      ),
    );
  }
}

/// Widget especializado para alertas críticas con animación pulsante
class PulsingAlertBadge extends StatefulWidget {
  final int count;
  final Color? alertColor;
  final VoidCallback? onTap;

  const PulsingAlertBadge({
    super.key,
    required this.count,
    this.alertColor,
    this.onTap,
  });

  @override
  State<PulsingAlertBadge> createState() => _PulsingAlertBadgeState();
}

class _PulsingAlertBadgeState extends State<PulsingAlertBadge>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 1000),
      vsync: this,
    );
    _scaleAnimation = Tween<double>(begin: 1.0, end: 1.2).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeInOut),
    );

    if (widget.count > 0) {
      _animationController.repeat(reverse: true);
    }
  }

  @override
  void didUpdateWidget(PulsingAlertBadge oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.count > 0 && oldWidget.count == 0) {
      _animationController.repeat(reverse: true);
    } else if (widget.count == 0 && oldWidget.count > 0) {
      _animationController.stop();
      _animationController.reset();
    }
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (widget.count == 0) {
      return const SizedBox.shrink();
    }

    return AnimatedBuilder(
      animation: _scaleAnimation,
      builder: (context, child) {
        return Transform.scale(
          scale: _scaleAnimation.value,
          child: AlertBadge(
            count: widget.count,
            backgroundColor: widget.alertColor ?? Colors.red.shade600,
            textColor: Colors.white,
            onTap: widget.onTap,
          ),
        );
      },
    );
  }
}
