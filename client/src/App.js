import React, { useEffect } from 'react'

import './App.css'

export default function App() {
  useEffect(() => {
    const backdrop = document.querySelector('.backdrop-overlay')
    for (let i=0; i<79; i++) {
      const div = document.createElement('div')
      div.style.opacity = `${Math.random() * (0.075 - 0.025) + 0.025}`
      backdrop.appendChild(div)
    }
  }, [])

  return (<div></div>)
}