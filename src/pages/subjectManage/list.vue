<template>
  <el-container v-loading="loading">

    <!-- 搜索栏 -->
    <el-header class="search_header">
      <span class="search_name">主体名称</span>
      <el-input class="search_input" v-model="name" placeholder="请输入主体名称" maxlength="30" @keyup.enter.native="onSearch"></el-input>
      <span class="search_name">编号</span>
      <el-input style="display: inline-block; width: 120px; margin-right: 10px;" v-model="serialNumber" width="100" placeholder="请输入主体编号" maxlength="20" @keyup.enter.native="onSearch"></el-input>
      <span class="search_name">&emsp;编辑时间</span>
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
      <el-button type="primary" size="mini" @click="onSearch">查询</el-button>

      <el-button style="float: right; margin-left: 20px;" type="primary" :disabled="isExportDisabled" size="mini"  @click="exportToExcel">导出</el-button>
      <router-link to="/subject_manage/add">
        <el-button type="primary" size="mini" style="float: right;">新增</el-button>
      </router-link>

    </el-header>
    <el-main class="info_food">
      <!-- 机构信息 -->
      <table class="common_table" cellspacing="0" cellpadding="0">
        <thead>
          <tr>
            <th width="80">主体编号</th>
            <th>名称</th>
            <th width="70">主图</th>
            <th width="140">编辑时间</th>
            <!-- <th class="sort-th" width="140" @click="dateSort($event, '')">
              编辑时间
              <span class="caretWrapper">
                <i :class="{upCaret: true, upColor: dateSortType[0]}" @click="dateSort($event, 0)"></i>
                <i :class="{downCaret: true, downColor: dateSortType[1]}" @click="dateSort($event, 1)"></i>
              </span>
            </th> -->
            <th width="100">
              <el-select v-model="auditValue" placeholder="审核状态" size="mini" @change="auditChange">
                <el-option
                  v-for="item in auditStatus"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
                </el-option>
              </el-select>
            </th>
            <th width="100px">
              <el-select v-model="mainValue" placeholder="主体状态" size="mini" @change="mainChange">
                <el-option
                  v-for="item in mainStatus"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
                </el-option>
              </el-select>
            </th>
            <th width="180px">
              <el-cascader
                placeholder="类型"
                :options="options"
                filterable
                size="mini"
                v-model="categoryIds"
                @change="getType"></el-cascader>
            </th>
            <th @click="originCountSort($event, '', 'originCountSortType')">
              原始数量
              <span class="caretWrapper">
                <i :class="{upCaret: true, upColor: originCountSortType[0]}" @click="originCountSort($event, 0, 'originCountSortType')"></i>
                <i :class="{downCaret: true, downColor: originCountSortType[1]}" @click="originCountSort($event, 1, 'originCountSortType')"></i>
              </span>
            </th>
            <th @click="cleanCountSort($event, '', 'cleanCountSortType')">
              有效数量
              <span class="caretWrapper">
                <i :class="{upCaret: true, upColor: cleanCountSortType[0]}" @click="cleanCountSort($event, 0, 'cleanCountSortType')"></i>
                <i :class="{downCaret: true, downColor: cleanCountSortType[1]}" @click="cleanCountSort($event, 1, 'cleanCountSortType')"></i>
              </span>        
            </th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
            <tr class="no_data" v-if="subjectData == ''"><td colspan="10">暂无数据</td></tr>
            <tr v-for="(item, index) in subjectData" :key="index">
              <td>{{ item.serial_number }}</td>
              <td>{{ item.name }}</td>
              <td>
                <el-popover
                  placement="right"
                  width="400"
                  trigger="hover">
                  <img :src="item.main_image" alt="..." width="100%" height="100%">
                  <div slot="reference" class="name-wrapper">
                    <img :src="item.main_image" alt="..." width="50">
                  </div>
                </el-popover>
              </td>
              <td>{{ item.updatedTime }}</td>
              <td>{{ item.audit_status_cn }}</td>
              <td>{{ item.main_status_cn }}</td>
              <td>{{item.category_level1_value}}/{{item.category_level2_value}}/{{item.category_value}}</td>
              <!-- <td><router-link :to="{path:'/subject_manage/picView',query:{id:item._id,taskId:item.id_task,status:'',from:'subject_manage'}}" v-if="item.real_num_crawler">{{ item.real_num_crawler }}</router-link></td>
              <td><router-link :to="{path:'/subject_manage/picView',query:{id:item._id,taskId:item.id_task,status:1,from:'subject_manage'}}" v-if="item.total_clean">{{ item.total_clean }}</router-link></td> -->
              <td><router-link :to="{path:'/show_pic',query:{id:item._id,pageFrom: 0}}" v-if="item.real_num_crawler">{{ item.real_num_crawler }}</router-link></td>
              <td><router-link :to="{path:'/show_pic',query:{id:item._id,pageFrom: 1}}" v-if="item.total_clean">{{ item.total_clean }}</router-link></td>
              <td>
                <!-- <el-button size="mini" plain>审核</el-button> -->
                <auditDialog :fetchList="fetchList" :auditStatus="item.audit_status" :id="item._id"></auditDialog>
                <router-link :to="{
                    path: '/subject_manage/detail',
                    query: { id: item._id },
                  }">
                  <el-button size="mini" plain>详情</el-button>
                </router-link>
                <router-link :to="{
                    path: '/subject_manage/edit',
                    query: { id: item._id },
                  }">
                  <el-button size="mini" plain>修改</el-button>
                </router-link>
                <el-button 
                  size="mini" 
                  plain 
                  class="delbtn" 
                  :disabled="item.audit_status === 3" 
                  @click="deleteSubject(item._id)">删除</el-button>
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
import { Notification } from 'element-ui';
import request from '../../axios/request';
import { baseUrl } from '../../axios/env';
import { PAGE, AUDIT_STATUS, MAIN_STATUS } from '../../lib/consts';
import { transformStatus, filterCategory } from '../../lib/common';
import auditDialog from './auditDialog';

