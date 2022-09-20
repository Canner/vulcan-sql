import { AppProps } from 'next/app';
import { ApolloProvider } from '@apollo/client';
import Head from 'next/head';
import { ThemeProvider } from 'styled-components';
// import 'antd/dist/antd.css';
import { AuthProvider } from '@/lib/auth';
import apolloClient from '@/lib/apollo';
import Layout from '@/components/Layout';
import theme from '@/styles/theme';
import '@/styles/styles.css';
require('@/styles/antd-custom.less');

function App({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <>
      <Head>
        <title>Vulcan</title>
      </Head>
      <main className="app" style={{ height: '100%' }}>
        <ApolloProvider client={apolloClient}>
          <ThemeProvider theme={theme}>
            <AuthProvider>
              <Layout>
                <Component {...pageProps} />
              </Layout>
            </AuthProvider>
          </ThemeProvider>
        </ApolloProvider>
      </main>
    </>
  );
}

export default App;
