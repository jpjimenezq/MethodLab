from flask import Flask, request, jsonify
from flask_cors import CORS
# CAPITULO 1
from methods.cap1.Biseccion import bisection_method
from methods.cap1.Newton import newton_method
from methods.cap1.PuntoFijo import fixed_point_method
from methods.cap1.RaicesMultiples import multiple_roots_method
from methods.cap1.ReglaFalsa import false_position_method
from methods.cap1.Secante import secant_method

# CAPITULO 2
from methods.cap2.GaussSeidel import gaussSeidel_method
from methods.cap2.Jacobi import jacobi_method
from methods.cap2.Sor import sor_method

# CAPITULO 3
from methods.cap3.Lagrange import lagrange_interpolation
from methods.cap3.NewtonInterpolante import newton_interpolation
from methods.cap3.SplineCubico import spline_cubico_interpolation
from methods.cap3.SplineLineal import spline_lineal_interpolation
from methods.cap3.Vandermonde import vandermonde_interpolation

# DERIVATIVE CALCULATOR
import sympy as sp

app = Flask(__name__)
CORS(app)

@app.route("/", methods=["GET"])
def root_methodlab():
    return jsonify({"message": "Welcome to methodlab API"}), 200


# CAPITULO 1
@app.route("/calculate/bisection", methods=["POST"])
def calculate_bisection():
    try:
        data = request.get_json(force=True)
        function_text = data.get("function_text")
        a = data.get("a")
        b = data.get("b")
        tol = data.get("tol")
        max_count = data.get("max_count")

        if any(v is None for v in (function_text, a, b, tol, max_count)):
            return jsonify({"error": "All fields are required"}), 400

        a = float(a); b = float(b); tol = float(tol); max_count = int(max_count)

        result = bisection_method(function_text, a, b, tol, max_count)

        # Verificar si hubo errores en el método
        if result.get('conclusion') and any(error_phrase in result['conclusion'].lower() for error_phrase in 
               ['invalid', 'error', "isn't defined", 'division by zero', 'infinity', 'inadequate', 'exploded', 'does not change sign', 'not found', 'failed', 'cannot', 'unable']):
            return jsonify({"error": result['conclusion']}), 400

        return jsonify({"result": result}), 200

    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/calculate/newton", methods=["POST"])
def calculate_newton():
    try:
        data = request.get_json(force=True)
        function_text = data.get("function_text")
        first_derivate_text = data.get("first_derivate_text")
        x0 = float(data.get("x0"))
        tol = float(data.get("tol"))
        max_count = int(data.get("max_count"))

        if not function_text or not first_derivate_text or x0 is None or tol is None or max_count is None:
            return jsonify({"error": "All fields are required"}), 400

        result = newton_method(function_text, first_derivate_text, x0, tol, max_count)

        # Verificar si hubo errores en el método
        if result.get('conclusion') and any(error_phrase in result['conclusion'].lower() for error_phrase in 
               ['invalid', 'error', "isn't defined", 'division by zero', 'infinity', 'inadequate', 'exploded', 'does not change sign', 'not found', 'failed', 'cannot', 'unable']):
            return jsonify({"error": result['conclusion']}), 400

        return jsonify({"result": result}), 200

    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/calculate/puntoFijo", methods=["POST"])
def calculete_puntoFijo():
    try:
        data = request.get_json(force=True)
        function_text = data.get("function_text")
        g_function_text = data.get("g_function_text")
        x0 = float(data.get("x0"))
        tol = float(data.get("tol"))
        max_count = int(data.get("max_count"))

        if not function_text or not g_function_text or x0 is None or tol is None or max_count is None:
            return jsonify({"error": "All fields are required"}), 400

        results = fixed_point_method(function_text, g_function_text, x0, tol, max_count)

        # Verificar si hubo errores en el método
        if results.get('conclusion') and any(error_phrase in results['conclusion'].lower() for error_phrase in 
               ['invalid', 'error', "isn't defined", 'division by zero', 'infinity', 'inadequate', 'exploded', 'does not change sign', 'not found', 'failed', 'cannot', 'unable']):
            return jsonify({"error": results['conclusion']}), 400

        return jsonify({"result": results}), 200

    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/calculate/raicesMultiples", methods=["POST"])
