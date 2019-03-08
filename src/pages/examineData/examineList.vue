<template>
  <el-container v-loading="loading">
    <!-- 搜索栏 -->
    <el-header class="search_header">
      <span class="search_name">主体名称</span>
      <el-input class="search_input" v-model="mainName" placeholder="请输入主体名称" maxlength="30" @keyup.enter.native="onSearch"></el-input>
      <span class="search_name">清洗人</span>
      <el-input class="search_input" v-model="cleaner" placeholder="请输入清洗人" maxlength="30" @keyup.enter.native="onSearch"></el-input>      
      <el-button type="primary" size="mini" @click="onSearch">查询</el-button>
    </el-header>
    <el-main>
      <el-table
        :data="auditData"
        v-loading="loading"
        border
        stripe
        @sort-change="handleSortChange">
        <el-table-column
          label="序号"
          width="50">
          <template slot-scope="scope">
            {{(curPage-1)*pageSize+scope.$index+1}}
          </template>
        </el-table-column>
        <el-table-column
          prop="name"
          label="主体名称">
        </el-table-column>
        <el-table-column
          width="165"
          :render-header="renderStatus">
          <template slot-scope="scope">
            {{scope.row.manual_review_status == 1 ? '待审核' : (scope.row.manual_review_status == 2 ? '退回' : '审核通过')}}
          </template>
        </el-table-column>
        <el-table-column
          prop="real_num_crawler"
          label="原始数量">
        </el-table-column>
        <el-table-column
          prop="total_clean"
          label="有效数量">
        </el-table-column>
        <el-table-column
          label="删除数量">
          <template slot-scope="scope">
            {{scope.row.real_num_crawler - scope.row.total_clean}}
          </template>
        </el-table-column>
        <el-table-column
          prop="cleaner"
          label="清洗人">
        </el-table-column>
        <el-table-column
          sortable="custom"
          prop="cleanCompletedDate"
          label="完成时间">
        </el-table-column>
        <el-table-column
          prop="manual_reviewer"
          label="审核人">
        </el-table-column>
        <el-table-column
          sortable="custom"
          prop="manualReviewDate"
          label="审核时间">
        </el-table-column>
        <el-table-column
          label="操作">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="detail(scope.row)">详情</el-button>
            <el-button :disabled="scope.row.manual_review_status != 1 ? true : false" type="text" size="small" @click="auditPass(scope.row,$event)">通过</el-button>
            <el-button :disabled="scope.row.manual_review_status != 1 ? true : false" type="text" size="small" @click="auditBack(scope.row,$event)">退回</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination 
        ref="pagination"
        :current-page="curPage"
        :page-sizes="[10, 20, 30, 100]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="sizeChange"
        @current-change="currentChange"
        :total="totalCount">
      </el-pagination>
    </el-main>
  </el-container>
</template>

<script>
import { CLEANDATA_STATUS } from '../../lib/consts';

