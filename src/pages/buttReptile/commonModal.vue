<template>
  <div style="display: inline-block;">
    <el-button
    type="primary"
    size="mini"
    @click="addWebsite">{{modalTitle}}</el-button>
  <el-dialog
    :title="dialogTitle"
    :visible.sync="dialogVisible"
    width="420px"
    center
    custom-class="checkDialog"
    :before-close="closeDialog">

    <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="100px" class="demo-ruleForm">
      <el-form-item label="名称：" prop="name">
        <el-input
          placeholder="请输入名称"
          v-model="ruleForm.name"
          maxlength="20"></el-input>
      </el-form-item>
      <el-form-item label="地址：" prop="addr">
        <el-input
          placeholder="请输入地址"
          v-model="ruleForm.addr"
          maxlength="100"></el-input>
      </el-form-item>
      <el-form-item label="分类：" prop="type">
        <el-cascader
          placeholder="请选择类型"
          :options="subOptions"
          v-model="type"
          filterable
          class="select_search"
          @change="getType"></el-cascader>
      </el-form-item>
    </el-form>

    <span slot="footer" class="dialog-footer">
      <el-button @click="cancel('ruleForm')" size="small">取消</el-button>
      <el-button type="primary" @click="submitForm('ruleForm')" size="small">确认</el-button>
    </span>
  </el-dialog>
  </div>
</template>

<script>
import request from '../../axios/request';
import { baseUrl } from '../../axios/env';

export default {
  props: ['modalTitle','subOptions', 'fetchList'],
  data() {
    return {
      dialogTitle: '', // 弹出框标题
      dialogVisible: false, // 弹出框是否隐藏
      type: [],           //类型

      // 表单数据
      ruleForm: {
        name: '',
        addr: '',
        type: [],         //判断类型必填
      },
      rules: {
        name: [
          { required: true, message: '名称不能为空！', trigger: 'change' },
          { pattern: /^[\u4E00-\u9FA5A-Za-z0-9]{0,20}$/, message: '请输入汉字/字母/数字' }
        ],
        addr: [
          { required: true, message: '地址不能为空！', trigger: 'change' },
          { min: 1, max: 100, message: '最大长度100', trigger: 'change' },
          { pattern: /^(http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&:/~\+#]*[\w\-\@?^=%&/~\+#])?$/, message: '请输入合法的网站地址' },
        ],
        type: [
          { required: true, message: '分类不能为空！', trigger: 'change' }
        ]
      },
    }
  },
  
  methods: {
    addWebsite() {
      this.dialogTitle = `${this.modalTitle}爬虫网站`;
      //清除数据
      this.ruleForm.name = '';
      this.ruleForm.addr = '';
      this.type = [];
      this.ruleForm.type = [];
      this.dialogVisible = true;
    },
    //可搜索的多级下拉列表的change事件
    getType(val) {
      this.ruleForm.type = val;
      //this.type = val;
    },
    submitForm(formName) {
      let needType = this.checkClass();
      let _this = this;
      _this.$refs[formName].validate((valid) => {
        if (valid) {
          const { name, addr } = _this.ruleForm;
          let type = {
            name: needType.label,
            id: needType.value,
            path: this.ruleForm.type
          };
          request.post(`${baseUrl}/pic/manage/v1/createWebsite`, { name, addr, type })
            .then(function(data) {
              console.log(typeof data.data.code);
              if (data.data.code !== -1) {
                  _this.common.msgModal('success', data.data.msg);
                  _this.fetchList();
                  _this.ruleForm.name = '';
                  _this.ruleForm.addr = '';
                  _this.dialogVisible = false;      //隐藏弹出框
                  _this.$refs[formName].resetFields();       //重置表单
              }
            });
        } else {
          return false;
        }
      });
    },
    //取消
    cancel(formName) {
      this.dialogVisible = false;               //隐藏弹出框
      this.$refs[formName].resetFields();       //重置表单
    },
    //关闭dialog
    closeDialog(done) {
      this.$nextTick(()=>{
        this.$refs.ruleForm.resetFields();
      });                                        //重置表单
      done();
    },

    checkClass() {
      let all = this.subOptions;
      let ss = this.type;
      let a = 0; // 循环了几次了
      let b = [];
      let needType = null;
      // console.log('开始', all, ss, ss.length);
      for (let i = 0; i < all.length; i++) {
        if (all[i].value === ss[a]) {
          b.push(i);
          a++;
          needType = all[i];
          // console.log('第一次', b, a);
          if (a < ss.length) {
            for (let j = 0; j < all[i].children.length; j++) {
              if ( all[i].children[j].value === ss[a]) {
                b.push(j);
                a++;
                needType = all[i].children[j];
                // console.log('第2次', b, a);
                if (a < ss.length) {

                  for (let m = 0; m < all[i].children[j].children.length; m++) {
                    if ( all[i].children[j].children[m].value === ss[a]) {
                      b.push(m);
                      needType = all[i].children[j].children[m];
                      // console.log('第3次', b, a);
                    }
                  }
                }
              }
            }
          }
        }
      }
      // console.log('needType', needType);
      return needType;
    },
  }
}
</script>

<style scoped>
  .select_search {
    width: 270px;
  }
</style>
