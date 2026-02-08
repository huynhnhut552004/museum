import Login from "./login";

export default function  LoginDigi(){
    const congig={
        bg: "bg-[#191B1D]",
        input: "Digital-Login-Input",
        back: "/digital",
        heading: "Digital-Heading-Login",
        button: "Digital-Login-Button",
        label: "Digital-Label-Login",
        icon: "",
        backcolor: "text-white"
    };
    const animate= [
        {id: 1, class:'absolute hidden md:block w-[700px] h-[700px] rounded-full border-[2px] border-dashed border-gray-500 animate-spin-slower'},
        {id: 2, class:'absolute hidden md:block w-[670px] h-[670px] rounded-full border-[2px] border-dashed border-gray-300 animate-spin-reverse'},
        {id: 3, class: 'absolute hidden md:block w-[640px] h-[640px] rounded-full border-[2px] border-dashed border-gray-100 animate-spin-slow'}
    ];
    return(<Login 
        style={congig}
        animate={animate}
    />)
}
