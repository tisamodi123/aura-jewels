function FullPageLoader(props) {
  return (
    props.isLoad?
    <div className="loader">
        <span></span>
        <span></span>
    </div>
    :''
  )
}

export default FullPageLoader;
