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
    <div>
      <div>
        {/* Header */}
        <div>
          <h3>
            Importar Estudiantes desde Archivo
          </h3>
          <button
            onClick={onClose}
            disabled={isLoading}
          >
            Cerrar
          </button>
        </div>

        {/* Body */}
        <div>
          {/* Paso 1: Subida de archivo */}
          {step === 1 && (
            <div>
              <div>
                <h4>Subir archivo de estudiantes</h4>
                <p>
                  Sube un archivo CSV o Excel con la información de los estudiantes
                </p>
              </div>

              {/* Área de subida de archivos */}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileSelect}
                  disabled={isLoading}
                />
                <div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Procesando...' : 'Seleccionar Archivo'}
                  </button>
                  <p>
                    Formatos admitidos: CSV, Excel (.xlsx, .xls)
                  </p>
                </div>
              </div>

              {/* Descargar plantilla */}
              <div>
                <div>
                  <div>
                    {/* icono eliminado */}
                  </div>
                  <div>
                    <h4>
                      ¿No tienes un archivo preparado?
                    </h4>
                    <p>
                      Descarga nuestra plantilla de ejemplo para ver el formato correcto.
                    </p>
                    <div>
                      <button
                        onClick={downloadTemplate}
                      >
                        Descargar plantilla CSV
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Formato requerido */}
              <div>
                <h4>
                  Formato requerido:
                </h4>
                <ul>
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
            <div>
              <div>
                <div>
                  <h4>Vista Previa de Datos</h4>
                  <p>
                    Revisa los datos antes de importar. Se procesarán {previewData.filter(s => s.isValid).length} de {previewData.length} estudiantes.
                  </p>
                </div>
                <button
                  onClick={resetImport}
                  disabled={isLoading}
                >
                  Cambiar archivo
                </button>
              </div>

              {/* Estadísticas */}
              <div>
                <div>
                  <div>{previewData.length}</div>
                  <div>Total estudiantes</div>
                </div>
                <div>
                  <div>
                    {previewData.filter(s => s.isValid).length}
                  </div>
                  <div>Válidos</div>
                </div>
                <div>
                  <div>
                    {previewData.filter(s => !s.isValid).length}
                  </div>
                  <div>Con errores</div>
                </div>
              </div>

              {/* Tabla de vista previa */}
              <div>
                <div>
                  <table>
                    <thead>
                      <tr>
                        <th>Estado</th>
                        <th>Fila</th>
                        <th>Nombre</th>
                        <th>Email Apoderado</th>
                        <th>Curso</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.map((student, index) => (
                        <tr key={index}>
                          <td>
                            {student.isValid ? (
                              <span>
                                ✓ Válido
                              </span>
                            ) : (
                              <span>
                                ✗ Error
                              </span>
                            )}
                          </td>
                          <td>
                            {student.rowIndex}
                          </td>
                          <td>
                            {student.name || <span>Faltante</span>}
                          </td>
                          <td>
                            {student.parentEmail || <span>Faltante</span>}
                          </td>
                          <td>
                            {student.courseName || <span>No especificado</span>}
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
            <div>
              <div>
                <h4>Importación Completada</h4>
              </div>

              {/* Resultados */}
              <div>
                <div>
                  <div>{importResults.total}</div>
                  <div>Total procesados</div>
                </div>
                <div>
                  <div>{importResults.success}</div>
                  <div>Importados exitosamente</div>
                </div>
                <div>
                  <div>{importResults.errors.length}</div>
                  <div>Con errores</div>
                </div>
              </div>

              {/* Errores */}
              {importResults.errors.length > 0 && (
                <div>
                  <h5>Errores encontrados:</h5>
                  <div>
                    {importResults.errors.map((error, index) => (
                      <div key={index}>
                        <strong>Fila {error.row}</strong>
                        {error.name && <span> - {error.name}</span>}: {error.error}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <button
                  onClick={resetImport}
                >
                  Importar Más Estudiantes
                </button>
                <button
                  onClick={onClose}
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div>
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        {step === 2 && (
          <div>
            <button
              onClick={resetImport}
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              onClick={handleImport}
              disabled={isLoading || previewData.filter(s => s.isValid).length === 0}
            >
              {isLoading ? 'Importando...' : `Importar ${previewData.filter(s => s.isValid).length} Estudiantes`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}