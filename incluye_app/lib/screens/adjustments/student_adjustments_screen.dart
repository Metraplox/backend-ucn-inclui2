import 'package:flutter/material.dart';
import 'package:incluye_app/models/adjustment_model.dart';
import 'package:incluye_app/models/studentAdjustment.dart';
import 'package:incluye_app/models/student_model.dart';
import 'package:incluye_app/services/adjustment_service.dart';
import 'package:incluye_app/services/notification_service.dart';
import 'package:incluye_app/utils/responsive_utils.dart';

class StudentAdjustmentsScreen extends StatefulWidget {
  final String studentId;
  final String studentName;

  const StudentAdjustmentsScreen({
    super.key,
    required this.studentId,
    required this.studentName,
  });

  @override
  StudentAdjustmentsScreenState createState() =>
      StudentAdjustmentsScreenState();
}

class StudentAdjustmentsScreenState extends State<StudentAdjustmentsScreen>
    with SingleTickerProviderStateMixin {
  bool isLoading = true;
  late TabController _tabController;
  List<String> semesters = ['2025-1', '2024-2', '2024-1'];

  String actualSemester = '';

  void setActualSemester() {
    final int actualYear = DateTime.now().year;
    final int actualMonth = DateTime.now().month;
    String monthSemester = '1';
    if (actualMonth > 7) {
      monthSemester = '2';
    } else if (actualMonth < 7) {
      monthSemester = '1';
    }
    final semesterString = '$actualYear-$monthSemester';
    setState(() {
      actualSemester = semesterString;
    });
    print(actualSemester);
  }

  final List<StudentAdjustment> _studentAdjustments = [];
  List<Adjustment> _currentAdjustments = [];
  List<Adjustment> adjustmentHistory = [];
  List<Map<String, dynamic>> availableCategories = [];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _loadData();
    setActualSemester();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadData() async {
    final List<StudentAdjustment> studentAdjustments =
        await AdjustmentService.getStudentAdjustments(widget.studentId);

    List<Adjustment> allAdjustments = [];

    for (var studentAdj in studentAdjustments) {
      for (var adj in studentAdj.currentAdjustments) {
        // Aquí asignas el id de StudentAdjustment a Adjustment si Adjustment.id es nulo
        adj.id ??= studentAdj.id;

        // También puedes asignar studentId si es necesario

        allAdjustments.add(adj);
      }
    }

    setState(() {
      _currentAdjustments = allAdjustments;
      isLoading = false;
    });
  }

  String _getStatusText(String? status) {
    switch (status) {
      case 'active':
        return 'Activo';
      case 'pending':
        return 'Pendiente';
      case 'completed':
        return 'Completado';
      case 'rejected':
        return 'Rechazado';
      default:
        return 'Desconocido';
    }
  }

  Color _getStatusColor(String? status) {
    switch (status) {
      case 'active':
        return Colors.green;
      case 'pending':
        return Colors.orange;
      case 'completed':
        return Colors.blue;
      case 'rejected':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    final padding = ResponsiveUtils.getPadding(context);

    return Scaffold(
      appBar: AppBar(
        title: Text('Mis ajustes'),
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(
              child: Text(
                'Ajustes Actuales',
                style: TextStyle(color: Colors.white),
              ),
            ),
            Tab(
              child: Text('Historial', style: TextStyle(color: Colors.white)),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.filter_list),
            tooltip: 'Filtrar ajustes',
            onPressed: () {
              // Implementar filtrado
            },
          ),
          IconButton(
            icon: const Icon(Icons.print),
            tooltip: 'Imprimir reporte',
            onPressed: () {
              // Implementar impresión
            },
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
                    // Selector de semestre
                    Card(
                      child: Padding(
                        padding: const EdgeInsets.all(8.0),
                        child: Row(
                          children: [
                            const Text(
                              'Semestre: ',
                              style: TextStyle(fontWeight: FontWeight.bold),
                            ),
                            const SizedBox(width: 8),
                            DropdownButton<String>(
                              value: actualSemester,
                              items:
                                  semesters.map((semester) {
                                    return DropdownMenuItem<String>(
                                      value: semester,
                                      child: Text(semester),
                                    );
                                  }).toList(),
                              onChanged: (value) {
                                if (value != null) {
                                  setState(() {
                                    actualSemester = value;
                                    // Aquí se cargarían los ajustes del semestre seleccionado
                                  });
                                }
                              },
                            ),
                            const Spacer(),
                            OutlinedButton.icon(
                              icon: const Icon(Icons.history),
                              label: const Text('Ver todos los semestres'),
                              onPressed: () {
                                // Implementar vista de todos los semestres
                              },
                            ),
                          ],
                        ),
                      ),
                    ),

                    const SizedBox(height: 16),

                    // Contenido de las pestañas
                    Expanded(
                      child: TabBarView(
                        controller: _tabController,
                        children: [
                          // Pestaña de ajustes actuales
                          _buildAdjustmentsTab(_currentAdjustments),

                          // Pestaña de historial
                          _buildAdjustmentsTab(adjustmentHistory),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {},
        tooltip: 'Agregar Ajuste',
        child: const Icon(Icons.add),
      ),
    );
  }

  Widget _buildAdjustmentsTab(List<Adjustment> adjustments) {
    final isMobile = ResponsiveUtils.isMobile(context);

    if (adjustments.isEmpty) {
      return const Center(
        child: Text('No hay ajustes para mostrar en este periodo'),
      );
    }

    return isMobile
        ? _buildMobileAdjustmentsList(adjustments)
        : _buildDesktopAdjustmentsTable(adjustments);
  }

  Widget _buildMobileAdjustmentsList(List<Adjustment> adjustments) {
    return ListView.builder(
      itemCount: adjustments.length,
      itemBuilder: (context, index) {
        final adjustment = adjustments[index];
        return Card(
          margin: const EdgeInsets.only(bottom: 8),
          child: ExpansionTile(
            title: Text(adjustment.tipo),
            subtitle: Text(
              _getStatusText(adjustment.status),
              style: TextStyle(color: _getStatusColor(adjustment.status)),
            ),
            children: [
              Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Descripción: ${adjustment.descripcion}'),
                    const SizedBox(height: 8),
                    Text('Curso: ${adjustment.curso}'),
                    const SizedBox(height: 8),
                    Text(
                      'Periodo: ${adjustment.fechaInicio} - ${adjustment.expirationDate}',
                    ),
                    const SizedBox(height: 8),
                    Text('Aprobado por: ${adjustment.approvedBy}'),
                    const SizedBox(height: 16),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        TextButton.icon(
                          icon: const Icon(Icons.edit),
                          label: const Text('Editar'),
                          onPressed:
                              adjustment.status == 'active'
                                  ? () {
                                    _showEditAdjustmentDialog(adjustment);
                                  }
                                  : null,
                        ),
                        const SizedBox(width: 8),
                        TextButton.icon(
                          icon: const Icon(Icons.delete),
                          label: const Text('Eliminar'),
                          style: TextButton.styleFrom(
                            foregroundColor: Colors.red,
                          ),
                          onPressed:
                              adjustment.status == 'active' ? () {} : null,
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildDesktopAdjustmentsTable(List<Adjustment> adjustments) {
    return SingleChildScrollView(
      child: DataTable(
        columns: const [
          DataColumn(label: Text('Categoría')),
          DataColumn(label: Text('Descripción')),
          DataColumn(label: Text('Cursos')),
          DataColumn(label: Text('Periodo')),
          DataColumn(label: Text('Estado')),
          DataColumn(label: Text('Acciones')),
        ],
        rows:
            adjustments.map((adjustment) {
              return DataRow(
                cells: [
                  DataCell(Text(adjustment.tipo)),
                  DataCell(Text(adjustment.descripcion)),
                  DataCell(Text(adjustment.curso)),
                  DataCell(
                    Text(
                      '${adjustment.fechaInicio} - ${adjustment.fechaInicio}',
                    ),
                  ),
                  DataCell(
                    Chip(
                      label: Text(_getStatusText(adjustment.status)),
                      backgroundColor: _getStatusColor(
                        adjustment.status,
                      ).withValues(alpha: 51), // 0.2 * 255 ≈ 51
                      labelStyle: TextStyle(
                        color: _getStatusColor(
                          adjustment.status?.toLowerCase(),
                        ),
                      ),
                    ),
                  ),
                  DataCell(
                    Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        IconButton(
                          icon: const Icon(Icons.edit),
                          tooltip: 'Editar ajuste',
                          onPressed:
                              adjustment.status?.toLowerCase() == 'activo'
                                  ? () {
                                    _showEditAdjustmentDialog(adjustment);
                                  }
                                  : null,
                        ),
                        //IconButton(
                        //icon: const Icon(Icons.delete),
                        //tooltip: 'Eliminar ajuste',
                        //onPressed:
                        //  adjustment['status'] == 'active'
                        ////    _showDeleteConfirmationDialog(adjustment);
                        //}
                        //: null,
                        // ),
                      ],
                    ),
                  ),
                ],
              );
            }).toList(),
      ),
    );
  }

  void _showEditAdjustmentDialog(Adjustment adjustment) {
    final descriptionController = TextEditingController(
      text: adjustment.descripcion,
    );

    showDialog(
      context: context,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setState) {
            return AlertDialog(
              title: const Text('Editar Ajuste Razonable'),
              content: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Categoría (solo lectura)
                    TextField(
                      controller: TextEditingController(text: adjustment.tipo),
                      decoration: const InputDecoration(
                        labelText: 'Categoría de Ajuste',
                        border: OutlineInputBorder(),
                      ),
                      readOnly: true,
                      enabled: false,
                    ),
                    const SizedBox(height: 16),

                    // Descripción editable
                    TextField(
                      controller: descriptionController,
                      decoration: const InputDecoration(
                        labelText: 'Motivo',
                        border: OutlineInputBorder(),
                      ),
                      maxLines: 3,
                    ),
                    const SizedBox(height: 16),

                    // Curso (solo lectura)
                    TextField(
                      controller: TextEditingController(
                        text: adjustment.courseNrc ?? '',
                      ),
                      decoration: const InputDecoration(
                        labelText: 'Curso',
                        border: OutlineInputBorder(),
                      ),
                      readOnly: true,
                      enabled: false,
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
                  onPressed: () async {
                    await _handleSaveDescription(
                      adjustment,
                      descriptionController,
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

  Future<void> _handleSaveDescription(
    Adjustment adjustment,
    TextEditingController descriptionController,
  ) async {
    final newDesc = descriptionController.text.trim();

    if (newDesc.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Motivos no pueden estar vacíos'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }
    print("IDAJUSSTE:-${adjustment.id}");
    print("IDSTUDENT-${widget.studentId}");
    print("APROBADOPOR- ${adjustment.aprobadoPor}");
    // Validaciones previas
    if (adjustment.id == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
            'Falta información obligatoria para enviar la solicitud.',
          ),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    try {
      await NotificationService.studentUpdateNotification(
        adjustment.id!,
        actualSemester,
        newDesc,
        widget.studentId,
        adjustment.aprobadoPor,
        widget.studentName,
      );

      Navigator.of(context).pop();

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Solicitud enviada correctamente.')),
      );
    } catch (e) {
      if (e.toString().contains('duplicada')) {
        // Caso notificación duplicada: mostrar mensaje distinto, pero sin error rojo
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('La solicitud ya fue enviada anteriormente.'),
          ),
        );
      } else {
        // Otros errores
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error al enviar solicitud: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }
}
