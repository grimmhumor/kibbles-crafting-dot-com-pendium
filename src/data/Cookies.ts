import * as React from 'react';
import { CookiesProvider } from 'react-cookie';
import {InventoryItem } from './data-classes/InventoryItem'
import {CraftingItem} from "./data-classes/CraftingItem";
import {itemData} from "./DataLoader";

export function cookifyInventory(inventory: Map<string, InventoryItem>): number[][] {
    let invData: number[][] = [];

    if(inventory) {

        inventory.forEach((item) => {
            invData.push([item.id, item.quantity]);
        })
    }

    return invData
}

export function parseInventory(invData: number[][]): Map<string, InventoryItem> {
    let inventory = new Map<string, InventoryItem>()

    if (invData) {
        invData.forEach((inv) => {
            let item = itemData.itemList[inv[0]];

            inventory.set(item.name.toLowerCase(), {name: item.name, id: item.id, quantity: inv[1]})
        })
    }

    return inventory;
}

export function cookifyProjWishlist(craftingList: CraftingItem[]): number[] {
    let data: number[] = [];

    if (craftingList) {
        craftingList.forEach((item) => {
            data.push(item.id);
        })
    }

    return data
}

export function parseProjWishList(data: number[]): CraftingItem[] {
    let craftingList: CraftingItem[] = [];

    if(data) {
        data.forEach((da) => {
            let item = itemData.itemList[da];

            craftingList.push(item);
        });
    }
    return craftingList;
}

