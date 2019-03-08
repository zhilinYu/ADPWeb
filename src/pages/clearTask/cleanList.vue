<template>
  <el-container v-loading="loading">

    <!-- 搜索栏 -->
    <el-header class="search_header">
      <span class="search_name">主体名称</span>
      <el-input class="search_input" v-model="name" placeholder="请输入主体名称" maxlength="30"
                @keyup.enter.native="onSearch"></el-input>

      <el-button type="primary" size="mini" @click="onSearch">查询</el-button>
    </el-header>
    <el-main class="info_food">
      <!-- 机构信息 -->
      <table class="common_table" cellspacing="0" cellpadding="0">
        <thead>
        <tr>
          <th width="80">主体编号</th>
          <th>名称</th>
          <th width="100">
            <el-select v-model="cleanStatusValue" placeholder="状态" size="mini" @change="cleanStatusChange">
              <el-option
                v-for="item in cleanStatus"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </th>
          <th width="100px">
            <el-select v-model="cleanCategoryValue" placeholder="任务类型" size="mini" @change="cleanCategoryChange">
              <el-option
                v-for="item in cleanCategory"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </th>
          <th>
            原始数量
          </th>
          <th>
            保留数量
          </th>
          <th width="80">清洗人</th>
          <th @click="cleanCompletedSort()">
            完成时间
              <span class="caretWrapper">
                <i :class="{upCaret: true,activeUpCaret:(sortByCompleted == -1)}"></i>
                <i :class="{downCaret: true,activeDownCaret:(sortByCompleted == 1)}"></i>
              </span>
          </th>
          <th>操作</th>
        </tr>
        </thead>
        <tbody>
        <tr class="no_data" v-if="subjectData == ''">
          <td colspan="10">暂无数据</td>
        </tr>
        <tr v-for="(item, index) in subjectData" :key="index">
          <td>{{ item.serial_number }}</td>
          <td>{{ item.name }}</td>
          <td>{{ item.clean_status |  cleanStatusFilter}}</td>
          <td>{{ item.clean_category  |  cleanCategoryFilter }}</td>
          <td>
            <router-link :to="{path:'/show_pic',query:{id:item['_id'],pageFrom: 5}}">{{ item.real_num_crawler }}</router-link>
          </td>
          <td>{{ item.total_clean }}</td>
          <td>{{item.cleaner}}</td>
          <td>{{ item.cleanCompletedDate }}</td>
          <td>
            <el-button
              size="mini"
              plain
              :disabled=" item.clean_status === 3"
              @click="goClean(item)">清洗
            </el-button>
            <el-button
              size="mini"
              plain
              :disabled=" item.clean_status === 3"
              @click="goAssignTask(item)">分配
            </el-button>
            <el-button
              size="mini"
              plain
              :disabled=" item.clean_status === 3"
              @click="cleanCompleted(item)">完成
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
        :total="totalCount">
      </el-pagination>
    </el-main>
  </el-container>
</template>

