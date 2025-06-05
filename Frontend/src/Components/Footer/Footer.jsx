import React from 'react'
import "./Footer.css";

const Footer = () => {
    const year = new Date().getFullYear();
  return (
    <div className="footerr">
        <div className="footer-container">
           <p>Copyrightⓒ{year}</p> 
        </div>
        
    </div>
  )
}

export default Footer;