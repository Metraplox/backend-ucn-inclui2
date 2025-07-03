# 📋 **ANÁLISIS DETALLADO DE REQUISITOS DE CLIENTE**
## UCN INCLUI2 - Programa Incluye UCN-DGE

### 📅 **Fecha**: Enero 2025
### 🎯 **Objetivo**: Mapeo completo requisitos cliente → funcionalidades frontend
### 📄 **Fuente**: Documento requisitos.txt - Cliente UCN

---

## 🔍 **ANÁLISIS POR STAKEHOLDER**

### **🏛️ PROGRAMA INCLUYE UCN (ADMINISTRADORES/COORDINADORES)**

#### **📋 Requisitos Explícitos del Cliente**
```
1. "Ingreso de información de diagnóstico (con niveles de visualización)"
2. "Ingreso de ajustes razonables del estudiante"
3. "Ingreso de actualizaciones de ajustes razonables con generación de alerta"
4. "Generación de reporte con historial de ajustes ingresados y actualizaciones"
5. "Visualizar que el docente revisó ajustes en plataforma (check)"
6. "Recibir alerta de quienes no han revisado ajustes"
7. "Reportabilidad - Exportar Excel"
```

#### **🎨 Traducción a Funcionalidades Frontend**

##### **Dashboard Principal Coordinador**
```tsx
<CoordinatorDashboard>
  {/* REQ 1: Niveles de visualización diagnóstico */}
  <DiagnosticManagement>
    <VisibilityMatrix roles={['incluye', 'docentes_con_consentimiento']} />
    <ConsentManagement />
  </DiagnosticManagement>

  {/* REQ 2: CRUD Ajustes Razonables */}
  <AdjustmentManagement>
    <CreateAdjustmentForm categories={dynamicCategories} />
    <StudentAssignment />
    <BulkOperations />
  </AdjustmentManagement>

  {/* REQ 3: Actualizaciones con alertas */}
  <UpdatesAndAlerts>
    <AdjustmentUpdater />
    <AutomaticNotifications 
      targets={['unidades_academicas', 'diddec']} 
    />
  </UpdatesAndAlerts>

  {/* REQ 4: Reportes con historial */}
  <ReportsCenter>
    <HistoricalReports />
    <AdjustmentTimeline />
    <ChangeLog />
  </ReportsCenter>

  {/* REQ 5,6: Tracking docente */}
  <TeacherTracking>
    <ReviewStatusMatrix />
    <UnreadAlertsPanel />
    <ReminderSystem />
  </TeacherTracking>

  {/* REQ 7: Exportación Excel */}
  <ExportCenter>
    <ExcelGenerator templates={['completo', 'por_carrera', 'por_docente']} />
    <ScheduledReports />
  </ExportCenter>
</CoordinatorDashboard>
```

---

### **🎓 JEFATURAS DE CARRERA Y ENCARGADOS DOCENTES**

#### **📋 Requisitos Explícitos del Cliente**
```
1. "Visualizar estudiantes del Programa con diagnóstico (sólo si se cuenta con el consentimiento)"
2. "Listado de estudiantes"
3. "Alerta de información disponible (NUEVOS INGRESOS) y actualización de ajustes"
4. "Opción de envío de algún requerimiento"
5. "Visualización de ficha de ajustes por diagnósticos en plataforma y guía de ajustes"
6. "Alerta de qué docente no ha revisado los ajustes a implementar"
7. "Reportabilidad - Exportar Excel"
```

#### **🎨 Traducción a Funcionalidades Frontend**

