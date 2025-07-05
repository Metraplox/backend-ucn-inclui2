import 'package:flutter/material.dart';
import 'package:incluye_app/models/department_model.dart';
import 'package:incluye_app/models/career_model.dart';
import 'package:incluye_app/models/fullUser_model.dart';
import 'package:incluye_app/services/department_service.dart';
import 'package:incluye_app/services/career_service.dart';
import 'package:incluye_app/services/user_service.dart';

class EditUserDialog extends StatefulWidget {
  final FullUser user;
  final Function(FullUser) onUpdated;

  const EditUserDialog({
    required this.user,
    required this.onUpdated,
    super.key,
  });

  @override
  State<EditUserDialog> createState() => _EditUserDialogState();
}

class _EditUserDialogState extends State<EditUserDialog> {
  final _formKey = GlobalKey<FormState>();

  bool _listEquals<T>(List<T> a, List<T> b) {
    if (a.length != b.length) return false;
    final aSorted = [...a]..sort();
    final bSorted = [...b]..sort();
    for (int i = 0; i < aSorted.length; i++) {
      if (aSorted[i] != bSorted[i]) return false;
    }
    return true;
  }

  late TextEditingController _nombreCompletoController;
  late TextEditingController _emailController;
  bool _isActive = false;

  // Additional responsibilities
  bool _isDepartmentHead = false;
  bool _isCareerHead = false;
  bool _isDIDDECStaff = false;

  List<String> _selectedDepartmentIds = [];
  List<String> _selectedCareerIds = [];

  List<Department> _availableDepartments = [];
  List<Career> _availableCareers = [];

  bool _isLoadingData = true;

  @override
  void initState() {
    super.initState();
    _nombreCompletoController = TextEditingController(
      text: widget.user.nombreCompleto,
    );
    _emailController = TextEditingController(text: widget.user.email);
    _isActive = widget.user.isActive;

    _isDepartmentHead = widget.user.additionalResponsibilities.isDepartmentHead;
    _isCareerHead = widget.user.additionalResponsibilities.isCareerHead;
    _isDIDDECStaff = widget.user.additionalResponsibilities.isDIDDECStaff;

    _selectedDepartmentIds = List<String>.from(
      widget.user.additionalResponsibilities.departmentIds,
    );
    _selectedCareerIds = List<String>.from(
      widget.user.additionalResponsibilities.careerIds,
    );

    _loadDepartmentsAndCareers();
  }

  Future<void> _loadDepartmentsAndCareers() async {
    try {
      final departments = await DepartmentService.getDepartments();
      final careers = await CareerService.getAllCareers();
      if (!mounted) return;
      setState(() {
        _availableDepartments = departments;
        _availableCareers = careers;
        _isLoadingData = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() => _isLoadingData = false);
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Error cargando datos: $e')));
    }
  }

  void _toggleDepartmentSelection(String id) {
    setState(() {
      if (_selectedDepartmentIds.contains(id)) {
        _selectedDepartmentIds.remove(id);
      } else {
        _selectedDepartmentIds.add(id);
      }
    });
  }

  void _toggleCareerSelection(String id) {
    setState(() {
      if (_selectedCareerIds.contains(id)) {
        _selectedCareerIds.remove(id);
      } else {
        _selectedCareerIds.add(id);
      }
    });
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;

    final nombreActual = _nombreCompletoController.text.trim();
    final emailActual = _emailController.text.trim();
    final original = widget.user;
    final originalResponsibilities = original.additionalResponsibilities;

    final noChanges =
        nombreActual == original.nombreCompleto &&
        emailActual == original.email &&
        _isActive == original.isActive &&
        _isDepartmentHead == originalResponsibilities.isDepartmentHead &&
        _isCareerHead == originalResponsibilities.isCareerHead &&
        _isDIDDECStaff == originalResponsibilities.isDIDDECStaff &&
        _listEquals(
          _selectedDepartmentIds,
          originalResponsibilities.departmentIds,
        ) &&
        _listEquals(_selectedCareerIds, originalResponsibilities.careerIds);
    if (noChanges) {
      Navigator.of(context).pop();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('No se realizaron cambios.'),
          backgroundColor: Colors.grey,
        ),
      );
      return;
    }

