<template>
  <div>
    <div class="page-title">图片爬虫列表<el-button @click="addCrawlerTask" type="primary" size="mini" class="new-btn">新建任务</el-button></div>
    <div class="page-title">
      <span class="apd-page-title">任务名称：</span>
      <el-input v-model.trim="subjectSearch" maxlength="30" @change="getSubjectName" @keyup.enter.native="searchResults" placeholder="请输入任务名称"></el-input>
      <el-button @click="searchResults" size="mini" type="primary">查询</el-button>
    </div>
    <el-table
      :data="tableData"
      border
      stripe
      @sort-change="handleSortChange"
      style="width: 100%">
      <el-table-column
        prop="taskNum"
        label="任务编号"
        width="160">
      </el-table-column>
      <el-table-column
        prop="subjectCount"
        label="主体数量">
      </el-table-column>
      <el-table-column
        :render-header="renderStatus">
        <template slot-scope="scope">
          {{scope.row.taskStatus}}
        </template>
      </el-table-column>
      <el-table-column
        prop="createBy"
        label="创建人员">
      </el-table-column>
      <el-table-column
        prop="taskUpdateTime"
        sortable
        label="更新时间">
      </el-table-column>
      <el-table-column
      label="站点数量">
      <template slot-scope="scope">
        <el-popover trigger="click" placement="top">
          <p v-for="(item,index) in scope.row.websites" :key="index">{{item.name}} : {{item.require_num}}</p>
          <div slot="reference" class="name-wrapper">
            <el-tag size="medium">{{ scope.row.websiteCount }}</el-tag>
          </div>
        </el-popover>
      </template>
    </el-table-column>

      <el-table-column
        label="操作"
        width="260">
        <template slot-scope="scope">
          <el-button
            size="mini"
            @click="mainDetail(scope.$index, scope.row)">主体</el-button>
          <el-button
            size="mini"
            :disabled="scope.row.start"
            @click="startCrawlerBatch(scope.$index, scope.row)">启动</el-button>
          <el-button
            size="mini"
            type="danger"
            :disabled="scope.row.start"
            @click="handleDelete(scope.$index, scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
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
  </div>
</template>

