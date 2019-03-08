<template>
    <div class="app-page">
        <div class="app-nav">
            <el-breadcrumb separator-class="el-icon-arrow-right">
                <el-breadcrumb-item :to="{ path: '/data_deliver' }">移交数据</el-breadcrumb-item>
                <el-breadcrumb-item :to="{ path: '/data_deliver/data_deliver_history' }">移交历史</el-breadcrumb-item>
                <el-breadcrumb-item>主体</el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <main class="app-list">
            <header class="app-search search_header">
                <el-row :gutter="20">
                    <el-col :span="16">
                        <span class="search_name">主体名成</span>
                        <el-input class="search_input" placeholder="请输入" maxlength="30"
                                  v-model="deliverSubjectInput"
                                  @change="inputChange"
                                  @keyup.enter.native="queryHandle"></el-input>
                        <el-button
                                type="primary"
                                size="mini"
                                @click="queryHandle">查询</el-button>
                    </el-col>
                </el-row>
            </header>
            <main class="app-list">
                <el-table
                    :data="dataList"
                    v-loading="isLoading"
                    border>
                    <el-table-column
                        label="序号"
                        width="90">
                        <template slot-scope="scope">
                            {{(pagingInfo.currentPage-1)*pagingInfo.perPageSize+scope.$index+1}}
                        </template>
                    </el-table-column>
                    <el-table-column
                            prop="name"
                            label="主体名称"
                            width="160">
                    </el-table-column>
                    <el-table-column
                            prop="training_number"
                            label="训练集数量">
                    </el-table-column>
                    <el-table-column
                            prop="training_number"
                            label="测试集数量">
                    </el-table-column>
                    <el-table-column
                            label="移交数量">
                        <template slot-scope="scope">
                            <router-link :to="{path:'/show_pic',query:{id:scope.row._id,taskId: taskId, pageFrom: 6}}">{{scope.row.transfer_number}}查看</router-link>
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
        </main>
    </div>
</template>

<script>
    export default {
        name: "dataDeliverSubjects",
        data(){
            return {
                isLoading:false,
                deliverSubjectInput:'',
                dataList:[],
                //分页参数
                pagingInfo:{
                    currentPage:1,
                    perPageSize:20,
                    totalPages:1,
                    totalCount:0
                },
                //解决分页问题
                pRef: null,
    
                //任务id
                taskId: null,
                
            }
        },
        computed:{
            deliverId:function() {
                return this.$route.query.id;
            }
        },
        mounted() {
            //解决分页跳转问题
            this.pRef = this.$refs.pagination;
            this.pRef.internalCurrentPage = this.pagingInfo.currentPage;
        },
        created:function(){
            //获取任务id
            this.taskId = this.$route.query.id;
            //获取sessionStorage中的数据
            this.groupInput = sessionStorage.getItem('deliverSubjectInput') || '';
            this.pagingInfo.perPageSize = JSON.parse(sessionStorage.getItem('dhs_perPageSize')) || this.pagingInfo.perPageSize;
            this.pagingInfo.currentPage = JSON.parse(sessionStorage.getItem('dhs_curPage')) || 1;
            this.getDataList(this.pagingInfo.currentPage);
        },
        methods:{
            /**
             * 按机构查询：查询输入操作
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
             * 获取数据
             */
            getDataList:function(page) {
                let self = this,
                    url = "/pic/manage/v1/getMainBodyListByDeliverId";
                this.isLoading = true;
                self.axios.post(url,{
                    id:self.deliverId,
                    curPage:self.pagingInfo.currentPage,
                    pageSize:self.pagingInfo.perPageSize,
                    name:self.deliverSubjectInput,
                }).then(function (res) {
                        console.warn("================获取主体列表================");
                        console.log(res);
                        self.isLoading = false;
                        if(res.status===200&&res.data.code==="0"){
                            let result = res.data.data;
                            self.isLoading = false;
                            self.pagingInfo.currentPage = result.curPage;
                            self.pagingInfo.totalPages = result.totalPages;
                            self.pagingInfo.totalCount = result.totalCount;
                            self.dataList =result.list;
                            self.saveStatus(page);                             //保存状态到sessionStorage
                        }else{
                            self.isLoading = false;
                            self.dataList = [];
                            self.pagingInfo.currentPage = 1;
                            self.pagingInfo.totalPages = 1;
                            self.pagingInfo.totalCount = 1;
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
                sessionStorage.setItem('deliverSubjectInput',this.deliverSubjectInput);                   //保存机构名
                sessionStorage.setItem('dhs_perPageSize', this.pagingInfo.perPageSize);  //保存每页条数
                sessionStorage.setItem('dhs_curPage',page);                             //保存当前页
            },
        },
        destroyed:function() {
            sessionStorage.removeItem('deliverSubjectInput');
            sessionStorage.removeItem('dhs_perPageSize');
            sessionStorage.removeItem('dhs_curPage');
        }
    };
</script>

<style scoped>

</style>

