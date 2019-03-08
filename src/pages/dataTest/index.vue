<template>
    <div class="app-page">
        <header class="app-search search_header">
            <el-row :gutter="20">
                <el-col :span="8">
                    <span class="deliver_serial_num">测试编号</span>
                    <el-input class="search_input" placeholder="请输入测试编号" maxlength="30"
                          v-model="serialNumInput"
                          @change = "inputChange"
                          @keyup.enter.native="queryHandle"></el-input>

                </el-col>
                <el-col :span="8">
                    <span class="search_name">创建时间</span>
                    <el-date-picker
                        v-model="selectTime"
                        type="date"
                        placeholder="选择日期"
                        format="yyyy 年 MM 月 dd 日"
                        :editable="false"
                        :picker-options="pickerOptions"
                        value-format="yyyy-MM-dd"
                        @change="queryByDate">
                        </el-date-picker>
                </el-col>
                <el-col :span="8">
                    <el-button type="primary" size="mini" @click="queryHandle">查询</el-button>
                </el-col>
            </el-row>
        </header>
        <main class="app-list app-deliver-history">
            <el-table
                :data="dataList"
                v-loading="isLoading"
                border>
                <el-table-column
                    prop="deliver_serial_num"
                    label="编号"
                    width="130"></el-table-column>
                <el-table-column
                    label="主体数量"
                    width="100">
                    <template slot-scope="scope">
                        <p>{{scope.row.subjects?scope.row.subjects.length:""}}</p>
                    </template>
                </el-table-column>
                <el-table-column
                    label="图片数量"
                    width="100">
                    <template slot-scope="scope">
                        <p>{{scope.row.images_test_num?scope.row.images_test_num:""}}</p>
                    </template>
                </el-table-column>
                <!-- <el-table-column
                    prop="creator"
                    label="移交人"
                    width="120"></el-table-column> -->
                <!-- <el-table-column
                    prop="create_time"
                    label="移交时间"
                  ></el-table-column> -->
                <!-- <el-table-column
                        label="移交机构">
                    <template slot-scope="scope">
                        <div v-if="scope.row.organizations&&scope.row.organizations.length!==0">
                            <el-tag class="app-tag-margin" v-for="(item,index) in scope.row.organizations" :key="index"  type="warning">{{item.org_name}}</el-tag>
                        </div>
                    </template>
                </el-table-column> -->
                <el-table-column
                    label="状态"
                    width="166"
                    :render-header="renderStatus">
                    <template slot-scope="scope">
                        <div v-if="scope.row.state_train">
                            <el-tag v-if="scope.row.state_train===2" type="">测试中</el-tag>
                            <el-tag v-else-if="scope.row.state_train===3" type="success">测试完成</el-tag>
                            <el-tag v-else-if="scope.row.state_train===4" type="danger">测试异常</el-tag>
                        </div>
                    </template>
                </el-table-column>
                 <el-table-column
                    label="特殊测试"
                    width="300">
                    <template slot-scope="scope">
                        <p>{{scope.row.images_test_types.length!=0?scope.row.images_test_types.toString():""}}</p>
                    </template>
                </el-table-column>
                <el-table-column
                    prop="model_version"
                    label="模型版本"
                    width="200"></el-table-column>
                <el-table-column
                    prop="create_time"
                    label="创建时间"
                  ></el-table-column>
                <el-table-column
                    prop="finish_time"
                    label="完成时间"
                  ></el-table-column>
                <el-table-column
                    label="操作"
                   >
                    <template slot-scope="scope">
                        <el-button type="text" size="small" @click="gotoTestRecord(scope.row)">详情</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <el-pagination
                ref="pagination"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="pagingInfo.currentPage"
                :page-sizes="[10, 20, 30, 100]"
                :page-size="pagingInfo.perPageSize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="pagingInfo.totalCount"></el-pagination>
        </main>
    </div>
</template>

