import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import * as React from "react";
import CloseIcon from "@mui/icons-material/Close";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
import {Button} from "@mui/material";

export function formatPrice(priceCp: number): String {
    if (priceCp == null)
        return "";

    if(priceCp < 10) {
        return  priceCp.toString() + " cp";
    } else if(priceCp < 100) {
        return (priceCp/10).toString() + " sp";
    } else {
        return (priceCp/100).toString() + " gp";
    }
}
export default function InventoryRow({row, inventory, inventoryData}: {row: any, inventory: any, inventoryData: any}) {

    function increaseItemQuantity(event: any) {
        let value = event.target.value;
        if (value) {
            inventory.addToInventory([{id: Number(value), quantity: 1}], false, true);
        } else {
            alert("This is coded poorly, wait a bit before clicking please.")
        }
    }
    function decreaseItemQuantity(event: any) {
        let value = event.target.value;
        if (value) {
            inventory.removeFromInventory([{id: Number(value), quantity: 1}])
        } else {
            alert("This is coded poorly, wait a bit before clicking please.")
        }
    }
    function deleteInventoryItem(event: any) {
        let value = event.target.value;
        if (value) {
            inventory.removeFromInventory([{id: Number(value), quantity: 0}], true);
        } else {
            alert("This is coded poorly, wait a bit before clicking please.")
        }
    }

    let inventoryItem = inventoryData.get(row.name.toLowerCase());
    if (!inventoryItem) {
        return(<React.Fragment></React.Fragment>);
    }
    let quantity = inventoryItem.quantity;
    return (
        <React.Fragment>

            <TableRow sx={{ '& > *': { borderBottom: 'unset' }}} hover={true}>
                <TableCell
                    component="th"
                    id={row.id}
                    scope="row"
                    padding="none"
                >
                    {row.name}<sup>{row.source}</sup>
                </TableCell>
                <TableCell align="left">{row.rarity}</TableCell>
                <TableCell align="right">{row.usedFor}</TableCell>
                <TableCell align="right">{formatPrice(row.priceCp)}</TableCell>
                <TableCell align="right">
                    <Button value={row.id}
                    onClick={decreaseItemQuantity}><RemoveIcon pointerEvents="none"/></Button>
                    {quantity}
                    <Button value={row.id}
                            onClick={increaseItemQuantity}><AddIcon pointerEvents="none"/></Button>
                </TableCell>


                <TableCell align="right"><Button value={row.id} onClick={deleteInventoryItem}>Delete &nbsp;<CloseIcon pointerEvents="none"/></Button></TableCell>


            </TableRow>
        </React.Fragment>
    );
}