import { createSlice } from "@reduxjs/toolkit";

const initialValue = {
    allCategory : [],
    loadingCategory : false,
    allSubCategory : [],
    product : []
}

const productSlice = createSlice({
    name : 'product',
    initialState : initialValue,
    reducers : {
        setAllCategory : (state,action)=>{
            state.allCategory = [...action.payload]
        },
        setLoadingCategory : (state,action)=>{
            state.loadingCategory = action.payload
        },
        setAllSubCategory : (state,action)=>{
            state.allSubCategory = [...action.payload]
        },
            setProducts: (state, action) => {
                state.product = [...action.payload]
            },
            addProduct: (state, action) => {
                state.product = [action.payload, ...state.product]
            },
            updateProduct: (state, action) => {
                const idx = state.product.findIndex(p => String(p._id || p.id) === String(action.payload.id))
                if (idx !== -1) {
                    state.product[idx] = { ...state.product[idx], ...action.payload.changes }
                }
            },
            removeProduct: (state, action) => {
                state.product = state.product.filter(p => String(p._id || p.id) !== String(action.payload.id))
            }
        
    }
})

export const { setAllCategory, setAllSubCategory, setLoadingCategory, setProducts, addProduct, updateProduct, removeProduct } = productSlice.actions

export default productSlice.reducer