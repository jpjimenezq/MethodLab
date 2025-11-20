import numpy as np
import matplotlib
matplotlib.use('Agg')  # Usar backend no interactivo
import matplotlib.pyplot as plt
import io
import base64

def spline_lineal_interpolation(x_values, y_values):
    """
    Método de interpolación por splines lineales
    
    Args:
        x_values (list): Lista de valores x
        y_values (list): Lista de valores y
        
    Returns:
        dict: Resultado con los tramos del spline lineal
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
        
        # Ordenar los puntos por x
        sorted_pairs = sorted(zip(x_values, y_values))
        x_values_sorted, y_values_sorted = zip(*sorted_pairs)
        n = len(x_values_sorted)
        
        tramos = []
        
        # Calcular cada tramo lineal
        for i in range(n - 1):
            x0, x1 = x_values_sorted[i], x_values_sorted[i + 1]
            y0, y1 = y_values_sorted[i], y_values_sorted[i + 1]
            
            if x1 == x0:
                raise ValueError(f"Los valores x[{i}] y x[{i+1}] son iguales, lo que genera una división por cero.")
            
            # Calcular pendiente e intercepto
            m = (y1 - y0) / (x1 - x0)
            b = y0 - m * x0
            
            # Formatear expresión
            sign_b = "+" if b >= 0 else "-"
            b_str = f"{abs(b)}"
            sign_m = "+" if m >= 0 else "-"
            m_str = f"{abs(m)}"
            
            expr = f"{sign_m}{m_str}*x {sign_b}{b_str}"
            tramos.append(expr)
        
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
    Genera un gráfico de las funciones por tramos
    """
    try:
        plt.figure(figsize=(10, 6))
        
        for i in range(len(splines)):
            x0 = x_vals[i]
            x1 = x_vals[i + 1]
            expr = splines[i].replace("^", "**")
            
            f = lambda x: eval(expr.replace("x", f"({x})"))  # para asegurar precedencia
            
            x_plot = np.linspace(x0, x1, 100)
            y_plot = [f(x) for x in x_plot]
            plt.plot(x_plot, y_plot, label=f"Tramo {i+1}")
        
        plt.scatter(x_vals, y_vals, color='red', label='Puntos', zorder=5)
        plt.legend()
        plt.title("Interpolación por Splines Lineales")
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
