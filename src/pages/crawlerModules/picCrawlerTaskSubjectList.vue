<template>
  <div>
    <div class="app-nav">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/crawler_modules' }">任务管理</el-breadcrumb-item>
        <el-breadcrumb-item>主体列表</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="search-box">
      <label class="adp-page-title">主体名称:</label>
      <el-input v-model.trim="subjectName" maxlength="30" @keyup.enter.native="searchResults" placeholder="请输入主体名称"></el-input>
      <el-button @click="searchResults" type="primary" size="mini">查询</el-button>
    </div>
    <table class="common_table" width="100%">
      <thead>
        <tr>
          <th>主体名称</th>
          <th>
            <el-select v-model="taskStatus" placeholder="任务状态" @change="taskChange">
                <el-option
                  v-for="(item, index) in taskStatuss"
                  :key="index"
                  :label="item.label"
                  :value="item.value">
                </el-option>
              </el-select>
          </th>
          <th>要求数量</th>
          <th>爬虫数量</th>
          <th class="sort-th" @click="dateSort($event, '')">
            更新时间
            <span class="caretWrapper">
                <i :class="{upCaret: true, upColor: dateSortType[0]}" @click="dateSort($event, 0)"></i>
                <i :class="{downCaret: true, downColor: dateSortType[1]}" @click="dateSort($event, 1)"></i>
              </span>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr class="no_data" v-if="tableData.length === 0"><td colspan="5">暂无数据</td></tr>
        <tr v-for="(item,index) in tableData" :key="index">
          <td>{{item.name}}</td>
          <td>{{item['task_status'] == 1 ? '未启动' : (item['task_status'] == 2 ? '正在爬虫' : '爬虫完成')}}</td>
          <td>{{item['total_crawler']}}</td>
          <!-- <td><router-link :to="{path:'/crawler_modules/crawler_detail',query:{id:item['_id'],taskId:item['id_task']}}">{{item['real_num_crawler']}}</router-link></td> -->
          <td><router-link :to="{path:'/show_pic',query:{id:item['_id'],pageFrom: 3,taskId:item['id_task']}}">{{item['real_num_crawler']}}</router-link></td>
          <td>{{item.updatedTime}}</td>
        </tr>
      </tbody>
    </table>
    <div>
      <el-pagination
        ref="pagination"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-sizes="[10, 20, 30, 100]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="totalNum">
      </el-pagination>
    </div>
  </div>
</template>

<script>
  import request from '../../axios/request';
  import { baseUrl } from '../../axios/env';
  export default {
    name: "picCrawlerTaskSubjectList",
    data(){
      return{
        listParams:{
        },
        tableData:[],
        subjectName:'',

        taskStatuss: [{     //任务状态
          value: '',
          label: '全部',
        },{
          value: 1,
          label: '未启动',
        },{
          value: 2,
          label: '正在爬虫',
        },{
          value: 3,
          label: '爬虫完成',
        }],
        taskStatus: null,

        //分页
        totalNum:0,
        currentPage:1,
        pageSize:20,

        sortByUpdateTime: -1,              //更新时间排序     -1 : 降序      1 : 升序
        dateSortType: [false, false],      // 时间排序样式
      }
    },

    computed:{
      taskId:function () {
        return this.$route.query.taskId;
      }

    },
    created(){
      console.log(this.$route.query);
    },
    mounted(){
      this.currentPage =  window.sessionStorage.getItem('taskSubjectListCurrPage')?parseInt(window.sessionStorage.getItem('taskSubjectListCurrPage')):1;
      this.pageSize = window.sessionStorage.getItem('taskSubjectListPageSize')?parseInt(window.sessionStorage.getItem('taskSubjectListPageSize')):20;
      this.getTaskSubjectList(this.taskId,this.subjectName,this.taskStatus,this.sortByUpdateTime,this.pageSize,this.currentPage);
      this.pRef = this.$refs.pagination;
    },
    methods:{
      //任务状态
      taskChange(val) {
        console.log(val);
        this.taskStatus = val;
        this.getTaskSubjectList(this.taskId,this.subjectName,this.taskStatus,this.sortByUpdateTime,this.pageSize,this.currentPage);
      },
      //分页
      handleSizeChange(val) {
        console.log(`每页 ${val} 条`);
        this.pageSize = val;
        this.currentPage = 1;
        window.sessionStorage.setItem('taskSubjectListPageSize',val);
        this.getTaskSubjectList(this.taskId,this.subjectName,this.taskStatus,this.sortByUpdateTime,this.pageSize,this.currentPage);
      },
      handleCurrentChange(val) {
        console.log(`当前页: ${val}`);
        this.currentPage = val;
        window.sessionStorage.setItem('taskSubjectListCurrPage',val);
        this.getTaskSubjectList(this.taskId,this.subjectName,this.taskStatus,this.sortByUpdateTime,this.pageSize,this.currentPage);
      },
      //更新时间排序
      dateSort(evt, item) {
        evt.stopPropagation();
        this.THSort(item, "dateSortType");
      },
      THSort(item, type) {
        console.log(type);
        if (item === "") {
          if (this[type][0] === this[type][1]) {
            this[type] = [true, false];
            this.sortByUpdateTime = 1;
          } else {
            if (this[type][0] === true) {
              this[type] = [false, true];
              this.sortByUpdateTime = -1;
            } else if (this[type][0] === false) {
              this[type] = [false, false];
              this.sortByUpdateTime = -1;
            }
          }
        } else if (item === 0) {
          this[type] = [true, false];
          this.sortByUpdateTime = 1;
        } else {
          this[type] = [false, true];
          this.sortByUpdateTime = -1;
        }
        console.log(this.sortByUpdateTime);
        this.getTaskSubjectList(this.taskId,this.subjectName,this.taskStatus,this.sortByUpdateTime,this.pageSize,this.currentPage);
      },
      //获取主体列表
      getTaskSubjectList(id,name,taskStatus,sortByUpdateTime,pageSize,curPage){
        let _this = this;
        request.post('/pic/manage/v1/getBodyByTaskId',{
          'id': id,
          'name': name,
          'taskStatus': taskStatus,
          'sortByUpdateTime': sortByUpdateTime,
          'pageSize': pageSize,
          'curPage': curPage,
        })
        .then(function(res) {
          if (res.data.code === '0'){
            _this.tableData = res.data.data.list;
            _this.totalNum = res.data.data.totalCount;
            _this.currentPage = res.data.data.curPage;

            _this.pRef.internalCurrentPage =res.data.data.curPage;
          }
        })
      },
      //主体名称搜索
      searchResults(){
        let subReg = /^[\u4E00-\u9FA5A-Za-z0-9]{0,30}$/;
        if (!subReg.test(this.subjectName)){
          this.common.msgModal("warning", '您输入的主体信息不合法');
        }else {
          this.getTaskSubjectList(this.taskId,this.subjectName,this.taskStatus,this.sortByUpdateTime,this.pageSize,this.currentPage);
        }
      }
    }
  };
</script>

<style scoped>
  .app-nav{
    margin-bottom: 20px;
  }
  .search-box{
    margin-bottom: 20px;
  }
  .adp-page-title{
    color: #606266;
    font-size: 14px;
  }
  .el-input{
    width: 200px;
  }
</style>
