import sympy as sp
from flask import Blueprint, request, jsonify

derivative_bp = Blueprint('derivative', __name__)

@derivative_bp.route('/api/derivative', methods=['POST'])
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
        function_text = function_text.replace('^', '**')
        
        # Crear la expresión simbólica
        try:
            expr = sp.sympify(function_text, locals={'x': x})
        except:
            # Intentar con transformaciones adicionales
            function_text = function_text.replace('sin', 'sp.sin')
            function_text = function_text.replace('cos', 'sp.cos') 
            function_text = function_text.replace('tan', 'sp.tan')
            function_text = function_text.replace('exp', 'sp.exp')
            function_text = function_text.replace('log', 'sp.log')
            function_text = function_text.replace('sqrt', 'sp.sqrt')
            expr = sp.sympify(function_text, locals={'x': x, 'sp': sp})
        
        # Calcular la derivada del orden especificado
        derivative = sp.diff(expr, x, order)
        
        # Convertir de vuelta a string
        derivative_str = str(derivative)
        
        # Convertir de vuelta a formato Python estándar
        derivative_str = derivative_str.replace('**', '**')
        derivative_str = derivative_str.replace('sp.', '')
        
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

if __name__ == '__main__':
    # Para pruebas
    from flask import Flask
    app = Flask(__name__)
    app.register_blueprint(derivative_bp)
    
    # Ejemplo de prueba
    test_functions = [
        'x**3 - 2*x - 5',
        'sin(x)',
        'exp(x)',
        'x**2 + 3*x + 1'
    ]
    
    x = sp.Symbol('x')
    for func in test_functions:
        try:
            expr = sp.sympify(func)
            first_deriv = sp.diff(expr, x, 1)
            second_deriv = sp.diff(expr, x, 2)
            print(f"f(x) = {func}")
            print(f"f'(x) = {first_deriv}")
            print(f"f''(x) = {second_deriv}")
            print("---")
        except Exception as e:
            print(f"Error con {func}: {e}")
