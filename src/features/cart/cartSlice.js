import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import cartItems from "../../cartItems"; // mock data
import axios from "axios";
// import { openModal } from "../modal/modalSlice";

const url = "https://course-api.com/react-useReducer-cart-project";

const initialState = {
  cartItems: [],
  amount: 0,
  total: 0,
  isLoading: true,
};

/* Base createAsyncthunk()
// createAsyncthunk(type, returns a thunk action creator that will return a promise callback). Note to export.
// Returns a thunk action creator that will run the promise callback and dispatch the lifecycle actions based on the returned promise.
export const getCartItems = createAsyncThunk("cart/getCartItems", () => {
  // fetch will return promise pending, success, rejected that redux toolkit expects
  return fetch(url)
    .then((resp) => resp.json())
    .catch((err) => console.log(err)); // mainly network error.  * Fetch does not respond to 404 errors.
});
*/

// More on createAsyncthunk() prefix "cart/getCartItems" for action type /pending, /fulfilled, /rejected will be created
export const getCartItems = createAsyncThunk(
  "cart/getCartItems",
  async (name, thunkAPI) => {
    // console.log(name);
    // console.log(thunkAPI.getState()); // thunkAPI has useful data (all states) and functions (dispatch) we can access
    // thunkAPI.dispatch(openModal()); // we have ability to access reducers from different slices

    // with axios and try/catch we can get API 404 errors
    try {
      const resp = await axios(url);
      return resp.data; // Payload. Keep in mind we intentionally are returning a promise which is handled accordingly in the cartSlice.extraReducers property
    } catch (error) {
      return thunkAPI.rejectWithValue("something went wrong"); // We can catch errors from the API
    }
  }
);

// In redux toolkit - slice / feature synonymous.
const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    clearCart: (state) => {
      state.cartItems = []; // With redux toolkit no need to return state, mutate state allowed, also get action creator by the same name
    },
    removeItem: (state, action) => {
      const itemId = action.payload;
      state.cartItems = state.cartItems.filter((item) => item.id !== itemId);
    },
    increase: (state, { payload }) => {
      const cartItem = state.cartItems.find((item) => item.id === payload.id);
      cartItem.amount = cartItem.amount + 1;
    },
    decrease: (state, { payload }) => {
      const cartItem = state.cartItems.find((item) => item.id === payload.id);
      cartItem.amount = cartItem.amount - 1;
    },
    calculateTotals: (state) => {
      const { amount, total } = state.cartItems.reduce(
        (accumulator, current) => {
          accumulator.amount += current.amount;
          accumulator.total += current.amount * current.price;

          return accumulator;
        },
        { amount: 0, total: 0 }
      );

      state.amount = amount;
      state.total = total;
    },
  },
  // For async thunk and also get three life cycle actions for every reducer functions here. They are pending, fulfilled, rejected.
  // Will dispatch the lifecycle actions based on the returned promise
  extraReducers: {
    [getCartItems.pending]: (state) => {
      state.isLoading = true;
    },
    [getCartItems.fulfilled]: (state, action) => {
      state.isLoading = false;
      state.cartItems = action.payload;
    },
    [getCartItems.rejected]: (state, action) => {
      console.log(action);
      state.isLoading = false;
    },
  },
});

// Action creators will be passed into dispatch from components
export const { clearCart, removeItem, increase, decrease, calculateTotals } =
  cartSlice.actions;

export default cartSlice.reducer;

// console.log(cartSlice); // See cartSlice .caseReducers, .actions, .reducer

/*  Notes:
  1 cartSlice .reducers property 
  - we can define reducer functions
  - no need to return state 
  - also the moment we create the reducer clearCart an action creator is also created by the
  same name and will be found in cartSlice.actions

  2 Note Immer library comes with redux toolkit 
  - that allow us to mutate the state but behind the scenes does the heavy lifting for updating the state properly.
  
  3 State can also be returned
    const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
      clearCart: (state) => {
        state.cartItems = []; // With redux toolkit no need to return state, mutate state allowed, also get action creator by the same name

        // You can also return state
        return {
          ...state,
          cartItems: [],
        };
        
      },
    },
  });
  
*/
