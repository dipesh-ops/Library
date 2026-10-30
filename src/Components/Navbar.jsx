import { signOut } from 'firebase/auth';
import React, { useState } from 'react'
import { IoBookSharp } from 'react-icons/io5'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify';
import { auth } from '../firebase/FirebaseConfig';
import { RxHamburgerMenu } from "react-icons/rx";
  import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter, 
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button.jsx"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.jsx"

const Navbar = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("users"));
    const [open, setOpen] = useState(false);
    const logout = async () =>{
      try {
        signOut(auth).then(()=>{
          toast.success("Logged out successfully");
          navigate("/");
          localStorage.clear();
        }).catch(()=>{
          toast.error("logging out error");
        })
      } catch (error) {
        console.log(error);
        toast.error("Error while logging out");
      }
    }
  return (
    <div className='p-8 md:px-24 py-[16px] w-full bg-[#fffefa] flex justify-between shadow-lg'>
        <div onClick={()=> navigate("/")} className="left flex items-center text-2xl gap-x-2 font-bold cursor-pointer"><IoBookSharp /> Library</div>
        
        <div className='flex gap-x-5 cursor-pointer font-semibold text-lg items-center '>
            <ul className='md:flex gap-x-5 hidden'>
            <li onClick={()=> navigate("/")}>Catalog</li>
            {user?.role === "user" && <li onClick={()=> navigate("/borrowing")}>My borrowing</li>}
            {user?.role === "admin" && <li onClick={()=> navigate("/admin")}>Admin Dashboard</li>}
            <button className='cursor-not-allowed' disabled>Events</button>
        </ul>
        {!user ? <button onClick={()=> navigate("/login")} className='bg-black text-white px-4 rounded-lg hover:bg-black/70 cursor-pointer'>Login</button> : <Dialog className="cursor-pointer" open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild className="md:flex hidden rounded-full bg-black text-white w-13 h-13 justify-center items-center">
              {user?.name.slice(0,1)}
          </DialogTrigger>
          <DialogContent className='sm:max-w-[425px]'>
            <DialogHeader>
              <DialogTitle>Confirm Logout</DialogTitle>
              <DialogDescription>
                Are you sure you want to log out? You'll need to sign in again to
                access your borrowing history.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className='gap-2 sm:gap-0'>
              <button
                onClick={() => setOpen(false)}
                className='px-4 py-2 mr-2 rounded-lg border border-gray-300 hover:bg-gray-100 cursor-pointer'
              >
                Cancel
              </button>
              <button
                onClick={logout}
                className='bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 cursor-pointer'
              >
                Yes, Logout
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>}



{/* For small devices */}
       <div className="flex md:hidden">
         <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline"><RxHamburgerMenu /></Button>} />
      <DropdownMenuContent className="w-80" align="start">
        <DropdownMenuGroup>
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuItem onClick={()=> navigate("/")}>
            Catalog
          </DropdownMenuItem>
         {user?.role === 'user' && <DropdownMenuItem onClick={()=> navigate("/borrowing")}>
            My Borrowings
          </DropdownMenuItem>}

          {user?.role === 'admin' && <DropdownMenuItem onClick={()=> navigate("/admin")}>
            Admin Dashboard
          </DropdownMenuItem>}
          <DropdownMenuItem className='cursor-not-allowed'>
            Events
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            {user ? <Button className="!text-white" onClick={logout}>Log out</Button> : <Button className="!text-white" onClick={()=> navigate("/login")}>Log in</Button>}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
       </div>
        </div>
      
    </div>
  )
}

export default Navbar