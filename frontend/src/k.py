def min_operations(a, b):
    operations = 0
    while a != b and a != 0 and b != 0:
        if a > b:
            operations += a // b  # Count how many times b can be subtracted from a
            a = a % b
        else:
            operations += b // a  # Count how many times a can be subtracted from b
            b = b % a
    return operations

print(min_operations(7,9)-1)