export default {
  data() {
    return {
      loading: false,
      mainName: '',
      cleaner: '',   
      auditData: [],                                  // 审核数据                                    
      
      auditStatus: CLEANDATA_STATUS,                  // 审核状态
      auditValue: '',

      sortByFinishTime: '',                           // 排序
      sortByAuditTime: '',

      curPage: 1,
      pageSize: 20,
      totalCount: 0,
      pRef: null,                                     //解决分页问题
    };
  },
  mounted() {
    let _this = this; 

    //获取sessionStorage中存储的数据
    _this.mainName = sessionStorage.getItem('mainName') || '';
    _this.cleaner = sessionStorage.getItem('cleaner') || '';
    _this.auditValue = JSON.parse(sessionStorage.getItem('auditValue'));
    _this.sortByFinishTime = JSON.parse(sessionStorage.getItem('sortByFinishTime')) || -1;
    _this.sortByAuditTime = JSON.parse(sessionStorage.getItem('sortByAuditTime')) || -1;
    _this.pageSize = JSON.parse(sessionStorage.getItem('pageSize')) || 20;
    _this.curPage = JSON.parse(sessionStorage.getItem('mainCurPage')) || 1;
    //获取主体列表
    _this.getMainList();
    //解决分页跳转问题
    _this.pRef = _this.$refs.pagination;
    _this.pRef.internalCurrentPage = _this.curPage;
  },
  methods: {
    // 主体搜索功能
    onSearch() {
      this.getMainList();
    },

    // 审核状态修改
    renderStatus(createElement) {
      let _this = this;
      let options = [];
      _this.auditStatus.forEach(item => {
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
          placeholder:'审核状态',
          value: _this.auditValue,
        },
        on: {
          input: value => {
            console.log(value);
            _this.auditValue = value;
            _this.pRef.internalCurrentPage = _this.curPage = 1;       //解决分页问题
            _this.getMainList();
          }
        }
      },options)
    },

    //时间排序
    handleSortChange(column) {
      if(column.prop == 'finishTime'){                 //完成时间排序
        if(column.order == 'ascending') {
          this.sortByFinishTime = 1;
        }else{
          this.sortByFinishTime = -1;
        }
      }else{                                            //审核时间排序
        if(column.order == 'ascending') {
          this.sortByAuditTime = 1;
        }else{
          this.sortByAuditTime = -1;
        }
      }
      this.pRef.internalCurrentPage = this.curPage = 1;       //解决分页问题
      this.getMainList();
    },

    //详情
    detail(item) {
      this.$router.push({ path: '/show_pic', query:{id:item['_id'],pageFrom: 4} });
    },
    
    //审核通过
    auditPass(item,evt) {
      let _this = this;
      _this.$confirm('您确定要审核通过此主体吗?', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        _this.loading = true;
        _this.axios.post('/pic/manage/v1/picCopyToAlgorithm',{subjectId: item._id, classify: 1,manualReviewStatus: 3})
        .then(function (res) {
          _this.loading = false;
          if(res.data.code == '0'){
            item.manual_review_status = 3;
            _this.common.msgModal('success','审核通过');
          }else{
            _this.common.msgModal('error','审核失败');
          }
        });
      }).catch(() => {});
    },

    //审核退回
    auditBack(item,evt) {
      let _this = this;
      _this.$confirm('您确定要退回此主体吗?', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        _this.loading = true;
        _this.axios.post('/pic/manage/v1/manualReviewBack',{id: item._id, manualReviewStatus: 2})
        .then(function (res) {
          _this.loading = false;
          if(res.data.code === '0'){
            item.manual_review_status = 2;
            _this.common.msgModal('success',res.data.msg);
          }
        });
      }).catch(() => {});
    },

    // 修改每页展示数量
    sizeChange(size) {
      this.pageSize = size;
      this.pRef.internalCurrentPage = this.curPage = 1;       //解决分页跳转问题
      this.getMainList();
    },
    // 修改页码
    currentChange(page) {
      this.pRef.internalCurrentPage = this.curPage = page;       //解决分页跳转问题
      this.getMainList();
    },

    // 获取主体列表
    getMainList() {
      this.mainName = this.mainName.trim();
      this.cleaner = this.cleaner.trim();
      let a = /^[\u4E00-\u9FA5A-Za-z0-9\/]{0,30}$/;
      if (!this.mainName.match(a)) {
        this.common.msgModal("warning", "您输入的主体名称不合法!");
        return;
      }
      let _this = this;
      let params = {
        name: _this.mainName,
        cleaner: _this.cleaner,
        cleanStatus: 3,
        manualReviewStatus: _this.auditValue,
        sortByCompleted: _this.sortByFinishTime,
        sortByManualReviewDate: _this.sortByAuditTime,
        pageSize: _this.pageSize,
        curPage: _this.curPage,
      }
      _this.loading = true;
        _this.axios.post('/pic/manage/v1/getMainBody',params)
        .then(function (res) {
          _this.loading = false;
          if(res.data.code == 0){
            _this.totalCount = res.data.data.totalCount;
            _this.auditData = res.data.data.list;
          }
        });

      //保存状态到sessionStorage
      _this.saveStatus();
    },

    //保存状态到sessionStorage
    saveStatus() {
      sessionStorage.setItem('mainName',this.mainName);
      sessionStorage.setItem('cleaner',this.cleaner);
      sessionStorage.setItem('auditValue',this.auditValue); 
      sessionStorage.setItem('sortByFinishTime',this.sortByFinishTime); 
      sessionStorage.setItem('sortByAuditTime',this.sortByAuditTime); 
      sessionStorage.setItem('pageSize',this.pageSize); 
      sessionStorage.setItem('curPage',this.curPage); 
    },
  }
};
</script>

<style scoped>
.el-main {
  padding: 0;
}
</style>

