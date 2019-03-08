<template>
  <div class="adp-wrapper">
    <div class="app-nav">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/clean_list' }">清洗列表</el-breadcrumb-item>
        <el-breadcrumb-item>重新分配</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div >
      <span class="adp-page-title">用户名称</span>
      <el-input type="text" v-model="username" maxlength="30" placeholder="请输入用户名称"></el-input>
      &nbsp;
      <span class="adp-page-title">分组名</span>
      <el-input type="text" v-model="groupName" maxlength="30" placeholder="请输入分组名"></el-input>
      &nbsp;
      <el-button @click="getUserList" type="primary" size="small">查询结果</el-button>
    </div>
    <div id="app-table">
      <el-table
      ref="singleTable"
      :data="userList"
      highlight-current-row
      border
      @current-change="currentChange"
      style="width: 100%;margin-top:25px">
      <!-- <el-table-column
        type="index"
        width="50">
      </el-table-column> -->
      <!-- <el-table-column
        property="_id"
        label="ID"
        width="250">
      </el-table-column> -->
      <el-table-column
        property="username"
        label="用户名称"
        width="300">
      </el-table-column>
      <!-- <el-table-column
        property="email"
        label="email"
        width="150">
      </el-table-column> -->
      <el-table-column
        property="groupsName"
        label="分组名">
      </el-table-column>
      </el-table>
    </div>
    <div>
      <el-pagination
        ref="pagination"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="curPage"
        :page-sizes="[10, 20, 30, 100]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="totalCount">
      </el-pagination>
    </div>
    <div class="adp-button-group">
      <el-button type="primary" plain @click="setCurrent()">取消</el-button>
      <el-button type="primary" @click="ensureAssign">确定</el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: "assignTask",
  data() {
    return {
      username:'',//用户名
      groupName:'',//分组名
      userList: [],  //用户数据
      curPage: 1, //分页
      pageSize: 20,
      totalCount: 0,
      pRef: null, //解决分页问题
      sortByUpdateTime: -1, //更新时间

      currentRow: null
    };
  },
  mounted() {
    //解决分页跳转问题
    this.pRef = this.$refs.pagination;
    this.pRef.internalCurrentPage = this.curPage;
  },
  created(){
    //获取sessionStorage中的数据
    this.username = sessionStorage.getItem('username') || '';
    this.groupName = sessionStorage.getItem('groupName') || '';
    this.sortByUpdateTime = JSON.parse(sessionStorage.getItem('sortByUpdateTime')) || -1;
    this.pageSize = JSON.parse(sessionStorage.getItem('pageSize')) || 20;
    this.curPage = JSON.parse(sessionStorage.getItem('curPage')) || 1;
    this.getUserList();
  },
  methods: {
    //分页
    handleSizeChange(val) {
      this.pageSize = val;
      this.getUserList();
    },
    handleCurrentChange(val) {
      this.curPage = val;
      this.getUserList();
    },
    setCurrent(row) {
      this.$refs.singleTable.setCurrentRow(row);
    },
    currentChange(val){
      this.currentRow = val;
      // console.log(val);
    },
    //获取用户列表
    getUserList() {
      let _this = this;
      _this.username = _this.username.trim();
      let param = {
        username: _this.username,
        sortByUpdateTime: _this.sortByUpdateTime,
        pageSize: _this.pageSize,
        curPage: _this.curPage,
        groupName: _this.groupName
      };
      _this.loading = true;
      _this.axios.post("/pic/manage/v1/getUser", param).then(function(res) {
        _this.loading = false;
        if (res.data.code === "0") {
          _this.userList = res.data.data.userList;
          _this.userList.forEach((ele,index) => {
            if(ele.username == _this.$route.query.cleaner){
              _this.userList.splice(index,1)
            }
            ele.groupsName = '';
            ele.groups.forEach(element => {
              ele.groupsName += " " + element.groupName;
            });
          });
          _this.totalCount = res.data.data.totalCount;
          _this.saveStatus();
        } else {
          _this.common.msgModal("error", res.data.msg);
        }
      });
    },
    //保存状态到sessionStorage
    saveStatus() {
      sessionStorage.setItem('username',this.username);      //保存用户名
      sessionStorage.setItem('groupName',this.groupName);      //保存用户名
      sessionStorage.setItem('sortByUpdateTime',this.sortByUpdateTime);      //保存更新时间排序
      sessionStorage.setItem('pageSize',this.pageSize);      //保存每页条数
      sessionStorage.setItem('curPage',this.curPage);      //保存当前页
    },
    ensureAssign(){
      let _this = this;
      if (_this.currentRow === null) {
        this.common.msgModal("warning","请先选择用户");
        return;
      }
      let param = {
        id: _this.$route.query.subjectId,
        name: _this.$route.query.subjectName,
        cleaner: _this.currentRow.username,
        cleanerId: _this.currentRow._id,
        email: _this.currentRow.email,
      };
      _this.axios.post("/pic/manage/v1/cleanRedistribution", param).then(function(res) {
        _this.loading = false;
        if (res.data.code === "0") {
          _this.$router.push({path:'clean_list'});
          _this.common.msgModal("success",res.data.msg);        
        }
      });
    }
  }
};
</script>

<style scoped>
.adp-wrapper {
  position: relative;
}
.adp-button-group {
  text-align: center;
  margin: 20px 0;
}
.adp-page-title {
  font-size: 14px;
  color: #606266;
}
.app-nav {
  margin-bottom: 20px;
}
.el-input {
  width: 200px;
}
.common_table th:last-child {
  width: auto !important;
}
.subject-list {
  margin-top: 20px;
}
.adp-checkbox-input {
  cursor: pointer;
  outline: 0;
  line-height: 1;
  vertical-align: middle;
}
.adp-checkbox-inner {
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
  -webkit-transition: border-color 0.25s cubic-bezier(0.71, -0.46, 0.29, 1.46),
    background-color 0.25s cubic-bezier(0.71, -0.46, 0.29, 1.46);
  transition: border-color 0.25s cubic-bezier(0.71, -0.46, 0.29, 1.46),
    background-color 0.25s cubic-bezier(0.71, -0.46, 0.29, 1.46);
}
.adp-checkbox-inner.is-checked {
  background: #409eff;
  border-color: #409eff;
}
.adp-checkbox-inner.is-checked::after {
  -webkit-transform: rotate(45deg) scaleY(1);
  transform: rotate(45deg) scaleY(1);
}
.adp-checkbox-inner::after {
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
  -webkit-transition: -webkit-transform 0.15s ease-in 0.05s;
  transition: -webkit-transform 0.15s ease-in 0.05s;
  transition: transform 0.15s ease-in 0.05s;
  transition: transform 0.15s ease-in 0.05s,
    -webkit-transform 0.15s ease-in 0.05s;
  transition: transform 0.15s ease-in 0.05s,
    -webkit-transform 0.15s ease-in 0.05s;
  -webkit-transform-origin: center;
  transform-origin: center;
}
.adp-input {
  opacity: 0;
  outline: 0;
  position: absolute;
  margin: 0;
  width: 0;
  height: 0;
  z-index: -1;
}
</style>