def calculate_raicesMultiples():
    try:
        data = request.get_json(force=True)
        function_text = data.get("function_text")
        first_derivate_text = data.get("first_derivate_text")
        second_derivate_text = data.get("second_derivate_text")
        x0 = float(data.get("x0"))
        tol = float(data.get("tol"))
        max_count = int(data.get("max_count"))

        if not function_text or not first_derivate_text or not second_derivate_text or x0 is None or tol is None or max_count is None:
            return jsonify({"error": "All fields are required"}), 400

        results = multiple_roots_method(function_text, first_derivate_text, second_derivate_text, x0, tol, max_count)

        # Verificar si hubo errores en el método
        if results.get('conclusion') and any(error_phrase in results['conclusion'].lower() for error_phrase in 
               ['invalid', 'error', "isn't defined", 'division by zero', 'infinity', 'inadequate', 'exploded', 'does not change sign', 'not found', 'failed', 'cannot', 'unable']):
            return jsonify({"error": results['conclusion']}), 400

        return jsonify({"result": results}), 200

    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/calculate/ReglaFalsa", methods=["POST"])
def calculate_reglaFalsa():
    try:
        data = request.get_json(force=True)
        function_text = data.get("function_text")
        a = float(data.get("a"))
        b = float(data.get("b"))
        tol = float(data.get("tol"))
        max_count = int(data.get("max_count"))

        if any(v is None for v in (function_text, a, b, tol, max_count)):
            return jsonify({"error": "All fields are required"}), 400

        result = false_position_method(function_text, a, b, tol, max_count)

        # Verificar si hubo errores en el método
        if result.get('conclusion') and any(error_phrase in result['conclusion'].lower() for error_phrase in 
               ['invalid', 'error', "isn't defined", 'division by zero', 'infinity', 'inadequate', 'exploded', 'does not change sign', 'not found', 'failed', 'cannot', 'unable']):
            return jsonify({"error": result['conclusion']}), 400

        return jsonify({"result": result}), 200

    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/calculate/secante", methods=["POST"])
def calculate_secante():
    try:
        data = request.get_json(force=True)
        function_text = data.get("function_text")
        x0 = float(data.get("x0"))
        x1 = float(data.get("x1"))
        tol = float(data.get("tol"))
        max_count = int(data.get("max_count"))

        if any(v is None for v in (function_text, x0, x1, tol, max_count)):
            return jsonify({"error": "All fields are required"}), 400

        result = secant_method(function_text, x0, x1, tol, max_count)

        # Verificar si hubo errores en el método
        if result.get('conclusion') and any(error_phrase in result['conclusion'].lower() for error_phrase in 
               ['invalid', 'error', "isn't defined", 'division by zero', 'infinity', 'inadequate', 'exploded', 'does not change sign', 'not found', 'failed', 'cannot', 'unable']):
            return jsonify({"error": result['conclusion']}), 400

        return jsonify({"result": result}), 200

    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# CAPITULO 2
@app.route("/calculate/gaussSeidel", methods=["POST"])
def calculate_gaussSeidel():
    try:
        data = request.get_json(force=True)
        matrixA = data.get("matrixA")
        vectorB = data.get("vectorB")
        vectorX0 = data.get("vectorX0")
        norm_type = float(data.get("norm_type"))
        tol = float(data.get("tol"))
        max_count = int(data.get("max_count"))

        if not matrixA or not vectorB or not vectorX0 or norm_type is None or tol is None or max_count is None:
            return jsonify({"error": "All fields are required"}), 400

        # Convertir a numpy arrays
        import numpy as np
        matrixA = np.array(matrixA, dtype=float)
        vectorB = np.array(vectorB, dtype=float)
        vectorX0 = np.array(vectorX0, dtype=float)

        results = gaussSeidel_method(matrixA, vectorB, vectorX0, tol, max_count, norm_type)

        # Convertir numpy arrays a listas para serialización JSON
        if results.get('C') is not None:
            results['C'] = results['C'].tolist()
        if results.get('T') is not None:
            results['T'] = results['T'].tolist()
        if results.get('final_solution') is not None:
            results['final_solution'] = results['final_solution'].tolist()
        
        # Convertir arrays en iterations
        iterations_converted = []
        for iteration in results.get('iterations', []):
            if len(iteration) == 3:
                count, error, x_vector = iteration
                if hasattr(x_vector, 'tolist'):
                    x_vector = x_vector.tolist()
                iterations_converted.append([count, error, x_vector])
            else:
                iterations_converted.append(iteration)
        results['iterations'] = iterations_converted

        # Verificar si hubo errores en el método
        if results.get('conclusion') and any(error_phrase in results['conclusion'].lower() for error_phrase in 
               ['invalid', 'error', "isn't defined", 'division by zero', 'infinity', 'inadequate', 'exploded', 'diverge', 'not converge']):
            return jsonify({"error": results['conclusion']}), 400

        return jsonify({"result": results}), 200

    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/calculate/jacobi", methods=["POST"])
