<template>
  <div class="app-page">
    <header class="app-search search_header">
      <el-row :gutter="20">
        <el-col :span="16">
          <span class="search_name">分组名称</span>
          <el-input class="search_input" placeholder="请输入组名" maxlength="30" v-model="groupInput" @keyup.enter.native="queryHandle"></el-input>
          <el-button
            type="primary"
            size="mini"
            @click="queryHandle">查询</el-button>
        </el-col>
        <el-col :span="8">
          <el-row class="app-btn-group">
            <el-button type="primary" size="mini" @click="addGroup">新建</el-button>
          </el-row>
        </el-col>
      </el-row>
    </header>
    <main class="app-list">
      <el-table
        :data="groupList"
        style="width: 100%"
        v-loading="isLoading"
        border
        @sort-change="sortChange">
        <el-table-column
          prop="name"
          label="组名"
          width="180">
        </el-table-column>
        <el-table-column
          prop="desc"
          label="描述">
        </el-table-column>
        <el-table-column
          prop="update_time"
          label="更新时间"
          width="180"
          sortable="custom">
        </el-table-column>
        <el-table-column
          fixed="right"
          label="操作"
          width="160">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="gotoMembers(scope.row)">组员</el-button>
            <el-button type="text" size="small" @click="editGroup(scope.row)">编辑</el-button>
            <el-button type="text" size="small" @click="deleteGroup(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        ref="pagination"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="pagingInfo.currentPage"
        :page-sizes="[10, 20, 30, 100]"
        :page-size="pagingInfo.perPageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="pagingInfo.totalCount">
      </el-pagination>
    </main>
  </div>
</template>

<script>
  import request from '../../axios/request';
  import { baseUrl } from '../../axios/env';
  export default {
    name: "groupListMain",
    data(){
      return{
        isLoading:false,
        groupInput:"",
        groupList:[],
        //分页参数
        pagingInfo:{
          currentPage:1,
          perPageSize:20,
          totalPages:1,
          totalCount:1,
          sort:-1
        },
        pRef: null,                  //解决分页问题
      }
    },
    mounted() {
      //解决分页跳转问题
      this.pRef = this.$refs.pagination;
      this.pRef.internalCurrentPage = this.pagingInfo.currentPage;
    },
    created:function(){
      //获取sessionStorage中的数据
      this.groupInput = sessionStorage.getItem('groupInput') || '';
      this.pagingInfo.sort = JSON.parse(sessionStorage.getItem('sortByUpdateTime')) || -1;
      this.pagingInfo.perPageSize = JSON.parse(sessionStorage.getItem('perPageSize')) || 20;
      this.pagingInfo.currentPage = JSON.parse(sessionStorage.getItem('curPage')) || 1;
      this.getGroupList(this.pagingInfo.currentPage);
    },
    methods:{
      /**
       * 分页逻辑处理
       */
      handleSizeChange(val) {
        this.pagingInfo.perPageSize = val;
        this.pRef.internalCurrentPage = this.pagingInfo.currentPage = 1;       //解决分页跳转问题
        this.getGroupList(this.pagingInfo.currentPage);
      },
      handleCurrentChange(val) {
        this.pRef.internalCurrentPage = this.pagingInfo.currentPage = val;       //解决分页跳转问题
        this.getGroupList(this.pagingInfo.currentPage);
      },
      /**
       * 输入处理
       */
      // inputHandle:function(val){
      //   console.log(val);
      //   this.groupInput = val;
      // },
      // clearHandle:function(val){
      //   console.log(val)
      //   this.groupInput = "";
      //   this.pagingInfo.currentPage = 1;
      //   this.pagingInfo.totalPages = 1;
      //   this.pagingInfo.totalCount = 1;
      //   this.getGroupList(1);
      // },
      queryHandle:function(){
        this.pRef.internalCurrentPage = this.currentPage = 1;      //解决分页问题
        this.getGroupList(1);
      },
      sortChange:function(e) {
        console.log(e);
        if(e.order=="ascending"){//升序
          this.pagingInfo.sort = 1;
        }else{                   //降序
          this.pagingInfo.sort = -1;
        }
        this.getGroupList(this.pagingInfo.currentPage);
      },
      /**
       * 获取组列表数据
       */
      getGroupList:function(page) {
        this.groupInput = this.groupInput.trim();        //清楚数据两端的空格
        let a = /^[\u4E00-\u9FA5A-Za-z0-9\/]{0,30}$/;
        if (!this.groupInput.match(a)) {
          this.common.msgModal("error", "您输入的分组名称不合法!");
          return;
        }
        let self = this,
          params = `name=${this.groupInput}&sort=${this.pagingInfo.sort}&currentPage=${page}&perPageSize=${this.pagingInfo.perPageSize}`;
        let requestUrl = `${baseUrl}/pic/manage/v1/getGroupList?${params}`;
        this.isLoading = true;
        request.get(requestUrl)
          .then(function(res) {
            console.warn("================获取分组列表================")
            console.log(res);
            if(res.status===200&&res.data.code===0){
              var result = res.data.data;
              self.isLoading = false;
              self.pagingInfo.currentPage = result.currentPage;
              self.pagingInfo.totalPages = result.totalPages;
              self.pagingInfo.totalCount = result.totalCount;
              self.groupList = result.result;
              self.saveStatus(page);                             //保存状态到sessionStorage
            }else{
              self.isLoading = false;
              self.groupList = [];
              self.pagingInfo.currentPage = 1;
              self.pagingInfo.totalPages = 1;
              self.pagingInfo.totalCount = 1;
            }
          }).catch(function(err) {
            self.isLoading = false;
            self.$message({
              type: 'error',
              message: '请检查您的网络连接是否正常！'
            });
          });
      },
      /**
       * 页面跳转
       */
      addGroup:function() {
        this.$router.push({path:'/group/add_edit_group',query:{pageType:"0"}});
      },
      editGroup:function(item) {
        this.$router.push({path:'/group/add_edit_group',query:{
            pageType:"1",
            id:item._id
        }});
      },
      gotoMembers:function(item){
        this.$router.push({path:'/group/members',query:{id:item._id}});
      },
      deleteGroup:function(item) {
        var self = this;
        this.$confirm('确认删除该分组信息吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          self.deletePost(item);
        }).catch(() => {
          console.log("取消了删除操作！");

        });

      },
      deletePost:function(item) {
        var self = this,
          url = `/pic/manage/v1/deleteGroup?id=${item._id}`;
        self.axios.delete(url)
          .then(function (res) {
            console.warn("================删除组================");
            console.log(res);
            if(res.status===200&&res.data.code===0){
              self.common.msgModal("success","删除成功!");
              self.getGroupList(self.pagingInfo.currentPage);
            }else{
              self.common.msgModal("error","删除失败!");
            }
          }).catch(function(err) {
            self.common.msgModal("error","删除失败!");
          });
      },
      //保存状态到sessionStorage
      saveStatus:function(page) {
        sessionStorage.setItem('groupInput',this.groupInput);      //保存组名
        sessionStorage.setItem('sortByUpdateTime',this.pagingInfo.sort);      //保存更新时间排序
        sessionStorage.setItem('perPageSize',this.pagingInfo.perPageSize);      //保存每页条数
        sessionStorage.setItem('curPage',page);      //保存当前页
      }
    }
  };
</script>

<style scoped>
.app-search .el-form-item{
  margin-bottom: 0;
}
</style>
