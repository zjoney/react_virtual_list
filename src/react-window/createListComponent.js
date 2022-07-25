import React from "react";

class ListItem extends React.Component {
  constructor(props) {
    super(props);
    this.domRef = React.createRef();
    this.resizeObserver = null; //大小观察器
  }
  componentDidMount() {
    if (this.domRef.current) {
      const domNode = this.domRef.current.firstChild;
      const { index, onSizeChange } = this.props;
      this.resizeObserver = new ResizeObserver(() => {
        onSizeChange(index, domNode);
      });
      this.resizeObserver.observe(domNode)
    }
  }
  render() {
    const { index, style, ComponentType } = this.props;
    return (
      <div style={style} ref={this.domRef}>
        <ComponentType index={index} />
      </div>
    )

  }
}

function createListComponent({
  getEstimatedTotalSize, //获取预计的总高度
  getItemSize,//每个条目的高度
  getItemOffset, //获取每个条目的偏移量
  getStartIndexForOffset, // 根据向上卷起的高度计算开始索引
  getStopIndexForStartIndex,//获取结束索引 
  initInstanceProps,
}) {
  return class extends React.Component {
    constructor(props) {
      super(props)
      this.instanceProps = initInstanceProps && initInstanceProps(this.props)
      this.state = { scrollOffset: 0 }
      this.itemStyleCache = new Map();
      this.outerRef = React.createRef()
      this.oldFirstRef = React.createRef()
      this.oldLastRef = React.createRef()
      this.firstRef = React.createRef()
      this.lastRef = React.createRef()
    }
    // 等同于上面constructor内容
    // instanceProps = initInstanceProps && initInstanceProps(this.props)
    static defaultProps = {
      overscanCount: 2
    }
    componentDidMount() {
      this.observe(this.oldFirstRef.current = this.firstRef.current)
      this.observe(this.oldLastRef.current = this.lastRef.current);
    }
    componentDidUpdate() {
      if (this.oldFirstRef.current !== this.firstRef.current) {
        this.oldFirstRef.current = this.firstRef.current;
        this.observe(this.firstRef.current);
      }
      if (this.oldLastRef.current !== this.lastRef.current) {
        this.oldLastRef.current = this.lastRef.current;
        this.observe(this.lastRef.current);
      }
    }
    observe = (dom) => {
      let io = new IntersectionObserver(this.onScroll, { root: this.outerRef.current })
      // let io = new IntersectionObserver((entries) => {
      //   entries.forEach(this.onScroll);
      // }, { root: this.outerRef.current })
      io.observe(dom);
    }
    onSizeChange = (index, domNode) => {
      const height = domNode.offsetHeight;
      const { itemMetadataMap, lastMeasuredIndex } = this.instanceProps;
      const itemMetadata = itemMetadataMap[index];
      itemMetadata.size = height;
      let offset = 0;
      for (let i = 0; i < lastMeasuredIndex; i++) {
        const itemMetadata = itemMetadataMap[i];
        itemMetadata.offset = offset;
        offset = offset + itemMetadata.size;
      }
      this.itemStyleCache.clear();
      this.forceUpdate();
    }
    render() {
      const { width, height, itemCount, children: ComponentType, isDynamic } = this.props;
      const containerStyle = { position: 'relative', width, height, overflow: 'auto', willChange: 'transform' }
      const contentStyle = { height: getEstimatedTotalSize(this.props, this.instanceProps), width: '100%' };
      const items = [];
      if (itemCount > 0) {
        const [startIndex, stopIndex, originStartIndex, originStopIndex] = this.getRangeToRender()
        for (let index = startIndex; index <= stopIndex; index++) {
          if (isDynamic) {// 如果需要动态
            // start
            let style = this._getItemStyle(index);
            if (index === originStartIndex) {
              items.push(<span key={'span' + index} ref={this.firstRef} style={{ ...style, width: 0, height: 0 }}></span>)
              items.push(
                <ListItem key={index} index={index} style={style}
                  ComponentType={ComponentType}
                  onSizeChange={this.onSizeChange}
                />
              );
            } else if (index === originStopIndex) {
              items.push(<span key={'span' + index} ref={this.lastRef} style={{ ...style, width: 0, height: 0 }}></span>)
              items.push(
                <ListItem key={index} index={index} style={style}
                  ComponentType={ComponentType} onSizeChange={this.onSizeChange} />
              );
            } else {
              items.push(
                <ListItem key={index} index={index} style={style}
                  ComponentType={ComponentType} onSizeChange={this.onSizeChange} />
              );
            }
            // end
          } else {
            if (index === originStartIndex) {
              items.push(
                <ComponentType key={index} index={index} style={this._getItemStyle(index)} forwardRef={this.firstRef} />
              );
              continue;
            } else if (index === originStopIndex) {
              items.push(
                <ComponentType key={index} index={index} style={this._getItemStyle(index)} forwardRef={this.lastRef} />
              );
              continue;
            } else {
              items.push(
                <ComponentType key={index} index={index} style={this._getItemStyle(index)} />
              );
            }
          }
        }
      }
      return (
        <div style={containerStyle} ref={this.outerRef} >
          <div style={contentStyle}>
            {items}
          </div>
        </div>
      )
    }
    onScroll = () => {
      const { scrollTop } = this.outerRef.current;
      this.setState({ scrollOffset: scrollTop });
    }
    getRangeToRender = () => {
      const { scrollOffset } = this.state;
      const { itemCount, overscanCount } = this.props;
      const startIndex = getStartIndexForOffset(this.props, scrollOffset, this.instanceProps);
      const stopIndex = getStopIndexForStartIndex(this.props, startIndex, scrollOffset, this.instanceProps);
      return [
        Math.max(0, startIndex - overscanCount),
        Math.min(itemCount - 1, stopIndex + overscanCount),
        startIndex, stopIndex];

    }
    _getItemStyle = (index) => {
      let style;
      if (this.itemStyleCache.has(index)) {
        style = this.itemStyleCache.get(index);
      } else {
        style = {
          position: 'absolute',
          width: '100%',
          height: getItemSize(this.props, index, this.instanceProps),
          top: getItemOffset(this.props, index, this.instanceProps)
        };
        this.itemStyleCache.set(index, style);
      }
      return style;
    }
  }
}

export default createListComponent;