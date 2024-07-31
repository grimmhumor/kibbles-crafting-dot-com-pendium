import * as React from "react";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import {Button} from "@mui/material";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import {InventoryItem} from "../../data/data-classes/InventoryItem";
import {RecipeItem} from "../../data/data-classes/CraftingItem";
import {itemData} from "../../data/DataLoader";
import Divider from "@mui/material/Divider";


export default function RecipeItemRow({recipe, parentId, inventory, inventoryData, craftable, projects, viewState, forceUpdate} : {recipe: any, parentId:any, inventory: any, inventoryData: any, craftable: any, projects : any, viewState: any, forceUpdate: any}) {
    const [dropdown, setDropdown] = React.useState(-1);

    let recipeItem = recipe.recipe;
    let recipes = craftable.get(parentId);
    let canCraft = false;
    if (!!recipes) {
        recipes.forEach((rec: RecipeItem) => {
            if(rec.index == recipeItem.index) {
                canCraft = true;
            }
        })
    }

    let isProjects = viewState == "projects";
    let isWishlist = viewState == "wishlist";


    function startProject(event: any) {
        let value: string = event.target.value;
        if (value) {
            let parseIds: string[] = value.split(",");

            let parentId = Number(parseIds[0])
            let recipeId = Number(parseIds[1])

            projects.addToProjects(itemData.itemList[parentId], recipeId, true);

            if (viewState=="wishlist") {
                projects.removeFromWishlist(itemData.itemList[parentId]);
            }
        } else {
            alert("This is coded poorly, wait a bit before clicking please.")
        }
    }

    function refundProject(event: any) {
        let value: string = event.target.value;
        if (value) {
            let parseIds: string[] = value.split(",");

            let parentId = Number(parseIds[0])

            //FIXME: Inclulde recipeID for project data
            projects.removeFromProjects(itemData.itemList[parentId], true)
        } else {
            alert("This is coded poorly, wait a bit before clicking please.")
        }
    }

    function deleteProject(event: any) {
        let value: string = event.target.value;
        if (value) {

            //FIXME: Inclulde recipeID for project data
            projects.removeFromProjects(itemData.itemList[parentId])
            forceUpdate();
        } else {
            alert("This is coded poorly, wait a bit before clicking please.")
        }
    }

    function addToWishlist(event: any) {
        let value: number = event.target.value;
        if (value) {

            projects.addToWishlist(itemData.itemList[value]);
            forceUpdate();
        } else {
            alert("This is coded poorly, wait a bit before clicking please.")
        }
    }

    let parseId = parentId+","+recipeItem.index;

    return(
        <React.Fragment>
            <Divider />
            <Grid container spacing={3}>
                <Grid item sm={4}>
                    <Typography variant="h6">
                        {recipeItem.school}
                    </Typography>
                </Grid>
                <Grid item sm={4}>
                    <Button disabled={!canCraft} value={parseId} onClick={startProject}
                            style={isProjects ? { display: 'none' } : {}}
                    >Start Project</Button>
                    <Button value={parseId} onClick={refundProject}
                            style={!isProjects ? { display: 'none' } : {}}
                    >Refund Project</Button>
                </Grid>
                <Grid item sm={4}>
                    <Button value={parentId} onClick={addToWishlist}
                            style={isWishlist || isProjects ? { display: 'none' } : {}}>Add to Wishlist</Button>
                    <Button value={parentId} onClick={deleteProject}
                            style={!isProjects ? { display: 'none' } : {}}>Delete Project</Button>
                </Grid>
            </Grid>
            <Typography variant="body1" sx={{fontStyle: 'italic'}}>
                <span style={recipeItem.notes ? {} : {display: 'none'}}>
                    Recipe Notes:&nbsp;
                </span>
                {recipeItem.notes}
            </Typography>
            <Grid container spacing={2}>
                <Grid item sm={6}>
                    <Table size="small" aria-label="recipe">
                    <TableHead>
                            <TableRow>
                                <TableCell align="right">Time</TableCell>
                                <TableCell align="right">Checks</TableCell>
                                <TableCell align="right">DC</TableCell>

                            </TableRow>
                        </TableHead>
                        <TableBody>
                            <TableRow>
                                <TableCell align="right">{recipeItem.checks * 2} Hours</TableCell>
                                <TableCell align="right">{recipeItem.checks}</TableCell>
                                <TableCell align="right">{recipeItem.dc}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </Grid>
                <Grid item sm={6}>
                    <Table size="small" aria-label="recipe">
                        <TableHead>
                            <TableRow>
                                <TableCell align="right" style={isProjects ? { display: 'none' } : {}}>Quantity / (In Inventory)</TableCell>
                                <TableCell align="right" style={!isProjects ? { display: 'none' } : {}}>Quantity</TableCell>
                                <TableCell>Item</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                        {recipeItem.materials.map((material: InventoryItem, index: number) => {
                            const id = "material-"+parentId+"-"+index;
                            let inventoryItem = inventoryData.get(material.name.toLowerCase());
                            let inInventory = inventoryItem? inventoryItem.quantity: 0;
                            if (!isProjects) {
                                return (
                                    <TableRow key={id}>
                                        <TableCell align="right" style={inInventory < material.quantity ? {
                                            color: 'red',
                                            fontWeight: 'bold'
                                        } : {}}
                                        >{material.quantity} ({inInventory})</TableCell>
                                        <TableCell align="left">{material.name}</TableCell>
                                    </TableRow>
                                )
                            } else {
                                return(<TableRow key={id}>
                                    <TableCell align="right"
                                    >{material.quantity}</TableCell>
                                    <TableCell align="left">{material.name}</TableCell>
                                </TableRow>);
                            }
                        })}
                        </TableBody>
                    </Table>
                </Grid>
            </Grid>
        </React.Fragment>
    );
}