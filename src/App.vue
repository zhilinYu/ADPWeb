<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
#app {
  height: 100%;
}
body,html {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%
}
a {
  text-decoration: none;
}
a:active {
  text-decoration: none;
}
/* 字母、数字自动换行 */
td,th {
  word-break: break-all; 
}
/* 表格内容居中 */
.el-table .cell {
  text-align: center;
}
/* 为input、textarea、select设置统一的placeholder字体风格 */
input::-webkit-input-placeholder,textarea::-webkit-input-placeholder {
  font: 400 13.3333px Arial !important;
}

/* 解决删除按钮一直高亮问题 */
#app .delbtn:focus {
  background: #fff;
  border: 1px solid #dcdfe6;
  color: #606266;
}

/* .header_main {
  background-color: rgb(84, 92, 100);
}
.el-aside {
  background-color: #4c555a;
}
.el-main {
  position: relative;
  background-color: #fff;
  padding: 0;
}
.container_center {
  padding: 20px;
}
.el-submenu .el-menu-item {
  background-color: #626e77 !important;
  font-size: 13px;
  padding-left: 54px !important;
}
.is-opened > div {
  background-color: rgb(67,74,80) !important;
}
.is-opened .is-opened > div {
  background-color: rgb(84,92,100) !important;
} */
</style>
