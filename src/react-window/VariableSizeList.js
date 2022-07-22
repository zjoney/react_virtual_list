import CreateListComponent from "./createListComponent";


const DEFAULT_ESTIMATED_SIZE = 50; //默认情况下
const getEstimatedTotalSize = ({ itemCount }, { estimatedItemSize, itemMetadataMap, lastMeasuredIndex }) => {

  // start
  let totalSizeOfMeasuredItems = 0;//测量条目的总高度
  if (lastMeasuredIndex >= 0) {
    const itemMetadata = itemMetadataMap[lastMeasuredIndex];
    totalSizeOfMeasuredItems = itemMetadata.offset + itemMetadata.size;
  }
  // end
  const numUnMeasuredItems = itemCount - lastMeasuredIndex - 1;//未测试过的条目的数量;
  const totalSizeOfUnmeasuredItems = numUnMeasuredItems * estimatedItemSize;//未测试过的条目的总高度
  //总高度=测量过的高度+未测试过的高度
  return totalSizeOfMeasuredItems + totalSizeOfUnmeasuredItems;
}
// 
function findNearestItem(props, instanceProps, offset) {
  // start
  const { lastMeasuredIndex, itemMetadataMap } = instanceProps;//后面如果lastMeasuredIndex如果有值的话
  // 源码里使用的是二分查找法时间复杂度从n降低为logN
  return findNearestItemBinarySearch(props, instanceProps, lastMeasuredIndex, 0, offset);

  // end
  // const { lastMeasuredIndex, itemMetadataMap } = instanceProps;//后面如果lastMeasuredIndex如果有值的话

  // for (let index = 0; index <= lastMeasuredIndex; index++) {
  //   const currentOffset = getItemMetadata(props, index, instanceProps).offset;
  //   // currentOffset=当前offset offset=当前向上卷起的高度
  //   if (currentOffset >= offset) {
  //     return index;
  //   }
  // }
  // return 0;
}
// start
function findNearestItemBinarySearch(props, instanceProps, high, low, offset) {
  // low=0 hight=1000 middle = 500
  while (low <= high) {
    const middle = low + Math.floor(((high - low) / 2));
    const currentOffset = getItemMetadata(props, middle, instanceProps).offset;
    if (currentOffset === offset) {
      return middle;
    } else if (currentOffset < offset) {
      low = middle + 1;
    } else if (currentOffset > offset) {
      high = middle - 1;
    }
  }
  if (low > 0) {
    return low - 1;
  } else {
    return 0;
  }
}
// end
// 获取每个条目对应的元数据 index=>{size, offset}
function getItemMetadata(props, index, instanceProps) {
  const { itemSize } = props;
  const { itemMetadataMap, lastMeasuredIndex } = instanceProps;
  // 当前获取的条目比上一次测量过的还要大，说明此条目尚未测试过，还不知道真是的offset size
  if (index > lastMeasuredIndex) {
    let offset = 0;//先计算上一个测试过的条目的下一个offset
    if (lastMeasuredIndex >= 0) {
      const itemMetadata = itemMetadataMap[lastMeasuredIndex];
      offset = itemMetadata.offset + itemMetadata.size;
    }
    //计算从上一个条目到本次索引的offset和size
    for (let i = lastMeasuredIndex + 1; i <= index; i++) {
      let size = itemSize(i);
      itemMetadataMap[i] = { size, offset };// 此条目对应的高度size和刚才计算的offset值放在数据中保存
      offset += size;//下一个条目offset值=自己的offset值+自己高度size
    }
    instanceProps.lastMeasuredIndex = index;
  }
  return itemMetadataMap[index];
}
const VariableSizeList = CreateListComponent({
  getEstimatedTotalSize, //预计内容高度为每个条目的高度乘以条目数
  getStartIndexForOffset: (props, offset, instanceProps) => findNearestItem(props, instanceProps, offset),//获取起始索引
  getStopIndexForStartIndex: (props, startIndex,
    scrollOffset,
    instanceProps) => {
    const { itemCount, height } = props;
    // 获取开始索引对应的元数据
    const itemMetadata = getItemMetadata(props, startIndex, instanceProps);
    // 最大offset值 起始条目offset+容器高度
    const maxOffset = itemMetadata.offset + height;
    let offset = itemMetadata.offset + itemMetadata.size;
    let stopIndex = startIndex;
    while (stopIndex < itemCount - 1 && offset < maxOffset) {
      stopIndex++;
      offset += getItemMetadata(props, stopIndex, instanceProps).size;// 每次索引加1，offset加上每个条目的高度
    }
    return stopIndex;
  },
  getItemSize: (props, index, instanceProps) => getItemMetadata(props, index, instanceProps).size,//条目的高度
  getItemOffset: (props, index, instanceProps) => getItemMetadata(props, index, instanceProps).offset,//获取每个条目的偏移量
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