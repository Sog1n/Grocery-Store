import React, { useEffect, useState } from 'react'
import UploadSubCategoryModel from '../components/UploadSubCategoryModel'
import AxiosToastError from '../utils/AxiosToastError'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import DisplayTable from '../components/DisplayTable'
import { createColumnHelper } from '@tanstack/react-table'
import ViewImage from '../components/ViewImage'
import { LuPencil } from "react-icons/lu";
import { MdDelete  } from "react-icons/md";
import { HiPencil } from "react-icons/hi";
import EditSubCategory from '../components/EditSubCategory'
import CofirmBox from '../components/CofirmBox'
import toast from 'react-hot-toast'

const SubCategoryPage = () => {
  const [openAddSubCategory,setOpenAddSubCategory] = useState(false)
  const [data,setData] = useState([])
  const [categories,setCategories] = useState([]) // Thêm state này
  const [loading,setLoading] = useState(false)
  const columnHelper = createColumnHelper()
  const [ImageURL,setImageURL] = useState("")
  const [openEdit,setOpenEdit] = useState(false)
  const [editData,setEditData] = useState({
    _id : ""
  })
  const [deleteSubCategory,setDeleteSubCategory] = useState({
      _id : ""
  })
  const [openDeleteConfirmBox,setOpenDeleteConfirmBox] = useState(false)

  // Thêm hàm fetch categories
  const fetchCategory = async()=>{
    try {
        const response = await Axios({
          ...SummaryApi.getCategory
        })
        const { data : responseData } = response

        if(responseData.success){
          setCategories(responseData.data)
        }
    } catch (error) {
       AxiosToastError(error)
    }
  }

  const fetchSubCategory = async()=>{
    try {
        setLoading(true)
        const response = await Axios({
          ...SummaryApi.getSubCategory
        })
        const { data : responseData } = response

        if(responseData.success){
          setData(responseData.data)
        }
    } catch (error) {
       AxiosToastError(error)
    } finally{
      setLoading(false)
    }
  }

  useEffect(()=>{
    fetchCategory() // Gọi thêm hàm này
    fetchSubCategory()
  },[])

  const column = [
    columnHelper.accessor('name',{
      header : "Name"
    }),
    columnHelper.accessor('image',{
      header : "Image",
      cell : ({row})=>{
        console.log("row",)
        return <div className='flex justify-center items-center'>
            <img 
                src={row.original.image}
                alt={row.original.name}
                className='w-8 h-8 cursor-pointer'
                onClick={()=>{
                  setImageURL(row.original.image)
                }}      
            />
        </div>
      }
    }),
    columnHelper.accessor("category",{
       header : "Category",
       cell : ({row})=>{
        return(
          <>
            {
              row.original.category.map((c,index)=>{
                return(
                  <p key={c._id+"table"} className='shadow-md px-1 inline-block'>{c.name}</p>
                )
              })
            }
          </>
        )
       }
    }),
    columnHelper.accessor("_id",{
      header : "Action",
      cell : ({row})=>{
        return(
          <div className='flex items-center justify-center gap-3'>
              <button onClick={()=>{
                  setOpenEdit(true)
                  setEditData(row.original)
              }} className='p-2 bg-green-100 rounded-full hover:text-green-600'>
                  <HiPencil size={20}/>
              </button>
              <button onClick={()=>{
                setOpenDeleteConfirmBox(true)
                setDeleteSubCategory(row.original)
              }} className='p-2 bg-red-100 rounded-full text-red-500 hover:text-red-600'>
                  <MdDelete  size={20}/>
              </button>
          </div>
        )
      }
    })
  ]

  const handleDeleteSubCategory = async()=>{
      try {
          const response = await Axios({
              ...SummaryApi.deleteSubCategory,
              data : deleteSubCategory
          })

          const { data : responseData } = response

          if(responseData.success){
             toast.success(responseData.message)
             fetchSubCategory()
             setOpenDeleteConfirmBox(false)
             setDeleteSubCategory({_id : ""})
          }
      } catch (error) {
        AxiosToastError(error)
      }
  }
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Sub Category</h1>
        <button
          onClick={() => setOpenAddSubCategory(true)}
          className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-6 py-3 rounded-lg border-2 border-black shadow-md"
        >
          Add Sub Category
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-black text-white">
            <tr>
              <th className="px-6 py-3 text-left">Sr.No</th>
              <th className="px-6 py-3 text-left">Name</th>
              <th className="px-6 py-3 text-left">Category</th>
              <th className="px-6 py-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((subCategory, index) => (
              <tr key={subCategory._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-gray-700">{index + 1}</td>
                <td className="px-6 py-4 text-gray-700">{subCategory.name}</td>
                <td className="px-6 py-4 text-gray-700">
                  {subCategory.category && subCategory.category.length > 0
                    ? subCategory.category.map(cat => {
                        // cat ở đây đã là object có _id và name rồi
                        return cat.name;
                      }).filter(Boolean).join(', ')
                    : 'N/A'}
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setOpenEdit(true)
                        setEditData(subCategory)
                      }}
                      className="bg-green-100 hover:bg-green-200 text-green-700 p-2 rounded-full"
                    >
                      <HiPencil size={20}/>
                    </button>
                    <button
                      onClick={() => {
                        setOpenDeleteConfirmBox(true)
                        setDeleteSubCategory(subCategory)
                      }}
                      className="bg-red-100 hover:bg-red-200 text-red-700 p-2 rounded-full"
                    >
                      <MdDelete  size={20}/>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {
          openAddSubCategory && (
            <UploadSubCategoryModel 
              close={()=>setOpenAddSubCategory(false)}
              fetchData={fetchSubCategory}
            />
          )
        }

        {
          ImageURL &&
          <ViewImage url={ImageURL} close={()=>setImageURL("")}/>
        }

        {
          openEdit && 
          <EditSubCategory 
            data={editData} 
            close={()=>setOpenEdit(false)}
            fetchData={fetchSubCategory}
          />
        }

        {
          openDeleteConfirmBox && (
            <CofirmBox 
              cancel={()=>setOpenDeleteConfirmBox(false)}
              close={()=>setOpenDeleteConfirmBox(false)}
              confirm={handleDeleteSubCategory}
            />
          )
        }
    </div>
  )
}

export default SubCategoryPage
