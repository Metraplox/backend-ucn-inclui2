import 'package:flutter/material.dart';
import 'package:incluye_app/utils/responsive_utils.dart';
import 'package:incluye_app/screens/documents/document_list_screen.dart';
import 'package:incluye_app/screens/adjustments/student_adjustments_screen.dart';

class EnhancedStudentListScreen extends StatefulWidget {
  const EnhancedStudentListScreen({super.key});

  @override
  EnhancedStudentListScreenState createState() => EnhancedStudentListScreenState();
}

class EnhancedStudentListScreenState extends State<EnhancedStudentListScreen> {
  bool isLoading = true;
  List<Map<String, dynamic>> students = [];
  List<Map<String, dynamic>> filteredStudents = [];
  String searchQuery = '';
  
  // Filtros
  String? selectedCareer;
  String? selectedSemester;
  bool? hasConsent;
  bool? hasAdjustments;
  
  List<String> careers = ['Ingeniería Civil', 'Medicina', 'Derecho', 'Psicología', 'Arquitectura'];
  List<String> semesters = ['2025-1', '2024-2', '2024-1'];

  @override
  void initState() {
    super.initState();
    _loadStudents();
  }

  Future<void> _loadStudents() async {
    // Simulación de carga de datos
    await Future.delayed(const Duration(milliseconds: 800));
    
    setState(() {
      students = [
        {
          "id": "1",
          "nombres": "Juan Carlos",
          "apellidos": "Pérez González",
          "rut": "12.345.678-9",
          "carrera": "Ingeniería Civil",
          "diagnostico": "Dislexia",
          "consentimientoFirmado": true,
          "tieneAjustes": true,
          "ultimoSemestre": "2025-1",
          "fechaIngreso": "2023-03-01",
        },
        {
          "id": "2",
          "nombres": "María José",
          "apellidos": "Rodríguez Silva",
          "rut": "18.765.432-1",
          "carrera": "Medicina",
          "diagnostico": "TDAH",
          "consentimientoFirmado": true,
          "tieneAjustes": true,
          "ultimoSemestre": "2025-1",
          "fechaIngreso": "2022-08-01",
        },
        {
          "id": "3",
          "nombres": "Pedro Pablo",
          "apellidos": "González Muñoz",
          "rut": "20.111.222-3",
          "carrera": "Derecho",
          "diagnostico": "Discapacidad visual",
          "consentimientoFirmado": false,
          "tieneAjustes": false,
          "ultimoSemestre": "2025-1",
          "fechaIngreso": "2024-03-01",
        },
        {
          "id": "4",
          "nombres": "Ana Carolina",
          "apellidos": "Martínez López",
          "rut": "19.876.543-2",
          "carrera": "Psicología",
          "diagnostico": "Discapacidad auditiva",
          "consentimientoFirmado": true,
          "tieneAjustes": false,
          "ultimoSemestre": "2024-2",
          "fechaIngreso": "2022-03-01",
        },
      ];
      filteredStudents = students;
      isLoading = false;
    });
  }

