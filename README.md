# MethodLab - Plataforma de Métodos Numéricos

Una aplicación web completa para ejecutar y analizar métodos numéricos con interfaz intuitiva, gráficos interactivos y reportes de comparación automáticos.

## 👥 Integrantes del Equipo

- **Juan Pablo Jimenez Quiroz**

*Universidad EAFIT - Análisis Numérico - 2025*

## 🚀 Características Principales

- **Interfaz dividida por capítulos** según el contenido del curso de Análisis Numérico
- **Sistema de ayudas contextual** con tutoriales para cada método
- **Prevención de errores** con validación en tiempo real de entrada de datos
- **Gráficos interactivos** generados dinámicamente con Matplotlib
- **Tablas de iteraciones** detalladas con formato profesional
- **Reportes de comparación automáticos** que ejecutan todos los métodos simultáneamente
- **Cálculo automático de derivadas** usando SymPy para métodos que lo requieren
- **Interfaz responsiva** que se adapta a diferentes tamaños de pantalla
- **Ejemplos precargados** para cada método con datos de prueba

## 📚 Métodos Implementados

### Capítulo 1: Solución de Ecuaciones No Lineales
- ✅ **Bisección** - Encuentra raíces por división del intervalo
- ✅ **Regla Falsa** - Método de interpolación lineal  
- ✅ **Punto Fijo** - Iteración de punto fijo g(x) = x
- ✅ **Newton-Raphson** - Método de la tangente
- ✅ **Secante** - Aproximación de Newton sin derivada
- ✅ **Raíces Múltiples** - Newton modificado para raíces múltiples

**Características específicas:**
- Graficación automática de funciones con puntos de iteración
- Tabla de iteraciones con errores relativos y absolutos
- Comparación automática de todos los métodos con un solo clic
- Cálculo automático de derivadas usando botón ∂/∂x
- Detección automática de convergencia y divergencia
- Soporte para funciones trigonométricas, exponenciales y logarítmicas
- Informe detallado con ranking de precisión y eficiencia

### Capítulo 2: Sistemas de Ecuaciones Lineales
- ✅ **Jacobi** - Método iterativo básico
- ✅ **Gauss-Seidel** - Versión mejorada de Jacobi
- ✅ **SOR** - Successive Over-Relaxation con factor ω

**Características específicas:**
- Soporte para matrices hasta 7x7 con entrada dinámica
- Cálculo automático del radio espectral para análisis de convergencia
- Verificación de convergencia antes de iniciar iteraciones
- Múltiples tipos de normas (Norma 1, Norma 2, Norma ∞)
- Visualización de matrices T y C de iteración
- Parámetro ω configurable para método SOR (0 < ω < 2)
- Comparación automática con análisis de radio espectral y velocidad

### Capítulo 3: Interpolación
- ✅ **Vandermonde** - Solución directa del sistema
- ✅ **Newton Interpolante** - Diferencias divididas
- ✅ **Lagrange** - Interpolación usando bases de Lagrange
- ✅ **Spline Lineal** - Interpolación lineal por tramos
- ✅ **Spline Cúbico** - Interpolación suave cúbica

**Características específicas:**
- Graficación automática del polinomio resultante con puntos originales
- Soporte para hasta 8 puntos de datos de interpolación
- Visualización de funciones por tramos para splines
- Comparación automática de todos los métodos de interpolación
- Fórmulas matemáticas generadas para cada método
- Análisis de complejidad (polinomio único vs. por tramos)
- Detección automática de oscilaciones de Runge

## 🏗️ Arquitectura del Proyecto

```
proyecto/
├── backend/                    # API REST en Flask
│   ├── main.py                # Servidor principal y rutas
│   ├── requirements.txt       # Dependencias Python
│   └── methods/               # Implementación de métodos
│       ├── cap1/              # Ecuaciones no lineales
│       ├── cap2/              # Sistemas lineales  
│       └── cap3/              # Interpolación
└── frontend/                  # Aplicación Next.js
    └── methodlab/
        ├── src/
        │   ├── app/           # Páginas de la aplicación
        │   ├── components/    # Componentes reutilizables
        │   └── lib/           # Utilidades y API client
        └── package.json       # Dependencias Node.js
```

