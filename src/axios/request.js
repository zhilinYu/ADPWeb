import { baseUrl , filesystemUrl } from './env';
import axios from 'axios';
import Common from '../components/common';
// import {Message} from 'element-ui';
// import { getStore, setStore, removeStore } from './storage';

const service = axios.create({
  baseURL: baseUrl,
  timeout: 60000,
});

// request拦截器
service.interceptors.request.use(
  config => {
    // 发送请求之前，要做的业务
    if (window.localStorage.getItem('token')) {
      config.headers.Authorization = window.localStorage.getItem('token');
    }

    // 防止浏览器缓存http请求，在每个请求后面加上一个时间戳
    if (config.method == 'post' && config.url != `${filesystemUrl}/mainPic` && config.url != `${filesystemUrl}/typicalPic`) {
      config.data = {
        ...config.data,
        _t: Date.parse(new Date())/1000,
      }
    } else if (config.method == 'get') {
      config.params = {
        _t: Date.parse(new Date())/1000,
        ...config.params
      }
    }

    return config;
  },
  error => {
    // 错误处理代码
    return Promise.reject(error)
  }
)

service.interceptors.response.use(
  response => {
    // 数据响应之后，要做的业务
    if (response.data.code === -11) {
      // removeStore('token');
      window.location.hash = '#/login';
    }
    if (response.data.code == '-1'){
      response.data.msg && Common.msgModal("error", response.data.msg);
    }
    return response;
  },
  error => {
    return Promise.reject(error);
  }
)

export default service;