export default {
  components: { auditDialog },
  data() {
    return {
      loading: false,
      // 搜索区
      name: '',
      serialNumber: '', // 编号
      dateValue: '', // 时间
      beginTime: '',
      endTime: '',
      pickerOptions: {
        shortcuts: [{
          text: '最近一周',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
            picker.$emit('pick', [start, end]);
          }
        }, {
          text: '最近一个月',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
            picker.$emit('pick', [start, end]);
          }
        }, {
          text: '最近三个月',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
            picker.$emit('pick', [start, end]);
          }
        }]
      },

      dateSortType: [false, false], // 时间排序样式
      originCountSortType: [false, false], // 按原始数量排序
      cleanCountSortType: [false, false], // 按清洗后的数量排序
      options: [], // 分类数据

      subjectData: '', // 主体数据
      curPage: 1,
      pageSize: 10,
      totalCount: 0,
      pRef: null,           //解决分页问题
      // 审核状态
      auditStatus: AUDIT_STATUS,
      auditValue: null,
      // 主体状态
      mainStatus: MAIN_STATUS,
      mainValue: null,
      // 主体分类
      categoryId: '',
      categoryIds: [],
      // 排序
      sortByRealNumCrawler: '', // 主体原始图片数量
      sortByTotalClean: '',
      //是否禁用调出按钮
      isExportDisabled: false
    };
  },
  async mounted() {
    let _this = this;
    //获取分类数据
    _this.loading = true;
    let { data } = await _this.axios.get('/pic/manage/v1/getCategory');
    let classification = data.data;
    let newCategory = filterCategory(classification);

    newCategory.unshift({value: '',label: '全部'});
    _this.options = newCategory;
  
    if(this.$route.query.pageFrom){                                      //如果是从添加页面返回过来就回到初始状态
      window.location.href = window.location.href.split('?')[0];         //去掉url上面的参数
      await _this.fetchList();
    }else{
      //获取sessionStorage中存储的数据
      _this.name = sessionStorage.getItem('mainName') || '';
      _this.serialNumber = sessionStorage.getItem('serialNumber') || '';
      _this.dateValue = JSON.parse(sessionStorage.getItem('mainDateValue')) || [];
      if(_this.dateValue != ''){
        _this.setDate();
      }
      _this.auditValue = JSON.parse(sessionStorage.getItem('mainAuditValue'));
      _this.mainValue = JSON.parse(sessionStorage.getItem('mainValue'));              //主体状态
      _this.categoryId = sessionStorage.getItem('mainCategoryId') || '';
      _this.categoryIds = JSON.parse(sessionStorage.getItem('mainCategoryIds')) || [];
      _this.sortByRealNumCrawler = sessionStorage.getItem('mainSortByRealNumCrawler') || '';
      _this.sortByTotalClean = sessionStorage.getItem('mainSortByTotalClean') || '';
      _this.pageSize = JSON.parse(sessionStorage.getItem('mainPageSize')) || 10;
      _this.curPage = JSON.parse(sessionStorage.getItem('mainCurPage')) || 1;
      await _this.fetchList();
    }
    //解决分页跳转问题
    this.pRef = this.$refs.pagination;
    this.pRef.internalCurrentPage =this.curPage;
  },
  methods: {
    // 主体搜索功能
    async onSearch() {
      await this.fetchList();
    },
    // 修改搜索日期的回调函数
    setDate() {
      console.log(this.dateValue);
      // const { dateValue, beginTime, endTime } = this;
      if (this.dateValue === null) {
        this.beginTime = '';
        this.endTime = '';
      } else {
        this.beginTime = this.dateValue[0] + ' 00:00:00';
        this.endTime = this.dateValue[1] + ' 23:59:59';
      }
      let beginDate = this.beginTime;
      let currentDate = new Date();
      beginDate = new Date(beginDate.replace(/\-/g, "\/"));
      if(beginDate != "" && currentDate != "" && beginDate >= currentDate) {
        Notification.error('开始时间不能大于当前时间!');
        this.dateValue = null;
        this.beginTime = '';
        this.endTime = '';
      }
    },
    // 审核状态修改
    async auditChange(e) {
      this.curPage = 1;
      this.auditValue = e;
      await this.fetchList();
    },
    // 筛选主体状态
    async mainChange(e) {
      this.mainValue = e;
      await this.fetchList();
    },
    // 时间排序
    // async dateSort(evt, item) {
    //   evt.stopPropagation();
    //   console.log('item==', item);
    //   this.THSort(item, 'dateSortType');
    // },
    async originCountSort(evt, item, type) {
      evt.stopPropagation();
      // console.log('item==', item);
      this.THSort(item, type);

      this.cleanCountSortType = [false, false];
      this.sortByTotalClean = '';

      if (this.originCountSortType[0] === true) {
        this.sortByRealNumCrawler = 1;
        await this.fetchList();
      } else {
        this.sortByRealNumCrawler = -1;
        await this.fetchList();
      }
    },
    async cleanCountSort(evt, item, type) {
      evt.stopPropagation();
      this.THSort(item, type);
      this.originCountSortType = [false, false];
      this.sortByRealNumCrawler = '';

      if (this.cleanCountSortType[0] === true) {
        this.sortByTotalClean = 1;
        await this.fetchList();
      } else {
        this.sortByTotalClean = -1;
        await this.fetchList();
      }
    },
    THSort(item, type) {
      if (item === '') {
        if (this[type][0] === this[type][1]) {
          this[type] = [true, false];
        } else {
          if(this[type][0] === true){
            this[type] = [false, true];
          }else if(this[type][0] === false){
            this[type] = [false, false];
          }
        }
      } else if (item === 0) {
        this[type] = [true, false];
      } else {
        this[type] = [false, true];
      }
    },
    // 主体状态筛选搜索
    async getType(val) {
      // console.log(val);
      this.curPage = 1;
      this.categoryId = val[val.length-1];
      this.categoryIds = val;
      await this.fetchList();
    },
    // 修改每页展示数量
    async sizeChange(size) {
      this.pageSize = size;
      this.curPage = 1;
      this.pRef.internalCurrentPage =this.curPage;       //解决分页跳转问题
      await this.fetchList();
    },
    // 修改页码
    async currentChange(page) {
      this.curPage = page; 
      this.pRef.internalCurrentPage =this.curPage;       //解决分页跳转问题
      await this.fetchList();
      console.log(page);
    },

    // 获取主体列表
    async fetchList() {
      this.name = this.name.trim();
      let a = /^[\u4E00-\u9FA5A-Za-z0-9\/]{0,30}$/;
      if (!this.name.match(a)) {
        this.common.msgModal("warning", "您输入的主体信息不合法!");
        return;
      }
      this.loading = true;
      const { name, serialNumber, curPage, pageSize, beginTime, endTime, sortByRealNumCrawler, sortByTotalClean, auditValue, mainValue, categoryId } = this;
      let { data } = await request.post(`${baseUrl}/pic/manage/v1/getMainBody`, {
        name,
        pageSize,
        curPage,
        serialNumber,
        beginTime: beginTime,
        endTime: endTime,
        auditStatus: auditValue,
        mainTatus: mainValue,
        categoryId,
        sortByRealNumCrawler,
        sortByTotalClean,
      });

      let listData = data.data.list.map((item, key) => {
        item.audit_status_cn = transformStatus(AUDIT_STATUS, item.audit_status);
        item.main_status_cn = transformStatus(MAIN_STATUS, item.main_status);
        return item;
      });
      this.subjectData = listData;
      this.curPage = data.data.curPage;
      this.pageSize = data.data.pageSize;
      this.totalCount = data.data.totalCount;
      this.loading = false;

      //保存状态到sessionStorage
      this.saveStatus();
    },
    // 删除某个主体
    deleteSubject(id) {
      const _this = this;
      this.$confirm('您确定要删除本条数据吗?', '删除操作：', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        request.post('/pic/manage/v1/deleteMainBody', { id })
          .then(async function(data) {
            _this.common.msgModal("warning", data.data.msg);
            await _this.fetchList();
          })
          .catch();
      }).catch(() => {});
    },

    //保存状态到sessionStorage
    saveStatus() {
      sessionStorage.setItem('mainName',this.name);
      sessionStorage.setItem('serialNumber',this.serialNumber);
      sessionStorage.setItem('mainDateValue',JSON.stringify(this.dateValue));
      sessionStorage.setItem('mainAuditValue',this.auditValue); 
      // sessionStorage.setItem('mainValue',this.mainValue);             //主体状态
      sessionStorage.setItem('mainCategoryId',this.categoryId); 
      sessionStorage.setItem('mainCategoryIds',JSON.stringify(this.categoryIds));
      sessionStorage.setItem('mainSortByRealNumCrawler',this.sortByRealNumCrawler); 
      sessionStorage.setItem('mainSortByTotalClean',this.sortByTotalClean); 
      sessionStorage.setItem('mainPageSize',this.pageSize); 
      sessionStorage.setItem('mainCurPage',this.curPage); 
    },
    async exportToExcel() {
        if (this.totalCount > 20000) {
          this.common.msgModal("error","导出数据不能超过20000条");
          return false;
        }
        this.loading = true;
        const tHeader = ["主体编号", "名称", "编辑时间","审核状态","主体状态","类型","原始数量","有效数量"]; 
        const filterVal = ["serial_number", "name", "updatedTime", "audit_status_cn", "main_status_cn","category","real_num_crawler","total_clean"];　
        const { name, serialNumber, curPage, pageSize, beginTime, endTime, sortByRealNumCrawler, sortByTotalClean, auditValue, mainValue, categoryId } = this;
        let { data } = await request.post(`${baseUrl}/pic/manage/v1/getMainBody`, {
          name,
          pageSize:20000,
          curPage:1,
          serialNumber,
          beginTime,
          endTime,
          auditStatus: auditValue,
          mainTatus: mainValue,
          categoryId,
          sortByRealNumCrawler,
          sortByTotalClean,
        });

      let listData = data.data.list.map((item, key) => {
        item.audit_status_cn = transformStatus(AUDIT_STATUS, item.audit_status);
        item.main_status_cn = transformStatus(MAIN_STATUS, item.main_status);
        item.category = `${item.category_level1_value} / ${item.category_level2_value} / ${item.category_value}`;
        return item;
      });
      this.common.export2Excel(tHeader,filterVal,listData,"主体列表数据");    
      this.loading = false;
    }
  }
};
</script>

<style scoped>
.el-main {
  padding: 0;
}
</style>