## 🛠️ Tecnologías Utilizadas

### Backend
- **Flask** - Framework web minimalista
- **NumPy** - Computación numérica
- **SciPy** - Métodos científicos avanzados
- **SymPy** - Matemática simbólica
- **Matplotlib** - Generación de gráficos

### Frontend  
- **Next.js 15** - Framework React moderno
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos utilitarios
- **Framer Motion** - Animaciones fluidas
- **React Hook Form** - Manejo de formularios
- **Axios** - Cliente HTTP para API
- **Lucide React** - Iconografía

## ⚡ Instalación y Ejecución

### Prerrequisitos
- Python 3.8+
- Node.js 18+
- npm o yarn

### Backend (Puerto 8000)

```bash
# Navegar al directorio backend
cd backend

# Crear entorno virtual (recomendado)
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Ejecutar servidor
python main.py
```

### Frontend (Puerto 3000)

```bash
# Navegar al directorio frontend
cd frontend/methodlab

# Instalar dependencias
npm install --legacy-peer-deps

# Ejecutar en modo desarrollo
npm run dev

# O construir para producción
npm run build
npm start
```

### Acceso
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **Documentación API:** http://localhost:8000/docs (si se activa Swagger)

## 🎯 Guía de Uso

### 1. Navegación Principal
- Accede desde la página principal a cualquiera de los 3 capítulos
- Cada capítulo tiene su interfaz especializada

### 2. Capítulo 1 - Ecuaciones
1. Selecciona el método deseado
2. Ingresa la función usando sintaxis Python (`x**2`, `sin(x)`, etc.)
3. Proporciona derivadas si es necesario (Newton, Raíces Múltiples)
4. Define intervalos o puntos iniciales según el método
5. Ajusta tolerancia y máximo de iteraciones
6. Ejecuta el cálculo y analiza resultados

### 3. Capítulo 2 - Sistemas Lineales  
1. Selecciona método (Jacobi, Gauss-Seidel, SOR)
2. Define el tamaño de matriz (2x2 hasta 7x7)
3. Ingresa coeficientes de la matriz A y vector B
4. Establece vector inicial X0
5. Configura tipo de norma y parámetros específicos
6. Revisa convergencia y resultados

### 4. Capítulo 3 - Interpolación
1. Elige método de interpolación  
2. Especifica número de puntos (2-8)
3. Ingresa coordenadas (X, Y) de los puntos
4. Ejecuta interpolación
5. Visualiza polinomio resultante y gráfico

### 5. Reportes de Comparación Automáticos
- Disponible en todos los capítulos con un solo clic
- Ejecuta todos los métodos simultáneamente con los mismos parámetros
- Compara velocidad de convergencia (número de iteraciones)
- Analiza precisión alcanzada (error final)
- Identifica automáticamente el mejor método según criterios múltiples
- Muestra ranking detallado de métodos por error y eficiencia
- Incluye análisis de convergencia y tiempo de ejecución
- Presenta recomendaciones basadas en los resultados

## 🧮 Sintaxis para Funciones

### Operadores Soportados
- `+`, `-`, `*`, `/` - Operaciones básicas
- `**` - Potenciación (ej: `x**2`)
- `()` - Agrupación

### Funciones Matemáticas
- `sin(x)`, `cos(x)`, `tan(x)` - Trigonométricas
- `exp(x)` - Exponencial
- `log(x)` - Logaritmo natural
- `sqrt(x)` - Raíz cuadrada
- `abs(x)` - Valor absoluto

### Ejemplos de Funciones Válidas
```python
x**3 - 2*x - 5
sin(x) - x/2  
exp(x) - 2*x
x**2 - 4
log(x) - 1/x
```

## 📊 Funcionalidades de Análisis

### Prevención de Errores
- Validación de entrada en tiempo real con mensajes descriptivos
- Verificación de dominios de funciones (logaritmos, raíces)
- Detección de singularidades y división por cero
- Verificación de condiciones de convergencia antes de ejecutar
- Alertas de divergencia durante las iteraciones
- Validación de matrices (diagonal dominante, invertibilidad)

