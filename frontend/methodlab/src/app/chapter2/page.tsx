'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { chapter2Api } from '@/lib/api'
import HelpModal from '@/components/HelpModal'
import LoadingSpinner from '@/components/LoadingSpinner'
import ResultTable from '@/components/ResultTable'
import ComparisonReport from '@/components/ComparisonReport'

type MethodType = 'jacobi' | 'gaussSeidel' | 'sor'

interface FormData {
  matrixA: number[][]
  vectorB: number[]
  vectorX0: number[]
  norm_type: number
  w?: number
  tol: number
  max_count: number
}

export default function Chapter2() {
  const [selectedMethod, setSelectedMethod] = useState<MethodType>('jacobi')
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showHelp, setShowHelp] = useState(false)
  const [showReport, setShowReport] = useState(false)
  const [matrixSize, setMatrixSize] = useState(3)
  const [allResults, setAllResults] = useState<any[]>([])
  const [reportData, setReportData] = useState<any[]>([])
  const [showComparisonReport, setShowComparisonReport] = useState(false)

  // Estados para la matriz y vectores
  const [matrixA, setMatrixA] = useState<string[][]>([
    ['4', '-1', '0'],
    ['-1', '4', '-1'],
    ['0', '-1', '4']
  ])
  const [vectorB, setVectorB] = useState<string[]>(['1', '2', '3'])
  const [vectorX0, setVectorX0] = useState<string[]>(['0', '0', '0'])
  const [normType, setNormType] = useState<number>(1)
  const [wValue, setWValue] = useState<number>(1.2)
  const [tolerance, setTolerance] = useState<number>(1e-6)
  const [maxIterations, setMaxIterations] = useState<number>(100)

  // Función para obtener estilos específicos del método
  const getMethodStyles = (method: MethodType) => {
    const baseClass = "w-full px-3 py-2 border-2 rounded-md focus:outline-none focus:ring-2 transition-colors text-black"
    switch (method) {
      case 'jacobi':
        return `${baseClass} border-purple-300 bg-purple-50 focus:border-purple-500 focus:ring-purple-200`
      case 'gaussSeidel':
        return `${baseClass} border-indigo-300 bg-indigo-50 focus:border-indigo-500 focus:ring-indigo-200`
      case 'sor':
        return `${baseClass} border-pink-300 bg-pink-50 focus:border-pink-500 focus:ring-pink-200`
      default:
        return `${baseClass} border-gray-300 bg-gray-50 focus:border-gray-500 focus:ring-gray-200`
    }
  }

  // Valores de ejemplo para cada método
  const getExampleValues = (method: MethodType) => {
    switch (method) {
      case 'jacobi':
        return {
          matrixA: [
            ['4', '-1', '0'],
            ['-1', '4', '-1'],
            ['0', '-1', '4']
          ],
          vectorB: ['1', '2', '3'],
          vectorX0: ['0', '0', '0'],
          wValue: 1.0
        }
      case 'gaussSeidel':
        return {
          matrixA: [
            ['5', '-1', '1'],
            ['2', '6', '-1'],
            ['1', '1', '7']
          ],
          vectorB: ['5', '7', '8'],
          vectorX0: ['0', '0', '0'],
          wValue: 1.0
        }
      case 'sor':
        return {
          matrixA: [
            ['4', '-1', '0'],
            ['-1', '4', '-1'],
            ['0', '-1', '4']
          ],
          vectorB: ['1', '2', '3'],
          vectorX0: ['0', '0', '0'],
          wValue: 1.2
        }
      default:
        return {
          matrixA: [
            ['4', '-1', '0'],
            ['-1', '4', '-1'],
            ['0', '-1', '4']
          ],
          vectorB: ['1', '2', '3'],
          vectorX0: ['0', '0', '0'],
          wValue: 1.0
        }
    }
  }

  // Efecto para cargar valores de ejemplo cuando cambia el método
  useEffect(() => {
    // Limpiar resultados anteriores
    setResults(null)
    setError(null)
    setShowReport(false)
    
    // Cargar valores de ejemplo
    const examples = getExampleValues(selectedMethod)
    setMatrixA(examples.matrixA)
    setVectorB(examples.vectorB)
    setVectorX0(examples.vectorX0)
    setWValue(examples.wValue)
  }, [selectedMethod])

  const methods = [
    { id: 'jacobi', name: 'Jacobi', description: 'Método iterativo básico para sistemas lineales' },
    { id: 'gaussSeidel', name: 'Gauss-Seidel', description: 'Mejora de Jacobi con valores actualizados' },
    { id: 'sor', name: 'SOR', description: 'Successive Over-Relaxation con factor de relajación' }
  ]

  const resizeMatrix = (newSize: number) => {
    const newMatrixA = Array(newSize).fill(null).map((_, i) =>
      Array(newSize).fill(null).map((_, j) => matrixA[i]?.[j] || '')
    )
    const newVectorB = Array(newSize).fill(null).map((_, i) => vectorB[i] || '')
    const newVectorX0 = Array(newSize).fill(null).map((_, i) => vectorX0[i] || '0')

    setMatrixA(newMatrixA)
    setVectorB(newVectorB)
    setVectorX0(newVectorX0)
    setMatrixSize(newSize)
  }

  const updateMatrixValue = (i: number, j: number, value: string) => {
    const newMatrix = [...matrixA]
    newMatrix[i][j] = value
    setMatrixA(newMatrix)
  }

  const updateVectorBValue = (i: number, value: string) => {
    const newVector = [...vectorB]
    newVector[i] = value
    setVectorB(newVector)
  }

  const updateVectorX0Value = (i: number, value: string) => {
    const newVector = [...vectorX0]
    newVector[i] = value
    setVectorX0(newVector)
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)

    try {
      // Convertir strings a números
      const numMatrixA = matrixA.map(row =>
        row.map(val => {
          const num = parseFloat(val)
          if (isNaN(num)) throw new Error(`Valor inválido en matriz A: "${val}"`)
          return num
        })
      )

      const numVectorB = vectorB.map(val => {
        const num = parseFloat(val)
        if (isNaN(num)) throw new Error(`Valor inválido en vector B: "${val}"`)
        return num
      })

      const numVectorX0 = vectorX0.map(val => {
        const num = parseFloat(val)
        if (isNaN(num)) throw new Error(`Valor inválido en vector X0: "${val}"`)
        return num
      })

      const formData = {
        matrixA: numMatrixA,
        vectorB: numVectorB,
        vectorX0: numVectorX0,
        norm_type: normType,
        tol: tolerance,
        max_count: maxIterations,
        ...(selectedMethod === 'sor' && { w: wValue })
      }

      let response
      switch (selectedMethod) {
        case 'jacobi':
          response = await chapter2Api.jacobi(formData)
          break
        case 'gaussSeidel':
          response = await chapter2Api.gaussSeidel(formData)
          break
        case 'sor':
          response = await chapter2Api.sor(formData)
          break
      }

      const methodResult = response.data.result
      setResults(methodResult)
      
      // Guardar resultado para comparación
      const methodName = methods.find(m => m.id === selectedMethod)?.name || selectedMethod;
      const newResult = {
        method: methodName,
        result: methodResult,
        timestamp: new Date().toISOString(),
        parameters: { matrixA: numMatrixA, vectorB: numVectorB, vectorX0: numVectorX0, norm_type: normType, tol: tolerance, max_count: maxIterations }
      };
      
      setAllResults(prev => {
        const filtered = prev.filter(r => r.method !== methodName);
        return [...filtered, newResult];
      });
      
    } catch (err: any) {
      const errorMsg = err.message || err.response?.data?.error || 'Error en el cálculo';
      setError(errorMsg);
      
      // Guardar error para comparación
      const methodName = methods.find(m => m.id === selectedMethod)?.name || selectedMethod;
      const errorResult = {
        method: methodName,
        error: errorMsg,
        timestamp: new Date().toISOString(),
        parameters: { matrixA, vectorB, vectorX0, norm_type: normType, tol: tolerance, max_count: maxIterations }
      };
      
      setAllResults(prev => {
        const filtered = prev.filter(r => r.method !== methodName);
        return [...filtered, errorResult];
      });
      
    } finally {
      setLoading(false)
    }
  }

  const clearForm = () => {
    setMatrixA(Array(matrixSize).fill(null).map(() => Array(matrixSize).fill('')))
    setVectorB(Array(matrixSize).fill(''))
    setVectorX0(Array(matrixSize).fill('0'))
    setResults(null)
    setError(null)
  }

  const loadExample = () => {
    const exampleMatrix = [
      ['4', '-1', '0'],
      ['-1', '4', '-1'],
      ['0', '-1', '4']
    ]
    const exampleB = ['1', '2', '3']
    const exampleX0 = ['0', '0', '0']

    setMatrixSize(3)
    setMatrixA(exampleMatrix)
    setVectorB(exampleB)
    setVectorX0(exampleX0)
  }

  // Función para ejecutar informe automático de todos los métodos
  const runAutomaticReport = async () => {
    setLoading(true);
    const reportResults: any[] = [];
    
    try {
      const formData = {
        matrixA: matrixA.map(row => row.map(val => parseFloat(val))),
        vectorB: vectorB.map(val => parseFloat(val)),
        vectorX0: vectorX0.map(val => parseFloat(val)),
        norm_type: normType,
        tol: tolerance,
        max_count: maxIterations,
        w: wValue
      };
      
      // Ejecutar todos los métodos disponibles
      for (const method of methods) {
        try {
          let response;
          const startTime = performance.now();
          
          const methodFormData = method.id === 'sor' 
            ? formData 
            : { ...formData, w: undefined };
          
          switch (method.id as MethodType) {
            case 'jacobi':
              response = await chapter2Api.jacobi(methodFormData);
              break;
            case 'gaussSeidel':
              response = await chapter2Api.gaussSeidel(methodFormData);
              break;
            case 'sor':
              response = await chapter2Api.sor(formData);
              break;
          }
          
          const executionTime = performance.now() - startTime;
          
          reportResults.push({
            method: method.name,
            result: response.data.result,
            executionTime: Math.round(executionTime)
          });
          
        } catch (err: any) {
          reportResults.push({
            method: method.name,
            error: err.message || err.response?.data?.error || "Error en el cálculo"
          });
        }
      }
      
      setReportData(reportResults);
      setShowComparisonReport(true);
      
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Link href="/" className="text-purple-600 hover:text-purple-800">
                ← Volver al inicio
              </Link>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Capítulo 2: Sistemas de Ecuaciones Lineales
            </h1>
            <button
              onClick={() => setShowHelp(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              Ayuda
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Panel de métodos */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Seleccionar Método
              </h3>

              <div className="space-y-2 mb-6">
                {methods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id as MethodType)}
                    className={`w-full text-left p-3 rounded-md transition-colors ${
                      selectedMethod === method.id
                        ? (() => {
                            switch (method.id) {
                              case 'jacobi': return 'bg-purple-100 border-purple-500 border text-purple-800'
                              case 'gaussSeidel': return 'bg-indigo-100 border-indigo-500 border text-indigo-800'
                              case 'sor': return 'bg-pink-100 border-pink-500 border text-pink-800'
                              default: return 'bg-gray-100 border-gray-500 border text-gray-800'
                            }
                          })()
                        : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    <div className={`font-medium ${
                      selectedMethod === method.id ? 'text-inherit' : 'text-gray-900'
                    }`}>{method.name}</div>
                    <div className={`text-xs ${
                      selectedMethod === method.id 
                        ? (() => {
                            switch (method.id) {
                              case 'jacobi': return 'text-purple-600'
                              case 'gaussSeidel': return 'text-indigo-600'
                              case 'sor': return 'text-pink-600'
                              default: return 'text-gray-600'
                            }
                          })()
                        : 'text-gray-600'
                    }`}>{method.description}</div>
                  </button>
                ))}
              </div>

              {/* Tamaño de matriz */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tamaño de la matriz
                </label>
                <select
                  value={matrixSize}
                  onChange={(e) => resizeMatrix(parseInt(e.target.value))}
                  className={`${getMethodStyles(selectedMethod)}`}
                >
                  {[2, 3, 4, 5, 6, 7].map(size => (
                    <option key={size} value={size}>{size}x{size}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={loadExample}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Cargar Ejemplo
              </button>
            </div>
          </div>

          {/* Panel principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Configuración de parámetros */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">
                <span className="text-gray-900">Parámetros del Método - </span>
                <span className={`${
                  selectedMethod === 'jacobi'
                    ? 'text-purple-700'
                    : selectedMethod === 'gaussSeidel'
                    ? 'text-indigo-700'
                    : selectedMethod === 'sor'
                    ? 'text-pink-700'
                    : 'text-gray-900'
                }`}>
                  {selectedMethod === 'jacobi' ? 'Jacobi'
                    : selectedMethod === 'gaussSeidel' ? 'Gauss-Seidel'
                    : selectedMethod === 'sor' ? 'SOR'
                    : 'Método'
                  }
                </span>
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Norma
                  </label>
                  <select
                    value={normType}
                    onChange={(e) => setNormType(parseInt(e.target.value))}
                    className={`${getMethodStyles(selectedMethod)}`}
                  >
                    <option value={1}>Norma 1</option>
                    <option value={2}>Norma 2</option>
                    <option value={0}>Norma ∞</option>
                  </select>
                </div>

                {selectedMethod === 'sor' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Factor ω
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="2"
                      value={wValue}
                      onChange={(e) => setWValue(parseFloat(e.target.value))}
                      className={`${getMethodStyles(selectedMethod)}`}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tolerancia
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={tolerance}
                    onChange={(e) => setTolerance(parseFloat(e.target.value))}
                    className={`${getMethodStyles(selectedMethod)}`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max. Iteraciones
                  </label>
                  <input
                    type="number"
                    value={maxIterations}
                    onChange={(e) => setMaxIterations(parseInt(e.target.value))}
                    className={`${getMethodStyles(selectedMethod)}`}
                  />
                </div>
              </div>
            </div>

            {/* Matriz A */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h4 className="text-md font-semibold text-gray-900 mb-4">
                Matriz A ({matrixSize}x{matrixSize})
              </h4>

              <div className="overflow-x-auto">
                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${matrixSize}, 1fr)`, gap: '8px' }}>
                  {matrixA.map((row, i) =>
                    row.map((value, j) => (
                      <input
                        key={`${i}-${j}`}
                        type="text"
                        value={value}
                        onChange={(e) => updateMatrixValue(i, j, e.target.value)}
                        className="w-16 h-12 px-2 text-center border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 text-black"
                        placeholder={`a${i + 1}${j + 1}`}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Vector B */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h4 className="text-md font-semibold text-gray-900 mb-4">
                Vector B
              </h4>

              <div className="flex flex-wrap gap-2">
                {vectorB.map((value, i) => (
                  <input
                    key={i}
                    type="text"
                    value={value}
                    onChange={(e) => updateVectorBValue(i, e.target.value)}
                    className="w-16 h-12 px-2 text-center border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 text-black"
                    placeholder={`b${i + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Vector X0 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h4 className="text-md font-semibold text-gray-900 mb-4">
                Vector Inicial X0
              </h4>

              <div className="flex flex-wrap gap-2">
                {vectorX0.map((value, i) => (
                  <input
                    key={i}
                    type="text"
                    value={value}
                    onChange={(e) => updateVectorX0Value(i, e.target.value)}
                    className="w-16 h-12 px-2 text-center border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 text-black"
                    placeholder={`x${i + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Botones */}
            <div className="flex space-x-4">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 transition-colors"
              >
                {loading ? <LoadingSpinner size="sm" color="gray" /> : 'Calcular'}
              </button>

              <button
                onClick={clearForm}
                className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Limpiar
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="text-red-800">{error}</div>
              </div>
            )}

            {/* Resultados */}
            {results && (
              <div className="space-y-6">
                {/* Matrices T y C */}
                {(results.T || results.C) && (
                  <div className={`border rounded-md p-6 ${
                    selectedMethod === 'jacobi' 
                      ? 'bg-purple-50 border-purple-200' 
                      : selectedMethod === 'gaussSeidel'
                      ? 'bg-indigo-50 border-indigo-200'
                      : selectedMethod === 'sor'
                      ? 'bg-pink-50 border-pink-200'
                      : 'bg-blue-50 border-blue-200'
                  }`}>
                    <h4 className={`font-semibold mb-4 ${
                      selectedMethod === 'jacobi' 
                        ? 'text-purple-800' 
                        : selectedMethod === 'gaussSeidel'
                        ? 'text-indigo-800'
                        : selectedMethod === 'sor'
                        ? 'text-pink-800'
                        : 'text-blue-800'
                    }`}>Matrices del Método</h4>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Matriz T */}
                      {results.T && (
                        <div>
                          <h5 className={`font-medium mb-2 ${
                            selectedMethod === 'jacobi' 
                              ? 'text-purple-700' 
                              : selectedMethod === 'gaussSeidel'
                              ? 'text-indigo-700'
                              : selectedMethod === 'sor'
                              ? 'text-pink-700'
                              : 'text-blue-700'
                          }`}>Matriz T (Iteración)</h5>
                          <div className="bg-white rounded border p-3 overflow-x-auto">
                            <div className="text-sm font-mono">
                              <div className="flex items-center">
                                <span className="mr-2 text-black">T =</span>
                                <div className="border-l-2 border-r-2 border-gray-400 px-2">
                                  {results.T.map((row: number[], i: number) => (
                                    <div key={i} className="flex justify-center space-x-4">
                                      {row.map((val: number, j: number) => (
                                      <span key={j} className="w-20 text-center text-black">
                                          {val.toFixed(6)}
                                        </span>
                                      ))}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Vector C */}
                      {results.C && (
                        <div>
                          <h5 className={`font-medium mb-2 ${
                            selectedMethod === 'jacobi' 
                              ? 'text-purple-700' 
                              : selectedMethod === 'gaussSeidel'
                              ? 'text-indigo-700'
                              : selectedMethod === 'sor'
                              ? 'text-pink-700'
                              : 'text-blue-700'
                          }`}>Vector C (Constante)</h5>
                          <div className="bg-white rounded border p-3">
                            <div className="text-sm font-mono">
                              <div className="flex items-center">
                                <span className="mr-2 text-black">C =</span>
                                <div className="border-l-2 border-r-2 border-gray-400 px-2">
                                  {results.C.map((val: number, i: number) => (
                                    <div key={i} className="text-center text-black">
                                      {val.toFixed(6)}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Radio espectral y convergencia */}
                {results.spectral_radius !== undefined && (
                  <div className={`border rounded-md p-4 ${
                    results.spectral_radius < 1 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                  }`}>
                    <h4 className="font-semibold mb-2 text-black">Análisis de Convergencia</h4>
                    <p className='text-black'><strong>Radio Espectral:</strong> {results.spectral_radius}</p>
                    <p className='text-black'><strong>Convergencia:</strong> {
                      results.spectral_radius < 1 ? 'El método converge' : 'El método no converge'
                    }</p>
                  </div>
                )}

                {/* Tabla de iteraciones personalizada */}
                {results.iterations && results.iterations.length > 0 && (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h4 className="font-semibold mb-4 text-black">Tabla de Iteraciones</h4>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-300">
                        <thead>
                          <tr className={`text-white ${
                            selectedMethod === 'jacobi' 
                              ? 'bg-purple-600' 
                              : selectedMethod === 'gaussSeidel'
                              ? 'bg-indigo-600'
                              : selectedMethod === 'sor'
                              ? 'bg-pink-600'
                              : 'bg-teal-600'
                          }`}>
                            <th className="border border-gray-300 px-4 py-2 text-center font-semibold">
                              Iteración (i)
                            </th>
                            <th className="border border-gray-300 px-4 py-2 text-center font-semibold">
                              Error
                            </th>
                            <th className="border border-gray-300 px-4 py-2 text-center font-semibold">
                              Vector x
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {results.iterations.map((iteration: any[], index: number) => {
                            const [iterNum, error, xVector] = iteration;
                            return (
                              <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                                <td className="border border-gray-300 px-4 py-2 text-center font-medium text-black">
                                  {iterNum}
                                </td>
                                <td className="border border-gray-300 px-4 py-2 text-center text-black">
                                  {typeof error === 'number' ? error.toExponential(2) : error}
                                </td>
                                <td className="border border-gray-300 px-4 py-2">
                                  <div className="flex justify-center">
                                    <div className="font-mono text-sm">
                                      <div className="flex items-center">
                                        <div className="border-l-2 border-r-2 border-gray-400 px-2">
                                          {Array.isArray(xVector) ? (
                                            xVector.map((val: number, i: number) => (
                                            <div key={i} className="text-center py-1 text-black">
                                                {val.toFixed(6)}
                                              </div>
                                            ))
                                          ) : (
                                            <div className="text-center py-1 text-black">-</div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Tabla de iteraciones usando componente ResultTable (respaldo) */}
                {results.iterations && results.iterations.length > 0 && false && (
                  <ResultTable
                    data={results.iterations}
                    title="Tabla de Iteraciones"
                    method={selectedMethod}
                  />
                )}

                {/* Conclusión */}
                {results.conclusion && (
                  <div className={`border rounded-md p-4 ${
                    selectedMethod === 'jacobi' 
                      ? 'bg-purple-50 border-purple-200' 
                      : selectedMethod === 'gaussSeidel'
                      ? 'bg-indigo-50 border-indigo-200'
                      : selectedMethod === 'sor'
                      ? 'bg-pink-50 border-pink-200'
                      : 'bg-green-50 border-green-200'
                  }`}>
                    <h4 className={`font-semibold mb-2 ${
                      selectedMethod === 'jacobi' 
                        ? 'text-purple-800' 
                        : selectedMethod === 'gaussSeidel'
                        ? 'text-indigo-800'
                        : selectedMethod === 'sor'
                        ? 'text-pink-800'
                        : 'text-green-800'
                    }`}>Conclusión</h4>
                    <p className={`${
                      selectedMethod === 'jacobi' 
                        ? 'text-purple-700' 
                        : selectedMethod === 'gaussSeidel'
                        ? 'text-indigo-700'
                        : selectedMethod === 'sor'
                        ? 'text-pink-700'
                        : 'text-pink-700'
                    }`}>{results.conclusion}</p>
                  </div>
                )}

                {/* Botón de reporte automático */}
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-6 text-center">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    Informe de Comparación Automático
                  </h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Ejecuta todos los métodos disponibles y compáralos en un informe detallado
                  </p>
                  <button
                    onClick={runAutomaticReport}
                    disabled={loading}
                    className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors font-semibold shadow-md"
                  >
                    {loading ? <LoadingSpinner size="sm" color="gray" /> : 'Generar Informe Automático'}
                  </button>
                  <p className="text-xs text-gray-500 mt-3">
                    El informe ejecutará: Jacobi, Gauss-Seidel y SOR
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de ayuda */}
      <HelpModal
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
        title="Ayuda - Capítulo 2: Sistemas de Ecuaciones Lineales"
      >
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-900">Cómo ingresar datos:</h4>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
              <li>Ingrese números decimales (use punto como separador)</li>
              <li>La matriz debe ser cuadrada (nxn)</li>
              <li>El vector B debe tener n elementos</li>
              <li>El vector inicial X0 puede ser cero o una aproximación inicial</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900">Métodos disponibles:</h4>
            <div className="space-y-2">
              <div className='text-black'><strong>Jacobi:</strong> Método básico, usa valores de la iteración anterior</div>
              <div className='text-black'><strong>Gauss-Seidel:</strong> Usa valores actualizados durante la misma iteración</div>
              <div className='text-black'><strong>SOR:</strong> Acelera la convergencia con factor de relajación ω</div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900">Tipos de Norma:</h4>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
              <li><strong>Norma 1:</strong> Suma de valores absolutos</li>
              <li><strong>Norma 2:</strong> Norma euclidiana</li>
              <li><strong>Norma ∞:</strong> Máximo valor absoluto</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900">Consejos:</h4>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
              <li>Para convergencia garantizada, la matriz debe ser diagonalmente dominante</li>
              <li>Para SOR, ω ∈ (0,2). Valores cerca de 1.2-1.8 suelen ser buenos</li>
              <li>Si el radio espectral ≥ 1, el método no convergerá</li>
            </ul>
          </div>
        </div>
      </HelpModal>

      {/* Reporte de comparación */}
      {showComparisonReport && reportData.length > 0 && (
        <ComparisonReport
          title="Informe de Comparación de Métodos - Capítulo 2"
          chapter={2}
          data={reportData}
          onClose={() => setShowComparisonReport(false)}
        />
      )}
    </div>
  )
}
