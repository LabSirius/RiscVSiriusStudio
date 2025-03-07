void increment(int *x) {
   for (int i = 0; i < 5; i++) {
       *x = *x + 1;
   }
}


int main() {
   int num = 2;
   increment(&num);  // num will become 7
}