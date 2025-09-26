let iceCreamFlavors = [
 { name: "Chocolate", type: "Chocolate", price: 2 }, 
 { name: "Strawberry", type: "Fruit", price: 1 }, 
 { name: "Vanilla", type: "Vanilla", price: 2 }, 
 { name: "Pistachio", type: "Nuts", price: 1.5 }, 
 { name: "Neapolitan", type: "Chocolate", price: 2}, 
 { name: "Mint Chip", type: "Chocolate", price: 1.5 },
 { name: "Raspberry", type: "Fruit", price: 1},
 ];
let transactions = []

transactions.push({ scoops: ["chocolate", "vanilla", "mint chip"], total: 5.5})
transactions.push({scoops: ["raspberry", "strawberry"],total:2})
transactions.push({scoops:["vanilla","vanilla"], total: 4})

const total = transactions.reduce((acc,curr)=>acc + curr.total, 0);
console.log(`You've made ${total} $ today`);
let flavorDistribution = transactions.reduce((acc, curr) => {
     curr.scoops.forEach(scoop => {
    if (!acc[scoop]) {
      acc[scoop] = 0;
    }
    acc[scoop]++;
  })
  return acc;
 }, {})
 const flavorKeys = Object.keys(flavorDistribution);
 let mostPopularFlavor = '';
 let maxCount = 0;
 flavorKeys.forEach(flavor => {
  
  const currentCount = flavorDistribution[flavor];

  if (currentCount > maxCount) {
    maxCount = currentCount;
    mostPopularFlavor = flavor;
  }
});

console.log(`가장 인기있는 맛은 "${mostPopularFlavor}"이며, ${maxCount}번 팔렸습니다! `);