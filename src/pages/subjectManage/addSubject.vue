<template>
  <el-container v-loading="loading" class="add_main">
    <el-header>
      <el-button
        type="primary"
        size="mini"
        style="float: right;marginTop: 15px;"
        @click="goBack">返回</el-button>
    </el-header>
    <el-main>
      <el-form
        :model="ruleForm"
        :rules="rules"
        ref="ruleForm"
        label-width="200px"
        class="demo-ruleForm">
        <el-form-item label="主体名称" prop="name">
          <el-input
            v-model="ruleForm.name"
            placeholder="请输入主体名称"
            maxlength="30"
            style="width: 300px;"></el-input>
            &nbsp;
            <el-button
              size="mini"
              plain
              @click="checkName">相似检测</el-button>
        </el-form-item>
        <el-form-item label="主体类型" prop="type">
          <el-cascader
            placeholder="请选择主体类型"
            :options="options"
            v-model="type"
            filterable
            @change="getType"
            style="width: 300px;"></el-cascader>
        </el-form-item>
        <el-form-item label="别名" prop="otherName">
          <el-tag
            :key="tag"
            v-for="tag in alias"
            closable
            :disable-transitions="false"
            @close="handleClose(tag)">
            {{tag}}
          </el-tag>
          <el-input
            class="input-new-tag"
            v-if="inputVisible"
            v-model="ruleForm.otherName"
            ref="saveTagInput"
            size="mini"
            maxlength="30"
            style="width: 200px;"
            @keyup.enter.native="handleInputConfirm"
            @blur="handleInputConfirm"
          >
          </el-input>
          <el-button
            v-else
            class="button-new-tag"
            size="mini"
            plain
            @click="showInput">+ 添加</el-button>
        </el-form-item>
        <el-form-item label="主图" prop="imageUrl" style="marginBottom: 30px;" id="mainImg">
          <div class="upload_img" style="marginBottom: 0;">
            <div class="picContainer">
              <img :src="ruleForm.imageUrl" />
            </div>
            <form ref="mainpic" class="uploadAdd" action="http://127.0.0.1:8089/mainPic" method="POST" enctype="multipart/form-data">
              <span class="btn-upload" style="margin-left:66px;">
                <input type="file" name="imgfile" accept="image/jpg,image/jpeg,image/png" @change="handleFileChange($event)" />选择图片
              </span>
            </form>
          </div>
        </el-form-item>
        <el-form-item label="典型图片">
          <div class="typical_img_box">
            <div class="upload_img" v-for="(item,index) in classicalImgs" :key="index">
              <div class="picContainer">
                <img :src="item" />
              </div>
              <form ref="typicalpic" class="uploadAdd">
                <span class="btn-upload">
                  <input type="file" name="imgfile" accept="image/jpg,image/jpeg,image/png" @change="handleFileChange($event,index)" />选择图片
                </span>
                <span class="btn-upload btn-upload-del" @click="delImage(item,index)">
                  删除图片
                </span>
              </form>
            </div>
            <div style="display: inline-block; width: 100px;">
              <el-button
                size="mini"
                @click="checkSimilar"
                plain>相似检测</el-button>
              <el-button
                size="mini"
                plain
                style="margin: 10px 0 0;"
                @click="addClassicalImg">+ 添加图片</el-button>
            </div>
          </div>
        </el-form-item>
        <el-form-item label="标题">
          <el-input
            type="textarea"
            :rows="2"
            placeholder="请输入标题信息"
            v-model="ruleForm.titleMsg"
            maxlength="100"
            style="width: 800px;">
          </el-input>
        </el-form-item>
        <el-form-item label="清洗要求">
          <el-input
            type="textarea"
            :rows="4"
            placeholder="请输入清洗要求"
            v-model="ruleForm.clearRequire"
            maxlength="300"
            style="width: 800px;">
          </el-input>
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            type="textarea"
            :rows="4"
            placeholder="请输入描述"
            v-model="ruleForm.des"
            maxlength="300"
            style="width: 800px;">
          </el-input>
        </el-form-item>
        <el-form-item label="国家">
          <el-select v-model="countriy" filterable placeholder="请选择国家" style="width: 300px;" @change="countriyChange">
            <el-option
              v-for="item in countries"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="省份">
          <el-select v-model="province" filterable placeholder="请选择省份" style="width: 300px;">
            <el-option
              v-for="item in provinces"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <p style="textAlign: center;">
          <el-button size="small" @click="cancel">取消</el-button>
          &emsp;&emsp;
          <el-button type="primary" size="small" @click="submitForm('ruleForm')">保存</el-button>
        </p>
      </el-form>
    </el-main>

    <!-- 主体图片相识度检测 -->
    <el-dialog title="检测结果" :visible.sync="dialogTableVisible" width="420px">
      <el-table :data="similarData" border stripe>
        <el-table-column
          label="序号"
          width="80">
          <template slot-scope="scope">
           {{scope.$index }}
          </template>
        </el-table-column>
        <el-table-column property="subjectName" label="主体名称" width="200"></el-table-column>
        <el-table-column property="similarity" label="相似度"></el-table-column>
      </el-table>
    </el-dialog>
  </el-container>
