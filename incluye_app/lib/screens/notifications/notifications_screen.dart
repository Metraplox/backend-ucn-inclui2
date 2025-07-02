import 'package:flutter/material.dart';
import 'package:incluye_app/models/notification_model.dart';
import 'package:incluye_app/services/notification_service.dart';
import 'package:incluye_app/utils/responsive_utils.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  NotificationsScreenState createState() => NotificationsScreenState();
}

class NotificationsScreenState extends State<NotificationsScreen>
    with SingleTickerProviderStateMixin {
  bool isLoading = true;
  late TabController _tabController;
  List<Notifications> _notifications = [];
  List<Notifications> _filteredNotifications = [];

  // Filtros
  String? selectedType;
  bool? isRead;

  List<String> notificationTypes = [
    'Ajustes',
    'Documentos',
    'Estudiantes',
    'Sistema',
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _loadNotifications();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadNotifications() async {
    final notificacions = await NotificationService.getAllNotifications();

    setState(() {
      _notifications = notificacions;
      _filteredNotifications = _notifications;
      isLoading = false;
    });
  }

  void _filterNotifications() {
    setState(() {
      _filteredNotifications =
          _notifications.where((notification) {
            // Filtro por tipo
            final matchesType =
                selectedType == null || notification.type == selectedType;

            // Filtro por estado de lectura
            final matchesReadStatus =
                isRead == null || notification.isRead == isRead;

            // Filtro por pestaña actual
            bool matchesTab = true;
            if (_tabController.index == 0) {
              // Todas
              matchesTab = true;
            } else if (_tabController.index == 1) {
              // No leídas
              matchesTab = !notification.isRead;
            } else if (_tabController.index == 2) {
              // Importantes
              matchesTab = notification.priority == 'HIGH';
            }

            return matchesType && matchesReadStatus && matchesTab;
          }).toList();
    });
  }

  void _showFilterDialog() {
    showDialog(
      context: context,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setState) {
            return AlertDialog(
              title: const Text('Filtrar Notificaciones'),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Filtro por tipo
                  DropdownButtonFormField<String?>(
                    decoration: const InputDecoration(
                      labelText: 'Tipo de Notificación',
                      border: OutlineInputBorder(),
                    ),
                    value: selectedType,
                    items: [
                      const DropdownMenuItem<String?>(
                        value: null,
                        child: Text('Todos los tipos'),
                      ),
                      ...notificationTypes.map((type) {
                        return DropdownMenuItem<String?>(
                          value: type,
                          child: Text(type),
                        );
                      }),
                    ],
                    onChanged: (value) {
                      setState(() {
                        selectedType = value;
                      });
                    },
                  ),

                  const SizedBox(height: 16),

                  // Filtro por estado de lectura
                  FormField<bool?>(
                    initialValue: isRead,
                    builder: (field) {
                      return InputDecorator(
                        decoration: const InputDecoration(
                          labelText: 'Estado de Lectura',
                          border: OutlineInputBorder(),
                        ),
                        child: DropdownButtonHideUnderline(
                          child: DropdownButton<bool?>(
                            value: isRead,
                            isDense: true,
                            isExpanded: true,
                            items: const [
                              DropdownMenuItem<bool?>(
                                value: null,
                                child: Text('Todas'),
                              ),
                              DropdownMenuItem<bool?>(
                                value: true,
                                child: Text('Leídas'),
                              ),
                              DropdownMenuItem<bool?>(
                                value: false,
                                child: Text('No leídas'),
                              ),
                            ],
                            onChanged: (value) {
                              setState(() {
                                isRead = value;
                              });
                            },
                          ),
                        ),
                      );
                    },
                  ),
                ],
              ),
              actions: [
                TextButton(
                  onPressed: () {
                    // Restablecer filtros
                    setState(() {
                      selectedType = null;
                      isRead = null;
                    });
                  },
                  child: const Text('Restablecer'),
                ),
                TextButton(
                  onPressed: () {
                    Navigator.of(context).pop();
                  },
                  child: const Text('Cancelar'),
                ),
                ElevatedButton(
                  onPressed: () {
                    Navigator.of(context).pop();
                    _filterNotifications();
                  },
                  child: const Text('Aplicar'),
                ),
              ],
            );
          },
        );
      },
    );
  }

  void _markAllAsRead() {
    setState(() {
      for (var notification in _notifications) {
        notification.isRead = true;
      }
    });
    _filterNotifications();

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Todas las notificaciones han sido marcadas como leídas'),
      ),
    );
  }

  void _markAsRead(String notificationId) async {
    setState(() {
      final notification = _notifications.firstWhere(
        (n) => n.id == notificationId,
      );
      notification.isRead = true;
    });
    await NotificationService.setNotificationRead(notificationId, context);
    _filterNotifications();
  }

  void _deleteNotification(String notificationId) {
    setState(() {
      _notifications.removeWhere((n) => n.id == notificationId);
    });
    _filterNotifications();

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: const Text('Notificación eliminada'),
        action: SnackBarAction(
          label: 'Deshacer',
          onPressed: () {
            // Implementar funcionalidad para deshacer eliminación
          },
        ),
      ),
    );
  }

  Color _getPriorityColor(String priority) {
    switch (priority) {
      case 'NotificationPriority.HIGH':
        return Colors.red;
      case 'NotificationPriority.MEDIUM':
        return Colors.orange;
      case 'NotificationPriority.LOW':
        return Colors.blue;
      default:
        return Colors.grey;
    }
  }

  Icon _getTypeIcon(String type) {
    switch (type) {
      case 'Ajustes':
        return const Icon(Icons.settings_accessibility);
      case 'Documentos':
        return const Icon(Icons.description);
      case 'Estudiantes':
        return const Icon(Icons.person);
      case 'Sistema':
        return const Icon(Icons.computer);
      default:
        return const Icon(Icons.notifications);
    }
  }

  @override
  Widget build(BuildContext context) {
    final padding = ResponsiveUtils.getPadding(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Notificaciones'),
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(child: Text('Leidas', style: TextStyle(color: Colors.white))),
            Tab(
              child: Text('No Leídas', style: TextStyle(color: Colors.white)),
            ),
            Tab(
              child: Text('Importantes', style: TextStyle(color: Colors.white)),
            ),
          ],
          onTap: (index) {
            _filterNotifications();
          },
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.filter_list),
            tooltip: 'Filtrar notificaciones',
            onPressed: _showFilterDialog,
          ),
          IconButton(
            icon: const Icon(Icons.done_all),
            tooltip: 'Marcar todas como leídas',
            onPressed: _markAllAsRead,
          ),
        ],
      ),
      body:
          isLoading
              ? const Center(child: CircularProgressIndicator())
              : Padding(
                padding: EdgeInsets.all(padding),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Chips de filtros activos
                    if (selectedType != null || isRead != null)
                      Padding(
                        padding: const EdgeInsets.only(bottom: 8.0),
                        child: Wrap(
                          spacing: 8,
                          runSpacing: 4,
                          children: [
                            if (selectedType != null)
                              Chip(
                                label: Text('Tipo: $selectedType'),
                                onDeleted: () {
                                  setState(() {
                                    selectedType = null;
                                  });
                                  _filterNotifications();
                                },
                              ),
                            if (isRead != null)
                              Chip(
                                label: Text(isRead! ? 'Leídas' : 'No leídas'),
                                onDeleted: () {
                                  setState(() {
                                    isRead = null;
                                  });
                                  _filterNotifications();
                                },
                              ),
                            TextButton.icon(
                              icon: const Icon(Icons.clear_all, size: 18),
                              label: const Text('Limpiar todos'),
                              style: TextButton.styleFrom(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 8,
                                  vertical: 4,
                                ),
                              ),
                              onPressed: () {
                                setState(() {
                                  selectedType = null;
                                  isRead = null;
                                });
                                _filterNotifications();
                              },
                            ),
                          ],
                        ),
                      ),

                    // Lista de notificaciones
                    Expanded(
                      child:
                          _filteredNotifications.isEmpty
                              ? Center(
                                child: Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    const Icon(
                                      Icons.notifications_off,
                                      size: 64,
                                      color: Colors.grey,
                                    ),
                                    const SizedBox(height: 16),
                                    Text(
                                      'No hay notificaciones',
                                      style: Theme.of(context)
                                          .textTheme
                                          .titleMedium
                                          ?.copyWith(color: Colors.grey),
                                    ),
                                  ],
                                ),
                              )
                              : ListView.builder(
                                itemCount: _filteredNotifications.length,
                                itemBuilder: (context, index) {
                                  final notification =
                                      _filteredNotifications[index];
                                  return Dismissible(
                                    key: Key(notification.id),
                                    background: Container(
                                      color: Colors.green,
                                      alignment: Alignment.centerLeft,
                                      padding: const EdgeInsets.symmetric(
                                        horizontal: 20,
                                      ),
                                      child: const Icon(
                                        Icons.done,
                                        color: Colors.white,
                                      ),
                                    ),
                                    secondaryBackground: Container(
                                      color: Colors.red,
                                      alignment: Alignment.centerRight,
                                      padding: const EdgeInsets.symmetric(
                                        horizontal: 20,
                                      ),
                                      child: const Icon(
                                        Icons.delete,
                                        color: Colors.white,
                                      ),
                                    ),
                                    onDismissed: (direction) {
                                      if (direction ==
                                          DismissDirection.endToStart) {
                                        _deleteNotification(notification.id);
                                      } else {
                                        _markAsRead(notification.id);
                                      }
                                    },
                                    child: Card(
                                      margin: const EdgeInsets.only(bottom: 8),
                                      child: ListTile(
                                        leading: Badge(
                                          backgroundColor: _getPriorityColor(
                                            notification.priority.toString(),
                                          ),
                                          label: const SizedBox.shrink(),
                                          child: _getTypeIcon(
                                            notification.type.toString(),
                                          ),
                                        ),
                                        title: Text(
                                          notification.title,
                                          style: TextStyle(
                                            fontWeight:
                                                notification.isRead
                                                    ? FontWeight.normal
                                                    : FontWeight.bold,
                                          ),
                                        ),
                                        subtitle: Column(
                                          crossAxisAlignment:
                                              CrossAxisAlignment.start,
                                          children: [
                                            Text(notification.message),
                                            const SizedBox(height: 4),
                                            Row(
                                              children: [
                                                Text(
                                                  _formatDate(
                                                    notification.updatedAt
                                                        .toString(),
                                                  ),
                                                  style:
                                                      Theme.of(
                                                        context,
                                                      ).textTheme.bodySmall,
                                                ),
                                                const SizedBox(width: 8),

                                                // NUEVO CÓDIGO CON COLOR DE FONDO Y CONTRASTE DE TEXTO
                                                Builder(
                                                  builder: (context) {
                                                    final backgroundColor =
                                                        _getPriorityColor(
                                                          notification.priority
                                                              .toString(),
                                                        ).withAlpha(30);
                                                    final isDarkBackground =
                                                        ThemeData.estimateBrightnessForColor(
                                                          backgroundColor,
                                                        ) ==
                                                        Brightness.dark;

                                                    return Container(
                                                      padding:
                                                          const EdgeInsets.symmetric(
                                                            horizontal: 6,
                                                            vertical: 2,
                                                          ),
                                                      decoration: BoxDecoration(
                                                        color: backgroundColor,
                                                        borderRadius:
                                                            BorderRadius.circular(
                                                              4,
                                                            ),
                                                      ),
                                                      child: Text(
                                                        getNotificationTypeLabel(
                                                          notification.type
                                                              .toString(),
                                                        ),
                                                        style: TextStyle(
                                                          fontSize: 10,
                                                          color:
                                                              isDarkBackground
                                                                  ? Colors.white
                                                                  : Colors
                                                                      .black,
                                                        ),
                                                      ),
                                                    );
                                                  },
                                                ),
                                              ],
                                            ),
                                          ],
                                        ),
                                        trailing:
                                            notification.isRead
                                                ? null
                                                : const Icon(
                                                  Icons.circle,
                                                  size: 12,
                                                  color: Colors.blue,
                                                ),
                                        onTap: () {
                                          _markAsRead(notification.id);
                                          _handleNotificationAction(
                                            notification,
                                          );
                                        },
                                      ),
                                    ),
                                  );
                                },
                              ),
                    ),
                  ],
                ),
              ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          _showNotificationSettingsDialog();
        },
        tooltip: 'Configuración de Notificaciones',
        child: const Icon(Icons.notifications_active),
      ),
    );
  }

  String _formatDate(String dateString) {
    final date = DateTime.parse(dateString);
    final now = DateTime.now();
    final difference = now.difference(date);

    if (difference.inDays == 0) {
      if (difference.inHours == 0) {
        return 'Hace ${difference.inMinutes} minutos';
      }
      return 'Hace ${difference.inHours} horas';
    } else if (difference.inDays == 1) {
      return 'Ayer';
    } else if (difference.inDays < 7) {
      return 'Hace ${difference.inDays} días';
    } else {
      return '${date.day}/${date.month}/${date.year}';
    }
  }

  String getNotificationTypeLabel(String type) {
    switch (type) {
      case 'NotificationType.ADJUSTMENT_CREATED':
        return 'Ajuste creado';
      case 'NotificationType.ADJUSTMENT_UPDATED':
        return 'Ajuste actualizado';
      case 'NotificationType.ADJUSMENT_APPROVAL_NEEDED':
        return 'Ajuste necesita aprobación';
      case 'NotificationType.ADJUSMENT_APPROVED':
        return 'Ajuste fue aprobado';
      case 'NotificationType.ADJUSMENT_REJECTED':
        return 'Ajuste fue rechazado';
      case 'NotificationType.NEW_STUDENT':
        return 'Nuevo estudiante';
      case 'NotificationType.STUDENT_UPDATE':
        return 'Estudiante ha sido actualizado';
      case 'NotificationType.TEACHER_ASSIGNMENT':
        return 'Asignatura de un profesor.';
      case 'NotificationType.TEACHER_ACKNOWLEDGMENT_NEEDED':
        return 'Necesita confirmación de lectura del profesor';
      case 'NotificationType.TEACHER_ACKNOWLEDGMENT_RECEIVED':
        return 'Confirmación de lectura del profesor';
      case 'NotificationType.NEW_RESOURCE_AVAILABLE':
        return 'Nuevo recurso disponible';
      case 'NotificationType.REMINDER':
        return 'Recordatorio del Sistema';
      case 'NotificationType.SYSTEM_ALERT':
        return 'Alerta del sistema';
      case 'NotificationType.HELP_REQUEST':
        return 'Solicitud de ayuda';
      case 'NotificationType.HELP_REQUEST_RESPONSE':
        return 'Respuesta a solicitud de ayuda';
      default:
        return type;
    }
  }

  void _handleNotificationAction(Notifications notification) {
    switch (notification.type) {
      case 'view_student':
        // Implementar navegación a perfil de estudiante
        break;
      case 'view_documents':
        // Implementar navegación a documentos de estudiante
        break;
      case 'view_adjustments':
        // Implementar navegación a ajustes de estudiante
        break;
      case 'view_report':
        // Implementar navegación a reporte
        break;
      default:
        // No hacer nada
        break;
    }
  }

  void _showNotificationSettingsDialog() {
    bool emailNotifications = true;
    bool pushNotifications = true;
    bool adjustmentNotifications = true;
    bool documentNotifications = true;
    bool studentNotifications = true;
    bool systemNotifications = true;

    showDialog(
      context: context,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setState) {
            return AlertDialog(
              title: const Text('Configuración de Notificaciones'),
              content: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Canales de Notificación',
                      style: TextStyle(fontWeight: FontWeight.bold),
                    ),
                    SwitchListTile(
                      title: const Text('Notificaciones por Email'),
                      value: emailNotifications,
                      onChanged: (value) {
                        setState(() {
                          emailNotifications = value;
                        });
                      },
                    ),
                    SwitchListTile(
                      title: const Text('Notificaciones Push'),
                      value: pushNotifications,
                      onChanged: (value) {
                        setState(() {
                          pushNotifications = value;
                        });
                      },
                    ),

                    const Divider(),

                    const Text(
                      'Tipos de Notificación',
                      style: TextStyle(fontWeight: FontWeight.bold),
                    ),
                    SwitchListTile(
                      title: const Text('Ajustes Razonables'),
                      value: adjustmentNotifications,
                      onChanged: (value) {
                        setState(() {
                          adjustmentNotifications = value;
                        });
                      },
                    ),
                    SwitchListTile(
                      title: const Text('Documentos'),
                      value: documentNotifications,
                      onChanged: (value) {
                        setState(() {
                          documentNotifications = value;
                        });
                      },
                    ),
                    SwitchListTile(
                      title: const Text('Estudiantes'),
                      value: studentNotifications,
                      onChanged: (value) {
                        setState(() {
                          studentNotifications = value;
                        });
                      },
                    ),
                    SwitchListTile(
                      title: const Text('Sistema'),
                      value: systemNotifications,
                      onChanged: (value) {
                        setState(() {
                          systemNotifications = value;
                        });
                      },
                    ),
                  ],
                ),
              ),
              actions: [
                TextButton(
                  onPressed: () {
                    Navigator.of(context).pop();
                  },
                  child: const Text('Cancelar'),
                ),
                ElevatedButton(
                  onPressed: () {
                    // Implementar guardado de configuración
                    Navigator.of(context).pop();

                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Configuración guardada correctamente'),
                      ),
                    );
                  },
                  child: const Text('Guardar'),
                ),
              ],
            );
          },
        );
      },
    );
  }
}
