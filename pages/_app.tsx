/* eslint-disable import/order */
import 'swiper/css';
import 'swiper/css/bundle';
import 'swiper/css/navigation';
import 'swiper/css/autoplay';
import { AppProps } from 'next/dist/shared/lib/router/router';
import { ColorModeScript } from 'nextjs-color-mode';
import React, { useState } from 'react';
import { GlobalStyle } from 'components/GlobalStyles';
import Navbar from 'components/Navbar';
import NavigationDrawer from 'components/NavigationDrawer';
import { LoginProvider, useLogin } from 'contexts/LoginContext';
import { NewsletterModalContextProvider } from 'contexts/newsletter-modal.context';
import { NavItems } from 'types';
import Page from 'components/Page';
import Input from 'components/Input';
import Button from 'components/Button';
import styled from 'styled-components';
import Footer from 'components/Footer';
import Head from 'next/head';

const NavbarAdm: NavItems = [
  { title: "Input Data", href: "/input-data" },
  { title: "Update Resi", href: "/update-resi" },
  { title: "Settings", href: "settings" },
]

function MyApp({ Component, pageProps }: AppProps) {

  return (
    <>
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
  const {isLogin, login } = useLogin();

  const handleLogin = async () => {
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isValidPassword = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/.test(password);
    if (isValidEmail && isValidPassword) {
        await login({email, password});
    } else {
      alert('Invalid email or password');
    }
  };

  return (
    <>
      {isLogin ? (
        <>
        <Head>
            <title>Home || Rraf Project</title>
        </Head>
        <Providers>
          <LoginProvider>
            <Navbar items={NavbarAdm} />
            <Component {...pageProps} />
            <Footer />
          </LoginProvider>
        </Providers>
        </>
      ) : (
        <>
        <Head>
            <title>Login</title>
        </Head>
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
        </>
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