</template>

<script>
import Countries from "../../lib/country.json";
import { filterCategory } from "../../lib/common";
import { filesystemUrl } from '../../axios/env';
export default {
  data() {
    return {
      loading: false, //loading状态
      options: [], //主体类型总数据
      type: [], //主体类型
      typeId: "", //分类数据

      countries: [], //国家总数据
      countriy: "", //选中的国家

      provinces: [], //省份总数据
      province: "", //选中的省份

      alias: [], //别名
      inputVisible: false,

      classicalImgs: [null], //典型图片
      classicalImgsFolder: '',     //典型图片文件夹路径

      similarData: [],                               //典型图片检测结果
      dialogTableVisible: false,                     //典型图片相似检测弹出框是否显示

      ruleForm: {
        name: "",
        type: [], //判断主体类型必填
        otherName: "", //别名
        imageUrl: "dggdf", //主图路径
        titleMsg: "",
        clearRequire: "",
        des: ""
      },
      rules: {
        name: [
          { required: true, message: "主体名称不能为空！", trigger: "change" },
          {
            pattern: /^[\u4E00-\u9FA5A-Za-z0-9]{0,30}$/,
            message: "请输入汉字/字母/数字",
            trigger: "change"
          }
        ],
        type: [
          { required: true, message: "请选择主体类型！", trigger: "change" }
        ],
        otherName: [
          {
            pattern: /^[\u4E00-\u9FA5A-Za-z0-9]{0,30}$/,
            message: "请输入汉字/字母/数字",
            trigger: "change"
          }
        ],
        imageUrl: [
          { required: true, message: "请选择主图！", trigger: "change" }
        ]
      }
    };
  },
  created() {
    let _this = this;
    //获取分类数据
    _this.loading = true;
    _this.axios.get("/pic/manage/v1/getCategory").then(function(res) {
      _this.loading = false;
      let data = res.data.data;
      filterCategory(data);
      _this.options = data;
    });

    //获取国家
    _this.countries = Countries;

    //获取sessionStorage中的数据
    this.ruleForm.name =sessionStorage.getItem("addMainName") || "";
    this.type = JSON.parse(sessionStorage.getItem("addMainType"));
    this.ruleForm.type = JSON.parse(sessionStorage.getItem("addMainType"));
    if (this.ruleForm.type) {
      this.typeId = this.ruleForm.type[this.ruleForm.type.length - 1]; //获取主体类别最后一集id
    }
    this.alias = JSON.parse(sessionStorage.getItem("addMainAlias")) || [];
    this.ruleForm.imageUrl = sessionStorage.getItem("addMainImageUrl");
    this.classicalImgs = JSON.parse(sessionStorage.getItem("addMainClassicalImgs")) || [null];
    this.ruleForm.titleMsg = sessionStorage.getItem("addMainTitle") || "";
    this.ruleForm.clearRequire = sessionStorage.getItem("addMainClearRequire") || "";
    this.ruleForm.des = sessionStorage.getItem("addMainDes") || "";
    this.countriy = sessionStorage.getItem("addMainCountriy");
    this.province = sessionStorage.getItem("addMainProvince") || "";
  },
  watch: {
    province(curVal, oldVal) {
      sessionStorage.setItem("addMainProvince", curVal); //保存省份
    },
    "ruleForm.name"(curVal, oldVal) {
      sessionStorage.setItem("addMainName", curVal); //保存主体名称
    },
    "ruleForm.titleMsg"(curVal, oldVal) {
      sessionStorage.setItem("addMainTitle", curVal); //保存主体名称
    },
    "ruleForm.clearRequire"(curVal, oldVal) {
      sessionStorage.setItem("addMainClearRequire", curVal); //保存主体名称
    },
    "ruleForm.des"(curVal, oldVal) {
      sessionStorage.setItem("addMainDes", curVal); //保存主体名称
    }
  },
  methods: {
    //返回
    goBack() {
      this.clearData();
      this.$router.push({ path: "/subject_manage" });
    },

    //主体名称相似检测
    checkName() {
      console.log("主体名称相似检测");
    },

    //可搜索的多级下拉列表的change事件
    getType(val) {
      this.ruleForm.type = val;
      this.typeId = val[val.length - 1];
      console.log("主体类别", this.typeId);
      sessionStorage.setItem("addMainType", JSON.stringify(val)); //保存主体类别
    },

    //别名
    handleClose(tag) {
      this.alias.splice(this.alias.indexOf(tag), 1);
    },
    showInput() {
      if (this.alias != []) {
        if (this.alias.length < 10) {
          this.inputVisible = true;
          this.$nextTick(_ => {
            this.$refs.saveTagInput.$refs.input.focus();
          });
        } else {
          this.common.msgModal("warning", "最多可添加10个别名！");
        }
      } else {
        this.inputVisible = true;
      }
    },
    handleInputConfirm() {
      let otherName = this.ruleForm.otherName;
      let reg = /^[\u4E00-\u9FA5A-Za-z0-9]{0,30}$/;
      if (otherName != "") {
        if (otherName.match(reg)) {
          for (let i = 0; i < this.alias.length; i++) {
            if (this.alias[i] === this.ruleForm.name) {
              this.common.msgModal("warning", "别名不能与主体名称重复！");
              this.inputVisible = false;
              this.ruleForm.otherName = "";
              return;
            }
            if (this.alias[i] === otherName) {
              this.common.msgModal("warning", "别名不能重复！");
              this.inputVisible = false;
              this.ruleForm.otherName = "";
              return;
            }
          }
          if (otherName === this.ruleForm.name) {
            this.common.msgModal("warning", "别名不能与主体名称重复！");
            this.inputVisible = false;
            this.ruleForm.otherName = "";
            return;
          }
          this.alias.push(otherName);
          sessionStorage.setItem('addMainAlias',JSON.stringify(this.alias));      //保存别名
          this.inputVisible = false;
          this.ruleForm.otherName = "";
        } else {
          this.inputVisible = false;
          this.ruleForm.otherName = "";
        }
      } else {
        this.inputVisible = false;
      }
    },

    //上传图片
    handleFileChange(item, index) {
      let _this = this;
      if (_this.ruleForm.name == "" || _this.type == null) {
        _this.common.msgModal("warning", "请先填写主体名称和主体类型");
        item.target.value = null;
        return false;
      }
      _this.loading = true;

      let file = item.target;
      let filePath = file.value;

      if (filePath) {
        let filePic = file.files[0]; //读取图片数据
        let fileSize = filePic.size / 1024;

        if (!filePic.name.match(/jpg|jpeg|png/g)) {
          _this.common.msgModal('warning', '图片格式不正确！');
          file.value = null;                                        //解决同一张图片上传无法触发change事假问题
          _this.loading = false;
          return false;
        }
        if (fileSize <= 1024) {
          let reader = new FileReader();
          reader.onload = function(e) {
            // console.log(e.target);
            let data = e.target.result;
            //加载图片获取图片真实宽度和高度
            let image = new Image();
            image.src = data;
            image.onload = async function() {
              let width = image.width;
              let height = image.height;
              if (width <= 1200 && height <= 1200) {
                _this.mkSubjectDir();
                //通知文件服务器提前创建对应的主体目录再上传图片，否则找不到指定的目录会报错
                setTimeout(()=>{
                  _this.uploadPic(item, index);
                },30);
                return false;
              } else {
                _this.common.msgModal('warning', '图片宽高不超过1200px！');
                file.value = null;                                        //解决同一张图片上传无法触发change事假问题
                _this.loading = false;
              }
            };
          };
          reader.readAsDataURL(filePic);
        } else {
          _this.common.msgModal('warning', '您选择的图片大于1M！');
          file.value = null;                                        //解决同一张图片上传无法触发change事假问题
          _this.loading = false;
        }
      } else {
        _this.loading = false;
      }
    },
    uploadPic(item, index) {
      const _this = this;
      _this.loading = false;
      let files = item.target.files;
      let param = new FormData();
      let subjectName = this.ruleForm.name;
      param.append("subjectName", subjectName);
      for (let i = 0; i < files.length; i++) {
        param.append(
          "imgfile",
          files[i],
          Date.now() + encodeURIComponent(files[i].name)
        );
      }
      let config = { headers: { "Content-Type": "multipart/form-data" } };
      let path = "";
      if (index != undefined) {
        path = `${filesystemUrl}/typicalPic`;
      } else {
        path = `${filesystemUrl}/mainPic`;
      }
      _this.axios
        .post(path, param,config)
        .then(function(data) {
          _this.loading = false;
          let response = data.data;
          if (response.code == "0") {
            if (index != undefined) {
              _this.classicalImgs.splice(index, 1, response.data.image_url);
              console.log('全部路径',response.data.path);
              _this.classicalImgsFolder = response.data.path.split('/').slice(0,response.data.path.split('/').length-2).join('/');
              console.log('文件夹路径',_this.classicalImgsFolder);
              sessionStorage.setItem(
                "addMainClassicalImgs",
                JSON.stringify(_this.classicalImgs)
              ); //保存典型图片路径
              // console.log(_this.classicalImgs);
            } else {
              _this.ruleForm.imageUrl = response.data.image_url;
              let ele = document.querySelector('#mainImg .el-form-item__error');
              if(ele) {
                ele.innerText = '';
              }
              // _this.rules.imageUrl[0].message = '';
              // console.log(_this.rules);
              sessionStorage.setItem(
                "addMainImageUrl",
                _this.ruleForm.imageUrl
              ); //保存主图路径
            }
            // _this.common.msgModal("success", "上传成功！");
          }
        })
        .catch(function(err) {
          _this.loading = false;
        });
    },
    //添加典型图片
    addClassicalImg() {
      if (this.classicalImgs.length < 50) {
        this.classicalImgs.push(null);
      } else {
        this.common.msgModal("warning", "最多可上传50张典型图片！");
      }
      console.log(this.classicalImgs);
    },
    //通知文件服务器提前创建主体名称目录
    mkSubjectDir(){
      let _this = this;
      _this.axios
      .get(`${filesystemUrl}/mkSubjectDir`, {
        params: { subjectName: encodeURI(_this.ruleForm.name) }
      })
      .catch(err => {
        if (err.toString() == "Error: Network Error") {
          _this.common.msgModal("error", "连接文件服务器异常");
        }
      });
    },
    //删除典型图片
    delImage(item, index) {
      let _this = this;
      _this
        .$confirm("确定删除此典型图片吗?", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
        .then(() => {
          _this.classicalImgs.splice(index, 1);
          sessionStorage.setItem(
            "addMainClassicalImgs",
            JSON.stringify(_this.classicalImgs)
          ); //保存典型图片路径
          _this.common.msgModal("success", "删除成功！");
        })
        .catch(() => {
          console.log("取消");
        });
      console.log(_this.classicalImgs);
    },

    //典型图片相似检测
    checkSimilar() {
      let _this = this;
      //去除典型图片中多余的null
      let arr = [];
      _this.classicalImgs.map(function(item, index) {
        if (item != null) {
          arr.push(item);
        }
      });
      if(arr.length < 1){
        _this.common.msgModal("warning", "主体暂未添加典型图片!");
        return;
      }
      let time = Date.parse( new Date()).toString();                    //时间戳
      let params = {
        requestId: time,
        subjectName: _this.ruleForm.name,
        classicPicPath: '/home/spider/data/classic_pic',
      }
      _this.loading = true;
      _this.axios.post("http://172.30.144.24:8620/algorithm/v1/classicPicCheck", params,{timeout:20000})
        .then(function(res) {
          _this.loading = false;
          if (res.data.code === "0") {
            _this.similarData = res.data.data;
            _this.dialogTableVisible = true;                //显示弹出框
          }else{
             _this.common.msgModal("warning", res.data.msg);
          }
        })
        .catch(function(error){
          _this.loading = false;
          let str = error + ''
          if (str.search('timeout') !== -1) {   // 超时error捕获
            _this.common.msgModal("error", "检测失败!");
          }
        });

    },

    //选择国家
    countriyChange() {
      (this.province = ""),
        this.countries.map(item => {
          if (item.value == this.countriy) {
            this.provinces = item.childern;
            return false;
          }
        });
      sessionStorage.setItem("addMainCountriy", this.countriy); //保存国家
    },

    //提交
    submitForm(formName) {
      console.log(this.rules);
      let _this = this;
      _this.$refs[formName].validate(valid => {
        if (valid) {
          //去除典型图片中多余的null
          let arr = [];
          _this.classicalImgs.map(function(item, index) {
            if (item != null) {
              arr.push(item);
            }
          });
          console.log(arr);
          let param = {
            name: _this.ruleForm.name,
            mainImage: _this.ruleForm.imageUrl,
            typicalDiagram: arr,
            alias: _this.alias,
            title: _this.ruleForm.titleMsg,
            cleanRequire: _this.ruleForm.clearRequire,
            description: _this.ruleForm.des,
            country: _this.countriy,
            province: _this.province,
            categoryId: _this.typeId
          };
          _this.loading = true;
          _this.axios
            .post("/pic/manage/v1/addMainBody", param)
            .then(function(res) {
              _this.loading = false;
              if (res.data.code === "0") {
                _this.common.msgModal("success", res.data.msg);
                _this.clearData();
                _this.$router.push({ path: "/subject_manage", query: {pageFrom: 'add'} }); //保存成功返回
              }
            });
        } else {
          _this.common.msgModal("warning", "请检查数据是否正确！");
          return false;
        }
      });
    },

    //取消
    cancel() {
      this.clearData();
      this.$router.push({ path: "/subject_manage" }); //返回
    },

    //清除sessionStorage中的数据
    clearData() {
      sessionStorage.removeItem("addMainName");
      sessionStorage.removeItem("addMainType");
      sessionStorage.removeItem("addMainAlias");
      sessionStorage.removeItem("addMainImageUrl");
      sessionStorage.removeItem("addMainClassicalImgs");
      sessionStorage.removeItem("addMainClearRequire");
      sessionStorage.removeItem("addMainTitle");
      sessionStorage.removeItem("addMainDes");
      sessionStorage.removeItem("addMainCountriy");
      sessionStorage.removeItem("addMainProvince");
    }
  }
};
</script>

<style>
.add_main .el-form {
  padding: 20px;
  border: 1px solid #ebeef5;
}

/* 别名 */
.add_main .el-tag {
  margin-right: 10px;
  margin-top: 10px;
}
.add_main .button-new-tag {
  margin-right: 10px;
  margin-top: 10px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}
.add_main .input-new-tag {
  width: 90px;
  margin-right: 10px;
  margin-top: 10px;
  vertical-align: bottom;
}

/* 图片展示、上传区域 */
.add_main .upload_img {
  display: inline-block;
  margin: 0 10px 10px 0;
}
.add_main .picContainer {
  width: 200px;
  height: 200px;
  border: 1px solid #ebeef5;
}
.add_main .picContainer img {
  width: 100%;
  height: 100%;
}
.add_main .uploadAdd {
  width: 198px;
  height: 30px;
  line-height: 30px;
  background-color: #fafafa;
  border: 1px solid #ccc;
  border-top-color: transparent;
  margin: -2px 0px 0px 1px;
}
.add_main .btn-upload {
  position: relative;
  color: #409eff;
  margin-left: 8px;
}
.add_main .btn-upload-del {
  margin-left: 68px;
  cursor: pointer;
}
.add_main .btn-upload input {
  width: 60px;
  height: 40px;
  position: absolute;
  font-size: 29px;
  right: 34px;
  top: -12px;
  opacity: 0;
  filter: alpha(opacity=0);
  cursor: pointer;
}
/* 典型图片盒子 */
.add_main .typical_img_box {
  display: inline-block;
  min-height: 100px;
  max-height: 760px;
  overflow-y: auto;
  margin-right: 20px;
}

.add_main .el-form-item__label {
  padding-right: 50px;
}
</style>
