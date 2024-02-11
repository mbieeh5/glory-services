/* eslint-disable import/order */
import 'swiper/css';
import 'swiper/css/bundle';
import 'swiper/css/navigation';
import 'swiper/css/autoplay';
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { AppProps } from 'next/dist/shared/lib/router/router';
import Head from 'next/head';
import { ColorModeScript } from 'nextjs-color-mode';
import React, { useEffect, useState } from 'react';
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

const NavbarAdm: NavItems = [
  { title: "Custom Web Page", href: "/custom-web" },
  { title: "Input Data", href: "/input-data" },
  { title: "Update Resi", href: "/update-resi" },
  { title: "Settings", href: "settings" },
]

function MyApp({ Component, pageProps }: AppProps) {

  return (
    <>
      <Head>
        <title>Admin Panel SML</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="icon" type="image/png" href="/Logo-SML.png" />
      </Head>
      <LoginProvider>
        <ColorModeScript />
        <GlobalStyle />
        <MyAppContents Component={Component} pageProps={pageProps} />
      </LoginProvider>
    </>
  );
}

function MyAppContents({ Component, pageProps }: { Component: React.ComponentType; pageProps: any; }) {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const AuthCookie = Cookie.get('_IDs');
    if (auth.currentUser || AuthCookie) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = () => {
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isValidPassword = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/.test(password);

    if (isValidEmail && isValidPassword) {
      const auth = getAuth();
      signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          const user = userCredential.user;
          const accessToken = user.uid;
          Cookie.set('_IDs', accessToken, { expires: 1 });
          setIsLoggedIn(true);
        })
        .catch((error) => {
          console.error("Error signing in:", error);
          alert('Invalid email or password');
        });
    } else {
      alert('Invalid email or password');
    }
  };

  return (
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
              <Text>
                Admin ID&apos;s
                <Inputs placeholder="Admin Input" type="email" onChange={(e) => setEmail(e.target.value)} />
              </Text>
              <Text>
                Password
                <Inputs placeholder="Password" type="password" onChange={(e) => setPassword(e.target.value)} />
              </Text>
              <Buttons onClick={handleLogin}>Login</Buttons>
            </InputWrapper>
          </InputCard>
        </Page>
      )}
    </>
  )
}

function Providers({ children }: { children: React.ReactNode; }) {
  return (
    <NewsletterModalContextProvider>
      <NavigationDrawer items={NavbarAdm}>{children}</NavigationDrawer>
    </NewsletterModalContextProvider>
  );
}

const InputCard = styled.div`
  align-items: center;
  display: flex;
  position: absolute;
  flex-direction: column;
  background-color: rgb(var(--cardBackground));
  border-radius: 20px;
  width: 50%;
  left: 50%;
  transform: translate(-50%, 0%);
  @media (max-width: 512px) {
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
