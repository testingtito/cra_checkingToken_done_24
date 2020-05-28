import React from 'react'

const FlashMessages = ({ flashMessages }) => {
  return (
    <div className="floating-alerts">
      {flashMessages.map((msg, index) => {
        return (
          <div key={index} className="alert alert-success text-center floating-alert shadow-sm">
            {msg}
          </div>
        )
      })}
    </div>
  )
}

export default FlashMessages
