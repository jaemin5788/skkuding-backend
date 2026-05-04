export interface Restaurant {
  id: number;
  name: string;
  category: string;
  address: string;
  rating: number;
}

export const Restaurants: Restaurant[] = [
  {
    id: 1,
    name: "맛있는 식당",
    category: "한식",
    address: "서울시 어딘가",
    rating: 4.5
  },
  {
    id: 2,
    name: "피자 가게",
    category: "양식",
    address: "수원시 어딘가",
    rating: 4.2
  }
];