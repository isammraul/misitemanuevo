import React, { useState, useEffect } from 'react';
import { Upload, Download, RefreshCw, Search, Filter, TrendingUp, Calendar, Share2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

export default function AulasAnalyzer() {
  const [data, setData] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedTurno, setSelectedTurno] = useState('todos');
  const [uploadDateTime, setUploadDateTime] = useState(null);
  const [loadingStorage, setLoadingStorage] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [showStats, setShowStats] = useState(true);
  const [gistId, setGistId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // ID del Gist principal
  const MAIN_GIST_ID = '4eef79d272bdff63e7018c1c9803eb39';
  
  // URL del backend de Vercel (cambiar después del deploy)
  const BACKEND_URL = 'https://tu-proyecto.vercel.app';
  
  // Clave de admin (debe coincidir con ADMIN_KEY en Vercel)
  const ADMIN_KEY = 'mi_clave_secreta_123';

  const PREDEFINED_AULAS = [
    'isamzoom2022@gmail.com',
    'aulaclases01@gmail.com',
    'aulaencus01@gmail.com',
    'aulaencus02@gmail.com',
    'aulaencus03@gmail.com',
    'isamaula01@gmail.com',
    'isamaula02@gmail.com',
    'isamaula03@gmail.com',
    'isamaula04@gmail.com',
    'isamaula05@gmail.com',
    'isamaula06@gmail.com',
    'isamaula10@gmail.com',
    'isamaula11@gmail.com',
    'isamaula12@gmail.com',
    'isamaula14@gmail.com',
    'isamaula18@gmail.com',
    'isamaula19@gmail.com',
    'isamaula20@gmail.com',
    'isamaula21@gmail.com',
    'isamaula22@gmail.com',
    'isamaula23@gmail.com',
    'isamaula25@gmail.com',
    'isamaula26@gmail.com',
    'isamaula27@gmail.com',
    'isamaula28@gmail.com',
    'isamaula29@gmail.com',
    'isamaula30@gmail.com',
    'isamaula31@gmail.com',
    'isamaula32@gmail.com',
    'isamaula33@gmail.com',
    'isamaula34@gmail.com',
    'isamaula35@gmail.com',
    'isamaula36@gmail.com',
    'isamaula37@gmail.com',
    'isamaula38@gmail.com',
    'isamaula41@gmail.com',
    'isamaula42@gmail.com',
    'isamaula43@gmail.com',
    'isamaula44@gmail.com',
    'isamaula45@gmail.com',
    'isamaula48@gmail.com',
    'isamaula49@gmail.com',
    'isamaula50@gmail.com',
    'isamaula51@gmail.com',
    'isamaula52@gmail.com',
    'isamaula53@gmail.com',
    'isamaula55@gmail.com',
    'isamaula56@gmail.com',
    'isamaula57@gmail.com',
    'isamaula58@gmail.com',
    'isamaula59@gmail.com',
    'isamaula60@gmail.com',
    'isamaula62@gmail.com',
    'isamaula63@gmail.com',
    'isamaula64@gmail.com',
    'isamaula65@gmail.com',
    'isamaula66@gmail.com',
    'isamaula68@gmail.com',
    'isamaula69@gmail.com',
    'isamaula71@gmail.com',
    'isamaula72@gmail.com',
    'isamaula73@gmail.com',
    'isamaula74@gmail.com',
    'isamaula76@gmail.com',
    'isamaula83@gmail.com',
    'isamaula85@gmail.com',
    'isamaula86@gmail.com',
    'isamaula87@gmail.com',
    'isamaula89@gmail.com',
    'isamaula90@gmail.com',
    'isamaula92@gmail.com',
    'isamaula93@gmail.com',
    'isamaula94@gmail.com',
    'isamaula95@gmail.com',
    'isamaula96@gmail.com',
    'isamaula98@gmail.com',
    'isamaula100@gmail.com',
    'isamaula104@gmail.com',
    'isamaula105@gmail.com',
    'isamaula106@gmail.com'
  ];

  useEffect(() => {
    // Verificar si es admin (mediante parámetro en URL)
    const urlParams = new URLSearchParams(window.location.search);
    const adminParam = urlParams.get('admin');
    const sharedGist = urlParams.get('gist');
    
    if (adminParam === 'true') {
      setIsAdmin(true);
      loadDataFromStorage();
    } else if (sharedGist) {
      // Cargar desde URL si hay gist compartido
      loadFromGist(sharedGist);
    } else if (MAIN_GIST_ID && MAIN_GIST_ID.trim() !== '') {
      // Usuario normal: cargar automáticamente desde Gist principal configurado
      loadFromGist(MAIN_GIST_ID);
    } else {
      // No hay Gist configurado aún
      setLoadingStorage(false);
    }
  }, []);

  const loadDataFromStorage = () => {
    try {
      setLoadingStorage(true);
      
      const storedData = localStorage.getItem('aulas-data');
      const storedDateTime = localStorage.getItem('aulas-upload-date');
      const storedTurno = localStorage.getItem('aulas-turno');
      const storedGistId = localStorage.getItem('aulas-gist-id');
      
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        setData(parsedData);
        
        if (storedDateTime) {
          setUploadDateTime(storedDateTime);
        }
        
        if (storedTurno) {
          setSelectedTurno(storedTurno);
        }

        if (storedGistId) {
          setGistId(storedGistId);
        }
        
        analyzeData(parsedData, storedTurno || 'todos');
      }
    } catch (error) {
      console.log('No hay datos previos cargados');
    } finally {
      setLoadingStorage(false);
    }
  };

  const saveDataToStorage = (jsonData, dateTime, turno) => {
    try {
      localStorage.setItem('aulas-data', JSON.stringify(jsonData));
      localStorage.setItem('aulas-upload-date', dateTime);
      localStorage.setItem('aulas-turno', turno);
    } catch (error) {
      console.error('Error al guardar datos:', error);
    }
  };

  const saveToGist = async (jsonData, dateTime) => {
    try {
      // Llamar al backend de Vercel
      const response = await fetch(`${BACKEND_URL}/api/update-gist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adminKey: ADMIN_KEY,
          data: jsonData,
          uploadDateTime: dateTime
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert('✅ ¡Datos actualizados automáticamente!\n\nTodos los usuarios verán la información actualizada.');
        console.log('✅ Gist actualizado:', result);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar');
      }
    } catch (error) {
      console.error('❌ Error al actualizar Gist:', error);
      alert('❌ Error al actualizar los datos: ' + error.message);
    }
  };

  const loadFromGist = async (id) => {
    try {
      setLoadingStorage(true);
      const response = await fetch(`https://api.github.com/gists/${id}`);
      if (response.ok) {
        const gist = await response.json();
        const content = gist.files['aulas-data.json'].content;
        const gistData = JSON.parse(content);
        
        setData(gistData.data);
        setUploadDateTime(gistData.uploadDateTime);
        analyzeData(gistData.data, selectedTurno);
        
        // Solo guardar en localStorage si es admin
        if (isAdmin) {
          saveDataToStorage(gistData.data, gistData.uploadDateTime, selectedTurno);
        }
        
        setGistId(id);
      } else {
        throw new Error('Gist no encontrado');
      }
    } catch (error) {
      console.error('Error al cargar desde Gist:', error);
      // No mostrar error si no hay datos aún
    } finally {
      setLoadingStorage(false);
    }
  };

  const handleTurnoChange = (e) => {
    const newTurno = e.target.value;
    setSelectedTurno(newTurno);
    if (data.length > 0) {
      analyzeData(data, newTurno);
      saveDataToStorage(data, uploadDateTime, newTurno);
    }
  };

  const isInTurno = (time, turno) => {
    const [hours, minutes] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes;
    
    if (turno === 'todos') return true;
    if (turno === 'manana') return totalMinutes >= 420 && totalMinutes <= 780;
    if (turno === 'tarde') return totalMinutes >= 781 && totalMinutes <= 1010;
    if (turno === 'noche') return totalMinutes >= 1020 && totalMinutes <= 1440;
    
    return false;
  };

  const parseDateTime = (dateStr) => {
    const cleanStr = dateStr.replace(/\s*\(Recurrente\)\s*$/i, '').trim();
    const parts = cleanStr.split(' ');
    const datePart = parts[0];
    const timePart = parts[1];
    const meridiem = parts[2];
    
    const [day, month, year] = datePart.split('/');
    const [hours, minutes] = timePart.split(':');
    
    let hour = parseInt(hours);
    if (meridiem === 'PM' && hour !== 12) hour += 12;
    if (meridiem === 'AM' && hour === 12) hour = 0;
    
    const dateObj = new Date(year, month - 1, day, hour, parseInt(minutes));
    const daysOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const dayName = daysOfWeek[dateObj.getDay()];
    
    const formattedTime = hour.toString().padStart(2, '0') + ':' + minutes;
    const sortKey = year + month.padStart(2, '0') + day.padStart(2, '0');
    const formattedDate = day + '/' + month + '/' + year;
    
    return {
      date: formattedDate,
      time: formattedTime,
      dayName: dayName,
      dateTime: dateObj,
      sortKey: sortKey
    };
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    
    const now = new Date();
    const dateStr = now.toLocaleDateString('es-PE', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    const timeStr = now.toLocaleTimeString('es-PE', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
    const fullDateTime = dateStr + ' a las ' + timeStr;
    setUploadDateTime(fullDateTime);
    
    const fileExtension = file.name.split('.').pop().toLowerCase();

    if (fileExtension === 'csv') {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          try {
            const cleanedData = results.data.map(row => {
              const cleanRow = {};
              Object.keys(row).forEach(key => {
                cleanRow[key.trim()] = row[key];
              });
              return cleanRow;
            });
            
            setData(cleanedData);
            analyzeData(cleanedData, selectedTurno);
            saveDataToStorage(cleanedData, fullDateTime, selectedTurno);
            await saveToGist(cleanedData, fullDateTime);
          } catch (error) {
            alert('Error al procesar el archivo CSV: ' + error.message);
          } finally {
            setLoading(false);
          }
        },
        error: (error) => {
          alert('Error al leer el archivo CSV: ' + error.message);
          setLoading(false);
        }
      });
    } else if (fileExtension === 'xls' || fileExtension === 'xlsx') {
      const reader = new FileReader();

      reader.onload = async (event) => {
        try {
          const workbook = XLSX.read(event.target.result, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(sheet);

          setData(jsonData);
          analyzeData(jsonData, selectedTurno);
          saveDataToStorage(jsonData, fullDateTime, selectedTurno);
          await saveToGist(jsonData, fullDateTime);
        } catch (error) {
          alert('Error al procesar el archivo Excel: ' + error.message);
        } finally {
          setLoading(false);
        }
      };

      reader.readAsBinaryString(file);
    } else {
      alert('Formato de archivo no soportado. Por favor usa CSV, XLS o XLSX.');
      setLoading(false);
    }
  };

  const analyzeData = (jsonData, turno = 'todos') => {
    const aulasByDate = {};
    const allDates = new Set();
    const foundAulas = new Set();
    
    jsonData.forEach((row) => {
      const horaInicio = row['Hora de inicio'] || row['Hora_de_inicio'] || row['Hora_de _inicio'];
      const correo = (row['Correo Electrónico del anfitrión'] || row['Correo_Electrónico_del_anfitrión'] || '').trim();
      
      if (!horaInicio || !correo) return;

      const { date, time, sortKey, dayName } = parseDateTime(horaInicio);
      
      if (!isInTurno(time, turno)) return;
      
      allDates.add(JSON.stringify({ date, sortKey, dayName }));
      foundAulas.add(correo);
      
      if (!aulasByDate[correo]) {
        aulasByDate[correo] = {};
      }
      
      if (!aulasByDate[correo][date]) {
        aulasByDate[correo][date] = 0;
      }
      
      aulasByDate[correo][date]++;
    });

    const sortedDates = Array.from(allDates)
      .map(str => JSON.parse(str))
      .sort((a, b) => a.sortKey.localeCompare(b.sortKey));

    const sortedAulas = [...PREDEFINED_AULAS];
    
    Array.from(foundAulas)
      .filter(aula => !PREDEFINED_AULAS.includes(aula))
      .sort()
      .forEach(aula => sortedAulas.push(aula));

    const matrixData = sortedAulas.map(aula => {
      const row = { aula };
      let totalClases = 0;
      let diasLibres = 0;
      let diasOcupados = 0;
      
      sortedDates.forEach(dateInfo => {
        const count = aulasByDate[aula]?.[dateInfo.date] || 0;
        row[dateInfo.date] = count;
        totalClases += count;
        if (count === 0) diasLibres++;
        else diasOcupados++;
      });
      
      row.totalClases = totalClases;
      row.diasLibres = diasLibres;
      row.diasOcupados = diasOcupados;
      row.promedioDiario = sortedDates.length > 0 ? (totalClases / sortedDates.length).toFixed(1) : 0;
      
      return row;
    });

    setResults({
      matrix: matrixData,
      dates: sortedDates,
      aulas: sortedAulas
    });
  };

  const exportToExcel = () => {
    if (!results) return;

    const wsData = [];
    const header = ['Aula', ...results.dates.map(d => d.dayName + ' ' + d.date), 'Total Clases', 'Días Libres', 'Días Ocupados', 'Promedio/Día'];
    wsData.push(header);

    const filteredData = getFilteredMatrix();
    filteredData.forEach(row => {
      const rowData = [row.aula];
      results.dates.forEach(dateInfo => {
        const count = row[dateInfo.date];
        rowData.push(count === 0 ? 'Libre' : count);
      });
      rowData.push(row.totalClases, row.diasLibres, row.diasOcupados, row.promedioDiario);
      wsData.push(rowData);
    });

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Disponibilidad Aulas');
    XLSX.writeFile(wb, 'disponibilidad_aulas_' + new Date().toISOString().split('T')[0] + '.xlsx');
  };

  const handleRefresh = () => {
    setLoadingStorage(true);
    loadDataFromStorage();
  };

  const getCellStyle = (count) => {
    if (count === 0) return 'bg-green-100 text-green-800 font-semibold';
    if (count === 1) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getCellText = (count) => {
    if (count === 0) return 'Libre';
    return count + ' clase' + (count > 1 ? 's' : '');
  };

  const getFilteredMatrix = () => {
    if (!results) return [];
    
    let filtered = results.matrix;
    
    // Filtro de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(row => 
        row.aula.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filtro de estado
    if (filterStatus === 'libres') {
      filtered = filtered.filter(row => row.totalClases === 0);
    } else if (filterStatus === 'ocupadas') {
      filtered = filtered.filter(row => row.totalClases > 1);
    } else if (filterStatus === 'disponibles') {
      filtered = filtered.filter(row => row.totalClases === 1);
    }
    
    return filtered;
  };

  const calculateStats = () => {
    if (!results) return null;
    
    const totalAulas = results.matrix.length;
    const aulasLibres = results.matrix.filter(row => row.totalClases === 0).length;
    const aulasOcupadas = results.matrix.filter(row => row.totalClases > 0).length;
    const totalClases = results.matrix.reduce((sum, row) => sum + row.totalClases, 0);
    const promedioClasesPorAula = (totalClases / totalAulas).toFixed(1);
    const aulasMasUsadas = [...results.matrix].sort((a, b) => b.totalClases - a.totalClases).slice(0, 5);
    
    return {
      totalAulas,
      aulasLibres,
      aulasOcupadas,
      totalClases,
      promedioClasesPorAula,
      aulasMasUsadas
    };
  };

  const stats = calculateStats();

  if (loadingStorage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600"></div>
          <p className="mt-4 text-gray-700 text-lg">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              📊 Matriz de Disponibilidad de Aulas
            </h1>
            <p className="text-gray-600">
              Vista completa de ocupación por aula y día - ISAM
            </p>
            {isAdmin && (
              <div className="mt-3 inline-block bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 rounded-lg text-sm font-medium">
                🔑 Modo Administrador - Puedes subir y publicar datos
              </div>
            )}
            {uploadDateTime && (
              <div className="mt-4 flex items-center justify-center gap-3 flex-wrap">
                <div className="inline-block bg-indigo-100 text-indigo-800 px-4 py-2 rounded-lg text-sm font-medium">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Actualizado: {uploadDateTime}
                </div>
                {gistId && (
                  <button
                    onClick={() => {
                      const url = `${window.location.origin}${window.location.pathname}?gist=${gistId}`;
                      navigator.clipboard.writeText(url);
                      alert(`✅ Link copiado al portapapeles!\n\n${url}\n\nCompártelo para que otros vean estos datos específicos.`);
                    }}
                    className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                    title="Copiar enlace para compartir estos datos"
                  >
                    <Share2 className="w-4 h-4" />
                    Compartir Link
                  </button>
                )}
                <button
                  onClick={handleRefresh}
                  className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                  title="Actualizar datos"
                >
                  <RefreshCw className="w-4 h-4" />
                  Actualizar
                </button>
              </div>
            )}
          </div>

          {!results && !loading && (
            <div className="mb-8">
              {isAdmin ? (
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-indigo-300 rounded-xl cursor-pointer bg-indigo-50 hover:bg-indigo-100 transition-all">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-12 h-12 text-indigo-500 mb-3" />
                    <p className="mb-2 text-lg font-semibold text-gray-700">
                      Cargar archivo Excel o CSV
                    </p>
                    <p className="text-sm text-gray-500">
                      Sube tu archivo con los datos de las reuniones
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      Los datos se publicarán automáticamente para todos los usuarios
                    </p>
                  </div>
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-xl border border-gray-200">
                  <Calendar className="w-16 h-16 text-gray-400 mb-4" />
                  <p className="text-lg font-semibold text-gray-700 mb-2">
                    No hay datos disponibles
                  </p>
                  <p className="text-sm text-gray-500 text-center">
                    El administrador aún no ha publicado la información de disponibilidad de aulas.
                  </p>
                </div>
              )}
            </div>
          )}

          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              <p className="mt-4 text-gray-600">Procesando archivo...</p>
            </div>
          )}

          {results && !loading && (
            <div>
              {/* Estadísticas */}
              {showStats && stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="text-blue-600 text-sm font-medium">Total Aulas</div>
                    <div className="text-2xl font-bold text-blue-900">{stats.totalAulas}</div>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="text-green-600 text-sm font-medium">Aulas Libres</div>
                    <div className="text-2xl font-bold text-green-900">{stats.aulasLibres}</div>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="text-red-600 text-sm font-medium">Aulas Ocupadas</div>
                    <div className="text-2xl font-bold text-red-900">{stats.aulasOcupadas}</div>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="text-purple-600 text-sm font-medium">Total Clases</div>
                    <div className="text-2xl font-bold text-purple-900">{stats.totalClases}</div>
                  </div>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="text-orange-600 text-sm font-medium">Promedio/Aula</div>
                    <div className="text-2xl font-bold text-orange-900">{stats.promedioClasesPorAula}</div>
                  </div>
                </div>
              )}

              {/* Controles y Filtros */}
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                  {/* Búsqueda */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar aula..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-64"
                    />
                  </div>

                  {/* Filtro de estado */}
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="todos">Todas las aulas</option>
                    <option value="libres">Solo libres (0 clases)</option>
                    <option value="disponibles">Parcialmente disponibles (1 clase)</option>
                    <option value="ocupadas">Ocupadas (2+ clases)</option>
                  </select>

                  {/* Filtro de turno */}
                  <select
                    value={selectedTurno}
                    onChange={handleTurnoChange}
                    className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="todos">Todos los turnos</option>
                    <option value="manana">Mañana (7:00 - 13:00)</option>
                    <option value="tarde">Tarde (13:01 - 16:50)</option>
                    <option value="noche">Noche (17:00 - 24:00)</option>
                  </select>
                </div>

                {/* Botones de acción */}
                <div className="flex gap-3 w-full lg:w-auto">
                  <label className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer flex-1 lg:flex-initial justify-center">
                    <Upload className="w-4 h-4" />
                    <span className="hidden sm:inline">Cargar nuevo</span>
                    <input
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  
                  <button
                    onClick={exportToExcel}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex-1 lg:flex-initial justify-center"
                  >
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">Exportar</span>
                  </button>

                  <button
                    onClick={() => setShowStats(!showStats)}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    title="Mostrar/Ocultar estadísticas"
                  >
                    <TrendingUp className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Leyenda */}
              <div className="flex gap-4 text-sm mb-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                  <span>Libre (0 clases)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded"></div>
                  <span>1 clase</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
                  <span>2+ clases</span>
                </div>
              </div>

              {/* Tabla */}
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="sticky left-0 z-20 px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider bg-gray-100 border-r-2 border-gray-300">
                        Aula
                      </th>
                      {results.dates.map((dateInfo, idx) => (
                        <th
                          key={idx}
                          className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap"
                        >
                          <div className="text-indigo-600 font-bold">{dateInfo.dayName}</div>
                          <div className="text-gray-600">{dateInfo.date}</div>
                        </th>
                      ))}
                      <th className="sticky right-0 z-10 px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider bg-gray-100 border-l-2 border-gray-300">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {getFilteredMatrix().map((row, rowIdx) => (
                      <tr key={rowIdx} className="hover:bg-gray-50">
                        <td className="sticky left-0 z-10 px-4 py-3 text-sm font-medium text-gray-900 bg-white border-r-2 border-gray-200 whitespace-nowrap">
                          {row.aula}
                        </td>
                        {results.dates.map((dateInfo, colIdx) => {
                          const count = row[dateInfo.date];
                          return (
                            <td
                              key={colIdx}
                              className={'px-4 py-3 text-sm text-center whitespace-nowrap ' + getCellStyle(count)}
                            >
                              {getCellText(count)}
                            </td>
                          );
                        })}
                        <td className="sticky right-0 z-10 px-4 py-3 text-sm text-center font-bold bg-gray-50 border-l-2 border-gray-200">
                          {row.totalClases}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Información adicional */}
              <div className={`mt-6 border rounded-lg p-4 ${results.dates.length <= 1 ? 'bg-yellow-50 border-yellow-300' : 'bg-blue-50 border-blue-200'}`}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-700">
                      <strong>Aulas mostradas:</strong> {getFilteredMatrix().length} de {results.aulas.length} |
                      <strong className="ml-3">Días analizados:</strong> {results.dates.length} |
                      <strong className="ml-3">Turno:</strong> {
                        selectedTurno === 'todos' ? 'Todos' :
                        selectedTurno === 'manana' ? 'Mañana' :
                        selectedTurno === 'tarde' ? 'Tarde' : 'Noche'
                      }
                    </p>
                    {results.dates.length <= 1 && (
                      <p className="text-xs text-yellow-700 mt-2">
                        ⚠️ Solo se detectó 1 día. Verifica que tu archivo tenga datos de múltiples fechas.
                      </p>
                    )}
                  </div>
                  {gistId && (
                    <div className="text-right">
                      <p className="text-xs text-gray-600">
                        Datos sincronizados • Compartible con otros usuarios
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Aulas más usadas */}
              {showStats && stats && stats.aulasMasUsadas.length > 0 && (
                <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Top 5 Aulas Más Usadas
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    {stats.aulasMasUsadas.map((aula, idx) => (
                      <div key={idx} className="bg-white rounded-lg p-3 border border-yellow-300">
                        <div className="text-xl font-bold text-yellow-600">#{idx + 1}</div>
                        <div className="text-sm font-medium text-gray-700 truncate">{aula.aula}</div>
                        <div className="text-lg font-bold text-gray-900">{aula.totalClases} clases</div>
                        <div className="text-xs text-gray-500">{aula.promedioDiario} por día</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {!results && !loading && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mt-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                📋 Cómo funciona
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span><strong>Carga tu archivo:</strong> Excel (.xlsx, .xls) o CSV con los datos de reuniones</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span><strong>Visualiza:</strong> Matriz completa con todos los días y disponibilidad por colores</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span><strong>Filtra:</strong> Por turno, estado (libres/ocupadas) o busca aulas específicas</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span><strong>Comparte:</strong> Los datos se sincronizan y puedes compartir el link con otros</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span><strong>Exporta:</strong> Descarga la matriz en Excel con estadísticas completas</span>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
