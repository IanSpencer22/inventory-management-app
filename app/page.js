"use client"
import React, { useEffect, useState, useCallback } from 'react';
import { Box, Stack, Typography, Button, Modal, TextField, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { firestore } from "@/firebase/config";
import { collection, query, getDocs, getDoc, doc, setDoc, deleteDoc } from "firebase/firestore";
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/firebase/config';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import InfiniteScroll from 'react-infinite-scroll-component';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import './styles.css';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90vw',
  maxWidth: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
  fontFamily: 'Arial, sans-serif',
};

export default function Home() {
  const [user] = useAuthState(auth);
  const router = useRouter();
  const userSession = sessionStorage.getItem('user');

  if (!user && !userSession) {
    router.push('/sign-in');
  }

  const [pantry, setPantry] = useState([])
  const [open, setOpen] = useState(false)
  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)
  const [itemName, setItemName] = useState('')
  const [itemQuantities, setItemQuantities] = useState({});
  const [editMode, setEditMode] = useState({});
  const [itemCategory, setItemCategory] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortOrder, setSortOrder] = useState('A-Z');
  const [categories, setCategories] = useState([]);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [hasMoreItems, setHasMoreItems] = useState(true);
  const [itemExpiration, setItemExpiration] = useState({});

  useEffect(() => {
    const quantities = {};
    const categories = {};
    const expirations = { ...itemExpiration };
    pantry.forEach(item => {
      quantities[item.name] = item.count;
      categories[item.name] = item.category;
      expirations[item.name] = item.expiration;
    });
    setItemQuantities(quantities);
    setItemCategory(categories);
    setItemExpiration(expirations);
  }, [pantry, itemExpiration]);

  useEffect(() => {
    const fetchCategories = async () => {
      const categoriesSet = new Set();
      pantry.forEach(item => categoriesSet.add(item.category));
      setCategories(['All', ...categoriesSet]);
    };
    fetchCategories();
  }, [pantry]);

  const handleQuantityChange = async (name, value) => {
    const updatedQuantities = { ...itemQuantities, [name]: value };
    setItemQuantities(updatedQuantities);

    const userPantryPath = `users/${user.uid}/pantry`;
    const docRef = doc(firestore, userPantryPath, name);
    const itemData = {
      count: value,
      category: itemCategory[name] || 'default',
      expiration: itemExpiration[name] ? new Date(itemExpiration[name] + 'T00:00').toISOString() : null
    };

    await setDoc(docRef, itemData);
  };

  const toggleEditMode = (name) => {
    setEditMode(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const updatePantry = useCallback(async () => {
    if (!user) return;
    const userPantryPath = `users/${user.uid}/pantry`;
    const snapshot = query(collection(firestore, userPantryPath));
    const docs = await getDocs(snapshot);
    const pantryList = [];
    docs.forEach((doc) => {
      pantryList.push({
        name: doc.id,
        ...doc.data(),
        expiration: doc.data().expiration ? new Date(doc.data().expiration).toISOString().split('T')[0] : null
      });
    });
    console.log(pantryList);
    setPantry(pantryList);
  }, [user]);

  useEffect(() => {
    updatePantry()
  }, []);

  const addItem = async () => {
    if (!user) return;
    const normalizedItemName = itemName.toLowerCase();
    const userPantryPath = `users/${user.uid}/pantry`;
    const docRef = doc(collection(firestore, userPantryPath), normalizedItemName);
    const docSnap = await getDoc(docRef);

    console.log("Category State:", itemCategory);
    console.log("Item Name for Category:", itemName);

    const itemCategoryValue = itemCategory[itemName] || 'default';

    const itemExpirationValue = itemExpiration[itemName] ? new Date(itemExpiration[itemName]).toISOString() : null;
    const inputQuantity = parseInt(itemQuantities[itemName], 10) || 0;

    const itemData = {
      count: docSnap.exists() ? docSnap.data().count + inputQuantity : inputQuantity,
      category: itemCategoryValue,
      expiration: itemExpirationValue
    };

    await setDoc(docRef, itemData);
    await updatePantry();
    handleClose();
  }

  const removeItem = async (itemName) => {
    if (!user) return;
    const userPantryPath = `users/${user.uid}/pantry`;
    const docRef = doc(collection(firestore, userPantryPath), itemName);
    await deleteDoc(docRef);
    await updatePantry();
  }

  const filteredPantry = pantry
    .filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(item => selectedCategory === 'All' || item.category === selectedCategory)
    .filter(item => sortOrder.includes('Date') ? itemExpiration[item.name] : true)
    .sort((a, b) => {
      if (sortOrder === 'A-Z') {
        return a.name.localeCompare(b.name);
      } else if (sortOrder === 'Z-A') {
        return b.name.localeCompare(a.name);
      } else if (sortOrder === 'Ascending Quantity') {
        return a.count - b.count;
      } else if (sortOrder === 'Descending Quantity') {
        return b.count - a.count;
      } else if (sortOrder === 'Ascending Date' && itemExpiration[a.name] && itemExpiration[b.name]) {
        const dateA = new Date(itemExpiration[a.name]);
        const dateB = new Date(itemExpiration[b.name]);
        return dateA - dateB;
      } else if (sortOrder === 'Descending Date' && itemExpiration[a.name] && itemExpiration[b.name]) {
        const dateA = new Date(itemExpiration[a.name]);
        const dateB = new Date(itemExpiration[b.name]);
        return dateB - dateA;
      }
      return 0;
    });

  const fetchMoreData = () => {
    if (filteredPantry.length === pantry.length) {
      setHasMoreItems(false);
      return;
    }
    setTimeout(() => {
      setItemsPerPage(itemsPerPage + 10);
    }, 1500);
  };

  useEffect(() => {
    const updateExpirationDates = async () => {
      const userPantryPath = `users/${user.uid}/pantry`;
      const updates = Object.entries(itemExpiration).map(async ([itemName, expirationDate]) => {
        if (expirationDate) {
          const docRef = doc(firestore, userPantryPath, itemName);
          const updatedData = {
            expiration: new Date(expirationDate + 'T00:00').toISOString()
          };
          await setDoc(docRef, updatedData, { merge: true });
        }
      });

      try {
        await Promise.all(updates);
      } catch (error) {
        console.error("Failed to update expiration dates:", error);
      }
    };

    updateExpirationDates();
  }, [itemExpiration]);

  return (
    <Box
      width="100vw"
      height="100vh"
      display={"flex"}
      justifyContent={"center"}
      flexDirection={"column"}
      alignItems={"center"}
      gap={2}
      style={{ fontFamily: 'Arial, sans-serif', padding: '10px' }}
    >
      <Stack direction="row" spacing={2} sx={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleOpen}
          sx={{ bgcolor: 'green', '&:hover': { bgcolor: 'darkgreen' } }}
        >
          Add
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={() => {
            signOut(auth)
            sessionStorage.removeItem('user')
          }}
          sx={{ marginLeft: 'auto' }}
        >
          Log out
        </Button>
      </Stack>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Stack direction={"column"} spacing={1.5}>
            <Typography id="modal-modal-title" variant="h6" component="h2">Add Item</Typography>
            <TextField
                id="outlined-basic"
                label="Item"
                variant="outlined"
                fullWidth
                onChange={(e) => setItemName(e.target.value)}
            />
            <TextField
                id="outlined-category"
                label="Category"
                variant="outlined"
                fullWidth
                onChange={(e) => setItemCategory({ ...itemCategory, [itemName]: e.target.value })}
              />
              <Stack width={"100%"} direction={"row"} spacing={2}>
                <TextField
                  id="outlined-quantity"
                  label="Quantity"
                  type="number"
                  variant="outlined"
                  fullWidth
                  onChange={(e) => setItemQuantities({ ...itemQuantities, [itemName]: e.target.value })}
                />
                  <TextField
                  id="date-picker"
                  label="Expiration Date"
                  type="date"
                  defaultValue={itemExpiration[itemName] || ''}
                  onChange={(e) => setItemExpiration({ ...itemExpiration, [itemName]: e.target.value })}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  fullWidth
                />
              </Stack>
            <Button variant="outlined" onClick={addItem}>Add</Button>
          </Stack>
        </Box>
      </Modal>
      <Box border={"1px solid #333"}>
        <Box
          width={"100%"}
          height={"100px"}
          bgcolor={"#ADD8E6"}
          display={"flex"}
          justifyContent={"center"}
          alignItems={"center"}
        >
          <Typography variant={"h2"} color={"#333"} textAlign={"center"}>
            Pantry Items
          </Typography>
        </Box>
        <InfiniteScroll
          dataLength={itemsPerPage}
          next={fetchMoreData}
          hasMore={hasMoreItems}
          loader={<h4>Loading...</h4>}
          endMessage={
            <p style={{ textAlign: 'center' }}>
              <b>You have seen all items</b>
            </p>
          }
          height={500}
        >
          <Stack id="pantry-stack" width="900px" spacing={2} overflow={"auto"}>
            <TextField
              label="Search"
              variant="outlined"
              fullWidth
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Stack direction="row" spacing={2} width="100%">
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={selectedCategory}
                  label="Category"
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map(category => (
                    <MenuItem key={category} value={category}>{category}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortOrder}
                  label="Sort By"
                  onChange={(e) => setSortOrder(e.target.value)}
                >
                  <MenuItem value="A-Z">Alphabetical A-Z</MenuItem>
                  <MenuItem value="Z-A">Alphabetical Z-A</MenuItem>
                  <MenuItem value="Ascending Quantity">Ascending Quantity</MenuItem>
                  <MenuItem value="Descending Quantity">Descending Quantity</MenuItem>
                  <MenuItem value="Ascending Date">Ascending Date</MenuItem>
                  <MenuItem value="Descending Date">Descending Date</MenuItem>
                </Select>
              </FormControl>
            </Stack>
            {filteredPantry.slice(0, itemsPerPage).map(({ name, count, category, expiration }) => {
              return (
                <Box
                  className="pantry-item"
                  key={name}
                  width="100%"
                  minHeight="120px"
                  display={"flex"}
                  justifyContent={"space-between"}
                  paddingX={5}
                  alignItems={"center"}
                  bgcolor={'lightgrey'}
                >
                  <Stack className="item-details" direction={"column"} spacing={1} verticalAlign={"left"} justifyContent={"left"}>
                    <Typography
                      className="item-name"
                      variant={"h4"}
                      color={"#333"}
                      textAlign={"center"}
                      style={{ width: '200px', marginLeft: '-30px' }}
                    >
                      {name.charAt(0).toUpperCase() + name.slice(1)}
                    </Typography>
                    <Typography
                      className="item-expiration"
                      variant={"h6"}
                      color={"#666"}
                    >
                      {itemExpiration[name] ? "Exp: " + new Date(itemExpiration[name]).toLocaleDateString() : ''}
                    </Typography>
                  </Stack>
                  {editMode[name] ? (
                    <Stack className="edit-mode" direction={"column"} spacing={2} alignItems={"center"} justifyContent={"center"}>
                      <Typography variant={"h2"} fontSize={"20px"}>Quantity:</Typography>
                      <TextField
                        type="number"
                        value={itemQuantities[name] || 0}
                        onChange={(e) => handleQuantityChange(name, e.target.value)}
                        onBlur={() => handleQuantityChange(name, itemQuantities[name])}
                        style={{ width: "100px", verticalAlign: "middle" }}
                      />
                      <Typography variant={"h2"} fontSize={"20px"}>Category:</Typography>
                      <TextField
                        value={itemCategory[name] || ''}
                        onChange={(e) => setItemCategory({ ...itemCategory, [name]: e.target.value })}
                        onBlur={() => handleQuantityChange(name, itemQuantities[name])}
                        style={{ width: "100px", verticalAlign: "middle" }}
                      />
                      <Typography variant={"h2"} fontSize={"20px"}>Expiration Date:</Typography>
                      <TextField
                        type="date"
                        value={itemExpiration[name] ? (new Date(itemExpiration[name]).getTime() ? new Date(itemExpiration[name]).toISOString().split('T')[0] : '') : ''}
                        onChange={(e) => {
                          setItemExpiration({ ...itemExpiration, [name]: e.target.value });
                        }}
                        onBlur={() => handleQuantityChange(name, itemQuantities[name])}
                        InputLabelProps={{
                          shrink: true,
                        }}
                        style={{ width: "150px", verticalAlign: "middle" }}
                      />
                      <Button variant="contained" onClick={() => { handleQuantityChange(name, itemQuantities[name]); toggleEditMode(name); }}>Save</Button>
                    </Stack>
                  ) : (
                    <Stack className="view-mode" direction={"column"} spacing={2} sx={{ marginLeft: 'auto', justifyContent: 'center', alignItems: 'center' }}>
                      <Typography
                        variant="h3"
                        color={"#333"}
                        textAlign={"center"}
                        fontSize={"30px"}
                        className="quantity-text"
                      >
                        Quantity: {itemQuantities[name] !== undefined ? itemQuantities[name] : count}
                      </Typography>
                      <Typography
                        variant="h6"
                        color={"#666"}
                        textAlign={"center"}
                      >
                        Category: {category ? (category.toString().charAt(0).toUpperCase() + category.toString().slice(1).toLowerCase()) : "No category"}
                      </Typography>
                    </Stack>
                  )}
                  <Stack className="quantity-adjust-buttons" direction="column" spacing={0} sx={{ position: 'relative', top: '-25px', left: '5px' }}>
                    <Button variant="text" onClick={() => handleQuantityChange(name, (itemQuantities[name] !== undefined ? itemQuantities[name] : count) + 1)} sx={{ minWidth: '30px', height: '30px', padding: '6px' }}>
                      <ArrowDropUpIcon sx={{ fontSize: '2rem' }} />
                    </Button>
                    <Button variant="text" onClick={() => handleQuantityChange(name, Math.max((itemQuantities[name] !== undefined ? itemQuantities[name] : count) - 1, 0))} sx={{ minWidth: '30px', height: '30px', padding: '6px' }}>
                      <ArrowDropDownIcon sx={{ fontSize: '2rem' }} />
                    </Button>
                  </Stack>
                  <Button className="edit-button" variant="text" sx={{ marginLeft: 'auto', marginRight: '5px' }} onClick={() => toggleEditMode(name)}>
                    <EditIcon />
                  </Button>
                  <Button className="delete-button" variant="text" color="error" onClick={() => removeItem(name)}>
                    <DeleteIcon />
                  </Button>
                </Box>
              );
            })}
          </Stack>
        </InfiniteScroll>
      </Box>
    </Box>
  );
}