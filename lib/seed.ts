import type {
  AttendanceRecord,
  Branch,
  Customer,
  DiningTable,
  Expense,
  Feedback,
  Ingredient,
  LedgerEntry,
  MenuCategory,
  MenuItem,
  Order,
  OrderItem,
  PurchaseOrder,
  Recipe,
  Reservation,
  StaffMember,
  StockMovement,
  Transfer,
  Vendor,
  WaitlistEntry
} from "@/lib/types";
import { DEMO } from "@/lib/brand";

export function createId(prefix = "id") {
  const uuid = globalThis.crypto?.randomUUID?.();
  return uuid ? `${prefix}_${uuid}` : `${prefix}_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

function hoursAgo(hours: number) {
  return new Date(Date.now() - hours * 3600000).toISOString();
}

function daysFromNow(days: number) {
  return new Date(Date.now() + days * 86400000).toISOString();
}

function todayStamp() {
  return new Date().toISOString().slice(0, 10);
}

export function seedBranches(): Branch[] {
  return [
    {
      id: "branch_main",
      name: "Spice Garden — Koramangala",
      code: "BLR-KOR",
      address: "12th Main, 5th Block, Koramangala, Bengaluru 560095",
      phone: "+91 80 4567 1100",
      taxId: "29AABCM1234A1Z5",
      isActive: true
    },
    {
      id: "branch_downtown",
      name: "Spice Garden — Indiranagar",
      code: "BLR-IND",
      address: "100 Feet Road, Indiranagar, Bengaluru 560038",
      phone: "+91 80 4567 1200",
      taxId: "29AABCM1234A1Z6",
      isActive: true
    },
    {
      id: "branch_airport",
      name: "Spice Garden — Airport Express",
      code: "BLR-AIR",
      address: "T2 Food Court, Kempegowda International Airport",
      phone: "+91 80 4567 1300",
      taxId: "29AABCM1234A1Z7",
      isActive: true
    }
  ];
}

export function seedCategories(): MenuCategory[] {
  return [
    { id: "cat_starters", name: "Starters", sortOrder: 1 },
    { id: "cat_mains", name: "Mains", sortOrder: 2 },
    { id: "cat_tandoor", name: "Tandoor & Grill", sortOrder: 3 },
    { id: "cat_biryani", name: "Biryani & Rice", sortOrder: 4 },
    { id: "cat_breads", name: "Breads", sortOrder: 5 },
    { id: "cat_drinks", name: "Beverages", sortOrder: 6 },
    { id: "cat_desserts", name: "Desserts", sortOrder: 7 }
  ];
}

export function seedMenu(): MenuItem[] {
  return [
    { id: "item_paneer_tikka", categoryId: "cat_starters", name: "Paneer Tikka", description: "Tandoor-roasted cottage cheese, mint chutney", price: 280, available: true, sku: "SG-101", barcode: "8901001010011", station: "grill", prepMinutes: 12, recipeId: "recipe_paneer_tikka", costPrice: 95, isActive: true },
    { id: "item_chicken_65", categoryId: "cat_starters", name: "Chicken 65", description: "Spicy fried chicken, curry leaf tempering", price: 320, available: true, sku: "SG-102", barcode: "8901001010028", station: "fry", prepMinutes: 14, recipeId: "recipe_chicken_65", costPrice: 110, isActive: true },
    { id: "item_hara_bhara", categoryId: "cat_starters", name: "Hara Bhara Kebab", description: "Spinach and pea patties", price: 240, available: true, sku: "SG-103", station: "fry", prepMinutes: 10, recipeId: "recipe_hara_bhara", costPrice: 70, isActive: true },
    { id: "item_butter_chicken", categoryId: "cat_mains", name: "Butter Chicken", description: "Tomato-butter gravy, tender chicken", price: 420, available: true, sku: "SG-201", station: "general", prepMinutes: 18, recipeId: "recipe_butter_chicken", costPrice: 155, isActive: true },
    { id: "item_dal_makhani", categoryId: "cat_mains", name: "Dal Makhani", description: "Slow-cooked black lentils", price: 290, available: true, sku: "SG-202", station: "general", prepMinutes: 8, recipeId: "recipe_dal_makhani", costPrice: 75, isActive: true },
    { id: "item_palak_paneer", categoryId: "cat_mains", name: "Palak Paneer", description: "Spinach gravy with paneer cubes", price: 310, available: true, sku: "SG-203", station: "general", prepMinutes: 14, recipeId: "recipe_palak_paneer", costPrice: 105, isActive: true },
    { id: "item_fish_curry", categoryId: "cat_mains", name: "Mangalorean Fish Curry", description: "Coastal coconut fish curry", price: 450, available: true, sku: "SG-204", station: "general", prepMinutes: 16, recipeId: "recipe_fish_curry", costPrice: 180, isActive: true },
    { id: "item_tandoori_chicken", categoryId: "cat_tandoor", name: "Tandoori Chicken Half", description: "Classic clay-oven chicken", price: 380, available: true, sku: "SG-301", station: "grill", prepMinutes: 22, recipeId: "recipe_tandoori", costPrice: 140, isActive: true },
    { id: "item_seekh", categoryId: "cat_tandoor", name: "Mutton Seekh Kebab", description: "Minced mutton skewers", price: 410, available: true, sku: "SG-302", station: "grill", prepMinutes: 16, recipeId: "recipe_seekh", costPrice: 170, isActive: true },
    { id: "item_veg_biryani", categoryId: "cat_biryani", name: "Veg Dum Biryani", description: "Sealed pot basmati, raita", price: 280, available: true, sku: "SG-401", station: "general", prepMinutes: 20, recipeId: "recipe_veg_biryani", costPrice: 90, isActive: true },
    { id: "item_chicken_biryani", categoryId: "cat_biryani", name: "Hyderabadi Chicken Biryani", description: "Dum chicken biryani, salan", price: 360, available: true, sku: "SG-402", station: "general", prepMinutes: 22, recipeId: "recipe_chicken_biryani", costPrice: 130, isActive: true },
    { id: "item_naan", categoryId: "cat_breads", name: "Butter Naan", description: "Tandoor naan with butter", price: 70, available: true, sku: "SG-501", station: "grill", prepMinutes: 6, recipeId: "recipe_naan", costPrice: 18, isActive: true },
    { id: "item_roti", categoryId: "cat_breads", name: "Tandoori Roti", description: "Whole wheat tandoor roti", price: 45, available: true, sku: "SG-502", station: "grill", prepMinutes: 5, recipeId: "recipe_roti", costPrice: 10, isActive: true },
    { id: "item_lassi", categoryId: "cat_drinks", name: "Mango Lassi", description: "Chilled sweet mango yogurt", price: 120, available: true, sku: "SG-601", station: "bar", prepMinutes: 4, recipeId: "recipe_lassi", costPrice: 35, isActive: true },
    { id: "item_masala_soda", categoryId: "cat_drinks", name: "Masala Soda", description: "House spice soda", price: 90, available: true, sku: "SG-602", station: "bar", prepMinutes: 3, recipeId: "recipe_masala_soda", costPrice: 20, isActive: true },
    { id: "item_filter_coffee", categoryId: "cat_drinks", name: "Filter Coffee", description: "South Indian decoction coffee", price: 80, available: true, sku: "SG-603", station: "bar", prepMinutes: 5, recipeId: "recipe_coffee", costPrice: 18, isActive: true },
    { id: "item_gulab", categoryId: "cat_desserts", name: "Gulab Jamun (2 pc)", description: "Warm milk dumplings in syrup", price: 110, available: true, sku: "SG-701", station: "dessert", prepMinutes: 4, recipeId: "recipe_gulab", costPrice: 28, isActive: true },
    { id: "item_kulfi", categoryId: "cat_desserts", name: "Malai Kulfi", description: "Saffron pistachio kulfi", price: 130, available: true, sku: "SG-702", station: "dessert", prepMinutes: 3, recipeId: "recipe_kulfi", costPrice: 40, isActive: true }
  ];
}

export function seedTables(): DiningTable[] {
  const rows: Array<[string, string, string, number, string, number, number, DiningTable["shape"], DiningTable["status"], string?]> = [
    ["table_1", "branch_main", "K1", 2, "Garden", 60, 70, "round", "available"],
    ["table_2", "branch_main", "K2", 4, "Garden", 190, 70, "square", "occupied", "ord_demo_open_1"],
    ["table_3", "branch_main", "K3", 4, "Garden", 320, 70, "square", "available"],
    ["table_4", "branch_main", "K4", 6, "Family", 80, 220, "rectangle", "reserved"],
    ["table_5", "branch_main", "K5", 6, "Family", 270, 220, "rectangle", "billing", "ord_demo_open_2"],
    ["table_6", "branch_main", "K6", 8, "Private", 180, 360, "rectangle", "available"],
    ["table_7", "branch_main", "Bar-A", 2, "Bar", 420, 220, "round", "available"],
    ["table_8", "branch_downtown", "I1", 2, "Dining", 60, 70, "round", "available"],
    ["table_9", "branch_downtown", "I2", 4, "Dining", 190, 70, "square", "occupied", "ord_demo_open_3"],
    ["table_10", "branch_downtown", "I3", 4, "Dining", 320, 70, "square", "available"],
    ["table_11", "branch_downtown", "I4", 6, "Patio", 120, 220, "rectangle", "available"],
    ["table_12", "branch_downtown", "I5", 2, "Bar", 280, 220, "round", "dirty"],
    ["table_13", "branch_airport", "A1", 2, "Quick Serve", 60, 70, "square", "available"],
    ["table_14", "branch_airport", "A2", 2, "Quick Serve", 180, 70, "square", "available"],
    ["table_15", "branch_airport", "A3", 4, "Quick Serve", 300, 70, "square", "available"]
  ];
  return rows.map(([id, branchId, label, seats, zone, x, y, shape, status, activeOrderId]) => ({
    id, branchId, label, seats, zone, x, y, shape, status, activeOrderId
  }));
}

export function seedIngredients(): Ingredient[] {
  const expiry = daysFromNow;
  return [
    { id: "ing_paneer", branchId: "branch_main", name: "Paneer", unit: "kg", stockQty: 18, reorderLevel: 6, costPerUnit: 320, expiryDate: expiry(4), batchNo: "PN-2401", category: "raw" },
    { id: "ing_chicken", branchId: "branch_main", name: "Chicken", unit: "kg", stockQty: 42, reorderLevel: 15, costPerUnit: 210, expiryDate: expiry(3), batchNo: "CK-881", category: "raw" },
    { id: "ing_mutton", branchId: "branch_main", name: "Mutton Mince", unit: "kg", stockQty: 12, reorderLevel: 5, costPerUnit: 520, expiryDate: expiry(2), batchNo: "MT-112", category: "raw" },
    { id: "ing_fish", branchId: "branch_main", name: "Seer Fish", unit: "kg", stockQty: 9, reorderLevel: 4, costPerUnit: 480, expiryDate: expiry(2), batchNo: "SF-044", category: "raw" },
    { id: "ing_dal", branchId: "branch_main", name: "Black Lentils", unit: "kg", stockQty: 25, reorderLevel: 8, costPerUnit: 95, category: "raw" },
    { id: "ing_spinach", branchId: "branch_main", name: "Spinach", unit: "kg", stockQty: 4, reorderLevel: 3, costPerUnit: 40, expiryDate: expiry(1), category: "raw" },
    { id: "ing_rice", branchId: "branch_main", name: "Basmati Rice", unit: "kg", stockQty: 60, reorderLevel: 20, costPerUnit: 110, category: "raw" },
    { id: "ing_flour", branchId: "branch_main", name: "Maida / Atta", unit: "kg", stockQty: 35, reorderLevel: 12, costPerUnit: 45, category: "raw" },
    { id: "ing_yogurt", branchId: "branch_main", name: "Yogurt", unit: "kg", stockQty: 14, reorderLevel: 5, costPerUnit: 70, expiryDate: expiry(5), category: "raw" },
    { id: "ing_butter", branchId: "branch_main", name: "Butter", unit: "kg", stockQty: 8, reorderLevel: 3, costPerUnit: 480, expiryDate: expiry(12), category: "raw" },
    { id: "ing_cream", branchId: "branch_main", name: "Fresh Cream", unit: "l", stockQty: 1.5, reorderLevel: 2, costPerUnit: 220, expiryDate: expiry(1), batchNo: "CR-019", category: "raw" },
    { id: "ing_mango_pulp", branchId: "branch_main", name: "Mango Pulp", unit: "l", stockQty: 6, reorderLevel: 2, costPerUnit: 160, expiryDate: expiry(20), category: "raw" },
    { id: "ing_spices", branchId: "branch_main", name: "Kitchen Masala Mix", unit: "kg", stockQty: 5, reorderLevel: 2, costPerUnit: 380, category: "raw" },
    { id: "ing_oil", branchId: "branch_main", name: "Cooking Oil", unit: "l", stockQty: 22, reorderLevel: 8, costPerUnit: 140, category: "raw" },
    { id: "ing_pack_box", branchId: "branch_main", name: "Takeaway Boxes", unit: "pcs", stockQty: 220, reorderLevel: 80, costPerUnit: 8, category: "packaging" },
    { id: "ing_dt_chicken", branchId: "branch_downtown", name: "Chicken", unit: "kg", stockQty: 28, reorderLevel: 12, costPerUnit: 210, expiryDate: expiry(3), category: "raw" },
    { id: "ing_dt_paneer", branchId: "branch_downtown", name: "Paneer", unit: "kg", stockQty: 10, reorderLevel: 5, costPerUnit: 320, expiryDate: expiry(3), category: "raw" },
    { id: "ing_dt_rice", branchId: "branch_downtown", name: "Basmati Rice", unit: "kg", stockQty: 40, reorderLevel: 15, costPerUnit: 110, category: "raw" },
    { id: "ing_dt_cream", branchId: "branch_downtown", name: "Fresh Cream", unit: "l", stockQty: 0.8, reorderLevel: 2, costPerUnit: 220, expiryDate: expiry(1), category: "raw" },
    { id: "ing_air_chicken", branchId: "branch_airport", name: "Chicken", unit: "kg", stockQty: 16, reorderLevel: 8, costPerUnit: 215, expiryDate: expiry(2), category: "raw" },
    { id: "ing_air_rice", branchId: "branch_airport", name: "Basmati Rice", unit: "kg", stockQty: 22, reorderLevel: 10, costPerUnit: 112, category: "raw" },
    { id: "ing_air_boxes", branchId: "branch_airport", name: "Takeaway Boxes", unit: "pcs", stockQty: 60, reorderLevel: 100, costPerUnit: 8, category: "packaging" }
  ];
}

export function seedRecipes(): Recipe[] {
  return [
    { id: "recipe_paneer_tikka", menuItemId: "item_paneer_tikka", yieldPortions: 1, laborMinutes: 10, ingredients: [{ ingredientId: "ing_paneer", qty: 0.18, wastePercent: 4 }, { ingredientId: "ing_yogurt", qty: 0.05, wastePercent: 2 }, { ingredientId: "ing_spices", qty: 0.01, wastePercent: 0 }] },
    { id: "recipe_chicken_65", menuItemId: "item_chicken_65", yieldPortions: 1, laborMinutes: 12, ingredients: [{ ingredientId: "ing_chicken", qty: 0.22, wastePercent: 6 }, { ingredientId: "ing_oil", qty: 0.04, wastePercent: 5 }, { ingredientId: "ing_spices", qty: 0.015, wastePercent: 0 }] },
    { id: "recipe_hara_bhara", menuItemId: "item_hara_bhara", yieldPortions: 1, laborMinutes: 9, ingredients: [{ ingredientId: "ing_spinach", qty: 0.12, wastePercent: 10 }, { ingredientId: "ing_oil", qty: 0.03, wastePercent: 5 }] },
    { id: "recipe_butter_chicken", menuItemId: "item_butter_chicken", yieldPortions: 1, laborMinutes: 15, ingredients: [{ ingredientId: "ing_chicken", qty: 0.25, wastePercent: 5 }, { ingredientId: "ing_butter", qty: 0.04, wastePercent: 2 }, { ingredientId: "ing_cream", qty: 0.06, wastePercent: 2 }] },
    { id: "recipe_dal_makhani", menuItemId: "item_dal_makhani", yieldPortions: 1, laborMinutes: 6, ingredients: [{ ingredientId: "ing_dal", qty: 0.16, wastePercent: 2 }, { ingredientId: "ing_butter", qty: 0.02, wastePercent: 2 }, { ingredientId: "ing_cream", qty: 0.03, wastePercent: 2 }] },
    { id: "recipe_palak_paneer", menuItemId: "item_palak_paneer", yieldPortions: 1, laborMinutes: 12, ingredients: [{ ingredientId: "ing_paneer", qty: 0.16, wastePercent: 3 }, { ingredientId: "ing_spinach", qty: 0.2, wastePercent: 12 }] },
    { id: "recipe_fish_curry", menuItemId: "item_fish_curry", yieldPortions: 1, laborMinutes: 14, ingredients: [{ ingredientId: "ing_fish", qty: 0.24, wastePercent: 8 }, { ingredientId: "ing_spices", qty: 0.02, wastePercent: 0 }] },
    { id: "recipe_tandoori", menuItemId: "item_tandoori_chicken", yieldPortions: 1, laborMinutes: 18, ingredients: [{ ingredientId: "ing_chicken", qty: 0.45, wastePercent: 8 }, { ingredientId: "ing_yogurt", qty: 0.08, wastePercent: 3 }] },
    { id: "recipe_seekh", menuItemId: "item_seekh", yieldPortions: 1, laborMinutes: 14, ingredients: [{ ingredientId: "ing_mutton", qty: 0.22, wastePercent: 4 }, { ingredientId: "ing_spices", qty: 0.015, wastePercent: 0 }] },
    { id: "recipe_veg_biryani", menuItemId: "item_veg_biryani", yieldPortions: 1, laborMinutes: 16, ingredients: [{ ingredientId: "ing_rice", qty: 0.2, wastePercent: 3 }, { ingredientId: "ing_spices", qty: 0.01, wastePercent: 0 }] },
    { id: "recipe_chicken_biryani", menuItemId: "item_chicken_biryani", yieldPortions: 1, laborMinutes: 18, ingredients: [{ ingredientId: "ing_rice", qty: 0.22, wastePercent: 3 }, { ingredientId: "ing_chicken", qty: 0.2, wastePercent: 5 }] },
    { id: "recipe_naan", menuItemId: "item_naan", yieldPortions: 1, laborMinutes: 5, ingredients: [{ ingredientId: "ing_flour", qty: 0.08, wastePercent: 2 }, { ingredientId: "ing_butter", qty: 0.01, wastePercent: 1 }] },
    { id: "recipe_roti", menuItemId: "item_roti", yieldPortions: 1, laborMinutes: 4, ingredients: [{ ingredientId: "ing_flour", qty: 0.06, wastePercent: 2 }] },
    { id: "recipe_lassi", menuItemId: "item_lassi", yieldPortions: 1, laborMinutes: 3, ingredients: [{ ingredientId: "ing_yogurt", qty: 0.2, wastePercent: 1 }, { ingredientId: "ing_mango_pulp", qty: 0.08, wastePercent: 0 }] },
    { id: "recipe_masala_soda", menuItemId: "item_masala_soda", yieldPortions: 1, laborMinutes: 2, ingredients: [{ ingredientId: "ing_spices", qty: 0.005, wastePercent: 0 }] },
    { id: "recipe_coffee", menuItemId: "item_filter_coffee", yieldPortions: 1, laborMinutes: 4, ingredients: [{ ingredientId: "ing_cream", qty: 0.02, wastePercent: 1 }] },
    { id: "recipe_gulab", menuItemId: "item_gulab", yieldPortions: 1, laborMinutes: 3, ingredients: [{ ingredientId: "ing_flour", qty: 0.04, wastePercent: 2 }, { ingredientId: "ing_butter", qty: 0.015, wastePercent: 1 }] },
    { id: "recipe_kulfi", menuItemId: "item_kulfi", yieldPortions: 1, laborMinutes: 2, ingredients: [{ ingredientId: "ing_cream", qty: 0.08, wastePercent: 1 }, { ingredientId: "ing_mango_pulp", qty: 0.02, wastePercent: 0 }] }
  ];
}

export function seedStaff(): StaffMember[] {
  const date = todayStamp();
  const attendance = (status: AttendanceRecord["status"], inHour = 9, outHour?: number): AttendanceRecord[] => [
    {
      id: createId("att"),
      date,
      status,
      checkIn: status === "present" || status === "half_day" ? new Date(new Date().setHours(inHour, 5, 0, 0)).toISOString() : undefined,
      checkOut: outHour != null ? new Date(new Date().setHours(outHour, 0, 0, 0)).toISOString() : undefined
    }
  ];
  return [
    { id: "staff_owner_demo", branchId: "branch_main", name: "Arjun Mehta", username: "arjun", role: "owner", phone: "+91 98765 00001", hourlyRate: 0, active: true, joinDate: "2023-04-01", attendance: [] },
    { id: "staff_manager", branchId: "branch_main", name: "Priya Nair", username: "priya", role: "branch_manager", phone: "+91 98765 00002", pin: "2201", hourlyRate: 450, active: true, joinDate: "2023-06-12", attendance: attendance("present", 8) },
    { id: "staff_cashier", branchId: "branch_main", name: "Rohan Das", username: "rohan", role: "cashier", phone: "+91 98765 00003", pin: "1042", hourlyRate: 220, active: true, joinDate: "2024-01-08", attendance: attendance("present", 10) },
    { id: "staff_waiter", branchId: "branch_main", name: "Ananya Iyer", username: "ananya", role: "waiter", phone: "+91 98765 00004", pin: "2361", hourlyRate: 180, active: true, joinDate: "2024-03-20", attendance: attendance("present", 11) },
    { id: "staff_waiter_2", branchId: "branch_main", name: "Vikram Shah", username: "vikram", role: "waiter", phone: "+91 98765 00005", pin: "2362", hourlyRate: 180, active: true, joinDate: "2024-07-01", attendance: attendance("leave") },
    { id: "staff_chef", branchId: "branch_main", name: "Chef Kabir Khan", username: "kabir", role: "chef", phone: "+91 98765 00006", pin: "4418", hourlyRate: 380, active: true, joinDate: "2023-05-15", attendance: attendance("present", 8) },
    { id: "staff_kitchen", branchId: "branch_main", name: "Suresh Patel", username: "suresh", role: "kitchen", phone: "+91 98765 00007", pin: "4419", hourlyRate: 160, active: true, joinDate: "2024-02-11", attendance: attendance("present", 9) },
    { id: "staff_store", branchId: "branch_downtown", name: "Meera Joshi", username: "meera", role: "store_manager", phone: "+91 98765 00008", pin: "5501", hourlyRate: 300, active: true, joinDate: "2023-09-01", attendance: attendance("present", 9) },
    { id: "staff_ind_waiter", branchId: "branch_downtown", name: "Neha Kapoor", username: "neha", role: "waiter", phone: "+91 98765 00009", pin: "5502", hourlyRate: 180, active: true, joinDate: "2024-05-18", attendance: attendance("present", 12) },
    { id: "staff_accountant", branchId: "branch_main", name: "Rahul Sen", username: "rahul", role: "accountant", phone: "+91 98765 00010", pin: "6601", hourlyRate: 350, active: true, joinDate: "2023-11-02", attendance: attendance("present", 9, 18) },
    { id: "staff_procurement", branchId: "branch_main", name: "Fatima Ali", username: "fatima", role: "procurement", phone: "+91 98765 00011", pin: "7701", hourlyRate: 320, active: true, joinDate: "2024-01-22", attendance: attendance("half_day", 9, 13) },
    { id: "staff_air_mgr", branchId: "branch_airport", name: "Imran Qureshi", username: "imran", role: "branch_manager", phone: "+91 98765 00012", pin: "8801", hourlyRate: 420, active: true, joinDate: "2024-08-01", attendance: attendance("present", 7) }
  ];
}

export function seedCustomers(): Customer[] {
  return [
    { id: "cust_1", name: "Aditi Sharma", phone: "+91 98100 11101", email: "aditi@example.com", visits: 18, totalSpend: 24680, loyaltyPoints: 2468, birthday: "1994-05-12", tags: ["vip", "biryani"], lastVisitAt: hoursAgo(5), notes: "Prefers less spicy" },
    { id: "cust_2", name: "Karthik Reddy", phone: "+91 98100 11102", email: "karthik@example.com", visits: 9, totalSpend: 11240, loyaltyPoints: 1124, tags: ["regular"], lastVisitAt: hoursAgo(28) },
    { id: "cust_3", name: "Sneha Gupta", phone: "+91 98100 11103", visits: 4, totalSpend: 3890, loyaltyPoints: 389, tags: ["paneer"], lastVisitAt: hoursAgo(50) },
    { id: "cust_4", name: "Mohammed Irfan", phone: "+91 98100 11104", visits: 22, totalSpend: 31800, loyaltyPoints: 3180, tags: ["vip", "corporate"], lastVisitAt: hoursAgo(8), notes: "Corporate lunch account" },
    { id: "cust_5", name: "Laura Fernandes", phone: "+91 98100 11105", email: "laura@example.com", visits: 2, totalSpend: 1560, loyaltyPoints: 156, tags: ["new"], lastVisitAt: hoursAgo(72) },
    { id: "cust_6", name: "Dev Patel", phone: "+91 98100 11106", visits: 11, totalSpend: 8740, loyaltyPoints: 874, tags: ["delivery"], lastVisitAt: hoursAgo(12) },
    { id: "cust_7", name: "Ishita Rao", phone: "+91 98100 11107", visits: 6, totalSpend: 5210, loyaltyPoints: 521, birthday: "1998-11-03", tags: ["dessert"], lastVisitAt: hoursAgo(40) },
    { id: "cust_8", name: "Team Accel Labs", phone: "+91 98100 11108", email: "office@accellabs.example", visits: 14, totalSpend: 45200, loyaltyPoints: 4520, tags: ["corporate", "vip"], notes: "Friday team lunch" }
  ];
}

export function seedVendors(): Vendor[] {
  return [
    { id: "vendor_fresh", name: "Namma Fresh Farms", phone: "+91 80 2222 1001", email: "orders@nammafresh.example", products: ["ing_spinach", "ing_paneer", "ing_yogurt"], rating: 4.7, creditLimit: 150000, paymentTermsDays: 15 },
    { id: "vendor_poultry", name: "Deccan Poultry Co.", phone: "+91 80 2222 1002", email: "sales@deccanpoultry.example", products: ["ing_chicken", "ing_mutton"], rating: 4.5, creditLimit: 250000, paymentTermsDays: 21 },
    { id: "vendor_seafood", name: "Coastal Catch Seafood", phone: "+91 80 2222 1003", products: ["ing_fish"], rating: 4.4, creditLimit: 120000, paymentTermsDays: 7 },
    { id: "vendor_staples", name: "Bharat Staples Wholesale", phone: "+91 80 2222 1004", email: "po@bharatstaples.example", products: ["ing_rice", "ing_flour", "ing_dal", "ing_oil", "ing_spices"], rating: 4.8, creditLimit: 400000, paymentTermsDays: 30 },
    { id: "vendor_pack", name: "EcoPack India", phone: "+91 80 2222 1005", products: ["ing_pack_box"], rating: 4.2, creditLimit: 80000, paymentTermsDays: 15 }
  ];
}

export function seedReservations(): Reservation[] {
  return [
    { id: "res_1", branchId: "branch_main", tableId: "table_4", guestName: "Nikhil Menon", phone: "+91 98200 2001", partySize: 5, scheduledAt: daysFromNow(0.15), status: "booked", notes: "Anniversary — window seat" },
    { id: "res_2", branchId: "branch_main", tableId: "table_6", guestName: "Accel Labs", phone: "+91 98200 2002", partySize: 8, scheduledAt: daysFromNow(1), status: "booked", notes: "Corporate dinner" },
    { id: "res_3", branchId: "branch_downtown", guestName: "Pooja Krishnan", phone: "+91 98200 2003", partySize: 3, scheduledAt: daysFromNow(0.3), status: "booked" },
    { id: "res_4", branchId: "branch_main", guestName: "Samir Banerjee", phone: "+91 98200 2004", partySize: 2, scheduledAt: hoursAgo(2), status: "seated", tableId: "table_2" },
    { id: "res_5", branchId: "branch_downtown", guestName: "Rita D'Souza", phone: "+91 98200 2005", partySize: 4, scheduledAt: daysFromNow(-1), status: "completed" }
  ];
}

export function seedWaitlist(): WaitlistEntry[] {
  return [
    { id: "wait_1", branchId: "branch_main", guestName: "Aarav Jain", phone: "+91 98300 3001", partySize: 2, createdAt: hoursAgo(0.4), status: "waiting" },
    { id: "wait_2", branchId: "branch_main", guestName: "Family Thomas", phone: "+91 98300 3002", partySize: 6, createdAt: hoursAgo(0.7), status: "waiting" },
    { id: "wait_3", branchId: "branch_downtown", guestName: "Zoya Khan", phone: "+91 98300 3003", partySize: 3, createdAt: hoursAgo(0.2), status: "waiting" }
  ];
}

function line(menuItemId: string, name: string, price: number, qty: number, station: OrderItem["station"], extras: Partial<OrderItem> = {}): OrderItem {
  return {
    id: createId("line"),
    menuItemId,
    name,
    price,
    qty,
    station,
    ...extras
  };
}

export function seedOrders(): Order[] {
  const taxRate = 0.05;
  const cooked = (menuItemId: string, name: string, price: number, qty: number, station: OrderItem["station"], sentHours: number, prepMinutes: number) =>
    line(menuItemId, name, price, qty, station, {
      kotSentAt: hoursAgo(sentHours),
      preparedAt: hoursAgo(Math.max(0.05, sentHours - prepMinutes / 60))
    });

  const paid = (
    id: string,
    branchId: string,
    orderNumber: string,
    hours: number,
    items: OrderItem[],
    opts: Partial<Order> & { paymentMethod?: Order["payments"][number]["method"] } = {}
  ): Order => {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
    const discount = opts.discount ?? 0;
    const taxable = Math.max(0, subtotal - discount);
    const createdAt = hoursAgo(hours);
    const { paymentMethod, ...orderOpts } = opts;
    return {
      id,
      branchId,
      orderNumber,
      type: orderOpts.type ?? "dine_in",
      tableId: orderOpts.tableId,
      tableLabel: orderOpts.tableLabel,
      customerId: orderOpts.customerId,
      waiterId: orderOpts.waiterId ?? "staff_waiter",
      items,
      status: "paid",
      createdAt,
      updatedAt: hoursAgo(Math.max(0, hours - 0.5)),
      createdBy: orderOpts.createdBy ?? "rohan",
      discount,
      discountReason: orderOpts.discountReason,
      taxRate,
      tip: orderOpts.tip ?? 0,
      gstAmount: taxable * 0.05,
      serviceCharge: taxable * 0.05,
      payments: [
        {
          id: createId("pay"),
          method: paymentMethod ?? "upi",
          amount: taxable * 1.1 + (orderOpts.tip ?? 0),
          paidAt: hoursAgo(Math.max(0, hours - 0.5))
        }
      ],
      kotPriority: "normal"
    };
  };

  const open1Items = [
    line("item_butter_chicken", "Butter Chicken", 420, 1, "general", { kotSentAt: hoursAgo(0.35), priority: "normal" }),
    line("item_naan", "Butter Naan", 70, 3, "grill", { kotSentAt: hoursAgo(0.35) }),
    line("item_lassi", "Mango Lassi", 120, 2, "bar", { kotSentAt: hoursAgo(0.3), preparedAt: hoursAgo(0.15) })
  ];
  const open2Items = [
    line("item_chicken_biryani", "Hyderabadi Chicken Biryani", 360, 2, "general", { kotSentAt: hoursAgo(0.5), preparedAt: hoursAgo(0.15), priority: "rush" }),
    line("item_gulab", "Gulab Jamun (2 pc)", 110, 2, "dessert", { kotSentAt: hoursAgo(0.2) })
  ];
  const open3Items = [
    line("item_paneer_tikka", "Paneer Tikka", 280, 1, "grill", { kotSentAt: hoursAgo(0.25) }),
    line("item_dal_makhani", "Dal Makhani", 290, 1, "general", { kotSentAt: hoursAgo(0.25) }),
    line("item_roti", "Tandoori Roti", 45, 4, "grill", { kotSentAt: hoursAgo(0.25) })
  ];

  return [
    {
      id: "ord_demo_open_1",
      branchId: "branch_main",
      orderNumber: "BLR-KOR-01041",
      tableId: "table_2",
      tableLabel: "K2",
      customerId: "cust_1",
      waiterId: "staff_waiter",
      type: "dine_in",
      items: open1Items,
      status: "preparing",
      createdAt: hoursAgo(0.4),
      updatedAt: hoursAgo(0.2),
      createdBy: "ananya",
      discount: 0,
      taxRate,
      tip: 0,
      gstAmount: 0,
      serviceCharge: 0,
      payments: [],
      kotPriority: "normal"
    },
    {
      id: "ord_demo_open_2",
      branchId: "branch_main",
      orderNumber: "BLR-KOR-01042",
      tableId: "table_5",
      tableLabel: "K5",
      customerId: "cust_4",
      waiterId: "staff_waiter",
      type: "dine_in",
      items: open2Items,
      status: "ready",
      createdAt: hoursAgo(0.55),
      updatedAt: hoursAgo(0.1),
      createdBy: "ananya",
      discount: 50,
      discountReason: "Loyalty 50 off",
      taxRate,
      tip: 0,
      payments: [],
      kotPriority: "rush"
    },
    {
      id: "ord_demo_open_3",
      branchId: "branch_downtown",
      orderNumber: "BLR-IND-00418",
      tableId: "table_9",
      tableLabel: "I2",
      customerId: "cust_2",
      waiterId: "staff_ind_waiter",
      type: "dine_in",
      items: open3Items,
      status: "preparing",
      createdAt: hoursAgo(0.3),
      updatedAt: hoursAgo(0.15),
      createdBy: "neha",
      discount: 0,
      taxRate,
      tip: 0,
      payments: [],
      kotPriority: "vip"
    },
    // Koramangala paid today
    paid("ord_paid_1", "branch_main", "BLR-KOR-01030", 3, [
      cooked("item_chicken_biryani", "Hyderabadi Chicken Biryani", 360, 2, "general", 3.2, 18),
      cooked("item_masala_soda", "Masala Soda", 90, 2, "bar", 3.1, 3)
    ], { tableId: "table_3", tableLabel: "K3", customerId: "cust_6", tip: 40, paymentMethod: "upi" }),
    paid("ord_paid_2", "branch_main", "BLR-KOR-01031", 5, [
      cooked("item_butter_chicken", "Butter Chicken", 420, 1, "general", 5.2, 16),
      cooked("item_naan", "Butter Naan", 70, 4, "grill", 5.1, 6),
      cooked("item_kulfi", "Malai Kulfi", 130, 2, "dessert", 5.0, 3)
    ], { tableId: "table_6", tableLabel: "K6", customerId: "cust_8", discount: 100, discountReason: "Corporate discount", paymentMethod: "card" }),
    paid("ord_paid_3", "branch_main", "BLR-KOR-01032", 7, [
      cooked("item_veg_biryani", "Veg Dum Biryani", 280, 1, "general", 7.2, 18),
      cooked("item_filter_coffee", "Filter Coffee", 80, 1, "bar", 7.1, 4)
    ], { type: "takeaway", customerId: "cust_5", paymentMethod: "cash" }),
    paid("ord_paid_7", "branch_main", "BLR-KOR-01033", 1.2, [
      cooked("item_paneer_tikka", "Paneer Tikka", 280, 2, "grill", 1.4, 12),
      cooked("item_dal_makhani", "Dal Makhani", 290, 1, "general", 1.3, 8),
      cooked("item_naan", "Butter Naan", 70, 2, "grill", 1.25, 6)
    ], { tableId: "table_1", tableLabel: "K1", customerId: "cust_1", tip: 60, paymentMethod: "upi" }),
    // Indiranagar paid today — keep this branch dashboard non-zero
    paid("ord_paid_4", "branch_downtown", "BLR-IND-00410", 2, [
      cooked("item_tandoori_chicken", "Tandoori Chicken Half", 380, 1, "grill", 2.3, 20),
      cooked("item_lassi", "Mango Lassi", 120, 2, "bar", 2.2, 4)
    ], { tableId: "table_10", tableLabel: "I3", customerId: "cust_3", paymentMethod: "upi", waiterId: "staff_ind_waiter", tip: 50 }),
    paid("ord_paid_5", "branch_downtown", "BLR-IND-00411", 4, [
      cooked("item_palak_paneer", "Palak Paneer", 310, 1, "general", 4.3, 14),
      cooked("item_roti", "Tandoori Roti", 45, 3, "grill", 4.2, 5),
      cooked("item_gulab", "Gulab Jamun (2 pc)", 110, 1, "dessert", 4.1, 3)
    ], { type: "delivery", customerId: "cust_7", paymentMethod: "wallet", waiterId: "staff_ind_waiter" }),
    paid("ord_paid_9", "branch_downtown", "BLR-IND-00412", 1, [
      cooked("item_chicken_biryani", "Hyderabadi Chicken Biryani", 360, 2, "general", 1.3, 20),
      cooked("item_masala_soda", "Masala Soda", 90, 2, "bar", 1.2, 3)
    ], { tableId: "table_8", tableLabel: "I1", customerId: "cust_2", paymentMethod: "card", waiterId: "staff_ind_waiter", tip: 80 }),
    paid("ord_paid_10", "branch_downtown", "BLR-IND-00413", 5.5, [
      cooked("item_butter_chicken", "Butter Chicken", 420, 2, "general", 5.7, 16),
      cooked("item_naan", "Butter Naan", 70, 4, "grill", 5.6, 6),
      cooked("item_filter_coffee", "Filter Coffee", 80, 2, "bar", 5.5, 4)
    ], { customerId: "cust_8", paymentMethod: "upi", waiterId: "staff_ind_waiter", discount: 80, discountReason: "Lunch combo" }),
    paid("ord_paid_11", "branch_downtown", "BLR-IND-00414", 0.8, [
      cooked("item_paneer_tikka", "Paneer Tikka", 280, 1, "grill", 1.0, 11),
      cooked("item_dal_makhani", "Dal Makhani", 290, 1, "general", 0.95, 7),
      cooked("item_lassi", "Mango Lassi", 120, 1, "bar", 0.9, 4)
    ], { type: "takeaway", customerId: "cust_6", paymentMethod: "cash", waiterId: "staff_ind_waiter" }),
    // Airport paid today
    paid("ord_paid_6", "branch_airport", "BLR-AIR-00102", 2, [
      cooked("item_chicken_biryani", "Hyderabadi Chicken Biryani", 360, 1, "general", 2.2, 18),
      cooked("item_masala_soda", "Masala Soda", 90, 1, "bar", 2.1, 3)
    ], { type: "takeaway", customerId: "cust_5", paymentMethod: "card", createdBy: "imran" }),
    paid("ord_paid_12", "branch_airport", "BLR-AIR-00103", 3.5, [
      cooked("item_veg_biryani", "Veg Dum Biryani", 280, 2, "general", 3.7, 18),
      cooked("item_filter_coffee", "Filter Coffee", 80, 2, "bar", 3.6, 4)
    ], { type: "takeaway", customerId: "cust_1", paymentMethod: "upi", createdBy: "imran", tip: 30 }),
    paid("ord_paid_13", "branch_airport", "BLR-AIR-00104", 1.5, [
      cooked("item_butter_chicken", "Butter Chicken", 420, 1, "general", 1.7, 15),
      cooked("item_naan", "Butter Naan", 70, 2, "grill", 1.6, 6)
    ], { type: "takeaway", customerId: "cust_4", paymentMethod: "card", createdBy: "imran" }),
    // Older Koramangala ticket (still today-ish morning / yesterday edge)
    paid("ord_paid_8", "branch_main", "BLR-KOR-01020", 9, [
      cooked("item_seekh", "Mutton Seekh Kebab", 410, 2, "grill", 9.3, 14),
      cooked("item_fish_curry", "Mangalorean Fish Curry", 450, 1, "general", 9.2, 15)
    ], { customerId: "cust_4", paymentMethod: "card" })
  ];
}

export function seedMovements(): StockMovement[] {
  return [
    { id: "mov_1", branchId: "branch_main", ingredientId: "ing_chicken", type: "purchase", qty: 20, note: "PO receive — Deccan Poultry", createdAt: hoursAgo(30), createdBy: "fatima", refId: "po_1" },
    { id: "mov_2", branchId: "branch_main", ingredientId: "ing_cream", type: "wastage", qty: -0.4, note: "Sour cream discarded", createdAt: hoursAgo(6), createdBy: "kabir" },
    { id: "mov_3", branchId: "branch_main", ingredientId: "ing_spinach", type: "wastage", qty: -0.6, note: "Wilting greens", createdAt: hoursAgo(4), createdBy: "suresh" },
    { id: "mov_4", branchId: "branch_main", ingredientId: "ing_paneer", type: "sale_deduct", qty: -0.36, note: "Ticket BLR-KOR-01033", createdAt: hoursAgo(1.2), createdBy: "system", refId: "ord_paid_7" },
    { id: "mov_5", branchId: "branch_downtown", ingredientId: "ing_dt_cream", type: "wastage", qty: -0.35, note: "Curdled cream — Indiranagar", createdAt: hoursAgo(3), createdBy: "meera" },
    { id: "mov_8", branchId: "branch_downtown", ingredientId: "ing_dt_paneer", type: "wastage", qty: -0.5, note: "Trim / spoilage", createdAt: hoursAgo(5), createdBy: "meera" },
    { id: "mov_9", branchId: "branch_airport", ingredientId: "ing_air_chicken", type: "wastage", qty: -0.8, note: "Holding time discard", createdAt: hoursAgo(2), createdBy: "imran" },
    { id: "mov_6", branchId: "branch_main", ingredientId: "ing_pack_box", type: "transfer_out", qty: -40, note: "Transfer to Airport", createdAt: hoursAgo(20), createdBy: "fatima", refId: "tr_1" },
    { id: "mov_7", branchId: "branch_airport", ingredientId: "ing_air_boxes", type: "transfer_in", qty: 40, note: "Received from Koramangala", createdAt: hoursAgo(19), createdBy: "imran", refId: "tr_1" }
  ];
}

export function seedPurchaseOrders(): PurchaseOrder[] {
  return [
    {
      id: "po_1",
      branchId: "branch_main",
      vendorId: "vendor_poultry",
      status: "received",
      items: [
        { ingredientId: "ing_chicken", qty: 20, unitCost: 210 },
        { ingredientId: "ing_mutton", qty: 8, unitCost: 520 }
      ],
      createdAt: hoursAgo(36),
      expectedAt: hoursAgo(30),
      receivedAt: hoursAgo(30)
    },
    {
      id: "po_2",
      branchId: "branch_main",
      vendorId: "vendor_staples",
      status: "sent",
      items: [
        { ingredientId: "ing_rice", qty: 40, unitCost: 108 },
        { ingredientId: "ing_oil", qty: 15, unitCost: 138 },
        { ingredientId: "ing_dal", qty: 10, unitCost: 95 }
      ],
      createdAt: hoursAgo(8),
      expectedAt: daysFromNow(1)
    },
    {
      id: "po_3",
      branchId: "branch_downtown",
      vendorId: "vendor_fresh",
      status: "draft",
      items: [
        { ingredientId: "ing_dt_paneer", qty: 8, unitCost: 315 },
        { ingredientId: "ing_dt_cream", qty: 4, unitCost: 220 }
      ],
      createdAt: hoursAgo(2)
    }
  ];
}

export function seedTransfers(): Transfer[] {
  return [
    { id: "tr_1", fromBranchId: "branch_main", toBranchId: "branch_airport", ingredientId: "ing_pack_box", qty: 40, status: "completed", createdAt: hoursAgo(20) },
    { id: "tr_2", fromBranchId: "branch_main", toBranchId: "branch_downtown", ingredientId: "ing_spices", qty: 1, status: "pending", createdAt: hoursAgo(3) }
  ];
}

export function seedLedger(): LedgerEntry[] {
  return [
    { id: "led_1", branchId: "branch_main", type: "sale", category: "POS sales", amount: 990, note: "BLR-KOR-01030", refId: "ord_paid_1", createdAt: hoursAgo(3), createdBy: "rohan" },
    { id: "led_2", branchId: "branch_main", type: "sale", category: "POS sales", amount: 1188, note: "BLR-KOR-01031", refId: "ord_paid_2", createdAt: hoursAgo(5), createdBy: "rohan" },
    { id: "led_3", branchId: "branch_main", type: "sale", category: "POS sales", amount: 396, note: "BLR-KOR-01032", refId: "ord_paid_3", createdAt: hoursAgo(7), createdBy: "rohan" },
    { id: "led_4", branchId: "branch_downtown", type: "sale", category: "POS sales", amount: 682, note: "BLR-IND-00410", refId: "ord_paid_4", createdAt: hoursAgo(4), createdBy: "neha" },
    { id: "led_5", branchId: "branch_main", type: "purchase", category: "Vendor payment", amount: -8360, note: "Deccan Poultry PO", refId: "po_1", createdAt: hoursAgo(30), createdBy: "fatima" },
    { id: "led_6", branchId: "branch_main", type: "expense", category: "Utilities", amount: -4200, note: "Electricity — July estimate", createdAt: hoursAgo(10), createdBy: "rahul" },
    { id: "led_7", branchId: "branch_main", type: "expense", category: "Marketing", amount: -2500, note: "Instagram boost — weekend", createdAt: hoursAgo(15), createdBy: "priya" },
    { id: "led_8", branchId: "branch_airport", type: "sale", category: "POS sales", amount: 495, note: "BLR-AIR-00102", refId: "ord_paid_6", createdAt: hoursAgo(2), createdBy: "imran" },
    { id: "led_9", branchId: "branch_main", type: "payroll", category: "Staff advances", amount: -3000, note: "Weekly advance — waiters", createdAt: hoursAgo(22), createdBy: "rahul" }
  ];
}

export function seedExpenses(): Expense[] {
  return [
    { id: "exp_1", branchId: "branch_main", category: "Utilities", amount: 4200, note: "Electricity — July estimate", createdAt: hoursAgo(10) },
    { id: "exp_2", branchId: "branch_main", category: "Marketing", amount: 2500, note: "Instagram boost — weekend", createdAt: hoursAgo(15) },
    { id: "exp_3", branchId: "branch_downtown", category: "Maintenance", amount: 1800, note: "AC service", createdAt: hoursAgo(4) },
    { id: "exp_6", branchId: "branch_downtown", category: "Packaging", amount: 740, note: "Delivery bags top-up", createdAt: hoursAgo(2) },
    { id: "exp_4", branchId: "branch_airport", category: "Licenses", amount: 5500, note: "Airport concession fee installment", createdAt: hoursAgo(6) },
    { id: "exp_5", branchId: "branch_main", category: "Packaging", amount: 960, note: "EcoPack interim buy", createdAt: hoursAgo(18) },
    { id: "exp_7", branchId: "branch_airport", category: "Utilities", amount: 2100, note: "Cold storage power share", createdAt: hoursAgo(3) }
  ];
}

export function seedFeedback(): Feedback[] {
  return [
    { id: "fb_1", customerId: "cust_1", orderId: "ord_paid_7", rating: 5, comment: "Butter chicken was excellent. Service quick.", createdAt: hoursAgo(1), status: "resolved" },
    { id: "fb_2", customerId: "cust_3", orderId: "ord_paid_4", rating: 4, comment: "Loved the tandoori. Lassi a bit too sweet.", createdAt: hoursAgo(4), status: "open" },
    { id: "fb_3", customerId: "cust_5", orderId: "ord_paid_3", rating: 3, comment: "Takeaway packaging leaked slightly.", createdAt: hoursAgo(7), status: "open" },
    { id: "fb_4", customerId: "cust_8", orderId: "ord_paid_2", rating: 5, comment: "Great for corporate lunch. Please keep the discount.", createdAt: hoursAgo(5), status: "resolved" },
    { id: "fb_5", customerId: "cust_2", rating: 2, comment: "Waited 25 mins for a table on Saturday.", createdAt: hoursAgo(48), status: "open" }
  ];
}

export function getDemoInstall() {
  return {
    language: "en" as const,
    businessType: "restaurant" as const,
    restaurantName: DEMO.restaurantName,
    username: DEMO.username,
    password: DEMO.password,
    provider: "local" as const,
    installedAt: new Date().toISOString()
  };
}
