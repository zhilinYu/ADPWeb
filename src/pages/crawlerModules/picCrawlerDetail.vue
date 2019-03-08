<template>
    <div class="page-wrapper">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/crawler_modules' }">任务管理</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/crawler_modules/task_subject_list',query:{taskId:taskId} }">主体列表</el-breadcrumb-item>
        <el-breadcrumb-item>主体详情</el-breadcrumb-item>
      </el-breadcrumb>
      <div class="adp-page-title">选择站点</div>
      <div class="page-search">
        <el-radio-group v-model="radio2" @change="selectByWebsite">
          <el-radio :label="0">全部（{{totalNum}}）</el-radio>
          <el-radio v-for="(rItem,index) in radioItem" :key="index" :label="rItem.name">{{rItem.name}}（{{rItem.count}}）</el-radio>
        </el-radio-group>
      </div>
      <waterfall
        :line-gap="200"
        :single-max-width="300"
        :min-line-gap="100"
        :max-line-gap="220"
        :watch="items"
        @reflowed="reFlowed"
        ref="waterfall">
        <!-- each component is wrapped by a waterfall slot -->
        <waterfall-slot
          v-for="(item, index) in items"
          :width="item.width"
          :height="item.height"
          :order="index"
          :key="index"
          move-class="item-move"
        >
          <!--
            your component
          -->
          <div class="item" style="background: aliceblue" :item="index">
            <img :src="item.absAddress+'/'+item.website+'/'+item.img_name"/>
          </div>
        </waterfall-slot>
      </waterfall>
    </div>
</template>

<script>
  import request from '../../axios/request';
  import { baseUrl } from '../../axios/env';

  import Waterfall from 'vue-waterfall/lib/waterfall'
  import WaterfallSlot from 'vue-waterfall/lib/waterfall-slot'
  export default {
    name: "picCrawlerDetail",
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
      this.loading = this.$loading({
        lock: true,
        text: 'Loading',
        // spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      });
      this.getCrawlerPicList();
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
      // 滚动加载更多
      handler: function () {
        let that = this;
        let _this = document.getElementById('waterFall');
        let scrollTop = _this.scrollTop,scrollHeight = _this.scrollHeight,offsetHeight = _this.offsetHeight;
        if (scrollTop + offsetHeight >=scrollHeight) {
          that.addItems();
        }
      },
      reFlowed: function () {
        this.isBusy = false
      },
      //网站筛选切换
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
        request.get(`${baseUrl}/pic/manage/v1/pictureList?idWebsite=${this.paramRadio}&idSubject=${this.subjectId}&currentPage=${this.currentPage}&pageSize=100&status`).then(function(res) {
          if (res.data.code === 0){
            that.loading.close();
            let results = res.data.data.data;
            let websites = res.data.data.websiteCount;
            results.forEach((item)=>{
              item.width = 100 +(Math.random() * 50);
              item.height = 100 +(Math.random() * 50);
            });
            that.radioItem = websites;
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
</style>
