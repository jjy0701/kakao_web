 let cardOne = 7;
 let cardTwo = 5;
 let sum = cardOne + cardTwo;
 let cardOneBank = 7;
 let cardTwoBank = 5;
 let cardThreeBank = 3;
 let cardFourBank = 6;
 let cardThree = 7;
 sum += cardThree;

 if (sum > 21) {
  console.log('You lost');
 }
 if(sum==21){
  console.log("You Win");
 }
 console.log(`You have ${sum} points`);
 let bankSum = cardOneBank + cardTwoBank + cardThreeBank + cardFourBank;
 if (bankSum > 21 || (sum <= 21 && sum > bankSum)) {
  console.log('You win');
 } 
 else if(sum == bankSum){
    console.log('Draw');
 }
 else {
  console.log('Bank wins');
 }
 