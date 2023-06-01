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
  createProduct(data = {}) {
    return apiAxios({
      method: 'post',
      url: `products`,
      data,
      headers: {
        post: {
          'Content-Type': 'multipart/form-data'
        }
      }
    })
  },
  deleteProduct(id) {
    return apiAxios({
      method: 'delete',
      url: `products/${  id}`,
    })
  },
  getAllCategories() {
    return apiAxios({
      method: 'get',
      url: 'categories/all',
    })
  },
  createCategory(data) {
    return apiAxios({
      method: 'post',
      url: `categories`,
      data,
    })
  },
  deleteCategory(id) {
    return apiAxios({
      method: 'delete',
      url: `categories/${  id}`,
    })
  },
}