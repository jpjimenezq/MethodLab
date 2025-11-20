from sympy import sympify, lambdify, Symbol

def secant_method(function_text, x0, x1, tol, max_count):
    results = {
        'iterations': [],
        'conclusion': None
    }

    # Validaciones iniciales
    if max_count < 0:
        raise ValueError(f"Max iterations is < 0: iterations = {max_count}")
    if tol < 0:
        raise ValueError(f"tol is an incorrect value: tol = {tol}")

    # Preparar la función
    x = Symbol('x')
    try:
        expr = sympify(function_text)
        f = lambdify(x, expr, 'math')
    except:
        raise ValueError("Invalid function expression")

    # Verificar que x0 y x1 estén en el dominio
    try:
        f(x0)
        f(x1)
    except:
        raise ValueError("x0 or x1 isn't defined in the function domain")

    count = 0
    error = tol + 1

    # Primera iteración (semillas iniciales)
    fx0 = f(x0)
    fx1 = f(x1)
    results['iterations'].append([
        count,
        "{:.10f}".format(x0),
        "{:.10f}".format(x1),
        "{:.2e}".format(fx0),
        "{:.2e}".format(fx1),
        ""
    ])

    while error > tol and fx1 != 0 and count < max_count:
        if abs(fx1 - fx0) < 1e-20:  # Evitar división por cero
            raise ValueError("Division by zero occurred - possible same function values at points")

        # Calcular nueva aproximación
        x2 = x1 - (fx1 * (x1 - x0)) / (fx1 - fx0)
        fx2 = f(x2)
        error = abs(x2 - x1)

        count += 1
        results['iterations'].append([
            count,
            "{:.10f}".format(x1),
            "{:.10f}".format(x2),
            "{:.2e}".format(fx1),
            "{:.2e}".format(fx2),
            "{:.2e}".format(error)
        ])

        # Actualizar valores para la siguiente iteración
        x0, x1 = x1, x2
        fx0, fx1 = fx1, fx2

    # Determinar conclusión
    if abs(fx1) == 0:
        results['conclusion'] = f"The root was found for x{count} = {x1:.15f}"
        return results
    elif error <= tol:
        results['conclusion'] = f"An approximation of the root was found for x{count} = {x1:.15f}"
    elif count >= max_count:
        results['conclusion'] = ("Given the number of iterations and the tolerance, "
                               "it was impossible to find a satisfying root")
    else:
        results['conclusion'] = "The method exploded"

    return results