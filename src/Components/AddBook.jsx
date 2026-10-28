import React, { useContext, useRef, useState } from 'react'
import { BiLeftArrowAlt } from 'react-icons/bi'
import myContext from '../context/myContext';
import { IoImageOutline } from 'react-icons/io5';
import { GiCrossMark } from 'react-icons/gi';
import { toast } from 'react-toastify';
import { addDoc, collection } from 'firebase/firestore';
import { fireDB } from '../firebase/FirebaseConfig';
import { logActivity } from '../utils/logActivity';

const bookCategories = [
  { id: "FIC", name: "Fiction", subcategories: ["Literary", "Historical", "Sci-Fi", "Fantasy", "Mystery", "Romance", "Horror"] },
  { id: "NF", name: "Non-Fiction", subcategories: ["Biography", "History", "Science", "Philosophy", "Psychology", "Self-Help", "Business"] },
  { id: "SCI", name: "Science", subcategories: ["Physics", "Chemistry", "Biology", "Astronomy", "Earth Science"] },
  { id: "CS", name: "Computer Science", subcategories: ["Programming", "Web Dev", "Data Science", "AI", "Networking"] },
  { id: "CHI", name: "Children's", subcategories: ["Picture Books", "Early Readers", "Middle Grade", "Young Adult"] },
  { id: "REF", name: "Reference", subcategories: ["Encyclopedias", "Dictionaries", "Atlases", "Almanacs"] },
  { id: "ART", name: "Art & Culture", subcategories: ["Visual Arts", "Performing Arts", "Architecture", "Photography"] },
  { id: "REL", name: "Spirituality & Religion", subcategories: ["Religious Texts", "Theology", "Spirituality", "Mythology"] },
  { id: "TEC", name: "Technology", subcategories: ["Cybersecurity", "Mobile Dev", "Game Dev", "Robotics"] },
  { id: "SPO", name: "Sports & Recreation", subcategories: ["Sports", "Fitness", "Outdoor", "Games"] },
  { id: "MED", name: "Medicine", subcategories: ["Medical Textbooks", "Health", "Nursing", "Pharmacology"] },
  { id: "LAW", name: "Law", subcategories: ["Constitutional", "Criminal", "Corporate", "International"] }
];

