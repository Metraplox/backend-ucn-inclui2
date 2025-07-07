// lib/screens/info/faq_screen.dart

import 'package:flutter/material.dart';
import 'package:incluye_app/models/faq_item_model.dart';
import 'package:incluye_app/services/student_service.dart';

class FaqScreen extends StatefulWidget {
  const FaqScreen({super.key});

  @override
  State<FaqScreen> createState() => _FaqScreenState();
}

class _FaqScreenState extends State<FaqScreen> {
  bool _isLoading = true;
  bool _hasAccess = false;

  // Aquí definimos la lista de preguntas y respuestas utilizando el modelo
  final List<FaqItem> _faqList = [
    FaqItem(
      question: '1. ¿Qué es el programa Incluye UCN?',
      answer: 'Es un programa de la universidad católica del norte cuyo objetivo es atender las diversas necesidades de tipo social, psicológicas y socioeducativas de los/as estudiantes con discapacidad o necesidades educativas que ingresan a la universidad, con el fin de favorecer un adecuado desenvolvimiento y desarrollo integral, brindando el apoyo requerido de manera equitativa.',
    ),
    FaqItem(
      question: '2. ¿Qué debo hacer para ingresar al Programa?',
      answer: 'Debes contactarte con nuestra educadora diferencial y agendar una entrevista para tu ingreso. Además debes contar con el respaldo documental de tu diagnóstico.',
    ),
    FaqItem(
      question: '3. ¿Qué apoyos puedo recibir si soy parte del Incluye UCN?',
      answer: 'Establecimiento de plan de ajustes razonables y seguimiento de aplicación de los mismos.\nTalleres sobre habilidades sociales y comunicativas\nArticulación con otros programas para el apoyo a través de tutorías inclusivas y apoyo psicoeducativo.\nApoyo en postulación a beneficios y ayudas técnicas',
    ),
    FaqItem(
      question: '4. ¿Qué es un ajuste razonable?',
      answer: 'Son modificaciones, adaptaciones o apoyos a nivel ambiental o académico, que permiten que los estudiantes con discapacidad o necesidades educativas se desempeñen en igualdad de condiciones. Por ejemplo : tiempo adicional en evaluaciones, adecuación de materiales de estudio (braille, en relieve, audio libros, etc).',
    ),
    FaqItem(
      question: '5. ¿Que es una necesidad educativa?',
      answer: 'Son las condiciones que toda persona necesita para aprender de acuerdo a sus características individuales, ya que todos aprendemos de manera distinta. Al aplicar este concepto, se garantiza que todos los estudiantes tengan acceso a una educación en igualdad de condiciones independiente de sus diferencias.',
    ),
    FaqItem(
      question: '6. ¿Existe alguna normativa ministerial que respalde los ajustes razonables?',
      answer: 'Si, existen varias normativas, en el año 2008, Chile ratificó la convención de derechos de las personas en situación de discapacidad, por lo tanto, fortalece y garantiza la política social como un derecho social; con énfasis en la persona como sujeto integral: biológico-psicológico y social, desde una perspectiva que recupera la diversidad social y reconoce la especificidad de cada individuo. Posteriormente y siguiendo los lineamientos de esta convención, el 03 de febrero del año 2010 Chile promulgó la Ley 20.422, que establece normas sobre igualdad de oportunidades e inclusión social de personas con discapacidad (siendo su última versión de enero del 2023). Esta ley, en cuanto a educación superior, señala que: “las instituciones de educación superior deberán contar con mecanismos que faciliten el acceso de las personas con discapacidad, así como adaptar los materiales de estudio y medios de enseñanza para que dichas personas puedan cursar las diferentes carreras” (Congreso Nacional de Chile, 2023).\n\nPor otro lado la Ley 21.091 de Educación Superior (2018) establece : “El Sistema promoverá la inclusión de los estudiantes en las instituciones de educación superior, velando por la eliminación y prohibición de todas las formas de discriminación arbitraria. En este sentido, el Sistema promoverá la realización de ajustes razonables para permitir la inclusión de las personas con discapacidad” (MINEDUC, 2018a, art. 2e).',
    ),
    FaqItem(
      question: '7. ¿Cómo es el procedimiento para que mis profesores se informen sobre los ajustes razonables que se deben aplicar?',
      answer: 'En la entrevista inicial, se establece consenso con los estudiantes respecto a cuáles son los ajustes razonables que, de acuerdo a sus características, requiere para su aprendizaje. A partir de esta información la educadora diferencial genera un informe de ingreso con los ajustes razonables para ese estudiante, el cual es enviado a DIDDEC y a los jefes de carrera para que estos sean informados a los docentes respectivos.',
    ),
    FaqItem(
      question: '8. ¿Qué hacer en caso de que no se apliquen los ajustes razonables?',
      answer: 'Enviar un correo a educadora diferencial del programa INCLUYE para gestionar acompañamiento al docente en conjunto con DIDDEC.',
    ),
    FaqItem(
      question: '9. ¿Hay alguna fecha límite para ingresar al programa INCLUYE?',
      answer: 'No, se puede ingresar en cualquier momento, es importante señalar que sólo el estudiante puede solicitar su salida del programa, enviando un correo con su decisión a la educadora diferencial.',
    ),
    FaqItem(
      question: '10. ¿Como me puedo comunicar con el programa?',
      answer: 'Vía correo ediferencial.incluyecoq@ucn.cl o asistiendo a la oficina del programa ubicada a un costado del departamento estudiantil.',
    ),
  ];


  @override
  void initState() {
    super.initState();
    _checkAccess();
  }

  // Comprueba si el usuario es estudiante o docente.
  Future<void> _checkAccess() async {
    final isStudent = await StudentService.isStudent();
    final isTeacher = await StudentService.isTeacher();
    if (mounted) {
      setState(() {
        _hasAccess = isStudent || isTeacher;
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Preguntas Frecuentes'),
        backgroundColor: Colors.indigo,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _hasAccess
              ? _buildFaqList()
              : _buildAccessDenied(),
    );
  }

  // Widget que construye la lista de preguntas
  Widget _buildFaqList() {
    return ListView.builder(
      padding: const EdgeInsets.all(8.0),
      itemCount: _faqList.length,
      itemBuilder: (context, index) {
        final faq = _faqList[index];
        return Card(
          margin: const EdgeInsets.symmetric(vertical: 8.0, horizontal: 4.0),
          child: ExpansionTile(
            title: Text(
              faq.question,
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
            children: [
              Padding(
                padding: const EdgeInsets.all(16.0),
                child: Text(
                  faq.answer,
                  textAlign: TextAlign.justify,
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  // Widget que se muestra si el usuario no tiene permisos
  Widget _buildAccessDenied() {
    return const Center(
      child: Padding(
        padding: EdgeInsets.all(16.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.lock, size: 60, color: Colors.red),
            SizedBox(height: 16),
            Text(
              'Acceso Denegado',
              style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
              textAlign: TextAlign.center,
            ),
            SizedBox(height: 8),
            Text(
              'Esta sección solo está disponible para estudiantes y docentes.',
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}