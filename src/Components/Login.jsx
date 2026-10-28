import { signInWithEmailAndPassword } from 'firebase/auth';
import React, { useContext, useState } from 'react'
import { toast } from 'react-toastify';
import { auth, fireDB } from '../firebase/FirebaseConfig';
import { collection, onSnapshot, query, QuerySnapshot, where } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import myContext from '../context/myContext';

const Login = () => {
  const context = useContext(myContext);
  const {loading, setLoading} = context;
  const navigate = useNavigate();
  const [userDetail, setUserDetail] = useState({
    email : "",
    password : ""
  });
   
  const loginUser = async () =>{
    if(!userDetail.email || !userDetail.password){
      return toast.info("Please fill all the fields");
    }

    setLoading(true);
    try {
      const users = await signInWithEmailAndPassword(auth, userDetail.email, userDetail.password);

      const q = query(
        collection(fireDB, "user"),
        where('uid', '==', users?.user?.uid)
      );

      const data = await onSnapshot(q, (QuerySnapshot)=>{
        let user;
        QuerySnapshot.forEach((doc)=> user = doc.data());
        localStorage.setItem("users", JSON.stringify(user));
        toast.success("User logged In Successfully");
        navigate("/");
        setLoading(false);
      })
      return ()=> data;
    } catch (error) {
      toast.error("Error while logging in");
      console.log(error);
      setLoading(false);
    }
  }
  return (
    <div className='w-full h-screen flex justify-center items-center'>
        <div className='flex flex-col w-[600px] bg-emerald-50 shadow-2xl border rounded-lg p-10'>
            <h2 className='font-bold text-3xl text-emerald-600 mb-8 text-center'>Login</h2>

            <div className='flex flex-col gap-y-2'>
                <input onChange={(e)=> setUserDetail({...userDetail, email : e.target.value})} value={userDetail.email} className='p-3 border border-emerald-500 rounded-lg outline-0' type="text" placeholder='Email'/>
                <input value={userDetail.password} onChange={(e)=> setUserDetail({...userDetail, password : e.target.value})} className='p-3 border border-emerald-500 rounded-lg outline-0' type="password" placeholder='Password'/>
            </div>
            {!loading ? ( <button onClick={loginUser} className='font-bold text-white p-3 mt-6 rounded-lg cursor-pointer bg-emerald-600 hover:bg-emerald-700 duration-200 mb-8'>Login</button>) : (<button className='w-full flex items-center justify-center gap-x-2 font-semibold text-white p-3 mt-6 rounded-lg cursor-pointer bg-emerald-600 hover:bg-emerald-700 duration-200 mb-8'><div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>Loading...</button>)}

            <h1 className='text-gray-500 text-center'>Don't have account ? <span onClick={()=> navigate("/signup")} className='text-emerald-500 cursor-pointer'>Signup</span></h1>
        </div>
    </div>
  )
}

export default Login