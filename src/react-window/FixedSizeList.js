import CreateListComponenC from "./createListComponent";

const FixedSizeList = CreateListComponenC({
  getItemSize: ({ itemSize }) => itemSize,//每个条目的高度
  getEstimatedTotalSize: ({ itemSize, itemCount }) => itemSize * itemCount, //获取预计的总高度
  getItemOffset: ({ itemSize }, index) => itemSize * index, //获取每个条目的偏移量
  getStartIndexForOffset: ({ itemSize }, offset) => Math.floor(offset / itemSize),//获取起始索引
  getStopIndexForStartIndex: ({ height, itemSize }, startIndex) => {//获取结束索引
    const numVisibleItems = Math.ceil(height / itemSize);
    return startIndex + numVisibleItems - 1;
  },
  getOffsetForIndex: (props, index) => {
    console.log('props', props);
    const { itemSize } = props;
    return itemSize * index;
  }
})

export default FixedSizeList

