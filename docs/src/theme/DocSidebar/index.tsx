import React from 'react';
import DocSidebar from '@theme-original/DocSidebar';
import type DocSidebarType from '@theme/DocSidebar';
import type {WrapperProps} from '@docusaurus/types';
import Logo from '@theme/Logo';

type Props = WrapperProps<typeof DocSidebarType>;

export default function DocSidebarWrapper(props: Props): JSX.Element {
  return (
    <>
        <Logo />
        <DocSidebar {...props} />
    </>
  );
}
