<template>

  <el-container v-loading="loading">
    <!-- 搜索栏 -->
    <el-header class="search_header">           
      <span class="search_name">机构名称</span>
      <el-input class="search_input" placeholder="请输入机构名称" maxlength="20" v-model="UnitName" @keyup.enter.native="companySearch"></el-input>
      <span class="search_name">编辑时间</span>
      <el-date-picker
        class="search_date"
        v-model="dateValue"
        type="daterange"
        unlink-panels
        range-separator="至"
        :editable="false"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        @change="setDate"
        :picker-options="pickerOptions"
        value-format="yyyy-MM-dd">
      </el-date-picker>
      <el-button 
        type="primary" 
        size="mini"
        @click="companySearch">查询</el-button>
      <el-button 
        type="primary" 
        size="mini"
        style="float: right;margin-top:5px;"
        @click="addCompany">新增</el-button>          
    </el-header>

    <el-main class="content_box">
      <!-- 机构信息 -->
      <table class="common_table" cellspacing="0" cellpadding="0" width="100%">
        <thead>
          <tr>
            <th width="60">编号</th>
            <th>机构名称</th>
            <th>地址</th>
            <th>创建时间</th>
            <th class="sort-th" @click="dateSort($event, '')">
              编辑时间
              <span class="caretWrapper">
                <i :class="{upCaret: true, upColor: dateSortType[0]}" @click="dateSort($event, 0)"></i>
                <i :class="{downCaret: true, downColor: dateSortType[1]}" @click="dateSort($event, 1)"></i>
              </span>        
            </th>
            <th>
              <el-select v-model="identify" placeholder="状态" @change="checkChange">
                <el-option
                  v-for="(item, index) in checkStatus"
                  :key="index"
                  :label="item.status"
                  :value="item.value">
                </el-option>
              </el-select>
            </th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
            <tr class="no_data" v-if="companyData == ''"><td colspan="7">暂无数据</td></tr>
            <tr v-for="(item, index) in companyData" :key="index">
              <td>{{ (curPage-1)*pageSize+index+1 }}</td>
              <td>{{item.UnitName}}</td>
              <td>{{item.address}}</td>
              <td>{{item.createdTime}}</td>
              <td>{{item.updatedTime}}</td>
              <td>{{item.auditStatus == 1 ? '有效' : '无效'}}</td>
              <td>
                  <el-button
                  size="mini"
                  plain
                  @click="editCompany(item)">编辑</el-button>
                <el-button
                  size="mini"
                  plain
                  class="delbtn"
                  @click="delCompany(item)">删除</el-button>
              </td>
            </tr>
        </tbody>
      </table>
      
      <!-- <el-button 
        type="primary" 
        size="mini"
        style="margin-top:10px;float:right"
        @click="exportToExcel">导出Excel</el-button>    -->

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
        <el-form-item label="机构名称：" prop="companyName">
          <el-input 
            placeholder="请输入机构名称"
            v-model="ruleForm.companyName" 
            maxlength="20"></el-input>
        </el-form-item>
        <el-form-item label="地址：" prop="address">
          <el-input 
            placeholder="请输入地址"
            v-model="ruleForm.address"
            maxlength="30"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancel('ruleForm')" size="small">取消</el-button>
        <el-button type="primary" @click="submitForm('ruleForm')" size="small">确认</el-button>
      </span>
    </el-dialog>

  </el-container> 
  
</template>

