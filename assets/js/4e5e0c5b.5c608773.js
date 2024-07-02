"use strict";(self.webpackChunkdocs_template=self.webpackChunkdocs_template||[]).push([[358],{9613:(e,t,r)=>{r.d(t,{Zo:()=>d,kt:()=>g});var n=r(9496);function a(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function i(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function o(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?i(Object(r),!0).forEach((function(t){a(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):i(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function s(e,t){if(null==e)return{};var r,n,a=function(e,t){if(null==e)return{};var r,n,a={},i=Object.keys(e);for(n=0;n<i.length;n++)r=i[n],t.indexOf(r)>=0||(a[r]=e[r]);return a}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(n=0;n<i.length;n++)r=i[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(a[r]=e[r])}return a}var l=n.createContext({}),p=function(e){var t=n.useContext(l),r=t;return e&&(r="function"==typeof e?e(t):o(o({},t),e)),r},d=function(e){var t=p(e.components);return n.createElement(l.Provider,{value:t},e.children)},u="mdxType",c={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},m=n.forwardRef((function(e,t){var r=e.components,a=e.mdxType,i=e.originalType,l=e.parentName,d=s(e,["components","mdxType","originalType","parentName"]),u=p(r),m=a,g=u["".concat(l,".").concat(m)]||u[m]||c[m]||i;return r?n.createElement(g,o(o({ref:t},d),{},{components:r})):n.createElement(g,o({ref:t},d))}));function g(e,t){var r=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var i=r.length,o=new Array(i);o[0]=m;var s={};for(var l in t)hasOwnProperty.call(t,l)&&(s[l]=t[l]);s.originalType=e,s[u]="string"==typeof e?e:a,o[1]=s;for(var p=2;p<i;p++)o[p]=r[p];return n.createElement.apply(null,o)}return n.createElement.apply(null,r)}m.displayName="MDXCreateElement"},9017:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>l,contentTitle:()=>o,default:()=>c,frontMatter:()=>i,metadata:()=>s,toc:()=>p});var n=r(2564),a=(r(9496),r(9613));const i={sidebar_position:4,description:"Learn the significance of terminology commonly used in the Usher documentation."},o="Glossary",s={unversionedId:"guide/key-concepts/glossary",id:"guide/key-concepts/glossary",title:"Glossary",description:"Learn the significance of terminology commonly used in the Usher documentation.",source:"@site/docs/guide/key-concepts/glossary.md",sourceDirName:"guide/key-concepts",slug:"/guide/key-concepts/glossary",permalink:"/usher-referrals/guide/key-concepts/glossary",draft:!1,editUrl:"https://github.com/usherlabs/usher-docs/tree/main/docs/guide/key-concepts/glossary.md",tags:[],version:"current",sidebarPosition:4,frontMatter:{sidebar_position:4,description:"Learn the significance of terminology commonly used in the Usher documentation."},sidebar:"guide",previous:{title:"Security Measures",permalink:"/usher-referrals/guide/key-concepts/security-measures"},next:{title:"Supporting Partners",permalink:"/usher-referrals/guide/getting-started/supporting-partners"}},l={},p=[],d={toc:p},u="wrapper";function c(e){let{components:t,...r}=e;return(0,a.kt)(u,(0,n.Z)({},d,r,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("h1",{id:"glossary"},"Glossary"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:null},"Term"),(0,a.kt)("th",{parentName:"tr",align:null},"Explanation"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:null},(0,a.kt)("strong",{parentName:"td"},"Brand")),(0,a.kt)("td",{parentName:"tr",align:null},"A business, organisation, Company, DAO or Web3 project. Also known as ",(0,a.kt)("strong",{parentName:"td"},"Advertiser"))),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:null},(0,a.kt)("strong",{parentName:"td"},"Campaign")),(0,a.kt)("td",{parentName:"tr",align:null},"A partnership program created by a Brand for Partners to engage with. Also referred to as a ",(0,a.kt)("strong",{parentName:"td"},"Program"))),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:null},(0,a.kt)("strong",{parentName:"td"},"Campaign Terms")),(0,a.kt)("td",{parentName:"tr",align:null},"A dataset immutably stored in the Usher Smart Contract that makes up the Campaign's Terms & Conditions for Partners")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:null},(0,a.kt)("strong",{parentName:"td"},"Conversion")),(0,a.kt)("td",{parentName:"tr",align:null},(0,a.kt)("p",null,"A Conversion represents a data event that is captured during the Referred User journey and submitted to Usher. This event is captured where ever the Brand has decided to integrate the Satellite JS library.",(0,a.kt)("br",null),(0,a.kt)("br",null),"A conversion is considered ",(0,a.kt)("strong",null,"Pending")," once it has been captured and is pending validation.",(0,a.kt)("br",null),"A conversion is considered ",(0,a.kt)("strong",null,"Successful")," once said conversion has been successfully validated."))),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:null},(0,a.kt)("strong",{parentName:"td"},"Destination URL")),(0,a.kt)("td",{parentName:"tr",align:null},"A mutable URL configured within the Campaign where relevant Usher Invite Links will be redirected to")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:null},(0,a.kt)("strong",{parentName:"td"},"Invite Link")),(0,a.kt)("td",{parentName:"tr",align:null},"A URL Link is automatically assigned to each Partner relative to the Campaign that the Partner has engaged with. This Link is used to refer users to the Brand's Campaign Destination URL")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:null},(0,a.kt)("strong",{parentName:"td"},"Partner")),(0,a.kt)("td",{parentName:"tr",align:null},"A person that engages a Campaign with the intent of supporting the Brand's growth as per the Campaign's Terms")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:null},(0,a.kt)("strong",{parentName:"td"},"Partnership")),(0,a.kt)("td",{parentName:"tr",align:null},"A partnership is an entity that represents the engagement between a Partner and a Campaign")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:null},(0,a.kt)("strong",{parentName:"td"},"Referred User")),(0,a.kt)("td",{parentName:"tr",align:null},"A Referred User represents the end-user who has been referred to the Brand's Web Application or Campaign Destination URL by a Partner.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:null},(0,a.kt)("strong",{parentName:"td"},"Reward")),(0,a.kt)("td",{parentName:"tr",align:null},"Rewards represent token(s) that are allocated to the Partner")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:null},(0,a.kt)("strong",{parentName:"td"},"Reward Claim")),(0,a.kt)("td",{parentName:"tr",align:null},"A Reward Claim is an action taken by the Partner to withdraw the Rewards that have been allocated to them within a given Campaign")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:null},(0,a.kt)("strong",{parentName:"td"},"Valued Tokens")),(0,a.kt)("td",{parentName:"tr",align:null},"Tokens that have publicly priced financial value. ie. ETH, USDC, AR, etc.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:null},(0,a.kt)("strong",{parentName:"td"},"Non-valued Tokens")),(0,a.kt)("td",{parentName:"tr",align:null},"Tokens that do not have a publicly priced financial value. ie. Custom NFTs, PSTs, unlisted ERC20, etc.")))))}c.isMDXComponent=!0}}]);