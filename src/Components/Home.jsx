import React, { useContext } from 'react'
import myContext from '../context/myContext'
import Navbar from './Navbar';
import CatalogForUser from './CatalogForUser';

const Home = () => {
  const context = useContext(myContext);
  const {name}=context
  return (
    <div className='bg-[#f7f5ef]'>
      <Navbar />
      <CatalogForUser/>
      </div>
  )
}

export default Home