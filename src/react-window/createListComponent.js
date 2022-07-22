import React from "react";

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
      let io = new IntersectionObserver((entries) => {
        entries.forEach(this.onScroll);
      }, { root: this.outerRef.current })
      io.observe(dom);
    }
    render() {
      const { width, height, itemCount, children: Row } = this.props;
      const containerStyle = { position: 'relative', width, height, overflow: 'auto', willChange: 'transform' }
      const contentStyle = { height: getEstimatedTotalSize(this.props, this.instanceProps), width: '100%' };
      const items = [];
      if (itemCount > 0) {
        const [startIndex, stopIndex, originStartIndex, originStopIndex] = this.getRangeToRender()
        for (let index = startIndex; index <= stopIndex; index++) {
          if (index === originStartIndex) {
            items.push(
              <Row key={index} index={index} style={this._getItemStyle(index)} forwardRef={this.firstRef} />
            );
            continue;
          } else if (index === originStopIndex) {
            items.push(
              <Row key={index} index={index} style={this._getItemStyle(index)} forwardRef={this.lastRef} />
            );
            continue;
          } else {
            items.push(
              <Row key={index} index={index} style={this._getItemStyle(index)} />
            );
          }

        }
      }
      return (
        <div style={containerStyle} ref={this.outerRef}>
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