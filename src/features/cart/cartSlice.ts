import { createSlice, createAsyncThunk, createSelector, PayloadAction } from "@reduxjs/toolkit";
import { checkout, CartItems } from "../../app/api";
import { AppDispatch, RootState } from "../../app/store";

type CheckoutState = 'LOADING' | 'READY' | 'ERROR';

export interface CartState {
  items: { [productId: string]: number};
  checkoutState: CheckoutState;
  errorMessage: string;
};

const initialState: CartState = {
  items: {},
  checkoutState: 'READY',
  errorMessage: ''
};

export const checkoutCart = createAsyncThunk('cart/checkout', async (_, thunkAPI) => {
  const state = thunkAPI.getState() as RootState;
  const { items } = state.cart;
  const response = await checkout(items);
  return response;
})

const cartSlice = createSlice({
  name: "cart",
  initialState, 
  reducers: {
    addToCart(state, action: PayloadAction<string>) {
      const id = action.payload;
      if (state.items[id]) {
        state.items[id]++;
      } else {
        state.items[id] = 1;
      }      
    },
    removeFromCart(state, action: PayloadAction<string>) {
      delete state.items[action.payload];
    },
    updateQuantity(state, action: PayloadAction<{id: string, quantity: number}>) {
      const { id, quantity } = action.payload;
      state.items[id] = quantity;
    }
  },
  extraReducers: (builders) => {
    builders.addCase(checkoutCart.pending, (state, action) => {
      state.checkoutState = 'LOADING';
    })
    builders.addCase(checkoutCart.fulfilled, (state, action: PayloadAction<{ success: boolean }>) => {
      const { success } = action.payload;
      if (success) {
        state.checkoutState = 'READY';
        state.items = {};
      } else {
        state.checkoutState = 'ERROR';
      }
    })
    builders.addCase(checkoutCart.rejected, (state, action) => {
      state.checkoutState = 'ERROR';
      state.errorMessage = action.error.message || '';
    })
  }
});

// export function checkout() {
//   return function checkoutThunk(dispatch: AppDispatch) {
//     dispatch({ type: 'cart/checkout/pending' });
//     setTimeout(function() {
//       dispatch({ type: 'cart/checkout/fulfilled' });
//     }, 500)
//   }
// }

export const { addToCart, removeFromCart, updateQuantity } = cartSlice.actions;

export const getMemorisedNumItems = createSelector(
  (state: RootState) => state.cart.items,
  (items) => {
    let numItems = 0;
    for (const id in items) {
      numItems += items[id]
    }
    return numItems;
  }
)

export const getTotalPrice = createSelector(
  (state: RootState) => state.cart.items,
  (state: RootState) => state.products.products,
  (items, products) => {
    let total = 0;
    for (const id in items) {
      total += products[id].price * items[id];
    }
    return total.toFixed(2);
  }
);

export default cartSlice.reducer;