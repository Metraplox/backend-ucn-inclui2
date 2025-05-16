import 'package:flutter/material.dart';
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
  StudentAdjustmentsScreenState createState() => StudentAdjustmentsScreenState();
}

class StudentAdjustmentsScreenState extends State<StudentAdjustmentsScreen> with SingleTickerProviderStateMixin {
  bool isLoading = true;
  late TabController _tabController;
  List<String> semesters = ['2025-1', '2024-2', '2024-1'];
  String selectedSemester = '2025-1';
  
  List<Map<String, dynamic>> currentAdjustments = [];
  List<Map<String, dynamic>> adjustmentHistory = [];
  List<Map<String, dynamic>> availableCategories = [];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _loadData();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadData() async {
    // Simulación de carga de datos
    await Future.delayed(const Duration(milliseconds: 800));
    
    setState(() {
      currentAdjustments = [
        {
          "id": "1",
          "category": "Tiempo adicional en evaluaciones",
          "description": "50% de tiempo adicional en todas las evaluaciones",
          "courses": ["MAT101", "FIS102", "QUI201"],
          "startDate": "2025-03-01",
          "endDate": "2025-07-31",
          "status": "active",
          "approvedBy": "coordinadora@ucn.cl",
        },
        {
          "id": "2",
          "category": "Material en formato accesible",
          "description": "Proporcionar material en formato digital accesible",
          "courses": ["MAT101", "FIS102"],
          "startDate": "2025-03-01",
          "endDate": "2025-07-31",
          "status": "active",
          "approvedBy": "coordinadora@ucn.cl",
        },
      ];
      
      adjustmentHistory = [
        {
          "id": "3",
          "category": "Ubicación preferencial",
          "description": "Asiento en primera fila",
          "courses": ["BIO101", "QUI101"],
          "startDate": "2024-08-01",
          "endDate": "2024-12-15",
          "status": "completed",
          "approvedBy": "coordinadora@ucn.cl",
        },
        {
          "id": "4",
          "category": "Uso de tecnología asistiva",
          "description": "Uso de grabadora en clases",
          "courses": ["BIO101"],
          "startDate": "2024-08-01",
          "endDate": "2024-12-15",
          "status": "completed",
          "approvedBy": "coordinadora@ucn.cl",
        },
      ];
      
      availableCategories = [
        {
          "id": "1",
          "name": "Tiempo adicional en evaluaciones",
        },
        {
          "id": "2",
          "name": "Material en formato accesible",
        },
        {
          "id": "3",
          "name": "Ubicación preferencial",
        },
        {
          "id": "4",
          "name": "Uso de tecnología asistiva",
        },
        {
          "id": "5",
          "name": "Evaluación diferenciada",
        },
      ];
      
      isLoading = false;
    });
  }

