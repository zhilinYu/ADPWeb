<template>
  <el-container v-loading="loading" class="detail_main">
    <el-header>
      <el-button 
        type="primary"
        size="mini"
        style="float: right;marginTop: 15px;"
        @click="goBack">返回</el-button>
    </el-header>
    <el-main>
      <el-form label-width="200px">
        <el-form-item label="主体名称">
           <el-input 
            disabled
            v-model="data.name"
            style="width: 300px;"></el-input>
        </el-form-item>
        <el-form-item label="编号">
           <el-input 
            disabled
            v-model="data.serial_number"
            style="width: 300px;"></el-input>
        </el-form-item>
        <el-form-item label="主体类型">
           <el-input 
            disabled
            v-model="category"
            style="width: 300px;"></el-input>
        </el-form-item>
        <el-form-item label="别名">
          <span v-if="data.alias == ''">无</span>
          <el-tag
            color="#f5f7fa"
            v-else
            :key="tag"
            v-for="tag in data.alias"
            :disable-transitions="false">
            {{tag}}
          </el-tag>
        </el-form-item>
        <el-form-item label="主图" style="marginBottom: 30px;">
          <div class="picContainer">
            <img :src="data.main_image" />
          </div>
        </el-form-item>
        <el-form-item label="典型图片">
          <span v-if="data.typical_diagram == ''">无</span>
          <div class="typical_img_box" v-else>
            <div class="upload_img" v-for="(item,index) in data.typical_diagram" :key="index">
              <div class="picContainer">
                <img :src="item" />
              </div>
            </div>
          </div>
        </el-form-item>
        <el-form-item label="标题">
          <el-input
            type="textarea"
            :rows="2"
            disabled
            v-model="data.title"
            maxlength="100"
            style="width: 800px;">
          </el-input>
        </el-form-item>
        <el-form-item label="清洗要求">
          <el-input
            type="textarea"
            :rows="4"
            disabled
            v-model="data.clean_require"
            maxlength="300"
            style="width: 800px;">
          </el-input>
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            type="textarea"
            :rows="4"
            disabled
            v-model="data.description"
            maxlength="300"
            style="width: 800px;">
          </el-input>
        </el-form-item>
        <el-form-item label="国家">
           <el-input 
            disabled
            v-model="data.country"
            style="width: 300px;"></el-input>
        </el-form-item>
        <el-form-item label="省份">
           <el-input 
            disabled
            v-model="data.province"
            style="width: 300px;"></el-input>
        </el-form-item>
        <el-form-item label="添加时间">
           <el-input 
            disabled
            v-model="data.createdTime"
            style="width: 300px;"></el-input>
        </el-form-item>
        <el-form-item label="审核时间">
           <el-input 
            disabled
            v-model="data.auditTime"
            style="width: 300px;"></el-input>
        </el-form-item>
        <el-form-item label="审核状态">
           <el-input 
            disabled
            v-model="data.audit_status"
            style="width: 300px;"></el-input>
        </el-form-item>
        <el-form-item label="编辑时间">
           <el-input 
            disabled
            v-model="data.updatedTime"
            style="width: 300px;"></el-input>
        </el-form-item>
        <el-form-item label="主体状态">
           <el-input 
            disabled
            v-model="data.main_status"
            style="width: 300px;"></el-input>
        </el-form-item>
        <el-form-item label="原始图片数量">
           <el-input 
            disabled
            v-model="data.total_crawler"
            style="width: 300px;"></el-input>
        </el-form-item>
        <el-form-item label="有效图片数量">
           <el-input 
            disabled
            v-model="data.total_clean "
            style="width: 300px;"></el-input>
        </el-form-item>
      </el-form>
    </el-main>
  </el-container>
</template>

<script>

import { PAGE, AUDIT_STATUS, MAIN_STATUS } from '../../lib/consts';
import { transformStatus } from '../../lib/common';

export default {
  data() {
    return {
      loading: false,            //loading状态 
      id: '',
      data: {}, 
      category: '',
    }
  },
  created() {
    let _this = this;
    _this.id = _this.$route.query.id;
    
    //获取主体详情数据
    _this.loading = true;
    _this.axios.post('/pic/manage/v1/getMainBodyDetail',{ 'id': this.id })
    .then(function (res) {
      _this.loading = false;
      if(res.data.code === '0'){
        let data = res.data.data;
        data.audit_status = transformStatus(AUDIT_STATUS, data.audit_status);
        data.main_status = transformStatus(MAIN_STATUS, data.main_status);
        _this.category = `${data.category_level1_value} / ${data.category_level2_value} / ${data.category_value}`;
        _this.data = data;
      }
    });

  },
  methods: {

    //返回
    goBack() {
      this.$router.push({path: '/subject_manage'});
    },
    
  }
}
</script>

<style>
  .detail_main .el-form {
    padding: 20px;
    border: 1px solid #ebeef5;
  }

  /* 别名 */
  .detail_main .el-tag {
    margin-right: 10px;
    margin-top: 10px;
    color: #cfc8cc;
    border-color: #e4e7ed;
  }

  /* 图片展示、上传区域 */
  .detail_main .upload_img {
    display: inline-block;
    margin: 0 10px 10px 0;
  }
  .detail_main .picContainer {
    width: 200px;
    height: 200px;
    border: 1px solid #ebeef5;
  }
  .detail_main .picContainer img {
    width: 100%;
    height: 100%;
  }
  /* 典型图片盒子 */
  .detail_main .typical_img_box {
    display: inline-block;
    min-height: 100px;
    max-height: 760px;
    overflow-y: auto;
    margin-right: 20px;
  }

  .detail_main .el-form-item__label {
    padding-right: 50px;
  }

</style>