import ErrorBoundary from '../ErrorBoundary/ErrorBoundary';

export const LoadingAnimation = ({ }) => {
    const loaderUUID = `loader_${Math.random().toString(30).substring(3, 9)}`;

    return (
        <ErrorBoundary>
            <div id={loaderUUID} className='fixed bottom-[10vh] left-16 z-[71]'>
                <div id="loader-parent">
                    <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" className="transform scale-75">
                        <circle cx="12" cy="24" r="4" className="fill-green-500">
                            <animate attributeName="cy" values="24;10;24;38;24" keyTimes="0;0.2;0.5;0.8;1" dur="1s" repeatCount="indefinite" />
                            <animate attributeName="fill-opacity" values="1;.2;1" keyTimes="0;0.5;1" dur="1s" repeatCount="indefinite" />
                        </circle>
                        <circle cx="24" cy="24" r="4" className="fill-blue-500">
                            <animate attributeName="cy" values="24;10;24;38;24" keyTimes="0;0.2;0.5;0.8;1" dur="1s" repeatCount="indefinite" begin="-0.4s" />
                            <animate attributeName="fill-opacity" values="1;.2;1" keyTimes="0;0.5;1" dur="1s" repeatCount="indefinite" begin="-0.4s" />
                        </circle>
                        <circle cx="36" cy="24" r="4" className="fill-yellow-500">
                            <animate attributeName="cy" values="24;10;24;38;24" keyTimes="0;0.2;0.5;0.8;1" dur="1s" repeatCount="indefinite" begin="-0.8s" />
                            <animate attributeName="fill-opacity" values="1;.2;1" keyTimes="0;0.5;1" dur="1s" repeatCount="indefinite" begin="-0.8s" />
                        </circle>
                    </svg>
                </div>
            </div>
        </ErrorBoundary>
    )
}
