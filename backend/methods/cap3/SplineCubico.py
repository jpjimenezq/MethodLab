import numpy as np
from scipy.interpolate import CubicSpline
import matplotlib
matplotlib.use('Agg')  # Usar backend no interactivo
import matplotlib.pyplot as plt
import io
import base64

def spline_cubico_interpolation(x_values, y_values):
    """
    Método de interpolación por splines cúbicos
    
    Args:
        x_values (list): Lista de valores x
        y_values (list): Lista de valores y
        
    Returns:
        dict: Resultado con los tramos del spline cúbico
    """
    results = {
        'splines': [],
        'image_base64': None,
        'success': False,
        'error': None
    }
    
    try:
        # Validaciones
        if not x_values or not y_values:
            raise ValueError("Las listas de x o y están vacías.")
        
        if len(x_values) < 3:
            raise ValueError("Se requieren al menos tres puntos para calcular un spline cúbico.")
        
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
        
        # Ordenar los puntos por x
        sorted_pairs = sorted(zip(x_values, y_values))
        x_values_sorted, y_values_sorted = zip(*sorted_pairs)
        
        # Crear spline cúbico natural
        cs = CubicSpline(x_values_sorted, y_values_sorted, bc_type='natural')
        
        tramos = []
        for i in range(len(x_values_sorted) - 1):
            x0 = x_values_sorted[i]
            coefs = cs.c[:, i]  # Coeficientes para este segmento
            
            terms = []
            powers = [3, 2, 1, 0]
            for coef, power in zip(coefs, powers):
                if abs(coef) < 1e-12:
                    continue
                sign = "+" if coef >= 0 else "-"
                coef_str = f"{abs(coef)}"
                if power == 0:
                    term = f"{sign} {coef_str}"
                else:
                    term = f"{sign} {coef_str}*(x - {x0})**{power}"
                terms.append(term)
            
            expression = " ".join(terms)
            tramos.append(expression)
        
        # Generar gráfico
        image_base64 = plot_piecewise_functions(tramos, x_values_sorted, y_values_sorted)
        
        results['splines'] = tramos
        results['image_base64'] = image_base64
        results['success'] = True
        
    except ValueError as ve:
        results['error'] = f"Error de entrada: {str(ve)}"
    except Exception as e:
        results['error'] = f"Error inesperado: {str(e)}"
    
    return results

def plot_piecewise_functions(splines, x_vals, y_vals):
    """
    Genera un gráfico de las funciones por tramos del spline cúbico
    """
    try:
        plt.figure(figsize=(10, 6))
        
        # Crear un rango continuo para mostrar el spline completo
        x_min, x_max = min(x_vals), max(x_vals)
        x_plot = np.linspace(x_min, x_max, 400)
        
        # Recrear el spline para graficación continua
        cs = CubicSpline(x_vals, y_vals, bc_type='natural')
        y_plot = cs(x_plot)
        
        plt.plot(x_plot, y_plot, label="Spline Cúbico", color="blue", linewidth=2)
        plt.scatter(x_vals, y_vals, color='red', label='Puntos', zorder=5, s=50)
        
        # Marcar las divisiones entre segmentos
        for i in range(1, len(x_vals) - 1):
            plt.axvline(x=x_vals[i], color='gray', linestyle='--', alpha=0.5)
        
        plt.legend()
        plt.title("Interpolación por Splines Cúbicos")
        plt.xlabel("x")
        plt.ylabel("y")
        plt.grid(True, alpha=0.3)
        
        # Convertir a base64
        buf = io.BytesIO()
        plt.savefig(buf, format='png', dpi=100, bbox_inches='tight')
        plt.close()
        buf.seek(0)
        image_base64 = base64.b64encode(buf.getvalue()).decode('utf-8')
        return image_base64
        
    except Exception as e:
        return None