<script type="es6">
  import { Notification } from 'element-ui';
  import request from '../../axios/request';
  import { baseUrl } from '../../axios/env';
  import { PAGE, CLEAN_STATUS, CLEAN_CATEGORY } from '../../lib/consts';
  import { transformStatus, filterCategory } from '../../lib/common';

  export default {
    data() {
      return {
        loading: false,
        // 搜索区
        name: '',
        options: [], // 分类数据
        subjectData: '', // 主体数据
        curPage: 1,
        pageSize: 20,
        totalCount: 0,
        pRef: null,           //解决分页问题
        // 清洗状态
        cleanStatus: CLEAN_STATUS,
        cleanStatusValue: '',
        // 任务类型
        cleanCategory: CLEAN_CATEGORY,
        cleanCategoryValue: '',
        // 排序
        sortByCompleted: -1
      };
    },
    created() {
      let _this = this;
      //获取分类数据
      _this.loading = true;
      //获取sessionStorage中存储的数据
      _this.name = sessionStorage.getItem('mainName') || '';
      _this.cleanStatusValue = JSON.parse(sessionStorage.getItem('cleanStatusValue'));
      _this.cleanCategoryValue = JSON.parse(sessionStorage.getItem('cleanCategoryValue'));
      _this.sortByCompleted = sessionStorage.getItem('sortByCompleted') || '-1';
      _this.pageSize = JSON.parse(sessionStorage.getItem('pageSize')) || 20;
      _this.curPage = JSON.parse(sessionStorage.getItem('curPage')) || 1;

      _this.fetchList();
    },
    mounted() {
      //解决分页跳转问题
      this.pRef = this.$refs.pagination;
      this.pRef.internalCurrentPage = this.curPage;
    },
    methods: {
      // 清洗按钮
      goClean(item) {

        console.log('item._id', item['_id']);
        this.$router.push({ path: `/clean_action`, query:{id:item['_id'],taskId:item['id_task']} });
      },
      // 主体搜索功能
      onSearch() {
        this.fetchList();
      },
      // 清洗状态修改
      cleanStatusChange(e) {
        this.curPage = 1;
        this.cleanStatusValue = e;
        this.fetchList();
      },
      // 筛选任务类型
      cleanCategoryChange(e) {
        this.cleanCategoryValue = e;
        this.fetchList();
      },
      //时间排序
      cleanCompletedSort() {
        let _this = this;
        //保存状态到sessionStorage
        if(_this.sortByCompleted == -1){
          _this.sortByCompleted = 1;
          _this.fetchList();
          return;
        }
        if(_this.sortByCompleted == 1){
          _this.sortByCompleted = -1;
          _this.fetchList();
          return;
        }
      },
      // 修改每页展示数量
      sizeChange(size) {
        this.pageSize = size;
        this.curPage = 1;
        this.pRef.internalCurrentPage = this.curPage;       //解决分页跳转问题
        this.fetchList();
      },
      // 修改页码
      currentChange(page) {
        this.curPage = page;
        this.pRef.internalCurrentPage = this.curPage;       //解决分页跳转问题
        this.fetchList();
        console.log(page);
      },
      // 获取主体列表
      async fetchList() {
        this.name = this.name.trim();
        let a = /^[\u4E00-\u9FA5A-Za-z0-9\/]{0,30}$/;
        if (!this.name.match(a)) {
          this.common.msgModal("warning", "您输入的主体名称不合法!");
          return;
        }
        this.loading = true;
        const { name, curPage, pageSize, sortByCompleted, cleanStatusValue, cleanCategoryValue } = this;
        let { data } = await  request.post(`${baseUrl}/pic/manage/v1/getMainBody`, {
          name,
          pageSize,
          curPage,
          cleanStatus:cleanStatusValue,
          cleanCategory:cleanCategoryValue,
          sortByCompleted,
          auditStatus:3,
          taskStatus:3,
          cleanListFlag:(cleanStatusValue == 0)?(1):(null)
        });
        let listData = data.data.list;
        this.subjectData = listData;
        this.curPage = data.data.curPage;
        this.pageSize = data.data.pageSize;
        this.totalCount = data.data.totalCount;
        this.loading = false;

        //保存状态到sessionStorage
        this.saveStatus();
      },
      //保存状态到sessionStorage
      saveStatus() {
        sessionStorage.setItem('mainName', this.name);
        sessionStorage.setItem('cleanStatusValue', JSON.stringify(this.cleanStatusValue));
        sessionStorage.setItem('cleanCategoryValue', this.cleanCategoryValue);
        sessionStorage.setItem('sortByCompleted', this.sortByCompleted);
        sessionStorage.setItem('pageSize', JSON.stringify(this.pageSize));
        sessionStorage.setItem('curPage', this.curPage);
      },
      //清洗完成
       cleanCompleted(item){
         let _this = this;

        this.$confirm('您确定已经清洗完成了吗?', '操作：', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }).then(function () {
          _this.loading = true;
          request.post(`${baseUrl}/pic/manage/v1/cleanCompleted`, {id:item._id}).then(function () {
            _this.fetchList();
            _this.loading = false;
          }).catch(function(err){
            _this.common.msgModal("error", "请求失败!");
          });

        }).catch(action => {

        });

      },
      goAssignTask(obj){
        this.$router.push({path:'/assign_task',query:{subjectId:obj._id,subjectName:obj.name,cleaner:obj.cleaner}});
      }
    }
  };
</script>

<style scoped>
  .el-main {
    padding: 0;
  }
.activeUpCaret{
  border-bottom: 4px solid #409EFF;
  }
  .activeDownCaret{
    border-top: 4px solid #409EFF;
  }

</style>

