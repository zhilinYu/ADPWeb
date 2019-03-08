<template>
  <div class="app-container">
    <div class="app-nav">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/crawler_modules' }">爬虫列表</el-breadcrumb-item>
        <el-breadcrumb-item>新增爬虫</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="app-content">

      <div class="tags-content">
        <label class="adp-label-title">主体名称</label>
        <div class="tags-list">
          <span class="adp-placeholder" v-show="tags.length ===0">请添加主体名称</span>
          <el-tag
            v-for="(tag,index) in tags"
            :key="index"
            closable
            type="info" @close="handleClose(tag)" :tagid="tag.id" >
            {{tag.name}}
          </el-tag>
        </div>
        <button class="add-subject" @click="addSubject">添加主体</button>
      </div>
      <el-form class="app-form-maxwidth" label-position="left" label-width="100px">
        <el-form-item label="数量要求" :rules="[{required: true}]">
          <div>
            <el-radio v-model="radio" label="1" @change="websiteType">站点数量</el-radio>
            <el-radio v-model="radio" label="2" @change="websiteType">
              <label>总数量</label>
              <el-input autosize :disabled="!countType" type="input" v-model="totalCount" @change="getTotalNum" maxlength="6" placeholder="请输入内容"></el-input>
            </el-radio>
          </div>
        </el-form-item>
        <el-form-item label="站点选择" :rules="[{required: true}]">
          <el-table
            ref="multipleTable"
            :data="tableData3"
            border
            height="500"
            tooltip-effect="dark"
            style="width: 100%"
            @selection-change="handleSelectionChange">
            <el-table-column
              type="selection"
              width="55">
            </el-table-column>
            <el-table-column
              prop="name"
              label="站点名称"
              width="120">
            </el-table-column>
            <el-table-column
              prop="addr"
              label="站点地址"
              show-overflow-tooltip>
            </el-table-column>
            <el-table-column
              prop="num"
              label="爬虫数量">
              <template slot-scope="scope">
                <el-input type="text" :disabled="countType" placeholder="请输入内容" v-model="scope.row.num"  @change="getRowNum(scope.$index, scope.row,$event)" maxlength="6"></el-input>
              </template>
            </el-table-column>
          </el-table>
        </el-form-item>


        <el-form-item>
          <el-row class="app-foot-btns">
            <el-col :span="20" style="height: 40px"></el-col>
            <el-col :span="4" style="text-align: right">
              <el-button type="primary" @click="createTask">保存</el-button>
            </el-col>
          </el-row>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>

  import request from '../../axios/request';
  import { baseUrl } from '../../axios/env';
  export default {
    name: "addPicCrawlerTask",

    data(){
      return {
        //选择主体弹框
        dialogTableVisible:false,                   //是否隐藏弹框
        subjectsData: [],                           //审核通过的主体列表
        multiSubjectsSelection: [],
        //表格
        tableData3: [],
        num:0,
        totalCount: '',

        countType:true,
        //网站列表
        multipleSelection: [],                      //表格多选

        curPage: 1,
        pageSize: 10,
        total:0,
        typeId:'',
        //单选
        radio: '2',
        tags:[]
      }
    },
    created:function(){
      if (window.sessionStorage.getItem('subTask')){
          this.tags = JSON.parse(window.sessionStorage.getItem('subTask'));
      }
    },
    mounted(){
      this.getWebsiteList();
    },
    destroyed(){

    },
    beforeRouteLeave(to,from,next){
      if (to.path === '/crawler_modules'){
        let subArr = [];
        if (window.sessionStorage.getItem('subTask')) {
          subArr =JSON.parse(window.sessionStorage.getItem('subTask'));
          subArr.splice(0,subArr.length);
          window.sessionStorage.setItem('subTask',JSON.stringify(subArr));
        }
      }
      next();
    },
    methods:{
      handleCurrentChange(val){
        this.curPage = val;
        this.getWebsiteList();
      },
      handleClose(tag) {
        this.tags.splice(this.tags.indexOf(tag), 1);
        window.sessionStorage.setItem('subTask',JSON.stringify(this.tags));
      },
      addSubject(){
        this.$router.push('./crawler_subject_list');
      },
      handleSelectionChange(val) {
        this.multipleSelection  = val;
        let tb = this.$refs.multipleTable.tableData;
        let len  = this.multipleSelection.length;

        console.log(val);
        if (this.radio === '2'){
          if (this.totalCount === ''){
            this.common.msgModal("warning", '总数量不能为空');
            this.$refs.multipleTable.clearSelection();
            return false;
          }
          tb.forEach((item)=>{
            item.num = '';
          });
          if (len !==0 ){
            let averageCount =(  parseInt(this.totalCount) - this.totalCount%len)/len;
            for (let i = 0;i<len;i++){
              this.multipleSelection[i].num = averageCount;
            }
            this.multipleSelection[len-1].num =this.multipleSelection[len-1].num +this.totalCount%len;
          }

        }else {
          tb.forEach((item)=>{
            item.num = '';
          });
        }

      },
      getRowNum(index,row,e){
        let numReg = /^[1-9][0-9]*$/;
        if (numReg.test(e) && e<100000){
          row.num = e;
        }else {
          row.num = '';
          this.common.msgModal("warning", '请输入大于1并且小于100000的数字');
          return;
        }
        console.log(row);
      },
      getTotalNum(val){
        console.log(this.multipleSelection);
        let numReg = /^[1-9][0-9]*$/;
        if (numReg.test(val) && val <=100000){
          let tb = this.$refs.multipleTable.tableData;
          let len  = this.multipleSelection.length;
          if (this.totalCount === ''){
            this.common.msgModal("warning", '总数量不能为空');
            this.$refs.multipleTable.clearSelection();
            return false;
          }
          tb.forEach((item)=>{
            item.num = '';
          });
          if (this.multipleSelection.length !== 0) {
            let averageCount =(  parseInt(this.totalCount) - this.totalCount%len)/len;
            for (let i = 0;i<len;i++){
              this.multipleSelection[i].num = averageCount;
            }
            this.multipleSelection[len-1].num =this.multipleSelection[len-1].num +this.totalCount%len;
          }


        }else {
          this.totalCount = '';
          this.common.msgModal("warning", '请输入大于1并且小于100000的数字');
          return;
        }
      },
      websiteType(val){
        if (val === '2'){
          this.countType = true;
          this.$refs.multipleTable.clearSelection();

        }else {
          this.countType = false;
          this.totalCount = '';
          this.$refs.multipleTable.clearSelection();
        }
      },
      /**
       * 获取网站数据
       */
      getWebsiteList:function() {
        let that = this;
        const { curPage, pageSize, typeId } = this;
        request.post(`${baseUrl}/pic/manage/v1/fetchWebsites`, {
          beginTime: "",
          curPage: "",
          endTime: "",
          name:"",
          pageSize:"",
          sortByUpdateTime: -1,
          typeId: typeId
        })
        .then(res=>{
          if (res.data.code === 0){
            let results = res.data.data;
            results.forEach((item)=>{
              item.num = '';
            });
            that.tableData3 = res.data.data;
            that.total =  res.data.totalCount;
            that.curPage = res.data.curPage;
          }
        })
      },
       //创建爬虫任务
      createTask(){
        let that = this;
        let paramsObj = {};
        paramsObj.name = '';
        paramsObj.creator = "";
        paramsObj.subjects = [];
        paramsObj.websites =[];

        console.log(this.multipleSelection);

        if (this.tags.length === 0){
          this.common.msgModal("warning", '请添加主体');
          return false;
        }

        for (let i = 0; i<this.multipleSelection.length;i++){
          if (this.multipleSelection[i].num === undefined ||this.multipleSelection[i].num === ""){
            this.common.msgModal("warning", '填写数量');
            return false;
          }else {
           let websitesObj = {};
           websitesObj['require_num'] = this.multipleSelection[i].num;
           websitesObj['name'] = this.multipleSelection[i].name;
           websitesObj['website_address'] = this.multipleSelection[i].addr;
           websitesObj['id_website'] = this.multipleSelection[i].type.id;
           paramsObj.websites.push(websitesObj);
         }
        }
        if (this.multipleSelection.length === 0){
          this.common.msgModal("warning", '请勾选站点');
          return false;
        }
        if (this.multipleSelection.length >30){
          this.common.msgModal("warning", '站点数量应小于30个');
          return false;
        }
        for (let i = 0;i<this.tags.length;i++){
          let subObj = {};
          subObj['id_subject'] = this.tags[i].id;
          subObj['name'] = this.tags[i].name;
          subObj['alias'] = this.tags[i].alias;
          paramsObj.subjects.push(subObj);
        }

        request.post(`${baseUrl}/pic/manage/v1/createCrawlerBatch`,paramsObj).then(function(res) {
          if (res.data.code === 0){
            window.sessionStorage.removeItem('subTask');
            that.common.msgModal("success", '创建成功');
            if (window.sessionStorage.getItem('subTask')) {
              subArr =JSON.parse(window.sessionStorage.getItem('subTask'));
              subArr.splice(0,subArr.length);
              window.sessionStorage.setItem('subTask',JSON.stringify(subArr));
            }
            // that.$router.back(-1);
            that.$router.push({ path: "/crawler_modules", query: {pageFrom: 'add'} }); //保存成功返回
          }else {
            that.common.msgModal("error", '创建失败');
          }
        })
      }
    }
  };
