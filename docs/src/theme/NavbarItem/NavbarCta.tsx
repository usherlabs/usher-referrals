import useBaseUrl from '@docusaurus/useBaseUrl';
import clsx from 'clsx';
import React from 'react';

export default function NavbarCta({ label, href, mobile, ...props }) {
    return (
    <a {...props} mobile={mobile?.toString()} href={useBaseUrl(href)} className={clsx(props.className, 'cta')}>
      {label}
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="12" height="12">
        <title>Arrow Forward</title>
        <path
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="48"
          d="M268 112l144 144-144 144M392 256H100"
        />
      </svg>
    </a>
  );
}
