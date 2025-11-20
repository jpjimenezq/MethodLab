# 📐 Guía Completa de Métodos Numéricos

## Tabla de Contenidos
- [Capítulo 1: Solución de Ecuaciones No Lineales](#capítulo-1-solución-de-ecuaciones-no-lineales)
  - [Método de Bisección](#1-método-de-bisección)
  - [Método de Regla Falsa (Falsa Posición)](#2-método-de-regla-falsa-falsa-posición)
  - [Método de Punto Fijo](#3-método-de-punto-fijo)
  - [Método de Newton-Raphson](#4-método-de-newton-raphson)
  - [Método de la Secante](#5-método-de-la-secante)
  - [Método de Raíces Múltiples](#6-método-de-raíces-múltiples)
- [Capítulo 2: Sistemas de Ecuaciones Lineales](#capítulo-2-sistemas-de-ecuaciones-lineales)
  - [Método de Jacobi](#7-método-de-jacobi)
  - [Método de Gauss-Seidel](#8-método-de-gauss-seidel)
  - [Método SOR](#9-método-sor-successive-over-relaxation)
- [Capítulo 3: Interpolación](#capítulo-3-interpolación)
  - [Interpolación de Vandermonde](#10-interpolación-de-vandermonde)
  - [Interpolación de Newton](#11-interpolación-de-newton)
  - [Interpolación de Lagrange](#12-interpolación-de-lagrange)
  - [Spline Lineal](#13-spline-lineal)
  - [Spline Cúbico](#14-spline-cúbico)
- [Comparación de Métodos](#comparación-de-métodos)

---

# Capítulo 1: Solución de Ecuaciones No Lineales

Estos métodos buscan encontrar las **raíces** (o **ceros**) de una función f(x), es decir, valores de x donde f(x) = 0.

## 1. Método de Bisección

### 🎯 ¿Qué es?
El método de bisección es el método más simple y robusto para encontrar raíces. Se basa en el **Teorema del Valor Intermedio**: si f(x) es continua en [a,b] y f(a)·f(b) < 0, entonces existe al menos una raíz en ese intervalo.

### 📊 ¿Cómo funciona?
1. **Inicio**: Necesitas dos puntos `a` y `b` donde f(a) y f(b) tengan **signos opuestos**
2. **Iteración**: 
   - Calcula el punto medio: `xm = (a + b) / 2`
   - Evalúa f(xm)
   - Si f(a)·f(xm) < 0, la raíz está en [a, xm], entonces b = xm
   - Si f(xm)·f(b) < 0, la raíz está en [xm, b], entonces a = xm
3. **Repetir** hasta que el intervalo sea suficientemente pequeño

### ✅ Ventajas
- **Siempre converge** si se cumplen las condiciones iniciales
- **Muy robusto** y simple de implementar
- **No requiere derivadas**
- Error garantizado: se reduce a la mitad en cada iteración

### ❌ Desventajas
- **Convergencia lenta** (lineal): cada iteración solo reduce el error a la mitad
- **Requiere intervalo inicial** donde la función cambie de signo
- No puede encontrar raíces de multiplicidad par (donde la función toca pero no cruza el eje x)

### 🔴 Cuándo falla
- Si f(a) y f(b) tienen el **mismo signo**
- Si hay **múltiples raíces** en el intervalo (solo encontrará una)
- Si la función tiene **discontinuidades** en el intervalo

### 💡 Cuándo usar
- Cuando necesitas **garantía de convergencia**
- Como **método de respaldo** cuando otros métodos fallan
- Para **acotar** inicialmente donde está la raíz antes de usar un método más rápido
- Cuando **no tienes** o no puedes calcular la derivada

### 📈 Ejemplo visual
```
Iteración 0: [2.0000, 3.0000] → xm = 2.5000
Iteración 1: [2.0000, 2.5000] → xm = 2.2500
Iteración 2: [2.0000, 2.2500] → xm = 2.1250
...converge lentamente pero seguro
```

---

## 2. Método de Regla Falsa (Falsa Posición)

### 🎯 ¿Qué es?
Similar a bisección, pero en lugar de usar el punto medio, usa **interpolación lineal** para estimar dónde la función cruza el eje x.

### 📊 ¿Cómo funciona?
1. **Inicio**: Igual que bisección: puntos `a` y `b` con f(a)·f(b) < 0
2. **Iteración**:
   - En lugar del punto medio, calcula: `c = b - f(b)·(b-a)/(f(b)-f(a))`
   - Esta fórmula traza una línea recta entre (a, f(a)) y (b, f(b))
   - Encuentra donde esa línea cruza el eje x
3. **Actualiza** el intervalo igual que bisección

### ✅ Ventajas
- **Generalmente más rápido** que bisección
- **Siempre converge** con las condiciones adecuadas
- **No requiere derivadas**
- Usa información de los valores de la función (no solo los signos)

### ❌ Desventajas
- Puede ser **más lento que bisección** en algunos casos
- Un extremo del intervalo puede **"quedarse pegado"** (convergencia unilateral)
- Más complejo que bisección

### 🔴 Cuándo falla
- Mismas condiciones que bisección
- Puede converger muy lentamente si la función es muy **cóncava o convexa**

### 💡 Cuándo usar
- Cuando quieres algo **más rápido que bisección** pero igual de seguro
- Cuando la función es **aproximadamente lineal** en el intervalo
- Como alternativa a bisección cuando quieres aprovechar los valores de f(x)

### 📈 Comparación con Bisección
```
Bisección:  usa (a+b)/2     → corta en el medio
Regla Falsa: usa interpolación → corta donde "debería" estar la raíz
```

---

## 3. Método de Punto Fijo

### 🎯 ¿Qué es?
Transforma f(x) = 0 en una ecuación equivalente **x = g(x)**, y busca el punto donde x es igual a g(x).

### 📊 ¿Cómo funciona?
1. **Transformación**: Convierte f(x) = 0 en x = g(x)
   - Ejemplo: si f(x) = x² - 5, puedes usar g(x) = √5
2. **Iteración**: 
   - Comienza con un valor inicial x₀
   - Calcula: x₁ = g(x₀), x₂ = g(x₁), x₃ = g(x₂), ...
3. **Converge** si |g'(x)| < 1 cerca de la raíz

### ✅ Ventajas
- **Muy simple** de implementar
- **No requiere derivadas** de f(x) (pero sí de g(x) para análisis)
- Puede ser **muy rápido** si se elige bien g(x)
- Útil para sistemas de ecuaciones

### ❌ Desventajas
- **No siempre converge**: depende de la elección de g(x)
- Requiere análisis previo para verificar convergencia
- Puede **diverger** rápidamente si g'(x) > 1
- La elección de g(x) no es única ni obvia

### 🔴 Cuándo falla
- Si **|g'(x)| ≥ 1** en la región de la raíz → diverge
- Si x₀ está **muy lejos** de la raíz
- Si g(x) está **mal elegida**

### 💡 Cuándo usar
- Cuando puedes encontrar una buena función g(x)
- Para ecuaciones que **naturalmente** se expresan como x = g(x)
- Cuando conoces la **región aproximada** de la raíz
- En sistemas de ecuaciones no lineales

### 📈 Criterio de convergencia
```
|g'(x)| < 1  → Converge
|g'(x)| = 1  → Puede o no converger
|g'(x)| > 1  → Diverge
```

### 🎨 Ejemplo
Para f(x) = x³ - 2x - 5 = 0, puedes usar:
- g₁(x) = (2x + 5)^(1/3)  → FUNCIONA si |g'(x)| < 1
- g₂(x) = (x³ - 5)/2      → Puede NO funcionar

---

## 4. Método de Newton-Raphson

### 🎯 ¿Qué es?
El método más popular y eficiente. Usa la **tangente** de la función para aproximarse rápidamente a la raíz.

### 📊 ¿Cómo funciona?
1. **Fórmula**: x_(n+1) = x_n - f(x_n)/f'(x_n)
2. **Geométricamente**: 
   - Dibuja la tangente a la curva en (x_n, f(x_n))
   - El siguiente punto x_(n+1) es donde esa tangente cruza el eje x
3. **Repetir** hasta converger

### ✅ Ventajas
- **Convergencia cuadrática**: el error se reduce al cuadrado en cada iteración
- **Muy rápido** cuando funciona
- Solo necesita **un punto inicial**
- Ampliamente usado y estudiado

### ❌ Desventajas
- **Requiere la derivada** f'(x)
- Puede **diverger** si x₀ está mal elegido
- Falla si f'(x) = 0 en algún punto
- Sensible a la elección de x₀

### 🔴 Cuándo falla
- Si **f'(x) = 0** o muy pequeña → división por cero o valores enormes
- Si x₀ está en un **máximo o mínimo local**
- Si x₀ está **muy lejos** de la raíz
- En funciones con **múltiples raíces** cercanas
- En puntos de **inflexión** puede oscilar

### 💡 Cuándo usar
- Cuando tienes una **buena aproximación inicial**
- Cuando puedes **calcular la derivada** fácilmente
- Cuando necesitas **alta precisión rápidamente**
- Para funciones **suaves** y bien comportadas

### 📈 Convergencia
```
Error inicial: 10^-1
Después de 1 iter: 10^-2  (cuadrática)
Después de 2 iter: 10^-4
Después de 3 iter: 10^-8
Después de 4 iter: 10^-16 (¡ya convergió!)
```

### 🎨 Visualización
```
f(x) 
  |     /
  |    /  ← tangente en x₀
  |   /
  |  •------ x₀
  | /
  |/___•____ x₁  (donde tangente cruza eje x)
  |      
```

---

## 5. Método de la Secante

### 🎯 ¿Qué es?
Es una **variante de Newton** que aproxima la derivada usando diferencias finitas. No requiere calcular f'(x) analíticamente.

### 📊 ¿Cómo funciona?
1. **Inicio**: Necesitas **dos puntos iniciales** x₀ y x₁ (no necesitan tener signos opuestos)
2. **Fórmula**: x_(n+1) = x_n - f(x_n)·(x_n - x_(n-1))/(f(x_n) - f(x_(n-1)))
3. **Aproximación**: Usa (f(x_n) - f(x_(n-1)))/(x_n - x_(n-1)) ≈ f'(x_n)

### ✅ Ventajas
- **No requiere derivadas** (solo evaluaciones de f)
- **Más rápido que bisección**
- Convergencia superlineal (orden ≈ 1.618, el número áureo φ)
- Más robusto que Newton en algunos casos

### ❌ Desventajas
- **Requiere dos puntos iniciales**
- **Más lento que Newton** (pero más rápido que bisección)
- Puede fallar si f(x_n) - f(x_(n-1)) ≈ 0
- No garantiza convergencia

### 🔴 Cuándo falla
- Si **f(x_n) = f(x_(n-1))** → división por cero
- Si los dos puntos iniciales están **mal elegidos**
- En funciones con **comportamiento errático**

### 💡 Cuándo usar
- Cuando **no puedes o no quieres calcular la derivada**
- Como alternativa a Newton cuando f'(x) es compleja
- Cuando tienes dos **aproximaciones razonables** de la raíz
- Para funciones **definidas numéricamente** (no analíticamente)

### 📈 Comparación
```
Bisección:     Convergencia lineal    (orden 1)
Secante:       Convergencia superlineal (orden 1.618)
Newton:        Convergencia cuadrática (orden 2)
```

---

## 6. Método de Raíces Múltiples

### 🎯 ¿Qué es?
Una **modificación del método de Newton** para encontrar raíces con **multiplicidad mayor que 1** (donde f(x) = f'(x) = 0).

### 📊 ¿Cómo funciona?
1. **Problema**: Newton estándar converge linealmente en raíces múltiples
2. **Solución**: Usa la fórmula modificada:
   ```
   x_(n+1) = x_n - m·f(x_n)/f'(x_n)
   ```
   donde m es la **multiplicidad** de la raíz
3. **Alternativa** (si no conoces m):
   ```
   x_(n+1) = x_n - f(x_n)·f'(x_n) / [f'(x_n)² - f(x_n)·f''(x_n)]
   ```

### ✅ Ventajas
- **Recupera convergencia cuadrática** en raíces múltiples
- Funciona donde Newton estándar es lento
- Automático si usas la segunda fórmula

### ❌ Desventajas
- Requiere **segunda derivada** f''(x)
- Más **costoso computacionalmente**
- Puede ser inestable si f''(x) es grande
- Necesitas saber si hay multiplicidad (a veces)

### 🔴 Cuándo falla
- Si **f''(x)** no está disponible o es difícil de calcular
- Si los cálculos numéricos introducen **errores de redondeo** significativos
- En puntos donde f'(x)² ≈ f(x)·f''(x)

### 💡 Cuándo usar
- Cuando sabes que la raíz tiene **multiplicidad > 1**
- Por ejemplo: f(x) = (x-2)², (x-3)³, etc.
- Cuando Newton estándar **converge muy lentamente**
- Si puedes calcular f''(x) eficientemente

### 📈 Ejemplo de raíz múltiple
```
f(x) = (x - 2)²  tiene raíz doble en x = 2
Newton estándar: convergencia LINEAL
Newton modificado: convergencia CUADRÁTICA
```

---

# Capítulo 2: Sistemas de Ecuaciones Lineales

Estos métodos resuelven sistemas de la forma **Ax = b**, donde A es una matriz n×n y buscamos el vector x.

## 7. Método de Jacobi

### 🎯 ¿Qué es?
Un método **iterativo** que resuelve sistemas lineales grandes. Actualiza todas las componentes de x **simultáneamente** en cada iteración.

### 📊 ¿Cómo funciona?
1. **Descomposición**: A = D + L + U
   - D = diagonal de A
   - L = parte triangular inferior estricta
   - U = parte triangular superior estricta
2. **Iteración**: x^(k+1) = D^(-1)(b - (L+U)x^(k))
3. **Componente a componente**:
   ```
   x_i^(k+1) = (b_i - Σ(a_ij·x_j^(k))) / a_ii
   ```

### ✅ Ventajas
- **Simple de implementar** y paralelizable
- **Requiere poca memoria** (solo almacena dos vectores)
- Funciona bien para matrices **diagonalmente dominantes**
- Puede manejar sistemas **muy grandes**

### ❌ Desventajas
- **Convergencia lenta**
- **No siempre converge**
- Generalmente **más lento que Gauss-Seidel**
- Requiere muchas iteraciones para alta precisión

### 🔴 Cuándo falla
- Si A **NO es diagonalmente dominante** → puede divergir
- Si el **radio espectral ≥ 1** → diverge
- Con matrices **mal condicionadas**

### 💡 Cuándo usar
- Para matrices **diagonalmente dominantes**:
  - |a_ii| > Σ|a_ij| para todo i
- Cuando quieres **paralelizar** el cálculo
- Para sistemas **grandes** y **dispersos** (sparse)
- Como **precondicionador** para otros métodos

### 📈 Criterio de convergencia
```
Radio espectral ρ(T_jacobi) < 1 → CONVERGE

Diagonalmente dominante → GARANTIZA convergencia
```

---

## 8. Método de Gauss-Seidel

### 🎯 ¿Qué es?
Similar a Jacobi, pero usa los valores **más actualizados** inmediatamente en cada iteración.

### 📊 ¿Cómo funciona?
1. **Diferencia clave**: Cuando calculas x_i^(k+1), usas:
   - Los valores **nuevos** x_1^(k+1), ..., x_(i-1)^(k+1) (ya calculados)
   - Los valores **viejos** x_(i+1)^(k), ..., x_n^(k)
2. **Fórmula**:
   ```
   x_i^(k+1) = (b_i - Σ(j<i) a_ij·x_j^(k+1) - Σ(j>i) a_ij·x_j^(k)) / a_ii
   ```

### ✅ Ventajas
- **Generalmente 2x más rápido** que Jacobi
- **Mejor convergencia** en la mayoría de casos
- **Requiere menos memoria** (un solo vector)
- Más eficiente que Jacobi

### ❌ Desventajas
- **No es paralelizable** (cálculos secuenciales)
- Sigue sin garantizar convergencia en todos los casos
- Puede ser más lento que métodos directos para sistemas pequeños

### 🔴 Cuándo falla
- Mismas condiciones que Jacobi
- Aunque converge en **más casos** que Jacobi

### 💡 Cuándo usar
- Mismos casos que Jacobi, pero **preferiblemente**
- Cuando el **orden de las ecuaciones** es secuencial
- Si no necesitas paralelización
- Como **mejora sobre Jacobi**

### 📈 Comparación Jacobi vs Gauss-Seidel
```
Jacobi:       x_i^(k+1) usa TODOS los valores viejos x^(k)
Gauss-Seidel: x_i^(k+1) usa valores nuevos cuando están disponibles

Resultado: Gauss-Seidel ≈ 2x más rápido
```

---

## 9. Método SOR (Successive Over-Relaxation)

### 🎯 ¿Qué es?
Una **mejora de Gauss-Seidel** que usa un parámetro de **relajación** ω para acelerar la convergencia.

### 📊 ¿Cómo funciona?
1. **Fórmula**:
   ```
   x_i^(k+1) = (1-ω)·x_i^(k) + ω/a_ii·[b_i - Σ(j<i) a_ij·x_j^(k+1) - Σ(j>i) a_ij·x_j^(k)]
   ```
2. **Parámetro ω**:
   - ω = 1: es **exactamente Gauss-Seidel**
   - 1 < ω < 2: **sobre-relajación** (acelera)
   - 0 < ω < 1: **sub-relajación** (estabiliza)
3. **Optimal ω**: Existe un ω óptimo que minimiza iteraciones

### ✅ Ventajas
- **Mucho más rápido** que Gauss-Seidel con ω óptimo
- Puede ser **10x o más rápido** en algunos casos
- Flexible: ajustas ω según el problema

### ❌ Desventajas
- **Difícil encontrar ω óptimo** (depende de la matriz)
- Requiere **experimentación o teoría** para elegir ω
- Puede **diverger** si ω está mal elegido
- Más complejo que Gauss-Seidel

### 🔴 Cuándo falla
- Si **ω ≥ 2 o ω ≤ 0** → siempre diverge
- Con **ω mal elegido** puede ser peor que Gauss-Seidel

### 💡 Cuándo usar
- Cuando conoces el **ω óptimo** o puedes estimarlo
- Para matrices donde **Gauss-Seidel es lento**
- En problemas de **elementos finitos** o **diferencias finitas**
- Cuando necesitas **máxima velocidad** iterativa

### 📈 Selección de ω
```
ω = 1:       Gauss-Seidel
1 < ω < 2:   Acelera (pero puede inestabilizar)
ω óptimo:    Depende de ρ(T_GS), matriz específica

Típicamente: 1.2 ≤ ω ≤ 1.9 funciona bien
```

---

# Capítulo 3: Interpolación

La interpolación construye una función que **pasa exactamente** por un conjunto de puntos dados.

## 10. Interpolación de Vandermonde

### 🎯 ¿Qué es?
Un método **directo** que resuelve un sistema lineal para encontrar el polinomio interpolante.

### 📊 ¿Cómo funciona?
1. Dados n+1 puntos (x₀,y₀), ..., (xₙ,yₙ)
2. Busca P(x) = a₀ + a₁x + a₂x² + ... + aₙxⁿ
3. **Matriz de Vandermonde**:
   ```
   [1  x₀  x₀²  ...  x₀ⁿ] [a₀]   [y₀]
   [1  x₁  x₁²  ...  x₁ⁿ] [a₁]   [y₁]
   [⋮   ⋮   ⋮   ⋱    ⋮ ] [⋮ ] = [⋮ ]
   [1  xₙ  xₙ²  ...  xₙⁿ] [aₙ]   [yₙ]
   ```
4. Resuelve el sistema para obtener los coeficientes

### ✅ Ventajas
- **Conceptualmente simple**
- **Directo**: no requiere iteraciones
- Da los **coeficientes** del polinomio explícitamente

### ❌ Desventajas
- **Numéricamente inestable** con muchos puntos
- La matriz de Vandermonde está **muy mal condicionada**
- **Muy costoso**: O(n³)
- **No se usa en la práctica** (existen mejores métodos)

### 🔴 Cuándo falla
- Con **muchos puntos** (n > 10-15)
- Cuando los puntos xᵢ están **muy juntos** o **muy separados**
- Por **errores de redondeo** acumulados

### 💡 Cuándo usar
- **CASI NUNCA** en aplicaciones reales
- Solo para **pocos puntos** (n < 5)
- Con fines **educativos** o **teóricos**
- Mejor usar: **Lagrange o Newton**

---

## 11. Interpolación de Newton (Diferencias Divididas)

### 🎯 ¿Qué es?
Construye el polinomio interpolante usando **diferencias divididas**. Permite **agregar puntos fácilmente**.

### 📊 ¿Cómo funciona?
1. **Forma de Newton**:
   ```
   P(x) = f[x₀] + f[x₀,x₁](x-x₀) + f[x₀,x₁,x₂](x-x₀)(x-x₁) + ...
   ```
2. **Diferencias divididas**:
   ```
   f[xᵢ] = yᵢ
   f[xᵢ,xᵢ₊₁] = (f[xᵢ₊₁] - f[xᵢ]) / (xᵢ₊₁ - xᵢ)
   f[xᵢ,xᵢ₊₁,xᵢ₊₂] = (f[xᵢ₊₁,xᵢ₊₂] - f[xᵢ,xᵢ₊₁]) / (xᵢ₊₂ - xᵢ)
   ```
3. Se construye una **tabla de diferencias divididas**

### ✅ Ventajas
- **Numéricamente estable**
- **Eficiente**: O(n²)
- **Fácil agregar puntos** sin recalcular todo
- **Mejor que Vandermonde** en todos los aspectos

### ❌ Desventajas
- Evaluación puede ser más compleja que Lagrange
- Necesita **orden de los puntos**

### 🔴 Cuándo falla
- Raras veces falla (muy estable)
- Problema general: **oscilaciones** con muchos puntos (fenómeno de Runge)

### 💡 Cuándo usar
- Cuando **agregarás puntos incrementalmente**
- Para **interpolación polinomial** en general
- Cuando quieres **eficiencia y estabilidad**
- Preferible a Vandermonde

---

## 12. Interpolación de Lagrange

### 🎯 ¿Qué es?
Expresa el polinomio interpolante como suma de **polinomios base de Lagrange**.

### 📊 ¿Cómo funciona?
1. **Forma de Lagrange**:
   ```
   P(x) = Σ yᵢ · Lᵢ(x)
   ```
2. **Polinomios base**:
   ```
   Lᵢ(x) = Π(j≠i) (x - xⱼ)/(xᵢ - xⱼ)
   ```
3. Cada Lᵢ(x) vale 1 en xᵢ y 0 en los demás puntos

### ✅ Ventajas
- **Muy elegante** matemáticamente
- **No requiere resolver sistema**
- **Orden de puntos no importa**
- Fácil de entender conceptualmente

### ❌ Desventajas
- **Ineficiente** para agregar puntos (recalcula todo)
- **Evaluación costosa**: O(n²)
- No reutiliza cálculos previos

### 🔴 Cuándo falla
- Mismo problema que Newton: **oscilaciones de Runge**

### 💡 Cuándo usar
- Para **conjuntos fijos** de puntos
- Con **pocos puntos**
- Cuando la **simplicidad teórica** es importante
- En **ejemplos educativos**

### 📈 Comparación Newton vs Lagrange
```
Newton:   Mejor para CONSTRUIR incrementalmente
Lagrange: Mejor para EVALUAR una vez

Ambos dan el MISMO polinomio
```

---

## 13. Spline Lineal

### 🎯 ¿Qué es?
En lugar de UN polinomio de grado alto, usa **segmentos de líneas rectas** entre puntos consecutivos.

### 📊 ¿Cómo funciona?
1. Entre cada par de puntos (xᵢ, yᵢ) y (xᵢ₊₁, yᵢ₊₁):
   ```
   Sᵢ(x) = yᵢ + (yᵢ₊₁ - yᵢ)/(xᵢ₊₁ - xᵢ) · (x - xᵢ)
   ```
2. Es simplemente **interpolación lineal** por segmentos
3. Continuo pero **no suave** (cambios bruscos de pendiente)

### ✅ Ventajas
- **Extremadamente simple**
- **Nunca oscila** (a diferencia de polinomios altos)
- **Muy estable** numéricamente
- **Fácil de calcular y evaluar**

### ❌ Desventajas
- **No es suave**: tiene esquinas
- No es diferenciable en los puntos de datos
- **Aproximación pobre** para funciones curvas

### 🔴 Cuándo falla
- Cuando necesitas **suavidad** (derivadas continuas)
- Para funciones **muy curvas**

### 💡 Cuándo usar
- Cuando tienes **muchos puntos** cercanos
- Para **visualización rápida**
- Cuando la **simplicidad** es crítica
- Como **aproximación inicial**

---

## 14. Spline Cúbico

### 🎯 ¿Qué es?
Usa **polinomios cúbicos** (grado 3) entre cada par de puntos, con condiciones de **suavidad**.

### 📊 ¿Cómo funciona?
1. Entre cada par de puntos, usa:
   ```
   Sᵢ(x) = aᵢ + bᵢ(x-xᵢ) + cᵢ(x-xᵢ)² + dᵢ(x-xᵢ)³
   ```
2. **Condiciones**:
   - Pasa por los puntos: Sᵢ(xᵢ) = yᵢ
   - **Continuo**: Sᵢ(xᵢ₊₁) = Sᵢ₊₁(xᵢ₊₁)
   - **Primera derivada continua**: S'ᵢ(xᵢ₊₁) = S'ᵢ₊₁(xᵢ₊₁)
   - **Segunda derivada continua**: S''ᵢ(xᵢ₊₁) = S''ᵢ₊₁(xᵢ₊₁)
3. Condiciones de frontera (natural, sujeto, etc.)

### ✅ Ventajas
- **Muy suave**: primera y segunda derivadas continuas
- **No oscila** como polinomios de alto grado
- **Aspecto natural** (minimiza curvatura)
- **Estándar industrial** para interpolación

### ❌ Desventajas
- **Más complejo** de implementar
- Requiere **resolver sistema tridiagonal**
- Más costoso que spline lineal

### 🔴 Cuándo falla
- Raras veces falla
- Puede tener **overshoot** en cambios bruscos de datos

### 💡 Cuándo usar
- **CASI SIEMPRE** para interpolación en la práctica
- En **gráficos por computadora**
- Para **curvas suaves**
- En **CAD/CAM**
- Cuando necesitas **derivadas continuas**

### 📈 Tipos de condiciones de frontera
```
Natural:  S''(x₀) = S''(xₙ) = 0
Sujeto:   S'(x₀) y S'(xₙ) especificados
Not-a-knot: S'''ᵢ continua en x₁ y xₙ₋₁
```

---

# Comparación de Métodos

## Ecuaciones No Lineales

| Método | Convergencia | Derivadas | Robustez | Velocidad | Cuándo usar |
|--------|--------------|-----------|----------|-----------|-------------|
| **Bisección** | Lineal | No | ⭐⭐⭐⭐⭐ | ⭐⭐ | Máxima seguridad |
| **Regla Falsa** | Superlineal | No | ⭐⭐⭐⭐ | ⭐⭐⭐ | Más rápido que bisección |
| **Punto Fijo** | Lineal | No (f') | ⭐⭐ | ⭐⭐⭐ | Casos específicos |
| **Newton** | Cuadrática | Sí (f') | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Máxima velocidad |
| **Secante** | Superlineal | No | ⭐⭐⭐ | ⭐⭐⭐⭐ | Sin derivadas, rápido |
| **Raíces Múltiples** | Cuadrática | Sí (f', f'') | ⭐⭐ | ⭐⭐⭐⭐ | Raíces múltiples |

## Sistemas Lineales

| Método | Iteraciones | Memoria | Paralelizable | Cuándo usar |
|--------|-------------|---------|---------------|-------------|
| **Jacobi** | Muchas | Baja | Sí | Matrices grandes, paralelo |
| **Gauss-Seidel** | Menos | Muy baja | No | Mejor que Jacobi |
| **SOR** | Pocas | Muy baja | No | Máxima velocidad iterativa |

## Interpolación

| Método | Estabilidad | Suavidad | Oscilaciones | Cuándo usar |
|--------|-------------|----------|--------------|-------------|
| **Vandermonde** | ⭐ | Alta | Altas | NUNCA |
| **Newton** | ⭐⭐⭐⭐ | Alta | Altas (muchos pts) | Construcción incremental |
| **Lagrange** | ⭐⭐⭐⭐ | Alta | Altas (muchos pts) | Pocos puntos |
| **Spline Lineal** | ⭐⭐⭐⭐⭐ | Baja | Ninguna | Simple, muchos puntos |
| **Spline Cúbico** | ⭐⭐⭐⭐⭐ | Muy alta | Ninguna | **PREFERIDO** |

---

## 🎓 Consejos Generales

### Para Ecuaciones No Lineales:
1. **Empieza con bisección** para acotar la raíz
2. **Usa Newton** si tienes buena aproximación inicial
3. **Usa Secante** si no puedes calcular derivadas
4. **Verifica convergencia** en cada iteración

### Para Sistemas Lineales:
1. **Verifica diagonal dominancia** primero
2. **Usa Gauss-Seidel** como estándar
3. **Prueba SOR** si necesitas velocidad
4. **Considera métodos directos** para sistemas pequeños

### Para Interpolación:
1. **Usa Spline Cúbico** casi siempre
2. **Evita polinomios de grado > 10**
3. **Ten cuidado con el fenómeno de Runge**
4. **Considera aproximación** en lugar de interpolación exacta

---

## 📚 Referencias y Lectura Adicional

- Burden & Faires: "Numerical Analysis"
- Chapra & Canale: "Numerical Methods for Engineers"
- Press et al.: "Numerical Recipes"
- Wikipedia: artículos sobre cada método

---

**Autor**: MethodLab Project  
**Fecha**: Noviembre 2025  
**Versión**: 1.0
