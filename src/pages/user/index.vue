<template>
  <el-container v-loading="loading">
    <!-- 搜索栏 -->
    <el-header class="search_header">
      <span class="search_name">用户名称</span>
      <el-input class="search_input" placeholder="请输入用户名称" maxlength="30" v-model="username" @keyup.enter.native="userSearch"></el-input>
      <el-button
        type="primary"
        size="mini"
        @click="userSearch">查询</el-button>
      <el-button
        type="primary"
        size="mini"
        style="margin-left: 607px;"
        @click="addUser">添加</el-button>
    </el-header>
    <!-- 用户列表 -->
    <el-main style="padding: 0;">
      <el-table
        border
        stripe
        :data="userList"
        style="width: 1000px;"
        @sort-change="handleSortChange">
        <el-table-column
          label="用户名称"
          width="180">
          <template slot-scope="scope">
            {{ scope.row.username }}
          </template>
        </el-table-column>
        <el-table-column
          label="角色"
          width="120">
          <template slot-scope="scope">
            {{ scope.row.role }}
          </template>
        </el-table-column>
        <el-table-column
          label="邮箱"
          width="220">
          <template slot-scope="scope">
            {{ scope.row.email }}
          </template>
        </el-table-column><el-table-column
          sortable="custom"
          label="更新时间"
          width="180">
          <template slot-scope="scope">
            {{ scope.row.updatedTime }}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button
              plain
              size="mini"
              @click="editUser(scope.row)">编辑</el-button>
            <el-button
              plain
              size="mini"
              class="delbtn"
              @click="delUser(scope.row)">删除</el-button>
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
        :total="totalCount || 0">
      </el-pagination>
    </el-main>

    <!-- 添加/编辑弹出框 -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="420px"
      center
      custom-class="checkDialog"
      :before-close="closeDialog">

      <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="100px" class="demo-ruleForm">
        <el-form-item label="名称：" prop="username">
          <el-input
            placeholder="请输入用户名称"
            v-model="ruleForm.username"
            maxlength="30"></el-input>
        </el-form-item>
        <el-form-item label="密码：" prop="password" v-if="dialogTitle == '添加用户'">
          <el-input
            placeholder="请输入密码"
            v-model="ruleForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱：" prop="email">
          <el-input
            placeholder="请输入邮箱"
            v-model="ruleForm.email"
            maxlength="30"></el-input>
        </el-form-item>
        <el-form-item label="角色：" prop="role" id="chooseRole">
          <el-select v-model="ruleForm.role" filterable placeholder="请选择角色" class="user_role" @change="roleChange">
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancel('ruleForm')" size="small">取消</el-button>
        <el-button type="primary" @click="submitForm('ruleForm')" size="small">保存</el-button>
      </span>
    </el-dialog>
  </el-container>
</template>

<script>