    final updatedUser = widget.user.copyWith(
      nombreCompleto: _nombreCompletoController.text.trim(),
      email: _emailController.text.trim(),
      isActive: _isActive,
      additionalResponsibilities: widget.user.additionalResponsibilities
          .copyWith(
            isDepartmentHead: _isDepartmentHead,
            isCareerHead: _isCareerHead,
            isDIDDECStaff: _isDIDDECStaff,
            departmentIds: _selectedDepartmentIds,
            careerIds: _selectedCareerIds,
          ),
    );

    // Simulamos los dos casos para que el análisis vea que ambos se usan:
    bool success = await UserService.updateUser(updatedUser.id, updatedUser);
    // Aleatorio

    if (!mounted) return;

    if (success) {
      widget.onUpdated(updatedUser);
      Navigator.of(context).pop();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Usuario actualizado correctamente')),
      );
      return;
    }

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Error al actualizar usuario'),
        backgroundColor: Colors.red,
      ),
    );
  }

  @override
  void dispose() {
    _nombreCompletoController.dispose();
    _emailController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Editar Usuario'),
      content:
          _isLoadingData
              ? const SizedBox(
                height: 150,
                child: Center(child: CircularProgressIndicator()),
              )
              : SizedBox(
                width: double.maxFinite,
                child: Form(
                  key: _formKey,
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Expanded(
                        child: ListView(
                          shrinkWrap: true,
                          children: [
                            TextFormField(
                              controller: _nombreCompletoController,
                              decoration: const InputDecoration(
                                labelText: 'Nombre completo',
                              ),
                              validator:
                                  (value) =>
                                      (value == null || value.trim().isEmpty)
                                          ? 'Campo requerido'
                                          : null,
                            ),
                            TextFormField(
                              controller: _emailController,
                              decoration: const InputDecoration(
                                labelText: 'Email',
                              ),
                              validator: (value) {
                                if (value == null || value.trim().isEmpty) {
                                  return 'Campo requerido';
                                }
                                final emailRegex = RegExp(
                                  r'^[^@]+@[^@]+\.[^@]+',
                                );
                                if (!emailRegex.hasMatch(value.trim())) {
                                  return 'Email inválido';
                                }
                                return null;
                              },
                            ),
                            const SizedBox(height: 16),
                            SwitchListTile(
                              title: const Text('Activo'),
                              value: _isActive,
                              onChanged:
                                  (val) => setState(() => _isActive = val),
                            ),
                            const Divider(),
                            const Text(
                              'Responsabilidades adicionales:',
                              style: TextStyle(fontWeight: FontWeight.bold),
                            ),
                            SwitchListTile(
                              title: const Text('Jefe de Departamento'),
                              value: _isDepartmentHead,
                              onChanged:
                                  (val) =>
                                      setState(() => _isDepartmentHead = val),
                            ),
                            SwitchListTile(
                              title: const Text('Jefe de Carrera'),
                              value: _isCareerHead,
                              onChanged:
                                  (val) => setState(() => _isCareerHead = val),
                            ),
                            SwitchListTile(
                              title: const Text('Personal DIDDEC'),
                              value: _isDIDDECStaff,
                              onChanged:
                                  (val) => setState(() => _isDIDDECStaff = val),
                            ),
                            const SizedBox(height: 12),
                            Text(
                              'Departamentos asignados:',
                              style: Theme.of(context).textTheme.titleMedium,
                            ),
                            SizedBox(
                              height: 120,
                              child: ListView(
                                shrinkWrap: true,
                                children:
                                    _availableDepartments.map((dept) {
                                      final selected = _selectedDepartmentIds
                                          .contains(dept.id);
                                      return CheckboxListTile(
                                        title: Text(dept.name),
                                        value: selected,
                                        onChanged: (bool? val) {
                                          _toggleDepartmentSelection(dept.id);
                                        },
                                      );
                                    }).toList(),
                              ),
                            ),
                            const SizedBox(height: 12),
                            Text(
                              'Carreras asignadas:',
                              style: Theme.of(context).textTheme.titleMedium,
                            ),
                            SizedBox(
                              height: 120,
                              child: ListView(
                                shrinkWrap: true,
                                children:
                                    _availableCareers.map((career) {
                                      final selected = _selectedCareerIds
                                          .contains(career.id);
                                      return CheckboxListTile(
                                        title: Text(career.name),
                                        value: selected,
                                        onChanged: (bool? val) {
                                          _toggleCareerSelection(career.id);
                                        },
                                      );
                                    }).toList(),
                              ),
                            ),
                          ],
                        ),
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
          onPressed: _isLoadingData ? null : _save,
          child: const Text('Guardar'),
        ),
      ],
    );
  }
}
