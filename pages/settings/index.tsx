/* eslint-disable import/order */
import { useRouter } from "next/router"
import { useState } from "react"
import Button from "components/Button";
import styled from "styled-components";
import BasicSection2 from "components/BasicSection2";
import ButtonGroup from "components/ButtonGroup";
import { createUserWithEmailAndPassword, EmailAuthProvider, getAuth, reauthenticateWithCredential, updatePassword } from "firebase/auth";
import { useLogin } from "contexts/LoginContext";
import Head from "next/head";

export default function Settings() {
    const [isError, setIsError] = useState("")
    const {isLogin, logout} = useLogin();
    const [showModalAdd, setShowModalAdd] = useState(false);
    const [showModalCp, setShowModalCp] = useState(false);
    const route:any = useRouter();
    const auth = getAuth();
    const router = useRouter();
    
    const handleShowModalAdd = () => {
        setShowModalAdd(true);
    };

    const handleCloseModalAdd = () => {
        setShowModalAdd(false);
    };

    const handleSubmitFormAdd = (e: any) => {
        const auth = getAuth();
        e.preventDefault();
        const formData = new FormData(e.target);
        const emailInput = formData.get('email');
        const passwordInput = formData.get('password');
        const confirmPassword = formData.get('confirmPassword');
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
        const stringsEmail = emailInput?.toString() || "";
        const stringsPassword = passwordInput?.toString() || "";
        const stringsConfirmPassword = confirmPassword?.toString() || "";
        if (!passwordRegex.test(stringsPassword)) {
            setIsError('Password harus memiliki huruf besar, angka, dan minimal 8 karakter.');
            return;
        }
        if (stringsPassword !== stringsConfirmPassword){
            setIsError("konfirmasi Password harus sama dengan password.");
            return;
        }
        setIsError("")

        createUserWithEmailAndPassword(auth, stringsEmail, stringsPassword)
            .then((userCredential) => {
                const user = userCredential.user
                alert(`${user.email} Berhasil di daftarkan!`)
                setShowModalAdd(false);
                window.location.reload();
                router.push('/');
            }).catch((error) => {
                setIsError('Akun Sudah Terdaftar sebelumnya');
            })
    };

    const handleShowModalCp = () => {
        setShowModalCp(true);
    };

    const handleCloseModalCp = () => {
        setShowModalCp(false);
    };

    const handleSubmitFormCp = async (e: any) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const oldPassword = formData.get('passOld')?.toString();
        const newPassword = formData.get('passNew')?.toString();
        const confirmPassword = formData.get('passNewConfirm')?.toString();

        if(oldPassword === null || oldPassword === undefined){
            alert('password Tidak valid');
            return;
        }

        if(newPassword === null || newPassword === undefined){
            alert('password Tidak valid');
            return;
        }

        const user = auth.currentUser;
        if(user?.email === null || user?.email === undefined){
            alert('You Should Login first')
            return;
        }

        const credential = EmailAuthProvider.credential(user?.email, oldPassword);

        try {
            await reauthenticateWithCredential(user, credential);

            if (newPassword !== confirmPassword){
                alert('Password baru dan konfirmasi password harus sama');
                return;
            }

            updatePassword(user, newPassword)
                .then(() => {
                    alert('password berhasil di rubah silahkan login ulang!')
                    logout();
                }).catch((err) => {
                    alert('gagal mengubah password')
                })
            
        } catch (error) {
             alert('Password lama tidak valid.');
        }
    };

    const handleStatistic = () => {
        route.push('/statistic')
    }

    return(
        <Wrapper>
        <Head>
            <title>Settings || Rraf Project</title>
        </Head>
            {isLogin ? (
                <Wrapper>
                    <Card>
                        <BasicSection2 title={`Login As : `}>
                            <h2>{auth.currentUser?.email}</h2>
                            <ButtonWrapper>
                                {auth.currentUser?.email === "admin@rraf.com" && (
                                    <Buttons transparent onClick={() => handleShowModalAdd()}>Add Admin Account</Buttons>
                                )}
                                <Buttons transparent onClick={() => handleShowModalCp()}>Change Password</Buttons>
                                <Buttons transparent onClick={() => handleStatistic()}>Statistic</Buttons>
                                <ButtonsLogout onClick={(e) => logout()}>LogOut</ButtonsLogout>
                            </ButtonWrapper>
                        </BasicSection2>
                    </Card>
                    {showModalAdd && (
                <ModalWrapper>
                    <ModalCard>
                        <ModalHeader>Add Admin Account</ModalHeader>
                            <Error>{isError}</Error>
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
                                <Input type="password" placeholder="Password Here" name="confirmPassword" required />
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
                                <Input type="password" placeholder="current Password" name="passOld" required />
                            </Label>
                            <Label>
                                Password:
                                <Input type="password" placeholder=" new Password" name="passNew" required />
                            </Label>
                            <Label>
                                Confirm Password:
                                <Input type="password" placeholder="Confirm new Password" name="passNewConfirm" required />
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

const Error = styled.h2`
color: rgb(var(--errorColor));
text-align: center;
`

const Wrapper = styled.div`
padding: 2rem;
`;

const Card = styled.div`
display: flex;
top: 0;
left: 0;
width: 100%;
height: 100%;
align-items: center;
justify-content: center;
padding: 2rem;
text-align: center;
overflow: hidden;
border-radius: 20px;
background: rgb(var(--cardBackground));
box-shadow: 0px 7px 5px rgba(100,100,100, 0.2);
`;

const ButtonWrapper = styled(ButtonGroup)` 
display: flex;
flex-direction: column;
align-items: center;
`;

const ButtonsLogout = styled(Button)`
padding-bottom: 2rem;
margin-top: 9rem;
background: red;
border: none;
width: 12rem;
`;

const Buttons = styled(Button)`
padding-bottom: 2rem;
margin-top: 2rem;

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
