import React, { useState, useRef } from 'react';
import { firestoreService } from '../../services/firestoreService';

export function ImportStudents({ courses, onClose, onSuccess }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: Upload, 2: Preview, 3: Import
  const [importResults, setImportResults] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const validTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (!validTypes.includes(file.type) && !file.name.endsWith('.csv')) {
      setError('Por favor selecciona un archivo CSV o Excel válido.');
      return;
    }

    setSelectedFile(file);
    setError('');
    parseFile(file);
  };

  const parseFile = (file) => {
    setIsLoading(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const rows = text.split('\n').map(row => 
          row.split(',').map(cell => cell.trim().replace(/"/g, ''))
        );

        if (rows.length < 2) {
          throw new Error('El archivo debe contener al menos una fila de encabezados y una fila de datos.');
        }

        // Verificar que tenga las columnas requeridas
        const headers = rows[0];
        const requiredColumns = ['nombre', 'email_apoderado'];
        const missingColumns = requiredColumns.filter(col => 
          !headers.some(header => header.toLowerCase().includes(col.replace('_', '')))
        );

        if (missingColumns.length > 0) {
          throw new Error(`Faltan las siguientes columnas requeridas: ${missingColumns.join(', ')}`);
        }

        // Procesar datos
        const data = rows.slice(1)
          .filter(row => row.some(cell => cell.trim())) // Filtrar filas vacías
          .map((row, index) => {
            const student = {};
            headers.forEach((header, colIndex) => {
              const normalizedHeader = header.toLowerCase().trim();
              if (normalizedHeader.includes('nombre')) {
                student.name = row[colIndex] || '';
              } else if (normalizedHeader.includes('email') || normalizedHeader.includes('apoderado')) {
                student.parentEmail = row[colIndex] || '';
              } else if (normalizedHeader.includes('foto') || normalizedHeader.includes('photo')) {
                student.photoUrl = row[colIndex] || '';
              } else if (normalizedHeader.includes('curso') || normalizedHeader.includes('course')) {
                student.courseName = row[colIndex] || '';
              }
            });

            return {
              ...student,
              rowIndex: index + 2, // +2 porque empezamos desde la fila 2 del Excel
              isValid: student.name && student.parentEmail && student.parentEmail.includes('@')
            };
          });

        setPreviewData(data);
        setStep(2);
      } catch (err) {
        setError(`Error al procesar el archivo: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    reader.onerror = () => {
      setError('Error al leer el archivo.');
      setIsLoading(false);
    };

    reader.readAsText(file);
  };

  const handleImport = async () => {
    setIsLoading(true);
    const results = {
      total: previewData.length,
      success: 0,
      errors: []
    };

    try {
      for (const studentData of previewData) {
        if (!studentData.isValid) {
          results.errors.push({
            row: studentData.rowIndex,
            error: 'Datos incompletos o inválidos'
          });
          continue;
        }

        try {
          // Buscar el ID del curso si se proporcionó el nombre
          let courseIds = [];
          if (studentData.courseName) {
            const course = courses.find(c => 
              c.name.toLowerCase().includes(studentData.courseName.toLowerCase())
            );
            if (course) {
              courseIds = [course.id];
            }
          }

          // Crear el estudiante en Firestore
          await firestoreService.createStudent({
            name: studentData.name,
            parentEmail: studentData.parentEmail,
            photoUrl: studentData.photoUrl || 'https://via.placeholder.com/150?text=Estudiante',
            courseIds: courseIds,
            createdAt: new Date(),
            reconocible: "si"
          });

          results.success++;
        } catch (error) {
          results.errors.push({
            row: studentData.rowIndex,
            name: studentData.name,
            error: error.message
          });
        }
      }

      setImportResults(results);
      setStep(3);

      if (results.success > 0) {
        onSuccess && onSuccess(results);
      }
    } catch (error) {
      setError(`Error durante la importación: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const resetImport = () => {
    setSelectedFile(null);
    setPreviewData([]);
    setStep(1);
    setError('');
    setImportResults(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const downloadTemplate = () => {
    const csvContent = `nombre,email_apoderado,foto_url,curso
Juan Pérez,padre1@email.com,https://example.com/foto1.jpg,Matemáticas 5A
María García,madre2@email.com,https://example.com/foto2.jpg,Ciencias 5B
Carlos López,padre3@email.com,,Historia 6A`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'plantilla_estudiantes.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-90vh overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Importar Estudiantes desde Archivo
          </h3>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Paso 1: Subida de archivo */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <h4 className="mt-2 text-lg font-medium text-gray-900">Subir archivo de estudiantes</h4>
                <p className="mt-1 text-sm text-gray-500">
                  Sube un archivo CSV o Excel con la información de los estudiantes
                </p>
              </div>

              {/* Área de subida de archivos */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileSelect}
                  disabled={isLoading}
                  className="hidden"
                />
                <div className="text-center">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {isLoading ? 'Procesando...' : 'Seleccionar Archivo'}
                  </button>
                  <p className="mt-2 text-xs text-gray-500">
                    Formatos admitidos: CSV, Excel (.xlsx, .xls)
                  </p>
                </div>
              </div>

              {/* Descargar plantilla */}
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-blue-800">
                      ¿No tienes un archivo preparado?
                    </h4>
                    <p className="mt-1 text-sm text-blue-700">
                      Descarga nuestra plantilla de ejemplo para ver el formato correcto.
                    </p>
                    <div className="mt-2">
                      <button
                        onClick={downloadTemplate}
                        className="text-sm text-blue-600 hover:text-blue-500 underline"
                      >
                        Descargar plantilla CSV
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Formato requerido */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Formato requerido:
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li><strong>nombre</strong> - Nombre completo del estudiante (requerido)</li>
                  <li><strong>email_apoderado</strong> - Correo del apoderado (requerido)</li>
                  <li><strong>foto_url</strong> - URL de la foto del estudiante (opcional)</li>
                  <li><strong>curso</strong> - Nombre del curso (opcional, debe coincidir con cursos existentes)</li>
                </ul>
              </div>
            </div>
          )}

          {/* Paso 2: Vista previa */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-medium text-gray-900">Vista Previa de Datos</h4>
                  <p className="text-sm text-gray-500">
                    Revisa los datos antes de importar. Se procesarán {previewData.filter(s => s.isValid).length} de {previewData.length} estudiantes.
                  </p>
                </div>
                <button
                  onClick={resetImport}
                  disabled={isLoading}
                  className="px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                >
                  Cambiar archivo
                </button>
              </div>

              {/* Estadísticas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="text-2xl font-bold text-blue-600">{previewData.length}</div>
                  <div className="text-sm text-blue-800">Total estudiantes</div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="text-2xl font-bold text-green-600">
                    {previewData.filter(s => s.isValid).length}
                  </div>
                  <div className="text-sm text-green-800">Válidos</div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="text-2xl font-bold text-red-600">
                    {previewData.filter(s => !s.isValid).length}
                  </div>
                  <div className="text-sm text-red-800">Con errores</div>
                </div>
              </div>

              {/* Tabla de vista previa */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto max-h-96">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fila</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email Apoderado</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Curso</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {previewData.map((student, index) => (
                        <tr key={index} className={student.isValid ? '' : 'bg-red-50'}>
                          <td className="px-3 py-2 whitespace-nowrap">
                            {student.isValid ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                ✓ Válido
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                ✗ Error
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                            {student.rowIndex}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                            {student.name || <span className="text-red-500">Faltante</span>}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                            {student.parentEmail || <span className="text-red-500">Faltante</span>}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                            {student.courseName || <span className="text-gray-400">No especificado</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Paso 3: Resultados */}
          {step === 3 && importResults && (
            <div className="space-y-4">
              <div className="text-center">
                <svg className="mx-auto h-12 w-12 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <h4 className="mt-2 text-lg font-medium text-gray-900">Importación Completada</h4>
              </div>

              {/* Resultados */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="text-3xl font-bold text-blue-600">{importResults.total}</div>
                  <div className="text-sm text-blue-800">Total procesados</div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="text-3xl font-bold text-green-600">{importResults.success}</div>
                  <div className="text-sm text-green-800">Importados exitosamente</div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="text-3xl font-bold text-red-600">{importResults.errors.length}</div>
                  <div className="text-sm text-red-800">Con errores</div>
                </div>
              </div>

              {/* Errores */}
              {importResults.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h5 className="text-sm font-medium text-red-800 mb-3">Errores encontrados:</h5>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {importResults.errors.map((error, index) => (
                      <div key={index} className="text-sm text-red-700">
                        <strong>Fila {error.row}</strong>
                        {error.name && <span> - {error.name}</span>}: {error.error}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-center">
                <button
                  onClick={resetImport}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 mr-3"
                >
                  Importar Más Estudiantes
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="mt-4 p-3 text-red-500 text-center bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        {step === 2 && (
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
            <button
              onClick={resetImport}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleImport}
              disabled={isLoading || previewData.filter(s => s.isValid).length === 0}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {isLoading ? 'Importando...' : `Importar ${previewData.filter(s => s.isValid).length} Estudiantes`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}