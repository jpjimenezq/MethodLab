import numpy as np
import matplotlib
matplotlib.use('Agg')  # Usar backend no interactivo
import matplotlib.pyplot as plt
import io
import base64

def lagrange_interpolation(x_values, y_values):
    """
    Método de interpolación de Lagrange
    
    Args:
        x_values (list): Lista de valores x
        y_values (list): Lista de valores y
        
    Returns:
        dict: Resultado con el polinomio y datos de la interpolación
    """
    results = {
        'polynomial': None,
        'polynomial_str': None,
        'image_base64': None,
        'success': False,
        'error': None,
        'warning': None
    }
    
    try:
        # Validaciones
        if not x_values or not y_values:
            raise ValueError("Las listas de x o y están vacías.")
        
        if len(x_values) < 2 or len(y_values) < 2:
            raise ValueError("Se requieren al menos dos puntos para interpolar.")
        
        if len(x_values) != len(y_values):
            raise ValueError("Las listas de x e y deben tener la misma longitud.")
        
        if len(set(x_values)) != len(x_values):
            raise ValueError("Hay valores de x repetidos, lo cual no es válido para la interpolación.")
        
        # Validar que son números finitos
        for i, val in enumerate(x_values):
            if not isinstance(val, (int, float)) or not np.isfinite(val):
                raise ValueError(f"El valor en x[{i}] = '{val}' no es un número válido.")
        
        for i, val in enumerate(y_values):
            if not isinstance(val, (int, float)) or not np.isfinite(val):
                raise ValueError(f"El valor en y[{i}] = '{val}' no es un número válido.")
        
        # Advertencia para muchos puntos
        if len(x_values) > 12:
            results['warning'] = "Advertencia: interpolar con muchos puntos puede causar oscilaciones indeseadas."
        
        # Función para calcular el polinomio de Lagrange
        def lagrange_polynomial(x_vals, y_vals):
            def basis(j):
                p = np.poly1d([1.0])
                for m in range(len(x_vals)):
                    if m != j:
                        denom = x_vals[j] - x_vals[m]
                        if abs(denom) < 1e-12:
                            raise ZeroDivisionError("Dos valores de x son demasiado cercanos, lo que puede causar errores numéricos.")
                        p *= np.poly1d([1.0, -x_vals[m]]) / denom
                return p
            
            polynomial = sum(y_vals[j] * basis(j) for j in range(len(x_vals)))
            return polynomial
        
        # Función para dar formato al polinomio
        def format_polynomial_python_style(poly):
            coeffs = poly.coefficients
            degree = len(coeffs) - 1
            terms = []
            
            for i, coef in enumerate(coeffs):
                power = degree - i
                if abs(coef) < 1e-12:
                    continue
                sign = "+" if coef >= 0 else "-"
                coef_str = f"{abs(coef)}"
                if power == 0:
                    term = f"{sign}{coef_str}"
                elif power == 1:
                    term = f"{sign}{coef_str}*x**1"
                else:
                    term = f"{sign}{coef_str}*x**{power}"
                terms.append(term)
            return " ".join(terms) if terms else "0"
        
        # Calcular el polinomio
        P = lagrange_polynomial(x_values, y_values)
        polynomial_str = format_polynomial_python_style(P)
        
        # Generar gráfico
        image_base64 = plot_polynomial_expression(polynomial_str.replace("**", "^"), x_values, y_values)
        
        results['polynomial'] = P.coefficients.tolist()  # Convertir a lista para JSON
        results['polynomial_str'] = polynomial_str
        results['image_base64'] = image_base64
        results['success'] = True
        
    except Exception as e:
        results['error'] = str(e)
    
    return results

def plot_polynomial_expression(expr, x_vals, y_vals):
    """
    Genera un gráfico del polinomio y los puntos de interpolación
    """
    try:
        # Crear función a partir de la expresión
        f = lambda x: eval(expr.replace("^", "**"))
        
        # Rango de graficación
        x_min, x_max = min(x_vals), max(x_vals)
        x_plot = np.linspace(x_min - 1, x_max + 1, 400)
        y_plot = [f(x) for x in x_plot]
        
        # Graficar
        plt.figure(figsize=(10, 6))
        plt.plot(x_plot, y_plot, label="Polinomio de Lagrange", color="blue")
        plt.scatter(x_vals, y_vals, color="red", label="Puntos", zorder=5)
        plt.legend()
        plt.title("Interpolación de Lagrange")
        plt.xlabel("x")
        plt.ylabel("y")
        plt.grid(True)
        
        # Convertir a base64
        buf = io.BytesIO()
        plt.savefig(buf, format='png', dpi=100, bbox_inches='tight')
        plt.close()
        buf.seek(0)
        image_base64 = base64.b64encode(buf.getvalue()).decode('utf-8')
        return image_base64
        
    except Exception as e:
        return None
