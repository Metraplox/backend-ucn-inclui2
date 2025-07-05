import 'package:flutter/material.dart';

class EditAdjustmentDialog extends StatefulWidget {
  final Map<String, dynamic>? initialData;
  final void Function(Map<String, dynamic>) onSaved;

  const EditAdjustmentDialog({
    this.initialData,
    required this.onSaved,
    super.key,
  });

  @override
  State<EditAdjustmentDialog> createState() => _EditAdjustmentDialogState();
}

class _EditAdjustmentDialogState extends State<EditAdjustmentDialog> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _cursoController;
  late TextEditingController _tipoController;
  late TextEditingController _aprobadoPorController;
  late TextEditingController _fechaAprobacionController;
  late TextEditingController _vencimientoController;

  @override
  void initState() {
    super.initState();
    _cursoController = TextEditingController(
      text: widget.initialData?['curso'] ?? '',
    );
    _tipoController = TextEditingController(
      text: widget.initialData?['tipo'] ?? '',
    );
    _aprobadoPorController = TextEditingController(
      text: widget.initialData?['aprobadoPor'] ?? '',
    );
    _fechaAprobacionController = TextEditingController(
      text: widget.initialData?['fechaAprobacion'] ?? '',
    );
    _vencimientoController = TextEditingController(
      text: widget.initialData?['vencimiento'] ?? '',
    );
  }

  @override
  void dispose() {
    _cursoController.dispose();
    _tipoController.dispose();
    _aprobadoPorController.dispose();
    _fechaAprobacionController.dispose();
    _vencimientoController.dispose();
    super.dispose();
  }

  void _submit() {
    if (_formKey.currentState!.validate()) {
      widget.onSaved({
        'curso': _cursoController.text.trim(),
        'tipo': _tipoController.text.trim(),
        'aprobadoPor': _aprobadoPorController.text.trim(),
        'fechaAprobacion': _fechaAprobacionController.text.trim(),
        'vencimiento': _vencimientoController.text.trim(),
      });
    }
  }

  Future<void> _pickDate(TextEditingController controller) async {
    final date = await showDatePicker(
      context: context,
      initialDate: DateTime.tryParse(controller.text) ?? DateTime.now(),
      firstDate: DateTime(2000),
      lastDate: DateTime(2100),
    );
    if (date != null) {
      controller.text = date.toIso8601String().split('T').first;
    }
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text(
        widget.initialData == null ? 'Agregar Ajuste' : 'Editar Ajuste',
      ),
      content: SingleChildScrollView(
        child: Form(
          key: _formKey,
          child: Column(
            children: [
              TextFormField(
                controller: _cursoController,
                decoration: const InputDecoration(labelText: 'Curso (NRC)'),
                validator:
                    (v) =>
                        (v == null || v.isEmpty)
                            ? 'Ingrese el NRC del curso'
                            : null,
              ),
              TextFormField(
                controller: _tipoController,
                decoration: const InputDecoration(labelText: 'Tipo de Ajuste'),
                validator:
                    (v) =>
                        (v == null || v.isEmpty)
                            ? 'Ingrese el tipo de ajuste'
                            : null,
              ),
              TextFormField(
                controller: _aprobadoPorController,
                decoration: const InputDecoration(
                  labelText: 'Aprobado Por (Email)',
                ),
                validator:
                    (v) =>
                        (v == null || v.isEmpty)
                            ? 'Ingrese quién aprobó'
                            : null,
              ),
              TextFormField(
                controller: _fechaAprobacionController,
                decoration: const InputDecoration(
                  labelText: 'Fecha de Aprobación',
                  suffixIcon: Icon(Icons.calendar_today),
                ),
                readOnly: true,
                onTap: () => _pickDate(_fechaAprobacionController),
                validator:
                    (v) =>
                        (v == null || v.isEmpty)
                            ? 'Ingrese la fecha de aprobación'
                            : null,
              ),
              TextFormField(
                controller: _vencimientoController,
                decoration: const InputDecoration(
                  labelText: 'Fecha de Vencimiento',
                  suffixIcon: Icon(Icons.calendar_today),
                ),
                readOnly: true,
                onTap: () => _pickDate(_vencimientoController),
                validator:
                    (v) =>
                        (v == null || v.isEmpty)
                            ? 'Ingrese la fecha de vencimiento'
                            : null,
              ),
            ],
          ),
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(context).pop(),
          child: const Text('Cancelar'),
        ),
        ElevatedButton(
          onPressed: () {
            _submit();
          },
          child: const Text('Guardar'),
        ),
      ],
    );
  }
}
