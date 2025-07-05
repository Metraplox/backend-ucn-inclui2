import 'package:flutter/material.dart';
import 'package:incluye_app/utils/responsive_utils.dart';

class DocumentListScreen extends StatefulWidget {
  final String? studentId;

  const DocumentListScreen({super.key, this.studentId});

  @override
  DocumentListScreenState createState() => DocumentListScreenState();
}

class DocumentListScreenState extends State<DocumentListScreen> {
  bool isLoading = true;
  List<Map<String, dynamic>> documents = [];

  @override
  void initState() {
    super.initState();
    _loadDocuments();
  }

  Future<void> _loadDocuments() async {
    // Aquí se implementará la carga de documentos desde la API
    // Por ahora, usamos datos de ejemplo
    await Future.delayed(const Duration(milliseconds: 800));
    
    setState(() {
      documents = [
        {
          "id": "1",
          "fileName": "consentimiento_firmado.pdf",
          "uploadDate": "2025-04-10",
          "type": "consent",
          "status": "verified"
        },
        {
          "id": "2",
          "fileName": "certificado_medico.pdf",
          "uploadDate": "2025-03-15",
          "type": "medicalCertificate",
          "status": "pending"
        },
      ];
      isLoading = false;
    });
  }

  String _getDocumentTypeText(String type) {
    switch (type) {
      case 'consent':
        return 'Consentimiento';
      case 'medicalCertificate':
        return 'Certificado Médico';
      case 'academicReport':
        return 'Informe Académico';
      case 'adjustmentRequest':
        return 'Solicitud de Ajuste';
      default:
        return 'Otro';
    }
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'verified':
        return Colors.green;
      case 'pending':
        return Colors.orange;
      case 'rejected':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    final isMobile = ResponsiveUtils.isMobile(context);
    final padding = ResponsiveUtils.getPadding(context);
    
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.studentId != null 
          ? 'Documentos del Estudiante' 
          : 'Gestión de Documentos'),
        actions: [
          IconButton(
            icon: const Icon(Icons.filter_list),
            tooltip: 'Filtrar documentos',
            onPressed: () {
              // Implementar filtrado
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
                  // Sección de botones de acción
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      ElevatedButton.icon(
                        icon: const Icon(Icons.upload_file),
                        label: const Text('Subir Documento'),
                        onPressed: () {
                          // Implementar subida de documento
                        },
                      ),
                      ElevatedButton.icon(
                        icon: const Icon(Icons.download),
                        label: const Text('Descargar Plantilla'),
                        onPressed: () {
                          // Implementar descarga de plantilla
                        },
                      ),
                      if (widget.studentId == null)
                        OutlinedButton.icon(
                          icon: const Icon(Icons.settings),
                          label: const Text('Configurar Categorías'),
                          onPressed: () {
                            // Implementar configuración de categorías
                          },
                        ),
                    ],
                  ),
                  
                  const SizedBox(height: 16),
                  
                  // Tabla de documentos
                  Expanded(
                    child: Card(
                      elevation: 2,
                      child: documents.isEmpty
                          ? const Center(
                              child: Text('No hay documentos disponibles'),
                            )
                          : isMobile
                              ? _buildMobileDocumentList()
                              : _buildDesktopDocumentTable(),
                    ),
                  ),
                ],
              ),
            ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          // Implementar acción de agregar documento
        },
        tooltip: 'Agregar Documento',
        child: const Icon(Icons.add),
      ),
    );
  }

  Widget _buildMobileDocumentList() {
    return ListView.separated(
      itemCount: documents.length,
      separatorBuilder: (context, index) => const Divider(),
      itemBuilder: (context, index) {
        final doc = documents[index];
        return ListTile(
          leading: Icon(
            doc['type'] == 'consent' ? Icons.verified : Icons.description,
            color: _getStatusColor(doc['status']),
          ),
          title: Text(doc['fileName']),
          subtitle: Text('${_getDocumentTypeText(doc['type'])} - ${doc['uploadDate']}'),
          trailing: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              IconButton(
                icon: const Icon(Icons.visibility),
                tooltip: 'Ver documento',
                onPressed: () {
                  // Implementar visualización de documento
                },
              ),
              IconButton(
                icon: const Icon(Icons.more_vert),
                tooltip: 'Más opciones',
                onPressed: () {
                  _showDocumentOptions(doc);
                },
              ),
            ],
          ),
          onTap: () {
            // Implementar acción al tocar el documento
          },
        );
      },
    );
  }

  Widget _buildDesktopDocumentTable() {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: DataTable(
        columns: const [
          DataColumn(label: Text('Nombre')),
          DataColumn(label: Text('Tipo')),
          DataColumn(label: Text('Fecha')),
          DataColumn(label: Text('Estado')),
          DataColumn(label: Text('Acciones')),
        ],
        rows: documents.map((doc) {
          return DataRow(
            cells: [
              DataCell(Text(doc['fileName'])),
              DataCell(Text(_getDocumentTypeText(doc['type']))),
              DataCell(Text(doc['uploadDate'])),
              DataCell(
                Chip(
                  label: Text(
                    doc['status'] == 'verified'
                        ? 'Verificado'
                        : doc['status'] == 'pending'
                            ? 'Pendiente'
                            : 'Rechazado',
                  ),
                  backgroundColor: _getStatusColor(doc['status']).withValues(alpha: 51),  // 0.2 * 255 ≈ 51
                  labelStyle: TextStyle(color: _getStatusColor(doc['status'])),
                ),
              ),
              DataCell(
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    IconButton(
                      icon: const Icon(Icons.visibility),
                      tooltip: 'Ver documento',
                      onPressed: () {
                        // Implementar visualización de documento
                      },
                    ),
                    IconButton(
                      icon: const Icon(Icons.download),
                      tooltip: 'Descargar documento',
                      onPressed: () {
                        // Implementar descarga de documento
                      },
                    ),
                    IconButton(
                      icon: const Icon(Icons.verified_user),
                      tooltip: 'Verificar documento',
                      onPressed: doc['status'] != 'verified' ? () {
                        // Implementar verificación de documento
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

  void _showDocumentOptions(Map<String, dynamic> document) {
    showModalBottomSheet(
      context: context,
      builder: (context) {
        return SafeArea(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              ListTile(
                leading: const Icon(Icons.visibility),
                title: const Text('Ver documento'),
                onTap: () {
                  Navigator.pop(context);
                  // Implementar visualización de documento
                },
              ),
              ListTile(
                leading: const Icon(Icons.download),
                title: const Text('Descargar documento'),
                onTap: () {
                  Navigator.pop(context);
                  // Implementar descarga de documento
                },
              ),
              if (document['status'] != 'verified')
                ListTile(
                  leading: const Icon(Icons.verified_user),
                  title: const Text('Verificar documento'),
                  onTap: () {
                    Navigator.pop(context);
                    // Implementar verificación de documento
                  },
                ),
              ListTile(
                leading: const Icon(Icons.delete),
                title: const Text('Eliminar documento'),
                onTap: () {
                  Navigator.pop(context);
                  // Implementar eliminación de documento
                },
              ),
            ],
          ),
        );
      },
    );
  }
}
