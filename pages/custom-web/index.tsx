import { useRouter } from "next/router"
import { useEffect } from "react"
import Cookies from "js-cookie";
import styled from "styled-components";
import PagesPanel from "./pages";

export default function Panel() {
    const Auth:any = Cookies.get('_IDs')
    const route:any = useRouter();

    useEffect(() => {
        if(!Auth){
            alert('You Not Supposed to here before login ?')
            route.push('/')
        }
    })

    return(
        <Wrapper>
            <PagesPanel />
        </Wrapper>
    )

}


const Wrapper = styled.div`
`