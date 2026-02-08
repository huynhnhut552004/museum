import Login from "./login";

export default function LoginClassic(){
    const config={
        bg: "bg-[#D8CBB0]",
        input: "Classic-Login-Input",
        back: "/",
        heading: "Style-Heading-Login",
        button: "Classic-Login-Button",
        label: "Style-Label-Login",
        icon: "invert",
        backcolor: ""
    };
    const animate= [
        {id: 1, class:'absolute hidden md:block w-[700px] h-[700px] rounded-full border-[2px] border-dashed border-gray-900 animate-spin-slower'},
        {id: 2, class:'absolute hidden md:block w-[670px] h-[670px] rounded-full border-[2px] border-dashed border-gray-700 animate-spin-reverse'},
        {id: 3, class: 'absolute hidden md:block w-[640px] h-[640px] rounded-full border-[2px] border-dashed border-gray-500 animate-spin-slow'}
    ];
    return(<Login 
        style={config}
        animate={animate}
    />)
}
