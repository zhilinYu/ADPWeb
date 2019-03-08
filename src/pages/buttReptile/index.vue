<template>

  <el-container v-loading="loading">
    <!-- 搜索栏 -->
    <el-header class="search_header">
      <span class="search_name">网站信息</span>
      <el-input class="search_input" placeholder="请输入网站名称或地址" maxlength="20" v-model="websiteName" @keyup.enter.native="onSearch"></el-input>
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
        @click="onSearch">查询</el-button>
      <div style="float: right;">
        <commonModal :fetchList="fetchList" :subOptions="subOptions" :modalTitle="addTitle"></commonModal>
      </div>
    </el-header>

    <el-main class="content_box">
      <!-- 爬虫网站信息 -->
      <table class="common_table" cellspacing="0" cellpadding="0">
        <thead>
          <tr>
            <th width="60">序号</th>
            <th>名称</th>
            <th>创建时间</th>
            <th class="sort-th" @click="dateSort($event, '')">
              编辑时间
              <span class="caretWrapper">
                <i :class="{upCaret: true, upColor: dateSortType[0]}" @click="dateSort($event, 0)"></i>
                <i :class="{downCaret: true, downColor: dateSortType[1]}" @click="dateSort($event, 1)"></i>
              </span>
            </th>
            <th>地址</th>
            <th>
              <el-cascader
                placeholder="类型"
                :options="options"
                filterable
                @change="getType"></el-cascader>
            </th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
            <tr class="no_data" v-if="tableData == ''"><td colspan="7">暂无数据</td></tr>
            <tr v-for="(item, index) in tableData" :key="index">
              <td>{{ (curPage-1)*pageSize+index+1 }}</td>
              <td>{{ item.name }}</td>
              <td>{{ item.createAt }}</td>
              <td>{{item.updateAt}}</td>
              <td>{{item.addr}}</td>
              <td>{{item.type.nameList[0]}}/{{item.type.nameList[1]}}/{{item.type.nameList[2]}}</td>
              <td>
                <updateModal :fetchList="fetchList" :subOptions="subOptions" :modalTitle="editTitle" :data="item"></updateModal>
                <el-button
                  size="mini"
                  plain
                  class="delbtn"
                  @click="delWebsite(item)">删除</el-button>
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
        :total="totalCount">
      </el-pagination>
    </el-main>
  </el-container>

</template>

<script>
import request from '../../axios/request';
import { baseUrl } from '../../axios/env';
import { PAGE } from '../../lib/consts';
import { filterCategory } from '../../lib/common';
import commonModal from './commonModal';
import updateModal from './updateModal';

const { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } = PAGE;

export default {
  components: { commonModal, updateModal },
  data() {
    return {
      loading: false,          // loading状态
      websiteName: '',                // 网站名称

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

      sortByUpdateTime: -1,              //更新时间排序     -1 : 降序      1 : 升序
      dateSortType: [false, false],      // 时间排序样式

      curPage: 1,              // 分页
      pageSize: DEFAULT_PAGE_SIZE,
      totalCount: 0,
      pRef: null,           //解决分页问题
      tableData: [],
      addTitle: '新增',
      editTitle: '编辑',
      addCss: 'float: right;',
      editCss: '',
      typeId: '',                //分类数据
      options: [],
      subOptions: [],          //传到子组件中的分类数据
    }
  },
  mounted() {
    //解决分页跳转问题
    this.pRef = this.$refs.pagination;
    this.pRef.internalCurrentPage = this.curPage;
  },
  async created() {
    let _this = this;
    _this.getState();
    _this.fetchList();

    //获取分类数据
    _this.loading = true;
    _this.axios.get('/pic/manage/v1/getCategory')
    .then(function (res) {
      _this.loading = false;
      let data = res.data.data;
      // console.log(JSON.stringify(data));
      // data.map(function(item){
      //   if(item.children == ''){
      //     delete item.children;
      //   }else{
      //     item.children.map(function(i){
      //       if(i.children == ''){
      //         delete i.children;
      //       }else{
      //         i.children.map(function(n){
      //           if(n.children == ''){
      //             delete n.children;
      //           }
      //         });
      //       }
      //     });
      //   }
      // });
      let newCategory = filterCategory(data);
      _this.subOptions = newCategory;
      let ss = Object.assign([], newCategory);
      setTimeout(function() {
        ss.unshift({value: '0',label: '全部'});
        _this.options = ss;
      });
    });
  },
  methods: {
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
    },

    //可搜索的多级下拉列表的change事件
    async getType(val) {
      this.typeId = val[val.length-1];
      await this.fetchList();
    },

    async fetchList() {
      const { curPage, pageSize, websiteName, typeId, beginTime, endTime, sortByUpdateTime } = this;
      let { data } = await request.post(`${baseUrl}/pic/manage/v1/fetchWebsites`, {
        curPage,
        pageSize,
        name: websiteName,
        typeId,
        beginTime,
        endTime,
        sortByUpdateTime
      });
      this.tableData = data.data;
      //console.log('this.tableData', this.tableData);
      this.curPage = parseInt(data.curPage);
      this.totalCount = parseInt(data.totalCount);
      this.setState();
    },

    //更新时间排序
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
      this.fetchList();
    },

    //分页
    sizeChange(val) {
      this.pageSize = val;
      this.curPage = 1;
      this.fetchList();
    },
    //
    currentChange(val) {
      this.curPage = val;
      console.log('size=', val, this.pageSize,this.curPage);
      this.fetchList();
    },
    //搜索
    onSearch() {
      this.websiteName = this.websiteName.trim();
      let a = /^[\u4E00-\u9FA5A-Za-z0-9\/\.:]{0,20}$/;
      if (this.websiteName.match(a)) {
        this.curPage = 1;
        this.fetchList();
      } else {
        this.common.msgModal("error", "您输入的网站信息不合法!");
      }

    },

    //删除
    delWebsite(item) {
      //console.log(item);
      let _this = this;
      //弹出框
      _this.$confirm('确定删除此站点吗?', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        request.delete(`${baseUrl}/pic/manage/v1/deleteWebsite?id=${item._id}`)
          .then(function() {
            _this.fetchList();
          });
        _this.common.msgModal('success','删除成功！');
      });
    },

    //保存状态到sessionStorage
    setState() {
      sessionStorage.setItem('websiteName',this.websiteName);
      sessionStorage.setItem('type',this.type);
      sessionStorage.setItem('curPage',this.curPage);
      sessionStorage.setItem('pageSize',this.pageSize);
    },

    //获取在sessionStorage中的状态
    getState() {
      this.websiteName = sessionStorage.getItem('websiteName') || '';
      this.type = sessionStorage.getItem('type') ? sessionStorage.getItem('type') : 0;
      this.curPage = sessionStorage.getItem('curPage') ? parseInt(sessionStorage.getItem('curPage')) : 1;
      this.pageSize = sessionStorage.getItem('pageSize') ? parseInt(sessionStorage.getItem('pageSize')) : DEFAULT_PAGE_SIZE;
    }

  }
}
</script>

<style scoped>

</style>

