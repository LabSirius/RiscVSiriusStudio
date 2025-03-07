int max(int a, int b) {
   if (a > b) {
       return a;
   } else {
       return b;
   }
}


int main() {
   int result;
   int x = 3;
   int y = 8;
   result = max(x, y);  // result = 8
}
