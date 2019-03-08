<template>
  <el-container v-loading="loading">

    <!-- 搜索栏 -->
    <el-header class="search_header">
      <span class="search_name">用户名称</span>
      <el-input class="search_input" v-model="userName" placeholder="请输入用户名称" maxlength="30"
                @keyup.enter.native="onSearch"></el-input>
      <span class="search_name">分组名</span>
      <el-input class="search_input" v-model="groupName" placeholder="请输入分组名" maxlength="30"
                @keyup.enter.native="onSearch"></el-input>
      <el-button type="primary" size="mini" @click="onSearch">查询</el-button>
      <el-button
        class="back-btn"
        type="primary"
        size="mini"
        @click="goDistributionList()">返回
      </el-button>
    </el-header>
      <!-- 机构信息 -->
    <el-main>
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
          <th width="80">用户名</th>
          <th  width="180">分组名</th>
        </tr>
        </thead>
        <tbody>
        <tr class="no_data" v-if="userData == ''">
          <td colspan="3">暂无数据</td>
        </tr>
        <tr v-for="(item, index) in userData" :key="index">
          <td>
             <span class="adp-checkbox-input">
                <span class="adp-checkbox-inner" :class="{'is-checked':item.isChecked}"  @click="selectSingle(item)">
                </span>
                <input class="adp-input" type="checkbox"  />
              </span>
          </td>
          <td>{{ item.username }}</td>
          <td><span class="group-name" v-for="(group,index) in item.groups " :key="index">{{group.groupName}}</span></td>
        </tr>
        </tbody>
      </table>
      <!-- 分页 -->
    <div class="total-num-bar" v-show="totalCount">共{{totalCount}}条</div>
      <!--<el-pagination-->
        <!--class="fixed-width-pagination"-->
        <!--ref="pagination"-->
        <!--:current-page="curPage"-->
        <!--:page-sizes="[100000]"-->
        <!--:page-size="pageSize"-->
        <!--layout="total, sizes, prev, pager, next, jumper"-->
        <!--@size-change="sizeChange"-->
        <!--@current-change="currentChange"-->
        <!--:total="totalCount">-->
      <!--</el-pagination>-->
      <div class="confirm-bar">
        <el-button
          type="primary"
          plain
          @click="goDistributionList()">取消
        </el-button>
        <el-button
          type="primary"
          @click="sureDistribution()">确认
        </el-button>
      </div>
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
        //用户名
        userName: '',
        //分组名
        groupName: '',
        userData: '', // 主体数据
        curPage: 1,
        pageSize: 100000,
        totalCount: 0,
        pRef: null,           //解决分页问题
        //全选
        isChecked: false,
        selectedDistributionBodyList:[]//待分配主体列表
      };
    },
    mounted() {
      let _this = this;
      //获取分类数据
      _this.loading = true;
      //获取sessionStorage中存储的数据
      _this.selectedDistributionBodyList = sessionStorage.getItem('selectedDistributionBodyList') == null ? [] : JSON.parse(sessionStorage.getItem('selectedDistributionBodyList'));
      _this.getUserList();
    },
    methods: {
      // 主体搜索功能
      onSearch() {
        this.getUserList();
      },
      // 获取主体列表[cleanStatus必须为1，未清洗的才能被分配]
      async getUserList() {
        let _this = this;
        _this.userName = _this.userName.trim();
        _this.groupName = _this.groupName.trim();
        let a = /^[\u4E00-\u9FA5A-Za-z0-9\/]{0,30}$/;
        if (!_this.groupName.match(a)) {
          this.common.msgModal("warning", "您输入的分组名不合法!");
          return;
        }

        const { name, curPage, pageSize, sortByDistribution } = this;
        console.log('123',this.name);
        _this.loading = true;
        let { data } = await  request.post(`${baseUrl}/pic/manage/v1/getUser`, {
          username:_this.userName,
          groupName:_this.groupName,
          pageSize:100000,
          curPage:1
        });
        this.userData = data.data.userList;
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
        if(!_this.userData){ return;}
        if (_this.isChecked) {
          _this.userData.map(function (item) {
            item.isChecked = true;
          })
        } else {
          _this.userData.map(function (item) {
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
      goDistributionList(){
        let _this = this;
        sessionStorage.removeItem('selectedDistributionBodyList');
        _this.$router.push({path:'/distribution_list'});
      },
      //保存状态到sessionStorage
      saveStatus() {
        sessionStorage.setItem('distributionMainName', this.name);
      },
      //分配并跳转
      sureDistribution(){
        let _this = this;
        let bodyLength = (_this.selectedDistributionBodyList).length;
        if(bodyLength < 1){
          _this.$message({
            message:'请先选择待分配主体',
            type:'warning'
          });
          return;
        }
        let selectedUserList = [];//被选中的用户列表
        if(_this.userData){
          _this.userData.map(function (item) {
             if(item.isChecked){
               selectedUserList.push(item);
             }
          })
        }
        let selectedUserListLength = selectedUserList.length;
        if(selectedUserListLength< 1){
          _this.$message({
            message:'请先选择待分配的人员',
            type:'warning'
          });
          return;
        }
        let distributionList = _this.distributionAlgorithm(_this.selectedDistributionBodyList,selectedUserList);//计算分配结果
        request.post(`${baseUrl}/pic/manage/v1/cleanDistribution`, {
          distributionList:distributionList
        }).then(function (res) {
          if(res.data.code == 0){
            _this.common.msgModal('success','分配成功！');
            _this.goDistributionList();
          }else {
            _this.common.msgModal('error','分配失败！');
          }
        }).catch(function(){
          _this.common.msgModal('error','分配失败！');
        });

      },
      //分配算法
      distributionAlgorithm(selectedDistributionBodyList,selectedUserList){
        let _this = this;
        let distributionList = [];//返回的最终分配结果
        let bodydivList = [];//对主体进行分组，在进行分配
        let bodyList = selectedDistributionBodyList;
        let userList = selectedUserList;
        let remainderNum = bodyList.length%userList.length;
        let divisorNum = bodyList.length/userList.length;
        let divisorCeilNum = Math.floor(divisorNum);
        if(divisorNum < 1){//当主体数量大于人数时候，分配给最前面的人
          for(let i = 0 ; i < bodyList.length ;i++){
            distributionList.push({
              id:bodyList[i]._id,
              name:bodyList[i].name,
              cleanerId:userList[i]._id,
              cleaner:userList[i].username,
              email:userList[i].email
            });
          }
        }else {//当主体数量小于或等于人数时候，平均分配，剩余的主体进行二次分配
          let cursor = 0;//主体列表的游标
          for(let j = 0 ; j < userList.length ; j++){
            cursor = cursor+divisorCeilNum;
            let temp = divisorCeilNum;
            while (temp){
              distributionList.push({
                id:bodyList[cursor - temp]._id,
                name:bodyList[cursor - temp].name,
                cleanCategory :bodyList[cursor - temp].clean_category,
                cleanerId:userList[j]._id,
                cleaner:userList[j].username,
                email:userList[j].email
              });
              temp--;
            }
          }
          //游标记录了剩余的主体数量，并进行二次分配
          if(cursor < (bodyList.length)){
            let surplus = (bodyList.length) - cursor;
            while (surplus){
              distributionList.push({
                id:bodyList[bodyList.length - surplus]._id,
                name:bodyList[bodyList.length - surplus].name,
                cleanCategory :bodyList[bodyList.length - surplus].clean_category,
                cleanerId:userList[userList.length - surplus]._id,
                cleaner:userList[userList.length - surplus].username,
                email:userList[userList.length - surplus].email
              });
              surplus--;
            }
          }
        }
        return distributionList;
      },
      //跳转到清洗列表
      goDistributionList(){
        let _this = this;
        sessionStorage.removeItem('selectedDistributionBodyList');
        //跳转到清洗分配用户表
        _this.$router.push({path:'/distribution_list'});
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
    padding: 20px;
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
    margin:10px;
  }
  .fixed-width-pagination{
    width: 1000px;
    margin:20px;
  }
  .back-btn{
    float: right;
  }
  .confirm-bar{
    width: 1000px;
    margin:10px;
    text-align: center;
  }
  .total-num-bar{
    width: 1000px;
    margin:10px;
    text-align: center;
  }
  .group-name{
    padding: 0 20px;
  }
</style>