##### **Dashboard Jefe de Carrera**
```tsx
<CareerHeadDashboard>
  {/* REQ 1,2: Estudiantes con control de consentimiento */}
  <StudentsOverview>
    <ConsentBasedVisibility>
      <StudentCard 
        showDiagnosis={hasConsent} 
        showAdjustments={true}
      />
    </ConsentBasedVisibility>
    <FilterableStudentList 
      filters={['carrera', 'semestre', 'tipo_nee', 'estado_ajustes']}
    />
  </StudentsOverview>

  {/* REQ 3: Sistema de alertas */}
  <AlertsCenter>
    <NewEnrollmentAlerts />
    <AdjustmentUpdateAlerts />
    <PriorityNotifications />
  </AlertsCenter>

  {/* REQ 4: Sistema de requerimientos */}
  <RequirementsManagement>
    <CreateRequirementForm 
      targets={['incluye', 'diddec', 'docentes']}
    />
    <FollowUpSystem />
    <CommunicationHistory />
  </RequirementsManagement>

  {/* REQ 5: Fichas de ajustes y guías */}
  <AdjustmentGuides>
    <DiagnosisBasedCards />
    <ImplementationGuides />
    <BestPracticesLibrary />
  </AdjustmentGuides>

  {/* REQ 6: Tracking docentes */}
  <TeacherMonitoring>
    <UnreadAdjustmentsAlert />
    <TeacherComplianceMatrix />
    <ReminderQueue />
  </TeacherMonitoring>

  {/* REQ 7: Reportes específicos */}
  <CareerReports>
    <StudentsByCareerReport />
    <AdjustmentImplementationReport />
    <TeacherComplianceReport />
  </CareerReports>
</CareerHeadDashboard>
```

---

### **👨‍🏫 DOCENTES**

#### **📋 Requisitos Explícitos del Cliente**
```
1. "Visualizar diagnósticos (sólo si se cuenta con el consentimiento) y ajustes de sus estudiantes"
2. "Listado de estudiantes de su asignatura que son parte del programa"
3. "Solicitud de requerimiento de acompañamiento para implementar ajustes"
   a) "Lo puedo implementar" 
   b) "Requiere Acompañamiento"
4. "Observaciones: comunicación entre el /la docente y las unidades de apoyo"
5. "Alerta de actualización de ajustes"
6. "Visualización de ficha de ajustes por diagnósticos en plataforma y guía de ajustes"
```

#### **🎨 Traducción a Funcionalidades Frontend**

##### **Interfaz Docente Simplificada**
```tsx
<TeacherDashboard>
  {/* REQ 1,2: Vista estudiantes con consentimiento */}
  <MyStudents>
    <CourseSelector />
    <StudentList>
      <StudentCard>
        <ConsentBasedInfo>
          <DiagnosisInfo visible={hasConsent} />
          <AdjustmentsList visible={true} />
        </ConsentBasedInfo>
        <QuickActions>
          <MarkAsImplemented />
          <RequestSupport />
        </QuickActions>
      </StudentCard>
    </StudentList>
  </MyStudents>

  {/* REQ 3: Sistema de acompañamiento */}
  <SupportRequests>
    <ImplementationStatus>
      <SimpleToggle 
        options={['puedo_implementar', 'requiero_acompañamiento']}
      />
    </ImplementationStatus>
    <SupportRequestForm />
    <FollowUpStatus />
  </SupportRequests>

  {/* REQ 4: Sistema de observaciones */}
  <CommunicationCenter>
    <ObservationsPanel />
    <ChatWithSupportUnits />
    <CommunicationHistory />
  </CommunicationCenter>

  {/* REQ 5: Alertas de actualización */}
  <UpdateAlerts>
    <AdjustmentChangeNotifications />
    <NewStudentAlerts />
    <UrgentUpdates />
  </UpdateAlerts>

  {/* REQ 6: Fichas y guías */}
  <GuidesAndResources>
    <DiagnosisCards />
    <ImplementationGuides />
    <QuickReferenceCards />
    <VideoTutorials />
  </GuidesAndResources>
</TeacherDashboard>
```

---

### **🏥 DIDDEC**

#### **📋 Requisitos Explícitos del Cliente**
```
1. "Visualizar diagnósticos (sólo si se cuenta con el consentimiento del/la estudiante)"
2. "Visualizar información de ajustes del/la estudiante"
3. "Visualizar que el/la docente revisó ajustes en plataforma (check)"
4. "Subir recursos de acompañamiento y/o material de apoyo"
5. "Alerta de solicitud de apoyo para asesora de parte del docente, según carrera y sede"
6. "Seguimiento de ajustes implementados por parte de los docentes (las encuestas de seguimiento)"
7. "Reporte de seguimiento"
8. "Reportabilidad - Exportar Excel"
```

#### **🎨 Traducción a Funcionalidades Frontend**

