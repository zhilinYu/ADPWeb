<template>
  <el-container v-loading="loading">
    <el-main>
      <!-- 主体分类信息 -->
      <el-button
        style="margin: 0 0 10px 1074px;"
        size="mini"
        type="primary"
        @click="addClassifi()">新增</el-button>
        <ul class="table_ul">
          <li>
            <span class="table_title">名称</span>
            <span class="table_title">编号</span>
            <span class="table_title">创建时间</span>
            <span class="table_title">编辑时间</span>
            <span class="table_title">类型等级</span>
            <span class="table_title">操作</span>
          </li>
          <li class="no_data_li" v-if="classData == ''">暂无数据</li>
          <li v-for="(item, index) in classData" :key="index">
            <div>
              <span class="name_span name_span_1">
                <i 
                  v-if="item.children != ''"
                  class="el-icon-arrow-right name_icon" 
                  @click="isShow($event)"></i>
                {{item.name}}
              </span>
              <span>{{item.serial_number}}</span>
              <span>{{item.created_time}}</span>
              <span>{{item.updated_time}}</span>
              <span>{{item.level == 1 ? '一级' : (item.level == 2 ? '二级' : '三级')}}</span>
              <span>
                <el-button
                  size="mini"
                  plain
                  @click="addClassifi(item)">新增</el-button>
                <el-button
                  size="mini"
                  plain
                  @click="editClassifi(item)">编辑</el-button>
                <el-button
                  size="mini"
                  plain
                  class="delbtn"
                  @click="delClassifi(item)">删除</el-button>
              </span>
            </div>
            <ul style="list-style: none;margin: 0;padding: 0;display: none;">
              <li v-for="(n, i) in item.children" :key="i" class="border_top">
                <div>
                  <span 
                    class="name_span  name_span_2" 
                    style="paddingLeft: 65px;">
                    <i 
                      v-if="n.children != ''"  
                      class="el-icon-arrow-right name_icon"
                      style="left: 35px;top:19px;"
                      @click="isShow($event)"></i>
                    {{n.name}}
                  </span>
                  <span>{{n.serial_number}}</span>
                  <span>{{n.created_time}}</span>
                  <span>{{n.updated_time}}</span>
                  <span>{{n.level == 1 ? '一级' : (n.level == 2 ? '二级' : '三级')}}</span>
                  <span>
                    <el-button
                      size="mini"
                      plain
                      @click="addClassifi(n)">新增</el-button>
                    <el-button
                      size="mini"
                      plain
                      @click="editClassifi(n)">编辑</el-button>
                    <el-button
                      size="mini"
                      plain
                      class="delbtn"
                      @click="delClassifi(n)">删除</el-button>
                  </span>
                </div>
                <ul style="list-style: none;margin: 0;padding: 0;display: none;">
                  <li>
                    <ul style="list-style: none;margin: 0;padding: 0;">
                      <li v-for="(a, b) in n.children" :key="b" class="border_top">
                        <div>
                          <span 
                            class="name_span" 
                            style="paddingLeft: 70px;">
                            {{a.name}}
                          </span>
                          <span>{{a.serial_number}}</span>
                          <span>{{a.created_time}}</span>
                          <span>{{a.updated_time}}</span>
                          <span>{{a.level == 1 ? '一级' : (a.level == 2 ? '二级' : '三级')}}</span>
                          <span>
                            <el-button
                              disabled
                              size="mini"
                              plain
                              @click="addClassifi(n)">新增</el-button>
                            <el-button
                              size="mini"
                              plain
                              @click="editClassifi(a)">编辑</el-button>
                            <el-button
                              size="mini"
                              plain
                              class="delbtn"
                              @click="delClassifi(a)">删除</el-button>
                          </span>
                        </div>
                      </li>
                    </ul>
                  </li>
                </ul>
              </li>
            </ul>
          </li>
        </ul>
    </el-main>

    <!-- 添加/编辑弹出框 -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="420px"
      center
      custom-class="checkDialog"
      :before-close="closeDialog">

      <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="100px" class="demo-ruleForm">
        <el-form-item label="分类名称：" prop="name">
          <el-input 
            placeholder="请输入分类名称"  
            v-model="ruleForm.name" 
            maxlength="20"></el-input>
        </el-form-item>
      </el-form>
      <span style="margin: 0 10px 0 16px">分类等级：</span>
      <el-input 
        disabled
        class="dialog_input"
        v-model="ruleForm.level"></el-input><br>
      <span style="margin: 0 10px 0 16px">父亲结点：</span>
      <el-input 
        disabled
        class="dialog_input"
        v-model="ruleForm.parent_name"></el-input>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancel('ruleForm')" size="small">取消</el-button>
        <el-button type="primary" @click="submitForm('ruleForm')" size="small">确认</el-button>
      </span>
    </el-dialog>

  </el-container> 
  
</template>