def calculate_jacobi():
    try:
        data = request.get_json(force=True)
        matrixA = data.get("matrixA")
        vectorB = data.get("vectorB")
        vectorX0 = data.get("vectorX0")
        norm_type = float(data.get("norm_type"))
        tol = float(data.get("tol"))
        max_count = int(data.get("max_count"))

        if not matrixA or not vectorB or not vectorX0 or norm_type is None or tol is None or max_count is None:
            return jsonify({"error": "All fields are required"}), 400

        # Convertir a numpy arrays
        import numpy as np
        matrixA = np.array(matrixA, dtype=float)
        vectorB = np.array(vectorB, dtype=float)
        vectorX0 = np.array(vectorX0, dtype=float)

        results = jacobi_method(matrixA, vectorB, vectorX0, tol, max_count, norm_type)

        # Convertir numpy arrays a listas para serialización JSON
        if results.get('C') is not None:
            results['C'] = results['C'].tolist()
        if results.get('T') is not None:
            results['T'] = results['T'].tolist()
        if results.get('final_solution') is not None:
            results['final_solution'] = results['final_solution'].tolist()
        
        # Convertir arrays en iterations
        iterations_converted = []
        for iteration in results.get('iterations', []):
            if len(iteration) == 3:
                count, error, x_vector = iteration
                if hasattr(x_vector, 'tolist'):
                    x_vector = x_vector.tolist()
                iterations_converted.append([count, error, x_vector])
            else:
                iterations_converted.append(iteration)
        results['iterations'] = iterations_converted

        # Verificar si hubo errores en el método
        if results.get('conclusion') and any(error_phrase in results['conclusion'].lower() for error_phrase in 
               ['invalid', 'error', "isn't defined", 'division by zero', 'infinity', 'inadequate', 'exploded', 'diverge', 'not converge']):
            return jsonify({"error": results['conclusion']}), 400

        return jsonify({"result": results}), 200

    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/calculate/sor", methods=["POST"])
def calculate_sor():
    try:
        data = request.get_json(force=True)
        matrixA = data.get("matrixA")
        vectorB = data.get("vectorB")
        vectorX0 = data.get("vectorX0")
        norm_type = float(data.get("norm_type"))
        w = float(data.get("w"))
        tol = float(data.get("tol"))
        max_count = int(data.get("max_count"))

        if not matrixA or not vectorB or not vectorX0 or norm_type is None or w is None or tol is None or max_count is None:
            return jsonify({"error": "All fields are required"}), 400

        # Convertir a numpy arrays
        import numpy as np
        matrixA = np.array(matrixA, dtype=float)
        vectorB = np.array(vectorB, dtype=float)
        vectorX0 = np.array(vectorX0, dtype=float)

        results = sor_method(matrixA, vectorB, vectorX0, tol, max_count, norm_type, w)

        # Convertir numpy arrays a listas para serialización JSON
        if results.get('C') is not None:
            results['C'] = results['C'].tolist()
        if results.get('T') is not None:
            results['T'] = results['T'].tolist()
        if results.get('final_solution') is not None:
            results['final_solution'] = results['final_solution'].tolist()
        
        # Convertir arrays en iterations
        iterations_converted = []
        for iteration in results.get('iterations', []):
            if len(iteration) == 3:
                count, error, x_vector = iteration
                if hasattr(x_vector, 'tolist'):
                    x_vector = x_vector.tolist()
                iterations_converted.append([count, error, x_vector])
            else:
                iterations_converted.append(iteration)
        results['iterations'] = iterations_converted

        # Verificar si hubo errores en el método
        if results.get('conclusion') and any(error_phrase in results['conclusion'].lower() for error_phrase in 
               ['invalid', 'error', "isn't defined", 'division by zero', 'infinity', 'inadequate', 'exploded', 'diverge', 'not converge']):
            return jsonify({"error": results['conclusion']}), 400

        return jsonify({"result": results}), 200

    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# CAPITULO 3
