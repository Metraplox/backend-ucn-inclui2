import 'package:flutter/material.dart';
import 'package:incluye_app/utils/responsive_utils.dart';

class DocumentTemplatesScreen extends StatefulWidget {
  const DocumentTemplatesScreen({super.key});

  @override
  DocumentTemplatesScreenState createState() => DocumentTemplatesScreenState();
}

class DocumentTemplatesScreenState extends State<DocumentTemplatesScreen> {
  bool isLoading = true;
  List<Map<String, dynamic>> templates = [];
  
  @override
  void initState() {
    super.initState();
    _loadTemplates();
  }

  Future<void> _loadTemplates() async {
    // Simulación de carga de datos
    await Future.delayed(const Duration(milliseconds: 800));
    
    setState(() {
      templates = [
        {
          "id": "1",
          "name": "Consentimiento Informado",
          "description": "Documento de consentimiento informado para estudiantes",
          "category": "Consentimiento",
          "version": "2.1",
          "lastUpdated": "2025-01-15",
          "fileType": "PDF",
          "isActive": true,
        },
        {
          "id": "2",
          "name": "Solicitud de Ajustes Razonables",
          "description": "Formulario para solicitar ajustes razonables",
          "category": "Ajustes",
          "version": "1.3",
          "lastUpdated": "2025-02-20",
          "fileType": "DOCX",
          "isActive": true,
        },
        {
          "id": "3",
          "name": "Certificado Médico",
          "description": "Plantilla para certificados médicos",
          "category": "Médico",
          "version": "1.0",
          "lastUpdated": "2025-03-10",
          "fileType": "PDF",
          "isActive": true,
        },
        {
          "id": "4",
          "name": "Informe de Evaluación",
          "description": "Plantilla para informes de evaluación de necesidades",
          "category": "Evaluación",
          "version": "2.0",
          "lastUpdated": "2025-04-05",
          "fileType": "DOCX",
          "isActive": true,
        },
        {
          "id": "5",
          "name": "Consentimiento Informado (Antiguo)",
          "description": "Versión anterior del documento de consentimiento",
          "category": "Consentimiento",
          "version": "1.0",
          "lastUpdated": "2024-06-10",
          "fileType": "PDF",
          "isActive": false,
        },
      ];
      isLoading = false;
    });
  }

