import type { DiningTable, MenuCategory, MenuItem } from "@/lib/types";

export function createId(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-4)}`;
}

export function seedCategories(): MenuCategory[] {
  return [
    { id: "cat_starters", name: "Starters", sortOrder: 1 },
    { id: "cat_mains", name: "Mains", sortOrder: 2 },
    { id: "cat_drinks", name: "Drinks", sortOrder: 3 },
    { id: "cat_desserts", name: "Desserts", sortOrder: 4 }
  ];
}

export function seedMenu(): MenuItem[] {
  return [
    {
      id: "item_soup",
      categoryId: "cat_starters",
      name: "Tomato Basil Soup",
      description: "Roasted tomato, cream, basil oil",
      price: 6.5,
      available: true
    },
    {
      id: "item_salad",
      categoryId: "cat_starters",
      name: "Garden Salad",
      description: "Mixed greens, vinaigrette",
      price: 7.25,
      available: true
    },
    {
      id: "item_burger",
      categoryId: "cat_mains",
      name: "House Burger",
      description: "Angus beef, cheddar, house sauce",
      price: 14.5,
      available: true
    },
    {
      id: "item_pasta",
      categoryId: "cat_mains",
      name: "Creamy Pasta",
      description: "Penne, mushrooms, parmesan",
      price: 13.75,
      available: true
    },
    {
      id: "item_steak",
      categoryId: "cat_mains",
      name: "Grilled Steak",
      description: "8oz sirloin, garlic butter",
      price: 22.0,
      available: true
    },
    {
      id: "item_cola",
      categoryId: "cat_drinks",
      name: "Soft Drink",
      description: "Cola, lemonade, or soda water",
      price: 2.5,
      available: true
    },
    {
      id: "item_coffee",
      categoryId: "cat_drinks",
      name: "Fresh Coffee",
      description: "Espresso-based coffee",
      price: 3.25,
      available: true
    },
    {
      id: "item_cake",
      categoryId: "cat_desserts",
      name: "Chocolate Cake",
      description: "Warm cake with cream",
      price: 6.0,
      available: true
    }
  ];
}

export function seedTables(): DiningTable[] {
  return [
    { id: "table_1", label: "T1", seats: 2, zone: "Main", status: "available" },
    { id: "table_2", label: "T2", seats: 2, zone: "Main", status: "available" },
    { id: "table_3", label: "T3", seats: 4, zone: "Main", status: "available" },
    { id: "table_4", label: "T4", seats: 4, zone: "Main", status: "available" },
    { id: "table_5", label: "T5", seats: 6, zone: "Patio", status: "available" },
    { id: "table_6", label: "T6", seats: 6, zone: "Patio", status: "available" },
    { id: "table_7", label: "T7", seats: 8, zone: "Private", status: "available" },
    { id: "table_8", label: "Bar 1", seats: 1, zone: "Bar", status: "available" }
  ];
}
