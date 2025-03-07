
int sum(int a, int b){
    return a + b;
}

int main() {
    int n=0;

    for (int i=0;i<=5;i++){
        n = sum(n, i);
    }
    return n;
    
}
