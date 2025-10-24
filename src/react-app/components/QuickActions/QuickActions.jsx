import React, { useState } from 'react';

export const QuickActions = () => {
    const [showMore, setShowMore] = useState(false);

    const mainActions = [
        { id: 'create-image', label: 'Create image', icon: 'image' },
        { id: 'get-advice', label: 'Get advice', icon: 'advice' },
        { id: 'summarize', label: 'Summarize text', icon: 'summarize' },
        { id: 'suprise', label: 'Surprise me', icon: 'surprise' },
    ];

    const extraActions = [
        { id: 'code', label: 'Code', icon: 'code' },
        { id: 'analyze-images', label: 'Analyze images', icon: 'analyze' },
        { id: 'help-me-write', label: 'Help me write', icon: 'write' },
    ];

    return (
        <section id='suggestions' className="mx-auto">
            <div className="justify-center mt-[var(--screen-optical-compact-offset-amount)] flex h-full flex-shrink flex-col items-center overflow-hidden text-token-text-primary">
                <div className="relative inline-flex justify-center text-center text-2xl font-semibold leading-9 dark:text-white transition-colors duration-1000">
                    <h1>What can I help you with? </h1>
                </div>

                <div className="h-fit">
                    <div className="mt-5 flex items-center justify-center gap-x-2 transition-opacity duration-700 xl:gap-x-2.5 opacity-100 flex-wrap">
                        <ul id="SQ-UL" className="relative flex items-stretch gap-x-2 gap-y-4 overflow-hidden py-2 sm:gap-y-2 xl:gap-x-2.5 xl:gap-y-2.5 flex-wrap justify-center">
                            {mainActions.map(action => (
                                <QuickActionButton key={action.id} action={action} />
                            ))}

                            <div className="inline-block">
                                <button
                                    onClick={() => setShowMore(!showMore)}
                                    className="relative flex h-[42px] items-center gap-1.5 rounded-full border border-token-border-light px-3 py-2 text-start text-[13px] shadow-md transition enabled:hover:bg-token-main-surface-secondary disabled:cursor-not-allowed xl:gap-2 xl:text-[14px]"
                                >
                                    <span className="max-w-full select-none whitespace-nowrap text-gray-600 transition group-hover:text-token-text-primary dark:text-gray-500">
                                        More
                                    </span>
                                </button>
                            </div>

                            {showMore && extraActions.map(action => (
                                <QuickActionButton key={action.id} action={action} />
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
};

const QuickActionButton = ({ action }) => {
    const getIcon = (iconType) => {
        // Return appropriate SVG based on iconType
        switch(iconType) {
            case 'image':
                return <ImageIcon />;
            case 'advice':
                return <AdviceIcon />;
            case 'summarize':
                return <SummarizeIcon />;
            case 'suprise':
                return <SupriseIcon />;
            case 'code':
                return <CodeIcon />;
            case 'analyze':
                return <AnalyzeImagesIcon />;
            case 'write':
                return <HelpWriteIcon />;
            default:
                return null;
        }
    };

    return (
        <li className="SG">
            <button className="relative flex h-[42px] items-center gap-1.5 rounded-full border border-token-border-light px-3 py-2 text-start text-[13px] shadow-md transition enabled:hover:bg-token-main-surface-secondary disabled:cursor-not-allowed xl:gap-2 xl:text-[14px]">
                {getIcon(action.icon)}
                <span className="max-w-full select-none whitespace-nowrap text-gray-600 transition group-hover:text-token-text-primary dark:text-gray-500">
                    {action.label}
                </span>
            </button>
        </li>
    );
};

const ImageIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="icon-md" style={{ color: 'rgb(53, 174, 71)' }}><path d="M4.5 17.5L7.56881 14.3817C8.32655 13.6117 9.55878 13.5826 10.352 14.316L16.5 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path><path d="M19 12H18.3798C17.504 12 16.672 11.6173 16.102 10.9524L11.898 6.04763C11.328 5.38269 10.496 5 9.6202 5H6C4.89543 5 4 5.89543 4 7V18C4 19.1046 4.89543 20 6 20H18C19.1046 20 20 19.1046 20 18V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path><path d="M19 5H18.3798C17.504 5 16.672 5.38269 16.102 6.04763L14 8.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path><circle cx="8.5" cy="9.5" r="1.5" fill="currentColor"></circle><path d="M18 14V10C18 9.58798 18.4704 9.35279 18.8 9.6L21.4667 11.6C21.7333 11.8 21.7333 12.2 21.4667 12.4L18.8 14.4C18.4704 14.6472 18 14.412 18 14Z" fill="currentColor"></path><path d="M18 7V3C18 2.58798 18.4704 2.35279 18.8 2.6L21.4667 4.6C21.7333 4.8 21.7333 5.2 21.4667 5.4L18.8 7.4C18.4704 7.64721 18 7.41202 18 7Z" fill="currentColor"></path></svg>

);
const AdviceIcon = () => (
    <svg width="26" height="24" viewBox="0 0 26 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="icon-md" style={{ color: 'rgb(118, 208, 235)'}}><path fillRule="evenodd" clipRule="evenodd" d="M13.4544 4.10451C13.1689 3.95886 12.8309 3.95886 12.5455 4.10451L2.98609 8.98175L2.07715 7.20022L11.6365 2.32298C12.493 1.88603 13.5069 1.88603 14.3634 2.32298L23.9227 7.20022C24.7332 7.61373 25.091 8.44008 24.9999 9.2194V15C24.9999 15.5523 24.5522 16 23.9999 16C23.4477 16 22.9999 15.5523 22.9999 15V11.2156L20.9666 12.2115V16.3052C20.9666 17.409 20.3605 18.4237 19.3885 18.9468L14.4219 21.6203C13.5341 22.0981 12.4657 22.0981 11.578 21.6203L6.61135 18.9468C5.63941 18.4237 5.03328 17.409 5.03328 16.3052V12.2115L2.10635 10.7779C0.626202 10.0529 0.609039 7.94926 2.07715 7.20022L2.98608 8.98175L12.5601 13.671C12.8376 13.807 13.1623 13.807 13.4398 13.671L23 8.9885C23.0001 8.98394 23.0001 8.97938 23.0003 8.97483L13.4544 4.10451ZM7.03328 13.1911V16.3052C7.03328 16.6732 7.23532 17.0114 7.5593 17.1858L12.526 19.8592C12.8219 20.0185 13.178 20.0185 13.4739 19.8592L18.4406 17.1858C18.7646 17.0114 18.9666 16.6732 18.9666 16.3052V13.1911L14.3195 15.4672C13.4871 15.8749 12.5128 15.8749 11.6803 15.4672L7.03328 13.1911Z" fill="currentColor"></path></svg>
);
const SummarizeIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="icon-md" style={{ color: 'rgb(234, 132, 68)' }}><path fillRule="evenodd" clipRule="evenodd" d="M4 5C4 3.34315 5.34315 2 7 2H14.1716C14.9672 2 15.7303 2.31607 16.2929 2.87868L19.1213 5.70711C19.6839 6.26972 20 7.03278 20 7.82843V19C20 20.6569 18.6569 22 17 22H7C5.34315 22 4 20.6569 4 19V5ZM7 4C6.44772 4 6 4.44772 6 5V19C6 19.5523 6.44772 20 7 20H17C17.5523 20 18 19.5523 18 19V7.82843C18 7.56321 17.8946 7.30886 17.7071 7.12132L14.8787 4.29289C14.6911 4.10536 14.4368 4 14.1716 4H7ZM8 10C8 9.44772 8.44772 9 9 9H15C15.5523 9 16 9.44772 16 10C16 10.5523 15.5523 11 15 11H9C8.44772 11 8 10.5523 8 10ZM8 14C8 13.4477 8.44772 13 9 13H13C13.5523 13 14 13.4477 14 14C14 14.5523 13.5523 15 13 15H9C8.44772 15 8 14.5523 8 14Z" fill="currentColor"></path></svg>
);
const SupriseIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="icon-md" style={{ color: 'rgb(118, 208, 235)' }}><path fillRule="evenodd" clipRule="evenodd" d="M13.9969 3.39017C14.5497 2.17402 15.961 1.60735 17.2013 2.10349L19.4044 2.98475C20.7337 3.51645 21.3458 5.05369 20.7459 6.35358L19.0629 10H20C20.5523 10 21 10.4477 21 11V19C21 20.6569 19.6569 22 18 22H6C4.34315 22 3 20.6569 3 19V11C3 10.4504 3.44331 10.0044 3.99183 10L3.84325 9.89871C3.83307 9.89177 3.82303 9.88465 3.81311 9.87733C2.55917 8.9526 2.79737 7.01262 4.23778 6.41871L6.35774 5.5446L7.08184 3.36883C7.57382 1.8905 9.49246 1.51755 10.5024 2.70393L11.9888 4.45002L13.5103 4.46084L13.9969 3.39017ZM15.5096 4.89554C16.2552 5.48975 16.5372 6.59381 15.9713 7.51403L14.8266 9.37513C14.8265 9.38763 14.8266 9.40262 14.8273 9.42012C14.8294 9.47125 14.8357 9.52793 14.8451 9.58262C14.8548 9.63855 14.8654 9.67875 14.8714 9.69773C14.9032 9.79819 14.9184 9.89994 14.9184 10H16.8602L18.93 5.51547C19.0499 5.25549 18.9275 4.94804 18.6617 4.8417L16.4585 3.96044C16.2105 3.86122 15.9282 3.97455 15.8176 4.21778L15.5096 4.89554ZM12.8885 10C12.8572 9.84122 12.8358 9.66998 12.8289 9.50115C12.8194 9.26483 12.8254 8.81125 13.0664 8.41953L14.2677 6.46628L11.9746 6.44997C11.3934 6.44584 10.8427 6.18905 10.4659 5.74646L8.97951 4.00037L8.25541 6.17614C8.07187 6.72765 7.65748 7.17203 7.12012 7.39359L5.00091 8.26739L7.06338 9.67378C7.19188 9.7614 7.29353 9.87369 7.3663 10H12.8885ZM5 12V19C5 19.5523 5.44772 20 6 20H18C18.5523 20 19 19.5523 19 19V12H5ZM9.5 14.5C9.5 13.9477 9.94771 13.5 10.5 13.5H13.5C14.0523 13.5 14.5 13.9477 14.5 14.5C14.5 15.0523 14.0523 15.5 13.5 15.5H10.5C9.94771 15.5 9.5 15.0523 9.5 14.5Z" fill="currentColor"></path></svg>
);
const CodeIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="icon-md" style={{ color: 'rgb(108, 113, 255)' }}><path fillRule="evenodd" clipRule="evenodd" d="M3 6C3 4.34315 4.34315 3 6 3H18C19.6569 3 21 4.34315 21 6V18C21 19.6569 19.6569 21 18 21H6C4.34315 21 3 19.6569 3 18V6ZM6 5C5.44772 5 5 5.44772 5 6V18C5 18.5523 5.44772 19 6 19H18C18.5523 19 19 18.5523 19 18V6C19 5.44772 18.5523 5 18 5H6ZM7.29289 9.29289C7.68342 8.90237 8.31658 8.90237 8.70711 9.29289L10.7071 11.2929C11.0976 11.6834 11.0976 12.3166 10.7071 12.7071L8.70711 14.7071C8.31658 15.0976 7.68342 15.0976 7.29289 14.7071C6.90237 14.3166 6.90237 13.6834 7.29289 13.2929L8.58579 12L7.29289 10.7071C6.90237 10.3166 6.90237 9.68342 7.29289 9.29289ZM12 14C12 13.4477 12.4477 13 13 13H16C16.5523 13 17 13.4477 17 14C17 14.5523 16.5523 15 16 15H13C12.4477 15 12 14.5523 12 14Z" fill="currentColor"></path></svg>
);

const AnalyzeImagesIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="icon-md" style={{ color: 'rgb(108, 113, 255)' }}><path fillRule="evenodd" clipRule="evenodd" d="M5.91444 7.59106C4.3419 9.04124 3.28865 10.7415 2.77052 11.6971C2.66585 11.8902 2.66585 12.1098 2.77052 12.3029C3.28865 13.2585 4.3419 14.9588 5.91444 16.4089C7.48195 17.8545 9.50572 19 12 19C14.4943 19 16.518 17.8545 18.0855 16.4089C19.6581 14.9588 20.7113 13.2585 21.2295 12.3029C21.3341 12.1098 21.3341 11.8902 21.2295 11.6971C20.7113 10.7415 19.6581 9.04124 18.0855 7.59105C16.518 6.1455 14.4943 5 12 5C9.50572 5 7.48195 6.1455 5.91444 7.59106ZM4.55857 6.1208C6.36059 4.45899 8.84581 3 12 3C15.1542 3 17.6394 4.45899 19.4414 6.1208C21.2384 7.77798 22.4152 9.68799 22.9877 10.7438C23.4147 11.5315 23.4147 12.4685 22.9877 13.2562C22.4152 14.312 21.2384 16.222 19.4414 17.8792C17.6394 19.541 15.1542 21 12 21C8.84581 21 6.36059 19.541 4.55857 17.8792C2.76159 16.222 1.58478 14.312 1.01232 13.2562C0.58525 12.4685 0.585249 11.5315 1.01232 10.7438C1.58478 9.688 2.76159 7.77798 4.55857 6.1208ZM12 9.5C10.6193 9.5 9.49999 10.6193 9.49999 12C9.49999 13.3807 10.6193 14.5 12 14.5C13.3807 14.5 14.5 13.3807 14.5 12C14.5 10.6193 13.3807 9.5 12 9.5ZM7.49999 12C7.49999 9.51472 9.51471 7.5 12 7.5C14.4853 7.5 16.5 9.51472 16.5 12C16.5 14.4853 14.4853 16.5 12 16.5C9.51471 16.5 7.49999 14.4853 7.49999 12Z" fill="currentColor"></path></svg>
);

const HelpWriteIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="icon-md" style={{ color: 'rgb(203, 139, 208)' }}><path d="M3 6H10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"></path><path d="M3 10H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"></path><path d="M13.4282 17.5718L20.5 10.5C21.6046 9.39543 21.6046 7.60457 20.5 6.5C19.3954 5.39543 17.6046 5.39543 16.5 6.5L9.42819 13.5718C9.14899 13.851 8.95868 14.2066 8.88124 14.5938L8 19L12.4062 18.1188C12.7934 18.0413 13.149 17.851 13.4282 17.5718Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path></svg>
);
