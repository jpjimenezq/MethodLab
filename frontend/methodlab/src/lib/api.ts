import axios from 'axios'

const API_BASE_URL = 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Capítulo 1 - Solución de ecuaciones
export const chapter1Api = {
  bisection: (data: any) => api.post('/calculate/bisection', data),
  newton: (data: any) => api.post('/calculate/newton', data),
  puntoFijo: (data: any) => api.post('/calculate/puntoFijo', data),
  raicesMultiples: (data: any) => api.post('/calculate/raicesMultiples', data),
  reglaFalsa: (data: any) => api.post('/calculate/ReglaFalsa', data),
  secante: (data: any) => api.post('/calculate/secante', data)
}

// Capítulo 2 - Sistemas lineales
export const chapter2Api = {
  jacobi: (data: any) => api.post('/calculate/jacobi', data),
  gaussSeidel: (data: any) => api.post('/calculate/gaussSeidel', data),
  sor: (data: any) => api.post('/calculate/sor', data)
}

// Capítulo 3 - Interpolación
export const chapter3Api = {
  lagrange: (data: any) => api.post('/calculate/lagrange', data),
  newtonInterpolation: (data: any) => api.post('/calculate/newton_interpolation', data),
  splineCubico: (data: any) => api.post('/calculate/spline_cubico', data),
  splineLineal: (data: any) => api.post('/calculate/spline_lineal', data),
  vandermonde: (data: any) => api.post('/calculate/vandermonde', data)
}

// API para graficación
export const plotApi = {
  plotFunction: (data: { function_text: string, x_min?: number, x_max?: number }) => 
    api.post('/plot', data)
}

export default api
