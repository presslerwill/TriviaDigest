import Script from 'next/script';
import React from 'react'

type AdSenseTypes = {
    pId: string;
}

const AdSense = ({ pId }: AdSenseTypes) => {
  return (
    <Script
        async
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-${pId}`}
        crossOrigin='anonymous'
        strategy='afterInteractive'
    />
  )
}

export default AdSense