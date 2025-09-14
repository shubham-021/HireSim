import { create } from "zustand";

interface StoreState{
    loaded : boolean,
    setLoaded : (loaded : boolean) => void
}

const useStore = create<StoreState>((set,get)=> ({
    loaded : false,
    setLoaded : (loaded) => set({loaded})
}))

export default useStore