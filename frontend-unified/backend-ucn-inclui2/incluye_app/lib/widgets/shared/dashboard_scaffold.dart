import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:incluye_app/config/app_colors.dart';
import 'package:incluye_app/features/authentication/providers/auth_provider.dart';

class DashboardScaffold extends StatelessWidget {
  final String title;
  final Widget body;
  final Future<void> Function() onRefresh;
  final List<Widget>? actions;

  const DashboardScaffold({
    super.key,
    required this.title,
    required this.body,
    required this.onRefresh,
    this.actions,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(title),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        elevation: 2,
        actions: [
          if (actions != null) ...actions!,
          Consumer<AuthProvider>(
            builder: (context, authProvider, child) {
              if (authProvider.user?.roles.length != null &&
                  authProvider.user!.roles.length > 1) {
                return DropdownButton<String>(
                  value: authProvider.activeRole,
                  icon: const Icon(Icons.arrow_drop_down, color: Colors.white),
                  dropdownColor: AppColors.primary,
                  underline: const SizedBox(),
                  onChanged: (String? newRole) {
                    if (newRole != null) {
                      authProvider.setActiveRole(newRole);
                      // Navigate to the appropriate dashboard based on the selected role
                      Navigator.pushReplacementNamed(context, '/home');
                    }
                  },
                  items:
                      authProvider.user!.roles.map<DropdownMenuItem<String>>((
                        String role,
                      ) {
                        return DropdownMenuItem<String>(
                          value: role,
                          child: Text(
                            role,
                            style: const TextStyle(color: Colors.white),
                          ),
                        );
                      }).toList(),
                );
              } else {
                return const SizedBox.shrink();
              }
            },
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: onRefresh,
        color: AppColors.primary,
        child: body,
      ),
    );
  }
}
