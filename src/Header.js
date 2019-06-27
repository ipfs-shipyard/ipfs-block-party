import React from 'react'
import Logo from './ipfs-logo.svg'

export default function Header ({ children }) {
  return (
    <header className='flex items-center pa3 bg-navy'>
      <a href='https://ipfs.io' title='home' className='dib'>
        <img src={Logo} style={{ height: 50 }} />
      </a>
      <div className='flex-auto'>
        {children}
      </div>
      <h1 className='ma0 tr f3 fw2 montserrat aqua'>Block party ䷿ 🎉</h1>
    </header>
  )
}
