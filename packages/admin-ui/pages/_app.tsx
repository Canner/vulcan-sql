import { AppProps } from 'next/app';
import Head from 'next/head';
require('../styles/index.less');

function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Admin ui</title>
      </Head>
      <main className="app">
        <Component {...pageProps} />
      </main>
    </>
  );
}

export default App;
