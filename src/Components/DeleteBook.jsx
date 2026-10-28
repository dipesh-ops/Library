import React, { useContext } from 'react'
import { BsArrowLeft } from 'react-icons/bs'
import { IoBookOutline } from 'react-icons/io5';
import { PiWarningCircle } from 'react-icons/pi';
import { RiDeleteBin6Line } from 'react-icons/ri';
import myContext from '../context/myContext';
import { deleteDoc, doc } from 'firebase/firestore';
import { fireDB } from '../firebase/FirebaseConfig';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const DeleteBook = ({bookIdForDelete, setActiveTab}) => {
  const context = useContext(myContext);
  const {getBooks} = context;
  const book = getBooks?.find((b)=> b.id == bookIdForDelete);
 console.log(bookIdForDelete);

  const handleDelete = async ({setActiveTab}) =>{
       const confirmDelete = window.confirm(
      'Are you sure you want to permanently delete this book? This action cannot be undone.'
    );

    if (!confirmDelete) return;
   try {
    const bookRef = doc(fireDB, "book", bookId);
    await deleteDoc(bookRef);
    toast.success("Book deleted successfully");
    setActiveTab("catalog");
   } catch (error) {
    console.log(error);
    toast.error(`Error while deleting ${book.title} book`);
   }
  }

  
  return (
    <div className='w-full flex flex-col'>
        <div className='flex items-center gap-x-2 cursor-pointer' onClick={()=>setActiveTab("catalog")}><BsArrowLeft/> Return to book catalog</div>

      <div className='relative top-20 bg-white rounded-lg md:w-[672px] mx-auto shadow-lg'>
     <div className='p-5'>
         <RiDeleteBin6Line className='text-4xl text-[#b73c3c] bg-[#eeeae0] p-2 rounded-full mb-3' />
        <small className='text-[#b73c3c] font-semibold mb-3'>Permanent action</small>
        <h1 className='text-xl font-semibold mb-3'>Delete this book record?</h1>
        <p className='text-[#616c6c] text-sm mb-3'>This will permanently remove the title from your catalog. Borrowing history and copy data linked to this record may no longer be available.</p>

        <div className='bg-[#eeeae0] rounded-lg border border-[#d8d5ca] p-4 flex flex-col md:flex-row gap-x-4'>
          <IoBookOutline className='text-[48px] text-white p-2 bg-[#173b4d]'/>
          <div>
            <h1 className='text-[#1c2938]'>{book.title}</h1>
            <span className='text-sm text-[#616c6c]'>{book.authorName} · {book.isbn}</span>
            <div className='flex gap-x-2'>
              <small className='bg-white rounded-full px-2 font-semibold'>{book.category} </small>
              <small className='bg-white rounded-full px-2 font-semibold'>{book.shelfLocation} </small>
              <small className='bg-blue-100 rounded-full px-2 font-semibold'>{book.availableCopies} of {book.totalCopies} available</small>
            </div>
          </div>
        </div>

        <div className='flex gap-x-3 p-3'>
          <PiWarningCircle className='text-[#b73c3c] size-8'/>
          <p className='text-[#616c6c] text-sm'>Only delete records that were created in error or fully withdrawn from the collection. Consider editing the availability first for temporary changes.</p>
        </div>

     </div>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 justify-end bg-[#eeeae0] border-[#d8d5ca] p-6'>
          <button onClick={()=> setActiveTab("catalog")} className='text-[#1c2938] font-semibold shadow-sm bg-white p-2 rounded-lg cursor-pointer'>Keep the book</button>
          <button onClick={handleDelete} className='flex items-center gap-x-1 font-semibold text-white rounded-lg px-4 p-2 cursor-pointer bg-[#b73c3c]'><RiDeleteBin6Line/> Delete book permanently</button>
        </div>
      </div>

    </div>
  )
}

export default DeleteBook