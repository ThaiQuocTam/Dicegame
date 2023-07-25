import { configureStore } from '@reduxjs/toolkit'
import { getNftSlice } from './NftSlice'
export const store = configureStore({
    reducer: {
        getNft: getNftSlice.reducer
    }
})
