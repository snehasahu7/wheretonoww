import { useState } from 'react'
import Navbar from './Components/navbar/navbar.jsx'
import Footer from './Components/footer/Footer.jsx'
import Hero from './Components/Hero/Hero.jsx'


function App() {
 

  return (
    <>
     <div className="wrapper">
        <Navbar/>
        <Hero/>
        <Footer/>
       
     </div>
        
    </>
  )
}

export default App
