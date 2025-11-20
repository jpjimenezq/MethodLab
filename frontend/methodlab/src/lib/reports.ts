import { chapter1Api, chapter2Api, chapter3Api } from './api'

// Tipos para los reportes
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

// Funciones para generar reportes automáticos

export async function generateChapter1Report(testFunction: any): Promise<ComparisonReport> {
  const methods = [
    { name: 'bisection', api: chapter1Api.bisection },
    { name: 'reglaFalsa', api: chapter1Api.reglaFalsa },
    { name: 'newton', api: chapter1Api.newton },
    { name: 'secante', api: chapter1Api.secante },
    { name: 'puntoFijo', api: chapter1Api.puntoFijo }
  ]

  const results: MethodResult[] = []

  for (const method of methods) {
    const startTime = performance.now()
    try {
      const response = await method.api(testFunction)
      const endTime = performance.now()
      
      const result = response.data.result
      results.push({
        methodName: method.name,
        success: true,
        iterations: result.iterations?.length || 0,
        finalError: result.iterations?.[result.iterations.length - 1]?.error || null,
        executionTime: endTime - startTime,
        conclusion: result.conclusion
      })
    } catch (error: any) {
      const endTime = performance.now()
      results.push({
        methodName: method.name,
        success: false,
        executionTime: endTime - startTime,
        error: error.response?.data?.error || error.message
      })
    }
  }

  // Analizar resultados
  const successfulMethods = results.filter(r => r.success)
  
  let bestMethod = { name: 'Ninguno', reason: 'Todos los métodos fallaron' }
  
  if (successfulMethods.length > 0) {
    // Encontrar el método con menos iteraciones y mejor precisión
    const bestByIterations = successfulMethods.reduce((best, current) => 
      (current.iterations || 0) < (best.iterations || 0) ? current : best
    )
    
    bestMethod = {
      name: bestByIterations.methodName,
      reason: `Convergió en ${bestByIterations.iterations} iteraciones con error ${bestByIterations.finalError?.toExponential(3)}`
    }
  }

  const report: ComparisonReport = {
    testCase: testFunction,
    results,
    bestMethod,
    analysis: {
      convergenceAnalysis: generateConvergenceAnalysis(results),
      errorAnalysis: generateErrorAnalysis(results),
      performanceAnalysis: generatePerformanceAnalysis(results)
    }
  }

  return report
}

export async function generateChapter2Report(testSystem: any): Promise<ComparisonReport> {
  const methods = [
    { name: 'jacobi', api: chapter2Api.jacobi },
    { name: 'gaussSeidel', api: chapter2Api.gaussSeidel },
    { name: 'sor', api: chapter2Api.sor }
  ]

  const results: MethodResult[] = []

  for (const method of methods) {
    const startTime = performance.now()
    try {
      const response = await method.api(testSystem)
      const endTime = performance.now()
      
      const result = response.data.result
      results.push({
        methodName: method.name,
        success: true,
        iterations: result.iterations?.length || 0,
        finalError: result.iterations?.[result.iterations.length - 1]?.error || null,
        executionTime: endTime - startTime,
        convergence: result.spectral_radius < 1,
        conclusion: result.conclusion
      })
    } catch (error: any) {
      const endTime = performance.now()
      results.push({
        methodName: method.name,
        success: false,
        executionTime: endTime - startTime,
        error: error.response?.data?.error || error.message
      })
    }
  }

  // Analizar resultados
  const convergentMethods = results.filter(r => r.success && r.convergence)
  
  let bestMethod = { name: 'Ninguno', reason: 'Ningún método convergió' }
  
  if (convergentMethods.length > 0) {
    const bestBySpeed = convergentMethods.reduce((best, current) => 
      (current.iterations || 0) < (best.iterations || 0) ? current : best
    )
    
    bestMethod = {
      name: bestBySpeed.methodName,
      reason: `Convergió más rápido en ${bestBySpeed.iterations} iteraciones`
    }
  }

  return {
    testCase: testSystem,
    results,
    bestMethod,
    analysis: {
      convergenceAnalysis: generateConvergenceAnalysisChap2(results),
      errorAnalysis: generateErrorAnalysis(results),
      performanceAnalysis: generatePerformanceAnalysis(results)
    }
  }
}

export async function generateChapter3Report(testPoints: any): Promise<ComparisonReport> {
  const methods = [
    { name: 'lagrange', api: chapter3Api.lagrange },
    { name: 'newtonInterpolation', api: chapter3Api.newtonInterpolation },
    { name: 'vandermonde', api: chapter3Api.vandermonde },
    { name: 'splineLineal', api: chapter3Api.splineLineal },
    { name: 'splineCubico', api: chapter3Api.splineCubico }
  ]

  const results: MethodResult[] = []

  for (const method of methods) {
    const startTime = performance.now()
    try {
      const response = await method.api(testPoints)
      const endTime = performance.now()
      
      const result = response.data.result
      results.push({
        methodName: method.name,
        success: result.success,
        executionTime: endTime - startTime,
        error: result.error
      })
    } catch (error: any) {
      const endTime = performance.now()
      results.push({
        methodName: method.name,
        success: false,
        executionTime: endTime - startTime,
        error: error.response?.data?.error || error.message
      })
    }
  }

  const successfulMethods = results.filter(r => r.success)
  
  let bestMethod = { name: 'Ninguno', reason: 'Todos los métodos fallaron' }
  
  if (successfulMethods.length > 0) {
    const fastestMethod = successfulMethods.reduce((best, current) => 
      current.executionTime < best.executionTime ? current : best
    )
    
    bestMethod = {
      name: fastestMethod.methodName,
      reason: `Ejecutó más rápido (${fastestMethod.executionTime.toFixed(2)}ms)`
    }
  }

  return {
    testCase: testPoints,
    results,
    bestMethod,
    analysis: {
      convergenceAnalysis: 'Análisis de convergencia no aplica para interpolación',
      errorAnalysis: generateInterpolationErrorAnalysis(results),
      performanceAnalysis: generatePerformanceAnalysis(results)
    }
  }
}

// Funciones auxiliares para análisis
function generateConvergenceAnalysis(results: MethodResult[]): string {
  const converged = results.filter(r => r.success).length
  const total = results.length
  return `${converged}/${total} métodos convergieron exitosamente.`
}

function generateConvergenceAnalysisChap2(results: MethodResult[]): string {
  const convergent = results.filter(r => r.convergence).length
  const total = results.length
  return `${convergent}/${total} métodos son convergentes según el radio espectral.`
}

function generateErrorAnalysis(results: MethodResult[]): string {
  const successful = results.filter(r => r.success && r.finalError)
  if (successful.length === 0) return 'No hay datos de error disponibles.'
  
  const errors = successful.map(r => r.finalError!).sort((a, b) => a - b)
  const bestError = errors[0]
  const worstError = errors[errors.length - 1]
  
  return `Error mínimo: ${bestError.toExponential(3)}, Error máximo: ${worstError.toExponential(3)}`
}

function generateInterpolationErrorAnalysis(results: MethodResult[]): string {
  const successful = results.filter(r => r.success).length
  const failed = results.filter(r => !r.success).length
  return `${successful} métodos completados exitosamente, ${failed} métodos fallaron.`
}

function generatePerformanceAnalysis(results: MethodResult[]): string {
  const times = results.map(r => r.executionTime).sort((a, b) => a - b)
  const fastest = times[0]
  const slowest = times[times.length - 1]
  
  return `Tiempo más rápido: ${fastest.toFixed(2)}ms, Tiempo más lento: ${slowest.toFixed(2)}ms`
}
