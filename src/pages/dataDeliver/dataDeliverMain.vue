<template>
    <div class="app-page">
        <header class="app-search search_header">
            <el-row :gutter="20">
                <el-col :span="16">
                    <span class="search_name">主体名称</span>
                    <el-input class="search_input" placeholder="请输入" maxlength="30"
                              v-model="inputValue"
                              @change = "inputChange"
                              @keyup.enter.native="queryHandle"></el-input>
                    <el-button
                            type="primary"
                            size="mini"
                            @click="queryHandle">查询</el-button>
                </el-col>
                <el-col :span="8">
                    <!--<el-row class="app-btn-group">-->
                        <!--<el-button type="primary" size="mini">新建</el-button>-->
                    <!--</el-row>-->
                </el-col>
            </el-row>
        </header>
        <main class="app-list deliver-history-list">
            <div class="app-table-count">
                <el-row :gutter="20">
                    <el-col :span="12"><div>
                        主体列表(共{{pagingInfo.totalCount}}条)
                    </div></el-col>
                    <el-col :span="12"><div class="app-table-count-right">
                        <el-button type="primary" size="mini" @click="selectOrg">移交</el-button>
                    </div></el-col>
                </el-row>
            </div>
            <el-table
                ref="multipleTable"
                :data="dataList"
                v-loading="isLoading"
                border
                :row-key="getRowKeys"
                @selection-change="handleSelectionChange">
                <el-table-column
                    type="selection"
                    :reserve-selection="true"
                    width="55"></el-table-column>
                <el-table-column
                        prop="name"
                        label="名称"
                        width="180"></el-table-column>
                <el-table-column
                        label="状态"
                        width="180"
                        :render-header="renderStatus">
                    <template slot-scope="scope">
                        <div v-if="scope.row.transfer_status">
                            <!--<el-tag v-if="scope.row.transfer_status===1" type="error">未移交</el-tag>-->
                            <!--<el-tag v-if="scope.row.transfer_status===2" type="success">已移交</el-tag>-->
                            <p v-if="scope.row.transfer_status===1">未移交</p>
                            <p v-else-if="scope.row.transfer_status===2">已移交</p>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column
                        prop="total_clean"
                        label="有效数量"></el-table-column>
                <el-table-column
                        prop="training_number"
                        label="训练集数量"></el-table-column>
                <el-table-column
                        prop="transfer_number"
                        label="已移交数量"></el-table-column>
                <el-table-column
                        fixed="right"
                        label="移交记录"
                        width="160">
                    <template slot-scope="scope">
                        <el-button type="text" size="small">查看</el-button>
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
        <el-dialog title="选择机构" width="730px" :visible.sync="dialogVisible">
            <el-transfer
                class="app-dialog-transfer"
                v-model="orgSelectShow"
                :data="orgTotalList"
                @change = "transferSelecHandle"
                filterable
                :titles="['所有机构', '已选机构']"></el-transfer>
            <div class="dialog-footer">
                <el-button type="success" :loading="isSubmitLoading" size="small" @click="submitData">确定移交</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
    export default {
        name: "dataDeliverMain",
        data(){
            return {
                dialogVisible:false,
                isLoading:false,
                isSubmitLoading:false,
                inputValue:"",
                selectStatus:'状态',
                selectStatusList:[{
                    value:0,
                    label:'全部'
                },{
                    value:1,
                    label:'未移交'
                },{
                    value:2,
                    label:'已移交'
                }],
                transferStatus:'',  //移交状态[0.全部,1.未移交,2.已移交]
                //表格多选
                multipleSelection: [],
                getRowKeys(row) {       // 获取row的key值
                    return row._id;
                },
                //列表数据
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
                //机构相关参数
                orgTotalList:[],
                orgSelectList:[],
                orgSelectShow:[],
                //所选主体
                subjectsSelectList:[],
                
            }
        },
        mounted() {
            //解决分页跳转问题
            this.pRef = this.$refs.pagination;
            this.pRef.internalCurrentPage = this.pagingInfo.currentPage;
        },
        created:function(){
            //获取sessionStorage中的数据
            this.groupInput = sessionStorage.getItem('dataDeliverInput') || '';
            this.pagingInfo.perPageSize = JSON.parse(sessionStorage.getItem('perPageSize')) || this.pagingInfo.perPageSize;
            this.pagingInfo.currentPage = JSON.parse(sessionStorage.getItem('curPage')) || 1;
            this.getDataList(this.pagingInfo.currentPage);
        },
        methods:{
            /**
             * 查询输入操作
             *
             */
            inputChange:function(val){
                if(val === ''){
                    this.getDataList(this.pagingInfo.currentPage);
                }else{
                    this.queryHandle();
                }
            },
            queryHandle:function() {
                this.getDataList(1);
            },
            /**
             * 多选操作
             */
            handleSelectionChange(val) {
                this.multipleSelection = val;
            },
            /**
             * 重置表格标题为下拉选框
             */
            renderStatus:function(createElement) {
                let self = this;
                let options = [];
                self.selectStatusList.forEach(item => {
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
                        value: self.selectStatus,
                    },
                    on: {
                        input: value => {
                            if(value===0){
                                self.selectStatus = '状态';
                            }else{
                                self.selectStatus = value;
                            }
                            self.transferStatus = value;
                            self.getDataList(1);
                        }
                    }
                },options)
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
             * 获取数据列表
             */
            getDataList:function(page) {
                let self = this,
                    url = "/pic/manage/v1/getMainBody";
                this.isLoading = true;
                self.axios.post(url,{
                    manualReviewStatus:3,
                    transferStatus:self.transferStatus,
                    curPage:self.pagingInfo.currentPage,
                    pageSize:self.pagingInfo.perPageSize,
                    name:self.inputValue
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
                sessionStorage.setItem('dataDeliverInput',this.inputValue);         //保存组名
                sessionStorage.setItem('perPageSize',this.pagingInfo.perPageSize);  //保存每页条数
                sessionStorage.setItem('curPage',page);                             //保存当前页
            },
            /**
             * 选择机构
             */
            selectOrg:function(){
                var self = this;
                this.subjectsSelectList = [];
                this.multipleSelection.forEach((item,index)=>{
                    self.subjectsSelectList.push(item._id);
                });
                this.getOrgList();
                this.dialogVisible = true;
            },
            transferSelecHandle:function(changeValue) {
                let self = this;
                this.orgSelectShow = changeValue;
                this.orgSelectList = [];
                changeValue.forEach(function($item,$index) {
                    self.orgSelectList.push({
                        org_id:self.orgTotalList[$item]._id,
                        org_name:self.orgTotalList[$item].UnitName,
                    });
                });
                console.warn("================所选机构================");
                console.log(self.orgSelectList);
                console.log(self.orgSelectShow);
            },
            getOrgList:function() {
                var self = this,
                    url = "/pic/manage/v1/modelTrainUnit";
                this.axios.get(url, {
                    pageSize: 1000000,                  //机构不分页，但是接口没提供拉取所有的接口，这里设置无限大
                }).then(res => {
                    console.warn("================获取机构列表================");
                    console.log(res);
                    if(res.status===200&&res.data.code==="0"){
                        let result = res.data.data,
                            orgShowList = [];
                        result.list.forEach(function($item,$index) {
                            orgShowList.push(Object.assign($item,{
                                key: $index,
                                label: $item.UnitName,
                                disabled: false,
                            }));
                        });
                        self.orgTotalList = orgShowList;
                    }
                });
            },
            submitData:function() {
                if(this.orgSelectList.length===0){
                    this.common.msgModal("warning","请选择机构");
                    return;
                }else if(this.orgSelectList.length>1){
                    this.common.msgModal("warning","请选择一个机构");
                    return;
                }
                if(this.subjectsSelectList.length===0){
                    this.common.msgModal("warning","请选择主体");
                    return;
                }
                let self = this,
                    url = "/pic/manage/v1/createDeliver";
                this.isSubmitLoading = true;
                this.axios.post(url,{
                    subjects:self.subjectsSelectList,
                    organizations:self.orgSelectList
                }).then(res=>{
                    console.warn("================新建数据移交记录================");
                    console.log(res);
                    self.isSubmitLoading = false;
                    if(res.status===200&&res.data.code===0){
                        self.common.msgModal("success","移交成功");
                    }else{
                        self.common.msgModal("error","移交失败");
                    }
                    //提交成功的后续操作
                    self.dialogVisible = false;
                    self.orgSelectShow = self.multipleSelection = [];       //清空穿梭框的选中项
                    self.getDataList(self.pagingInfo.currentPage);          //重新拉取列表
                    self.$refs.multipleTable.clearSelection();
                }).catch(function(err) {
                    self.isSubmitLoading = false;
                    self.$message({
                        type: 'error',
                        message: '请检查您的网络连接是否正常！'
                    });
                });
            }
        }
    };
</script>

<style>
.deliver-history-list .el-table td{
    padding: 0;
}
.app-table-count{
    box-sizing: border-box;
    width: 100%;
    padding: 10px;
    /*background: #f5f7fa;*/
    /*border: 1px solid #ebeef5;*/
    border-bottom: none;
}
.app-table-count-right{
    text-align: right;
}
</style>
