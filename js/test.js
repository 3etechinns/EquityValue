
function smallestCommons(arr) {
    var nums = getArrayList(arr);
    var primes = getPrimeList(nums[nums.length -1]);
    var lcm = 1;
    console.log(primes);
    while (0 !== primes.length){
        var tempsum = 1;
        var p = primes.shift();
        while(sumOfNums(nums) !== tempsum){
            tempsum = sumOfNums(nums);
            for (var i=0; i<nums.length; i++ ){
                if (nums[i]%p === 0){
                    nums[i] = nums[i] / p;
                }
            }
            lcm *= p;

        }
    }
    return lcm;
}

function getArrayList(arr){
    var nums = [];
    if (arr[0] > arr[1]){
        var temp = arr[1];
        arr[1] = arr[0];
        arr[0] = temp;
    }
    for (var i = arr[0]; i<=arr[1]; i++){
        nums.push(i);
    }
    return nums;
}

function getPrimeList(num){
    var arr  = [];
    for (var i=2; i<=num; i++){
        if (isPrime(i)){
            arr.push(i);
        }
    }
    return arr;
}

function isPrime(num){
    var factors = [];
    for (var j=2; j<= num/2; j++){
        if (num%j == 0){
            return false;
        }
    }
    return true;
}


function sumOfNums(nums){
    return nums.reduce(function(a,b){
        return a+b;
    });
}

smallestCommons([1,5]);
