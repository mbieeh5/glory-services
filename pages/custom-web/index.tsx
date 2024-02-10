/* eslint-disable import/order */
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import Cookies from "js-cookie";
import styled from "styled-components";
import PartnerEditor from "./component/Partners";
import VidBannerEditor from "./component/VidBanner";
import Button from "components/Button";
import BasicSection from "components/BasicSection";
import BannerHero2 from "./component/BannerHero2";
import FeaturesEditor from "./component/Features";
import ExperienceEditor from "./component/Experience";
import { media } from "utils/media";

export default function Panel() {
    const Auth:any = Cookies.get('_IDs')
    const route = useRouter();
    const [title, setTitle] = useState("")
    const [isPartner, setIsPartner] = useState(false);
    const [isVidBanner, setIsVidBanner] = useState(false);
    const [isBannerH2, setIsBannerH2] = useState(false);
    const [isService, setIsService] = useState(false);
    const [isExperience, setIsExperience] = useState(false);

    useEffect(() => {
        if(!Auth){
            alert('You Not Supposed to here before login ?')
            route.push('/')
        }
    });

    const handleEditor = (editorType:string, title:string) => {
        setIsPartner(false);
        setIsVidBanner(false);
        setIsBannerH2(false);
        setIsService(false);
        setIsExperience(false);
    
        switch (editorType) {
            case "partner":
                setIsPartner(true);
                break;
            case "vidBanner":
                setIsVidBanner(true);
                break;
            case "bannerH2":
                setIsBannerH2(true);
                break;
            case "services":
                setIsService(true);
                break;
            case "experience":
                setIsExperience(true);
                break;
            default:
                break;
        }
        setTitle(title);
    };

    return(
        <Wrapper>
            <WrapperHeader>
            <ButtonGroup>
                <Buttons onClick={() => handleEditor("partner", "Partner Editor")} transparent>Partner Editor</Buttons>
                <Buttons onClick={() => handleEditor("vidBanner", "Video Banner Editor")} transparent>Video Banner Editor</Buttons>
                <Buttons onClick={() => handleEditor("bannerH2", "Banner H2")} transparent>Banner H2</Buttons>
                <Buttons onClick={() => handleEditor("services", "Services Card Editor")} transparent>Services Card Editor</Buttons>
                <Buttons onClick={() => handleEditor("experience", "Experience Card Editor")} transparent>Experience Card Editor</Buttons>
            </ButtonGroup>
                < Divider/>
            <WrapperContent>
                <BasicSection title={title}>
                    {isVidBanner && (<VidBannerEditor />)}
                    {isBannerH2 && (<BannerHero2 />)}
                    {isPartner && (<PartnerEditor/>)}
                    {isService && (<FeaturesEditor/>)}
                    {isExperience && (<ExperienceEditor/>)}
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