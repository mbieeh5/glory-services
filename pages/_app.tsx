/* eslint-disable import/order */
import 'swiper/css';
import 'swiper/css/bundle';
import 'swiper/css/navigation';
import 'swiper/css/autoplay';

import { getAuth, signInWithEmailAndPassword } from "firebase/auth"
import { AppProps } from 'next/dist/shared/lib/router/router';
import Head from 'next/head';
import { ColorModeScript } from 'nextjs-color-mode';
import React, { PropsWithChildren, useEffect, useState } from 'react';
import Cookie from "js-cookie";
import { GlobalStyle } from 'components/GlobalStyles';
import Navbar from 'components/Navbar';
import NavigationDrawer from 'components/NavigationDrawer';
import { LoginProvider } from 'contexts/LoginContext';
import { NewsletterModalContextProvider } from 'contexts/newsletter-modal.context';
import { NavItems } from 'types';
import Page from 'components/Page';
import Input from 'components/Input';
import Button from 'components/Button';
import styled from 'styled-components';

const NavbarAdm:NavItems = [
  {title: "Custom Web Page" , href: "/custom-web"},
  {title: "Input Data" , href: "/input-data"},
  {title: "Statistic" , href: "/statistic"},
  {title: "Update Resi" , href: "/update-resi"},
  {title: "Settings" , href: "settings"},
]

function MyApp({ Component, pageProps }: AppProps) {

  return (
    <>
      <Head>
        <title>Admin Panel SML</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="icon" type="image/png" href="/rraf-logo.png" />
      </Head>
      <LoginProvider>
        <ColorModeScript />
        <GlobalStyle />
        <MyAppContents Component={Component} pageProps={pageProps}/>
      </LoginProvider>
    </>
  );
}

function MyAppContents({Component, pageProps}:{Component: React.ComponentType; pageProps: any;}) {

  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const CookieID = () => {
    const characters = '_-=@abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const lengthText1 = 257;
    const lengthText2 = 194;
    const lengthNum1 = 301;
    const lengthNum2 = 192;
    let Cookies = '';
    for (let i = 0; i < lengthText1; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        Cookies += characters[randomIndex];
    }
    for (let i = 0; i < lengthNum1; i++) {
        const randomIndex = Math.floor(Math.random() * numbers.length);
        Cookies += numbers[randomIndex];
    }
    for (let i = 0; i < lengthText2; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      Cookies += characters[randomIndex];
    }
    for (let i = 0; i < lengthNum2; i++) {
        const randomIndex = Math.floor(Math.random() * numbers.length);
        Cookies += numbers[randomIndex];
    }
    return `${Cookies}`;
};

  useEffect(() => {
      const AuthCookie = Cookie.get('_IDs');
          if(AuthCookie){
              setIsLoggedIn(true);
          }
  }, [])

  function Login() {
    const EmailRegex: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const PswdRegex: RegExp = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
    const isValidEmail: Boolean = EmailRegex.test(email);
    const isValidPswd: Boolean = PswdRegex.test(password);

    if(isValidEmail && isValidPswd){

        if(email && password != null){
            const Aa = getAuth();
            signInWithEmailAndPassword(Aa, email, password).then((val: any) => {
                let accessToken:string = val.user.accessToken;
                Cookie.set('_IDs', accessToken, { expires: 24 * 60* 60 * 1000});
                Cookie.set('_Sid', CookieID(), { expires: 24 * 60* 60 * 1000});
                Cookie.set('_Auth', CookieID(), { expires: 24 * 60* 60 * 1000});
                Cookie.set('_theme', CookieID(), { expires: 24 * 60* 60 * 1000});
                Cookie.set('_uID', CookieID(), { expires: 24 * 60* 60 * 1000});
                Cookie.set('Auth', CookieID(), { expires: 24 * 60* 60 * 1000});
                Cookie.set('database', CookieID(), { expires: 24 * 60* 60 * 1000});
                Cookie.set('firebase', CookieID(), { expires: 24 * 60* 60 * 1000});
                Cookie.set('theme-state', CookieID(), { expires: 24 * 60* 60 * 1000});
                setIsLoggedIn(true);
                console.log(accessToken);
            }).catch((err) => {
                console.log(err)
                alert('You are not admin')
            })
        }else{
            alert('youre Not The Admin')
        }
    }else{
        alert('You Not The Admin')
    }
}


  return(
    <>
    {isLoggedIn ? (
      <Providers>
        <Navbar items={NavbarAdm} />
        <Component {...pageProps} />
      </Providers>
      ) : (
        <Page title="Admin Section">
          <InputCard>
            <InputWrapper>
              <Text> Admin ID&apos;s
                <Inputs placeholder="Admin Input" type="email" onChange={(e) => setEmail(e.target.value)}/>
              </Text>
              <Text> Password
                <Inputs placeholder="Password" type="password" onChange={(e) => setPassword(e.target.value)}/>
              </Text>
              <Buttons onClick={(e) => Login()}>Login</Buttons>
            </InputWrapper>
          </InputCard>
        </Page>
      )}  
  </>
  )
}

function Providers<T>({ children }: PropsWithChildren<T>) {
  return (
    <NewsletterModalContextProvider>
      <NavigationDrawer items={NavbarAdm}>{children}</NavigationDrawer>
    </NewsletterModalContextProvider>
  );
}

const InputCard = styled.div`
align-items: center;
display: flex;
potisiton: absolute;
flex-direction: column;
background-color: rgb(var(--cardBackground));
border-radius: 20px;
width: 50%;
left: 50%;
transform: translate(50%, 0%);
@media (max-width: 512px){
  width: 100%;
  transform: translate(0%, 0%);
  left: 0%;
  & input {
    height: 20rem;
    width: 100%;
  }
}
`;

const InputWrapper = styled.div`
width: 100%;
max-height: 80rem;
padding: 2rem;
`;

const Text = styled.label`
display: flex;
flex-direction: column;
padding-top: 2rem;
font-size: 1.5rem;
`;

const Inputs = styled(Input)`
padding-top: 2rem;
max-width: 20rem;
color: rgb(var(--text));
box-shadow: 0px 5px 2px rgba(255,255,255, 0.2);
`;

const Buttons = styled(Button)`
padding-top: 2rem;
margin-top: 4rem;
width: 100%;
`;

export default MyApp;
