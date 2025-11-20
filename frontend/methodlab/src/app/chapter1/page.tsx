"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { chapter1Api, plotApi } from "@/lib/api";
import HelpModal from "@/components/HelpModal";
import LoadingSpinner from "@/components/LoadingSpinner";
import ResultTable from "@/components/ResultTable";
import InteractivePlot from "@/components/InteractivePlot";
import ComparisonReport from "@/components/ComparisonReport";

type MethodType =
  | "bisection"
  | "newton"
  | "puntoFijo"
  | "raicesMultiples"
  | "reglaFalsa"
  | "secante";

interface FormData {
  function_text: string;
  first_derivate_text?: string;
  second_derivate_text?: string;
  g_function_text?: string;
  a?: number;
  b?: number;
  x0?: number;
  x1?: number;
  tol: number;
  max_count: number;
}

export default function Chapter1() {
  const [selectedMethod, setSelectedMethod] = useState<MethodType>("bisection");
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showInteractivePlot, setShowInteractivePlot] = useState(false);
  const [allResults, setAllResults] = useState<any[]>([]);
  const [reportData, setReportData] = useState<any[]>([]);
  const [showComparisonReport, setShowComparisonReport] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
    setValue,
  } = useForm<FormData>({
    defaultValues: {
      tol: 1e-6,
      max_count: 100,
    },
  });

  // Valores de ejemplo para cada método
  const getExampleValues = (method: MethodType) => {
    switch (method) {
      case "bisection":
        return {
          function_text: "x**3 - 2*x - 5",
          a: 2,
          b: 3,
        };
      case "newton":
        return {
          function_text: "x**3 - 2*x - 5",
          first_derivate_text: "3*x**2 - 2",
          x0: 2.5,
        };
      case "puntoFijo":
        return {
          function_text: "x**3 - 2*x - 5",
          g_function_text: "(2*x + 5)**(1/3)",
          x0: 2.5,
        };
      case "raicesMultiples":
        return {
          function_text: "(x - 2)**2",
          first_derivate_text: "2*(x - 2)",
          second_derivate_text: "2",
          x0: 1.5,
        };
      case "reglaFalsa":
        return {
          function_text: "x**3 - 2*x - 5",
          a: 2,
          b: 3,
        };
      case "secante":
        return {
          function_text: "x**3 - 2*x - 5",
          x0: 2,
          x1: 3,
        };
      default:
        return {};
    }
  };

  // Efecto para cargar valores de ejemplo cuando cambia el método
  useEffect(() => {
    // Limpiar resultados anteriores
    setResults(null);
    setError(null);
    setShowReport(false);
    setShowInteractivePlot(false); // Cerrar gráfica interactiva

    // Cargar valores de ejemplo
    const examples = getExampleValues(selectedMethod);
    Object.entries(examples).forEach(([key, value]) => {
      setValue(key as keyof FormData, value);
    });
  }, [selectedMethod, setValue]);

  const methods = [
    {
      id: "bisection",
      name: "Bisección",
      description: "Encuentra raíces por división del intervalo",
    },
    {
      id: "reglaFalsa",
      name: "Regla Falsa",
      description: "Método de interpolación lineal",
    },
    {
      id: "puntoFijo",
      name: "Punto Fijo",
      description: "Iteración de punto fijo g(x) = x",
    },
    {
      id: "newton",
      name: "Newton-Raphson",
      description: "Método de la tangente",
    },
    {
      id: "secante",
      name: "Secante",
      description: "Aproximación de Newton sin derivada",
    },
    {
      id: "raicesMultiples",
      name: "Raíces Múltiples",
      description: "Newton modificado para raíces múltiples",
    },
  ];

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);

    try {
      let response;

      switch (selectedMethod) {
        case "bisection":
          response = await chapter1Api.bisection(data);
          break;
        case "newton":
          response = await chapter1Api.newton(data);
          break;
        case "puntoFijo":
          response = await chapter1Api.puntoFijo(data);
          break;
        case "raicesMultiples":
          response = await chapter1Api.raicesMultiples(data);
          break;
        case "reglaFalsa":
          response = await chapter1Api.reglaFalsa(data);
          break;
        case "secante":
          response = await chapter1Api.secante(data);
          break;
      }

      const methodResult = response.data.result;
      setResults(methodResult);
      
      // Guardar resultado para comparación
      const methodName = methods.find(m => m.id === selectedMethod)?.name || selectedMethod;
      const newResult = {
        method: methodName,
        result: methodResult,
        timestamp: new Date().toISOString(),
        parameters: data
      };
      
      setAllResults(prev => {
        // Remover resultado anterior del mismo método si existe
        const filtered = prev.filter(r => r.method !== methodName);
        return [...filtered, newResult];
      });
      
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || "Error en el cálculo";
      setError(errorMsg);
      
      // Guardar error para comparación
      const methodName = methods.find(m => m.id === selectedMethod)?.name || selectedMethod;
      const errorResult = {
        method: methodName,
        error: errorMsg,
        timestamp: new Date().toISOString(),
        parameters: data
      };
      
      setAllResults(prev => {
        const filtered = prev.filter(r => r.method !== methodName);
        return [...filtered, errorResult];
      });
      
    } finally {
      setLoading(false);
    }
  };

  // Función para ejecutar informe automático de todos los métodos
  const runAutomaticReport = async () => {
    setLoading(true);
    const currentFormData: any = watch();
    const reportResults: any[] = [];
    
    try {
      // Valores por defecto si no están definidos
      const defaultData = {
        function_text: currentFormData.function_text || "x**3 - 2*x - 5",
        tol: currentFormData.tol || 1e-6,
        max_count: currentFormData.max_count || 100,
        error_type: currentFormData.error_type || "relativo",
        a: currentFormData.a || -1,
        b: currentFormData.b || 3,
        x0: currentFormData.x0 || 2,
        x1: currentFormData.x1 || 3,
        first_derivate_text: currentFormData.first_derivate_text || "3*x**2 - 2",
        second_derivate_text: currentFormData.second_derivate_text || "6*x",
        g_function_text: currentFormData.g_function_text || "((2*x + 5)**(1/3))"
      };
      
      // Ejecutar todos los métodos disponibles
      for (const method of methods) {
        try {
          let response;
          const startTime = performance.now();
          let methodData = { ...defaultData };
          
          switch (method.id as MethodType) {
            case "bisection":
              response = await chapter1Api.bisection(methodData);
              break;
            case "newton":
              response = await chapter1Api.newton(methodData);
              break;
            case "puntoFijo":
              response = await chapter1Api.puntoFijo(methodData);
              break;
            case "raicesMultiples":
              response = await chapter1Api.raicesMultiples(methodData);
              break;
            case "reglaFalsa":
              response = await chapter1Api.reglaFalsa(methodData);
              break;
            case "secante":
              response = await chapter1Api.secante(methodData);
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

  // Función para obtener estilos específicos del método
  const getMethodStyles = (method: MethodType) => {
    const baseClass =
      "w-full px-3 py-2 border-2 rounded-md focus:outline-none focus:ring-2 transition-colors";
    switch (method) {
      case "bisection":
        return `${baseClass} border-blue-300 bg-blue-50 focus:border-blue-500 focus:ring-blue-200`;
      case "newton":
        return `${baseClass} border-green-300 bg-green-50 focus:border-green-500 focus:ring-green-200`;
      case "puntoFijo":
        return `${baseClass} border-purple-300 bg-purple-50 focus:border-purple-500 focus:ring-purple-200`;
      case "raicesMultiples":
        return `${baseClass} border-orange-300 bg-orange-50 focus:border-orange-500 focus:ring-orange-200`;
      case "reglaFalsa":
        return `${baseClass} border-pink-300 bg-pink-50 focus:border-pink-500 focus:ring-pink-200`;
      case "secante":
        return `${baseClass} border-teal-300 bg-teal-50 focus:border-teal-500 focus:ring-teal-200`;
      default:
        return `${baseClass} border-gray-300 bg-gray-50 focus:border-gray-500 focus:ring-gray-200`;
    }
  };

  // Función para abrir la gráfica interactiva
  const handlePlotFunction = () => {
    const functionText = watch("function_text");
    if (!functionText) {
      alert("Por favor, ingresa una función primero");
      return;
    }

    setShowInteractivePlot(true);
  };

  // Función para calcular derivadas automáticamente
  const calculateDerivative = async (order: "first" | "second") => {
    const functionText = watch("function_text");
    if (!functionText) {
      alert("Por favor, ingresa una función primero");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/api/derivative", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          function_text: functionText,
          order: order === "first" ? 1 : 2,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (order === "first") {
          setValue("first_derivate_text", data.derivative);
        } else {
          setValue("second_derivate_text", data.derivative);
        }
      } else {
        // Fallback: usar reglas básicas de derivación
        const derivative = calculateBasicDerivative(functionText, order);
        if (derivative) {
          if (order === "first") {
            setValue("first_derivate_text", derivative);
          } else {
            setValue("second_derivate_text", derivative);
          }
        } else {
          alert(
            "No se pudo calcular la derivada automáticamente. Por favor, ingrésala manualmente."
          );
        }
      }
    } catch (error) {
      // Fallback: usar reglas básicas de derivación
      const derivative = calculateBasicDerivative(functionText, order);
      if (derivative) {
        if (order === "first") {
          setValue("first_derivate_text", derivative);
        } else {
          setValue("second_derivate_text", derivative);
        }
      } else {
        alert(
          "No se pudo calcular la derivada automáticamente. Por favor, ingrésala manualmente."
        );
      }
    }
  };

  // Función auxiliar para calcular derivadas básicas
  const calculateBasicDerivative = (
    func: string,
    order: "first" | "second"
  ): string | null => {
    try {
      // Limpiar la función
      let f = func.trim();

      // Reglas básicas de derivación
      const patterns = [
        // x^n -> n*x^(n-1)
        {
          pattern: /x\*\*(\d+)/g,
          replacement: (match: string, n: string) => {
            const exp = parseInt(n);
            if (order === "first") {
              return exp === 1
                ? "1"
                : exp === 2
                ? "2*x"
                : `${exp}*x**${exp - 1}`;
            } else {
              // second derivative
              return exp <= 1
                ? "0"
                : exp === 2
                ? "2"
                : exp === 3
                ? "6*x"
                : `${exp * (exp - 1)}*x**${exp - 2}`;
            }
          },
        },
        // x^2 -> 2*x (caso especial)
        {
          pattern: /x\*\*2/g,
          replacement: order === "first" ? "2*x" : "2",
        },
        // x^3 -> 3*x^2 (caso especial)
        {
          pattern: /x\*\*3/g,
          replacement: order === "first" ? "3*x**2" : "6*x",
        },
        // x -> 1 (primera derivada) o 0 (segunda derivada)
        {
          pattern: /\bx\b/g,
          replacement: order === "first" ? "1" : "0",
        },
        // Constantes -> 0
        {
          pattern: /\b\d+\b/g,
          replacement: "0",
        },
      ];

      // Aplicar las reglas
      for (const rule of patterns) {
        if (typeof rule.replacement === "function") {
          f = f.replace(rule.pattern, rule.replacement);
        } else {
          f = f.replace(rule.pattern, rule.replacement);
        }
      }

      // Simplificar expresiones básicas
      f = f.replace(/\b0\s*[\+\-]\s*/g, ""); // Eliminar + 0 o - 0
      f = f.replace(/[\+\-]\s*0\b/g, ""); // Eliminar + 0 o - 0 al final
      f = f.replace(/^\s*[\+\-]?\s*0\s*[\+\-]\s*/, ""); // Eliminar 0 + al inicio
      f = f.replace(/^\s*0\s*$/, "0"); // Si solo queda 0
      f = f.trim();

      return f || "0";
    } catch (error) {
      return null;
    }
  };

  const renderFormFields = () => {
    const needsInterval = ["bisection", "reglaFalsa"].includes(selectedMethod);
    const needsDerivative = ["newton", "raicesMultiples"].includes(
      selectedMethod
    );
    const needsSecondDerivative = selectedMethod === "raicesMultiples";
    const needsGFunction = selectedMethod === "puntoFijo";
    const needsTwoPoints = selectedMethod === "secante";

    return (
      <div className="space-y-4">
        {/* Función */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Función f(x) *
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              {...register("function_text", {
                required: "La función es requerida",
              })}
              className={`${getMethodStyles(selectedMethod)} text-black`}
              placeholder="Ej: x**3 - 2*x - 5"
            />
            <button
              type="button"
              onClick={handlePlotFunction}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors whitespace-nowrap"
            >
              Graficar
            </button>
          </div>
          {errors.function_text && (
            <p className="text-red-500 text-xs mt-1">
              {errors.function_text.message}
            </p>
          )}
        </div>

        {/* Primera derivada */}
        {needsDerivative && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Primera Derivada f'(x) *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                {...register("first_derivate_text", {
                  required: "La derivada es requerida",
                })}
                className={`${getMethodStyles(selectedMethod)} text-black`}
                placeholder="Ej: 3*x**2 - 2"
              />
              <button
                type="button"
                onClick={() => calculateDerivative("first")}
                className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors whitespace-nowrap text-sm"
                title="Calcular derivada automáticamente"
              >
                ∂/∂x
              </button>
            </div>
          </div>
        )}

        {/* Segunda derivada */}
        {needsSecondDerivative && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Segunda Derivada f''(x) *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                {...register("second_derivate_text", {
                  required: "La segunda derivada es requerida",
                })}
                className={`${getMethodStyles(selectedMethod)} text-black`}
                placeholder="Ej: 6*x"
              />
              <button
                type="button"
                onClick={() => calculateDerivative("second")}
                className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors whitespace-nowrap text-sm"
                title="Calcular segunda derivada automáticamente"
              >
                ∂²/∂x²
              </button>
            </div>
          </div>
        )}

        {/* Función g(x) para punto fijo */}
        {needsGFunction && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Función g(x) *
            </label>
            <input
              type="text"
              {...register("g_function_text", {
                required: "La función g(x) es requerida",
              })}
              className={`${getMethodStyles(selectedMethod)} text-black`}
              placeholder="Ej: (x**3 - 5)/2"
            />
          </div>
        )}

        {/* Intervalo [a, b] */}
        {needsInterval && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                a *
              </label>
              <input
                type="number"
                step="any"
                {...register("a", { required: "El valor a es requerido" })}
                className={`${getMethodStyles(selectedMethod)} text-black`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                b *
              </label>
              <input
                type="number"
                step="any"
                {...register("b", { required: "El valor b es requerido" })}
                className={`${getMethodStyles(selectedMethod)} text-black`}
              />
            </div>
          </div>
        )}

        {/* Punto inicial x0 */}
        {!needsInterval && !needsTwoPoints && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Valor inicial x0 *
            </label>
            <input
              type="number"
              step="any"
              {...register("x0", { required: "El valor inicial es requerido" })}
              className={`${getMethodStyles(selectedMethod)} text-black`}
            />
          </div>
        )}

        {/* Dos puntos para secante */}
        {needsTwoPoints && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                x0 *
              </label>
              <input
                type="number"
                step="any"
                {...register("x0", { required: "x0 es requerido" })}
                className={`${getMethodStyles(selectedMethod)} text-black`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                x1 *
              </label>
              <input
                type="number"
                step="any"
                {...register("x1", { required: "x1 es requerido" })}
                className={`${getMethodStyles(selectedMethod)} text-black`}
              />
            </div>
          </div>
        )}

        {/* Tolerancia y máximo de iteraciones */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tolerancia *
            </label>
            <input
              type="number"
              step="any"
              {...register("tol", {
                required: "La tolerancia es requerida",
                min: 0,
              })}
              className={`${getMethodStyles(selectedMethod)} text-black`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Máximo de iteraciones *
            </label>
            <input
              type="number"
              {...register("max_count", {
                required: "El máximo de iteraciones es requerido",
                min: 1,
              })}
              className={`${getMethodStyles(selectedMethod)} text-black`}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Link href="/" className="text-blue-600 hover:text-blue-800">
                ← Volver al inicio
              </Link>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Capítulo 1: Solución de Ecuaciones
            </h1>
            <button
              onClick={() => setShowHelp(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
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

              <div className="space-y-2">
                {methods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id as MethodType)}
                    className={`w-full text-left p-3 rounded-md transition-colors ${
                      selectedMethod === method.id
                        ? (() => {
                            switch (method.id) {
                              case 'bisection': return 'bg-blue-100 border-blue-500 border text-blue-800'
                              case 'newton': return 'bg-green-100 border-green-500 border text-green-800'
                              case 'puntoFijo': return 'bg-purple-100 border-purple-500 border text-purple-800'
                              case 'raicesMultiples': return 'bg-orange-100 border-orange-500 border text-orange-800'
                              case 'reglaFalsa': return 'bg-pink-100 border-pink-500 border text-pink-800'
                              case 'secante': return 'bg-teal-100 border-teal-500 border text-teal-800'
                              default: return 'bg-gray-100 border-gray-500 border text-gray-800'
                            }
                          })()
                        : "bg-gray-50 hover:bg-gray-100 border border-gray-200"
                    }`}
                  >
                    <div className={`font-medium ${
                      selectedMethod === method.id ? 'text-inherit' : 'text-gray-900'
                    }`}>
                      {method.name}
                    </div>
                    <div className={`text-xs ${
                      selectedMethod === method.id 
                        ? (() => {
                            switch (method.id) {
                              case 'bisection': return 'text-blue-600'
                              case 'newton': return 'text-green-600'
                              case 'puntoFijo': return 'text-purple-600'
                              case 'raicesMultiples': return 'text-orange-600'
                              case 'reglaFalsa': return 'text-pink-600'
                              case 'secante': return 'text-teal-600'
                              default: return 'text-gray-600'
                            }
                          })()
                        : 'text-gray-600'
                    }`}>
                      {method.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Panel principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Formulario */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4 text-black">
                Configuración del Método:{" "}
                <span className={`${
                  selectedMethod === "bisection"
                    ? "text-blue-700"
                    : selectedMethod === "newton"
                    ? "text-green-700"
                    : selectedMethod === "puntoFijo"
                    ? "text-purple-700"
                    : selectedMethod === "raicesMultiples"
                    ? "text-orange-700"
                    : selectedMethod === "reglaFalsa"
                    ? "text-pink-700"
                    : selectedMethod === "secante"
                    ? "text-teal-700"
                    : "text-gray-900"
                }`}>
                  {methods.find((m) => m.id === selectedMethod)?.name}
                </span>
              </h3>

              <form onSubmit={handleSubmit(onSubmit)}>
                {renderFormFields()}

                <div className="mt-6 flex space-x-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {loading ? (
                      <LoadingSpinner size="sm" color="gray" />
                    ) : (
                      "Calcular"
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      reset();
                      setResults(null);
                      setError(null);
                    }}
                    className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                  >
                    Limpiar
                  </button>
                </div>
              </form>
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
                {/* Tabla de iteraciones personalizada */}
                {results.iterations && results.iterations.length > 0 && (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h4 className="font-semibold mb-4 text-black">
                      Tabla de Iteraciones
                    </h4>

                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-300">
                        <thead>
                          <tr
                            className={`text-white ${
                              selectedMethod === "bisection"
                                ? "bg-blue-600"
                                : selectedMethod === "newton"
                                ? "bg-green-600"
                                : selectedMethod === "puntoFijo"
                                ? "bg-purple-600"
                                : selectedMethod === "raicesMultiples"
                                ? "bg-orange-600"
                                : selectedMethod === "reglaFalsa"
                                ? "bg-pink-600"
                                : selectedMethod === "secante"
                                ? "bg-teal-600"
                                : "bg-gray-600"
                            }`}
                          >
                            <th className="border border-gray-300 px-4 py-2 text-center font-semibold">
                              Iteración (i)
                            </th>
                            <th className="border border-gray-300 px-4 py-2 text-center font-semibold">
                              {selectedMethod === "bisection" ||
                              selectedMethod === "reglaFalsa"
                                ? "a"
                                : "x"}
                            </th>
                            {(selectedMethod === "bisection" ||
                              selectedMethod === "reglaFalsa") && (
                              <th className="border border-gray-300 px-4 py-2 text-center font-semibold">
                                b
                              </th>
                            )}
                            <th className="border border-gray-300 px-4 py-2 text-center font-semibold">
                              {selectedMethod === "bisection" ||
                              selectedMethod === "reglaFalsa"
                                ? "c"
                                : selectedMethod === "secante"
                                ? "x₁"
                                : "x"}
                            </th>
                            {selectedMethod !== "bisection" &&
                              selectedMethod !== "reglaFalsa" && (
                                <th className="border border-gray-300 px-4 py-2 text-center font-semibold">
                                  f(x)
                                </th>
                              )}
                            <th className="border border-gray-300 px-4 py-2 text-center font-semibold">
                              Error
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {results.iterations.map(
                            (iteration: any[], index: number) => (
                              <tr
                                key={index}
                                className={
                                  index % 2 === 0 ? "bg-gray-50" : "bg-white"
                                }
                              >
                                <td className="border border-gray-300 px-4 py-2 text-center font-medium text-black">
                                  {iteration[0]}
                                </td>
                                <td className="border border-gray-300 px-4 py-2 text-center text-black">
                                  {typeof iteration[1] === "number"
                                    ? iteration[1].toFixed(6)
                                    : iteration[1]}
                                </td>
                                {(selectedMethod === "bisection" ||
                                  selectedMethod === "reglaFalsa") &&
                                  iteration.length > 4 && (
                                    <td className="border border-gray-300 px-4 py-2 text-center text-black">
                                      {typeof iteration[2] === "number"
                                        ? iteration[2].toFixed(6)
                                        : iteration[2]}
                                    </td>
                                  )}
                                <td className="border border-gray-300 px-4 py-2 text-center text-black">
                                  {selectedMethod === "bisection" ||
                                  selectedMethod === "reglaFalsa"
                                    ? typeof iteration[3] === "number"
                                      ? iteration[3].toFixed(6)
                                      : iteration[3]
                                    : typeof iteration[2] === "number"
                                    ? iteration[2].toFixed(6)
                                    : iteration[2]}
                                </td>
                                {selectedMethod !== "bisection" &&
                                  selectedMethod !== "reglaFalsa" && (
                                    <td className="border border-gray-300 px-4 py-2 text-center text-black">
                                      {typeof iteration[3] === "number"
                                        ? iteration[3].toExponential(3)
                                        : iteration[3]}
                                    </td>
                                  )}
                                <td className="border border-gray-300 px-4 py-2 text-center text-black">
                                  {typeof iteration[iteration.length - 1] ===
                                  "number"
                                    ? iteration[
                                        iteration.length - 1
                                      ].toExponential(3)
                                    : iteration[iteration.length - 1]}
                                </td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Tabla de iteraciones usando componente ResultTable (respaldo) */}
                {results.iterations &&
                  results.iterations.length > 0 &&
                  false && (
                    <ResultTable
                      data={results.iterations}
                      title="Tabla de Iteraciones"
                      method={selectedMethod}
                    />
                  )}

                {/* Conclusión */}
                {results.conclusion && (
                  <div
                    className={`border rounded-md p-4 ${
                      selectedMethod === "bisection"
                        ? "bg-blue-50 border-blue-200"
                        : selectedMethod === "newton"
                        ? "bg-green-50 border-green-200"
                        : selectedMethod === "puntoFijo"
                        ? "bg-purple-50 border-purple-200"
                        : selectedMethod === "raicesMultiples"
                        ? "bg-orange-50 border-orange-200"
                        : selectedMethod === "reglaFalsa"
                        ? "bg-pink-50 border-pink-200"
                        : selectedMethod === "secante"
                        ? "bg-teal-50 border-teal-200"
                        : "bg-green-50 border-green-200"
                    }`}
                  >
                    <h4
                      className={`font-semibold mb-2 ${
                        selectedMethod === "bisection"
                          ? "text-blue-800"
                          : selectedMethod === "newton"
                          ? "text-green-800"
                          : selectedMethod === "puntoFijo"
                          ? "text-purple-800"
                          : selectedMethod === "raicesMultiples"
                          ? "text-orange-800"
                          : selectedMethod === "reglaFalsa"
                          ? "text-pink-800"
                          : selectedMethod === "secante"
                          ? "text-teal-800"
                          : "text-green-800"
                      }`}
                    >
                      Conclusión
                    </h4>
                    <p
                      className={`${
                        selectedMethod === "bisection"
                          ? "text-blue-700"
                          : selectedMethod === "newton"
                          ? "text-green-700"
                          : selectedMethod === "puntoFijo"
                          ? "text-purple-700"
                          : selectedMethod === "raicesMultiples"
                          ? "text-orange-700"
                          : selectedMethod === "reglaFalsa"
                          ? "text-pink-700"
                          : selectedMethod === "secante"
                          ? "text-teal-700"
                          : "text-green-700"
                      }`}
                    >
                      {results.conclusion}
                    </p>
                  </div>
                )}

                {/* Botón de informe automático */}
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
                    El informe ejecutará: Bisección, Newton, Punto Fijo, Secante, Regla Falsa y Raíces Múltiples
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
        title="Ayuda - Capítulo 1: Solución de Ecuaciones"
      >
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-900">
              Cómo ingresar funciones:
            </h4>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
              <li>Use ** para potencias: x**2 (x al cuadrado)</li>
              <li>Funciones disponibles: sin, cos, tan, exp, log, sqrt</li>
              <li>Ejemplo: x**3 - 2*x - 5</li>
              <li>Ejemplo: sin(x) - x/2</li>
              <li>
                <strong>Nuevo:</strong> Use el botón ∂/∂x para calcular
                derivadas automáticamente
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-black">Métodos disponibles:</h4>
            <div className="space-y-2">
              {methods.map((method) => (
                <div key={method.id} className="text-black">
                  <strong className="text-black">{method.name}:</strong>{" "}
                  <span className="text-black">{method.description}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900">Consejos:</h4>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
              <li>
                Para métodos de intervalo, asegúrese que f(a) y f(b) tengan
                signos opuestos
              </li>
              <li>
                Para Newton, la derivada debe ser no nula cerca de la raíz
              </li>
              <li>Ajuste la tolerancia según la precisión deseada</li>
              <li>
                Si el cálculo automático de derivadas falla, ingréselas
                manualmente
              </li>
              <li>
                El botón ∂/∂x calcula derivadas simbólicas usando reglas
                matemáticas
              </li>
            </ul>
          </div>
        </div>
      </HelpModal>

      {/* Gráfica interactiva */}
      {showInteractivePlot && (
        <InteractivePlot
          functionText={watch("function_text") || ""}
          onClose={() => setShowInteractivePlot(false)}
        />
      )}

      {/* Reporte de comparación */}
      {showComparisonReport && reportData.length > 0 && (
        <ComparisonReport
          title="Informe de Comparación de Métodos - Capítulo 1"
          chapter={1}
          data={reportData}
          onClose={() => setShowComparisonReport(false)}
        />
      )}
    </div>
  );
}
