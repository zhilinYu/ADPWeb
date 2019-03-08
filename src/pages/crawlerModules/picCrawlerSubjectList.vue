<template>
  <div class="adp-wrapper">
    <div class="app-nav">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/crawler_modules' }">任务管理</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/crawler_modules/add_crawler_task' }">新增爬虫</el-breadcrumb-item>

        <el-breadcrumb-item>主体列表</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div>
      <span class="adp-page-title">主体名称</span>
      <el-input type="text" v-model="subjectName" maxlength="30" placeholder="请输入主体名称"></el-input>
      <el-button @click="searchResults" type="primary" size="small">查询</el-button>
    </div>
    <div class="subject-list">
      <table class="common_table" cellspacing="0" cellpadding="0" width="100%">
        <thead>
          <tr>
            <th width="100">
              <span class="adp-checkbox-input">
                <span class="adp-checkbox-inner" :class="{'is-checked':allChecked}"  @click="selectSubject">
                </span>
                <input class="adp-input" type="checkbox"  />
              </span>
            </th>
            <th>名称</th>
            <th>
              <el-cascader
                placeholder="类型"
                :options="options"
                filterable
                v-model="categoryIds"
                @change="getType"></el-cascader>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr class="no_data" v-if="tableData.length === 0"><td colspan="3">暂无数据</td></tr>
          <tr v-for="(item, index) in tableData" :key="index">
            <td>
              <span class="adp-checkbox-input">
                <span class="adp-checkbox-inner" :class="{'is-checked':isChecked}"  @click="selectedBox($event,item.name,item['_id'],item.alias)">
                </span>
                <input class="adp-input" type="checkbox"  />
              </span>

            </td>
            <td>{{item.name}}</td>
            <td>{{item['category_level1_value']}}/{{item['category_level2_value']}}/{{item['category_value']}}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div>
      <el-pagination
        ref="pagination"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage1"
        :page-sizes="[10, 20, 30, 100]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="totalNum">
      </el-pagination>
    </div>
    <div class="adp-button-group">
      <el-button type="primary" plain @click="callOff">取消</el-button>
      <el-button type="primary" @click="addSubjectToList">添加</el-button>
    </div>
  </div>
</template>

<script>
  import {filterCategory } from '../../lib/common';
  import request from '../../axios/request';
  import { baseUrl } from '../../axios/env';
  export default {
    name: "picCrawlerSubjectList",
    data(){
      return{
        options:[],
        categoryId:'',
        categoryIds:[],
        value:'1',
        tableData:[],
        checked:false,

        totalNum:0,
        currentPage1:1,
        pageSize:20,

        isChecked:false,
        allChecked:false,

        subjectName:'',
        listParams:{'auditStatus':3,'pageSize':20,'taskStatus':0,"alreadyInTask":1},

        subTaskArr:[]
      }
    },
    mounted(){
      this.currentPage1 = window.sessionStorage.getItem('subjectListCurrPage')?parseInt(window.sessionStorage.getItem('subjectListCurrPage')):1;
      this.pageSize = window.sessionStorage.getItem('subjectListPageSize')?parseInt(window.sessionStorage.getItem('subjectListPageSize')):20;
      this.pRef = this.$refs.pagination;
      this.getSubjectList(this.listParams);
      this.getCategory();

    },
    methods:{
      //分页
      handleSizeChange(val) {
        console.log(`每页 ${val} 条`);
        this.listParams['pageSize'] = val;
        this.listParams['curPage'] = 1;
        window.sessionStorage.setItem('subjectListPageSize',val);
        this.isChecked = false;
        this.allChecked = false;
        this.getSubjectList(this.listParams);
      },
      handleCurrentChange(val) {
        console.log(`当前页: ${val}`);
        this.listParams['curPage'] = val;
        window.sessionStorage.setItem('subjectListCurrPage',val);
        this.isChecked = false;
        this.allChecked = false;
        this.getSubjectList(this.listParams);
      },
      getCategory(){
        let that = this;
        request.get('/pic/manage/v1/getCategory').then(function(res) {
          let classification = res.data.data;
          let newCategory = filterCategory(classification);
          newCategory.unshift({value: '',label: '全部'});
          that.options = newCategory;
        })
      },
      getType(val){
        this.categoryId = val[val.length-1];
        this.categoryIds = val;
        if (val !== ''){
          this.listParams.categoryId = this.categoryId;
        }
        this.getSubjectList(this.listParams);
      },
      // 全选
      selectSubject(){
        if (this.subTaskArr.length > 200){
          this.common.msgModal("warning", '超过最大添加数量');
          return false;
        }
        if (this.isChecked){
          this.isChecked = false;
          this.allChecked = false;
          this.subTaskArr.splice(0,this.subTaskArr.length);
        }else {
          this.isChecked = true;
          this.allChecked = true;
          for (let i = 0;i<this.tableData.length;i++){
            let subObj={};
            subObj.name = this.tableData[i].name;
            subObj.id = this.tableData[i]['_id'];
            subObj.alias = this.tableData[i].alias;
            this.subTaskArr.forEach((item,index)=>{
              if (item.id === subObj.id){
                this.subTaskArr.splice(index,1);
              }
            });
            this.subTaskArr.push(subObj);
          }
        }
      },
      //单个勾选
      selectedBox(e,name,sId,alias){
        let _this = e.target,subObj = {};
        if (this.subTaskArr.length > 200){
          this.common.msgModal("warning", '超过最大添加数量');
          return false;
        }
        if (_this.classList.contains('is-checked')){
          _this.classList.remove('is-checked');
          this.allChecked = false;
          for (let i =0;i<this.subTaskArr.length;i++){
            if (this.subTaskArr[i].id === sId){
              this.subTaskArr.splice(i,1);
            }
          }
          if (this.subTaskArr.length === 0){
            this.isChecked = false;
          }
        }else {
          _this.classList.add('is-checked');
          subObj.name = name;
          subObj.id = sId;
          subObj.alias = alias;
          this.subTaskArr.push(subObj);
        }
      },
      //添加主体到缓存
      addSubjectToList(){
        if (this.subTaskArr.length === 0){
          this.common.msgModal("warning", '请勾选主体');
          return false;
        }
        window.sessionStorage.setItem('subTask',JSON.stringify(this.subTaskArr));
        this.$router.back(-1);
      },
      //取消选择
      callOff(){
        this.$router.back(-1);
      },
      //主体名称查询
      searchResults(){
        let subReg = /^[\u4E00-\u9FA5A-Za-z0-9]{0,30}$/;
        if (!subReg.test(this.subjectName)){
          this.common.msgModal("warning", '您输入的主体信息不合法');
        }else {
          this.listParams['name'] = this.subjectName;
          this.getSubjectList(this.listParams);
        }

      },
      //获取主体列表
      getSubjectList(subObj){
        let that = this;
        request.post(`${baseUrl}/pic/manage/v1/getMainBody`,subObj).then(function(res) {
          if (res.data.code === "0"){
            that.totalNum = res.data.data.totalCount;
            that.currentPage1 = res.data.data.curPage;
            that.pRef.internalCurrentPage =res.data.data.curPage;
            that.tableData = res.data.data.list;

          }
        })
      }
    }
  };
