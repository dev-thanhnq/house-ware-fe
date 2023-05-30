import axios from 'axios';

export const apiAxios = axios.create({
  baseURL: `http://127.0.0.1:8000/api/`,
  headers: {
    post: {
      'Content-Type': 'application/json'
    }
  }
})

export default {
  login(data) {
    return apiAxios({
      method: 'post',
      url: '/admins/auth/login',
      data
    })
  },
  getAuthUser() {
    return apiAxios({
      method: 'get',
      url: 'admins/auth/me'
    })
  },
  getEmployee(data) {
    return apiAxios({
      method: 'get',
      url: 'admins/employees',
      params: data
    })
  },
  getProducts() {
    return apiAxios({
      method: 'get',
      url: 'products',
    })
  },
  getProduct(id) {
    return apiAxios({
      method: 'get',
      url: `products/${  id}`,
    })
  },
  deleteEmployee(id) {
    return apiAxios({
      method: 'delete',
      url: `admins/employees/${  id}`,
    })
  },
  updateEmployee(data, id) {
    return apiAxios({
      method: 'post',
      url: `admins/employees/${  id}`,
      data
    })
  },
}