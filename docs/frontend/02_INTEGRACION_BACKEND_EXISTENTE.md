# 🔗 **INTEGRACIÓN CON BACKEND EXISTENTE UCN INCLUI2**
## Mapeo Frontend → Backend APIs Implementadas

### 📅 **Fecha**: Enero 2025
### 🎯 **Objetivo**: Mapeo específico frontend con APIs y funcionalidades del backend actual
### 📄 **Referencias**: API_DOCUMENTATION.md, API_REFERENCE.json, system-architecture.md

---

## 🏗️ **ARQUITECTURA DE INTEGRACIÓN**

### **🔄 Flujo de Datos Frontend ↔ Backend**
```typescript
Frontend (React + RTK Query) ←→ Backend (NestJS + MongoDB)
     ↓                                    ↓
[Redux Store]                        [Controllers]
     ↓                                    ↓
[RTK Query Cache] ←→ HTTP/WebSocket ←→ [Services]
     ↓                                    ↓
[UI Components]                      [Database]
```

---

## 🔐 **SISTEMA DE AUTENTICACIÓN**

### **🔑 Endpoints Backend Existentes**
```typescript
// Ya implementados en /auth
POST   /auth/login           // Login con email/password
GET    /auth/profile         // Perfil usuario autenticado
POST   /auth/refresh         // Renovar token JWT
POST   /auth/logout          // Cerrar sesión
GET    /auth/roles           // Información roles sistema
```

### **💻 Implementación Frontend**
```typescript
// Redux Store - Auth Slice
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

// RTK Query - Auth API
export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/auth',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    getProfile: builder.query<User, void>({
      query: () => '/profile',
    }),
    getRoles: builder.query<SystemRolesDto, void>({
      query: () => '/roles',
    }),
  }),
});
```

---

## 👥 **GESTIÓN DE USUARIOS**

### **🔑 Endpoints Backend Existentes**
```typescript
// Ya implementados en /users
GET    /users                    // Listar todos los usuarios
POST   /users                    // Crear nuevo usuario
GET    /users/:id                // Obtener usuario por ID
PATCH  /users/:id                // Actualizar usuario
DELETE /users/:id                // Eliminar usuario
GET    /users/me                 // Información usuario actual
PATCH  /users/me                 // Actualizar perfil propio
```

### **📋 Esquemas Backend (UserRole enum)**
```typescript
export enum UserRole {
  COORDINADOR = 'coordinador',
  EDUCADORA_SOCIAL = 'educadora_social', 
  DIDDEC_STAFF = 'diddec_staff',
  JEFE_CARRERA = 'jefe_carrera',
  JEFE_DEPARTAMENTO = 'jefe_departamento',
  DOCENTE = 'docente',
  ESTUDIANTE = 'estudiante'
}
```

### **💻 Implementación Frontend**
```typescript
// Types correspondientes al backend
interface User {
  _id: string;
  email: string;
  nombreCompleto: string;
  roles: UserRole[];
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  studentId?: string; // Si es estudiante
}

// RTK Query - Users API
export const usersApi = createApi({
  reducerPath: 'usersApi',
  baseQuery: authenticatedBaseQuery,
  tagTypes: ['User'],
  endpoints: (builder) => ({
    getUsers: builder.query<User[], void>({
      query: () => '/users',
      providesTags: ['User'],
    }),
    createUser: builder.mutation<User, CreateUserDto>({
      query: (newUser) => ({
        url: '/users',
        method: 'POST',
        body: newUser,
      }),
      invalidatesTags: ['User'],
    }),
    updateUser: builder.mutation<User, { id: string; data: UpdateUserDto }>({
      query: ({ id, data }) => ({
        url: `/users/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
  }),
});
```

---

## 🎓 **GESTIÓN DE ESTUDIANTES**

### **🔑 Endpoints Backend Existentes**
```typescript
// Ya implementados en /students
GET    /students                    // Listar estudiantes (Admin/Staff)
POST   /students                    // Crear estudiante
GET    /students/:id                // Obtener estudiante por ID
PATCH  /students/:id                // Actualizar estudiante
DELETE /students/:id                // Eliminar estudiante
GET    /students/me                 // Perfil estudiante actual
PATCH  /students/me                 // Actualizar perfil propio
```

### **📋 Esquema Backend (Student)**
```typescript
interface Student {
  _id: string;
  userId: ObjectId;           // Referencia a User
  rut: string;
  nombreCompleto: string;
  email: string;
  telefono?: string;
  carreraId: ObjectId;        // Referencia a Career
  añoIngreso: number;
  tipoNEE: string;
  fechaDiagnostico?: Date;
  documentosDiagnostico: string[];
  observaciones?: string;
  isActive: boolean;
}
```

### **💻 Implementación Frontend**
```typescript
// Types para el frontend
interface StudentFrontend extends Omit<Student, 'userId' | 'carreraId'> {
  user?: User;                // Populated user data
  carrera?: Career;          // Populated career data
  activeAdjustments?: Adjustment[]; // Ajustes activos
  consentStatus?: ConsentStatus;    // Estado consentimientos
}

