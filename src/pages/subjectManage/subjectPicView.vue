<template>
    <div class="page-wrapper">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item v-if="this.$route.query.from == 'subject_manage'" :to="{ path: '/subject_manage' }">主体管理</el-breadcrumb-item>
        <el-breadcrumb-item v-else :to="{ path: '/distribution_list' }">清洗分配</el-breadcrumb-item>
        <el-breadcrumb-item>原始图片查看</el-breadcrumb-item>
      </el-breadcrumb>
      <div class="adp-page-title" v-show="false">选择站点</div>
      <div class="page-search" v-show="false">
        <el-radio-group v-model="radio2" @change="selectByWebsite">
          <el-radio :label="0">全部（{{totalNum}}）</el-radio>
          <el-radio v-for="(rItem,index) in radioItem" :key="index" :label="rItem.name">{{rItem.name}}（{{rItem.num}}）</el-radio>
        </el-radio-group>
      </div>
      <div class="waterfall-box">
        <waterfall
        :line-gap="200"
        :single-max-width="300"
        :min-line-gap="100"
        :max-line-gap="220"
        :watch="items"
        @reflowed="reflowed"
        ref="waterfall">
        <!-- each component is wrapped by a waterfall slot -->
        <waterfall-slot
          v-for="(item, index) in items"
          :width="item.width"
          :height="item.height"
          :order="index"
          :key="index"
           style="padding:30px"
          move-class="item-move"
        >
          <!--
            your component
          -->
          <div class="item" style="background: aliceblue" :item="index">
            
            <!-- <el-card :body-style="{ padding: '10px' }"> -->
              <img :src="item.absAddress+'/'+item.website+'/'+item.img_name"/>
            <!-- </el-card> -->
          </div>
        </waterfall-slot>
        </waterfall>
      </div>
    </div>
</template>

<script>
  import request from '../../axios/request';
  import { baseUrl } from '../../axios/env';

  import Waterfall from 'vue-waterfall/lib/waterfall'
  import WaterfallSlot from 'vue-waterfall/lib/waterfall-slot'
  export default {
    name: "picView",
    data(){
      return{
        radio2:0,
        paramRadio:'',
        radioItem:[],
        items: [],
        isBusy: false,
        loading: '',
        currentPage:1,
        pageSize:100,
        totalNum:0,
        totalSize:0,
        websites:[],
        websitesAccount:[]
      }
    },
    computed:{
      subjectId:function () {

        return this.$route.query.id;
      },
      taskId:function() {
        return this.$route.query.taskId;
      }
    },
    components:{
      Waterfall,
      WaterfallSlot
    },
    mounted(){
      document.getElementById('waterFall').addEventListener('scroll',this.handler,false);
      this.getSubjectWebsites();
    },
    destroyed(){
      document.getElementById('waterFall').removeEventListener('scroll',this.handler, false);
    },
    methods:{
      addItems: function () {
        if (this.currentPage  < this.totalSize){
            this.isBusy = true;
            this.loading = this.$loading({
            lock: true,
            text: 'Loading',
            // spinner: 'el-icon-loading',
            background: 'rgba(0, 0, 0, 0.7)'
          });
          if (window.sessionStorage.getItem('picDetailCurrPage')){
            this.currentPage = parseInt(window.sessionStorage.getItem('picDetailCurrPage'))+1;
            this.getCrawlerPicList();
          }
        }else {
          return false;
        }

      },
      handler: function () {
        let that = this;
        let _this = document.getElementById('waterFall');
        let scrollTop = _this.scrollTop,scrollHeight = _this.scrollHeight,offsetHeight = _this.offsetHeight;
        if (scrollTop + offsetHeight >=scrollHeight) {
          that.addItems();
          that.loading.close();
        }
      },
      reflowed: function () {
        this.isBusy = false
      },
      //获取任务网站列表
      getSubjectWebsites(){
        let that = this;
        request.get(`${baseUrl}/pic/manage/v1/getCrawlerBatch?id=${this.taskId}`).then(function(res) {
          if (res.data.code === 0) {
            let websites = res.data.data.websites;
            websites.forEach((item)=>{
              let websiteObj = {};
              websiteObj.name = item.name;
              websiteObj.id = item['id_website'];
              websiteObj.num = '';
              that.radioItem.push(websiteObj);
              that.websites.push(item.name);
            });
            that.getCrawlerPicList();
          }
        })
      },
      selectByWebsite(){
        console.log(this.radio2);
        this.items = [];
        this.currentPage = 1;
        this.getCrawlerPicList();
      },
      //获取图片资源
      getCrawlerPicList(){
        let that = this;
        if (that.radio2 === 0){
          that.paramRadio = '';
        }else {
          that.paramRadio = that.radio2;
        }
        window.sessionStorage.setItem('picDetailCurrPage',this.currentPage);
        request.get(`${baseUrl}/pic/manage/v1/pictureList?idWebsite=${this.paramRadio}&idSubject=${this.subjectId}&currentPage=${this.currentPage}&pageSize=100&websites=${this.websites}&status=${this.$route.query.status}`).then(function(res) {
          if (res.data.code === 0){
            let results = res.data.data.data;
            let websites = res.data.data.websiteCount;
            results.forEach((item)=>{
              item.width = 100 +(Math.random() * 50);
              item.height = 100 +(Math.random() * 50);
            });
            for (let i = 0;i<websites.length;i++){
              for (let j = 0;j<that.radioItem.length;j++){
                if (websites[i].name === that.radioItem[j].name){
                  that.radioItem[j].num = websites[i].count;
                }
              }

            }
            that.items.push.apply(that.items,res.data.data.data);
            console.log(res.data.data.websiteCount);
            that.totalNum = res.data.data.totalCount;
            that.totalSize = res.data.data.totalCount/100;
            console.log( that.totalSize);
          }
        })
      }
    }
  };

</script>

<style scoped>
.page-wrapper{
  height: 100%;
  /*overflow: auto;*/
}
.adp-page-title{
  color: #606266;
  font-size: 14px;
  margin-top: 20px;
  margin-bottom: 20px;
}
.page-search{
  margin-bottom: 20px;
}
.vue-waterfall-slot{
  padding: 5px;
}
.item {
  position: absolute;
  top: 5px;
  left: 5px;
  right: 5px;
  bottom: 5px;
  font-size: 1.2em;
  color: rgb(0,158,107);
}
.item:after {
  content: attr(index);
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  -webkit-transform: translate(-50%, -50%);
  -ms-transform: translate(-50%, -50%);
}
.item img{
  width: 100%;
  height: 100%;
}
.waterfall-box{
  margin: 20px 0;
  border-radius: 10px;
  border: 1px solid #ebeef5;
  padding: 10px;
}
</style>
