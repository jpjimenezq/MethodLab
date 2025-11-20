from sympy import sympify, lambdify, Symbol

def false_position_method(function_text, a, b, tol, max_count):
    results = {
        'iterations': [],
        'conclusion': None
    }

    # Validaciones iniciales
    if max_count < 0:
        results['conclusion'] = f"Max iterations is < 0: iterations = {max_count}"
        return results
    if a >= b:
        results['conclusion'] = f"a has to be less than b: a = {a} ^ b = {b}"
        return results
    if tol < 0:
        results['conclusion'] = f"tol is an incorrect value: tol = {tol}"
        return results

    # Preparar la función
    x = Symbol('x')
    try:
        expr = sympify(function_text)
        f = lambdify(x, expr, 'math')
    except:
        results['conclusion'] = "Invalid function expression"
        return results

    try:
        fa = f(a)
        fb = f(b)
    except Exception:
        results['conclusion'] = "a or b isn't defined in the function domain"
        return results

    # Casos especiales (raíces en los extremos)
    if fa == 0:
        results['iterations'].append([0, a, a, b, fa, 0])
        results['conclusion'] = f"The root was found for x = {a:.15f}"
        return results
    if fb == 0:
        results['iterations'].append([0, a, b, b, fb, 0])
        results['conclusion'] = f"The root was found for x = {b:.15f}"
        return results
    if fa * fb > 0:
        results['conclusion'] = "The interval is inadequate; function does not change sign"
        return results

    count = 0
    try:
        x_r = b - (f(b) * (b - a)) / (f(b) - f(a))
        fx_r = f(x_r)
    except ZeroDivisionError:
        results['conclusion'] = "Division by zero occurred - possibly same sign at endpoints"
        return results

    error = tol + 1
    temp = 0

    # Primera iteración
    results['iterations'].append([
        count,
        round(a, 10),
        round(x_r, 10),
        round(b, 10),
        "{:.2e}".format(fx_r),
        ""
    ])

    while error > tol and count < max_count:
        if f(a) * fx_r < 0:
            b = x_r
        elif f(b) * fx_r < 0:
            a = x_r
        else:
            break  # encontramos la raíz exacta


        count += 1
        temp = x_r

        try:
            x_r = b - (f(b) * (b - a)) / (f(b) - f(a))
            fx_r = f(x_r)
        except ZeroDivisionError:
            results['conclusion'] = "Division by zero occurred - possibly same sign at endpoints"
            return results

        error = abs(x_r - temp)

        # Verificar dominio en cada iteración
        try:
            f(a)
            f(b)
        except:
            results['conclusion'] = "Interval endpoint isn't defined in the function domain during iteration"
            return results

        results['iterations'].append([
            count,
            round(a, 10),
            round(x_r, 10),
            round(b, 10),
            "{:.2e}".format(fx_r),
            "{:.2e}".format(error)
        ])

    print(fx_r)
    # Determinar conclusión
    if abs(fx_r) == 0:
        results['conclusion'] = f"The root was found for m = {x_r:.15f}"
    elif error <= tol:
        results['conclusion'] = f"An approximation of the root was found for m = {x_r:.15f}"
    elif count >= max_count:
        results['conclusion'] = f"Failed to converge after {max_count} iterations"
    else:
        results['conclusion'] = "The method exploded"

    return results