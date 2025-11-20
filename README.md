# MethodLab - Plataforma de Métodos Numéricos

Una aplicación web completa para ejecutar y analizar métodos numéricos con interfaz intuitiva, gráficos interactivos y reportes de comparación automáticos.

## 👥 Integrantes del Equipo

- **[Nombre del Estudiante 1]** - Desarrollo Backend y API
- **[Nombre del Estudiante 2]** - Desarrollo Frontend y UI/UX  
- **[Nombre del Estudiante 3]** - Implementación de Métodos Numéricos
- **[Nombre del Estudiante 4]** - Documentación y Testing

*Universidad EAFIT - Análisis Numérico - 2025*

## 🚀 Características Principales

- **Interfaz dividida por capítulos** según el contenido del curso
- **Sistema de ayudas contextual** para guiar al usuario
- **Prevención de errores** con validación en tiempo real
- **Gráficos interactivos** para visualización de resultados
- **Tablas de iteraciones** detalladas
- **Reportes de comparación automáticos** entre métodos
- **Soporte para funciones algebraicas** con sintaxis intuitiva

## 📚 Métodos Implementados

### Capítulo 1: Solución de Ecuaciones No Lineales
- ✅ **Bisección** - Encuentra raíces por división del intervalo
- ✅ **Regla Falsa** - Método de interpolación lineal  
- ✅ **Punto Fijo** - Iteración de punto fijo g(x) = x
- ✅ **Newton-Raphson** - Método de la tangente
- ✅ **Secante** - Aproximación de Newton sin derivada
- ✅ **Raíces Múltiples** - Newton modificado para raíces múltiples

**Características específicas:**
- Graficación de funciones y convergencia
- Tabla de iteraciones con errores relativos y absolutos
- Comparación automática de métodos
- Ayuda para calcular derivadas

### Capítulo 2: Sistemas de Ecuaciones Lineales
- ✅ **Jacobi** - Método iterativo básico
- ✅ **Gauss-Seidel** - Versión mejorada de Jacobi
- ✅ **SOR** - Successive Over-Relaxation con factor ω

**Características específicas:**
- Soporte para matrices hasta 7x7
- Cálculo del radio espectral
- Análisis de convergencia automático
- Múltiples tipos de normas (1, 2, ∞)
- Comparación de métodos con diferentes errores

### Capítulo 3: Interpolación
- ✅ **Vandermonde** - Solución directa del sistema
- ✅ **Newton Interpolante** - Diferencias divididas
- ✅ **Lagrange** - Interpolación usando bases de Lagrange
- ✅ **Spline Lineal** - Interpolación lineal por tramos
- ✅ **Spline Cúbico** - Interpolación suave cúbica

**Características específicas:**
- Graficación del polinomio resultante
- Soporte para hasta 8 puntos de datos
- Visualización de funciones por tramos
- Comparación de precisión entre métodos

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

### 5. Reportes de Comparación
- Disponible en todos los capítulos
- Compara múltiples métodos automáticamente
- Identifica el método más eficiente
- Analiza diferentes tipos de errores

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
- Validación de entrada en tiempo real
- Verificación de dominios de funciones
- Detección de singularidades
- Alertas de convergencia

### Reportes Automáticos
- Comparación de velocidad de convergencia
- Análisis de precisión alcanzada  
- Identificación del mejor método
- Métricas de error detalladas

### Visualización
- Gráficos de funciones y convergencia
- Tablas de iteraciones formateadas
- Representación visual de splines
- Exportación de resultados

## 🔧 Configuración API

La API REST expone endpoints para cada método:

### Capítulo 1
- `POST /calculate/bisection`
- `POST /calculate/newton`
- `POST /calculate/puntoFijo`
- `POST /calculate/raicesMultiples`
- `POST /calculate/ReglaFalsa`
- `POST /calculate/secante`

### Capítulo 2  
- `POST /calculate/jacobi`
- `POST /calculate/gaussSeidel`
- `POST /calculate/sor`

### Capítulo 3
- `POST /calculate/lagrange`
- `POST /calculate/newton_interpolation`
- `POST /calculate/spline_cubico`
- `POST /calculate/spline_lineal`
- `POST /calculate/vandermonde`

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
Si experimentas problemas de CORS, asegúrate de que el backend esté ejecutándose en el puerto 8000.

### Dependencias del Frontend
Si hay conflictos de dependencias, usa: `npm install --legacy-peer-deps`

### Python Virtual Environment
Siempre usa un entorno virtual para evitar conflictos de dependencias de Python.

---

**Desarrollado con ❤️ por estudiantes de Análisis Numérico - Universidad EAFIT**
