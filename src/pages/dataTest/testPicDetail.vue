<template>

  <el-container v-loading="loading">
    <!-- 搜索栏 -->
    <el-header class="search_header">
      <div class="adp-page-title">选择图片</div>
      <div class="radio-group">
        <el-radio-group v-model="radio">
          <div class="line">
            <el-radio :label="0">全部（200）</el-radio>
          </div>
          <div class="line">
            <el-radio :label="1">top1对（200）</el-radio>
            <el-radio :label="2">top1错（200）</el-radio>
          </div>
          <div class="line">
            <el-radio :label="1">top5对（200）</el-radio>
            <el-radio :label="2">top5错（200）</el-radio>
          </div>
          <div class="line">
            <el-radio :label="1">百度top1对（200）</el-radio>
            <el-radio :label="2">百度top1错（200）</el-radio>
          </div>
          <div class="line">
            <el-radio :label="2">测试异常（200）</el-radio>
          </div>

        </el-radio-group>
      </div>
      <el-button
        type="primary"
        size="mini"
        class="btn-back"
        @click="goBack()">返回</el-button>
    </el-header>

    <el-main class="content_box" style="margin-top:10px">
      <table class="common_table" cellspacing="0" cellpadding="0" width="100%">
        <thead>
          <tr>
            <th>图片编号</th>
            <th>缩略图</th>
            <th>top1</th>
            <th>百度top1</th>
            <th>top5-1</th>
            <th>top5-1-N</th>
            <th>top5-2</th>
            <th>top5-2-N</th>
            <th>top5-3</th>
            <th>top5-3-N</th>
            <th>top5-4</th>
            <th>top5-4-N</th>
            <th>top5-5</th>
            <th>top5-5-N</th>
            <th style="width:100px">
              <el-select v-model="identify" placeholder="异常类型" @change="">
                <el-option
                  v-for="(item, index) in errType"
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
            <tr class="no_data" v-if="companyData == ''"><td colspan="16">暂无数据</td></tr>
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
      errType: [
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

      radio: 3,
      radio2: 3
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
    goBack() {},
    getListDate() {
      this.axios
        .get("/pic/manage/v1/getTestPicRecordList", {
          params: {
            isTop1: this.isTop1,
            isTop5: this.isTop5,
            isBaiduTop1: this.isBaiduTop1,
            errType: this.errType,
            curPage: this.curPage,
            pageSize: this.pageSize,
            sortByUpdateTime: this.sortByUpdateTime,
            auditStatus: this.auditStatus
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
.radio-group {
  margin: 10px 0;
}
.radio-group .line {
  border-right: 2px solid #ccc;
  padding: 0 40px;
  display: inline-block;
}
.btn-back {
  float: right;
  margin-top: -35px;
}
.content_box .common_table th {
  width: 60px;
}
</style>

