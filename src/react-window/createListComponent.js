import React from "react";

function createListComponent({
  getItemSize,//每个条目的高度
  getEstimatedTotalSize, //获取预计的总高度
  getItemOffset, //获取每个条目的偏移量
  getStartIndexForOffset, // 根据向上卷起的高度计算开始索引
  getStopIndexForStartIndex,//获取结束索引 
}) {
  return class extends React.Component {
    static defaultProps = {
      overscanCount: 2
    }
    state = { scrollOffset: 0 }
    render() {
      const { width, height, itemCount, children: ComponentType } = this.props;
      const containerStyle = { position: 'relative', width, height, overflow: 'auto', willChange: 'transform' }
      const contentStyle = { width: '100%', height: getEstimatedTotalSize(this.props) };
      const items = [];
      if (itemCount > 0) {
        const [startIndex, stopIndex] = this.getRangeToRender()
        for (let index = startIndex; index <= stopIndex; index++) {
          items.push(
            <ComponentType key={index} index={index} style={this._getItemStyle(index)} />
          );
        }
      }
      return (
        <div style={containerStyle} onScroll={this.onScroll}>
          <div style={contentStyle}>
            {items}
          </div>
        </div>
      )
    }
    onScroll = (event) => {
      const { scrollTop } = event.currentTarget;
      this.setState({ scrollOffset: scrollTop });
    }
    getRangeToRender = () => {
      const { scrollOffset } = this.state;
      const { itemCount, overscanCount } = this.props;
      const startIndex = getStartIndexForOffset(this.props, scrollOffset);
      const stopIndex = getStopIndexForStartIndex(this.props, startIndex);
      return [
        Math.max(0, startIndex - overscanCount),
        Math.min(itemCount - 1, stopIndex + overscanCount),
        startIndex, stopIndex];

    }
    _getItemStyle = (index) => {
      const style = {
        position: 'absolute',
        width: '100%',
        height: getItemSize(this.props),
        top: getItemOffset(this.props, index)
      };
      return style;
    }
  }
}

export default createListComponent;