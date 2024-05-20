/* eslint-disable import/order */
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import Cookies from "js-cookie";
import Button from "components/Button";
import styled from "styled-components";
import BasicSection from "components/BasicSection";
import { media } from "utils/media";
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
const Buttons = styled(Button)`
font-size: 2rem;
`

const ButtonGroup = styled.div`
  margin-top: 3rem;
  display: flex;
  flex-wrap: wrap;

  & > *:not(:last-child) {
    margin-right: 13rem;
  }

  ${media('<=tablet')} {
    & > * {
      width: 100%;
    }

    & > *:not(:last-child) {
      margin-bottom: 2rem;
      margin-right: 0rem;
    }
  }
`;

const WrapperHeader =  styled.div`

`

const WrapperContent = styled.div`
padding-top: 5rem;

`

const Divider = styled.div`
    width: 100%;
    height: 1px;
    background-color: rgb(var(--text));
    margin-top: 1rem;
`;