import 'package:flutter/material.dart';
import 'package:incluye_app/services/storage_service.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final StorageService _storageService = const StorageService();
  bool _isLoading = true;
  String? _userName;
  String? _userEmail;
  String? _userRole;
  
  @override
  void initState() {
    super.initState();
    _loadUserInfo();
  }

  Future<void> _loadUserInfo() async {
    setState(() => _isLoading = true);
    
    try {
      final userName = await _storageService.getUserName();
      final userEmail = await _storageService.getUserEmail();
      final userRole = await _storageService.getUserRole();
      
      setState(() {
        _userName = userName;
        _userEmail = userEmail;
        _userRole = userRole;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error al cargar perfil: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Mi Perfil'),
        backgroundColor: Colors.blue,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.edit),
            onPressed: _editProfile,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildProfileHeader(),
                  const SizedBox(height: 24),
                  _buildProfileInfo(),
                  const SizedBox(height: 24),
                  _buildAccountActions(),
                  const SizedBox(height: 24),
                  _buildSystemInfo(),
                ],
              ),
            ),
    );
  }

  Widget _buildProfileHeader() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Row(
          children: [
            CircleAvatar(
              radius: 40,
              backgroundColor: Colors.blue.shade100,
              child: Text(
                _userName?.isNotEmpty == true 
                    ? _userName![0].toUpperCase()
                    : '?',
                style: const TextStyle(
                  fontSize: 32,
                  fontWeight: FontWeight.bold,
                  color: Colors.blue,
                ),
              ),
            ),
            const SizedBox(width: 20),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    _userName ?? 'Usuario',
                    style: const TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                    decoration: BoxDecoration(
                      color: _getRoleColor().withValues(alpha: 0.1),
                      border: Border.all(color: _getRoleColor()),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Text(
                      _getRoleDisplayName(),
                      style: TextStyle(
                        color: _getRoleColor(),
                        fontWeight: FontWeight.bold,
                        fontSize: 12,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildProfileInfo() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Información Personal',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            _buildInfoRow('Nombre', _userName ?? 'No disponible'),
            _buildInfoRow('Email', _userEmail ?? 'No disponible'),
            _buildInfoRow('Rol', _getRoleDisplayName()),
            _buildInfoRow('Estado', 'Activo'),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 80,
            child: Text(
              '$label:',
              style: const TextStyle(
                fontWeight: FontWeight.w500,
                color: Colors.grey,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(fontSize: 16),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAccountActions() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Configuración de Cuenta',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            ListTile(
              leading: const Icon(Icons.lock, color: Colors.orange),
              title: const Text('Cambiar Contraseña'),
              subtitle: const Text('Actualiza tu contraseña'),
              trailing: const Icon(Icons.arrow_forward_ios),
              onTap: _changePassword,
            ),
            const Divider(),
            ListTile(
              leading: const Icon(Icons.notifications, color: Colors.blue),
              title: const Text('Notificaciones'),
              subtitle: const Text('Gestiona tus preferencias'),
              trailing: const Icon(Icons.arrow_forward_ios),
              onTap: _manageNotifications,
            ),
            const Divider(),
            ListTile(
              leading: const Icon(Icons.privacy_tip, color: Colors.purple),
              title: const Text('Privacidad'),
              subtitle: const Text('Configuración de privacidad'),
              trailing: const Icon(Icons.arrow_forward_ios),
              onTap: _privacySettings,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSystemInfo() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Información del Sistema',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            ListTile(
              leading: const Icon(Icons.help, color: Colors.green),
              title: const Text('Ayuda y Soporte'),
              subtitle: const Text('Obtén ayuda sobre el sistema'),
              trailing: const Icon(Icons.arrow_forward_ios),
              onTap: _showHelp,
            ),
            const Divider(),
            ListTile(
              leading: const Icon(Icons.info, color: Colors.blue),
              title: const Text('Acerca de'),
              subtitle: const Text('Incluye UCN v1.0.0'),
              trailing: const Icon(Icons.arrow_forward_ios),
              onTap: _showAbout,
            ),
            const Divider(),
            ListTile(
              leading: const Icon(Icons.logout, color: Colors.red),
              title: const Text('Cerrar Sesión'),
              subtitle: const Text('Salir del sistema'),
              trailing: const Icon(Icons.arrow_forward_ios),
              onTap: _logout,
            ),
          ],
        ),
      ),
    );
  }

  Color _getRoleColor() {
    switch (_userRole?.toUpperCase()) {
      case 'ESTUDIANTE':
        return Colors.blue;
      case 'DOCENTE':
        return Colors.green;
      case 'JEFE_CARRERA':
        return Colors.orange;
      case 'JEFE_DEPARTAMENTO':
        return Colors.purple;
      case 'DIDDEC':
        return Colors.teal;
      case 'COORDINADOR':
        return Colors.indigo;
      case 'EDUCADORA_SOCIAL':
        return Colors.pink;
      default:
        return Colors.grey;
    }
  }

  String _getRoleDisplayName() {
    switch (_userRole?.toUpperCase()) {
      case 'ESTUDIANTE':
        return 'Estudiante';
      case 'DOCENTE':
        return 'Docente';
      case 'JEFE_CARRERA':
        return 'Jefe de Carrera';
      case 'JEFE_DEPARTAMENTO':
        return 'Jefe de Departamento';
      case 'DIDDEC':
        return 'DIDDEC';
      case 'COORDINADOR':
        return 'Coordinador';
      case 'EDUCADORA_SOCIAL':
        return 'Educadora Social';
      default:
        return _userRole ?? 'Sin rol';
    }
  }

  void _editProfile() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Editar Perfil'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextFormField(
              initialValue: _userName,
              decoration: const InputDecoration(
                labelText: 'Nombre',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 16),
            TextFormField(
              initialValue: _userEmail,
              decoration: const InputDecoration(
                labelText: 'Email',
                border: OutlineInputBorder(),
              ),
              enabled: false, // Email no editable
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancelar'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Perfil actualizado exitosamente'),
                  backgroundColor: Colors.green,
                ),
              );
            },
            child: const Text('Guardar'),
          ),
        ],
      ),
    );
  }

  void _changePassword() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Cambiar Contraseña'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const TextField(
              decoration: InputDecoration(
                labelText: 'Contraseña actual',
                border: OutlineInputBorder(),
              ),
              obscureText: true,
            ),
            const SizedBox(height: 16),
            const TextField(
              decoration: InputDecoration(
                labelText: 'Nueva contraseña',
                border: OutlineInputBorder(),
              ),
              obscureText: true,
            ),
            const SizedBox(height: 16),
            const TextField(
              decoration: InputDecoration(
                labelText: 'Confirmar nueva contraseña',
                border: OutlineInputBorder(),
              ),
              obscureText: true,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancelar'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Contraseña actualizada exitosamente'),
                  backgroundColor: Colors.green,
                ),
              );
            },
            child: const Text('Cambiar'),
          ),
        ],
      ),
    );
  }

  void _manageNotifications() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Abriendo configuración de notificaciones'),
        backgroundColor: Colors.blue,
      ),
    );
  }

  void _privacySettings() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Abriendo configuración de privacidad'),
        backgroundColor: Colors.purple,
      ),
    );
  }

  void _showHelp() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Abriendo centro de ayuda'),
        backgroundColor: Colors.green,
      ),
    );
  }

  void _showAbout() {
    showAboutDialog(
      context: context,
      applicationName: 'Incluye UCN',
      applicationVersion: '1.0.0',
      applicationLegalese: '© 2025 Universidad Católica del Norte',
      children: [
        const Text(
          'Sistema de gestión de estudiantes con necesidades especiales.',
        ),
      ],
    );
  }

  void _logout() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Cerrar Sesión'),
        content: const Text('¿Estás seguro de que deseas cerrar sesión?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancelar'),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(context);
              await _storageService.clearAll();
              if (mounted) {
                Navigator.of(context).pushNamedAndRemoveUntil(
                  '/',
                  (route) => false,
                );
              }
            },
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            child: const Text('Cerrar Sesión'),
          ),
        ],
      ),
    );
  }
}
