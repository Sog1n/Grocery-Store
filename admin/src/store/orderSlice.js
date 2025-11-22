import { createSlice } from "@reduxjs/toolkit";

const initialValue = {
    order : []
}

const orderSlice = createSlice({
    name : 'order',
    initialState : initialValue,
    reducers : {
        setOrder : (state,action)=>{
            state.order = [...action.payload]
        },
        addOrder: (state, action) => {
            state.order = [action.payload, ...state.order]
        },
        updateOrder: (state, action) => {
            const idx = state.order.findIndex(o => String(o._id || o.id) === String(action.payload.id))
            if (idx !== -1) state.order[idx] = { ...state.order[idx], ...action.payload.changes }
        },
        removeOrder: (state, action) => {
            state.order = state.order.filter(o => String(o._id || o.id) !== String(action.payload.id))
        }
    }
})

export const { setOrder, addOrder, updateOrder, removeOrder } = orderSlice.actions

export default orderSlice.reducer