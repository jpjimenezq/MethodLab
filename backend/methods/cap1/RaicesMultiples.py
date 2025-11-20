import math
from sympy import sympify, lambdify, Symbol

def multiple_roots_method(function_text, first_derivate_text, second_derivate_text, x0, tol, max_count):
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
        f_expr = sympify(function_text)
        f = lambdify(x, f_expr, 'math')
        f1_expr = sympify(first_derivate_text)
        f1 = lambdify(x, f1_expr, 'math')
        f2_expr = sympify(second_derivate_text)
        f2 = lambdify(x, f2_expr, 'math')
    except Exception:
        results['conclusion'] = "Invalid function or derivative expression"
        return results

    # Verificar si x0 está en el dominio de la función y derivadas
    try:
        f_x = f(x0)
        f_xp = f1(x0)
        f_xs = f2(x0)
    except Exception:
        results['conclusion'] = f"x0 isn't defined in the domain of the function or its derivatives: x0 = {x0}"
        return results

    err = tol + 1
    d = f_xp**2 - f_x * f_xs
    cont = 0

    results['iterations'] = [[
        cont,
        f"{x0:.10e}",
        f"{f_x:.2e}",
        ""
    ]]

    while err > tol and d != 0 and cont < max_count:
        try:
            x_ev = x0 - (f_x * f_xp) / (f_xp**2 - f_x * f_xs)
        except ZeroDivisionError:
            results['conclusion'] = f"Division by zero in step {cont}"
            return results

        if math.isinf(x_ev):
            results['conclusion'] = f"Infinity value in step {cont}"
            return results

        try:
            f_x = f(x_ev)
            f_xp = f1(x_ev)
            f_xs = f2(x_ev)
        except Exception:
            results['conclusion'] = f"xi isn't defined in the domain of the function or its derivatives: xi = {x_ev}"
            return results

        err = abs(x_ev - x0)
        cont += 1
        x0 = x_ev
        d = f_xp**2 - f_x * f_xs

        results['iterations'].append([
            cont,
            f"{x0:.10e}",
            f"{f_x:.2e}",
            f"{err:.2e}"
        ])

    if abs(f_x) == 0:
        results['conclusion'] = f"The root was found for x{cont} = {x0:.15f}"
    elif err <= tol:
        results['conclusion'] = f"An approximation of the root was found for x{cont} = {x0:.15f}"
    elif cont >= max_count:
        results['conclusion'] = f"Failed to converge after {max_count} iterations"
    else:
        results['conclusion'] = "The method exploded"

    return results