import { AppProps } from 'next/app';
import Head from 'next/head';
import Layout from '@components/Layout';
import apolloClient from '@lib/apollo';
import { ApolloProvider } from '@apollo/client';
import StoreProvider from '@lib/store';

require('@styles/main.less');

function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Vulcan</title>
      </Head>
      <ApolloProvider client={apolloClient}>
        <StoreProvider>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </StoreProvider>
      </ApolloProvider>
    </>
  );
}

export default App;