@app.route("/calculate/lagrange", methods=["POST"])
def calculate_lagrange():
    try:
        data = request.get_json(force=True)
        x_values = data.get("x_values")
        y_values = data.get("y_values")

        if not x_values or not y_values:
            return jsonify({"error": "x_values and y_values are required"}), 400

        # Convertir a float
        x_values = [float(x) for x in x_values]
        y_values = [float(y) for y in y_values]

        result = lagrange_interpolation(x_values, y_values)

        # Verificar si hubo errores en el método
        if result.get('conclusion') and any(error_phrase in result['conclusion'].lower() for error_phrase in 
               ['invalid', 'error', "isn't defined", 'division by zero', 'infinity', 'inadequate', 'exploded', 'singular', 'not invertible']):
            return jsonify({"error": result['conclusion']}), 400

        return jsonify({"result": result}), 200

    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/calculate/newton_interpolation", methods=["POST"])
def calculate_newton_interpolation():
    try:
        data = request.get_json(force=True)
        x_values = data.get("x_values")
        y_values = data.get("y_values")

        if not x_values or not y_values:
            return jsonify({"error": "x_values and y_values are required"}), 400

        # Convertir a float
        x_values = [float(x) for x in x_values]
        y_values = [float(y) for y in y_values]

        result = newton_interpolation(x_values, y_values)

        # Verificar si hubo errores en el método
        if result.get('conclusion') and any(error_phrase in result['conclusion'].lower() for error_phrase in 
               ['invalid', 'error', "isn't defined", 'division by zero', 'infinity', 'inadequate', 'exploded', 'singular', 'not invertible']):
            return jsonify({"error": result['conclusion']}), 400

        return jsonify({"result": result}), 200

    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/calculate/spline_cubico", methods=["POST"])
def calculate_spline_cubico():
    try:
        data = request.get_json(force=True)
        x_values = data.get("x_values")
        y_values = data.get("y_values")

        if not x_values or not y_values:
            return jsonify({"error": "x_values and y_values are required"}), 400

        # Convertir a float
        x_values = [float(x) for x in x_values]
        y_values = [float(y) for y in y_values]

        result = spline_cubico_interpolation(x_values, y_values)

        # Verificar si hubo errores en el método
        if result.get('conclusion') and any(error_phrase in result['conclusion'].lower() for error_phrase in 
               ['invalid', 'error', "isn't defined", 'division by zero', 'infinity', 'inadequate', 'exploded', 'singular', 'not invertible']):
            return jsonify({"error": result['conclusion']}), 400

        return jsonify({"result": result}), 200

    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/calculate/spline_lineal", methods=["POST"])
def calculate_spline_lineal():
    try:
        data = request.get_json(force=True)
        x_values = data.get("x_values")
        y_values = data.get("y_values")

        if not x_values or not y_values:
            return jsonify({"error": "x_values and y_values are required"}), 400

        # Convertir a float
        x_values = [float(x) for x in x_values]
        y_values = [float(y) for y in y_values]

        result = spline_lineal_interpolation(x_values, y_values)

        # Verificar si hubo errores en el método
        if result.get('conclusion') and any(error_phrase in result['conclusion'].lower() for error_phrase in 
               ['invalid', 'error', "isn't defined", 'division by zero', 'infinity', 'inadequate', 'exploded', 'singular', 'not invertible']):
            return jsonify({"error": result['conclusion']}), 400

        return jsonify({"result": result}), 200

    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/calculate/vandermonde", methods=["POST"])
def calculate_vandermonde():
    try:
        data = request.get_json(force=True)
        x_values = data.get("x_values")
        y_values = data.get("y_values")

        if not x_values or not y_values:
            return jsonify({"error": "x_values and y_values are required"}), 400

        x_values = [float(x) for x in x_values]
        y_values = [float(y) for y in y_values]

        result = vandermonde_interpolation(x_values, y_values)

        # Verificar si hubo errores en el método
        if result.get('conclusion') and any(error_phrase in result['conclusion'].lower() for error_phrase in 
               ['invalid', 'error', "isn't defined", 'division by zero', 'infinity', 'inadequate', 'exploded', 'singular', 'not invertible']):
            return jsonify({"error": result['conclusion']}), 400

        return jsonify({"result": result}), 200

    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/plot", methods=["POST"])
