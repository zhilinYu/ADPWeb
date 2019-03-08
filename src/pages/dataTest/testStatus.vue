<template>

  <el-container v-loading="loading">
    <!-- 搜索栏 -->
    <el-header class="search_header">
      <span class="search_name">主体名称</span>
      <el-input class="search_input" placeholder="请输入机构名称" maxlength="20" v-model="UnitName" @keyup.enter.native="companySearch"></el-input>
      <el-button
        type="primary"
        size="mini"
        @click="companySearch">查询结果</el-button>
      <el-button
        type="primary"
        size="mini"
        style="float: right;margin-top:5px;"
        @click="">导出</el-button>
    </el-header>

    <el-main class="content_box">
      <table class="common_table" cellspacing="0" cellpadding="0" width="100%">
        <thead>
          <tr>
            <th>主体名称</th>
            <th>测试数量</th>
            <th>top1对</th>
            <th>top1错</th>
            <th class="sort-th" @click="dateSort($event, '')">
              top1准确率
              <span class="caretWrapper">
                <i :class="{upCaret: true, upColor: dateSortType[0]}" @click="dateSort($event, 0)"></i>
                <i :class="{downCaret: true, downColor: dateSortType[1]}" @click="dateSort($event, 1)"></i>
              </span>
            </th>
            <th>top5对</th>
            <th>top5错</th>
            <th class="sort-th" @click="dateSort($event, '')">
              top5准确率
              <span class="caretWrapper">
                <i :class="{upCaret: true, upColor: dateSortType[0]}" @click="dateSort($event, 0)"></i>
                <i :class="{downCaret: true, downColor: dateSortType[1]}" @click="dateSort($event, 1)"></i>
              </span>
            </th>
            <th class="sort-th" @click="dateSort($event, '')">
              top1置信度
              <span class="caretWrapper">
                <i :class="{upCaret: true, upColor: dateSortType[0]}" @click="dateSort($event, 0)"></i>
                <i :class="{downCaret: true, downColor: dateSortType[1]}" @click="dateSort($event, 1)"></i>
              </span>
            </th>
            <th class="sort-th" @click="dateSort($event, '')">
              top5置信度
              <span class="caretWrapper">
                <i :class="{upCaret: true, upColor: dateSortType[0]}" @click="dateSort($event, 0)"></i>
                <i :class="{downCaret: true, downColor: dateSortType[1]}" @click="dateSort($event, 1)"></i>
              </span>
            </th>
            <th>百度准确率</th>
            <th class="sort-th" @click="dateSort($event, '')">
              百度对比
              <span class="caretWrapper">
                <i :class="{upCaret: true, upColor: dateSortType[0]}" @click="dateSort($event, 0)"></i>
                <i :class="{downCaret: true, downColor: dateSortType[1]}" @click="dateSort($event, 1)"></i>
              </span>
            </th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
            <tr class="no_data" v-if="companyData == ''"><td colspan="13">暂无数据</td></tr>
            <tr v-for="(item, index) in companyData" :key="index">
              <td>{{item.subject_name}}</td>
              <td>{{item.test_num}}</td>
              <td>{{item.top1_true}}</td>
              <td>{{item.top1_false}}</td>
              <td>{{item.top1_precision_rate}}</td>
              <td>{{item.top5_true}}</td>
              <td>{{item.top5_false}}</td>
              <td>{{item.top5_precision_rate}}</td>
              <td>{{item.top1_confidence}}</td>
              <td>{{item.top5_confidence}}</td>
              <td>{{item.baidu_precision_rate}}</td>
              <td>{{item.baidu_comparison}}</td>
              <td>
                 <el-button
                  @click.native.prevent=""
                  type="text"
                  size="small">
                  详情
                </el-button>
              </td>
            </tr>
        </tbody>
      </table>

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
  </el-container>

</template>

<script>
export default {
  data() {
    var validateName = (rule, value, callback) => {
      //匹配字母数字汉字
      var reg = /^[A-Za-z0-9\u4e00-\u9fa5]+$/;
      if (!reg.test(value)) {
        callback(new Error("主体名称为汉字/字母/数字，不支持特殊字符"));
      } else {
        callback();
      }
    };
    return {
      loading: false, //loading状态
      _id: "",
      subjectName: "",
      dateValue: "",
      beginTime: "",
      endTime: "",
      companyData: [],

      dateSortType: [false, false], // 时间排序样式

      identify: null, //状态

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
          { required: true, message: "主体名称不能为空！", trigger: "blur" },
          {
            min: 1,
            max: 20,
            message: "长度在 1 到 20 个字符",
            trigger: "blur"
          },
          { validator: validateName, trigger: "blur" }
        ]
      }
    };
  },
  mounted() {
    //解决分页跳转问题
    this.pRef = this.$refs.pagination;
    this.pRef.internalCurrentPage = this.curPage;
  },
  created() {
    // console.log("组件创建后");
    this.getSearchParams();
    this.getListDate();
  },
  methods: {
    getListDate() {
      this.axios
        .get("/pic/manage/v1/getTestRecordList", {
          params: {
            batchId:this.$route.query.id,
            subjectName: this.subjectName
          }
        })
        .then(response => {
          console.log(response);
          // this.companyData = response.data.data.list;
          // this.curPage = response.data.data.curPage;
          // this.pageSize = response.data.data.pageSize;
          // this.totalCount = response.data.data.count;
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
.content_box .common_table th {
  width: 60px;
}
</style>