  String _getStatusText(String status) {
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

  Color _getStatusColor(String status) {
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
        title: Text('Ajustes de ${widget.studentName}'),
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: 'Ajustes Actuales'),
            Tab(text: 'Historial'),
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
      body: isLoading
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
                          const Text('Semestre: ', style: TextStyle(fontWeight: FontWeight.bold)),
                          const SizedBox(width: 8),
                          DropdownButton<String>(
                            value: selectedSemester,
                            items: semesters.map((semester) {
                              return DropdownMenuItem<String>(
                                value: semester,
                                child: Text(semester),
                              );
                            }).toList(),
                            onChanged: (value) {
                              if (value != null) {
                                setState(() {
                                  selectedSemester = value;
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
                        _buildAdjustmentsTab(currentAdjustments),
                        
                        // Pestaña de historial
                        _buildAdjustmentsTab(adjustmentHistory),
                      ],
                    ),
                  ),
                ],
              ),
            ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          _showAddAdjustmentDialog();
        },
        tooltip: 'Agregar Ajuste',
        child: const Icon(Icons.add),
      ),
    );
  }

  Widget _buildAdjustmentsTab(List<Map<String, dynamic>> adjustments) {
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

  Widget _buildMobileAdjustmentsList(List<Map<String, dynamic>> adjustments) {
    return ListView.builder(
      itemCount: adjustments.length,
      itemBuilder: (context, index) {
        final adjustment = adjustments[index];
        return Card(
          margin: const EdgeInsets.only(bottom: 8),
          child: ExpansionTile(
            title: Text(adjustment['category']),
            subtitle: Text(
              _getStatusText(adjustment['status']),
              style: TextStyle(color: _getStatusColor(adjustment['status'])),
            ),
            children: [
              Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Descripción: ${adjustment['description']}'),
                    const SizedBox(height: 8),
                    Text('Cursos: ${adjustment['courses'].join(", ")}'),
                    const SizedBox(height: 8),
                    Text('Periodo: ${adjustment['startDate']} - ${adjustment['endDate']}'),
                    const SizedBox(height: 8),
                    Text('Aprobado por: ${adjustment['approvedBy']}'),
                    const SizedBox(height: 16),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        TextButton.icon(
                          icon: const Icon(Icons.edit),
                          label: const Text('Editar'),
                          onPressed: adjustment['status'] == 'active' ? () {
                            _showEditAdjustmentDialog(adjustment);
                          } : null,
                        ),
                        const SizedBox(width: 8),
                        TextButton.icon(
                          icon: const Icon(Icons.delete),
                          label: const Text('Eliminar'),
                          style: TextButton.styleFrom(foregroundColor: Colors.red),
                          onPressed: adjustment['status'] == 'active' ? () {
                            _showDeleteConfirmationDialog(adjustment);
                          } : null,
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

  Widget _buildDesktopAdjustmentsTable(List<Map<String, dynamic>> adjustments) {
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
        rows: adjustments.map((adjustment) {
          return DataRow(
            cells: [
              DataCell(Text(adjustment['category'])),
              DataCell(Text(adjustment['description'])),
              DataCell(Text(adjustment['courses'].join(", "))),
              DataCell(Text('${adjustment['startDate']} - ${adjustment['endDate']}')),
              DataCell(
                Chip(
                  label: Text(_getStatusText(adjustment['status'])),
                  backgroundColor: _getStatusColor(adjustment['status']).withValues(alpha: 51),  // 0.2 * 255 ≈ 51
                  labelStyle: TextStyle(color: _getStatusColor(adjustment['status'])),
                ),
              ),
              DataCell(
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    IconButton(
                      icon: const Icon(Icons.edit),
                      tooltip: 'Editar ajuste',
                      onPressed: adjustment['status'] == 'active' ? () {
                        _showEditAdjustmentDialog(adjustment);
                      } : null,
                    ),
                    IconButton(
                      icon: const Icon(Icons.delete),
                      tooltip: 'Eliminar ajuste',
                      onPressed: adjustment['status'] == 'active' ? () {
                        _showDeleteConfirmationDialog(adjustment);
                      } : null,
                    ),
                  ],
                ),
              ),
            ],
          );
        }).toList(),
      ),
    );
  }

  void _showAddAdjustmentDialog() {
    String? selectedCategory;
    final descriptionController = TextEditingController();
    final startDateController = TextEditingController(text: '2025-03-01');
    final endDateController = TextEditingController(text: '2025-07-31');
    List<String> selectedCourses = [];
    List<String> availableCourses = ['MAT101', 'FIS102', 'QUI201', 'BIO101', 'INF203'];

    showDialog(
      context: context,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setState) {
            return AlertDialog(
              title: const Text('Nuevo Ajuste Razonable'),
              content: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Categoría
                    DropdownButtonFormField<String>(
                      decoration: const InputDecoration(
                        labelText: 'Categoría de Ajuste',
                        border: OutlineInputBorder(),
                      ),
                      value: selectedCategory,
                      items: availableCategories.map((category) {
                        return DropdownMenuItem<String>(
                          value: category['id'],
                          child: Text(category['name']),
                        );
                      }).toList(),
                      onChanged: (value) {
                        setState(() {
                          selectedCategory = value;
                        });
                      },
                    ),
                    
                    const SizedBox(height: 16),
                    
                    // Descripción
                    TextField(
                      controller: descriptionController,
                      decoration: const InputDecoration(
                        labelText: 'Descripción',
                        border: OutlineInputBorder(),
                      ),
                      maxLines: 3,
                    ),
                    
                    const SizedBox(height: 16),
                    
                    // Fechas
                    Row(
                      children: [
                        Expanded(
                          child: TextField(
                            controller: startDateController,
                            decoration: const InputDecoration(
                              labelText: 'Fecha Inicio',
                              border: OutlineInputBorder(),
                            ),
                            readOnly: true,
                            onTap: () async {
                              // Implementar selector de fecha
                            },
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: TextField(
                            controller: endDateController,
                            decoration: const InputDecoration(
                              labelText: 'Fecha Fin',
                              border: OutlineInputBorder(),
                            ),
                            readOnly: true,
                            onTap: () async {
                              // Implementar selector de fecha
                            },
                          ),
                        ),
                      ],
                    ),
                    
                    const SizedBox(height: 16),
                    
                    // Selector de cursos
                    const Text('Cursos aplicables:'),
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 8,
                      runSpacing: 4,
                      children: availableCourses.map((course) {
                        final isSelected = selectedCourses.contains(course);
                        return FilterChip(
                          label: Text(course),
                          selected: isSelected,
                          onSelected: (selected) {
                            setState(() {
                              if (selected) {
                                selectedCourses.add(course);
                              } else {
                                selectedCourses.remove(course);
                              }
                            });
                          },
                        );
                      }).toList(),
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
                    // Implementar guardado de ajuste
                    Navigator.of(context).pop();
                    
                    // Simulación de guardado
                    setState(() {
                      final newAdjustment = {
                        "id": DateTime.now().millisecondsSinceEpoch.toString(),
                        "category": availableCategories
                            .firstWhere((c) => c['id'] == selectedCategory)['name'],
                        "description": descriptionController.text,
                        "courses": selectedCourses,
                        "startDate": startDateController.text,
                        "endDate": endDateController.text,
                        "status": "active",
                        "approvedBy": "coordinadora@ucn.cl",
                      };
                      
                      currentAdjustments.add(newAdjustment);
                    });
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

  void _showEditAdjustmentDialog(Map<String, dynamic> adjustment) {
    final descriptionController = TextEditingController(text: adjustment['description']);
    final startDateController = TextEditingController(text: adjustment['startDate']);
    final endDateController = TextEditingController(text: adjustment['endDate']);
    List<String> selectedCourses = List<String>.from(adjustment['courses']);
    List<String> availableCourses = ['MAT101', 'FIS102', 'QUI201', 'BIO101', 'INF203'];

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
                    // Categoría (no editable)
                    TextField(
                      controller: TextEditingController(text: adjustment['category']),
                      decoration: const InputDecoration(
                        labelText: 'Categoría de Ajuste',
                        border: OutlineInputBorder(),
                      ),
                      readOnly: true,
                    ),
                    
                    const SizedBox(height: 16),
                    
                    // Descripción
                    TextField(
                      controller: descriptionController,
                      decoration: const InputDecoration(
                        labelText: 'Descripción',
                        border: OutlineInputBorder(),
                      ),
                      maxLines: 3,
                    ),
                    
                    const SizedBox(height: 16),
                    
                    // Fechas
                    Row(
                      children: [
                        Expanded(
                          child: TextField(
                            controller: startDateController,
                            decoration: const InputDecoration(
                              labelText: 'Fecha Inicio',
                              border: OutlineInputBorder(),
                            ),
                            readOnly: true,
                            onTap: () async {
                              // Implementar selector de fecha
                            },
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: TextField(
                            controller: endDateController,
                            decoration: const InputDecoration(
                              labelText: 'Fecha Fin',
                              border: OutlineInputBorder(),
                            ),
                            readOnly: true,
                            onTap: () async {
                              // Implementar selector de fecha
                            },
                          ),
                        ),
                      ],
                    ),
                    
                    const SizedBox(height: 16),
                    
                    // Selector de cursos
                    const Text('Cursos aplicables:'),
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 8,
                      runSpacing: 4,
                      children: availableCourses.map((course) {
                        final isSelected = selectedCourses.contains(course);
                        return FilterChip(
                          label: Text(course),
                          selected: isSelected,
                          onSelected: (selected) {
                            setState(() {
                              if (selected) {
                                selectedCourses.add(course);
                              } else {
                                selectedCourses.remove(course);
                              }
                            });
                          },
                        );
                      }).toList(),
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
                    // Implementar actualización de ajuste
                    Navigator.of(context).pop();
                    
                    // Simulación de actualización
                    setState(() {
                      adjustment['description'] = descriptionController.text;
                      adjustment['startDate'] = startDateController.text;
                      adjustment['endDate'] = endDateController.text;
                      adjustment['courses'] = selectedCourses;
                    });
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

  void _showDeleteConfirmationDialog(Map<String, dynamic> adjustment) {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Eliminar Ajuste'),
          content: Text('¿Está seguro que desea eliminar el ajuste "${adjustment['category']}"?'),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.of(context).pop();
              },
              child: const Text('Cancelar'),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.red,
              ),
              onPressed: () {
                // Implementar eliminación de ajuste
                setState(() {
                  currentAdjustments.removeWhere((item) => item['id'] == adjustment['id']);
                });
                Navigator.of(context).pop();
              },
              child: const Text('Eliminar'),
            ),
          ],
        );
      },
    );
  }
}