<script>
    import request from '../../axios/request';
    import { baseUrl } from '../../axios/env';
    export default {
        name: "dataTest",
        data(){
            return {
                isLoading:false,
                serialNumInput:'',
                dataList:[],
                selectState:'',
                selectTime:'',
                selectTimeStart:'',
                selectTimeEnd:'',
                startDate: null,
                pickerOptions:{
                    disabledDate(time) {
                        return time.getTime() > Date.now();
                    },
                },
                //状态参数
                currentstate:'状态',
                stateList:[{
                    value:0,
                    label:'全部'
                },{
                    value:2,
                    label:'测试中'
                },{
                    value:3,
                    label:'测试完成'
                },{
                    value:4,
                    label:'测试异常'
                }],
                //分页参数
                pagingInfo:{
                    currentPage:1,
                    perPageSize:20,
                    totalPages:1,
                    totalCount:0
                },
                //解决分页问题
                pRef: null,
                // 弹框
                dialogVisible:false,
                checkedType:[],
                types:[],
                radio:'2',
                dialogTitle:'测试数据',
                picCount:0,
                //创建测试提交数据
                testParams:{}
            }
        },
        mounted() {
            //解决分页跳转问题
            this.pRef = this.$refs.pagination;
            this.pRef.internalCurrentPage = this.pagingInfo.currentPage;
        },
        created:function(){
            //获取sessionStorage中的数据
            this.serialNumInput = sessionStorage.getItem('serialNumInput') || '';
            this.pagingInfo.perPageSize = JSON.parse(sessionStorage.getItem('perPageSize')) || this.pagingInfo.perPageSize;
            this.pagingInfo.currentPage = JSON.parse(sessionStorage.getItem('curPage')) || 1;
            this.getDataList(this.pagingInfo.currentPage);
        },
        methods: {
            /**
             * 按测试编号查询：查询输入操作
             *
             */
            inputChange: function(val) {
                if (val === '') {
                    this.getDataList(this.pagingInfo.currentPage);
                } else {
                    this.queryHandle();
                }
            },
            queryHandle: function() {
                this.getDataList(1);
            },
            /**
             * 按状态查询：重置表格标题为下拉选框
             */
            renderStatus:function(createElement) {
                let self = this;
                let options = [];
                self.stateList.forEach(item => {
                    options.push(
                        createElement("el-option", {
                            props: {
                                value: item.value,
                                label: item.label
                            }
                        })
                    )

                });
                return createElement('el-select',{
                    class:"el-select-reset",
                    props:{
                        placeholder:'请选择',
                        value: self.currentstate,
                    },
                    on: {
                        input: value => {
                            if(value===0){
                                self.currentstate = '状态';
                                self.selectState = '';
                            }else{
                                self.currentstate = self.selectState = value;
                            }
                            self.getDataList(1);
                        }
                    }
                },options)
            },
            /**
             * 按日期查询
             */
            queryByDate:function(val){
                if(!val){
                    this.selectTimeStart = this.selectTime = this.selectTimeEnd = "";
                }else{
                    this.selectTimeStart = val+" 00:00:00";
                    this.selectTimeEnd = val+' 23:59:59';
                }

                this.getDataList(1);
            },
            /**
             * 分页逻辑处理
             */
            handleSizeChange(val) {
                this.pagingInfo.perPageSize = val;
                this.pRef.internalCurrentPage = this.pagingInfo.currentPage = 1;
                this.getDataList(this.pagingInfo.currentPage);
            },
            handleCurrentChange(val) {
                this.pRef.internalCurrentPage = this.pagingInfo.currentPage = val;
                this.getDataList(this.pagingInfo.currentPage);
            },
            /**
             * 数据请求
             */
            getDataList:function(page) {
                let self = this,
                    params = `deliver_serial_num=${this.serialNumInput}&state=2&state_train=${this.selectState}&start_time=${this.selectTimeStart}&end_time=${this.selectTimeEnd}&currentPage=${page}&perPageSize=${this.pagingInfo.perPageSize}`;
                let requestUrl = `${baseUrl}/pic/manage/v1/getDeliverList?${params}`;
                this.isLoading = true;
                request.get(requestUrl)
                    .then(function(res) {
                        console.warn("================获取数据移交记录列表================");
                        console.log(res);
                        self.isLoading = false;
                        if(res.status===200&&res.data.code===0){
                            var result = res.data.data;
                            self.pagingInfo.currentPage = result.currentPage;
                            self.pagingInfo.totalPages = result.totalPages;
                            self.pagingInfo.totalCount = result.totalCount;
                            self.dataList = result.result;
                            self.saveStatus(page);
                        }else{
                            self.dataList = [];
                            self.pagingInfo.currentPage = 1;
                            self.pagingInfo.totalPages = 1;
                            self.pagingInfo.totalCount = 1;
                            self.$message({
                                type: 'error',
                                message: '数据加载异常'
                            });
                        }
                    }).catch(function(err) {
                        self.isLoading = false;
                        self.$message({
                            type: 'error',
                            message: '请检查您的网络连接是否正常！'
                        });
                    });
            },
            //保存分页状态到sessionStorage
            saveStatus:function(page) {
                sessionStorage.setItem('serialNumInput',this.serialNumInput);                   //保存机构名
                sessionStorage.setItem('perPageSize', this.pagingInfo.perPageSize);  //保存每页条数
                sessionStorage.setItem('curPage',page);                             //保存当前页
            },
            /**
             * 前往主体页面
             */
            gotoTestRecord:function(item) {
                this.$router.push({path:'/data_test/test_status',query:{id:item._id}});
            }


        }
    };
</script>

<style>
.app-deliver-history .app-tag-margin{
    margin: 4px;
}
</style>