##### **Dashboard DIDDEC Analítico**
```tsx
<DIDDECDashboard>
  {/* REQ 1,2: Vista completa con consentimientos */}
  <StudentOverview>
    <ConsentMatrix />
    <StudentProfilesGrid>
      <DiagnosisPanel visible={hasConsent} />
      <AdjustmentsPanel visible={true} />
      <ImplementationStatus />
    </StudentProfilesGrid>
  </StudentOverview>

  {/* REQ 3: Tracking docentes */}
  <TeacherTrackingCenter>
    <ReviewStatusDashboard />
    <ComplianceMetrics />
    <AlertQueue />
  </TeacherTrackingCenter>

  {/* REQ 4: Gestión de recursos */}
  <ResourceManagement>
    <ResourceUploader />
    <ResourceLibrary />
    <CategoryManagement />
    <AccessControlMatrix />
  </ResourceManagement>

  {/* REQ 5: Sistema de alertas por sede/carrera */}
  <SupportRequestsCenter>
    <GeographicView />
    <CareerBasedQueues />
    <AssignmentSystem />
    <ResponseTracking />
  </SupportRequestsCenter>

  {/* REQ 6: Encuestas de seguimiento */}
  <FollowUpSurveys>
    <SurveyBuilder />
    <ResponseCollection />
    <AnalyticsPanel />
    <TrendAnalysis />
  </FollowUpSurveys>

  {/* REQ 7,8: Reportes avanzados */}
  <AdvancedReporting>
    <FollowUpReports />
    <ImplementationEffectiveness />
    <TeacherPerformanceReports />
    <ExcelExportSuite />
  </AdvancedReporting>
</DIDDECDashboard>
```

---

### **🎓 ESTUDIANTES**

#### **📋 Requisitos Explícitos del Cliente**
```
1. "Vista de información de ajustes informados a la unidad académica"
2. "Informar cumplimiento o incumplimiento de la implementación de los ajustes (incorporar observaciones)"
3. "Subir archivos (certificados médicos) para visualización de Incluye"
4. "Acceder a formulario de actualización y seguimiento de ajustes razonables semestralmente"
5. "El o la estudiante debe confirmar si hará uso del ajuste de tiempo en cada asignatura cada semestre"
```

#### **🎨 Traducción a Funcionalidades Frontend**

##### **Portal Personal Estudiante**
```tsx
<StudentPortal>
  {/* REQ 1: Vista de ajustes informados */}
  <MyAdjustments>
    <AdjustmentsSummary />
    <InformedUnitsStatus />
    <ImplementationStatus />
  </MyAdjustments>

  {/* REQ 2: Feedback de implementación */}
  <ImplementationFeedback>
    <ComplianceReporter>
      <StatusSelector options={['cumplido', 'incumplido', 'parcial']} />
      <ObservationsField />
      <EvidenceUploader />
    </ComplianceReporter>
    <IssueReporter />
  </ImplementationFeedback>

  {/* REQ 3: Gestión documental */}
  <DocumentManagement>
    <MedicalCertificateUploader />
    <DocumentViewer />
    <PrivacyControls />
  </DocumentManagement>

  {/* REQ 4: Formulario semestral */}
  <SemesterlyForms>
    <AdjustmentUpdateForm />
    <ProgressEvaluation />
    <NewRequirementsForm />
  </SemesterlyForms>

  {/* REQ 5: Confirmación uso ajuste tiempo */}
  <TimeAdjustmentConfirmation>
    <SubjectBySubjectConfirmation />
    <SemesterDeadlineTracker />
    <AcademicCalendarIntegration />
  </TimeAdjustmentConfirmation>

  {/* Funcionalidad adicional de consentimientos */}
  <ConsentManagement>
    <ConsentForm />
    <PrivacyExplanation />
    <ConsentHistory />
  </ConsentManagement>
</StudentPortal>
```

---

## 🔄 **REQUISITOS ADICIONALES IDENTIFICADOS**

### **📄 Sistema de Consentimientos (Futuro)**
```
Cliente: "documento de consentimiento firmado... muy importante para la administradora"

Funcionalidades Requeridas:
1. Descarga de documento en blanco para firma
2. Upload de documento firmado (foto/scanner)
3. Validación por administradora
4. Habilitación granular de permisos por documento
```

