import React,{useCallback,useEffect,useRef,useState} from "react";

const useCounter = (initialValue,ms)=>{
    const [count,setCount] = useState(initialValue);
    const IntervalRef = useRef(null);
    const start =useCallback(()=>{
        if(IntervalRef.current != null){
            return;
        }
        IntervalRef.current = setInterval(()=>{
            setCount(c=>c+1);
        },ms);
    },[]);
    

}


export default function SetTimer(){
    const [currentSeconds,setCurrentSconds] = useState(0);
    const {count,start} = useCounter(0,1000);

    const timer = ()=>{
        const seconds = count %60;
        setCurrentSconds(seconds);
        
    }
    useEffect(timer,[count]);
    return(
        <>
        <h1>
            {currentSeconds}
        </h1>
        <button onClick={start}>start</button>
        </>
    )


}