  void _uploadNewTemplate() {
    showDialog(
      context: context,
      builder: (context) {
        String templateName = '';
        String templateDescription = '';
        String selectedCategory = 'Consentimiento';
        
        return StatefulBuilder(
          builder: (context, setState) {
            return AlertDialog(
              title: const Text('Subir Nueva Plantilla'),
              content: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    TextField(
                      decoration: const InputDecoration(
                        labelText: 'Nombre de la Plantilla',
                        border: OutlineInputBorder(),
                      ),
                      onChanged: (value) {
                        templateName = value;
                      },
                    ),
                    
                    const SizedBox(height: 16),
                    
                    TextField(
                      decoration: const InputDecoration(
                        labelText: 'Descripción',
                        border: OutlineInputBorder(),
                      ),
                      maxLines: 3,
                      onChanged: (value) {
                        templateDescription = value;
                      },
                    ),
                    
                    const SizedBox(height: 16),
                    
                    DropdownButtonFormField<String>(
                      decoration: const InputDecoration(
                        labelText: 'Categoría',
                        border: OutlineInputBorder(),
                      ),
                      value: selectedCategory,
                      items: const [
                        DropdownMenuItem<String>(
                          value: 'Consentimiento',
                          child: Text('Consentimiento'),
                        ),
                        DropdownMenuItem<String>(
                          value: 'Ajustes',
                          child: Text('Ajustes'),
                        ),
                        DropdownMenuItem<String>(
                          value: 'Médico',
                          child: Text('Médico'),
                        ),
                        DropdownMenuItem<String>(
                          value: 'Evaluación',
                          child: Text('Evaluación'),
                        ),
                        DropdownMenuItem<String>(
                          value: 'Otro',
                          child: Text('Otro'),
                        ),
                      ],
                      onChanged: (value) {
                        setState(() {
                          selectedCategory = value!;
                        });
                      },
                    ),
                    
                    const SizedBox(height: 16),
                    
                    ElevatedButton.icon(
                      icon: const Icon(Icons.upload_file),
                      label: const Text('Seleccionar Archivo'),
                      onPressed: () {
                        // Aquí se implementaría la selección de archivo
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
                    // Validación básica
                    if (templateName.isEmpty) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('Por favor ingrese un nombre para la plantilla'),
                        ),
                      );
                      return;
                    }
                    
                    // Aquí se implementaría la subida del archivo
                    Navigator.of(context).pop();
                    
                    // Simulación de éxito
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Plantilla subida correctamente'),
                      ),
                    );
                    
                    // Actualizar la lista
                    setState(() {
                      templates.add({
                        "id": "${templates.length + 1}",
                        "name": templateName,
                        "description": templateDescription,
                        "category": selectedCategory,
                        "version": "1.0",
                        "lastUpdated": DateTime.now().toString().substring(0, 10),
                        "fileType": "PDF",
                        "isActive": true,
                      });
                    });
                  },
                  child: const Text('Subir'),
                ),
              ],
            );
          },
        );
      },
    );
  }

  void _viewTemplateDetails(Map<String, dynamic> template) {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: Text(template['name']),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Descripción: ${template['description']}'),
              const SizedBox(height: 8),
              Text('Categoría: ${template['category']}'),
              const SizedBox(height: 8),
              Text('Versión: ${template['version']}'),
              const SizedBox(height: 8),
              Text('Última actualización: ${template['lastUpdated']}'),
              const SizedBox(height: 8),
              Text('Tipo de archivo: ${template['fileType']}'),
              const SizedBox(height: 8),
              Text('Estado: ${template['isActive'] ? 'Activo' : 'Inactivo'}'),
              const SizedBox(height: 16),
              const Text(
                'Historial de Versiones:',
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              if (template['version'] != '1.0')
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Versión 1.0 - ${_getRandomPastDate(template['lastUpdated'])}'),
                    if (template['version'] == '2.1' || template['version'] == '2.0')
                      Text('Versión 1.5 - ${_getRandomPastDate(template['lastUpdated'])}'),
                    if (template['version'] == '2.1')
                      Text('Versión 2.0 - ${_getRandomPastDate(template['lastUpdated'])}'),
                  ],
                )
              else
                const Text('No hay versiones anteriores'),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.of(context).pop();
              },
              child: const Text('Cerrar'),
            ),
            ElevatedButton.icon(
              icon: const Icon(Icons.download),
              label: const Text('Descargar'),
              onPressed: () {
                Navigator.of(context).pop();
                
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('Descargando ${template['name']}...'),
                  ),
                );
              },
            ),
          ],
        );
      },
    );
  }

  String _getRandomPastDate(String currentDate) {
    final current = DateTime.parse(currentDate);
    final daysToSubtract = 30 + (DateTime.now().millisecondsSinceEpoch % 90);
    final pastDate = current.subtract(Duration(days: daysToSubtract.toInt()));
    return pastDate.toString().substring(0, 10);
  }

  @override
  Widget build(BuildContext context) {
    final isMobile = ResponsiveUtils.isMobile(context);
    final padding = ResponsiveUtils.getPadding(context);
    
    return Scaffold(
      appBar: AppBar(
        title: const Text('Plantillas de Documentos'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            tooltip: 'Actualizar',
            onPressed: () {
              setState(() {
                isLoading = true;
              });
              _loadTemplates();
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
                  // Información y botones de acción
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Plantillas de Documentos',
                            style: Theme.of(context).textTheme.titleLarge,
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'Gestione las plantillas de documentos utilizadas en el sistema. Puede subir nuevas plantillas, actualizar las existentes o descargarlas para su uso.',
                            style: Theme.of(context).textTheme.bodyMedium,
                          ),
                          const SizedBox(height: 16),
                          Wrap(
                            spacing: 8,
                            runSpacing: 8,
                            children: [
                              ElevatedButton.icon(
                                icon: const Icon(Icons.upload_file),
                                label: const Text('Subir Nueva Plantilla'),
                                onPressed: _uploadNewTemplate,
                              ),
                              OutlinedButton.icon(
                                icon: const Icon(Icons.category),
                                label: const Text('Gestionar Categorías'),
                                onPressed: () {
                                  // Implementar gestión de categorías
                                },
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                  
                  const SizedBox(height: 16),
                  
                  // Lista de plantillas
                  Expanded(
                    child: isMobile
                        ? _buildMobileTemplateList()
                        : _buildDesktopTemplateTable(),
                  ),
                ],
              ),
            ),
    );
  }

  Widget _buildMobileTemplateList() {
    return ListView.builder(
      itemCount: templates.length,
      itemBuilder: (context, index) {
        final template = templates[index];
        return Card(
          margin: const EdgeInsets.only(bottom: 8),
          child: ListTile(
            title: Text(
              template['name'],
              style: TextStyle(
                color: template['isActive'] ? null : Colors.grey,
              ),
            ),
            subtitle: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Categoría: ${template['category']}'),
                Text('Versión: ${template['version']} - ${template['lastUpdated']}'),
                Row(
                  children: [
                    Icon(
                      template['isActive'] ? Icons.check_circle : Icons.cancel,
                      size: 16,
                      color: template['isActive'] ? Colors.green : Colors.red,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      template['isActive'] ? 'Activo' : 'Inactivo',
                      style: TextStyle(
                        color: template['isActive'] ? Colors.green : Colors.red,
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
                _handleMenuAction(value, template);
              },
              itemBuilder: (context) => [
                const PopupMenuItem<String>(
                  value: 'view',
                  child: Text('Ver Detalles'),
                ),
                const PopupMenuItem<String>(
                  value: 'download',
                  child: Text('Descargar'),
                ),
                const PopupMenuItem<String>(
                  value: 'update',
                  child: Text('Actualizar'),
                ),
                PopupMenuItem<String>(
                  value: template['isActive'] ? 'deactivate' : 'activate',
                  child: Text(template['isActive'] ? 'Desactivar' : 'Activar'),
                ),
              ],
            ),
            onTap: () {
              _viewTemplateDetails(template);
            },
          ),
        );
      },
    );
  }

  Widget _buildDesktopTemplateTable() {
    return SingleChildScrollView(
      child: DataTable(
        columns: const [
          DataColumn(label: Text('Nombre')),
          DataColumn(label: Text('Categoría')),
          DataColumn(label: Text('Versión')),
          DataColumn(label: Text('Última Actualización')),
          DataColumn(label: Text('Tipo')),
          DataColumn(label: Text('Estado')),
          DataColumn(label: Text('Acciones')),
        ],
        rows: templates.map((template) {
          return DataRow(
            cells: [
              DataCell(
                Text(
                  template['name'],
                  style: TextStyle(
                    color: template['isActive'] ? null : Colors.grey,
                  ),
                ),
              ),
              DataCell(Text(template['category'])),
              DataCell(Text(template['version'])),
              DataCell(Text(template['lastUpdated'])),
              DataCell(Text(template['fileType'])),
              DataCell(
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      template['isActive'] ? Icons.check_circle : Icons.cancel,
                      size: 16,
                      color: template['isActive'] ? Colors.green : Colors.red,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      template['isActive'] ? 'Activo' : 'Inactivo',
                      style: TextStyle(
                        color: template['isActive'] ? Colors.green : Colors.red,
                      ),
                    ),
                  ],
                ),
              ),
              DataCell(
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    IconButton(
                      icon: const Icon(Icons.visibility),
                      tooltip: 'Ver Detalles',
                      onPressed: () {
                        _handleMenuAction('view', template);
                      },
                    ),
                    IconButton(
                      icon: const Icon(Icons.download),
                      tooltip: 'Descargar',
                      onPressed: () {
                        _handleMenuAction('download', template);
                      },
                    ),
                    IconButton(
                      icon: const Icon(Icons.update),
                      tooltip: 'Actualizar',
                      onPressed: () {
                        _handleMenuAction('update', template);
                      },
                    ),
                    IconButton(
                      icon: Icon(
                        template['isActive'] ? Icons.unpublished : Icons.check_circle_outline,
                        color: template['isActive'] ? Colors.red : Colors.green,
                      ),
                      tooltip: template['isActive'] ? 'Desactivar' : 'Activar',
                      onPressed: () {
                        _handleMenuAction(
                          template['isActive'] ? 'deactivate' : 'activate',
                          template,
                        );
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

  void _handleMenuAction(String action, Map<String, dynamic> template) {
    switch (action) {
      case 'view':
        _viewTemplateDetails(template);
        break;
      case 'download':
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Descargando ${template['name']}...'),
          ),
        );
        break;
      case 'update':
        // Implementar actualización de plantilla
        break;
      case 'activate':
        setState(() {
          template['isActive'] = true;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('${template['name']} activado correctamente'),
          ),
        );
        break;
      case 'deactivate':
        setState(() {
          template['isActive'] = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('${template['name']} desactivado correctamente'),
          ),
        );
        break;
    }
  }
}
