<template>
  <div class="app-page">
    <div class="app-nav">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/group' }">组管理</el-breadcrumb-item>
        <el-breadcrumb-item>组成员</el-breadcrumb-item>
      </el-breadcrumb>

    </div>
    <main class="app-list">
      <div class="app-tables-col app-tables-col7">
        <div class="app-head-btns">
          <el-button type="primary" size="mini" @click="addUser">添加</el-button>
        </div>
        <el-table
          :data="usersData"
          v-loading="isLoading"
          border
          style="width: 100%">
          <el-table-column
            label="序号"
            width="50">
            <template slot-scope="scope">
              {{ (pagingInfo.curPage-1)*pagingInfo.pageSize + scope.$index+1 }}
            </template>
          </el-table-column>
          <el-table-column
            prop="username"
            label="用户名"
            width="180">
          </el-table-column>
          <el-table-column
            prop="email"
            label="邮箱">
          </el-table-column>
          <el-table-column
            label="操作"
            width="100">
            <template slot-scope="scope">
              <el-button type="text" size="small" @click="removeItem(scope.row)">移除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          ref="pagination"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="pagingInfo.curPage"
          :page-sizes="[10, 20, 30, 100]"
          :page-size="pagingInfo.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagingInfo.totalCount">
        </el-pagination>
      </div>

    </main>
  </div>
</template>

<script>
    export default {
        name: "membesOfGroup",
      data(){
          return{
            isLoading:false,
            //用户列表
            usersData:[],
            //分页参数
            pagingInfo:{
              curPage:1,
              pageSize:20,
              totalPages:1,
              totalCount:1,
              sort:-1
            },
            pRef: null,                  //解决分页问题
          }
      },
      computed:{
        groupId:function() {
          return this.$route.query.id;
        }
      },
      mounted() {
        //解决分页跳转问题
        this.pRef = this.$refs.pagination;
        this.pRef.internalCurrentPage = this.pagingInfo.curPage;
      },
      created:function(){
        //获取sessionStorage中的数据
        this.pagingInfo.pageSize = JSON.parse(sessionStorage.getItem('userPageSize')) || this.pagingInfo.pageSize;
        this.pagingInfo.curPage = JSON.parse(sessionStorage.getItem('userCurPage')) || 1;
        this.getMembersList(this.pagingInfo.curPage);
      },
      methods:{
        /**
         * 页面跳转
         */
        addUser:function() {
          let self = this;
          this.$router.push({path:'/group/add_edit_group',query:{
              pageType:"1",
              id:self.groupId
          }});
        },
        /**
         * 分页逻辑处理
         */
        handleSizeChange(val) {
          this.pagingInfo.pageSize = val;
          this.pRef.internalCurrentPage = this.pagingInfo.curPage = 1;       //解决分页跳转问题
          this.getMembersList(this.pagingInfo.curPage);
        },
        handleCurrentChange(val) {
          this.pRef.internalCurrentPage = this.pagingInfo.curPage = val;       //解决分页跳转问题
          this.getMembersList(this.pagingInfo.curPage);
        },
        /**
         * 获取用户列表
         */
        getMembersList:function(page) {
          let self = this,
            url = `/pic/manage/v1/getUser`;
          self.isLoading = true;
          this.axios.post(url,{
              groupId:self.groupId,
              curPage:page,
              pageSize:self.pagingInfo.pageSize,

            })
            .then(function (res) {
              console.warn("================获取组下的用户列表================");
              console.log(res);
              self.isLoading = false;
              if(res.status===200&&(res.data.code==="0"||res.data.code===0)){
                let result = res.data.data;
                self.pagingInfo.curPage = result.curPage;
                self.pagingInfo.totalPages = result.totalPages;
                self.pagingInfo.totalCount = result.totalCount;
                self.usersData = result.userList;
                self.saveStatus(page);                             //保存状态到sessionStorage
              }else{
                self.usersData = [];
                self.pagingInfo.curPage = 1;
                self.pagingInfo.totalPages = 1;
                self.pagingInfo.totalCount = 1;
              }
            }).catch(function(err) {
              self.isLoading = false;
              console.log(err);
            });
        },
        /**
         * 移除单个用户
         */
        removeItem:function(item) {
          console.log(item);
          let self = this,
              url = `/pic/manage/v1/removeMemberOfGroup`;
          this.axios.put(url,{
              id:self.groupId,
              userId:item._id
            })
            .then(function (res) {
              console.log(res);
              if(res.status===200&&res.data.code===0){
                self.common.msgModal("success","移除成功");
                self.getMembersList(self.pagingInfo.curPage);
              }else{
                self.common.msgModal("error","移除失败");
              }
            });
        },
        //保存状态到sessionStorage
        saveStatus:function(page) {
          sessionStorage.setItem('userPageSize',this.pagingInfo.pageSize);      //保存每页条数
          sessionStorage.setItem('userCurPage',page);      //保存当前页
        }
      },
      destroyed:function() {
        sessionStorage.removeItem('userPageSize');
        sessionStorage.removeItem('userCurPage');
      }
    };
</script>

<style scoped>

</style>
