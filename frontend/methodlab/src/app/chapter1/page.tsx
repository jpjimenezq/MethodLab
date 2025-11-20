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
  const [showExecutionReport, setShowExecutionReport] = useState(false);
  const [executionReportData, setExecutionReportData] = useState<any>(null);

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

  // Función para generar informe de ejecución
  const generateExecutionReport = () => {
    const currentFormData: any = watch();
    const missingData: string[] = [];
    const warnings: string[] = [];

    // Validar función principal
    if (!currentFormData.function_text || currentFormData.function_text.trim() === '') {
      missingData.push('Función f(x) principal');
    }

    // Validar datos específicos del método
    const methodRequirements: { [key in MethodType]: string[] } = {
      bisection: ['a', 'b'],
      newton: ['first_derivate_text', 'x0'],
      puntoFijo: ['g_function_text', 'x0'],
      raicesMultiples: ['first_derivate_text', 'second_derivate_text', 'x0'],
      reglaFalsa: ['a', 'b'],
      secante: ['x0', 'x1']
    };

    const requirements = methodRequirements[selectedMethod];
    requirements.forEach(field => {
      if (!currentFormData[field] || currentFormData[field] === '') {
        if (field === 'first_derivate_text') missingData.push('Primera derivada f\'(x)');
        else if (field === 'second_derivate_text') missingData.push('Segunda derivada f\'\'(x)');
        else if (field === 'g_function_text') missingData.push('Función g(x) para punto fijo');
        else if (field === 'a') missingData.push('Valor inicial del intervalo (a)');
        else if (field === 'b') missingData.push('Valor final del intervalo (b)');
        else if (field === 'x0') missingData.push('Valor inicial x₀');
        else if (field === 'x1') missingData.push('Segundo valor inicial x₁');
      }
    });

    // Validar intervalo para métodos que lo requieren
    if (['bisection', 'reglaFalsa'].includes(selectedMethod)) {
      const a = parseFloat(currentFormData.a);
      const b = parseFloat(currentFormData.b);
      if (!isNaN(a) && !isNaN(b) && a >= b) {
        warnings.push('El intervalo [a, b] debe cumplir a < b');
      }
    }

    // Validar tolerancia y iteraciones
    if (!currentFormData.tol || currentFormData.tol <= 0) {
      warnings.push('La tolerancia debe ser mayor que 0');
    }
    if (!currentFormData.max_count || currentFormData.max_count <= 0) {
      warnings.push('El número máximo de iteraciones debe ser mayor que 0');
    }

    // Crear objeto de reporte
    const report = {
      timestamp: new Date().toLocaleString('es-ES'),
      method: methods.find(m => m.id === selectedMethod)?.name || selectedMethod,
      systemDescription: {
        function: {
          description: 'La función f(x) es la ecuación cuyas raíces (valores de x donde f(x) = 0) queremos encontrar',
          value: currentFormData.function_text || 'No especificada',
          purpose: 'Define el problema a resolver',
          example: 'Ejemplo: x**3 - 2*x - 5 busca valores donde x³ - 2x - 5 = 0'
        },
        ...(selectedMethod === 'newton' || selectedMethod === 'raicesMultiples' ? {
          firstDerivative: {
            description: 'La primera derivada f\'(x) indica la pendiente de la función en cada punto',
            value: currentFormData.first_derivate_text || 'No especificada',
            purpose: 'Necesaria para calcular la dirección de búsqueda de la raíz',
            example: 'Si f(x) = x³ - 2x - 5, entonces f\'(x) = 3x² - 2'
          }
        } : {}),
        ...(selectedMethod === 'raicesMultiples' ? {
          secondDerivative: {
            description: 'La segunda derivada f\'\'(x) indica la curvatura de la función',
            value: currentFormData.second_derivate_text || 'No especificada',
            purpose: 'Necesaria para el método de raíces múltiples que maneja raíces repetidas',
            example: 'Si f(x) = (x-2)², entonces f\'\'(x) = 2'
          }
        } : {}),
        ...(selectedMethod === 'puntoFijo' ? {
          gFunction: {
            description: 'La función g(x) es una reformulación de f(x) = 0 como x = g(x)',
            value: currentFormData.g_function_text || 'No especificada',
            purpose: 'El método busca un punto fijo donde x = g(x), equivalente a f(x) = 0',
            example: 'Si f(x) = x³ - 2x - 5 = 0, una g(x) posible es g(x) = (2x + 5)^(1/3)'
          }
        } : {}),
        ...(['bisection', 'reglaFalsa'].includes(selectedMethod) ? {
          interval: {
            description: 'El intervalo [a, b] debe contener la raíz, es decir, f(a) y f(b) deben tener signos opuestos',
            value: `[${currentFormData.a || '?'}, ${currentFormData.b || '?'}]`,
            purpose: 'Delimita la región de búsqueda de la raíz',
            recommendation: 'Verifica que f(a) · f(b) < 0 (signos opuestos)'
          }
        } : {}),
        ...(['newton', 'puntoFijo', 'raicesMultiples'].includes(selectedMethod) ? {
          initialValue: {
            description: 'El valor inicial x₀ es el punto de partida para la búsqueda iterativa',
            value: currentFormData.x0 !== undefined ? currentFormData.x0.toString() : 'No especificado',
            purpose: 'Determina desde dónde comienza la búsqueda de la raíz',
            recommendation: 'Elige un valor cercano a la raíz esperada para convergencia más rápida'
          }
        } : {}),
        ...(selectedMethod === 'secante' ? {
          initialValues: {
            description: 'El método secante necesita dos valores iniciales x₀ y x₁',
            value: `x₀ = ${currentFormData.x0 !== undefined ? currentFormData.x0 : '?'}, x₁ = ${currentFormData.x1 !== undefined ? currentFormData.x1 : '?'}`,
            purpose: 'Define la primera secante (línea entre dos puntos) para aproximar la raíz',
            recommendation: 'Elige valores cercanos pero distintos, idealmente cerca de la raíz'
          }
        } : {}),
        parameters: {
          tolerance: {
            name: 'Tolerancia',
            value: currentFormData.tol || 1e-6,
            description: 'Error máximo aceptable en la aproximación',
            purpose: 'Controla la precisión del resultado final',
            recommendation: 'Valores más pequeños dan mayor precisión pero requieren más iteraciones'
          },
          maxIterations: {
            name: 'Iteraciones Máximas',
            value: currentFormData.max_count || 100,
            description: 'Número máximo de pasos permitidos',
            purpose: 'Evita bucles infinitos si el método no converge',
            recommendation: 'Aumenta este valor si el método se detiene sin converger'
          }
        }
      },
      methodExplanation: {
        name: methods.find(m => m.id === selectedMethod)?.name || selectedMethod,
        description: {
          bisection: 'Método que divide repetidamente el intervalo por la mitad y selecciona el subintervalo donde está la raíz',
          newton: 'Método que usa la tangente (derivada) en cada punto para aproximarse rápidamente a la raíz',
          puntoFijo: 'Método que transforma f(x)=0 en x=g(x) y busca un punto donde x no cambie (punto fijo)',
          raicesMultiples: 'Versión modificada de Newton que maneja raíces repetidas usando la segunda derivada',
          reglaFalsa: 'Similar a bisección pero usa interpolación lineal en lugar de punto medio',
          secante: 'Similar a Newton pero aproxima la derivada usando dos puntos en lugar de calcularla'
        }[selectedMethod],
        formula: {
          bisection: 'x = (a + b) / 2, luego selecciona [a,x] o [x,b] según signos',
          newton: 'x_{n+1} = x_n - f(x_n) / f\'(x_n)',
          puntoFijo: 'x_{n+1} = g(x_n)',
          raicesMultiples: 'x_{n+1} = x_n - [f(x)·f\'(x)] / [f\'(x)² - f(x)·f\'\'(x)]',
          reglaFalsa: 'x = a - f(a)·(b-a) / [f(b)-f(a)]',
          secante: 'x_{n+1} = x_n - f(x_n)·(x_n - x_{n-1}) / [f(x_n) - f(x_{n-1})]'
        }[selectedMethod],
        convergence: {
          bisection: 'Convergencia garantizada si f(a)·f(b) < 0. Siempre converge pero es lento (lineal)',
          newton: 'Convergencia cuadrática (muy rápida) si x₀ está cerca de la raíz y f\'(x) ≠ 0',
          puntoFijo: 'Converge si |g\'(x)| < 1 en la región de la raíz',
          raicesMultiples: 'Converge cuadráticamente incluso para raíces múltiples',
          reglaFalsa: 'Convergencia garantizada si f(a)·f(b) < 0, puede ser más lenta que bisección en algunos casos',
          secante: 'Convergencia superlineal (~1.618), más rápida que bisección pero más lenta que Newton'
        }[selectedMethod]
      },
      validation: {
        hasAllData: missingData.length === 0,
        missingData: missingData,
        warnings: warnings,
        canExecute: missingData.length === 0
      }
    };

    setExecutionReportData(report);
    setShowExecutionReport(true);
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
                                xm
                              </th>
                            )}
                            <th className="border border-gray-300 px-4 py-2 text-center font-semibold">
                              {selectedMethod === "bisection" ||
                              selectedMethod === "reglaFalsa"
                                ? "b"
                                : selectedMethod === "secante"
                                ? "x₁"
                                : selectedMethod === "puntoFijo"
                                ? "g(x)"
                                : selectedMethod === "newton"
                                ? "f(x)"
                                : selectedMethod === "raicesMultiples"
                                ? "f(x)"
                                : "x"}
                            </th>
                            {selectedMethod === "newton" && (
                              <th className="border border-gray-300 px-4 py-2 text-center font-semibold">
                                f'(x)
                              </th>
                            )}
                            {selectedMethod === "raicesMultiples" && (
                              <th className="border border-gray-300 px-4 py-2 text-center font-semibold">
                                f'(x)
                              </th>
                            )}
                            {(selectedMethod === "puntoFijo" || selectedMethod === "secante") && (
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
                                    ? iteration[2].toExponential(3)
                                    : iteration[2]}
                                </td>
                                {selectedMethod === "newton" && (
                                  <td className="border border-gray-300 px-4 py-2 text-center text-black">
                                    {typeof iteration[3] === "number"
                                      ? iteration[3].toExponential(3)
                                      : iteration[3]}
                                  </td>
                                )}
                                {selectedMethod === "raicesMultiples" && (
                                  <td className="border border-gray-300 px-4 py-2 text-center text-black">
                                    {typeof iteration[3] === "number"
                                      ? iteration[3].toExponential(3)
                                      : iteration[3]}
                                  </td>
                                )}
                                {(selectedMethod === "puntoFijo" || selectedMethod === "secante") && (
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

                {/* Botones de reportes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Informe de Comparación */}
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-6 text-center">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      Informe de Comparación
                    </h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Ejecuta todos los métodos y compara resultados
                    </p>
                    <button
                      onClick={runAutomaticReport}
                      disabled={loading}
                      className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors font-semibold shadow-md"
                    >
                      {loading ? <LoadingSpinner size="sm" color="gray" /> : 'Generar Comparación'}
                    </button>
                    <p className="text-xs text-gray-500 mt-3">
                      Compara: Bisección, Newton, Punto Fijo, Secante, Regla Falsa y Raíces Múltiples
                    </p>
                  </div>

                  {/* Informe de Ejecución */}
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-6 text-center">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      Informe de Ejecución
                    </h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Explica los datos y valida el sistema
                    </p>
                    <button
                      onClick={generateExecutionReport}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-md"
                    >
                      Ver Detalles del Sistema
                    </button>
                    <p className="text-xs text-gray-500 mt-3">
                      Descripción y validación de datos
                    </p>
                  </div>
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

      {/* Informe de Ejecución */}
      {showExecutionReport && executionReportData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b px-6 py-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Informe de Ejecución del Método</h2>
                <button
                  onClick={() => setShowExecutionReport(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {executionReportData.timestamp} - Método: {executionReportData.method}
              </p>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Estado de Validación */}
              <div className={`border rounded-lg p-4 ${
                executionReportData.validation.canExecute 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <h3 className="text-lg font-semibold mb-2 text-black">
                  {executionReportData.validation.canExecute ? 'Sistema Listo' : 'Datos Incompletos'}
                </h3>
                
                {executionReportData.validation.missingData.length > 0 && (
                  <div className="mb-3">
                    <p className="font-medium text-red-800 mb-1">Datos faltantes:</p>
                    <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                      {executionReportData.validation.missingData.map((item: string, idx: number) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {executionReportData.validation.warnings.length > 0 && (
                  <div>
                    <p className="font-medium text-yellow-800 mb-1">Advertencias:</p>
                    <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
                      {executionReportData.validation.warnings.map((item: string, idx: number) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {executionReportData.validation.canExecute && (
                  <p className="text-green-700 text-sm mt-2">
                    Todos los datos están completos. Puedes ejecutar el método.
                  </p>
                )}
              </div>

              {/* Descripción de Componentes */}
              <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">Componentes del Problema</h3>
                
                <div className="space-y-3">
                  {/* Función principal */}
                  <div className="bg-white rounded p-3">
                    <h4 className="font-semibold text-black mb-1">Función f(x)</h4>
                    <p className="text-sm text-black mb-1">
                      <strong>Valor:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{executionReportData.systemDescription.function.value}</code>
                    </p>
                    <p className="text-sm text-black mb-1">
                      <strong>¿Qué es?</strong> {executionReportData.systemDescription.function.description}
                    </p>
                    <p className="text-xs text-gray-600 italic">
                      {executionReportData.systemDescription.function.example}
                    </p>
                  </div>

                  {/* Primera derivada */}
                  {executionReportData.systemDescription.firstDerivative && (
                    <div className="bg-white rounded p-3">
                      <h4 className="font-semibold text-black mb-1">Primera Derivada f'(x)</h4>
                      <p className="text-sm text-black mb-1">
                        <strong>Valor:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{executionReportData.systemDescription.firstDerivative.value}</code>
                      </p>
                      <p className="text-sm text-black mb-1">
                        <strong>¿Qué es?</strong> {executionReportData.systemDescription.firstDerivative.description}
                      </p>
                      <p className="text-xs text-gray-600 italic">
                        {executionReportData.systemDescription.firstDerivative.example}
                      </p>
                    </div>
                  )}

                  {/* Segunda derivada */}
                  {executionReportData.systemDescription.secondDerivative && (
                    <div className="bg-white rounded p-3">
                      <h4 className="font-semibold text-black mb-1">Segunda Derivada f''(x)</h4>
                      <p className="text-sm text-black mb-1">
                        <strong>Valor:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{executionReportData.systemDescription.secondDerivative.value}</code>
                      </p>
                      <p className="text-sm text-black mb-1">
                        <strong>¿Qué es?</strong> {executionReportData.systemDescription.secondDerivative.description}
                      </p>
                      <p className="text-xs text-gray-600 italic">
                        {executionReportData.systemDescription.secondDerivative.example}
                      </p>
                    </div>
                  )}

                  {/* Función g(x) para punto fijo */}
                  {executionReportData.systemDescription.gFunction && (
                    <div className="bg-white rounded p-3">
                      <h4 className="font-semibold text-black mb-1">Función g(x) (Punto Fijo)</h4>
                      <p className="text-sm text-black mb-1">
                        <strong>Valor:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{executionReportData.systemDescription.gFunction.value}</code>
                      </p>
                      <p className="text-sm text-black mb-1">
                        <strong>¿Qué es?</strong> {executionReportData.systemDescription.gFunction.description}
                      </p>
                      <p className="text-xs text-gray-600 italic">
                        {executionReportData.systemDescription.gFunction.example}
                      </p>
                    </div>
                  )}

                  {/* Intervalo [a,b] */}
                  {executionReportData.systemDescription.interval && (
                    <div className="bg-white rounded p-3">
                      <h4 className="font-semibold text-black mb-1">Intervalo [a, b]</h4>
                      <p className="text-sm text-black mb-1">
                        <strong>Valor:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{executionReportData.systemDescription.interval.value}</code>
                      </p>
                      <p className="text-sm text-black mb-1">
                        <strong>¿Qué es?</strong> {executionReportData.systemDescription.interval.description}
                      </p>
                      <p className="text-xs text-gray-600 italic">
                        Recomendación: {executionReportData.systemDescription.interval.recommendation}
                      </p>
                    </div>
                  )}

                  {/* Valor inicial x₀ */}
                  {executionReportData.systemDescription.initialValue && (
                    <div className="bg-white rounded p-3">
                      <h4 className="font-semibold text-black mb-1">Valor Inicial x₀</h4>
                      <p className="text-sm text-black mb-1">
                        <strong>Valor:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{executionReportData.systemDescription.initialValue.value}</code>
                      </p>
                      <p className="text-sm text-black mb-1">
                        <strong>¿Qué es?</strong> {executionReportData.systemDescription.initialValue.description}
                      </p>
                      <p className="text-xs text-gray-600 italic">
                        Recomendación: {executionReportData.systemDescription.initialValue.recommendation}
                      </p>
                    </div>
                  )}

                  {/* Valores iniciales x₀ y x₁ para secante */}
                  {executionReportData.systemDescription.initialValues && (
                    <div className="bg-white rounded p-3">
                      <h4 className="font-semibold text-black mb-1">Valores Iniciales</h4>
                      <p className="text-sm text-black mb-1">
                        <strong>Valor:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{executionReportData.systemDescription.initialValues.value}</code>
                      </p>
                      <p className="text-sm text-black mb-1">
                        <strong>¿Qué es?</strong> {executionReportData.systemDescription.initialValues.description}
                      </p>
                      <p className="text-xs text-gray-600 italic">
                        Recomendación: {executionReportData.systemDescription.initialValues.recommendation}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Parámetros */}
              <div className="border border-purple-200 bg-purple-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-purple-900 mb-3">Parámetros de Configuración</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(executionReportData.systemDescription.parameters).map(([key, param]: [string, any]) => (
                    <div key={key} className="bg-white rounded p-3">
                      <h4 className="font-semibold text-black text-sm mb-1">{param.name}</h4>
                      <p className="text-xs text-black mb-1">
                        <strong>Valor:</strong> {param.value}
                      </p>
                      <p className="text-xs text-black mb-1">
                        <strong>Descripción:</strong> {param.description}
                      </p>
                      <p className="text-xs text-gray-600">
                        <strong>Propósito:</strong> {param.purpose}
                      </p>
                      {param.recommendation && (
                        <p className="text-xs text-purple-600 mt-1">
                          Recomendación: {param.recommendation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Explicación del Método */}
              <div className="border border-indigo-200 bg-indigo-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-indigo-900 mb-3">Método: {executionReportData.methodExplanation.name}</h3>
                
                <div className="space-y-3">
                  <div className="bg-white rounded p-3">
                    <h4 className="font-semibold text-black text-sm mb-1">¿Cómo funciona?</h4>
                    <p className="text-sm text-black">{executionReportData.methodExplanation.description}</p>
                  </div>

                  <div className="bg-white rounded p-3">
                    <h4 className="font-semibold text-black text-sm mb-1">Fórmula</h4>
                    <p className="text-sm text-black font-mono bg-gray-100 p-2 rounded">
                      {executionReportData.methodExplanation.formula}
                    </p>
                  </div>

                  <div className="bg-white rounded p-3">
                    <h4 className="font-semibold text-black text-sm mb-1">Condición de Convergencia</h4>
                    <p className="text-sm text-black">{executionReportData.methodExplanation.convergence}</p>
                  </div>
                </div>
              </div>

              {/* Recomendaciones */}
              <div className="border border-yellow-200 bg-yellow-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-yellow-900 mb-3">Recomendaciones</h3>
                <ul className="list-disc list-inside text-sm text-black space-y-2">
                  <li>Verifica que todos los campos requeridos estén completos</li>
                  <li>Para métodos de intervalo (Bisección, Regla Falsa): asegúrate que f(a) y f(b) tengan signos opuestos</li>
                  <li>Para Newton y Raíces Múltiples: la derivada no debe ser cero cerca de la raíz</li>
                  <li>Para Punto Fijo: verifica que |g'(x)| &lt; 1 en el intervalo de interés</li>
                  <li>Una buena aproximación inicial acelera la convergencia</li>
                  <li>Aumenta las iteraciones máximas si el método no converge</li>
                  <li>Reduce la tolerancia solo si necesitas mayor precisión</li>
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t">
              <div className="flex justify-end space-x-3">
                {executionReportData.validation.canExecute && (
                  <button
                    onClick={() => {
                      setShowExecutionReport(false);
                      handleSubmit(onSubmit)();
                    }}
                    className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                  >
                    Ejecutar Método
                  </button>
                )}
                <button
                  onClick={() => setShowExecutionReport(false)}
                  className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
