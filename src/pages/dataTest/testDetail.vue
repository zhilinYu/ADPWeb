<template>

  <el-container v-loading="loading">
    <!-- 搜索栏 -->
    <el-header class="search_header">
      <div class="adp-page-title">测试详情</div>
      <el-button
        type="primary"
        size="mini"
        class="btn-back"
        @click="goBack()">返回</el-button>
    </el-header>

    <el-main class="content_box">
      <table class="common_table" cellspacing="0" cellpadding="0" width="100%">
        <thead>
          <tr>
            <th>处理类型</th>
            <th>top1对</th>
            <th>top1错</th>
            <th>top1准确率</th>
            <th>top1置信度</th>
            <th>top5对</th>
            <th>top5错</th>
            <th>top5准确率</th>
            <th>top5置信度</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
            <tr class="no_data" v-if="companyData == ''"><td colspan="10">暂无数据</td></tr>
             <!-- <tr v-for="(item, index) in companyData" :key="index">
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
            </tr> -->
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
    return {
      loading: false, //loading状态
      _id: "",
      UnitName: "",
      dateValue: "",
      companyData: [],
      errType:[
        {
          value: 1,
          status: "---"
        },
        {
          value: 0,
          status: "正常"
        }
      ],

      identify: null, //状态

      curPage: 1, //分页
      pageSize: 20,
      totalCount: 0,

      radio:3,
      radio2:3

    };
  },
  mounted() {
    //解决分页跳转问题
    this.pRef = this.$refs.pagination;
    this.pRef.internalCurrentPage = this.curPage;
  },
  created() {
    // console.log("组件创建后");
    // this.getSearchParams();
    // this.getListDate();
  },
  methods: {
    goBack(){

    },
    getListDate() {
      // this.axios
      //   .get("/pic/manage/v1/modelTrainUnit", {
      //     params: {
      //       UnitName: this.UnitName,
      //       curPage: this.curPage,
      //       pageSize: this.pageSize,
      //       sortByUpdateTime: this.sortByUpdateTime,
      //       auditStatus: this.auditStatus,
      //       beginTime: this.beginTime,
      //       endTime: this.endTime
      //     }
      //   })
      //   .then(response => {
      //     this.companyData = response.data.data.list;
      //     this.curPage = response.data.data.curPage;
      //     this.pageSize = response.data.data.pageSize;
      //     this.totalCount = response.data.data.count;
      //   });
      // this.setSearchParams();
    },

    //分页
    sizeChange(val) {
      // this.pageSize = val;
      // this.getListDate();
    },
    currentChange(val) {
      // this.curPage = val;
      // this.getListDate();
    },
    getSearchParams() {
      // this.UnitName = sessionStorage.getItem("UnitName") || "";
      // this.curPage = parseInt(sessionStorage.getItem("curPage")) || 1;
      // this.pageSize = parseInt(sessionStorage.getItem("pageSize")) || 20;
      // this.sortByUpdateTime =
      //   parseInt(sessionStorage.getItem("sortByUpdateTime")) || -1;
      // //auditStatus有可能等于0
      // this.auditStatus =
      //   sessionStorage.getItem("auditStatus") !== null
      //     ? parseInt(sessionStorage.getItem("auditStatus"))
      //     : 2;
      // if (this.auditStatus == 1) {
      //   this.identify = "有效";
      // } else if (this.auditStatus == 0) {
      //   this.identify = "无效";
      // }
      // if (
      //   sessionStorage.getItem("beginTime") &&
      //   sessionStorage.getItem("endTime")
      // ) {
      //   this.beginTime = sessionStorage.getItem("beginTime");
      //   this.endTime = sessionStorage.getItem("endTime");
      //   this.dateValue = [this.beginTime, this.endTime];
      // }
    },
    setSearchParams() {
      // sessionStorage.setItem("UnitName", this.UnitName);
      // sessionStorage.setItem("curPage", this.curPage);
      // sessionStorage.setItem("pageSize", this.pageSize);
      // sessionStorage.setItem("sortByUpdateTime", this.sortByUpdateTime);
      // sessionStorage.setItem("auditStatus", this.auditStatus);
      // sessionStorage.setItem("beginTime", this.beginTime);
      // sessionStorage.setItem("endTime", this.endTime);
    }
  }
};
</script>

<style scoped>
.btn-back{
  float: right;
  margin-top:-5px;
}
.el-radio{
  width: 100px;
}
.content_box .common_table th {
  width: 60px;
}

</style>

