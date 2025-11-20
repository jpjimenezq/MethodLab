import numpy as np

def gaussSeidel_method(A, b, x0, tol, max_count, norm_type):
    results = {
        'C': None,
        'T': None,
        'spectral_radius': None,
        'iterations': [],  # cada item: (iteracion, error, x)
        'conclusion': None,
        'final_solution': None,
    }

    # Validaciones básicas
    if np.any(np.diag(A) == 0):
        results['conclusion'] = "La matriz A tiene un elemento diagonal cero. No se puede ejecutar el método."
        return results
    if max_count < 0:
        results['conclusion'] = f"Máximo de iteraciones inválido: max_count = {max_count}"
        return results
    if tol < 0:
        results['conclusion'] = f"Tolerancia inválida: tol = {tol}"
        return results
    if np.linalg.det(A) == 0:
        results['conclusion'] = "det(A) es 0. No se puede ejecutar el método."
        return results

    # Descomposición
    D = np.diag(np.diag(A))
    L = -np.tril(A, -1)
    U = -np.triu(A, 1)

    # Matrices iterativas
    D_inv = np.linalg.inv(D)
    T = np.linalg.inv(D - L) @ U
    C = np.linalg.inv(D - L) @ b

    # Guardar matrices
    results['C'] = C
    results['T'] = T

    # Radio espectral
    spectral_radius = max(abs(np.linalg.eigvals(T)))
    results['spectral_radius'] = spectral_radius

    if spectral_radius >= 1:
        results['conclusion'] = "El método no converge (radio espectral >= 1)."
        return results

    # Iteraciones
    x_old = x0.copy()
    error = tol + 1
    count = 0
    results['iterations'].append((count, 0.0, x_old.copy()))

    while error > tol and count < max_count:
        x_new = C + T @ x_old
        error = np.linalg.norm(x_new - x_old, ord=norm_type)
        count += 1
        results['iterations'].append((count, error, x_new.copy()))
        x_old = x_new

    results['final_solution'] = x_new

    if error <= tol:
        results['conclusion'] = f"Convergió en {count} iteraciones con tolerancia {tol}."
    else:
        results['conclusion'] = f"No convergió en {max_count} iteraciones."

    return results