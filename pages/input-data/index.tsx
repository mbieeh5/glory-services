import { useRouter } from "next/router"
import { useEffect } from "react"
import Cookies from "js-cookie";
import Button from "components/Button";
import styled from "styled-components";

export default function Undangan() {
    const Auth:any = Cookies.get('_IDs')
    const route:any = useRouter();

    useEffect(() => {
        if(!Auth){
            alert('You Not Supposed to here before login ?')
            route.push('/')
        }
    })

    function Submit() {
        const confirmSubmit = window.confirm("Apakah Anda yakin ingin melanjutkan?");
        if (confirmSubmit) {
            alert("Anda memilih Iya!");
        } else {
            alert("Anda memilih Tidak!");
        }
    }
    return(
        <>
            <Button onClick={(e) => Submit()}>Submit</Button>
        </>
    )

}


const Title = styled.h1`
text-align: center;
padding-top: 45rem;
`