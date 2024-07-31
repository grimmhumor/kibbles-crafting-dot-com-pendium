import {InventoryItem} from "./InventoryItem";

export interface RecipeItem {
    index: number;
    school: string;
    checks: number;
    dc: number;
    notes: string;
    materials: InventoryItem[];
    modifiable: string;
}

export interface CraftingItem {
    id: number;
    name: string;
    rarity: string;
    priceCp: number;
    usedFor: string;
    recipes: RecipeItem[];
    school: string;
    type: string;
    source: string;
}