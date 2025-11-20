from sympy import sympify, lambdify, Symbol
import math

def fixed_point_method(function_text, g_function_text, x0, tol, max_count):
    results = {
        'iterations': [],
        'conclusion': None
    }

    # Validaciones iniciales
    if max_count < 0:
        results['conclusion'] = f"Max iterations is < 0: iterations = {max_count}"
        return results
    if tol < 0:
        results['conclusion'] = f"tol is an incorrect value: tol = {tol}"
        return results

    # Preparar las funciones usando sympy
    x = Symbol('x')
    try:
        f_expr = sympify(function_text)  # f(x)
        f = lambdify(x, f_expr, 'math')
        g_expr = sympify(g_function_text)  # g(x)
        g = lambdify(x, g_expr, 'math')
    except Exception:
        results['conclusion'] = "Invalid function or transformation (g(x)) expression"
        return results

    # Verificar si x0 está en el dominio de g(x)
    try:
        x_next = g(x0)
    except Exception:
        results['conclusion'] = f"x0 isn't defined in the domain of g(x): x0 = {x0}"
        return results

    count = 0
    err = tol + 1
    fx = f(x0)

    # Primera iteración
    gx0 = g(x0)
    results['iterations'].append([
        count,
        f"{x0:.10e}",
        f"{gx0:.2e}",
        f"{fx:.2e}",
        ""
    ])

    while err > tol and abs(fx) != 0 and count < max_count:
        try:
            x_next = g(x0)
        except Exception:
            results['conclusion'] = f"x{count + 1} isn't defined in the domain of g(x): x{count + 1} = {x_next}"
            return results

        err = abs(x_next - x0)
        fx = f(x_next)
        gx_next = g(x_next)

        count += 1
        x0 = x_next

        # Registrar datos de la iteración
        results['iterations'].append([
            count,
            f"{x0:.10e}",
            f"{gx_next:.2e}",
            f"{fx:.2e}",
            f"{err:.2e}"
        ])

    # Determinar conclusión
    if abs(fx) == 0:
        results['conclusion'] = f"The root was found for x{count} = {x0:.15f}"
    elif err <= tol:
        results['conclusion'] = f"An approximation of the root was found for x{count} = {x0:.15f}"
    elif count >= max_count:
        results['conclusion'] = f"Failed to converge after {max_count} iterations"
    else:
        results['conclusion'] = "The method exploded"

    return results