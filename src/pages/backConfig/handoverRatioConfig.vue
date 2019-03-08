<template>
  <div>
    <el-button type="primary" size="mini">返回</el-button>

    <el-form ref="form" :model="form" label-width="110px" style="width: 600px; margin-top: 20px; border: 1px solid #eee;">
      <el-form-item label="训练集" prop="train" style="width: 280px; margin-top: 20px;">
        <el-input v-model="form.train" @change="onTrainChange" >
          <template slot="append">%</template>
        </el-input>
      </el-form-item>
      <el-form-item label="测试集" prop="test" style="width: 280px;">
        <el-input v-model="form.test" :disabled="true">
          <template slot="append">%</template>
        </el-input>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" size="mini" @click="onSubmit('form')">保存</el-button>
        <el-button size="mini">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import request from '../../axios/request';

export default {
  data() {
    return {
      form: {
        train: 70,
        test: 30,
      },
      rules: {
        train: [
          { required: true, message: '请输入活动名称', trigger: 'change' },
          { pattern: /^[1-9][0-9]?$/, type: 'number', message: '目前只支持中国大陆的手机号码', trigger: 'change' }
        ],
        test: [
          { required: true, message: '请输入活动名称', trigger: 'change' },
          { min: 1, max: 2, message: '长度在 3 到 5 个字符', trigger: 'change' }
        ]
      }
    }
  },
  async created() {
    let { data } = await request.get('/pic/manage/v1/fetchTrainRatio');
    this.form.train = data.data.trainRatio*100;
    this.form.test = (1 - data.data.trainRatio)*100;
    // console.log(data);
  },
  methods: {
    onTrainChange(value) {
      console.log(value);
      this.form.test = 100 - value;
    },
    onSubmit(formName) {
      let _this = this;
      this.$refs[formName].validate((valid) => {
        if (valid) {
          request.post('/pic/manage/v1/updateTrainRatio', { trainRatio: this.form.train/100 })
            .then(function(data) {
              console.log('xxx=', data);
              _this.common.msgModal('success','修改成功！');
            });
        } else {
          console.log('error submit!!');
          return false;
        }
      });
    },
  }
}
</script>
