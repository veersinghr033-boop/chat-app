import { configureStore, combineReducers } from '@reduxjs/toolkit'
import auths from './features/auth'
import User from './features/users'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'


const rootReducer = combineReducers({
  auth: auths,
  user: User,
})

const persistConfig = {
  key: 'chat-app',
  storage,
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    serializableCheck: false,
  }),
})

export const persistor = persistStore(store)
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch