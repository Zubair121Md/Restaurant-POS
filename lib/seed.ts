import type {
  Branch,
  Customer,
  DiningTable,
  Ingredient,
  MenuCategory,
  MenuItem,
  Recipe,
  Reservation,
  StaffMember,
  Vendor,
  WaitlistEntry
} from "@/lib/types";

export function createId(prefix = "id") {
  const uuid = globalThis.crypto?.randomUUID?.();
  return uuid ? `${prefix}_${uuid}` : `${prefix}_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

export function seedBranches(): Branch[] {
  return [
    { id: "branch_main", name: "Harbor Kitchen Main", code: "MAIN", address: "18 Marina Walk", phone: "+1 555 0100", taxId: "HK-MAIN-001", isActive: true },
    { id: "branch_downtown", name: "Harbor Kitchen Downtown", code: "DTWN", address: "204 Market Street", phone: "+1 555 0110", taxId: "HK-DT-002", isActive: true }
  ];
}

export function seedCategories(): MenuCategory[] {
  return [
    { id: "cat_starters", name: "Starters", sortOrder: 1 },
    { id: "cat_mains", name: "Mains", sortOrder: 2 },
    { id: "cat_grill", name: "From the Grill", sortOrder: 3 },
    { id: "cat_drinks", name: "Drinks", sortOrder: 4 },
    { id: "cat_desserts", name: "Desserts", sortOrder: 5 }
  ];
}

export function seedMenu(): MenuItem[] {
  return [
    { id: "item_chowder", categoryId: "cat_starters", name: "Harbor Chowder", description: "Creamy seafood chowder", price: 9.5, available: true, sku: "HK-101", station: "general", prepMinutes: 8, recipeId: "recipe_chowder", costPrice: 3.2, isActive: true },
    { id: "item_salad", categoryId: "cat_starters", name: "Citrus Garden Salad", description: "Greens, citrus and herb vinaigrette", price: 8, available: true, sku: "HK-102", station: "salad", prepMinutes: 6, recipeId: "recipe_salad", costPrice: 2.1, isActive: true },
    { id: "item_calamari", categoryId: "cat_starters", name: "Crispy Calamari", description: "Lemon pepper calamari", price: 11, available: true, sku: "HK-103", station: "fry", prepMinutes: 10, recipeId: "recipe_calamari", costPrice: 3.8, isActive: true },
    { id: "item_burger", categoryId: "cat_mains", name: "Dockside Burger", description: "Beef, cheddar and harbor sauce", price: 15.5, available: true, sku: "HK-201", station: "grill", prepMinutes: 14, recipeId: "recipe_burger", costPrice: 5.1, isActive: true },
    { id: "item_pasta", categoryId: "cat_mains", name: "Prawn Linguine", description: "Prawns, garlic and tomato", price: 18, available: true, sku: "HK-202", station: "general", prepMinutes: 16, recipeId: "recipe_pasta", costPrice: 6, isActive: true },
    { id: "item_fish", categoryId: "cat_mains", name: "Fish & Chips", description: "Beer-battered fish and fries", price: 17, available: true, sku: "HK-203", station: "fry", prepMinutes: 15, recipeId: "recipe_fish", costPrice: 5.6, isActive: true },
    { id: "item_salmon", categoryId: "cat_grill", name: "Grilled Salmon", description: "Salmon, greens and herb butter", price: 24, available: true, sku: "HK-301", station: "grill", prepMinutes: 18, recipeId: "recipe_salmon", costPrice: 8.4, isActive: true },
    { id: "item_steak", categoryId: "cat_grill", name: "Pepper Steak", description: "Sirloin with pepper jus", price: 27, available: true, sku: "HK-302", station: "grill", prepMinutes: 20, recipeId: "recipe_steak", costPrice: 10.2, isActive: true },
    { id: "item_lime", categoryId: "cat_drinks", name: "Fresh Lime Soda", description: "Lime, mint and soda", price: 4, available: true, sku: "HK-401", station: "bar", prepMinutes: 4, recipeId: "recipe_lime", costPrice: 0.8, isActive: true },
    { id: "item_coffee", categoryId: "cat_drinks", name: "Harbor Coffee", description: "Freshly brewed house blend", price: 3.5, available: true, sku: "HK-402", station: "bar", prepMinutes: 4, recipeId: "recipe_coffee", costPrice: 0.7, isActive: true },
    { id: "item_cake", categoryId: "cat_desserts", name: "Chocolate Tide Cake", description: "Dark chocolate cake", price: 7, available: true, sku: "HK-501", station: "dessert", prepMinutes: 5, recipeId: "recipe_cake", costPrice: 1.9, isActive: true },
    { id: "item_cheesecake", categoryId: "cat_desserts", name: "Lemon Cheesecake", description: "Citrus cheesecake and cream", price: 7.5, available: true, sku: "HK-502", station: "dessert", prepMinutes: 5, costPrice: 2.2, isActive: true }
  ];
}

export function seedTables(): DiningTable[] {
  return [
    ["table_1", "branch_main", "M1", 2, "Main", 60, 70, "round"],
    ["table_2", "branch_main", "M2", 4, "Main", 190, 70, "square"],
    ["table_3", "branch_main", "M3", 4, "Main", 320, 70, "square"],
    ["table_4", "branch_main", "P1", 6, "Patio", 80, 220, "rectangle"],
    ["table_5", "branch_main", "P2", 6, "Patio", 270, 220, "rectangle"],
    ["table_6", "branch_downtown", "D1", 2, "Dining", 60, 70, "round"],
    ["table_7", "branch_downtown", "D2", 4, "Dining", 190, 70, "square"],
    ["table_8", "branch_downtown", "D3", 4, "Dining", 320, 70, "square"],
    ["table_9", "branch_downtown", "B1", 2, "Bar", 100, 220, "round"],
    ["table_10", "branch_downtown", "B2", 2, "Bar", 250, 220, "round"]
  ].map(([id, branchId, label, seats, zone, x, y, shape]) => ({
    id: id as string, branchId: branchId as string, label: label as string, seats: seats as number,
    zone: zone as string, x: x as number, y: y as number, shape: shape as DiningTable["shape"], status: "available"
  }));
}

export function seedIngredients(): Ingredient[] {
  const expiry = (days: number) => new Date(Date.now() + days * 86400000).toISOString();
  return [
    { id: "ing_fish", branchId: "branch_main", name: "White Fish", unit: "kg", stockQty: 14, reorderLevel: 5, costPerUnit: 12, expiryDate: expiry(4), batchNo: "WF-804", category: "raw" },
    { id: "ing_salmon", branchId: "branch_main", name: "Salmon Fillet", unit: "kg", stockQty: 9, reorderLevel: 4, costPerUnit: 19, expiryDate: expiry(3), batchNo: "SF-211", category: "raw" },
    { id: "ing_beef", branchId: "branch_main", name: "Ground Beef", unit: "kg", stockQty: 12, reorderLevel: 4, costPerUnit: 11, expiryDate: expiry(5), category: "raw" },
    { id: "ing_prawns", branchId: "branch_main", name: "Prawns", unit: "kg", stockQty: 7, reorderLevel: 3, costPerUnit: 16, expiryDate: expiry(3), category: "raw" },
    { id: "ing_calamari", branchId: "branch_main", name: "Calamari", unit: "kg", stockQty: 6, reorderLevel: 2.5, costPerUnit: 13, expiryDate: expiry(4), category: "raw" },
    { id: "ing_greens", branchId: "branch_main", name: "Mixed Greens", unit: "kg", stockQty: 3.5, reorderLevel: 2, costPerUnit: 6, expiryDate: expiry(2), category: "raw" },
    { id: "ing_potato", branchId: "branch_main", name: "Potatoes", unit: "kg", stockQty: 28, reorderLevel: 8, costPerUnit: 2, category: "raw" },
    { id: "ing_pasta", branchId: "branch_main", name: "Linguine", unit: "kg", stockQty: 15, reorderLevel: 5, costPerUnit: 3, category: "raw" },
    { id: "ing_lime", branchId: "branch_main", name: "Limes", unit: "pcs", stockQty: 40, reorderLevel: 15, costPerUnit: 0.35, expiryDate: expiry(7), category: "raw" },
    { id: "ing_coffee", branchId: "branch_main", name: "Coffee Beans", unit: "kg", stockQty: 6, reorderLevel: 2, costPerUnit: 14, category: "raw" },
    { id: "ing_sirloin", branchId: "branch_main", name: "Sirloin", unit: "kg", stockQty: 8, reorderLevel: 3, costPerUnit: 22, expiryDate: expiry(4), category: "raw" },
    { id: "ing_cream", branchId: "branch_main", name: "Cooking Cream", unit: "l", stockQty: 1.2, reorderLevel: 2, costPerUnit: 5, expiryDate: expiry(1), batchNo: "CR-019", category: "raw" },
    { id: "ing_dt_beef", branchId: "branch_downtown", name: "Ground Beef", unit: "kg", stockQty: 8, reorderLevel: 3, costPerUnit: 11, expiryDate: expiry(5), category: "raw" },
    { id: "ing_dt_greens", branchId: "branch_downtown", name: "Mixed Greens", unit: "kg", stockQty: 2, reorderLevel: 2, costPerUnit: 6, expiryDate: expiry(2), category: "raw" },
    { id: "ing_dt_coffee", branchId: "branch_downtown", name: "Coffee Beans", unit: "kg", stockQty: 4, reorderLevel: 2, costPerUnit: 14, category: "raw" }
  ];
}

export function seedRecipes(): Recipe[] {
  return [
    { id: "recipe_chowder", menuItemId: "item_chowder", yieldPortions: 1, ingredients: [{ ingredientId: "ing_fish", qty: 0.12, wastePercent: 5 }, { ingredientId: "ing_cream", qty: 0.08, wastePercent: 2 }], laborMinutes: 8 },
    { id: "recipe_salad", menuItemId: "item_salad", yieldPortions: 1, ingredients: [{ ingredientId: "ing_greens", qty: 0.18, wastePercent: 8 }], laborMinutes: 5 },
    { id: "recipe_calamari", menuItemId: "item_calamari", yieldPortions: 1, ingredients: [{ ingredientId: "ing_calamari", qty: 0.22, wastePercent: 5 }], laborMinutes: 9 },
    { id: "recipe_burger", menuItemId: "item_burger", yieldPortions: 1, ingredients: [{ ingredientId: "ing_beef", qty: 0.2, wastePercent: 3 }, { ingredientId: "ing_potato", qty: 0.18, wastePercent: 10 }], laborMinutes: 12 },
    { id: "recipe_pasta", menuItemId: "item_pasta", yieldPortions: 1, ingredients: [{ ingredientId: "ing_pasta", qty: 0.16, wastePercent: 2 }, { ingredientId: "ing_prawns", qty: 0.15, wastePercent: 5 }], laborMinutes: 14 },
    { id: "recipe_fish", menuItemId: "item_fish", yieldPortions: 1, ingredients: [{ ingredientId: "ing_fish", qty: 0.22, wastePercent: 8 }, { ingredientId: "ing_potato", qty: 0.2, wastePercent: 10 }], laborMinutes: 13 },
    { id: "recipe_salmon", menuItemId: "item_salmon", yieldPortions: 1, ingredients: [{ ingredientId: "ing_salmon", qty: 0.24, wastePercent: 4 }, { ingredientId: "ing_greens", qty: 0.12, wastePercent: 8 }], laborMinutes: 16 },
    { id: "recipe_steak", menuItemId: "item_steak", yieldPortions: 1, ingredients: [{ ingredientId: "ing_sirloin", qty: 0.28, wastePercent: 4 }], laborMinutes: 18 },
    { id: "recipe_lime", menuItemId: "item_lime", yieldPortions: 1, ingredients: [{ ingredientId: "ing_lime", qty: 2, wastePercent: 0 }], laborMinutes: 3 },
    { id: "recipe_coffee", menuItemId: "item_coffee", yieldPortions: 1, ingredients: [{ ingredientId: "ing_coffee", qty: 0.018, wastePercent: 2 }], laborMinutes: 3 },
    { id: "recipe_cake", menuItemId: "item_cake", yieldPortions: 1, ingredients: [{ ingredientId: "ing_cream", qty: 0.05, wastePercent: 1 }], laborMinutes: 4 }
  ];
}

export function seedStaff(): StaffMember[] {
  const joinDate = "2025-01-15";
  return [
    { id: "staff_manager", branchId: "branch_main", name: "Maya Chen", username: "maya", role: "branch_manager", phone: "+1 555 0201", hourlyRate: 28, active: true, joinDate, attendance: [] },
    { id: "staff_cashier", branchId: "branch_main", name: "Noah Williams", username: "noah", role: "cashier", pin: "1042", hourlyRate: 18, active: true, joinDate, attendance: [] },
    { id: "staff_waiter", branchId: "branch_main", name: "Ava Singh", username: "ava", role: "waiter", pin: "2361", hourlyRate: 16, active: true, joinDate, attendance: [] },
    { id: "staff_chef", branchId: "branch_main", name: "Leo Martin", username: "leo", role: "chef", pin: "4418", hourlyRate: 25, active: true, joinDate, attendance: [] },
    { id: "staff_store", branchId: "branch_downtown", name: "Emma Davis", username: "emma", role: "store_manager", hourlyRate: 22, active: true, joinDate, attendance: [] }
  ];
}

export function seedCustomers(): Customer[] {
  return [
    { id: "cust_1", name: "Olivia Carter", phone: "+1 555 0301", email: "olivia@example.com", visits: 7, totalSpend: 420, loyaltyPoints: 420, tags: ["regular"] },
    { id: "cust_2", name: "Ethan Brooks", phone: "+1 555 0302", visits: 3, totalSpend: 168, loyaltyPoints: 168, tags: ["seafood"] },
    { id: "cust_3", name: "Sophia Patel", phone: "+1 555 0303", visits: 11, totalSpend: 735, loyaltyPoints: 735, tags: ["vip"] },
    { id: "cust_4", name: "James Wilson", phone: "+1 555 0304", visits: 1, totalSpend: 52, loyaltyPoints: 52 }
  ];
}

export function seedVendors(): Vendor[] {
  return [
    { id: "vendor_ocean", name: "Ocean Fresh Supply", phone: "+1 555 0401", email: "orders@oceanfresh.example", products: ["ing_fish", "ing_salmon", "ing_prawns", "ing_calamari"], rating: 4.8, creditLimit: 10000, paymentTermsDays: 30 },
    { id: "vendor_market", name: "City Produce Market", phone: "+1 555 0402", products: ["ing_greens", "ing_potato", "ing_lime", "ing_pasta"], rating: 4.5, creditLimit: 5000, paymentTermsDays: 15 }
  ];
}

export function seedReservations(): Reservation[] {
  return [{ id: "res_demo", branchId: "branch_main", tableId: "table_4", guestName: "Nora Hayes", phone: "+1 555 0501", partySize: 5, scheduledAt: new Date(Date.now() + 86400000).toISOString(), status: "booked", notes: "Window seating preferred" }];
}

export function seedWaitlist(): WaitlistEntry[] {
  return [{ id: "wait_demo", branchId: "branch_main", guestName: "Lucas Reed", phone: "+1 555 0502", partySize: 2, createdAt: new Date().toISOString(), status: "waiting" }];
}
