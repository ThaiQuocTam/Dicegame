import { createSlice } from '@reduxjs/toolkit'

export const getNftSlice = createSlice({
    name: 'getNFts',
    initialState: {
        getNft: {},
        rewardData: []
    },
    reducers: {
        getNftAction: (state, action) => {
            state.getNft = action.payload
        },
        rewardDataAction: (state, action) => {
            state.rewardData = action.payload
        }
    }
})