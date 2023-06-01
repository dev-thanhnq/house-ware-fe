import { Helmet } from 'react-helmet-async';
import { filter } from 'lodash';
import { useEffect, useState } from 'react';
// @mui
import {
  Card,
  Table,
  Stack,
  Paper,
  Avatar,
  Button,
  Popover,
  Checkbox,
  TableRow,
  MenuItem,
  TableBody,
  TableCell,
  Container,
  Typography,
  IconButton,
  TableContainer,
  TablePagination,
  AppBar,
  Dialog,
  Toolbar,
  ListItem,
  ListItemText,
  Divider,
  List,
  TextField,
  Box,
  Grid,
} from '@mui/material';
// import CloseIcon from '@mui/icons-material/Close';
// components
import { Controller, useForm } from 'react-hook-form';
import Label from '../components/label';
import Iconify from '../components/iconify';
import Scrollbar from '../components/scrollbar';
// sections
import { UserListHead, UserListToolbar } from '../sections/@dashboard/user';
// mock
import USERLIST from '../_mock/user';

// api
import api from '../api';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'name', label: 'Tên sản phẩm', alignRight: false },
  { id: 'sku', label: 'Mã sản phẩm', alignRight: false },
  { id: 'category', label: 'Danh mục', alignRight: false },
  { id: 'price', label: 'Giá', alignRight: false },
  { id: 'quantity', label: 'Tồn kho', alignRight: false },
  { id: 'status', label: 'Trạng thái', alignRight: false },
  { id: '' },
];

// ----------------------------------------------------------------------

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function applySortFilter(array, comparator, query) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  if (query) {
    return filter(array, (_user) => _user.name.toLowerCase().indexOf(query.toLowerCase()) !== -1);
  }
  return stabilizedThis.map((el) => el[0]);
}

