/**
 * Created by weijian.lin on 2018/7/5.
 */
import Vue from "vue";
// 清洗状态
Vue.filter('cleanStatusFilter', function (value) {
  // 返回处理后的值[0.全部,1.未清洗,2.清洗中,3.清洗完成]
  if(value == 1){
    return '未清洗'
  }else if(value == 2){
    return '清洗中'
  }else if(value == 3){
    return '清洗完成'
  }
});
// 清洗状态[0:全部,1:新任务,2:退回任务]
Vue.filter('cleanCategoryFilter', function (value) {
  // 返回处理后的值[0.全部,1.未清洗,2.清洗中,3.清洗完成]
  if(value == 1){
    return '新任务'
  }else if(value == 2){
    return '退回任务'
  }
});
