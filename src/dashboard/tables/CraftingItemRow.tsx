import * as React from 'react';
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import IconButton from "@mui/material/IconButton";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import {Button, Collapse} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import CloseIcon from "@mui/icons-material/Close";
import RecipeItemRow from "./RecipeItemRow";
import Box from "@mui/material/Box";
import {RecipeItem} from "../../data/data-classes/CraftingItem";
import {itemData} from "../../data/DataLoader";
import RecipeModal from "../Modals/RecipeModal";

function formatPrice(priceCp: number): String {
        if (priceCp == null || priceCp == 0) {
            return ""
        }

        if(priceCp < 10) {
                return  priceCp.toString() + " cp";
        }
        if(priceCp < 100) {
                return (priceCp/10).toString() + " sp";
        }

        return (priceCp/100).toString() + " gp";

}
export default function CraftingItemRow({row, index, inventory, inventoryData, craftable, projects, viewState, forceUpdate} : {row: any, index: any, inventory: any, inventoryData: any, craftable: any, projects: any, viewState: any, forceUpdate: any}) {
    const [open, setOpen] = React.useState(false);
    const labelId = `enhanced-table-checkbox-${index}`;

    function addToInventory(event: any) {
        let value = event.target.value;
        if (value) {
            inventory.addToInventory([{id: Number(value), quantity: 1, name: ""}])
        } else {
            alert("This is coded poorly, wait a bit before clicking please.")
        }
    }

    function completeProject(event: any) {
        let value = event.target.value;
        if (value) {
            inventory.addToInventory([{id: Number(value), quantity: 1}], true)
        } else {
            alert("This is coded poorly, wait a bit before clicking please.")
        }
    }

    function removeWishlist(event: any) {

        let value: number = event.target.value;
        if (value) {

            projects.removeFromWishlist(itemData.itemList[value]);
            forceUpdate();
        } else {
            alert("This is coded poorly, wait a bit before clicking please.")
        }
    }

    let recipes = itemData.itemList[row.id].recipes;
    if (!recipes)
        recipes = [];
    let addToInventoryEnabled = !(viewState == "items" || viewState == "projects");
    let isProjects = viewState == "projects";
    let isWishlist = viewState == "wishlist";
    return(
            <React.Fragment>
                        <TableRow sx={{ '& > *': { borderBottom: 'unset' }}} hover={true}>
                                <TableCell>
                                    <RecipeModal recipes={recipes} parentId={row.id} inventory={inventory} inventoryData={inventoryData} craftable={craftable} projects={projects} viewState={viewState} forceUpdate={forceUpdate} index={index}
                                                 />
                                </TableCell>
                            <TableCell
                                component="th"
                                id={labelId}
                                scope="row"
                                padding="none"
                                style={!isProjects && craftable.get(row.id) ? {color: 'green', fontWeight: 'bold'} : {}}
                            >
                                {row.name}<sup>{row.source}</sup>
                            </TableCell>
                            <TableCell align="left">{row.rarity}</TableCell>
                                <TableCell align="left">
                                    <div style={{overflow: 'hidden',
                                        textOverflow: "ellipsis"}}>
                                        {row.usedFor}
                                    </div></TableCell>
                                <TableCell align="right">{formatPrice(row.priceCp)}</TableCell>
                                <TableCell align="right" >
                                    <Button value={row.id} onClick={addToInventory}
                                            style={isProjects || isWishlist ? { display: 'none' } : {}}
                                    >Add to&nbsp;<DashboardIcon pointerEvents="none"/>
                                    </Button>
                                    <Button value={row.id} onClick={completeProject}
                                            style={!isProjects ? { display: 'none' } : {}}
                                    >Complete Project
                                    </Button>
                                    <Button value={row.id} onClick={removeWishlist}
                                            style={!isWishlist ? { display: 'none' } : {}}
                                    >Delete &nbsp;<CloseIcon pointerEvents="none"/>
                                    </Button>
                                </TableCell>
                                </TableRow>

                </React.Fragment>
    )
}