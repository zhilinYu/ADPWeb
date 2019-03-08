<template>
  <div class="app-page app-addEditGroup">
    <div class="app-nav">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/group' }">组管理</el-breadcrumb-item>
        <el-breadcrumb-item>{{pageName}}</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="app-main">
      <div class="app-form">
        <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="100px" class="demo-ruleForm">
          <el-form-item label="组名称" prop="name">
            <el-input v-model="ruleForm.name" maxlength="30"></el-input>
          </el-form-item>
          <el-form-item label="组描述" prop="desc">
            <el-input type="textarea" v-model="ruleForm.desc" maxlength="100"></el-input>
          </el-form-item>
          <el-form-item label="组成员">
            <div class="app-group-member">
              <el-tag
                :key="index"
                v-for="(item,index) in memberList"
                :disable-transitions="false">
                {{item.username}}
              </el-tag>
            </div>
            <div class="app-group-selectbtn">
              <el-button type="primary" plain size="mini" @click="usersTableVisible = true">选择成员</el-button>
            </div>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="mini" :loading="isLoading" @click="submitForm('ruleForm')">保存</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
    <el-dialog title="选择用户" width="730px" :visible.sync="usersTableVisible">
      <el-transfer
          class="app-dialog-transfer"
          v-model="selectList"
          :data="totalList"
          @change = "selecHandle"
          filterable
          :titles="['所有用户', '已选用户']">
      </el-transfer>
      <div class="dialog-footer">
      </div>
    </el-dialog>
  </div>
</template>

<script>
    export default {
        name: "addEditGroup",
        data(){
          return{
            pageName:"新增",
            isLoading:false,
            ruleForm: {
              name: '',
              desc:''
            },
            rules: {
              name: [
                { required: true, message: '请输入组名称', trigger: 'change' },
                { pattern: /^[\u4E00-\u9FA5A-Za-z0-9]{0,30}$/, message: "请输入汉字/字母/数字", trigger: 'change' }
              ],
            },
            //[编辑模式]-组信息
            groupInfo:{},
            //所选成员列表
            memberList: [],
            //弹框状态
            usersTableVisible:false,
            totalList:[],
            selectList:[]
          }
        },
        computed:{
          pageType:function () {
            return this.$route.query.pageType;
          },
          groupId:function() {
            return this.$route.query.id;
          }
        },
        created:function(){
          console.log(this.groupId);
          if(this.pageType=="1"){
            this.pageName = "编辑";
            this.getGroupData(this.groupId,this.getUserList);
          }else{
            this.getUserList();
          }
        },
        methods:{
          /**
           * 选择成员部分
           */
          selecHandle:function(changeValue){
            console.log(changeValue);
            var self = this;
            self.memberList = [];
            changeValue.forEach(function($item,$index) {
              self.memberList.push(self.totalList[$item]);
            });
          },
          getUserList:function(){
            var self = this,
              url = "/pic/manage/v1/getAllUser";
            self.axios.post(url,{})
              .then(function (res) {
                console.warn("================获取成员列表================")
                console.log(res);
                if(res.status===200&&res.data.code==="0"){
                  var result = res.data.data;
                  let userShowList = [];
                  result.forEach(($item,$index)=>{
                    userShowList.push(Object.assign($item,{
                      key: $index,
                      label: $item.username,
                      disabled: false,
                    }))
                  });
                  self.totalList = userShowList;
                  if(self.pageType==="1"){
                    self.filterRightDefaultList(userShowList);
                  }
                }
              });
          },
          //如果是编辑模式，则初始化右侧数据
          filterRightDefaultList:function(totalData){
            var self = this;
            this.groupInfo.members.forEach(function($item,index){
              totalData.forEach(function(_item, _index) {
                if($item===_item._id){
                  self.selectList.push(_index);
                  self.memberList.push(_item);
                }
              })

            })
          },
          /**
           * 保存数据
           */
          submitForm:function(formName) {
            var self = this;
            this.$refs[formName].validate((valid) => {
              if (valid) {
                let postData = {
                  name:self.ruleForm.name,
                  desc:self.ruleForm.desc,
                  members:[]
                };
                if(self.memberList.length!=0){
                  self.memberList.forEach(function($item,$index) {
                    postData.members.push($item._id);
                  })
                }
                if(self.pageType==="1"){
                  self.updateGroup(postData);
                }else{
                  self.addGroup(postData);
                }

              } else {
                return false;
              }
            });
          },
          addGroup:function(params) {
            var self = this,
              url = '/pic/manage/v1/createGroup';
            self.isLoading = true;
            this.axios.post(url,params)
              .then(function (res) {
                console.log(res);
                self.isLoading = false;
                if(res.status===200&&res.data.code===0){
                  self.common.msgModal("success","新建成功");
                  self.$router.push({ path: "/group" });
                }else if(res.data.code===1005){
                  self.common.msgModal("warning","该组已存在");
                } else{
                  self.common.msgModal("error","新建失败");
                }
              }).catch(function(err) {
                self.isLoading = false;
                self.$message({
                  type: 'error',
                  message: '请检查您的网络连接是否正常！'
                });
              });
          },
          updateGroup:function(params){
            var self = this,
              url = '/pic/manage/v1/updateGroup';
            params["id"] = self.groupId;
            self.isLoading = true;
            this.axios.put(url,params)
              .then(function (res) {
                console.log(res);
                self.isLoading = false;
                if(res.status===200&&res.data.code===0){
                  self.common.msgModal("success","更新成功");
                  self.$router.push({ path: "/group" });
                }else if(res.data.code===1005){
                  self.common.msgModal("warning","该组已存在");
                }else{
                  self.common.msgModal("error","更新失败");
                }
              }).catch(function(err) {
                self.isLoading = false;
                self.$message({
                  type: 'error',
                  message: '请检查您的网络连接是否正常！'
                });
              });
          },
          /**
           * 编辑模式下：获取组信息
           */
          getGroupData:function(id,callback) {
            var self = this,
              requestUrl = `/pic/manage/v1/getGroup?id=${id}`;
            this.axios.get(requestUrl)
              .then(function(res) {
                console.warn("================获取组详情================")
                console.log(res);
                if(res.status===200&&res.data.code===0){
                  var result = res.data.data;
                  self.ruleForm.name = result.name;
                  self.ruleForm.desc = result.desc;
                  self.groupInfo = result;
                  callback&&callback();
                }
              })
          }
        }
    };
</script>

<style scoped>
  .app-addEditGroup .app-group-member{
    min-height: 120px;
    padding: 15px;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
  }
  .app-addEditGroup .app-group-selectbtn{
    text-align: right;
  }
  .app-group-member .el-tag{
    margin-left: 6px;
  }

</style>
