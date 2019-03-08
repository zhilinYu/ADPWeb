export const PAGE = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 20
}

export const AUDIT_STATUS = [
  { label: '全部', value: 0 },
  { label: '未审核', value: 1 },
  { label: '审核未通过', value: 2 },
  { label: '审核通过', value: 3 },
]

//数据审核状态
export const CLEANDATA_STATUS = [
  { label: '全部', value: 0 },
  { label: '待审核', value: 1 },
  { label: '审核通过', value: 3 },
  { label: '退回', value: 2 },
]

export const MAIN_STATUS = [
  { label: '全部', value: 0 },
  { label: '待爬虫', value: 1 },
  { label: '爬虫中', value: 4 },
  { label: '清洗中', value: 5 },
  { label: '训练中', value: 6 },
  { label: '测试中', value: 7 },
  { label: '已删除', value: 8 },
  { label: '已上线', value: 9 },
]

export const CLEAN_STATUS = [
  { label: '全部', value: 0 },
  { label: '清洗中', value: 2 },
  { label: '清洗完成', value: 3 }
]

export const CLEAN_CATEGORY= [
  { label: '全部', value: 0 },
  { label: '新任务', value: 1 },
  { label: '退回任务', value: 2 }
]
