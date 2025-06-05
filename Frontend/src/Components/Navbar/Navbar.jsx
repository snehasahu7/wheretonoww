import React from 'react'
import { GiKangaroo } from "react-icons/gi";
import './Navbar.css';

const Navbar = () => {
  return (
    <div className='navbar'>
      <div className="navbar-container">

        <p className="title">WhereToNow</p>
        <div className="icon"><GiKangaroo/></div>
        {/*<button onClick={()=>setlightmode(!lightmode)}>{lightmode? <MdOutlineNightlight/> : <CiLight/>}</button>*/}
      </div>
    </div>
  )
}

export default Navbar;