  void _filterStudents() {
    setState(() {
      filteredStudents = students.where((student) {
        // Filtro por texto de búsqueda
        final matchesQuery = searchQuery.isEmpty ||
            '${student['nombres']} ${student['apellidos']}'.toLowerCase().contains(searchQuery.toLowerCase()) ||
            student['rut'].toLowerCase().contains(searchQuery.toLowerCase());
        
        // Filtro por carrera
        final matchesCareer = selectedCareer == null || student['carrera'] == selectedCareer;
        
        // Filtro por semestre
        final matchesSemester = selectedSemester == null || student['ultimoSemestre'] == selectedSemester;
        
        // Filtro por consentimiento
        final matchesConsent = hasConsent == null || student['consentimientoFirmado'] == hasConsent;
        
        // Filtro por ajustes
        final matchesAdjustments = hasAdjustments == null || student['tieneAjustes'] == hasAdjustments;
        
        return matchesQuery && matchesCareer && matchesSemester && matchesConsent && matchesAdjustments;
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
              title: const Text('Filtros Avanzados'),
              content: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // Filtro por carrera
                    DropdownButtonFormField<String?>(
                      decoration: const InputDecoration(
                        labelText: 'Carrera',
                        border: OutlineInputBorder(),
                      ),
                      value: selectedCareer,
                      items: [
                        const DropdownMenuItem<String?>(
                          value: null,
                          child: Text('Todas las carreras'),
                        ),
                        ...careers.map((career) {
                          return DropdownMenuItem<String?>(
                            value: career,
                            child: Text(career),
                          );
                        }),
                      ],
                      onChanged: (value) {
                        setState(() {
                          selectedCareer = value;
                        });
                      },
                    ),
                    
                    const SizedBox(height: 16),
                    
                    // Filtro por semestre
                    DropdownButtonFormField<String?>(
                      decoration: const InputDecoration(
                        labelText: 'Semestre',
                        border: OutlineInputBorder(),
                      ),
                      value: selectedSemester,
                      items: [
                        const DropdownMenuItem<String?>(
                          value: null,
                          child: Text('Todos los semestres'),
                        ),
                        ...semesters.map((semester) {
                          return DropdownMenuItem<String?>(
                            value: semester,
                            child: Text(semester),
                          );
                        }),
                      ],
                      onChanged: (value) {
                        setState(() {
                          selectedSemester = value;
                        });
                      },
                    ),
                    
                    const SizedBox(height: 16),
                    
                    // Filtro por consentimiento
                    FormField<bool?>(
                      initialValue: hasConsent,
                      builder: (field) {
                        return InputDecorator(
                          decoration: const InputDecoration(
                            labelText: 'Consentimiento',
                            border: OutlineInputBorder(),
                          ),
                          child: DropdownButtonHideUnderline(
                            child: DropdownButton<bool?>(
                              value: hasConsent,
                              isDense: true,
                              isExpanded: true,
                              items: const [
                                DropdownMenuItem<bool?>(
                                  value: null,
                                  child: Text('Todos'),
                                ),
                                DropdownMenuItem<bool?>(
                                  value: true,
                                  child: Text('Con consentimiento'),
                                ),
                                DropdownMenuItem<bool?>(
                                  value: false,
                                  child: Text('Sin consentimiento'),
                                ),
                              ],
                              onChanged: (value) {
                                setState(() {
                                  hasConsent = value;
                                });
                              },
                            ),
                          ),
                        );
                      },
                    ),
                    
                    const SizedBox(height: 16),
                    
                    // Filtro por ajustes
                    FormField<bool?>(
                      initialValue: hasAdjustments,
                      builder: (field) {
                        return InputDecorator(
                          decoration: const InputDecoration(
                            labelText: 'Ajustes',
                            border: OutlineInputBorder(),
                          ),
                          child: DropdownButtonHideUnderline(
                            child: DropdownButton<bool?>(
                              value: hasAdjustments,
                              isDense: true,
                              isExpanded: true,
                              items: const [
                                DropdownMenuItem<bool?>(
                                  value: null,
                                  child: Text('Todos'),
                                ),
                                DropdownMenuItem<bool?>(
                                  value: true,
                                  child: Text('Con ajustes'),
                                ),
                                DropdownMenuItem<bool?>(
                                  value: false,
                                  child: Text('Sin ajustes'),
                                ),
                              ],
                              onChanged: (value) {
                                setState(() {
                                  hasAdjustments = value;
                                });
                              },
                            ),
                          ),
                        );
                      },
                    ),
                  ],
                ),
              ),
              actions: [
                TextButton(
                  onPressed: () {
                    // Restablecer filtros
                    setState(() {
                      selectedCareer = null;
                      selectedSemester = null;
                      hasConsent = null;
                      hasAdjustments = null;
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
                    _filterStudents();
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

  @override
  Widget build(BuildContext context) {
    final isMobile = ResponsiveUtils.isMobile(context);
    final padding = ResponsiveUtils.getPadding(context);
    
    return Scaffold(
      appBar: AppBar(
        title: const Text('Estudiantes'),
        actions: [
          IconButton(
            icon: const Icon(Icons.filter_list),
            tooltip: 'Filtros avanzados',
            onPressed: _showFilterDialog,
          ),
          IconButton(
            icon: const Icon(Icons.refresh),
            tooltip: 'Actualizar',
            onPressed: () {
              setState(() {
                isLoading = true;
              });
              _loadStudents();
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
                  // Barra de búsqueda
                  TextField(
                    decoration: InputDecoration(
                      hintText: 'Buscar por nombre o RUT',
                      prefixIcon: const Icon(Icons.search),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                      suffixIcon: searchQuery.isNotEmpty
                          ? IconButton(
                              icon: const Icon(Icons.clear),
                              onPressed: () {
                                setState(() {
                                  searchQuery = '';
                                });
                                _filterStudents();
                              },
                            )
                          : null,
                    ),
                    onChanged: (value) {
                      setState(() {
                        searchQuery = value;
                      });
                      _filterStudents();
                    },
                  ),
                  
                  // Chips de filtros activos
                  if (selectedCareer != null || selectedSemester != null || hasConsent != null || hasAdjustments != null)
                    Padding(
                      padding: const EdgeInsets.only(top: 8.0),
                      child: Wrap(
                        spacing: 8,
                        runSpacing: 4,
                        children: [
                          if (selectedCareer != null)
                            Chip(
                              label: Text('Carrera: $selectedCareer'),
                              onDeleted: () {
                                setState(() {
                                  selectedCareer = null;
                                });
                                _filterStudents();
                              },
                            ),
                          if (selectedSemester != null)
                            Chip(
                              label: Text('Semestre: $selectedSemester'),
                              onDeleted: () {
                                setState(() {
                                  selectedSemester = null;
                                });
                                _filterStudents();
                              },
                            ),
                          if (hasConsent != null)
                            Chip(
                              label: Text(hasConsent! ? 'Con consentimiento' : 'Sin consentimiento'),
                              onDeleted: () {
                                setState(() {
                                  hasConsent = null;
                                });
                                _filterStudents();
                              },
                            ),
                          if (hasAdjustments != null)
                            Chip(
                              label: Text(hasAdjustments! ? 'Con ajustes' : 'Sin ajustes'),
                              onDeleted: () {
                                setState(() {
                                  hasAdjustments = null;
                                });
                                _filterStudents();
                              },
                            ),
                          TextButton.icon(
                            icon: const Icon(Icons.clear_all, size: 18),
                            label: const Text('Limpiar todos'),
                            style: TextButton.styleFrom(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            ),
                            onPressed: () {
                              setState(() {
                                selectedCareer = null;
                                selectedSemester = null;
                                hasConsent = null;
                                hasAdjustments = null;
                              });
                              _filterStudents();
                            },
                          ),
                        ],
                      ),
                    ),
                  
                  const SizedBox(height: 16),
                  
                  // Información de resultados
                  Text(
                    'Mostrando ${filteredStudents.length} de ${students.length} estudiantes',
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                  
                  const SizedBox(height: 8),
                  
                  // Lista de estudiantes
                  Expanded(
                    child: filteredStudents.isEmpty
                        ? const Center(
                            child: Text('No se encontraron estudiantes con los filtros aplicados'),
                          )
                        : isMobile
                            ? _buildMobileStudentList()
                            : _buildDesktopStudentTable(),
                  ),
                ],
              ),
            ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          // Implementar navegación a pantalla de creación de estudiante
        },
        tooltip: 'Agregar Estudiante',
        child: const Icon(Icons.add),
      ),
    );
  }

  Widget _buildMobileStudentList() {
    return ListView.builder(
      itemCount: filteredStudents.length,
      itemBuilder: (context, index) {
        final student = filteredStudents[index];
        return Card(
          margin: const EdgeInsets.only(bottom: 8),
          child: ListTile(
            title: Text('${student['nombres']} ${student['apellidos']}'),
            subtitle: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('RUT: ${student['rut']}'),
                Text('Carrera: ${student['carrera']}'),
                Row(
                  children: [
                    Icon(
                      student['consentimientoFirmado'] ? Icons.check_circle : Icons.cancel,
                      size: 16,
                      color: student['consentimientoFirmado'] ? Colors.green : Colors.red,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      student['consentimientoFirmado'] ? 'Consentimiento firmado' : 'Sin consentimiento',
                      style: TextStyle(
                        color: student['consentimientoFirmado'] ? Colors.green : Colors.red,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ],
            ),
            trailing: PopupMenuButton<String>(
              icon: const Icon(Icons.more_vert),
              onSelected: (value) {
                _handleMenuAction(value, student);
              },
              itemBuilder: (context) => [
                const PopupMenuItem<String>(
                  value: 'profile',
                  child: Text('Ver perfil'),
                ),
                const PopupMenuItem<String>(
                  value: 'documents',
                  child: Text('Documentos'),
                ),
                const PopupMenuItem<String>(
                  value: 'adjustments',
                  child: Text('Ajustes'),
                ),
                const PopupMenuItem<String>(
                  value: 'edit',
                  child: Text('Editar'),
                ),
              ],
            ),
            onTap: () {
              // Implementar navegación a perfil de estudiante
            },
          ),
        );
      },
    );
  }

  Widget _buildDesktopStudentTable() {
    return SingleChildScrollView(
      child: DataTable(
        columns: const [
          DataColumn(label: Text('Nombre')),
          DataColumn(label: Text('RUT')),
          DataColumn(label: Text('Carrera')),
          DataColumn(label: Text('Diagnóstico')),
          DataColumn(label: Text('Consentimiento')),
          DataColumn(label: Text('Ajustes')),
          DataColumn(label: Text('Acciones')),
        ],
        rows: filteredStudents.map((student) {
          return DataRow(
            cells: [
              DataCell(Text('${student['nombres']} ${student['apellidos']}')),
              DataCell(Text(student['rut'])),
              DataCell(Text(student['carrera'])),
              DataCell(Text(student['diagnostico'])),
              DataCell(
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      student['consentimientoFirmado'] ? Icons.check_circle : Icons.cancel,
                      size: 16,
                      color: student['consentimientoFirmado'] ? Colors.green : Colors.red,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      student['consentimientoFirmado'] ? 'Firmado' : 'Pendiente',
                      style: TextStyle(
                        color: student['consentimientoFirmado'] ? Colors.green : Colors.red,
                      ),
                    ),
                  ],
                ),
              ),
              DataCell(
                student['tieneAjustes']
                    ? const Chip(
                        label: Text('Activos'),
                        backgroundColor: Colors.green,
                        labelStyle: TextStyle(color: Colors.white),
                      )
                    : const Chip(
                        label: Text('Ninguno'),
                        backgroundColor: Colors.grey,
                        labelStyle: TextStyle(color: Colors.white),
                      ),
              ),
              DataCell(
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    IconButton(
                      icon: const Icon(Icons.visibility),
                      tooltip: 'Ver perfil',
                      onPressed: () {
                        _handleMenuAction('profile', student);
                      },
                    ),
                    IconButton(
                      icon: const Icon(Icons.description),
                      tooltip: 'Documentos',
                      onPressed: () {
                        _handleMenuAction('documents', student);
                      },
                    ),
                    IconButton(
                      icon: const Icon(Icons.settings_accessibility),
                      tooltip: 'Ajustes',
                      onPressed: () {
                        _handleMenuAction('adjustments', student);
                      },
                    ),
                    IconButton(
                      icon: const Icon(Icons.edit),
                      tooltip: 'Editar',
                      onPressed: () {
                        _handleMenuAction('edit', student);
                      },
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

  void _handleMenuAction(String action, Map<String, dynamic> student) {
    switch (action) {
      case 'profile':
        // Implementar navegación a perfil de estudiante
        break;
      case 'documents':
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => DocumentListScreen(studentId: student['id']),
          ),
        );
        break;
      case 'adjustments':
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => StudentAdjustmentsScreen(
              studentId: student['id'],
              studentName: '${student['nombres']} ${student['apellidos']}',
            ),
          ),
        );
        break;
      case 'edit':
        // Implementar edición de estudiante
        break;
    }
  }
}
