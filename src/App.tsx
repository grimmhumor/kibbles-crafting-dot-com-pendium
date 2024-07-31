import * as React from 'react';
import Dashboard from "./dashboard/Dashboard";
import {InventoryItem} from "./data/data-classes/InventoryItem";
import {useEffect} from "react";
import {importItemData, itemData} from "./data/DataLoader";
import {CraftingItem, RecipeItem} from "./data/data-classes/CraftingItem";
import {CookiesProvider, useCookies} from "react-cookie";
import {cookifyInventory, cookifyProjWishlist, parseInventory, parseProjWishList} from "./data/Cookies";
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';


// This is a janky spagetti project that only works when a single developer knows how to chrochet spagetti, never used React before either sooooo..... glhf
export default function App() {
  const [cookies, setCookie] = useCookies(["inv", "wish", "proj"]);

  const [loading, setLoading] = React.useState(true);
  const [inventoryData, setInventoryData] = React.useState<Map<string,InventoryItem>>(new Map<string,InventoryItem>());

  const [wishlistData, setWishlistData] = React.useState<CraftingItem[]>([]);
  const [projectData, setProjectData] = React.useState<CraftingItem[]>([]);
  const [craftable, setCraftable] = React.useState<Map<number, RecipeItem[]>>(new Map<number, RecipeItem[]>());
  const [val, updateState] = React.useState<number>(0);
  const forceUpdate = React.useCallback(() => updateState(val+1), [inventoryData]);


  function toastAlert(message: string) {
    toast(message)
  }
  function initializeCraftableValues(): Map<number, RecipeItem[]> {
    let crafting = new Map<number, RecipeItem[]>(craftable);
    itemData.itemList.forEach((item) => {
      if (item.recipes)
        item.recipes.forEach((recipe) => {
          let canCraft = true;
          let arr = crafting.get(item.id);
          if (!arr || arr.indexOf(recipe) == -1) {
            recipe.materials.forEach(material => {
              const inv = inventoryData.get(material.name.toLowerCase())
              const invQuantity = inv ? inv.quantity : 0;
              if (invQuantity < material.quantity) {
                canCraft = false;
              }
            })
            if (canCraft) {
              if (arr) {
                arr.push(recipe)
                crafting.set(item.id, arr)
              } else {
                crafting.set(item.id, [recipe])
              }
            }
          }
      });

    })

    return crafting;
  }

  // removing item from inventory, iterate through existing craftable
  function updateCraftableOnRemove() {
    let crafting = new Map<number, RecipeItem[]>(craftable);
    let changed = false;

    crafting.forEach((value: RecipeItem[], key: number) => {
      value.forEach((recipe) => {
        let canCraft = true;
        recipe.materials.forEach(material => {
          const inv = inventoryData.get(material.name.toLowerCase())
          const invQuantity = inv? inv.quantity: 0;
          if ( invQuantity < material.quantity) {
            canCraft = false;
          }
        })
        if (!canCraft) {
          crafting.delete(key);
          changed = true;
        }
      })
    });

    if (changed) {
      setCraftable(crafting);
    }
  }


  function addToInventory(items: InventoryItem[], removeProject=false, increment = false) {
    if (!!items && items.length>0) {
      let newInventory = new Map(inventoryData);
      items.forEach( (item) => {
        if(item.id == -1) {
          return;
        }
        let name = itemData.itemList[item.id].name;
        let invItem = newInventory.get(name.toLowerCase());
        if (!!invItem) {
          invItem.quantity+=item.quantity;
        } else {
          newInventory.set(name.toLowerCase(), {name: name, id: item.id, quantity: item.quantity});
        }
      });
      setCookie("inv", cookifyInventory(newInventory), {path: "/"});
      setInventoryData(newInventory)

      if (removeProject) {
        removeFromProjects(itemData.itemList[items[0].id])
        toastAlert("Project completed and added to inventory.")
      } else if (!increment) {
        toastAlert("Added to inventory")
      }
    }
    forceUpdate();
  }
  function removeFromInventory(items: InventoryItem[], all=false) {
    if (!!items && items.length>0) {
      let newInventory = new Map(inventoryData);
      items.forEach((item) => {
        if(item.id == -1) {
          return;
        }
        let name = item.name? item.name: itemData.itemList[item.id].name;
        let invItem = newInventory.get(name.toLowerCase());
        if (invItem) {
          invItem.quantity -= item.quantity;
          if (invItem.quantity <= 0 || all) {
            newInventory.delete(name.toLowerCase());
          }
        }
      });
      setCookie("inv", cookifyInventory(newInventory), {path: "/"});
      setInventoryData(newInventory);
      updateCraftableOnRemove();
      forceUpdate();
    }
  }

  function addToWishlist(item: CraftingItem) {
    let wishlist = wishlistData;
    wishlist.push(item);
    setCookie("wish", cookifyProjWishlist(wishlist), {path: "/"});
    setWishlistData(wishlist);
    forceUpdate();
    toastAlert("Added to wishlist")
  }

  function removeFromWishlist(item: CraftingItem) {
    let wishlist = wishlistData;
    const index = wishlist.indexOf(item)
    if (index != -1) {
      wishlist.splice(index, 1);
      setCookie("wish", cookifyProjWishlist(wishlist), {path: "/"});
      setWishlistData(wishlist);
    }
    forceUpdate();
  }
  function addToProjects(item: CraftingItem, recipeIndex: number, useInventory: boolean) {
    let projects = projectData;
    projects.push(item);
    setCookie("proj", cookifyProjWishlist(projects), {path: "/"});
    setProjectData(projects);
    console.log(item);
    console.log(recipeIndex);
    if(useInventory) {
      removeFromInventory(item.recipes[recipeIndex].materials);
    }
    forceUpdate();
    toastAlert("Project started and ingredients allocated.")
  }

  function removeFromProjects(item: CraftingItem, refund=false, recipeId=0) {
    let projects = projectData;
    const index = projects.indexOf(item)
    if (index != -1) {
      projects.splice(index, 1);
      setCookie("proj", cookifyProjWishlist(projects), {path: "/"});
      setProjectData(projects);

      if (refund)
        addToInventory(item.recipes[recipeId].materials)
    }
    forceUpdate();
  }

  async function loadData() {
    await importItemData()
    .then(() => {

      setInventoryData(parseInventory(cookies.inv));
      setWishlistData(parseProjWishList(cookies.wish));
      setProjectData(parseProjWishList(cookies.proj));

      setLoading(false);

    });
  }
  useEffect(() => {
    if(loading)
      loadData();
    setCraftable(initializeCraftableValues());
  }, [inventoryData]);

  if(loading) {
    return <div>Loading data...</div>;
  }
  if (itemData.itemList.length == 0) {
    setLoading(true);
  }

  return (
      <div>
        <ToastContainer />
    <Dashboard inventory={{addToInventory: addToInventory, removeFromInventory: removeFromInventory}}
               inventoryData={inventoryData}
               craftable={craftable}
               wishlistData={wishlistData}
               projectData={projectData}
               projects={{addToWishlist: addToWishlist,
                 addToProjects: addToProjects, removeFromProjects: removeFromProjects, removeFromWishlist: removeFromWishlist}}
              forceUpdate={forceUpdate}/>

    </div>
  );
}
