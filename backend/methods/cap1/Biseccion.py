from sympy import sympify, lambdify, Symbol

def bisection_method(function_text, a, b, tol, max_count):
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

    # Preparar la función
    x = Symbol('x')
    try:
        expr = sympify(function_text)
        f = lambdify(x, expr, 'math')
    except:
        results['conclusion'] = "Invalid function expression"
        return results

    # Verificar puntos iniciales
    try:
        fi = f(a)
        fs = f(b)
    except:
        results['conclusion'] = "a or b isn't defined in the function domain"
        return results

    # Casos especiales (raíces en los extremos)
    if fi == 0:
        results['iterations'].append([0, a, a, b, 0, 0])
        results['conclusion'] = f"The root was found for x = {a:.15f}"
        return results
    if fs == 0:
        results['iterations'].append([0, a, b, b, 0, 0])
        results['conclusion'] = f"The root was found for x = {b:.15f}"
        return results
    if fi * fs > 0:
        results['conclusion'] = "The interval is inadequate; function does not change sign"
        return results

    count = 0
    error = tol + 1
    xm = (a + b) / 2
    fm = f(xm)

    # Primera iteración
    results['iterations'].append([
        count,
        round(a, 10),
        round(xm, 10),
        round(b, 10),
        "{:.2e}".format(fm),
        ""
    ])

    while error > tol and abs(fm) != 0 and count < max_count:
        if fi * fm < 0:
            b = xm
            fs = fm
        else:
            a = xm
            fi = fm

        xa = xm
        xm = (a + b) / 2
        fm = f(xm)
        error = abs(xm - xa)
        count += 1

        # Agregar datos de la iteración
        results['iterations'].append([
            count,
            round(a,10),
            round(xm,10),
            round(b,10),
            "{:.2e}".format(fm),
            "{:.2e}".format(error)
        ])

    # Determinar conclusión
    if abs(fm) == 0:
        results['conclusion'] = f"The root was found for x{count} = {xm:.15f}"
    elif error <= tol:
        results['conclusion'] = f"An approximation of the root was found for x{count} = {xm:.15f}"
    elif count >= max_count:
        results['conclusion'] = f"Failed to converge after {max_count} iterations"
    else:
        results['conclusion'] = "The method exploded"

    return results