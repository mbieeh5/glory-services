/* eslint-disable import/order */
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import Cookies from "js-cookie";
import Button from "components/Button";
import styled from "styled-components";
import BasicSection from "components/BasicSection";
import ButtonGroup from "components/ButtonGroup";

export default function Settings() {
    const Auth:any = Cookies.get('_IDs')
    const [isError] = useState("")
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showModalAdd, setShowModalAdd] = useState(false);
    const [showModalCp, setShowModalCp] = useState(false);
    const route:any = useRouter();

    useEffect(() => {
        if(!Auth){
            setIsLoggedIn(false)
            alert('You Not Supposed to here before login ?');
            route.push('/');
        }else{
            setIsLoggedIn(true)
        }
    }, [Auth, route])

    
    const handleShowModalAdd = () => {
        setShowModalAdd(true);
    };

    const handleCloseModalAdd = () => {
        setShowModalAdd(false);
    };

    const handleSubmitFormAdd = (e: any) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const emailInput = formData.get('email');
        const passwordInput = formData.get('password');
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
          
            if (!passwordRegex.test(passwordInput)) {
                console.log('Password harus memiliki huruf besar, angka, dan minimal 8 karakter.');
                return;
            }
            console.log({emailInput, passwordInput});
            //setShowModalAdd(false);
    };

    const handleShowModalCp = () => {
        setShowModalCp(true);
    };

    const handleCloseModalCp = () => {
        setShowModalCp(false);
    };

    const handleSubmitFormCp = (e: any) => {
        e.preventDefault();
            console.log(e);
        setShowModalCp(false);
    };


    const Logout = () => {
        Cookies.remove('_Sid');
        Cookies.remove('_Auth');
        Cookies.remove('_IDs');
        Cookies.remove('_theme');
        Cookies.remove('_uID');
        route.push('/');
        window.location.reload();
    }

    return(
        <Wrapper>
            {isLoggedIn ? (
                <Wrapper>
                    <Card>
                        <BasicSection title="Settings">
                            <ButtonGroup>
                                <Buttons transparent onClick={() => handleShowModalAdd()}>Add Admin Account</Buttons>
                                <Buttons transparent onClick={() => handleShowModalCp()}>Change Password</Buttons>
                                <Buttons onClick={(e) => Logout()}>LogOut</Buttons>
                            </ButtonGroup>
                        </BasicSection>
                    </Card>
                    {showModalAdd && (
                <ModalWrapper>
                    <ModalCard>
                        <ModalHeader>Add Admin Account</ModalHeader>
                            <p>{isError}</p>
                        <Form onSubmit={handleSubmitFormAdd}>
                            <Label>
                                Email:
                                <Input type="email" placeholder="User@email.com" name="email" required />
                            </Label>
                            <Label>
                                Password:
                                <Input type="password" placeholder="Password Here" name="password" required />
                            </Label>
                            <Label>
                               Confirm Password:
                                <Input type="password" placeholder="Password Here" name="ConfirmPassword" required />
                            </Label>
                            <ButtonGroup>
                                <Button type="submit">Submit</Button>
                                <Button onClick={handleCloseModalAdd}>Cancel</Button>
                            </ButtonGroup>
                        </Form>
                    </ModalCard>
                </ModalWrapper>
            )}
                    {showModalCp && (
                <ModalWrapper>
                    <ModalCard>
                        <ModalHeader>Change Password</ModalHeader>
                        <Form onSubmit={handleSubmitFormCp}>
                            <Label>
                                Old Password:
                                <Input type="password" placeholder="Password Here" required />
                            </Label>
                            <Label>
                                Password:
                                <Input type="password" placeholder="Password Here" required />
                            </Label>
                            <Label>
                                Confirm Password:
                                <Input type="password" placeholder="Password Here" required />
                            </Label>
                            <ButtonGroup>
                                <Button type="submit">Submit</Button>
                                <Button onClick={handleCloseModalCp}>Cancel</Button>
                            </ButtonGroup>
                        </Form>
                    </ModalCard>
                </ModalWrapper>
            )}
                </Wrapper>
            ) : (
                <>
                    ?
                </>
            )}
        </Wrapper>
    )

}

const Wrapper = styled.div`
padding: 2rem;
`;

const Card = styled.div`
display: flex;
position: absolute;
padding: 2rem;
width: 80%;
left: 10%;
align-items: center;
justify-content: center;
text-align: center;
max-height: 100%;
overflow: hidden;
border-radius: 20px;
background: rgb(var(--cardBackground));
box-shadow: 0px 7px 5px rgba(100,100,100, 0.2)
`;

const Buttons = styled(Button)`
padding-bottom: 2rem;
`;


const ModalWrapper = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 999;
`;

const ModalCard = styled.div`
    background: rgb(var(--cardBackground));
    padding: 2rem;
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
    max-width: 400px;
    width: 100%;
`;

const ModalHeader = styled.h2`
    font-size: 1.5rem;
    margin-bottom: 1rem;
`;

const Form = styled.form`
    display: flex;
    flex-direction: column;
`;

const Label = styled.label`
    display: flex;
    flex-direction: column;
    padding: 1rem;
    margin-bottom: 1rem;
`;

const Input = styled.input`
    padding: 0.5rem;
    border-radius: 5px;
    font-size: 1.5rem;
    border: 1px solid #ccc;
    margin-top: 0.5rem;
    height: 4rem;
    background: rgb(var(--inputBackground));
    border: none;
    color: rgb(var(--text));
`;
