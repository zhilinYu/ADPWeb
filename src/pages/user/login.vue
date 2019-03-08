<template>
    <el-container>
    <div class="adp-login-bg"></div>
    <div class="adp-login">
      <div class="adp-login-title">
        ADP管理系统
      </div>
      <div class="adp-login-item">
        <label>用户名</label><el-input v-model="userName" placeholder="请输入用户名" @change="editUserName"></el-input>
      </div>
      <div class="adp-login-item">
        <label>密码</label><el-input v-model="passWord" placeholder="请输入密码" type="password"></el-input>
      </div>
      <div class="adp-login-item">
        <el-button @click="userLogin">登录</el-button>
      </div>
    </div>
    </el-container>
</template>

<script>
  import request from '../../axios/request';
  import { baseUrl } from '../../axios/env';
  import md5 from 'md5-node';
  export default {
    name: "login",
    data(){
      return{
        userName:'',
        passWord:''
      }
    },
    methods:{
      editUserName(val){

      },
      userLogin(){
        let that = this;
        console.log(that.userName);
        request.post(`${baseUrl}/pic/manage/v1/login`,{'userName':that.userName,'passWord':md5(that.passWord)}).then((result)=>{
          console.log(result);
          if (result.data.code === 0){
            window.localStorage.setItem('token',result.data.data.token);
             that.$router.push('/');
          }
        }).catch((error)=>{

        })
      }
    }
  };
</script>

<style scoped>
  .el-container{
    height: 100%;
    background: url("login_bg.jpg") no-repeat 100% 100%;
    background-size: cover;
  }
  .adp-login-bg{
    position: absolute;
    top: 50%;
    left: 50%;
    margin-top: -130px;
    margin-left: -200px;
    width: 400px;
    height: 260px;
    padding: 20px;
    box-sizing: border-box;
    background: azure;
    opacity:.8;
    border-radius: 8px;
  }
  .adp-login{
    position: absolute;
    top: 50%;
    left: 50%;
    margin-top: -130px;
    margin-left: -200px;
    width: 400px;
    height: 260px;
    padding: 20px;
    box-sizing: border-box;
  }
  .adp-login-title{
    text-align: center;
    font-size: 25px;
    color: rgba(0,0,0,.6);
  }
  .adp-login-item{
    margin: 20px auto 20px auto;
    width: 300px;
  }
  label{
    width: 60px;
    display: inline-block;
  }
  .el-input{
      width: 240px;
  }
  .el-button{
    width: 100%;
  }
</style>
