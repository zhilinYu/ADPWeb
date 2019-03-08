<template>
  <el-container>
    <el-header class="header">
      <h1>PHICOMM</h1>
      <el-menu
        :default-active="activeIndex"
        class="el-menu-demo header_menu"
        mode="horizontal"
        background-color="#545c64"
        text-color="#fff"
        active-text-color="#ffd04b">
        <el-menu-item index="0">用户名</el-menu-item>
        <el-menu-item index="1" @click="userLogout">退出登录</el-menu-item>
      </el-menu>
    </el-header>
    <el-container>
      <el-aside width="180px" class="aside">
        <el-menu
          :default-active="activeIndex2"
          class="el-menu-vertical-demo aside_menu"
          background-color="#545c64"
          text-color="#fff"
          active-text-color="#ffd04b"
          :router="true">
          <el-menu-item index="/training_company" @click="clearState">
            <i class="el-icon-menu"></i>
            <span slot="title">单位管理</span>
          </el-menu-item>
          <el-menu-item index="/butt_reptile" @click="clearState">
            <i class="el-icon-menu"></i>
            <span slot="title">爬虫网站</span>
          </el-menu-item>
          <el-menu-item index="/class_manage" @click="clearState">
            <i class="el-icon-document"></i>
            <span slot="title">分类管理</span>
          </el-menu-item>
          <el-menu-item index="/subject_manage" @click="clearState">
            <i class="el-icon-setting"></i>
            <span slot="title">主体管理</span>
          </el-menu-item>
          <el-menu-item index="/distribution_list" @click="clearState">
            <i class="el-icon-setting"></i>
            <span slot="title">清洗分配</span>
          </el-menu-item>
          <el-menu-item index="/distribution_record_list" @click="clearState">
            <i class="el-icon-setting"></i>
            <span slot="title">分配记录</span>
          </el-menu-item>
          <el-menu-item index="/clean_list" @click="clearState">
            <i class="el-icon-setting"></i>
            <span slot="title">清洗列表</span>
          </el-menu-item>
          <el-menu-item index="/examine_data" @click="clearState">
            <i class="el-icon-setting"></i>
            <span slot="title">数据审核</span>
          </el-menu-item>
          <el-menu-item index="/user" @click="clearState">
            <i class="el-icon-setting"></i>
            <span slot="title">用户管理</span>
          </el-menu-item>
          <el-menu-item index="/crawler_modules" @click="clearState">
            <i class="el-icon-setting"></i>
            <span slot="title">任务管理</span>
          </el-menu-item>
          <el-menu-item index="/group" @click="clearState">
            <i class="el-icon-setting"></i>
            <span slot="title">分组管理</span>
          </el-menu-item>

          <el-submenu index="/data_deliver">
            <template slot="title">
              <i class="el-icon-setting"></i>
              <span slot="title">移交数据</span>
            </template>
            <el-menu-item index="/data_deliver" @click="clearState">待移交数据</el-menu-item>
            <el-menu-item index="/data_deliver/data_deliver_history" @click="clearState">移交历史</el-menu-item>
          </el-submenu>

          <el-submenu index="/data_test">
            <template slot="title">
              <i class="el-icon-setting"></i>
              <span slot="title">数据测试</span>
            </template>
             <el-menu-item index="/data_test" @click="clearState">测试记录</el-menu-item>
            <el-menu-item index="/data_test/test_status" @click="clearState">测试情况</el-menu-item>
            <el-menu-item index="/data_test/test_detail" @click="clearState">测试详情</el-menu-item>
            <el-menu-item index="/data_test/test_pic_detail" @click="clearState">图片详情</el-menu-item>
          </el-submenu>

          <el-menu-item index="/log" @click="clearState">
            <i class="el-icon-setting"></i>
            <span slot="title">日志</span>
          </el-menu-item>
          <el-submenu index="/back_config">
            <template slot="title">
              <i class="el-icon-location"></i>
              <span>配置管理</span>
            </template>
              <el-menu-item index="/back_config/ratio_config">移交配置</el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-main id="waterFall">
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
  import request from '../axios/request';
  import { baseUrl } from '../axios/env';
  export default {
    data() {
      return {
        activeIndex: '0',
        activeIndex2: '/training_company',
      };
    },
    created() {
      this.activeIndex2 = this.$route.path;
    },
    methods: {
      //清除sessionStorage中的状态
      clearState() {
        sessionStorage.clear();
      },
      userLogout(){
        let that = this;
        request.defaults.headers.common['Authorization'] = window.localStorage.getItem('token');
        request.post(`${baseUrl}/pic/manage/v1/logout`).then(function(result) {
          console.log(result);
          if (result.data.code === -11){
            window.localStorage.removeItem('token');
          }
        })
      }
    },
  }
</script>

<style>
  .el-container {
    height: 100%;
  }
  .header {
    padding: 0 !important;
  }
  .header > h1 {
    color: rgb(255, 115, 0);
    position: absolute;
    left: 24px;
    top: -5px;
    z-index: 999;
  }
  .header > .header_menu .el-menu-item {
    float: right;
  }
  .aside {
    height: 100%;
    background-color: rgb(84, 92, 100);
  }
  .aside .aside_menu {
    border-right: none;
  }
  .aside .aside_menu ul .el-menu-item {
    padding-left: 54px !important;
    font-size: 12px;
    background-color: #626e77 !important;
  }

  /* 搜索栏 */
  .search_header,.content_box {
    padding: 0;
  }
  .search_header .search_name {
    font-size: 14px;
    color: #606266;
  }
  .search_header,.el-input__inner {
    height: 30px;
  }
  .search_header .search_input {
    display: inline-block;
    width: 200px;
    margin-right: 10px;
  }
  .search_header .search_date {
    margin: 0 10px;
  }
  /* 解决时间控件对不齐问题 */
  .search_header .el-range-editor.el-input__inner {
    padding: 0px 10px;
  }

  /* 分页 */
  .el-pagination {
    margin-top: 30px;
  }

  /* 自定义表格 */
  .common_table {
    width: 100%;
    text-align: center;
    font-size: 1px;
    table-layout: fixed;
    border-collapse: collapse;
  }
  .common_table thead {
    color: #909399;
    user-select:none;
  }
  .common_table tbody {
    color: #606266;
  }
  .common_table th,
  .common_table td {
    border: 1px solid #ebeef5;
    padding: 10px;
  }
  .common_table tbody tr:nth-of-type(even) {
    background-color: #fafafa;
  }
  .common_table tbody tr:hover {
    background-color: #f5f7fa;
  }
  .common_table th:last-child,
  .common_table td:last-child {
    width: 20%;
  }
  .common_table .no_data {
    color: #909399;
    line-height: 40px;
  }
  .common_table .no_data:hover {
    background-color: #fff;
  }

  .common_table .caretWrapper {
    position: relative;
  }
  .common_table .upCaret {
    position: absolute;
    top: 4px;
    left: 0;
    width: 0;
    height: 0;
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-bottom: 4px solid #c0c4cc;
  }
  .common_table .downCaret {
    position: absolute;
    bottom: 3px;
    left: 0;
    width: 0;
    height: 0;
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-top: 4px solid #c0c4cc;
  }
  .common_table .upColor {
    border-bottom: 4px solid #409EFF;
  }
  .common_table .downColor {
    border-top: 4px solid #409EFF;
  }
  /*爬虫日期选择*/
  .el-input__icon{
    line-height: 30px;
  }
</style>
