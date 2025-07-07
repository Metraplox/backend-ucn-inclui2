import 'package:flutter/material.dart';

class GeneralSettingsScreen extends StatefulWidget {
  const GeneralSettingsScreen({super.key});

  @override
  State<GeneralSettingsScreen> createState() => _GeneralSettingsScreenState();
}

class _GeneralSettingsScreenState extends State<GeneralSettingsScreen> {
  bool _notificationsEnabled = true;
  bool _emailNotifications = true;
  bool _pushNotifications = false;
  bool _darkMode = false;
  String _language = 'Español';
  String _fontSize = 'Mediano';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Configuración'),
        backgroundColor: Colors.blueGrey,
        foregroundColor: Colors.white,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _buildNotificationSettings(),
          const SizedBox(height: 20),
          _buildAppearanceSettings(),
          const SizedBox(height: 20),
          _buildAccessibilitySettings(),
          const SizedBox(height: 20),
          _buildDataSettings(),
          const SizedBox(height: 20),
          _buildAboutSection(),
        ],
      ),
    );
  }

  Widget _buildNotificationSettings() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Notificaciones',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            SwitchListTile(
              title: const Text('Notificaciones habilitadas'),
              subtitle: const Text('Recibir notificaciones del sistema'),
              value: _notificationsEnabled,
              onChanged: (value) {
                setState(() => _notificationsEnabled = value);
              },
            ),
            SwitchListTile(
              title: const Text('Notificaciones por email'),
              subtitle: const Text('Recibir alertas por correo electrónico'),
              value: _emailNotifications,
              onChanged: _notificationsEnabled ? (value) {
                setState(() => _emailNotifications = value);
              } : null,
            ),
            SwitchListTile(
              title: const Text('Notificaciones push'),
              subtitle: const Text('Notificaciones en tiempo real'),
              value: _pushNotifications,
              onChanged: _notificationsEnabled ? (value) {
                setState(() => _pushNotifications = value);
              } : null,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAppearanceSettings() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Apariencia',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            SwitchListTile(
              title: const Text('Modo oscuro'),
              subtitle: const Text('Cambiar a tema oscuro'),
              value: _darkMode,
              onChanged: (value) {
                setState(() => _darkMode = value);
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text(
                      _darkMode ? 'Modo oscuro activado' : 'Modo claro activado',
                    ),
                    backgroundColor: Colors.blue,
                  ),
                );
              },
            ),
            ListTile(
              title: const Text('Idioma'),
              subtitle: Text(_language),
              trailing: const Icon(Icons.arrow_forward_ios),
              onTap: _showLanguageDialog,
            ),
            ListTile(
              title: const Text('Tamaño de fuente'),
              subtitle: Text(_fontSize),
              trailing: const Icon(Icons.arrow_forward_ios),
              onTap: _showFontSizeDialog,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAccessibilitySettings() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Accesibilidad',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            ListTile(
              leading: const Icon(Icons.accessibility),
              title: const Text('Configuración de accesibilidad'),
              subtitle: const Text('Opciones para usuarios con NEE'),
              trailing: const Icon(Icons.arrow_forward_ios),
              onTap: _showAccessibilityOptions,
            ),
            ListTile(
              leading: const Icon(Icons.contrast),
              title: const Text('Alto contraste'),
              subtitle: const Text('Mejorar visibilidad de elementos'),
              trailing: const Icon(Icons.arrow_forward_ios),
              onTap: _toggleHighContrast,
            ),
            ListTile(
              leading: const Icon(Icons.text_fields),
              title: const Text('Tamaño de texto grande'),
              subtitle: const Text('Aumentar legibilidad'),
              trailing: const Icon(Icons.arrow_forward_ios),
              onTap: _toggleLargeText,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDataSettings() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Datos y Almacenamiento',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            ListTile(
              leading: const Icon(Icons.storage, color: Colors.blue),
              title: const Text('Uso de almacenamiento'),
              subtitle: const Text('Ver espacio utilizado'),
              trailing: const Icon(Icons.arrow_forward_ios),
              onTap: _showStorageInfo,
            ),
            ListTile(
              leading: const Icon(Icons.sync, color: Colors.green),
              title: const Text('Sincronización'),
              subtitle: const Text('Configurar sincronización de datos'),
              trailing: const Icon(Icons.arrow_forward_ios),
              onTap: _configureSyncSettings,
            ),
            ListTile(
              leading: const Icon(Icons.cached, color: Colors.orange),
              title: const Text('Limpiar caché'),
              subtitle: const Text('Eliminar archivos temporales'),
              trailing: const Icon(Icons.arrow_forward_ios),
              onTap: _clearCache,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAboutSection() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Información',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            ListTile(
              leading: const Icon(Icons.info, color: Colors.blue),
              title: const Text('Versión de la aplicación'),
              subtitle: const Text('Incluye UCN v1.0.0'),
              onTap: _showVersionInfo,
            ),
            ListTile(
              leading: const Icon(Icons.help, color: Colors.green),
              title: const Text('Ayuda y soporte'),
              subtitle: const Text('Obtener ayuda técnica'),
              trailing: const Icon(Icons.arrow_forward_ios),
              onTap: _showSupport,
            ),
            ListTile(
              leading: const Icon(Icons.privacy_tip, color: Colors.purple),
              title: const Text('Política de privacidad'),
              subtitle: const Text('Ver términos y condiciones'),
              trailing: const Icon(Icons.arrow_forward_ios),
              onTap: _showPrivacyPolicy,
            ),
          ],
        ),
      ),
    );
  }

  void _showLanguageDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Seleccionar Idioma'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            RadioListTile<String>(
              title: const Text('Español'),
              value: 'Español',
              groupValue: _language,
              onChanged: (value) {
                setState(() => _language = value!);
                Navigator.pop(context);
              },
            ),
            RadioListTile<String>(
              title: const Text('English'),
              value: 'English',
              groupValue: _language,
              onChanged: (value) {
                setState(() => _language = value!);
                Navigator.pop(context);
              },
            ),
          ],
        ),
      ),
    );
  }

  void _showFontSizeDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Tamaño de Fuente'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            RadioListTile<String>(
              title: const Text('Pequeño'),
              value: 'Pequeño',
              groupValue: _fontSize,
              onChanged: (value) {
                setState(() => _fontSize = value!);
                Navigator.pop(context);
              },
            ),
            RadioListTile<String>(
              title: const Text('Mediano'),
              value: 'Mediano',
              groupValue: _fontSize,
              onChanged: (value) {
                setState(() => _fontSize = value!);
                Navigator.pop(context);
              },
            ),
            RadioListTile<String>(
              title: const Text('Grande'),
              value: 'Grande',
              groupValue: _fontSize,
              onChanged: (value) {
                setState(() => _fontSize = value!);
                Navigator.pop(context);
              },
            ),
          ],
        ),
      ),
    );
  }

  void _showAccessibilityOptions() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Opciones de Accesibilidad'),
        content: const Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('• Lector de pantalla compatible'),
            Text('• Navegación por teclado'),
            Text('• Descripciones de audio'),
            Text('• Subtítulos automáticos'),
            Text('• Contraste mejorado'),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cerrar'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Configuraciones de accesibilidad activadas'),
                  backgroundColor: Colors.green,
                ),
              );
            },
            child: const Text('Activar Todo'),
          ),
        ],
      ),
    );
  }

  void _toggleHighContrast() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Alto contraste activado'),
        backgroundColor: Colors.blue,
      ),
    );
  }

  void _toggleLargeText() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Texto grande activado'),
        backgroundColor: Colors.green,
      ),
    );
  }

  void _showStorageInfo() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Uso de Almacenamiento'),
        content: const Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Documentos: 45 MB'),
            Text('Imágenes: 12 MB'),
            Text('Caché: 8 MB'),
            Text('Total usado: 65 MB'),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cerrar'),
          ),
        ],
      ),
    );
  }

  void _configureSyncSettings() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Configurando sincronización automática'),
        backgroundColor: Colors.blue,
      ),
    );
  }

  void _clearCache() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Limpiar Caché'),
        content: const Text('¿Estás seguro de que deseas limpiar el caché? Esto puede mejorar el rendimiento.'),
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
                  content: Text('Caché limpiado exitosamente'),
                  backgroundColor: Colors.green,
                ),
              );
            },
            child: const Text('Limpiar'),
          ),
        ],
      ),
    );
  }

  void _showVersionInfo() {
    showAboutDialog(
      context: context,
      applicationName: 'Incluye UCN',
      applicationVersion: '1.0.0',
      applicationLegalese: '© 2025 Universidad Católica del Norte',
      children: [
        const Text('Sistema de gestión de estudiantes con necesidades especiales.'),
        const SizedBox(height: 8),
        const Text('Desarrollado para mejorar la inclusión educativa.'),
      ],
    );
  }

  void _showSupport() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Ayuda y Soporte'),
        content: const Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Para obtener ayuda técnica:'),
            SizedBox(height: 8),
            Text('📧 Email: soporte@ucn.cl'),
            Text('📞 Teléfono: +56 55 2355000'),
            Text('🌐 Web: help.ucn.cl'),
            SizedBox(height: 8),
            Text('Horario de atención:'),
            Text('Lunes a Viernes: 8:00 - 18:00'),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cerrar'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Abriendo canal de soporte'),
                  backgroundColor: Colors.blue,
                ),
              );
            },
            child: const Text('Contactar'),
          ),
        ],
      ),
    );
  }

  void _showPrivacyPolicy() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Abriendo política de privacidad'),
        backgroundColor: Colors.purple,
      ),
    );
  }
}