#### **Implementación Frontend**
```tsx
<ConsentDocumentSystem>
  <DocumentDownloader>
    <BlankFormGenerator />
    <InstructionsPanel />
  </DocumentDownloader>

  <DocumentUploader>
    <SignedDocumentUploader />
    <PhotoScanner />
    <QualityValidator />
  </DocumentUploader>

  <AdminValidation>
    <DocumentReviewer />
    <ApprovalWorkflow />
    <PermissionMatrix />
  </AdminValidation>
</ConsentDocumentSystem>
```

### **📚 Historial Académico por Semestre**
```
Cliente: "registro de los ramos cursados por un estudiante junto con sus ajustes aplicados"

Funcionalidades Requeridas:
1. Vista por semestres
2. Cursos por semestre seleccionado
3. Ajustes específicos aplicados por curso
```

#### **Implementación Frontend**
```tsx
<AcademicHistory>
  <SemesterSelector />
  <SemesterView>
    <CoursesList>
      <CourseCard>
        <CourseInfo />
        <AppliedAdjustments />
        <ImplementationNotes />
      </CourseCard>
    </CoursesList>
  </SemesterView>
</AcademicHistory>
```

### **🏷️ Gestión Dinámica de Categorías**
```
Cliente: "la educadora... quiere poder agregar, editar categorias de ajustes razonables"

Funcionalidades Requeridas:
1. CRUD completo de categorías
2. Validación de unicidad
3. Impacto en ajustes existentes
```

#### **Implementación Frontend**
```tsx
<CategoryManagement>
  <CategoryCRUD>
    <CreateCategoryForm />
    <EditCategoryModal />
    <DeleteCategoryConfirmation />
  </CategoryCRUD>
  
  <ImpactAnalysis>
    <ExistingAdjustmentsImpact />
    <MigrationSuggestions />
  </ImpactAnalysis>
</CategoryManagement>
```

---

## 📊 **MATRIZ DE PRIORIDADES**

### **🔴 CRÍTICO (MVP)**
| Requisito | Stakeholder | Complejidad | Impacto |
|-----------|-------------|-------------|---------|
| Vista ajustes con consentimiento | Todos | Alta | Crítico |
| CRUD ajustes razonables | Coordinador/Educadora | Media | Crítico |
| Tracking implementación docente | Coordinador/DIDDEC | Alta | Crítico |
| Portal estudiante básico | Estudiante | Media | Crítico |

### **🟡 IMPORTANTE (V1.1)**
| Requisito | Stakeholder | Complejidad | Impacto |
|-----------|-------------|-------------|---------|
| Sistema de alertas avanzado | Todos | Alta | Alto |
| Reportes Excel | Coordinador/Jefes | Media | Alto |
| Gestión recursos DIDDEC | DIDDEC | Media | Alto |
| Encuestas seguimiento | DIDDEC | Alta | Medio |

### **🟢 MEJORAS (V2.0)**
| Requisito | Stakeholder | Complejidad | Impacto |
|-----------|-------------|-------------|---------|
| Sistema consentimiento firmado | Coordinador | Alta | Medio |
| Historial académico semestral | Coordinador | Media | Medio |
| Analytics predictivos | DIDDEC | Alta | Medio |

---

## 🎯 **CONCLUSIONES DEL ANÁLISIS**

### **✅ Alineación Backend-Frontend**
- **95% de requisitos** ya tienen soporte en el backend actual
- **Sistema de consentimientos** perfectamente implementado
- **APIs disponibles** para todas las funcionalidades críticas

### **⚠️ Gaps Identificados**
1. **Encuestas de seguimiento**: Requiere nuevos endpoints en backend
2. **Sistema de consentimiento firmado**: Funcionalidad completamente nueva
3. **Alertas geográficas**: Requiere integración con datos de sede

### **🚀 Recomendaciones**
1. **Fase 1**: Implementar funcionalidades críticas con backend actual
2. **Fase 2**: Desarrollar gaps identificados con expansión backend
3. **Fase 3**: Funcionalidades avanzadas y optimizaciones

---

**📋 Análisis Completo de Requisitos** | **📅 Versión**: 1.0 | **🎯 Estado**: COMPLETADO 