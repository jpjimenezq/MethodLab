'use client'
import React, { useState, useEffect, useCallback, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { plotApi } from '@/lib/api'

// Importar Plotly de forma dinámica para evitar problemas de SSR
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false })

interface InteractivePlotProps {
  functionText: string
  onClose: () => void
}

interface PlotDataPoint {
  x: number[]
  y: (number | null)[]
  type: 'scatter'
  mode: 'lines'
  name: string
  line: {
    color: string
    width: number
  }
  hovertemplate: string
}

export default function InteractivePlot({ functionText, onClose }: InteractivePlotProps) {
  const [plotData, setPlotData] = useState<PlotDataPoint | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Configuraciones de la gráfica
  const [xMin, setXMin] = useState(-10)
  const [xMax, setXMax] = useState(10)
  const [showGrid, setShowGrid] = useState(true)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [isResetting, setIsResetting] = useState(false)

  const generatePlot = useCallback(async () => {
    if (!functionText) return

    setLoading(true)
    setError(null)

    try {
      // Generar puntos para la función
      const numPoints = 1000
      const step = (xMax - xMin) / numPoints
      const xValues: number[] = []
      const yValues: (number | null)[] = []

      for (let i = 0; i <= numPoints; i++) {
        const x = xMin + i * step
        xValues.push(x)
        
        try {
          // Evaluar función usando una evaluación segura
          const cleanFunction = functionText
            .replace(/\^/g, '**')
            .replace(/x/g, `(${x})`)
            .replace(/sin/g, 'Math.sin')
            .replace(/cos/g, 'Math.cos')
            .replace(/tan/g, 'Math.tan')
            .replace(/exp/g, 'Math.exp')
            .replace(/log/g, 'Math.log')
            .replace(/sqrt/g, 'Math.sqrt')
            .replace(/abs/g, 'Math.abs')
          
          const y = eval(cleanFunction)
          yValues.push(isFinite(y) ? y : null)
        } catch {
          yValues.push(null)
        }
      }

      setPlotData({
        x: xValues,
        y: yValues,
        type: 'scatter',
        mode: 'lines',
        name: `f(x) = ${functionText}`,
        line: {
          color: '#3B82F6',
          width: 2
        },
        hovertemplate: '<b>x:</b> %{x:.4f}<br><b>f(x):</b> %{y:.4f}<extra></extra>'
      })
    } catch (err: any) {
      setError('Error al generar la gráfica')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [functionText, xMin, xMax])

  useEffect(() => {
    generatePlot()
  }, [generatePlot, showGrid, theme])

  const layout = useMemo(() => ({
    title: {
      text: `Gráfica Interactiva: f(x) = ${functionText}`,
      font: { size: 16 }
    },
    xaxis: {
      title: { text: 'x' },
      range: [xMin, xMax],
      showgrid: showGrid,
      gridcolor: theme === 'light' ? '#E5E7EB' : '#374151',
      zeroline: true,
      zerolinecolor: theme === 'light' ? '#9CA3AF' : '#6B7280'
    },
    yaxis: {
      title: { text: 'f(x)' },
      showgrid: showGrid,
      gridcolor: theme === 'light' ? '#E5E7EB' : '#374151',
      zeroline: true,
      zerolinecolor: theme === 'light' ? '#9CA3AF' : '#6B7280'
    },
    plot_bgcolor: theme === 'light' ? '#FFFFFF' : '#1F2937',
    paper_bgcolor: theme === 'light' ? '#FFFFFF' : '#111827',
    font: {
      color: theme === 'light' ? '#1F2937' : '#F9FAFB'
    },
    showlegend: true,
    legend: {
      x: 0.02,
      y: 0.98
    },
    margin: { l: 60, r: 40, t: 60, b: 60 },
    hovermode: 'closest' as const
  }), [functionText, xMin, xMax, showGrid, theme])

  const config = {
    displayModeBar: true,
    displaylogo: false,
    responsive: true
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header con controles */}
        <div className="border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Gráfica Interactiva
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Controles */}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                X mínimo
              </label>
              <input
                type="number"
                value={xMin}
                onChange={(e) => setXMin(Number(e.target.value))}
                className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                X máximo
              </label>
              <input
                type="number"
                value={xMax}
                onChange={(e) => setXMax(Number(e.target.value))}
                className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
              />
            </div>

            <div className="flex items-end">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showGrid}
                  onChange={(e) => setShowGrid(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Grid</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tema
              </label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as 'light' | 'dark')}
                className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
              >
                <option value="light">Claro</option>
                <option value="dark">Oscuro</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={generatePlot}
                disabled={loading}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
              >
                {loading ? 'Cargando...' : 'Actualizar'}
              </button>
            </div>

            <div className="flex items-end">
              <button
                onClick={async () => {
                  setIsResetting(true)
                  setXMin(-10)
                  setXMax(10)
                  setShowGrid(true)
                  setTheme('light')
                  // Pequeña pausa para mostrar feedback visual
                  await new Promise(resolve => setTimeout(resolve, 300))
                  setIsResetting(false)
                }}
                disabled={isResetting || loading}
                className="px-3 py-1 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 disabled:bg-gray-400 transition-colors"
              >
                {isResetting ? 'Reseteando...' : 'Reset'}
              </button>
            </div>
          </div>
        </div>

        {/* Área de la gráfica */}
        <div className="p-4 h-[calc(90vh-200px)]">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
              <div className="text-red-800">{error}</div>
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-500">Generando gráfica...</div>
            </div>
          )}

          {plotData && !loading && (
            <Plot
              data={[plotData]}
              layout={layout}
              config={config}
              style={{ width: '100%', height: '100%' }}
              useResizeHandler={true}
            />
          )}
        </div>

        {/* Información de ayuda */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <h4 className="font-semibold text-gray-900 mb-2">Funciones de la gráfica interactiva:</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div>
              <strong>🖱️ Hover:</strong> Pasa el mouse sobre la gráfica para ver valores exactos
            </div>
            <div>
              <strong>🔍 Zoom:</strong> Usa la rueda del mouse o las herramientas para hacer zoom
            </div>
            <div>
              <strong>📏 Pan:</strong> Arrastra para desplazarte por la gráfica
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
