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
      id: json['_id'],
      email: json['email'],
      passwordHash: json['password_hash'],
      roles: List<String>.from(json['roles']),
      nombreCompleto: json['nombreCompleto'],
      isActive: json['isActive'],
      additionalResponsibilities: AdditionalResponsibilities.fromJson(
        json['additionalResponsibilities'],
      ),
      isProfileComplete: json['isProfileComplete'],
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }

  Map<String, dynamic> toJson() => {
    '_id': id,
    'email': email,
    'password_hash': passwordHash,
    'roles': roles,
    'nombreCompleto': nombreCompleto,
    'isActive': isActive,
    'additionalResponsibilities': additionalResponsibilities.toJson(),
    'isProfileComplete': isProfileComplete,
    'createdAt': createdAt.toIso8601String(),
    'updatedAt': updatedAt.toIso8601String(),
  };
}

class AdditionalResponsibilities {
  final bool isDepartmentHead;
  final bool isCareerHead;
  final bool isDIDDECStaff;
  final List<String> departmentIds;
  final List<String> careerIds;
  final String id;

  AdditionalResponsibilities({
    required this.isDepartmentHead,
    required this.isCareerHead,
    required this.isDIDDECStaff,
    required this.departmentIds,
    required this.careerIds,
    required this.id,
  });

  factory AdditionalResponsibilities.fromJson(Map<String, dynamic> json) {
    return AdditionalResponsibilities(
      isDepartmentHead: json['isDepartmentHead'],
      isCareerHead: json['isCareerHead'],
      isDIDDECStaff: json['isDIDDECStaff'],
      departmentIds: List<String>.from(json['departmentIds']),
      careerIds: List<String>.from(json['careerIds']),
      id: json['_id'],
    );
  }

  Map<String, dynamic> toJson() => {
    'isDepartmentHead': isDepartmentHead,
    'isCareerHead': isCareerHead,
    'isDIDDECStaff': isDIDDECStaff,
    'departmentIds': departmentIds,
    'careerIds': careerIds,
    '_id': id,
  };
}

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
