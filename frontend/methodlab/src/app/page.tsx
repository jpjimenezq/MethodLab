'use client'
import React from 'react'
import Link from 'next/link'
import { Calculator, GitBranch, TrendingUp, Users } from 'lucide-react'

export default function Home() {
  const chapters = [
    {
      id: 1,
      title: 'Capítulo 1: Solución de Ecuaciones',
      description: 'Métodos numéricos para encontrar raíces de ecuaciones no lineales',
      methods: ['Bisección', 'Regla Falsa', 'Punto Fijo', 'Newton-Raphson', 'Secante', 'Raíces Múltiples'],
      icon: Calculator,
      color: 'from-blue-500 to-cyan-600',
      href: '/chapter1'
    },
    {
      id: 2,
      title: 'Capítulo 2: Sistemas de Ecuaciones Lineales',
      description: 'Métodos iterativos para resolver sistemas de ecuaciones lineales',
      methods: ['Jacobi', 'Gauss-Seidel', 'SOR (Successive Over-Relaxation)'],
      icon: GitBranch,
      color: 'from-purple-500 to-pink-600',
      href: '/chapter2'
    },
    {
      id: 3,
      title: 'Capítulo 3: Interpolación',
      description: 'Métodos de interpolación y ajuste de curvas',
      methods: ['Vandermonde', 'Newton Interpolante', 'Lagrange', 'Spline Lineal', 'Spline Cúbico'],
      icon: TrendingUp,
      color: 'from-green-500 to-emerald-600',
      href: '/chapter3'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-gray-900">MethodLab</h1>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>Análisis Numérico - EAFIT</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Métodos Numéricos Interactivos
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Plataforma completa para ejecutar y analizar métodos numéricos con interfaz intuitiva,
            gráficos interactivos y reportes de comparación automáticos.
          </p>
        </div>

        {/* Chapters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
          {chapters.map((chapter, index) => (
            <div
              key={chapter.id}
              className="group animate-fade-in-up h-full"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <Link href={chapter.href}>
          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden h-full flex flex-col">
            <div className={`h-32 bg-gradient-to-r ${chapter.color} flex items-center justify-center`}>
              <chapter.icon className="h-16 w-16 text-white" />
            </div>

            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
            {chapter.title}
                </h3>
                <p className="text-gray-600 mb-4 text-sm">
            {chapter.description}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-700">Métodos incluidos:</h4>
                <div className="flex flex-wrap gap-1">
            {chapter.methods.slice(0, 3).map((method) => (
              <span
                key={method}
                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
              >
                {method}
              </span>
            ))}
            {chapter.methods.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                +{chapter.methods.length - 3} más
              </span>
            )}
                </div>
              </div>
            </div>
          </div>
              </Link>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="mt-16 bg-white rounded-xl shadow-lg p-8 animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Características de la Plataforma
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Calculator className="h-8 w-8 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Cálculos Precisos</h4>
              <p className="text-gray-600 text-sm">Implementación robusta de algoritmos numéricos</p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Visualización</h4>
              <p className="text-gray-600 text-sm">Gráficos interactivos y tablas detalladas</p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <GitBranch className="h-8 w-8 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Comparación</h4>
              <p className="text-gray-600 text-sm">Reportes automáticos de rendimiento</p>
            </div>
            
            <div className="text-center">
              <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-orange-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Interfaz Amigable</h4>
              <p className="text-gray-600 text-sm">Guías y ayudas contextuales</p>
            </div>
          </div>
        </div>

        {/* Team Info */}
        <div className="mt-8 text-center text-gray-600 animate-fade-in-up" style={{ animationDelay: '1.0s' }}>
          <p className="mb-2">Proyecto Final - Análisis Numérico</p>
          <p className="mb-2">Juan Pablo Jimenez Quiroz</p>
          <p className="text-sm">Universidad EAFIT - 2025-2</p>
        </div>
      </div>
    </div>
  )
}
