'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { chapter3Api } from '@/lib/api'
import HelpModal from '@/components/HelpModal'
import LoadingSpinner from '@/components/LoadingSpinner'
import ResultTable from '@/components/ResultTable'
import InteractivePlot from '@/components/InteractivePlot'
import ComparisonReport from '@/components/ComparisonReport'

type MethodType = 'lagrange' | 'newtonInterpolation' | 'splineCubico' | 'splineLineal' | 'vandermonde'

export default function Chapter3() {
  const [selectedMethod, setSelectedMethod] = useState<MethodType>('lagrange')
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showHelp, setShowHelp] = useState(false)
  const [showReport, setShowReport] = useState(false)
  const [showInteractivePlot, setShowInteractivePlot] = useState(false)
  const [pointCount, setPointCount] = useState(4)
  const [allResults, setAllResults] = useState<any[]>([])
  const [reportData, setReportData] = useState<any[]>([])
  const [showComparisonReport, setShowComparisonReport] = useState(false)

  // Estados para los puntos con valores de ejemplo por defecto
  const [xValues, setXValues] = useState<string[]>(['0', '1', '2', '3'])
  const [yValues, setYValues] = useState<string[]>(['1', '2', '5', '10'])

  // Función para obtener estilos específicos del método
  const getMethodStyles = (method: MethodType) => {
    const baseClass = "w-full px-3 py-2 border-2 rounded-md focus:outline-none focus:ring-2 transition-colors text-black"
    switch (method) {
      case 'lagrange':
        return `${baseClass} border-green-300 bg-green-50 focus:border-green-500 focus:ring-green-200`
      case 'newtonInterpolation':
        return `${baseClass} border-blue-300 bg-blue-50 focus:border-blue-500 focus:ring-blue-200`
      case 'splineCubico':
        return `${baseClass} border-purple-300 bg-purple-50 focus:border-purple-500 focus:ring-purple-200`
      case 'splineLineal':
        return `${baseClass} border-orange-300 bg-orange-50 focus:border-orange-500 focus:ring-orange-200`
      case 'vandermonde':
        return `${baseClass} border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-200`
      default:
        return `${baseClass} border-gray-300 bg-gray-50 focus:border-gray-500 focus:ring-gray-200`
    }
  }

  // Valores de ejemplo para cada método
  const getExampleValues = (method: MethodType) => {
    switch (method) {
      case 'lagrange':
        return {
          xValues: ['0', '1', '2', '3'],
          yValues: ['1', '2', '5', '10'],
          pointCount: 4
        }
      case 'newtonInterpolation':
        return {
          xValues: ['-1', '0', '1', '2'],
          yValues: ['2', '1', '2', '5'],
          pointCount: 4
        }
      case 'splineCubico':
        return {
          xValues: ['0', '1', '2', '3', '4'],
          yValues: ['0', '1', '4', '9', '16'],
          pointCount: 5
        }
      case 'splineLineal':
        return {
          xValues: ['1', '2', '3', '4'],
          yValues: ['2', '4', '6', '8'],
          pointCount: 4
        }
      case 'vandermonde':
        return {
          xValues: ['0', '1', '2'],
          yValues: ['1', '3', '7'],
          pointCount: 3
        }
      default:
        return {
          xValues: ['0', '1', '2', '3'],
          yValues: ['1', '2', '5', '10'],
          pointCount: 4
        }
    }
  }

  // Efecto para cargar valores de ejemplo cuando cambia el método
  useEffect(() => {
    // Limpiar resultados anteriores
    setResults(null)
    setError(null)
    setShowReport(false)
    setShowInteractivePlot(false)  // Cerrar gráfica interactiva
    
    // Cargar valores de ejemplo
    const examples = getExampleValues(selectedMethod)
    setPointCount(examples.pointCount)
    setXValues(examples.xValues)
    setYValues(examples.yValues)
  }, [selectedMethod])

  const methods = [
    { id: 'lagrange', name: 'Lagrange', description: 'Interpolación polinómica usando bases de Lagrange' },
    { id: 'newtonInterpolation', name: 'Newton Interpolante', description: 'Diferencias divididas de Newton' },
    { id: 'splineCubico', name: 'Spline Cúbico', description: 'Interpolación suave por tramos cúbicos' },
    { id: 'splineLineal', name: 'Spline Lineal', description: 'Interpolación lineal por tramos' },
    { id: 'vandermonde', name: 'Vandermonde', description: 'Solución directa del sistema de Vandermonde' }
  ]

  const resizePoints = (newCount: number) => {
    const newX = Array(newCount).fill(null).map((_, i) => xValues[i] || '')
    const newY = Array(newCount).fill(null).map((_, i) => yValues[i] || '')

    setXValues(newX)
    setYValues(newY)
    setPointCount(newCount)
  }

  const updateXValue = (i: number, value: string) => {
    const newValues = [...xValues]
    newValues[i] = value
    setXValues(newValues)
  }

  const updateYValue = (i: number, value: string) => {
    const newValues = [...yValues]
    newValues[i] = value
    setYValues(newValues)
  }

  // Función para abrir la gráfica interactiva
  const handlePlotFunction = () => {
    if (!xValues.some(x => x.trim()) || !yValues.some(y => y.trim())) {
      alert('Por favor, ingresa los puntos primero')
      return
    }
    
    // Crear una función polinómica simple basada en los puntos
    // Para simplicidad, usaremos los puntos como una función básica
    const functionText = `x**2`  // Función por defecto para graficar
    setShowInteractivePlot(true)
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)

    try {
      // Convertir strings a números
      const numXValues = xValues.map(val => {
        const num = parseFloat(val)
        if (isNaN(num)) throw new Error(`Valor inválido en X: "${val}"`)
        return num
      })

      const numYValues = yValues.map(val => {
        const num = parseFloat(val)
        if (isNaN(num)) throw new Error(`Valor inválido en Y: "${val}"`)
        return num
      })

      // Validar que no hay valores vacíos
      if (numXValues.length !== pointCount || numYValues.length !== pointCount) {
        throw new Error('Todos los puntos deben estar completos')
      }

      const formData = {
        x_values: numXValues,
        y_values: numYValues
      }

      let response
      switch (selectedMethod) {
        case 'lagrange':
          response = await chapter3Api.lagrange(formData)
          break
        case 'newtonInterpolation':
          response = await chapter3Api.newtonInterpolation(formData)
          break
        case 'splineCubico':
          response = await chapter3Api.splineCubico(formData)
          break
        case 'splineLineal':
          response = await chapter3Api.splineLineal(formData)
          break
        case 'vandermonde':
          response = await chapter3Api.vandermonde(formData)
          break
      }

      const methodResult = response.data.result
      setResults(methodResult)
      
      // Guardar resultado para comparación
      const methodName = methods.find(m => m.id === selectedMethod)?.name || selectedMethod
      const newResult = {
        method: methodName,
        result: methodResult,
        timestamp: new Date().toISOString(),
        parameters: { xValues: numXValues, yValues: numYValues }
      }
      
      setAllResults(prev => {
        const filtered = prev.filter(r => r.method !== methodName)
        return [...filtered, newResult]
      })
      
    } catch (err: any) {
      const errorMsg = err.message || err.response?.data?.error || 'Error en el cálculo'
      setError(errorMsg)
      
      // Guardar error para comparación
      const methodName = methods.find(m => m.id === selectedMethod)?.name || selectedMethod
      const errorResult = {
        method: methodName,
        error: errorMsg,
        timestamp: new Date().toISOString(),
        parameters: { xValues, yValues }
      }
      
      setAllResults(prev => {
        const filtered = prev.filter(r => r.method !== methodName)
        return [...filtered, errorResult]
      })
      
    } finally {
      setLoading(false)
    }
  }

  const clearForm = () => {
    setXValues(Array(pointCount).fill(''))
    setYValues(Array(pointCount).fill(''))
    setResults(null)
    setError(null)
  }

  const loadExample = () => {
    const exampleX = ['0', '1', '2', '3']
    const exampleY = ['1', '2', '5', '10']

    setPointCount(4)
    setXValues(exampleX)
    setYValues(exampleY)
  }

  // Función para ejecutar informe automático de todos los métodos
  const runAutomaticReport = async () => {
    setLoading(true)
    const reportResults: any[] = []
    
    try {
      const numXValues = xValues.map(val => {
        const num = parseFloat(val)
        if (isNaN(num)) throw new Error(`Valor inválido en X: "${val}"`)
        return num
      })

      const numYValues = yValues.map(val => {
        const num = parseFloat(val)
        if (isNaN(num)) throw new Error(`Valor inválido en Y: "${val}"`)
        return num
      })
      
      const formData = {
        x_values: numXValues,
        y_values: numYValues
      }
      
      // Ejecutar todos los métodos disponibles
      for (const method of methods) {
        try {
          let response
          const startTime = performance.now()
          
          switch (method.id as MethodType) {
            case 'vandermonde':
              response = await chapter3Api.vandermonde(formData)
              break
            case 'newtonInterpolation':
              response = await chapter3Api.newtonInterpolation(formData)
              break
            case 'lagrange':
              response = await chapter3Api.lagrange(formData)
              break
            case 'splineLineal':
              response = await chapter3Api.splineLineal(formData)
              break
            case 'splineCubico':
              response = await chapter3Api.splineCubico(formData)
              break
          }
          
          const executionTime = performance.now() - startTime
          
          reportResults.push({
            method: method.name,
            result: response.data.result,
            executionTime: Math.round(executionTime)
          })
          
        } catch (err: any) {
          reportResults.push({
            method: method.name,
            error: err.message || err.response?.data?.error || 'Error en el cálculo'
          })
        }
      }
      
      setReportData(reportResults)
      setShowComparisonReport(true)
      
    } catch (err: any) {
      setError(err.message || 'Error al generar el informe automático')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Link href="/" className="text-green-600 hover:text-green-800">
                ← Volver al inicio
              </Link>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Capítulo 3: Interpolación
            </h1>
            <button
              onClick={() => setShowHelp(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
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
                              case 'lagrange': return 'bg-green-100 border-green-500 border text-green-800'
                              case 'newtonInterpolation': return 'bg-blue-100 border-blue-500 border text-blue-800'
                              case 'splineCubico': return 'bg-purple-100 border-purple-500 border text-purple-800'
                              case 'splineLineal': return 'bg-orange-100 border-orange-500 border text-orange-800'
                              case 'vandermonde': return 'bg-red-100 border-red-500 border text-red-800'
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
                              case 'lagrange': return 'text-green-600'
                              case 'newtonInterpolation': return 'text-blue-600'
                              case 'splineCubico': return 'text-purple-600'
                              case 'splineLineal': return 'text-orange-600'
                              case 'vandermonde': return 'text-red-600'
                              default: return 'text-gray-600'
                            }
                          })()
                        : 'text-gray-600'
                    }`}>{method.description}</div>
                  </button>
                ))}
              </div>

              {/* Número de puntos */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de puntos
                </label>
                <select
                  value={pointCount}
                  onChange={(e) => resizePoints(parseInt(e.target.value))}
                  className={`${getMethodStyles(selectedMethod)}`}
                >
                  {[2, 3, 4, 5, 6, 7, 8].map(count => (
                    <option key={count} value={count}>{count} puntos</option>
                  ))}
                </select>
              </div>

              <button
                onClick={loadExample}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Cargar Ejemplo
              </button>
            </div>
          </div>

          {/* Panel principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Entrada de puntos */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">
                <span className="text-gray-900">Puntos para Interpolación - </span>
                <span className={`${
                  selectedMethod === 'lagrange' 
                    ? 'text-green-700' 
                    : selectedMethod === 'newtonInterpolation'
                    ? 'text-blue-700'
                    : selectedMethod === 'splineCubico'
                    ? 'text-purple-700'
                    : selectedMethod === 'splineLineal'
                    ? 'text-orange-700'
                    : selectedMethod === 'vandermonde'
                    ? 'text-red-700'
                    : 'text-gray-900'
                }`}>
                  {selectedMethod === 'lagrange' ? 'Lagrange'
                    : selectedMethod === 'newtonInterpolation' ? 'Newton Interpolante'
                    : selectedMethod === 'splineCubico' ? 'Spline Cúbico'
                    : selectedMethod === 'splineLineal' ? 'Spline Lineal'
                    : selectedMethod === 'vandermonde' ? 'Vandermonde'
                    : 'Método'
                  }
                </span>
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Valores X</h4>
                    <div className="space-y-2">
                      {xValues.map((value, i) => (
                        <input
                          key={i}
                          type="text"
                          value={value}
                          onChange={(e) => updateXValue(i, e.target.value)}
                          className={`${getMethodStyles(selectedMethod)}`}
                          placeholder={`x${i + 1}`}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Valores Y</h4>
                    <div className="space-y-2">
                      {yValues.map((value, i) => (
                        <input
                          key={i}
                          type="text"
                          value={value}
                          onChange={(e) => updateYValue(i, e.target.value)}
                          className={`${getMethodStyles(selectedMethod)}`}
                          placeholder={`y${i + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Vista de tabla */}
                <div className="mt-6">
                  <h4 className={`font-medium mb-2 ${
                    selectedMethod === 'lagrange' 
                      ? 'text-green-700' 
                      : selectedMethod === 'newtonInterpolation'
                      ? 'text-blue-700'
                      : selectedMethod === 'splineCubico'
                      ? 'text-purple-700'
                      : selectedMethod === 'splineLineal'
                      ? 'text-orange-700'
                      : selectedMethod === 'vandermonde'
                      ? 'text-red-700'
                      : 'text-gray-700'
                  }`}>Vista de Tabla</h4>
                  <div className="overflow-x-auto">
                    <table className={`w-full border-collapse border-2 ${
                      selectedMethod === 'lagrange' 
                        ? 'border-green-300' 
                        : selectedMethod === 'newtonInterpolation'
                        ? 'border-blue-300'
                        : selectedMethod === 'splineCubico'
                        ? 'border-purple-300'
                        : selectedMethod === 'splineLineal'
                        ? 'border-orange-300'
                        : selectedMethod === 'vandermonde'
                        ? 'border-red-300'
                        : 'border-gray-300'
                    }`}>
                      <thead>
                        <tr className={`${
                          selectedMethod === 'lagrange' 
                            ? 'bg-green-100' 
                            : selectedMethod === 'newtonInterpolation'
                            ? 'bg-blue-100'
                            : selectedMethod === 'splineCubico'
                            ? 'bg-purple-100'
                            : selectedMethod === 'splineLineal'
                            ? 'bg-orange-100'
                            : selectedMethod === 'vandermonde'
                            ? 'bg-red-100'
                            : 'bg-gray-50'
                        }`}>
                          <th className={`border px-3 py-2 text-center font-semibold ${
                            selectedMethod === 'lagrange' 
                              ? 'border-green-300 text-green-800' 
                              : selectedMethod === 'newtonInterpolation'
                              ? 'border-blue-300 text-blue-800'
                              : selectedMethod === 'splineCubico'
                              ? 'border-purple-300 text-purple-800'
                              : selectedMethod === 'splineLineal'
                              ? 'border-orange-300 text-orange-800'
                              : selectedMethod === 'vandermonde'
                              ? 'border-red-300 text-red-800'
                              : 'border-gray-300 text-black'
                          }`}>Punto</th>
                          {xValues.map((_, i) => (
                            <th key={i} className={`border px-3 py-2 text-center font-semibold ${
                              selectedMethod === 'lagrange' 
                                ? 'border-green-300 text-green-800' 
                                : selectedMethod === 'newtonInterpolation'
                                ? 'border-blue-300 text-blue-800'
                                : selectedMethod === 'splineCubico'
                                ? 'border-purple-300 text-purple-800'
                                : selectedMethod === 'splineLineal'
                                ? 'border-orange-300 text-orange-800'
                                : selectedMethod === 'vandermonde'
                                ? 'border-red-300 text-red-800'
                                : 'border-gray-300 text-black'
                            }`}>
                              {i + 1}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className={`border px-3 py-2 font-medium ${
                            selectedMethod === 'lagrange' 
                              ? 'border-green-300 bg-green-50 text-green-800' 
                              : selectedMethod === 'newtonInterpolation'
                              ? 'border-blue-300 bg-blue-50 text-blue-800'
                              : selectedMethod === 'splineCubico'
                              ? 'border-purple-300 bg-purple-50 text-purple-800'
                              : selectedMethod === 'splineLineal'
                              ? 'border-orange-300 bg-orange-50 text-orange-800'
                              : selectedMethod === 'vandermonde'
                              ? 'border-red-300 bg-red-50 text-red-800'
                              : 'border-gray-300 bg-gray-50 text-black'
                          }`}>X</td>
                          {xValues.map((value, i) => (
                            <td key={i} className={`border px-3 py-2 text-center ${
                              selectedMethod === 'lagrange' 
                                ? 'border-green-300 text-green-700' 
                                : selectedMethod === 'newtonInterpolation'
                                ? 'border-blue-300 text-blue-700'
                                : selectedMethod === 'splineCubico'
                                ? 'border-purple-300 text-purple-700'
                                : selectedMethod === 'splineLineal'
                                ? 'border-orange-300 text-orange-700'
                                : selectedMethod === 'vandermonde'
                                ? 'border-red-300 text-red-700'
                                : 'border-gray-300 text-black'
                            }`}>
                              {value || '-'}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className={`border px-3 py-2 font-medium ${
                            selectedMethod === 'lagrange' 
                              ? 'border-green-300 bg-green-50 text-green-800' 
                              : selectedMethod === 'newtonInterpolation'
                              ? 'border-blue-300 bg-blue-50 text-blue-800'
                              : selectedMethod === 'splineCubico'
                              ? 'border-purple-300 bg-purple-50 text-purple-800'
                              : selectedMethod === 'splineLineal'
                              ? 'border-orange-300 bg-orange-50 text-orange-800'
                              : selectedMethod === 'vandermonde'
                              ? 'border-red-300 bg-red-50 text-red-800'
                              : 'border-gray-300 bg-gray-50 text-black'
                          }`}>Y</td>
                          {yValues.map((value, i) => (
                            <td key={i} className={`border px-3 py-2 text-center ${
                              selectedMethod === 'lagrange' 
                                ? 'border-green-300 text-green-700' 
                                : selectedMethod === 'newtonInterpolation'
                                ? 'border-blue-300 text-blue-700'
                                : selectedMethod === 'splineCubico'
                                ? 'border-purple-300 text-purple-700'
                                : selectedMethod === 'splineLineal'
                                ? 'border-orange-300 text-orange-700'
                                : selectedMethod === 'vandermonde'
                                ? 'border-red-300 text-red-700'
                                : 'border-gray-300 text-black'
                            }`}>
                              {value || '-'}
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Botón de graficación */}
                <div className="flex justify-center mt-4">
                  <button
                    type="button"
                    onClick={handlePlotFunction}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors whitespace-nowrap"
                  >
                    Graficar Puntos
                  </button>
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="flex space-x-4">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {loading ? <LoadingSpinner size="sm" color="gray" /> : 'Calcular Interpolación'}
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
                {/* Advertencia */}
                {results.warning && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                    <div className="text-yellow-800">{results.warning}</div>
                  </div>
                )}

                {/* Tabla de datos de interpolación */}
                {results.iterations && results.iterations.length > 0 && (
                  <ResultTable
                    data={results.iterations}
                    title="Tabla de Datos de Interpolación"
                    method={selectedMethod}
                  />
                )}

                {/* Polinomio resultado */}
                {results.polynomial_str && (
                  <div className={`border rounded-md p-4 ${
                    selectedMethod === 'lagrange' 
                      ? 'bg-green-50 border-green-200' 
                      : selectedMethod === 'newtonInterpolation'
                      ? 'bg-blue-50 border-blue-200'
                      : selectedMethod === 'splineCubico'
                      ? 'bg-purple-50 border-purple-200'
                      : selectedMethod === 'splineLineal'
                      ? 'bg-orange-50 border-orange-200'
                      : selectedMethod === 'vandermonde'
                      ? 'bg-red-50 border-red-200'
                      : 'bg-blue-50 border-blue-200'
                  }`}>
                    <h4 className={`font-semibold mb-2 ${
                      selectedMethod === 'lagrange' 
                        ? 'text-green-800' 
                        : selectedMethod === 'newtonInterpolation'
                        ? 'text-blue-800'
                        : selectedMethod === 'splineCubico'
                        ? 'text-purple-800'
                        : selectedMethod === 'splineLineal'
                        ? 'text-orange-800'
                        : selectedMethod === 'vandermonde'
                        ? 'text-red-800'
                        : 'text-blue-800'
                    }`}>Polinomio Resultante</h4>
                    <div className={`font-mono text-sm bg-white p-3 rounded border overflow-x-auto ${
                      selectedMethod === 'lagrange' 
                        ? 'text-green-700' 
                        : selectedMethod === 'newtonInterpolation'
                        ? 'text-blue-700'
                        : selectedMethod === 'splineCubico'
                        ? 'text-purple-700'
                        : selectedMethod === 'splineLineal'
                        ? 'text-orange-700'
                        : selectedMethod === 'vandermonde'
                        ? 'text-red-700'
                        : 'text-blue-700'
                    }`}>
                      P(x) = {results.polynomial_str}
                    </div>
                  </div>
                )}

                {/* Splines */}
                {results.splines && results.splines.length > 0 && (
                  <div className={`border rounded-md p-4 ${
                    selectedMethod === 'splineCubico'
                      ? 'bg-purple-50 border-purple-200'
                      : selectedMethod === 'splineLineal'
                      ? 'bg-orange-50 border-orange-200'
                      : 'bg-green-50 border-green-200'
                  }`}>
                    <h4 className={`font-semibold mb-2 ${
                      selectedMethod === 'splineCubico'
                        ? 'text-purple-800'
                        : selectedMethod === 'splineLineal'
                        ? 'text-orange-800'
                        : 'text-green-800'
                    }`}>
                      {selectedMethod.includes('spline') ? 'Funciones por Tramos' : 'Splines'}
                    </h4>
                    <div className="space-y-2">
                      {results.splines.map((spline: string, index: number) => (
                        <div key={index} className={`font-mono text-sm bg-white p-3 rounded border overflow-x-auto ${
                          selectedMethod === 'splineCubico'
                            ? 'text-purple-700'
                            : selectedMethod === 'splineLineal'
                            ? 'text-orange-700'
                            : 'text-green-700'
                        }`}>
                          Tramo {index + 1}: {spline}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Gráfico */}
                {results.image_base64 && (
                  <div className={`rounded-lg shadow-md p-6 ${
                    selectedMethod === 'lagrange' 
                      ? 'bg-green-50 border border-green-200' 
                      : selectedMethod === 'newtonInterpolation'
                      ? 'bg-blue-50 border border-blue-200'
                      : selectedMethod === 'splineCubico'
                      ? 'bg-purple-50 border border-purple-200'
                      : selectedMethod === 'splineLineal'
                      ? 'bg-orange-50 border border-orange-200'
                      : selectedMethod === 'vandermonde'
                      ? 'bg-red-50 border border-red-200'
                      : 'bg-white border border-gray-200'
                  }`}>
                    <h4 className={`font-semibold mb-4 ${
                      selectedMethod === 'lagrange' 
                        ? 'text-green-800' 
                        : selectedMethod === 'newtonInterpolation'
                        ? 'text-blue-800'
                        : selectedMethod === 'splineCubico'
                        ? 'text-purple-800'
                        : selectedMethod === 'splineLineal'
                        ? 'text-orange-800'
                        : selectedMethod === 'vandermonde'
                        ? 'text-red-800'
                        : 'text-gray-900'
                    }`}>Gráfico de Interpolación - {
                      selectedMethod === 'lagrange' ? 'Lagrange'
                      : selectedMethod === 'newtonInterpolation' ? 'Newton'
                      : selectedMethod === 'splineCubico' ? 'Spline Cúbico'
                      : selectedMethod === 'splineLineal' ? 'Spline Lineal'
                      : selectedMethod === 'vandermonde' ? 'Vandermonde'
                      : 'Método'
                    }</h4>
                    <div className="text-center bg-white rounded-lg border p-4">
                      <img
                        src={`data:image/png;base64,${results.image_base64}`}
                        alt="Gráfico de interpolación"
                        className="max-w-full h-auto mx-auto rounded shadow-sm"
                      />
                    </div>
                  </div>
                )}

                {/* Botón de reporte automático */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6 text-center">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    Informe de Comparación Automático
                  </h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Ejecuta todos los métodos disponibles y compáralos en un informe detallado
                  </p>
                  <button
                    onClick={runAutomaticReport}
                    disabled={loading}
                    className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors font-semibold shadow-md"
                  >
                    {loading ? <LoadingSpinner size="sm" color="gray" /> : 'Generar Informe Automático'}
                  </button>
                  <p className="text-xs text-gray-500 mt-3">
                    El informe ejecutará: Lagrange, Newton Interpolante, Spline Cúbico, Spline Lineal y Vandermonde
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
        title="Ayuda - Capítulo 3: Interpolación"
      >
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-900">Cómo ingresar datos:</h4>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
              <li>Ingrese números decimales (use punto como separador)</li>
              <li>Los valores X deben ser únicos (no repetidos)</li>
              <li>Puede usar hasta 8 puntos para interpolación</li>
              <li>Ordene los puntos por X para mejores resultados</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900">Métodos disponibles:</h4>
            <div className="space-y-2">
              <div className='text-black'><strong>Lagrange:</strong> Polinomio usando productos de bases de Lagrange</div>
              <div className='text-black'><strong>Newton:</strong> Diferencias divididas, más eficiente computacionalmente</div>
              <div className='text-black'><strong>Vandermonde:</strong> Solución directa del sistema lineal</div>
              <div className='text-black'><strong>Spline Lineal:</strong> Segmentos lineales entre puntos consecutivos</div>
              <div className='text-black'><strong>Spline Cúbico:</strong> Segmentos cúbicos suaves, continua hasta la segunda derivada</div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900">Consejos:</h4>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
              <li>Para muchos puntos, prefiera splines sobre polinomios</li>
              <li>Los polinomios de alto grado pueden oscilar mucho</li>
              <li>Los splines cúbicos dan curvas más suaves</li>
              <li>Newton es numéricamente más estable que Vandermonde</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900">Ejemplo de entrada:</h4>
            <div className="text-sm text-gray-600">
              X: 0, 1, 2, 3<br/>
              Y: 1, 2, 5, 10
            </div>
          </div>
        </div>
      </HelpModal>

      {/* Gráfica interactiva */}
      {showInteractivePlot && (
        <InteractivePlot
          functionText="x**2"
          onClose={() => setShowInteractivePlot(false)}
        />
      )}

      {/* Reporte de comparación */}
      {showComparisonReport && reportData.length > 0 && (
        <ComparisonReport
          title="Informe de Comparación de Métodos - Capítulo 3"
          chapter={3}
          data={reportData}
          onClose={() => setShowComparisonReport(false)}
        />
      )}
    </div>
  )
}
