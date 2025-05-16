class Document {
  final String? id;
  final String fileName;
  final String uploadDate;
  final String type;
  final String status;
  final String? studentId;
  final String? fileUrl;
  final String? fileNameOriginal;
  final String? description;
  final String? category;
  final String? verifiedBy;
  final String? verificationDate;
  final String? comments;
  
  // Propiedades adicionales para compatibilidad con el código existente
  String get nombre => fileNameOriginal ?? fileName;
  String get fechaSubida => uploadDate;
  String get tipo => type;
  String get estado => status;
  String get url => fileUrl ?? '';

  Document({
    this.id,
    required this.fileName,
    required this.uploadDate,
    required this.type,
    required this.status,
    this.studentId,
    this.fileUrl,
    this.fileNameOriginal,
    this.description,
    this.category,
    this.verifiedBy,
    this.verificationDate,
    this.comments,
  });
  
  // Constructor alternativo que usa los nombres en español
  Document.fromSpanish({
    this.id,
    required String nombre,
    required String fechaSubida,
    required String tipo,
    required String estado,
    this.studentId,
    this.fileUrl,
    this.fileNameOriginal,
    this.description,
    this.category,
    this.verifiedBy,
    this.verificationDate,
    this.comments,
  }) : fileName = nombre,
       uploadDate = fechaSubida,
       type = tipo,
       status = estado;

  factory Document.fromJson(Map<String, dynamic> json) {
    return Document(
      id: json['_id'] ?? json['id'],
      fileName: json['fileName'] ?? '',
      uploadDate: json['uploadDate'] ?? '',
      type: json['documentType'] ?? json['type'] ?? '',
      status: json['status'] ?? 'PENDIENTE',
      studentId: json['studentId'],
      fileUrl: json['fileUrl'],
      fileNameOriginal: json['fileNameOriginal'],
      description: json['description'],
      category: json['category'],
      verifiedBy: json['verifiedBy'],
      verificationDate: json['verificationDate'],
      comments: json['comments'],
    );
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = {
      'fileName': fileName,
      'documentType': type,
      'status': status,
    };

    if (id != null) data['id'] = id;
    if (studentId != null) data['studentId'] = studentId;
    if (fileUrl != null) data['fileUrl'] = fileUrl;
    if (fileNameOriginal != null) data['fileNameOriginal'] = fileNameOriginal;
    if (description != null) data['description'] = description;
    if (category != null) data['category'] = category;
    if (uploadDate.isNotEmpty) data['uploadDate'] = uploadDate;

    return data;
  }

  bool get isVerified => status.toUpperCase() == 'VERIFICADO' || status.toUpperCase() == 'VERIFIED';
  bool get isPending => status.toUpperCase() == 'PENDIENTE' || status.toUpperCase() == 'PENDING';
  bool get isRejected => status.toUpperCase() == 'RECHAZADO' || status.toUpperCase() == 'REJECTED';
}
