import sys
sys.path.append('.')
from methods.cap3.Lagrange import lagrange_interpolation
try:
    result = lagrange_interpolation([0, 1, 2, 3], [1, 2, 5, 10])
    print('SUCCESS:', list(result.keys()))
    if 'error' in result:
        print('Error in result:', result['error'])
    if 'conclusion' in result:
        print('Conclusion:', result['conclusion'])
except Exception as e:
    import traceback
    print('ERROR:', str(e))
    traceback.print_exc()
