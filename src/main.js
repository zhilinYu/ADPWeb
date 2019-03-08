// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
//引入element-ui
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import '../src/lib/filter'
Vue.use(ElementUI);

//引入二次封装的axios
import axios from './axios/request';
Vue.prototype.axios = axios;

//自定义公共方法
import Common from './components/common';
Vue.prototype.common = Common;


//引入公共样式
import "./styles/app.css";

Vue.config.productionTip = false;


router.beforeEach((to, from, next) => {
  // ...
  // console.log('hello world');
  next();
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
