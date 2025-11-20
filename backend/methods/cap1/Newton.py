from sympy import sympify, lambdify, Symbol

def newton_method(function_text, derivative_text, x0, tol, max_count):
    results = {
        'iterations': [],
        'conclusion': None
    }

    if max_count < 0:
        results['conclusion'] = f"Max iterations is < 0: iterations = {max_count}"
        return results
    if tol < 0:
        results['conclusion'] = f"tol is an incorrect value: tol = {tol}"
        return results

    x = Symbol('x')
    try:
        expr = sympify(function_text)
        f = lambdify(x, expr, 'math')
        df_expr = sympify(derivative_text)
        df = lambdify(x, df_expr, 'math')
    except:
        results['conclusion'] = "Invalid function or derivative expression"
        return results

    try:
        fx = f(x0)
        dfx = df(x0)
    except:
        results['conclusion'] = "x0 isn't defined in the function or derivative domain"
        return results

    count = 0
    error = tol + 1

    results['iterations'].append([
        count,
        "{:.10f}".format(x0),
        "{:.2e}".format(fx),
        "{:.2e}".format(dfx),
        ""
    ])

    while error > tol and abs(fx) != 0 and abs(dfx) != 0 and count < max_count:
        try:
            x1 = x0 - fx / dfx
        except ZeroDivisionError:
            results['conclusion'] = "Division by zero occurred in derivative"
            return results

        fx1 = f(x1)
        dfx1 = df(x1)
        error = abs(x1 - x0)

        count += 1
        results['iterations'].append([
            count,
            "{:.10f}".format(x1),
            "{:.2e}".format(fx1),
            "{:.2e}".format(dfx1),
            "{:.2e}".format(error)
        ])

        x0 = x1
        fx = fx1
        dfx = dfx1

    if abs(fx) == 0:
        results['conclusion'] = f"The root was found for x{count} = {x0:.15f}"
    elif error <= tol:
        results['conclusion'] = f"An approximation of the root was found for x{count} = {x0:.15f}"
    elif count >= max_count:
        results['conclusion'] = f"Failed to converge after {max_count} iterations"
    else:
        results['conclusion'] = "The method exploded"

    return results