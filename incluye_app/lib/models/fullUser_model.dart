class FullUser {
  final String id;
  final String email;
  final String? passwordHash;
  final List<String> roles;
  final String nombreCompleto;
  final bool isActive;
  final AdditionalResponsibilities additionalResponsibilities;
  final bool isProfileComplete;
  final DateTime createdAt;
  final DateTime updatedAt;

  FullUser({
    required this.id,
    required this.email,
    this.passwordHash,
    required this.roles,
    required this.nombreCompleto,
    required this.isActive,
    required this.additionalResponsibilities,
    required this.isProfileComplete,
    required this.createdAt,
    required this.updatedAt,
  });

  factory FullUser.fromJson(Map<String, dynamic> json) {
    return FullUser(
      id: json['_id'] ?? '', // ✅ CORREGIDO: Valor por defecto si el ID es nulo
      email: json['email'] ?? '', // ✅ CORREGIDO: Valor por defecto si el email es nulo
      passwordHash: json['password_hash'],
      roles: List<String>.from(json['roles'] ?? []), // ✅ CORREGIDO: Lista vacía si 'roles' es nulo
      nombreCompleto: json['nombreCompleto'] ?? 'Sin Nombre', // ✅ CORREGIDO: Valor por defecto
      isActive: json['isActive'] ?? true, // ✅ CORREGIDO: Default a 'true' si es nulo
      additionalResponsibilities: AdditionalResponsibilities.fromJson(
        json['additionalResponsibilities'] ?? {}, // ✅ CORREGIDO: Objeto vacío si es nulo
      ),
      isProfileComplete: json['isProfileComplete'] ?? false, // ✅ CORREGIDO: Default a 'false' si es nulo
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }

  Map<String, dynamic> toJson() => {
        // Enviar solo lo necesario para una actualización PATCH.
        // El backend debería ignorar campos que no puede cambiar.
        if (id.isNotEmpty) '_id': id,
        'email': email,
        if (passwordHash != null) 'password_hash': passwordHash,
        'roles': roles,
        'nombreCompleto': nombreCompleto,
        'isActive': isActive,
        'additionalResponsibilities': additionalResponsibilities.toJsonForUpdate(), // Usamos un método específico
        'isProfileComplete': isProfileComplete,
        // No se suelen enviar createdAt y updatedAt
      };
}

class AdditionalResponsibilities {
  final bool isDepartmentHead;
  final bool isCareerHead;
  final bool isDIDDECStaff;
  final List<String> departmentIds;
  final List<String> careerIds;
  final String? id; // El ID puede no estar siempre, lo hacemos opcional.

  AdditionalResponsibilities({
    required this.isDepartmentHead,
    required this.isCareerHead,
    required this.isDIDDECStaff,
    required this.departmentIds,
    required this.careerIds,
    this.id,
  });

  factory AdditionalResponsibilities.fromJson(Map<String, dynamic> json) {
    return AdditionalResponsibilities(
      isDepartmentHead: json['isDepartmentHead'] ?? false, // ✅ CORREGIDO
      isCareerHead: json['isCareerHead'] ?? false,         // ✅ CORREGIDO
      isDIDDECStaff: json['isDIDDECStaff'] ?? false,        // ✅ CORREGIDO
      departmentIds: List<String>.from(json['departmentIds'] ?? []), // ✅ CORREGIDO
      careerIds: List<String>.from(json['careerIds'] ?? []),       // ✅ CORREGIDO
      id: json['_id'], // Puede ser null, está bien.
    );
  }

  // toJson para la lectura
  Map<String, dynamic> toJson() => {
        'isDepartmentHead': isDepartmentHead,
        'isCareerHead': isCareerHead,
        'isDIDDECStaff': isDIDDECStaff,
        'departmentIds': departmentIds,
        'careerIds': careerIds,
        if (id != null) '_id': id,
      };

  // Un toJson específico para enviar en una actualización, sin el _id del subdocumento.
  Map<String, dynamic> toJsonForUpdate() => {
        'isDepartmentHead': isDepartmentHead,
        'isCareerHead': isCareerHead,
        'isDIDDECStaff': isDIDDECStaff,
        'departmentIds': departmentIds,
        'careerIds': careerIds,
        // No incluimos el _id porque no se debe actualizar directamente.
      };
}

// Extensión copyWith para FullUser
extension FullUserCopyWith on FullUser {
  FullUser copyWith({
    String? id,
    String? email,
    String? passwordHash,
    List<String>? roles,
    String? nombreCompleto,
    bool? isActive,
    AdditionalResponsibilities? additionalResponsibilities,
    bool? isProfileComplete,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return FullUser(
      id: id ?? this.id,
      email: email ?? this.email,
      passwordHash: passwordHash ?? this.passwordHash,
      roles: roles ?? List<String>.from(this.roles),
      nombreCompleto: nombreCompleto ?? this.nombreCompleto,
      isActive: isActive ?? this.isActive,
      additionalResponsibilities:
          additionalResponsibilities ?? this.additionalResponsibilities,
      isProfileComplete: isProfileComplete ?? this.isProfileComplete,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}

// Extensión copyWith para AdditionalResponsibilities
extension AdditionalResponsibilitiesCopyWith on AdditionalResponsibilities {
  AdditionalResponsibilities copyWith({
    bool? isDepartmentHead,
    bool? isCareerHead,
    bool? isDIDDECStaff,
    List<String>? departmentIds,
    List<String>? careerIds,
    String? id,
  }) {
    return AdditionalResponsibilities(
      isDepartmentHead: isDepartmentHead ?? this.isDepartmentHead,
      isCareerHead: isCareerHead ?? this.isCareerHead,
      isDIDDECStaff: isDIDDECStaff ?? this.isDIDDECStaff,
      departmentIds: departmentIds ?? List<String>.from(this.departmentIds),
      careerIds: careerIds ?? List<String>.from(this.careerIds),
      id: id ?? this.id,
    );
  }
}