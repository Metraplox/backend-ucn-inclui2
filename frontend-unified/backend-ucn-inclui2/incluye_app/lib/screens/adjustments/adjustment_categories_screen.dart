import 'package:flutter/material.dart';
import 'package:incluye_app/utils/responsive_utils.dart';

class AdjustmentCategoriesScreen extends StatefulWidget {
  const AdjustmentCategoriesScreen({super.key});

  @override
  AdjustmentCategoriesScreenState createState() => AdjustmentCategoriesScreenState();
}

class AdjustmentCategoriesScreenState extends State<AdjustmentCategoriesScreen> {
  bool isLoading = true;
  List<Map<String, dynamic>> categories = [];

  @override
  void initState() {
    super.initState();
    _loadCategories();
  }

  Future<void> _loadCategories() async {
    // Simulación de carga de datos
    await Future.delayed(const Duration(milliseconds: 800));
    
    setState(() {
      categories = [
        {
          "id": "1",
          "name": "Tiempo adicional en evaluaciones",
          "description": "Otorgar tiempo adicional para completar evaluaciones (generalmente 50% más).",
          "isActive": true,
        },
        {
          "id": "2",
          "name": "Material en formato accesible",
          "description": "Proporcionar material de estudio en formatos accesibles (audio, digital, etc).",
          "isActive": true,
        },
        {
          "id": "3",
          "name": "Ubicación preferencial",
          "description": "Asignar ubicación preferencial en el aula para mejorar visibilidad o acceso.",
          "isActive": true,
        },
        {
          "id": "4",
          "name": "Uso de tecnología asistiva",
          "description": "Permitir el uso de tecnologías de asistencia durante clases y evaluaciones.",
          "isActive": false,
        },
      ];
      isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    final isMobile = ResponsiveUtils.isMobile(context);
    final padding = ResponsiveUtils.getPadding(context);
    
    return Scaffold(
      appBar: AppBar(
        title: const Text('Categorías de Ajustes Razonables'),
        actions: [
          IconButton(
            icon: const Icon(Icons.help_outline),
            tooltip: 'Ayuda',
            onPressed: () {
              // Mostrar ayuda
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
                  // Botones de acción
                  Row(
                    children: [
                      ElevatedButton.icon(
                        icon: const Icon(Icons.add),
                        label: const Text('Nueva Categoría'),
                        onPressed: () {
                          _showAddEditCategoryDialog();
                        },
                      ),
                      const SizedBox(width: 8),
                      OutlinedButton.icon(
                        icon: const Icon(Icons.import_export),
                        label: const Text('Importar/Exportar'),
                        onPressed: () {
                          // Implementar importación/exportación
                        },
                      ),
                    ],
                  ),
                  
                  const SizedBox(height: 16),
                  
                  // Lista de categorías
                  Expanded(
                    child: Card(
                      elevation: 2,
                      child: categories.isEmpty
                          ? const Center(
                              child: Text('No hay categorías disponibles'),
                            )
                          : isMobile
                              ? _buildMobileCategoriesList()
                              : _buildDesktopCategoriesTable(),
                    ),
                  ),
                ],
              ),
            ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          _showAddEditCategoryDialog();
        },
        tooltip: 'Agregar Categoría',
        child: const Icon(Icons.add),
      ),
    );
  }

  Widget _buildMobileCategoriesList() {
    return ListView.separated(
      itemCount: categories.length,
      separatorBuilder: (context, index) => const Divider(),
      itemBuilder: (context, index) {
        final category = categories[index];
        return ListTile(
          title: Text(category['name']),
          subtitle: Text(
            category['description'],
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
          trailing: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Switch(
                value: category['isActive'],
                onChanged: (value) {
                  setState(() {
                    categories[index]['isActive'] = value;
                  });
                },
              ),
              IconButton(
                icon: const Icon(Icons.edit),
                onPressed: () {
                  _showAddEditCategoryDialog(category: category);
                },
              ),
            ],
          ),
          onTap: () {
            _showAddEditCategoryDialog(category: category);
          },
        );
      },
    );
  }

  Widget _buildDesktopCategoriesTable() {
    return SingleChildScrollView(
      child: DataTable(
        columns: const [
          DataColumn(label: Text('Nombre')),
          DataColumn(label: Text('Descripción')),
          DataColumn(label: Text('Estado')),
          DataColumn(label: Text('Acciones')),
        ],
        rows: categories.map((category) {
          return DataRow(
            cells: [
              DataCell(Text(category['name'])),
              DataCell(
                Text(
                  category['description'],
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              DataCell(
                Switch(
                  value: category['isActive'],
                  onChanged: (value) {
                    setState(() {
                      category['isActive'] = value;
                    });
                  },
                ),
              ),
              DataCell(
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    IconButton(
                      icon: const Icon(Icons.edit),
                      tooltip: 'Editar categoría',
                      onPressed: () {
                        _showAddEditCategoryDialog(category: category);
                      },
                    ),
                    IconButton(
                      icon: const Icon(Icons.delete),
                      tooltip: 'Eliminar categoría',
                      onPressed: () {
                        _showDeleteConfirmationDialog(category);
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

  void _showAddEditCategoryDialog({Map<String, dynamic>? category}) {
    final isEditing = category != null;
    final nameController = TextEditingController(text: isEditing ? category['name'] : '');
    final descriptionController = TextEditingController(text: isEditing ? category['description'] : '');
    bool isActive = isEditing ? category['isActive'] : true;

    showDialog(
      context: context,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setState) {
            return AlertDialog(
              title: Text(isEditing ? 'Editar Categoría' : 'Nueva Categoría'),
              content: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    TextField(
                      controller: nameController,
                      decoration: const InputDecoration(
                        labelText: 'Nombre',
                        border: OutlineInputBorder(),
                      ),
                    ),
                    const SizedBox(height: 16),
                    TextField(
                      controller: descriptionController,
                      decoration: const InputDecoration(
                        labelText: 'Descripción',
                        border: OutlineInputBorder(),
                      ),
                      maxLines: 3,
                    ),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        const Text('Activo'),
                        const Spacer(),
                        Switch(
                          value: isActive,
                          onChanged: (value) {
                            setState(() {
                              isActive = value;
                            });
                          },
                        ),
                      ],
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
                    // Implementar guardado de categoría
                    Navigator.of(context).pop();
                    
                    // Actualizar la lista (simulación)
                    if (isEditing) {
                      setState(() {
                        category['name'] = nameController.text;
                        category['description'] = descriptionController.text;
                        category['isActive'] = isActive;
                      });
                    } else {
                      setState(() {
                        categories.add({
                          "id": DateTime.now().millisecondsSinceEpoch.toString(),
                          "name": nameController.text,
                          "description": descriptionController.text,
                          "isActive": isActive,
                        });
                      });
                    }
                  },
                  child: Text(isEditing ? 'Guardar' : 'Crear'),
                ),
              ],
            );
          },
        );
      },
    );
  }

  void _showDeleteConfirmationDialog(Map<String, dynamic> category) {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Eliminar Categoría'),
          content: Text('¿Está seguro que desea eliminar la categoría "${category['name']}"?'),
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
                // Implementar eliminación de categoría
                setState(() {
                  categories.removeWhere((item) => item['id'] == category['id']);
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