def plot_function():
    try:
        import numpy as np
        import matplotlib
        matplotlib.use('Agg')  # Backend sin GUI
        import matplotlib.pyplot as plt
        import sympy as sp
        import base64
        import io
        
        data = request.get_json(force=True)
        function_text = data.get("function_text")
        x_min = data.get("x_min", -10)
        x_max = data.get("x_max", 10)
        
        if not function_text:
            return jsonify({"error": "Function text is required"}), 400
            
        # Convertir la función de texto a función evaluable
        x = sp.Symbol('x')
        try:
            # Reemplazar ** por ^ para sympy y evaluar
            function_text_clean = function_text.replace('^', '**')
            function_expr = sp.sympify(function_text_clean)
            function_lambda = sp.lambdify(x, function_expr, 'numpy')
        except Exception as e:
            return jsonify({"error": f"Error parsing function: {str(e)}"}), 400
        
        # Crear puntos para graficar
        x_vals = np.linspace(float(x_min), float(x_max), 1000)
        
        try:
            y_vals = function_lambda(x_vals)
            
            # Crear la gráfica
            plt.figure(figsize=(10, 6))
            plt.plot(x_vals, y_vals, 'b-', linewidth=2, label=f'f(x) = {function_text}')
            plt.axhline(y=0, color='k', linestyle='-', alpha=0.3)
            plt.axvline(x=0, color='k', linestyle='-', alpha=0.3)
            plt.grid(True, alpha=0.3)
            plt.xlabel('x', fontsize=12)
            plt.ylabel('f(x)', fontsize=12)
            plt.title(f'Gráfica de f(x) = {function_text}', fontsize=14)
            plt.legend()
            
            # Convertir a base64
            buffer = io.BytesIO()
            plt.savefig(buffer, format='png', dpi=150, bbox_inches='tight')
            buffer.seek(0)
            image_base64 = base64.b64encode(buffer.getvalue()).decode()
            plt.close()
            
            return jsonify({
                "success": True,
                "image": f"data:image/png;base64,{image_base64}",
                "function": function_text
            }), 200
            
        except Exception as e:
            return jsonify({"error": f"Error evaluating function: {str(e)}"}), 400
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# DERIVATIVE CALCULATOR ENDPOINT
@app.route("/api/derivative", methods=["POST"])
def calculate_derivative():
    """
    Calcular la derivada de una función usando SymPy
    """
    try:
        data = request.get_json()
        function_text = data.get('function_text', '')
        order = data.get('order', 1)
        
        if not function_text:
            return jsonify({'error': 'Función requerida'}), 400
        
        # Definir la variable simbólica
        x = sp.Symbol('x')
        
        # Convertir la función de texto a expresión simbólica
        # Reemplazar ** con ^ si es necesario y manejar funciones comunes
        function_text_clean = function_text.replace('^', '**')
        
        # Crear la expresión simbólica
        try:
            expr = sp.sympify(function_text_clean, locals={'x': x})
        except:
            # Intentar con transformaciones adicionales para funciones especiales
            try:
                # Mapear funciones Python a SymPy
                function_sympy = function_text_clean
                function_sympy = function_sympy.replace('sin(', 'sp.sin(')
                function_sympy = function_sympy.replace('cos(', 'sp.cos(') 
                function_sympy = function_sympy.replace('tan(', 'sp.tan(')
                function_sympy = function_sympy.replace('exp(', 'sp.exp(')
                function_sympy = function_sympy.replace('log(', 'sp.log(')
                function_sympy = function_sympy.replace('sqrt(', 'sp.sqrt(')
                expr = eval(function_sympy, {'x': x, 'sp': sp})
            except:
                expr = sp.sympify(function_text_clean, locals={'x': x})
        
        # Calcular la derivada del orden especificado
        derivative = sp.diff(expr, x, order)
        
        # Convertir de vuelta a string y simplificar
        derivative_simplified = sp.simplify(derivative)
        derivative_str = str(derivative_simplified)
        
        # Convertir de vuelta a formato Python estándar
        derivative_str = derivative_str.replace('**', '**')
        
        return jsonify({
            'derivative': derivative_str,
            'original_function': function_text,
            'order': order,
            'success': True
        })
        
    except Exception as e:
        return jsonify({
            'error': f'Error al calcular la derivada: {str(e)}',
            'success': False
        }), 500


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=8000)