<script>
  import request from '../../axios/request';
  import { baseUrl } from '../../axios/env';
  import moment from 'moment';
  export default {
    name: "picCrawlerList",
    data() {
      return {
        subjectSearch:'',//主体名称搜索
        
        sortByUpdateTime: -1,  //更新时间排序     -1 : 降序      1 : 升序

        currentPage1:1,
        pageSize:20,
        totalNum:0,
        pRef: null,                                     //解决分页问题
        
        options:[{
          value:'',
          label:'全部'
        },{
          value:'1',
          label:'未启动'
        },{
          value:'2',
          label:'正在爬虫'
        },{
          value:'3',
          label:'爬虫完成'
        }],
        taskStatusSearch: '',//任务状态搜索

        tableData: [],
      };
    },
    mounted(){
      if(this.$route.query.pageFrom){                                      //如果是从添加页面返回过来就回到初始状态
        window.location.href = window.location.href.split('?')[0];         //去掉url上面的参数
        this.getSubjectList();
      }else{
        //获取sessionStorage中存储的数据
        this.subjectSearch = window.sessionStorage.getItem('taskListSubjectName') || '';
        this.taskStatusSearch = window.sessionStorage.getItem('taskListSubjectStatus') || '';
        this.sortByUpdateTime = parseInt(window.sessionStorage.getItem('sortByUpdateTime')) || -1;
        this.currentPage1 =  parseInt(window.sessionStorage.getItem('taskListCurrPage')) || 1;
        this.pageSize =parseInt(window.sessionStorage.getItem('taskListPageSize')) || 20;
        
        this.getSubjectList();
      }
      this.pRef = this.$refs.pagination;

    },
    methods: {
      //任务名称改变
      getSubjectName(val){
        window.sessionStorage.setItem('taskListSubjectName',val);
      },
      //查询结果
      searchResults(){
        this.tableData.splice(0,this.tableData.length);
        this.getSubjectList();
      },
      //新增任务
      addCrawlerTask: function() {
        this.$router.push("/crawler_modules/add_crawler_task");
      },
      //分页
      handleSizeChange(val) {
        console.log(`每页 ${val} 条`);
        this.pageSize = val;
        this.currentPage1 = 1;
        this.getSubjectList();
      },
      handleCurrentChange(val) {
        console.log(`当前页: ${val}`);
        console.log(this.pageSize);
        this.currentPage1 = val;
        this.getSubjectList();
      },
      //主体详情
      mainDetail(index, row) {
        console.log(index, row);
        this.$router.push({path:'/crawler_modules/task_subject_list',query:{taskId:row.id}});
      },
      //删除
      handleDelete(index, row) {
        console.log(index, row);
      },
      // 审核状态修改
      renderStatus(createElement) {
        let _this = this;
        let options = [];
        _this.options.forEach(item => {
          options.push(
            createElement("el-option", {
              props: {
                value: item.value,
                label: item.label
              }
            })
          )
        });
        return createElement('el-select',{
          class:"el-select-reset",
          props:{
            placeholder:'任务状态',
            value: _this.taskStatusSearch,
          },
          on: {
            input: value => {
              console.log(value);
              _this.taskStatusSearch = value;
              _this.pRef.internalCurrentPage = _this.currentPage1 = 1;       //解决分页问题
              _this.getSubjectList();
            }
          }
        },options)
      },
      //更新时间排序
      handleSortChange(column) {
        if(column.order == 'ascending') {
          this.sortByUpdateTime = 1;
        }else{
          this.sortByUpdateTime = -1;
        }
        this.pRef.internalCurrentPage = this.currentPage1 = 1;       //解决分页问题
        this.getSubjectList();
      },
      //启动爬虫
      startCrawlerBatch(index,row){
        console.log(row);
        let that = this;
        let paramsObj = {};
        paramsObj.taskId = row.id;
        paramsObj.itemNames = [];
        paramsObj.websites = [];
        row.subjects.forEach((item)=>{
          let subObj = {};
          subObj.subjectId = item['id_subject'];
          subObj.name = item.name;
          subObj.alias = item.alias;
          paramsObj.itemNames.push(subObj);
        });
        row.websites.forEach((item)=>{
          let webObj = {};
          webObj.url  = item['name'];
          webObj.count = item['require_num'];
          paramsObj.websites.push(webObj);
        });
        request.post(`${baseUrl}/pic/manage/v1/beginCrawlerTask`,paramsObj).then(function(res) {
          if (res.data.code === 0){
            that.common.msgModal("success", res.data.msg);
            row.start = 'disabled';
            row.taskStatus = '正在爬虫';
          }else {
             that.common.msgModal("warning", res.data.msg);
          }
        })
      },
      
      getSubjectList(){
        let subReg = /^[\u4E00-\u9FA5A-Za-z0-9]{0,30}$/;
        if (!subReg.test(this.subjectSearch)){
          this.common.msgModal("warning", "您输入的任务名称不合法!");
          return;
        }
        this.tableData = [];
        let that = this;
        let requestUrl = `${baseUrl}/pic/manage/v1/getCrawlerBatchList?name=${that.subjectSearch}&state=${that.taskStatusSearch}&sort=${that.sortByUpdateTime}&perPageSize=${that.pageSize}&currentPage=${that.currentPage1}`;
        request.get(requestUrl).then(function(res) {
          if (res.data.code === 0){
            that.totalNum = res.data.data.totalCount;
            that.currentPage1 = res.data.data.currentPage;
            that.pRef.internalCurrentPage = that.currentPage1;

            let result = res.data.data.result;
            // console.log(res.data.data.currentPage);
            // that.pageSize = result.length;
            for (let i = 0; i<result.length;i++){
              let websitesNum = '';
              let task = {
                taskNum:result[i].batch_serial_num,
                subjectCount:result[i].subjects.length,
                taskStatus:'',
                taskEndTime:result[i].finish_time === null?'':moment(result[i].finish_time).format('YYYY-MM-DD HH:mm:ss'),
                requireCount:result[i].require_num,
                actualCount:result[i].really_num,
                createBy:result[i].creator,
                taskUpdateTime:result[i].updated === null?'':moment(result[i].updated).format('YYYY-MM-DD HH:mm:ss'),
                websiteCount:'',
                id:result[i]['_id'],
                subjects:result[i].subjects,
                websites:result[i].websites,
              };
              if (result[i].state === 1){
                task.taskStatus = '未启动';
                task.start=false
              }else if(result[i].state === 2){
                task.taskStatus = '正在爬虫';
                task.start='disabled';
              }else if (result[i].state === 3) {
                task.taskStatus = '爬虫完成';
                task.start='disabled';
              }

              for (let j = 0;j<result[i].websites.length;j++){
                websitesNum =websitesNum +' '+ result[i].websites[j].name+'-'+result[i].websites[j]['require_num'];
              }
              task.websiteCount = result[i].websites.length;
              that.tableData.push(task);
            }
            //保存状态到sessionStorage
            that.saveStatus();
          }

        })

      },

      //保存状态到sessionStorage
      saveStatus() {
        window.sessionStorage.setItem('taskListSubjectName',this.subjectSearch);
        window.sessionStorage.setItem('taskListSubjectStatus',this.taskStatusSearch);
        window.sessionStorage.setItem('sortByUpdateTime',this.sortByUpdateTime);
        window.sessionStorage.setItem('taskListPageSize',this.pageSize);
        window.sessionStorage.setItem('taskListCurrPage',this.currentPage1);
      },

    }
  };
</script>

<style scoped>
  .page-title{
    margin-bottom:20px;
  }
  .apd-page-title{
    color: #606266;
    font-size: 14px;
  }
  .new-btn{
    float:right;

  }
  .el-input{
    width: 200px;
  }
</style>
