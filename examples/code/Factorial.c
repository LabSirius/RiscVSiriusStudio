int factorial(int n) {
  if (n <= 1)
    return 1;
  else
    return n * factorial(n - 1);
}

int main() {
  int num = 3;
  int result = factorial(num);
  return 0;
}