</script>

<style scoped>
  .adp-placeholder{
    font-size: 14px;
    color:#c7c7cd ;
  }
  .app-content{
    position: relative;
    margin-top: 30px;
  }
  .add-subject{
    position: absolute;
    right: 0;
    padding: 5px;
    color: #fff;
    background: #66b1ff;
    border: none;
    border-radius: 4px;
  }
  .app-form-maxwidth{
    margin: 0 auto;
    width: 70%;
  }
  .app_dialog_foot .app_dialog_foot_btn{
    text-align: right;
    padding-top: 10px;
  }
  .tags-content{
    position: relative;
    margin: 0 auto 50px auto;
    width: 70%;
    padding-left: 100px;
    box-sizing: border-box;
  }
  .tags-content label{
    position: absolute;
    left: 0;
  }
  .tags-list{
    margin-bottom: 10px;
    padding:5px;
    min-height: 120px;
    border: 1px solid #ebeef5;
  }
  .el-tag{
    margin: 5px;
  }
  .adp-pagination{
    margin-left: 100px;
    margin-bottom: 20px;
  }
  .adp-label-title{
    font-size: 14px;
    color: #606266;
  }
  .adp-label-title::before{
    content: '*';
    color: #f56c6c;
    margin-right: 4px;
  }
</style>
