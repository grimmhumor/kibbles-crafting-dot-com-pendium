import * as React from 'react';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import { visuallyHidden } from '@mui/utils';
import {CraftingItem, RecipeItem} from "../../data/data-classes/CraftingItem";
import {MenuItem, TextField} from "@mui/material";
import {InventoryItem} from "../../data/data-classes/InventoryItem";
import {useState} from "react";
import CraftingItemRow from "./CraftingItemRow";
import {itemData} from "../../data/DataLoader";
import { useElementSize } from 'usehooks-ts';
import {throttle} from "lodash";

//TODO: Placeholder before we cookie it up
let inventoryData: Map<string, InventoryItem> = new Map<string, InventoryItem>([["Glass Vial".toLowerCase(), {
        id: 2,
        name: "Glass Vial",
        quantity: 1
    }],
    ["Common Curative Reagent".toLowerCase(), {id: 1, name: "Common Curative Reagent", quantity: 2}],
    ["Unformed Glass".toLowerCase(), {id: 4, name: "Unformed Glass", quantity: 2}]]);

interface ItemData {
    id: number;
    name: string;
    type: string;
    subtype: string;
    rarity: string;
    priceCp: number;
    usedFor: string;
    school: string;
}
function formatUsedList(usedFor: string[]) {
    if (!usedFor)
        return "";
    return usedFor.reduce((prev, curr) => prev + ", " + curr);
}
function createItemData(
    id: number,
    name: string,
    type: string,
    subtype: string,
    rarity: string,
    priceCp: number,
    usedForList: string[],
    school: string
): ItemData {
    let usedFor = formatUsedList(usedForList);

    return {
        id,
        name,
        type,
        subtype,
        rarity,
        priceCp,
        usedFor,
        school
    };
}

function setRows(itemData: CraftingItem[]): ItemData[] {
    return itemData.map(item => {
        return createItemData(item.id, item.name, item.type, item.subtype, item.rarity, item.priceCp, item.usedFor, item.school)
    })
}

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
    if (orderBy!= 'rarity') {

        if (b[orderBy] < a[orderBy]) {
            return -1;
        }
        if (b[orderBy] > a[orderBy]) {
            return 1;
        }
        return 0;
    } else {
        const ar: string = a[orderBy] as string;
        const br: string = b[orderBy] as string;

        const ai = itemData.rarity.indexOf(ar)
        const bi = itemData.rarity.indexOf(br)
        return bi-ai;
    }
}

type Order = 'asc' | 'desc';

function getComparator<Key extends keyof any>(
    order: Order,
    orderBy: Key,
): (
    a: { [key in Key]: number | string },
    b: { [key in Key]: number | string },
) => number {
    return order === 'desc'
        ? (a, b) => descendingComparator(a, b, orderBy)
        : (a, b) => -descendingComparator(a, b, orderBy);
}