</script>

<style scoped>
  .adp-wrapper{
    position: relative;
  }
  .adp-button-group{
    text-align: center;
    margin: 20px 0;
  }
  .adp-page-title{
    font-size: 14px;
    color: #606266;
  }
  .app-nav{
    margin-bottom: 20px;
  }
  .el-input{
    width: 200px;
  }
  .common_table th:last-child{
    width: auto!important;
  }
  .subject-list{
    margin-top: 20px;
  }
  .adp-checkbox-input{
    cursor: pointer;
    outline: 0;
    line-height: 1;
    vertical-align: middle;
  }
  .adp-checkbox-inner{
    display: inline-block;
    position: relative;
    border: 1px solid #dcdfe6;
    border-radius: 2px;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    width: 14px;
    height: 14px;
    background-color: #fff;
    z-index: 1;
    -webkit-transition: border-color .25s cubic-bezier(.71,-.46,.29,1.46),background-color .25s cubic-bezier(.71,-.46,.29,1.46);
    transition: border-color .25s cubic-bezier(.71,-.46,.29,1.46),background-color .25s cubic-bezier(.71,-.46,.29,1.46);
  }
  .adp-checkbox-inner.is-checked{
    background: #409eff;
    border-color:#409eff;
  }
  .adp-checkbox-inner.is-checked::after{
    -webkit-transform: rotate(45deg) scaleY(1);
    transform: rotate(45deg) scaleY(1);
  }
  .adp-checkbox-inner::after{
    -webkit-box-sizing: content-box;
    box-sizing: content-box;
    content: "";
    border: 1px solid #fff;
    border-left: 0;
    border-top: 0;
    height: 7px;
    left: 4px;
    position: absolute;
    top: 1px;
    -webkit-transform: rotate(45deg) scaleY(0);
    transform: rotate(45deg) scaleY(0);
    width: 3px;
    -webkit-transition: -webkit-transform .15s ease-in .05s;
    transition: -webkit-transform .15s ease-in .05s;
    transition: transform .15s ease-in .05s;
    transition: transform .15s ease-in .05s, -webkit-transform .15s ease-in .05s;
    transition: transform .15s ease-in .05s,-webkit-transform .15s ease-in .05s;
    -webkit-transform-origin: center;
    transform-origin: center;
  }
  .adp-input{
    opacity: 0;
    outline: 0;
    position: absolute;
    margin: 0;
    width: 0;
    height: 0;
    z-index: -1;
  }
</style>
