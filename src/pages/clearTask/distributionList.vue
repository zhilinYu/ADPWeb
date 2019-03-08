<template>
  <el-container v-loading="loading">

    <!-- 搜索栏 -->
    <el-header class="search_header">
      <span class="search_name">主体名称</span>
      <el-input class="search_input" v-model="name" placeholder="请输入主体名称" maxlength="20"
                @keyup.enter.native="onSearch"></el-input>
      <el-button type="primary" size="mini" @click="onSearch">查询</el-button>
    </el-header>
    <el-main class="info_food">
      <div class="tab-header-bar">
        <el-button
        size="mini"
        plain
        @click="goDistribution()">分配
      </el-button>
        <div class="clear-both"></div>
      </div>
      <!-- 机构信息 -->
      <table class="common_table fixed-width-table" cellspacing="0" cellpadding="0">
        <thead>
        <tr>
          <th  width="80">
          <span class="adp-checkbox-input">
                <span class="adp-checkbox-inner" :class="{'is-checked':isChecked}"  @click="selectAll()">
                </span>
                <input class="adp-input" type="checkbox"  />
              </span>
          </th>
          <th width="80">主体编号</th>
          <th  width="180">名称</th>
          <th width="180px">
            <el-cascader
              placeholder="类型"
              :options="options"
              filterable
              size="mini"
              v-model="categoryIds"
              @change="getType"></el-cascader>
          </th>
          <th  width="80">
            原始数量
          </th>
        </tr>
        </thead>
        <tbody>
        <tr class="no_data" v-if="subjectData == ''">
          <td colspan="5">暂无数据</td>
        </tr>
        <tr v-for="(item, index) in subjectData" :key="index">
          <td>
             <span class="adp-checkbox-input">
                <span class="adp-checkbox-inner" :class="{'is-checked':item.isChecked}"  @click="selectSingle(item)">
                </span>
                <input class="adp-input" type="checkbox"  />
              </span>
          </td>
          <td>{{ item.serial_number }}</td>
          <td>{{ item.name }}</td>
          <td>{{ item.category_level1_value }}/{{ item.category_level2_value }}/{{ item.category_value }}</td>
          <!-- <td>{{ item.real_num_crawler }}</td> -->
          <!-- <td><router-link :to="{path:'/subject_manage/picView',query:{id:item._id,taskId:item.id_task,status:'',from:'clean_list'}}" v-if="item.real_num_crawler">{{ item.real_num_crawler }}</router-link></td> -->
          <td><router-link :to="{path:'/show_pic',query:{id:item._id,pageFrom: 2}}" v-if="item.real_num_crawler">{{ item.real_num_crawler }}</router-link></td>
        </tr>
        </tbody>
      </table>
      <div  class="total-num-bar" v-show="totalCount">共{{totalCount}}条</div>
      <!-- 分页 -->
      <!--<el-pagination
        class="fixed-width-pagination"
        ref="pagination"
        :current-page="curPage"
        :page-sizes="[300]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="sizeChange"
        @current-change="currentChange"
        :total="totalCount">
      </el-pagination>-->
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
        subjectData: '', // 主体数据
        curPage: 1,
        pageSize: 300,
        totalCount: 0,
        pRef: null,           //解决分页问题
        //全选
        isChecked:false,
        options:[],
        // 主体分类
        categoryId: '',
        categoryIds: [],
      };
    },
    async mounted() {
      let _this = this;
      //获取分类数据
      _this.loading = true;
      //获取分类数据
      let { data } = await _this.axios.get('/pic/manage/v1/getCategory');
      let classification = data.data;
      let newCategory = filterCategory(classification);
      newCategory.unshift({value: '',label: '全部'});
      _this.options = newCategory;

      //清空以前选中的主体
      sessionStorage.removeItem('selectedDistributionBodyList');
      //获取sessionStorage中存储的数据
      _this.name = sessionStorage.getItem('distributionMainName') == null ? '' : sessionStorage.getItem('distributionMainName');
      _this.categoryId = sessionStorage.getItem('distributionMainCategoryId') == null ? '' : sessionStorage.getItem('distributionMainCategoryId');
      let ids = sessionStorage.getItem('distributionMainCategoryIds');
      _this.categoryIds = (ids == null) ? [] : ids.split(',');
      _this.fetchList();
      //解决分页跳转问题
      //this.pRef = this.$refs.pagination;
      //this.pRef.internalCurrentPage = this.curPage;
    },
    methods: {
      // 主体搜索功能
      onSearch() {
        this.name = this.name.trim();
        let a = /^[\u4E00-\u9FA5A-Za-z0-9\/\.:]{0,20}$/;
        if (this.name.match(a)) {
          this.curPage = 1;
          //this.pRef.internalCurrentPage = this.curPage;
          this.fetchList();
        } else {
          this.common.msgModal("error", "您输入的主体信息不合法!");
        }
      },
      //时间排序
      cleanDistributionSort() {
        let _this = this;
        //保存状态到sessionStorage
        if(_this.sortByDistribution == -1){
          _this.sortByDistribution = 1;
          _this.fetchList();
          return;
        }
        if(_this.sortByDistribution == 1){
          _this.sortByDistribution = -1;
          _this.fetchList();
          return;
        }
      },
      // 修改每页展示数量
      sizeChange(size) {
        this.pageSize = size;
        this.curPage = 1;
        //this.pRef.internalCurrentPage = this.curPage;       //解决分页跳转问题
        this.fetchList();
      },
      // 修改页码
      currentChange(page) {
        this.curPage = page;
        //this.pRef.internalCurrentPage = this.curPage;       //解决分页跳转问题
        this.fetchList();

      },
      // 主体状态筛选搜索
      async getType(val) {
        this.curPage = 1;
        this.categoryId = val[val.length-1];
        this.categoryIds = val;
        await this.fetchList();
      },
      // 获取主体列表[cleanStatus必须为1，未清洗的才能被分配]
      async fetchList() {
        let _this = this;
        this.name = this.name.trim();
        let a = /^[\u4E00-\u9FA5A-Za-z0-9\/]{0,30}$/;
        if (!this.name.match(a)) {
          this.common.msgModal("warning", "您输入的主体信息不合法!");
          return;
        }
        this.loading = true;
        const { name, curPage, pageSize, sortByDistribution } = this;
        let { data } = await  request.post(`${baseUrl}/pic/manage/v1/getMainBody`, {
          name,
          pageSize,
          curPage,
          cleanStatus:1,
          taskStatus:3,
          auditStatus:3,
          categoryId:_this.categoryId
        });
        this.subjectData =  data.data.list;
        this.curPage = data.data.curPage;
        this.pageSize = data.data.pageSize;
        this.totalCount = data.data.totalCount;
        this.loading = false;
        //保存状态到sessionStorage
        this.saveStatus();
      },
      //全选
      selectAll(){
        let _this = this;
        _this.isChecked = !_this.isChecked;
        if(_this.isChecked){
          _this.subjectData.map(function (item) {
            item.isChecked = true;
          })
        }else {
          _this.subjectData.map(function (item) {
            item.isChecked = false;
          })
        }


      },
      //单选
      selectSingle(item){
        let _this = this;
        item.isChecked = !item.isChecked;
      },
      //选中,待分配主体
      async goDistribution(){
        let _this  = this;
        let selectedDistributionBodyList = [];
        await  _this.subjectData.map(function (item) {
          if(item.isChecked){
            selectedDistributionBodyList.push(item)
          }
        });
        await sessionStorage.setItem('selectedDistributionBodyList', JSON.stringify(selectedDistributionBodyList));
        //跳转到清洗分配用户表
        _this.$router.push({path:'/distribution_user_list'});
      },
      //保存状态到sessionStorage
      saveStatus() {
        sessionStorage.setItem('distributionMainName', this.name);
        sessionStorage.setItem('distributionMainCategoryId',this.categoryId);
        sessionStorage.setItem('distributionMainCategoryIds',JSON.stringify(this.categoryIds));
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
  .tab-header-bar{
    padding: 20px 0;
    width: 1000px;
  }
  .tab-header-bar>.el-button{
    float: right;
  }
  .clear-both{
    clear: both;
  }
  .adp-checkbox-input{
    cursor: pointer;
    outline: 0;
    line-height: 1;
    vertical-align: middle;
  }
  .adp-checkbox-inner{
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
    -webkit-transition: border-color .25s cubic-bezier(.71,-.46,.29,1.46),background-color .25s cubic-bezier(.71,-.46,.29,1.46);
    transition: border-color .25s cubic-bezier(.71,-.46,.29,1.46),background-color .25s cubic-bezier(.71,-.46,.29,1.46);
  }
  .adp-checkbox-inner.is-checked{
    background: #409eff;
    border-color:#409eff;
  }
  .adp-checkbox-inner.is-checked::after{
    -webkit-transform: rotate(45deg) scaleY(1);
    transform: rotate(45deg) scaleY(1);
  }
  .adp-checkbox-inner::after{
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
    -webkit-transition: -webkit-transform .15s ease-in .05s;
    transition: -webkit-transform .15s ease-in .05s;
    transition: transform .15s ease-in .05s;
    transition: transform .15s ease-in .05s, -webkit-transform .15s ease-in .05s;
    transition: transform .15s ease-in .05s,-webkit-transform .15s ease-in .05s;
    -webkit-transform-origin: center;
    transform-origin: center;
  }
  .adp-input{
    opacity: 0;
    outline: 0;
    position: absolute;
    margin: 0;
    width: 0;
    height: 0;
    z-index: -1;
  }
  .fixed-width-table{
    width: 1000px;
  }
  .fixed-width-pagination{
    width: 1000px;
    margin:20px;
  }
  .total-num-bar{
    width: 1000px;
    margin:10px;
  }
</style>

