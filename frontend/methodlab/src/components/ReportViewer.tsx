'use client'
import React from 'react'

interface MethodResult {
  methodName: string
  success: boolean
  iterations?: number
  finalError?: number
  executionTime: number
  convergence?: boolean
  conclusion?: string
  error?: string
}

interface ComparisonReport {
  testCase: any
  results: MethodResult[]
  bestMethod: {
    name: string
    reason: string
  }
  analysis: {
    convergenceAnalysis: string
    errorAnalysis: string
    performanceAnalysis: string
  }
}

interface ReportViewerProps {
  report: ComparisonReport
  onClose: () => void
}

export default function ReportViewer({ report, onClose }: ReportViewerProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Reporte de Comparación de Métodos</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors text-2xl"
            >
              ×
            </button>
          </div>

          {/* Mejor Método */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-green-800 mb-2">🏆 Mejor Método</h3>
            <p className="text-green-700">
              <strong>{report.bestMethod.name}</strong> - {report.bestMethod.reason}
            </p>
          </div>

          {/* Tabla de Resultados */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Resultados Detallados</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-2 text-left">Método</th>
                    <th className="border border-gray-300 px-4 py-2 text-center">Estado</th>
                    <th className="border border-gray-300 px-4 py-2 text-center">Iteraciones</th>
                    <th className="border border-gray-300 px-4 py-2 text-center">Error Final</th>
                    <th className="border border-gray-300 px-4 py-2 text-center">Tiempo (ms)</th>
                    <th className="border border-gray-300 px-4 py-2 text-center">Convergencia</th>
                  </tr>
                </thead>
                <tbody>
                  {report.results.map((result, index) => (
                    <tr key={index} className={result.success ? 'bg-green-50' : 'bg-red-50'}>
                      <td className="border border-gray-300 px-4 py-2 font-medium">
                        {result.methodName}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        {result.success ? (
                          <span className="text-green-600 font-semibold">✓ Éxito</span>
                        ) : (
                          <span className="text-red-600 font-semibold">✗ Falló</span>
                        )}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        {result.iterations || '-'}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        {result.finalError ? result.finalError.toExponential(3) : '-'}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        {result.executionTime.toFixed(2)}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        {result.convergence !== undefined ? 
                          (result.convergence ? 
                            <span className="text-green-600">Sí</span> : 
                            <span className="text-red-600">No</span>
                          ) : '-'
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Análisis */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">Análisis de Convergencia</h4>
              <p className="text-blue-700 text-sm">{report.analysis.convergenceAnalysis}</p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-800 mb-2">Análisis de Errores</h4>
              <p className="text-yellow-700 text-sm">{report.analysis.errorAnalysis}</p>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-semibold text-purple-800 mb-2">Análisis de Rendimiento</h4>
              <p className="text-purple-700 text-sm">{report.analysis.performanceAnalysis}</p>
            </div>
          </div>

          {/* Errores */}
          {report.results.some(r => r.error) && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-red-800 mb-2">Errores Encontrados</h4>
              <div className="space-y-2">
                {report.results.filter(r => r.error).map((result, index) => (
                  <div key={index} className="text-red-700 text-sm">
                    <strong>{result.methodName}:</strong> {result.error}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Botón de cerrar */}
          <div className="text-center mt-6">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Cerrar Reporte
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
