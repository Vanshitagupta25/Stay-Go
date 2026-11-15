import { configureStore } from "@reduxjs/toolkit";
import { paymentApi } from "./api/paymentApi";
import { listingApi } from "./api/listingApi";

export const store = configureStore({
  reducer: {
    [paymentApi.reducerPath]: paymentApi.reducer,
    [listingApi.reducerPath]: listingApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(paymentApi.middleware, listingApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
