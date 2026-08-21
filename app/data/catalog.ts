export type Language = "en" | "am";
export type Category = "all" | "women" | "men" | "children";

export type Product = {
  id: number;
  category: Exclude<Category, "all">;
  name: Record<Language, string>;
  type: Record<Language, string>;
  usd: number;
  etb: number;
  image: string;
  imagePosition: "left" | "right";
  madeToOrder?: boolean;
};

export const products: Product[] = [
  {
    id: 1,
    category: "women",
    name: { en: "Addis Tibeb Kemis", am: "አዲስ ጥበብ ቀሚስ" },
    type: { en: "Ready-made · Hand-finished", am: "ዝግጁ · በእጅ የተጠናቀቀ" },
    usd: 220,
    etb: 31000,
    image: "/narok-women.png",
    imagePosition: "left",
  },
  {
    id: 2,
    category: "women",
    name: { en: "Gondar Celebration Dress", am: "ጎንደር የበዓል ቀሚስ" },
    type: { en: "Made to order · Cotton", am: "በትዕዛዝ · ጥጥ" },
    usd: 285,
    etb: 40000,
    image: "/narok-women.png",
    imagePosition: "right",
    madeToOrder: true,
  },
  {
    id: 3,
    category: "men",
    name: { en: "Shewa Men’s Ensemble", am: "የሸዋ ወንዶች ልብስ" },
    type: { en: "Made to order · Two-piece", am: "በትዕዛዝ · ሁለት ክፍል" },
    usd: 190,
    etb: 27000,
    image: "/narok-men.png",
    imagePosition: "left",
    madeToOrder: true,
  },
  {
    id: 4,
    category: "men",
    name: { en: "Lalibela Ceremonial Set", am: "ላሊበላ የክብረ በዓል ልብስ" },
    type: { en: "Made to order · Woven detail", am: "በትዕዛዝ · የተሸመነ ጥበብ" },
    usd: 240,
    etb: 34000,
    image: "/narok-men.png",
    imagePosition: "right",
    madeToOrder: true,
  },
  {
    id: 5,
    category: "children",
    name: { en: "Little Habesha Dress", am: "የልጆች ሐበሻ ቀሚስ" },
    type: { en: "Ready-made · Soft cotton", am: "ዝግጁ · ለስላሳ ጥጥ" },
    usd: 95,
    etb: 13500,
    image: "/narok-children.png",
    imagePosition: "left",
  },
  {
    id: 6,
    category: "children",
    name: { en: "Children’s Festive Set", am: "የልጆች የበዓል ልብስ" },
    type: { en: "Made to order · Custom color", am: "በትዕዛዝ · ብጁ ቀለም" },
    usd: 110,
    etb: 15500,
    image: "/narok-children.png",
    imagePosition: "right",
    madeToOrder: true,
  },
];

export function getProduct(id: number) {
  return products.find((product) => product.id === id);
}

