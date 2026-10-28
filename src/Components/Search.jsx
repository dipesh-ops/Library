import React, { memo, useContext, useState } from 'react'
import myContext from '../context/myContext';
import { useNavigate } from 'react-router-dom';

const Search = () => {
  const navigate = useNavigate();
  const context = useContext(myContext);
  const {getBooks} = context;

  const [input, setInput] = useState("");

  const filteredBook = getBooks.filter((b)=> b.title.toLowerCase().includes(input.toLowerCase()));
  console.log(filteredBook)
  
  return (
    <div className='flex gap-x-2 p-2 md:p-3 bg-[#fffefa] border border-[#d8d5ca] rounded-lg relative sm:w-80 md:w-full'>
        <input value={input} onChange={(e)=> setInput(e.target.value)} className='w-full outline-none pl-3 rounded-lg bg-[#f7f5ef] border border-[#d8d5ca]' type="text" placeholder='Search title, author, subject, or ISBN'/>
        <button className='bg-[#173b4d] w-40 md:w-[149px] md:font-semibold p-2 rounded-lg text-white cursor-pointer'>Search</button>

        {input.length > 0 && <div className='absolute top-18 left-0 bg-gray-200 w-full md:w-3/4 p-1 md:p-2 rounded-lg'>
          {
            filteredBook.map((b, i)=>(
              <div key={i} onClick={()=> navigate(`/view/${b.id}`)} className='cursor-pointer sm:leading-4'>
                <div className='flex gap-x-2 md:gap-x-3 bg-[#FFFEFA] rounded-lg overflow-hidden m-2 hover:bg-gray-100'>
                  <img src={b.coverImage} alt="no image" className='w-10'/>
                  <div>
                    <h2 className='font-medium md:font-semibold text-md md:text-xl'>{b.title}</h2>
                    <small className='secondaryColor'>{b.authorName}</small>
                    <p className='text-sm font-medium md:font-semibold greenColor'>{b.publicatonYear}</p>
                  </div>
                  
                </div>
              </div>
            ))
          }
        </div>}

        {input.length > 0 && filteredBook.length === 0 &&
          <div className='absolute text-gray-700 top-18 left-0 flex flex-col justify-center items-center p-2 bg-gray-200 w-full md:w-3/4 p-1 md:p-2 rounded-lg'>
          <img 
                                className="w-12 h-12 sm:w-16 sm:h-16 mb-3 sm:mb-4" 
                                src="https://cdn-icons-png.flaticon.com/128/10437/10437090.png" 
                                alt="No results" 
                            />
                            <h1>No products found for "{input}"</h1>
                            <small>Try different keywords</small>
          </div>
        }
    </div>
  )
}

export default Search