<script>
export default {
  data() {
    var validateName = (rule, value, callback) => {
      //匹配字母数字汉字
      var reg = /^[A-Za-z0-9\u4e00-\u9fa5]+$/;
      if (!reg.test(value)) {
        callback(new Error("机构名称为汉字/字母/数字，不支持特殊字符"));
      } else {
        callback();
      }
    };
    var validateDomainName = (rule, value, callback) => {
      //匹配域名的正则
      var reg = /(http|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&:/~\+#]*[\w\-\@?^=%&/~\+#])?/;
      if (value == "") {
        callback(new Error("地址不能为空！"));
      } else if (!reg.test(value)) {
        callback(new Error("不是正确的域名格式,必须以http://或https://开头"));
      } else {
        callback();
      }
    };
    return {
      loading: false, //loading状态
      _id: "",
      UnitName: "",
      dateValue: "",
      beginTime: "",
      endTime: "",
      pickerOptions: {
        shortcuts: [
          {
            text: "最近一周",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit("pick", [start, end]);
            }
          },
          {
            text: "最近一个月",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              picker.$emit("pick", [start, end]);
            }
          },
          {
            text: "最近三个月",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
              picker.$emit("pick", [start, end]);
            }
          }
        ]
      },
      companyData: [],

      dateSortType: [false, false], // 时间排序样式

      identify: null, //状态
      checkStatus: [
        {
          value: 2,
          status: "全部"
        },
        {
          value: 1,
          status: "有效"
        },
        {
          value: 0,
          status: "无效"
        }
      ],

      curPage: 1, //分页
      pageSize: 20,
      totalCount: 0,
      pRef: null, //解决分页问题
      sortByUpdateTime: -1, //编辑时间排序规则 1升序，-1降序
      auditStatus: 2, //状态 默认2显示全部 1显示有效 0显示无效
      dialogTitle: "", //弹出框标题
      dialogVisible: false, //弹出框是否隐藏

      ruleForm: {
        companyName: "",
        address: ""
      },
      rules: {
        companyName: [
          { required: true, message: "机构名称不能为空！", trigger: "change" },
          {
            min: 1,
            max: 20,
            message: "长度在 1 到 20 个字符",
            trigger: "blur"
          },
          { validator: validateName, trigger: "change" }
        ]
        // address: [
        //   { required: true, message: "地址不能为空！", trigger: "change" },
        //   { validator: validateDomainName, trigger: "change" }
        // ],
      }
    };
  },
  mounted() {
    //解决分页跳转问题
    this.pRef = this.$refs.pagination;
    this.pRef.internalCurrentPage = this.curPage;
  },
  created() {
    console.log("组件创建后");
    this.getSearchParams();
    this.getListDate();
  },
  methods: {
    getListDate() {
      this.axios
        .get("/pic/manage/v1/modelTrainUnit", {
          params: {
            UnitName: this.UnitName,
            curPage: this.curPage,
            pageSize: this.pageSize,
            sortByUpdateTime: this.sortByUpdateTime,
            auditStatus: this.auditStatus,
            beginTime: this.beginTime,
            endTime: this.endTime
          }
        })
        .then(response => {
          this.companyData = response.data.data.list;
          this.curPage = response.data.data.curPage;
          this.pageSize = response.data.data.pageSize;
          this.totalCount = response.data.data.count;
        });
      this.setSearchParams();
    },
    //判断时间
    setDate() {
      if (this.dateValue === null) {
        this.beginTime = "";
        this.endTime = "";
      } else {
        this.beginTime = this.dateValue[0] + " 00:00:00";
        this.endTime = this.dateValue[1] + " 23:59:59";
      }
      let beginDate = this.beginTime;
      let currentDate = new Date();
      beginDate = new Date(beginDate.replace(/\-/g, "/"));
      if (beginDate != "" && currentDate != "" && beginDate >= currentDate) {
        this.common.msgModal("warning", "开始时间不能大于当前时间!");
        this.dateValue = null;
        this.beginTime = "";
        this.endTime = "";
      }
      this.getListDate();
    },

    //搜索
    companySearch() {
      this.UnitName = this.common.trim(this.UnitName);
      if (
        this.UnitName != "" &&
        !this.UnitName.match(/^[\u4E00-\u9FA5A-Za-z0-9\s]+$/)
      ) {
        this.common.msgModal("error", "您输入的机构名称不合法!");
        return false;
      }
      this.getListDate();
    },
    //新增
    addCompany() {
      // console.log("新增");
      this.dialogTitle = "新增机构";
      this.ruleForm.companyName = "";
      this.ruleForm.address = "";
      this.dialogVisible = true;
    },
    //编辑
    editCompany(item) {
      console.log("编辑", item);
      this.dialogTitle = "编辑机构";
      this._id = item._id;
      this.ruleForm.companyName = item.UnitName;
      this.ruleForm.address = item.address;
      this.dialogVisible = true;
    },
    //删除
    delCompany(item) {
      //弹出框
      this.$confirm("确定删除此机构吗?", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        this.axios
          .get("/pic/manage/v1/modelTrainUnit/delete", {
            params: {
              _id: item._id
            }
          })
          .then(response => {
            if (response.data.code == 0) {
              this.dialogVisible = false;
              this.common.msgModal("success", "删除成功！");
            }
            this.getListDate();
          });
      });
    },
    addSubmit() {
      this.axios
        .post("/pic/manage/v1/modelTrainUnit/add", {
          UnitName: this.ruleForm.companyName,
          address: this.ruleForm.address
        })
        .then(response => {
          if (response.data.code == 0) {
            this.dialogVisible = false;
            this.common.msgModal("success", "添加成功!");
          }
          this.getListDate();
        });
    },
    editSubmit() {
      this.axios
        .post("/pic/manage/v1/modelTrainUnit/edit", {
          _id: this._id,
          UnitName: this.ruleForm.companyName,
          address: this.ruleForm.address
        })
        .then(response => {
          if (response.data.code == 0) {
            this.dialogVisible = false;
            this.common.msgModal("success", "编辑成功!");
          }
          this.getListDate();
        });
    },
    //确认
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.dialogTitle == "新增机构" ? this.addSubmit() : this.editSubmit();
        } else {
          console.log("error submit!!");
          return false;
        }
        this.$refs[formName].resetFields(); //重置表单
      });
    },
    //取消
    cancel(formName) {
      this.dialogVisible = false; //隐藏弹出框
      this.$refs[formName].resetFields(); //重置表单
    },
    //关闭dialog
    closeDialog(done) {
      this.$nextTick(() => {
        this.$refs.ruleForm.resetFields();
      }); //重置表单
      done();
    },

    //编辑时间排序
    dateSort(evt, item) {
      evt.stopPropagation();
      this.THSort(item, "dateSortType");
    },
    THSort(item, type) {
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
      this.getListDate();
    },

    //选择状态
    checkChange(item) {
      // console.log(item);
      this.auditStatus = item;
      this.getListDate();
    },

    //分页
    sizeChange(val) {
      this.pageSize = val;
      this.getListDate();
    },
    currentChange(val) {
      this.curPage = val;
      this.getListDate();
    },
    getSearchParams() {
      this.UnitName = sessionStorage.getItem("UnitName") || "";
      this.curPage = parseInt(sessionStorage.getItem("curPage")) || 1;
      this.pageSize = parseInt(sessionStorage.getItem("pageSize")) || 20;
      this.sortByUpdateTime =
        parseInt(sessionStorage.getItem("sortByUpdateTime")) || -1;
      //auditStatus有可能等于0
      this.auditStatus =
        sessionStorage.getItem("auditStatus") !== null
          ? parseInt(sessionStorage.getItem("auditStatus"))
          : 2;
      if (this.auditStatus == 1) {
        this.identify = "有效";
      } else if (this.auditStatus == 0) {
        this.identify = "无效";
      }
      if (
        sessionStorage.getItem("beginTime") &&
        sessionStorage.getItem("endTime")
      ) {
        this.beginTime = sessionStorage.getItem("beginTime");
        this.endTime = sessionStorage.getItem("endTime");
        this.dateValue = [this.beginTime, this.endTime];
      }
    },
    setSearchParams() {
      sessionStorage.setItem("UnitName", this.UnitName);
      sessionStorage.setItem("curPage", this.curPage);
      sessionStorage.setItem("pageSize", this.pageSize);
      sessionStorage.setItem("sortByUpdateTime", this.sortByUpdateTime);
      sessionStorage.setItem("auditStatus", this.auditStatus);
      sessionStorage.setItem("beginTime", this.beginTime);
      sessionStorage.setItem("endTime", this.endTime);
    },
    exportToExcel() {
        this.loading = true;
        const tHeader = ["编号", "机构名称", "地址", "创建时间", "编辑时间","状态"]; 
        const filterVal = ["index", "UnitName", "address", "createdTime", "updatedTime","status"];　
        this.axios
        .get("/pic/manage/v1/modelTrainUnit", {
          params: {
            UnitName: this.UnitName,
            curPage: 1,
            pageSize: 999999999,
            sortByUpdateTime: this.sortByUpdateTime,
            auditStatus: this.auditStatus,
            beginTime: this.beginTime,
            endTime: this.endTime
          }
        })
        .then(response => {
          const list = response.data.data.list;
            for (let i = 0; i < list.length; i++) {
            const element = list[i];
            element.index = i + 1;
            element.status = element.auditStatus ? "有效" : "无效";
          }
          this.common.export2Excel(tHeader,filterVal,list,"模型训练机构数据");
          this.loading = false;
        });
    }
  }
};
</script>

<style scoped>
</style>

