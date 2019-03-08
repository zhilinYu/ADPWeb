<template>
  <div style="display: inline-block;">
    <el-button size="mini" plain @click="openDialog" :disabled="auditStatus === 3 ? true : false">审核</el-button>

    <el-dialog
      title="修改审核状态"
      :visible.sync="centerDialogVisible"
      width="30%"
      center>
      <div style="text-align: center;">
        <el-radio disabled v-model="radio" label="1">未审核</el-radio>
        <el-radio v-model="radio" label="3">审核通过</el-radio>
        <el-radio v-model="radio" label="2">审核未通过</el-radio>
      </div>
      
      <span slot="footer" class="dialog-footer">
        <el-button size="mini" @click="centerDialogVisible = false;">取 消</el-button>
        <el-button size="mini" type="primary" @click="ensure">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  import request from '../../axios/request';
  export default {
    props: [ "auditStatus", "id", "fetchList"],
    data() {
      return {
        radio: "3",
        centerDialogVisible: false,
        status: '',
        subjectId: '',
      };
    },
    created() {
      
      // console.log('auditStatus=', this.auditStatus);
    },
    methods: {
      openDialog() {
        this.radio = JSON.stringify(this.auditStatus);
        this.subjectId = this.id;
        console.log(this.auditStatus, this.id);
        this.centerDialogVisible = true;
      },
      async ensure() {
        const { auditStatus, id } = this;
        if(this.radio != '1') {
          let { data } = await request.post(`/pic/manage/v1/examinationPassed`, {
            id,
            auditStatus: parseInt(this.radio),
          });
          this.centerDialogVisible = false;
          if (data.code !== '-1') {
            this.common.msgModal("success", data.msg);
            this.fetchList();
          }
        }else{
          this.centerDialogVisible = false;
        }
      }
    }
  };
</script>