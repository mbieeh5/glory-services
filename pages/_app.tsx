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
import { LoginProvider, useLogin } from 'contexts/LoginContext';
import { NewsletterModalContextProvider } from 'contexts/newsletter-modal.context';
import { NavItems } from 'types';
import Page from 'components/Page';
import Input from 'components/Input';
import Button from 'components/Button';

const NavbarAdm:NavItems = [
  {title: "Custom Web Page" , href: "/custom-web"},
  {title: "Input Data" , href: "/input-data"},
  {title: "statistic" , href: "/statistic"},
  {title: "settings" , href: "settings"},
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
                Cookie.set('_Sid', accessToken, { expires: 24 * 60* 60 * 1000});
                Cookie.set('_Auth', accessToken, { expires: 24 * 60* 60 * 1000});
                Cookie.set('_IDs', accessToken, { expires: 24 * 60* 60 * 1000});
                Cookie.set('_theme', accessToken, { expires: 24 * 60* 60 * 1000});
                Cookie.set('_uID', accessToken, { expires: 24 * 60* 60 * 1000});
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
          <Input placeholder="Admin Input" type="email" onChange={(e) => setEmail(e.target.value)}/>
          <Input placeholder="Password" type="password" onChange={(e) => setPassword(e.target.value)}/>
          <Button onClick={(e) => Login()}>Login</Button>
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


export default MyApp;
