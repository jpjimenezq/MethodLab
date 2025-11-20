'use client'
import React from 'react'

interface ReportData {
  method: string
  result: any
  error?: string
  executionTime?: number
}

interface ComparisonReportProps {
  title: string
  data: ReportData[]
  chapter: 1 | 2 | 3
  onClose: () => void
}

export default function ComparisonReport({ title, data, chapter, onClose }: ComparisonReportProps) {
  
  // Debug: Ver qué datos llegan
  console.log('📊 ComparisonReport - Data received:', data)
  console.log('📊 ComparisonReport - Chapter:', chapter)
  
  // Debug específico para capítulo 2
  if (chapter === 2) {
    data.forEach(item => {
      console.log(`🔍 Método: ${item.method}`)
      console.log(`  - spectral_radius:`, item.result?.spectral_radius)
      console.log(`  - iterations length:`, item.result?.iterations?.length)
      console.log(`  - error:`, item.error)
    })
  }
  
  // Función para analizar los mejores métodos según diferentes criterios
  const analyzeResults = () => {
    const validResults = data.filter(item => !item.error && item.result)
    
    if (validResults.length === 0) return null

    let analysis: any = {}

    if (chapter === 1) {
      // Capítulo 1: Analizar convergencia, iteraciones, error relativo/absoluto
      analysis = {
        convergence: validResults.filter(item => item.result.conclusion?.toLowerCase().includes('convergencia') || 
                                                item.result.iterations?.length > 0),
        iterations: validResults.map(item => ({
          method: item.method,
          iterations: item.result.iterations?.length || 0
        })).sort((a, b) => a.iterations - b.iterations),
        finalError: validResults.map(item => {
          const lastIteration = item.result.iterations?.[item.result.iterations.length - 1]
          // El error puede estar en diferentes posiciones según el método
          let error = Infinity
          if (lastIteration && Array.isArray(lastIteration)) {
            console.log(`🔍 ${item.method} - lastIteration completo:`, lastIteration)
            
            // Intentar extraer el error de diferentes posiciones
            let errorVal = lastIteration[lastIteration.length - 1] // Última posición (común)
            
            if (typeof errorVal !== 'number' || isNaN(errorVal)) {
              errorVal = lastIteration[2] // Posición 2 (algunos métodos)
            }
            if (typeof errorVal !== 'number' || isNaN(errorVal)) {
              errorVal = lastIteration[3] // Posición 3 (otros métodos)
            }
            
            console.log(`🔍 ${item.method} - errorVal final:`, errorVal)
            
            if (typeof errorVal === 'number' && !isNaN(errorVal) && errorVal !== Infinity) {
              error = errorVal
            }
          }
          return { method: item.method, error }
        }).sort((a, b) => {
          // Manejar Infinity correctamente en el sort
          if (a.error === Infinity && b.error === Infinity) return 0
          if (a.error === Infinity) return 1
          if (b.error === Infinity) return -1
          return a.error - b.error
        }),
        errorType: validResults.map(item => ({
          method: item.method,
          type: item.result.error_type || 'relativo',
          tolerance: item.result.tolerance || 'N/A'
        }))
      }
    } else if (chapter === 2) {
      // Capítulo 2: Analizar convergencia, radio espectral, iteraciones, tipos de error
      analysis = {
        convergence: validResults.filter(item => item.result.spectral_radius < 1),
        spectralRadius: validResults.map(item => ({
          method: item.method,
          radius: item.result.spectral_radius || Infinity
        })).sort((a, b) => a.radius - b.radius),
        iterations: validResults.map(item => ({
          method: item.method,
          iterations: item.result.iterations?.length || 0
        })).sort((a, b) => a.iterations - b.iterations),
        finalError: validResults.map(item => {
          const lastIteration = item.result.iterations?.[item.result.iterations.length - 1]
          const error = lastIteration ? lastIteration[1] : Infinity // error está en posición 1
          return { method: item.method, error }
        }).sort((a, b) => a.error - b.error),
        normType: validResults.map(item => ({
          method: item.method,
          norm: item.result.norm_type || 'N/A'
        }))
      }
    } else if (chapter === 3) {
      // Capítulo 3: Analizar interpolación, error de aproximación
      analysis = {
        polynomialDegree: validResults.map(item => ({
          method: item.method,
          degree: item.result.polynomial?.length || 0
        })),
        hasSplines: validResults.filter(item => item.result.splines?.length > 0),
        complexity: validResults.map(item => ({
          method: item.method,
          type: item.result.splines ? 'Por tramos' : 'Polinomio único',
          segments: item.result.splines?.length || 1
        }))
      }
    }

    return analysis
  }

  const analysis = analyzeResults()

  // Función para determinar el mejor método
  const getBestMethod = () => {
    if (!analysis) return { method: "No hay datos suficientes para comparar", reason: "" }

    if (chapter === 1) {
      // Mejor método: el que tenga mejor balance entre error y eficiencia
      const converged = analysis.finalError.filter((item: any) => {
        const isValid = item.error !== undefined && 
                       item.error !== null && 
                       item.error !== Infinity && 
                       typeof item.error === 'number' && 
                       !isNaN(item.error)
        return isValid
      })
      
      if (converged.length > 0) {
        // Encontrar el método con menos iteraciones entre los que tienen error válido
        let best = converged[0]
        let bestIterations = Infinity
        
        converged.forEach((item: any) => {
          const iterData = analysis.iterations.find((iter: any) => iter.method === item.method)
          const iters = iterData?.iterations || Infinity
          // Priorizar: menos iteraciones si el error es comparable (diferencia < 10x)
          if (iters < bestIterations && item.error < best.error * 10) {
            best = item
            bestIterations = iters
          }
        })
        
        const iterData = analysis.iterations.find((iter: any) => iter.method === best.method)
        return {
          method: best.method,
          reason: `${iterData?.iterations || 0} iteraciones con error ${best.error.toExponential(4)}`
        }
      }
      
      // Si no hay errores válidos pero hay métodos que convergieron
      if (analysis.convergence.length > 0) {
        const best = analysis.iterations[0] // El más rápido
        return {
          method: best.method,
          reason: `Convergió en ${best.iterations} iteraciones`
        }
      }
      
      return { method: "Ninguno convergió exitosamente", reason: "" }
    } else if (chapter === 2) {
      // Mejor método: converge (radio < 1) con menor número de iteraciones
      const convergent = analysis.spectralRadius.filter((item: any) => item.radius < 1)
      if (convergent.length > 0) {
        const best = convergent[0]
        const iterations = analysis.iterations.find((item: any) => item.method === best.method)
        return {
          method: best.method,
          reason: `Radio espectral ${best.radius.toFixed(4)} < 1 (converge) con ${iterations?.iterations || 0} iteraciones`
        }
      }
      return { method: "Ninguno convergió (radio ≥ 1)", reason: "" }
    } else if (chapter === 3) {
      // Para interpolación: splines para muchos puntos, polinómico para pocos
      const validResults = data.filter(item => !item.error && item.result)
      if (validResults.length > 0) {
        const hasSpline = validResults.find(item => item.result.splines)
        if (hasSpline) {
          return {
            method: hasSpline.method,
            reason: "Splines proporcionan interpolación suave sin oscilaciones"
          }
        }
        return {
          method: validResults[0].method,
          reason: "Interpolación polinómica exitosa"
        }
      }
    }

    return { method: "No determinado", reason: "" }
  }

  const getMethodColor = (method: string, chapter: number) => {
    if (chapter === 1) {
      switch (method.toLowerCase().replace(/\s+/g, '')) {
        case 'bisección':
        case 'bisection': return 'text-blue-700'
        case 'newton-raphson':
        case 'newton': return 'text-green-700'
        case 'puntofijo': return 'text-purple-700'
        case 'raícesmúltiples':
        case 'raicesmultiples': return 'text-orange-700'
        case 'reglafalsa': return 'text-pink-700'
        case 'secante': return 'text-teal-700'
        default: return 'text-gray-700'
      }
    } else if (chapter === 2) {
      switch (method.toLowerCase()) {
        case 'jacobi': return 'text-purple-700'
        case 'gauss-seidel': return 'text-indigo-700'
        case 'sor': return 'text-pink-700'
        default: return 'text-gray-700'
      }
    } else if (chapter === 3) {
      switch (method.toLowerCase()) {
        case 'lagrange': return 'text-green-700'
        case 'newton interpolante': return 'text-blue-700'
        case 'spline cúbico': return 'text-purple-700'
        case 'spline lineal': return 'text-orange-700'
        case 'vandermonde': return 'text-red-700'
        default: return 'text-gray-700'
      }
    }
    return 'text-gray-700'
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Resumen Ejecutivo */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-black mb-2">Resumen Ejecutivo</h3>
            {(() => {
              const best = getBestMethod()
              return (
                <>
                  <p className="text-black">
                    <strong>Mejor Método Identificado:</strong> {best.method}
                  </p>
                  {best.reason && (
                    <p className="text-black text-sm mt-1">
                      <strong>Razón:</strong> {best.reason}
                    </p>
                  )}
                </>
              )
            })()}
            <p className="text-black text-sm mt-2">
              Análisis basado en convergencia, precisión y eficiencia computacional.
            </p>
          </div>

          {/* Comparación por Método */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Análisis Detallado por Método</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.map((item, index) => (
                <div key={index} className={`border rounded-lg p-4 ${
                  item.error ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-gray-50'
                }`}>
                  <h4 className={`font-semibold mb-2 ${getMethodColor(item.method, chapter)}`}>
                    {item.method}
                  </h4>
                  
                  {item.error ? (
                    <div className="text-red-600">
                      <p className="text-sm">Error: {item.error}</p>
                    </div>
                  ) : (
                    <div className="space-y-2 text-sm text-black">
                      {chapter === 1 && (
                        <>
                          <p><strong>Iteraciones:</strong> {item.result.iterations?.length || 'N/A'}</p>
                          <p><strong>Estado:</strong> {(() => {
                            const conclusion = item.result.conclusion?.toLowerCase() || ''
                            if (conclusion.includes('convergió') || conclusion.includes('convergencia')) {
                              return 'Convergió'
                            } else if (item.result.iterations?.length > 0) {
                              return 'Convergió'
                            } else {
                              return 'No convergió'
                            }
                          })()}</p>
                          {item.result.iterations && item.result.iterations.length > 0 && (
                            <>
                              <p><strong>Error Final:</strong> {(() => {
                                const lastIter = item.result.iterations[item.result.iterations.length - 1]
                                console.log(`📍 ${item.method} - lastIter completo:`, lastIter)
                                
                                // Intentar diferentes posiciones para el error
                                let errorVal = null
                                if (Array.isArray(lastIter)) {
                                  // El error suele estar en la última posición
                                  errorVal = lastIter[lastIter.length - 1]
                                  console.log(`📍 ${item.method} - errorVal (última posición):`, errorVal, 'posición:', lastIter.length - 1)
                                  
                                  // Si la última posición no es un número, buscar en otras posiciones
                                  if (typeof errorVal !== 'number' || isNaN(errorVal)) {
                                    // Intentar posición 2 (algunos métodos lo tienen ahí)
                                    errorVal = lastIter[2]
                                    console.log(`📍 ${item.method} - errorVal (posición 2):`, errorVal)
                                    
                                    // Intentar posición 3
                                    if (typeof errorVal !== 'number' || isNaN(errorVal)) {
                                      errorVal = lastIter[3]
                                      console.log(`📍 ${item.method} - errorVal (posición 3):`, errorVal)
                                    }
                                  }
                                }
                                
                                return (errorVal !== undefined && errorVal !== null && typeof errorVal === 'number' && !isNaN(errorVal))
                                  ? errorVal.toExponential(4)
                                  : 'N/A'
                              })()}</p>
                              <p><strong>Raíz Aproximada:</strong> {(() => {
                                const lastIter = item.result.iterations[item.result.iterations.length - 1]
                                
                                // Intentar diferentes posiciones para la raíz
                                let rootVal = null
                                if (Array.isArray(lastIter)) {
                                  // La raíz suele estar en posición 1
                                  rootVal = lastIter[1]
                                  console.log(`📍 ${item.method} - rootVal (posición 1):`, rootVal)
                                  
                                  // Si no es un número, intentar posición 0
                                  if (typeof rootVal !== 'number' || isNaN(rootVal)) {
                                    rootVal = lastIter[0]
                                    console.log(`📍 ${item.method} - rootVal (posición 0):`, rootVal)
                                  }
                                }
                                
                                return (rootVal !== undefined && rootVal !== null && typeof rootVal === 'number' && !isNaN(rootVal))
                                  ? rootVal.toFixed(6)
                                  : 'N/A'
                              })()}</p>
                            </>
                          )}
                          <p className="text-xs text-black">
                            <strong>Tipo de Error:</strong> {item.result.error_type || 'Relativo'}
                          </p>
                        </>
                      )}
                      
                      {chapter === 2 && (
                        <>
                          <p className="text-black"><strong>Radio Espectral:</strong> {item.result.spectral_radius?.toFixed(6) || 'N/A'}</p>
                          <p className="text-black"><strong>Convergencia:</strong> {
                            item.result.spectral_radius < 1 ? 'Sí converge' : 'No converge'
                          }</p>
                          <p className="text-black"><strong>Iteraciones:</strong> {item.result.iterations?.length || 'N/A'}</p>
                          {item.result.iterations && item.result.iterations.length > 0 && (
                            <p className="text-black"><strong>Error Final:</strong> {(() => {
                              const lastIter = item.result.iterations[item.result.iterations.length - 1]
                              const errorVal = lastIter?.[1]
                              return (errorVal !== undefined && errorVal !== null && typeof errorVal === 'number')
                                ? errorVal.toExponential(4)
                                : 'N/A'
                            })()}</p>
                          )}
                          <p className="text-xs text-black">
                            <strong>Tipo de Norma:</strong> {
                              item.result.norm_type === 1 ? 'Norma 1' :
                              item.result.norm_type === 2 ? 'Norma 2' :
                              item.result.norm_type === 0 ? 'Norma ∞' : 'N/A'
                            }
                          </p>
                        </>
                      )}
                      
                      {chapter === 3 && (
                        <>
                          <p className="text-black"><strong>Tipo:</strong> {
                            item.result.splines ? 'Interpolación por tramos' : 'Polinomio único'
                          }</p>
                          <p className="text-black"><strong>Grado:</strong> {
                            item.result.polynomial ? `Grado ${item.result.polynomial.length - 1}` : 'Por tramos'
                          }</p>
                          {item.result.splines && (
                            <p className="text-black"><strong>Segmentos:</strong> {item.result.splines.length}</p>
                          )}
                          <p className="text-black"><strong>Estado:</strong> {
                            item.result.polynomial_str || item.result.splines ? 'Exitoso' : 'Verificar'
                          }</p>
                          <p className="text-xs text-black">
                            <strong>Fórmula:</strong> {
                              item.result.polynomial_str ? 'Disponible' : 
                              item.result.splines ? `${item.result.splines.length} ecuaciones` : 'N/A'
                            }
                          </p>
                        </>
                      )}
                      
                      {item.executionTime && (
                        <p className="text-xs text-black">
                          <strong>Tiempo de Ejecución:</strong> {item.executionTime}ms
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Análisis Comparativo */}
          {analysis && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Análisis Comparativo</h3>
              
              {chapter === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border border-green-200 bg-green-50 rounded-lg p-4">
                      <h4 className="font-semibold text-black mb-2">Convergencia</h4>
                      <p className="text-sm text-black">
                        {analysis.convergence.length} de {data.length} métodos convergieron
                      </p>
                    </div>
                    <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
                      <h4 className="font-semibold text-black mb-2">Eficiencia</h4>
                      <p className="text-sm text-black">
                        Más rápido: {analysis.iterations[0]?.method || 'N/A'}
                        <br/>({analysis.iterations[0]?.iterations || 0} iter.)
                      </p>
                    </div>
                    <div className="border border-orange-200 bg-orange-50 rounded-lg p-4">
                      <h4 className="font-semibold text-black mb-2">Precisión</h4>
                      <p className="text-sm text-black">
                        {(() => {
                          const validErrors = analysis.finalError.filter((item: any) => 
                            item.error !== undefined && item.error !== null && typeof item.error === 'number' && item.error < Infinity
                          )
                          if (validErrors.length === 0) {
                            return <>Más preciso: N/A<br/>Error: N/A</>
                          }
                          const best = validErrors[0]
                          return (
                            <>
                              Más preciso: {best.method}
                              <br/>Error: {best.error.toExponential(4)}
                            </>
                          )
                        })()}
                      </p>
                    </div>
                  </div>
                  <div className="border border-purple-200 bg-purple-50 rounded-lg p-4">
                    <h4 className="font-semibold text-black mb-2">Ranking por Error Final</h4>
                    <div className="text-sm text-black space-y-1">
                      {(() => {
                        const validErrors = analysis.finalError.filter((item: any) => 
                          item.error !== undefined && item.error !== null && typeof item.error === 'number' && item.error < Infinity
                        )
                        if (validErrors.length === 0) {
                          return <p className="text-black">No hay datos de error disponibles</p>
                        }
                        return validErrors.slice(0, 3).map((item: any, idx: number) => (
                          <p key={idx}>
                            {idx + 1}. <strong>{item.method}</strong>: {item.error.toExponential(4)}
                          </p>
                        ))
                      })()}
                    </div>
                  </div>
                </div>
              )}

              {chapter === 2 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border border-purple-200 bg-purple-50 rounded-lg p-4">
                      <h4 className="font-semibold text-black mb-2">Convergencia</h4>
                      <p className="text-sm text-black">
                        {analysis.convergence.length} de {data.length} métodos convergen
                      </p>
                    </div>
                    <div className="border border-indigo-200 bg-indigo-50 rounded-lg p-4">
                      <h4 className="font-semibold text-black mb-2">Radio Espectral</h4>
                      <p className="text-sm text-black">
                        Mejor: {analysis.spectralRadius[0]?.method || 'N/A'}
                        <br/>({analysis.spectralRadius[0]?.radius?.toFixed(4) || 'N/A'})
                      </p>
                    </div>
                    <div className="border border-pink-200 bg-pink-50 rounded-lg p-4">
                      <h4 className="font-semibold text-black mb-2">Velocidad</h4>
                      <p className="text-sm text-black">
                        Más rápido: {analysis.iterations[0]?.method || 'N/A'}
                        <br/>({analysis.iterations[0]?.iterations || 0} iter.)
                      </p>
                    </div>
                  </div>
                  <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
                    <h4 className="font-semibold text-black mb-2">Comparación de Errores Finales</h4>
                    <div className="text-sm text-black space-y-1">
                      {analysis.finalError.slice(0, 3).map((item: any, idx: number) => (
                        <p key={idx}>
                          {idx + 1}. <strong>{item.method}</strong>: {item.error < Infinity ? item.error.toExponential(4) : 'N/A'}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {chapter === 3 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border border-green-200 bg-green-50 rounded-lg p-4">
                      <h4 className="font-semibold text-black mb-2">Métodos Polinómicos</h4>
                      <p className="text-sm text-black">
                        Generan un único polinomio: Lagrange, Newton, Vandermonde
                      </p>
                      <p className="text-xs text-black mt-1">
                        Ventaja: Fórmula explícita completa
                      </p>
                    </div>
                    <div className="border border-purple-200 bg-purple-50 rounded-lg p-4">
                      <h4 className="font-semibold text-black mb-2">Métodos por Tramos</h4>
                      <p className="text-sm text-black">
                        Interpolación suave: {analysis.hasSplines.length} splines implementados
                      </p>
                      <p className="text-xs text-black mt-1">
                        Ventaja: Evita oscilaciones de Runge
                      </p>
                    </div>
                  </div>
                  <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
                    <h4 className="font-semibold text-black mb-2">Comparación de Complejidad</h4>
                    <div className="text-sm text-black space-y-1">
                      {analysis.complexity.map((item: any, idx: number) => (
                        <p key={idx}>
                          • <strong>{item.method}</strong>: {item.type} 
                          {item.segments > 1 && ` (${item.segments} segmentos)`}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Información sobre Tipos de Error */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-black mb-2">Tipos de Error Utilizados</h3>
            <div className="text-sm text-black space-y-2">
              {chapter === 1 && (
                <>
                  <p><strong>Error Relativo:</strong> Mide el error como porcentaje del valor aproximado</p>
                  <p><strong>Error Absoluto:</strong> Diferencia absoluta entre iteraciones consecutivas</p>
                  <p><strong>Tolerancia:</strong> Criterio de convergencia establecido por el usuario</p>
                </>
              )}
              {chapter === 2 && (
                <>
                  <p><strong>Norma 1:</strong> Suma de valores absolutos de las diferencias</p>
                  <p><strong>Norma 2:</strong> Distancia euclidiana entre vectores</p>
                  <p><strong>Norma ∞:</strong> Máximo valor absoluto de las diferencias</p>
                  <p><strong>Radio Espectral:</strong> Garantiza convergencia si es menor que 1</p>
                </>
              )}
              {chapter === 3 && (
                <>
                  <p><strong>Error de Interpolación:</strong> Diferencia entre valor real y aproximado</p>
                  <p><strong>Suavidad:</strong> Continuidad de derivadas (splines cúbicos: C²)</p>
                  <p><strong>Oscilaciones:</strong> Splines evitan el fenómeno de Runge</p>
                </>
              )}
            </div>
          </div>

          {/* Recomendaciones */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-black mb-2">Recomendaciones</h3>
            <div className="text-sm text-black space-y-1">
              {chapter === 1 && (
                <>
                  <p>• Para funciones continuas y derivables: <strong>Newton-Raphson</strong></p>
                  <p>• Para intervalos garantizados: <strong>Bisección</strong> o <strong>Regla Falsa</strong></p>
                  <p>• Para funciones sin derivada: <strong>Secante</strong></p>
                  <p>• Para raíces de multiplicidad &gt; 1: <strong>Raíces Múltiples</strong></p>
                  <p>• Considerar el tipo de error según el contexto del problema</p>
                </>
              )}
              {chapter === 2 && (
                <>
                  <p>• Para matrices diagonalmente dominantes: cualquier método</p>
                  <p>• Para acelerar convergencia: <strong>SOR</strong> con ω óptimo (1.2-1.8)</p>
                  <p>• Para estabilidad: <strong>Gauss-Seidel</strong></p>
                  <p>• Verificar siempre el radio espectral &lt; 1</p>
                  <p>• Elegir norma según el contexto: ∞ para elementos máximos, 2 para distancia</p>
                </>
              )}
              {chapter === 3 && (
                <>
                  <p>• Para pocos puntos (&lt;5): métodos polinómicos (Lagrange, Newton)</p>
                  <p>• Para muchos puntos (&gt;5): <strong>splines</strong> para evitar oscilaciones</p>
                  <p>• Para máxima suavidad: <strong>spline cúbico</strong> (continuidad C²)</p>
                  <p>• Para eficiencia computacional: <strong>Newton interpolante</strong></p>
                  <p>• Evitar Vandermonde para matrices mal condicionadas</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Cerrar Informe
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
