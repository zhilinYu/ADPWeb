import Vue from 'vue'
import Router from 'vue-router'

//页面
import Index from '../pages/index';
import trainingCompany from '../pages/trainingCompany';
import buttReptile from '../pages/buttReptile';
import classManage from '../pages/classManage';
import subjectManage from '../pages/subjectManage';
import examineData from '../pages/examineData';

//清洗
import clearTask from '../pages/clearTask/cleanList';
import distributionRecordList from '../pages/clearTask/distributionRecordList';
import assignTask from '../pages/clearTask/assignTask';
import distributionList from '../pages/clearTask/distributionList';
import distributionUserList from '../pages/clearTask/distributionUserList';

import Log from '../pages/log';
import clearAction from '../pages/clearTask/cleanAction';

//图片爬虫相关模块
import crawlerModulesEntry from '../pages/crawlerModules/picCrawlerListEntry'
import picCrawlerListMain from '../pages/crawlerModules/picCrawlerListMain'
import addPicCrawlerTask from '../pages/crawlerModules/addPicCrawlerTask'

import addSubject from '../pages/subjectManage/addSubject';
import subjectList from '../pages/subjectManage/list';
import editSubject from '../pages/subjectManage/editSubject';
import subjectDetail from '../pages/subjectManage/subjectDetail';
import subjectPicView from '../pages/subjectManage/subjectPicView';

import picCrawlerDetail from '../pages/crawlerModules/picCrawlerDetail'
import picCrawlerSubjectList from '../pages/crawlerModules/picCrawlerSubjectList'
import picCrawlerTaskSubjectList from '../pages/crawlerModules/picCrawlerTaskSubjectList'

//清洗审核
import examineList from '../pages/examineData/examineList';

//用户管理
import User from '../pages/user';
import Login from '../pages/user/login';

//数据测试模块
import dataTestEntry from '../pages/dataTest/dataTestEntry';
import dataTest from '../pages/dataTest/index';
import testStatus from '../pages/dataTest/testStatus';
import testDetail from '../pages/dataTest/testDetail';
import testPicDetail from '../pages/dataTest/testPicDetail';

//组模块
import groupListEntry from '../pages/groupModules/groupListEntry'
import groupListMain from '../pages/groupModules/groupListMain'
import addEditGroup from '../pages/groupModules/addEditGroup'
import membersOfGroup from '../pages/groupModules/membersOfGroup'

//数据移交
import dataDeliverEntry from '../pages/dataDeliver/dataDeliverEntry';
import dataDeliverMain from '../pages/dataDeliver/dataDeliverMain';
import dataDeliverHistory from '../pages/dataDeliver/dataDeliverHistory';
import dataDeliverSubjects from '../pages/dataDeliver/dataDeliverSubjects';

// 配置模块
import backConfig from '../pages/backConfig';
import handoverRatioConfig from '../pages/backConfig/handoverRatioConfig';

//公共的查看图片模块
import showPic from '../components/showPic';



Vue.use(Router)

export default new Router({
  routes: [
    {
      path:'/login',
      name:'login',
      component:Login
    },
    {
      path: '/',
      name: 'Index',
      component: Index,
      children: [
        {
          path: 'training_company',
          name: 'training_company',
          component: trainingCompany,
        }, {
          path: 'butt_reptile',
          name: 'butt_reptile',
          component: buttReptile,
        }, {
          path: 'class_manage',
          name: 'class_manage',
          component: classManage,
        }, {
          path: 'crawler_modules',
          name: 'crawler_modules',
          component: crawlerModulesEntry,
          children:[
            {
              path:'/crawler_modules',
              name: 'crawlerModulesMain',
              component: picCrawlerListMain,
            },
            {
              path:'crawler_detail',
              name:'picCrawlerDetail',
              component:picCrawlerDetail
            },
            {
              path:'add_crawler_task',
              name: 'add_crawler_task',
              component: addPicCrawlerTask,
            },
            {
              path:'crawler_subject_list',
              name:'crawler_subject_list',
              component:picCrawlerSubjectList
            }, {
              path:'task_subject_list',
              name:'task_subject_list',
              component:picCrawlerTaskSubjectList
            }
          ]
        },{
          path: 'group',
          name: 'groupList',
          component: groupListEntry,
          children:[
            {
              path:'/group',
              name: 'groupListMain',
              component: groupListMain,
            },
            {
              path:'add_edit_group',
              name: 'addEditGroup',
              component: addEditGroup,
            },
            {
              path:'members',
              name: 'membersOfGroup',
              component: membersOfGroup,
            }
          ]
        },{
          path: 'subject_manage',
          name: 'subject_manage',
          component: subjectManage,
          children: [
            {
              path:'/subject_manage',
              name: 'list',
              component: subjectList,
            },
            {
              path:'add',
              name: 'add',
              component: addSubject,
            },
            {
              path:'edit',
              name: 'edit',
              component: editSubject,
            },
            {
              path:'detail',
              name: 'detail',
              component: subjectDetail,
            },
            {
              path:'picView',
              name: 'picView',
              component: subjectPicView,
            }
          ]
        }, {
          path: 'clean_list',
          name: 'clean_list',
          component: clearTask,
        }, {
          path: 'distribution_record_list',
          name: 'distribution_record_list',
          component: distributionRecordList,
        }, {
          path: 'clean_action',
          name: 'clean_action',
          component: clearAction,
        },{
          path: 'examine_data',
          name: 'examine_data',
          component: examineData,
          children: [
            {
              path:'/examine_data',
              name: 'examine_list',
              component: examineList,
            },
          ]
        }, {
          path: 'user',
          name: 'user',
          component: User,
        }, {
          path: 'distribution_list',
          name: 'distribution_list',
          component: distributionList,
        }, {
          path: 'distribution_user_list',
          name: 'distribution_user_list',
          component: distributionUserList
        },{
          path:'assign_task',
          name: 'assign_task',
          component: assignTask,
        },{
          path: 'data_deliver',
          name: 'data_deliver',
          component: dataDeliverEntry,
            children: [
                {
                    path:'/data_deliver',
                    name: 'dataDeliverMain',
                    component: dataDeliverMain,
                },
                {
                    path:'data_deliver_history',
                    name: 'dataDeliverHistory',
                    component: dataDeliverHistory,
                },
                {
                    path:'deliver_subject',
                    name: 'dataDeliverSubjects',
                    component: dataDeliverSubjects,
                },
            ]
        },
        {
          path: 'data_test',
          name: 'data_test',
          component: dataTestEntry,
          children:[
            {
              path: '',
              name: 'data_test',
              component: dataTest,
            },
            {
              path: 'test_status',
              name: 'test_status',
              component: testStatus,
            },
            {
              path: 'test_detail',
              name: 'test_detail',
              component:testDetail,
            },{
              path: 'test_pic_detail',
              name: 'test_pic_detail',
              component:testPicDetail,
            }
          ]
        },
        {
          path: 'back_config',
          name: 'back_config',
          component: backConfig,
          children:[
            {
              path: 'ratio_config',
              name: 'ratio_config',
              component: handoverRatioConfig,
            }
          ]
        },
        {

          path: 'log',
          name: 'log',
          component: Log,
        }, {
          path: 'show_pic',
          name: 'show_pic',
          component: showPic,
        },
      ]
    }
  ]
});
