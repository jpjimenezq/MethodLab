'use client'
import React from 'react'

interface ResultTableProps {
  data: Array<Array<any> | { [key: string]: any }>
  title?: string
  method?: string
}

// Definir headers específicos para cada método
const getMethodHeaders = (method: string, sampleData?: Array<any>): string[] => {
  switch (method?.toLowerCase()) {
    case 'bisection':
    case 'biseccion':
      return ['Iteración', 'a', 'xm', 'b', 'f(xm)', 'Error']
    
    case 'newton':
    case 'newton-raphson':
      return ['Iteración', 'x', 'f(x)', "f'(x)", 'Error']
    
    case 'punto_fijo':
    case 'punto fijo':
    case 'fixed_point':
    case 'puntofijo':
    case 'puntoFijo':  // Agregado para coincidir con el frontend
      return ['Iteración', 'x', 'g(x)', 'f(x)', 'Error']
    
    case 'raices_multiples':
    case 'raices multiples':
    case 'multiple_roots':
    case 'raicesmultiples':
    case 'raicesMultiples':  // Agregado para coincidir con el frontend
      return ['Iteración', 'x', 'f(x)', 'Error']
    
    case 'regla_falsa':
    case 'regla falsa':
    case 'false_position':
    case 'reglafalsa':
    case 'reglaFalsa':  // Agregado para coincidir con el frontend
      return ['Iteración', 'a', 'xm', 'b', 'f(xm)', 'Error']
    
    case 'secante':
    case 'secant':
      return ['Iteración', 'x0', 'x1', 'f(x0)', 'f(x1)', 'Error']
    
    case 'jacobi':
    case 'gauss_seidel':
    case 'gauss-seidel':
    case 'gaussseidel':
    case 'sor': {
      // Para métodos de sistemas lineales, determinar número de variables dinámicamente
      if (sampleData && sampleData.length > 0 && Array.isArray(sampleData[0])) {
        const firstRow = sampleData[0]
        if (firstRow.length >= 3) {
          // Formato: [iteración, error, [x1, x2, x3, ...]]
          if (Array.isArray(firstRow[2])) {
            const numVars = firstRow[2].length
            const headers = ['Iteración']
            for (let i = 1; i <= numVars; i++) {
              headers.push(`x${i}`)
            }
            headers.push('Error')
            return headers
          }
        }
      }
      // Fallback para 3 variables
      return ['Iteración', 'x1', 'x2', 'x3', 'Error']
    }
    
    case 'lagrange':
      return ['i', 'xi', 'yi', 'Li(x)']
    
    case 'newton_interpolation':
    case 'newton interpolation':
    case 'newtoninterpolation':
      return ['i', 'xi', 'yi', 'Diferencias Divididas']
    
    case 'spline_cubico':
    case 'spline cúbico':
    case 'cubic_spline':
    case 'splinecubico':
      return ['Intervalo', 'a', 'b', 'c', 'd', 'Ecuación']
    
    case 'spline_lineal':
    case 'spline lineal':
    case 'linear_spline':
    case 'splinelineal':
      return ['Intervalo', 'x0', 'x1', 'Pendiente', 'Ecuación']
    
    case 'vandermonde':
      return ['i', 'xi', 'yi', 'Coeficiente']
    
    default:
      return []
  }
}

export default function ResultTable({ data, title, method }: ResultTableProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {title || 'Resultados'}
        </h3>
        <p className="text-gray-500">No hay datos para mostrar</p>
      </div>
    )
  }

  // Determinar si los datos son arrays o objetos
  const isArrayData = Array.isArray(data[0])
  
  let headers: string[]
  let processedData: Array<Array<any>>

  if (isArrayData) {
    // Datos como arrays - usar headers específicos del método
    headers = method ? getMethodHeaders(method, data as Array<Array<any>>) : []
    
    // Procesar datos especiales para sistemas lineales (Jacobi, Gauss-Seidel, SOR)
    if (['jacobi', 'gauss_seidel', 'gaussseidel', 'gauss-seidel', 'sor'].includes(method?.toLowerCase() || '')) {
      processedData = (data as Array<Array<any>>).map(row => {
        if (row.length === 3 && Array.isArray(row[2])) {
          // Formato: [iteración, error, [x1, x2, x3, ...]]
          // Convertir a: [iteración, x1, x2, x3, ..., error]
          return [row[0], ...row[2], row[1]]
        }
        return row
      })
    } else {
      processedData = data as Array<Array<any>>
    }
    
    // Si no hay headers específicos, usar números
    if (headers.length === 0 && processedData.length > 0) {
      headers = processedData[0].map((_, index) => `Columna ${index + 1}`)
    }
  } else {
    // Datos como objetos - usar las claves como headers
    headers = Object.keys(data[0] as { [key: string]: any })
    processedData = (data as Array<{ [key: string]: any }>).map(row => 
      headers.map(header => row[header])
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {title || 'Tabla de Iteraciones'}
      </h3>
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50">
              {headers.map((header, index) => (
                <th 
                  key={index}
                  className="border border-gray-200 px-4 py-2 text-center text-sm font-semibold text-gray-900"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {processedData.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50">
                {row.map((cell, cellIndex) => (
                  <td 
                    key={cellIndex}
                    className="border border-gray-200 px-4 py-2 text-sm text-gray-700 text-center"
                  >
                    {typeof cell === 'number' 
                      ? (cellIndex === 0 
                          ? cell  // Primera columna (iteración) sin formato científico
                          : (Math.abs(cell) < 1e-4 || Math.abs(cell) > 1e4
                              ? cell.toExponential(6)
                              : Number(cell.toPrecision(8))))
                      : String(cell)
                    }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {method && (
        <div className="mt-4 text-xs text-gray-600">
          <p><strong>Método:</strong> {method.charAt(0).toUpperCase() + method.slice(1)}</p>
        </div>
      )}
    </div>
  )
}
