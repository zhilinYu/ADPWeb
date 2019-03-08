
import Vue from 'vue';
import ElementUI from 'element-ui';
import { Notification } from 'element-ui';


export default({
  msgModal(type, msg) {
    // let notifications = document.querySelectorAll('.el-notification');
    // if(notifications.length == 0){
    //   Notification[type](msg);
    // }
    Notification[type](msg);
  },
  trim(str){
    //删除左右两端的空格
    return str.replace(/(^\s*)|(\s*$)/g, "");
  },
  //导出表格数据为Excel
  export2Excel(tHeaderArr,filterValArr,tableData,fileName) {
    //tHeader为表头数组，如：["编号", "机构名称", "地址", "创建时间", "编辑时间","状态"]
    //filterVal为表格和tableData中对应的属性名，如：["id", "UnitName", "address", "createdTime", "updatedTime","status"]
    //tableData为后端返回的数据数组，其中需包含filterVal中的所有属性
    //filename为导出文件的文件名
    require.ensure([], () => {
      const { export_json_to_excel } = require("@/vendor/Export2Excel");
      const tHeader = tHeaderArr;
      const filterVal = filterValArr;
      const list = tableData;
      //表格绑定数据tableData转json
      const data = this.formatJson(filterVal, list);
      export_json_to_excel(tHeader, data, fileName);
    });
  },
  formatJson(filterVal, jsonData) {
    return jsonData.map(v => filterVal.map(j => v[j]));
  }
});