export default {
  data() {
    let validateUsername = (rule, value, callback) => {
      //匹配输入全是空格
      var reg = /^\s+$/g;
      if (reg.test(value)) {
        callback(new Error("用户名称不能全部为空格！"));
      } else {
        callback();
      }
    };
    let validatePassword = (rule, value, callback) => {
      //匹配输入全是空格
      var reg = /^\s+$/g;
      if (reg.test(value)) {
        callback(new Error("密码不能全部为空格！"));
      } else {
        callback();
      }
    };
    return {
      loading: false,
      username: '',
      userList: [],                //数据

      curPage: 1,                  //分页
      pageSize: 20,
      totalCount: 0,
      pRef: null,                  //解决分页问题
      sortByUpdateTime: -1,            //更新时间

      dialogTitle: '',             //弹出框名称
      dialogVisible: false,        //是否隐藏弹出框

      ruleForm: {
        username: '',
        password: '',
        email: '',
        role: '',
        id: '',
      },
      rules: {
        username: [
          { required: true, message: "用户名称不能为空！", trigger: "change" },
          { validator: validateUsername, trigger: "change" }
        ],
        password: [
          { required: true, message: "密码不能为空！", trigger: "change" },
          { validator: validatePassword, trigger: "change" },
          { pattern: /^[^\u4e00-\u9fa5]*$/, message: "密码不能为中文！", trigger: "change" },
          { min: 6, message: "密码不少于6位！", trigger: "change" },
        ],
        email: [
          { required: true, message: "邮箱不能为空！", trigger: "change" },
          { pattern: /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/, message: '请输入正确的邮箱地址', trigger: 'change' }
        ],
        role: [
          { required: true, message: "角色不能为空！", trigger: "blur" },
        ],
      },

      options: [{
          value: '选项1',
          label: '黄金糕'
        }, {
          value: '选项2',
          label: '双皮奶'
        }, {
          value: '选项3',
          label: '蚵仔煎'
        }, {
          value: '选项4',
          label: '龙须面'
        }, {
          value: '选项5',
          label: '北京烤鸭'
        }],
    }
  },
  mounted() {
    //解决分页跳转问题
    this.pRef = this.$refs.pagination;
    this.pRef.internalCurrentPage = this.curPage;
  },
  created() {
    //获取sessionStorage中的数据
    this.username = sessionStorage.getItem('username') || '';
    this.sortByUpdateTime = JSON.parse(sessionStorage.getItem('sortByUpdateTime')) || -1;
    this.pageSize = JSON.parse(sessionStorage.getItem('pageSize')) || 20;
    this.curPage = JSON.parse(sessionStorage.getItem('curPage')) || 1;

    this.getUserList();
  },
  methods: {
    //搜索用户
    userSearch() {
      this.pRef.internalCurrentPage = this.curPage = 1;
      this.getUserList();
    },

    //添加用户
    addUser() {
      this.dialogTitle = '添加用户';
      this.ruleForm.username = '';
      this.ruleForm.password = '';
      this.ruleForm.email = '';
      this.ruleForm.role = '';
      this.dialogVisible = true;
    },

    //编辑用户
    editUser(item) {
      this.dialogTitle = '编辑用户';
      this.ruleForm.username = item.username;
      this.ruleForm.email = item.email;
      this.ruleForm.role = item.role;
      this.ruleForm.id = item._id;
      this.dialogVisible = true;
    },

    //删除用户
    delUser(item) {
      let _this = this;
      _this.$confirm('您确定要删除此用户吗?', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        _this.loading = true;
        _this.axios.post('/pic/manage/v1/delUser',{_id: item._id})
        .then(function (res) {
          _this.loading = false;
          if(res.data.code === '0'){
            _this.common.msgModal('success',res.data.msg);
            _this.getUserList();
          }
        });
      }).catch(() => {});
    },

    //新建/更新时间排序
    handleSortChange(column) {
      console.log(column.order);
      if(column.order == 'ascending') {
        this.sortByUpdateTime = 1;
      }else{
        this.sortByUpdateTime = -1;
      }
      this.getUserList();
    },

    //分页
    sizeChange(val) {
      console.log(val);
      this.pageSize = val;
      this.pRef.internalCurrentPage = this.curPage = 1;       //解决分页跳转问题
      this.getUserList();
    },
    currentChange(val) {
      console.log(val);
      this.pRef.internalCurrentPage = this.curPage = val;       //解决分页跳转问题
      this.getUserList();
    },

    //确认
    submitForm(formName) {
      let _this = this;
      _this.$refs[formName].validate(valid => {
        if (valid) {
          let param = {
            'username': _this.ruleForm.username,
            'password': _this.ruleForm.password,
            'email': _this.ruleForm.email,
            'role': _this.ruleForm.role,
          }
          let path = '';
          if(_this.dialogTitle == '添加用户'){
            path = '/pic/manage/v1/addUser';
          }else{
            param._id = _this.ruleForm.id,
            path = '/pic/manage/v1/editUser';
          }
          _this.loading = true;
          _this.axios.post(path,param)
          .then(function (res) {
            _this.loading = false;
            if(res.data.code === '0'){
              _this.common.msgModal('success',res.data.msg);
              _this.getUserList();
              _this.dialogVisible = false;                //隐藏弹出框
              _this.$refs[formName].resetFields();       //重置表单
            }
          });
        }else {
          console.log("error submit!!");
          return false;
        }

      });
    },
    //取消
    cancel(formName) {
      this.dialogVisible = false;                //隐藏弹出框
      this.$refs[formName].resetFields();        //重置表单
    },
    //关闭dialog
    closeDialog(done) {
      this.$nextTick(() => {
        this.$refs.ruleForm.resetFields();
      });                                        //重置表单
      done();
    },

    //获取用户列表
    getUserList() {
      let _this = this;
      _this.username = _this.username.trim();
      let param = {
        'username': _this.username,
        'sortByUpdateTime': _this.sortByUpdateTime,
        'pageSize': _this.pageSize,
        'curPage': _this.curPage,
        'groupName': '',
      }
      _this.loading = true;
      _this.axios.post('/pic/manage/v1/getUser',param)
      .then(function (res) {
        _this.loading = false;
        if(res.data.code === '0'){
          _this.userList = res.data.data.userList;
          _this.totalCount = res.data.data.totalCount;
          _this.saveStatus();
        }else{
          _this.common.msgModal('error',res.data.msg);
        }
      });
    },

    //保存状态到sessionStorage
    saveStatus() {
      sessionStorage.setItem('username',this.username);      //保存用户名
      sessionStorage.setItem('sortByUpdateTime',this.sortByUpdateTime);      //保存更新时间排序
      sessionStorage.setItem('pageSize',this.pageSize);      //保存每页条数
      sessionStorage.setItem('curPage',this.curPage);      //保存当前页
    },

    //弹出框下拉列表change事件
    roleChange() {
      //对角色下拉框进行单个校验
      this.$refs.ruleForm.validateField('role');
    }
  }
}
</script>

<style>
  .user_role .el-input {
    width: 270px;
  }
</style>