### Reportes Automáticos Inteligentes
- **Resumen Ejecutivo**: Identificación automática del mejor método
- **Análisis por Método**: Estado, iteraciones, error final y raíz aproximada
- **Análisis Comparativo**: Gráficos comparativos de convergencia, eficiencia y precisión
- **Ranking Automático**: Orden de métodos por error final y velocidad
- **Tipos de Error**: Explicación de errores relativos, absolutos y normas
- **Recomendaciones**: Sugerencias basadas en resultados obtenidos
- **Métricas de Rendimiento**: Tiempo de ejecución de cada método

### Visualización Avanzada
- Gráficos de funciones con matplotlib en base64
- Puntos de iteración superpuestos en la gráfica
- Tablas de iteraciones con formato profesional y colores por método
- Representación visual de splines lineales y cúbicos
- Matrices de iteración (T y C) formateadas
- Interfaz con código de colores por método para fácil identificación

## 🔧 Configuración API

La API REST expone endpoints para cada método. Todos retornan JSON con resultados o errores.

### Capítulo 1 - Ecuaciones No Lineales
- `POST /calculate/bisection` - Parámetros: `function_text`, `a`, `b`, `tol`, `max_count`
- `POST /calculate/newton` - Parámetros: `function_text`, `first_derivate_text`, `x0`, `tol`, `max_count`
- `POST /calculate/puntoFijo` - Parámetros: `function_text`, `g_function_text`, `x0`, `tol`, `max_count`
- `POST /calculate/raicesMultiples` - Parámetros: `function_text`, `first_derivate_text`, `second_derivate_text`, `x0`, `tol`, `max_count`
- `POST /calculate/ReglaFalsa` - Parámetros: `function_text`, `a`, `b`, `tol`, `max_count`
- `POST /calculate/secante` - Parámetros: `function_text`, `x0`, `x1`, `tol`, `max_count`

### Capítulo 2 - Sistemas Lineales
- `POST /calculate/jacobi` - Parámetros: `matrixA`, `vectorB`, `vectorX0`, `norm_type`, `tol`, `max_count`
- `POST /calculate/gaussSeidel` - Parámetros: `matrixA`, `vectorB`, `vectorX0`, `norm_type`, `tol`, `max_count`
- `POST /calculate/sor` - Parámetros: `matrixA`, `vectorB`, `vectorX0`, `w`, `norm_type`, `tol`, `max_count`

### Capítulo 3 - Interpolación
- `POST /calculate/lagrange` - Parámetros: `x_values`, `y_values`
- `POST /calculate/newton_interpolation` - Parámetros: `x_values`, `y_values`
- `POST /calculate/spline_cubico` - Parámetros: `x_values`, `y_values`
- `POST /calculate/spline_lineal` - Parámetros: `x_values`, `y_values`
- `POST /calculate/vandermonde` - Parámetros: `x_values`, `y_values`

### Endpoint Adicional
- `POST /plot` - Genera gráfico de función. Parámetros: `function_text`, `x_min` (opcional), `x_max` (opcional)

## 🤝 Contribución

Este proyecto fue desarrollado como trabajo final del curso de Análisis Numérico. Para contribuciones o mejoras:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commitea tus cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crea un Pull Request

## 📝 Licencia

Este proyecto es desarrollado con fines académicos para la Universidad EAFIT.

## 🐛 Problemas Conocidos y Soluciones

### Error de CORS
Si experimentas problemas de CORS, asegúrate de que:
- El backend esté ejecutándose en el puerto 8000
- Flask-CORS esté instalado correctamente
- El frontend apunte a `http://localhost:8000`

### Dependencias del Frontend
Si hay conflictos de dependencias de React/Next.js:
```bash
npm install --legacy-peer-deps
```

### Python Virtual Environment
Siempre usa un entorno virtual para evitar conflictos:
```bash
python -m venv venv
# Windows: venv\Scripts\activate
# Linux/Mac: source venv/bin/activate
```

### Errores de Matplotlib
Si hay problemas con generación de gráficos:
```bash
pip install matplotlib --upgrade
```

### Puerto en Uso
Si el puerto 3000 o 8000 está ocupado:
```bash
# Frontend - cambiar puerto
PORT=3001 npm run dev

# Backend - modificar en main.py
app.run(debug=True, port=8001)
```