const AddBook = ({ setActiveTab }) => {
  const context = useContext(myContext);
  const { setLoading } = context;
  const fileInputRef = useRef(null);
  const [base64, setBase64] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const user = JSON.parse(localStorage.getItem("users"));

  const [userInput, setUserInput] = useState({
    title: "",
    authorName: "",
    isbn: "",
    publicationYear: "",
    publisherName: "",
    description: "",
    category: "",
    shelfLocation: "",
    totalCopies: "",
    availableCopies: "",
    userId: user?.uid,
    createdAt: new Date(),
    date: new Date().toLocaleDateString(),
    time: new Date().toLocaleTimeString()
  })

  const addBookToDB = async () => {
    if (!userInput.title || !userInput.authorName || !userInput.category || !userInput.totalCopies || !userInput.shelfLocation || !base64) {
      return toast.info("Please fill required fields");
    }
    setLoading(true);
    try {
      const bookReference = collection(fireDB, "book");
      await addDoc(bookReference, { ...userInput, coverImage: base64 })

      await logActivity({
        type: "added",
        bookTitle: userInput.title,
        userName: user?.name || "Staff",
        category: userInput.category
      })

      toast.success("Added Book Successfully");
      setLoading(false);
    } catch (error) {
      console.log(error);
      toast.error("Error while adding book to database");
      setLoading(false);
    }
  }

  const handleCategoryChange = (e) => {
    const selectedCategory = e.target.value;
    const shelf = bookCategories.filter((cat) => cat.name === selectedCategory);
    const shelfLocation = shelf ? shelf[0].id : ""
    setUserInput({ ...userInput, category: selectedCategory, shelfLocation })
  }

  const processFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setBase64(reader.result);
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => processFile(e.target.files[0]);

  const handleDragEnter = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); }
  const handleDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); }
  const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); }
  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) processFile(files[0]);
  }

  const inputClass = "mt-1 w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/20"
  const labelClass = "text-sm font-semibold text-gray-700"

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Back */}
      <button
        onClick={() => setActiveTab("catalog")}
        className="flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-brand"
      >
        <BiLeftArrowAlt className="text-xl" /> Back to Catalog
      </button>

      {/* Header */}
      <div className="mt-4">
        <span className="text-xs font-semibold uppercase tracking-wide text-brand">Catalog Record</span>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Add New Book</h1>
        <p className="mt-1 text-sm text-gray-500">
          Create a complete, shelf-ready record for your collection.
        </p>
      </div>

      {/* Layout: stacks on mobile, side-by-side on lg */}
      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_340px]">
        {/* Left column */}
        <div className="space-y-5">
          {/* Book Details */}
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
            <h2 className="text-lg font-semibold text-gray-900">Book Details</h2>
            <p className="text-sm text-gray-500">Core bibliographic information for discovery.</p>

            {/* Title */}
            <div className="mt-4">
              <label className={labelClass}>Title <span className="text-red-600">*</span></label>
              <input
                value={userInput.title}
                onChange={(e) => setUserInput({ ...userInput, title: e.target.value })}
                className={inputClass}
                type="text"
                placeholder="e.g., The Heaven & Grocery Store"
              />
            </div>

            {/* Author + ISBN */}
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Author <span className="text-red-600">*</span></label>
                <input
                  value={userInput.authorName}
                  onChange={(e) => setUserInput({ ...userInput, authorName: e.target.value })}
                  className={inputClass}
                  type="text"
                  placeholder="First and last name"
                />
              </div>
              <div>
                <label className={labelClass}>ISBN</label>
                <input
                  value={userInput.isbn}
                  onChange={(e) => setUserInput({ ...userInput, isbn: e.target.value })}
                  className={inputClass}
                  type="text"
                  placeholder="971-0-000-000000-0"
                />
              </div>
            </div>

            {/* Year + Publisher */}
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Publication year</label>
                <input
                  value={userInput.publicationYear}
                  onChange={(e) => setUserInput({ ...userInput, publicationYear: e.target.value })}
                  className={inputClass}
                  type="text"
                  placeholder="2024"
                />
              </div>
              <div>
                <label className={labelClass}>Publisher</label>
                <input
                  value={userInput.publisherName}
                  onChange={(e) => setUserInput({ ...userInput, publisherName: e.target.value })}
                  className={inputClass}
                  type="text"
                  placeholder="Publisher name"
                />
              </div>
            </div>

            {/* Description */}
            <div className="mt-3">
              <label className={labelClass}>Description</label>
              <textarea
                value={userInput.description}
                onChange={(e) => setUserInput({ ...userInput, description: e.target.value })}
                rows={4}
                className={inputClass}
                placeholder="Brief description for catalog search and staff reference"
              />
            </div>
          </div>

          {/* Collection & availability */}
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
            <h2 className="text-lg font-semibold text-gray-900">Collection & availability</h2>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Category <span className="text-red-600">*</span></label>
                <select
                  value={userInput.category}
                  onChange={handleCategoryChange}
                  className={inputClass}
                >
                  <option value="" disabled>Select category</option>
                  {bookCategories.map((book, index) => (
                    <option key={index}>{book.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Shelf Location <span className="text-red-600">*</span></label>
                <input
                  value={userInput.shelfLocation}
                  onChange={handleCategoryChange}
                  className={inputClass}
                  type="text"
                  placeholder="e.g., FIC MCB"
                />
              </div>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Total copies <span className="text-red-600">*</span></label>
                <input
                  value={userInput.totalCopies}
                  onChange={(e) => setUserInput({ ...userInput, totalCopies: e.target.value })}
                  className={inputClass}
                  type="text"
                  placeholder="0"
                />
              </div>
              <div>
                <label className={labelClass}>Available copies</label>
                <input
                  value={userInput.availableCopies}
                  onChange={(e) => setUserInput({ ...userInput, availableCopies: e.target.value })}
                  className={inputClass}
                  type="text"
                  placeholder="0"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right column: cover + save */}
        <div className="space-y-5">
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
            <h2 className="text-lg font-semibold text-gray-900">Cover image</h2>

            <div
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className={`mt-3 rounded-xl border-2 border-dashed p-4 transition-colors ${
                isDragging ? "border-brand bg-brand-light" : "border-gray-300 bg-gray-50"
              }`}
            >
              {!base64 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-6 text-center">
                  <IoImageOutline className="text-4xl text-gray-400" />
                  <h2 className="font-semibold text-gray-800">Drop a cover here</h2>
                  <span className="text-xs text-gray-500">JPG or PNG up to 5MB</span>
                  <button
                    onClick={() => fileInputRef.current.click()}
                    className="mt-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-brand hover:text-brand"
                  >
                    Choose file
                  </button>
                  <input
                    ref={fileInputRef}
                    accept="image/jpeg,image/png,image/*"
                    onChange={handleFileChange}
                    type="file"
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="relative">
                  <button
                    onClick={() => setBase64("")}
                    className="absolute -right-2 -top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-red-600 text-white shadow-md transition-colors hover:bg-red-700"
                    aria-label="Remove image"
                  >
                    <GiCrossMark className="text-sm" />
                  </button>
                  <img src={base64} alt="Cover preview" className="w-full rounded-lg object-cover" />
                </div>
              )}
            </div>
          </div>

          {/* Ready to save */}
          <div className="rounded-xl bg-[#173b4d] p-4 text-white shadow-sm sm:p-5">
            <h2 className="font-semibold">Ready to save?</h2>
            <p className="mt-1 text-sm text-white/80">Your book will be saved to library records.</p>
            <div className="mt-4 flex flex-col gap-2">
              <button
                onClick={addBookToDB}
                className="w-full rounded-lg bg-white py-2.5 text-sm font-semibold text-[#1c2938] transition-colors hover:bg-gray-100"
              >
                Save book record
              </button>
              <button
                onClick={() => setActiveTab("catalog")}
                className="w-full rounded-lg border border-white/30 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddBook