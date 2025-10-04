import { create } from "zustand";

interface StoreState{
    loaded : boolean,
    setLoaded : (loaded : boolean) => void
}

interface Navigate{
    shouldNavigate : boolean,
    setShouldNavigate : (shouldNavigate : boolean) => void
}

interface ReviewData{
    score : number,
    remarks : string,
    review : string,
    qa_history : Array<{question: string, answer: string}>,
}

interface ReviewDataState{
    score : number,
    remarks : string,
    review : string,
    qa_history : Array<{question: string, answer: string}>,
    setData : (data: ReviewData) => void
}

const useStore = create<StoreState>((set,get)=> ({
    loaded : false,
    setLoaded : (loaded) => set({loaded})
}))

export const navigateStore = create<Navigate>((set,get) => ({
    shouldNavigate : false,
    setShouldNavigate : (shouldNavigate) => set({shouldNavigate})
}))

export const reviewStore = create<ReviewDataState>((set,get) => ({
    score : 0,
    remarks : "",
    review : "",
    qa_history : [],
    setData : (data:ReviewData) => set({score: data.score, remarks: data.remarks, review: data.review, qa_history: data.qa_history})
}))

export default useStore