// Since 2020 all major browsers ensure sort stability with Array.prototype.sort().
// stableSort() brings sort stability to non-modern browsers (notably IE11). If you
// only support modern browsers you can replace stableSort(exampleArray, exampleComparator)
// with exampleArray.slice().sort(exampleComparator)
function stableSort<T>(array: readonly T[], comparator: (a: T, b: T) => number) {
    const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
    stabilizedThis.sort((a, b) => {
        const order = comparator(a[0], b[0]);
        if (order !== 0) {
            return order;
        }
        return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
}


interface EnhancedTableProps {
    onRequestSort: (event: React.MouseEvent<unknown>, property: keyof ItemData) => void;
    order: Order;
    orderBy: string;
    rowCount: number;
    viewState: string;
}

function EnhancedTableHead(props: EnhancedTableProps) {
    const { order, orderBy, rowCount, onRequestSort } =
        props;
    const createSortHandler =
        (property: keyof ItemData) => (event: React.MouseEvent<unknown>) => {
            onRequestSort(event, property);
        };
    let addToInventoryEnabled = !(props.viewState == "items" || props.viewState == "projects");
    let addToInventoryText = props.viewState == "items"? "Add To Inventory": "Complete Project and Add to Inventory";
    return (
        <TableHead>
            <TableRow>
                <TableCell />
                <TableCell
                    key='name'
                    align='left'
                    padding='normal'
                    sortDirection={orderBy === 'name' ? order : false}
                >
                    <TableSortLabel
                        active={orderBy === 'name'}
                        direction={orderBy === 'name' ? order : 'asc'}
                        onClick={createSortHandler('name')}
                    >
                        Name
                        {orderBy === 'name' ? (
                            <Box component="span" sx={visuallyHidden}>
                                {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                            </Box>
                        ) : null}
                    </TableSortLabel>
                </TableCell>
                <TableCell
                    key='rarity'
                    align='left'
                    padding='normal'
                    sortDirection={orderBy === 'rarity' ? order : false}
                >
                    <TableSortLabel
                        active={orderBy === 'rarity'}
                        direction={orderBy === 'rarity' ? order : 'asc'}
                        onClick={createSortHandler('rarity')}
                    >
                        Rarity
                        {orderBy === 'rarity' ? (
                            <Box component="span" sx={visuallyHidden}>
                                {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                            </Box>
                        ) : null}
                    </TableSortLabel>
                </TableCell>
                <TableCell
                    key='usedFor'
                    align='right'
                    padding='normal'
                >
                        Used For
                </TableCell>
                <TableCell
                    key='priceCp'
                    align='right'
                    padding='normal'
                    sortDirection={orderBy === 'priceCp' ? order : false}
                >
                    <TableSortLabel
                        active={orderBy === 'priceCp'}
                        direction={orderBy === 'priceCp' ? order : 'asc'}
                        onClick={createSortHandler('priceCp')}
                    >
                        Price
                        {orderBy === 'priceCp' ? (
                            <Box component="span" sx={visuallyHidden}>
                                {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                            </Box>
                        ) : null}
                    </TableSortLabel>
                </TableCell>
                <TableCell
                    key='addToInventory'
                    align='right'
                    padding='normal'
                >
                    <p style={addToInventoryEnabled ? { display: 'none' } : {}}>
                        {addToInventoryText}
                    </p>

                </TableCell>

            </TableRow>
        </TableHead>
    );
}

export default function EnhancedTable({inventory, inventoryData, craftable, projects, viewState, wishlistData, projectData, forceUpdate} : {inventory: any, inventoryData: any, craftable: any, projects: any, viewState: any, wishlistData: any, projectData: any, forceUpdate: any}) {

    // Virtualization variables
    const rowHeight = 50;
    const bufferedItems = 15;
    const containerHeight = 440;
    let initialRows: CraftingItem[] = [];



    const [scrollPosition, setScrollPosition] = React.useState(0);
    const [originalRows, setOriginalRows] = React.useState(setRows(initialRows));
    const [order, setOrder] = React.useState<Order>('asc');
    const [orderBy, setOrderBy] = React.useState<keyof ItemData>('priceCp');
    const [craftableOnly, setCraftableOnly] = React.useState(false);
    const [search, setSearch] = useState("")
    const [rarity, setRarity] = useState("all")
    const [school, setSchool] = useState("all")
    const [usedFor, setUsedFor] = useState("all")
    const [totalHeight, setTotalHeight] = useState(0)

    if (viewState == "wishlist" && originalRows.length != wishlistData.length) {
        setOriginalRows(setRows(wishlistData));
    }
    if (viewState == "projects"&& originalRows.length != projectData.length) {
        setOriginalRows(setRows(projectData));
        setCraftableOnly(false);
    }
    if(viewState == "items"  && originalRows.length != itemData.itemList.length) {
        setOriginalRows(setRows(itemData.itemList));
    }

    const handleRequestSort = (
        event: React.MouseEvent<unknown>,
        property: keyof ItemData,
    ) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleFilterList = () => {
        const rows = originalRows.filter((row) =>
            {
                if (row.name.toLowerCase().includes(search)
                    && (school == "all" || row.school.toLowerCase().includes(school.toLowerCase()))
                    && (rarity == "all" || row.rarity.toLowerCase() == rarity.toLowerCase())
                    && (usedFor == "all" || row.usedFor.toLowerCase().includes(usedFor.toLowerCase()))
                    && (!craftableOnly || craftable.get(row.id))) {
                    return row;
                }
            }
        );
        return rows
    }

    const handleChangeCraftable = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCraftableOnly(event.target.checked);
    };

    // get the children to be renderd
    const sortedRows = React.useMemo(() => {
        const filteredRows = handleFilterList();

        const startIndex = Math.max(
            Math.floor(scrollPosition / rowHeight) - bufferedItems,
            0
        );
        const endIndex = Math.min(
            Math.ceil((scrollPosition + containerHeight) / rowHeight - 1) +
            bufferedItems,
            filteredRows.length - 1
        );
        setTotalHeight(startIndex*rowHeight)

         return stableSort(filteredRows, getComparator(order, orderBy)).slice(startIndex, endIndex + 1);

    }, [
        rowHeight,
        scrollPosition,
        order, orderBy, search, rarity, usedFor, school, craftableOnly, originalRows, forceUpdate
    ]);

    const onScroll = React.useMemo(
        () =>
            throttle(
                function (e: any) {
                    setScrollPosition(e.target.scrollTop);
                },
                50,
                { leading: true }
            ),
        []
    );


    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(event.target.value.toLowerCase());
    };
    const handleRarity = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRarity(event.target.value)
    };

    const handleSchool = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSchool(event.target.value.toLowerCase())
    };

    const handleUsedFor = (event: React.ChangeEvent<HTMLInputElement>) => {
        setUsedFor(event.target.value.toLowerCase())
    };


    return (
        <Box sx={{ width: '100%' }}>
            <TextField id="outlined-search" label="Search" type="search" sx={{ width: '40%' }}
                       onChange={handleSearch}
            />
            <TextField sx={{ width: '20%' }}
                       id="craftingSchool"
                       select
                       label="Crafting School"
                       defaultValue="all"
                       helperText=""
                       onChange={handleSchool}
            >
                {itemData.usedFor.map((option) => (
                    <MenuItem key={option.toLowerCase()} value={option.toLowerCase()}>
                        {option}
                    </MenuItem>
                ))}
            </TextField>
            <TextField sx={{ width: '20%' }}
                id="raritySelect"
                select
                label="Rarity"
                defaultValue="all"
                helperText=""
                onChange={handleRarity}
            >
                {itemData.rarity.map((option) => (
                    <MenuItem key={option.toLowerCase()} value={option.toLowerCase()}>
                        {option}
                    </MenuItem>
                ))}
            </TextField>
            <TextField sx={{ width: '20%' }}
                id="usedForSelect"
                select
                label="Used For"
                defaultValue="all"
                helperText=""
                onChange={handleUsedFor}
            >
                {itemData.usedFor.map((option) => (
                    <MenuItem key={option.toLowerCase()} value={option.toLowerCase()}>
                        {option}
                    </MenuItem>
                ))}
            </TextField>
            <Paper sx={{ width: '100%', mb: 2 , overflow: 'hidden'}}>
                <TableContainer sx={{ maxHeight: 440 }}
                                onScroll={onScroll}
                                style={{
                                    overflowY: "scroll",
                                    position: "relative"
                                }}>
                    <Table
                        stickyHeader
                        sx={{ minWidth: 750}}
                        aria-labelledby="tableTitle"
                        size='small'

                    >
                        <EnhancedTableHead
                            order={order}
                            orderBy={orderBy}
                            onRequestSort={handleRequestSort}
                            rowCount={sortedRows.length}
                            viewState={viewState}
                        />
                        <TableBody
                        >
                            <TableRow sx={{height: totalHeight}} />
                            {sortedRows.map((row, index) => {
                                const id = row.name.replace(" ", "-") + index;
                                return(
                                    <CraftingItemRow key={id} row={row} index={index} inventory={inventory} inventoryData={inventoryData} craftable={craftable} projects={projects} viewState={viewState} forceUpdate={forceUpdate}/>
                                );
                            })}
                            <TableRow sx={{height: 100}} />
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
            <div style={viewState == "projects" ? { display: 'none' } : {}}>
                <FormControlLabel
                    control={<Switch checked={craftableOnly} onChange={handleChangeCraftable} />}
                    label="Only show craftable"
                />
                <Typography style={{color: 'green', fontWeight: 'bold'}}>
                    * Green denotes craftable items
                </Typography>
            </div>
        </Box>
    );
}