import CreateListComponent from "./createListComponent";


const DEFAULT_ESTIMATED_SIZE = 50; //默认情况下
const getEstimatedTotalSize = ({ itemCount }, { estimatedItemSize }) => {
  const numUnmeasuredItems = itemCount;//未测量的条目  { itemCount }, { estimatedItemSize }
  const totalSizeOfUnmeasuredItems = numUnmeasuredItems * estimatedItemSize;//未测量条目的总高度
  return totalSizeOfUnmeasuredItems;
}
function findNearestItem() {

}
const VariableSizeList = CreateListComponent({
  getEstimatedTotalSize, //预计内容高度为每个条目的高度乘以条目数
  getItemSize: () => 0,//条目的高度
  getItemOffset: () => 0, //获取每个条目的偏移量
  getStartIndexForOffset: (props, offset, instanceProps) => {

    return findNearestItem(props, offset, instanceProps)
  },//获取起始索引
  getStopIndexForStartIndex: () => 0,
  initInstanceProps: (props) => {
    const { estimatedItemSize } = props;//先从属性要获取预估预计的条目高度
    const instanceProps = {
      estimatedItemSize: estimatedItemSize || DEFAULT_ESTIMATED_SIZE,
      itemMetadataMap: {},//记录每个条目的信息{size:每个索引对应的条目的高度,offset:生个索引对应的条目的top值，也就是偏移量}
      lastMeasuredIndex: -1 //在渲染的过程中不停的真实测量每个条目的高度 ,测量其实就是计算每个条目真正的高度和offset值/top值
    }
    return instanceProps;
  },
})

export default VariableSizeList

// VariableSizeList 也会使用高阶组件CreateListComponent
// 因为条目高度都不一样的，所以我们需要记录或者保存每个条目的高度和offset值，方便计算读写
// index = {size, offset}