export default function UserPage() {
  const { control, setValue, handleSubmit, errors } = useForm();
  const [open, setOpen] = useState(null);

  const [page, setPage] = useState(0);

  const [order, setOrder] = useState('asc');

  const [selected, setSelected] = useState([]);

  const [orderBy, setOrderBy] = useState('name');

  const [filterName, setFilterName] = useState('');

  const [rowsPerPage, setRowsPerPage] = useState(20);

  const [products, setProducts] = useState([]);

  const [product, setProduct] = useState({
    name: '',
    sku: '',
    price: 0,
    category_id: 0,
    quantity: 0,
    description: '',
    avatar: null,
  });

  const [imgSrc, setImgSrc] = useState('');

  const [selectedProduct, setSelectedProduct] = useState({});

  const [openModalProduct, setOpenModalProduct] = useState(false);

  const getProducts = () => {
    api.getProducts().then((response) => {
      if (response) {
        setProducts(response.data?.data.data);
      }
    });
  };

  const saveProduct = () => {
    console.log('product: ', product);
    setOpenModalProduct(false);
  };

  useEffect(() => {
    getProducts();
  }, []);

  const handleOpenMenu = (event, data) => {
    setOpen(event.currentTarget);
    setProduct(data);
  };

  const handleGetProduct = () => {
    console.log(product);
    setOpenModalProduct(true);
  };

  const handleCloseMenu = () => {
    setOpen(null);
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = USERLIST.map((n) => n.name);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
    }
    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  const handleFilterByName = (event) => {
    setPage(0);
    setFilterName(event.target.value);
  };

  const handleChangeProductInfo = (value, key) => {
    if (key === 'name') setProduct({ ...product, name: value });
    if (key === 'sku') setProduct({ ...product, sku: value });
    if (key === 'category_id') setProduct({ ...product, category_id: value });
    if (key === 'price') setProduct({ ...product, price: value });
    if (key === 'quantity') setProduct({ ...product, quantity: value });
    if (key === 'description') setProduct({ ...product, description: value });
  };

  const handleUpload = (event) => {
    const fileTarget = event?.target?.files[0];
    if (fileTarget) setImgSrc(URL.createObjectURL(fileTarget));
  };

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - USERLIST.length) : 0;

  const filteredUsers = applySortFilter(products, getComparator(order, orderBy), filterName);

  const isNotFound = !filteredUsers.length && !!filterName;

  return (
    <>
      <Helmet>
        <title> Products | House ware </title>
      </Helmet>

      <Container maxWidth="auto">
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Sản phẩm
          </Typography>
          <Button
            variant="contained"
            startIcon={<Iconify icon="eva:plus-fill" />}
            onClick={() => setOpenModalProduct(true)}
          >
            Thêm mới
          </Button>
        </Stack>

        <Card>
          <UserListToolbar numSelected={selected.length} filterName={filterName} onFilterName={handleFilterByName} />

          <Scrollbar>
            <TableContainer>
              <Table>
                <UserListHead
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={USERLIST.length}
                  numSelected={selected.length}
                  onRequestSort={handleRequestSort}
                  onSelectAllClick={handleSelectAllClick}
                />
                <TableBody>
                  {filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                    const { id, sku, name, categoryId = row.category_id, status, price, avatar, quantity } = row;
                    const selectedUser = selected.indexOf(name) !== -1;

                    return (
                      <TableRow hover key={id} tabIndex={-1} role="checkbox" selected={selectedUser}>
                        <TableCell padding="checkbox">
                          <Checkbox checked={selectedUser} onChange={(event) => handleClick(event, name)} />
                        </TableCell>

                        <TableCell component="th" scope="row" padding="none">
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Avatar alt={name} src={avatar} />
                            <Typography variant="subtitle2" noWrap>
                              {name}
                            </Typography>
                          </Stack>
                        </TableCell>

                        <TableCell align="left">{sku}</TableCell>

                        <TableCell align="left">{categoryId}</TableCell>

                        <TableCell align="left">{price}</TableCell>

                        <TableCell align="left">{quantity}</TableCell>

                        <TableCell align="left">
                          <Label color={(status === 'banned' && 'error') || 'success'}>{status}</Label>
                        </TableCell>

                        <TableCell align="right">
                          <IconButton size="large" color="inherit" onClick={(event) => handleOpenMenu(event, row)}>
                            <Iconify icon={'eva:more-vertical-fill'} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {emptyRows > 0 && (
                    <TableRow style={{ height: 53 * emptyRows }}>
                      <TableCell colSpan={6} />
                    </TableRow>
                  )}
                </TableBody>

                {isNotFound && (
                  <TableBody>
                    <TableRow>
                      <TableCell align="center" colSpan={6} sx={{ py: 3 }}>
                        <Paper
                          sx={{
                            textAlign: 'center',
                          }}
                        >
                          <Typography variant="h6" paragraph>
                            Not found
                          </Typography>

                          <Typography variant="body2">
                            No results found for &nbsp;
                            <strong>&quot;{filterName}&quot;</strong>.
                            <br /> Try checking for typos or using complete words.
                          </Typography>
                        </Paper>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                )}
              </Table>
            </TableContainer>
          </Scrollbar>

          <TablePagination
            rowsPerPageOptions={[5, 10, 20]}
            component="div"
            count={USERLIST.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>
      </Container>

      <Popover
        open={Boolean(open)}
        anchorEl={open}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            p: 1,
            width: 140,
            '& .MuiMenuItem-root': {
              px: 1,
              typography: 'body2',
              borderRadius: 0.75,
            },
          },
        }}
      >
        <MenuItem onClick={() => handleGetProduct()}>
          <Iconify icon={'eva:edit-fill'} sx={{ mr: 2 }} />
          Chỉnh sửa
        </MenuItem>

        <MenuItem sx={{ color: 'error.main' }}>
          <Iconify icon={'eva:trash-2-outline'} sx={{ mr: 2 }} />
          Delete
        </MenuItem>
      </Popover>

      <Dialog fullScreen open={openModalProduct} onClose={() => setOpenModalProduct(false)}>
        <AppBar sx={{ position: 'relative' }}>
          <Toolbar>
            <IconButton edge="start" color="inherit" onClick={() => setOpenModalProduct(false)} aria-label="close">
              {/* <CloseIcon /> */}
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
              Tạo mới sản phẩm
            </Typography>
            <Button autoFocus color="inherit" onClick={saveProduct}>
              Lưu
            </Button>
          </Toolbar>
        </AppBar>
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <Box width="400px" height="400px" margin="20px" border={'1px solid gray'} position={'relative'}>
              {imgSrc ? (
                <img
                  src={imgSrc}
                  alt=""
                  style={{
                    objectFit: 'cover',
                    width: '400px',
                    height: '400px',
                    textAlign: 'center',
                    position: 'absolute',
                    top: '50%',
                    left: 0,
                    right: 0,
                    transform: 'translateY(-50%)',
                  }}
                />
              ) : (
                <div
                  style={{
                    textAlign: 'center',
                    position: 'absolute',
                    top: '50%',
                    left: 0,
                    right: 0,
                    transform: 'translateY(-50%)',
                  }}
                >
                  Thêm ảnh
                </div>
              )}
              <input
                style={{ width: '400px', height: '400px', opacity: 0, cursor: 'pointer' }}
                type="file"
                onChange={handleUpload}
              />
            </Box>
          </Grid>
          <Grid item xs={8}>
            <Box padding="20px">
              <TextField
                label="Tên sản phẩm"
                fullWidth
                variant="outlined"
                size={'small'}
                value={product.name}
                onChange={(event) => handleChangeProductInfo(event.target?.value, 'name')}
              />
            </Box>
            <Box padding="20px">
              <TextField
                label="Mã sản phẩm"
                fullWidth
                variant="outlined"
                size={'small'}
                value={product.sku}
                onChange={(event) => handleChangeProductInfo(event.target?.value, 'sku')}
              />
            </Box>
            <Box padding="20px">
              <TextField
                label="Danh mục sản phẩm"
                fullWidth
                variant="outlined"
                size={'small'}
                value={product.category_id}
                onChange={(event) => handleChangeProductInfo(event.target?.value, 'category_id')}
              />
            </Box>
            <Box padding="20px">
              <TextField
                label="Giá"
                fullWidth
                type="number"
                variant="outlined"
                size={'small'}
                value={product.price}
                onChange={(event) => handleChangeProductInfo(event.target?.value, 'price')}
              />
            </Box>
            <Box padding="20px">
              <TextField
                label="Tồn kho"
                fullWidth
                type="number"
                variant="outlined"
                size={'small'}
                value={product.quantity}
                onChange={(event) => handleChangeProductInfo(event.target?.value, 'quantity')}
              />
            </Box>
            <Box padding="20px">
              <TextField
                multiline
                rows="15"
                label="Mô tả"
                fullWidth
                variant="outlined"
                size={'small'}
                value={product.description}
                onChange={(event) => handleChangeProductInfo(event.target?.value, 'description')}
              />
            </Box>
          </Grid>
        </Grid>
      </Dialog>
    </>
  );
}
