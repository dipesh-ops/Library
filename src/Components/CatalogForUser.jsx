import React, { useContext, useState } from 'react'
import Search from './Search'
import myContext from '../context/myContext'
import { CiCircleCheck } from 'react-icons/ci';
import { useNavigate } from 'react-router-dom';

const CatalogForUser = () => {
  const context = useContext(myContext);
  const [cate, setCate] = useState("all");
  const [page, setPage] = useState(1);
  const {getBooks, loading} = context;
  const navigate = useNavigate();

  const available = getBooks.filter(b=> b.availableCopies > 0);

  const itemsPerPage = 2;
  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const currentList = cate === "available" ? available : getBooks;
  const totalPages = Math.ceil(currentList.length / itemsPerPage);
  
  const selectedPageHandler = (selectedPage) =>{
    if(selectedPage >= 1 && selectedPage <= totalPages && selectedPage !== page)
    setPage(selectedPage)
  }
  return (
    <div className='px-8 md:px-18 lg:px-24 py-[40px]'>
        <div className='w-[320px] md:w-[500px] lg:w-[768px] flex flex-col gap-y-2 md:gap-y-4'>
            <h3 className='text-[#32735a] font-semibold'>THE NORTHSTAR COLLECTION</h3>
            <h2 className='text-[#1c2938] text-2xl md:text-4xl font-bold'>Find a story worth keeping close.</h2>
            <p className='text-[#616c6c] text-md md:text-lg'>Search more than 18,000 books, audiobooks, and digital titles from your library.</p>
        </div>
        <div className='mt-10'>
          <Search/>
        </div>

        <div className='mt-10'>
          <div className='flex flex-col md:flex-row md:justify-between'>
            <div className="left">
              <h2 className='text-[#1c2938] text-[20px] font-semibold'>Featured this month</h2>
              <p className='text-sm text-[#616c6c]'>Fresh staff picks, new arrivals, and beloved classics.</p>
            </div>
            <div className="right text-sm mt-2 md:mt-0">
              <button onClick={()=> setCate("all")} className={`text-[#616c6c] ${cate == "all" ? 'bg-blue-100' : 'bg-white'} p-2 mr-2 rounded-lg`}>All titles</button>
              <button onClick={()=> setCate("available")} className={`text-[#616c6c]  ${cate == "available" ? 'bg-blue-100' : 'bg-white'} p-2 mr-2 rounded-lg`}>Available now</button>
            </div>
          </div>

          {loading ? <div><div className='mt-10 w-14 h-14 mx-auto border-3 border-b animate-spin border-[#32735a] rounded-full'></div><p className='text-center font-semibold italic mt-1'>Loading...</p></div> : <div className='mt-5 grid grid-cols-1 md:grid-cols-4'>
            {currentList &&
               currentList.slice(start, end).map((book, index)=>(
                <div key={index} className=' md:h-[430px] rounded-lg overflow-hidden shadow-lg m-3'>
                <div className="top bg-[#dce9e2] flex justify-center p-4 ">
                  <div className='w-[240px] h-[176px] flex justify-center bg-[#173b4d] rounded-lg'>
                    <img src={book.coverImage} className=''/>
                  </div>
                </div>

                <div className="bottom p-4">
                  <h3 className='text-[#32735a] font-semibold'>{book.category}</h3>
                  <h1 className='text-[18px] text-[#1c2938] font-bold'>{book.title}</h1>
                  <span className='text-sm text-[#616c6c]'>{book.authorName}</span>

                  <div className='flex justify-between mt-5'>
                    <span className='flex items-center gap-x-1 text-[#32735a] font-medium'>Available <CiCircleCheck/></span>
                    <button onClick={()=> navigate(`/view/${book.id}`)} className='font-semibold bg-[#173b4d] text-[#ffffff] p-2 rounded-lg cursor-pointer'>View</button>
                  </div>
                </div>
            </div>
              ))
            }
          </div>}
          {
          getBooks.length > 0 && (
            <div className='flex gap-x-1 justify-center items-center'>
              <span onClick={()=> selectedPageHandler(page-1)} className='cursor-pointer'>⏴</span>
              {[...Array(totalPages)].map((_, i) => (
                <div key={i} onClick={()=>selectedPageHandler(i+1)} className='border-1 border-gray-400 p-2 cursor-pointer'>{i + 1}</div>
              ))}
              <span onClick={()=> selectedPageHandler(page+1)} className='cursor-pointer'>▶</span>
            </div>
          )
        }
        </div>
    </div>
  )
}

export default CatalogForUser