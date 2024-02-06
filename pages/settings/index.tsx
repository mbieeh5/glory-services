import { useRouter } from "next/router"
import { useEffect } from "react"
import Cookies from "js-cookie";
import Button from "components/Button";
import styled from "styled-components";

export default function Settings() {
    const Auth:any = Cookies.get('_IDs')
    const route:any = useRouter();

    useEffect(() => {
        if(!Auth){
            alert('You Not Supposed to here before login ?');
            route.push('/');
        }
    })

    function Logout() {
        Cookies.remove('_Sid');
        Cookies.remove('_Auth');
        Cookies.remove('_IDs');
        Cookies.remove('_theme');
        Cookies.remove('_uID');
        route.push('/');
        window.location.reload();
    }

    return(
        <>
        Settings
            <Button onClick={(e) => Logout()}>LogOut</Button>
        </>
    )

}


const Title = styled.h1`
text-align: center;
padding-top: 45rem;
`