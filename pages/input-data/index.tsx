/* eslint-disable import/order */
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import Cookies from "js-cookie";
import styled from "styled-components";
import BasicSection from "components/BasicSection";
import InputResi from "./component/InputResi";

export default function Undangan() {
    const Auth:any = Cookies.get('_IDs')
    const route:any = useRouter();
    const [title, setTitle] = useState("")
    const [isResi, setIsResi] = useState(false);

    useEffect(() => {
        if(!Auth){
            alert('You Not Supposed to here before login ?')
            route.push('/')
        }
        handleInputResi();
    }, [Auth, route]);

    const handleInputResi = () => {
        setTitle("Input Resi")
        setIsResi(true);
    }

    return(
        <Wrapper>
            <WrapperHeader>
            <WrapperContent>
                <BasicSection title={title}>
                    {isResi && (<InputResi />)}
                </BasicSection>
            </WrapperContent>
            </WrapperHeader>
        </Wrapper>
    )

}

const Wrapper = styled.div`
display: flex;
width: 100%;
height: 100%;
align-item: center;
justify-content: center;
text-align: center;
padding-bottom: 12rem;
`

const WrapperHeader =  styled.div`

`

const WrapperContent = styled.div`
padding-top: 5rem;

`