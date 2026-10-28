import { collection, deleteDoc, doc, onSnapshot, query, QuerySnapshot } from 'firebase/firestore';
import React, { useContext, useEffect, useState } from 'react'
import { toast } from 'react-toastify';
import { fireDB } from '../firebase/FirebaseConfig';
import myContext from '../context/myContext';
import { BiBook, BiPencil } from 'react-icons/bi';
import { MdDeleteOutline } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { logActivity } from '../utils/logActivity';

const AllBooks = ({getBookId, setActiveTab, setBookIdForUpdate, setBookIdForDelete, userInput}) => {
 
  const navigate = useNavigate();
  const context = useContext(myContext);
  const [bookId, setBookId] = useState('');
  const {getBooks} = context;
  console.log(getBooks);

  const handleBookId = (id) =>{
    if(!id) return;
    setBookIdForDelete(id);
    getBookId(id);
  }

  const handleBookIdForUpdate = (id) =>{
    if(!id) return;
    setActiveTab("edit-book");
    setBookIdForUpdate(id);
  }

  const deleleBook = async (id) =>{
    try {
      await deleteDoc(doc(fireDB, "book", bookId));
      await logActivity({
        type : "deleted",
        bookTitle : id.title,
        category : id.category,
        userName: JSON.parse(localStorage.getItem("users"))?.name || "Staff",
      })
      toast.success(`${id.title} deleted successfully.`);
    } catch (error) {
      console.log(error);
      toast.error("Error while deleting book");
    }
  }

  const filteredBooks = getBooks.filter(b=> b.title.toLowerCase().includes(userInput));
  return (
    <div className='mt-5 overflow-auto'>
      <table className='md:w-[1110px] shadow-lg rounded-lg'>
        <thead className=''>
          <tr className='bg-[#eeeae0] text-[#616c6c] p-3 rounded-t-lg'>
            <th className='p-3 text-left'>Title & author</th>
            <th className='p-3 text-left'>Category</th>
            <th className='p-3 text-left'>Shelf</th>
            <th className='p-3 text-left'>Availability</th>
            <th className='p-3 text-left'>Updated</th>
            <th className='p-3 text-left'></th>
          </tr>
        </thead>

        <tbody>
          {
            !filteredBooks ? getBooks.map((book, index)=>{
              return (
                <tr key={index}>
                  <td className='p-3 text-left flex items-center gap-x-1 leading-3'><BiBook className='text-3xl bg-[#173b4d] text-white rounded-md p-1'/> <span className='flex flex-col font-semibold'>{book.title} <span className='text-sm text-[#616c6c] font-light'>{book.authorName} - {book.isbn}</span></span></td>
                  <td className='p-3 text-left text-[#616c6c]'>{book.category}</td>
                  <td className='p-3 text-left text-[#616c6c]'>{book.shelfLocation}</td>
                  <td className='p-3 text-left'><span className='bg-blue-100 rounded-full'>{book.availableCopies} of {book.totalCopies} available</span></td>
                  <td className='p-3 text-left text-[#616c6c]'>{book.date}</td>
                  <td className='p-3 text-left text-xl'><span className='flex gap-x-3'><span onClick={()=>handleBookIdForUpdate(book.id)}><BiPencil className='cursor-pointer'/> </span> <span className='text-red-700' onClick={()=> handleBookId(book.id)}><MdDeleteOutline className='cursor-pointer'/></span></span></td>
                </tr>
              )
            }) : 
            filteredBooks.map((book, index)=>{
              return (
                <tr key={index}>
                  <td className='p-3 text-left flex items-center gap-x-1 leading-3'><BiBook className='text-3xl bg-[#173b4d] text-white rounded-md p-1'/> <span className='flex flex-col font-semibold'>{book.title} <span className='text-sm text-[#616c6c] font-light'>{book.authorName} - {book.isbn}</span></span></td>
                  <td className='p-3 text-left text-[#616c6c]'>{book.category}</td>
                  <td className='p-3 text-left text-[#616c6c]'>{book.shelfLocation}</td>
                  <td className='p-3 text-left'><span className='bg-blue-100 rounded-full'>{book.availableCopies} of {book.totalCopies} available</span></td>
                  <td className='p-3 text-left text-[#616c6c]'>{book.date}</td>
                  <td className='p-3 text-left text-xl'><span className='flex gap-x-3'><span onClick={()=>handleBookIdForUpdate(book.id)}><BiPencil className='cursor-pointer'/> </span> <span className='text-red-700' onClick={()=> handleBookId(book.id)}><MdDeleteOutline className='cursor-pointer'/></span></span></td>
                </tr>
              )
            })
          }
        </tbody>
      </table>
    </div>
  )
}

export default AllBooks