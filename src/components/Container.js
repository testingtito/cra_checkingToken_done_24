import React from 'react';

const componentName = (props) => {
  return (
    <>
      <div className={"container py-md-5 " + (props.wide ? '' : "container--narrow ")}>
        {props.children}
      </div>
    </>
  )
}

export default componentName
