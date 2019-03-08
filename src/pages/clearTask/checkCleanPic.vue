<template>
    <div class="page-wrapper" v-loading="loading">
      <el-button size="mini" @click="backBtn">返回</el-button>
      <div class="adp-page-title">选择筛选条件</div>
      <div class="page-search">
        <el-radio-group v-model="radioStatus" @change="selectByWebsite">
          <el-radio :label="0">全部（{{totalNum}}）</el-radio>
          <el-radio v-for="rItem in websitesInfo" :key="rItem.name" :label="rItem.name">
            {{rItem.name}} ({{ rItem.retentionCount }}/{{ rItem.count }})
          </el-radio>
          <br>
          <el-radio v-for="item in picStatus" :key="item.label" :label="item.label === '保留' ? 1 : 2">
            {{ item.label }} ({{ item.count }})
          </el-radio>
        </el-radio-group>
      </div>
      <!-- 清洗图片列表 -->
      <div class="picCard" v-for="(item, index) in picsInfo" :key="index">
        <el-card :body-style="{ padding: '0px' }">
          <div style="width: 280px; height: 280px; padding: 5px;">
            <img :src="`${item.absAddress}/${item.website}/${item.img_name}`" style="width: 100%; height: 100%; border: 1px solid #eee;">
          </div>
        </el-card>
      </div>

    </div>
</template>

<script>
  import request from '../../axios/request';

  export default {
    name: "picCrawlerDetail",
    data(){
      return{
        load: '',
        loading: false,
        isBusy: false,
        radioStatus: 0, // 保存选择的网站信息
        paramRadio: '',
        status: '',
        // 分页数据
        currentPage: 1,
        pageSize: 100, //
        totalNum: 0, // 原始图片总数量
        totalSize: 0,
        // 图片网站信息
        picStatus: [],
        picsInfo: [],
        websitesInfo: [],
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
    async created() {
      await this.getCrawlerPicList();
    },
    mounted(){
      document.getElementById('waterFall').addEventListener('scroll',this.handler,false);
    },
    destroyed(){
      document.getElementById('waterFall').removeEventListener('scroll',this.handler, false);
    },
    methods:{
      // 返回按钮
      backBtn() {
        this.$router.push({ path: `/clean_list` });
      },
      // 顶部搜索筛选 - 单选框改变
      async selectByWebsite(){
        if (typeof this.radioStatus === 'string') {
          this.paramRadio = this.radioStatus;
          this.status = '';
        } else if (this.radioStatus === 0) {
          this.paramRadio = '';
          this.status = '';
        } else {
          this.paramRadio = '';
          this.status = this.radioStatus;
        }
        this.currentPage = 1;
        this.picsInfo = []; // 筛选清空数据
        await this.getCrawlerPicList();
      },    
      addItems() {
        if (this.currentPage  < this.totalSize){
          this.isBusy = true;
          this.load = this.$loading({
            lock: true,
            text: 'Loading',
            // spinner: 'el-icon-loading',
            background: 'rgba(0, 0, 0, 0.7)'
          });
          // this.loading = true;
          if (window.sessionStorage.getItem('picDetailCurrPage')){
            this.currentPage = parseInt(window.sessionStorage.getItem('picDetailCurrPage'))+1;
            this.getCrawlerPicList();
            this.load.close();
          }
        }else {
          return false;
        }

      },
      handler() {
        let that = this;
        let _this = document.getElementById('waterFall');
        let scrollTop = _this.scrollTop,scrollHeight = _this.scrollHeight,offsetHeight = _this.offsetHeight;
        if (scrollTop + offsetHeight >=scrollHeight) {
          that.addItems();
        }
      },
      //获取图片资源
      async getCrawlerPicList(){
        this.loading = true;
        window.sessionStorage.setItem('picDetailCurrPage',this.currentPage);
        let { data } = await request.get(`/pic/manage/v1/pictureList?idWebsite=${this.paramRadio}&idSubject=${this.subjectId}&currentPage=${this.currentPage}&pageSize=100&status=${this.status}`);
        let outData = data.data;

        this.totalNum = outData.totalCount;
        this.picStatus = outData.picStatus;
        this.websitesInfo = outData.websiteCount;
        this.picsInfo = this.picsInfo.concat(outData.data);
        this.totalSize = outData.totalCount/100;
        this.loading = false;
      },
    }
  };

</script>

<style scoped>
.picCard {
  display: inline-block;
  margin: 5px;
}
.page-wrapper{
  height: 100%;
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
.el-radio {
  margin: 5px 30px 5px 0;
}
</style>