## 💡 Consejos de Uso

### Para Mejores Resultados:

**Capítulo 1 - Ecuaciones:**
- Usa el botón ∂/∂x para calcular derivadas automáticamente
- Verifica que f(a) y f(b) tengan signos opuestos para Bisección/Regla Falsa
- Para Punto Fijo, asegúrate de que |g'(x)| < 1 cerca de la raíz
- Comienza con tolerancias de 1e-6 y ajusta según necesites

**Capítulo 2 - Sistemas:**
- Verifica que la matriz sea diagonal dominante para garantizar convergencia
- Revisa el radio espectral antes de ejecutar muchas iteraciones
- Para SOR, valores de ω entre 1.0 y 1.8 suelen funcionar mejor
- Usa Norma ∞ para una convergencia más estricta

**Capítulo 3 - Interpolación:**
- Ordena los puntos por valor X antes de interpolar
- Para muchos puntos (>6), considera usar splines para evitar oscilaciones
- Los splines cúbicos dan resultados más suaves que los lineales
- Vandermonde puede ser inestable para más de 8 puntos

## 📈 Estructura de Respuestas API

### Respuesta Exitosa (Capítulo 1):
```json
{
  "result": {
    "iterations": [[iter, x, fx, error], ...],
    "conclusion": "Raíz encontrada en x = 1.234",
    "root": 1.234,
    "error_type": "relativo",
    "tolerance": 1e-6,
    "image_base64": "iVBORw0KGgoAAAANS..."
  }
}
```

### Respuesta con Error:
```json
{
  "error": "La función no cambia de signo en el intervalo"
}
```

### Respuesta Exitosa (Capítulo 2):
```json
{
  "result": {
    "iterations": [[iter, error, [x1, x2, x3]], ...],
    "T": [[...], [...]],
    "C": [...],
    "spectral_radius": 0.567,
    "conclusion": "Sistema resuelto exitosamente",
    "norm_type": 1
  }
}
```

### Respuesta Exitosa (Capítulo 3):
```json
{
  "result": {
    "polynomial": [a0, a1, a2, ...],
    "polynomial_str": "1.0 + 2.0x + 3.0x^2",
    "splines": ["...", "..."],
    "image_base64": "iVBORw0KGgoAAAANS..."
  }
}
```

## 🎓 Créditos y Agradecimientos

Este proyecto fue desarrollado como trabajo final del curso de **Análisis Numérico** en la **Universidad EAFIT**, 2025.

### Tecnologías y Recursos
- Algoritmos basados en el libro "Métodos Numéricos" de Richard L. Burden y J. Douglas Faires
- Implementación de métodos verificada con literatura académica
- Interfaz diseñada siguiendo principios de UX/UI modernos
- Inspiración en plataformas educativas como Symbolab y WolframAlpha

### Propósito Académico
Esta herramienta fue creada con fines educativos para:
- Facilitar el aprendizaje de métodos numéricos
- Permitir experimentación con diferentes parámetros
- Visualizar el comportamiento de algoritmos iterativos
- Comparar la eficiencia de diferentes enfoques
- Proporcionar una plataforma interactiva para estudiantes

## 📞 Contacto y Soporte

Para reportar bugs, solicitar features o hacer preguntas:
- **Email**: [jpjimenezq@eafit.edu.co](mailto:jpjimenezq@eafit.edu.co)
- **GitHub Issues**: [Crear un issue](https://github.com/jpjimenezq/MethodLab/issues)
- **Universidad EAFIT**: Departamento de Ciencias Matemáticas

## 🌟 Mejoras Futuras

Características planeadas para versiones futuras:
- [ ] Exportación de resultados a PDF
- [ ] Más métodos (Newton con relajación, gradiente conjugado)
- [ ] Soporte para ecuaciones diferenciales ordinarias
- [ ] Integración numérica (trapecio, Simpson)
- [ ] Derivación e integración numérica
- [ ] Modo oscuro para la interfaz
- [ ] Historial de cálculos
- [ ] Compartir resultados por URL

---

**Desarrollado con ❤️ para la comunidad de Análisis Numérico - Universidad EAFIT**

*Si este proyecto te fue útil, considera darle una ⭐ en GitHub*
