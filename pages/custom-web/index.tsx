import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import Cookies from "js-cookie";
import styled from "styled-components";
import PartnerEditor from "./component/Partners";
import VidBannerEditor from "./component/VidBanner";
import Button from "components/Button";
import BasicSection from "components/BasicSection";
import ButtonGroup from "components/ButtonGroup";
import BannerHero2 from "./component/BannerHero2";
import FeaturesEditor from "./component/Features";
import BasicComponentEdit from "./component/BasicComponent";

export default function Panel() {
    const Auth:any = Cookies.get('_IDs')
    const route:any = useRouter();
    const [isPartner, setIsPartner] = useState(false);
    const [isBasicSection, setIsBasicSection] = useState(false);
    const [isVidBanner, setIsVidBanner] = useState(false);
    const [isBannerH2, setIsBannerH2] = useState(false);
    const [isService, setIsService] = useState(false);

    useEffect(() => {
        if(!Auth){
            alert('You Not Supposed to here before login ?')
            route.push('/')
        }
    })

    return(
        <Wrapper>
            <BasicSection title='Video Banner'>
                <ButtonGroup>
                    <Button onClick={() => setIsVidBanner(true)}>Open Video Banner Section</Button>
                    <ButtonClose onClick={() => setIsVidBanner(false)}>Close Video Banner Section</ButtonClose>
                </ButtonGroup>
            {isVidBanner && (
                <VidBannerEditor />
                )}
            </BasicSection>
                <Divider />
            <BasicSection title='Banner Hero 2'>
                <ButtonGroup>
                    <Button onClick={() => setIsBannerH2(true)}>Open Banner </Button>
                    <ButtonClose onClick={() => setIsBannerH2(false)}>Close Partner Section</ButtonClose>
                </ButtonGroup>
            {isBannerH2 && (
                <BannerHero2 />
                )}
            </BasicSection>
                <Divider />
            <BasicSection title='Content Basic Section'>
                <ButtonGroup>
                    <Button onClick={() => setIsBasicSection(true)}>Open Content </Button>
                    <ButtonClose onClick={() => setIsBasicSection(false)}>Close Content</ButtonClose>
                </ButtonGroup>
            {isBasicSection && (
                <BasicComponentEdit />
                )}
            </BasicSection>
                <Divider />
            <BasicSection title='Services Section'>
                <ButtonGroup>
                    <Button onClick={() => setIsService(true)}>Open Services Section</Button>
                    <ButtonClose onClick={() => setIsService(false)}>Close Services Section</ButtonClose>
                </ButtonGroup>
            {isService && (
                <FeaturesEditor />
                )}
            </BasicSection>
            <Divider />
            <BasicSection title='Partner Section'>
                <ButtonGroup>
                    <Button onClick={() => setIsPartner(true)}>Open Partner Section</Button>
                    <ButtonClose onClick={() => setIsPartner(false)}>Close Partner Section</ButtonClose>
                </ButtonGroup>
            {isPartner && (
                <PartnerEditor />
                )}
            </BasicSection>
                <Divider />
        </Wrapper>
    )

}


const Wrapper = styled.div`
padding: 2rem;
`

const Divider = styled.div`
position: relative;
padding-top: 7rem;
margin-bottom: 7rem;
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    width: 100%; 
    height: 1.5px; 
    background-color: gray;
    transform: translateX(-50%);
    box-shadow: 0px 6px 6px rgba(0, 0, 0, 0.7);
  }
`;


const ButtonClose = styled.button`
  border: none;
  background: none;
  display: inline-block;
  text-decoration: none;
  text-align: center;
  background: red;
  padding: 1.75rem 2.25rem;
  font-size: 1.2rem;
  color: rgb(var(--textSecondary));
  text-transform: uppercase;
  font-family: var(--font);
  font-weight: bold;
  border-radius: 2rem;
  border: 2px solid red;
  transition: transform 0.3s;
  backface-visibility: hidden;
  will-change: transform;
  cursor: pointer;

  span {
    margin-left: 2rem;
  }

  &:hover {
    transform: scale(1.025);
  }
`;