import axios from 'axios';
import { useState, useEffect } from 'react';

export default function UserLayout(){
    const [err, setErr] = useState('');

    const getUser = async() =>{
        const token= localStorage.getItem('token');
        if(!token){
            setErr('Vui lòng đăng nhập để sử dụng!');
            return;
        }
        try {
            
        } catch (error) {
            
        }
    };

    useEffect(()=>{

    })
    return(
        <section className="">
            <div className=''>

            </div>
        </section>
    )
}