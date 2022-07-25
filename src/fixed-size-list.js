import { FixedSizeList } from "./react-window";
import './fixed-size-list.css'

const Row = ({ index, style }) => {
  return <div className={index % 2 ? 'ListItmeOdd' : 'ListItemEven'} style={style} >
    Row {index}
  </div>
}
function App() {

  return (
    <FixedSizeList
      className="List"
      height={200}
      width={200}
      itemSize={50}
      itemCount={1000}
    >
      {Row}
    </FixedSizeList>
  )
}
export default App;