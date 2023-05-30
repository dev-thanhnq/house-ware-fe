import {Helmet} from 'react-helmet-async';
import {filter} from 'lodash';
import {useEffect, useState} from 'react';
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
  TablePagination, AppBar, Dialog, Toolbar, ListItem, ListItemText, Divider, List, TextField, Box,
} from '@mui/material';
// import CloseIcon from '@mui/icons-material/Close';
// components
import { Controller, useForm } from 'react-hook-form';
import Label from '../components/label';
import Iconify from '../components/iconify';
import Scrollbar from '../components/scrollbar';
// sections
import {UserListHead, UserListToolbar} from '../sections/@dashboard/user';
// mock
import USERLIST from '../_mock/user';

// api
import api from "../api";

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  {id: 'name', label: 'Tên sản phẩm', alignRight: false},
  {id: 'sku', label: 'Mã sản phẩm', alignRight: false},
  {id: 'category', label: 'Danh mục', alignRight: false},
  {id: 'price', label: 'Giá', alignRight: false},
  {id: 'quantity', label: 'Tồn kho', alignRight: false},
  {id: 'status', label: 'Trạng thái', alignRight: false},
  {id: ''},
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

  const [product, setProduct] = useState({});

  const [selectedProduct, setSelectedProduct] = useState({});

  const [openModalProduct, setOpenModalProduct] = useState(false)

  const getProducts = () => {
    api.getProducts().then(response => {
      if (response) {
        setProducts(response.data?.data.data);
      }
    })
  }

  const saveProduct = (data) => {
    console.log('abc')
    console.log(data)
    setOpenModalProduct(false);
  }

  useEffect(() => {
    getProducts();
  }, [])

  const handleOpenMenu = (event, data) => {
    setOpen(event.currentTarget);
    setProduct(data)
  };

  const handleGetProduct = () => {
    console.log(product)
    setOpenModalProduct(true)
  }

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
          <Button variant="contained" startIcon={<Iconify icon="eva:plus-fill"/>} onClick={() => setOpenModalProduct(true)}>
            Thêm mới
          </Button>
        </Stack>

        <Card>
          <UserListToolbar numSelected={selected.length} filterName={filterName} onFilterName={handleFilterByName}/>

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
                    const {id, sku, name, categoryId = row.category_id, status, price, avatar, quantity} = row;
                    const selectedUser = selected.indexOf(name) !== -1;

                    return (
                      <TableRow hover key={id} tabIndex={-1} role="checkbox" selected={selectedUser}>
                        <TableCell padding="checkbox">
                          <Checkbox checked={selectedUser} onChange={(event) => handleClick(event, name)}/>
                        </TableCell>

                        <TableCell component="th" scope="row" padding="none">
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Avatar alt={name} src={avatar}/>
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
                            <Iconify icon={'eva:more-vertical-fill'}/>
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {emptyRows > 0 && (
                    <TableRow style={{height: 53 * emptyRows}}>
                      <TableCell colSpan={6}/>
                    </TableRow>
                  )}
                </TableBody>

                {isNotFound && (
                  <TableBody>
                    <TableRow>
                      <TableCell align="center" colSpan={6} sx={{py: 3}}>
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
                            <br/> Try checking for typos or using complete words.
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
        anchorOrigin={{vertical: 'top', horizontal: 'left'}}
        transformOrigin={{vertical: 'top', horizontal: 'right'}}
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
          <Iconify icon={'eva:edit-fill'} sx={{mr: 2}} />
          Chỉnh sửa
        </MenuItem>

        <MenuItem sx={{color: 'error.main'}}>
          <Iconify icon={'eva:trash-2-outline'} sx={{mr: 2}}/>
          Delete
        </MenuItem>
      </Popover>

      <Dialog
        fullScreen
        open={openModalProduct}
        onClose={() => setOpenModalProduct(false)}
      >
        <AppBar sx={{ position: 'relative' }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={() => setOpenModalProduct(false)}
              aria-label="close"
            >
              {/* <CloseIcon /> */}
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
              Tạo mới sản phẩm
            </Typography>
            <Button autoFocus color="inherit" onClick={() => handleSubmit(saveProduct)}>
              Lưu
            </Button>
          </Toolbar>
        </AppBar>
        <Box padding="20px">
          <Controller
            name="name"
            control={control}
            defaultValue={product?.name || ''}
            rules={{
              validate: {
                required: (value) => (value.length ? true : "Không được bỏ trống"),
              },
            }}
            render={({ onChange, value }) => {
              return (
                <TextField
                  label={'Tên sản phẩm'}
                  size={'small'}
                  fullWidth
                  variant="outlined"
                  onChange={onChange}
                  value={value || ''}
                  error={!!errors?.name}
                  helperText={errors?.name?.message}
                />
              );
            }}
          />
        </Box>
        <Box padding="20px">
          <Controller
            name="sku"
            control={control}
            defaultValue={product?.sku || ''}
            rules={{
              validate: {
                required: (value) => (value.trim().length ? true : "Không được bỏ trống"),
              },
            }}
            render={({ onChange, value }) => {
              return (
                <TextField
                  label={'Mã sản phẩm'}
                  size={'small'}
                  fullWidth
                  variant="outlined"
                  onChange={onChange}
                  value={value || ''}
                  error={!!errors?.sku}
                  helperText={errors?.sku?.message}
                />
              );
            }}
          />
        </Box>
        <Box padding="20px">
          <Controller
            name="category_id"
            control={control}
            defaultValue={product?.category_id || ''}
            rules={{
              validate: {
                required: (value) => (value.trim().length ? true : "Không được bỏ trống"),
              },
            }}
            render={({ onChange, value }) => {
              return (
                <TextField
                  label={'Danh mục sản phẩm'}
                  size={'small'}
                  fullWidth
                  variant="outlined"
                  onChange={onChange}
                  value={value || ''}
                  error={!!errors?.category_id}
                  helperText={errors?.category_id?.message}
                />
              );
            }}
          />
        </Box>
        <Box padding="20px">
          <Controller
            name="price"
            control={control}
            defaultValue={product?.price || ''}
            rules={{
              validate: {
                required: (value) => (value.trim().length ? true : "Không được bỏ trống"),
              },
            }}
            render={({ onChange, value }) => {
              return (
                <TextField
                  label={'Giá'}
                  type="number"
                  size={'small'}
                  fullWidth
                  variant="outlined"
                  onChange={onChange}
                  value={value || ''}
                  error={!!errors?.price}
                  helperText={errors?.price?.message}
                />
              );
            }}
          />
        </Box>
        <Box padding="20px">
          <Controller
            name="quatity"
            control={control}
            defaultValue={product?.quantity || ''}
            rules={{
              validate: {
                required: (value) => (value.trim().length ? true : "Không được bỏ trống"),
              },
            }}
            render={({ onChange, value }) => {
              return (
                <TextField
                  label={'Tồn kho'}
                  type="number"
                  size={'small'}
                  fullWidth
                  variant="outlined"
                  onChange={onChange}
                  value={value || ''}
                  error={!!errors?.quantity}
                  helperText={errors?.quantity?.message}
                />
              );
            }}
          />
        </Box>
        <Box padding="20px">
          <Controller
            name="description"
            control={control}
            defaultValue={product?.description || ''}
            rules={{
              validate: {
                required: (value) => (value.trim().length ? true : "Không được bỏ trống"),
              },
            }}
            render={({ onChange, value }) => {
              return (
                <TextField
                  multiline
                  rows={15}
                  label={'Mô tả sản phẩm'}
                  size={'small'}
                  fullWidth
                  variant="outlined"
                  onChange={onChange}
                  value={value || ''}
                  error={!!errors?.description}
                  helperText={errors?.description?.message}
                />
              );
            }}
          />
        </Box>
      </Dialog>
    </>
  );
}