// RTK Query - Students API
export const studentsApi = createApi({
  reducerPath: 'studentsApi',
  baseQuery: authenticatedBaseQuery,
  tagTypes: ['Student'],
  endpoints: (builder) => ({
    getStudents: builder.query<StudentFrontend[], void>({
      query: () => '/students',
      providesTags: ['Student'],
    }),
    getStudentProfile: builder.query<StudentFrontend, void>({
      query: () => '/students/me',
    }),
    createStudent: builder.mutation<Student, CreateStudentDto>({
      query: (studentData) => ({
        url: '/students',
        method: 'POST',
        body: studentData,
      }),
      invalidatesTags: ['Student'],
    }),
  }),
});
```

---

## 📋 **SISTEMA DE AJUSTES ACADÉMICOS**

### **🔑 Endpoints Backend Existentes**
```typescript
// Ya implementados en /adjustments
GET    /adjustments                    // Listar ajustes
POST   /adjustments                    // Crear ajuste
GET    /adjustments/:id                // Obtener ajuste por ID
PATCH  /adjustments/:id                // Actualizar ajuste
DELETE /adjustments/:id                // Eliminar ajuste
GET    /adjustments/student/:studentId  // Ajustes por estudiante
PATCH  /adjustments/:id/read           // Marcar como leído por docente
```

### **📋 Esquema Backend (Adjustment)**
```typescript
interface Adjustment {
  _id: string;
  studentId: ObjectId;
  studentRut: string;
  semester: string;
  currentAdjustments: Array<{
    type: string;              // Tipo de ajuste
    courseNrc: string;         // Código del curso
    description: string;       // Descripción detallada
    approvedBy: string;        // Quien aprobó
    approvedAt: Date;         // Cuándo se aprobó
    requiresSemesterConfirmation: boolean;
    expirationDate?: Date;
    isActive: boolean;
    readByTeachers: string[]; // Docentes que lo leyeron
  }>;
  createdBy: ObjectId;
  updatedBy?: ObjectId;
  observations?: string;
}
```

### **💻 Implementación Frontend**
```typescript
// RTK Query - Adjustments API
export const adjustmentsApi = createApi({
  reducerPath: 'adjustmentsApi',
  baseQuery: authenticatedBaseQuery,
  tagTypes: ['Adjustment'],
  endpoints: (builder) => ({
    getAdjustments: builder.query<Adjustment[], {
      studentId?: string;
      semester?: string;
    }>({
      query: (params) => ({
        url: '/adjustments',
        params,
      }),
      providesTags: ['Adjustment'],
    }),
    
    createAdjustment: builder.mutation<Adjustment, CreateAdjustmentDto>({
      query: (adjustmentData) => ({
        url: '/adjustments',
        method: 'POST',
        body: adjustmentData,
      }),
      invalidatesTags: ['Adjustment'],
    }),
    
    markAsRead: builder.mutation<void, string>({
      query: (adjustmentId) => ({
        url: `/adjustments/${adjustmentId}/read`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Adjustment'],
    }),
    
    getStudentAdjustments: builder.query<Adjustment[], string>({
      query: (studentId) => `/adjustments/student/${studentId}`,
      providesTags: ['Adjustment'],
    }),
  }),
});
```

---

## 📝 **SISTEMA DE CONSENTIMIENTOS**

### **🔑 Endpoints Backend Existentes**
```typescript
// Ya implementados en /consents
POST   /consents                    // Crear/actualizar consentimiento
GET    /consents/my-consent         // Ver consentimiento actual (estudiante)
PATCH  /consents/revoke             // Revocar consentimiento
GET    /consents/all               // Listar todos (admin)
GET    /consents/stats             // Estadísticas consentimientos
```

### **📋 Esquema Backend (Consent)**
```typescript
interface Consent {
  _id: string;
  studentId: ObjectId;
  allowsDataSharing: boolean;    // Clave: autoriza compartir datos
  consentDate: Date;
  studentRut: string;
  studentName: string;
  studentCareer: string;
  comments?: string;
  registeredBy: ObjectId;
  ipAddress?: string;
  userAgent?: string;
  isActive: boolean;
  revokedAt?: Date;
  revocationReason?: string;
}
```

### **💻 Implementación Frontend**
```typescript
// RTK Query - Consents API
export const consentsApi = createApi({
  reducerPath: 'consentsApi',
  baseQuery: authenticatedBaseQuery,
  tagTypes: ['Consent'],
  endpoints: (builder) => ({
    getMyConsent: builder.query<Consent, void>({
      query: () => '/consents/my-consent',
      providesTags: ['Consent'],
    }),
    
    createOrUpdateConsent: builder.mutation<Consent, {
      allowsDataSharing: boolean;
      comments?: string;
    }>({
      query: (consentData) => ({
        url: '/consents',
        method: 'POST',
        body: consentData,
      }),
      invalidatesTags: ['Consent'],
    }),
    
    revokeConsent: builder.mutation<void, { reason: string }>({
      query: (data) => ({
        url: '/consents/revoke',
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Consent'],
    }),
    
    getAllConsents: builder.query<Consent[], void>({
      query: () => '/consents/all',
      providesTags: ['Consent'],
    }),
  }),
});

// Hook personalizado para verificar permisos basados en consentimiento
export const useConsentPermissions = (studentId: string) => {
  const { user } = useAuth();
  const { data: consent } = consentsApi.useGetMyConsentQuery();
  
  return useMemo(() => ({
    canViewSensitiveData: () => {
      if (!user) return false;
      
      // Coordinador y Educadora Social: SIEMPRE
      if (user.roles.includes(UserRole.COORDINADOR) || 
          user.roles.includes(UserRole.EDUCADORA_SOCIAL)) {
        return true;
      }
      
      // Otros roles: solo con consentimiento
      return consent?.allowsDataSharing || false;
    },
    
    canViewDocuments: () => {
      if (!user) return false;
      
      // Solo Coordinador y Educadora Social, y solo con consentimiento
      const hasPermittedRole = user.roles.includes(UserRole.COORDINADOR) || 
                              user.roles.includes(UserRole.EDUCADORA_SOCIAL);
      
      return hasPermittedRole && (consent?.allowsDataSharing || false);
    },
    
    canViewAdjustments: () => {
      if (!user) return false;
      
      // Ajustes académicos: SIEMPRE visibles para staff docente
      return user.roles.some(role => [
        UserRole.COORDINADOR,
        UserRole.EDUCADORA_SOCIAL,
        UserRole.DOCENTE,
        UserRole.JEFE_CARRERA,
        UserRole.JEFE_DEPARTAMENTO
      ].includes(role));
    }
  }), [user, consent, studentId]);
};
```

---

## 📄 **GESTIÓN DE DOCUMENTOS**

### **🔑 Endpoints Backend Existentes**
```typescript
// Ya implementados en /documents
GET    /documents                    // Listar documentos
POST   /documents                    // Subir documento
GET    /documents/:id                // Obtener documento
PATCH  /documents/:id                // Actualizar documento
DELETE /documents/:id                // Eliminar documento
GET    /documents/student/:studentId // Documentos por estudiante
```

### **💻 Implementación Frontend**
```typescript
// RTK Query - Documents API con autorización automática
export const documentsApi = createApi({
  reducerPath: 'documentsApi',
  baseQuery: authenticatedBaseQuery,
  tagTypes: ['Document'],
  endpoints: (builder) => ({
    getDocuments: builder.query<Document[], { studentId?: string }>({
      query: (params) => ({
        url: '/documents',
        params,
      }),
      providesTags: ['Document'],
    }),
    
    uploadDocument: builder.mutation<Document, FormData>({
      query: (formData) => ({
        url: '/documents',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Document'],
    }),
    
    getStudentDocuments: builder.query<Document[], string>({
      query: (studentId) => `/documents/student/${studentId}`,
      providesTags: ['Document'],
    }),
  }),
});

// Componente de upload con validación de permisos
export const DocumentUploader: React.FC<{ studentId: string }> = ({ studentId }) => {
  const permissions = useConsentPermissions(studentId);
  const [uploadDocument] = documentsApi.useUploadDocumentMutation();
  
  const canUpload = permissions.canViewDocuments();
  
  if (!canUpload) {
    return <UnauthorizedMessage />;
  }
  
  // ... resto del componente
};
```

---

## 🔔 **SISTEMA DE NOTIFICACIONES**

### **🔑 Endpoints Backend Existentes**
```typescript
// Ya implementados en /notifications
GET    /notifications                // Listar notificaciones usuario
POST   /notifications                // Crear notificación
PATCH  /notifications/:id/read       // Marcar como leída
DELETE /notifications/:id            // Eliminar notificación
```

### **💻 Implementación Frontend con WebSocket**
```typescript
// WebSocket integration para notificaciones real-time
export const useNotifications = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  useEffect(() => {
    const token = store.getState().auth.token;
    const newSocket = io(process.env.REACT_APP_WS_URL || 'ws://localhost:3000', {
      auth: { token }
    });
    
    newSocket.on('notification', (notification: Notification) => {
      setNotifications(prev => [notification, ...prev]);
      
      // Toast automático según tipo
      if (notification.type === 'ADJUSTMENT_CREATED') {
        toast.info(`Nuevo ajuste creado para ${notification.studentName}`);
      } else if (notification.type === 'ADJUSTMENT_UPDATED') {
        toast.warning(`Ajuste actualizado: ${notification.message}`);
      }
    });
    
    setSocket(newSocket);
    return () => newSocket.close();
  }, []);
  
  return { notifications, socket };
};
```

---

## 📊 **REPORTES Y ANALYTICS**

### **🔑 Endpoints Backend Existentes**
```typescript
// Ya implementados en /diddec
GET    /diddec/reports              // Reportes DIDDEC
GET    /diddec/stats                // Estadísticas generales
POST   /diddec/export              // Exportar reportes Excel
```

### **💻 Implementación Frontend**
```typescript
// RTK Query - Reports API
export const reportsApi = createApi({
  reducerPath: 'reportsApi',
  baseQuery: authenticatedBaseQuery,
  endpoints: (builder) => ({
    getDIDDECReports: builder.query<Report[], void>({
      query: () => '/diddec/reports',
    }),
    
    getStats: builder.query<Statistics, void>({
      query: () => '/diddec/stats',
    }),
    
    exportToExcel: builder.mutation<Blob, ExportRequest>({
      query: (exportData) => ({
        url: '/diddec/export',
        method: 'POST',
        body: exportData,
        responseHandler: (response) => response.blob(),
      }),
    }),
  }),
});

// Hook para descarga de Excel
export const useExcelExport = () => {
  const [exportToExcel] = reportsApi.useExportToExcelMutation();
  
  const downloadExcel = async (exportData: ExportRequest) => {
    try {
      const blob = await exportToExcel(exportData).unwrap();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte_${new Date().toISOString().split('T')[0]}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error('Error al generar el reporte');
    }
  };
  
  return { downloadExcel };
};
```

---

## 🎯 **GUÍAS DE IMPLEMENTACIÓN POR ROL**

### **🔷 Dashboard Coordinador**
```typescript
const CoordinatorDashboard: React.FC = () => {
  // Usar múltiples APIs del backend
  const { data: users } = usersApi.useGetUsersQuery();
  const { data: students } = studentsApi.useGetStudentsQuery();
  const { data: adjustments } = adjustmentsApi.useGetAdjustmentsQuery({});
  const { data: consents } = consentsApi.useGetAllConsentsQuery();
  const { data: stats } = reportsApi.useGetStatsQuery();
  
  return (
    <Layout>
      <KPICards>
        <StatCard title="Total Estudiantes" value={students?.length || 0} />
        <StatCard title="Ajustes Activos" value={adjustments?.length || 0} />
        <StatCard title="Consentimientos" value={`${stats?.consentPercentage || 0}%`} />
      </KPICards>
      
      <RecentActivity>
        <AdjustmentsList adjustments={adjustments} />
        <ConsentOverview consents={consents} />
      </RecentActivity>
    </Layout>
  );
};
```

### **🔷 Dashboard Docente**
```typescript
const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  // Solo ajustes de estudiantes en cursos del docente
  const { data: myStudents } = studentsApi.useGetStudentsQuery();
  const { data: adjustments } = adjustmentsApi.useGetAdjustmentsQuery({
    teacherId: user?._id
  });
  
  return (
    <Layout>
      <MyCoursesSection />
      <StudentsWithAdjustments 
        students={myStudents} 
        adjustments={adjustments}
      />
      <QuickActions />
    </Layout>
  );
};
```

---

## 🔄 **SINCRONIZACIÓN CON BACKEND**

### **⚡ Cache Strategy**
```typescript
// Configuración RTK Query con cache inteligente
export const api = createApi({
  reducerPath: 'api',
  baseQuery: authenticatedBaseQuery,
  tagTypes: ['User', 'Student', 'Adjustment', 'Consent', 'Document'],
  
  // Cache por 5 minutos para datos frecuentes
  keepUnusedDataFor: 300,
  
  // Refetch automático en focus
  refetchOnFocus: true,
  
  // Invalidación inteligente
  endpoints: () => ({}),
});
```

### **🔔 Real-time Updates**
```typescript
// Integración WebSocket con el backend existente
const useRealTimeUpdates = () => {
  const dispatch = useAppDispatch();
  
  useEffect(() => {
    const socket = io('/notifications');
    
    socket.on('adjustmentCreated', (data) => {
      dispatch(api.util.invalidateTags(['Adjustment']));
      toast.info('Nuevo ajuste creado');
    });
    
    socket.on('consentUpdated', (data) => {
      dispatch(api.util.invalidateTags(['Consent']));
    });
    
    return () => socket.disconnect();
  }, [dispatch]);
};
```

---

## 🎯 **PRÓXIMOS PASOS DE IMPLEMENTACIÓN**

### **📅 Fase 1: Core Integration (2 semanas)**
- ✅ Setup Redux + RTK Query
- ✅ Implementar autenticación con backend existente
- ✅ CRUD básico estudiantes y ajustes
- ✅ Sistema de permisos basado en roles del backend

### **📅 Fase 2: Advanced Features (3 semanas)**
- ✅ Sistema de consentimientos completo
- ✅ Gestión de documentos con autorización
- ✅ Notificaciones real-time
- ✅ Dashboards específicos por rol

### **📅 Fase 3: Optimization (1 semana)**
- ✅ Performance optimization
- ✅ Error handling robusto
- ✅ Testing integration con backend
- ✅ Deploy coordinado

---

**🔗 Integración Backend Completa** | **📅 Versión**: 1.0 | **🎯 Estado**: LISTO PARA IMPLEMENTACIÓN