<script>
export default {
  data() {
    let checkCompanyName = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('分类名称不能为空！'));
      }
      let reg = /^[\u4E00-\u9FA5A-Za-z0-9]+$/;
      let a = value.match(reg);
      if (!a) {
        callback(new Error('分类名称只能输入中文、数字、英文！'));
      }else {
        callback();
      }
    };
    return {
      loading: false,       //loading状态
      classData: [],

      dialogTitle: '',         //弹出框标题
      dialogVisible: false,     //弹出框是否隐藏

      ruleForm: {
        name: '',
        level: '',
        id: null,
        parent_id: null,
        parent_name: null,
      },
      rules: {
        name: [
          { required: true, message: '分类名称不能为空！', trigger: 'change' },
          { validator: checkCompanyName, trigger: 'change' }
        ]
      }
    }
  },
  created() {
    this.getCategory();
  },
  methods: {
    //展开二三级数据
    isShow(evt) {
      let ele = evt.target;
      if(ele.className == 'el-icon-arrow-right name_icon'){
        ele.className = 'el-icon-arrow-down name_icon';
        ele.parentNode.parentNode.parentNode.lastChild.style.display = 'block';
      }else{
        ele.className = 'el-icon-arrow-right name_icon';
        ele.parentNode.parentNode.parentNode.lastChild.style.display = 'none';
      }
    },

    //新增
    addClassifi(item) {
      this.dialogTitle = '新增主体分类';
      this.ruleForm.name = '';
      if(item){
        this.ruleForm.level = item.level == 1 ? '二级' : '三级';
        this.ruleForm.parent_id = item._id;
        this.ruleForm.parent_name = item.name;
      }else{
        this.ruleForm.level = '一级';
        this.ruleForm.parent_id = 0;
        this.ruleForm.parent_name = '顶级';
      }
      
      this.dialogVisible = true;
    },
    //编辑
    editClassifi(item) {
      this.dialogTitle = '编辑主体分类';
      this.ruleForm.name = item.name;
      this.ruleForm.level = item.level == 1 ? '一级' : (item.level == 2 ? '二级' : '三级');
      this.ruleForm.parent_id = item.parent_id;
      this.ruleForm.id = item._id;
      if(item.parent_name){
        this.ruleForm.parent_name = item.parent_name;
      }else{
        this.ruleForm.parent_name = '顶级';
      }

      this.dialogVisible = true;
    },

    //确认
    submitForm(formName) {
      let _this = this;
      _this.$refs[formName].validate((valid) => {
        if (valid) {

          let promptMsg = _this.dialogTitle.slice(0,2);
          let path = '';
          let param = {};
          //判断是新增还是编辑
          if(_this.dialogTitle == '新增主体分类'){
            path = '/pic/manage/v1/addCategory';
            param = { 'name' : _this.ruleForm.name,'level' : _this.ruleForm.level == '一级' ? 1 : (_this.ruleForm.level == '二级' ? 2 : 3),'parentId' : _this.ruleForm.parent_id };
          }else if(_this.dialogTitle == '编辑主体分类'){
            path = '/pic/manage/v1/updateCategory';
            param = { 'name' : _this.ruleForm.name,'id' : _this.ruleForm.id,'parentId' : _this.ruleForm.parent_id };
          }

          //发请求
          _this.loading = true;
          _this.axios.post(path,param)
          .then(function (res) {
            _this.loading = false;
            if(res.data.code === '0'){
              _this.common.msgModal('success',res.data.msg);
              _this.getCategory();
            }
          });
 
          _this.dialogVisible = false;               //隐藏弹出框
          _this.$refs[formName].resetFields();       //重置表单

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

    //删除
    delClassifi(item) {
      let _this = this;

      //弹出框
      _this.$confirm('确定删除此主体分类吗?', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        _this.loading = true;
        _this.axios.post('/pic/manage/v1/deleteCategory',{'id' : item._id})
        .then(function (res) {
          _this.loading = false;
          if(res.data.code === '0'){
            _this.common.msgModal('success',res.data.msg);
            _this.getCategory();
          }
        });
      }).catch(() => {
        console.log('取消');
      });
    },

    //获取主体分类
    getCategory() {
      let _this = this;
      _this.loading = true;
      _this.axios.get('/pic/manage/v1/getCategory')
      .then(function (res) {
        _this.loading = false;
        _this.classData = res.data.data;
      });
    },

  }
}
</script>

<style scoped>
  /* 将ul转变为table */
  .table_ul {
    display: table;     
    list-style: none;
    margin: 0;
    padding: 0;
    font-size: 14px;
    border-top: 1px solid #ebeef5;
    text-align: center;
    word-break: break-all;
  }
  .table_ul > li {
    border: 1px solid #ebeef5;
    border-top-style: none;
    border-right-style: none;
  }
  .table_ul li > div:hover {
    background-color: #f5f7fa;
  } 
  .table_ul li span {
    display: table-cell;
    vertical-align: middle;
    box-sizing: border-box;
    width: 170px;
    padding: 12px;
    border-right: 1px solid #ebeef5;
  }
  /* 标题 */
  .table_ul li span.table_title {
    color: #909399;
    user-select:none;
    font-weight: bold;
  }
  .table_ul li span:last-child {
    width: 280px;
  }
  .table_ul .no_data_li {
    color: #909399;
    line-height: 60px;
    border-right: 1px solid #ebeef5;
  }
  .table_ul .no_data_li:hover {
    background-color: #fff;
  }
  .border_top {
    border-top: 1px solid #ebeef5;
  }
  /* 名称的下拉按钮定位 */
  .table_ul li span.name_span {
    text-align: left;
    padding-left: 50px;
    position: relative;
  }
  .table_ul li span.name_span_1 {
    background: url(../../../static/icon1.png) no-repeat 31px 18px;
  }
  .table_ul li span.name_span_2 {
    background: url(../../../static/icon2.png)  no-repeat 47px 18px;
  }
  .table_ul li span .name_icon {
    position: absolute;
    left: 16px;
    top: 19px;
  }

  .dialog_input {
    width: 268px;
    margin-bottom: 28px;
  }

</style>

