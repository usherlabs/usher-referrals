"use strict";(self.webpackChunkdocs_template=self.webpackChunkdocs_template||[]).push([[201],{9613:(e,t,n)=>{n.d(t,{Zo:()=>d,kt:()=>m});var r=n(9496);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function l(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function o(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?l(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):l(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function i(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},l=Object.keys(e);for(r=0;r<l.length;r++)n=l[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var l=Object.getOwnPropertySymbols(e);for(r=0;r<l.length;r++)n=l[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var s=r.createContext({}),u=function(e){var t=r.useContext(s),n=t;return e&&(n="function"==typeof e?e(t):o(o({},t),e)),n},d=function(e){var t=u(e.components);return r.createElement(s.Provider,{value:t},e.children)},c="mdxType",p={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},h=r.forwardRef((function(e,t){var n=e.components,a=e.mdxType,l=e.originalType,s=e.parentName,d=i(e,["components","mdxType","originalType","parentName"]),c=u(n),h=a,m=c["".concat(s,".").concat(h)]||c[h]||p[h]||l;return n?r.createElement(m,o(o({ref:t},d),{},{components:n})):r.createElement(m,o({ref:t},d))}));function m(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var l=n.length,o=new Array(l);o[0]=h;var i={};for(var s in t)hasOwnProperty.call(t,s)&&(i[s]=t[s]);i.originalType=e,i[c]="string"==typeof e?e:a,o[1]=i;for(var u=2;u<l;u++)o[u]=n[u];return r.createElement.apply(null,o)}return r.createElement.apply(null,n)}h.displayName="MDXCreateElement"},1063:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>s,contentTitle:()=>o,default:()=>p,frontMatter:()=>l,metadata:()=>i,toc:()=>u});var r=n(2564),a=(n(9496),n(9613));const l={sidebar_position:4},o="UsherJS API & Properties",i={unversionedId:"ecosystem/usherjs/api-and-properties",id:"ecosystem/usherjs/api-and-properties",title:"UsherJS API & Properties",description:"Instantiating the UsherJS library provides a JavaScript object that responds to a few methods. These allow you to manage",source:"@site/docs/ecosystem/usherjs/api-and-properties.md",sourceDirName:"ecosystem/usherjs",slug:"/ecosystem/usherjs/api-and-properties",permalink:"/usher-referrals/ecosystem/usherjs/api-and-properties",draft:!1,editUrl:"https://github.com/usherlabs/usher-docs/tree/main/docs/ecosystem/usherjs/api-and-properties.md",tags:[],version:"current",sidebarPosition:4,frontMatter:{sidebar_position:4},sidebar:"ecosystem",previous:{title:"Instantiating Usher.js",permalink:"/usher-referrals/ecosystem/usherjs/instantiating"},next:{title:"Testing your Integration",permalink:"/usher-referrals/ecosystem/usherjs/testing-integration"}},s={},u=[{value:"<code>usher.convert(conversion)</code>",id:"usherconvertconversion",level:3},{value:"<code>usher.parse(url?, keepQueryParams?)</code>",id:"usherparseurl-keepqueryparams",level:3},{value:"<code>usher.token(campaignReference)</code>",id:"ushertokencampaignreference",level:3},{value:"<code>usher.anchor(anchorSelector, campaignReference)</code>",id:"usheranchoranchorselector-campaignreference",level:3},{value:"<code>usher.config(config?)</code>",id:"usherconfigconfig",level:3},{value:"<code>usher.flush()</code>",id:"usherflush",level:3}],d={toc:u},c="wrapper";function p(e){let{components:t,...n}=e;return(0,a.kt)(c,(0,r.Z)({},d,n,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("h1",{id:"usherjs-api--properties"},"UsherJS API & Properties"),(0,a.kt)("p",null,"Instantiating the UsherJS library provides a JavaScript object that responds to a few methods. These allow you to manage\nreferral tokens and execute on conversions."),(0,a.kt)("admonition",{type:"tip"},(0,a.kt)("p",{parentName:"admonition"},"To get more details on object and method types, you can refer to the ",(0,a.kt)("a",{parentName:"p",href:"https://ts-docs.js.usher.so/"},(0,a.kt)("strong",{parentName:"a"},"documentation we have generated"))," for our API and properties.")),(0,a.kt)("h3",{id:"usherconvertconversion"},(0,a.kt)("inlineCode",{parentName:"h3"},"usher.convert(conversion)")),(0,a.kt)("p",null,"To submit a conversion, you must provide parameters that identify the Campaign you are creating a conversion for, as\nwell as provide additional data that affects the way conversions are processed."),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-javascript"},'Usher("convert", {\n    id: "ida4Pebl2uULdI_rN8waEw65mVH9uIFTY1JyeZt1PBM",\n    chain: "arweave",\n    eventId: 0,\n    commit: 10,\n    nativeId: "ksFTLgrwQGtNrhRz6MWyd3a4lvK1Oh-QF1HYcEeeFVk",\n    metadata: {\n        amount: 1000,\n        convertType: "defi",\n        action: "stake"\n    }\n});\n')),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},"Method parameters")),(0,a.kt)("table",null,(0,a.kt)("thead",null,(0,a.kt)("tr",null,(0,a.kt)("th",null,"Object Property Name/Key"),(0,a.kt)("th",null,"Type"),(0,a.kt)("th",null,"Description"),(0,a.kt)("th",{"data-type":"checkbox","data-hidden":!0},"Required"))),(0,a.kt)("tbody",null,(0,a.kt)("tr",null,(0,a.kt)("td",null,(0,a.kt)("strong",null,"id")),(0,a.kt)("td",null,"string"),(0,a.kt)("td",null,"The Identifer of the Campaign acquired during Campaign creation"),(0,a.kt)("td",null,"true")),(0,a.kt)("tr",null,(0,a.kt)("td",null,(0,a.kt)("strong",null,"chain")),(0,a.kt)("td",null,"string"),(0,a.kt)("td",null,"The blockchain identifer acquired during Campaign creation"),(0,a.kt)("td",null,"true")),(0,a.kt)("tr",null,(0,a.kt)("td",null,(0,a.kt)("strong",null,"eventId")),(0,a.kt)("td",null,"integer"),(0,a.kt)("td",null,"The identifier of the Campaign Event defined during Campaign creation. ",(0,a.kt)("br",null),"This is usually ",(0,a.kt)("strong",null,(0,a.kt)("code",null,"0"))," for single event Campaigns. ",(0,a.kt)("br",null),"Where different rewards can be distributed at different points throughout the Referred User journey, this can ",(0,a.kt)("strong",null,(0,a.kt)("code",null,"0"))," to ",(0,a.kt)("strong",null,(0,a.kt)("code",null,"X")),"."),(0,a.kt)("td",null,"true")),(0,a.kt)("tr",null,(0,a.kt)("td",null,(0,a.kt)("strong",null,"nativeId")),(0,a.kt)("td",null,"string"),(0,a.kt)("td",null,"An identifier of the User native to the Web3 Brand's Web App. ",(0,a.kt)("br",null),"This can be a Web3 Wallet Address used to authorise into the Web3 Brand's Web App.",(0,a.kt)("br",null),(0,a.kt)("br",null),"By default, assigning submitting a Native ID is a way to ensure that the Referred User can only ever be converted once.",(0,a.kt)("br",null),"Combining this with a Campaign Event ",(0,a.kt)("strong",null,"Native Limit")," can deliver an experience where a Referred User can continue to convert until their conversions have ",(0,a.kt)("strong",null,"committed")," enough to have reached the ",(0,a.kt)("strong",null,"Native Limit"),"."),(0,a.kt)("td",null,"false")),(0,a.kt)("tr",null,(0,a.kt)("td",null,(0,a.kt)("strong",null,"commit")),(0,a.kt)("td",null,"integer"),(0,a.kt)("td",null,"An arbitrary value that indicates how much of the Event this Conversion consumes for the Referred (Native) User and/or whether to Event Reward Rate should be calculated.",(0,a.kt)("br",null),"This parameter is only necessary where the Event has a corresponding ",(0,a.kt)("strong",null,"Native Limit")," or where rewards are issued ",(0,a.kt)("strong",null,"Per Commit.")),(0,a.kt)("td",null,"false")),(0,a.kt)("tr",null,(0,a.kt)("td",null,(0,a.kt)("strong",null,"metadata")),(0,a.kt)("td",null,"object"),(0,a.kt)("td",null,"An arbitrary record of key/values that the Brand can use."),(0,a.kt)("td",null,"false")),(0,a.kt)("tr",null,(0,a.kt)("td",null,(0,a.kt)("strong",null,"metadata.amount")),(0,a.kt)("td",null,"integer"),(0,a.kt)("td",null,"The only ",(0,a.kt)("strong",null,"special")," key in the ",(0,a.kt)("code",null,"metadata")," ",(0,a.kt)("strong",null)," property is the ",(0,a.kt)("code",null,"amount")," key.",(0,a.kt)("br",null),"This is the amount of value to be used when calculating a ",(0,a.kt)("strong",null,"percentage-"),"based reward.",(0,a.kt)("br",null),"ie. For DeFi or Commerce applications that reward commissions as percentage-based calculations."),(0,a.kt)("td",null,"false")))),(0,a.kt)("h3",{id:"usherparseurl-keepqueryparams"},(0,a.kt)("inlineCode",{parentName:"h3"},"usher.parse(url?, keepQueryParams?)")),(0,a.kt)("p",null,"This method is used to parse the current URL query parameters to extract and save the Usher Referral Token. The Query\nParameter ",(0,a.kt)("inlineCode",{parentName:"p"},"_ushrt")," is appended to the Campaign Destination URL automatically when an Usher Invite Link is visited."," "),(0,a.kt)("admonition",{type:"info"},(0,a.kt)("p",{parentName:"admonition"},"This method is immediately called when UsherJS is loaded on a Browser-based Web App.")),(0,a.kt)("p",null,"If a URL is provided, it will be parsed instead of the current web page URL."," "),(0,a.kt)("p",null,"By default, the current web page URL has the ",(0,a.kt)("inlineCode",{parentName:"p"},"_ushrt")," query parameter cleared after it is saved."),(0,a.kt)("h3",{id:"ushertokencampaignreference"},(0,a.kt)("inlineCode",{parentName:"h3"},"usher.token(campaignReference)")),(0,a.kt)("p",null,"A method to fetch the currently saved Referral Token that will be used in the next executed\nconversion - ",(0,a.kt)("inlineCode",{parentName:"p"},"convert(conversion)")),(0,a.kt)("p",null,"This can be useful if your conversion tracking process involves more long-formed and controlled referral token storage."),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},"Method parameters")),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:null},"Object Property Name/Key"),(0,a.kt)("th",{parentName:"tr",align:null},"Type"),(0,a.kt)("th",{parentName:"tr",align:null},"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:null},"campaignReference"),(0,a.kt)("td",{parentName:"tr",align:null},(0,a.kt)("inlineCode",{parentName:"td"},"{ id: string, chain: string }")),(0,a.kt)("td",{parentName:"tr",align:null},"A reference to the Campaign")))),(0,a.kt)("h3",{id:"usheranchoranchorselector-campaignreference"},(0,a.kt)("inlineCode",{parentName:"h3"},"usher.anchor(anchorSelector, campaignReference)")),(0,a.kt)("p",null,"Modify the ",(0,a.kt)("inlineCode",{parentName:"p"},"href")," attribute on an ",(0,a.kt)("inlineCode",{parentName:"p"},"<a>")," Anchor HTML Element to include the currently saved Referral Token."," "),(0,a.kt)("p",null,"This can be used to pass the ",(0,a.kt)("inlineCode",{parentName:"p"},"_ushrt")," Referral Token between websites/origins/domains."),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},"Method parameters")),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:null},"Object Property Name/Key"),(0,a.kt)("th",{parentName:"tr",align:null},"Type"),(0,a.kt)("th",{parentName:"tr",align:null},"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:null},"anchorSelector"),(0,a.kt)("td",{parentName:"tr",align:null},"string"),(0,a.kt)("td",{parentName:"tr",align:null},"CSS Selector that points to the Anchor Element to be modified")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:null},"campaignReference"),(0,a.kt)("td",{parentName:"tr",align:null},(0,a.kt)("inlineCode",{parentName:"td"},"{ id: string, chain: string }")),(0,a.kt)("td",{parentName:"tr",align:null},"A reference to the Campaign")))),(0,a.kt)("h3",{id:"usherconfigconfig"},(0,a.kt)("inlineCode",{parentName:"h3"},"usher.config(config?)")),(0,a.kt)("p",null,"A method to update the configuration of the UsherJS object."),(0,a.kt)("h3",{id:"usherflush"},(0,a.kt)("inlineCode",{parentName:"h3"},"usher.flush()")),(0,a.kt)("p",null,"A method to flush/remove all cached referral tokens stored in Browser Storage."))}p.isMDXComponent=!0}}]);